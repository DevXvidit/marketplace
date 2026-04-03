const axios = require('axios');
const MetalRate = require('../models/MetalRate');

// Fallback rates (approximate INR values) if API fails
// ⚠️ Update these periodically if APIs fail — last updated March 2026
const FALLBACK_RATES = {
  goldRate: 14300,   // per gram 24K (March 2026)
  silverRate: 90,    // per gram (March 2026)
};

/**
 * Fetch rates from metals.dev (requires API key)
 */
const fetchFromMetalsDev = async () => {
  try {
    if (!process.env.METALS_DEV_API_KEY) throw new Error('No API key');

    const res = await axios.get('https://api.metals.dev/v1/latest', {
      params: {
        api_key: process.env.METALS_DEV_API_KEY,
        currency: 'INR',
        unit: 'toz',
      },
      headers: { Accept: 'application/json' },
      timeout: 8000,
    });

    const metals = res.data?.metals || {};
    const goldToz = metals.gold;
    const silverToz = metals.silver;
    if (!goldToz || !silverToz) throw new Error('Missing metals in response');

    // Convert per troy ounce to per gram
    const goldPerGram = goldToz / 31.1035;
    const silverPerGram = silverToz / 31.1035;

    return {
      goldRate: Math.round(goldPerGram),
      silverRate: Math.round(silverPerGram),
      source: 'metals.dev'
    };
  } catch (err) {
    // console.log('metals.dev failed, trying alternative...', err.message);
    return null;
  }
};

/**
 * Fetch rates from goldapi.io (requires free API key)
 */
const fetchFromGoldAPI = async () => {
  try {
    if (!process.env.GOLD_API_KEY) throw new Error('No API key');
    
    const [goldRes, silverRes] = await Promise.all([
      axios.get('https://www.goldapi.io/api/XAU/INR', {
        headers: { 'x-access-token': process.env.GOLD_API_KEY }
      }),
      axios.get('https://www.goldapi.io/api/XAG/INR', {
        headers: { 'x-access-token': process.env.GOLD_API_KEY }
      })
    ]);

    // Gold API returns price per troy ounce, convert to gram
    // 1 troy oz = 31.1035 grams
    const goldPerGram = goldRes.data.price / 31.1035;
    const silverPerGram = silverRes.data.price / 31.1035;

    return {
      goldRate: Math.round(goldPerGram),
      silverRate: Math.round(silverPerGram),
      source: 'goldapi.io'
    };
  } catch (err) {
    const status = err.response?.status;
    // console.log('GoldAPI failed, trying alternative...', status ? `${status}` : err.message);
    return null;
  }
};

/**
 * Fetch rates from metalpriceapi.com (requires API key)
 */
const fetchFromMetalpriceAPI = async () => {
  try {
    if (!process.env.METALPRICE_API_KEY) throw new Error('No API key');

    const res = await axios.get('https://api.metalpriceapi.com/v1/latest', {
      params: {
        api_key: process.env.METALPRICE_API_KEY,
        base: 'USD',
        currencies: 'XAU,XAG',
      },
      headers: { Accept: 'application/json' },
      timeout: 8000,
    });

    if (!res.data?.success) throw new Error('API returned success=false');

    const rates = res.data?.rates || {};
    // Prefer explicit USDXAU/USDXAG if present; otherwise invert XAU/XAG.
    const goldOzUSD = rates.USDXAU || (rates.XAU ? (1 / rates.XAU) : null);
    const silverOzUSD = rates.USDXAG || (rates.XAG ? (1 / rates.XAG) : null);
    if (!goldOzUSD || !silverOzUSD) throw new Error('Missing XAU/XAG in response');

    const usdToInr = await getUSDtoINR();

    return {
      goldRate: Math.round((goldOzUSD / 31.1035) * usdToInr),
      silverRate: Math.round((silverOzUSD / 31.1035) * usdToInr),
      source: 'metalpriceapi.com'
    };
  } catch (err) {
    const status = err.response?.status;
    // console.log('metalpriceapi failed, trying alternative...', status ? `${status}` : err.message);
    return null;
  }
};

/**
 * Alternative: fetch from metals.live (no key needed)
 */
