import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { formatPrice, calculateJewelryPrice } from '../../utils/helpers';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

// Gender badge config
const GENDER_BADGE = {
  male:   { label: 'Male',   cls: 'border-blue-800 text-blue-400 bg-blue-900/20' },
  female: { label: 'Female', cls: 'border-pink-800 text-pink-400 bg-pink-900/20' },
  unisex: { label: 'Unisex', cls: 'border-luxury-border text-luxury-muted' },
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState({});
  const rates = useSelector(s => s.rates);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/products?limit=200&sort=-createdAt');
      setProducts(data.data);
    } catch { toast.error('Failed to load products'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await api.delete(`/products/${id}`);
      setProducts(p => p.filter(x => x._id !== id));
      toast.success('Product deleted');
    } catch { toast.error('Delete failed'); }
    setDeleting(null);
  };

  // Filter
  const filtered = products.filter(p =>
    !search ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.name?.toLowerCase().includes(search.toLowerCase())
  );

  // Group by category name
  const grouped = filtered.reduce((acc, p) => {
    const key = p.category?.name || 'Uncategorized';
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  const categoryNames = Object.keys(grouped).sort();
  const allCollapsed = categoryNames.length > 0 && categoryNames.every(c => collapsed[c]);

  const toggleAll = () => {
    const next = {};
    categoryNames.forEach(c => { next[c] = !allCollapsed; });
    setCollapsed(next);
  };

  const toggleCategory = (name) => {
    setCollapsed(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const TABLE_COLS = ['Asset', 'Identity', 'Attributes', 'Valuation', 'Status', 'Controls'];

  return (
    <div className="max-w-[1600px] mx-auto pb-20">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 px-1">
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.8 }}
        >
          <p className="font-sans text-[10px] tracking-[0.6em] uppercase text-gold-500 mb-4 font-bold">Inventory Control</p>
          <h1 className="font-display text-5xl text-white tracking-tight">Asset<br /><span className="italic text-white/40 font-serif lowercase">Manifest</span></h1>
          <div className="flex items-center gap-4 mt-6">
             <span className="font-sans text-[9px] uppercase tracking-widest text-white/20">{products.length} Registered Items</span>
             <div className="w-1 h-1 rounded-full bg-white/10" />
             <span className="font-sans text-[9px] uppercase tracking-widest text-white/20">{categoryNames.length} Classifications</span>
          </div>
        </motion.div>
        
        <Link to="/admin/products/new" className="group relative h-14 px-10 flex items-center justify-center bg-gold-500 text-black font-sans text-[10px] uppercase tracking-[0.3em] font-bold overflow-hidden transition-transform active:scale-95">
           <span className="relative z-10">Register New Asset</span>
           <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
        </Link>
      </div>

      {/* Global Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-10 px-1">
        <div className="relative flex-1 group">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-gold-500 transition-colors">
            {/* Search Icon Removed */}
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, SKU or classification..."
            className="w-full h-14 bg-white/[0.02] border border-white/[0.05] focus:border-gold-500/40 rounded-sm pl-16 pr-6 font-sans text-xs text-white placeholder:text-white/10 outline-none transition-all"
          />
        </div>
        {categoryNames.length > 1 && (
          <button
            onClick={toggleAll}
            className="h-14 px-8 font-sans text-[9px] tracking-[0.3em] uppercase text-white/30 border border-white/[0.05] hover:border-white/20 hover:text-white transition-all whitespace-nowrap bg-white/[0.01]"
          >
            {allCollapsed ? 'Expand All Groups' : 'Collapse All Groups'}
          </button>
        )}
      </div>

      {/* Manifest Repository */}
      {loading ? (
        <div className="flex justify-center py-40">
           <div className="w-6 h-6 border-[1px] border-gold-500/20 border-t-gold-500 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-32 bg-white/[0.01] border border-white/[0.05] rounded-sm">
          <p className="font-display text-[10px] uppercase tracking-[0.4em] text-white/20 mb-8">No matching entries found</p>
          <button onClick={() => setSearch('')} className="text-gold-500 font-sans text-[10px] uppercase tracking-[0.2em] border-b border-gold-500/20 hover:border-gold-500 transition-all pb-1">Reset Filters</button>
        </div>
      ) : (
        <div className="space-y-6">
          {categoryNames.map((catName, idx) => {
            const items = grouped[catName];
            const isCollapsed = !!collapsed[catName];

            return (
              <motion.div 
                key={catName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white/[0.01] border border-white/[0.04] rounded-sm overflow-hidden"
              >
                {/* Visual Category Header */}
                <button
                  onClick={() => toggleCategory(catName)}
                  className="w-full flex items-center justify-between px-8 py-6 bg-white/[0.01] hover:bg-white/[0.03] transition-all group border-b border-white/[0.02]"
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-1 h-6 rounded-full transition-all duration-700 ${isCollapsed ? 'bg-white/10' : 'bg-gold-500'}`} />
                    <span className="font-display text-xl text-white/60 group-hover:text-white transition-colors tracking-tight">
                      {catName}
                    </span>
                    <span className="font-sans text-[9px] tracking-[0.2em] uppercase text-white/20 group-hover:text-gold-500/50 transition-colors">
                      {items.length} Registered Units
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-sans text-[8px] uppercase tracking-[0.3em] text-white/10 group-hover:text-white/30 transition-colors">{isCollapsed ? 'View Details' : 'Hide Content'}</span>
                  </div>
                </button>

                {/* Intelligent Data Table */}
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-white/[0.03] bg-white/[0.005]">
                              {TABLE_COLS.map(h => (
                                <th key={h} className="px-8 py-5 text-left font-sans text-[9px] tracking-[0.3em] uppercase text-white/10 whitespace-nowrap">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/[0.02]">
                            {items.map((p, i) => {
                              const price = calculateJewelryPrice(p, rates);
                              const gBadge = GENDER_BADGE[p.gender] || GENDER_BADGE.unisex;
                              return (
                                <motion.tr
                                  key={p._id}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: i * 0.03 }}
                                  className="group hover:bg-white/[0.015] transition-colors duration-500"
                                >
                                  {/* Thumbnail */}
                                  <td className="px-8 py-5">
                                    {p.images && p.images.length > 0 && p.images[0]?.url ? (
                                      <img
                                        src={p.images[0].url}
                                        alt={p.name}
                                        className="w-14 h-14 object-cover border border-white/10 rounded-sm"
                                        loading="lazy"
                                      />
                                    ) : (
                                      <div className="font-sans text-[8px] uppercase tracking-widest text-white/10">No Media</div>
                                    )}
                                  </td>

                                  {/* Identity */}
                                  <td className="px-8 py-5">
                                    <p className="font-display text-[13px] text-white/80 group-hover:text-white transition-colors max-w-[200px] line-clamp-1">{p.name}</p>
                                    <p className="font-sans text-[8px] text-white/20 uppercase tracking-[0.2em] mt-1.5">{p.sku || `SKU-${p._id.slice(-6).toUpperCase()}`}</p>
                                  </td>

                                  {/* Attributes */}
                                  <td className="px-8 py-5">
                                    <div className="flex flex-col gap-2">
                                       <span className="font-sans text-[8px] text-white/30 uppercase tracking-[0.1em]">
                                          {p.metalType} · {p.purity} · {p.weightInGrams}g
                                       </span>
                                       <span className={`inline-flex font-sans text-[7px] tracking-[0.1em] uppercase border-b w-fit pb-0.5 opacity-40 group-hover:opacity-100 transition-opacity ${gBadge.cls.split(' ')[0]}`}>
                                          {gBadge.label}
                                       </span>
                                    </div>
                                  </td>

                                  {/* Valuation */}
                                  <td className="px-8 py-5">
                                    <p className="font-display text-base text-gold-500/80 group-hover:text-gold-500 transition-colors tracking-tight">{formatPrice(price)}</p>
                                    <p className="font-sans text-[8px] text-white/20 uppercase tracking-widest mt-1">MC: {p.makingChargePercent}%</p>
                                  </td>

                                  {/* Status */}
                                  <td className="px-8 py-5">
                                    <div className="flex items-center gap-3">
                                       <div className={`w-1.5 h-1.5 rounded-full ${p.isAvailable ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-500/50'}`} />
                                       <span className={`font-sans text-[9px] uppercase tracking-[0.2em] ${p.isAvailable ? 'text-white/60' : 'text-white/20'}`}>
                                          {p.isAvailable ? 'Live' : 'Archived'}
                                       </span>
                                    </div>
                                  </td>

                                  {/* Actions Control */}
                                  <td className="px-8 py-5">
                                    <div className="flex items-center gap-4">
                                      <Link
                                        to={`/admin/products/edit/${p._id}`}
                                        className="h-8 px-5 flex items-center justify-center font-sans text-[8px] tracking-[0.3em] uppercase text-white/40 hover:text-gold-500 border border-white/5 hover:border-gold-500 transition-all bg-white/[0.02]"
                                      >
                                        Edit
                                      </Link>
                                      <button
                                        onClick={() => handleDelete(p._id)}
                                        disabled={deleting === p._id}
                                        className="h-8 w-8 flex items-center justify-center text-white/10 hover:text-red-500 hover:bg-red-900/10 transition-all rounded-sm"
                                      >
                                        {deleting === p._id ? '...' : '×'}
                                      </button>
                                    </div>
                                  </td>
                                </motion.tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
