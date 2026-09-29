import 'dotenv/config';
import { sequelize } from '../config/db';
import { User, Role, Permission, UserHasRole, UserHasPermission, RoleHasPermission } from '../models/index';
import DatabaseSeeder from './seeders/DatabaseSeeder';

const MODELS: Record<string, { truncate: (opts?: object) => Promise<void> }> = {
  User, Role, Permission, UserHasRole, UserHasPermission, RoleHasPermission,
};

const SEEDERS: Record<string, { run: () => Promise<void> }> = DatabaseSeeder.seeders.reduce(
  (acc, { name, seeder }) => { acc[name] = seeder; return acc; },
  {} as Record<string, { run: () => Promise<void> }>
);

const connect = async (): Promise<void> => {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });
  console.log('MySQL connected');
};

const disconnect = async (): Promise<void> => {
  await sequelize.close();
  console.log('MySQL disconnected');
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

const truncateAll = async (): Promise<void> => {
  console.log('\n--- Truncating all ---');
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
  for (const [name, model] of Object.entries(MODELS)) {
    await model.truncate({ cascade: true, force: true });
    console.log(`  ${name}: truncated`);
  }
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
  console.log('Truncate complete.\n');
};

const truncateModel = async (names: string[]): Promise<void> => {
  console.log('\n--- Truncating specific ---');
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
  for (const name of names) {
    const model = MODELS[name];
    if (!model) { console.warn(`Unknown model: "${name}". Available: ${Object.keys(MODELS).join(', ')}`); continue; }
    await model.truncate({ force: true });
    console.log(`  ${name}: truncated`);
  }
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
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
