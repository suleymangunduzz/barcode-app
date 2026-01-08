import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // --- CLEAN DATABASE (DEV ONLY) ---
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.item.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // --- PASSWORDS (DEV ONLY) ---
  const adminPassword = "admin123";
  const staffPassword = "staff123";

  const adminHash = await bcrypt.hash(adminPassword, 10);
  const staffHash = await bcrypt.hash(staffPassword, 10);

  // --- USERS ---
  const admin = await prisma.user.create({
    data: {
      name: "Habib Gündüz",
      email: "habib@gunduz.com",
      passwordHash: adminHash,
      role: "admin",
    },
  });

  const staff = await prisma.user.create({
    data: {
      name: "Ahmet Yılmaz",
      email: "ahmet@yilmaz.com",
      passwordHash: staffHash,
      role: "staff",
    },
  });

  // --- CATEGORIES ---
  const makineler = await prisma.category.create({
    data: { name: "Olta Makineleri" },
  });

  const misinalar = await prisma.category.create({
    data: { name: "Misinalar" },
  });

  const kamislar = await prisma.category.create({
    data: { name: "Olta Kamışları" },
  });

  const aksesuarlar = await prisma.category.create({
    data: { name: "Aksesuarlar" },
  });

  // --- ITEMS ---

  // Olta Makinesi
  const makine = await prisma.item.create({
    data: {
      barcode: "869100000001",
      name: "Spin Olta Makinesi",
      brand: "Shimano",
      model: "FX 2500",
      categoryId: makineler.id,
      currentPrice: 4200,
      stockQuantity: 8,
      minStockThreshold: 2,
    },
  });

  // Misina
  const misina = await prisma.item.create({
    data: {
      barcode: "869100000002",
      name: "Naylon Misina",
      brand: "Sufix",
      model: "XL Strong 0.35mm",
      categoryId: misinalar.id,
      currentPrice: 180,
      stockQuantity: 40,
      minStockThreshold: 10,
    },
  });

  // Olta Kamışı
  const kamis = await prisma.item.create({
    data: {
      barcode: "869100000003",
      name: "Spin Olta Kamışı",
      brand: "Remixon",
      model: "Apollo 240cm",
      categoryId: kamislar.id,
      currentPrice: 1250,
      stockQuantity: 12,
      minStockThreshold: 3,
    },
  });

  // Aksesuar
  const kursun = await prisma.item.create({
    data: {
      barcode: "869100000004",
      name: "Kurşun Seti",
      brand: "Lineaeffe",
      categoryId: aksesuarlar.id,
      currentPrice: 95,
      stockQuantity: 60,
      minStockThreshold: 15,
    },
  });

  // --- SAMPLE SALE ---
  const sale = await prisma.sale.create({
    data: {
      soldById: staff.id,
      totalAmount: 4200 + 180,
      saleItems: {
        create: [
          {
            itemId: makine.id,
            itemName: makine.name,
            barcode: makine.barcode,
            quantity: 1,
            unitPrice: 4200,
            totalPrice: 4200,
          },
          {
            itemId: misina.id,
            itemName: misina.name,
            barcode: misina.barcode,
            quantity: 1,
            unitPrice: 180,
            totalPrice: 180,
          },
        ],
      },
    },
  });

  // --- STOCK MOVEMENTS ---
  await prisma.stockMovement.createMany({
    data: [
      {
        itemId: makine.id,
        changeQuantity: -1,
        reason: "sale",
        referenceId: sale.id,
      },
      {
        itemId: misina.id,
        changeQuantity: -1,
        reason: "sale",
        referenceId: sale.id,
      },
    ],
  });

  console.log("✅ Seed completed successfully");
  console.log("🔐 DEV CREDENTIALS:");
  console.log("Admin → habib@gunduz.com / admin123");
  console.log("Staff → ahmet@yilmaz.com / staff123");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
