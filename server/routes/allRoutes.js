const express = require('express');
const { protect, admin } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const {
  getCategories, createCategory, updateCategory, deleteCategory,
  getRates, setManualRates, refreshRates,
  getDashboardStats, getAllUsers, toggleUserStatus,
  toggleWishlist, getWishlist
} = require('../controllers/mainControllers');
const { listAllQuestions, getQuestionDetail } = require('../controllers/qaController');
const { listGeneralQuestions, getGeneralQuestionDetail, answerGeneralQuestion } = require('../controllers/generalQuestionController');
const { getNotifications, markNotificationRead } = require('../controllers/notificationController');

const offerRouter = require('./offerRoutes');

// Category routes
const catRouter = express.Router();
catRouter.get('/', getCategories);
catRouter.post('/', protect, admin, upload.single('image'), createCategory);
catRouter.put('/:id', protect, admin, updateCategory);
catRouter.delete('/:id', protect, admin, deleteCategory);

// Rate routes
const rateRouter = express.Router();
rateRouter.get('/', getRates);
rateRouter.post('/manual', protect, admin, setManualRates);
rateRouter.post('/refresh', protect, admin, refreshRates);

// User routes (wishlist)
const userRouter = express.Router();
userRouter.post('/wishlist/:productId', protect, toggleWishlist);
userRouter.get('/wishlist', protect, getWishlist);

// Admin routes
const adminRouter = express.Router();
adminRouter.get('/dashboard', protect, admin, getDashboardStats);
adminRouter.get('/users', protect, admin, getAllUsers);
adminRouter.put('/users/:id/toggle', protect, admin, toggleUserStatus);
adminRouter.get('/questions', protect, admin, listAllQuestions);
adminRouter.get('/questions/:questionId', protect, admin, getQuestionDetail);
adminRouter.get('/general-questions', protect, admin, listGeneralQuestions);
adminRouter.get('/general-questions/:id', protect, admin, getGeneralQuestionDetail);
adminRouter.put('/general-questions/:id', protect, admin, answerGeneralQuestion);
adminRouter.get('/notifications', protect, admin, getNotifications);
adminRouter.put('/notifications/:id/read', protect, admin, markNotificationRead);

module.exports = { catRouter, rateRouter, userRouter, adminRouter, offerRouter };
