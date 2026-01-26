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

  // Get stock movements for an item
  ipcMain.handle("items:getStockMovements", (_event, itemId: number) => {
    const movements = db
      .prepare(
        `
        SELECT * FROM StockMovement WHERE itemId = ? ORDER BY id DESC
      `,
      )
      .all(itemId);

    return movements;
  });

  // Get sales (and sale items) for a specific item within optional date range
  ipcMain.handle(
    "items:getSalesForItem",
    (
      _event,
      { itemId, from, to }: { itemId: number; from?: string; to?: string },
    ) => {
      // Build base query joining Sale and SaleItem
      let query = `
        SELECT s.*
        FROM Sale s
        JOIN SaleItem si ON si.saleId = s.id
        WHERE si.itemId = ?
      `;

      const params: any[] = [itemId];

      if (from) {
        query += " AND s.createdAt >= ?";
        params.push(from);
      }
      if (to) {
        query += " AND s.createdAt <= ?";
        params.push(to);
      }

      query += " ORDER BY s.createdAt DESC";

      const sales = db.prepare(query).all(...params) as any[];

      for (const sale of sales) {
        sale.saleItems = db
          .prepare("SELECT * FROM SaleItem WHERE saleId = ? AND itemId = ?")
          .all(sale.id, itemId);
      }

      return sales;
    },
  );

  // Get price history derived from SaleItem (unitPrice over time)
  ipcMain.handle("items:getPriceHistory", (_event, itemId: number) => {
    // Sale-derived prices
    const saleRows = db
      .prepare(
        `
        SELECT s.createdAt as date, si.unitPrice, si.quantity, si.totalPrice, s.id as saleId
        FROM Sale s
        JOIN SaleItem si ON si.saleId = s.id
        WHERE si.itemId = ?
      `,
      )
      .all(itemId) as any[];

    // Manual price changes (and initial item create) are recorded in SyncQueue payloads
    const syncRows = db
      .prepare(
        `
        SELECT id, tableName, action, payload, createdAt
        FROM SyncQueue
        WHERE tableName = 'Item' AND (action = 'create' OR action = 'update') AND payload LIKE '%currentPrice%'
      `,
      )
      .all() as any[];

    const parsedSyncPrices: any[] = [];
    for (const r of syncRows) {
      try {
        const payload = JSON.parse(r.payload);
        // payload may contain currentPrice at top-level (create) or as the only property (update)
        const price = payload?.currentPrice ?? null;
        if (typeof price === "number") {
          parsedSyncPrices.push({
            date: r.createdAt,
            unitPrice: price,
            quantity: null,
            source: r.action === "create" ? "initial" : "manual",
            syncId: r.id,
          });
        }
      } catch (e) {
        // ignore malformed payloads
      }
    }

    // Normalize sale rows
    const normalizedSales = saleRows.map((s) => ({
      date: s.date || s.createdAt,
      unitPrice: s.unitPrice,
      quantity: s.quantity,
      totalPrice: s.totalPrice,
      saleId: s.saleId,
      source: "sale",
    }));

    // Combine and sort by date DESC
    const combined = [...normalizedSales, ...parsedSyncPrices].sort((a, b) => {
      const ad = new Date(a.date).getTime();
      const bd = new Date(b.date).getTime();
      return bd - ad;
    });

    return combined;
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

    // Basic server-side validation
    const {
      barcode,
      name,
      brand,
      model,
      categoryId,
      currentPrice,
      stockQuantity,
      minStockThreshold,
    } = data || {};

    if (!barcode || typeof barcode !== "string" || !barcode.trim()) {
      throw new Error("MISSING_BARCODE");
    }

    if (!name || typeof name !== "string" || !name.trim()) {
      throw new Error("MISSING_NAME");
    }

    if (typeof currentPrice !== "number" || currentPrice <= 0) {
      throw new Error("INVALID_PRICE");
    }

    // Check duplicate barcode
    const existing = db
      .prepare("SELECT id FROM Item WHERE barcode = ?")
      .get(barcode);
    if (existing) {
      throw new Error("DUPLICATE_BARCODE");
    }

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
