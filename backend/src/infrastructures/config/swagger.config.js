import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Product Inventory Management API',
    version: '1.0.0',
    description: 'API documentation for the Product Inventory Management System',
  },
  servers: [
    {
      url: process.env.SWAGGER_SERVER_URL || 'http://localhost:3000',
    },
    {
      url: process.env.PRODUCTION_URL || 'https://product-inventory-management-system-37hp.onrender.com',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions (JSDoc comments).
  apis: [
    // include routes and controllers for inline JSDoc annotations
    './src/routes/*.js',
    './src/controllers/*.js',
  ],
};

const swaggerSpec = swaggerJSDoc(options);

/**
 * Mounts Swagger UI on the provided Express app.
 * @param {import('express').Application} app
 * @param {string} [path='/api-docs']
 */
export const setupSwagger = (app, path = '/api-docs') => {
  app.use(path, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

export default swaggerSpec;
