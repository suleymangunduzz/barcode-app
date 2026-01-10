import { ipcMain } from "electron";
import { PrismaClient } from "@prisma/client";

import { getSession } from "../auth/session";

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

  ipcMain.handle(
    "items:updateStock",
    async (_event, { itemId, changeQuantity, reason }) => {
      const session = getSession();

      if (session.role !== "admin") {
        throw new Error("UNAUTHORIZED");
      }

      return prisma.$transaction(async (tx) => {
        await tx.item.update({
          where: { id: itemId },
          data: {
            stockQuantity: {
              increment: changeQuantity,
            },
          },
        });

        await tx.stockMovement.create({
          data: {
            itemId,
            changeQuantity,
            reason,
          },
        });

        return { success: true };
      });
    }
  );
}
