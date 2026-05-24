const multer = require('multer');
const path = require('path');
const fs = require('fs');
const supabase = require('../config/supabase');
const AppError = require('../utils/appError');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt|zip/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (mimetype && extname) cb(null, true);
  else cb(new AppError('Invalid file type', 400));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

exports.uploadAttachment = async (req, res, next) => {
  try {
    const { data: task, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', req.params.id)
      .or(`user_id.eq.${req.user.id}`)
      .eq('isDeleted', false)
      .single();
    if (error || !task) return next(AppError('Task not found or access denied', 404));
    if (!req.file) return next(AppError('No file uploaded', 400));
    const attachment = {
      filename: req.file.originalname,
      fileUrl: `/api/uploads/${req.file.filename}`,
      uploadedAt: new Date().toISOString()
    };
    const attachments = [...(task.attachments || []), attachment];
    await supabase.from('tasks').update({ attachments }).eq('id', req.params.id);
    res.json({ status: 'success', message: 'File uploaded', data: attachment });
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
    const attachments = (task.attachments || []).filter(a => a.fileUrl !== `/api/uploads/${req.params.attachmentId}`);
    await supabase.from('tasks').update({ attachments }).eq('id', req.params.taskId);
    res.json({ status: 'success', message: 'Attachment removed' });
  } catch (err) {
    next(err);
  }
};

exports.upload = upload;