const Product = require('../models/Product');
const { getLatestRates } = require('../services/metalRateService');
const { attachPrice, applyTrendingFlags } = require('../utils/productHelpers');
const { getRecentViewCounts, TREND_WINDOW_DAYS } = require('../services/trendingService');

// @route GET /api/trending-products
const getTrendingProducts = async (req, res) => {
  const now = new Date();

  const [manual, auto] = await Promise.all([
    Product.find({ isTrending: true, isAvailable: true }).populate('category', 'name slug icon'),
    Product.find({
      isAvailable: true,
      autoTrendingStartDate: { $ne: null },
      autoTrendingEndDate: { $gte: now }
    }).populate('category', 'name slug icon')
  ]);

  const byId = new Map();
  manual.forEach(p => byId.set(String(p._id), { product: p, manual: true, auto: false }));
  auto.forEach(p => {
    const id = String(p._id);
    if (!byId.has(id)) byId.set(id, { product: p, manual: false, auto: true });
    else byId.get(id).auto = true;
  });

  const entries = Array.from(byId.values());
  const viewCounts = await getRecentViewCounts(entries.map(e => e.product._id));
  const rates = await getLatestRates();

  const data = entries.map(entry => {
    const base = applyTrendingFlags(attachPrice(entry.product, rates), now);
    const recentViewCount = viewCounts.get(String(entry.product._id)) || 0;
    return {
      ...base,
      isManualTrending: !!entry.manual,
      isAutoTrending: !!entry.auto,
      isTrending: !!entry.manual || !!entry.auto,
      recentViewCount,
    };
  }).sort((a, b) => {
    if (a.isManualTrending !== b.isManualTrending) return a.isManualTrending ? -1 : 1;
    return (b.recentViewCount || 0) - (a.recentViewCount || 0);
  });

  res.json({
    success: true,
    windowDays: TREND_WINDOW_DAYS,
    data,
  });
};

module.exports = { getTrendingProducts };
