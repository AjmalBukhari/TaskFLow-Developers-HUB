const supabase = require('../config/supabase');
const AppError = require('../utils/appError');
const { getIO } = require('../services/socket');
const { copyFilesForShare } = require('./uploadController');

exports.createTask = async (req, res, next) => {
  try {
    const { attachmentIds, ...taskData } = req.body;
    const { data: task, error } = await supabase
      .from('tasks')
      .insert({ ...taskData, user_id: req.user.id, owner: req.user.id, pinned: req.body.pinned || false })
      .select()
      .single();
    if (error) return next(AppError(error.message, 400));

    if (attachmentIds?.length > 0) {
      const { data: files } = await supabase
        .from('uploadfiles')
        .select('id, filepath')
        .in('id', attachmentIds);
      if (files?.length > 0) {
        const newPaths = files.map(f => {
          const fileName = f.filepath.split('/').pop();
          return { id: f.id, oldPath: f.filepath, newPath: `${req.user.id}/${fileName}` };
        });
        for (const p of newPaths) {
          await supabase.storage.from('taskflow-files').move(p.oldPath, p.newPath).catch(() => {});
          await supabase.from('uploadfiles').update({ task_id: task.id, filepath: p.newPath }).eq('id', p.id);
        }
        const ids = files.map(f => f.id);
        const existing = task.attachments || [];
        await supabase.from('tasks').update({ attachments: [...existing, ...ids] }).eq('id', task.id);
      }
    }

    getIO().to(req.user.id).emit('task_created', task);
    res.status(201).json({ status: 'success', data: task });
  } catch (err) {
    next(err);
  }
};

exports.getAllTasks = async (req, res, next) => {
  try {
    const { search, status, priority } = req.query;
    let query = supabase.from('tasks').select('*');
    query = query.eq('user_id', req.user.id);
    query = query.eq('isDeleted', false);
    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);
    if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    const { data: tasks, error } = await query.order('createdAt', { ascending: false });
    if (error) return next(AppError(error.message, 400));
    res.json({ status: 'success', results: tasks.length, data: tasks });
  } catch (err) {
    next(err);
  }
};

