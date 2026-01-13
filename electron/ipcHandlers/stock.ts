import { ipcMain } from "electron";
import { PrismaClient } from "@prisma/client";

export function registerStockHandlers(prisma: PrismaClient) {
  ipcMain.handle(
    "stock:add",
    async (
      _event,
      itemId: number,
      quantity: number,
      reason: "restock" | "manual_adjustment"
    ) => {
      return prisma.$transaction(async (tx) => {
        // 1️⃣ Update stock quantity
        const updatedItem = await tx.item.update({
          where: { id: itemId },
          data: { stockQuantity: { increment: quantity } },
        });

        // 2️⃣ Record Item update in SyncQueue
        await tx.syncQueue.create({
          data: {
            tableName: "Item",
            action: "update",
            recordId: updatedItem.id,
            payload: JSON.stringify({
              stockQuantity: updatedItem.stockQuantity,
            }),
          },
        });

        // 3️⃣ Create StockMovement
        const movement = await tx.stockMovement.create({
          data: { itemId, changeQuantity: quantity, reason },
        });

        // 4️⃣ Record StockMovement in SyncQueue
        await tx.syncQueue.create({
          data: {
            tableName: "StockMovement",
            action: "create",
            recordId: movement.id,
            payload: JSON.stringify(movement),
          },
        });

        return updatedItem;
      });
    }
  );
}
