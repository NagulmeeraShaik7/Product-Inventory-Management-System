import InventoryLogUseCase from '../usecases/inventory-log.usecase.js';
import { AppError } from '../utils/error-handler.js';

describe('InventoryLogUseCase', () => {
    let mockLogRepo;
    let mockProductRepo;
    let useCase;

    beforeEach(() => {
        mockLogRepo = {
            findLogsByProductId: jest.fn()
        };

        mockProductRepo = {
            findById: jest.fn()
        };

        useCase = new InventoryLogUseCase(mockLogRepo, mockProductRepo);
    });

    // -------------------------------------------------------------------------
    // TEST: Should return logs if product exists
    // -------------------------------------------------------------------------
    test('✔ Should return product history when product exists', async () => {
        const sampleLogs = [
            { id: 1, oldStock: 10, newStock: 20 },
            { id: 2, oldStock: 20, newStock: 25 }
        ];

        mockProductRepo.findById.mockResolvedValue({ id: 5, name: 'Rice' });
        mockLogRepo.findLogsByProductId.mockResolvedValue(sampleLogs);

        const result = await useCase.getProductHistory(5);

        expect(mockProductRepo.findById).toHaveBeenCalledWith(5);
        expect(mockLogRepo.findLogsByProductId).toHaveBeenCalledWith(5);
        expect(result).toEqual(sampleLogs);
    });

    // -------------------------------------------------------------------------
    // TEST: Should throw AppError if product does NOT exist
    // -------------------------------------------------------------------------
    test('❌ Should throw AppError(404) if product does not exist', async () => {
        mockProductRepo.findById.mockResolvedValue(null);

        await expect(useCase.getProductHistory(99))
            .rejects
            .toEqual(new AppError('Product not found.', 404));

        expect(mockProductRepo.findById).toHaveBeenCalledWith(99);
        expect(mockLogRepo.findLogsByProductId).not.toHaveBeenCalled();
    });
});
