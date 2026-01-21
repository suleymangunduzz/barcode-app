import { CartItem, UserRole } from "@/types/client";
import type {
  Item,
  Category,
  User,
  Sale,
  SaleItem,
  StockMovement,
} from "@/types/DB";

export {};

declare global {
  interface Window {
    api: {
      // ───────────────
      // Items
      // ───────────────
      getAllItems: () => Promise<Item[]>;
      addNewItem: (data: Item) => Promise<{ success: boolean; error?: string }>;
      getItemByBarcode: (barcode: string) => Promise<Item | null>;

      updateItemStock: (
        itemId: number,
        changeQuantity: number,
        reason: string,
      ) => Promise<{ success: boolean; error?: string }>;

      updateItemPrice: (payload: {
        itemId: number;
        newPrice: number;
      }) => Promise<{ success: boolean; error?: string }>;

      getItemsByCategory: (categoryId: number) => Promise<Item[]>;
      getLowStockItems: () => Promise<Item[]>;
      getStockMovements: (itemId: number) => Promise<StockMovement[]>;

      // ───────────────
      // Categories
      // ───────────────
      getAllCategories: () => Promise<Category[]>;

      createCategory: (payload: {
        name: string;
      }) => Promise<{ success: boolean; error?: string }>;

      updateCategory: (payload: {
        id: number;
        name: string;
      }) => Promise<{ success: boolean; error?: string }>;

      // ───────────────
      // Auth and User
      // ───────────────
      login: (
        email: string,
        password: string,
      ) => Promise<{ success: boolean; error?: string; user?: User }>;
      logout: () => Promise<void>;
      getSession: () => Promise<{
        role: UserRole;
        name?: string | null;
        email?: string | null;
      }>;
      signupFirstAdmin: (data: {
        name: string;
        email: string;
        password: string;
      }) => Promise<{ success: boolean; error?: string; user?: User }>;
      signupStaff: (data: {
        name: string;
        email: string;
        password: string;
      }) => Promise<{ success: boolean; error?: string; user?: User }>;
      isFirstAdminNeeded: () => Promise<{ needed: boolean }>;
      getUserCount: () => Promise<{ count: number }>;
      getUsersByRole: (
        role: string,
      ) => Promise<{ success: boolean; users: User[] }>;

      // ───────────────
      // Sales
      // ───────────────
      completeSale: (
        items: CartItem[],
        soldById?: number,
      ) => Promise<{
        success: boolean;
        error?: string;
        saleId?: number;
        itemId?: number;
        itemName?: string;
      }>;
      getLastSales: (limit?: number) => Promise<Sale[]>;
      getSalesForItem: (payload: {
        itemId: number;
        from?: string;
        to?: string;
      }) => Promise<Sale[]>;
      getPriceHistory: (itemId: number) => Promise<any[]>;

      // ───────────────
      // Reports
      // ───────────────
      generateSalesReport: (payload: {
        from: string;
        to: string;
        email?: string;
        subject?: string;
      }) => Promise<{
        path: string;
        emailed?: boolean;
        messageId?: string | null;
      }>;
      getReportSchedules: () => Promise<any[]>;
      saveReportSchedule: (payload: {
        id?: number;
        type: string;
        email?: string | null;
        enabled: boolean;
        subject?: string;
      }) => Promise<{ success: boolean }>;
      toggleReportSchedule: (payload: {
        id: number;
        enabled: boolean;
      }) => Promise<{ success: boolean }>;
    };
  }
}
