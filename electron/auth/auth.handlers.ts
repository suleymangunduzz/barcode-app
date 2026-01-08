import { ipcMain } from "electron";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { getSession, setAdminSession, clearSession } from "./session";

export function registerAuthHandlers(prisma: PrismaClient) {
  // Get current session
  ipcMain.handle("auth:getSession", () => {
    const session = getSession();
    return {
      role: session.role,
      email: session.email,
    };
  });

  // Admin login
  ipcMain.handle("auth:login", async (_event, { email, password }) => {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, error: "INVALID_CREDENTIALS" };
    }

    if (user.role !== "admin") {
      return { success: false, error: "NOT_ADMIN" };
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
      return { success: false, error: "INVALID_CREDENTIALS" };
    }

    setAdminSession({ id: user.id, email: user.email });

    return { success: true };
  });

  // Logout admin
  ipcMain.handle("auth:logout", () => {
    clearSession();
    return { success: true };
  });
}
