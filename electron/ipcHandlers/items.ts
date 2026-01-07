import { ipcMain } from "electron";
import { PrismaClient } from "@prisma/client";

export function registerItemHandlers(prisma: PrismaClient) {
  ipcMain.handle("items:getAll", async () => {
    return prisma.item.findMany({
      include: { category: true },
    });
  });

  // You can also add CRUD: create/update/delete items here
}
