import { Readable } from 'stream';
import csv from 'csv-parser';
import { stringify } from 'csv-stringify';
import { AppError } from '../utils/error-handler.js';

// --- CSV Parsing for Import ---
export const parseCsv = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const results = [];
        
        // Create a readable stream from the buffer
        const bufferStream = Readable.from(fileBuffer);

        bufferStream
            .pipe(csv({
                mapHeaders: ({ header }) => header.toLowerCase().trim() // Normalize headers to match DB columns
            }))
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (error) => reject(new AppError('Failed to parse CSV file: ' + error.message, 400)));
    });
};

// --- CSV Generation for Export ---
export const generateCsv = (data) => {
    // Define columns to ensure correct order in the exported CSV
    const columns = [
        'id', 'name', 'unit', 'category', 'brand', 'stock', 'status', 'image', 'createdAt', 'updatedAt'
    ];
    
    return new Promise((resolve, reject) => {
        stringify(data, { header: true, columns: columns }, (err, output) => {
            if (err) {
                return reject(new AppError('Failed to generate CSV data.', 500));
            }
            resolve(output);
        });
    });
};