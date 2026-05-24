const multer = require('multer');
const path = require('path');
const supabase = require('../config/supabase');
const AppError = require('../utils/appError');

const BUCKET_NAME = 'taskflow-files';
const SUPABASE_URL = process.env.SUPABASE_URL || '';

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

function getPublicUrl(storagePath) {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${storagePath}`;
}

async function uploadToStorage(userId, storedName, buffer, contentType) {
  if (!supabase) throw new Error('Supabase not configured');
  const storagePath = `${userId}/${storedName}`;
  const bucket = supabase.storage.from(BUCKET_NAME);
  const { error } = await bucket.upload(storagePath, buffer, { contentType, upsert: false });
  if (error) {
    if (error.message?.toLowerCase().includes('bucket') || error.statusCode === 404) {
      await supabase.storage.createBucket(BUCKET_NAME, { public: true }).catch(() => {});
      const { error: retryError } = await bucket.upload(storagePath, buffer, { contentType, upsert: false });
      if (retryError) throw new Error(retryError.message);
    } else if (error.message?.toLowerCase().includes('row-level security') || error.message?.includes('violates')) {
      throw new Error('Storage permission denied. Please update SUPABASE_SERVICE_ROLE_KEY in Vercel env to the actual service_role key from Supabase dashboard (Project Settings → API → service_role key).');
    } else {
      throw new Error(error.message);
    }
  }
  return storagePath;
}

exports.uploadAttachment = async (req, res, next) => {
  try {
    const { data: task, error } = await supabase
      .from('tasks')
      .select('id, attachments')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .eq('isDeleted', false)
      .single();
    if (error || !task) return next(AppError('Task not found or access denied', 404));
    if (!req.file) return next(AppError('No file uploaded', 400));

    const existingIds = task.attachments || [];
    if (existingIds.length > 0) {
      const { data: existingFiles } = await supabase
        .from('uploadfiles')
        .select('filename')
        .in('id', existingIds);
      const existingNames = (existingFiles || []).map(f => f.filename);
      if (existingNames.includes(req.file.originalname)) {
        return next(AppError(`File "${req.file.originalname}" already exists. Rename and try again.`, 400));
      }
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(req.file.originalname);
    const storedName = uniqueSuffix + ext;

    let storagePath;
    try {
      storagePath = await uploadToStorage(req.user.id, storedName, req.file.buffer, req.file.mimetype);
    } catch (err) {
      console.error('Upload to storage failed:', err.message);
      return next(AppError(err.message, 500));
    }

    const { data: fileRecord, error: insertError } = await supabase
      .from('uploadfiles')
      .insert({
        filename: req.file.originalname,
        filepath: storagePath,
        user_id: req.user.id,
        task_id: req.params.id,
        size: req.file.size
      })
      .select()
      .single();
    if (insertError) {
      await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
      return next(AppError(insertError.message, 400));
    }

    const attachments = [...existingIds, fileRecord.id];
    await supabase.from('tasks').update({ attachments }).eq('id', req.params.id);

    res.status(201).json({
      status: 'success',
      message: 'File uploaded',
      data: { ...fileRecord, publicUrl: getPublicUrl(storagePath) }
    });
  } catch (err) {
    next(err);
  }
};

exports.getAttachments = async (req, res, next) => {
  try {
    const { data: task } = await supabase
      .from('tasks')
      .select('id, attachments')
      .eq('id', req.params.taskId)
      .or(`user_id.eq.${req.user.id},owner.eq.${req.user.id}`)
      .eq('isDeleted', false)
      .single();
    if (!task) return next(AppError('Task not found or access denied', 404));

    const ids = task.attachments || [];
    if (ids.length === 0) return res.json({ status: 'success', data: [] });

    const { data: files, error } = await supabase
      .from('uploadfiles')
      .select('*')
      .in('id', ids);
    if (error) return next(AppError(error.message, 400));

    const data = (files || []).map(f => ({ ...f, publicUrl: getPublicUrl(f.filepath) }));
    res.json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};

exports.downloadAttachment = async (req, res, next) => {
  try {
    const { data: fileRecord, error } = await supabase
      .from('uploadfiles')
      .select('*')
      .eq('id', req.params.attachmentId)
      .single();
    if (error || !fileRecord) return next(AppError('File not found', 404));

    const { data: task } = await supabase
      .from('tasks')
      .select('id, user_id')
      .eq('id', fileRecord.task_id)
      .eq('isDeleted', false)
      .single();
    if (!task || (task.user_id !== req.user.id && fileRecord.user_id !== req.user.id))
      return next(AppError('Access denied', 403));

    res.redirect(getPublicUrl(fileRecord.filepath));
  } catch (err) {
    next(err);
  }
};

exports.previewAttachment = async (req, res, next) => {
  try {
    const { data: fileRecord, error } = await supabase
      .from('uploadfiles')
      .select('*')
      .eq('id', req.params.attachmentId)
      .single();
    if (error || !fileRecord) return next(AppError('File not found', 404));

    const { data: task } = await supabase
      .from('tasks')
      .select('id, user_id')
      .eq('id', fileRecord.task_id)
      .eq('isDeleted', false)
      .single();
    if (!task || (task.user_id !== req.user.id && fileRecord.user_id !== req.user.id))
      return next(AppError('Access denied', 403));

    res.redirect(getPublicUrl(fileRecord.filepath));
  } catch (err) {
    next(err);
  }
};

exports.removeAttachment = async (req, res, next) => {
  try {
    const { data: fileRecord, error: fetchError } = await supabase
      .from('uploadfiles')
      .select('*')
      .eq('id', req.params.attachmentId)
      .single();
    if (fetchError || !fileRecord) return next(AppError('File not found', 404));

    const { data: task } = await supabase
      .from('tasks')
      .select('id, attachments')
      .eq('id', fileRecord.task_id)
      .eq('user_id', req.user.id)
      .eq('isDeleted', false)
      .single();
    if (!task) return next(AppError('Task not found or access denied', 404));

    await supabase.storage.from(BUCKET_NAME).remove([fileRecord.filepath]);
    await supabase.from('uploadfiles').delete().eq('id', req.params.attachmentId);

    const attachments = (task.attachments || []).filter(id => id !== req.params.attachmentId);
    await supabase.from('tasks').update({ attachments }).eq('id', fileRecord.task_id);

    res.json({ status: 'success', message: 'Attachment removed' });
  } catch (err) {
    next(err);
  }
};

exports.copyFilesForShare = async (task, recipientId) => {
  const ids = task.attachments || [];
  if (ids.length === 0) return [];

  const { data: sourceFiles } = await supabase
    .from('uploadfiles')
    .select('*')
    .in('id', ids);
  if (!sourceFiles || sourceFiles.length === 0) return [];

  const newIds = [];
  for (const file of sourceFiles) {
    const ext = path.extname(file.filename);
    const newStoredName = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
    const newPath = `${recipientId}/${newStoredName}`;

    const { error: copyError } = await supabase.storage
      .from(BUCKET_NAME)
      .copy(file.filepath, newPath);
    if (copyError) continue;

    const { data: newRecord } = await supabase
      .from('uploadfiles')
      .insert({
        filename: file.filename,
        filepath: newPath,
        user_id: recipientId,
        task_id: task.id,
        size: file.size
      })
      .select()
      .single();
    if (newRecord) newIds.push(newRecord.id);
  }
  return newIds;
};

exports.deleteUserFolder = async (userId) => {
  try {
    const { data: files } = await supabase.storage
      .from(BUCKET_NAME)
      .list(userId);
    if (files && files.length > 0) {
      const paths = files.map(f => `${userId}/${f.name}`);
      await supabase.storage.from(BUCKET_NAME).remove(paths);
    }
  } catch (err) {
    console.warn('Failed to delete user storage folder:', err.message);
  }
};

exports.uploadTempFile = async (req, res, next) => {
  try {
    if (!req.file) return next(AppError('No file uploaded', 400));
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(req.file.originalname);
    const storedName = uniqueSuffix + ext;
    const storagePath = `temp/${req.user.id}/${storedName}`;

    const bucket = supabase.storage.from(BUCKET_NAME);
    const { error: uploadError } = await bucket.upload(storagePath, req.file.buffer, {
      contentType: req.file.mimetype, upsert: false
    });
    if (uploadError) {
      if (uploadError.message?.toLowerCase().includes('bucket') || uploadError.statusCode === 404) {
        await supabase.storage.createBucket(BUCKET_NAME, { public: true }).catch(() => {});
        const { error: retryError } = await bucket.upload(storagePath, req.file.buffer, {
          contentType: req.file.mimetype, upsert: false
        });
        if (retryError) return next(AppError(retryError.message, 500));
      } else if (uploadError.message?.toLowerCase().includes('row-level security') || uploadError.message?.includes('violates')) {
        return next(AppError('Storage permission denied. Check SUPABASE_SERVICE_ROLE_KEY.', 500));
      } else {
        return next(AppError(uploadError.message, 500));
      }
    }

    const { data: fileRecord, error: insertError } = await supabase
      .from('uploadfiles')
      .insert({
        filename: req.file.originalname,
        filepath: storagePath,
        user_id: req.user.id,
        task_id: null,
        size: req.file.size
      })
      .select()
      .single();
    if (insertError) {
      await bucket.remove([storagePath]);
      return next(AppError(insertError.message, 400));
    }

    res.status(201).json({
      status: 'success',
      message: 'File uploaded',
      data: { ...fileRecord, publicUrl: getPublicUrl(storagePath) }
    });
  } catch (err) {
    next(err);
  }
};

exports.createUserFolder = () => {};

exports.upload = upload;
