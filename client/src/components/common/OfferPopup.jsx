import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { calculateJewelryPrice } from '../../utils/helpers';
import api from '../../services/api';

export default function OfferPopup() {
  const [offer, setOffer] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const rates = useSelector(s => s.rates);

  useEffect(() => {

    const fetchActiveOffer = async () => {
      try {
        const { data } = await api.get('/offers/active');
        if (data.success && data.data) {
          setOffer(data.data);
          // Auto appear after a short delay
          setTimeout(() => setIsVisible(true), 1500);
        }
      } catch (err) {
        console.error('Failed to fetch offer', err);
      }
    };

    fetchActiveOffer();
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!offer || !offer.endTime) return;

    const calculateTimeLeft = () => {
      const difference = new Date(offer.endTime) - new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft(null);
        setIsVisible(false); // Close if offer expired
      }
    };

    calculateTimeLeft();
    const timerId = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timerId);
  }, [offer]);

  if (!offer) return null;

  const originalPrice = offer.product ? (offer.product.calculatedPrice || calculateJewelryPrice(offer.product, rates)) : 0;
  let offerPrice = originalPrice;
  if (offer.discountType === 'percentage') {
    offerPrice = originalPrice - (originalPrice * (offer.discountValue / 100));
  } else if (offer.discountType === 'fixed') {
    offerPrice = originalPrice - offer.discountValue;
  }
  // Ensure we don't go below 0 just in case
  offerPrice = Math.max(0, offerPrice);

  const popupContent = (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="offer-popup"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 selection:bg-gold-500/30"
        >
          {/* Popup Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-[#0a0a0a] border border-gold-500/30 shadow-2xl overflow-hidden rounded-sm flex flex-col"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-500/20 via-gold-500 to-gold-500/20" />
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.1)_0%,transparent_70%)] pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-black/40 border border-white/10 text-white/50 hover:text-white hover:border-gold-500/50 hover:bg-gold-500/10 rounded-full transition-all z-50 hover:scale-110 active:scale-95 cursor-pointer"
            >
              <span className="text-xl leading-none">×</span>
            </button>

            {/* Product Name (Top) */}
            <div className="pt-6 px-8 text-center relative z-10">
              <span className="inline-block font-sans text-[9px] tracking-[0.4em] uppercase text-gold-500/80 mb-2 border border-gold-500/20 px-3 py-1 bg-gold-500/5">
                Exclusive Promotion
              </span>
              <p className="font-sans text-[11px] tracking-widest text-white/50 uppercase mt-2">
                {offer.product?.name}
              </p>
            </div>

            {/* Content Area */}
            <div className="p-8 pt-4 flex flex-col items-center relative z-10">
              <h3 className="font-display text-4xl text-gold-500 mb-6 text-center leading-tight">
                {offer.title}
              </h3>

              {/* Optional Image */}
              {offer.image && (
                <div className="w-full h-48 mb-6 overflow-hidden rounded-sm border border-white/5 relative group">
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
                </div>
              )}

              {/* Short Description */}
              <p className="font-sans text-sm text-white/60 mb-8 text-center leading-relaxed">
                {offer.description}
              </p>

              {/* Countdown Timer */}
              {timeLeft && (
                <div className="flex gap-3 mb-8 w-full justify-center">
                  <div className="flex flex-col items-center justify-center p-3 border border-gold-500/20 bg-gold-500/5 rounded-sm min-w-[65px]">
                    <span className="font-display text-2xl text-gold-400 leading-none mb-1">{timeLeft.days}</span>
                    <span className="text-[9px] uppercase tracking-widest text-white/40">Days</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 border border-gold-500/20 bg-gold-500/5 rounded-sm min-w-[65px]">
                    <span className="font-display text-2xl text-gold-400 leading-none mb-1">{String(timeLeft.hours).padStart(2, '0')}</span>
                    <span className="text-[9px] uppercase tracking-widest text-white/40">Hours</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 border border-gold-500/20 bg-gold-500/5 rounded-sm min-w-[65px]">
                    <span className="font-display text-2xl text-gold-400 leading-none mb-1">{String(timeLeft.minutes).padStart(2, '0')}</span>
                    <span className="text-[9px] uppercase tracking-widest text-white/40">Mins</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 border border-gold-500/20 bg-gold-500/5 rounded-sm min-w-[65px]">
                    <span className="font-display text-2xl text-gold-400 leading-none mb-1">{String(timeLeft.seconds).padStart(2, '0')}</span>
                    <span className="text-[9px] uppercase tracking-widest text-white/40">Secs</span>
                  </div>
                </div>
              )}

              {/* Pricing Details */}
              <div className="w-full flex flex-col items-center justify-center border-t border-b border-white/[0.05] py-5 mb-8 bg-white/[0.01]">
                 <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-white/30 mb-2">Special Offer</p>
                 <div className="flex items-center justify-center gap-4">
                    <span className="font-sans text-lg text-white/40 line-through decoration-red-500/50">
                      {originalPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                    </span>
                    <span className="font-display text-4xl text-white tracking-tight drop-shadow-[0_0_12px_rgba(212,175,55,0.3)]">
                      {offerPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                    </span>
                 </div>
              </div>

              {/* CTA Button */}
              <Link
                to={`/product/${offer.product?._id}`}
                onClick={handleClose}
                className="w-full bg-gold-500 text-black py-4 text-center font-sans text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-gold-400 transition-colors shadow-[0_4px_20px_rgba(212,175,55,0.2)]"
              >
                Claim Offer Now
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(popupContent, document.body);
}
