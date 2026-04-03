const express = require('express');
const { protect } = require('../middleware/auth');
const { createGeneralQuestion, listGeneralQuestions } = require('../controllers/generalQuestionController');

const router = express.Router();

router.get('/', listGeneralQuestions);
router.post('/', protect, createGeneralQuestion);

module.exports = router;
