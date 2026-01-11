export type PageType =
  | "dashboard"
  | "products"
  | "reports"
  | "categories"
  | "lowStock";
export type UserRole = "admin" | "staff";

export type CartItem = {
  itemId: number;
  barcode: string;
  name: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
};

export type Item = {
  id: number;
  barcode: string;
  name: string;
  currentPrice: number;
  stockQuantity: number;
  minStockThreshold: number;
  brand: string;
  category?: {
    name: string;
  };
};

export type Category = {
  id: number;
  name: string;
  items: Item[];
  createdAt: Date;
};
