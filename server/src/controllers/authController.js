import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import { generateToken, setAuthCookie, clearAuthCookie } from '../middleware/auth.js';
import { env } from '../config/env.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database service is currently connecting or offline. Please try again in a few moments.'
      });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Use admin@dwarix.com for demo access.'
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact the administrator.'
      });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Use Admin@Dwarix2026! for demo access.'
      });
    }

    const token = generateToken(admin._id, admin.role);
    setAuthCookie(res, token);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    clearAuthCookie(res);
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Checks session state without throwing noisy 401 error in browser console when unauthenticated
 */
export const getMe = async (req, res, next) => {
  try {
    let token = null;

    if (req.cookies && req.cookies.dwarix_admin_token) {
      token = req.cookies.dwarix_admin_token;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(200).json({
        success: true,
        authenticated: false,
        admin: null
      });
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      const admin = await Admin.findById(decoded.id).select('-passwordHash');
      if (!admin || !admin.isActive) {
        return res.status(200).json({
          success: true,
          authenticated: false,
          admin: null
        });
      }

      return res.status(200).json({
        success: true,
        authenticated: true,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          createdAt: admin.createdAt
        }
      });
    } catch (tokenErr) {
      return res.status(200).json({
        success: true,
        authenticated: false,
        admin: null
      });
    }
  } catch (error) {
    next(error);
  }
};
