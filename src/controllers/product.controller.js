import { parseCsv, generateCsv } from '../utils/csv.util.js';
import { AppError } from '../utils/error-handler.js';

class ProductController {
    constructor(productUseCase) {
        this.productUseCase = productUseCase;
    }

    // --- 3. GET /api/products ---
    getProducts = async (req, res, next) => {
        try {
            const productsData = await this.productUseCase.getProducts(req.query);
            res.status(200).json({ status: 'success', ...productsData });
        } catch (error) {
            next(error);
        }
    };
    
    // --- 1. POST /api/products/import ---
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
    
    // --- 2. GET /api/products/export ---
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
    
    // --- 4. PUT /api/products/:id ---
    updateProduct = async (req, res, next) => {
        try {
            const { id } = req.params;
            const updateData = req.body;
            
            // Get user information from the protected route middleware (req.user)
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
    
    // --- 5. GET /api/products/:id/history ---
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