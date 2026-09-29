import { Student, StudentAcademicEnrollment, AcademicYear, Class, Section, Branch } from '../models/index';
import { throwError } from '../helpers/throwError';

const ENROLLMENT_INCLUDE = [
  { model: AcademicYear, attributes: ['id', 'name'] },
  { model: Class,        attributes: ['id', 'name'] },
  { model: Section,      attributes: ['id', 'name'] },
  { model: Branch,       attributes: ['id', 'name'] },
];

const studentService = {
  list: async (organizationId: number, branchId?: number) => {
    if (branchId) {
      // students enrolled in a specific branch
      const enrollments = await StudentAcademicEnrollment.findAll({
        where: { organizationId, branchId },
        attributes: ['studentId'],
      });
      const ids = [...new Set(enrollments.map(e => e.studentId))];
      if (!ids.length) return [];
      return Student.findAll({ where: { organizationId, id: ids } });
    }
    return Student.findAll({ where: { organizationId }, order: [['name', 'ASC']] });
  },

  getById: async (id: number, organizationId: number) => {
    const student = await Student.findOne({
      where: { id, organizationId },
      include: [{ model: StudentAcademicEnrollment, include: ENROLLMENT_INCLUDE }],
    });
    if (!student) throwError('Student not found', 404);
    return student!;
  },

  create: async (organizationId: number, body: {
    admissionNo: string; name: string; dateOfBirth?: string; gender?: string;
    photo?: string; email?: string; mobile?: string; address?: string; admissionDate?: string;
  }) => {
    const exists = await Student.findOne({ where: { organizationId, admissionNo: body.admissionNo } });
    if (exists) throwError('Admission number already exists in this organization', 409);
    return Student.create({ ...body, organizationId } as Parameters<typeof Student.create>[0]);
  },

  update: async (id: number, organizationId: number, body: Partial<{
    name: string; dateOfBirth: string;
    gender: 'male' | 'female' | 'other';
    photo: string; email: string; mobile: string;
    address: string; admissionDate: string;
    status: 'active' | 'inactive' | 'transferred' | 'graduated';
  }>) => {
    const student = await Student.findOne({ where: { id, organizationId } });
    if (!student) throwError('Student not found', 404);
    await (student as InstanceType<typeof Student>).update(body as any);
    return student!;
  },

  enroll: async (organizationId: number, body: {
    studentId: number; branchId?: number; academicYearId: number;
    classId: number; sectionId?: number;
  }) => {
    const student = await Student.findOne({ where: { id: body.studentId, organizationId } });
    if (!student) throwError('Student not found in this organization', 404);
    const existing = await StudentAcademicEnrollment.findOne({
      where: { studentId: body.studentId, academicYearId: body.academicYearId },
    });
    if (existing) throwError('Student already enrolled for this academic year', 409);
    return StudentAcademicEnrollment.create({ ...body, organizationId });
  },
};

export default studentService;
