import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  // Items related handlers
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

  // Categories related handlers
  getAllCategories: () => ipcRenderer.invoke("categories:getAll"),
  createCategory: (payload: { name: string }) =>
    ipcRenderer.invoke("categories:create", payload),

  updateCategory: (payload: { id: number; name: string }) =>
    ipcRenderer.invoke("categories:update", payload),

  // Auth related handlers
  login: (email: string, password: string) =>
    ipcRenderer.invoke("auth:login", { email, password }),
  logout: () => ipcRenderer.invoke("auth:logout"),
  getSession: () => ipcRenderer.invoke("auth:getSession"),

  // Sales related handlers
  completeSale: (items: any[], soldById?: number) =>
    ipcRenderer.invoke("sale:create", { items, soldById }),

  // User related handlers
  getUsersByRole: (role: string) =>
    ipcRenderer.invoke("user:getByRole", { role }),
});
