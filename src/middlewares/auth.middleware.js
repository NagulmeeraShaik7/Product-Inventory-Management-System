import jwt from 'jsonwebtoken';
import { AppError } from '../utils/error-handler.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

/**
 * Middleware to protect routes by checking for a valid JWT.
 */
export const protect = (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return next(new AppError('Authentication required. Please log in.', 401));
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Attach simple admin info for logging (Task 5)
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