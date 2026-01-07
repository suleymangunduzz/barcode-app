import { ipcMain } from "electron";
import { PrismaClient } from "@prisma/client";

export function registerCategoryHandlers(prisma: PrismaClient) {
  // Fetch all categories
  ipcMain.handle("categories:getAll", async () => {
    return prisma.category.findMany({
      include: { items: true }, // optional: include items in category
    });
  });

  // Create new category
  ipcMain.handle("categories:create", async (event, name: string) => {
    const category = await prisma.category.create({
      data: { name },
    });
    return category;
  });

  // Update category
  ipcMain.handle(
    "categories:update",
    async (event, id: number, name: string) => {
      const category = await prisma.category.update({
        where: { id },
        data: { name },
      });
      return category;
    }
  );

  // Delete category
  ipcMain.handle("categories:delete", async (event, id: number) => {
    await prisma.category.delete({
      where: { id },
    });
    return { success: true };
  });
}
