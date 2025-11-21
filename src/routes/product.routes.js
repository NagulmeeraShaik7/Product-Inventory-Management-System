import { Router } from 'express';
import ProductController from '../controllers/Product.controller.js';
import ProductUseCase from '../usecases/product.usecase.js';
import ProductRepository from '../repositories/product.repository.js';
import InventoryLogRepository from '../repositories/inventory-log.repository.js';
import { uploadCsv } from '../middlewares/upload.middleware.js';
import { protect } from '../middlewares/auth.middleware.js'; // <-- NEW

const createProductRouter = (db) => {
    const router = Router();
    
    // Instantiate Repositories, Use Case, and Controller
    const productRepo = new ProductRepository(db);
    const logRepo = new InventoryLogRepository(db);
    const productUseCase = new ProductUseCase(productRepo, logRepo);
    const productController = new ProductController(productUseCase);

    // 1. CSV Import API (PROTECTED)
    router.post('/import', protect, uploadCsv, productController.importProducts);

    // 2. CSV Export API (Unprotected for simplicity, can be protected if needed)
    router.get('/export', productController.exportProducts);

    // 3. Get Products API (PROTECTED)
    router.get('/', protect, productController.getProducts);

    // 4. Update Product API (PROTECTED)
    router.put('/:id', protect, productController.updateProduct);

    // 5. Inventory History API (PROTECTED)
    router.get('/:id/history', protect, productController.getProductHistory);

    return router;
};

export default createProductRouter;