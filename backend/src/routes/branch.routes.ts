import { Router } from 'express';
import c from '../controllers/branch.controller';
import authorize from '../middleware/authorize.middleware';

// Mounted at /organizations/:organizationId/branches
const router = Router({ mergeParams: true });

router.get('/',             authorize('branches.view'),   c.list);
router.post('/',            authorize('branches.create'), c.create);
router.get('/:branchId',    authorize('branches.view'),   c.get);
router.patch('/:branchId',  authorize('branches.edit'),   c.update);
router.delete('/:branchId', authorize('branches.delete'), c.delete);

export default router;
