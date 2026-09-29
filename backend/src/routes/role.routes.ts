import { Router } from 'express';
import authorize from '../middleware/authorize.middleware';
import { validateParams } from '../validators/validate';
import { idParamSchema } from '../validators/param.schema';
import c from '../controllers/role.controller';
import rolePermissionRoutes from './rolePermission.routes';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Role management
 */

/**
 * @swagger
 * /iam/roles:
 *   get:
 *     tags: [Roles]
 *     summary: Get all roles
 *     responses:
 *       200:
 *         description: List of roles
 *   post:
 *     tags: [Roles]
 *     summary: Create a role
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Role created
 */
router.get('/', authorize('view'), c.getRoles);
router.post('/', authorize('create'), c.createRole);

/**
 * @swagger
 * /iam/roles/assignable:
 *   get:
 *     tags: [Roles]
 *     summary: Get assignable roles
 *     responses:
 *       200:
 *         description: List of assignable roles
 */
router.get('/assignable', authorize('view'), c.getAssignableRoles);

/**
 * @swagger
 * /iam/roles/{id}:
 *   get:
 *     tags: [Roles]
 *     summary: Get role by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Role data
 *       404:
 *         description: Not found
 *   put:
 *     tags: [Roles]
 *     summary: Update role
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Role updated
 *   delete:
 *     tags: [Roles]
 *     summary: Delete role
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Role deleted
 */
router.get('/:id', authorize('view'), validateParams(idParamSchema), c.getRole);
router.put('/:id', authorize('edit'), validateParams(idParamSchema), c.updateRole);
router.delete('/:id', authorize('delete'), validateParams(idParamSchema), c.deleteRole);
router.use('/:roleId/permissions', rolePermissionRoutes);

export default router;
