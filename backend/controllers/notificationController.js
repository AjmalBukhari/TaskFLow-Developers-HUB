const supabase = require('../config/supabase');
const AppError = require('../utils/appError');

exports.getNotifications = async (req, res, next) => {
  try {
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient', req.user.id)
      .order('createdAt', { ascending: false })
      .limit(50);
    if (error) return next(AppError(error.message, 400));
    res.json({ status: 'success', results: notifications.length, data: notifications });
  } catch (err) {
    next(err);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const { data: notification, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', req.params.id)
      .eq('recipient', req.user.id)
      .select()
      .single();
    if (error || !notification) return next(AppError('Notification not found', 404));
    res.json({ status: 'success', data: notification });
  } catch (err) {
    next(err);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('recipient', req.user.id)
      .eq('read', false);
    if (error) return next(AppError(error.message, 400));
    res.json({ status: 'success', message: 'Notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', req.params.id)
      .eq('recipient', req.user.id);
    if (error) return next(AppError(error.message, 400));
    res.json({ status: 'success', message: 'Notification deleted' });
  } catch (err) {
    next(err);
  }
};

exports.clearAll = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('recipient', req.user.id);
    if (error) return next(AppError(error.message, 400));
    res.json({ status: 'success', message: 'Notifications cleared' });
  } catch (err) {
    next(err);
  }
};

exports.getUnreadCount = async (req, res, next) => {
  try {
    const { data, error, count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('recipient', req.user.id)
      .eq('read', false);
    if (error) return next(AppError(error.message, 400));
    res.json({ status: 'success', data: { unreadCount: count || 0 } });
  } catch (err) {
    next(err);
  }
};