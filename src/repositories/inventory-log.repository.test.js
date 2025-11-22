import InventoryLogRepository from './inventory-log.repository';

describe('InventoryLogRepository', () => {
    let mockDb;
    let repo;

    beforeEach(() => {
        mockDb = {
            run: jest.fn(() => Promise.resolve()),
            all: jest.fn(() => Promise.resolve([]))
        };

        repo = new InventoryLogRepository(mockDb);
    });

    // -------------------------------
    // TEST: createLog()
    // -------------------------------
    test('should insert a new inventory log with correct values', async () => {
        await repo.createLog({
            productId: 5,
            oldStock: 100,
            newStock: 120,
            changedBy: 'admin@test.com'
        });

        expect(mockDb.run).toHaveBeenCalledTimes(1);

        expect(mockDb.run).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO inventory_logs'),
            [5, 100, 120, 'admin@test.com']
        );
    });

    test('should default changedBy to "system" when not provided', async () => {
        await repo.createLog({
            productId: 2,
            oldStock: 30,
            newStock: 50
        });

        expect(mockDb.run).toHaveBeenCalledWith(
            expect.any(String),
            [2, 30, 50, 'system']
        );
    });

    // -------------------------------
    // TEST: findLogsByProductId()
    // -------------------------------
    test('should fetch logs by productId sorted by timestamp DESC', async () => {
        const fakeLogs = [
            { id: 1, productId: 10, oldStock: 10, newStock: 20, timestamp: '2024-01-01' }
        ];

        mockDb.all.mockResolvedValue(fakeLogs);

        const result = await repo.findLogsByProductId(10);

        expect(mockDb.all).toHaveBeenCalledTimes(1);

        expect(mockDb.all).toHaveBeenCalledWith(
            expect.stringContaining('SELECT * FROM inventory_logs'),
            [10]
        );

        expect(result).toEqual(fakeLogs);
    });

    test('should return empty array when no logs found', async () => {
        mockDb.all.mockResolvedValue([]);

        const result = await repo.findLogsByProductId(99);

        expect(result).toEqual([]);
    });
});
