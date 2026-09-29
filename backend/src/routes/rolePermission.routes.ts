import { Router } from 'express';
import authorize from '../middleware/authorize.middleware';
import c from '../controllers/rolePermission.controller';

const router = Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: Role Permissions
 *   description: Manage permissions assigned to roles
 */

/**
 * @swagger
 * /iam/roles/{roleId}/permissions:
 *   get:
 *     tags: [Role Permissions]
 *     summary: Get permissions for a role
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of permissions
 *   post:
 *     tags: [Role Permissions]
 *     summary: Assign a permission to a role
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [permissionId]
 *             properties:
 *               permissionId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Permission assigned
 */
router.get('/', authorize('view'), c.getRolePermissions);
router.post('/', authorize('create'), c.assignRolePermission);

/**
 * @swagger
 * /iam/roles/{roleId}/permissions/sync:
 *   post:
 *     tags: [Role Permissions]
 *     summary: Sync permissions for a role
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [permissionIds]
 *             properties:
 *               permissionIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Permissions synced
 */
router.post('/sync', authorize('edit'), c.syncRolePermissions);

/**
 * @swagger
 * /iam/roles/{roleId}/permissions/{permissionId}:
 *   delete:
 *     tags: [Role Permissions]
 *     summary: Revoke a permission from a role
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: permissionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Permission revoked
 */
router.delete('/:permissionId', authorize('delete'), c.revokeRolePermission);

export default router;
