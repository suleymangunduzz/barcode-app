PRAGMA foreign_keys = ON;

/* =========================
   User
========================= */
CREATE TABLE IF NOT EXISTS User (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  passwordHash TEXT NOT NULL,
  role TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

/* =========================
   Category
========================= */
CREATE TABLE IF NOT EXISTS Category (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

/* =========================
   Item
========================= */
CREATE TABLE IF NOT EXISTS Item (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  barcode TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  categoryId INTEGER,
  currentPrice REAL NOT NULL,
  stockQuantity INTEGER NOT NULL DEFAULT 0,
  minStockThreshold INTEGER NOT NULL DEFAULT 0,
  imagePath TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (categoryId) REFERENCES Category(id) ON DELETE SET NULL
);

/* =========================
   StockMovement
========================= */
CREATE TABLE IF NOT EXISTS StockMovement (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  itemId INTEGER NOT NULL,
  changeQuantity INTEGER NOT NULL,
  reason TEXT NOT NULL,
  referenceId INTEGER,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (itemId) REFERENCES Item(id) ON DELETE CASCADE
);

/* =========================
   Sale
========================= */
CREATE TABLE IF NOT EXISTS Sale (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  totalAmount REAL NOT NULL,
  soldById INTEGER,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (soldById) REFERENCES User(id) ON DELETE SET NULL
);

/* =========================
   SaleItem
========================= */
CREATE TABLE IF NOT EXISTS SaleItem (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  saleId INTEGER NOT NULL,
  itemId INTEGER NOT NULL,
  itemName TEXT NOT NULL,
  barcode TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unitPrice REAL NOT NULL,
  totalPrice REAL NOT NULL,
  FOREIGN KEY (saleId) REFERENCES Sale(id) ON DELETE CASCADE,
  FOREIGN KEY (itemId) REFERENCES Item(id)
);

/* =========================
   SyncQueue
========================= */
CREATE TABLE IF NOT EXISTS SyncQueue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tableName TEXT NOT NULL,
  action TEXT NOT NULL,
  recordId INTEGER,
  payload TEXT NOT NULL,
  synced INTEGER NOT NULL DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

/* =========================
   Indexes
========================= */
CREATE INDEX IF NOT EXISTS idx_syncqueue_synced_createdAt_id
  ON SyncQueue (synced, createdAt, id);
