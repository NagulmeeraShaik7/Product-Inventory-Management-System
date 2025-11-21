import { signToken } from '../utils/auth.util.js';
import { AppError } from '../utils/error-handler.js';

/**
 * Admin username loaded from environment variables.
 * @type {string}
 */
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;

/**
 * Admin password loaded from environment variables.
 * @type {string}
 */
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

/**
 * Controller responsible for authentication-related operations.
 */
class AuthController {

    /**
     * Handles user login and issues a JWT token upon successful authentication.
     *
     * @async
     * @function login
     * @memberof AuthController
     *
     * @param {import('express').Request} req - Express request object containing user credentials.
     * @param {import('express').Response} res - Express response object used to send the JWT.
     * @param {import('express').NextFunction} next - Express next middleware function for error handling.
     *
     * @returns {Promise<void>} Sends JSON response with JWT token and user info.
     *
     * @throws {AppError} Throws an error if username or password is missing or invalid.
     *
     * @example
     * // Request Body:
     * {
     *   "username": "admin",
     *   "password": "password123"
     * }
     *
     * // Successful Response:
     * {
     *   "status": "success",
     *   "token": "jwt_token_here",
     *   "user": { "id": 1, "username": "admin" }
     * }
     */
    login = async (req, res, next) => {
        try {
            const { username, password } = req.body;

            // Validate required fields
            if (!username || !password) {
                return next(new AppError('Please provide username and password!', 400));
            }

            /**
             * Static credential validation.
             * In production, replace with DB user check + hashed password comparison (bcrypt).
             */
            const isMatch = (username === ADMIN_USERNAME && password === ADMIN_PASSWORD);

            if (!isMatch) {
                return next(new AppError('Incorrect username or password', 401));
            }

            /**
             * Generate JWT for admin user.
             * @type {string}
             */
            const token = signToken(1);

            res.status(200).json({
                status: 'success',
                token,
                user: { id: 1, username: ADMIN_USERNAME }
            });

        } catch (error) {
            next(error);
        }
    };
}

export default AuthController;
