import { Router } from 'express';
import authRoutes from '../../../../../src/infrastructure/adapters/http/routes/authRoutes';

describe('Auth Routes', () => {
  let router: Router;

  beforeAll(() => {
    router = authRoutes;
  });

  it('should have POST /register route', () => {
    const routes = router.stack
      .filter((layer: any) => layer.route)
      .map((layer: any) => ({
        path: layer.route.path,
        methods: Object.keys(layer.route.methods).join(', ')
      }));

    expect(routes).toContainEqual({
      path: '/register',
      methods: 'post'
    });
  });

  it('should have POST /login route', () => {
    const routes = router.stack
      .filter((layer: any) => layer.route)
      .map((layer: any) => ({
        path: layer.route.path,
        methods: Object.keys(layer.route.methods).join(', ')
      }));

    expect(routes).toContainEqual({
      path: '/login',
      methods: 'post'
    });
  });

  it('should have POST /refresh route', () => {
    const routes = router.stack
      .filter((layer: any) => layer.route)
      .map((layer: any) => ({
        path: layer.route.path,
        methods: Object.keys(layer.route.methods).join(', ')
      }));

    expect(routes).toContainEqual({
      path: '/refresh',
      methods: 'post'
    });
  });

  it('should have POST /logout route', () => {
    const routes = router.stack
      .filter((layer: any) => layer.route)
      .map((layer: any) => ({
        path: layer.route.path,
        methods: Object.keys(layer.route.methods).join(', ')
      }));

    expect(routes).toContainEqual({
      path: '/logout',
      methods: 'post'
    });
  });
});