import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { toggleWishlistRemote } from '../store/cartSlice';
import api from '../services/api';
import { formatPrice, calculateJewelryPrice, purityLabel, calculateOfferPrice } from '../utils/helpers';
import { SkeletonText, ProductGridSkeleton } from '../components/common/Skeleton';
import ProductQA from '../components/jewelry/ProductQA';
import ProductCard from '../components/jewelry/ProductCard';
import toast from 'react-hot-toast';

function PriceBreakdown({ product, rates }) {
  const rate = product.metalType === 'silver' ? rates.silverRate
    : product.purity === '24K' ? rates.goldRate24K
    : product.purity === '18K' ? rates.goldRate18K
    : rates.goldRate22K || rates.goldRate;

  const metalValue = rate * product.weightInGrams;
  const making = metalValue * (product.makingChargePercent / 100);
  const total = Math.round(metalValue + making + (product.stonePrice || 0));

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="bg-luxury-dark border border-luxury-border p-4 mt-3 text-xs font-sans space-y-2"
    >
      <div className="flex justify-between text-white/60">
        <span>Metal Value ({product.weightInGrams}g × ₹{rate?.toLocaleString('en-IN')}/g)</span>
        <span className="text-white">{formatPrice(metalValue)}</span>
      </div>
      <div className="flex justify-between text-white/60">
        <span>Making Charges ({product.makingChargePercent}%)</span>
        <span className="text-white">{formatPrice(making)}</span>
      </div>
      {product.stonePrice > 0 && (
        <div className="flex justify-between text-white/60">
          <span>Stone Price</span>
          <span className="text-white">{formatPrice(product.stonePrice)}</span>
        </div>
      )}
      {product.activeOffer && (
        <div className="flex justify-between text-green-400/80 pt-1">
          <span>Offer Discount ({product.activeOffer.title})</span>
          <span>-{formatPrice(total - calculateOfferPrice(total, product.activeOffer))}</span>
        </div>
      )}
      <div className="flex justify-between border-t border-luxury-border pt-2 text-gold-400 font-600">
        <span className="uppercase tracking-wider">Final Price</span>
        <span className="text-base">{formatPrice(product.activeOffer ? calculateOfferPrice(total, product.activeOffer) : total)}</span>
      </div>
      <p className="text-luxury-muted text-[10px] tracking-wider uppercase pt-1">
        ✦ Price updates live with metal market rates
      </p>
    </motion.div>
  );
}

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [related, setRelated] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  const rates = useSelector(s => s.rates);
  const { wishlist } = useSelector(s => s.cart);
  const dispatch = useDispatch();
  const isWishlisted = wishlist.some(w => w._id === product?._id);

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${id}`).then(r => { setProduct(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!product?.category?._id) {
      setRelated([]);
      return;
    }
    setRelatedLoading(true);
    api.get(`/products?category=${product.category._id}&limit=8&sort=-createdAt`)
      .then(r => {
        const list = (r.data.data || []).filter(p => p._id !== product._id);
        setRelated(list);
      })
      .catch(() => setRelated([]))
      .finally(() => setRelatedLoading(false));
  }, [product?._id, product?.category?._id]);


  if (loading) return (
    <div className="pt-32 max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div className="skeleton aspect-square" />
      <div className="pt-8 space-y-4"><SkeletonText lines={8} /></div>
    </div>
  );
  if (!product) return <div className="pt-32 text-center"><p className="text-white/50 font-display text-2xl">Product not found</p></div>;

  const price = calculateJewelryPrice(product, rates);
  const images = product.images?.length ? product.images : [{ url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800' }];
  const isVideoUrl = (url) => /\/video\/upload\//i.test(url) || /\.(mp4|webm|mov|mkv)(\?|$)/i.test(url);
  const mediaItems = [
    ...images.map(img => ({ type: 'image', url: img.url })),
    ...(product.media?.url ? [{
      type: (product.media.resourceType === 'video' || isVideoUrl(product.media.url)) ? 'video' : 'image',
      url: product.media.url
    }] : [])
  ];
  const activeItem = mediaItems[activeImg];
  const whatsappMessage = (() => {
    const finalPrice = product.activeOffer ? calculateOfferPrice(price, product.activeOffer) : price;
    const lines = [
      "Hello! I'm interested in this product:",
      `Name: ${product.name}`,
      `Price: ${formatPrice(finalPrice)}`,
      `Category: ${product.category?.name || 'N/A'}`,
    ];

    if (product.sku) lines.push(`SKU: ${product.sku}`);
    if (product.metalType) {
      lines.push(`Metal: ${product.metalType.charAt(0).toUpperCase() + product.metalType.slice(1)} · ${purityLabel(product.purity)}`);
    }
    if (product.weightInGrams) lines.push(`Weight: ${product.weightInGrams}g`);
    if (product.stoneDetails) lines.push(`Stone Details: ${product.stoneDetails}`);

    return encodeURIComponent(lines.join("\n"));
  })();

  return (
    <div className="pt-24 pb-20 min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 font-sans text-[11px] text-luxury-muted">
          <Link to="/" className="hover:text-gold-500 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-gold-500 transition-colors">Shop</Link>
          {product.category && <>
            <span>/</span>
            <Link to={`/category/${product.category.slug}`} className="hover:text-gold-500 transition-colors">{product.category.name}</Link>
          </>}
          <span>/</span>
          <span className="text-white/50 truncate max-w-[200px]">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Images */}
        <div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Main image */}
            <div
              className={`relative aspect-square overflow-hidden bg-luxury-card border border-luxury-border ${activeItem?.type === 'image' ? 'cursor-zoom-in' : 'cursor-default'}`}
              onClick={() => { if (activeItem?.type === 'image') setZoomed(!zoomed); }}
            >
              {activeItem?.type === 'video' ? (
                <video
                  key={activeImg}
                  src={activeItem.url}
                  className="w-full h-full object-cover"
                  controls
                />
              ) : (
                <motion.img
                  key={activeImg}
                  src={activeItem?.url}
                  alt={product.name}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: zoomed ? 1.5 : 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-full object-cover"
                  style={{ transformOrigin: 'center' }}
                />
              )}
              {activeItem?.type === 'image' && !zoomed && (
                <div className="absolute bottom-3 right-3 bg-luxury-black/80 border border-luxury-border px-2 py-1">
                  <span className="font-sans text-[10px] text-luxury-muted tracking-wider">Click to zoom</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {mediaItems.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto hide-scrollbar">
                {mediaItems.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => { setActiveImg(i); setZoomed(false); }}
                    className={`flex-shrink-0 w-16 h-16 overflow-hidden border-2 transition-all ${i === activeImg ? 'border-gold-500' : 'border-luxury-border hover:border-gold-700'}`}
                  >
                    {item.type === 'video' ? (
                      <div className="w-full h-full flex items-center justify-center bg-black text-gold-500 text-[10px] font-sans uppercase tracking-widest">
                        Video
                      </div>
                    ) : (
                      <img src={item.url} alt="" className="w-full h-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Details */}
        <div className="pt-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {/* Category & badges */}
            <div className="flex items-center gap-3 mb-4">
              <span className="font-sans text-[10px] tracking-widest uppercase text-gold-500">{product.category?.name}</span>
              {product.isFeatured && <span className="bg-gold-500 text-luxury-black font-sans text-[9px] font-600 px-2 py-0.5 uppercase tracking-wider">Featured</span>}
            </div>

            {/* Name */}
            <h1 className="font-display text-3xl md:text-4xl text-white leading-tight mb-4">{product.name}</h1>

            {/* SKU */}
            {product.sku && <p className="font-sans text-[11px] text-luxury-muted tracking-widest mb-4">SKU: {product.sku}</p>}

            {/* Price */}
            <div className="bg-luxury-card border border-luxury-border p-5 mb-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="font-sans text-[10px] tracking-widest uppercase text-luxury-muted mb-1">
                    {product.activeOffer ? 'Special Offer Price' : 'Live Calculated Price'}
                  </p>
                  {product.activeOffer ? (
                    <div className="flex flex-col gap-1">
                      <span className="font-sans text-sm text-white/40 line-through decoration-red-500/50">{formatPrice(price)}</span>
                      <span className="font-display text-4xl text-gold-400">{formatPrice(calculateOfferPrice(price, product.activeOffer))}</span>
                    </div>
                  ) : (
                    <p className="font-display text-4xl text-gold-400">{formatPrice(price)}</p>
                  )}
                </div>
                <button onClick={() => setShowBreakdown(!showBreakdown)}
                  className="font-sans text-[10px] tracking-widest uppercase text-luxury-muted hover:text-gold-400 transition-colors border border-luxury-border px-3 py-2">
                  {showBreakdown ? 'Hide' : 'View'} Breakdown
                </button>
              </div>
              <AnimatePresence>
                {showBreakdown && <PriceBreakdown product={product} rates={rates} />}
              </AnimatePresence>
            </div>

            {/* Specs */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                ['Metal', `${product.metalType?.charAt(0).toUpperCase() + product.metalType?.slice(1)} · ${purityLabel(product.purity)}`],
                ['Weight', `${product.weightInGrams}g`],
                ['Making', `${product.makingChargePercent}%`],
                ['Stone Price', product.stonePrice > 0 ? formatPrice(product.stonePrice) : 'No Stones'],
              ].map(([k, v]) => (
                <div key={k} className="bg-luxury-dark border border-luxury-border px-4 py-3">
                  <p className="font-sans text-[10px] tracking-widest uppercase text-luxury-muted mb-0.5">{k}</p>
                  <p className="font-sans text-sm text-white">{v}</p>
                </div>
              ))}
            </div>

            {/* Stone details */}
            {product.stoneDetails && (
              <div className="border border-luxury-border px-4 py-3 mb-5">
                <p className="font-sans text-[10px] tracking-widest uppercase text-luxury-muted mb-1">Stone Details</p>
                <p className="font-sans text-sm text-white/80">{product.stoneDetails}</p>
              </div>
            )}

            {/* Description */}
            <div className="mb-8">
              <p className="font-serif text-white/60 leading-relaxed text-sm">{product.description}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <a href={`https://wa.me/+919586607262?text=${whatsappMessage}`} target="_blank" rel="noreferrer"
                className="btn-gold flex-1 text-center flex items-center justify-center gap-2">
                <span>📱</span> Enquire on WhatsApp
              </a>
              <button
                onClick={() => { dispatch(toggleWishlistRemote(product)); toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist'); }}
                className={`border px-5 py-3 transition-all duration-300 text-lg ${isWishlisted ? 'border-red-500 text-red-400 bg-red-500/10' : 'border-luxury-border text-luxury-muted hover:border-red-500 hover:text-red-400'}`}
              >
                {isWishlisted ? '♥' : '♡'}
              </button>
            </div>

            {/* Trust badges */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[['🏆', 'BIS Hallmarked'], ['🔒', 'Secure Purchase'], ['✓', 'Certificate Incl.']].map(([icon, text]) => (
                <div key={text} className="flex flex-col items-center text-center gap-1 py-3 border border-luxury-border">
                  <span className="text-base">{icon}</span>
                  <span className="font-sans text-[10px] text-luxury-muted tracking-wider uppercase">{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {(relatedLoading || related.length > 0) && (
          <div className="mt-14 mb-12">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold-500 mb-2">More You'll Love</p>
                <h2 className="font-display text-2xl text-white">
                  More in {product.category?.name || 'this collection'}
                </h2>
              </div>
              {product.category?.slug && (
                <Link to={`/category/${product.category.slug}`} className="btn-outline-gold text-[10px] px-4 py-2">
                  View Category
                </Link>
              )}
            </div>
            {relatedLoading ? (
              <ProductGridSkeleton count={4} />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {related.map((p, i) => <ProductCard key={p._id} product={p} index={i % 12} />)}
              </div>
            )}
          </div>
        )}
        <ProductQA productId={product._id} />
      </div>
    </div>
  );
}

