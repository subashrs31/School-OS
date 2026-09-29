import { Router } from 'express';
import authorize from '../middleware/authorize.middleware';
import { validate, validateParams } from '../validators/validate';
import { idParamSchema } from '../validators/param.schema';
import { updateUserSchema, createUserSchema, updateProfileSchema, changePasswordSchema } from '../validators/user.schema';
import c from '../controllers/user.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /users/profile:
 *   put:
 *     tags: [Users]
 *     summary: Update current user profile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put('/profile', validate(updateProfileSchema), c.updateProfile);

/**
 * @swagger
 * /users/change-password:
 *   post:
 *     tags: [Users]
 *     summary: Change current user password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed
 */
router.post('/change-password', validate(changePasswordSchema), c.changePassword);


/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users
 *     responses:
 *       200:
 *         description: List of users
 *   post:
 *     tags: [Users]
 *     summary: Create a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: User created
 */
router.get('/', authorize('view'), c.getUsers);
router.post('/', authorize('create'), validate(createUserSchema), c.createUser);

/**
 * @swagger
 * /users/validate-import:
 *   post:
 *     tags: [Users]
 *     summary: Validate user import file
 *     responses:
 *       200:
 *         description: Validation result
 */
router.post('/validate-import', authorize('create'), c.validateImport);

/**
 * @swagger
 * /users/import:
 *   post:
 *     tags: [Users]
 *     summary: Import users
 *     responses:
 *       200:
 *         description: Import result
 */
router.post('/import', authorize('create'), c.importUsers);

/**
 * @swagger
 * /users/status-change/{id}:
 *   post:
 *     tags: [Users]
 *     summary: Toggle user status
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Status updated
 */
router.post('/status-change/:id', authorize('edit'), validateParams(idParamSchema), c.updateUserStatus);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User data
 *       404:
 *         description: Not found
 *   put:
 *     tags: [Users]
 *     summary: Update user
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
 *         description: User updated
 *   delete:
 *     tags: [Users]
 *     summary: Delete user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted
 */
router.get('/:id', authorize('view'), validateParams(idParamSchema), c.getUser);
router.put('/:id', authorize('edit'), validateParams(idParamSchema), validate(updateUserSchema), c.updateUser);
router.delete('/:id', authorize('delete'), validateParams(idParamSchema), c.deleteUser);

export default router;
