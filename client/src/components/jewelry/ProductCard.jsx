import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { toggleWishlistRemote } from '../../store/cartSlice';
import { formatPrice, calculateJewelryPrice, calculateOfferPrice } from '../../utils/helpers';

export default function ProductCard({ product, index = 0 }) {
  const [hovered, setHovered] = useState(false);
  const dispatch = useDispatch();
  const rates = useSelector(s => s.rates);
  const { wishlist } = useSelector(s => s.cart);
  const isWishlisted = wishlist.some(w => w._id === product._id);

  const price = product.calculatedPrice || calculateJewelryPrice(product, rates);
  const img = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600';
  const img2 = product.images?.[1]?.url || img;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="group relative bg-luxury-black border border-luxury-border/30 overflow-hidden cursor-pointer shadow-xl transition-all duration-500 hover:shadow-gold-500/10"
    >
      {/* Image Container */}
      <Link to={`/product/${product.slug || product._id}`} className="block relative overflow-hidden aspect-square">
        <motion.img
          src={img}
          alt={product.name}
          animate={{ scale: hovered ? 1.1 : 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Hover second image */}
        {img2 !== img && (
          <motion.img
            src={img2}
            alt={product.name}
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Dynamic Light Sweep */}
        <motion.div
          animate={{ x: hovered ? '200%' : '-100%' }}
          transition={{ duration: 1.2, ease: 'linear', repeat: hovered ? Infinity : 0, repeatDelay: 1 }}
          className="absolute inset-0 z-10 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
          style={{ transform: 'skewX(-25deg)' }}
        />

        {/* Luxury Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
          {product.isFeatured && (
            <span className="bg-gold-500 text-luxury-black font-sans text-[8px] font-bold px-2 py-1 uppercase tracking-[0.2em] shadow-lg">Featured</span>
          )}
          {product.isTrending && (
            <span className="bg-white/10 backdrop-blur-md text-gold-400 border border-white/20 font-sans text-[8px] font-bold px-2 py-1 uppercase tracking-[0.2em]">Trending</span>
          )}
        </div>

        {/* Quick View Button */}
        <motion.div
          animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 20 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-x-0 bottom-0 z-20 p-4"
        >
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 py-2 text-center text-white font-sans text-[10px] tracking-[0.3em] uppercase">
            Quick View
          </div>
        </motion.div>
      </Link>

      {/* Info Section with Glass Look */}
      <div className="p-5 relative z-10 bg-gradient-to-b from-luxury-black to-[#050505]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-gold-500/60 mb-1.5 font-medium">
              {product.category?.name || 'Jewelry'}
            </p>
            <Link to={`/product/${product.slug || product._id}`}>
              <h3 className="font-serif text-sm text-white/90 leading-relaxed hover:text-gold-400 transition-colors line-clamp-2 italic">
                {product.name}
              </h3>
            </Link>
          </div>
          <button
            onClick={() => dispatch(toggleWishlistRemote(product))}
            className="flex-shrink-0 p-1 rounded-full bg-white/5 hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <motion.span
              animate={{ scale: isWishlisted ? [1, 1.4, 1] : 1 }}
              transition={{ duration: 0.3 }}
              className={`text-lg leading-none ${isWishlisted ? 'text-red-500' : 'text-white/20 hover:text-red-400'}`}
              aria-hidden="true"
            >
              {isWishlisted ? '♥' : '♡'}
            </motion.span>
          </button>
        </div>

        <div className="mt-5 flex items-end justify-between">
          <div>
            {product.activeOffer ? (
              <div className="flex flex-col">
                <span className="font-sans text-xs text-white/40 line-through decoration-red-500/50">{formatPrice(price)}</span>
                <span className="font-display text-xl text-gold-500 tracking-tight font-light">{formatPrice(calculateOfferPrice(price, product.activeOffer))}</span>
              </div>
            ) : (
              <p className="font-display text-xl text-gold-500 tracking-tight font-light">{formatPrice(price)}</p>
            )}
            <p className="font-sans text-[10px] text-white/40 mt-1 uppercase tracking-wider">{product.weightInGrams}g · {product.purity || '22K'}</p>
          </div>
          <Link
            to={`/product/${product.slug || product._id}`}
            className="group/btn relative overflow-hidden px-5 py-2 transition-all duration-300 border border-gold-500/30 hover:border-gold-500"
          >
            <span className="relative z-10 font-sans text-[10px] text-gold-500 uppercase tracking-[0.2em] group-hover/btn:text-luxury-black transition-colors duration-300">View</span>
            <motion.div 
              className="absolute inset-0 bg-gold-500 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-[0.22, 1, 0.36, 1]"
            />
          </Link>
        </div>
      </div>

      {/* Luxury Border Glow */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        className="absolute inset-0 border border-gold-500/40 pointer-events-none z-30"
      />
    </motion.div>

  );
}