const fetchFromMetalsLive = async () => {
  try {
    const res = await axios.get('https://metals.live/api/spot', { timeout: 5000 });
    const data = res.data;

    // metals.live has multiple response shapes; normalize to a lookup table.
    // Examples seen in the wild:
    // 1) [{ metal: "gold", price: 2345.67 }, ...]
    // 2) [["gold", 2345.67], ["silver", 24.12], ...]
    const priceByMetal = new Map();
    if (Array.isArray(data)) {
      for (const item of data) {
        if (Array.isArray(item) && item.length >= 2) {
          priceByMetal.set(String(item[0]).toLowerCase(), Number(item[1]));
        } else if (item && typeof item === 'object') {
          const key = String(item.metal || item.symbol || '').toLowerCase();
          if (key) priceByMetal.set(key, Number(item.price));
        }
      }
    }

    // metals.live returns USD prices, we need INR
    const usdToInr = await getUSDtoINR();

    const goldOzUSD = priceByMetal.get('gold');
    const silverOzUSD = priceByMetal.get('silver');

    if (!goldOzUSD || !silverOzUSD) throw new Error('Missing gold/silver in metals.live response');

    return {
      goldRate: Math.round((goldOzUSD / 31.1035) * usdToInr),
      silverRate: Math.round((silverOzUSD / 31.1035) * usdToInr),
      source: 'metals.live'
    };
  } catch (err) {
    // console.log('metals.live failed:', err.message);
    return null;
  }
};

/**
 * Get USD to INR exchange rate
 */
const getUSDtoINR = async () => {
  try {
    const res = await axios.get('https://api.exchangerate-api.com/v4/latest/USD', { timeout: 5000 });
    return res.data.rates.INR || 83;
  } catch {
    return 83; // fallback
  }
};

/**
 * Main function to fetch and save metal rates
 */
const fetchAndSaveRates = async () => {
  try {
    // Try manual override first (admin can set rates)
    const manualRate = await MetalRate.findOne({ isManualOverride: true }).sort({ createdAt: -1 });
    if (manualRate) {
      const hoursSince = (Date.now() - manualRate.createdAt) / (1000 * 60 * 60);
      if (hoursSince < 24) {
        console.log('Using manual override rates');
        return manualRate;
      }
    }

    // Prioritize working APIs first to avoid unnecessary console errors
    let rates = await fetchFromMetalpriceAPI();
    if (!rates) rates = await fetchFromMetalsLive();
    
    // Fallbacks if the primary ones fail
    if (!rates) rates = await fetchFromMetalsDev();
    if (!rates) rates = await fetchFromGoldAPI();
    
    if (!rates) {
      // console.log('All APIs failed, using fallback rates');
      rates = { ...FALLBACK_RATES, source: 'fallback' };
    }

    const goldRate24K = rates.goldRate;
    const goldRate22K = Math.round(goldRate24K * 22 / 24);
    const goldRate18K = Math.round(goldRate24K * 18 / 24);

    const metalRate = await MetalRate.create({
      goldRate: goldRate22K, // Default display is 22K
      silverRate: rates.silverRate,
      goldRate24K,
      goldRate22K,
      goldRate18K,
      source: rates.source,
      fetchedAt: new Date(),
    });

    console.log(`✅ Rates updated: Gold 22K ₹${goldRate22K}/g | Silver ₹${rates.silverRate}/g`);
    return metalRate;

  } catch (error) {
    console.error('❌ Metal rate service error:', error.message);
  }
};

/**
 * Get latest rates (from DB)
 */
const getLatestRates = async () => {
  try {
    const rate = await MetalRate.findOne().sort({ createdAt: -1 }).lean();
    if (!rate) {
      return { goldRate: FALLBACK_RATES.goldRate, silverRate: FALLBACK_RATES.silverRate, source: 'fallback' };
    }
    return rate;
  } catch {
    return { goldRate: FALLBACK_RATES.goldRate, silverRate: FALLBACK_RATES.silverRate, source: 'fallback' };
  }
};

module.exports = { fetchAndSaveRates, getLatestRates, FALLBACK_RATES };
