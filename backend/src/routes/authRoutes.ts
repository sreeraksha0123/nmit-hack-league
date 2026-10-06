import { Router } from 'express';
import {
  studentSignup,
  studentLogin,
  adminLogin,
  getMe,
  updateProfile,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Student Authentication
router.post('/signup', studentSignup);
router.post('/login', studentLogin);

// Dedicated Administrator Authentication
router.post('/admin/login', adminLogin);

// Authenticated User Profile
router.get('/me', authenticate, getMe);
router.put('/me', authenticate, updateProfile);

export default router;
