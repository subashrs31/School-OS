import 'dotenv/config';
import { prisma } from '../config/db';
import DatabaseSeeder from './seeders/DatabaseSeeder';

// Truncatable models → PostgreSQL tables. The schema itself is managed only by Prisma migrations
// (the former `sequelize.sync({ alter: true })` is gone — see docs/prisma-migrations.md).
const MODELS: Record<string, string> = {
  User: 'users',
  Role: 'roles',
  Permission: 'permissions',
  UserHasRole: 'user_has_roles',
  UserHasPermission: 'user_has_permissions',
  RoleHasPermission: 'role_has_permissions',
};

const SEEDERS: Record<string, { run: () => Promise<void> }> = DatabaseSeeder.seeders.reduce(
  (acc, { name, seeder }) => { acc[name] = seeder; return acc; },
  {} as Record<string, { run: () => Promise<void> }>
);

const connect = async (): Promise<void> => {
  await prisma.$queryRaw`SELECT 1`;
  console.log('PostgreSQL connected');
};

const disconnect = async (): Promise<void> => {
  await prisma.$disconnect();
  console.log('PostgreSQL disconnected');
};

const seedAll = async (): Promise<void> => {
  console.log('\n--- Running DatabaseSeeder ---');
  await DatabaseSeeder.run();
  console.log('\nSeeding complete.\n');
};

const seedSpecific = async (names: string[]): Promise<void> => {
  console.log('\n--- Seeding specific ---');
  for (const name of names) {
    if (!SEEDERS[name]) { console.warn(`Unknown seeder: "${name}". Available: ${Object.keys(SEEDERS).join(', ')}`); continue; }
    console.log(`\n[${name}]`);
    await SEEDERS[name].run();
  }
  console.log('\nSeeding complete.\n');
};

// Table names come only from the MODELS map above, never from user input.
const truncate = (table: string, cascade: boolean) =>
  prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" RESTART IDENTITY${cascade ? ' CASCADE' : ''}`);

const truncateAll = async (): Promise<void> => {
  console.log('\n--- Truncating all ---');
  for (const [name, table] of Object.entries(MODELS)) {
    await truncate(table, true);
    console.log(`  ${name}: truncated`);
  }
  console.log('Truncate complete.\n');
};

const truncateModel = async (names: string[]): Promise<void> => {
  console.log('\n--- Truncating specific ---');
  for (const name of names) {
    const table = MODELS[name];
    if (!table) { console.warn(`Unknown model: "${name}". Available: ${Object.keys(MODELS).join(', ')}`); continue; }
    // MySQL ran with FOREIGN_KEY_CHECKS = 0; PostgreSQL needs CASCADE to truncate a referenced table.
    await truncate(table, true);
    console.log(`  ${name}: truncated`);
  }
  console.log('Truncate complete.\n');
};

const [,, command, ...args] = process.argv;

(async () => {
  try {
    await connect();

    if      (command === 'seed' && !args.length)  await seedAll();
    else if (command === 'seed' && args.length)   await seedSpecific(args);
    else if (command === 'seed:specific')          await seedSpecific(args);
    else if (command === 'truncate:all')           await truncateAll();
    else if (command === 'truncate:model')         await truncateModel(args);
    else console.log(`\nUsage:\n  npx ts-node seeder.ts seed\n  npx ts-node seeder.ts seed:specific RoleSeeder\n  npx ts-node seeder.ts truncate:all\n  npx ts-node seeder.ts truncate:model User\n\nAvailable seeders: ${Object.keys(SEEDERS).join(', ')}\nAvailable models:  ${Object.keys(MODELS).join(', ')}\n`);
  } catch (err) {
    console.error('Error:', (err as Error).message);
    process.exit(1);
  } finally {
    await disconnect();
  }
})();