exports.getTask = async (req, res, next) => {
  try {
    const { data: task, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', req.params.id)
      .or(`user_id.eq.${req.user.id},sharedWith.cs.{${req.user.id}}`)
      .single();
    if (error || !task) return next(AppError('Task not found', 404));
    res.json({ status: 'success', data: task });
  } catch (err) {
    next(err);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const { data: task, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();
    if (error || !task) return next(AppError('Task not found or access denied', 404));
    const { data: updatedTask, error: updateError } = await supabase
      .from('tasks')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();
    if (updateError) return next(AppError(updateError.message, 400));
    getIO().to(task.user_id.toString()).emit('task_updated', updatedTask);
    res.json({ status: 'success', data: updatedTask });
  } catch (err) {
    next(err);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const { data: task, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .eq('isDeleted', false)
      .single();
    if (error || !task) return next(AppError('Task not found', 404));
    const { error: updateError } = await supabase
      .from('tasks')
      .update({ isDeleted: true, deletedAt: new Date().toISOString() })
      .eq('id', req.params.id);
    if (updateError) return next(AppError(updateError.message, 400));
    getIO().to(task.user_id.toString()).emit('task_deleted', task.id);
    res.json({ status: 'success', message: 'Task moved to bin' });
  } catch (err) {
    next(err);
  }
};

exports.getBinTasks = async (req, res, next) => {
  try {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('isDeleted', true)
      .order('deletedAt', { ascending: false });
    if (error) return next(AppError(error.message, 400));
    res.json({ status: 'success', results: tasks.length, data: tasks });
  } catch (err) {
    next(err);
  }
};

exports.restoreTask = async (req, res, next) => {
  try {
    const { data: task, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .eq('isDeleted', true)
      .single();
    if (error || !task) return next(AppError('Task not found', 404));
    const { error: updateError } = await supabase
      .from('tasks')
      .update({ isDeleted: false, deletedAt: null })
      .eq('id', req.params.id);
    if (updateError) return next(AppError(updateError.message, 400));
    getIO().to(task.user_id.toString()).emit('task_restored', task.id);
    res.json({ status: 'success', message: 'Task restored' });
  } catch (err) {
    next(err);
  }
};

exports.permanentDelete = async (req, res, next) => {
  try {
    const { data: task, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .eq('isDeleted', true)
      .single();
    if (error || !task) return next(AppError('Task not found', 404));

    const attachmentIds = task.attachments || [];
    if (attachmentIds.length > 0) {
      const { data: files } = await supabase
        .from('uploadfiles')
        .select('*')
        .in('id', attachmentIds);
      if (files?.length > 0) {
        const paths = files.map(f => f.filepath);
        await supabase.storage.from('taskflow-files').remove(paths).catch(() => {});
        await supabase.from('uploadfiles').delete().in('id', attachmentIds);
      }
    }

    await supabase.from('notifications').delete().eq('taskId', req.params.id);
    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .eq('id', req.params.id);
    if (deleteError) return next(AppError(deleteError.message, 400));
    getIO().to(task.user_id.toString()).emit('task_permanently_deleted', task.id);
    res.json({ status: 'success', message: 'Task permanently deleted' });
  } catch (err) {
    next(err);
  }
};

exports.shareTask = async (req, res, next) => {
  try {
    const { userIds } = req.body;
    if (!userIds || !userIds.length) return next(AppError('Please provide at least one user ID', 400));
    const { data: task, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .eq('isDeleted', false)
      .single();
    if (error || !task) return next(AppError('Task not found', 404));
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .in('id', userIds);
    if (usersError || users.length !== userIds.length) return next(AppError('One or more users not found', 404));
    if (userIds.includes(req.user.id)) return next(AppError('Cannot share task with yourself', 400));
    const { data: existingCopies } = await supabase
      .from('tasks')
      .select('user_id')
      .eq('title', task.title)
      .in('user_id', userIds)
      .eq('isDeleted', false);
    const alreadyShared = existingCopies?.map(c => c.user_id) || [];
    const newUsers = users.filter(u => !alreadyShared.includes(u.id));
    if (newUsers.length === 0) return next(AppError('Task already shared with all specified users', 400));
    const newTasks = [];
    for (const u of newUsers) {
      const copiedAttachments = await copyFilesForShare(task, u.id);
      newTasks.push({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        user_id: u.id,
        owner: u.id,
        attachments: copiedAttachments,
        pinned: false,
        isDeleted: false
      });
    }
    const { data: createdTasks, error: insertError } = await supabase
      .from('tasks')
      .insert(newTasks)
      .select();
    if (insertError) return next(AppError(insertError.message, 400));
    const notifications = newUsers.map(u => ({
      recipient: u.id,
      message: `Task shared with you: "${task.title}"`,
      taskId: createdTasks.find(t => t.user_id === u.id)?.id || task.id,
      type: 'task_shared'
    }));
    await supabase.from('notifications').insert(notifications);
    newUsers.forEach(u => {
      getIO().to(u.id.toString()).emit('new_notification', { message: `Task shared with you: "${task.title}"` });
    });
    if (alreadyShared.length > 0) {
      res.json({ status: 'success', message: `Task shared with ${newUsers.length} new user(s). Already shared with ${alreadyShared.length} user(s).`, data: createdTasks });
    } else {
      res.json({ status: 'success', message: `Task shared with ${newUsers.length} user(s)`, data: createdTasks });
    }
  } catch (err) {
    next(err);
  }
};

exports.getSharedTasks = async (req, res, next) => {
  try {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .contains('sharedWith', [req.user.id])
      .eq('isDeleted', false);
    if (error) return next(AppError(error.message, 400));
    res.json({ status: 'success', results: tasks.length, data: tasks });
  } catch (err) {
    next(err);
  }
};

exports.getAnalytics = async (req, res, next) => {
  try {
    const { data: totalTasks } = await supabase.from('tasks').select('*', { count: 'exact' }).eq('user_id', req.user.id);
    const { data: completedTasks } = await supabase.from('tasks').select('*', { count: 'exact' }).eq('user_id', req.user.id).eq('status', 'completed');
    const { data: pendingTasks } = await supabase.from('tasks').select('*', { count: 'exact' }).eq('user_id', req.user.id).eq('status', 'pending');
    res.json({
      status: 'success',
      data: {
        total: totalTasks?.length || 0,
        completed: completedTasks?.length || 0,
        pending: pendingTasks?.length || 0
      }
    });
  } catch (err) {
    next(err);
  }
};