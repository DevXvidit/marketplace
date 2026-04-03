const Offer = require('../models/Offer');
const Product = require('../models/Product');

// Get all offers (Admin)
exports.getOffers = async (req, res, next) => {
  try {
    const offers = await Offer.find().populate('product', 'name price images').sort({ createdAt: -1 });
    res.json({ success: true, data: offers });
  } catch (err) {
    next(err);
  }
};

// Create a new offer (Admin)
exports.createOffer = async (req, res, next) => {
  try {
    const { product, title, description, discountType, discountValue, startTime, endTime } = req.body;
    let image = '';
    if (req.file) {
      image = req.file.path;
    }

    const offer = await Offer.create({
      product,
      title,
      description,
      image,
      discountType,
      discountValue: Number(discountValue),
      startTime,
      endTime
    });

    res.status(201).json({ success: true, data: offer });
  } catch (err) {
    next(err);
  }
};

// Update an offer (Admin)
exports.updateOffer = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = req.file.path;
    }
    
    // Convert to proper types if needed
    if (updateData.discountValue) updateData.discountValue = Number(updateData.discountValue);

    const offer = await Offer.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!offer) {
      const error = new Error('Offer not found');
      error.status = 404;
      throw error;
    }

    res.json({ success: true, data: offer });
  } catch (err) {
    next(err);
  }
};

// Delete an offer (Admin)
exports.deleteOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) {
      const error = new Error('Offer not found');
      error.status = 404;
      throw error;
    }
    res.json({ success: true, message: 'Offer deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Get the active offer for the homepage
exports.getActiveOffer = async (req, res, next) => {
  try {
    const now = new Date();
    // Find the first offer that is currently active. 
    // If multiple exist, we can sort by endTime ascending (ending soonest) or simply take the most recently created.
    const activeOffer = await Offer.findOne({
      startTime: { $lte: now },
      endTime: { $gt: now }
    }).populate('product').sort({ createdAt: -1 });

    if (!activeOffer) {
      return res.json({ success: true, data: null });
    }

    res.json({ success: true, data: activeOffer });
  } catch (err) {
    next(err);
  }
};
