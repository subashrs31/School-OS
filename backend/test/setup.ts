import dotenv from 'dotenv';
import { resolveTestDatabaseUrl } from './guard';

dotenv.config({ quiet: true });

// Every test process talks to the test database only. The guard throws before anything
// connects if TEST_DATABASE_URL is missing or points at the development database.
process.env.DATABASE_URL = resolveTestDatabaseUrl(process.env);
process.env.NODE_ENV = 'local';
