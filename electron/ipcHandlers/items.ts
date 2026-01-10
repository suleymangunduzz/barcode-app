import { ipcMain } from "electron";
import { PrismaClient } from "@prisma/client";

export function registerItemHandlers(prisma: PrismaClient) {
  ipcMain.handle("items:getAll", async () => {
    return prisma.item.findMany({
      include: { category: true },
    });
  });

  ipcMain.handle("items:getByBarcode", async (_, barcode: string) => {
    return prisma.item.findUnique({
      where: { barcode },
      include: { category: false },
    });
  });

  // You can also add CRUD: create/update/delete items here
}
