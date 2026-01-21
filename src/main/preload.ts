import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  // Items related handlers
  addNewItem: (data: unknown) => ipcRenderer.invoke("items:addNewItem", data),
  getAllItems: () => ipcRenderer.invoke("items:getAll"),
  getItemByBarcode: (barcode: string) =>
    ipcRenderer.invoke("items:getByBarcode", barcode),
  updateItemStock: (itemId: number, changeQuantity: number, reason: string) =>
    ipcRenderer.invoke("items:updateStock", {
      itemId,
      changeQuantity,
      reason,
    }),
  updateItemPrice: (payload: { itemId: number; newPrice: number }) =>
    ipcRenderer.invoke("items:updatePrice", payload),

  getItemsByCategory: (categoryId: number) =>
    ipcRenderer.invoke("items:getByCategory", categoryId),
  getLowStockItems: () => ipcRenderer.invoke("items:getLowStock"),
  getStockMovements: (itemId: number) =>
    ipcRenderer.invoke("items:getStockMovements", itemId),
  getSalesForItem: (payload: { itemId: number; from?: string; to?: string }) =>
    ipcRenderer.invoke("items:getSalesForItem", payload),
  getPriceHistory: (itemId: number) =>
    ipcRenderer.invoke("items:getPriceHistory", itemId),

  // Categories related handlers
  getAllCategories: () => ipcRenderer.invoke("categories:getAll"),
  createCategory: (payload: { name: string }) =>
    ipcRenderer.invoke("categories:create", payload),
  updateCategory: (payload: { id: number; name: string }) =>
    ipcRenderer.invoke("categories:update", payload),

  // Auth and User related handlers
  login: (email: string, password: string) =>
    ipcRenderer.invoke("auth:login", { email, password }),
  logout: () => ipcRenderer.invoke("auth:logout"),
  getSession: () => ipcRenderer.invoke("auth:getSession"),
  signupFirstAdmin: (data: { name: string; email: string; password: string }) =>
    ipcRenderer.invoke("user:signupFirstAdmin", data),
  signupStaff: (data: { name: string; email: string; password: string }) =>
    ipcRenderer.invoke("user:signupStaff", data),

  isFirstAdminNeeded: () => ipcRenderer.invoke("user:isFirstAdminNeeded"),
  getUserCount: () => ipcRenderer.invoke("user:getUserCount"),
  getUsersByRole: (role: string) =>
    ipcRenderer.invoke("user:getByRole", { role }),

  // Sales related handlers
  completeSale: (
    items: {
      itemId: number;
      barcode: string;
      name: string;
      unitPrice: number;
      quantity: number;
      totalPrice: number;
    }[],
    soldById?: number,
  ) => ipcRenderer.invoke("sale:create", { items, soldById }),
  getLastSales: (limit?: number) =>
    ipcRenderer.invoke("sale:getLastSales", { limit }),
  // Reports
  generateSalesReport: (payload: {
    from: string;
    to: string;
    email?: string;
    subject?: string;
  }) => ipcRenderer.invoke("reports:generateSalesReport", payload),
  getReportSchedules: () => ipcRenderer.invoke("reports:getSchedules"),
  saveReportSchedule: (payload: {
    id?: number;
    type: string;
    email?: string | null;
    enabled: boolean;
    subject?: string;
  }) => ipcRenderer.invoke("reports:saveSchedule", payload),
  toggleReportSchedule: (payload: { id: number; enabled: boolean }) =>
    ipcRenderer.invoke("reports:toggleSchedule", payload),
});
