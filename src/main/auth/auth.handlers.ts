import { ipcMain } from "electron";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import {
  getSession,
  setAdminSession,
  clearSession,
  setStaffSession,
} from "./session";
import { User } from "../types";

type SqliteDb = ReturnType<typeof Database>;

export function registerAuthHandlers(db: SqliteDb) {
  ipcMain.handle("auth:getSession", () => {
    const session = getSession();
    return {
      role: session?.role || null,
      name: session?.name || null,
      email: session?.email || null,
    };
  });

  ipcMain.handle(
    "auth:login",
    (_event, { email, password }: { email: string; password: string }) => {
      const user = db
        .prepare("SELECT * FROM User WHERE email = ?")
        .get(email) as User | undefined;

      if (!user) return { success: false, error: "INVALID_CREDENTIALS" };

      const validPassword = bcrypt.compareSync(password, user.passwordHash);

      if (!validPassword)
        return { success: false, error: "INVALID_CREDENTIALS" };

      if (user.role === "admin")
        setAdminSession({ id: user.id, email: user.email, name: user.name });
      else if (user.role === "staff")
        setStaffSession({ id: user.id, email: user.email, name: user.name });

      return { success: true, user };
    },
  );

  ipcMain.handle("auth:logout", () => {
    clearSession();
    return { success: true };
  });
}
