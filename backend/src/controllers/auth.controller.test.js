

import request from 'supertest';
import express from 'express';
import AuthController from '../controllers/auth.controller.js';
import { signToken } from '../utils/auth.util.js';
import { AppError } from '../utils/error-handler.js';

// Mock signToken
jest.mock('../utils/auth.util.js', () => ({
  signToken: jest.fn(() => "mocked_jwt_token")
}));

// Mock environment variables
process.env.ADMIN_USERNAME = "admin@inventory.com";
process.env.ADMIN_PASSWORD = "securepassword123";

// Prepare Express app for testing
const app = express();
app.use(express.json());

const authController = new AuthController();

// Create a login route for testing
app.post('/login', (req, res, next) => authController.login(req, res, next));

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message
  });
});

describe('AuthController Login API Tests', () => {

  test('✔ Should login successfully and return token', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        username: "admin@inventory.com",
        password: "securepassword123"
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.token).toBe('mocked_jwt_token');
    expect(response.body.user).toEqual({
      id: 1,
      username: "admin@inventory.com"
    });

    expect(signToken).toHaveBeenCalledWith(1);
  });

  test('❌ Should return error for missing username', async () => {
    const response = await request(app)
      .post('/login')
      .send({ password: "securepassword123" });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Please provide username and password!');
  });

  test('❌ Should return error for missing password', async () => {
    const response = await request(app)
      .post('/login')
      .send({ username: "admin@inventory.com" });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Please provide username and password!');
  });

  test('❌ Should return error for invalid credentials', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        username: "wrong@example.com",
        password: "wrongpass"
      });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Incorrect username or password');
  });

});
