import { Router } from 'express';
import { updateParticipationStatus } from '../controllers/participationController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// Admin updates participation status and round outcome
router.put('/admin/participation/:id', authenticate, requireAdmin, updateParticipationStatus);

export default router;
