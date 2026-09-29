import { Router } from 'express';
import c from '../controllers/academic.controller';
import authorize from '../middleware/authorize.middleware';

// Mounted at /organizations/:organizationId/academics
const router = Router({ mergeParams: true });

// Academic Years
router.get('/years',              authorize('academics.view'),   c.listYears);
router.post('/years',             authorize('academics.create'), c.createYear);
router.patch('/years/:yearId',    authorize('academics.edit'),   c.updateYear);

// Classes
router.get('/classes',            authorize('academics.view'),   c.listClasses);
router.post('/classes',           authorize('academics.create'), c.createClass);
router.patch('/classes/:classId', authorize('academics.edit'),   c.updateClass);

// Sections
router.post('/classes/:classId/sections',                    authorize('academics.create'), c.createSection);
router.patch('/classes/:classId/sections/:sectionId',        authorize('academics.edit'),   c.updateSection);

// Subjects
router.get('/subjects',               authorize('academics.view'),   c.listSubjects);
router.post('/subjects',              authorize('academics.create'), c.createSubject);
router.patch('/subjects/:subjectId',  authorize('academics.edit'),   c.updateSubject);

// Assignments
router.get('/assignments/class-teachers',   authorize('academics.view'),   c.listClassTeachers);
router.post('/assignments/class-teachers',  authorize('academics.create'), c.assignClassTeacher);
router.get('/assignments/subject-teachers', authorize('academics.view'),   c.listSubjectTeachers);
router.post('/assignments/subject-teachers',authorize('academics.create'), c.assignSubjectTeacher);

// Exams
router.get('/exams',              authorize('academics.view'),   c.listExams);
router.post('/exams',             authorize('academics.create'), c.createExam);
router.patch('/exams/:examId',    authorize('academics.edit'),   c.updateExam);

// Marks
router.get('/marks',   authorize('academics.view'),   c.listMarks);
router.post('/marks',  authorize('academics.create'), c.upsertMark);

export default router;
