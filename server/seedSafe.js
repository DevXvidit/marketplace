require('dotenv').config();
const mongoose = require('mongoose');

const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const MetalRate = require('./models/MetalRate');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('DB Connected');
};

const ensureAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@jewelry.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const existing = await User.findOne({ email: adminEmail });
  if (existing) {
    console.log('Admin exists:', adminEmail);
    return;
  }
  const admin = await User.create({
    name: 'Admin',
    email: adminEmail,
    password: adminPassword,
    role: 'admin',
    phone: '9999999999',
  });
  console.log('Admin created:', admin.email);
};

const ensureCategories = async () => {
  const list = [
    { name: 'Rings', slug: 'rings', icon: 'ring', description: 'Elegant rings for every occasion', sortOrder: 1 },
    { name: 'Necklaces', slug: 'necklaces', icon: 'necklace', description: 'Stunning necklaces and pendants', sortOrder: 2 },
    { name: 'Chains', slug: 'chains', icon: 'chain', description: 'Gold and silver chains', sortOrder: 3 },
    { name: 'Bangles', slug: 'bangles', icon: 'bangle', description: 'Traditional and modern bangles', sortOrder: 4 },
    { name: 'Earrings', slug: 'earrings', icon: 'earring', description: 'Dazzling earrings collection', sortOrder: 5 },
    { name: 'Bridal Sets', slug: 'bridal-sets', icon: 'bridal', description: 'Complete bridal jewelry sets', sortOrder: 6 },
  ];

  const operations = list.map(c => ({
    updateOne: {
      filter: { slug: c.slug },
      update: { $set: c },
      upsert: true
    }
  }));
  await Category.bulkWrite(operations);

  console.log('Categories ensured');
};

const ensureMetalRates = async () => {
  const count = await MetalRate.countDocuments();
  if (count > 0) {
    console.log('Metal rates exist');
    return;
  }
  await MetalRate.create({
    goldRate: 7200,
    silverRate: 92,
    goldRate24K: 7854,
    goldRate22K: 7200,
    goldRate18K: 5890,
    source: 'seed',
  });
  console.log('Metal rates created');
};

