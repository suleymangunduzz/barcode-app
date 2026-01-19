import { ipcMain } from "electron";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

export function registerUserHandlers(prisma: PrismaClient) {
  // Existing handler
  ipcMain.handle(
    "user:getByRole",
    async (_event, { role }: { role: "admin" | "staff" }) => {
      const users = await prisma.user.findMany({
        select: { id: true, email: true, role: true, createdAt: true },
        where: { role },
      });
      return { success: true, users };
    },
  );

  // Get user count
  ipcMain.handle("user:getUserCount", async () => {
    const count = await prisma.user.count();
    return { count };
  });

  // Check if first admin is needed
  ipcMain.handle("user:isFirstAdminNeeded", async () => {
    const count = await prisma.user.count();
    return { needed: count === 0 };
  });

  // Create first admin
  ipcMain.handle(
    "user:signupFirstAdmin",
    async (_event, { name, email, password }) => {
      const count = await prisma.user.count();
      if (count > 0) {
        return { success: false, error: "ADMIN_ALREADY_EXISTS" };
      }

      if (!name || !email || !password) {
        return { success: false, error: "MISSING_FIELDS" };
      }

      const passwordHash = await bcrypt.hash(password, 10);

      // Wrap in transaction
      const admin = await prisma.$transaction(async (tx) => {
        const newAdmin = await tx.user.create({
          data: { name, email, passwordHash, role: "admin" },
        });

        // SyncQueue entry
        await tx.syncQueue.create({
          data: {
            tableName: "User",
            action: "create",
            recordId: newAdmin.id,
            payload: JSON.stringify(newAdmin),
          },
        });

        return newAdmin;
      });

      return { success: true, user: admin };
    },
  );

  // Create a staff user
  ipcMain.handle(
    "user:signupStaff",
    async (
      _event,
      {
        name,
        email,
        password,
      }: { name: string; email: string; password: string },
    ) => {
      if (!name?.trim() || !email?.trim() || !password) {
        return { success: false, error: "INVALID_INPUT" };
      }

      // Check for duplicate email
      const existing = await prisma.user.findUnique({
        where: { email: email.trim() },
      });
      if (existing) {
        return { success: false, error: "EMAIL_EXISTS" };
      }

      const passwordHash = await bcrypt.hash(password, 10);

      // Transaction: create user + SyncQueue
      const user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            name: name.trim(),
            email: email.trim(),
            passwordHash,
            role: "staff",
          },
        });

        await tx.syncQueue.create({
          data: {
            tableName: "User",
            action: "create",
            recordId: newUser.id,
            payload: JSON.stringify(newUser),
          },
        });

        return newUser;
      });

      return { success: true, user };
    },
  );
}
