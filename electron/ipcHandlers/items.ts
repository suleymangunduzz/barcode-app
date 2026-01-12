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
        return { success: false, error: "UNAUTHORIZED" };
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

  ipcMain.handle("items:updatePrice", async (_event, { itemId, newPrice }) => {
    try {
      const session = getSession();

      if (session.role !== "admin") {
        return { success: false, error: "UNAUTHORIZED" };
      }

      if (typeof newPrice !== "number" || newPrice <= 0) {
        return { success: false, error: "INVALID_PRICE" };
      }

      await prisma.item.update({
        where: { id: itemId },
        data: {
          currentPrice: newPrice,
        },
      });

      return { success: true };
    } catch (err) {
      console.error("Update price failed:", err);
      return { success: false, error: "UPDATE_FAILED" };
    }
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

      // Initial stock movement (if any stock)
      if (stockQuantity > 0) {
        await tx.stockMovement.create({
          data: {
            itemId: item.id,
            changeQuantity: stockQuantity,
            reason: "restock",
          },
        });
      }

      return item;
    });
  });
}
