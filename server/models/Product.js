const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  description: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  metalType: { type: String, enum: ['gold', 'silver', 'platinum', 'mixed'], required: true },
  purity: {
    type: String,
    enum: ['24K', '22K', '18K', '14K', '925', '999', 'other'],
    default: '22K'
  },
  weightInGrams: { type: Number, required: true, min: 0 },
  makingChargePercent: { type: Number, required: true, min: 0, max: 100, default: 12 },
  stonePrice: { type: Number, default: 0 },
  stoneDetails: { type: String, default: '' },
  images: [{ 
    url: String, 
    publicId: String 
  }],
  media: {
    url: String,
    publicId: String,
    resourceType: { type: String, default: 'image' },
  },
  has3DModel: { type: Boolean, default: false },
  model3DUrl: { type: String, default: '' },
  isFeatured: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },
  autoTrendingStartDate: { type: Date, default: null },
  autoTrendingEndDate: { type: Date, default: null },
  isAvailable: { type: Boolean, default: true },
  stock: { type: Number, default: 1 },
  tags: [String],
  sku: { type: String, unique: true, sparse: true },
  // Gender targeting: for unisex categories like rings, chains, etc.
  gender: { type: String, enum: ['male', 'female', 'unisex'], default: 'unisex' },
  questions: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    name: { type: String, default: 'Anonymous', trim: true },
    question: { type: String, required: true, trim: true },
    answer: { type: String, default: '', trim: true },
    isAnswered: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    answeredAt: { type: Date, default: null },
  }],
}, { timestamps: true });

productSchema.index({ autoTrendingEndDate: 1 });

// Generate slug before saving
productSchema.pre('save', async function (next) {
  if (!this.slug || this.isModified('name')) {
    const base = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const count = await mongoose.model('Product').countDocuments({ slug: new RegExp(`^${base}`) });
    this.slug = count > 0 ? `${base}-${count}` : base;
  }
  if (!this.sku) {
    this.sku = `JWL-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  }
  next();
});

// Virtual for calculated price (requires rate passed in)
productSchema.methods.calculatePrice = function(metalRate) {
  const basePrice = metalRate * this.weightInGrams;
  const makingCharges = basePrice * (this.makingChargePercent / 100);
  return Math.round(basePrice + makingCharges + (this.stonePrice || 0));
};

module.exports = mongoose.model('Product', productSchema);
