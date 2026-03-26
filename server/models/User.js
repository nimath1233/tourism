const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['user', 'driver', 'guide'], default: 'user' },
  
  // Driver specific fields
  pricePerDay: { type: Number },
  vehicleType: { type: String },
  vehicleNumber: { type: String },
  availability: { type: String, enum: ['available', 'busy'] },
  vehicleImages: [{ type: String }],

  // Guide specific fields
  languages: { type: String },
  experience: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
