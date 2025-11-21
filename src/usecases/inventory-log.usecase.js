import { AppError } from '../utils/error-handler.js';

class InventoryLogUseCase {
    constructor(logRepo, productRepo) {
        this.logRepo = logRepo;
        this.productRepo = productRepo;
    }

    /**
     * Retrieves the history for a given product ID.
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