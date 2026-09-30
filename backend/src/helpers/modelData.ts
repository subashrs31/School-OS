// Sequelize's create()/update() silently dropped unknown keys and coerced strings to column types.
// Prisma rejects both, so request bodies are passed through here before reaching Prisma.
// Column types are inferred from this schema's naming conventions; test/unit/modelData.test.ts checks every
// Int / Boolean / DateTime column in prisma/schema.prisma against them.

type Kind = 'Int' | 'Boolean' | 'DateTime' | 'Other';

const INT_NAMES = new Set([
  'id', 'capacity', 'displayOrder', 'priority', 'attempts', 'maxAttempts', 'assignedBy', 'enteredBy',
  'accessVersion', 'statusChangedBy', 'onboardedBy', 'grantedBy', 'revokedBy',
]);
const BOOLEAN_NAMES = new Set(['pwdResetStatus', 'resolved']);
const DATE_NAMES = new Set([
  'lastLogin', 'retryAfter', 'startDate', 'endDate', 'examDate', 'joiningDate', 'dateOfBirth', 'admissionDate',
  'validFrom', 'validTo',
]);

export const fieldKind = (name: string): Kind => {
  if (INT_NAMES.has(name) || name.endsWith('Id')) return 'Int';
  if (BOOLEAN_NAMES.has(name) || /^is[A-Z]/.test(name)) return 'Boolean';
  if (DATE_NAMES.has(name) || name.endsWith('At') || name.endsWith('Expiry')) return 'DateTime';
  return 'Other';
};

// Never accepted from a request body: row identity, timestamps, and the system-managed columns added in 2.1
// (identity link, lifecycle bookkeeping, grant history, permission flags). The features that own them (Phases 4–5)
// set them explicitly in their services.
const NEVER_FROM_BODY = new Set([
  'id', 'createdAt', 'updatedAt',
  'publicId', 'identitySubject', 'accessVersion', 'accountPlane',
  'statusSource', 'statusReason', 'statusChangedAt', 'statusChangedBy', 'signupSource', 'onboardedBy', 'activatedAt',
  'validFrom', 'validTo', 'grantedBy', 'grantedAt', 'revokedAt', 'revokedBy', 'revokeReason',
  'module', 'isSensitive', 'isPlatformOnly',
]);

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
 * Keeps only the scalar columns listed in a Prisma `<Model>ScalarFieldEnum`, drops id/createdAt/updatedAt and the
 * system-managed columns, drops any per-call `exclude` names, omits undefined values (so partial updates stay
 * partial) and coerces values to the column type.
 */
export const modelData = (
  fields: Record<string, string>,
  body: Record<string, unknown>,
  exclude: readonly string[] = [],
): Record<string, any> => {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(fields)) {
    if (NEVER_FROM_BODY.has(key) || exclude.includes(key) || body[key] === undefined) continue;
    out[key] = coerce(fieldKind(key), body[key]);
  }
  return out;
};
