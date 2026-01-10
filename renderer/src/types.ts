export type PageType = "dashboard" | "products" | "reports" | "categories";
export type UserRole = "admin" | "staff";

export type CartItem = {
  itemId: number;
  barcode: string;
  name: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
};
