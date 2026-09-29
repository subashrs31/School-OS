import { Request, Response, NextFunction } from 'express';
import academicService from '../services/academic.service';
import organizationService from '../services/organization.service';
import apiResponse from '../helpers/apiResponse';
import { AppUser } from '../types';

const u = (req: Request) => req.user as AppUser;
const isGlobal = (req: Request) => u(req).roles.some(r => r.roleType === 'primary' || r.roleType === 'secondary');
const orgId = (req: Request) => Number(req.params['organizationId']);

const academicController = {
  // ── Academic Years ────────────────────────────────────────────────────────────
  listYears: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await organizationService.assertAccess(u(req).userId, orgId(req), isGlobal(req));
      const years = await academicService.listYears(orgId(req));
      apiResponse.success(res, 'Academic years fetched', { years });
    } catch (err) { next(err); }
  },

  createYear: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await organizationService.assertAccess(u(req).userId, orgId(req), isGlobal(req));
      const year = await academicService.createYear(orgId(req), req.body as Parameters<typeof academicService.createYear>[1]);
      apiResponse.success(res, 'Academic year created', { year }, 201);
    } catch (err) { next(err); }
  },

  updateYear: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await organizationService.assertAccess(u(req).userId, orgId(req), isGlobal(req));
      const year = await academicService.updateYear(Number(req.params['yearId']), orgId(req), req.body as Parameters<typeof academicService.updateYear>[2]);
      apiResponse.success(res, 'Academic year updated', { year });
    } catch (err) { next(err); }
  },

  // ── Classes ───────────────────────────────────────────────────────────────────
  listClasses: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await organizationService.assertAccess(u(req).userId, orgId(req), isGlobal(req));
      const branchId       = req.query['branchId']       ? Number(req.query['branchId'])       : undefined;
      const academicYearId = req.query['academicYearId'] ? Number(req.query['academicYearId']) : undefined;
      const classes = await academicService.listClasses(orgId(req), branchId, academicYearId);
      apiResponse.success(res, 'Classes fetched', { classes });
    } catch (err) { next(err); }
  },

  createClass: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await organizationService.assertAccess(u(req).userId, orgId(req), isGlobal(req));
      const cls = await academicService.createClass(orgId(req), req.body as Parameters<typeof academicService.createClass>[1]);
      apiResponse.success(res, 'Class created', { class: cls }, 201);
    } catch (err) { next(err); }
  },

  updateClass: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await organizationService.assertAccess(u(req).userId, orgId(req), isGlobal(req));
      const cls = await academicService.updateClass(Number(req.params['classId']), orgId(req), req.body as Parameters<typeof academicService.updateClass>[2]);
      apiResponse.success(res, 'Class updated', { class: cls });
    } catch (err) { next(err); }
  },

  // ── Sections ──────────────────────────────────────────────────────────────────
  createSection: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await organizationService.assertAccess(u(req).userId, orgId(req), isGlobal(req));
      const section = await academicService.createSection(Number(req.params['classId']), orgId(req), req.body as Parameters<typeof academicService.createSection>[2]);
      apiResponse.success(res, 'Section created', { section }, 201);
    } catch (err) { next(err); }
  },

  updateSection: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await organizationService.assertAccess(u(req).userId, orgId(req), isGlobal(req));
      const section = await academicService.updateSection(Number(req.params['sectionId']), Number(req.params['classId']), orgId(req), req.body as Parameters<typeof academicService.updateSection>[3]);
      apiResponse.success(res, 'Section updated', { section });
    } catch (err) { next(err); }
  },

  // ── Subjects ──────────────────────────────────────────────────────────────────
  listSubjects: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await organizationService.assertAccess(u(req).userId, orgId(req), isGlobal(req));
      const subjects = await academicService.listSubjects(orgId(req));
      apiResponse.success(res, 'Subjects fetched', { subjects });
    } catch (err) { next(err); }
  },

  createSubject: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await organizationService.assertAccess(u(req).userId, orgId(req), isGlobal(req));
      const subject = await academicService.createSubject(orgId(req), req.body as Parameters<typeof academicService.createSubject>[1]);
      apiResponse.success(res, 'Subject created', { subject }, 201);
    } catch (err) { next(err); }
  },

  updateSubject: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await organizationService.assertAccess(u(req).userId, orgId(req), isGlobal(req));
      const subject = await academicService.updateSubject(Number(req.params['subjectId']), orgId(req), req.body as Parameters<typeof academicService.updateSubject>[2]);
      apiResponse.success(res, 'Subject updated', { subject });
    } catch (err) { next(err); }
  },

  // ── Assignments ───────────────────────────────────────────────────────────────
  listClassTeachers: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await organizationService.assertAccess(u(req).userId, orgId(req), isGlobal(req));
      const assignments = await academicService.listClassTeachers(orgId(req), {
        classId:        req.query['classId']        ? Number(req.query['classId'])        : undefined,
        academicYearId: req.query['academicYearId'] ? Number(req.query['academicYearId']) : undefined,
      });
      apiResponse.success(res, 'Class teacher assignments fetched', { assignments });
    } catch (err) { next(err); }
  },

  assignClassTeacher: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await organizationService.assertAccess(u(req).userId, orgId(req), isGlobal(req));
      const assignment = await academicService.assignClassTeacher(orgId(req), req.body as Parameters<typeof academicService.assignClassTeacher>[1]);
      apiResponse.success(res, 'Class teacher assigned', { assignment }, 201);
    } catch (err) { next(err); }
  },

  listSubjectTeachers: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await organizationService.assertAccess(u(req).userId, orgId(req), isGlobal(req));
      const assignments = await academicService.listSubjectTeachers(orgId(req), {
        classId:        req.query['classId']        ? Number(req.query['classId'])        : undefined,
        subjectId:      req.query['subjectId']      ? Number(req.query['subjectId'])      : undefined,
        academicYearId: req.query['academicYearId'] ? Number(req.query['academicYearId']) : undefined,
      });
      apiResponse.success(res, 'Subject teacher assignments fetched', { assignments });
    } catch (err) { next(err); }
  },

  assignSubjectTeacher: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await organizationService.assertAccess(u(req).userId, orgId(req), isGlobal(req));
      const assignment = await academicService.assignSubjectTeacher(orgId(req), req.body as Parameters<typeof academicService.assignSubjectTeacher>[1]);
      apiResponse.success(res, 'Subject teacher assigned', { assignment }, 201);
    } catch (err) { next(err); }
  },

  // ── Exams ─────────────────────────────────────────────────────────────────────
  listExams: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await organizationService.assertAccess(u(req).userId, orgId(req), isGlobal(req));
      const academicYearId = req.query['academicYearId'] ? Number(req.query['academicYearId']) : undefined;
      const exams = await academicService.listExams(orgId(req), academicYearId);
      apiResponse.success(res, 'Exams fetched', { exams });
    } catch (err) { next(err); }
  },

  createExam: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await organizationService.assertAccess(u(req).userId, orgId(req), isGlobal(req));
      const exam = await academicService.createExam(orgId(req), req.body as Parameters<typeof academicService.createExam>[1]);
      apiResponse.success(res, 'Exam created', { exam }, 201);
    } catch (err) { next(err); }
  },

  updateExam: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await organizationService.assertAccess(u(req).userId, orgId(req), isGlobal(req));
      const exam = await academicService.updateExam(Number(req.params['examId']), orgId(req), req.body as Parameters<typeof academicService.updateExam>[2]);
      apiResponse.success(res, 'Exam updated', { exam });
    } catch (err) { next(err); }
  },

  // ── Marks ─────────────────────────────────────────────────────────────────────
  listMarks: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await organizationService.assertAccess(u(req).userId, orgId(req), isGlobal(req));
      const marks = await academicService.listMarks(orgId(req), {
        examId:    req.query['examId']    ? Number(req.query['examId'])    : undefined,
        classId:   req.query['classId']   ? Number(req.query['classId'])   : undefined,
        studentId: req.query['studentId'] ? Number(req.query['studentId']) : undefined,
      });
      apiResponse.success(res, 'Marks fetched', { marks });
    } catch (err) { next(err); }
  },

  upsertMark: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await organizationService.assertAccess(u(req).userId, orgId(req), isGlobal(req));
      const mark = await academicService.upsertMark(orgId(req), u(req).userId, req.body as Parameters<typeof academicService.upsertMark>[2]);
      apiResponse.success(res, 'Mark saved', { mark }, 201);
    } catch (err) { next(err); }
  },
};

export default academicController;
