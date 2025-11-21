import jwt from 'jsonwebtoken';
// NOTE: bcryptjs is omitted for this simple static check, 
// but is required for real password hashing.

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const JWT_EXPIRES_IN = '1d';

/**
 * Generates a signed JSON Web Token (JWT) for authentication.
 *
 * @function signToken
 * @param {number|string} id - A unique identifier for the authenticated user (e.g., admin ID).
 * @returns {string} A signed JWT containing the user's ID in the payload.
 *
 * @example
 * const token = signToken(1);
 * console.log(token); // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *
 * @description
 * This function signs a JWT using the configured secret and embeds the user ID.
 * The token automatically expires based on `JWT_EXPIRES_IN` (default: 1 day).
 *
 * Make sure to:
 * - Use environment variables for JWT_SECRET in production.
 * - Store tokens securely on the client side.
 */
export const signToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
};
