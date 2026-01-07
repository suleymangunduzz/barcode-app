import { app, BrowserWindow, ipcMain } from "electron";
const path = require("path");
import { PrismaClient } from "@prisma/client";

let mainWindow: BrowserWindow | null = null;

// ✅ Prisma lives in MAIN
const prisma = new PrismaClient();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "electron/preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL("http://localhost:5173");
}

// ---- IPC HANDLERS ----

// Fetch all items
ipcMain.handle("items:getAll", async () => {
  return prisma.item.findMany({
    include: {
      category: true,
    },
  });
});

// Fetch categories
ipcMain.handle("categories:getAll", async () => {
  return prisma.category.findMany();
});

app.whenReady().then(createWindow);

app.on("window-all-closed", async () => {
  await prisma.$disconnect();
  if (process.platform !== "darwin") app.quit();
});
