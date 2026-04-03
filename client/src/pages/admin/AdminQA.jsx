import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import socket from '../../services/socket';
import { calculateJewelryPrice, formatPrice } from '../../utils/helpers';
import toast from 'react-hot-toast';

const placeholderImg = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400';

export default function AdminQA() {
  const [mode, setMode] = useState('product'); // 'product' | 'general'
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({ status: 'all', productId: '', search: '' });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();

  const rates = useSelector(s => s.rates);
  const questionIdFromUrl = searchParams.get('questionId');
  const modeFromUrl = searchParams.get('mode');
  const isGeneral = mode === 'general';

  useEffect(() => {
    api.get('/products?limit=200&sort=name')
      .then(r => setProducts(r.data.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (modeFromUrl === 'general' && mode !== 'general') {
      setMode('general');
    }
    if (modeFromUrl === 'product' && mode !== 'product') {
      setMode('product');
    }
  }, [modeFromUrl, mode]);

  useEffect(() => {
    setSelected(null);
    setReply('');
    setPage(1);
    if (!modeFromUrl && !questionIdFromUrl) {
      setSearchParams({});
    }
    setFilters(f => ({ ...f, productId: '' }));
  }, [mode, modeFromUrl, questionIdFromUrl, setSearchParams]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.status !== 'all') params.set('status', filters.status);
        if (!isGeneral && filters.productId) params.set('productId', filters.productId);
        if (filters.search) params.set('search', filters.search);
        params.set('page', page);
        params.set('limit', 12);

        const endpoint = isGeneral ? '/admin/general-questions' : '/admin/questions';
        const { data } = await api.get(`${endpoint}?${params.toString()}`);
        const rows = data.data || [];
        setQuestions(isGeneral ? rows.map(q => ({ question: q })) : rows);
        setPages(data.pages || 1);
      } catch {
        toast.error('Registry sync failed');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filters, page, isGeneral]);

  useEffect(() => {
    if (!questionIdFromUrl) return;
    const endpoint = isGeneral ? '/admin/general-questions' : '/admin/questions';
    api.get(`${endpoint}/${questionIdFromUrl}`)
      .then(r => {
        const payload = isGeneral ? { question: r.data.data } : r.data.data;
        setSelected(payload);
        setReply(payload.question.answer || '');
      })
      .catch(() => {});
  }, [questionIdFromUrl, isGeneral]);

  useEffect(() => {
    const onNewQuestion = (payload) => {
      if (isGeneral) return;
      const matchesStatus = filters.status !== 'answered';
      const matchesProduct = !filters.productId || payload.productId === filters.productId;
      if (!matchesStatus || !matchesProduct) return;
      setQuestions(q => [{
        product: { _id: payload.productId, name: payload.productName, images: [] },
        question: payload.question
      }, ...q]);
    };

    const onAnswered = (payload) => {
      if (isGeneral) return;
      setQuestions(q => q.map(item => item.question._id === payload.question._id
        ? { ...item, question: payload.question }
        : item
      ));
      if (selected?.question?._id === payload.question._id) {
        setSelected(s => ({ ...s, question: payload.question }));
      }
    };

    socket.on('question:new', onNewQuestion);
    socket.on('question:answered', onAnswered);
    return () => {
      socket.off('question:new', onNewQuestion);
      socket.off('question:answered', onAnswered);
    };
  }, [filters.status, filters.productId, selected, isGeneral]);

  useEffect(() => {
    const onGeneralNew = (payload) => {
      if (!isGeneral) return;
      const matchesStatus = filters.status !== 'answered';
      if (!matchesStatus) return;
      setQuestions(q => [{ question: payload.question }, ...q]);
    };

    const onGeneralAnswered = (payload) => {
      if (!isGeneral) return;
      setQuestions(q => q.map(item => item.question._id === payload.question._id
        ? { ...item, question: payload.question }
        : item
      ));
      if (selected?.question?._id === payload.question._id) {
        setSelected(s => ({ ...s, question: payload.question }));
      }
    };

    socket.on('general-question:new', onGeneralNew);
    socket.on('general-question:answered', onGeneralAnswered);
    return () => {
      socket.off('general-question:new', onGeneralNew);
      socket.off('general-question:answered', onGeneralAnswered);
    };
  }, [filters.status, selected, isGeneral]);

  const handleSelect = (item) => {
    setSelected(item);
    setReply(item.question.answer || '');
    setSearchParams(item.question?._id ? { questionId: item.question._id } : {});
  };

  const handleReply = async () => {
    if (!selected) return;
    const trimmed = reply.trim();
    if (!trimmed) return toast.error('Communication remains empty');

    setSubmitting(true);
    try {
      if (isGeneral) {
        const { data } = await api.put(`/admin/general-questions/${selected.question._id}`, { answer: trimmed });
        setSelected(s => ({ ...s, question: data.data }));
        setQuestions(q => q.map(item => item.question._id === data.data._id
          ? { ...item, question: data.data }
          : item
        ));
      } else {
        const { data } = await api.put(`/products/${selected.product._id}/question/${selected.question._id}`, {
          answer: trimmed
        });
        setSelected(s => ({ ...s, question: data.data }));
        setQuestions(q => q.map(item => item.question._id === data.data._id
          ? { ...item, question: data.data }
          : item
        ));
      }
      toast.success('Protocol Transmitted');
    } catch {
      toast.error('Transmission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedPrice = selected?.product ? calculateJewelryPrice(selected.product, rates) : 0;

  return (
    <div className="max-w-[1600px] mx-auto pb-20">
      <div className="mb-16">
        <p className="font-sans text-[10px] tracking-[0.6em] uppercase text-gold-500 mb-4 font-bold">Client Communication</p>
        <h1 className="font-display text-5xl text-white tracking-tight leading-[0.9]">Inquiry<br /><span className="italic text-white/40 font-serif lowercase">Registry</span></h1>
        <p className="font-sans text-[9px] text-white/20 uppercase tracking-widest mt-6">Concierge Dialogue Management</p>
        <div className="flex items-center gap-3 mt-8">
          <button
            onClick={() => setMode('product')}
            className={`px-4 h-9 border text-[9px] uppercase tracking-[0.2em] transition-all ${
              mode === 'product' ? 'border-gold-500 text-gold-500 bg-gold-500/10' : 'border-white/10 text-white/30 hover:text-white/60 hover:border-white/30'
            }`}
          >
            Product Q&A
          </button>
          <button
            onClick={() => setMode('general')}
            className={`px-4 h-9 border text-[9px] uppercase tracking-[0.2em] transition-all ${
              mode === 'general' ? 'border-gold-500 text-gold-500 bg-gold-500/10' : 'border-white/10 text-white/30 hover:text-white/60 hover:border-white/30'
            }`}
          >
            General Q&A
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Selection Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white/[0.01] border border-white/[0.05] p-6 rounded-sm">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-6">
                 <input
                  className="w-full h-12 bg-white/[0.02] border border-white/5 focus:border-gold-500/40 rounded-sm px-6 text-[11px] text-white outline-none transition-all placeholder:text-white/10 italic"
                  placeholder="Filter by keyword or entity..."
                  value={filters.search}
                  onChange={(e) => { setPage(1); setFilters(f => ({ ...f, search: e.target.value })); }}
                />
              </div>
              <div className="md:col-span-3">
                <select
                  className="w-full h-12 bg-white/[0.02] border border-white/5 focus:border-gold-500/40 rounded-sm px-6 text-[9px] text-white/40 uppercase tracking-[0.2em] outline-none cursor-pointer appearance-none"
                  value={filters.status}
                  onChange={(e) => { setPage(1); setFilters(f => ({ ...f, status: e.target.value })); }}
                >
                  <option value="all" className="bg-[#0A0A0A]">All Protocals</option>
                  <option value="answered" className="bg-[#0A0A0A]">Answered</option>
                  <option value="unanswered" className="bg-[#0A0A0A]">Pending</option>
                </select>
              </div>
              {!isGeneral && (
                <div className="md:col-span-3">
                  <select
                    className="w-full h-12 bg-white/[0.02] border border-white/5 focus:border-gold-500/40 rounded-sm px-4 text-[9px] text-white/40 uppercase tracking-[0.1em] outline-none cursor-pointer truncate appearance-none"
                    value={filters.productId}
                    onChange={(e) => { setPage(1); setFilters(f => ({ ...f, productId: e.target.value })); }}
                  >
                    <option value="" className="bg-[#0A0A0A]">All Products</option>
                    {products.map(p => (
                      <option key={p._id} value={p._id} className="bg-[#0A0A0A]">{p.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-20"><div className="w-6 h-6 border-[1px] border-gold-500/20 border-t-gold-500 rounded-full animate-spin" /></div>
            ) : questions.length === 0 ? (
              <div className="bg-white/[0.01] border border-white/5 p-20 text-center rounded-sm">
                <p className="font-display text-[11px] uppercase tracking-[0.4em] text-white/10">No inquiries archived</p>
              </div>
            ) : (
              <AnimatePresence>
                {questions.map((item, i) => {
                  const img = item.product?.images?.[0]?.url || placeholderImg;
                  const isActive = selected?.question?._id === item.question._id;
                  const label = isGeneral ? 'General Inquiry' : item.product?.name;
                  return (
                    <motion.button
                      key={item.question._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => handleSelect(item)}
                      className={`w-full text-left group transition-all duration-700 h-28 flex overflow-hidden border ${
                        isActive ? 'bg-white/[0.03] border-gold-500/40 shadow-[0_0_30px_rgba(212,175,55,0.05)]' : 'bg-white/[0.01] border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="w-2 z-10 relative bg-gold-500/10 flex-shrink-0">
                        {isActive && <div className="absolute top-0 right-0 w-1 h-full bg-gold-500" />}
                      </div>
                      <div className="flex-1 p-6 flex flex-col justify-center">
                        <div className="flex items-center justify-between mb-2">
                           <p className={`font-sans text-[8px] uppercase tracking-[0.2em] ${isActive ? 'text-gold-500' : 'text-white/20'}`}>Ref: {label}</p>
                           <span className={`font-sans text-[7px] uppercase tracking-widest px-2 py-0.5 border ${
                              item.question.isAnswered ? 'border-gold-500/20 text-gold-500' : 'border-white/10 text-white/20'
                           }`}>
                              {item.question.isAnswered ? 'Resolved' : 'Pending'}
                           </span>
                        </div>
                        <p className="font-display text-[13px] text-white/80 group-hover:text-white transition-colors truncate">{item.question.question}</p>
                        <div className="mt-2 flex items-center justify-between">
                           <p className="font-sans text-[8px] text-white/10 uppercase tracking-widest italic">{item.question.name} · {new Date(item.question.createdAt).toLocaleDateString('en-IN')}</p>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            )}
          </div>

          <div className="flex items-center justify-between pt-8 border-t border-white/[0.03]">
            <button
              className="px-6 h-10 border border-white/5 text-[9px] uppercase tracking-widest text-white/20 hover:text-white/60 hover:border-white/20 transition-all disabled:opacity-0"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Previous Set
            </button>
            <span className="font-sans text-[9px] uppercase tracking-[0.4em] text-white/10">Segment {page} of {pages}</span>
            <button
              className="px-6 h-10 border border-white/5 text-[9px] uppercase tracking-widest text-white/20 hover:text-white/60 hover:border-white/20 transition-all disabled:opacity-0"
              onClick={() => setPage(p => Math.min(pages, p + 1))}
              disabled={page >= pages}
            >
              Next Set
            </button>
          </div>
        </div>

        {/* Response Suire Column */}
        <div className="lg:col-span-5 border-l border-white/[0.03] pl-10 h-[calc(100vh-250px)] sticky top-10">
          <AnimatePresence mode="wait">
            {!selected ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center opacity-20"
              >
                {/* Glyph Removed */}
                <p className="font-display text-[11px] uppercase tracking-[0.4em] max-w-[200px] leading-loose">Select a dialogue to initialize concierge intervention</p>
              </motion.div>
            ) : (
              <motion.div
                key={selected.question._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-10"
              >
                <div className="flex items-center gap-6 pb-6 border-b border-white/[0.03]">
                  <div className="w-1 h-20 bg-gold-500/20" />
                  <div>
                    <p className="font-sans text-[8px] text-gold-500 uppercase tracking-[0.3em] font-bold mb-2">
                      {isGeneral ? 'General Inquiry' : 'Target Asset'}
                    </p>
                    <p className="font-display text-base text-white/90 leading-tight mb-2">
                      {isGeneral ? 'Store Question' : selected.product.name}
                    </p>
                    {!isGeneral && (
                      <p className="font-sans text-[9px] text-white/20 uppercase tracking-widest italic">{formatPrice(selectedPrice)} MSRP</p>
                    )}
                    {isGeneral && (
                      <p className="font-sans text-[9px] text-white/20 uppercase tracking-widest italic">
                        {selected.question.name || 'Anonymous'} {selected.question.phone ? `Â· ${selected.question.phone}` : ''}
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-white/[0.015] border-l-2 border-gold-500 block p-8 rounded-sm relative">
                  {/* Glyph Removed */}
                  <p className="font-display text-[15px] text-white/90 leading-relaxed relative z-10 italic">{selected.question.question}</p>
                  <div className="mt-8 flex items-center justify-between border-t border-white/[0.03] pt-4">
                     <p className="font-sans text-[8px] uppercase tracking-widest text-white/20">{selected.question.name}</p>
                     <p className="font-sans text-[8px] uppercase tracking-widest text-white/20">{new Date(selected.question.createdAt).toLocaleString('en-IN', { timeStyle: 'short', dateStyle: 'medium' })}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="font-sans text-[8px] text-gold-500 uppercase tracking-[0.3em] font-bold">Refined Response</p>
                    {selected.question.isAnswered && <span className="text-[10px] text-green-500/40 font-sans tracking-widest align-middle">✓ TRANSMITTED</span>}
                  </div>
                  <textarea
                    className="w-full min-h-[180px] bg-white/[0.02] border border-white/5 focus:border-gold-500/40 rounded-sm p-8 text-[13px] text-white/80 outline-none transition-all placeholder:text-white/5 leading-relaxed resize-none"
                    placeholder="Compose a sophisticated reply..."
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                  />
                </div>
                
                <button
                  onClick={handleReply}
                  disabled={submitting}
                  className="group relative w-full h-16 bg-white/[0.02] border border-white/10 text-gold-500/60 font-sans text-[10px] uppercase tracking-[0.4em] font-bold overflow-hidden transition-all hover:bg-gold-500 hover:text-black hover:border-gold-500 active:scale-[0.98]"
                >
                  <span className="relative z-10">{submitting ? 'Transmitting Protocol...' : 'Finalize & Dispatch Reply'}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
