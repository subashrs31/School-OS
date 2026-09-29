import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'Backend API', version: '1.0.0' },
    servers: [{ url: '/api' }],
    components: {
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
          },
        },
      },
    },
  },
  apis: ['src/routes/*.ts', 'dist/src/routes/*.js'],
};

export default swaggerJsdoc(options);
