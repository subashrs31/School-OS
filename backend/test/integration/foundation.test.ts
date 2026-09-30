import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { resetAndSeed, prisma } from '../helpers/db';

// Sub-phase 2.1 — staged identity / RBAC / tenancy foundation (docs/phases/2.1-prisma-foundation.md).
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const pgCode = (err: unknown): string | undefined => {
  const e = err as { code?: string; meta?: { code?: string }; cause?: { code?: string }; message?: string };
  return e.code ?? e.meta?.code ?? e.cause?.code;
};

describe('2.1 foundation schema', () => {
  beforeAll(resetAndSeed);
  afterAll(() => prisma.$disconnect());

  describe('users', () => {
    it('gets a public id, access version 1 and the school plane by default', async () => {
      const user = await prisma.user.create({ data: { uuid: 'T-0001', email: 't1@example.com' } });
      expect(user.publicId).toMatch(UUID);
      expect(user.accessVersion).toBe(1);
      expect(user.accountPlane).toBe('SCHOOL');
      expect(user.identitySubject).toBeNull();
    });

    it('rejects a second profile for the same license-server identity', async () => {
      await prisma.user.create({ data: { uuid: 'T-0002', identitySubject: 'ls-sub-1' } });
      await expect(prisma.user.create({ data: { uuid: 'T-0003', identitySubject: 'ls-sub-1' } }))
        .rejects.toMatchObject({ code: 'P2002' });
    });

    it('seeded platform users are on the platform plane', async () => {
      const platform = await prisma.user.findMany({
        where: { email: { in: ['superadmin@example.com', 'admin@example.com'] } },
        select: { email: true, accountPlane: true },
      });
      expect(platform).toHaveLength(2);
      expect(platform.every(u => u.accountPlane === 'PLATFORM')).toBe(true);
    });
  });

  describe('organizations', () => {
    it('defaults to ACTIVE, MANUAL status source, PLATFORM sign-up source and a public id', async () => {
      const org = await prisma.organization.create({ data: { name: 'Alpha', slug: 'alpha' } });
      expect(org).toMatchObject({ status: 'ACTIVE', statusSource: 'MANUAL', signupSource: 'PLATFORM', onboardedBy: null });
      expect(org.publicId).toMatch(UUID);
    });
  });

  describe('scoped role assignments', () => {
    it('accepts a branch-scoped assignment inside its own school and rejects another school\'s branch', async () => {
      const alpha = await prisma.organization.create({ data: { name: 'Scope A', slug: 'scope-a' } });
      const beta = await prisma.organization.create({ data: { name: 'Scope B', slug: 'scope-b' } });
      const branchA = await prisma.branch.create({ data: { organizationId: alpha.id, name: 'A-Main' } });
      const user = await prisma.user.create({ data: { uuid: 'T-0004' } });
      const teacher = await prisma.role.findFirstOrThrow({ where: { slug: 'teacher' } });

      const ok = await prisma.userHasRole.create({
        data: { userId: user.id, roleId: teacher.id, scopeType: 'branch', scopeId: branchA.id, organizationId: alpha.id, branchId: branchA.id },
      });
      expect(ok.scopeType).toBe('branch');

      let error: unknown;
      try {
        await prisma.userHasRole.create({
          data: { userId: user.id, roleId: teacher.id, scopeType: 'branch', scopeId: branchA.id + 1000, organizationId: beta.id, branchId: branchA.id },
        });
      } catch (e) { error = e; }
      expect(error).toBeDefined();
      // Foreign-key violation: the (organizationId, branchId) pair must exist in branches.
      expect(['P2003', '23503']).toContain(pgCode(error));
    });
  });

  describe('permissions', () => {
    it('seeded permissions carry their module and default flags', async () => {
      const perm = await prisma.permission.findFirstOrThrow({ where: { resource: 'staff', action: 'view' } });
      expect(perm).toMatchObject({ module: 'staff', isSensitive: false, isPlatformOnly: false });
    });
  });

  describe('audit_logs', () => {
    it('accepts new entries and refuses updates and deletes', async () => {
      const entry = await prisma.auditLog.create({
        data: { actorPlane: 'SYSTEM', action: 'test.recorded', outcome: 'SUCCESS', changeSummary: { from: null, to: 'x' } },
      });
      expect(entry.occurredAt).toBeInstanceOf(Date);
      await expect(prisma.auditLog.update({ where: { id: entry.id }, data: { action: 'tampered' } })).rejects.toThrow(/append-only/);
      await expect(prisma.auditLog.delete({ where: { id: entry.id } })).rejects.toThrow(/append-only/);
    });
  });
});
