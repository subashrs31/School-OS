import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db';

const DEFAULT_PASSWORD = '12345678';

(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const hash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    const { count } = await prisma.user.updateMany({ where: { deletedAt: null }, data: { password: hash } });
    console.log(`Done. Reset ${count} users to: ${DEFAULT_PASSWORD}`);
  } catch (err) {
    console.error('Error:', (err as Error).message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
