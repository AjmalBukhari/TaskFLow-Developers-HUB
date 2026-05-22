const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

router.get('/overview', auth, analyticsController.getOverview);
router.get('/trends', auth, analyticsController.getTrends);

module.exports = router;
