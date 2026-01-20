import bcrypt from "bcryptjs";

import { db } from "../db/database";

/**
 * Seed the development database with initial data
 */

export function seedDevDatabase() {
  console.log("🌱 Seeding database (SQLite)...");

  const run = db.transaction(() => {
    // --- CLEAN DATABASE (DEV ONLY) ---
    db.exec(`
      DELETE FROM SaleItem;
      DELETE FROM Sale;
      DELETE FROM StockMovement;
      DELETE FROM Item;
      DELETE FROM Category;
      DELETE FROM User;
    `);

    // --- PASSWORDS ---
    const adminHash = bcrypt.hashSync("admin123", 10);
    const staffHash = bcrypt.hashSync("staff123", 10);

    // --- USERS ---
    const insertUser = db.prepare(`
      INSERT INTO User (name, email, passwordHash, role)
      VALUES (?, ?, ?, ?)
    `);

    const adminId = insertUser.run(
      "Habib Gündüz",
      "habib@gunduz.com",
      adminHash,
      "admin",
    ).lastInsertRowid as number;

    const staffId = insertUser.run(
      "Ahmet Yılmaz",
      "ahmet@yilmaz.com",
      staffHash,
      "staff",
    ).lastInsertRowid as number;

    // --- CATEGORIES ---
    const insertCategory = db.prepare(`
      INSERT INTO Category (name) VALUES (?)
    `);

    const makinelerId = insertCategory.run("Olta Makineleri")
      .lastInsertRowid as number;
    const misinalarId = insertCategory.run("Misinalar")
      .lastInsertRowid as number;
    const kamislarId = insertCategory.run("Olta Kamışları")
      .lastInsertRowid as number;
    const aksesuarlarId = insertCategory.run("Aksesuarlar")
      .lastInsertRowid as number;

    // --- ITEMS ---
    const insertItem = db.prepare(`
      INSERT INTO Item (
        barcode, name, brand, model, categoryId,
        currentPrice, stockQuantity, minStockThreshold
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const makineId = insertItem.run(
      "869100000001",
      "Spin Olta Makinesi",
      "Shimano",
      "FX 2500",
      makinelerId,
      4200,
      8,
      2,
    ).lastInsertRowid as number;

    const misinaId = insertItem.run(
      "869100000002",
      "Naylon Misina",
      "Sufix",
      "XL Strong 0.35mm",
      misinalarId,
      180,
      40,
      10,
    ).lastInsertRowid as number;

    const kamisId = insertItem.run(
      "869100000003",
      "Spin Olta Kamışı",
      "Remixon",
      "Apollo 240cm",
      kamislarId,
      1250,
      12,
      3,
    ).lastInsertRowid as number;

    insertItem.run(
      "869100000004",
      "Kurşun Seti",
      "Lineaeffe",
      null,
      aksesuarlarId,
      95,
      60,
      15,
    );

    // --- SALE ---
    const saleId = db
      .prepare(
        `
      INSERT INTO Sale (soldById, totalAmount)
      VALUES (?, ?)
    `,
      )
      .run(staffId, 4380).lastInsertRowid as number;

    const insertSaleItem = db.prepare(`
      INSERT INTO SaleItem (
        saleId, itemId, itemName, barcode,
        quantity, unitPrice, totalPrice
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertSaleItem.run(
      saleId,
      makineId,
      "Spin Olta Makinesi",
      "869100000001",
      1,
      4200,
      4200,
    );

    insertSaleItem.run(
      saleId,
      misinaId,
      "Naylon Misina",
      "869100000002",
      1,
      180,
      180,
    );

    // --- STOCK MOVEMENTS ---
    const insertMovement = db.prepare(`
      INSERT INTO StockMovement (
        itemId, changeQuantity, reason, referenceId
      )
      VALUES (?, ?, ?, ?)
    `);

    insertMovement.run(makineId, -1, "sale", saleId);
    insertMovement.run(misinaId, -1, "sale", saleId);
  });

  run();

  console.log("✅ Seed completed successfully");
  console.log("🔐 DEV CREDENTIALS:");
  console.log("Admin → habib@gunduz.com / admin123");
  console.log("Staff → ahmet@yilmaz.com / staff123");
}
