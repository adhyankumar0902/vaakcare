const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

const loginDoctor = async (req, res) => {
  try {
    const { doctorId, password } = req.body;

    const doctor = await Doctor.findOne({ doctorId });

    if (doctor && (await bcrypt.compare(password, doctor.password))) {
      res.json({
        _id: doctor._id,
        doctorId: doctor.doctorId,
        name: doctor.name,
        hospital: doctor.hospital,
        specialization: doctor.specialization,
        token: generateToken(doctor._id, 'doctor'),
        role: 'doctor'
      });
    } else {
      res.status(401).json({ message: 'Invalid doctor ID or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const registerPatient = async (req, res) => {
  try {
    const { name, password, guardianPhoneNumber, hospitalName, doctorId } = req.body;

    const doctor = await Doctor.findOne({ doctorId });
    if (!doctor) {
      return res.status(400).json({ message: 'Invalid Doctor selected' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const patient = await Patient.create({
      name,
      password: hashedPassword,
      guardianPhoneNumber,
      hospitalName,
      doctorId: doctor._id
    });

    if (patient) {
      res.status(201).json({
        _id: patient._id,
        name: patient.name,
        hospitalName: patient.hospitalName,
        doctorId: patient.doctorId,
        token: generateToken(patient._id, 'patient'),
        role: 'patient'
      });
    } else {
      res.status(400).json({ message: 'Invalid patient data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const loginPatient = async (req, res) => {
  try {
    const { name, password } = req.body;

    const patient = await Patient.findOne({ name });

    if (patient && (await bcrypt.compare(password, patient.password))) {
      res.json({
        _id: patient._id,
        name: patient.name,
        hospitalName: patient.hospitalName,
        doctorId: patient.doctorId,
        guardianPhoneNumber: patient.guardianPhoneNumber,
        token: generateToken(patient._id, 'patient'),
        role: 'patient'
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  loginDoctor,
  registerPatient,
  loginPatient,
};
