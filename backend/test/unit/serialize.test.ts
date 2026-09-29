import { describe, it, expect } from 'vitest';
import { Prisma } from '../../src/generated/prisma/client';
import { serializeForJson } from '../../src/helpers/serialize';

describe('serializeForJson', () => {
  it('formats date-only columns as YYYY-MM-DD, like the former MySQL DATEONLY', () => {
    const out = serializeForJson({ startDate: new Date('2026-06-01T00:00:00.000Z'), endDate: null }) as Record<string, unknown>;
    expect(out.startDate).toBe('2026-06-01');
    expect(out.endDate).toBeNull();
  });

  it('keeps timestamps as Date values (serialised by JSON as ISO strings)', () => {
    const createdAt = new Date('2026-09-30T10:15:00.000Z');
    const out = serializeForJson({ createdAt }) as Record<string, unknown>;
    expect(out.createdAt).toBe(createdAt);
  });

  it('formats Decimal(5,2) values with two decimals, like mysql2 did', () => {
    const out = serializeForJson({ maxMarks: new Prisma.Decimal('80'), marksObtained: new Prisma.Decimal('45.5') }) as Record<string, unknown>;
    expect(out.maxMarks).toBe('80.00');
    expect(out.marksObtained).toBe('45.50');
  });

  it('walks nested includes and arrays', () => {
    const out = serializeForJson([{ name: 'X', Sections: [], Student: { dateOfBirth: new Date('2012-01-09T00:00:00.000Z') } }]) as Array<Record<string, any>>;
    expect(out[0].Student.dateOfBirth).toBe('2012-01-09');
    expect(out[0].Sections).toEqual([]);
  });

  it('leaves primitives and null untouched', () => {
    expect(serializeForJson(null)).toBeNull();
    expect(serializeForJson('a')).toBe('a');
    expect(serializeForJson(3)).toBe(3);
  });
});
