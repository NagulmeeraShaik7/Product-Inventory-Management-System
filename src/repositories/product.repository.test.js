import ProductRepository from '../repositories/product.repository.js';

describe('ProductRepository', () => {
    let mockDb;
    let repo;

    beforeEach(() => {
        mockDb = {
            all: jest.fn(() => Promise.resolve([])),
            get: jest.fn(() => Promise.resolve(null)),
            run: jest.fn(() => Promise.resolve({ lastID: 1 }))
        };

        repo = new ProductRepository(mockDb);
    });

    // -----------------------------------------------------------------------
    // TEST: findAll()
    // -----------------------------------------------------------------------
    describe('findAll', () => {
        test('should build SQL with searchName, sort, and pagination', async () => {
            await repo.findAll({
                limit: 10,
                offset: 0,
                searchName: 'oil',
                sortField: 'name',
                sortOrder: 'ASC'
            });

            expect(mockDb.all).toHaveBeenCalledTimes(1);

            const [sql, params] = mockDb.all.mock.calls[0];

            expect(sql).toContain('SELECT * FROM products');
            expect(sql).toContain('WHERE name LIKE ?');
            expect(sql).toContain('ORDER BY name ASC');
            expect(sql).toContain('LIMIT ? OFFSET ?');

            expect(params).toEqual(['%oil%', 10, 0]);
        });

        test('should use default sort (updatedAt DESC) when no sort is provided', async () => {
            await repo.findAll({});

            const [sql] = mockDb.all.mock.calls[0];
            expect(sql).toContain('ORDER BY updatedAt DESC');
        });

        test('should return result from database', async () => {
            mockDb.all.mockResolvedValue([{ id: 1, name: 'Test' }]);

            const result = await repo.findAll({});
            expect(result).toEqual([{ id: 1, name: 'Test' }]);
        });
    });

    // -----------------------------------------------------------------------
    // TEST: findById()
    // -----------------------------------------------------------------------
    describe('findById', () => {
        test('should call db.get with correct SQL and params', async () => {
            mockDb.get.mockResolvedValue({ id: 5, name: 'Rice' });

            const result = await repo.findById(5);

            expect(mockDb.get).toHaveBeenCalledWith(
                'SELECT * FROM products WHERE id = ?',
                [5]
            );

            expect(result).toEqual({ id: 5, name: 'Rice' });
        });
    });

    // -----------------------------------------------------------------------
    // TEST: findByName()
    // -----------------------------------------------------------------------
    describe('findByName', () => {
        test('should search using COLLATE NOCASE', async () => {
            mockDb.get.mockResolvedValue({ id: 2, name: 'oil' });

            const result = await repo.findByName('oil');

            expect(mockDb.get).toHaveBeenCalledWith(
                'SELECT * FROM products WHERE name = ? COLLATE NOCASE',
                ['oil']
            );

            expect(result).toEqual({ id: 2, name: 'oil' });
        });
    });

    // -----------------------------------------------------------------------
    // TEST: create()
    // -----------------------------------------------------------------------
    describe('create', () => {
        test('should insert product and return created record', async () => {
            mockDb.run.mockResolvedValue({ lastID: 10 });
            mockDb.get.mockResolvedValue({ id: 10, name: 'Milk' });

            const newProduct = await repo.create({
                name: 'Milk',
                unit: 'Litre',
                category: 'Dairy',
                brand: 'Amul',
                stock: 20,
                status: 'active',
                image: null
            });

            expect(mockDb.run).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO products'),
                ['Milk', 'Litre', 'Dairy', 'Amul', 20, 'active', null]
            );

            expect(newProduct).toEqual({ id: 10, name: 'Milk' });
        });

        test('should default stock to 0 if not provided', async () => {
            await repo.create({
                name: 'Sugar',
                unit: 'Kg',
                category: 'Food',
                brand: 'Local',
                status: 'active'
            });

            const params = mockDb.run.mock.calls[0][1];
            expect(params[4]).toBe(0); // stock = 0
        });
    });

    // -----------------------------------------------------------------------
    // TEST: update()
    // -----------------------------------------------------------------------
    describe('update', () => {
        test('should update product and return updated record', async () => {
            mockDb.get.mockResolvedValue({ id: 3, name: 'Updated Name' });

            const updated = await repo.update(3, {
                name: 'Updated Name',
                unit: 'Kg',
                category: 'Food',
                brand: 'BrandX',
                stock: 50,
                status: 'active',
                image: null
            });

            expect(mockDb.run).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE products SET'),
                ['Updated Name', 'Kg', 'Food', 'BrandX', 50, 'active', null, 3]
            );

            expect(updated).toEqual({ id: 3, name: 'Updated Name' });
        });
    });

    // -----------------------------------------------------------------------
    // TEST: getProductCount()
    // -----------------------------------------------------------------------
    describe('getProductCount', () => {
        test('should return total count without filter', async () => {
            mockDb.get.mockResolvedValue({ count: 20 });

            const result = await repo.getProductCount();
            expect(result).toBe(20);

            expect(mockDb.get).toHaveBeenCalledWith(
                'SELECT COUNT(*) AS count FROM products',
                []
            );
        });

        test('should apply searchName filter', async () => {
            mockDb.get.mockResolvedValue({ count: 5 });

            const result = await repo.getProductCount('rice');
            expect(result).toBe(5);

            expect(mockDb.get).toHaveBeenCalledWith(
                'SELECT COUNT(*) AS count FROM products WHERE name LIKE ?',
                ['%rice%']
            );
        });
    });
});
