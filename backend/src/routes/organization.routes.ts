import { Router } from 'express';
import c from '../controllers/organization.controller';
import authorize from '../middleware/authorize.middleware';

const router = Router();

router.get('/',    authorize('organizations.view'),   c.list);
router.post('/',   authorize('organizations.create'), c.create);
router.get('/:organizationId',    authorize('organizations.view'),   c.get);
router.patch('/:organizationId',  authorize('organizations.edit'),   c.update);

export default router;
