-- Migration: add ReportSchedule table
CREATE TABLE IF NOT EXISTS ReportSchedule (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  email TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 0,
  subject TEXT,
  lastRunAt DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
