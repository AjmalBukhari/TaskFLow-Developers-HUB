const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const auth = require('../middleware/auth');

router.post('/:id/attachments', auth, uploadController.upload.single('file'), uploadController.uploadAttachment);
router.delete('/:taskId/attachments/:attachmentId', auth, uploadController.removeAttachment);

module.exports = router;
