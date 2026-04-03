import { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminOffers() {
  const [offers, setOffers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState(null);
  const fileInputRef = useRef();

  const [productSelectMode, setProductSelectMode] = useState('search'); // 'search' or 'category'
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = useMemo(() => {
    const map = new Map();
    products.forEach(p => {
      if (p.category) {
        const catId = typeof p.category === 'object' ? p.category._id : p.category;
        const catName = typeof p.category === 'object' ? p.category.name : 'Unknown Category';
        if (!map.has(catId)) {
          map.set(catId, { id: catId, name: catName, products: [] });
        }
        map.get(catId).products.push(p);
      }
    });
    return Array.from(map.values());
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (productSelectMode === 'search') {
      if (!productSearchTerm) return products;
      return products.filter(p => p.name.toLowerCase().includes(productSearchTerm.toLowerCase()));
    } else {
      if (!selectedCategory) return [];
      return products.filter(p => {
        const catId = typeof p.category === 'object' ? p.category._id : p.category;
        return catId === selectedCategory;
      });
    }
  }, [products, productSelectMode, productSearchTerm, selectedCategory]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    product: '',
    discountType: 'percentage',
    discountValue: '',
    startTime: '',
    endTime: '',
    image: null
  });

  const loadData = async () => {
    try {
      const [offersRes, productsRes] = await Promise.all([
        api.get('/offers'),
        api.get('/products?limit=1000') // Fetch products for the dropdown
      ]);
      setOffers(offersRes.data.data);
      setProducts(productsRes.data.data);
    } catch {
      toast.error('Failed to load data');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (form[key]) {
          formData.append(key, form[key]);
        }
      });

      if (editingOfferId) {
        await api.put(`/offers/${editingOfferId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Campaign Updated');
      } else {
        await api.post('/offers', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Promotional Offer Generated');
      }
      
      // Reset form
      cancelEdit();
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process offer');
    }
    setSaving(false);
  };

  const cancelEdit = () => {
    setForm({
      title: '', description: '', product: '', 
      discountType: 'percentage', discountValue: '', 
      startTime: '', endTime: '', image: null
    });
    setEditingOfferId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEdit = (offer) => {
    const formatForInput = (dateString) => {
      const d = new Date(dateString);
      const pad = (n) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    setEditingOfferId(offer._id);
    
    const offerProductId = offer.product?._id || offer.product;
    const fullProduct = products.find(p => p._id === offerProductId);
    
    if (fullProduct?.category) {
      setProductSelectMode('category');
      setSelectedCategory(typeof fullProduct.category === 'object' ? fullProduct.category._id : fullProduct.category);
    } else {
      setProductSelectMode('search');
    }

    setForm({
      title: offer.title,
      description: offer.description,
      product: offerProductId,
      discountType: offer.discountType,
      discountValue: offer.discountValue,
      startTime: formatForInput(offer.startTime),
      endTime: formatForInput(offer.endTime),
      image: null
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Terminate this promotion?')) return;
    try {
      await api.delete(`/offers/${id}`);
      setOffers(o => o.filter(x => x._id !== id));
      toast.success('Promotion Terminated');
    } catch {
      toast.error('Termination Failed');
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto pb-20">
      <div className="mb-16">
        <p className="font-sans text-[10px] tracking-[0.6em] uppercase text-gold-500 mb-4 font-bold">Marketing Suite</p>
        <h1 className="font-display text-5xl text-white tracking-tight">Active<br /><span className="italic text-white/40 font-serif lowercase">Promotions</span></h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-start">
        {/* Creation Form */}
        <div className="xl:col-span-4 bg-white/[0.01] border border-white/[0.05] p-10 rounded-sm">
          <div className="flex items-center justify-between mb-10 pb-4 border-b border-white/[0.03]">
            <h3 className="font-display text-[11px] tracking-[0.4em] uppercase text-white/40">{editingOfferId ? 'Edit Campaign' : 'New Campaign Entry'}</h3>
            {editingOfferId && (
              <button onClick={cancelEdit} className="text-[10px] uppercase text-white/40 hover:text-white transition-colors">Cancel Edit</button>
            )}
          </div>
          <form onSubmit={handleSave} className="space-y-6">
            
            <div className="group">
              <label className="font-sans text-[9px] tracking-[0.3em] uppercase text-white/20 block mb-3 group-focus-within:text-gold-500 transition-colors">Campaign Title</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required className="w-full h-12 bg-white/[0.02] border border-white/5 focus:border-gold-500/40 rounded-sm px-4 text-xs text-white outline-none transition-all placeholder:text-white/5" placeholder="e.g. Festival Special" />
            </div>

            <div className="group">
              <label className="font-sans text-[9px] tracking-[0.3em] uppercase text-white/20 block mb-3 group-focus-within:text-gold-500 transition-colors">Target Product</label>
              
              <div className="flex gap-2 mb-3">
                <button type="button" onClick={() => setProductSelectMode('search')} className={`flex-1 py-1 text-[9px] uppercase tracking-[0.2em] border transition-all rounded-sm ${productSelectMode === 'search' ? 'border-gold-500/50 text-gold-500 bg-gold-500/10' : 'border-white/5 text-white/40 hover:bg-white/5'}`}>Search</button>
                <button type="button" onClick={() => setProductSelectMode('category')} className={`flex-1 py-1 text-[9px] uppercase tracking-[0.2em] border transition-all rounded-sm ${productSelectMode === 'category' ? 'border-gold-500/50 text-gold-500 bg-gold-500/10' : 'border-white/5 text-white/40 hover:bg-white/5'}`}>Category</button>
              </div>

              {productSelectMode === 'search' ? (
                <input 
                  type="text" 
                  placeholder="Search products by name..." 
                  value={productSearchTerm} 
                  onChange={e => setProductSearchTerm(e.target.value)}
                  className="w-full h-10 mb-2 bg-[#0a0a0a] border border-white/5 focus:border-gold-500/40 rounded-sm px-4 text-xs text-white outline-none transition-all" 
                />
              ) : (
                <select 
                  value={selectedCategory} 
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="w-full h-10 mb-2 bg-[#0a0a0a] border border-white/5 focus:border-gold-500/40 rounded-sm px-4 text-xs text-white outline-none transition-all"
                >
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              )}

              <select value={form.product} onChange={e => setForm(f => ({ ...f, product: e.target.value }))} required className="w-full h-12 bg-[#0a0a0a] border border-white/5 focus:border-gold-500/40 rounded-sm px-4 text-xs text-white outline-none transition-all placeholder:text-white/5 focus:ring-1 focus:ring-gold-500/20">
                <option value="">{filteredProducts.length === 0 ? 'No products found' : 'Select a Product'}</option>
                {filteredProducts.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <label className="font-sans text-[9px] tracking-[0.3em] uppercase text-white/20 block mb-3 group-focus-within:text-gold-500 transition-colors">Discount Type</label>
                <select value={form.discountType} onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))} className="w-full h-12 bg-[#0a0a0a] border border-white/5 focus:border-gold-500/40 rounded-sm px-4 text-xs text-white outline-none transition-all">
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Price (₹)</option>
                </select>
              </div>
              <div className="group">
                <label className="font-sans text-[9px] tracking-[0.3em] uppercase text-white/20 block mb-3 group-focus-within:text-gold-500 transition-colors">Yield Value</label>
                <input type="number" min="1" value={form.discountValue} onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))} required className="w-full h-12 bg-white/[0.02] border border-white/5 focus:border-gold-500/40 rounded-sm px-4 text-xs text-white outline-none transition-all placeholder:text-white/5" placeholder="e.g. 15 or 4999" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <label className="font-sans text-[9px] tracking-[0.3em] uppercase text-white/20 block mb-3 group-focus-within:text-gold-500 transition-colors">Start Time</label>
                <input type="datetime-local" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} required className="w-full h-12 bg-white/[0.02] border border-white/5 focus:border-gold-500/40 rounded-sm px-4 text-[10px] text-white/60 outline-none transition-all" />
              </div>
              <div className="group">
                <label className="font-sans text-[9px] tracking-[0.3em] uppercase text-white/20 block mb-3 group-focus-within:text-gold-500 transition-colors">End Time</label>
                <input type="datetime-local" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} required className="w-full h-12 bg-white/[0.02] border border-white/5 focus:border-gold-500/40 rounded-sm px-4 text-[10px] text-white/60 outline-none transition-all" />
              </div>
            </div>

            <div>
              <label className="font-sans text-[9px] tracking-[0.3em] uppercase text-white/20 block mb-3">Narrative</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required className="w-full h-24 bg-white/[0.02] border border-white/5 focus:border-gold-500/40 rounded-sm p-4 text-xs text-white outline-none transition-all placeholder:text-white/5 resize-none" placeholder="Promotional details..." />
            </div>

            <div className="group">
              <label className="font-sans text-[9px] tracking-[0.3em] uppercase text-white/20 block mb-3 group-focus-within:text-gold-500 transition-colors">Banner Asset (Optional)</label>
              <input type="file" ref={fileInputRef} onChange={e => setForm(f => ({ ...f, image: e.target.files[0] }))} accept="image/*" className="w-full h-12 pt-3 bg-white/[0.02] border border-white/5 focus:border-gold-500/40 rounded-sm px-4 text-[10px] text-white/40 outline-none transition-all file:mr-4 file:py-1 file:px-3 file:rounded-sm file:border-0 file:text-[9px] file:uppercase file:tracking-widest file:bg-white/5 file:text-white hover:file:bg-white/10 file:transition-colors" />
            </div>

            <button type="submit" disabled={saving} className="group relative w-full h-14 mt-4 bg-gold-500 text-black font-sans text-[10px] uppercase tracking-[0.3em] font-bold overflow-hidden transition-all active:scale-95">
               <span className="relative z-10">{saving ? 'Processing...' : (editingOfferId ? 'Update Campaign' : 'Deploy Campaign')}</span>
               <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
            </button>
          </form>
        </div>

        {/* Existing Offers */}
        <div className="xl:col-span-8 bg-white/[0.01] border border-white/[0.05] p-10 rounded-sm">
          <div className="flex items-center justify-between mb-10 pb-4 border-b border-white/[0.03]">
            <h3 className="font-display text-[11px] tracking-[0.4em] uppercase text-white/40">Active & Scheduled</h3>
            <span className="font-sans text-[9px] text-white/20 uppercase tracking-widest">{offers.length} Campaigns</span>
          </div>
          
          {loading ? (
             <div className="flex justify-center py-40"><div className="w-6 h-6 border-[1px] border-gold-500/20 border-t-gold-500 rounded-full animate-spin" /></div>
          ) : offers.length === 0 ? (
             <div className="text-center py-20 font-sans text-[10px] tracking-[0.3em] uppercase text-white/20 border border-white/[0.02] bg-white/[0.005]">
                No campaigns registered
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
              <AnimatePresence>
                {offers.map((offer, i) => {
                  const now = new Date();
                  const start = new Date(offer.startTime);
                  const end = new Date(offer.endTime);
                  
                  let status = 'Scheduled';
                  let statusColor = 'text-white/40 bg-white/[0.05] border-white/10';
                  
                  if (now > end) {
                    status = 'Expired';
                    statusColor = 'text-red-500/60 bg-red-900/10 border-red-900/40';
                  } else if (now >= start && now <= end) {
                    status = 'Live';
                    statusColor = 'text-green-500/80 bg-green-900/10 border-green-900/40 shadow-[0_0_15px_rgba(34,197,94,0.15)]';
                  }

                  return (
                    <motion.div 
                      key={offer._id} 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.05 }} 
                      className="group flex flex-col sm:flex-row items-center gap-6 p-6 bg-white/[0.015] border border-white/[0.03] hover:border-gold-500/20 transition-all duration-500"
                    >
                      {offer.image ? (
                        <div className="w-24 h-24 bg-white/5 rounded-sm overflow-hidden flex-shrink-0">
                          <img src={offer.image} alt="Offer" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ) : (
                        <div className="w-24 h-24 bg-white/[0.02] border border-white/5 rounded-sm flex items-center justify-center flex-shrink-0 text-white/10">
                          <span className="text-2xl">🏷️</span>
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-display text-lg text-gold-500 truncate">{offer.title}</p>
                          <span className={`font-sans text-[8px] px-2 py-0.5 border uppercase tracking-[0.2em] rounded-sm ${statusColor}`}>
                            {status}
                          </span>
                        </div>
                        <p className="font-sans text-[11px] text-white/50 truncate mb-1">Target: {offer.product?.name || 'Unknown'}</p>
                        <p className="font-sans text-[9px] uppercase tracking-[0.2em] text-white/30 mb-3">
                          Yield: <span className="text-gold-500/80">{offer.discountType === 'percentage' ? `${offer.discountValue}% OFF` : `₹${offer.discountValue.toLocaleString('en-IN')}`}</span>
                        </p>
                        
                        <div className="flex items-center gap-6 font-sans text-[8px] uppercase tracking-widest text-white/20">
                          <div className="flex items-center gap-2">
                             <span>Start:</span>
                             <span className="text-white/40">{start.toLocaleDateString()} {start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <span>End:</span>
                             <span className="text-white/40">{end.toLocaleDateString()} {end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(offer)} className="w-10 h-10 flex items-center justify-center border border-white/5 text-white/20 hover:text-blue-500 hover:border-blue-900/40 hover:bg-blue-900/10 transition-all flex-shrink-0 rounded-sm" title="Edit Campaign">
                          <span className="text-sm">✎</span>
                        </button>
                        <button onClick={() => handleDelete(offer._id)} className="w-10 h-10 flex items-center justify-center border border-white/5 text-white/20 hover:text-red-500 hover:border-red-900/40 hover:bg-red-900/10 transition-all flex-shrink-0 rounded-sm" title="Terminate Campaign">
                          <span className="text-xl">×</span>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
