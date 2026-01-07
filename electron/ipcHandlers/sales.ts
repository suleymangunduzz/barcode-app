import { ipcMain } from "electron";
import { PrismaClient } from "@prisma/client";

export function registerSaleHandlers(prisma: PrismaClient) {
  ipcMain.handle(
    "sale:create",
    async (
      event,
      saleItems: { itemId: number; quantity: number }[],
      soldById?: number
    ) => {
      let totalAmount = 0;

      const sale = await prisma.sale.create({
        data: { soldById, totalAmount: 0 },
      });

      for (const si of saleItems) {
        const item = await prisma.item.update({
          where: { id: si.itemId },
          data: { stockQuantity: { decrement: si.quantity } },
        });

        const totalPrice = item.currentPrice * si.quantity;
        totalAmount += totalPrice;

        await prisma.saleItem.create({
          data: {
            saleId: sale.id,
            itemId: item.id,
            itemName: item.name,
            barcode: item.barcode,
            quantity: si.quantity,
            unitPrice: item.currentPrice,
            totalPrice,
          },
        });

        await prisma.stockMovement.create({
          data: {
            itemId: si.itemId,
            changeQuantity: -si.quantity,
            reason: "sale",
            referenceId: sale.id,
          },
        });
      }

      const updatedSale = await prisma.sale.update({
        where: { id: sale.id },
        data: { totalAmount },
      });

      return updatedSale;
    }
  );
}
