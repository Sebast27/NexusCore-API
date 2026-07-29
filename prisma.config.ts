import 'dotenv/config';
import { defineConfig } from '@prisma/config';

const databaseUrl = process.env.DATABASE_URL || '';

export default defineConfig({
  // Configuración del cliente para el adaptador
  client: databaseUrl ? {
    adapter: {
      name: '@prisma/adapter-pg',
      options: {
        connectionString: databaseUrl,
      },
    },
  } : undefined,
  
  // Configuración para las migraciones (la clave es "datasources" en plural)
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
  
  // Configuración de semillas
  migrations: {
    seed: 'ts-node prisma/seed.ts',
  },
});