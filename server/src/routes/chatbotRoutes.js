import express from 'express';
import { handleChatMessage, getSuggestions } from '../controllers/chatbotController.js';
import { chatbotLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Apply rate limiter to all chatbot endpoints
router.use(chatbotLimiter);

// GET /api/chatbot/suggestions
router.get('/suggestions', getSuggestions);

// POST /api/chatbot/message
router.post('/message', handleChatMessage);

export default router;

