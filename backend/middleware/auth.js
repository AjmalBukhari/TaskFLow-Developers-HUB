const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const User = require('../models/User');

// Auth middleware that verifies JWT token
module.exports = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return next(AppError('Not authorized, no token provided', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
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