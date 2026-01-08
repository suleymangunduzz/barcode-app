import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  getItems: () => ipcRenderer.invoke("items:getAll"),
  getCategories: () => ipcRenderer.invoke("categories:getAll"),
  login: (email: string, password: string) =>
    ipcRenderer.invoke("auth:login", { email, password }),
  logout: () => ipcRenderer.invoke("auth:logout"),
  getSession: () => ipcRenderer.invoke("auth:getSession"),
});
