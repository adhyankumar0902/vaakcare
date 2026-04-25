const mongoose = require('mongoose');
const Doctor = require('./models/Doctor');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/vaakcare').then(async () => {
  const doctor = await Doctor.findOne({ doctorId: 'DOC001' });
  console.log('Doctor:', doctor);
  process.exit(0);
}).catch(console.error);
