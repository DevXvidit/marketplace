// Helper: attach live price to product
const attachPrice = (product, rates) => {
  const p = product.toObject ? product.toObject() : { ...product };
  const rate = p.metalType === 'silver' ? rates.silverRate
    : p.purity === '24K' ? rates.goldRate24K
    : p.purity === '18K' ? rates.goldRate18K
    : rates.goldRate22K || rates.goldRate;

  const basePrice = (rate || 7500) * (p.weightInGrams || 0);
  const making = basePrice * ((p.makingChargePercent || 12) / 100);
  p.calculatedPrice = Math.round(basePrice + making + (p.stonePrice || 0));
  p.metalRate = rate;
  return p;
};

const applyTrendingFlags = (product, now = new Date()) => {
  const p = product.toObject ? product.toObject() : { ...product };
  const autoActive = !!(p.autoTrendingStartDate && p.autoTrendingEndDate && new Date(p.autoTrendingEndDate) >= now);
  p.isManualTrending = !!p.isTrending;
  p.isAutoTrending = autoActive;
  p.isTrending = p.isManualTrending || autoActive;
  return p;
};

module.exports = { attachPrice, applyTrendingFlags };
