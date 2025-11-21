// NOTE: db connection is injected
class InventoryLogRepository {
    constructor(db) {
        this.db = db;
    }

    /**
     * Creates a new log entry when product stock changes.
     */
    async createLog({ productId, oldStock, newStock, changedBy = 'system' }) {
        await this.db.run(
            `INSERT INTO inventory_logs (productId, oldStock, newStock, changedBy)
             VALUES (?, ?, ?, ?)`,
            [productId, oldStock, newStock, changedBy]
        );
    }

    /**
     * Retrieves all log entries for a specific product, sorted by date.
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