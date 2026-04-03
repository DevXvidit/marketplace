const mongoose = require('mongoose');

const productViewSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  viewedAt: { type: Date, default: Date.now, index: true },
  // Optional identifier to dedupe rapid repeats (user/session/ip+ua)
  viewerKey: { type: String, default: null, index: true },
});

productViewSchema.index({ productId: 1, viewedAt: -1 });
productViewSchema.index({ productId: 1, viewerKey: 1, viewedAt: -1 });

module.exports = mongoose.model('ProductView', productViewSchema);
