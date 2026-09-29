import prisma from '../lib/prisma';
import { Prisma } from '../generated/prisma/client';
import { throwError } from '../helpers/throwError';
import { modelData } from '../helpers/modelData';

const academicService = {
  // ── Academic Years ────────────────────────────────────────────────────────────
  listYears: (organizationId: number) =>
    prisma.academicYear.findMany({ where: { organizationId }, orderBy: { startDate: 'desc' } }),

  createYear: async (organizationId: number, body: { name: string; startDate: string; endDate: string; isCurrent?: boolean }) => {
    const data = modelData(Prisma.AcademicYearScalarFieldEnum, body);
    if (data.isCurrent) await prisma.academicYear.updateMany({ where: { organizationId }, data: { isCurrent: false } });
    return prisma.academicYear.create({ data: { ...data, organizationId } as Prisma.AcademicYearUncheckedCreateInput });
  },

  updateYear: async (id: number, organizationId: number, body: Partial<{ name: string; startDate: string; endDate: string; isCurrent: boolean; isActive: boolean }>) => {
    const year = await prisma.academicYear.findFirst({ where: { id, organizationId } });
    if (!year) throwError('Academic year not found', 404);
    const data = modelData(Prisma.AcademicYearScalarFieldEnum, body);
    if (data.isCurrent) await prisma.academicYear.updateMany({ where: { organizationId, id: { not: id } }, data: { isCurrent: false } });
    return prisma.academicYear.update({ where: { id }, data });
  },

  // ── Classes ───────────────────────────────────────────────────────────────────
  listClasses: (organizationId: number, branchId?: number, academicYearId?: number) => {
    const where: Prisma.ClassWhereInput = { organizationId };
    if (branchId)       where.branchId       = branchId;
    if (academicYearId) where.academicYearId = academicYearId;
    // `Sections` keeps the Sequelize alias; the frontend reads class.Sections.
    return prisma.class.findMany({ where, include: { Sections: true }, orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }] });
  },

  createClass: (organizationId: number, body: { name: string; branchId?: number; academicYearId?: number; displayOrder?: number }) =>
    prisma.class.create({ data: { ...modelData(Prisma.ClassScalarFieldEnum, body), organizationId } as Prisma.ClassUncheckedCreateInput }),

  updateClass: async (id: number, organizationId: number, body: Partial<{ name: string; branchId: number; academicYearId: number; displayOrder: number; isActive: boolean }>) => {
    const cls = await prisma.class.findFirst({ where: { id, organizationId } });
    if (!cls) throwError('Class not found', 404);
    return prisma.class.update({ where: { id }, data: modelData(Prisma.ClassScalarFieldEnum, body) });
  },

  // ── Sections ──────────────────────────────────────────────────────────────────
  createSection: async (classId: number, organizationId: number, body: { name: string; capacity?: number }) => {
    const cls = await prisma.class.findFirst({ where: { id: classId, organizationId } });
    if (!cls) throwError('Class not found in this organization', 404);
    return prisma.section.create({ data: { ...modelData(Prisma.SectionScalarFieldEnum, body), classId } as Prisma.SectionUncheckedCreateInput });
  },

  updateSection: async (id: number, classId: number, organizationId: number, body: Partial<{ name: string; capacity: number; isActive: boolean }>) => {
    const cls = await prisma.class.findFirst({ where: { id: classId, organizationId } });
    if (!cls) throwError('Class not found in this organization', 404);
    const section = await prisma.section.findFirst({ where: { id, classId } });
    if (!section) throwError('Section not found', 404);
    return prisma.section.update({ where: { id }, data: modelData(Prisma.SectionScalarFieldEnum, body) });
  },

  // ── Subjects ──────────────────────────────────────────────────────────────────
  listSubjects: (organizationId: number) =>
    prisma.subject.findMany({ where: { organizationId }, orderBy: { name: 'asc' } }),

  createSubject: (organizationId: number, body: { name: string; code?: string; type?: string }) =>
    prisma.subject.create({ data: { ...modelData(Prisma.SubjectScalarFieldEnum, body), organizationId } as Prisma.SubjectUncheckedCreateInput }),

  updateSubject: async (id: number, organizationId: number, body: Partial<{
    name: string; code: string; type: 'theory' | 'practical' | 'both'; isActive: boolean;
  }>) => {
    const subject = await prisma.subject.findFirst({ where: { id, organizationId } });
    if (!subject) throwError('Subject not found', 404);
    return prisma.subject.update({ where: { id }, data: modelData(Prisma.SubjectScalarFieldEnum, body) });
  },

  // ── Class Subjects ────────────────────────────────────────────────────────────
  listClassSubjects: (classId: number, organizationId: number) => {
    return prisma.classSubject.findMany({
      where: { classId, Subject: { organizationId } },
      include: { Subject: true },
    });
  },

  assignClassSubject: async (classId: number, organizationId: number, body: { subjectId: number; academicYearId?: number }) => {
    const cls = await prisma.class.findFirst({ where: { id: classId, organizationId } });
    if (!cls) throwError('Class not found in this organization', 404);
    // Under Sequelize `{ classId, ...body }` let the body override classId; kept as-is for the port.
    return prisma.classSubject.create({ data: { classId, ...modelData(Prisma.ClassSubjectScalarFieldEnum, body) } as Prisma.ClassSubjectUncheckedCreateInput });
  },

  // ── Class Teacher Assignments ─────────────────────────────────────────────────
  listClassTeachers: (organizationId: number, filters: { classId?: number; academicYearId?: number }) => {
    const where: Prisma.ClassTeacherAssignmentWhereInput = { organizationId };
    if (filters.classId)        where.classId        = Number(filters.classId);
    if (filters.academicYearId) where.academicYearId = Number(filters.academicYearId);
    return prisma.classTeacherAssignment.findMany({ where, include: { Staff: true, Class: true, Section: true } });
  },

  assignClassTeacher: async (organizationId: number, body: {
    staffId: number; classId: number; sectionId?: number;
    academicYearId: number; branchId?: number; startDate?: string; endDate?: string;
  }) => {
    const data = modelData(Prisma.ClassTeacherAssignmentScalarFieldEnum, body);
    const staff = await prisma.staff.findFirst({ where: { id: data.staffId, organizationId } });
    if (!staff) throwError('Staff not found in this organization', 404);
    // deactivate existing assignment for same class/section/year
    await prisma.classTeacherAssignment.updateMany({
      where: { classId: data.classId, sectionId: data.sectionId ?? null, academicYearId: data.academicYearId, isActive: true },
      data: { isActive: false },
    });
    return prisma.classTeacherAssignment.create({ data: { ...data, organizationId } as Prisma.ClassTeacherAssignmentUncheckedCreateInput });
  },

  // ── Subject Teacher Assignments ───────────────────────────────────────────────
  listSubjectTeachers: (organizationId: number, filters: { classId?: number; subjectId?: number; academicYearId?: number }) => {
    const where: Prisma.SubjectTeacherAssignmentWhereInput = { organizationId };
    if (filters.classId)        where.classId        = Number(filters.classId);
    if (filters.subjectId)      where.subjectId      = Number(filters.subjectId);
    if (filters.academicYearId) where.academicYearId = Number(filters.academicYearId);
    return prisma.subjectTeacherAssignment.findMany({ where, include: { Staff: true, Class: true, Subject: true } });
  },

  assignSubjectTeacher: async (organizationId: number, body: {
    staffId: number; classId: number; subjectId: number;
    sectionId?: number; academicYearId: number; branchId?: number;
    startDate?: string; endDate?: string;
  }) => {
    const data = modelData(Prisma.SubjectTeacherAssignmentScalarFieldEnum, body);
    const staff = await prisma.staff.findFirst({ where: { id: data.staffId, organizationId } });
    if (!staff) throwError('Staff not found in this organization', 404);
    return prisma.subjectTeacherAssignment.create({ data: { ...data, organizationId } as Prisma.SubjectTeacherAssignmentUncheckedCreateInput });
  },

  // ── Exams ─────────────────────────────────────────────────────────────────────
  listExams: (organizationId: number, academicYearId?: number) => {
    const where: Prisma.ExamWhereInput = { organizationId };
    if (academicYearId) where.academicYearId = Number(academicYearId);
    return prisma.exam.findMany({ where, include: { ExamSubjects: true }, orderBy: { startDate: 'desc' } });
  },

  createExam: (organizationId: number, body: { name: string; academicYearId: number; branchId?: number; examType?: string; startDate?: string; endDate?: string }) =>
    prisma.exam.create({ data: { ...modelData(Prisma.ExamScalarFieldEnum, body), organizationId } as Prisma.ExamUncheckedCreateInput }),

  updateExam: async (id: number, organizationId: number, body: Partial<{
    name: string; examType: 'unit_test' | 'midterm' | 'final' | 'other';
    startDate: string; endDate: string; isActive: boolean;
  }>) => {
    const exam = await prisma.exam.findFirst({ where: { id, organizationId } });
    if (!exam) throwError('Exam not found', 404);
    return prisma.exam.update({ where: { id }, data: modelData(Prisma.ExamScalarFieldEnum, body) });
  },

  // ── Marks ─────────────────────────────────────────────────────────────────────
  listMarks: (organizationId: number, filters: { examId?: number; classId?: number; studentId?: number }) => {
    const where: Prisma.MarkWhereInput = { organizationId };
    if (filters.examId)    where.examId    = Number(filters.examId);
    if (filters.classId)   where.classId   = Number(filters.classId);
    if (filters.studentId) where.studentId = Number(filters.studentId);
    return prisma.mark.findMany({
      where,
      include: { Student: { select: { id: true, name: true, admissionNo: true } }, Subject: { select: { id: true, name: true } } },
    });
  },

  upsertMark: async (organizationId: number, enteredBy: number, body: {
    examId: number; studentId: number; classId: number; subjectId: number;
    sectionId?: number; branchId?: number; marksObtained?: number; remarks?: string;
  }) => {
    const data = modelData(Prisma.MarkScalarFieldEnum, body);
    // verify exam belongs to org
    const exam = await prisma.exam.findFirst({ where: { id: data.examId, organizationId } });
    if (!exam) throwError('Exam not found in this organization', 404);
    const student = await prisma.student.findFirst({ where: { id: data.studentId, organizationId } });
    if (!student) throwError('Student not found in this organization', 404);

    // Sequelize upsert = INSERT ... ON DUPLICATE KEY on marks_exam_student_subject_unique.
    const values = { ...data, organizationId, enteredBy, enteredAt: new Date() };
    return prisma.mark.upsert({
      where: { examId_studentId_subjectId: { examId: data.examId, studentId: data.studentId, subjectId: data.subjectId } },
      create: values as Prisma.MarkUncheckedCreateInput,
      update: values,
    });
  },
};

export default academicService;
