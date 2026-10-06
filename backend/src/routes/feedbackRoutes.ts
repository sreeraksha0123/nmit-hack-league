import { Router } from 'express';
import { submitFeedback, getAdminFeedback } from '../controllers/feedbackController';
import { authenticate, requireStudent, requireAdmin } from '../middleware/auth';

const router = Router();

// Student submits feedback after hackathon
router.post('/hackathons/:id/feedback', authenticate, requireStudent, submitFeedback);

// Admin reviews all student feedback
router.get('/admin/feedback', authenticate, requireAdmin, getAdminFeedback);

export default router;
