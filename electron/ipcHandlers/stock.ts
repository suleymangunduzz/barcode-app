import { ipcMain } from "electron";
import { PrismaClient } from "@prisma/client";

export function registerStockHandlers(prisma: PrismaClient) {
  ipcMain.handle(
    "stock:add",
    async (
      event,
      itemId: number,
      quantity: number,
      reason: "restock" | "manual_adjustment"
    ) => {
      const item = await prisma.item.update({
        where: { id: itemId },
        data: { stockQuantity: { increment: quantity } },
      });

      await prisma.stockMovement.create({
        data: { itemId, changeQuantity: quantity, reason },
      });

      return item;
    }
  );
}
