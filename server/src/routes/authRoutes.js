import express from 'express';
import { login, logout, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validateLogin } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/login', authLimiter, validateLogin, login);
router.post('/logout', logout);
router.get('/me', getMe);

export default router;

