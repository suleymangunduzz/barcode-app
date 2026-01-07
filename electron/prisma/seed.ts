import { PrismaClient } from "@prisma/client";

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

  // --- USERS ---
  const admin = await prisma.user.create({
    data: {
      name: "Habib Gündüz",
      email: "habib@gunduz.com",
      passwordHash: "hashed-password-placeholder",
      role: "admin",
    },
  });

  const staff = await prisma.user.create({
    data: {
      name: "Ahmet Yılmaz",
      email: "ahmet@yilmaz.com",
      passwordHash: "hashed-password-placeholder",
      role: "staff",
    },
  });

  // --- CATEGORIES ---
  const elektronik = await prisma.category.create({
    data: { name: "Elektronik" },
  });

  const kirtasiye = await prisma.category.create({
    data: { name: "Kırtasiye" },
  });

  // --- ITEMS ---
  const laptop = await prisma.item.create({
    data: {
      barcode: "869000000001",
      name: "Laptop",
      brand: "Lenovo",
      model: "ThinkPad E14",
      categoryId: elektronik.id,
      currentPrice: 32000,
      stockQuantity: 10,
      minStockThreshold: 2,
    },
  });

  const mouse = await prisma.item.create({
    data: {
      barcode: "869000000002",
      name: "Kablosuz Mouse",
      brand: "Logitech",
      model: "M185",
      categoryId: elektronik.id,
      currentPrice: 450,
      stockQuantity: 50,
      minStockThreshold: 10,
    },
  });

  const defter = await prisma.item.create({
    data: {
      barcode: "869000000003",
      name: "A4 Defter",
      brand: "Gıpta",
      categoryId: kirtasiye.id,
      currentPrice: 35,
      stockQuantity: 100,
      minStockThreshold: 20,
    },
  });

  // --- SAMPLE SALE ---
  const sale = await prisma.sale.create({
    data: {
      soldById: staff.id,
      totalAmount: 450 + 35,
      saleItems: {
        create: [
          {
            itemId: mouse.id,
            itemName: mouse.name,
            barcode: mouse.barcode,
            quantity: 1,
            unitPrice: 450,
            totalPrice: 450,
          },
          {
            itemId: defter.id,
            itemName: defter.name,
            barcode: defter.barcode,
            quantity: 1,
            unitPrice: 35,
            totalPrice: 35,
          },
        ],
      },
    },
  });

  // --- STOCK MOVEMENTS ---
  await prisma.stockMovement.createMany({
    data: [
      {
        itemId: mouse.id,
        changeQuantity: -1,
        reason: "sale",
        referenceId: sale.id,
      },
      {
        itemId: defter.id,
        changeQuantity: -1,
        reason: "sale",
        referenceId: sale.id,
      },
    ],
  });

  console.log("✅ Seed completed successfully");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
