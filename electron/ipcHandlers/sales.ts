import { ipcMain } from "electron";
import { PrismaClient } from "@prisma/client";

export function registerSaleHandlers(prisma: PrismaClient) {
  ipcMain.handle("sale:create", async (_event, { items, soldById }) => {
    if (!items || items.length === 0) {
      return { success: false, error: "NO_ITEMS" };
    }

    return prisma.$transaction(async (tx) => {
      const dbItems = await tx.item.findMany({
        where: {
          id: {
            in: items.map((i: any) => i.itemId),
          },
        },
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

      // 1️⃣ Create sale
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
      });

      // 2️⃣ Stock movements
      await tx.stockMovement.createMany({
        data: items.map((i: any) => ({
          itemId: i.itemId,
          changeQuantity: -i.quantity,
          reason: "sale",
          referenceId: sale.id,
        })),
      });

      // 3️⃣ Update stock quantities
      for (const i of items) {
        await tx.item.update({
          where: { id: i.itemId },
          data: {
            stockQuantity: {
              decrement: i.quantity,
            },
          },
        });
      }

      return { success: true, saleId: sale.id };
    });
  });
}
