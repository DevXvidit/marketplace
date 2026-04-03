const express = require('express');
const router = express.Router();
const { getTrendingProducts } = require('../controllers/trendingController');

router.get('/', getTrendingProducts);

module.exports = router;
