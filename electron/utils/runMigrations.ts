import { execSync } from "child_process";
import path from "path";
import { app } from "electron";

export default function runMigrations() {
  const isDev = !app.isPackaged;

  try {
    if (isDev) {
      // Use migrate dev in dev
      execSync("npx prisma migrate dev --name init", {
        cwd: path.join(__dirname, ".."),
        stdio: "inherit",
      });
    } else {
      // Use migrate deploy in production
      execSync("npx prisma migrate deploy", {
        cwd: path.join(__dirname, ".."),
        stdio: "inherit",
      });
    }
  } catch (err) {
    console.error("Migration failed", err);
  }
}
