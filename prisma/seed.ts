import 'dotenv/config'; 
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const databaseUrl = process.env.DATABASE_URL!;

if (!databaseUrl) {
  throw new Error('DATABASE_URL no está definida');
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando seed...');
  console.log('📡 Conectando a:', databaseUrl);

  // Crear usuario admin por defecto
  const adminPassword = await bcrypt.hash('Admin123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@nexuscore.com' },
    update: {},
    create: {
      id: crypto.randomUUID(),
      email: 'admin@nexuscore.com',
      password: adminPassword,
      name: 'Administrador',
      role: Role.ADMIN,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    },
  });

  console.log('✅ Usuario admin creado:', admin.email);

  // Crear usuario editor
  const editorPassword = await bcrypt.hash('Editor123!', 10);

  const editor = await prisma.user.upsert({
    where: { email: 'editor@nexuscore.com' },
    update: {},
    create: {
      id: crypto.randomUUID(),
      email: 'editor@nexuscore.com',
      password: editorPassword,
      name: 'Editor',
      role: Role.EDITOR,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    },
  });

  console.log('✅ Usuario editor creado:', editor.email);

  // Crear usuario viewer
  const viewerPassword = await bcrypt.hash('Viewer123!', 10);

  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@nexuscore.com' },
    update: {},
    create: {
      id: crypto.randomUUID(),
      email: 'viewer@nexuscore.com',
      password: viewerPassword,
      name: 'Visualizador',
      role: Role.VIEWER,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
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