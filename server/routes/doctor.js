const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Patient = require('../models/Patient');
const HealthLog = require('../models/HealthLog');

router.get('/patients', protect, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const patients = await Patient.find({ doctorId: req.user._id });
    
    // Attach latest log to each patient
    const patientsWithLogs = await Promise.all(patients.map(async (p) => {
      const latestLog = await HealthLog.findOne({ patientId: p._id }).sort({ createdAt: -1 });
      return {
        ...p._doc,
        latestLog
      };
    }));

    res.json(patientsWithLogs);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

router.get('/patients/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const patient = await Patient.findById(req.params.id);
    if (!patient || patient.doctorId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    const logs = await HealthLog.find({ patientId: patient._id }).sort({ createdAt: -1 });
    res.json({ patient, logs });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
