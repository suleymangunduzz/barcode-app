# Copilot Instructions for Barcode App

## Architecture Overview

- **Monorepo**: Two main packages: `electron/` (backend, IPC, DB) and `renderer/` (React UI)
- **Electron**: Handles IPC, database (Prisma/SQLite), and exposes APIs to the renderer via `preload.ts`.
- **Renderer**: React + Vite app, uses TypeScript, Tailwind, i18n, and communicates with Electron via `window.api`.
- **Database**: Prisma ORM with SQLite, schema in `electron/prisma/schema.prisma`. Types auto-generated to `renderer/src/types/prisma.ts`.

## Key Workflows

- **Install all deps**: `npm run install:all` (root)
- **Start dev (both apps)**: `npm run dev` (root, runs both Electron and Renderer)
- **Build renderer**: `npm run build` in `renderer/`
- **Build electron**: `npm run build:electron` (root)
- **Prisma migration**: `npm run prisma:migrate` (root)
- **Seed DB**: `npm run prisma:seed` (root)
- **View DB**: `npm run view:db` (root, opens Prisma Studio)
- **Generate TS types from Prisma**: `npm run generate:types` (root)

## Project Conventions

- **IPC/DB logic**: All DB and business logic is in `electron/ipcHandlers/` and `electron/auth/`.
- **API surface**: Only expose APIs via `preload.ts` and `window.api` (see `renderer/global.d.ts` for typings).
- **Type safety**: Use auto-generated types from Prisma for all DB entities in the renderer.
- **UI**: Use Tailwind for all styling. Use i18n (`react-i18next`) for all user-facing text.
- **Component structure**: Pages in `renderer/src/*Page/`, shared components in `renderer/src/components/`.
- **Barcode logic**: Barcode generation/validation in `renderer/src/utils/`.
- **Admin/staff roles**: Enforced in backend (see session logic in `electron/auth/session.ts`).

## Patterns & Examples

- **IPC handler registration**: See `electron/main.ts` for all handler registration.
- **Adding new API**: Add handler in `electron/ipcHandlers/`, expose in `preload.ts`, type in `renderer/global.d.ts`.
- **DB migrations**: Update `electron/prisma/schema.prisma`, run migration, then regenerate types.
- **Translations**: Add keys to `renderer/src/translations/en.json` and `tr.json`.
- **Cart logic**: See `renderer/src/utils/cart.ts` and usage in `App.tsx`/`Dashboard.tsx`.

## Integration Points

- **Prisma**: Used in Electron only. Never import Prisma client in renderer.
- **IPC**: All cross-process comms via `window.api` (never direct DB access from renderer).
- **Type generation**: `scripts/generate-prisma-types.ts` parses Prisma schema to TS types for renderer.

## Quick Reference

- **Key files**:
  - `electron/main.ts`, `preload.ts`, `prisma/schema.prisma`, `renderer/global.d.ts`, `renderer/src/types/prisma.ts`
- **Add DB field**: Update schema, migrate, regenerate types, update handlers, update UI.
- **Add UI page**: Create in `renderer/src/*Page/`, add to sidebar in `renderer/src/components/SideBar.tsx`.

---

For more, see the [README.md](../../README.md) and comments in key files.
