const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const auth = require('../middleware/auth');

router.post('/temp', auth, uploadController.upload.single('file'), uploadController.uploadTempFile);
router.post('/:id/attachments', auth, uploadController.upload.single('file'), uploadController.uploadAttachment);
router.get('/:taskId/attachments', auth, uploadController.getAttachments);
router.get('/:taskId/attachments/:attachmentId/download', auth, uploadController.downloadAttachment);
router.get('/:taskId/attachments/:attachmentId/preview', auth, uploadController.previewAttachment);
router.delete('/:taskId/attachments/:attachmentId', auth, uploadController.removeAttachment);

module.exports = router;
