// ═══════════════════════════════════════
// CATEGORY CONTROLLER
// ═══════════════════════════════════════
const Category = require('../models/Category');
const Product = require('../models/Product');
const MetalRate = require('../models/MetalRate');
const User = require('../models/User');
const { getLatestRates, fetchAndSaveRates } = require('../services/metalRateService');
const { cloudinary } = require('../config/cloudinary');

// Categories
const getCategories = async (req, res) => {
  const cats = await Category.find({ isActive: true }).sort('sortOrder');
  res.json({ success: true, data: cats });
};

const createCategory = async (req, res) => {
  const { name, description, icon, sortOrder } = req.body;
  const image = req.file ? { url: req.file.path, publicId: req.file.filename } : undefined;
  const cat = await Category.create({ name, description, icon, sortOrder, image });
  res.status(201).json({ success: true, data: cat });
};

const updateCategory = async (req, res) => {
  const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
  res.json({ success: true, data: cat });
};

const deleteCategory = async (req, res) => {
  const cat = await Category.findById(req.params.id);
  if (!cat) return res.status(404).json({ success: false, message: 'Not found' });
  if (cat.image?.publicId) {
    try { await cloudinary.uploader.destroy(cat.image.publicId); } catch {}
  }
  await cat.deleteOne();
  res.json({ success: true, message: 'Category deleted' });
};

// Metal Rates
const getRates = async (req, res) => {
  const rates = await getLatestRates();
  const history = await MetalRate.find().sort('-createdAt').limit(24).lean();
  res.json({ success: true, data: rates, history });
};

const setManualRates = async (req, res) => {
  const { goldRate, silverRate } = req.body;
  if (!goldRate || !silverRate)
    return res.status(400).json({ success: false, message: 'Both rates required' });

  const goldRate22K = Math.round(goldRate);
  const goldRate24K = Math.round(goldRate * 24 / 22);
  const goldRate18K = Math.round(goldRate * 18 / 22);

  await MetalRate.create({
    goldRate: goldRate22K, silverRate: Math.round(silverRate),
    goldRate24K, goldRate22K, goldRate18K,
    source: 'manual', isManualOverride: true
  });
  res.json({ success: true, message: 'Rates updated manually' });
};

const refreshRates = async (req, res) => {
  const rates = await fetchAndSaveRates();
  res.json({ success: true, data: rates });
};

// Admin Dashboard
const getDashboardStats = async (req, res) => {
  const [totalProducts, totalUsers, totalCategories, featuredProducts, latestProducts, rates] = await Promise.all([
    Product.countDocuments({ isAvailable: true }),
    User.countDocuments({ role: 'user' }),
    Category.countDocuments({ isActive: true }),
    Product.countDocuments({ isFeatured: true }),
    Product.find().sort('-createdAt').limit(5).populate('category', 'name'),
    getLatestRates(),
  ]);

  res.json({
    success: true,
    data: { totalProducts, totalUsers, totalCategories, featuredProducts, latestProducts, rates }
  });
};

const getAllUsers = async (req, res) => {
  const users = await User.find().select('-password').sort('-createdAt');
  res.json({ success: true, data: users });
};

const toggleUserStatus = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, data: user });
};

// Wishlist
const toggleWishlist = async (req, res) => {
  const user = await User.findById(req.user._id);
  const productId = req.params.productId;
  const idx = user.wishlist.indexOf(productId);
  if (idx > -1) user.wishlist.splice(idx, 1);
  else user.wishlist.push(productId);
  await user.save();
  res.json({ success: true, wishlist: user.wishlist });
};

const getWishlist = async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'wishlist',
    populate: { path: 'category', select: 'name slug' }
  });
  const rates = await getLatestRates();
  const items = user.wishlist.map(p => {
    const obj = p.toObject();
    const rate = obj.metalType === 'silver' ? rates.silverRate : (rates.goldRate22K || rates.goldRate);
    const base = rate * obj.weightInGrams;
    obj.calculatedPrice = Math.round(base + base * obj.makingChargePercent / 100 + (obj.stonePrice || 0));
    return obj;
  });
  res.json({ success: true, data: items });
};

module.exports = {
  getCategories, createCategory, updateCategory, deleteCategory,
  getRates, setManualRates, refreshRates,
  getDashboardStats, getAllUsers, toggleUserStatus,
  toggleWishlist, getWishlist
};
