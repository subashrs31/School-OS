import { Router } from 'express';
import c from '../controllers/staff.controller';
import authorize from '../middleware/authorize.middleware';

// Mounted at /organizations/:organizationId/staff
const router = Router({ mergeParams: true });

router.get('/',           authorize('staff.view'),   c.list);
router.post('/',          authorize('staff.create'), c.create);

// Designations — must be before /:staffId to avoid route conflict
router.get('/designations',                    authorize('staff.view'),   c.listDesignations);
router.post('/designations',                   authorize('staff.create'), c.createDesignation);
router.patch('/designations/:designationId',   authorize('staff.edit'),   c.updateDesignation);

router.get('/:staffId',   authorize('staff.view'),   c.get);
router.patch('/:staffId', authorize('staff.edit'),   c.update);

export default router;
