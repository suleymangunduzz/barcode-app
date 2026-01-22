export type PageType =
  | "dashboard"
  | "sales"
  | "products"
  | "reports"
  | "categories"
  | "lowStock"
  | "users";
export type UserRole = "admin" | "staff";

export type CartItem = {
  itemId: number;
  barcode: string;
  name: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
};
