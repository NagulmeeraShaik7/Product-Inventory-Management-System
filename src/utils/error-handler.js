/**
 * Custom Error Class for operational errors (client input/not found etc.).
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
 * Global Error Handler Middleware
 */
export const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log the error for internal review (helps debug unexpected 500s)
    console.error('GLOBAL ERROR:', err);

    // Send a controlled response for operational errors
    if (err.isOperational || err.statusCode < 500) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }

    // Send a generic error response for unknown/non-operational errors (500)
    res.status(500).json({
        status: 'error',
        message: 'Something went very wrong! Please try again later.',
    });
};