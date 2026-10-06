import { Router } from 'express';
import {
  listHackathons,
  getHackathonById,
  createHackathon,
  updateHackathon,
  archiveHackathon,
  deleteHackathon,
} from '../controllers/hackathonController';
import { authenticate, optionalAuthenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// Public / Student read endpoints (optional auth attaches student eligibility state)
router.get('/', optionalAuthenticate, listHackathons);
router.get('/:id', optionalAuthenticate, getHackathonById);

// Admin-only management endpoints
router.post('/admin', authenticate, requireAdmin, createHackathon);
router.put('/admin/:id', authenticate, requireAdmin, updateHackathon);
router.patch('/admin/:id/archive', authenticate, requireAdmin, archiveHackathon);
router.delete('/admin/:id', authenticate, requireAdmin, deleteHackathon);

export default router;
