const Product = require('../models/Product');
const ProductView = require('../models/ProductView');

const TREND_WINDOW_DAYS = Number(process.env.TRENDING_WINDOW_DAYS || 30);
const TREND_TOP_N = Number(process.env.TRENDING_TOP_N || 10);
const VIEW_SPAM_WINDOW_SEC = Number(process.env.VIEW_SPAM_WINDOW_SEC || 15);

const getWindowStart = (now = new Date()) => {
  return new Date(now.getTime() - TREND_WINDOW_DAYS * 24 * 60 * 60 * 1000);
};

const buildViewerKey = (req) => {
  if (req.user?._id) return `u:${req.user._id}`;
  const sessionId = req.headers['x-session-id'] || req.headers['x-session'];
  if (sessionId) return `s:${sessionId}`;
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  const ua = req.get('user-agent') || 'unknown';
  return `ip:${ip}|ua:${ua}`;
};

const recordProductView = async (req, productId) => {
  const viewerKey = buildViewerKey(req);
  const now = new Date();
  const since = new Date(Date.now() - VIEW_SPAM_WINDOW_SEC * 1000);

  const recent = await ProductView.findOne({
    productId,
    viewerKey,
    viewedAt: { $gte: since }
  }).select('_id');

  if (recent) return { recorded: false };

  await ProductView.create({ productId, viewerKey, viewedAt: now });
  return { recorded: true };
};

const getRecentViewCounts = async (productIds = []) => {
  const windowStart = getWindowStart();
  const match = { viewedAt: { $gte: windowStart } };
  if (productIds.length > 0) match.productId = { $in: productIds };

  const rows = await ProductView.aggregate([
    { $match: match },
    { $group: { _id: '$productId', viewCount: { $sum: 1 } } },
  ]);

  const map = new Map();
  for (const row of rows) map.set(String(row._id), row.viewCount);
  return map;
};

const recalculateAutoTrending = async () => {
  const now = new Date();
  const windowStart = getWindowStart(now);

  // Remove expired auto-trending
  await Product.updateMany(
    { autoTrendingEndDate: { $ne: null, $lt: now } },
    { $set: { autoTrendingStartDate: null, autoTrendingEndDate: null } }
  );

  // Find top N products by recent views
  const top = await ProductView.aggregate([
    { $match: { viewedAt: { $gte: windowStart } } },
    { $group: { _id: '$productId', viewCount: { $sum: 1 } } },
    { $sort: { viewCount: -1 } },
    { $limit: TREND_TOP_N },
  ]);

  const topIds = top.map(t => t._id);
  const endDate = new Date(now.getTime() + TREND_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  if (topIds.length > 0) {
    await Product.updateMany(
      { _id: { $in: topIds } },
      { $set: { autoTrendingStartDate: now, autoTrendingEndDate: endDate } }
    );
  }

  // Clear auto-trending for products no longer in top list (manual trending stays)
  await Product.updateMany(
    { _id: { $nin: topIds }, autoTrendingStartDate: { $ne: null }, isTrending: { $ne: true } },
    { $set: { autoTrendingStartDate: null, autoTrendingEndDate: null } }
  );

  return { topIds, windowStart, endDate };
};

module.exports = {
  TREND_WINDOW_DAYS,
  TREND_TOP_N,
  VIEW_SPAM_WINDOW_SEC,
  getWindowStart,
  recordProductView,
  getRecentViewCounts,
  recalculateAutoTrending,
};
