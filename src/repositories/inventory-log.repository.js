// NOTE: db connection is injected
/**
 * Repository responsible for managing inventory log records.
 *
 * This repository handles:
 * - Creating stock change log entries
 * - Fetching log history for a specific product
 *
 * @class InventoryLogRepository
 */
class InventoryLogRepository {
    /**
     * Creates an instance of the InventoryLogRepository.
     *
     * @param {import('sqlite3').Database} db - SQLite database instance (run/all methods must be available).
     */
    constructor(db) {
        this.db = db;
    }

    /**
     * Stores a new inventory log entry when stock levels change.
     *
     * @async
     * @function createLog
     * @memberof InventoryLogRepository
     *
     * @param {object} logData - Stock change details.
     * @param {number} logData.productId - ID of the product whose stock changed.
     * @param {number} logData.oldStock - The previous stock value.
     * @param {number} logData.newStock - The updated stock value.
     * @param {string} [logData.changedBy='system'] - The user/admin responsible for the change.
     *
     * @returns {Promise<void>}
     *
     * @example
     * await inventoryLogRepo.createLog({
     *   productId: 10,
     *   oldStock: 50,
     *   newStock: 75,
     *   changedBy: 'admin@example.com'
     * });
     */
    async createLog({ productId, oldStock, newStock, changedBy = 'system' }) {
        await this.db.run(
            `INSERT INTO inventory_logs (productId, oldStock, newStock, changedBy)
             VALUES (?, ?, ?, ?)`,
            [productId, oldStock, newStock, changedBy]
        );
    }

    /**
     * Retrieves the full stock change log history for a product.
     *
     * Results are sorted by timestamp in descending order (newest first).
     *
     * @async
     * @function findLogsByProductId
     * @memberof InventoryLogRepository
     *
     * @param {number} productId - ID of the product whose logs are required.
     *
     * @returns {Promise<Array<object>>} List of log entries.
     *
     * @example
     * const logs = await inventoryLogRepo.findLogsByProductId(10);
     * console.log(logs);
     */
    async findLogsByProductId(productId) {
        return this.db.all(
            `SELECT * FROM inventory_logs WHERE productId = ?
             ORDER BY timestamp DESC`,
            [productId]
        );
    }
}

export default InventoryLogRepository;
