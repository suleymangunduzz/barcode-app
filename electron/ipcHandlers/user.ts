import { ipcMain } from "electron";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { setAdminSession } from "../auth/session";

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
    }
  );

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

      const passwordHash = await bcrypt.hash(password, 10);

      const admin = await prisma.user.create({
        data: { name, email, passwordHash, role: "admin" },
      });

      // Optional: SyncQueue
      await prisma.syncQueue.create({
        data: {
          tableName: "User",
          action: "create",
          recordId: admin.id,
          payload: JSON.stringify(admin),
        },
      });

      // Set session
      setAdminSession({ id: admin.id, email: admin.email });

      return { success: true, user: admin };
    }
  );
}
