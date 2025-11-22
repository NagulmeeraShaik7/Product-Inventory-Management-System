import request from 'supertest';
import express from 'express';
import multer from 'multer';
import ProductController from './product.controller.js';
import { AppError } from '../utils/error-handler.js';

// Mock CSV utilities
jest.mock('../utils/csv.util.js', () => ({
    parseCsv: jest.fn(),
    generateCsv: jest.fn(),
}));

import { parseCsv, generateCsv } from '../utils/csv.util.js';

// Mock use case layer
const mockUseCase = {
    getProducts: jest.fn(),
    importProducts: jest.fn(),
    getAllProducts: jest.fn(),
    updateProduct: jest.fn(),
    getProductHistory: jest.fn(),
};

const upload = multer({ storage: multer.memoryStorage() });

// Create Express test app
const app = express();
app.use(express.json());

const controller = new ProductController(mockUseCase);

app.get('/products', (req, res, next) => controller.getProducts(req, res, next));

app.post('/products/import', upload.single("file"), (req, res, next) =>
    controller.importProducts(req, res, next)
);

app.get('/products/export', (req, res, next) =>
    controller.exportProducts(req, res, next)
);

app.put('/products/:id', (req, res, next) =>
    controller.updateProduct(req, res, next)
);

app.get('/products/:id/history', (req, res, next) =>
    controller.getProductHistory(req, res, next)
);

// Global Error Handler
app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({ status: "error", message: err.message });
});

describe("ProductController Tests", () => {

    // ---------------------------
    // ✔ getProducts
    // ---------------------------
    test("✔ Should return products successfully", async () => {
        mockUseCase.getProducts.mockResolvedValue({
            total: 1,
            products: [{ id: 1, name: "Test Product" }],
        });

        const res = await request(app).get("/products");

        expect(res.status).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.products.length).toBe(1);
    });

    // ---------------------------
    // ❌ importProducts – No File
    // ---------------------------
    test("❌ Should return error if no CSV file uploaded", async () => {
        const res = await request(app).post("/products/import");
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("No CSV file uploaded.");
    });

    // ---------------------------
    // ✔ importProducts – Success
    // ---------------------------
    test("✔ Should import CSV file successfully", async () => {
        const buffer = Buffer.from("name,unit\nProduct A,kg");

        parseCsv.mockResolvedValue([{ name: "Product A", unit: "kg" }]);

        mockUseCase.importProducts.mockResolvedValue({
            added: 1,
            skipped: 0,
            duplicates: [],
        });

        const res = await request(app)
            .post("/products/import")
            .attach("file", buffer, "products.csv");

        expect(res.status).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.added).toBe(1);
    });

    // ---------------------------
    // ✔ exportProducts
    // ---------------------------
    test("✔ Should export products as CSV", async () => {
        mockUseCase.getAllProducts.mockResolvedValue([
            { id: 1, name: "A" },
            { id: 2, name: "B" },
        ]);

        generateCsv.mockResolvedValue("id,name\n1,A\n2,B");

        const res = await request(app).get("/products/export");

        expect(res.status).toBe(200);
        expect(res.text).toContain("id,name");

        // FIX: Express adds charset=utf-8, so use toContain()
        expect(res.headers["content-type"]).toContain("text/csv");
    });

    // ---------------------------
    // ✔ updateProduct
    // ---------------------------
    test("✔ Should update a product", async () => {
        mockUseCase.updateProduct.mockResolvedValue({
            id: 1,
            name: "Updated",
            stock: 50,
        });

        const res = await request(app)
            .put("/products/1")
            .send({ name: "Updated", stock: 50 });

        expect(res.status).toBe(200);
        expect(res.body.data.name).toBe("Updated");
    });

    // ---------------------------
    // ✔ getProductHistory
    // ---------------------------
    test("✔ Should return product history", async () => {
        mockUseCase.getProductHistory.mockResolvedValue([
            { changedBy: "admin@test.com", change: "Updated stock" },
        ]);

        const res = await request(app).get("/products/1/history");

        expect(res.status).toBe(200);
        expect(res.body.data.length).toBe(1);
    });
});
