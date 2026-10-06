import { Router } from 'express';
import { getAdminStats, getAdminStudents } from '../controllers/adminController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// Administrator metrics overview
router.get('/stats', authenticate, requireAdmin, getAdminStats);

// Paginated student directory
router.get('/students', authenticate, requireAdmin, getAdminStudents);

export default router;
