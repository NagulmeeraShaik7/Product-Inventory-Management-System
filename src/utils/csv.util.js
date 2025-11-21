import { Readable } from 'stream';
import csv from 'csv-parser';
import { stringify } from 'csv-stringify';
import { AppError } from '../utils/error-handler.js';

/**
 * Parses a CSV file buffer into JSON objects.
 *
 * This function converts a file buffer into a readable stream and processes it
 * using `csv-parser`. All CSV headers are normalized (lowercase + trimmed)
 * to match database column naming conventions.
 *
 * @function parseCsv
 * @param {Buffer} fileBuffer - The raw CSV file buffer uploaded by the client.
 * @returns {Promise<Object[]>} A promise that resolves to an array of parsed CSV row objects.
 *
 * @throws {AppError} If parsing fails due to invalid CSV structure or stream errors.
 *
 * @example
 * const rows = await parseCsv(fileBuffer);
 * console.log(rows[0].name); // Access parsed fields
 */
export const parseCsv = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const results = [];
        const bufferStream = Readable.from(fileBuffer);

        bufferStream
            .pipe(csv({
                mapHeaders: ({ header }) => header.toLowerCase().trim()
            }))
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (error) =>
                reject(new AppError('Failed to parse CSV file: ' + error.message, 400))
            );
    });
};

/**
 * Generates a CSV string from an array of objects.
 *
 * This function converts JSON data into a CSV-formatted string using a predefined
 * column order to ensure consistent exports.
 *
 * @function generateCsv
 * @param {Object[]} data - Array of objects to be converted into CSV format.
 * @returns {Promise<string>} A promise that resolves to the generated CSV string.
 *
 * @throws {AppError} If CSV generation fails.
 *
 * @example
 * const csvText = await generateCsv(data);
 * res.setHeader('Content-Type', 'text/csv');
 * res.send(csvText);
 */
export const generateCsv = (data) => {
    const columns = [
        'id', 'name', 'unit', 'category', 'brand',
        'stock', 'status', 'image', 'createdAt', 'updatedAt'
    ];

    return new Promise((resolve, reject) => {
        stringify(data, { header: true, columns }, (err, output) => {
            if (err) {
                return reject(new AppError('Failed to generate CSV data.', 500));
            }
            resolve(output);
        });
    });
};
