const mongoose = require('mongoose');

const metalRateSchema = new mongoose.Schema({
  goldRate: { type: Number, required: true },   // per gram in INR
  silverRate: { type: Number, required: true }, // per gram in INR
  goldRate24K: { type: Number },
  goldRate22K: { type: Number },
  goldRate18K: { type: Number },
  source: { type: String, default: 'api' },
  fetchedAt: { type: Date, default: Date.now },
  isManualOverride: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('MetalRate', metalRateSchema);
