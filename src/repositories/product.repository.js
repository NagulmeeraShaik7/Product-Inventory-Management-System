// NOTE: db connection is passed in/injected for dependency inversion
class ProductRepository {
    constructor(db) {
        this.db = db;
    }

    /**
     * Retrieves a list of products with optional filtering, sorting, and pagination.
     * @param {object} params - Contains limit, offset, searchName, sortField, sortOrder.
     */
    async findAll({ limit, offset, searchName, sortField, sortOrder }) {
        let sql = 'SELECT * FROM products';
        const params = [];

        // 1. Simple search filtering by name (case-insensitive due to COLLATE NOCASE)
        if (searchName) {
            sql += ' WHERE name LIKE ?';
            params.push(`%${searchName}%`);
        }

        // 2. Simple sorting (Bonus)
        if (sortField && ['name', 'stock', 'updatedAt', 'createdAt'].includes(sortField)) {
             const order = sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
             sql += ` ORDER BY ${sortField} ${order}`;
        } else {
             // Default sort if no specific field is provided
             sql += ' ORDER BY updatedAt DESC';
        }

        // 3. Pagination (Bonus)
        if (limit !== undefined && offset !== undefined) {
            sql += ' LIMIT ? OFFSET ?';
            params.push(limit, offset);
        }
       
        return this.db.all(sql, params);
    }

    /**
     * Retrieves a single product by its unique ID.
     */
    async findById(id) {
        return this.db.get('SELECT * FROM products WHERE id = ?', [id]);
    }

    /**
     * Finds a product by name (used for duplicate check during import/update).
     * Uses COLLATE NOCASE for case-insensitive comparison.
     */
    async findByName(name) {
        return this.db.get('SELECT * FROM products WHERE name = ? COLLATE NOCASE', [name]);
    }
    
    /**
     * Inserts a new product record into the database.
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
     * Updates an existing product record by ID.
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
     * Gets the total count of products, with optional search filtering (for pagination metadata).
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