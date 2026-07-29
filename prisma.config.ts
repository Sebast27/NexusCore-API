import { PrismaPg } from '@prisma/adapter-pg';
import { defineConfig } from 'prisma/config';

const databaseUrl = process.env.DATABASE_URL!;

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

export default defineConfig({
  migrations: {
    seed: 'ts-node prisma/seed.ts',
  },
  datasource: {
    url: databaseUrl,
  },
});