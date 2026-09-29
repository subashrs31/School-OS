import { Router, Request, Response } from 'express';
import apiResponse from '../helpers/apiResponse';
import { authCheck } from '../middleware/auth.middleware';
import { setResource } from '../middleware/authorize.middleware';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import roleRoutes from './role.routes';
import permissionRoutes from './permission.routes';
import userRoleRoutes from './userRole.routes';
import userPermissionRoutes from './userPermission.routes';
import organizationRoutes from './organization.routes';
import branchRoutes from './branch.routes';
import staffRoutes from './staff.routes';
import studentRoutes from './student.routes';
import academicRoutes from './academic.routes';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: API health and status
 */
/**
 * @swagger
 * /:
 *   get:
 *     tags: [Health]
 *     summary: API status
 *     security: []
 *     responses:
 *       200:
 *         description: API is running
 */
router.get('/', (_req: Request, res: Response) => apiResponse.success(res, 'API is up and running!', {}));

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Health check
 *     security: []
 *     responses:
 *       200:
 *         description: API is healthy
 */
router.get('/health', (_req: Request, res: Response) => apiResponse.success(res, 'API Health is Good', { timestamp: new Date().toISOString() }));
router.use('/auth', authRoutes);

router.use(authCheck);
router.use('/users', setResource('users'), userRoutes);
router.use('/iam/roles', setResource('roles'), roleRoutes);
router.use('/iam/permissions', setResource('permissions'), permissionRoutes);
router.use('/iam/users/:userId/roles', setResource('user-role'), userRoleRoutes);
router.use('/iam/users/:userId/permissions', setResource('user-permission'), userPermissionRoutes);

router.use('/organizations', setResource('organizations'), organizationRoutes);
router.use('/organizations/:organizationId/branches',  setResource('branches'),  branchRoutes);
router.use('/organizations/:organizationId/staff',     setResource('staff'),     staffRoutes);
router.use('/organizations/:organizationId/students',  setResource('students'),  studentRoutes);
router.use('/organizations/:organizationId/academics', setResource('academics'), academicRoutes);

export default router;
