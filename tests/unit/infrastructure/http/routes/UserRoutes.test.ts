import express from 'express';
import userRoutes from '../../../../../src/infrastructure/adapters/http/routes/userRoutes';

describe('User Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/users', userRoutes);
  });

  it('should have routes defined', () => {
    expect(userRoutes.stack).toBeDefined();
    expect(userRoutes.stack.length).toBeGreaterThan(0);
  });
});