## Purpose

Provide concise, actionable guidance to AI coding agents working on this Electron + Vite + React codebase so they can be immediately productive.

**Big Picture**

- **App type**: Electron desktop app with a Node main process and a Vite-built React renderer.
- **Main / Renderer split**: `src/main` contains Electron main, preload, native DB code, and IPC handlers. `src/renderer` contains the React UI and Vite app.

**Key files / directories**

- **Main entry**: [src/main/main.ts](src/main/main.ts#L1) — registers IPC handlers and creates the BrowserWindow.
- **Preload**: [src/main/preload.ts](src/main/preload.ts#L1) — exposes a single `window.api` bridge; use these method names when simulating renderer behavior (e.g., `window.api.getAllItems()`).
- **IPC handlers**: [src/main/ipcHandlers](src/main/ipcHandlers) — functions like `registerItemHandlers(db)` attach channels such as `items:getAll`, `items:addNewItem`. Example: [src/main/ipcHandlers/items.ts](src/main/ipcHandlers/items.ts#L1-L200).
- **Database**: [src/main/db/database.ts](src/main/db/database.ts#L1) — uses `better-sqlite3`. Dev DB stored in `data/dev.db`, prod in userData `app.db`.
- **Migrations runner**: [src/main/db/runMigrations.ts](src/main/db/runMigrations.ts#L1) — runs `.sql` files from `src/main/db/migrations` in dev, and handles reading migrations inside `app.asar` in production.
- **Build & packaging**: `package.json` scripts: `npm run dev`, `npm run build`, `npm run dist` (uses `electron-builder`). See [package.json](package.json#L1).
- **Native rebuild helper**: `rebuild_better_sqlite3.sh` — rebuild `better-sqlite3` if native issues occur on packaging or different archs.

**Architecture & data flow notes**

- Renderer -> Main communication is strictly via `ipcRenderer.invoke` calls exposed in the preload `api`. The main process enforces authorization (see `getSession()` checks inside handlers).
- DB mutations frequently write to a `SyncQueue` table in the same transaction — look for this pattern in `ipcHandlers/*` when implementing similar actions.
- Migrations are applied at app startup from `main.ts` via `runMigrations()`; production reads migrations from inside the app.asar path — prefer reading SQL files from `src/main/db/migrations` when authoring migrations.

**Developer workflows & commands**

- Start dev (renderer + main): `npm run dev` — runs Vite and the Electron main process concurrently.
- Build for production: `npm run build` (runs `vite build` + `tsc -p src/main`).
- Create distributable: `npm run dist` (requires node native modules built for target arch; use `rebuild_better_sqlite3.sh` if packaging fails due to `better-sqlite3`).

**Conventions & patterns to follow**

- IPC channel naming: use `<domain>:<action>` (examples: `items:getAll`, `auth:login`, `sale:create`). Match names exactly with the preload `api` methods.
- Authorization: many handlers call `getSession()` from `src/main/auth/session.ts` — ensure role checks are present for admin-only actions (see `items:updateStock`).
- DB transactions: use `db.transaction(() => { ... })()` for grouped operations so migrations and multi-statement mutations remain atomic.

**Packaging gotchas**

- Migrations path differs between dev and prod; `runMigrations()` already handles `app.isPackaged` and `process.resourcesPath + app.asar` — do not hard-code production paths elsewhere.
- `better-sqlite3` is a compiled native dependency; packaging for other architectures may require rebuilding. See `rebuild_better_sqlite3.sh` at repo root.

**Examples agents may need to modify or reference**

- Add an IPC handler: follow pattern in [src/main/ipcHandlers/items.ts](src/main/ipcHandlers/items.ts#L1-L200) and register it in [src/main/main.ts](src/main/main.ts#L1).
- Run a migration: add `.sql` to `src/main/db/migrations/` (files are applied in alphabetical order). `runMigrations()` inserts applied filenames into the `migrations` table.
- Call from renderer during testing: use `window.api.getAllItems()` or `ipcRenderer.invoke('items:getAll')` in a unit test of the preload bridge.

If anything in this file is unclear or you'd like more examples (e.g., a small PR template for migrations or a checklist for packaging native modules), tell me which section to expand.
