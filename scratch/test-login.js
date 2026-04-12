const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function testLogin() {
  const email = 'ing.joseramirezgarcia@gmail.com';
  const password = 'password123';

  console.log(`🧪 Probando login para: ${email}...`);

  const user = await prisma.users.findUnique({
    where: { email }
  });

  if (!user) {
    console.log('❌ Usuario no encontrado en la DB.');
    process.exit(1);
  }

  console.log('✅ Usuario encontrado.');

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  
  if (isPasswordValid) {
    console.log('✅ CONTRASEÑA CORRECTA.');
  } else {
    console.log('❌ CONTRASEÑA INCORRECTA.');
    console.log('Hash en DB:', user.password_hash);
  }
  
  process.exit(0);
}

testLogin();
