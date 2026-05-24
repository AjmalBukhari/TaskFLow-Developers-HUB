const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const supabase = require('../config/supabase');

module.exports = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.query.token;
    if (!token) return next(AppError('Not authorized, no token provided', 401));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.id)
      .single();
    if (error || !user) return next(AppError('Not authorized, user not found', 401));
    req.user = user;
    next();
  } catch (err) {
    next(AppError('Not authorized, token failed', 401));
  }
};