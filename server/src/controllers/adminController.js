import Enquiry from '../models/Enquiry.js';
import Project from '../models/Project.js';
import Service from '../models/Service.js';
import Technology from '../models/Technology.js';
import Company from '../models/Company.js';
import { uploadImage } from '../services/uploadService.js';
import { sendEnquiryEmails } from '../services/emailService.js';
import {
  emitCompanyUpdated,
  emitProjectEvent,
  emitServiceEvent,
  emitTechnologyEvent
} from '../sockets/socketManager.js';

// --- Dashboard Stats ---
export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalEnquiries,
      newEnquiries,
      contactedEnquiries,
      inProgressEnquiries,
      proposalSentEnquiries,
      completedEnquiries,
      rejectedEnquiries,
      totalProjects,
      publishedProjects,
      totalServices,
      activeServices,
      totalTechnologies,
      recentEnquiries
    ] = await Promise.all([
      Enquiry.countDocuments(),
      Enquiry.countDocuments({ status: 'New' }),
      Enquiry.countDocuments({ status: 'Contacted' }),
      Enquiry.countDocuments({ status: 'In Progress' }),
      Enquiry.countDocuments({ status: 'Proposal Sent' }),
      Enquiry.countDocuments({ status: 'Completed' }),
      Enquiry.countDocuments({ status: 'Rejected' }),
      Project.countDocuments(),
      Project.countDocuments({ status: 'published' }),
      Service.countDocuments(),
      Service.countDocuments({ isActive: true }),
      Technology.countDocuments(),
      Enquiry.find().sort({ createdAt: -1 }).limit(6)
    ]);

    res.json({
      success: true,
      stats: {
        enquiries: {
          total: totalEnquiries,
          new: newEnquiries,
          contacted: contactedEnquiries,
          inProgress: inProgressEnquiries,
          proposalSent: proposalSentEnquiries,
          completed: completedEnquiries,
          rejected: rejectedEnquiries
        },
        projects: {
          total: totalProjects,
          published: publishedProjects
        },
        services: {
          total: totalServices,
          active: activeServices
        },
        technologies: totalTechnologies
      },
      recentEnquiries
    });
  } catch (error) {
    next(error);
  }
};

// --- Enquiries ---
export const getEnquiries = async (req, res, next) => {
  try {
    const { status, service, search, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (service && service !== 'All') {
      query.service = service;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { service: { $regex: search, $options: 'i' } },
        { referenceId: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOption = {};
    sortOption[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [enquiries, total] = await Promise.all([
      Enquiry.find(query).sort(sortOption).skip(skip).limit(parseInt(limit, 10)),
      Enquiry.countDocuments(query)
    ]);

    res.json({
      success: true,
      count: enquiries.length,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      data: enquiries
    });
  } catch (error) {
    next(error);
  }
};

export const getEnquiryById = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    res.json({ success: true, data: enquiry });
  } catch (error) {
    next(error);
  }
};

export const updateEnquiryStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['New', 'Contacted', 'In Progress', 'Proposal Sent', 'Completed', 'Rejected'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${allowed.join(', ')}` });
    }

    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    res.json({ success: true, message: 'Status updated', data: enquiry });
  } catch (error) {
    next(error);
  }
};

export const addEnquiryNote = async (req, res, next) => {
  try {
    const { body } = req.body;
    if (!body || !body.trim()) {
      return res.status(400).json({ success: false, message: 'Note text cannot be empty' });
    }

    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    enquiry.notes.push({
      body: body.trim(),
      author: req.user ? req.user.name : 'Admin',
      createdAt: new Date()
    });

    await enquiry.save();

    res.json({ success: true, message: 'Note appended', data: enquiry });
  } catch (error) {
    next(error);
  }
};

export const deleteEnquiry = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    res.json({ success: true, message: 'Enquiry permanently deleted' });
  } catch (error) {
    next(error);
  }
};

export const retryEnquiryEmail = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    const emailResult = await sendEnquiryEmails(enquiry);
    enquiry.emailSent = emailResult.success;
    enquiry.adminEmailStatus = emailResult.adminStatus || 'failed';
    enquiry.customerEmailStatus = emailResult.customerStatus || 'failed';
    enquiry.emailError = emailResult.error || '';
    enquiry.lastEmailAttemptAt = new Date();
    await enquiry.save();

    res.json({
      success: true,
      message: emailResult.success
        ? 'Email notification dispatched successfully'
        : 'Attempted email delivery with status: ' + (emailResult.error || 'simulated/partial'),
      data: enquiry
    });
  } catch (error) {
    next(error);
  }
};

export const exportEnquiriesCSV = async (req, res, next) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });

    const headers = ['Reference ID', 'Date', 'Client Name', 'Email', 'Phone', 'Company', 'Service', 'Budget', 'Status', 'Admin Email Status', 'Customer Email Status', 'Brief'];
    const rows = enquiries.map((e) => [
      `"${e.referenceId || e._id}"`,
      `"${new Date(e.createdAt).toISOString()}"`,
      `"${(e.name || '').replace(/"/g, '""')}"`,
      `"${(e.email || '').replace(/"/g, '""')}"`,
      `"${(e.phone || '').replace(/"/g, '""')}"`,
      `"${(e.company || '').replace(/"/g, '""')}"`,
      `"${(e.service || '').replace(/"/g, '""')}"`,
      `"${(e.budget || '').replace(/"/g, '""')}"`,
      `"${e.status}"`,
      `"${e.adminEmailStatus || (e.emailSent ? 'sent' : 'pending')}"`,
      `"${e.customerEmailStatus || (e.emailSent ? 'sent' : 'pending')}"`,
      `"${(e.description || '').replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=dwarix-enquiries-${Date.now()}.csv`);
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

