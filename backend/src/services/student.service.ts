import prisma from '../lib/prisma';
import { Prisma } from '../generated/prisma/client';
import { throwError } from '../helpers/throwError';
import { modelData } from '../helpers/modelData';

const ENROLLMENT_INCLUDE = {
  AcademicYear: { select: { id: true, name: true } },
  Class:        { select: { id: true, name: true } },
  Section:      { select: { id: true, name: true } },
  Branch:       { select: { id: true, name: true } },
} satisfies Prisma.StudentAcademicEnrollmentInclude;

const studentService = {
  list: async (organizationId: number, branchId?: number) => {
    if (branchId) {
      // students enrolled in a specific branch
      const enrollments = await prisma.studentAcademicEnrollment.findMany({
        where: { organizationId, branchId },
        select: { studentId: true },
      });
      const ids = [...new Set(enrollments.map(e => e.studentId))];
      if (!ids.length) return [];
      return prisma.student.findMany({ where: { organizationId, id: { in: ids } } });
    }
    return prisma.student.findMany({ where: { organizationId }, orderBy: { name: 'asc' } });
  },

  getById: async (id: number, organizationId: number) => {
    const student = await prisma.student.findFirst({
      where: { id, organizationId },
      include: { StudentAcademicEnrollments: { include: ENROLLMENT_INCLUDE } },
    });
    if (!student) throwError('Student not found', 404);
    return student!;
  },

  create: async (organizationId: number, body: {
    admissionNo: string; name: string; dateOfBirth?: string; gender?: string;
    photo?: string; email?: string; mobile?: string; address?: string; admissionDate?: string;
  }) => {
    const exists = await prisma.student.findFirst({ where: { organizationId, admissionNo: body.admissionNo } });
    if (exists) throwError('Admission number already exists in this organization', 409);
    return prisma.student.create({ data: { ...modelData(Prisma.StudentScalarFieldEnum, body), organizationId } as Prisma.StudentUncheckedCreateInput });
  },

  update: async (id: number, organizationId: number, body: Partial<{
    name: string; dateOfBirth: string;
    gender: 'male' | 'female' | 'other';
    photo: string; email: string; mobile: string;
    address: string; admissionDate: string;
    status: 'active' | 'inactive' | 'transferred' | 'graduated';
  }>) => {
    const student = await prisma.student.findFirst({ where: { id, organizationId } });
    if (!student) throwError('Student not found', 404);
    return prisma.student.update({ where: { id }, data: modelData(Prisma.StudentScalarFieldEnum, body) });
  },

  enroll: async (organizationId: number, body: {
    studentId: number; branchId?: number; academicYearId: number;
    classId: number; sectionId?: number;
  }) => {
    const data = modelData(Prisma.StudentAcademicEnrollmentScalarFieldEnum, body);
    const student = await prisma.student.findFirst({ where: { id: data.studentId, organizationId } });
    if (!student) throwError('Student not found in this organization', 404);
    const existing = await prisma.studentAcademicEnrollment.findFirst({
      where: { studentId: data.studentId, academicYearId: data.academicYearId },
    });
    if (existing) throwError('Student already enrolled for this academic year', 409);
    return prisma.studentAcademicEnrollment.create({ data: { ...data, organizationId } as Prisma.StudentAcademicEnrollmentUncheckedCreateInput });
  },
};

export default studentService;
