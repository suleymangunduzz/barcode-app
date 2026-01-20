import { ipcMain } from "electron";
import Database from "better-sqlite3";
import { CartItem, Item, Sale, SaleItem } from "../types";

type SqliteDb = ReturnType<typeof Database>;

export function registerSaleHandlers(db: SqliteDb) {
  // Create a sale
  ipcMain.handle(
    "sale:create",
    (_event, { items, soldById }: { items: CartItem[]; soldById?: number }) => {
      if (!items || items.length === 0) {
        return { success: false, error: "NO_ITEMS" };
      }

      const transaction = db.transaction(() => {
        // Check stock availability
        for (const i of items) {
          const dbItem = db
            .prepare("SELECT * FROM Item WHERE id = ?")
            .get(i.itemId) as Item;
          if (!dbItem || dbItem.stockQuantity < i.quantity) {
            throw {
              success: false,
              error: "INSUFFICIENT_STOCK",
              itemId: i.itemId,
              itemName: i.name,
            };
          }
        }

        const totalAmount = items.reduce((sum, i) => sum + i.totalPrice, 0);

        // 1️⃣ Create sale
        const saleResult = db
          .prepare(
            `
        INSERT INTO Sale (totalAmount, soldById, createdAt)
        VALUES (?, ?, ?)
      `,
          )
          .run(totalAmount, soldById || null, new Date().toISOString());

        const saleId = saleResult.lastInsertRowid;

        // 2️⃣ Insert sale items
        for (const i of items) {
          const saleItemResult = db
            .prepare(
              `
          INSERT INTO SaleItem (saleId, itemId, itemName, barcode, quantity, unitPrice, totalPrice)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
            )
            .run(
              saleId,
              i.itemId,
              i.name,
              i.barcode,
              i.quantity,
              i.unitPrice,
              i.totalPrice,
            );

          // 3️⃣ Sync sale items
          db.prepare(
            `
          INSERT INTO SyncQueue (tableName, action, recordId, payload)
          VALUES (?, ?, ?, ?)
        `,
          ).run(
            "SaleItem",
            "create",
            saleItemResult.lastInsertRowid,
            JSON.stringify({
              ...i,
              id: saleItemResult.lastInsertRowid,
              saleId,
            }),
          );
        }

        // 4️⃣ Record Sale in SyncQueue
        db.prepare(
          `
        INSERT INTO SyncQueue (tableName, action, recordId, payload)
        VALUES (?, ?, ?, ?)
      `,
        ).run(
          "Sale",
          "create",
          saleId,
          JSON.stringify({ id: saleId, totalAmount, soldById, items }),
        );

        // 5️⃣ Create stock movements & update stock
        for (const i of items) {
          // Stock movement
          const stockMovementResult = db
            .prepare(
              `
          INSERT INTO StockMovement (itemId, changeQuantity, reason, referenceId)
          VALUES (?, ?, ?, ?)
        `,
            )
            .run(i.itemId, -i.quantity, "sale", saleId);

          db.prepare(
            `
          INSERT INTO SyncQueue (tableName, action, recordId, payload)
          VALUES (?, ?, ?, ?)
        `,
          ).run(
            "StockMovement",
            "create",
            stockMovementResult.lastInsertRowid,
            JSON.stringify({
              id: stockMovementResult.lastInsertRowid,
              itemId: i.itemId,
              changeQuantity: -i.quantity,
              reason: "sale",
              referenceId: saleId,
            }),
          );

          // Update item stock
          const updatedItem = db
            .prepare(
              `
          UPDATE Item
          SET stockQuantity = stockQuantity - ?
          WHERE id = ?
        `,
            )
            .run(i.quantity, i.itemId);

          // Sync item update
          const updatedItemData = db
            .prepare("SELECT stockQuantity FROM Item WHERE id = ?")
            .get(i.itemId) as { stockQuantity: number };

          db.prepare(
            `
          INSERT INTO SyncQueue (tableName, action, recordId, payload)
          VALUES (?, ?, ?, ?)
        `,
          ).run(
            "Item",
            "update",
            i.itemId,
            JSON.stringify({
              stockQuantity: updatedItemData.stockQuantity,
            }),
          );
        }

        return { success: true, saleId };
      });

      try {
        return transaction();
      } catch (err) {
        return err;
      }
    },
  );

  // Get last sales
  ipcMain.handle(
    "sale:getLastSales",
    (_event, { limit }: { limit?: number }) => {
      const sales = db
        .prepare(
          `
        SELECT s.*, u.name as soldByName, u.email as soldByEmail
        FROM Sale s
        LEFT JOIN User u ON s.soldById = u.id
        ORDER BY s.createdAt DESC
        LIMIT ?
      `,
        )
        .all(limit || 20) as Sale[];

      // Attach sale items
      for (const sale of sales) {
        sale.saleItems = db
          .prepare("SELECT * FROM SaleItem WHERE saleId = ?")
          .all(sale.id) as SaleItem[];
        // Populate nested soldBy object so renderer can read sale.soldBy.name
        // Prefer the user's name, fall back to email when name is missing
        (sale as any).soldBy = {
          id: (sale as any).soldById || null,
          name: (sale as any).soldByName || (sale as any).soldByEmail || null,
          email: (sale as any).soldByEmail || null,
        };
      }

      return sales;
    },
  );
}