// --- Projects ---
export const getAllAdminProjects = async (req, res, next) => {
  try {
    const projects = await Project.find().sort({ displayOrder: 1, createdAt: -1 });
    res.json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const data = req.body;
    if (!data.slug) {
      data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    const project = await Project.create(data);

    // Real-time broadcast to connected public clients
    emitProjectEvent('project:created', project);

    res.status(201).json({ success: true, message: 'Project created', data: project });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Real-time broadcast
    emitProjectEvent('project:updated', project);

    res.json({ success: true, message: 'Project updated', data: project });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Real-time broadcast
    emitProjectEvent('project:deleted', { _id: req.params.id });

    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    next(error);
  }
};

// --- Services ---
export const getAllAdminServices = async (req, res, next) => {
  try {
    const services = await Service.find().sort({ displayOrder: 1, createdAt: 1 });
    res.json({ success: true, count: services.length, data: services });
  } catch (error) {
    next(error);
  }
};

export const createService = async (req, res, next) => {
  try {
    const data = req.body;
    if (!data.slug) {
      data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    const service = await Service.create(data);

    // Real-time broadcast
    emitServiceEvent('service:created', service);

    res.status(201).json({ success: true, message: 'Service created', data: service });
  } catch (error) {
    next(error);
  }
};

export const updateService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Real-time broadcast
    emitServiceEvent('service:updated', service);

    res.json({ success: true, message: 'Service updated', data: service });
  } catch (error) {
    next(error);
  }
};

export const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Real-time broadcast
    emitServiceEvent('service:deleted', { _id: req.params.id });

    res.json({ success: true, message: 'Service deleted' });
  } catch (error) {
    next(error);
  }
};

// --- Technologies ---
export const getAllAdminTechnologies = async (req, res, next) => {
  try {
    const technologies = await Technology.find().sort({ category: 1, displayOrder: 1 });
    res.json({ success: true, count: technologies.length, data: technologies });
  } catch (error) {
    next(error);
  }
};

export const createTechnology = async (req, res, next) => {
  try {
    const tech = await Technology.create(req.body);

    // Real-time broadcast
    emitTechnologyEvent('technology:created', tech);

    res.status(201).json({ success: true, message: 'Technology created', data: tech });
  } catch (error) {
    next(error);
  }
};

export const updateTechnology = async (req, res, next) => {
  try {
    const tech = await Technology.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!tech) {
      return res.status(404).json({ success: false, message: 'Technology not found' });
    }

    // Real-time broadcast
    emitTechnologyEvent('technology:updated', tech);

    res.json({ success: true, message: 'Technology updated', data: tech });
  } catch (error) {
    next(error);
  }
};

export const deleteTechnology = async (req, res, next) => {
  try {
    const tech = await Technology.findByIdAndDelete(req.params.id);
    if (!tech) {
      return res.status(404).json({ success: false, message: 'Technology not found' });
    }

    // Real-time broadcast
    emitTechnologyEvent('technology:deleted', { _id: req.params.id });

    res.json({ success: true, message: 'Technology deleted' });
  } catch (error) {
    next(error);
  }
};

// --- Company Settings ---
export const getAdminCompany = async (req, res, next) => {
  try {
    let company = await Company.findOne();
    if (!company) {
      company = await Company.create({});
    }
    res.json({ success: true, data: company });
  } catch (error) {
    next(error);
  }
};

export const updateAdminCompany = async (req, res, next) => {
  try {
    let company = await Company.findOne();
    if (!company) {
      company = await Company.create(req.body);
    } else {
      company = await Company.findByIdAndUpdate(company._id, req.body, {
        new: true,
        runValidators: true
      });
    }

    // Real-time broadcast to connected public clients
    emitCompanyUpdated(company);

    res.json({ success: true, message: 'Company settings updated', data: company });
  } catch (error) {
    next(error);
  }
};

// --- Image Upload ---
export const handleUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }

    const folder = req.body.folder || 'dwarix';
    const uploadResult = await uploadImage(req.file.buffer, folder, req.file.originalname);

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      url: uploadResult.url,
      publicId: uploadResult.publicId
    });
  } catch (error) {
    next(error);
  }
};
