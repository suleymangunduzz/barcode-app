import fs from "fs";
import path from "path";
import { db } from "./database";

export default function runMigrations() {
  // 1️⃣ Create migrations table if not exists
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE,
      appliedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
  ).run();

  // 2️⃣ Load applied migrations
  const applied = db
    .prepare("SELECT name FROM migrations")
    .all()
    .map((m: any) => m.name);

  // 3️⃣ Determine migrations directory (works both dev & prod)
  const migrationsDir = path.join(__dirname, "migrations");

  if (!fs.existsSync(migrationsDir)) {
    console.warn("⚠️ Migrations directory not found:", migrationsDir);
    return;
  }

  // 4️⃣ Run pending migrations
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const file of files) {
    if (applied.includes(file)) continue;

    console.log(`🛠 Running migration: ${file}`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");

    const transaction = db.transaction(() => {
      db.exec(sql);
      db.prepare("INSERT INTO migrations (name) VALUES (?)").run(file);
    });
    transaction();
  }

  console.log("✅ Migrations complete");
}
