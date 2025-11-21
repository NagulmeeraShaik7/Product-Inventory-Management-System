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

// --- Database Connection and Schema ---

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

// --- Server Startup Logic ---

// Middleware
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

const startServer = async () => {
    try {
        const db = await connectDB();
        
        // 1. Auth Route (Login)
        app.use('/api/auth', authRouter); 
        
        // 2. Product Routes (Requires DB injection)
        app.use('/api/products', createProductRouter(db));
        
        // 3. Handle unhandled routes (404)
            app.use((req, res, next) => {
            next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
        });

        // 4. Global Error Handler (must be the last middleware)
        app.use(globalErrorHandler);

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('FATAL ERROR: Server failed to start.', error);
        process.exit(1);
    }
};

startServer();