import { Op } from 'sequelize';
import {
  AcademicYear, Class, Section, Subject, ClassSubject,
  ClassTeacherAssignment, SubjectTeacherAssignment,
  Exam, ExamSubject, Mark, Staff, Student,
} from '../models/index';
import { throwError } from '../helpers/throwError';

const academicService = {
  // ── Academic Years ────────────────────────────────────────────────────────────
  listYears: (organizationId: number) =>
    AcademicYear.findAll({ where: { organizationId }, order: [['startDate', 'DESC']] }),

  createYear: async (organizationId: number, body: { name: string; startDate: string; endDate: string; isCurrent?: boolean }) => {
    if (body.isCurrent) await AcademicYear.update({ isCurrent: false }, { where: { organizationId } });
    return AcademicYear.create({ ...body, organizationId });
  },

  updateYear: async (id: number, organizationId: number, body: Partial<{ name: string; startDate: string; endDate: string; isCurrent: boolean; isActive: boolean }>) => {
    const year = await AcademicYear.findOne({ where: { id, organizationId } });
    if (!year) throwError('Academic year not found', 404);
    if (body.isCurrent) await AcademicYear.update({ isCurrent: false }, { where: { organizationId, id: { [Op.ne]: id } } });
    await year!.update(body);
    return year!;
  },

  // ── Classes ───────────────────────────────────────────────────────────────────
  listClasses: (organizationId: number, branchId?: number, academicYearId?: number) => {
    const where: Record<string, unknown> = { organizationId };
    if (branchId)       where['branchId']       = branchId;
    if (academicYearId) where['academicYearId']  = academicYearId;
    return Class.findAll({ where, include: [{ model: Section }], order: [['displayOrder', 'ASC'], ['name', 'ASC']] });
  },

  createClass: (organizationId: number, body: { name: string; branchId?: number; academicYearId?: number; displayOrder?: number }) =>
    Class.create({ ...body, organizationId }),

  updateClass: async (id: number, organizationId: number, body: Partial<{ name: string; branchId: number; academicYearId: number; displayOrder: number; isActive: boolean }>) => {
    const cls = await Class.findOne({ where: { id, organizationId } });
    if (!cls) throwError('Class not found', 404);
    await cls!.update(body);
    return cls!;
  },

  // ── Sections ──────────────────────────────────────────────────────────────────
  createSection: async (classId: number, organizationId: number, body: { name: string; capacity?: number }) => {
    const cls = await Class.findOne({ where: { id: classId, organizationId } });
    if (!cls) throwError('Class not found in this organization', 404);
    return Section.create({ ...body, classId });
  },

  updateSection: async (id: number, classId: number, organizationId: number, body: Partial<{ name: string; capacity: number; isActive: boolean }>) => {
    const cls = await Class.findOne({ where: { id: classId, organizationId } });
    if (!cls) throwError('Class not found in this organization', 404);
    const section = await Section.findOne({ where: { id, classId } });
    if (!section) throwError('Section not found', 404);
    await section!.update(body);
    return section!;
  },

  // ── Subjects ──────────────────────────────────────────────────────────────────
  listSubjects: (organizationId: number) =>
    Subject.findAll({ where: { organizationId }, order: [['name', 'ASC']] }),

  createSubject: (organizationId: number, body: { name: string; code?: string; type?: string }) =>
    Subject.create({ ...body, organizationId } as Parameters<typeof Subject.create>[0]),

  updateSubject: async (id: number, organizationId: number, body: Partial<{
    name: string; code: string; type: 'theory' | 'practical' | 'both'; isActive: boolean;
  }>) => {
    const subject = await Subject.findOne({ where: { id, organizationId } });
    if (!subject) throwError('Subject not found', 404);
    await (subject as InstanceType<typeof Subject>).update(body as any);
    return subject!;
  },

  // ── Class Subjects ────────────────────────────────────────────────────────────
  listClassSubjects: (classId: number, organizationId: number) => {
    return ClassSubject.findAll({
      where: { classId },
      include: [{ model: Subject, where: { organizationId } }],
    });
  },

  assignClassSubject: async (classId: number, organizationId: number, body: { subjectId: number; academicYearId?: number }) => {
    const cls = await Class.findOne({ where: { id: classId, organizationId } });
    if (!cls) throwError('Class not found in this organization', 404);
    return ClassSubject.create({ classId, ...body });
  },

  // ── Class Teacher Assignments ─────────────────────────────────────────────────
  listClassTeachers: (organizationId: number, filters: { classId?: number; academicYearId?: number }) => {
    const where: Record<string, unknown> = { organizationId };
    if (filters.classId)        where['classId']        = filters.classId;
    if (filters.academicYearId) where['academicYearId'] = filters.academicYearId;
    return ClassTeacherAssignment.findAll({ where, include: [{ model: Staff }, { model: Class }, { model: Section }] });
  },

  assignClassTeacher: async (organizationId: number, body: {
    staffId: number; classId: number; sectionId?: number;
    academicYearId: number; branchId?: number; startDate?: string; endDate?: string;
  }) => {
    const staff = await Staff.findOne({ where: { id: body.staffId, organizationId } });
    if (!staff) throwError('Staff not found in this organization', 404);
    // deactivate existing assignment for same class/section/year
    await ClassTeacherAssignment.update(
      { isActive: false },
      { where: { classId: body.classId, sectionId: body.sectionId ?? null, academicYearId: body.academicYearId, isActive: true } }
    );
    return ClassTeacherAssignment.create({ ...body, organizationId });
  },

  // ── Subject Teacher Assignments ───────────────────────────────────────────────
  listSubjectTeachers: (organizationId: number, filters: { classId?: number; subjectId?: number; academicYearId?: number }) => {
    const where: Record<string, unknown> = { organizationId };
    if (filters.classId)        where['classId']        = filters.classId;
    if (filters.subjectId)      where['subjectId']      = filters.subjectId;
    if (filters.academicYearId) where['academicYearId'] = filters.academicYearId;
    return SubjectTeacherAssignment.findAll({ where, include: [{ model: Staff }, { model: Class }, { model: Subject }] });
  },

  assignSubjectTeacher: async (organizationId: number, body: {
    staffId: number; classId: number; subjectId: number;
    sectionId?: number; academicYearId: number; branchId?: number;
    startDate?: string; endDate?: string;
  }) => {
    const staff = await Staff.findOne({ where: { id: body.staffId, organizationId } });
    if (!staff) throwError('Staff not found in this organization', 404);
    return SubjectTeacherAssignment.create({ ...body, organizationId });
  },

  // ── Exams ─────────────────────────────────────────────────────────────────────
  listExams: (organizationId: number, academicYearId?: number) => {
    const where: Record<string, unknown> = { organizationId };
    if (academicYearId) where['academicYearId'] = academicYearId;
    return Exam.findAll({ where, include: [{ model: ExamSubject }], order: [['startDate', 'DESC']] });
  },

  createExam: (organizationId: number, body: { name: string; academicYearId: number; branchId?: number; examType?: string; startDate?: string; endDate?: string }) =>
    Exam.create({ ...body, organizationId } as Parameters<typeof Exam.create>[0]),

  updateExam: async (id: number, organizationId: number, body: Partial<{
    name: string; examType: 'unit_test' | 'midterm' | 'final' | 'other';
    startDate: string; endDate: string; isActive: boolean;
  }>) => {
    const exam = await Exam.findOne({ where: { id, organizationId } });
    if (!exam) throwError('Exam not found', 404);
    await (exam as InstanceType<typeof Exam>).update(body as any);
    return exam!;
  },

  // ── Marks ─────────────────────────────────────────────────────────────────────
  listMarks: (organizationId: number, filters: { examId?: number; classId?: number; studentId?: number }) => {
    const where: Record<string, unknown> = { organizationId };
    if (filters.examId)    where['examId']    = filters.examId;
    if (filters.classId)   where['classId']   = filters.classId;
    if (filters.studentId) where['studentId'] = filters.studentId;
    return Mark.findAll({ where, include: [{ model: Student, attributes: ['id', 'name', 'admissionNo'] }, { model: Subject, attributes: ['id', 'name'] }] });
  },

  upsertMark: async (organizationId: number, enteredBy: number, body: {
    examId: number; studentId: number; classId: number; subjectId: number;
    sectionId?: number; branchId?: number; marksObtained?: number; remarks?: string;
  }) => {
    // verify exam belongs to org
    const exam = await Exam.findOne({ where: { id: body.examId, organizationId } });
    if (!exam) throwError('Exam not found in this organization', 404);
    const student = await Student.findOne({ where: { id: body.studentId, organizationId } });
    if (!student) throwError('Student not found in this organization', 404);

    const [mark] = await Mark.upsert({
      ...body, organizationId, enteredBy, enteredAt: new Date(),
    } as Parameters<typeof Mark.upsert>[0]);
    return mark;
  },
};

export default academicService;
