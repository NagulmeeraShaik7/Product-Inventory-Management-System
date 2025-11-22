import multer from 'multer';

/**
 * Multer memory storage used for storing the uploaded file in memory.
 * This allows direct access to the file buffer for CSV parsing.
 */
const storage = multer.memoryStorage();

/**
 * File filter function used by multer to ensure only CSV files are uploaded.
 *
 * @param {import('express').Request} req - The incoming Express request.
 * @param {Express.Multer.File} file - The uploaded file metadata.
 * @param {Function} cb - Callback function to determine file acceptance.
 *
 * @returns {void}
 *
 * @example
 * // Accepts:
 * file.mimetype: "text/csv"
 * file.originalname: "products.csv"
 */
const csvFilter = (req, file, cb) => {
    if (file.mimetype.includes('csv') || file.originalname.endsWith('.csv')) {
        cb(null, true);
    } else {
        cb(new Error("Please upload only CSV file."), false);
    }
};

/**
 * Multer instance configured to:
 * - Use memory storage
 * - Accept only CSV files
 * - Restrict file size to 5MB
 *
 * @type {multer.Multer}
 */
const upload = multer({
    storage: storage,
    fileFilter: csvFilter,
    limits: { fileSize: 1024 * 1024 * 5 }, // 5MB limit
});

/**
 * Middleware to handle CSV uploads and normalize the uploaded file.
 *
 * This middleware:
 * - Uses `upload.any()` to accept a file regardless of field name
 * - Prevents "Unexpected field" errors
 * - Normalizes the first uploaded file to `req.file`
 * - Allows controllers to behave as if `upload.single('file')` was used
 *
 * @function uploadCsv
 * @memberof Middleware
 *
 * @param {import('express').Request} req - Incoming request containing file data.
 * @param {import('express').Response} res - Express response.
 * @param {import('express').NextFunction} next - Next middleware handler.
 *
 * @returns {void}
 *
 * @example
 * // Usage in routes:
 * router.post('/products/import', uploadCsv, productController.importProducts);
 *
 * @example
 * // In controller:
 * console.log(req.file.buffer); // Direct access to CSV data
 */
export const uploadCsv = (req, res, next) => {
    // Use multer.any() to accept files from any field name
    const anyMiddleware = upload.any();

    anyMiddleware(req, res, (err) => {
        if (err) return next(err);

        if (req.files && req.files.length > 0) {
            /**
             * Normalize the uploaded file so controllers
             * can access it via req.file.
             *
             * @type {Express.Multer.File}
             */
            req.file = req.files[0];
        }

        next();
    });
};
