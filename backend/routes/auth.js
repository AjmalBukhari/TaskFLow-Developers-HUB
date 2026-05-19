const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// ================= REGISTER =================
router.post('/register', authController.register);


// ================= LOGIN =================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token });

  } catch (err) {
    res.status(500).json({
      message: 'Server error',
      error: err.message
    });
  }
});


// ================= PROFILE GET =================
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});


// ================= PROFILE UPDATE =================
router.put('/me', auth, authController.updateUser);

// ================= UPDATE PASSWORD =================
router.put('/me/password', auth, authController.updatePassword);

// ================= DELETE ACCOUNT =================
router.delete('/me', auth, authController.deleteUser);

module.exports = router;