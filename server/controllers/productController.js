const Product = require('../models/Product');
const Notification = require('../models/Notification');
const Offer = require('../models/Offer');
const { cloudinary } = require('../config/cloudinary');
const { getLatestRates } = require('../services/metalRateService');
const { attachPrice, applyTrendingFlags } = require('../utils/productHelpers');
const { recordProductView } = require('../services/trendingService');

// @route GET /api/products
const getProducts = async (req, res) => {
  const { category, metalType, search, isFeatured, isTrending, gender, page = 1, limit = 12, sort = '-createdAt' } = req.query;
  const now = new Date();

  const query = { isAvailable: true };
  if (category) query.category = category;
  if (metalType) query.metalType = metalType;
  if (isFeatured === 'true') query.isFeatured = true;
  if (isTrending === 'true') {
    query.$or = [
      { isTrending: true },
      { autoTrendingStartDate: { $ne: null }, autoTrendingEndDate: { $gte: now } }
    ];
  }
  if (gender && gender !== 'all') {
    // male tab → show male + unisex; female tab → show female + unisex
    query.gender = { $in: [gender, 'unisex'] };
  }
  if (search) query.$or = [
    { name: { $regex: search, $options: 'i' } },
    { description: { $regex: search, $options: 'i' } },
    { tags: { $regex: search, $options: 'i' } }
  ];

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate('category', 'name slug icon')
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const rates = await getLatestRates();
  
  const productIds = products.map(p => p._id);
  const activeOffers = await Offer.find({
    product: { $in: productIds },
    startTime: { $lte: now },
    endTime: { $gt: now }
  });
  const offerMap = {};
  activeOffers.forEach(o => { offerMap[o.product.toString()] = o; });

  const data = products.map(p => {
    const raw = attachPrice(p, rates);
    if (offerMap[p._id.toString()]) {
      raw.activeOffer = offerMap[p._id.toString()];
    }
    return applyTrendingFlags(raw, now);
  });

  res.json({ success: true, data, total, page: Number(page), pages: Math.ceil(total / limit), rates });
};

// @route GET /api/products/:id
const getProduct = async (req, res) => {
  const product = await Product.findOne({
    $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { slug: req.params.id }]
  }).populate('category', 'name slug icon');

  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  const rates = await getLatestRates();
  recordProductView(req, product._id).catch(() => {});
  const now = new Date();

  const activeOffer = await Offer.findOne({
    product: product._id,
    startTime: { $lte: now },
    endTime: { $gt: now }
  });

  const rawData = attachPrice(product, rates);
  if (activeOffer) {
    rawData.activeOffer = activeOffer;
  }

  res.json({ success: true, data: applyTrendingFlags(rawData, now), rates });
};

// @route POST /api/products (admin)
const createProduct = async (req, res) => {
  const { name, description, category, metalType, purity, weightInGrams, makingChargePercent,
    stonePrice, stoneDetails, isFeatured, isTrending, tags, stock, gender } = req.body;

  // Images from multer/cloudinary
  const images = req.files?.images?.map(f => ({ url: f.path, publicId: f.filename })) || [];

  // Optional video/gif (single)
  const mediaFile = req.files?.media?.[0];
  const mediaIsVideo = !!mediaFile?.mimetype?.startsWith('video/');
  const media = mediaFile ? { url: mediaFile.path, publicId: mediaFile.filename, resourceType: mediaIsVideo ? 'video' : 'image' } : undefined;

  // If images provided as base64 in body (alternative)
  if (req.body.images && Array.isArray(req.body.images)) {
    for (const img of req.body.images) {
      if (img.url) images.push(img);
    }
  }

  const product = await Product.create({
    name, description, category, metalType, purity, weightInGrams: Number(weightInGrams),
    makingChargePercent: Number(makingChargePercent) || 12,
    stonePrice: Number(stonePrice) || 0, stoneDetails,
    images, media, isFeatured: isFeatured === 'true' || isFeatured,
    isTrending: isTrending === 'true' || isTrending,
    tags: tags ? (Array.isArray(tags) ? tags : tags.split(',')) : [],
    stock: Number(stock) || 1,
    gender: gender || 'unisex',
  });

  await product.populate('category', 'name slug');
  res.status(201).json({ success: true, data: product });
};

