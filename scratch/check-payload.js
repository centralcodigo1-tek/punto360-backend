const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

async function checkToken() {
  const email = 'ing.joseramirezgarcia@gmail.com';
  const user = await prisma.users.findUnique({
    where: { email },
    include: {
      user_branches: true,
      user_roles: { include: { roles: true } }
    }
  });

  const branchIds = user.user_branches.map(ub => ub.branch_id);
  const permissions = []; // Simplified for check

  const payload = {
    sub: user.id,
    email: user.email,
    userName: user.name,
    role: user.user_roles[0]?.roles.name,
    companyId: user.company_id,
    branchIds,
    permissions,
  };

  console.log('📦 Mock Token Payload:');
  console.log(JSON.stringify(payload, null, 2));
  process.exit(0);
}

checkToken();
