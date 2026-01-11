import { CartItem } from "./src/types/client";
import type { Item, Category, User, Sale, SaleItem } from "./src/types/prisma";

export {};

declare global {
  interface Window {
    api: {
      // ───────────────
      // Items
      // ───────────────
      getAllItems: () => Promise<Item[]>;
      getItemByBarcode: (barcode: string) => Promise<Item | null>;

      updateItemStock: (
        itemId: number,
        changeQuantity: number,
        reason: string
      ) => Promise<{ success: boolean; error?: string }>;

      updateItemPrice: (payload: {
        itemId: number;
        newPrice: number;
      }) => Promise<{ success: boolean; error?: string }>;

      getItemsByCategory: (categoryId: number) => Promise<Item[]>;
      getLowStockItems: () => Promise<Item[]>;

      // ───────────────
      // Categories
      // ───────────────
      getAllCategories: () => Promise<Category[]>;

      createCategory: (payload: { name: string }) => Promise<Category>;

      updateCategory: (payload: {
        id: number;
        name: string;
      }) => Promise<{ success: boolean; error?: string }>;

      // ───────────────
      // Auth
      // ───────────────
      login: (email: string, password: string) => Promise<User>;

      logout: () => Promise<void>;

      getSession: () => Promise<User>;

      // ───────────────
      // Sales
      // ───────────────
      completeSale: (
        items: CartItem[],
        soldById?: number
      ) => Promise<{
        success: boolean;
        error?: string;
        saleId?: number;
        itemId?: number;
        itemName?: string;
      }>;

      // ───────────────
      // Users
      // ───────────────
      getUsersByRole: (
        role: string
      ) => Promise<{ success: boolean; users: User[] }>;
    };
  }
}
