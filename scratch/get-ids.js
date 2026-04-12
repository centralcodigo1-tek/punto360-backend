const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const company = await prisma.companies.findFirst();
    const branch = await prisma.branches.findFirst();
    const cat = await prisma.categories.findFirst();

    console.log({ 
        company_id: company?.id, 
        branch_id: branch?.id,
        category_id: cat?.id
    });
}
main();
