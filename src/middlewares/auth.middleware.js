import jwt from 'jsonwebtoken';
import { AppError } from '../utils/error-handler.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

/**
 * Middleware to protect routes by validating a JWT token.
 *
 * This middleware:
 * - Checks for a token in the Authorization header (`Bearer <token>`)
 * - Verifies the token using JWT_SECRET
 * - Attaches user information to `req.user`
 * - Throws meaningful errors for missing, invalid, or expired tokens
 *
 * @function protect
 * @memberof Middleware
 *
 * @param {import('express').Request} req - Express request object containing authorization header.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Next middleware function.
 *
 * @returns {void}
 *
 * @throws {AppError} If token is missing, invalid, or expired.
 *
 * @example
 * // Usage in routes:
 * router.get('/products', protect, productController.getProducts);
 */
export const protect = (req, res, next) => {
    try {
        let token;

        // Extract token from Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // If no token found
        if (!token) {
            return next(new AppError('Authentication required. Please log in.', 401));
        }

        /**
         * Decoded JWT payload.
         * @type {{ id: number, iat: number, exp: number }}
         */
        const decoded = jwt.verify(token, JWT_SECRET);

        /**
         * Attach authenticated user to the request object.
         * For this application, the user is always the admin.
         */
        req.user = {
            id: decoded.id,
            email: process.env.ADMIN_USERNAME,
            role: 'admin' 
        };

        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return next(new AppError('Invalid token. Please log in again.', 401));
        }
        if (error.name === 'TokenExpiredError') {
            return next(new AppError('Your token has expired! Please log in again.', 401));
        }
        next(error);
    }
};
