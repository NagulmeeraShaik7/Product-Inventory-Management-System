import { AppError } from '../utils/error-handler.js';

/**
 * Use case responsible for retrieving product inventory log history.
 */
class InventoryLogUseCase {
    /**
     * Creates an instance of InventoryLogUseCase.
     * 
     * @param {object} logRepo - Repository used to fetch inventory log records.
     * @param {object} productRepo - Repository used to verify product existence.
     */
    constructor(logRepo, productRepo) {
        this.logRepo = logRepo;
        this.productRepo = productRepo;
    }

    /**
     * Retrieves inventory change history for a specific product.
     *
     * @async
     * @param {number|string} productId - The ID of the product whose history is requested.
     * @returns {Promise<Array>} Returns a list of inventory log entries.
     * 
     * @throws {AppError} If the product does not exist.
     */
    async getProductHistory(productId) {
        // Ensure product exists before fetching logs
        const product = await this.productRepo.findById(productId);
        if (!product) {
            throw new AppError('Product not found.', 404);
        }
        
        return this.logRepo.findLogsByProductId(productId);
    }
}

export default InventoryLogUseCase;
