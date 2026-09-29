import { Router } from 'express';
import authorize from '../middleware/authorize.middleware';
import c from '../controllers/userRole.controller';

const router = Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: User Roles
 *   description: Manage roles assigned to users
 */

/**
 * @swagger
 * /iam/users/{userId}/roles:
 *   get:
 *     tags: [User Roles]
 *     summary: Get roles for a user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of roles
 *   post:
 *     tags: [User Roles]
 *     summary: Assign a role to a user
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
 *             required: [roleId]
 *             properties:
 *               roleId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Role assigned
 */
router.get('/', authorize('view'), c.getUserRoles);
router.post('/', authorize('create'), c.assignUserRole);

/**
 * @swagger
 * /iam/users/{userId}/roles/sync:
 *   post:
 *     tags: [User Roles]
 *     summary: Sync roles for a user
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
 *             required: [roleIds]
 *             properties:
 *               roleIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Roles synced
 */
router.post('/sync', authorize('edit'), c.syncUserRoles);

/**
 * @swagger
 * /iam/users/{userId}/roles/{roleId}:
 *   delete:
 *     tags: [User Roles]
 *     summary: Revoke a role from a user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Role revoked
 */
router.delete('/:roleId', authorize('delete'), c.revokeUserRole);

export default router;
