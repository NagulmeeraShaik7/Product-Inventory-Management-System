import multer from 'multer';

// Use in-memory storage to get the file buffer directly for parsing
const storage = multer.memoryStorage();

// File filter to ensure only CSV files are accepted
const csvFilter = (req, file, cb) => {
    if (file.mimetype.includes('csv') || file.originalname.endsWith('.csv')) {
        cb(null, true);
    } else {
        cb(new Error("Please upload only CSV file."), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: csvFilter,
    limits: { fileSize: 1024 * 1024 * 5 }, // 5MB limit
});

// Middleware to use in routes: accept any single file field and normalize to req.file
export const uploadCsv = (req, res, next) => {
    // Use multer.any() to avoid "Unexpected field" errors when the client uses a different
    // form field name. Then normalize the first file to req.file so controllers that expect
    // upload.single('file') behavior continue to work.
    const anyMiddleware = upload.any();
    anyMiddleware(req, res, (err) => {
        if (err) return next(err);

        if (req.files && req.files.length > 0) {
            // Normalize to the single-file API that controllers expect
            req.file = req.files[0];
        }

        next();
    });
};