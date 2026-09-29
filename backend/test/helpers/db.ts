import prisma from '../../src/lib/prisma';
import DatabaseSeeder from '../../src/database/seeders/DatabaseSeeder';

/** Empties every application table in the test database (never the migration history). */
export const truncateAll = async (): Promise<void> => {
  const rows = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`;
  if (!rows.length) return;
  const tables = rows.map(r => `"public"."${r.tablename}"`).join(', ');
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE`);
};

/** Fresh database with the standard seed (roles, permissions, role mappings, the two demo users). */
export const resetAndSeed = async (): Promise<void> => {
  await truncateAll();
  const log = console.log;
  console.log = () => {};
  try {
    await DatabaseSeeder.run();
  } finally {
    console.log = log;
  }
};

export { prisma };