const ensureProducts = async () => {
  const count = await Product.countDocuments();
  if (count > 0) {
    console.log('Products already exist, skipping');
    return;
  }

  const rings = await Category.findOne({ slug: 'rings' });
  const necklaces = await Category.findOne({ slug: 'necklaces' });
  const chains = await Category.findOne({ slug: 'chains' });
  const bangles = await Category.findOne({ slug: 'bangles' });
  const earrings = await Category.findOne({ slug: 'earrings' });
  const bridal = await Category.findOne({ slug: 'bridal-sets' });

  const PLACEHOLDER = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800';
  const RING_IMG = 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800';
  const NECK_IMG = 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800';
  const BANGLE_IMG = 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800';
  const EARRING_IMG = 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800';
  const CHAIN_IMG = 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800';
  const BRIDAL_IMG = 'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=800';

  const products = [
    {
      name: 'Royal Solitaire Diamond Ring',
      description: 'An exquisite 22K gold solitaire ring featuring a brilliant-cut diamond centerpiece.',
      category: rings?._id,
      metalType: 'gold', purity: '22K',
      weightInGrams: 4.5, makingChargePercent: 15, stonePrice: 45000,
      stoneDetails: '0.5 carat VVS1 Diamond',
      images: [{ url: RING_IMG || PLACEHOLDER, publicId: 'seed_ring_1' }],
      isFeatured: true, isTrending: true,
      tags: ['diamond', 'solitaire', 'gold', 'engagement'],
    },
    {
      name: 'Twisted Gold Band Ring',
      description: 'A beautiful twisted 22K gold band ring with intricate rope-work detailing.',
      category: rings?._id,
      metalType: 'gold', purity: '22K',
      weightInGrams: 3.2, makingChargePercent: 12, stonePrice: 0,
      images: [{ url: RING_IMG || PLACEHOLDER, publicId: 'seed_ring_2' }],
      isFeatured: false, isTrending: true,
      tags: ['band', 'gold', 'wedding', 'twisted'],
    },
    {
      name: 'Kundan Bridal Necklace',
      description: 'A breathtaking Kundan necklace set in 22K gold with uncut diamonds and polki stones.',
      category: necklaces?._id,
      metalType: 'gold', purity: '22K',
      weightInGrams: 32.5, makingChargePercent: 18, stonePrice: 85000,
      stoneDetails: 'Kundan stones, polki diamonds, emeralds',
      images: [{ url: NECK_IMG || PLACEHOLDER, publicId: 'seed_neck_1' }],
      isFeatured: true, isTrending: true,
      tags: ['kundan', 'bridal', 'necklace', 'traditional'],
    },
    {
      name: 'Diamond Tennis Necklace',
      description: 'A stunning 18K white gold tennis necklace adorned with brilliant-cut diamonds.',
      category: necklaces?._id,
      metalType: 'gold', purity: '18K',
      weightInGrams: 12.8, makingChargePercent: 20, stonePrice: 120000,
      stoneDetails: '2.5 carat total diamond weight',
      images: [{ url: NECK_IMG || PLACEHOLDER, publicId: 'seed_neck_2' }],
      isFeatured: true, isTrending: false,
      tags: ['diamond', 'tennis', 'necklace', 'modern'],
    },
    {
      name: 'Classic Figaro Gold Chain',
      description: 'A timeless 22K gold Figaro chain with perfect weight and gleaming finish.',
      category: chains?._id,
      metalType: 'gold', purity: '22K',
      weightInGrams: 15.0, makingChargePercent: 8, stonePrice: 0,
      images: [{ url: CHAIN_IMG || PLACEHOLDER, publicId: 'seed_chain_1' }],
      isFeatured: false, isTrending: true,
      tags: ['chain', 'figaro', 'gold', 'classic'],
    },
    {
      name: 'Box Chain Silver Necklace',
      description: 'An elegant 925 sterling silver box chain with a high-polish finish.',
      category: chains?._id,
      metalType: 'silver', purity: '925',
      weightInGrams: 8.5, makingChargePercent: 10, stonePrice: 0,
      images: [{ url: CHAIN_IMG || PLACEHOLDER, publicId: 'seed_chain_2' }],
      isFeatured: false, isTrending: false,
      tags: ['chain', 'silver', 'box', 'minimalist'],
    },
    {
      name: 'Antique Kada Gold Bangle',
      description: 'A pair of intricately carved 22K gold Kada bangles with traditional motifs.',
      category: bangles?._id,
      metalType: 'gold', purity: '22K',
      weightInGrams: 28.0, makingChargePercent: 14, stonePrice: 0,
      images: [{ url: BANGLE_IMG || PLACEHOLDER, publicId: 'seed_bangle_1' }],
      isFeatured: true, isTrending: true,
      tags: ['bangle', 'kada', 'antique', 'traditional'],
    },
    {
      name: 'Diamond Studded Bangle',
      description: 'An exquisite 22K gold bangle set with brilliant-cut diamonds in floral motifs.',
      category: bangles?._id,
      metalType: 'gold', purity: '22K',
      weightInGrams: 18.5, makingChargePercent: 16, stonePrice: 35000,
      stoneDetails: 'Natural diamonds 1.2 carat',
      images: [{ url: BANGLE_IMG || PLACEHOLDER, publicId: 'seed_bangle_2' }],
      isFeatured: true, isTrending: false,
      tags: ['bangle', 'diamond', 'gold', 'floral'],
    },
    {
      name: 'Jhumka Gold Earrings',
      description: 'Traditional 22K gold Jhumka earrings with intricate filigree work and dangling bells.',
      category: earrings?._id,
      metalType: 'gold', purity: '22K',
      weightInGrams: 7.5, makingChargePercent: 18, stonePrice: 5000,
      stoneDetails: 'Ruby and emerald stones',
      images: [{ url: EARRING_IMG || PLACEHOLDER, publicId: 'seed_ear_1' }],
      isFeatured: true, isTrending: true,
      tags: ['jhumka', 'earrings', 'traditional', 'gold'],
    },
    {
      name: 'Emerald Drop Earrings',
      description: 'Sophisticated 18K gold drop earrings with Colombian emerald drops and diamond halos.',
      category: earrings?._id,
      metalType: 'gold', purity: '18K',
      weightInGrams: 5.2, makingChargePercent: 20, stonePrice: 28000,
      stoneDetails: 'Colombian emeralds 2ct, VVS diamonds',
      images: [{ url: EARRING_IMG || PLACEHOLDER, publicId: 'seed_ear_2' }],
      isFeatured: false, isTrending: true,
      tags: ['emerald', 'drop', 'earrings', 'luxury'],
    },
    {
      name: 'Royal Bridal Set',
      description: 'A complete bridal jewelry set in 22K gold comprising necklace, earrings, maang tikka, and bangles.',
      category: bridal?._id,
      metalType: 'gold', purity: '22K',
      weightInGrams: 85.0, makingChargePercent: 20, stonePrice: 180000,
      stoneDetails: 'Kundan, uncut diamonds, rubies, emeralds',
      images: [{ url: BRIDAL_IMG || PLACEHOLDER, publicId: 'seed_bridal_1' }],
      isFeatured: true, isTrending: true,
      tags: ['bridal', 'set', 'kundan', 'complete', 'wedding'],
    },
    {
      name: 'Polki Bridal Choker Set',
      description: 'An opulent Polki diamond choker set with matching earrings in 22K gold.',
      category: bridal?._id,
      metalType: 'gold', purity: '22K',
      weightInGrams: 55.0, makingChargePercent: 22, stonePrice: 250000,
      stoneDetails: 'Polki diamonds 8ct, natural pearls',
      images: [{ url: BRIDAL_IMG || PLACEHOLDER, publicId: 'seed_bridal_2' }],
      isFeatured: true, isTrending: false,
      tags: ['polki', 'bridal', 'choker', 'diamond', 'pearls'],
    },
  ];

  await Product.create(products);
  console.log('Products created:', products.length);
};

const seedSafe = async () => {
  await connectDB();
  await ensureAdmin();
  await ensureCategories();
  await ensureMetalRates();
  await ensureProducts();
  console.log('Safe seeding complete');
  mongoose.disconnect();
};

seedSafe().catch((e) => {
  console.error('SEED ERROR:', e.message);
  process.exit(1);
});
