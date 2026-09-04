import swaggerJsdoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'JomDekan API',
      version: '0.1.0',
      description:
        'Centralized academic resources, discussion, tutoring and discovery platform for Malaysian university students.',
    },
    servers: [{ url: '/api/v1' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    tags: [
      { name: 'System', description: 'Health and version endpoints' },
      { name: 'Auth', description: 'Registration, login, session, and profile' },
    ],
  },
  apis: ['./src/routes/**/*.ts'],
});
