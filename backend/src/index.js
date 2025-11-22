import express from 'express';
import 'dotenv/config'; 
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

import createProductRouter from './routes/product.routes.js';
import authRouter from './routes/auth.routes.js';
import { globalErrorHandler, AppError } from './utils/error-handler.js';
import cors from 'cors';
// Swagger setup
import { setupSwagger } from './infrastructures/config/swagger.config.js';

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || './inventory.db';

/**
 * SQL Schema for creating required database tables.
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

// CORS configuration: allow any origin by reflecting the request origin.
// This supports browsers sending credentials while still allowing any domain.
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

/**
 * Starts the Express server after the database has been initialized.
 */
const startServer = async () => {
    try {
        const db = await connectDB();
        
        // Authentication Routes
        app.use('/api/auth', authRouter);
        
        // Product Routes (with DB injection)
        app.use('/api/products', createProductRouter(db));

        // Swagger UI (mount before 404 handler)
        setupSwagger(app, process.env.SWAGGER_PATH || '/api-docs');

        /**
         * 👉 Root route (Fix for Render health checks)
         */
        app.get('/', (req, res) => {
            res.status(200).json({
                status: 'success',
                message: 'Inventory Management API is running!'
            });
        });

        /**
         * 👉 Prevent favicon 404 spam
         */
        app.get('/favicon.ico', (req, res) => res.status(204).end());

        /**
         * Undefined route handler (404)
         */
        app.use((req, res, next) => {
            next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
        });

        // Global Error Handler (must be last)
        app.use(globalErrorHandler);

        // Start HTTP Server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('FATAL ERROR: Server failed to start.', error);
        process.exit(1);
    }
};

startServer();
