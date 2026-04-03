const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const {
  getOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  getActiveOffer
} = require('../controllers/offerController');

// Public route to get active offer
router.get('/active', getActiveOffer);

// Admin operations
router.route('/')
  .get(protect, admin, getOffers)
  .post(protect, admin, upload.single('image'), createOffer);

router.route('/:id')
  .put(protect, admin, upload.single('image'), updateOffer)
  .delete(protect, admin, deleteOffer);

module.exports = router;
