// AUTO-GENERATED TYPES FROM PRISMA SCHEMA

export type User = {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  createdAt: string;
  sales: Sale[];
};

export type Category = {
  id: number;
  name: string;
  items: Item[];
  createdAt: string;
};

export type Item = {
  id: number;
  barcode: string;
  name: string;
  brand?: string | null;
  model?: string | null;
  categoryId?: number | null;
  category?: Category;
  currentPrice: number;
  stockQuantity: number;
  minStockThreshold: number;
  imagePath?: string | null;
  createdAt: string;
  updatedAt: string;
  saleItems: SaleItem[];
  stockMovements: StockMovement[];
};

export type StockMovement = {
  id: number;
  itemId: number;
  item: Item;
  changeQuantity: number;
  reason: string;
  referenceId?: number | null;
  createdAt: string;
};

export type Sale = {
  id: number;
  totalAmount: number;
  soldById?: number | null;
  soldBy?: User;
  createdAt: string;
  saleItems: SaleItem[];
};

export type SaleItem = {
  id: number;
  saleId: number;
  sale: Sale;
  itemId: number;
  item: Item;
  itemName: string;
  barcode: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export type SyncQueue = {
  id: number;
  tableName: string;
  action: string;
  recordId?: number | null;
  payload: string;
  synced: boolean;
  createdAt: string;
};
