import dotenv from 'dotenv';
dotenv.config();

import { connectDB, prisma } from '../config/db';
import { tasks } from './kernel';

const [,, signature] = process.argv;

(async () => {
  if (!signature) {
    const available = tasks.map(t => t.signature).join(', ');
    console.log(`\nUsage: npm run cron:run -- <signature>\n\nAvailable:\n  ${available}\n`);
    process.exit(0);
  }

  const entry = tasks.find(t => t.signature === signature);
  if (!entry) {
    const available = tasks.map(t => t.signature).join(', ');
    console.error(`\nUnknown signature: "${signature}"\nAvailable: ${available}\n`);
    process.exit(1);
  }

  try {
    await connectDB();
    console.log(`[CronRunner] Executing "${signature}"...`);
    await entry.task();
    console.log('[CronRunner] Done.');
  } catch (err) {
    console.error('[CronRunner] Failed:', (err as Error).message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
