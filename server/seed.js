require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Doctor = require('./models/Doctor');
const Patient = require('./models/Patient');
const HealthLog = require('./models/HealthLog');

const connectDB = require('./config/db');

const seedData = async () => {
  try {
    await connectDB();

    await Doctor.deleteMany();
    await Patient.deleteMany();
    await HealthLog.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);

    const doctors = await Doctor.insertMany([
      { doctorId: 'DOC001', name: 'Dr. Sharma', hospital: 'City Hospital', specialization: 'Cardiologist', password },
      { doctorId: 'DOC002', name: 'Dr. Gupta', hospital: 'City Hospital', specialization: 'General Physician', password },
      { doctorId: 'DOC003', name: 'Dr. Verma', hospital: 'Apollo Hospital', specialization: 'Neurologist', password },
      { doctorId: 'DOC004', name: 'Dr. Reddy', hospital: 'Apollo Hospital', specialization: 'Pediatrician', password },
    ]);

    const patients = await Patient.insertMany([
      { name: 'Ramesh Kumar', password, guardianPhoneNumber: '9876543210', hospitalName: 'City Hospital', doctorId: doctors[0]._id },
      { name: 'Sita Devi', password, guardianPhoneNumber: '9876543211', hospitalName: 'City Hospital', doctorId: doctors[1]._id },
      { name: 'Amit Singh', password, guardianPhoneNumber: '9876543212', hospitalName: 'Apollo Hospital', doctorId: doctors[2]._id },
      { name: 'Priya Patel', password, guardianPhoneNumber: '9876543213', hospitalName: 'Apollo Hospital', doctorId: doctors[3]._id },
    ]);

    await HealthLog.insertMany([
      { patientId: patients[0]._id, transcript: 'I am feeling severe chest pain.', summary: 'Severe chest pain reported', risk: 'HIGH', confidence: 95, issues: ['Chest pain'], recommendation: 'Immediate medical attention' },
      { patientId: patients[1]._id, transcript: 'I have a mild fever.', summary: 'Mild fever reported', risk: 'MEDIUM', confidence: 85, issues: ['Fever'], recommendation: 'Rest and paracetamol' },
      { patientId: patients[2]._id, transcript: 'Feeling perfectly fine today.', summary: 'No symptoms', risk: 'LOW', confidence: 99, issues: [], recommendation: 'Continue regular checkups' },
    ]);

    console.log('Data Seeded Successfully');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
