import { parseCsv, generateCsv } from '../utils/csv.util.js';
import { AppError } from '../utils/error-handler.js';

/**
 * Controller handling all product-related HTTP requests.
 */
class ProductController {
    /**
     * Creates an instance of ProductController.
     *
     * @param {object} productUseCase - Use case/service layer for product operations.
     */
    constructor(productUseCase) {
        this.productUseCase = productUseCase;
    }

    /**
     * Retrieves products with pagination, filtering, and search options.
     *
     * @async
     * @function getProducts
     * @memberof ProductController
     *
     * @param {import('express').Request} req - Request containing query params for pagination & filtering.
     * @param {import('express').Response} res - Response returning product list and metadata.
     * @param {import('express').NextFunction} next - Error handler middleware.
     *
     * @returns {Promise<void>}
     */
    getProducts = async (req, res, next) => {
        try {
            const productsData = await this.productUseCase.getProducts(req.query);
            res.status(200).json({ status: 'success', ...productsData });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Imports products from an uploaded CSV file.
     *
     * Expected CSV columns:
     * - name, unit, category, brand, stock, status, image
     *
     * @async
     * @function importProducts
     * @memberof ProductController
     *
     * @param {import('express').Request} req - Request containing uploaded CSV file in `req.file`.
     * @param {import('express').Response} res - Response containing import statistics.
     * @param {import('express').NextFunction} next - Error handler middleware.
     *
     * @throws {AppError} If no CSV file is uploaded.
     *
     * @returns {Promise<void>}
     */
    importProducts = async (req, res, next) => {
        try {
            if (!req.file) {
                throw new AppError('No CSV file uploaded.', 400);
            }

            const products = await parseCsv(req.file.buffer);
            const stats = await this.productUseCase.importProducts(products);

            res.status(200).json({
                status: 'success',
                message: `${stats.added} products added, ${stats.skipped} skipped.`,
                ...stats,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Exports all products into a downloadable CSV file.
     *
     * @async
     * @function exportProducts
     * @memberof ProductController
     *
     * @param {import('express').Request} req - Request object.
     * @param {import('express').Response} res - Response sending CSV file.
     * @param {import('express').NextFunction} next - Error handler middleware.
     *
     * @returns {Promise<void>}
     */
    exportProducts = async (req, res, next) => {
        try {
            const products = await this.productUseCase.getAllProducts();
            const csvOutput = await generateCsv(products);

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="products_export.csv"');

            res.status(200).send(csvOutput);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Updates product data by ID and logs who made the change.
     *
     * @async
     * @function updateProduct
     * @memberof ProductController
     *
     * @param {import('express').Request} req - Request containing product ID and update data.
     * @param {import('express').Response} res - Response returning updated product details.
     * @param {import('express').NextFunction} next - Error handler middleware.
     *
     * @returns {Promise<void>}
     *
     * @example
     * PUT /api/products/14
     * {
     *   "name": "Updated Name",
     *   "stock": 500
     * }
     */
    updateProduct = async (req, res, next) => {
        try {
            const { id } = req.params;
            const updateData = req.body;

            /**
             * User who performed the edit (from authentication middleware).
             * @type {string}
             */
            const changedBy = req.user?.email || 'unknown_user';

            const updatedProduct = await this.productUseCase.updateProduct(id, updateData, changedBy);

            res.status(200).json({
                status: 'success',
                data: updatedProduct,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Retrieves full history of changes made to a product.
     *
     * @async
     * @function getProductHistory
     * @memberof ProductController
     *
     * @param {import('express').Request} req - Request containing product ID.
     * @param {import('express').Response} res - Response returning product history.
     * @param {import('express').NextFunction} next - Error handler middleware.
     *
     * @returns {Promise<void>}
     */
    getProductHistory = async (req, res, next) => {
        try {
            const { id } = req.params;
            const history = await this.productUseCase.getProductHistory(id);

            res.status(200).json({
                status: 'success',
                data: history,
            });
        } catch (error) {
            next(error);
        }
    };
}

export default ProductController;
