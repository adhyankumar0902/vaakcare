const mongoose = require('mongoose');

const healthLogSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  transcript: { type: String, required: true },
  summary: { type: String, required: true },
  risk: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'LOW' },
  confidence: { type: Number, default: 0 },
  issues: [{ type: String }],
  recommendation: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('HealthLog', healthLogSchema);
