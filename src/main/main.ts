import { app, BrowserWindow } from "electron";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

if (!app.isPackaged) {
  dotenv.config({ path: path.join(process.cwd(), "src", "main", ".env") });
}

console.log("[Electron] SMTP_HOST:", process.env.SMTP_HOST ? "set" : "not set");

import { db } from "./db/database";
import runMigrations from "./db/runMigrations";

import { registerItemHandlers } from "./ipcHandlers/items";
import { registerStockHandlers } from "./ipcHandlers/stock";
import { registerSaleHandlers } from "./ipcHandlers/sales";
import { registerCategoryHandlers } from "./ipcHandlers/categories";
import { registerAuthHandlers } from "./auth/auth.handlers";
import { registerUserHandlers } from "./ipcHandlers/user";
import { registerReportHandlers } from "./ipcHandlers/reports";

let mainWindow: BrowserWindow | null = null;

const isDev = !!process.env.VITE_DEV_SERVER_URL;

/**
 * Create the main Electron window
 */
async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    await mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    // mainWindow.webContents.openDevTools({ mode: "detach" });
    return;
  }

  const indexHtml = path.join(__dirname, "../renderer/index.html");
  if (!fs.existsSync(indexHtml)) {
    console.error("[Electron] index.html not found at:", indexHtml);
    return;
  }

  await mainWindow.loadFile(indexHtml);
}

/**
 * Register all IPC handlers
 */
function registerHandlers() {
  console.log("[Electron] Registering IPC handlers...");
  registerItemHandlers(db);
  registerStockHandlers(db);
  registerSaleHandlers(db);
  registerCategoryHandlers(db);
  registerAuthHandlers(db);
  registerUserHandlers(db);
  registerReportHandlers(db);
  console.log("[Electron] IPC handlers registered.");
}

/**
 * App ready
 */
app.whenReady().then(async () => {
  console.log("[Electron] SQLite DB loaded at:", db.name || "memory");

  // Run migrations in production
  runMigrations();

  // Register IPC handlers immediately
  registerHandlers();

  // Create main window
  await createWindow();
});

/**
 * Graceful shutdown
 */
app.on("window-all-closed", () => {
  db.close();
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
