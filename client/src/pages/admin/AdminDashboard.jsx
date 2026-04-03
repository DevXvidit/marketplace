import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { formatPrice } from '../../utils/helpers';

function StatCard({ label, value, icon, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className="relative group p-8 bg-white/[0.01] border border-white/[0.04] overflow-hidden hover:border-gold-500/30 transition-all duration-700"
    >
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
         {/* Icon Removed */}
      </div>
      <div className="relative z-10">
        <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-white/30 mb-4 group-hover:text-gold-500/60 transition-colors">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="font-display text-4xl text-white group-hover:text-gold-400 transition-colors duration-500">{value}</p>
          <div className="w-1 h-1 rounded-full bg-gold-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
      {/* Subtle Glimmer */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(r => { setStats(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-40">
      <div className="w-6 h-6 border-[1px] border-gold-500/20 border-t-gold-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Header Suite */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <p className="font-sans text-[10px] tracking-[0.6em] uppercase text-gold-500 mb-4 font-bold">System Overview</p>
          <h1 className="font-display text-5xl text-white tracking-tight">Executive<br /><span className="italic text-white/40 font-serif">Dashboard</span></h1>
        </motion.div>
        
        {/* Live Rates Mini-Hub */}
        {stats?.rates && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="flex items-center gap-10 bg-white/[0.02] border border-white/[0.05] p-6 pr-10 rounded-sm"
          >
            <div className="flex flex-col gap-1 border-r border-white/5 pr-8">
              <span className="font-sans text-[8px] tracking-widest uppercase text-white/20">Market Sync</span>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="font-sans text-[10px] font-bold text-green-500 uppercase">Live</span>
              </div>
            </div>
            
            <div className="flex gap-12">
              {[
                { label: 'Gold 24K', value: stats.rates.goldRate24K },
                { label: 'Silver', value: stats.rates.silverRate },
              ].map((r) => (
                <div key={r.label} className="flex flex-col">
                  <span className="font-sans text-[9px] uppercase tracking-widest text-white/30 mb-1">{r.label}</span>
                  <span className="font-display text-xl text-gold-500 tracking-tight">₹{r.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Primary Intelligence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
        <StatCard label="Inventory Vault" value={stats?.totalProducts || 0} icon="⬡" delay={0.1} />
        <StatCard label="Client Base" value={stats?.totalUsers || 0} icon="◈" delay={0.2} />
        <StatCard label="Collections" value={stats?.totalCategories || 0} icon="▽" delay={0.3} />
        <StatCard label="Featured Assets" value={stats?.featuredProducts || 0} icon="✦" delay={0.4} />
      </div>

      {/* Action Command Center */}
      <div className="mb-24">
        <p className="font-display text-[10px] uppercase tracking-[0.4em] text-white/20 mb-8 ml-1">Command Center</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            ['Register Asset', '/admin/products/new', '＋'],
            ['Audit Inventory', '/admin/products', '❒'],
            ['Catalog Suite', '/admin/categories', '☰'],
            ['Pricing Strategy', '/admin/rates', '📈'],
          ].map(([label, to, icon], i) => (
            <Link key={label} to={to}
              className="group relative h-24 bg-white/[0.01] border border-white/[0.04] p-6 flex flex-col justify-center transition-all duration-500 hover:bg-gold-500/[0.02] hover:border-gold-500/20 text-center">
              <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-white/50 group-hover:text-white transition-colors">{label}</span>
              <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-gold-500 transition-all duration-700 group-hover:w-full" />
            </Link>
          ))}
        </div>
      </div>

      {/* Asset Manifest Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-center justify-between mb-8 px-1">
          <h2 className="font-display text-[10px] uppercase tracking-[0.4em] text-white/30">Recent Manifests</h2>
          <Link to="/admin/products" className="group flex items-center gap-3">
             <span className="font-sans text-[9px] tracking-widest uppercase text-white/40 group-hover:text-gold-500 transition-colors">Full Report</span>
             <div className="w-8 h-[1px] bg-white/10 group-hover:w-12 group-hover:bg-gold-500 transition-all" />
          </Link>
        </div>

        <div className="bg-white/[0.01] border border-white/[0.04] rounded-sm overflow-hidden backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.03] bg-white/[0.01]">
                  {['Asset', 'Identity', 'Classification', 'Purity', 'Mass', 'Controls'].map(h => (
                    <th key={h} className="px-8 py-5 text-left font-sans text-[9px] tracking-[0.3em] uppercase text-white/20 font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {(stats?.latestProducts || []).map((p, i) => (
                  <motion.tr key={p._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 + i * 0.05 }}
                    className="group hover:bg-white/[0.02] transition-colors duration-500"
                  >
                    <td className="px-8 py-6">
                      {(() => {
                        const img = p.images?.[0]?.url || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200';
                        return (
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 border border-white/10 bg-white/[0.02] overflow-hidden">
                              <img
                                src={img}
                                alt={p.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>
                            {!p.images?.length && (
                              <div className="font-sans text-[8px] uppercase tracking-widest text-white/20">No Media</div>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-display text-sm text-white/80 group-hover:text-white transition-colors">{p.name}</p>
                      <p className="font-sans text-[9px] text-white/20 uppercase tracking-widest mt-1">ID: {p._id.slice(-6).toUpperCase()}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-sans text-[10px] text-white/40 uppercase tracking-widest">{p.category?.name}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex h-6 px-3 items-center font-sans text-[9px] border uppercase tracking-[0.2em] ${
                        p.metalType === 'gold' ? 'border-gold-500/30 text-gold-500 bg-gold-500/[0.05]' : 'border-white/10 text-white/40 bg-white/5'
                      }`}>{p.metalType}</span>
                    </td>
                    <td className="px-8 py-6 text-white/60 font-sans text-xs">{p.weightInGrams}g</td>
                    <td className="px-8 py-6">
                      <Link to={`/admin/products/edit/${p._id}`}
                        className="inline-flex h-8 px-4 items-center justify-center font-sans text-[9px] tracking-[0.3em] uppercase text-gold-500/60 hover:text-gold-500 border border-gold-500/20 hover:border-gold-500 transition-all bg-white/5">
                        Manage
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
