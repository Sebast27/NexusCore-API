import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Crear usuario admin por defecto
  const adminPassword = await bcrypt.hash('Admin123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@nexuscore.com' },
    update: {},
    create: {
      email: 'admin@nexuscore.com',
      password: adminPassword,
      name: 'Administrador',
      role: Role.ADMIN,
    },
  });

  console.log('✅ Usuario admin creado:', admin.email);

  // Crear usuario editor
  const editorPassword = await bcrypt.hash('Editor123!', 10);

  const editor = await prisma.user.upsert({
    where: { email: 'editor@nexuscore.com' },
    update: {},
    create: {
      email: 'editor@nexuscore.com',
      password: editorPassword,
      name: 'Editor',
      role: Role.EDITOR,
    },
  });

  console.log('✅ Usuario editor creado:', editor.email);

  // Crear usuario viewer
  const viewerPassword = await bcrypt.hash('Viewer123!', 10);

  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@nexuscore.com' },
    update: {},
    create: {
      email: 'viewer@nexuscore.com',
      password: viewerPassword,
      name: 'Visualizador',
      role: Role.VIEWER,
    },
  });

  console.log('✅ Usuario viewer creado:', viewer.email);

  console.log('🌱 Seed completado!');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });