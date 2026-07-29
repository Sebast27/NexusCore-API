import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NexusCore API',
      version: '1.0.0',
      description: 'API REST con autenticación JWT, roles y CRUD completo',
      contact: {
        name: 'NexusCore Team',
        email: 'support@nexuscore.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.nexuscore.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        RegisterUserInput: {
          type: 'object',
          required: ['email', 'password', 'name'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com'
            },
            password: {
              type: 'string',
              format: 'password',
              minLength: 8,
              example: 'Test123!@#'
            },
            name: {
              type: 'string',
              example: 'John Doe'
            }
          }
        },
        LoginUserInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com'
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'Test123!@#'
            }
          }
        },
        RefreshTokenInput: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIs...'
            }
          }
        },
        UserResponse: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com'
            },
            name: {
              type: 'string',
              example: 'John Doe'
            },
            role: {
              type: 'string',
              enum: ['ADMIN', 'EDITOR', 'VIEWER', 'USER'],
              example: 'USER'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        UpdateUserInput: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              example: 'Updated Name'
            },
            role: {
              type: 'string',
              enum: ['ADMIN', 'EDITOR', 'VIEWER', 'USER'],
              example: 'EDITOR'
            }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object'
            },
            message: {
              type: 'string'
            },
            error: {
              type: 'string'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Auth',
        description: 'Autenticación y manejo de tokens'
      },
      {
        name: 'Users',
        description: 'Gestión de usuarios'
      }
    ]
  },
  apis: ['./src/infrastructure/adapters/http/routes/*.ts']
};

export const specs = swaggerJsdoc(options);