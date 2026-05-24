const multer = require('multer');
const path = require('path');
const fs = require('fs');
const supabase = require('../config/supabase');
const AppError = require('../utils/appError');

const BASE_UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userDir = path.join(BASE_UPLOAD_DIR, req.user.id);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

exports.uploadAttachment = async (req, res, next) => {
  try {
    const { data: task, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .eq('isDeleted', false)
      .single();
    if (error || !task) return next(AppError('Task not found or access denied', 404));
    if (!req.file) return next(AppError('No file uploaded', 400));

    const existingNames = (task.attachments || []).map(a => a.filename);
    if (existingNames.includes(req.file.originalname)) {
      fs.unlinkSync(req.file.path);
      return next(AppError(`File "${req.file.originalname}" already exists. Change the filename and try again.`, 400));
    }

    const attachment = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      filename: req.file.originalname,
      storedName: req.file.filename,
      uploadedAt: new Date().toISOString(),
      size: req.file.size
    };
    const attachments = [...(task.attachments || []), attachment];
    await supabase.from('tasks').update({ attachments }).eq('id', req.params.id);
    res.status(201).json({ status: 'success', message: 'File uploaded', data: attachment });
  } catch (err) {
    next(err);
  }
};

exports.downloadAttachment = async (req, res, next) => {
  try {
    const { data: task, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', req.params.taskId)
      .or(`user_id.eq.${req.user.id}`)
      .eq('isDeleted', false)
      .single();
    if (error || !task) return next(AppError('Task not found or access denied', 404));
    const attachment = (task.attachments || []).find(a => a.id === req.params.attachmentId);
    if (!attachment) return next(AppError('Attachment not found', 404));
    const filePath = path.join(BASE_UPLOAD_DIR, req.user.id, attachment.storedName);
    if (!fs.existsSync(filePath)) return next(AppError('File not found on disk', 404));
    res.download(filePath, attachment.filename);
  } catch (err) {
    next(err);
  }
};

exports.previewAttachment = async (req, res, next) => {
  try {
    const { data: task, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', req.params.taskId)
      .or(`user_id.eq.${req.user.id}`)
      .eq('isDeleted', false)
      .single();
    if (error || !task) return next(AppError('Task not found or access denied', 404));
    const attachment = (task.attachments || []).find(a => a.id === req.params.attachmentId);
    if (!attachment) return next(AppError('Attachment not found', 404));
    const filePath = path.join(BASE_UPLOAD_DIR, req.user.id, attachment.storedName);
    if (!fs.existsSync(filePath)) return next(AppError('File not found on disk', 404));
    res.sendFile(filePath);
  } catch (err) {
    next(err);
  }
};

exports.removeAttachment = async (req, res, next) => {
  try {
    const { data: task, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', req.params.taskId)
      .eq('user_id', req.user.id)
      .eq('isDeleted', false)
      .single();
    if (error || !task) return next(AppError('Task not found or access denied', 404));
    const attachment = (task.attachments || []).find(a => a.id === req.params.attachmentId);
    if (!attachment) return next(AppError('Attachment not found', 404));
    const filePath = path.join(BASE_UPLOAD_DIR, req.user.id, attachment.storedName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    const attachments = (task.attachments || []).filter(a => a.id !== req.params.attachmentId);
    await supabase.from('tasks').update({ attachments }).eq('id', req.params.taskId);
    res.json({ status: 'success', message: 'Attachment removed' });
  } catch (err) {
    next(err);
  }
};

exports.copyFilesForShare = async (task, recipientId) => {
  const attachments = task.attachments || [];
  if (attachments.length === 0) return [];
  const srcDir = path.join(BASE_UPLOAD_DIR, task.user_id);
  const destDir = path.join(BASE_UPLOAD_DIR, recipientId);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  return attachments.map(att => {
    const srcPath = path.join(srcDir, att.storedName);
    const newStoredName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(att.filename);
    const destPath = path.join(destDir, newStoredName);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
    }
    return {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      filename: att.filename,
      storedName: newStoredName,
      uploadedAt: new Date().toISOString(),
      size: att.size || 0
    };
  });
};

exports.deleteUserFolder = (userId) => {
  const userDir = path.join(BASE_UPLOAD_DIR, userId);
  if (fs.existsSync(userDir)) {
    fs.rmSync(userDir, { recursive: true, force: true });
  }
};

exports.createUserFolder = (userId) => {
  const userDir = path.join(BASE_UPLOAD_DIR, userId);
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }
};

exports.upload = upload;
