import { app, BrowserWindow } from "electron";
import path from "path";
import fs from "fs";

import { registerItemHandlers } from "./ipcHandlers/items";
import { registerStockHandlers } from "./ipcHandlers/stock";
import { registerSaleHandlers } from "./ipcHandlers/sales";
import { registerCategoryHandlers } from "./ipcHandlers/categories";
import { registerAuthHandlers } from "./auth/auth.handlers";
import { registerUserHandlers } from "./ipcHandlers/user";

import getDatabasePath from "./utils/getDatabasePath";
import runMigrations from "./utils/runMigrations";

let mainWindow: BrowserWindow | null = null;
let prisma: import("@prisma/client").PrismaClient;

const isDev = !app.isPackaged;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      // preload: path.join(__dirname, "preload.js"),
      preload: path.join(process.resourcesPath, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    const devUrl = "http://localhost:5173";
    try {
      await mainWindow.loadURL(devUrl);
      console.log("[Electron] Loaded dev URL:", devUrl);
      return;
    } catch (err) {
      console.warn("[Electron] Dev server not running, falling back to file.");
    }
  }

  // ✅ Production (and dev fallback if dev server not running)
  const indexPath = isDev
    ? path.join(__dirname, "../../renderer/dist/index.html")
    : path.join(process.resourcesPath, "renderer", "index.html");

  if (!fs.existsSync(indexPath)) {
    console.error("[Electron] index.html not found at:", indexPath);
    return;
  }

  await mainWindow.loadFile(indexPath);
  console.log("[Electron] Loaded renderer:", indexPath);
}

app.whenReady().then(async () => {
  /**
   * 1️⃣ Set DATABASE_URL
   */
  const dbPath = getDatabasePath();
  process.env.DATABASE_URL = `file:${dbPath}`;
  console.log("[Electron] DATABASE_URL set to:", process.env.DATABASE_URL);

  /**
   * 2️⃣ Run migrations in production
   */
  if (!isDev) {
    runMigrations();
  }

  /**
   * 3️⃣ Initialize Prisma AFTER env is set
   */
  const { PrismaClient } = await import("@prisma/client");
  prisma = new PrismaClient();

  /**
   * 4️⃣ Register all IPC handlers (static imports!)
   */
  console.log("[Electron] Registering IPC handlers...");
  registerItemHandlers(prisma);
  registerStockHandlers(prisma);
  registerSaleHandlers(prisma);
  registerCategoryHandlers(prisma);
  registerAuthHandlers(prisma);
  registerUserHandlers(prisma);
  console.log("[Electron] IPC handlers registered.");

  /**
   * 5️⃣ Create main window
   */
  await createWindow();
});

app.on("window-all-closed", async () => {
  if (prisma) await prisma.$disconnect();
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
