import Company from '../models/Company.js';
import Service from '../models/Service.js';
import Project from '../models/Project.js';
import Technology from '../models/Technology.js';

export const getCompanyInfo = async (req, res, next) => {
  try {
    let company = await Company.findOne();
    if (!company) {
      company = await Company.create({});
    }
    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    next(error);
  }
};

export const getServices = async (req, res, next) => {
  try {
    const services = await Service.find({ isActive: true }).sort({ displayOrder: 1, createdAt: 1 });
    res.json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    next(error);
  }
};

export const getServiceBySlug = async (req, res, next) => {
  try {
    const service = await Service.findOne({ slug: req.params.slug.toLowerCase(), isActive: true });
    if (!service) {
      return res.status(404).json({
        success: false,
        message: `Service with slug '${req.params.slug}' not found`
      });
    }
    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    next(error);
  }
};

export const getProjects = async (req, res, next) => {
  try {
    const { category, featured } = req.query;
    const filter = { status: 'published' };

    if (category && category !== 'All') {
      filter.category = new RegExp(`^${category}$`, 'i');
    }
    if (featured === 'true') {
      filter.featured = true;
    }

    const projects = await Project.find(filter).sort({ featured: -1, createdAt: -1 });
    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectBySlug = async (req, res, next) => {
  try {
    const project = await Project.findOne({ slug: req.params.slug.toLowerCase(), status: 'published' });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: `Project with slug '${req.params.slug}' not found`
      });
    }
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

export const getTechnologies = async (req, res, next) => {
  try {
    const technologies = await Technology.find({ isActive: true }).sort({ category: 1, displayOrder: 1 });
    res.json({
      success: true,
      count: technologies.length,
      data: technologies
    });
  } catch (error) {
    next(error);
  }
};

