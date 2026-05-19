const User = require('../models/User');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const AppError = require('../utils/appError');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

exports.register = async (req, res, next) => {
  try {
    const { fullname, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return next(AppError('User already exists with this email', 400));
    const user = await User.create({ fullname, email, password });
    const token = generateToken(user._id);
    user.password = undefined;
    res.status(201).json({ status: 'success', token, data: { user } });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) return next(AppError('Invalid credentials', 401));
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) return next(AppError('Invalid credentials', 401));
    const token = generateToken(user._id);
    user.password = undefined;
    res.json({ status: 'success', token, data: { user } });
  } catch (err) {
    next(err);
  }
};

exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ status: 'success', data: { user } });
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { fullname, email } = req.body;
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (existingUser) return next(AppError('Email already exists', 400));
    }
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { fullname, email },
      { new: true, runValidators: true }
    );
    res.json({ status: 'success', data: { user } });
  } catch (err) {
    next(err);
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    if (!user) return next(AppError('User not found', 404));
    const isCurrentPasswordCorrect = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordCorrect) return next(AppError('Current password is incorrect', 401));
    user.password = newPassword;
    await user.save();
    res.json({ status: 'success', message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next(AppError('User not found', 404));
    user.password = newPassword;
    await user.save();
    res.json({ status: 'success', message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');
    if (!user) return next(AppError('User not found', 404));
    const { password } = req.body;
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) return next(AppError('Password is incorrect', 400));
    await Task.deleteMany({ user: req.user.id });
    await Notification.deleteMany({ recipient: req.user.id });
    await User.findByIdAndDelete(req.user.id);
    res.json({ status: 'success', message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};
