import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { useSelector } from 'react-redux';
import { formatPrice, calculateJewelryPrice } from '../../utils/helpers';
import toast from 'react-hot-toast';

const PURITIES = ['24K', '22K', '18K', '14K', '925', '999', 'other'];
const METALS = ['gold', 'silver', 'platinum', 'mixed'];
const GENDERS = [
  { value: 'unisex', label: 'Unisex / All' },
  { value: 'male',   label: 'Male / Men'   },
  { value: 'female', label: 'Female / Women' },
];

const InputField = ({ label, children, description }) => (
  <div className="space-y-3 group">
    <div className="flex items-center justify-between">
      <label className="font-sans text-[9px] tracking-[0.3em] uppercase text-white/20 group-focus-within:text-gold-500 transition-colors duration-500 font-bold">{label}</label>
      {description && <span className="font-sans text-[8px] text-white/10 uppercase tracking-widest">{description}</span>}
    </div>
    {children}
  </div>
);

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const rates = useSelector(s => s.rates);
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [existingMedia, setExistingMedia] = useState(null);
  const [removeMedia, setRemoveMedia] = useState(false);

  const [form, setForm] = useState({
    name: '', description: '', category: '', metalType: 'gold',
    purity: '22K', weightInGrams: '', makingChargePercent: '12',
    stonePrice: '0', stoneDetails: '', isFeatured: false,
    isTrending: false, isAvailable: true, stock: '1', tags: '',
    gender: 'unisex',
  });

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data.data)).catch(() => {});
    if (isEdit) {
      api.get(`/products/${id}`).then(r => {
        const p = r.data.data;
        setForm({
          name: p.name || '', description: p.description || '',
          category: p.category?._id || '', metalType: p.metalType || 'gold',
          purity: p.purity || '22K', weightInGrams: p.weightInGrams || '',
          makingChargePercent: p.makingChargePercent || '12',
          stonePrice: p.stonePrice || '0', stoneDetails: p.stoneDetails || '',
          isFeatured: p.isFeatured || false, isTrending: p.isTrending || false,
          isAvailable: p.isAvailable !== false, stock: p.stock || '1',
          tags: p.tags?.join(', ') || '',
          gender: p.gender || 'unisex',
        });
        setExistingImages(p.images || []);
        setExistingMedia(p.media || null);
        setRemoveMedia(false);
      }).catch(() => toast.error('Failed to load asset details'));
    }
  }, [id]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreviews(prev => [...prev, ev.target.result]);
      reader.readAsDataURL(f);
    });
  };

  const removeNewImage = (idx) => {
    setImageFiles(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const removeExistingImage = async (img) => {
    if (!confirm('Permanent removal? This cannot be undone.')) return;
    try {
      await api.delete(`/products/${id}/images/${encodeURIComponent(img.publicId)}`);
      setExistingImages(prev => prev.filter(i => i.publicId !== img.publicId));
      toast.success('Media Purged');
    } catch { toast.error('Removal sequence failed'); }
  };

  const handleMedia = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    const previewUrl = URL.createObjectURL(file);
    setMediaFile(file);
    setMediaPreview({ url: previewUrl, type: isVideo ? 'video' : 'image' });
    setRemoveMedia(false);
  };

  const clearMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setExistingMedia(null);
    setRemoveMedia(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      imageFiles.forEach(f => fd.append('images', f));
      if (mediaFile) fd.append('media', mediaFile);
      if (removeMedia) fd.append('removeMedia', 'true');

      if (isEdit) {
        await api.put(`/products/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Specifications Synchronized');
      } else {
        await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Asset Registered Successfully');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transaction failed');
    }
    setSaving(false);
  };

  const livePrice = form.weightInGrams ? calculateJewelryPrice({
    ...form,
    weightInGrams: Number(form.weightInGrams),
    makingChargePercent: Number(form.makingChargePercent),
    stonePrice: Number(form.stonePrice),
  }, rates) : 0;

  return (
    <div className="max-w-[1600px] mx-auto pb-40">
      <div className="mb-20 flex flex-col md:flex-row md:items-end md:justify-between gap-10">
        <div>
          <p className="font-sans text-[10px] tracking-[0.6em] uppercase text-gold-500 mb-4 font-bold">Asset Specifications</p>
          <h1 className="font-display text-5xl text-white tracking-tight leading-[0.9]">
            {isEdit ? 'Refine' : 'Register'}<br />
            <span className="italic text-white/40 font-serif lowercase">{isEdit ? 'Exquisite Piece' : 'New Creation'}</span>
          </h1>
        </div>
        
        {livePrice > 0 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-white/[0.01] border border-gold-500/20 px-10 py-6 rounded-sm backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-gold-500/40 group-hover:h-0 transition-all duration-700" />
            <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-white/20 mb-2">Projected Valuation</p>
            <p className="font-display text-4xl text-gold-500 tracking-tighter">{formatPrice(livePrice)}</p>
            <p className="font-sans text-[8px] text-white/10 uppercase tracking-[0.2em] mt-1 italic">Real-time appraisal logic applied</p>
          </motion.div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        {/* Primary Data Suite */}
        <div className="lg:col-span-8 space-y-16">
          <section className="bg-white/[0.01] border border-white/[0.05] p-12 rounded-sm">
            <h3 className="font-display text-[11px] tracking-[0.4em] uppercase text-white/40 mb-12 pb-4 border-b border-white/[0.03]">Essential Identity</h3>
            <div className="space-y-12">
              <InputField label="Identity Designation">
                <input value={form.name} onChange={e => set('name', e.target.value)} required className="w-full h-14 bg-white/[0.02] border border-white/5 focus:border-gold-500/40 rounded-sm px-6 text-[13px] text-white outline-none transition-all placeholder:text-white/5 font-display tracking-wide" placeholder="e.g. Maharani Solitaire Necklace" />
              </InputField>
              
              <InputField label="Narrative & Craftsmanship">
                <textarea value={form.description} onChange={e => set('description', e.target.value)} required rows={5}
                  className="w-full bg-white/[0.02] border border-white/5 focus:border-gold-500/40 rounded-sm p-6 text-[13px] text-white/80 outline-none transition-all placeholder:text-white/5 resize-none leading-relaxed" placeholder="Chronicle the heritage and intricate details of this masterpiece..." />
              </InputField>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <InputField label="Classification Portfolio">
                  <select value={form.category} onChange={e => set('category', e.target.value)} required className="w-full h-14 bg-white/[0.02] border border-white/5 focus:border-gold-500/40 rounded-sm px-6 text-[11px] text-white/80 outline-none transition-all appearance-none uppercase tracking-[0.2em] cursor-pointer">
                    <option value="" className="bg-[#0A0A0A]">Select Segment</option>
                    {categories.map(c => <option key={c._id} value={c._id} className="bg-[#0A0A0A]">{c.name}</option>)}
                  </select>
                </InputField>
                <InputField label="Demographic Intent">
                  <select value={form.gender} onChange={e => set('gender', e.target.value)} className="w-full h-14 bg-white/[0.02] border border-white/5 focus:border-gold-500/40 rounded-sm px-6 text-[11px] text-white/80 outline-none transition-all appearance-none uppercase tracking-[0.2em] cursor-pointer">
                    {GENDERS.map(g => <option key={g.value} value={g.value} className="bg-[#0A0A0A]">{g.label}</option>)}
                  </select>
                </InputField>
              </div>
              
              <InputField label="Strategic Meta Tags" description="Comma separated attributes">
                <input value={form.tags} onChange={e => set('tags', e.target.value)} className="w-full h-12 bg-white/[0.02] border border-white/5 focus:border-gold-500/40 rounded-sm px-6 text-[11px] text-white/60 outline-none transition-all placeholder:text-white/5 italic" placeholder="e.g. bridal, heirloom, limited, 2024" />
              </InputField>
            </div>
          </section>

          <section className="bg-white/[0.01] border border-white/[0.05] p-12 rounded-sm">
            <h3 className="font-display text-[11px] tracking-[0.4em] uppercase text-white/40 mb-12 pb-4 border-b border-white/[0.03]">Metallurgical Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
              <InputField label="Primary Element">
                <div className="flex gap-2">
                  {METALS.map(m => (
                    <button key={m} type="button" onClick={() => set('metalType', m)} className={`flex-1 h-12 border font-sans text-[9px] uppercase tracking-[0.2em] transition-all ${form.metalType === m ? 'border-gold-500 bg-gold-500/[0.05] text-gold-500' : 'border-white/5 text-white/20 hover:border-white/20'}`}>{m}</button>
                  ))}
                </div>
              </InputField>
              <InputField label="Purity Standard">
                <select value={form.purity} onChange={e => set('purity', e.target.value)} className="w-full h-12 bg-white/[0.02] border border-white/5 focus:border-gold-500/40 rounded-sm px-6 text-[11px] text-white/80 outline-none transition-all appearance-none tracking-[0.2em] cursor-pointer">
                  {PURITIES.map(p => <option key={p} value={p} className="bg-[#0A0A0A]">{p}</option>)}
                </select>
              </InputField>
              <InputField label="Net Mass (Grams)">
                <input type="number" step="0.001" min="0" value={form.weightInGrams} onChange={e => set('weightInGrams', e.target.value)} required className="w-full h-12 bg-white/[0.02] border border-white/5 focus:border-gold-500/40 rounded-sm px-6 text-[13px] text-white outline-none transition-all placeholder:text-white/5" placeholder="0.000" />
              </InputField>
              <InputField label="Artisanal Premium (%)" description="Labor & Making">
                <input type="number" step="0.1" min="0" max="100" value={form.makingChargePercent} onChange={e => set('makingChargePercent', e.target.value)} required className="w-full h-12 bg-white/[0.02] border border-white/5 focus:border-gold-500/40 rounded-sm px-6 text-[13px] text-white outline-none transition-all placeholder:text-white/5" placeholder="12.0" />
              </InputField>
              <InputField label="Gemstone Allocation (₹)">
                <input type="number" min="0" value={form.stonePrice} onChange={e => set('stonePrice', e.target.value)} className="w-full h-12 bg-white/[0.02] border border-white/5 focus:border-gold-500/40 rounded-sm px-6 text-[13px] text-white outline-none transition-all placeholder:text-white/5" placeholder="0" />
              </InputField>
              <InputField label="Inventory Quantun">
                <input type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)} required className="w-full h-12 bg-white/[0.02] border border-white/5 focus:border-gold-500/40 rounded-sm px-6 text-[13px] text-white outline-none transition-all placeholder:text-white/5" placeholder="1" />
              </InputField>
            </div>
            <div className="mt-12">
              <InputField label="Mineralogical Data">
                <input value={form.stoneDetails} onChange={e => set('stoneDetails', e.target.value)} className="w-full h-12 bg-white/[0.02] border border-white/5 focus:border-gold-500/40 rounded-sm px-6 text-[11px] text-white/60 outline-none transition-all placeholder:text-white/5 italic" placeholder="e.g. 1.25ct Brilliant Cut VVS-D Diamonds" />
              </InputField>
            </div>
          </section>
        </div>

        {/* Sidebar Protocol Suite */}
        <div className="lg:col-span-4 space-y-12">
          {/* Visual Assets */}
          <section className="bg-white/[0.01] border border-white/[0.05] p-10 rounded-sm">
            <h3 className="font-display text-[11px] tracking-[0.4em] uppercase text-white/40 mb-10 pb-4 border-b border-white/[0.03]">Visual Registry</h3>
            <label className="block border border-dashed border-white/10 hover:border-gold-500/40 p-10 text-center cursor-pointer transition-all duration-500 bg-white/[0.005]">
              <div className="flex flex-col items-center gap-4">
                {/* Icon Removed */}
                <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-white/20">Inject High-Res Imagery</p>
              </div>
              <input type="file" multiple accept="image/*" onChange={handleImages} className="hidden" />
            </label>

            {/* Media Canvas */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              {existingImages.map((img, i) => (
                <div key={i} className="relative aspect-square border border-white/5 group overflow-hidden">
                  <img src={img.url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" onClick={() => removeExistingImage(img)} className="w-10 h-10 flex items-center justify-center bg-red-500 text-white text-xl">×</button>
                  </div>
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 font-sans text-[7px] uppercase tracking-widest text-white/40 border border-white/5">Archived</div>
                </div>
              ))}
              {imagePreviews.map((src, i) => (
                <div key={i} className="relative aspect-square border border-gold-500/30 group overflow-hidden">
                  <img src={src} alt="" className="w-full h-full object-cover animate-pulse" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" onClick={() => removeNewImage(i)} className="w-10 h-10 flex items-center justify-center bg-white text-black text-xl">×</button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gold-500 text-[7px] text-black text-center py-1 font-sans uppercase tracking-[0.2em] font-bold">New Entry</div>
                </div>
              ))}
            </div>

            {/* Video / GIF */}
            <div className="mt-8 border-t border-white/[0.05] pt-8">
              <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-white/20 mb-4">Product Video / GIF (Optional)</p>
              <label className="block border border-dashed border-white/10 hover:border-gold-500/40 p-6 text-center cursor-pointer transition-all duration-500 bg-white/[0.005]">
                <div className="flex flex-col items-center gap-2">
                  <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-white/20">Upload One Video or GIF</p>
                  <p className="font-sans text-[8px] text-white/20 uppercase tracking-widest">MP4 / WebM / MOV or GIF</p>
                </div>
                <input type="file" accept="video/*,image/gif" onChange={handleMedia} className="hidden" />
              </label>

              {(mediaPreview || existingMedia) && (
                <div className="mt-4 relative aspect-video border border-white/5 overflow-hidden">
                  {mediaPreview ? (
                    mediaPreview.type === 'video' ? (
                      <video src={mediaPreview.url} className="w-full h-full object-cover" controls />
                    ) : (
                      <img src={mediaPreview.url} alt="Preview" className="w-full h-full object-cover" />
                    )
                  ) : (existingMedia?.resourceType === 'video' || /\/video\/upload\//i.test(existingMedia?.url || '') || /\.(mp4|webm|mov|mkv)(\?|$)/i.test(existingMedia?.url || '')) ? (
                    <video src={existingMedia.url} className="w-full h-full object-cover" controls />
                  ) : (
                    <img src={existingMedia?.url} alt="Existing media" className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" onClick={clearMedia} className="w-10 h-10 flex items-center justify-center bg-red-500 text-white text-xl">Ã—</button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Visibility Protocol */}
          <section className="bg-white/[0.01] border border-white/[0.05] p-10 rounded-sm space-y-8">
            <h3 className="font-display text-[11px] tracking-[0.4em] uppercase text-white/40 mb-2 pb-4 border-b border-white/[0.03]">Market Protocol</h3>
            {[['isFeatured', 'Featured'], ['isTrending', 'Trending'], ['isAvailable', 'Available']].map(([key, label]) => (
              <div key={key} className="flex items-center justify-between group">
                <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-white/40 group-hover:text-white/60 transition-colors">{label}</span>
                <button type="button" onClick={() => set(key, !form[key])}
                  className={`relative w-12 h-6 rounded-full transition-all duration-500 ${form[key] ? 'bg-gold-500 shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'bg-white/5'}`}>
                  <motion.div animate={{ x: form[key] ? 24 : 4 }} className={`absolute top-1 w-4 h-4 rounded-full ${form[key] ? 'bg-white shadow-xl' : 'bg-white/20'}`} />
                </button>
              </div>
            ))}
          </section>

          {/* Execute Transaction */}
          <div className="space-y-4 pt-10 border-t border-white/[0.03]">
             <button type="submit" disabled={saving} className="group relative w-full h-16 bg-gold-500 text-black font-sans text-[11px] uppercase tracking-[0.4em] font-bold overflow-hidden transition-all active:scale-[0.98]">
               <span className="relative z-10">{saving ? 'Synchronizing Pipeline...' : isEdit ? 'Commit Final Changes' : 'Initialize Asset Entry'}</span>
               <div className="absolute inset-0 bg-white/30 -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
            </button>
            <button type="button" onClick={() => navigate('/admin/products')} className="w-full h-14 border border-white/5 text-white/20 font-sans text-[9px] uppercase tracking-[0.4em] hover:text-white/40 hover:bg-white/[0.02] transition-all">
              Abort Sequence
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
