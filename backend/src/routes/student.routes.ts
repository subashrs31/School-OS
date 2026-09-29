import { Router } from 'express';
import c from '../controllers/student.controller';
import authorize from '../middleware/authorize.middleware';

// Mounted at /organizations/:organizationId/students
const router = Router({ mergeParams: true });

router.get('/',               authorize('students.view'),   c.list);
router.post('/',              authorize('students.create'), c.create);
router.get('/:studentId',     authorize('students.view'),   c.get);
router.patch('/:studentId',   authorize('students.edit'),   c.update);
router.post('/enroll',        authorize('students.create'), c.enroll);

export default router;
