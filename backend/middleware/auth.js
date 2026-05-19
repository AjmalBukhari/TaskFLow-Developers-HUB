const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');

module.exports = (req, res, next) => {
  const header = req.header('Authorization');

  if (!header) {
    return next(AppError('No token provided', 401));
  }

  try {
    const token = header.replace('Bearer ', '');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (err) {
    return next(AppError('Invalid token', 401));
  }
};

// Enhanced auth middleware that attaches user document
module.exports.protect = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return next(AppError('Not authorized, no token provided', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const User = require('../models/User');
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return next(AppError('Not authorized, user not found', 401));
    }

    req.user = user;
    next();
  } catch (err) {
    next(AppError('Not authorized, token failed', 401));
  }
};