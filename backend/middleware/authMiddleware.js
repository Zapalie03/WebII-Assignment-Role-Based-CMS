// middleware/authMiddleware.js - Enhanced authentication and authorization middleware
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');

// Verify JWT token and populate user with role
exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. No token provided.' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user and populate role with permissions
    const user = await User.findById(decoded.userId)
      .select('-password -refreshToken')
      .populate({
        path: 'role',
        select: 'name permissions'
      });
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'User not found.' 
      });
    }

    // Attach user to request
    req.user = user;
    req.userId = decoded.userId;
    
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid token.' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token expired.' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Server error during authentication.' 
    });
  }
};

// Verify refresh token
exports.verifyRefreshToken = (req, res, next) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({ 
      success: false,
      message: 'Refresh token required.' 
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    req.user = decoded;
    req.refreshToken = refreshToken;
    next();
  } catch (error) {
    return res.status(400).json({ 
      success: false,
      message: 'Invalid refresh token.' 
    });
  }
};

// Check if user has required permission
exports.hasPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      // Ensure user role is populated
      if (!req.user.role || typeof req.user.role === 'string') {
        req.user = await User.findById(req.user._id)
          .populate({
            path: 'role',
            select: 'name permissions'
          });
      }

      const userRole = req.user.role;
      
      // SuperAdmin has all permissions
      if (userRole.name === 'SuperAdmin') {
        return next();
      }

      // Check if role has the required permission
      if (userRole.permissions && userRole.permissions.includes(requiredPermission)) {
        return next();
      }

      return res.status(403).json({ 
        success: false,
        message: `Access denied. Required permission: ${requiredPermission}`,
        userRole: userRole.name,
        userPermissions: userRole.permissions
      });
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Server error during permission check.' 
      });
    }
  };
};

// Check if user has required role
exports.hasRole = (roleNames) => {
  return async (req, res, next) => {
    try {
      // Ensure user role is populated
      if (!req.user.role || typeof req.user.role === 'string') {
        req.user = await User.findById(req.user._id)
          .populate({
            path: 'role',
            select: 'name'
          });
      }

      const userRoleName = req.user.role.name;
      
      if (roleNames.includes(userRoleName)) {
        return next();
      }

      return res.status(403).json({ 
        success: false,
        message: `Access denied. Required role: ${roleNames.join(' or ')}`,
        userRole: userRoleName
      });
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Server error during role check.' 
      });
    }
  };
};

// Check if user is SuperAdmin (commonly used)
exports.isSuperAdmin = async (req, res, next) => {
  try {
    // Ensure user role is populated
    if (!req.user.role || typeof req.user.role === 'string') {
      req.user = await User.findById(req.user._id)
        .populate({
          path: 'role',
          select: 'name'
        });
    }

    if (req.user.role.name === 'SuperAdmin') {
      return next();
    }

    return res.status(403).json({ 
      success: false,
      message: 'Access denied. SuperAdmin role required.'
    });
  } catch (error) {
    console.error('SuperAdmin check error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error during admin check.' 
    });
  }
};