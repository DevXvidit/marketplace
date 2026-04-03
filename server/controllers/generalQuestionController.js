const mongoose = require('mongoose');
const GeneralQuestion = require('../models/GeneralQuestion');
const Notification = require('../models/Notification');

const createGeneralQuestion = async (req, res) => {
  const { question } = req.body;
  const trimmed = (question || '').trim();
  if (!trimmed) return res.status(400).json({ success: false, message: 'Question is required' });

  const newQuestion = await GeneralQuestion.create({
    userId: req.user?._id || null,
    name: req.user?.name || 'Anonymous',
    email: req.user?.email || '',
    phone: req.user?.phone || '',
    question: trimmed,
  });

  const notification = await Notification.create({
    type: 'general-question',
    productId: null,
    questionId: newQuestion._id,
    message: `New general question from ${newQuestion.name || 'Customer'}`,
    isRead: false,
  });

  const io = req.app.get('io');
  if (io) {
    io.emit('general-question:new', { question: newQuestion });
    io.emit('notification:new', notification);
  }

  res.status(201).json({ success: true, data: newQuestion });
};

const listGeneralQuestions = async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status === 'answered') query.isAnswered = true;
  if (status === 'unanswered') query.isAnswered = false;
  if (search) {
    query.$or = [
      { question: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  const safeLimit = Math.max(1, Number(limit) || 1);
  const skip = (Number(page) - 1) * safeLimit;

  const [total, rows] = await Promise.all([
    GeneralQuestion.countDocuments(query),
    GeneralQuestion.find(query).sort({ createdAt: -1 }).skip(skip).limit(safeLimit),
  ]);

  res.json({
    success: true,
    data: rows,
    total,
    page: Number(page),
    pages: Math.ceil(total / safeLimit)
  });
};

const getGeneralQuestionDetail = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid question id' });
  }

  const question = await GeneralQuestion.findById(id);
  if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

  res.json({ success: true, data: question });
};

const answerGeneralQuestion = async (req, res) => {
  const { id } = req.params;
  const { answer } = req.body;
  const trimmed = (answer || '').trim();
  if (!trimmed) return res.status(400).json({ success: false, message: 'Answer is required' });
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid question id' });
  }

  const question = await GeneralQuestion.findById(id);
  if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

  question.answer = trimmed;
  question.isAnswered = true;
  question.answeredAt = new Date();
  await question.save();

  const io = req.app.get('io');
  if (io) {
    io.emit('general-question:answered', { question });
  }

  res.json({ success: true, data: question });
};

module.exports = {
  createGeneralQuestion,
  listGeneralQuestions,
  getGeneralQuestionDetail,
  answerGeneralQuestion
};
