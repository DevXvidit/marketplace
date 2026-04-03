const mongoose = require('mongoose');
const Product = require('../models/Product');

const listAllQuestions = async (req, res) => {
  const { status, productId, search, page = 1, limit = 20 } = req.query;
  const matchProduct = {};
  if (productId && mongoose.Types.ObjectId.isValid(productId)) {
    matchProduct._id = new mongoose.Types.ObjectId(productId);
  }

  const matchQuestion = {};
  if (status === 'answered') matchQuestion['questions.isAnswered'] = true;
  if (status === 'unanswered') matchQuestion['questions.isAnswered'] = false;
  if (search) {
    matchQuestion.$or = [
      { 'questions.question': { $regex: search, $options: 'i' } },
      { 'questions.name': { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
    ];
  }

  const pipeline = [
    { $match: matchProduct },
    { $unwind: '$questions' },
    { $match: matchQuestion },
    { $sort: { 'questions.createdAt': -1 } },
    { $project: {
      productId: '$_id',
      productName: '$name',
      productImages: '$images',
      productMetalType: '$metalType',
      productPurity: '$purity',
      productWeightInGrams: '$weightInGrams',
      productMakingChargePercent: '$makingChargePercent',
      productStonePrice: '$stonePrice',
      question: '$questions',
    } }
  ];

  const countPipeline = [...pipeline, { $count: 'total' }];
  const safeLimit = Math.max(1, Number(limit) || 1);
  const skip = (Number(page) - 1) * safeLimit;
  const dataPipeline = [...pipeline, { $skip: skip }, { $limit: safeLimit }];

  const [countRes, rows] = await Promise.all([
    Product.aggregate(countPipeline),
    Product.aggregate(dataPipeline),
  ]);

  const total = countRes?.[0]?.total || 0;
  res.json({
    success: true,
    data: rows.map(r => ({
      product: {
        _id: r.productId,
        name: r.productName,
        images: r.productImages || [],
        metalType: r.productMetalType,
        purity: r.productPurity,
        weightInGrams: r.productWeightInGrams,
        makingChargePercent: r.productMakingChargePercent,
        stonePrice: r.productStonePrice,
      },
      question: r.question
    })),
    total,
    page: Number(page),
    pages: Math.ceil(total / safeLimit)
  });
};

const getQuestionDetail = async (req, res) => {
  const { questionId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    return res.status(400).json({ success: false, message: 'Invalid question id' });
  }

  const product = await Product.findOne({ 'questions._id': questionId });
  if (!product) return res.status(404).json({ success: false, message: 'Question not found' });

  const question = product.questions.id(questionId);
  res.json({
    success: true,
    data: {
      product: {
        _id: product._id,
        name: product.name,
        images: product.images || [],
        metalType: product.metalType,
        purity: product.purity,
        weightInGrams: product.weightInGrams,
        makingChargePercent: product.makingChargePercent,
        stonePrice: product.stonePrice,
      },
      question
    }
  });
};

module.exports = { listAllQuestions, getQuestionDetail };
