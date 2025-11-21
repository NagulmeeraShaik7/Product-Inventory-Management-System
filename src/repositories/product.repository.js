// NOTE: db connection is passed in/injected for dependency inversion

/**
 * Repository responsible for handling all product-related database operations.
 *
 * Provides methods for:
 * - Filtering, sorting, and paginated listing of products
 * - CRUD operations (create, read, update)
 * - Duplicate checking by name
 * - Counting products for pagination
 *
 * @class ProductRepository
 */
class ProductRepository {
    /**
     * Creates a ProductRepository instance.
     *
     * @param {import('sqlite3').Database} db - SQLite database instance.
     */
    constructor(db) {
        this.db = db;
    }

    /**
     * Retrieves all products with filtering, sorting, and pagination support.
     *
     * @async
     * @function findAll
     * @memberof ProductRepository
     *
     * @param {object} params - Query parameters.
     * @param {number} [params.limit] - Max records per page (pagination).
     * @param {number} [params.offset] - Offset for pagination.
     * @param {string} [params.searchName] - Case-insensitive name search query.
     * @param {string} [params.sortField] - Field to sort by (`name`, `stock`, `updatedAt`, `createdAt`).
     * @param {string} [params.sortOrder] - Sort direction (`ASC` or `DESC`).
     *
     * @returns {Promise<Array<object>>} List of matching products.
     *
     * @example
     * const products = await repo.findAll({
     *   limit: 10,
     *   offset: 0,
     *   searchName: "oil",
     *   sortField: "name",
     *   sortOrder: "ASC"
     * });
     */
    async findAll({ limit, offset, searchName, sortField, sortOrder }) {
        let sql = 'SELECT * FROM products';
        const params = [];

        // Search filter
        if (searchName) {
            sql += ' WHERE name LIKE ?';
            params.push(`%${searchName}%`);
        }

        // Sorting
        if (sortField && ['name', 'stock', 'updatedAt', 'createdAt'].includes(sortField)) {
            const order = sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
            sql += ` ORDER BY ${sortField} ${order}`;
        } else {
            sql += ' ORDER BY updatedAt DESC';
        }

        // Pagination
        if (limit !== undefined && offset !== undefined) {
            sql += ' LIMIT ? OFFSET ?';
            params.push(limit, offset);
        }

        return this.db.all(sql, params);
    }

    /**
     * Retrieves a single product by its ID.
     *
     * @async
     * @function findById
     * @memberof ProductRepository
     *
     * @param {number} id - Product ID.
     *
     * @returns {Promise<object|null>} Product record or null if not found.
     *
     * @example
     * const product = await repo.findById(5);
     */
    async findById(id) {
        return this.db.get('SELECT * FROM products WHERE id = ?', [id]);
    }

    /**
     * Retrieves a product by name (case-insensitive).
     *
     * Used for duplicate checks during import or update operations.
     *
     * @async
     * @function findByName
     * @memberof ProductRepository
     *
     * @param {string} name - Product name.
     *
     * @returns {Promise<object|null>} Matching product or null.
     */
    async findByName(name) {
        return this.db.get('SELECT * FROM products WHERE name = ? COLLATE NOCASE', [name]);
    }

    /**
     * Creates a new product record in the database.
     *
     * @async
     * @function create
     * @memberof ProductRepository
     *
     * @param {object} productData - Product payload.
     * @param {string} productData.name
     * @param {string} productData.unit
     * @param {string} productData.category
     * @param {string} productData.brand
     * @param {number} [productData.stock=0]
     * @param {string} productData.status
     * @param {string|null} [productData.image]
     *
     * @returns {Promise<object>} Newly created product.
     *
     * @example
     * const newProduct = await repo.create({
     *   name: "Rice",
     *   unit: "Kg",
     *   category: "Food",
     *   brand: "BestFoods",
     *   stock: 100,
     *   status: "active"
     * });
     */
    async create(productData) {
        const { name, unit, category, brand, stock, status, image } = productData;
        const result = await this.db.run(
            `INSERT INTO products (name, unit, category, brand, stock, status, image)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [name, unit, category, brand, stock || 0, status, image || null]
        );
        return this.findById(result.lastID);
    }

    /**
     * Updates an existing product by its ID.
     *
     * @async
     * @function update
     * @memberof ProductRepository
     *
     * @param {number} id - Product ID to update.
     * @param {object} productData - Updated fields.
     * @param {string} productData.name
     * @param {string} productData.unit
     * @param {string} productData.category
     * @param {string} productData.brand
     * @param {number} productData.stock
     * @param {string} productData.status
     * @param {string|null} productData.image
     *
     * @returns {Promise<object>} Updated product.
     *
     * @example
     * const updated = await repo.update(3, { name: "New Name", stock: 50 });
     */
    async update(id, productData) {
        const { name, unit, category, brand, stock, status, image } = productData;

        await this.db.run(
            `UPDATE products SET name = ?, unit = ?, category = ?, brand = ?, stock = ?, 
             status = ?, image = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
            [name, unit, category, brand, stock, status, image || null, id]
        );

        return this.findById(id);
    }

    /**
     * Counts total products (with optional search filter) for pagination metadata.
     *
     * @async
     * @function getProductCount
     * @memberof ProductRepository
     *
     * @param {string|null} [searchName=null] - Optional name filter.
     *
     * @returns {Promise<number>} Number of matching products.
     *
     * @example
     * const count = await repo.getProductCount("oil");
     */
    async getProductCount(searchName = null) {
        let sql = 'SELECT COUNT(*) AS count FROM products';
        const params = [];

        if (searchName) {
            sql += ' WHERE name LIKE ?';
            params.push(`%${searchName}%`);
        }

        const row = await this.db.get(sql, params);
        return row.count;
    }
}

export default ProductRepository;
