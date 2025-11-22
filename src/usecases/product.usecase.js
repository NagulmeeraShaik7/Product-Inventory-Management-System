import { AppError } from '../utils/error-handler.js';

/**
 * Use case class containing business logic for product management.
 */
class ProductUseCase {
    /**
     * Creates an instance of ProductUseCase.
     *
     * @param {object} productRepo - Repository for performing product CRUD operations.
     * @param {object} logRepo - Repository for creating and retrieving inventory log entries.
     */
    constructor(productRepo, logRepo) {
        this.productRepo = productRepo;
        this.logRepo = logRepo;
    }

    /**
     * Validates product input data.
     *
     * @private
     * @param {object} data - The incoming product data.
     * @throws {AppError} If a required field is missing or stock is invalid.
     */
    _validateProductData(data) {
        const requiredFields = ['name', 'unit', 'category', 'brand', 'status'];
        for (const field of requiredFields) {
            if (data[field] === undefined || data[field] === null || String(data[field]).trim() === '') {
                throw new AppError(`Product field '${field}' is required.`, 400);
            }
        }

        const stock = Number(data.stock);
        if (isNaN(stock) || stock < 0) {
            throw new AppError('Stock must be a non-negative number.', 400);
        }
    }

    /**
     * Imports a list of product records from CSV data.
     *
     * @async
     * @param {Array<object>} csvData - Array of product objects parsed from CSV.
     * @returns {Promise<object>} Stats object containing added, skipped, and duplicate tracking details.
     */
    async importProducts(csvData) {
        const stats = { added: 0, skipped: 0, duplicates: [] };

        for (const productData of csvData) {
            try {
                this._validateProductData(productData);

                const existingProduct = await this.productRepo.findByName(productData.name);

                if (existingProduct) {
                    stats.skipped++;
                    stats.duplicates.push({
                        name: productData.name,
                        existingId: existingProduct.id,
                    });
                } else {
                    await this.productRepo.create(productData);
                    stats.added++;
                }
            } catch (error) {
                console.warn(`Skipping row for product ${productData.name || 'unknown'}: ${error.message}`);
                stats.skipped++;
            }
        }

        return stats;
    }

    /**
     * Updates a product and logs inventory changes when stock is modified.
     *
     * @async
     * @param {number|string} id - Product ID to update.
     * @param {object} updateData - Updated product fields.
     * @param {string} changedBy - User performing the update (from req.user.email).
     * @returns {Promise<object>} Updated product object.
     * @throws {AppError} If product is not found or validation fails.
     */
    async updateProduct(id, updateData, changedBy) {
        this._validateProductData(updateData);
        
        const existingProduct = await this.productRepo.findById(id);
        if (!existingProduct) {
            throw new AppError('Product not found.', 404);
        }

        // Prevent name duplication
        const productByName = await this.productRepo.findByName(updateData.name);
        if (productByName && productByName.id !== existingProduct.id) {
            throw new AppError(`Product name '${updateData.name}' already exists.`, 400);
        }

        // Inventory logging
        const oldStock = existingProduct.stock;
        const newStock = Number(updateData.stock);

        if (oldStock !== newStock) {
            await this.logRepo.createLog({
                productId: id,
                oldStock,
                newStock,
                changedBy,
            });
        }
        
        return this.productRepo.update(id, updateData);
    }

    /**
     * Retrieves products with search, sorting, and pagination support.
     *
     * @async
     * @param {object} params - Query parameters for filtering, sorting, and pagination.
     * @param {number|string} params.page - Current page number.
     * @param {number|string} params.limit - Number of items per page.
     * @param {string} [params.name] - Optional product name filter.
     * @param {string} [params.sort] - Sorting field.
     * @param {string} [params.order] - Sorting order (ASC/DESC).
     *
     * @returns {Promise<object>} Paginated response containing product data and metadata.
     */
    async getProducts(params) {
        const { page = 1, limit = 10, name: searchName, sort, order } = params;
        
        const offset = (Number(page) - 1) * Number(limit);
        const products = await this.productRepo.findAll({
            limit: Number(limit),
            offset: offset,
            searchName,
            sortField: sort,
            sortOrder: order,
        });

        const totalCount = await this.productRepo.getProductCount(searchName);
        const totalPages = Math.ceil(totalCount / Number(limit));

        return {
            data: products,
            pagination: {
                totalItems: totalCount,
                totalPages,
                currentPage: Number(page),
                limit: Number(limit),
            },
        };
    }

    /**
     * Retrieves the inventory log history for a specific product.
     *
     * @async
     * @param {number|string} productId - ID of the product.
     * @returns {Promise<Array>} List of inventory log entries.
     * @throws {AppError} If the product does not exist.
     */
    async getProductHistory(productId) {
        const product = await this.productRepo.findById(productId);
        if (!product) {
            throw new AppError('Product not found.', 404);
        }
        return this.logRepo.findLogsByProductId(productId);
    }

    /**
     * Retrieves all products without filtering (used for CSV export).
     *
     * @async
     * @returns {Promise<Array>} List of all product records.
     */
    async getAllProducts() {
        return this.productRepo.findAll({});
    }
}

export default ProductUseCase;
