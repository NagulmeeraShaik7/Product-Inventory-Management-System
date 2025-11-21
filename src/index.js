import express from 'express';
import 'dotenv/config'; 
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

import createProductRouter from './routes/product.routes.js';
import authRouter from './routes/auth.routes.js';
import { globalErrorHandler, AppError } from './utils/error-handler.js';

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || './inventory.db';

/**
 * SQL Schema for creating required database tables.
 *
 * - `products`: Stores product details and inventory stock.
 * - `inventory_logs`: Maintains stock change history with timestamps.
 *
 * Tables are created only if they do not already exist.
 *
 * @constant
 * @type {string}
 */
const CREATE_TABLES_SQL = `
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE COLLATE NOCASE,
        unit TEXT,
        category TEXT,
        brand TEXT,
        stock INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0),
        status TEXT,
        image TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS inventory_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        productId INTEGER NOT NULL,
        oldStock INTEGER NOT NULL,
        newStock INTEGER NOT NULL,
        changedBy TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(productId) REFERENCES products(id) ON DELETE CASCADE
    );
`;

/**
 * Establishes a connection to the SQLite database and initializes tables.
 *
 * @async
 * @function connectDB
 * @returns {Promise<import('sqlite').Database>} The SQLite database instance.
 * @throws {Error} When database connection or table initialization fails.
 *
 * @example
 * const db = await connectDB();
 */
const connectDB = async () => {
    try {
        const db = await open({
            filename: DB_PATH,
            driver: sqlite3.Database,
        });

        await db.exec(CREATE_TABLES_SQL);
        console.log('✅ SQLite DB connected and tables initialized.');
        return db;

    } catch (error) {
        console.error('❌ Error connecting to SQLite DB:', error.message);
        throw new Error('Database connection failed.'); 
    }
};

// --- Express Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Starts the Express server after the database has been initialized.
 *
 * Responsibilities:
 * - Connect to SQLite database
 * - Register authentication and product routes
 * - Handle undefined routes (404)
 * - Attach global error handler
 * - Start HTTP server
 *
 * @async
 * @function startServer
 * @returns {Promise<void>}
 *
 * @example
 * startServer();
 */
const startServer = async () => {
    try {
        const db = await connectDB();
        
        // Authentication Routes
        app.use('/api/auth', authRouter);
        
        // Product Routes (with DB injection)
        app.use('/api/products', createProductRouter(db));
        
        /**
         * Handles undefined routes and forwards to the global error handler.
         *
         * @example
         * GET /unknown-route → 404
         */
        app.use((req, res, next) => {
            next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
        });

        // Global Error Handler (must be last)
        app.use(globalErrorHandler);

        // Start listening for HTTP requests
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('FATAL ERROR: Server failed to start.', error);
        process.exit(1);
    }
};

startServer();
