const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const p = await prisma.$transaction(async (tx) => {
        const product = await tx.products.create({
            data: {
                name: "Mora Test 2",
                sku: "TEST-002",
                category_id: "c4d45d84-16f8-46bd-87dd-86d3acf20310",
                cost_price: 800,
                sale_price: 1500,
                unit_type: "WEIGHT",
                is_active: true,
                company_id: "c365ee81-4378-4650-91ef-6acb7e6490b3",
            },
        });

        await tx.stock.create({
            data: {
                product_id: product.id,
                branch_id: "fa1f4eed-ecce-4bd5-bace-373e3c703f73",
                quantity: 12.5,
            },
        });
        return product;
    });
    console.log("Success:", p);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
