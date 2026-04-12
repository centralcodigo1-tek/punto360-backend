const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const sales = await prisma.sales.findMany({
        orderBy: { created_at: 'desc' },
        take: 5
    });

    console.log(JSON.stringify(sales, null, 2));
}
main();
