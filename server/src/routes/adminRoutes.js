import express from 'express';
import {
  getDashboardStats,
  getEnquiries,
  getEnquiryById,
  updateEnquiryStatus,
  addEnquiryNote,
  deleteEnquiry,
  getAllAdminProjects,
  createProject,
  updateProject,
  deleteProject,
  getAllAdminServices,
  createService,
  updateService,
  deleteService,
  getAllAdminTechnologies,
  createTechnology,
  updateTechnology,
  deleteTechnology,
  getAdminCompany,
  updateAdminCompany,
  handleUpload,
  retryEnquiryEmail,
  exportEnquiriesCSV
} from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../services/uploadService.js';
import {
  validateProject,
  validateService,
  validateTechnology
} from '../middleware/validate.js';

const router = express.Router();

// Require authentication for all admin routes
router.use(protect);

// Dashboard overview
router.get('/stats', getDashboardStats);

// Enquiries
router.get('/enquiries', getEnquiries);
router.get('/enquiries/export/csv', exportEnquiriesCSV);
router.get('/enquiries/:id', getEnquiryById);
router.patch('/enquiries/:id/status', updateEnquiryStatus);
router.post('/enquiries/:id/notes', addEnquiryNote);
router.post('/enquiries/:id/retry-email', retryEnquiryEmail);
router.delete('/enquiries/:id', deleteEnquiry);

// Projects
router.get('/projects', getAllAdminProjects);
router.post('/projects', validateProject, createProject);
router.put('/projects/:id', validateProject, updateProject);
router.delete('/projects/:id', deleteProject);

// Services
router.get('/services', getAllAdminServices);
router.post('/services', validateService, createService);
router.put('/services/:id', validateService, updateService);
router.delete('/services/:id', deleteService);

// Technologies
router.get('/technologies', getAllAdminTechnologies);
router.post('/technologies', validateTechnology, createTechnology);
router.put('/technologies/:id', validateTechnology, updateTechnology);
router.delete('/technologies/:id', deleteTechnology);

// Company settings
router.get('/company', getAdminCompany);
router.put('/company', updateAdminCompany);

// Uploads
router.post('/upload', upload.single('image'), handleUpload);

export default router;

