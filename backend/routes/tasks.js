const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { validateTask, handleValidation } = require('../middleware/validate');
const auth = require('../middleware/auth');

router.post('/', auth, validateTask, handleValidation, taskController.createTask);
router.get('/', auth, taskController.getAllTasks);
router.get('/bin', auth, taskController.getBinTasks);
router.put('/restore/:id', auth, taskController.restoreTask);
router.delete('/permanent/:id', auth, taskController.permanentDelete);
router.put('/:id/share', auth, taskController.shareTask);
router.get('/shared', auth, taskController.getSharedTasks);
router.get('/:id', auth, taskController.getTask);
router.put('/:id', auth, taskController.updateTask);
router.delete('/:id', auth, taskController.deleteTask);

module.exports = router;
