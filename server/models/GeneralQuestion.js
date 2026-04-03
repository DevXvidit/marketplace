const mongoose = require('mongoose');

const generalQuestionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  name: { type: String, trim: true, default: 'Anonymous' },
  email: { type: String, trim: true, default: '' },
  phone: { type: String, trim: true, default: '' },
  question: { type: String, required: true, trim: true },
  answer: { type: String, default: '', trim: true },
  isAnswered: { type: Boolean, default: false },
  answeredAt: { type: Date, default: null },
}, { timestamps: { createdAt: true, updatedAt: true } });

module.exports = mongoose.model('GeneralQuestion', generalQuestionSchema);
