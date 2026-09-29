import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

// Prisma 7 reads its datasource URL from here, not from schema.prisma, and does not load .env by itself.
// Migration commands (migrate dev / deploy / reset) are run by the project owner — see docs/prisma-migrations.md.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'ts-node src/database/seeder.ts seed',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
