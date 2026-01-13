-- CreateTable
CREATE TABLE "SyncQueue" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tableName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "recordId" INTEGER,
    "payload" TEXT NOT NULL,
    "synced" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "SyncQueue_synced_createdAt_id_idx" ON "SyncQueue"("synced", "createdAt", "id");
