const express = require('express');
const router = express.Router();
const {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct, deleteProductImage,
  addProductQuestion, getProductQuestions, answerProductQuestion
} = require('../controllers/productController');
const { protect, optionalProtect, admin } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.get('/', getProducts);
router.get('/:id', optionalProtect, getProduct);
router.get('/:id/questions', getProductQuestions);
router.post('/:id/question', protect, addProductQuestion);
router.put('/:productId/question/:questionId', protect, admin, answerProductQuestion);
router.post('/', protect, admin, upload.fields([{ name: 'images', maxCount: 8 }, { name: 'media', maxCount: 1 }]), createProduct);
router.put('/:id', protect, admin, upload.fields([{ name: 'images', maxCount: 8 }, { name: 'media', maxCount: 1 }]), updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.delete('/:id/images/:publicId', protect, admin, deleteProductImage);

module.exports = router;
