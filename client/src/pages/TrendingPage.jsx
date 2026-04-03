import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import ProductCard from '../components/jewelry/ProductCard';
import { ProductGridSkeleton } from '../components/common/Skeleton';

export default function TrendingPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.get('/products?isTrending=true&limit=48&sort=-createdAt')
      .then(r => { if (mounted) setProducts(r.data.data || []); })
      .catch(() => { if (mounted) setProducts([]); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  return (
    <div className="pt-24 min-h-screen">
      <div className="relative py-16 px-4 text-center border-b border-luxury-border bg-luxury-dark">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,175,55,0.08)_0%,_transparent_70%)]" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <p className="font-sans text-xs tracking-[0.4em] uppercase text-gold-500 mb-3">Trending Now</p>
          <h1 className="font-display text-4xl md:text-5xl text-white mb-2">Most Loved Pieces</h1>
          <p className="font-serif text-white/50 text-sm">{loading ? 'Loading trending picks...' : 'Curated daily from our most loved designs'}</p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {loading ? (
          <ProductGridSkeleton count={12} />
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-display text-2xl text-white/50 mb-2">No trending products yet</p>
            <p className="font-sans text-sm text-luxury-muted">Check back soon for fresh favorites</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((p, i) => <ProductCard key={p._id} product={p} index={i % 12} />)}
          </div>
        )}
      </div>
    </div>
  );
}
