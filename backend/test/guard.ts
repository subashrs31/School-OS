/**
 * Returns the database URL tests are allowed to use, or throws.
 * Tests truncate tables, so they must never reach the development database.
 */
export const resolveTestDatabaseUrl = (env: Record<string, string | undefined>): string => {
  const testUrl = env.TEST_DATABASE_URL;
  if (!testUrl) {
    throw new Error('TEST_DATABASE_URL is not set. Add it to backend/.env (see .env.example).');
  }
  if (testUrl === env.DATABASE_URL) {
    throw new Error('TEST_DATABASE_URL must differ from DATABASE_URL; tests would wipe the development database.');
  }
  const dbName = new URL(testUrl).pathname.replace(/^\//, '');
  if (!dbName.endsWith('_test')) {
    throw new Error(`Test database name must end in "_test" (got "${dbName}").`);
  }
  return testUrl;
};
