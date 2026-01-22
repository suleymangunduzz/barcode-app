import { ipcMain } from "electron";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import { User } from "../types";
import { getSession } from "../auth/session";

type SqliteDb = ReturnType<typeof Database>;

export function registerUserHandlers(db: SqliteDb) {
  // Get users by role
  ipcMain.handle(
    "user:getByRole",
    (_event, { role }: { role: "admin" | "staff" }) => {
      const users = db
        .prepare(
          "SELECT id, name, email, role, createdAt FROM User WHERE role = ?",
        )
        .all(role) as User[];

      return { success: true, users };
    },
  );

  // Get total user count
  ipcMain.handle("user:getUserCount", () => {
    const row = db.prepare("SELECT COUNT(*) as count FROM User").get() as {
      count: number;
    };
    return { count: row.count as number };
  });

  // Check if first admin is needed
  ipcMain.handle("user:isFirstAdminNeeded", () => {
    const row = db.prepare("SELECT COUNT(*) as count FROM User").get() as {
      count: number;
    };
    return { needed: row.count === 0 };
  });

  // Create first admin
  ipcMain.handle(
    "user:signupFirstAdmin",
    async (
      _event,
      {
        name,
        email,
        password,
      }: { name: string; email: string; password: string },
    ) => {
      const row = db.prepare("SELECT COUNT(*) as count FROM User").get() as {
        count: number;
      };
      if (row.count > 0)
        return { success: false, error: "ADMIN_ALREADY_EXISTS" };

      if (!name?.trim() || !email?.trim() || !password)
        return { success: false, error: "MISSING_FIELDS" };

      const passwordHash = await bcrypt.hash(password, 10);

      const transaction = db.transaction(() => {
        // Insert admin
        const result = db
          .prepare(
            "INSERT INTO User (name, email, passwordHash, role) VALUES (?, ?, ?, ?)",
          )
          .run(name.trim(), email.trim(), passwordHash, "admin");

        const userId = result.lastInsertRowid as number;

        const newAdmin = db
          .prepare("SELECT * FROM User WHERE id = ?")
          .get(userId) as User;

        // SyncQueue
        db.prepare(
          `
          INSERT INTO SyncQueue (tableName, action, recordId, payload)
          VALUES (?, ?, ?, ?)
        `,
        ).run("User", "create", newAdmin.id, JSON.stringify(newAdmin));

        return newAdmin;
      });

      const admin = transaction();
      return { success: true, user: admin };
    },
  );

  // Create staff user
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
      if (!name?.trim() || !email?.trim() || !password)
        return { success: false, error: "INVALID_INPUT" };

      const existing = db
        .prepare("SELECT * FROM User WHERE email = ?")
        .get(email.trim());
      if (existing) return { success: false, error: "EMAIL_EXISTS" };

      const passwordHash = await bcrypt.hash(password, 10);

      const transaction = db.transaction(() => {
        const result = db
          .prepare(
            "INSERT INTO User (name, email, passwordHash, role) VALUES (?, ?, ?, ?)",
          )
          .run(name.trim(), email.trim(), passwordHash, "staff");

        const userId = result.lastInsertRowid as number;

        const newUser = db
          .prepare("SELECT * FROM User WHERE id = ?")
          .get(userId) as User;

        db.prepare(
          `
          INSERT INTO SyncQueue (tableName, action, recordId, payload)
          VALUES (?, ?, ?, ?)
        `,
        ).run("User", "create", newUser.id, JSON.stringify(newUser));

        return newUser;
      });

      const user = transaction();
      return { success: true, user };
    },
  );

  // Change another user's password (admin must validate with current password)
  ipcMain.handle(
    "user:changePasswordByAdmin",
    async (
      _event,
      {
        adminPassword,
        targetUserId,
        newPassword,
      }: { adminPassword: string; targetUserId: number; newPassword: string },
    ) => {
      const session = getSession();
      if (session.role !== "admin")
        return { success: false, error: "UNAUTHORIZED" };

      const adminId = session.userId;
      if (!adminId) return { success: false, error: "UNAUTHORIZED" };

      const adminUser = db
        .prepare("SELECT * FROM User WHERE id = ?")
        .get(adminId) as User | undefined;
      if (!adminUser) return { success: false, error: "ADMIN_NOT_FOUND" };

      const valid = bcrypt.compareSync(adminPassword, adminUser.passwordHash);
      if (!valid) return { success: false, error: "INVALID_ADMIN_PASSWORD" };

      if (!newPassword || newPassword.length < 6)
        return { success: false, error: "INVALID_NEW_PASSWORD" };

      const newHash = await bcrypt.hash(newPassword, 10);
      db.prepare("UPDATE User SET passwordHash = ? WHERE id = ?").run(
        newHash,
        targetUserId,
      );

      // Optionally, insert into SyncQueue if exists
      try {
        const updated = db
          .prepare(
            "SELECT id, name, email, role, createdAt FROM User WHERE id = ?",
          )
          .get(targetUserId) as User | undefined;
        if (updated) {
          db.prepare(
            `
            INSERT INTO SyncQueue (tableName, action, recordId, payload)
            VALUES (?, ?, ?, ?)
          `,
          ).run("User", "update", updated.id, JSON.stringify(updated));
        }
      } catch (e) {}

      return { success: true };
    },
  );
}
