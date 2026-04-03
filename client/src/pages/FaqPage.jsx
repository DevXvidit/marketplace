import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import { Link } from 'react-router-dom';

const FAQS = [
  {
    q: 'Do you guarantee purity and hallmarking?',
    a: 'Yes. Our gold is BIS hallmarked and diamonds are sourced with quality certifications. Purity and weight are verified in-store for complete transparency.'
  },
  {
    q: 'What is your return or exchange policy?',
    a: 'Returns or exchanges are evaluated in-store based on product condition and category. Please visit our store with your invoice so our team can assist you.'
  },
  {
    q: 'Can I request a custom design?',
    a: 'Absolutely. You can share references or ideas in-store, and our artisans will guide you through design, material selection, and final approvals.'
  },
  {
    q: 'How are prices calculated?',
    a: 'Prices are based on live gold and silver market rates, metal purity, weight, and craftsmanship. Final pricing is confirmed in-store.'
  },
  {
    q: 'Do you provide certificates with jewelry?',
    a: 'Yes. We provide relevant purity and gemstone documentation for applicable pieces.'
  },
  {
    q: 'Do you resize rings or adjust sizes?',
    a: 'Yes. Ring resizing and fit adjustments are available in-store, subject to design feasibility.'
  },
  {
    q: 'Can I bring my old gold for exchange?',
    a: 'We evaluate old gold in-store and share the rate and deductions clearly before any exchange.'
  },
  {
    q: 'How long does a custom order take?',
    a: 'Timelines vary by design complexity. Our team will share an estimated completion window at the time of order.'
  },
  {
    q: 'Do you offer cleaning or polishing services?',
    a: 'Yes. We provide cleaning and polishing support in-store to keep your jewelry looking its best.'
  }
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [form, setForm] = useState({ question: '' });
  const [submitting, setSubmitting] = useState(false);
  const { user, token } = useSelector(s => s.auth);

  useEffect(() => {
    const load = async () => {
      setLoadingQuestions(true);
      try {
        const { data } = await api.get('/questions?limit=20');
        setQuestions(data.data || []);
      } catch {
        toast.error('Unable to load questions');
      } finally {
        setLoadingQuestions(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return toast.error('Please log in to ask a question');
    const trimmed = form.question.trim();
    if (!trimmed) return toast.error('Please enter a question');

    setSubmitting(true);
    try {
      const { data } = await api.post('/questions', {
        question: trimmed,
      });
      setQuestions(q => [data.data, ...q]);
      setForm({ question: '' });
      toast.success('Question submitted');
    } catch {
      toast.error('Submission failed');
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="pt-24 min-h-screen bg-luxury-black">
      <div className="relative py-16 border-b border-luxury-border bg-luxury-dark">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,175,55,0.05)_0%,_transparent_70%)]" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold-500 mb-3">Support</p>
          <h1 className="font-display text-4xl md:text-5xl text-white">Frequently Asked Questions</h1>
          <p className="font-sans text-xs text-luxury-muted mt-3">
            Purity, returns, customization, and pricing â€” answered clearly.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-14 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 gap-6"
        >
          {FAQS.map((f, i) => (
            <motion.button
              type="button"
              key={f.q}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
              className="w-full text-left border border-luxury-border bg-luxury-card/60 p-6 md:p-7 hover:border-gold-500/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-6">
                <h3 className="font-display text-xl text-white">{f.q}</h3>
                <span className="text-gold-500 text-xl leading-none">{openIndex === i ? '−' : '+'}</span>
              </div>
              <AnimatePresence initial={false}>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="font-serif text-base text-white/60 leading-relaxed mt-4">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </motion.div>

        <motion.div
          id="ask-question"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-14 border border-luxury-border p-8 bg-[#0B0B0B]"
        >
          <div className="flex items-start justify-between gap-6 mb-6">
            <div>
              <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold-500 mb-3">Customer Questions & Answers</p>
              <h3 className="font-display text-2xl text-white mb-2">Ask about any product or price</h3>
              <p className="font-sans text-sm text-white/50 max-w-xl">
                Ask about size, purity, making charges, customization, or live rates. Our team will respond soon.
              </p>
            </div>
            <div className="text-right text-white/40 text-xs">
              {questions.length} questions
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-9">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="input-luxury flex items-center justify-between text-white/70">
                  <span className="text-[11px] uppercase tracking-widest text-white/30">Your Name</span>
                  <span className="text-sm">{user?.name || 'Guest'}</span>
                </div>
                <div className="input-luxury flex items-center justify-between text-white/70">
                  <span className="text-[11px] uppercase tracking-widest text-white/30">Phone</span>
                  <span className="text-sm">{user?.phone || 'Not added'}</span>
                </div>
              </div>
              <textarea
                value={form.question}
                onChange={(e) => setForm(f => ({ ...f, question: e.target.value }))}
                placeholder={token ? "Ask a question about size, purity, making..." : "Please log in to ask a question"}
                disabled={!token}
                className="w-full min-h-[120px] bg-white/[0.02] border border-luxury-border focus:border-gold-500/40 rounded-sm p-5 text-sm text-white/80 outline-none transition-all placeholder:text-white/20 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
            <div className="lg:col-span-3">
              <button
                type="submit"
                disabled={submitting || !token}
                className="btn-gold w-full h-full min-h-[120px] text-[10px] tracking-[0.4em] uppercase"
              >
                {!token ? 'Login First' : (submitting ? 'Submitting...' : 'Submit')}
              </button>
              {!token && (
                <div className="mt-3 text-center">
                  <Link to="/login" className="text-[10px] uppercase tracking-widest text-gold-500 hover:text-gold-400">
                    Login required to submit
                  </Link>
                </div>
              )}
            </div>
          </form>

          <div className="mt-8 border border-luxury-border bg-luxury-card/40 p-6">
            {loadingQuestions ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : questions.length === 0 ? (
              <p className="font-sans text-sm text-white/40 text-center">No questions yet. Be the first to ask.</p>
            ) : (
              <div className="space-y-6">
                {questions.map((q) => (
                  <div key={q._id} className="border-b border-white/5 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-display text-lg text-white/90">{q.question}</p>
                      <span className={`text-[9px] uppercase tracking-widest ${q.isAnswered ? 'text-gold-500' : 'text-white/30'}`}>
                        {q.isAnswered ? 'Answered' : 'Pending'}
                      </span>
                    </div>
                    <p className="font-sans text-[10px] text-white/30 uppercase tracking-widest mt-2">
                      {(q.name || 'Anonymous')} â€¢ {new Date(q.createdAt).toLocaleDateString('en-IN')}
                    </p>
                    {q.isAnswered ? (
                      <p className="font-serif text-sm text-white/60 mt-3 leading-relaxed">{q.answer}</p>
                    ) : (
                      <p className="font-sans text-xs text-white/30 mt-3">Awaiting response from our team.</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-14 border border-luxury-border p-8 text-center bg-[#0B0B0B]"
        >
          <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold-500 mb-3">Need Help</p>
          <h3 className="font-display text-2xl text-white mb-3">Visit Our Store</h3>
          <p className="font-sans text-sm text-white/50 max-w-xl mx-auto mb-6">
            For precise quotes, custom work, and purity verification, our experts are available in-store.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-white/60">
            <span className="font-sans text-[11px] tracking-widest uppercase">Mon to Sat: 10AM to 8PM</span>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-gold-500/40" />
            <span className="font-sans text-[11px] tracking-widest uppercase">+91 8320750853</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
