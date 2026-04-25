const express = require('express');
const router = express.Router();
const { analyzeText } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const HealthLog = require('../models/HealthLog');

router.post('/analyze', protect, analyzeText);

router.get('/logs', protect, async (req, res) => {
  try {
    const logs = await HealthLog.find({ patientId: req.user._id }).sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
