import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  getItems: () => ipcRenderer.invoke("items:getAll"),
  getCategories: () => ipcRenderer.invoke("categories:getAll"),
});
