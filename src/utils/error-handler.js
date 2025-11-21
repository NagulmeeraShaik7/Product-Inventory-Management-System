/**
 * Custom Error Class for handling operational (expected) errors.
 *
 * Operational errors include issues such as invalid input, missing resources,
 * or business-rule validation errors. These are predictable and should be
 * sent to the client with meaningful messages.
 *
 * @class AppError
 * @extends Error
 *
 * @property {number} statusCode - HTTP status code associated with the error.
 * @property {string} status - Status string: 'fail' for 4xx, 'error' for 5xx.
 * @property {boolean} isOperational - Flag indicating this is an expected (safe) error.
 *
 * @example
 * throw new AppError('Product not found', 404);
 */
export class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Express Global Error Handling Middleware.
 *
 * This middleware intercepts all errors thrown inside routes & controllers.
 * It distinguishes between:
 * - Operational errors (AppError): send meaningful messages to the client.
 * - Programming or unknown errors: send a generic message to avoid leaking details.
 *
 * @function globalErrorHandler
 * @param {Error} err - The thrown error object.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 * @returns {void}
 *
 * @example
 * app.use(globalErrorHandler);
 */
export const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log the error internally for debugging (not sent to client)
    console.error('GLOBAL ERROR:', err);

    // If it's an expected operational error → send clean response
    if (err.isOperational || err.statusCode < 500) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }

    // Unknown or programming error → send generic 500 response
    res.status(500).json({
        status: 'error',
        message: 'Something went very wrong! Please try again later.',
    });
};
