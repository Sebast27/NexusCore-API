import dotenv from 'dotenv';

// Cargar variables de entorno para pruebas
dotenv.config({ path: '.env.test' });

// Mock de Winston para evitar logs en pruebas
jest.mock('winston', () => ({
  createLogger: jest.fn().mockReturnValue({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }),
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    printf: jest.fn(),
    colorize: jest.fn(),
  },
  transports: {
    Console: jest.fn(),
  },
}));

// Limpiar mocks después de cada prueba
afterEach(() => {
  jest.clearAllMocks();
});