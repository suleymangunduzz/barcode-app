import { ipcMain } from "electron";
import Database from "better-sqlite3";
import { getSession } from "../auth/session";
import { Category } from "../types";

type SqliteDb = ReturnType<typeof Database>;

export function registerCategoryHandlers(db: SqliteDb) {
  // Fetch all categories (including items if needed)
  ipcMain.handle("categories:getAll", () => {
    const categories = db.prepare("SELECT * FROM Category").all() as Category[];
    // Optionally include items per category
    for (const category of categories) {
      category.items = db
        .prepare("SELECT * FROM Item WHERE categoryId = ?")
        .all(category.id) as Category["items"];
    }
    return categories;
  });

  // Create new category
  ipcMain.handle("categories:create", (_event, { name }: { name: string }) => {
    try {
      const session = getSession();
      if (session.role !== "admin")
        return { success: false, error: "UNAUTHORIZED" };
      if (!name || !name.trim()) return { success: false, error: "EMPTY_NAME" };

      // Check duplicate
      const existing = db
        .prepare("SELECT * FROM Category WHERE name = ?")
        .get(name.trim());
      if (existing) return { success: false, error: "DUPLICATE" };

      const transaction = db.transaction(() => {
        // Insert category
        const result = db
          .prepare("INSERT INTO Category (name) VALUES (?)")
          .run(name.trim());
        const newCategoryId = result.lastInsertRowid;

        const newCategory = db
          .prepare("SELECT * FROM Category WHERE id = ?")
          .get(newCategoryId) as Category;

        // SyncQueue event
        db.prepare(
          `
          INSERT INTO SyncQueue (tableName, action, recordId, payload)
          VALUES (?, ?, ?, ?)
        `,
        ).run(
          "Category",
          "create",
          newCategory.id,
          JSON.stringify(newCategory),
        );

        return newCategory;
      });

      const category = transaction();
      return { success: true, category };
    } catch (err) {
      console.error("Create category failed:", err);
      return { success: false, error: "UNKNOWN" };
    }
  });

  // Update category name
  ipcMain.handle(
    "categories:update",
    (_event, { id, name }: { id: number; name: string }) => {
      try {
        const session = getSession();
        if (session.role !== "admin")
          return { success: false, error: "UNAUTHORIZED" };
        if (!name || !name.trim())
          return { success: false, error: "EMPTY_NAME" };

        // Check duplicate excluding current
        const existing = db
          .prepare("SELECT * FROM Category WHERE name = ? AND id != ?")
          .get(name.trim(), id);
        if (existing) return { success: false, error: "DUPLICATE" };

        const transaction = db.transaction(() => {
          // Update category
          db.prepare("UPDATE Category SET name = ? WHERE id = ?").run(
            name.trim(),
            id,
          );

          const updatedCategory = db
            .prepare("SELECT * FROM Category WHERE id = ?")
            .get(id) as Category;

          // SyncQueue event
          db.prepare(
            `
          INSERT INTO SyncQueue (tableName, action, recordId, payload)
          VALUES (?, ?, ?, ?)
        `,
          ).run(
            "Category",
            "update",
            updatedCategory.id,
            JSON.stringify({ name: updatedCategory.name }),
          );

          return updatedCategory;
        });

        const category = transaction();
        return { success: true, category };
      } catch (err) {
        console.error("Update category failed:", err);
        return { success: false, error: "UNKNOWN" };
      }
    },
  );
}
