import { Router } from 'express';
import authorize from '../middleware/authorize.middleware';
import { validateParams } from '../validators/validate';
import { idParamSchema } from '../validators/param.schema';
import c from '../controllers/permission.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Permissions
 *   description: Permission management
 */

/**
 * @swagger
 * /iam/permissions:
 *   get:
 *     tags: [Permissions]
 *     summary: Get all permissions
 *     responses:
 *       200:
 *         description: List of permissions
 *   post:
 *     tags: [Permissions]
 *     summary: Create a permission
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
 *         description: Permission created
 */
router.get('/', authorize('view'), c.getPermissions);
router.post('/', authorize('create'), c.createPermission);
router.get('/actions', authorize('view'), c.getActions);

/**
 * @swagger
 * /iam/permissions/{id}:
 *   get:
 *     tags: [Permissions]
 *     summary: Get permission by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Permission data
 *       404:
 *         description: Not found
 *   put:
 *     tags: [Permissions]
 *     summary: Update permission
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
 *         description: Permission updated
 *   delete:
 *     tags: [Permissions]
 *     summary: Delete permission
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Permission deleted
 */
router.get('/:id', authorize('view'), validateParams(idParamSchema), c.getPermission);
router.put('/:id', authorize('edit'), validateParams(idParamSchema), c.updatePermission);
router.delete('/:id', authorize('delete'), validateParams(idParamSchema), c.deletePermission);

export default router;
