import { AppError } from '../utils/error-handler.js';

class ProductUseCase {
    constructor(productRepo, logRepo) {
        this.productRepo = productRepo;
        this.logRepo = logRepo;
    }

    // --- Shared Validation ---
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

    // --- 1. CSV Import Logic ---
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

    // --- 4. Update Product with Logging (Task 5) ---
    async updateProduct(id, updateData, changedBy) {
        this._validateProductData(updateData);
        
        const existingProduct = await this.productRepo.findById(id);
        if (!existingProduct) {
            throw new AppError('Product not found.', 404);
        }

        // Unique name check (except for itself)
        const productByName = await this.productRepo.findByName(updateData.name);
        if (productByName && productByName.id !== existingProduct.id) {
            throw new AppError(`Product name '${updateData.name}' already exists.`, 400);
        }

        // Inventory History Tracking
        const oldStock = existingProduct.stock;
        const newStock = Number(updateData.stock);

        if (oldStock !== newStock) {
            await this.logRepo.createLog({
                productId: id,
                oldStock,
                newStock,
                changedBy: changedBy, 
            });
        }
        
        return this.productRepo.update(id, updateData);
    }
    
    // --- 3. Get Products with Search/Pagination (Includes Bonus) ---
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
    
    // --- 5. Get History ---
    async getProductHistory(productId) {
        const product = await this.productRepo.findById(productId);
        if (!product) {
            throw new AppError('Product not found.', 404);
        }
        return this.logRepo.findLogsByProductId(productId);
    }
    
    // --- 2. CSV Export ---
    async getAllProducts() {
        return this.productRepo.findAll({});
    }
    
}

export default ProductUseCase;