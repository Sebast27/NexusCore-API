import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import auditRoutes from './auditRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/audit', auditRoutes);

export default router;