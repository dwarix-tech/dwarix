import express from 'express';
import { createEnquiry } from '../controllers/enquiryController.js';
import { validateEnquiry } from '../middleware/validate.js';
import { enquiryLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/', enquiryLimiter, validateEnquiry, createEnquiry);

export default router;

