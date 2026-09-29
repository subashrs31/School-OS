// Sequelize's create()/update() silently dropped unknown keys and coerced strings to column types.
// Prisma rejects both, so request bodies are passed through here before reaching Prisma.
// Column types are inferred from this schema's naming conventions; test/unit/modelData.test.ts checks every
// Int / Boolean / DateTime column in prisma/schema.prisma against them.

type Kind = 'Int' | 'Boolean' | 'DateTime' | 'Other';

const INT_NAMES = new Set(['id', 'capacity', 'displayOrder', 'priority', 'attempts', 'maxAttempts', 'assignedBy', 'enteredBy']);
const BOOLEAN_NAMES = new Set(['pwdResetStatus', 'resolved']);
const DATE_NAMES = new Set(['lastLogin', 'retryAfter', 'startDate', 'endDate', 'examDate', 'joiningDate', 'dateOfBirth', 'admissionDate']);

export const fieldKind = (name: string): Kind => {
  if (INT_NAMES.has(name) || name.endsWith('Id')) return 'Int';
  if (BOOLEAN_NAMES.has(name) || /^is[A-Z]/.test(name)) return 'Boolean';
  if (DATE_NAMES.has(name) || name.endsWith('At') || name.endsWith('Expiry')) return 'DateTime';
  return 'Other';
};

const NEVER_FROM_BODY = new Set(['id', 'createdAt', 'updatedAt']);

const coerce = (kind: Kind, value: unknown): unknown => {
  if (value === null) return null;
  if (kind === 'Int') {
    if (value === '') return null;
    if (typeof value === 'string' && /^-?\d+$/.test(value.trim())) return Number(value);
    return value;
  }
  if (kind === 'Boolean') {
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return value;
  }
  if (kind === 'DateTime') {
    if (value === '') return null;
    if (typeof value === 'string') return new Date(value);
    return value;
  }
  return value;
};

/**
 * Keeps only the scalar columns listed in a Prisma `<Model>ScalarFieldEnum`, drops id/createdAt/updatedAt,
 * omits undefined values (so partial updates stay partial) and coerces values to the column type.
 */
export const modelData = (fields: Record<string, string>, body: Record<string, unknown>): Record<string, any> => {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(fields)) {
    if (NEVER_FROM_BODY.has(key) || body[key] === undefined) continue;
    out[key] = coerce(fieldKind(key), body[key]);
  }
  return out;
};
