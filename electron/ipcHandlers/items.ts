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

  ipcMain.handle("items:getByCategory", async (_event, categoryId: number) => {
    return prisma.item.findMany({
      where: { categoryId },
      orderBy: { name: "asc" },
    });
  });

  ipcMain.handle("items:getLowStock", async () => {
    const items = await prisma.item.findMany({
      include: { category: true },
    });

    const lowStockItems = items.filter(
      (item) => item.stockQuantity <= item.minStockThreshold
    );

    return lowStockItems;
  });

  ipcMain.handle(
    "items:updateStock",
    async (_event, { itemId, changeQuantity, reason }) => {
      const session = getSession();

      if (session.role !== "admin") {
        return { success: false, error: "UNAUTHORIZED" };
      }

      return prisma.$transaction(async (tx) => {
        const updatedItem = await tx.item.update({
          where: { id: itemId },
          data: {
            stockQuantity: {
              increment: changeQuantity,
            },
          },
        });

        const stockMovement = await tx.stockMovement.create({
          data: {
            itemId,
            changeQuantity,
            reason,
          },
        });

        // Sync: item update
        await tx.syncQueue.create({
          data: {
            tableName: "Item",
            action: "update",
            recordId: itemId,
            payload: JSON.stringify({
              stockQuantity: updatedItem.stockQuantity,
            }),
          },
        });

        // Sync: stock movement create
        await tx.syncQueue.create({
          data: {
            tableName: "StockMovement",
            action: "create",
            recordId: stockMovement.id,
            payload: JSON.stringify(stockMovement),
          },
        });

        return { success: true };
      });
    }
  );

  ipcMain.handle("items:addNewItem", async (_event, data) => {
    const session = getSession();
    if (session.role !== "admin") {
      throw new Error("UNAUTHORIZED");
    }

    const {
      barcode,
      name,
      brand,
      model,
      categoryId,
      currentPrice,
      stockQuantity,
      minStockThreshold,
    } = data;

    return prisma.$transaction(async (tx) => {
      const item = await tx.item.create({
        data: {
          barcode,
          name,
          brand: brand || null,
          model: model || null,
          categoryId: categoryId || null,
          currentPrice,
          stockQuantity,
          minStockThreshold,
        },
      });

      // Sync: item create
      await tx.syncQueue.create({
        data: {
          tableName: "Item",
          action: "create",
          recordId: item.id,
          payload: JSON.stringify(item),
        },
      });

      if (stockQuantity > 0) {
        const stockMovement = await tx.stockMovement.create({
          data: {
            itemId: item.id,
            changeQuantity: stockQuantity,
            reason: "restock",
          },
        });

        // Sync: stock movement create
        await tx.syncQueue.create({
          data: {
            tableName: "StockMovement",
            action: "create",
            recordId: stockMovement.id,
            payload: JSON.stringify(stockMovement),
          },
        });
      }

      return item;
    });
  });

  ipcMain.handle("items:updatePrice", async (_event, { itemId, newPrice }) => {
    try {
      const session = getSession();

      if (session.role !== "admin") {
        return { success: false, error: "UNAUTHORIZED" };
      }

      if (typeof newPrice !== "number" || newPrice <= 0) {
        return { success: false, error: "INVALID_PRICE" };
      }

      await prisma.$transaction(async (tx) => {
        const item = await tx.item.update({
          where: { id: itemId },
          data: {
            currentPrice: newPrice,
          },
        });

        await tx.syncQueue.create({
          data: {
            tableName: "Item",
            action: "update",
            recordId: itemId,
            payload: JSON.stringify({
              currentPrice: item.currentPrice,
            }),
          },
        });
      });

      return { success: true };
    } catch (err) {
      console.error("Update price failed:", err);
      return { success: false, error: "UPDATE_FAILED" };
    }
  });
}
