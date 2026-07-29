import 'dotenv/config';
import { defineConfig } from '@prisma/config';

const databaseUrl = process.env.DATABASE_URL || '';

export default defineConfig({
  client: databaseUrl ? {
    adapter: {
      name: '@prisma/adapter-pg',
      options: {
        connectionString: databaseUrl,
      },
    },
  } : undefined,
  
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
  
  migrations: {
    seed: 'ts-node prisma/seed.ts',
  },
});