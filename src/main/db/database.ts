import Database from "better-sqlite3";
import path from "path";
import { app } from "electron";
import fs from "fs";

const isDev = !app.isPackaged;

// Dev database inside project root, prod inside userData
const dbPath = isDev
  ? path.join(process.cwd(), "data", "dev.db")
  : path.join(app.getPath("userData"), "data", "app.db");

// Ensure folder exists
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

// Open SQLite database
export const db = new Database(dbPath);
console.log(
  `[Database] ${isDev ? "Development" : "Production"} SQLite DB initialized at: ${dbPath}`,
);
