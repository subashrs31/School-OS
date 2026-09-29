import { Prisma } from '../generated/prisma/client';

// Columns stored as PostgreSQL DATE (`@db.Date`). Prisma returns them as JS Dates at midnight UTC; the former
// MySQL/Sequelize API returned "YYYY-MM-DD" strings, which the frontend expects. These names are used only by
// date-only columns in prisma/schema.prisma.
const DATE_ONLY_FIELDS = new Set(['startDate', 'endDate', 'examDate', 'joiningDate', 'dateOfBirth', 'admissionDate']);

/**
 * Converts Prisma results to the JSON shape the API returned under Sequelize:
 * date-only columns → "YYYY-MM-DD", Decimal(5,2) → "80.00". Everything else is left for JSON.stringify.
 */
export const serializeForJson = (value: unknown, key?: string): unknown => {
  if (value === null || value === undefined) return value;
  if (value instanceof Date) {
    return key && DATE_ONLY_FIELDS.has(key) ? value.toISOString().slice(0, 10) : value;
  }
  if (Prisma.Decimal.isDecimal(value)) return (value as Prisma.Decimal).toFixed(2);
  if (Array.isArray(value)) return value.map((item) => serializeForJson(item));
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) out[k] = serializeForJson(v, k);
    return out;
  }
  return value;
};
