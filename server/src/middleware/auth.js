import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import Admin from '../models/Admin.js';

export const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  });
};

export const setAuthCookie = (res, token) => {
  const isProduction = env.NODE_ENV === 'production';
  res.cookie('dwarix_admin_token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

export const clearAuthCookie = (res) => {
  const isProduction = env.NODE_ENV === 'production';
  res.cookie('dwarix_admin_token', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    expires: new Date(0)
  });
};

export const protect = async (req, res, next) => {
  try {
    let token = null;

    // 1. Try from cookies
    if (req.cookies && req.cookies.dwarix_admin_token) {
      token = req.cookies.dwarix_admin_token;
    }
    // 2. Try from Authorization header
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. No authentication token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Find active admin
    const admin = await Admin.findById(decoded.id).select('-passwordHash');
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Account not found or session revoked.'
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This account has been deactivated. Contact an administrator.'
      });
    }

    req.user = admin;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid, malformed, or expired authentication token.'
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: role '${req.user ? req.user.role : 'none'}' does not have access to this resource.`
      });
    }
    next();
  };
};

