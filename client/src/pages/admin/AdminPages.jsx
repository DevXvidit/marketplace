// ═══════════════ AdminCategories ═══════════════
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';

export function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', description: '', icon: '💍' });
  const [saving, setSaving] = useState(false);
  const ICONS = ['💍', '📿', '⛓️', '🔮', '✨', '👰', '🏆', '⭐', '💎', '🌟'];

  const load = async () => {
    try { const { data } = await api.get('/categories'); setCategories(data.data); } catch {}
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true);
    try { 
      await api.post('/categories', form); 
      toast.success('Classification Created'); 
      setForm({ name: '', description: '', icon: '💍' }); 
      load(); 
    } catch (err) { 
      toast.error(err.response?.data?.message || 'Failed'); 
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Declassify this category?')) return;
    try { 
      await api.delete(`/categories/${id}`); 
      setCategories(c => c.filter(x => x._id !== id)); 
      toast.success('Removed'); 
    } catch { 
      toast.error('Failed'); 
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto pb-20">
      <div className="mb-16">
        <p className="font-sans text-[10px] tracking-[0.6em] uppercase text-gold-500 mb-4 font-bold">Taxonomy Management</p>
        <h1 className="font-display text-5xl text-white tracking-tight">Classification<br /><span className="italic text-white/40 font-serif lowercase">Center</span></h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Creation Suite */}
        <div className="lg:col-span-4 bg-white/[0.01] border border-white/[0.05] p-10 rounded-sm">
          <h3 className="font-display text-[11px] tracking-[0.4em] uppercase text-white/40 mb-10 pb-4 border-b border-white/[0.03]">New Entry</h3>
          <form onSubmit={handleCreate} className="space-y-8">
            <div className="group">
              <label className="font-sans text-[9px] tracking-[0.3em] uppercase text-white/20 block mb-3 group-focus-within:text-gold-500 transition-colors">Identity Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="w-full h-12 bg-white/[0.02] border border-white/5 focus:border-gold-500/40 rounded-sm px-4 text-xs text-white outline-none transition-all placeholder:text-white/5" placeholder="e.g. Royal Necklaces" />
            </div>
            <div>
              <label className="font-sans text-[9px] tracking-[0.3em] uppercase text-white/20 block mb-3">Narrative</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full min-h-[100px] bg-white/[0.02] border border-white/5 focus:border-gold-500/40 rounded-sm p-4 text-xs text-white outline-none transition-all placeholder:text-white/5 resize-none" placeholder="Contextual details..." />
            </div>
            {/* Glyph Designation Suite Removed */}
            <button type="submit" disabled={saving} className="group relative w-full h-14 bg-gold-500 text-black font-sans text-[10px] uppercase tracking-[0.3em] font-bold overflow-hidden transition-all active:scale-95">
               <span className="relative z-10">{saving ? 'Processing...' : 'Deploy Classification'}</span>
               <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
            </button>
          </form>
        </div>

        {/* Registry Repository */}
        <div className="lg:col-span-8 bg-white/[0.01] border border-white/[0.05] p-10 rounded-sm">
          <div className="flex items-center justify-between mb-10 pb-4 border-b border-white/[0.03]">
            <h3 className="font-display text-[11px] tracking-[0.4em] uppercase text-white/40">Active Classifications</h3>
            <span className="font-sans text-[9px] text-white/20 uppercase tracking-widest">{categories.length} Registers</span>
          </div>
          
          {loading ? (
             <div className="flex justify-center py-20"><div className="w-6 h-6 border-[1px] border-gold-500/20 border-t-gold-500 rounded-full animate-spin" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {categories.map((cat, i) => (
                  <motion.div 
                    key={cat._id} 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }} 
                    className="flex items-center justify-between p-6 bg-white/[0.015] border border-white/[0.03] hover:border-gold-500/20 group transition-all duration-500"
                  >
                    <div className="flex items-center gap-6">
                      {/* Glyph Removed */}
                      <div className="w-1 h-8 bg-gold-500/20" />
                      <div>
                        <p className="font-display text-base text-white/80 group-hover:text-white transition-colors">{cat.name}</p>
                        <p className="font-sans text-[8px] text-white/10 uppercase tracking-[0.2em] mt-1">{cat.slug}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(cat._id)} className="w-8 h-8 flex items-center justify-center text-white/10 hover:text-red-500 hover:bg-red-900/10 transition-all rounded-sm opacity-0 group-hover:opacity-100">×</button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════ AdminRates ═══════════════
export function AdminRates() {
  const [rates, setRates] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [manual, setManual] = useState({ goldRate: '', silverRate: '' });
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try { const { data } = await api.get('/rates'); setRates(data.data); setHistory(data.history || []); } catch {}
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleManualSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await api.post('/rates/manual', manual); toast.success('Overriden Successfully'); load(); }
    catch { toast.error('Command Failed'); }
    setSaving(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try { await api.post('/rates/refresh'); toast.success('Synchronized with Global Market'); load(); }
    catch { toast.error('Sync Failed'); }
    setRefreshing(false);
  };

  return (
    <div className="max-w-[1600px] mx-auto pb-20">
      <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-10">
        <div>
          <p className="font-sans text-[10px] tracking-[0.6em] uppercase text-gold-500 mb-4 font-bold">Valuation Exchange</p>
          <h1 className="font-display text-5xl text-white tracking-tight">Market<br /><span className="italic text-white/40 font-serif lowercase">Hub</span></h1>
        </div>
        <button onClick={handleRefresh} disabled={refreshing} className="h-14 px-10 border border-gold-500/30 text-gold-500 font-sans text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-gold-500/5 transition-all flex items-center gap-4">
          {refreshing ? <div className="w-3 h-3 border border-gold-500/20 border-t-gold-500 rounded-full animate-spin" /> : null}
          {refreshing ? 'Synchronizing...' : 'Pull Market Data'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
        <div className="bg-white/[0.01] border border-white/[0.05] p-10 rounded-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gold-500/20" />
          <h3 className="font-display text-[11px] tracking-[0.4em] uppercase text-white/40 mb-10 pb-4 border-b border-white/[0.03]">Active Appraisals</h3>
          {loading ? (
             <div className="flex justify-center py-20"><div className="w-6 h-6 border-[1px] border-gold-500/20 border-t-gold-500 rounded-full animate-spin" /></div>
          ) : rates && (
            <div className="space-y-4">
              {[
                ['Gold 24K', rates.goldRate24K, '99.9% Purity (Fine Gold)'], 
                ['Gold 22K', rates.goldRate22K || rates.goldRate, 'Standard Jewelry Purity'], 
                ['Gold 18K', rates.goldRate18K, 'Luxury Composition'], 
                ['Silver', rates.silverRate, '92.5 Fine Sterling']
              ].map(([name, val, desc]) => (
                <div key={name} className="flex items-center justify-between py-6 border-b border-white/[0.03] last:border-b-0 group">
                  <div>
                    <p className="font-sans text-xs text-white/60 group-hover:text-gold-500 transition-colors duration-500">{name}</p>
                    <p className="font-sans text-[9px] text-white/10 uppercase tracking-widest mt-1.5">{desc}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-4xl text-white tracking-tighter">₹{val?.toLocaleString('en-IN') || '—'}</p>
                    <p className="font-sans text-[8px] text-white/10 uppercase tracking-[0.3em] mt-1">per unit gram</p>
                  </div>
                </div>
              ))}
              <div className="mt-10 p-6 bg-white/[0.01] border border-white/[0.02] flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-1 h-1 rounded-full bg-gold-500 animate-pulse" />
                    <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-white/20">Source Strategy: <span className="text-white/40">{rates.source}</span></span>
                 </div>
                 <span className="font-sans text-[8px] uppercase tracking-widest text-white/10">{rates.fetchedAt && new Date(rates.fetchedAt).toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white/[0.01] border border-white/[0.05] p-10 rounded-sm">
          <h3 className="font-display text-[11px] tracking-[0.4em] uppercase text-white/40 mb-2">Manual Override</h3>
          <p className="font-sans text-[9px] tracking-widest uppercase text-white/10 mb-10">Temporary strategic valuation control</p>
          <form onSubmit={handleManualSave} className="space-y-10">
            <div className="group">
              <label className="font-sans text-[9px] tracking-[0.3em] uppercase text-white/20 block mb-3 group-focus-within:text-gold-500 transition-colors">Gold 22K Allocation (₹/g)</label>
              <input type="number" step="1" min="1" value={manual.goldRate} onChange={e => setManual(f => ({ ...f, goldRate: e.target.value }))} required className="w-full h-12 bg-white/[0.02] border border-white/5 focus:border-gold-500/40 rounded-sm px-4 text-xs text-white outline-none transition-all placeholder:text-white/5" placeholder="e.g. 7250" />
            </div>
            <div className="group">
              <label className="font-sans text-[9px] tracking-[0.3em] uppercase text-white/20 block mb-3 group-focus-within:text-gold-500 transition-colors">Silver Allocation (₹/g)</label>
              <input type="number" step="0.1" min="1" value={manual.silverRate} onChange={e => setManual(f => ({ ...f, silverRate: e.target.value }))} required className="w-full h-12 bg-white/[0.02] border border-white/5 focus:border-gold-500/40 rounded-sm px-4 text-xs text-white outline-none transition-all placeholder:text-white/5" placeholder="e.g. 95.0" />
            </div>
            <div className="p-4 bg-gold-500/[0.03] border border-gold-500/10 text-[9px] font-sans text-gold-500/60 uppercase tracking-widest leading-relaxed">
              ⚠️ Strategic override will automatically dissolve after 24 hours in favor of global market averages.
            </div>
            <button type="submit" disabled={saving} className="group relative w-full h-14 bg-white/[0.02] border border-white/10 text-white/60 font-sans text-[10px] uppercase tracking-[0.3em] font-bold overflow-hidden transition-all hover:border-gold-500/40 hover:text-gold-500">
               <span className="relative z-10">{saving ? 'Committing...' : 'Commit Strategic Rates'}</span>
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white/[0.01] border border-white/[0.05] p-10 rounded-sm">
        <h3 className="font-display text-[11px] tracking-[0.4em] uppercase text-white/40 mb-10 pb-4 border-b border-white/[0.03]">Audit Trail</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.03] bg-white/[0.005]">
                {['Log Timeline', 'Gold 22K', 'Gold 24K', 'Silver', 'Protocol'].map(h => (
                   <th key={h} className="px-8 py-5 text-left font-sans text-[9px] tracking-[0.3em] uppercase text-white/10 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {history.slice(0, 10).map((r, i) => (
                <tr key={r._id} className="group hover:bg-white/[0.015] transition-colors duration-500">
                  <td className="px-8 py-5 font-sans text-[10px] text-white/30 group-hover:text-white/60 whitespace-nowrap transition-colors">{new Date(r.fetchedAt || r.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                  <td className="px-8 py-5 font-display text-base text-gold-500/80 group-hover:text-gold-500 transition-colors">₹{(r.goldRate22K || r.goldRate)?.toLocaleString('en-IN')}</td>
                  <td className="px-8 py-5 font-sans text-[11px] text-white/40">₹{r.goldRate24K?.toLocaleString('en-IN') || '—'}</td>
                  <td className="px-8 py-5 font-sans text-[11px] text-white/40">₹{r.silverRate}</td>
                  <td className="px-8 py-5">
                    <span className={`font-sans text-[8px] px-3 py-1 border uppercase tracking-[0.2em] ${r.isManualOverride ? 'border-gold-500/40 text-gold-500 bg-gold-500/[0.05]' : 'border-white/5 text-white/20'}`}>
                      {r.source}
                    </span>
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                 <tr><td colSpan={5} className="px-8 py-16 text-center font-display text-[10px] uppercase tracking-[0.4em] text-white/10">No archived history logs found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ═══════════════ AdminUsers ═══════════════
export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    api.get('/admin/users').then(r => { setUsers(r.data.data); setLoading(false); }).catch(() => setLoading(false)); 
  }, []);

  const toggleStatus = async (id) => {
    try { 
      const { data } = await api.put(`/admin/users/${id}/toggle`); 
      setUsers(u => u.map(x => x._id === id ? data.data : x)); 
      toast.success('Clearance Updated'); 
    } catch { 
      toast.error('Command Terminated'); 
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto pb-20">
      <div className="mb-16">
        <p className="font-sans text-[10px] tracking-[0.6em] uppercase text-gold-500 mb-4 font-bold">Access Registry</p>
        <h1 className="font-display text-5xl text-white tracking-tight">Client<br /><span className="italic text-white/40 font-serif lowercase">Portfolio</span></h1>
        <p className="font-sans text-[9px] text-white/20 uppercase tracking-widest mt-6">{users.length} Authorized Entities</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-40"><div className="w-6 h-6 border-[1px] border-gold-500/20 border-t-gold-500 rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-white/[0.01] border border-white/[0.05] rounded-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.03] bg-white/[0.005]">
                  {['Entity', 'Coordinates', 'Clearance', 'Registration', 'Protocol', 'Operations'].map(h => (
                    <th key={h} className="px-8 py-5 text-left font-sans text-[9px] tracking-[0.3em] uppercase text-white/10 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {users.map((u, i) => (
                  <motion.tr 
                    key={u._id} 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ delay: i * 0.04 }} 
                    className="group hover:bg-white/[0.015] transition-colors duration-500"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 border border-white/5 bg-white/[0.02] flex items-center justify-center text-white/40 font-display text-sm group-hover:border-gold-500/40 group-hover:text-gold-500 transition-all">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-display text-[13px] text-white/80 group-hover:text-white transition-colors">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <p className="font-sans text-xs text-white/40">{u.email}</p>
                        <p className="font-sans text-[10px] text-white/10">{u.phone || '—'}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className={`font-sans text-[9px] px-3 py-1 border uppercase tracking-[0.2em] ${u.role === 'admin' ? 'border-gold-500/40 text-gold-500 bg-gold-500/[0.05]' : 'border-white/5 text-white/20'}`}>
                          {u.role}
                       </span>
                    </td>
                    <td className="px-8 py-6 font-sans text-[11px] text-white/20">
                       {new Date(u.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-3">
                          <div className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-500/50'}`} />
                          <span className={`font-sans text-[9px] uppercase tracking-[0.2em] ${u.isActive ? 'text-white/60' : 'text-white/20'}`}>
                             {u.isActive ? 'Active' : 'Archived'}
                          </span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                      {u.role !== 'admin' && (
                        <button 
                          onClick={() => toggleStatus(u._id)} 
                          className={`font-sans text-[8px] tracking-[0.3em] uppercase border px-4 h-8 transition-all ${u.isActive ? 'border-red-900/40 text-red-500/60 hover:bg-red-900/10 hover:text-red-500' : 'border-green-900/40 text-green-500/60 hover:bg-green-900/10 hover:text-green-500'}`}
                        >
                          {u.isActive ? 'Suspend' : 'Reinstate'}
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCategories;
