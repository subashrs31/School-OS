import { describe, it, expect } from 'vitest';
import { resolveTestDatabaseUrl } from '../guard';

describe('resolveTestDatabaseUrl', () => {
  const dev = 'postgresql://u:p@localhost:5432/school_os';
  const test = 'postgresql://u:p@localhost:5432/school_os_test';

  it('returns the test URL when it is set and differs from DATABASE_URL', () => {
    expect(resolveTestDatabaseUrl({ DATABASE_URL: dev, TEST_DATABASE_URL: test })).toBe(test);
  });

  it('refuses when TEST_DATABASE_URL is missing', () => {
    expect(() => resolveTestDatabaseUrl({ DATABASE_URL: dev })).toThrow(/TEST_DATABASE_URL is not set/);
  });

  it('refuses when TEST_DATABASE_URL is empty', () => {
    expect(() => resolveTestDatabaseUrl({ DATABASE_URL: dev, TEST_DATABASE_URL: '' })).toThrow(/TEST_DATABASE_URL is not set/);
  });

  it('refuses when TEST_DATABASE_URL points at the dev database', () => {
    expect(() => resolveTestDatabaseUrl({ DATABASE_URL: dev, TEST_DATABASE_URL: dev })).toThrow(/must differ from DATABASE_URL/);
  });

  it('refuses when the test database name does not end in _test', () => {
    const other = 'postgresql://u:p@localhost:5432/school_os_copy';
    expect(() => resolveTestDatabaseUrl({ DATABASE_URL: dev, TEST_DATABASE_URL: other })).toThrow(/must end in "_test"/);
  });
});
