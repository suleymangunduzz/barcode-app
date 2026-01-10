import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  // Items related handlers
  getAllItems: () => ipcRenderer.invoke("items:getAll"),
  getItemByBarcode: (barcode: string) =>
    ipcRenderer.invoke("items:getByBarcode", barcode),

  // Categories related handlers
  getCategories: () => ipcRenderer.invoke("categories:getAll"),

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
