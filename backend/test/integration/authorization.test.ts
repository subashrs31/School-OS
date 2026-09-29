import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { resetAndSeed, prisma } from '../helpers/db';
import authorizationService from '../../src/services/authorization.service';
import crypt from '../../src/helpers/crypt';

const userId = async (email: string) => (await prisma.user.findFirstOrThrow({ where: { email } })).id;

describe('authorizationService.can (Prisma)', () => {
  beforeAll(resetAndSeed);
  afterAll(() => prisma.$disconnect());

  it('primary role (super admin) bypasses every check', async () => {
    expect(await authorizationService.can(await userId('superadmin@example.com'), 'academics.delete')).toBe(true);
  });

  it('secondary role (admin) is allowed what its role grants', async () => {
    expect(await authorizationService.can(await userId('admin@example.com'), 'users.view')).toBe(true);
  });

  it('secondary role (admin) is denied what its role does not grant', async () => {
    expect(await authorizationService.can(await userId('admin@example.com'), 'organizations.view')).toBe(false);
  });

  it('a direct deny wins over the role permission', async () => {
    const admin = await userId('admin@example.com');
    const perm = await prisma.permission.findFirstOrThrow({ where: { resource: 'users', action: 'view' } });
    await prisma.userHasPermission.create({ data: { userId: admin, permissionId: perm.id, effect: 'deny' } });
    expect(await authorizationService.can(admin, 'users.view')).toBe(false);
  });

  it('an expired role assignment grants nothing', async () => {
    const admin = await userId('admin@example.com');
    await prisma.userHasRole.updateMany({ where: { userId: admin }, data: { expiresAt: new Date(Date.now() - 60_000) } });
    expect(await authorizationService.can(admin, 'roles.view')).toBe(false);
  });

  it('seeded passwords are stored as bcrypt hashes', async () => {
    const user = await prisma.user.findFirstOrThrow({ where: { email: 'superadmin@example.com' } });
    expect(user.password).not.toBe('12345678');
    expect(await crypt.matchPassword('12345678', user.password as string)).toBe(true);
  });

  it('seeding twice creates no duplicates', async () => {
    await resetAndSeed();
    const before = await Promise.all([prisma.role.count(), prisma.permission.count(), prisma.user.count(), prisma.roleHasPermission.count()]);
    const DatabaseSeeder = (await import('../../src/database/seeders/DatabaseSeeder')).default;
    const log = console.log; console.log = () => {};
    try { await DatabaseSeeder.run(); } finally { console.log = log; }
    const after = await Promise.all([prisma.role.count(), prisma.permission.count(), prisma.user.count(), prisma.roleHasPermission.count()]);
    expect(after).toEqual(before);
    expect(before).toEqual([7, 88, 2, 21]);
  });
});
