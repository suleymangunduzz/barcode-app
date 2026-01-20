import { ipcMain } from "electron";
import Database from "better-sqlite3";
import { Item, StockMovement } from "../types";

type SqliteDb = ReturnType<typeof Database>;

export function registerStockHandlers(db: SqliteDb) {
  ipcMain.handle(
    "stock:add",
    (
      _event,
      itemId: number,
      quantity: number,
      reason: "restock" | "manual_adjustment",
    ) => {
      const transaction = db.transaction(() => {
        // 1️⃣ Update stock quantity
        db.prepare(
          "UPDATE Item SET stockQuantity = stockQuantity + ? WHERE id = ?",
        ).run(quantity, itemId);

        // 2️⃣ Get updated item
        const updatedItem = db
          .prepare("SELECT * FROM Item WHERE id = ?")
          .get(itemId) as Item;

        // 3️⃣ Record item update in SyncQueue
        db.prepare(
          `
          INSERT INTO SyncQueue (tableName, action, recordId, payload)
          VALUES (?, ?, ?, ?)
        `,
        ).run(
          "Item",
          "update",
          updatedItem.id,
          JSON.stringify({ stockQuantity: updatedItem.stockQuantity }),
        );

        // 4️⃣ Insert StockMovement
        const result = db
          .prepare(
            "INSERT INTO StockMovement (itemId, changeQuantity, reason) VALUES (?, ?, ?)",
          )
          .run(itemId, quantity, reason);

        const movementId = result.lastInsertRowid as number;

        const movement = db
          .prepare("SELECT * FROM StockMovement WHERE id = ?")
          .get(movementId) as StockMovement;

        // 5️⃣ Record movement in SyncQueue
        db.prepare(
          `
          INSERT INTO SyncQueue (tableName, action, recordId, payload)
          VALUES (?, ?, ?, ?)
        `,
        ).run("StockMovement", "create", movement.id, JSON.stringify(movement));

        return updatedItem;
      });

      return transaction();
    },
  );
}
