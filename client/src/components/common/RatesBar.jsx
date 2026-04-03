import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

export default function RatesBar() {
  const { goldRate22K, silverRate, loading, fetchedAt } = useSelector(s => s.rates);

  const items = [
    { label: 'Gold 24K', value: `₹${(goldRate22K * 24 / 22 || 0).toFixed(0)}/g` },
    { label: 'Gold 22K', value: `₹${goldRate22K || 0}/g` },
    { label: 'Gold 18K', value: `₹${(goldRate22K * 18 / 22 || 0).toFixed(0)}/g` },
    { label: 'Silver 925', value: `₹${silverRate || 0}/g` },
    { label: 'Live Rates', value: '✦ Updated Every 10 Min' },
    { label: 'Gold 24K', value: `₹${(goldRate22K * 24 / 22 || 0).toFixed(0)}/g` },
    { label: 'Gold 22K', value: `₹${goldRate22K || 0}/g` },
    { label: 'Gold 18K', value: `₹${(goldRate22K * 18 / 22 || 0).toFixed(0)}/g` },
    { label: 'Silver 925', value: `₹${silverRate || 0}/g` },
    { label: 'Live Rates', value: '✦ Updated Every 10 Min' },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-luxury-black border-b border-luxury-border overflow-hidden h-8">
      <div className="flex items-center h-full relative">
        <div className="absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-luxury-black to-transparent z-10" />
        <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-luxury-black to-transparent z-10" />

        <motion.div
          className="flex gap-0 whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        >
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 px-6">
              <span className="font-sans text-[10px] tracking-widest uppercase text-luxury-muted">{item.label}</span>
              <span className={`font-sans text-[11px] font-500 ${
                loading ? 'text-luxury-muted' : 'text-gold-500'
              }`}>{loading ? '—' : item.value}</span>
              <span className="text-luxury-border text-xs ml-2">|</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
