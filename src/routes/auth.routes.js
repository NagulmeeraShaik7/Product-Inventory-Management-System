import { Router } from 'express';
import AuthController from '../controllers/auth.controller.js';

const authRouter = Router();
const authController = new AuthController();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User login and JWT generation
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login and JWT token generation
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Missing username or password.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Username and password are required.
 *       401:
 *         description: Invalid username or password.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid credentials.
 *       500:
 *         description: Server error.
 */

authRouter.post('/login', authController.login);

export default authRouter;
