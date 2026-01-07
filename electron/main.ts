import { app, BrowserWindow } from "electron";
import path from "path";
import { PrismaClient } from "@prisma/client";

import { registerItemHandlers } from "./ipcHandlers/items";
import { registerStockHandlers } from "./ipcHandlers/stock";
import { registerSaleHandlers } from "./ipcHandlers/sales";

let mainWindow: BrowserWindow | null = null;
const prisma = new PrismaClient();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL("http://localhost:5173");
}

// Register all IPC handlers
registerItemHandlers(prisma);
registerStockHandlers(prisma);
registerSaleHandlers(prisma);

app.whenReady().then(createWindow);

app.on("window-all-closed", async () => {
  await prisma.$disconnect();
  if (process.platform !== "darwin") app.quit();
});
