// Format price in Indian Rupees
export const formatPrice = (amount) => {
  if (!amount) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0
  }).format(amount);
};

// Calculate jewelry price dynamically
export const calculateJewelryPrice = (product, rates) => {
  if (!product || !rates) return 0;
  const rate = product.metalType === 'silver'
    ? rates.silverRate
    : product.purity === '24K' ? rates.goldRate24K
    : product.purity === '18K' ? rates.goldRate18K
    : rates.goldRate22K || rates.goldRate || 7200;

  const basePrice = rate * (product.weightInGrams || 0);
  const making = basePrice * ((product.makingChargePercent || 12) / 100);
  return Math.round(basePrice + making + (product.stonePrice || 0));
};

export const calculateOfferPrice = (originalPrice, offer) => {
  if (!offer) return originalPrice;
  let offerPrice = originalPrice;
  if (offer.discountType === 'percentage') {
    offerPrice = originalPrice - (originalPrice * (offer.discountValue / 100));
  } else if (offer.discountType === 'fixed') {
    offerPrice = originalPrice - offer.discountValue;
  }
  return Math.max(0, Math.round(offerPrice));
};

// Truncate text
export const truncate = (text, length = 100) =>
  text?.length > length ? text.slice(0, length) + '...' : text;

// Metal purity display
export const purityLabel = (purity) => ({
  '24K': '24K Pure Gold',
  '22K': '22K Gold',
  '18K': '18K Gold',
  '14K': '14K Gold',
  '925': '925 Sterling Silver',
  '999': '999 Pure Silver',
}[purity] || purity);

// Debounce
export const debounce = (fn, delay) => {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
};
