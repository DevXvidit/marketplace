import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { useSelector } from 'react-redux';
import api from '../services/api';
import ProductCard from '../components/jewelry/ProductCard';
import { formatPrice } from '../utils/helpers';
import { ProductGridSkeleton } from '../components/common/Skeleton';
import Jewelry3D from '../components/jewelry/Jewelry3D';
import OfferPopup from '../components/common/OfferPopup';

const CATEGORIES = [
  { name: 'Rings', slug: 'rings', icon: '💍', img: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&q=80' },
  { name: 'Necklaces', slug: 'necklaces', icon: '📿', img: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&q=80' },
  { name: 'Chains', slug: 'chains', icon: '⛓️', img: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=600&q=80' },
  { name: 'Bangles', slug: 'bangles', icon: '🔮', img: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&q=80' },
  { name: 'Earrings', slug: 'earrings', icon: '✨', img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80' },
  { name: 'Bridal Sets', slug: 'bridal-sets', icon: '👰', img: '/assets/bridal-sets.png' }
];

const HERO_IMAGES = [
  '/assets/hero-ring.png',
  '/assets/hero-necklace.png',
  '/assets/hero-bangles.png',
  '/assets/hero-earrings.png',
  '/assets/hero-bridal.png'
];

function HeroSection() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const [currentImg, setCurrentImg] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImg((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-screen min-h-[800px] flex items-center justify-center overflow-hidden bg-[#050505]">
      {/* Dynamic Parallax Background Layers */}
      <motion.div style={{ y: y1 }} className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.08)_0%,transparent_70%)]" />
        <div className="absolute inset-0 luxury-grid-pattern opacity-20" />
      </motion.div>

      {/* Floating Bokeh/Light Leaks */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              x: [0, 30, 0], 
              y: [0, 40, 0],
              opacity: [0.1, 0.3, 0.1] 
            }}
            transition={{ 
              duration: 8 + i * 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute w-[400px] h-[400px] bg-gold-500/5 blur-[120px] rounded-full"
            style={{ 
              left: `${Math.random() * 100}%`, 
              top: `${Math.random() * 100}%` 
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20 h-full pt-20">
        {/* Text Content */}
        <motion.div 
          style={{ opacity }}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 text-center lg:text-left pt-10"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold-500/20 bg-gold-500/5 mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-sans text-gold-400 font-bold">New Collection 2026</span>
          </motion.div>

          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-white leading-[1.1] mb-8">
            Curation of<br />
            <span className="italic text-gold-400 font-serif relative">
              Eternal Elegance
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 1, duration: 1.5 }}
                className="absolute -bottom-2 left-0 h-px bg-gradient-to-r from-gold-500/0 via-gold-500/50 to-gold-500/0"
              />
            </span>
          </h1>

          <p className="font-sans text-lg text-white/50 max-w-xl mb-12 leading-relaxed tracking-wide">
            Discover a legacy of unparalleled craftsmanship. Where every diamond tells a story of heritage, precision, and timeless brilliance.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
            <Link to="/shop?featured=true" className="btn-gold group relative overflow-hidden px-10 py-4">
              <span className="relative z-10">Explore Collection</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </Link>
            <Link to="/about" className="flex items-center gap-4 text-white/30 hover:text-white transition-colors cursor-pointer group">
              <div className="w-12 h-px bg-white/20 group-hover:bg-gold-500 transition-colors" />
              <span className="font-sans text-[10px] uppercase tracking-[0.2em]">Our Story</span>
            </Link>
          </div>

          {/* Floating Trust Badges in Hero */}
          <div className="mt-20 flex flex-wrap justify-center lg:justify-start gap-8 opacity-40 hover:opacity-100 transition-opacity duration-700">
            {['BIS HALLMARKED', 'GIA CERTIFIED', '100% SECURE'].map((tag) => (
              <div key={tag} className="flex items-center gap-2">
                <span className="text-gold-500">✦</span>
                <span className="text-[9px] tracking-[0.4em] font-sans whitespace-nowrap">{tag}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 3D Scene with Pedestal */}
        <motion.div 
          style={{ y: y2 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 relative w-full h-[500px] lg:h-[700px] flex items-center justify-center p-12"
        >
          {/* Glass Pedestal Background */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-64 h-32 premium-glass rounded-[100%] blur-xl opacity-20" />
          
          {/* Sliding Gallery */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImg}
              initial={{ opacity: 0, scale: 0.9, rotateY: 45 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 1.1, rotateY: -45 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Jewelry3D image={HERO_IMAGES[currentImg]} />
            </motion.div>
          </AnimatePresence>

          {/* Dynamic Light Sweep across the ring */}
          <motion.div 
            animate={{ left: ['100%', '-100%'] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 z-30 pointer-events-none bg-gradient-to-r from-transparent via-white/5 to-transparent w-full h-full -skew-x-12"
          />
          
          {/* Slide Indicator Dot Bar */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-30">
            {HERO_IMAGES.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setCurrentImg(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${i === currentImg ? 'w-8 bg-gold-500' : 'w-2 bg-white/20 hover:bg-white/40'}`}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Advanced Scroll Indicator */}
      <motion.div 
        style={{ opacity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-20 pointer-events-none"
      >
        <span className="font-sans text-[8px] uppercase tracking-[0.4em] text-white/30 mb-2">Discover More</span>
        <div className="w-px h-16 bg-gradient-to-b from-gold-500/50 via-gold-500/10 to-transparent relative overflow-hidden">
          <motion.div 
            animate={{ y: [0, 64] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-transparent via-gold-400 to-transparent"
          />
        </div>
      </motion.div>
    </section>
  );
}

function BrandStory() {
  return (
    <section className="py-32 relative overflow-hidden bg-black">
      <div className="absolute top-0 left-0 w-full h-full luxury-grid-pattern opacity-10 pointer-events-none" />
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm border border-white/5">
              <img src="/assets/heritage.png" alt="Heritage Craftsmanship" className="w-full h-full object-cover scale-110 hover:scale-100 transition-transform duration-[2s]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
            </div>
            {/* Overlay statistics */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="absolute -bottom-10 -right-10 premium-glass p-8 max-w-[240px]"
            >
              <h4 className="font-display text-4xl text-gold-500 mb-2">12+</h4>
              <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-white/50">Years of Unmatched Excellence</p>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="font-sans text-[10px] tracking-[0.5em] uppercase text-gold-500 mb-6 font-bold">Unveiling Our Legacy</p>
            <h2 className="font-display text-5xl md:text-6xl text-white mb-10 leading-tight">
              Crafting Brilliance<br />
              <span className="italic text-gold-400 font-serif">Since 2012</span>
            </h2>
            <div className="space-y-8 text-white/60 font-sans text-lg leading-relaxed mb-12">
              <p>
                Founded in the heart of Ahmedabad, our atelier is dedicated to the philosophy that jewelry is not just an accessory, but a timeless expression of art and emotion.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { title: 'Artisanal Mastery', desc: 'Every piece is hand-finished by master jewelers with decades of experience.' },
                  { title: 'Global Standards', desc: '100% BIS Hallmarked gold and GIA certified diamonds for absolute trust.' }
                ].map((item) => (
                  <div key={item.title} className="p-6 border border-white/5 bg-white/5 hover:border-gold-500/30 transition-colors">
                    <h4 className="text-white text-sm font-bold mb-2 uppercase tracking-widest">{item.title}</h4>
                    <p className="text-[13px] leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <Link to="/about" className="group flex items-center gap-4 text-gold-500 hover:text-gold-400 transition-colors">
              <span className="font-sans text-[10px] uppercase tracking-[0.4em]">Read Our Philosophy</span>
              <div className="w-12 h-px bg-gold-500 group-hover:w-20 transition-all duration-500" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function CategoryCard({ cat, className, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className={`relative group cursor-pointer overflow-hidden ${className}`}
    >
      <Link to={`/category/${cat.slug}`} className="block w-full h-full relative">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full h-full"
        >
          <img
            src={cat.img}
            alt={cat.name}
            className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-1000"
            loading="lazy"
          />
        </motion.div>
        
        {/* Luxury Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-70 group-hover:opacity-40 transition-opacity duration-700" />
        <div className="absolute inset-0 border border-white/5 group-hover:border-gold-500/20 transition-all duration-700 pointer-events-none" />
        
        {/* Light sweep effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1.5s] ease-in-out skew-x-12" />

        {/* Content */}
        <div className="absolute inset-0 p-8 flex flex-col justify-end">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-3xl mb-4 block filter drop-shadow-2xl">{cat.icon}</span>
            <h3 className="font-display text-2xl md:text-3xl text-white mb-2 tracking-tight group-hover:text-gold-400 transition-colors uppercase">{cat.name}</h3>
            <div className="h-px bg-gold-500 w-12 group-hover:w-20 transition-all duration-500" />
          </motion.div>
        </div>
      </Link>
    </motion.div>
  );
}

function CategoryGrid() {
  return (
    <section className="py-24 px-6 bg-[#050505]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <p className="font-sans text-[10px] tracking-[0.5em] uppercase text-gold-500 mb-6 font-bold">Unrivaled Collection</p>
            <h2 className="font-display text-5xl md:text-6xl text-white leading-tight">
              Curated<br />
              <span className="italic text-gold-400 font-serif lowercase">of Extraordinary</span>
            </h2>
          </motion.div>
          <div className="h-px flex-1 bg-white/5 hidden lg:block mb-8 mx-12" />
          <motion.p 
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             transition={{ delay: 0.5 }}
             className="font-sans text-white/40 max-w-xs text-sm leading-relaxed mb-4"
          >
            Explore our diverse ranges of hand-selected pieces, from timeless bridal sets to contemporary essentials.
          </motion.p>
        </div>

        {/* Asymmetric Editorial Grid */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 auto-rows-[300px] md:auto-rows-[400px]"
        >
          {/* Rings - Large Portrait */}
          <CategoryCard
            cat={CATEGORIES[0]}
            index={0}
            className="md:col-span-8 md:row-span-2"
          />
          {/* Necklaces - Square */}
          <CategoryCard
            cat={CATEGORIES[1]}
            index={1}
            className="md:col-span-4 md:row-span-1"
          />
          {/* Chains - Square */}
          <CategoryCard
            cat={CATEGORIES[2]}
            index={2}
            className="md:col-span-4 md:row-span-1"
          />
          {/* Bangles - Landscape */}
          <CategoryCard
            cat={CATEGORIES[3]}
            index={3}
            className="md:col-span-4 md:row-span-1"
          />
          {/* Earrings - Landscape */}
          <CategoryCard
            cat={CATEGORIES[4]}
            index={4}
            className="md:col-span-4 md:row-span-1"
          />
          {/* Bridal Sets - Medium Vertical */}
          <CategoryCard
            cat={CATEGORIES[5]}
            index={5}
            className="md:col-span-4 md:row-span-1"
          />
        </motion.div>
      </div>
    </section>
  );
}

function WhyAkshar() {
  const pillars = [
    { title: 'Craftsmanship', desc: 'Hand-finished by master artisans with meticulous detailing on every piece.' },
    { title: 'Purity', desc: 'BIS hallmarked gold and verified stones for complete confidence.' },
    { title: 'Heritage', desc: 'Rooted in Ahmedabadâ€™s jewelry legacy with years of trusted service.' },
    { title: 'Transparent Pricing', desc: 'Prices based on live market rates, purity, and craftsmanship.' },
  ];

  return (
    <section className="py-24 bg-[#0A0A0A] border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <p className="font-sans text-[10px] tracking-[0.5em] uppercase text-gold-500 mb-4 font-bold">Why Akshar</p>
          <h2 className="font-display text-4xl md:text-5xl text-white">
            Pillars of <span className="italic text-gold-400 font-serif">Trust</span>
          </h2>
          <div className="w-16 h-px bg-gold-gradient mx-auto mt-6" />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="p-7 border border-white/5 bg-white/[0.02] hover:border-gold-500/30 hover:bg-gold-500/[0.03] transition-all duration-700"
            >
              <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-white/30 mb-3">Pillar</p>
              <h3 className="font-display text-xl text-white mb-3">{p.title}</h3>
              <p className="font-sans text-xs text-white/50 leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StoreVisitHours() {
  return (
    <section className="py-12 bg-[#050505] border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row items-center justify-between gap-6 border border-luxury-border p-6 md:p-8 bg-luxury-card/40"
        >
          <div>
            <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold-500 mb-2">Store Visit</p>
            <h3 className="font-display text-2xl text-white">Visit Us In Person</h3>
            <p className="font-sans text-xs text-white/50 mt-2">
              Akshar Jewellers, Sardarchowk, Krishnanagar, Ahmedabad 382345
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="text-center sm:text-left">
              <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-white/30 mb-2">Hours</p>
              <p className="font-display text-lg text-gold-400">Mon to Sat: 10AM to 8PM</p>
            </div>
            <div className="h-px sm:h-10 sm:w-px w-10 bg-white/10" />
            <div className="text-center sm:text-left">
              <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-white/30 mb-2">Call or WhatsApp</p>
              <p className="font-display text-lg text-white">+91 8320750853</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function AskQuestionCTA() {
  return (
    <section className="py-12 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row items-center justify-between gap-6 border border-luxury-border p-6 md:p-8 bg-luxury-card/40"
        >
          <div>
            <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold-500 mb-2">Questions?</p>
            <h3 className="font-display text-2xl text-white">Ask About Any Product or Price</h3>
            <p className="font-sans text-xs text-white/50 mt-2">
              Visit our FAQ or send your question directly and weâ€™ll respond quickly.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/faq#ask-question" className="btn-gold px-6 py-3 text-[10px] tracking-[0.3em] uppercase text-center">
              Ask a Question
            </Link>
            <a href="https://wa.me/918320750853" target="_blank" rel="noreferrer" className="btn-outline-gold px-6 py-3 text-[10px] tracking-[0.3em] uppercase text-center">
              WhatsApp
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FeaturedProducts({ products, loading }) {
  return (
    <section className="py-32 bg-[#050505] border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-20 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <p className="font-sans text-[10px] tracking-[0.5em] uppercase text-gold-500 mb-4 font-bold">House Favorites</p>
            <h2 className="font-display text-4xl md:text-5xl text-white italic">Featured Masterpieces</h2>
          </motion.div>
          <Link to="/shop?featured=true" className="btn-outline-gold px-8 py-3 text-center text-[10px] tracking-[0.2em]">View All Pieces</Link>
        </div>

        {loading ? <ProductGridSkeleton count={4} /> : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
          </div>
        )}
      </div>
    </section>
  );
}

function TrendingProducts({ products, loading }) {
  return (
    <section className="py-24 bg-[#0A0A0A] relative">
      <div className="absolute top-0 left-0 w-full h-full luxury-grid-pattern opacity-5 pointer-events-none" />
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-10">
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 1 }}
          >
            <p className="font-sans text-[10px] tracking-[0.5em] uppercase text-gold-500 mb-6 font-bold">Seasonal Desires</p>
            <h2 className="font-display text-5xl md:text-6xl text-white">Trending<br /><span className="italic text-gold-400 font-serif lowercase">of the moment</span></h2>
          </motion.div>
          <div className="flex flex-col items-end gap-6">
            <Link to="/shop?featured=true" className="btn-outline-gold group relative px-10 py-4 text-[10px] tracking-[0.3em]">
              <span className="relative z-10">Explore Our Trends</span>
              <div className="absolute inset-0 bg-gold-500/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
            </Link>
          </div>
        </div>
        
        {loading ? <ProductGridSkeleton count={4} /> : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
            {products.map((p, i) => (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.15 }}
              >
                <ProductCard product={p} index={i} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function BrandStatement() {
  return (
    <section className="relative py-28 overflow-hidden bg-black flex items-center justify-center">
      {/* Cinematic Spotlight Backdrop */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[radial-gradient(circle,rgba(212,175,55,0.06)_0%,transparent_70%)]" />
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_bottom,black,transparent_40%,transparent_60%,black)]" />
      </div>

      <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-flex items-center justify-center gap-8 mb-16">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold-500/40" />
            <motion.span 
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="text-gold-500 text-3xl filter drop-shadow-[0_0_12px_rgba(212,175,55,0.6)]"
            >
              ✦
            </motion.span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold-500/40" />
          </div>

          <h2 className="font-display text-5xl md:text-8xl text-white leading-[1.05] tracking-tight mb-12">
            Every Piece is a<br />
            <span className="italic text-gold-400 font-serif relative">
              Promise of Eternity
              <motion.span 
                 initial={{ width: 0 }}
                 whileInView={{ width: '100%' }}
                 transition={{ delay: 1, duration: 2 }}
                 className="absolute bottom-4 left-0 h-[2px] bg-gradient-to-r from-gold-500/0 via-gold-500 to-gold-500/0 opacity-30" 
              />
            </span>
          </h2>

          <p className="font-serif text-2xl italic text-white/50 leading-relaxed max-w-4xl mx-auto mb-10 px-8">
            "Experience a new dimension of jewelry where artistry meets integrity. Every creation is an ode to your unique journey, crafted for the forever you deserve."
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            {[
              { label: 'Unwavering Trust', value: 'BIS Hallmarked', sub: '100% Purity Guaranteed' },
              { label: 'Artisanal Mastery', value: 'Hand-Crafted', sub: 'Single-Batch Perfection' },
              { label: 'Real-time Value', value: 'Live Pricing', sub: 'Global Transparent Rates' },
            ].map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.2 }}
                className="group p-8 border border-white/5 bg-white/[0.02] hover:bg-gold-500/[0.03] hover:border-gold-500/30 transition-all duration-700 rounded-sm"
              >
                <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-white/30 mb-4 group-hover:text-gold-500/60 transition-colors">{stat.label}</p>
                <p className="font-display text-3xl text-gold-500 mb-2">{stat.value}</p>
                <div className="h-px w-6 bg-gold-900 mx-auto my-4 group-hover:w-16 transition-all duration-700" />
                <p className="font-sans text-[10px] tracking-widest text-white/40 group-hover:text-white/60">{stat.sub}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ShopCTA() {
  const features = [
    {
      icon: '⚖️',
      title: 'Live Gold Pricing',
      desc: 'Every price you see is calculated in real-time using live market rates — no hidden markups, ever.',
    },
    {
      icon: '🏅',
      title: 'BIS Hallmarked',
      desc: '100% certified purity on every piece. We stand behind the integrity of every gram we sell.',
    },
    {
      icon: '✍️',
      title: 'Custom Designs',
      desc: 'Work with our master craftsmen to create a bespoke piece tailored to your vision and occasion.',
    },
  ];

  const stats = [
    { value: '12+', label: 'Years of Craft' },
    { value: '10K+', label: 'Happy Customers' },
    { value: '500+', label: 'Unique Designs' },
    { value: '100%', label: 'Hallmark Certified' },
  ];

  return (
    <section className="relative bg-[#0A0A0A] overflow-hidden">
      {/* Top gold divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />

      {/* ── Feature Pillars ── */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="font-sans text-[10px] tracking-[0.5em] uppercase text-gold-500 mb-4 font-bold">Why Shop With Us</p>
          <h2 className="font-display text-4xl md:text-5xl text-white">
            The Akshar <span className="italic text-gold-400 font-serif">Difference</span>
          </h2>
          <div className="w-16 h-px bg-gold-gradient mx-auto mt-6" />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="group relative p-8 border border-white/5 bg-white/[0.02] hover:border-gold-500/25 hover:bg-gold-500/[0.03] transition-all duration-700"
            >
              {/* Corner accent */}
              <div className="absolute top-0 left-0 w-6 h-px bg-gold-500/0 group-hover:bg-gold-500/60 group-hover:w-12 transition-all duration-700" />
              <div className="absolute top-0 left-0 h-6 w-px bg-gold-500/0 group-hover:bg-gold-500/60 group-hover:h-12 transition-all duration-700" />

              <span className="text-3xl mb-5 block">{f.icon}</span>
              <h3 className="font-display text-lg text-white mb-3 group-hover:text-gold-400 transition-colors">{f.title}</h3>
              <p className="font-sans text-xs text-white/40 leading-relaxed group-hover:text-white/60 transition-colors">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── CTA Banner ── */}
      <div className="relative overflow-hidden border-y border-luxury-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,_rgba(212,175,55,0.05)_0%,_transparent_70%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-500/[0.03] rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 py-20 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-6 mb-10">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-gold-500/50" />
              <span className="font-sans text-[9px] tracking-[0.5em] uppercase text-gold-500/70">Akshar Jewellers · Est. 2012</span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-gold-500/50" />
            </div>

            <h2 className="font-display text-4xl md:text-6xl text-white leading-tight mb-6">
              Your Story Deserves<br />
              <span className="italic text-gold-400 font-serif">Timeless Gold</span>
            </h2>

            <p className="font-sans text-sm text-white/50 max-w-xl mx-auto mb-12 leading-relaxed">
              From our atelier in Ahmedabad to your hands — browse over 500 handcrafted pieces, each priced live and certified pure.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <Link to="/shop" className="btn-gold px-12 py-4">
                Shop The Collection
              </Link>
              <Link
                to="/about"
                className="group flex items-center gap-3 font-sans text-[11px] tracking-[0.3em] uppercase text-white/50 hover:text-gold-400 transition-colors"
              >
                Our Story
                <span className="block w-8 h-px bg-white/20 group-hover:w-14 group-hover:bg-gold-500 transition-all duration-500" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="text-center group"
            >
              <p className="font-display text-4xl md:text-5xl text-gold-500 mb-2 group-hover:text-gold-300 transition-colors">{s.value}</p>
              <div className="w-6 h-px bg-gold-900 mx-auto mb-3 group-hover:w-12 group-hover:bg-gold-500/40 transition-all duration-500" />
              <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-white/30 group-hover:text-white/50 transition-colors">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
    </section>
  );
}



export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [f, t] = await Promise.all([
          api.get('/products?isFeatured=true&limit=4'),
          api.get('/products?isTrending=true&limit=4'),
        ]);
        setFeatured(f.data.data);
        setTrending(t.data.data);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="bg-[#050505] selection:bg-gold-500/30">
      <OfferPopup />
      <HeroSection />
      <BrandStory />
      <WhyAkshar />
      <CategoryGrid />
      <FeaturedProducts products={featured} loading={loading} />
      <BrandStatement />
      <TrendingProducts products={trending} loading={loading} />
      <ShopCTA />
      <AskQuestionCTA />
      <StoreVisitHours />
    </div>
  );
}
