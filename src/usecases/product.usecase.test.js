import ProductUseCase from '../usecases/product.usecase.js';
import { AppError } from '../utils/error-handler.js';

describe('ProductUseCase', () => {
    let productRepo;
    let logRepo;
    let useCase;

    beforeEach(() => {
        productRepo = {
            findById: jest.fn(),
            findByName: jest.fn(),
            findAll: jest.fn(),
            getProductCount: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        };

        logRepo = {
            createLog: jest.fn(),
            findLogsByProductId: jest.fn(),
        };

        useCase = new ProductUseCase(productRepo, logRepo);
    });

    // -------------------------------------------------------------------------
    // _validateProductData (private)
    // -------------------------------------------------------------------------
    test('❌ Should throw if required fields are missing', () => {
        const invalid = { name: '', unit: 'kg', category: 'food', brand: 'abc', status: 'active', stock: 10 };

        expect(() => useCase._validateProductData(invalid))
            .toThrow(new AppError("Product field 'name' is required.", 400));
    });

    test('❌ Should throw if stock is invalid', () => {
        const invalid = { name: 'Rice', unit: 'kg', category: 'food', brand: 'abc', status: 'active', stock: -1 };

        expect(() => useCase._validateProductData(invalid))
            .toThrow(new AppError('Stock must be a non-negative number.', 400));
    });

    // -------------------------------------------------------------------------
    // importProducts()
    // -------------------------------------------------------------------------
    test('✔ Should import products and track duplicates & skipped rows', async () => {
        const csvData = [
            { name: 'Rice', unit: 'kg', category: 'food', brand: 'abc', status: 'active', stock: 10 },
            { name: 'Oil', unit: 'ltr', category: 'food', brand: 'xyz', status: 'active', stock: 5 },
            { name: 'Oil', unit: 'ltr', category: 'food', brand: 'xyz', status: 'active', stock: 5 }, // duplicate
        ];

        productRepo.findByName
            .mockResolvedValueOnce(null) // Rice new
            .mockResolvedValueOnce(null) // Oil new
            .mockResolvedValueOnce({ id: 99, name: 'Oil' }); // duplicate

        productRepo.create.mockResolvedValue({ id: 1 });

        const result = await useCase.importProducts(csvData);

        expect(result).toEqual({
            added: 2,
            skipped: 1,
            duplicates: [
                { name: 'Oil', existingId: 99 }
            ]
        });
    });

    // -------------------------------------------------------------------------
    // updateProduct()
    // -------------------------------------------------------------------------
    test('❌ Should throw error when updating non-existing product', async () => {
        productRepo.findById.mockResolvedValue(null);

        await expect(useCase.updateProduct(5, {
            name: 'Rice', unit: 'Kg', category: 'food', brand: 'abc', status: 'active', stock: 10
        }, 'user@example.com')).rejects.toEqual(new AppError('Product not found.', 404));
    });

    test('❌ Should throw error when updating to an existing product name', async () => {
        productRepo.findById.mockResolvedValue({ id: 5, name: 'Old Rice', stock: 5 });

        productRepo.findByName.mockResolvedValue({ id: 10, name: 'Rice' });

        await expect(useCase.updateProduct(5, {
            name: 'Rice', unit: 'Kg', category: 'food', brand: 'abc', status: 'active', stock: 10
        }, 'user@example.com')).rejects.toEqual(
            new AppError("Product name 'Rice' already exists.", 400)
        );
    });

    test('✔ Should update product & log stock change when stock changes', async () => {
        productRepo.findById.mockResolvedValue({ id: 5, name: 'Rice', stock: 10 });
        productRepo.findByName.mockResolvedValue(null);
        productRepo.update.mockResolvedValue({ id: 5, name: 'Rice', stock: 20 });

        const result = await useCase.updateProduct(
            5,
            { name: 'Rice', unit: 'kg', category: 'food', brand: 'abc', status: 'active', stock: 20 },
            'admin@example.com'
        );

        expect(logRepo.createLog).toHaveBeenCalledWith({
            productId: 5,
            oldStock: 10,
            newStock: 20,
            changedBy: 'admin@example.com',
        });

        expect(productRepo.update).toHaveBeenCalled();
        expect(result).toEqual({ id: 5, name: 'Rice', stock: 20 });
    });

    test('✔ Should NOT log when stock does NOT change', async () => {
        productRepo.findById.mockResolvedValue({ id: 5, name: 'Rice', stock: 10 });
        productRepo.findByName.mockResolvedValue(null);

        productRepo.update.mockResolvedValue({ id: 5, stock: 10 });

        await useCase.updateProduct(
            5,
            { name: 'Rice', unit: 'kg', category: 'food', brand: 'abc', status: 'active', stock: 10 },
            'admin@example.com'
        );

        expect(logRepo.createLog).not.toHaveBeenCalled();
    });

    // -------------------------------------------------------------------------
    // getProducts()
    // -------------------------------------------------------------------------
    test('✔ Should return paginated products', async () => {
        productRepo.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);
        productRepo.getProductCount.mockResolvedValue(10);

        const result = await useCase.getProducts({ page: 1, limit: 2 });

        expect(result).toEqual({
            data: [{ id: 1 }, { id: 2 }],
            pagination: {
                totalItems: 10,
                totalPages: 5,
                currentPage: 1,
                limit: 2,
            }
        });
    });

    // -------------------------------------------------------------------------
    // getProductHistory()
    // -------------------------------------------------------------------------
    test('✔ Should return product history when product exists', async () => {
        productRepo.findById.mockResolvedValue({ id: 5 });
        logRepo.findLogsByProductId.mockResolvedValue([{ oldStock: 10, newStock: 20 }]);

        const result = await useCase.getProductHistory(5);

        expect(result).toEqual([{ oldStock: 10, newStock: 20 }]);
    });

    test('❌ Should throw if product history requested for non-existing product', async () => {
        productRepo.findById.mockResolvedValue(null);

        await expect(useCase.getProductHistory(99))
            .rejects
            .toEqual(new AppError('Product not found.', 404));
    });

    // -------------------------------------------------------------------------
    // getAllProducts()
    // -------------------------------------------------------------------------
    test('✔ Should return all products', async () => {
        productRepo.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);

        const result = await useCase.getAllProducts();

        expect(result).toEqual([{ id: 1 }, { id: 2 }]);
        expect(productRepo.findAll).toHaveBeenCalledWith({});
    });
});
