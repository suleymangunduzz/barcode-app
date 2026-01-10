import { ipcMain } from "electron";
import { PrismaClient } from "@prisma/client";

export function registerUserHandlers(prisma: PrismaClient) {
  ipcMain.handle(
    "user:getByRole",
    async (_event, { role }: { role: "admin" | "staff" }) => {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
        },
        where: { role },
      });

      return { success: true, users };
    }
  );
}
