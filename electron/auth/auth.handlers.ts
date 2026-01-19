import { ipcMain } from "electron";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import {
  getSession,
  setAdminSession,
  clearSession,
  setStaffSession,
} from "./session";

export function registerAuthHandlers(prisma: PrismaClient) {
  ipcMain.handle("auth:getSession", () => {
    const session = getSession();
    return {
      role: session.role,
      email: session.email,
    };
  });

  ipcMain.handle("auth:login", async (_event, { email, password }) => {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, error: "INVALID_CREDENTIALS" };
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
      return { success: false, error: "INVALID_CREDENTIALS" };
    }

    if (user.role === "admin") {
      setAdminSession({ id: user.id, email: user.email });
    }

    if (user.role === "staff") {
      setStaffSession({ id: user.id, email: user.email });
    }

    return { success: true, user };
  });

  ipcMain.handle("auth:logout", () => {
    clearSession();
    return { success: true };
  });
}
