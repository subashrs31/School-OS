import prisma from '../lib/prisma';
import logger from '../utils/logger';

export const connectDB = async (): Promise<void> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info('PostgreSQL connected successfully');
  } catch (err) {
    logger.error(`Error connecting to PostgreSQL: ${(err as Error).message}`);
    process.exit(1);
  }
};

export { prisma };
