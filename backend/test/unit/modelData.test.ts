import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';
import { Prisma } from '../../src/generated/prisma/client';
import { modelData, fieldKind } from '../../src/helpers/modelData';

describe('modelData', () => {
  it('keeps only real columns of the model, like Sequelize create/update ignored unknown keys', () => {
    const data = modelData(Prisma.BranchScalarFieldEnum, { name: 'Main', code: 'M', unknown: 'x', Sections: [] });
    expect(data).toEqual({ name: 'Main', code: 'M' });
  });

  it('never lets the body set id, createdAt or updatedAt', () => {
    const data = modelData(Prisma.BranchScalarFieldEnum, { id: 9, createdAt: '2020-01-01', updatedAt: '2020-01-01', name: 'A' });
    expect(data).toEqual({ name: 'A' });
  });

  it('coerces numeric strings for Int columns and "" to null (Sequelize coerced these)', () => {
    const data = modelData(Prisma.StaffScalarFieldEnum, { designationId: '4', branchId: '' });
    expect(data).toEqual({ designationId: 4, branchId: null });
  });

  it('coerces "true"/"false" for Boolean columns', () => {
    expect(modelData(Prisma.BranchScalarFieldEnum, { isActive: 'false' })).toEqual({ isActive: false });
  });

  it('turns date strings into Dates and "" into null', () => {
    const data = modelData(Prisma.StudentScalarFieldEnum, { dateOfBirth: '2012-01-09', admissionDate: '' });
    expect(data.dateOfBirth).toEqual(new Date('2012-01-09T00:00:00.000Z'));
    expect(data.admissionDate).toBeNull();
  });

  it('leaves undefined keys out so partial updates stay partial', () => {
    expect(modelData(Prisma.BranchScalarFieldEnum, { name: undefined, code: 'X' })).toEqual({ code: 'X' });
  });

  // 2.1: columns managed by the system (identity link, lifecycle bookkeeping, grants) are never taken from bodies.
  it('never takes system-managed columns from the body', () => {
    const fields = {
      name: 'name', publicId: 'publicId', identitySubject: 'identitySubject', accessVersion: 'accessVersion',
      accountPlane: 'accountPlane', statusSource: 'statusSource', signupSource: 'signupSource', onboardedBy: 'onboardedBy',
      grantedBy: 'grantedBy', revokedAt: 'revokedAt', isPlatformOnly: 'isPlatformOnly', module: 'module',
    };
    const body = {
      name: 'Alpha', publicId: '00000000-0000-0000-0000-000000000000', identitySubject: 'ls-1', accessVersion: 99,
      accountPlane: 'PLATFORM', statusSource: 'SUBSCRIPTION', signupSource: 'SELF_SERVICE', onboardedBy: 1,
      grantedBy: 1, revokedAt: '2026-01-01', isPlatformOnly: true, module: 'x',
    };
    expect(modelData(fields, body)).toEqual({ name: 'Alpha' });
  });

  it('drops the extra per-call exclusions', () => {
    expect(modelData({ name: 'name', status: 'status' }, { name: 'A', status: 'CLOSED' }, ['status'])).toEqual({ name: 'A' });
  });

  it('still accepts a column named status when not excluded (staff, students)', () => {
    expect(modelData({ status: 'status' }, { status: 'on_leave' })).toEqual({ status: 'on_leave' });
  });
});

describe('fieldKind naming conventions match prisma/schema.prisma', () => {
  // Guards the naming conventions modelData relies on: every Int / Boolean / DateTime column in the
  // schema must be classified accordingly. Adding a column that breaks the convention fails this test.
  const schema = readFileSync(path.join(__dirname, '../../prisma/schema.prisma'), 'utf8');
  const columns = [...schema.matchAll(/^\s{2}(\w+)\s+(Int|Boolean|DateTime|String|Decimal|Json|\w+)\??\s/gm)]
    .map(m => ({ name: m[1], type: m[2] }))
    .filter(c => ['Int', 'Boolean', 'DateTime'].includes(c.type));

  it.each(columns)('$name ($type)', ({ name, type }) => {
    expect(fieldKind(name)).toBe(type);
  });
});
