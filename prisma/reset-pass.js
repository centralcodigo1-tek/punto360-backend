const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function reset() {
  const email = 'ing.joseramirezgarcia@gmail.com';
  const newPassword = 'password123';
  const hash = await bcrypt.hash(newPassword, 10);

  console.log(`🔄 Reseteando usuario: ${email}...`);

  const user = await prisma.users.update({
    where: { email },
    data: { 
      password_hash: hash,
      is_active: true
    }
  });

  console.log('✅ Contraseña reseteada con éxito.');
  console.log(`🔑 Nueva contraseña: ${newPassword}`);
  process.exit(0);
}

reset();
