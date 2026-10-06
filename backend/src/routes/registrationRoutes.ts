import { Router } from 'express';
import {
  registerForHackathon,
  getMyRegistrations,
  getAdminHackathonRegistrations,
} from '../controllers/registrationController';
import { authenticate, requireStudent, requireAdmin } from '../middleware/auth';

const router = Router();

// Student registers for a hackathon
router.post('/hackathons/:id/register', authenticate, requireStudent, registerForHackathon);

// Student retrieves their own registrations
router.get('/students/me/registrations', authenticate, requireStudent, getMyRegistrations);

// Admin views registrations for a specific hackathon
router.get('/admin/hackathons/:id/registrations', authenticate, requireAdmin, getAdminHackathonRegistrations);

export default router;
