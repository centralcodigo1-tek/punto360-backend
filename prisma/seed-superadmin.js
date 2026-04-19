const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

// ─── CONFIGURA AQUÍ TUS DATOS ───────────────────────────────
const SUPERADMIN_EMAIL    = 'joseramirezgarcia325@gmail.com';
const SUPERADMIN_NAME     = 'Jose Ramirez';
const SUPERADMIN_USERNAME = 'SuperAdmin';
const SUPERADMIN_PASSWORD = 'Punto360_2024!';
// ────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 Creando usuario SuperAdmin...');

  const role = await prisma.roles.upsert({
    where: { id: '00000000-0000-0000-0000-000000000099' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000099',
      name: 'SUPERADMIN',
      company_id: null,
    },
  });

  const password_hash = await bcrypt.hash(SUPERADMIN_PASSWORD, 10);

  const user = await prisma.users.upsert({
    where: { email: SUPERADMIN_EMAIL },
    update: { password_hash },
    create: {
      name:          SUPERADMIN_NAME,
      user_name:     SUPERADMIN_USERNAME,
      email:         SUPERADMIN_EMAIL,
      password_hash,
      company_id:    null,
      is_active:     true,
    },
  });

  await prisma.user_roles.upsert({
    where: { user_id_role_id: { user_id: user.id, role_id: role.id } },
    update: {},
    create: { user_id: user.id, role_id: role.id },
  });

  console.log('✅ SuperAdmin listo');
  console.log('');
  console.log('─────────────────────────────────────');
  console.log('  Email:    ', SUPERADMIN_EMAIL);
  console.log('  Password: ', SUPERADMIN_PASSWORD);
  console.log('─────────────────────────────────────');
}

main()
  .catch(e => { console.error('❌', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
