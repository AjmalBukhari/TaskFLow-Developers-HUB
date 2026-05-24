const supabase = require('../config/supabase');
const AppError = require('../utils/appError');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

exports.register = async (req, res, next) => {
  try {
    const { fullname, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const { data, error } = await supabase
      .from('users')
      .insert({ fullname, email, password: hashedPassword })
      .select()
      .single();
    if (error) return next(AppError(error.message, 400));
    const token = generateToken(data.id);
    res.status(201).json({ status: 'success', token, data: { user: data } });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    if (error || !user) return next(AppError('Invalid credentials', 401));
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return next(AppError('Invalid credentials', 401));
    const token = generateToken(user.id);
    res.json({ status: 'success', token, data: { user } });
  } catch (err) {
    next(err);
  }
};

exports.getCurrentUser = async (req, res, next) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();
    if (error) return next(AppError('User not found', 404));
    res.json({ status: 'success', data: { user } });
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { fullname, email, password } = req.body;
    let updateData = { fullname, email };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', req.user.id)
      .select()
      .single();
    if (error) return next(AppError(error.message, 400));
    res.json({ status: 'success', data: { user: data } });
  } catch (err) {
    next(err);
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();
    if (error || !user) return next(AppError('User not found', 404));
    const isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordCorrect) return next(AppError('Current password is incorrect', 401));
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', req.user.id);
    if (updateError) return next(AppError(updateError.message, 400));
    res.json({ status: 'success', message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    if (error || !user) return next(AppError('User not found', 404));
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', user.id);
    if (updateError) return next(AppError(updateError.message, 400));
    res.json({ status: 'success', message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { password } = req.body;
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();
    if (error || !user) return next(AppError('User not found', 404));
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return next(AppError('Password is incorrect', 400));
    await supabase.from('tasks').delete().eq('user_id', req.user.id);
    await supabase.from('notifications').delete().eq('recipient', req.user.id);
    await supabase.from('users').delete().eq('id', req.user.id);
    res.json({ status: 'success', message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};