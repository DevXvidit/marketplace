const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: { type: String, enum: ['question', 'general-question'], required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  message: { type: String, required: true, trim: true },
  isRead: { type: Boolean, default: false },
}, { timestamps: { createdAt: true, updatedAt: false } });

module.exports = mongoose.model('Notification', notificationSchema);
