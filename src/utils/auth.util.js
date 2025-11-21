import jwt from 'jsonwebtoken';
// NOTE: bcryptjs is omitted for this simple static check, 
// but is required for real password hashing.

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const JWT_EXPIRES_IN = '1d';

/**
 * Signs a JWT with the user ID.
 * @param {number} id - User identifier (e.g., 1 for Admin).
 * @returns {string} The signed JWT token.
 */
export const signToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
};