import { body, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
  }
  next();
};

export const validateEnquiry = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name must be under 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[\d\s\+\-\(\)]{7,20}$/)
    .withMessage('Please enter a valid phone number'),
  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company name must be under 100 characters'),
  body('service')
    .optional()
    .trim(),
  body('budget')
    .optional()
    .trim(),
  body('description')
    .custom((val, { req }) => {
      const description = val || req.body.desc;
      if (!description || description.trim().length < 10) {
        throw new Error('Project description is required (min 10 characters)');
      }
      if (description.trim().length > 3000) {
        throw new Error('Description must be under 3000 characters');
      }
      req.body.description = description.trim();
      return true;
    }),
  // Honeypot spam field: must be empty
  body('website')
    .optional()
    .custom((value) => {
      if (value && value.trim().length > 0) {
        throw new Error('Spam detected');
      }
      return true;
    }),
  body('website_hp')
    .optional()
    .custom((value) => {
      if (value && value.trim().length > 0) {
        throw new Error('Spam detected');
      }
      return true;
    }),
  handleValidationErrors
];

export const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

export const validateProject = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 150 })
    .withMessage('Title must be under 150 characters'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('shortDescription')
    .trim()
    .notEmpty()
    .withMessage('Short description is required'),
  handleValidationErrors
];

export const validateService = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required'),
  body('shortDescription')
    .trim()
    .notEmpty()
    .withMessage('Short description is required'),
  handleValidationErrors
];

export const validateTechnology = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Technology name is required'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  handleValidationErrors
];

