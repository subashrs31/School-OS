import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { resetAndSeed, prisma } from '../helpers/db';

// Contract tests for the MySQL → PostgreSQL port: the JSON the frontend reads must keep the shape the
// Sequelize implementation returned (relation names, date-only strings, hidden password, /auth/me).

const agent = request.agent(app);
let orgId: number;

const login = (username: string, password = '12345678') =>
  agent.post('/api/auth/login').send({ username, password });

describe('API contract after the Prisma port', () => {
  beforeAll(async () => {
    await resetAndSeed();
    const res = await login('superadmin@example.com');
    expect(res.status).toBe(200);
  });
  afterAll(() => prisma.$disconnect());

  describe('auth', () => {
    it('rejects a wrong password with 401', async () => {
      const res = await request(app).post('/api/auth/login').send({ username: 'superadmin@example.com', password: 'wrong-password' });
      expect(res.status).toBe(401);
    });

    it('accepts the email in any letter case, as MySQL collation did', async () => {
      const res = await request(app).post('/api/auth/login').send({ username: 'SuperAdmin@Example.com', password: '12345678' });
      expect(res.status).toBe(200);
      expect(res.body.data.user).toMatchObject({ email: 'superadmin@example.com', uuid: 'DNSTSA0001', isActive: true });
    });

    it('accepts the uuid as username', async () => {
      const res = await request(app).post('/api/auth/login').send({ username: 'DNSTSA0001', password: '12345678' });
      expect(res.status).toBe(200);
    });

    it('/auth/me keeps its shape', async () => {
      const res = await agent.get('/api/auth/me');
      expect(res.status).toBe(200);
      const { user, roles, permissions, organizations } = res.body.data;
      expect(Object.keys(user).sort()).toEqual(['email', 'id', 'isActive', 'lastLogin', 'name', 'uuid', 'verifiedAt']);
      expect(roles[0]).toMatchObject({ slug: 'super-admin', roleType: 'primary', scopeType: 'global', scopeId: null });
      expect(permissions).toEqual({ all: true, items: [] });
      expect(organizations).toEqual([]);
    });
  });

  describe('users and IAM', () => {
    it('lists users with roles and without password', async () => {
      const res = await agent.get('/api/users');
      expect(res.status).toBe(200);
      const admin = res.body.data.users.find((u: { email: string }) => u.email === 'admin@example.com');
      expect(admin).toBeDefined();
      expect(admin.password).toBeUndefined();
      expect(admin.roles[0]).toMatchObject({ slug: 'admin', roleType: 'secondary' });
    });

    it('creates a user and stores a hashed password', async () => {
      const res = await agent.post('/api/users').send({ name: 'Test Teacher', email: 'teacher@example.com', password: 'Secret123!' });
      expect(res.status).toBe(201);
      expect(res.body.data.user.password).toBeUndefined();
      const row = await prisma.user.findFirstOrThrow({ where: { email: 'teacher@example.com' } });
      expect(row.password).not.toBe('Secret123!');
    });

    it('lists roles without super-admin', async () => {
      const res = await agent.get('/api/iam/roles');
      expect(res.status).toBe(200);
      expect(res.body.data.roles.map((r: { slug: string }) => r.slug)).not.toContain('super-admin');
    });
  });

  describe('organizations', () => {
    it('creates and lists an organization', async () => {
      const created = await agent.post('/api/organizations').send({ name: 'Alpha School', email: 'office@example.com' });
      expect(created.status).toBe(201);
      expect(created.body.data.organization).toMatchObject({ name: 'Alpha School', slug: 'alpha-school', isActive: true, socialLinks: {} });
      orgId = created.body.data.organization.id;

      const list = await agent.get('/api/organizations');
      expect(list.body.data.organizations).toHaveLength(1);
    });

    it('ignores unknown body keys, as Sequelize did', async () => {
      const res = await agent.post(`/api/organizations/${orgId}/branches`).send({ name: 'Main', code: 'M', notAColumn: 'x' });
      expect(res.status).toBe(201);
      expect(res.body.data.branch).toMatchObject({ name: 'Main', code: 'M', organizationId: orgId });
      expect(res.body.data.branch.notAColumn).toBeUndefined();
    });

    it('returns summary counts for the organization', async () => {
      const res = await agent.get(`/api/organizations/${orgId}`);
      expect(res.body.data.summary).toEqual({ branchCount: 1, staffCount: 0, studentCount: 0 });
    });
  });

  describe('staff', () => {
    it('staff list exposes User and Designation like the Sequelize aliases', async () => {
      const designation = await agent.post(`/api/organizations/${orgId}/staff/designations`).send({ name: 'Teacher' });
      expect(designation.status).toBe(201);
      const teacher = await prisma.user.findFirstOrThrow({ where: { email: 'teacher@example.com' } });

      // Numeric strings (from native <select> inputs) are coerced, as Sequelize did.
      const created = await agent.post(`/api/organizations/${orgId}/staff`).send({
        userId: String(teacher.id), designationId: String(designation.body.data.designation.id), employeeCode: 'T-001', joiningDate: '2026-06-01',
      });
      expect(created.status).toBe(201);

      const list = await agent.get(`/api/organizations/${orgId}/staff`);
      const [staff] = list.body.data.staff;
      expect(staff.User).toEqual({ id: teacher.id, name: 'Test Teacher', email: 'teacher@example.com', uuid: teacher.uuid });
      expect(staff.Designation).toMatchObject({ name: 'Teacher' });
      expect(staff.joiningDate).toBe('2026-06-01');
      expect(staff.status).toBe('active');
    });
  });

  describe('academics and students', () => {
    it('academic year dates come back as YYYY-MM-DD', async () => {
      const created = await agent.post(`/api/organizations/${orgId}/academics/years`).send({ name: '2026-2027', startDate: '2026-06-01', endDate: '2027-03-31', isCurrent: true });
      expect(created.status).toBe(201);
      const res = await agent.get(`/api/organizations/${orgId}/academics/years`);
      expect(res.body.data.years[0]).toMatchObject({ name: '2026-2027', startDate: '2026-06-01', endDate: '2027-03-31', isCurrent: true });
    });

    it('class list includes Sections like the Sequelize alias', async () => {
      const cls = await agent.post(`/api/organizations/${orgId}/academics/classes`).send({ name: 'Class 1', displayOrder: 1 });
      expect(cls.status).toBe(201);
      const section = await agent.post(`/api/organizations/${orgId}/academics/classes/${cls.body.data.class.id}/sections`).send({ name: 'A', capacity: 30 });
      expect(section.status).toBe(201);
      const res = await agent.get(`/api/organizations/${orgId}/academics/classes`);
      expect(res.body.data.classes[0].Sections).toHaveLength(1);
      expect(res.body.data.classes[0].Sections[0]).toMatchObject({ name: 'A', capacity: 30 });
    });

    it('student date of birth comes back as YYYY-MM-DD', async () => {
      const created = await agent.post(`/api/organizations/${orgId}/students`).send({ admissionNo: '1001', name: 'Asha', gender: 'female', dateOfBirth: '2019-01-09' });
      expect(created.status).toBe(201);
      expect(created.body.data.student).toMatchObject({ admissionNo: '1001', dateOfBirth: '2019-01-09', status: 'active' });
    });

    it('duplicate admission number is rejected with 409', async () => {
      const res = await agent.post(`/api/organizations/${orgId}/students`).send({ admissionNo: '1001', name: 'Other' });
      expect(res.status).toBe(409);
    });
  });
});
