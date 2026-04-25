const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  password: { type: String, required: true },
  guardianPhoneNumber: { type: String, required: true },
  hospitalName: { type: String, required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
