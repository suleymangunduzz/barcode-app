import { ipcMain } from "electron";
import { PrismaClient } from "@prisma/client";
import { getSession } from "../auth/session";

export function registerCategoryHandlers(prisma: PrismaClient) {
  // Fetch all categories
  ipcMain.handle("categories:getAll", async () => {
    return prisma.category.findMany({
      include: { items: true }, // optional: include items in category
    });
  });

  // Create new category
  ipcMain.handle("categories:create", async (_event, { name }) => {
    try {
      const session = getSession();
      if (session.role !== "admin")
        return { success: false, error: "UNAUTHORIZED" };
      if (!name || !name.trim()) return { success: false, error: "EMPTY_NAME" };

      const existing = await prisma.category.findUnique({
        where: { name: name.trim() },
      });
      if (existing) return { success: false, error: "DUPLICATE" };

      const category = await prisma.$transaction(async (tx) => {
        const newCategory = await tx.category.create({
          data: { name: name.trim() },
        });

        // SyncQueue event
        await tx.syncQueue.create({
          data: {
            tableName: "Category",
            action: "create",
            recordId: newCategory.id,
            payload: JSON.stringify(newCategory),
          },
        });

        return newCategory;
      });

      return { success: true, category };
    } catch (err) {
      console.error("Create category failed:", err);
      return { success: false, error: "UNKNOWN" };
    }
  });

  // Update category name
  ipcMain.handle("categories:update", async (_event, { id, name }) => {
    try {
      const session = getSession();
      if (session.role !== "admin")
        return { success: false, error: "UNAUTHORIZED" };
      if (!name || !name.trim()) return { success: false, error: "EMPTY_NAME" };

      const existing = await prisma.category.findFirst({
        where: { name: name.trim(), NOT: { id } },
      });
      if (existing) return { success: false, error: "DUPLICATE" };

      const category = await prisma.$transaction(async (tx) => {
        const updated = await tx.category.update({
          where: { id },
          data: { name: name.trim() },
        });

        // SyncQueue event
        await tx.syncQueue.create({
          data: {
            tableName: "Category",
            action: "update",
            recordId: updated.id,
            payload: JSON.stringify({ name: updated.name }),
          },
        });

        return updated;
      });

      return { success: true, category };
    } catch (err) {
      console.error("Update category failed:", err);
      return { success: false, error: "UNKNOWN" };
    }
  });
}
