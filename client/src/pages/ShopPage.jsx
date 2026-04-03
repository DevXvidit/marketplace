import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import ProductCard from '../components/jewelry/ProductCard';
import { ProductGridSkeleton } from '../components/common/Skeleton';
import { debounce } from '../utils/helpers';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    metalType: searchParams.get('metalType') || '',
    isFeatured: searchParams.get('featured') === 'true',
    isTrending: searchParams.get('trending') === 'true',
    sort: '-createdAt',
  });

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data.data)).catch(() => {});
  }, []);

  const fetchProducts = useCallback(async (reset = false) => {
    setLoading(true);
    const p = reset ? 1 : page;
    try {
      const params = new URLSearchParams({ page: p, limit: 12, ...filters });
      const { data } = await api.get(`/products?${params}`);
      setProducts(prev => reset ? data.data : [...prev, ...data.data]);
      setHasMore(p < data.pages);
      if (reset) setPage(1);
    } catch {}
    setLoading(false);
  }, [filters, page]);

  useEffect(() => { fetchProducts(true); }, [filters]);

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(p => p + 1);
    }
  };

  useEffect(() => {
    if (page > 1) fetchProducts(false);
  }, [page]);

  const handleSearch = debounce((val) => setFilters(f => ({ ...f, search: val })), 500);

  const updateFilter = (key, value) => {
    setFilters(f => ({ ...f, [key]: value }));
    setPage(1);
  };

  const SORTS = [
    { value: '-createdAt', label: 'Newest' },
    { value: 'weightInGrams', label: 'Weight: Low' },
    { value: '-weightInGrams', label: 'Weight: High' },
    { value: 'name', label: 'Name A–Z' },
  ];

  return (
    <div className="pt-24 min-h-screen">
      {/* Hero */}
      <div className="relative py-16 px-4 text-center border-b border-luxury-border bg-luxury-dark">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,175,55,0.05)_0%,_transparent_70%)]" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10">
          <p className="font-sans text-xs tracking-[0.4em] uppercase text-gold-500 mb-3">All Collections</p>
          <h1 className="font-display text-4xl md:text-5xl text-white mb-2">Our Jewelry</h1>
          <p className="font-serif text-white/50 text-sm">Discover the latest drops and timeless classics</p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-luxury-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search jewelry..."
              defaultValue={filters.search}
              onChange={e => handleSearch(e.target.value)}
              className="input-luxury pl-10"
            />
          </div>
          <div className="flex gap-3">
            <select value={filters.sort} onChange={e => updateFilter('sort', e.target.value)} className="input-luxury w-auto">
              {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <button onClick={() => setFiltersOpen(!filtersOpen)}
              className={`border px-4 py-3 font-sans text-xs tracking-wider uppercase transition-all duration-300 ${filtersOpen ? 'border-gold-500 text-gold-500' : 'border-luxury-border text-luxury-muted hover:border-gold-700'}`}>
              Filters {filtersOpen ? '▲' : '▼'}
            </button>
          </div>
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="bg-luxury-card border border-luxury-border p-6 mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Category */}
                <div>
                  <label className="font-sans text-[10px] tracking-widest uppercase text-luxury-muted block mb-2">Category</label>
                  <select value={filters.category} onChange={e => updateFilter('category', e.target.value)} className="input-luxury text-sm w-full">
                    <option value="">All</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                {/* Metal */}
                <div>
                  <label className="font-sans text-[10px] tracking-widest uppercase text-luxury-muted block mb-2">Metal</label>
                  <select value={filters.metalType} onChange={e => updateFilter('metalType', e.target.value)} className="input-luxury text-sm w-full">
                    <option value="">All Metals</option>
                    <option value="gold">Gold</option>
                    <option value="silver">Silver</option>
                    <option value="platinum">Platinum</option>
                  </select>
                </div>
                {/* Featured */}
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={filters.isFeatured} onChange={e => updateFilter('isFeatured', e.target.checked)}
                      className="w-4 h-4 accent-gold-500" />
                    <span className="font-sans text-xs text-white/70">Featured Only</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer mt-2">
                    <input type="checkbox" checked={filters.isTrending} onChange={e => updateFilter('isTrending', e.target.checked)}
                      className="w-4 h-4 accent-gold-500" />
                    <span className="font-sans text-xs text-white/70">Trending Only</span>
                  </label>
                </div>
                {/* Clear */}
                <div className="flex items-end">
                  <button onClick={() => setFilters({ search: '', category: '', metalType: '', isFeatured: false, isTrending: false, sort: '-createdAt' })}
                    className="btn-outline-gold w-full text-center text-[10px]">
                    Clear All
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active filter chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {filters.metalType && (
            <span className="flex items-center gap-1 bg-gold-500/10 border border-gold-700 text-gold-400 font-sans text-[10px] px-3 py-1 uppercase tracking-wider">
              {filters.metalType}
              <button onClick={() => updateFilter('metalType', '')} className="ml-1 hover:text-white">×</button>
            </span>
          )}
          {filters.isFeatured && (
            <span className="flex items-center gap-1 bg-gold-500/10 border border-gold-700 text-gold-400 font-sans text-[10px] px-3 py-1 uppercase tracking-wider">
              Featured <button onClick={() => updateFilter('isFeatured', false)} className="ml-1 hover:text-white">×</button>
            </span>
          )}
        </div>

        {/* Products Grid */}
        {loading && products.length === 0 ? (
          <ProductGridSkeleton count={12} />
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-4xl mb-4">💎</p>
            <p className="font-display text-2xl text-white/50 mb-2">No jewelry found</p>
            <p className="font-sans text-sm text-luxury-muted">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((p, i) => <ProductCard key={p._id} product={p} index={i % 12} />)}
          </div>
        )}

        {/* Load More */}
        {hasMore && !loading && (
          <div className="flex justify-center mt-12">
            <button onClick={loadMore} className="btn-outline-gold px-12">Load More</button>
          </div>
        )}

        {loading && products.length > 0 && (
          <div className="flex justify-center mt-8">
            <div className="w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <div className="mt-14">
          <div className="border border-luxury-border p-6 md:p-8 bg-luxury-card/40 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold-500 mb-2">Need Help?</p>
              <h3 className="font-display text-2xl text-white">Ask About Any Product or Price</h3>
              <p className="font-sans text-xs text-white/50 mt-2">
                Visit our FAQ or send your question directly to the store team.
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
          </div>
        </div>
      </div>
    </div>
  );
}
