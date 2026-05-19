const User = require('../models/User');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const AppError = require('../utils/appError');
const jwt = require('jsonwebtoken');

// ================= REGISTER USER =================
exports.register = async (req, res, next) => {
  try {
    const { fullname, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(AppError('User already exists with this email', 400));
    }

    // Create user
    const user = await User.create({
      fullname,
      email,
      password
    });

    // Generate JWT token
    const token = generateToken(user._id);

    // Remove password from response
    user.password = undefined;

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user
      }
    });
  } catch (err) {
    next(err);
  }
};

// ================= LOGIN USER =================
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(AppError('Invalid credentials', 401));
    }

    // Check if password is correct
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return next(AppError('Invalid credentials', 401));
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Remove password from response
    user.password = undefined;

    res.json({
      status: 'success',
      token,
      data: {
        user
      }
    });
  } catch (err) {
    next(err);
  }
};

// ================= GET CURRENT USER =================
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (err) {
    next(err);
  }
};

// ================= UPDATE USER =================
exports.updateUser = async (req, res, next) => {
  try {
    const { fullname, email } = req.body;

    // Check if email is being updated and if it already exists
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (existingUser) {
        return next(AppError('Email already exists', 400));
      }
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { fullname, email },
      { new: true, runValidators: true }
    );

    res.json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (err) {
    next(err);
  }
};

// ================= UPDATE PASSWORD =================
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return next(AppError('User not found', 404));
    }

    // Check if current password is correct
    const isCurrentPasswordCorrect = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordCorrect) {
      return next(AppError('Current password is incorrect', 401));
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      status: 'success',
      message: 'Password updated successfully'
    });
  } catch (err) {
    next(err);
  }
};

// ================= FORGOT PASSWORD =================
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return next(AppError('User not found', 404));
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      status: 'success',
      message: 'Password updated successfully'
    });
  } catch (err) {
    next(err);
  }
};

// ================= DELETE USER =================
exports.deleteUser = async (req, res, next) => {
  try {
    // Get user with password
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return next(AppError('User not found', 404));
    }

    // Check if password is correct
    const { password } = req.body;
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return next(AppError('Password is incorrect', 400));
    }

    // Delete user's tasks
    await Task.deleteMany({ user: req.user.id });

    // Delete user's notifications
    await Notification.deleteMany({ recipient: req.user.id });

    // Delete user
    await user.deleteOne();

    res.json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

// ================= HELPER FUNCTIONS =================
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// ================= JWT AUTH MIDDLEWARE =================
exports.protect = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return next(AppError('Not authorized, no token provided', 401));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(AppError('Not authorized, user not found', 401));
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (err) {
    next(AppError('Not authorized, token failed', 401));
  }
};

// ================= ROLE-BASED AUTHORIZATION MIDDLEWARE =================
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(AppError('Not authorized to access this route', 403));
    }
    next();
  };
};