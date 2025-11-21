import { Router } from 'express';
import ProductController from '../controllers/Product.controller.js';
import ProductUseCase from '../usecases/product.usecase.js';
import ProductRepository from '../repositories/product.repository.js';
import InventoryLogRepository from '../repositories/inventory-log.repository.js';
import { uploadCsv } from '../middlewares/upload.middleware.js';
import { protect } from '../middlewares/auth.middleware.js';

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product and Inventory Management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         unit:
 *           type: string
 *         category:
 *           type: string
 *         brand:
 *           type: string
 *         stock:
 *           type: integer
 *         status:
 *           type: string
 *         image:
 *           type: string
 *           nullable: true
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 *
 *     InventoryLog:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         productId:
 *           type: integer
 *         oldStock:
 *           type: integer
 *         newStock:
 *           type: integer
 *         changedBy:
 *           type: string
 *         timestamp:
 *           type: string
 */

/**
 * @swagger
 * /products/import:
 *   post:
 *     summary: Import products via CSV
 *     description: Upload a CSV file to bulk-import new products. Duplicate names (case-insensitive) will be skipped.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: CSV file containing product data
 *     responses:
 *       200:
 *         description: CSV processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 added:
 *                   type: number
 *                 skipped:
 *                   type: number
 *                 duplicates:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Invalid file or CSV error
 *       401:
 *         description: Unauthorized user
 */

/**
 * @swagger
 * /products/export:
 *   get:
 *     summary: Export all products to a CSV file
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Returns a downloadable CSV file
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products with pagination, search, and sorting
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by product name
 *       - in: query
 *         name: sortField
 *         schema:
 *           type: string
 *           enum: [name, stock, createdAt, updatedAt]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: number
 *                 page:
 *                   type: number
 *                 limit:
 *                   type: number
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update an existing product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */

/**
 * @swagger
 * /products/{id}/history:
 *   get:
 *     summary: Get inventory change history for a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Inventory log list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/InventoryLog'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */

const createProductRouter = (db) => {
    const router = Router();

    const productRepo = new ProductRepository(db);
    const logRepo = new InventoryLogRepository(db);
    const productUseCase = new ProductUseCase(productRepo, logRepo);
    const productController = new ProductController(productUseCase);

    router.post('/import', protect, uploadCsv, productController.importProducts);
    router.get('/export', productController.exportProducts);
    router.get('/', protect, productController.getProducts);
    router.put('/:id', protect, productController.updateProduct);
    router.get('/:id/history', protect, productController.getProductHistory);

    return router;
};

export default createProductRouter;
