import { ipcMain } from "electron";
import { PrismaClient } from "@prisma/client";

export function registerSaleHandlers(prisma: PrismaClient) {
  ipcMain.handle("sale:create", async (_event, { items, soldById }) => {
    if (!items || items.length === 0) {
      return { success: false, error: "NO_ITEMS" };
    }

    return prisma.$transaction(async (tx) => {
      const dbItems = await tx.item.findMany({
        where: { id: { in: items.map((i: any) => i.itemId) } },
      });

      // Check stock availability
      for (const i of items) {
        const dbItem = dbItems.find((dbi) => dbi.id === i.itemId);
        if (!dbItem || dbItem.stockQuantity < i.quantity) {
          return {
            success: false,
            error: "INSUFFICIENT_STOCK",
            itemId: i.itemId,
            itemName: i.name,
          };
        }
      }

      const totalAmount = items.reduce(
        (sum: number, i: any) => sum + i.totalPrice,
        0
      );

      // 1️⃣ Create sale with saleItems
      const sale = await tx.sale.create({
        data: {
          totalAmount,
          soldById,
          saleItems: {
            create: items.map((i: any) => ({
              itemId: i.itemId,
              itemName: i.name,
              barcode: i.barcode,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              totalPrice: i.totalPrice,
            })),
          },
        },
        include: { saleItems: true },
      });

      // 2️⃣ Record Sale in SyncQueue
      await tx.syncQueue.create({
        data: {
          tableName: "Sale",
          action: "create",
          recordId: sale.id,
          payload: JSON.stringify(sale),
        },
      });

      // 3️⃣ Record SaleItems in SyncQueue
      for (const si of sale.saleItems) {
        await tx.syncQueue.create({
          data: {
            tableName: "SaleItem",
            action: "create",
            recordId: si.id,
            payload: JSON.stringify(si),
          },
        });
      }

      // 4️⃣ Create stock movements & sync
      for (const i of items) {
        const movement = await tx.stockMovement.create({
          data: {
            itemId: i.itemId,
            changeQuantity: -i.quantity,
            reason: "sale",
            referenceId: sale.id,
          },
        });

        await tx.syncQueue.create({
          data: {
            tableName: "StockMovement",
            action: "create",
            recordId: movement.id,
            payload: JSON.stringify(movement),
          },
        });
      }

      // 5️⃣ Update stock quantities & sync
      for (const i of items) {
        const updatedItem = await tx.item.update({
          where: { id: i.itemId },
          data: { stockQuantity: { decrement: i.quantity } },
        });

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
      }

      return { success: true, saleId: sale.id };
    });
  });

  ipcMain.handle(
    "sale:getLastSales",
    async (_event, { limit }: { limit?: number }) => {
      const sales = await prisma.sale.findMany({
        orderBy: { createdAt: "desc" },
        take: limit || 20,
        include: { soldBy: true, saleItems: true },
      });
      return sales;
    }
  );
}
