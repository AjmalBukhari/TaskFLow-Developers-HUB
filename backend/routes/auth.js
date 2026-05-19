const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.get('/me', auth, authController.getCurrentUser);
router.put('/me', auth, authController.updateUser);
router.put('/me/password', auth, authController.updatePassword);
router.delete('/me', auth, authController.deleteUser);

module.exports = router;
