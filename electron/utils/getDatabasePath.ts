import { app } from "electron";
import path from "path";
import fs from "fs";

export default function getDatabasePath() {
  const userData = app.getPath("userData");
  const dbDir = path.join(userData, "db");

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  return path.join(dbDir, "barcode_system.db");
}
