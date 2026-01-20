import fs from "fs";
import path from "path";
import { db } from "./database";
import { app } from "electron";

export default function runMigrations() {
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE,
      appliedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
  ).run();

  const applied = db
    .prepare("SELECT name FROM migrations")
    .all()
    .map((m: any) => m.name);

  // Determine migrations path
  let migrationsDir: string;
  if (!app.isPackaged) {
    migrationsDir = path.join(process.cwd(), "src", "main", "db", "migrations"); // dev
  } else {
    migrationsDir = path.join(
      process.resourcesPath,
      "app.asar",
      "src",
      "main",
      "db",
      "migrations",
    ); // prod inside asar
  }

  if (!fs.existsSync(migrationsDir)) {
    console.warn("⚠️ Migrations folder not found:", migrationsDir);
    return;
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    if (applied.includes(file)) continue;

    console.log(`🛠 Applying migration: ${file}`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");

    db.transaction(() => {
      db.exec(sql);
      db.prepare("INSERT INTO migrations (name) VALUES (?)").run(file);
    })();
  }

  console.log("✅ Migrations complete");
}
