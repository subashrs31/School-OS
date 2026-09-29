import { Router } from 'express';
import authorize from '../middleware/authorize.middleware';
import c from '../controllers/userPermission.controller';

const router = Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: User Permissions
 *   description: Manage permissions directly assigned to users
 */

/**
 * @swagger
 * /iam/users/{userId}/permissions:
 *   get:
 *     tags: [User Permissions]
 *     summary: Get permissions for a user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of permissions
 *   post:
 *     tags: [User Permissions]
 *     summary: Assign a permission to a user
 *     parameters:
 *       - in: path
 *         name: userId
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
router.get('/', authorize('view'), c.getUserPermissions);
router.post('/', authorize('create'), c.assignUserPermission);

/**
 * @swagger
 * /iam/users/{userId}/permissions/sync:
 *   post:
 *     tags: [User Permissions]
 *     summary: Sync permissions for a user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [permissions]
 *             properties:
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [permissionId, effect]
 *                   properties:
 *                     permissionId:
 *                       type: integer
 *                     effect:
 *                       type: string
 *                       enum: [allow, deny]
 *     responses:
 *       200:
 *         description: Permissions synced
 */
router.post('/sync', authorize('edit'), c.syncUserPermissions);

/**
 * @swagger
 * /iam/users/{userId}/permissions/{permissionId}:
 *   delete:
 *     tags: [User Permissions]
 *     summary: Revoke a permission from a user
 *     parameters:
 *       - in: path
 *         name: userId
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
router.delete('/:permissionId', authorize('delete'), c.revokeUserPermission);

export default router;
