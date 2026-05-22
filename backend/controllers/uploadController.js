const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Task = require('../models/Task');
const AppError = require('../utils/appError');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt|zip/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Allowed: images, PDF, documents, spreadsheets, text, zip', 400));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

exports.uploadAttachment = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      $or: [
        { user: req.user.id },
        { sharedWith: req.user.id }
      ],
      isDeleted: false
    });

    if (!task) {
      return next(AppError('Task not found or access denied', 404));
    }

    if (!req.file) {
      return next(AppError('No file uploaded', 400));
    }

    const attachment = {
      filename: req.file.originalname,
      fileUrl: `/api/uploads/${req.file.filename}`,
      uploadedAt: new Date()
    };

    task.attachments.push(attachment);
    await task.save();

    res.json({
      status: 'success',
      message: 'File uploaded successfully',
      data: attachment
    });
  } catch (err) {
    next(err);
  }
};

exports.removeAttachment = async (req, res, next) => {
  try {
    const { attachmentId } = req.params;

    const task = await Task.findOne({
      _id: req.params.taskId,
      user: req.user.id,
      isDeleted: false
    });

    if (!task) {
      return next(AppError('Task not found or access denied', 404));
    }

    const attachment = task.attachments.id(attachmentId);
    if (!attachment) {
      return next(AppError('Attachment not found', 404));
    }

    const filePath = path.join(uploadDir, path.basename(attachment.fileUrl));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    task.attachments.pull(attachmentId);
    await task.save();

    res.json({
      status: 'success',
      message: 'Attachment removed successfully'
    });
  } catch (err) {
    next(err);
  }
};

exports.upload = upload;