// @route PUT /api/products/:id (admin)
const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  // Handle new images
  const newImages = req.files?.images?.map(f => ({ url: f.path, publicId: f.filename })) || [];

  // Handle new media (video/gif)
  const newMediaFile = req.files?.media?.[0];
  const newMediaIsVideo = !!newMediaFile?.mimetype?.startsWith('video/');
  const newMedia = newMediaFile
    ? { url: newMediaFile.path, publicId: newMediaFile.filename, resourceType: newMediaIsVideo ? 'video' : 'image' }
    : null;

  const updates = { ...req.body };
  if (newImages.length > 0) updates.images = [...(product.images || []), ...newImages];
  if (newMedia) {
    if (product.media?.publicId) {
      try { await cloudinary.uploader.destroy(product.media.publicId, { resource_type: product.media.resourceType || 'image' }); } catch {}
    }
    updates.media = newMedia;
  }
  if (updates.removeMedia === 'true') {
    if (product.media?.publicId) {
      try { await cloudinary.uploader.destroy(product.media.publicId, { resource_type: product.media.resourceType || 'image' }); } catch {}
    }
    updates.media = null;
  }
  if (updates.weightInGrams) updates.weightInGrams = Number(updates.weightInGrams);
  if (updates.makingChargePercent) updates.makingChargePercent = Number(updates.makingChargePercent);
  if (updates.stonePrice) updates.stonePrice = Number(updates.stonePrice);
  if (updates.tags && typeof updates.tags === 'string') updates.tags = updates.tags.split(',');

  const updated = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
    .populate('category', 'name slug');

  res.json({ success: true, data: updated });
};

// @route DELETE /api/products/:id (admin)
const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  // Delete images from cloudinary
  for (const img of product.images) {
    if (img.publicId) {
      try { await cloudinary.uploader.destroy(img.publicId); } catch {}
    }
  }
  // Delete media from cloudinary
  if (product.media?.publicId) {
    try { await cloudinary.uploader.destroy(product.media.publicId, { resource_type: product.media.resourceType || 'image' }); } catch {}
  }

  await product.deleteOne();
  res.json({ success: true, message: 'Product deleted' });
};

// @route DELETE /api/products/:id/images/:publicId (admin)
const deleteProductImage = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  const publicId = decodeURIComponent(req.params.publicId);
  try { await cloudinary.uploader.destroy(publicId); } catch {}

  product.images = product.images.filter(i => i.publicId !== publicId);
  await product.save();
  res.json({ success: true, data: product });
};

// @route POST /api/products/:id/question
const addProductQuestion = async (req, res) => {
  const { question } = req.body;
  const trimmed = (question || '').trim();
  if (!trimmed) return res.status(400).json({ success: false, message: 'Question is required' });

  const product = await Product.findOne({
    $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { slug: req.params.id }]
  });
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  const newQuestion = {
    userId: req.user._id,
    name: req.user.name,
    question: trimmed,
  };

  product.questions.unshift(newQuestion);
  await product.save();


  const savedQuestion = product.questions[0];

  const notification = await Notification.create({
    type: 'question',
    productId: product._id,
    questionId: savedQuestion._id,
    message: `New question on ${product.name}`,
    isRead: false,
  });

  const io = req.app.get('io');
  if (io) {
    io.emit('question:new', { productId: product._id, question: savedQuestion, productName: product.name });
    io.emit('notification:new', notification);
  }

  res.status(201).json({ success: true, data: savedQuestion });
};

// @route GET /api/products/:id/questions
const getProductQuestions = async (req, res) => {
  const product = await Product.findOne({
    $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { slug: req.params.id }]
  }).select('questions');

  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  const questions = [...(product.questions || [])].sort((a, b) => b.createdAt - a.createdAt);
  res.json({ success: true, data: questions });
};

// @route PUT /api/products/:productId/question/:questionId (admin)
const answerProductQuestion = async (req, res) => {
  const { answer } = req.body;
  const trimmed = (answer || '').trim();
  if (!trimmed) return res.status(400).json({ success: false, message: 'Answer is required' });

  const product = await Product.findById(req.params.productId);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  const question = product.questions.id(req.params.questionId);
  if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

  question.answer = trimmed;
  question.isAnswered = true;
  question.answeredAt = new Date();
  await product.save();

  const io = req.app.get('io');
  if (io) {
    io.emit('question:answered', { productId: product._id, question });
  }

  res.json({ success: true, data: question });
};

module.exports = {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct, deleteProductImage,
  addProductQuestion, getProductQuestions, answerProductQuestion
};
