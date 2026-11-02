import express from 'express';
import {
  getCompanyInfo,
  getServices,
  getServiceBySlug,
  getProjects,
  getProjectBySlug,
  getTechnologies
} from '../controllers/publicController.js';
import { publicApiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(publicApiLimiter);

router.get('/company', getCompanyInfo);
router.get('/services', getServices);
router.get('/services/:slug', getServiceBySlug);
router.get('/projects', getProjects);
router.get('/projects/:slug', getProjectBySlug);
router.get('/technologies', getTechnologies);

export default router;

