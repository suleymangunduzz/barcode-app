import { ipcMain } from "electron";
import Database from "better-sqlite3";
import { getSession } from "../auth/session";
import { Item } from "../types";

type SqliteDb = ReturnType<typeof Database>;

export function registerItemHandlers(db: SqliteDb) {
  // Get all items (with category info)
  ipcMain.handle("items:getAll", () => {
    const items = db
      .prepare(
        `
        SELECT i.*, c.name as categoryName
        FROM Item i
        LEFT JOIN Category c ON i.categoryId = c.id
      `,
      )
      .all();

    return items;
  });

  // Get single item by barcode
  ipcMain.handle("items:getByBarcode", (_event, barcode: string) => {
    const item = db
      .prepare("SELECT * FROM Item WHERE barcode = ?")
      .get(barcode) as Item | undefined;

    return item || null;
  });

  // Get items by category
  ipcMain.handle("items:getByCategory", (_event, categoryId: number) => {
    const items = db
      .prepare("SELECT * FROM Item WHERE categoryId = ? ORDER BY name ASC")
      .all(categoryId);

    return items;
  });

  // Get low stock items
  ipcMain.handle("items:getLowStock", () => {
    const items = db.prepare("SELECT * FROM Item").all() as Item[];
    return items.filter((item) => item.stockQuantity <= item.minStockThreshold);
  });

  // Update stock quantity and record stock movement + syncQueue
  ipcMain.handle(
    "items:updateStock",
    (_event, { itemId, changeQuantity, reason }) => {
      const session = getSession();
      if (session.role !== "admin")
        return { success: false, error: "UNAUTHORIZED" };

      const transaction = db.transaction(() => {
        // Update item stock
        db.prepare(
          `
          UPDATE Item
          SET stockQuantity = stockQuantity + ?
          WHERE id = ?
        `,
        ).run(changeQuantity, itemId);

        // Get updated item
        const updatedItem = db
          .prepare("SELECT * FROM Item WHERE id = ?")
          .get(itemId) as Item;

        // Insert stock movement
        const stockMovementResult = db
          .prepare(
            `
          INSERT INTO StockMovement (itemId, changeQuantity, reason)
          VALUES (?, ?, ?)
        `,
          )
          .run(itemId, changeQuantity, reason);

        // Sync queue: item update
        db.prepare(
          `
          INSERT INTO SyncQueue (tableName, action, recordId, payload)
          VALUES (?, ?, ?, ?)
        `,
        ).run(
          "Item",
          "update",
          itemId,
          JSON.stringify({ stockQuantity: updatedItem.stockQuantity }),
        );

        // Sync queue: stock movement create
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
            itemId,
            changeQuantity,
            reason,
          }),
        );
      });

      transaction();

      return { success: true };
    },
  );

  // Add new item
  ipcMain.handle("items:addNewItem", (_event, data) => {
    const session = getSession();
    if (session.role !== "admin") throw new Error("UNAUTHORIZED");

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

    const transaction = db.transaction(() => {
      // Insert new item
      const result = db
        .prepare(
          `
        INSERT INTO Item (barcode, name, brand, model, categoryId, currentPrice, stockQuantity, minStockThreshold)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
        )
        .run(
          barcode,
          name,
          brand || null,
          model || null,
          categoryId || null,
          currentPrice,
          stockQuantity,
          minStockThreshold,
        );

      const itemId = result.lastInsertRowid;

      // Sync queue: item create
      db.prepare(
        `
        INSERT INTO SyncQueue (tableName, action, recordId, payload)
        VALUES (?, ?, ?, ?)
      `,
      ).run(
        "Item",
        "create",
        itemId,
        JSON.stringify({
          id: itemId,
          barcode,
          name,
          brand,
          model,
          categoryId,
          currentPrice,
          stockQuantity,
          minStockThreshold,
        }),
      );

      // If initial stock > 0, create stock movement
      if (stockQuantity > 0) {
        const stockMovementResult = db
          .prepare(
            `
          INSERT INTO StockMovement (itemId, changeQuantity, reason)
          VALUES (?, ?, ?)
        `,
          )
          .run(itemId, stockQuantity, "restock");

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
            itemId,
            changeQuantity: stockQuantity,
            reason: "restock",
          }),
        );
      }

      // Return the new item
      return db.prepare("SELECT * FROM Item WHERE id = ?").get(itemId);
    });

    return transaction();
  });

  // Update item price
  ipcMain.handle("items:updatePrice", (_event, { itemId, newPrice }) => {
    const session = getSession();
    if (session.role !== "admin")
      return { success: false, error: "UNAUTHORIZED" };
    if (typeof newPrice !== "number" || newPrice <= 0)
      return { success: false, error: "INVALID_PRICE" };

    const transaction = db.transaction(() => {
      // Update price
      db.prepare("UPDATE Item SET currentPrice = ? WHERE id = ?").run(
        newPrice,
        itemId,
      );

      // Sync queue
      db.prepare(
        `
        INSERT INTO SyncQueue (tableName, action, recordId, payload)
        VALUES (?, ?, ?, ?)
      `,
      ).run(
        "Item",
        "update",
        itemId,
        JSON.stringify({ currentPrice: newPrice }),
      );
    });

    transaction();

    return { success: true };
  });
}
