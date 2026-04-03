// authRoutes.js
const express = require('express');
const r1 = express.Router();
const { register, login, getMe, updateProfile, forgotPassword, resetPassword, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
r1.post('/register', register);
r1.post('/login', login);
r1.post('/forgot-password', forgotPassword);
r1.post('/reset-password', resetPassword);
r1.get('/me', protect, getMe);
r1.put('/profile', protect, updateProfile);
r1.put('/change-password', protect, changePassword);
module.exports = r1;
