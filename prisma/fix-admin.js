const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  const companyId = 'c365ee81-4378-4650-91ef-6acb7e6490b3';
  const userId = '1a32561b-f636-46ac-b0c0-09facdd42d92';

  console.log('🚀 Corrigiendo accesos para Andrea Garcia...');

  // 1. Asegurar que el rol ADMIN tenga todos los permisos
  const adminRole = await prisma.roles.upsert({
    where: { id: (await prisma.roles.findFirst({ where: { company_id: companyId, name: 'ADMIN' } }))?.id || '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: { name: 'ADMIN', company_id: companyId }
  });

  const allPerms = await prisma.permissions.findMany();
  for (const p of allPerms) {
    await prisma.role_permissions.upsert({
      where: { role_id_permission_id: { role_id: adminRole.id, permission_id: p.id } },
      update: {},
      create: { role_id: adminRole.id, permission_id: p.id }
    });
  }

  // 2. Asignar este rol al usuario
  await prisma.user_roles.upsert({
    where: { user_id_role_id: { user_id: userId, role_id: adminRole.id } },
    update: {},
    create: { user_id: userId, role_id: adminRole.id }
  });

  console.log('✅ Andrea Garcia ahora es ADMIN con todos los permisos.');
  process.exit(0);
}

fix();
