import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import toast from 'react-hot-toast';

const formatTime = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleString();
};

export default function ProductQA({ productId }) {
  const { user } = useSelector(s => s.auth);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [question, setQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${productId}/questions`)
      .then(r => setQuestions(r.data.data || []))
      .catch(() => toast.error('Failed to load questions'))
      .finally(() => setLoading(false));
  }, [productId]);

  const displayName = useMemo(() => (user?.name || name || 'Anonymous'), [user, name]);

  const questionColSpan = user ? 'md:col-span-5' : 'md:col-span-3';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed) return toast.error('Please enter a question');

    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      _id: tempId,
      name: displayName,
      question: trimmed,
      answer: '',
      isAnswered: false,
      createdAt: new Date().toISOString()
    };

    setSubmitting(true);
    setQuestions(q => [optimistic, ...q]);
    setQuestion('');

    try {
      const { data } = await api.post(`/products/${productId}/question`, {
        question: trimmed,
        name: user ? undefined : name.trim(),
      });
      setQuestions(q => q.map(item => item._id === tempId ? data.data : item));
      toast.success('Question submitted');
    } catch {
      setQuestions(q => q.filter(item => item._id !== tempId));
      toast.error('Failed to submit question');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-16 border-t border-luxury-border pt-10">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="font-sans text-[10px] tracking-widest uppercase text-gold-500 mb-1">Customer Questions & Answers</p>
          <h2 className="font-display text-2xl text-white">Ask about this piece</h2>
        </div>
        <span className="font-sans text-xs text-luxury-muted">{questions.length} questions</span>
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-8">
          <textarea
            className="input-luxury md:col-span-5 min-h-[120px]"
            placeholder="Ask a question about size, purity, making..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button
            type="submit"
            disabled={submitting}
            className="btn-gold md:col-span-1 h-[120px]"
          >
            {submitting ? 'Sending...' : 'Submit'}
          </button>
        </form>
      ) : (
        <div className="bg-luxury-card border border-luxury-border p-8 text-center mb-8">
          <p className="font-serif text-lg text-white mb-4">Have a question about this piece?</p>
          <Link to="/login" className="btn-gold inline-block px-8">Login to Ask a Question</Link>
          <p className="font-sans text-[10px] uppercase tracking-widest text-luxury-muted mt-4">
            Members get real-time replies from our master jewelers
          </p>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          <div className="skeleton h-20" />
          <div className="skeleton h-20" />
        </div>
      ) : questions.length === 0 ? (
        <div className="border border-luxury-border bg-luxury-dark p-6 text-center">
          <p className="font-sans text-sm text-luxury-muted">No questions yet. Be the first to ask.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <div key={q._id} className="border border-luxury-border bg-luxury-dark p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="font-sans text-sm text-white">{q.name || 'Anonymous'}</p>
                <span className={`font-sans text-[10px] uppercase tracking-wider px-2 py-0.5 border ${
                  q.isAnswered ? 'border-gold-700 text-gold-400 bg-gold-500/10' : 'border-luxury-border text-luxury-muted'
                }`}>
                  {q.isAnswered ? 'Answered' : 'Pending'}
                </span>
              </div>
              <p className="font-sans text-sm text-white/80">{q.question}</p>
              <p className="font-sans text-[10px] text-luxury-muted mt-2">{formatTime(q.createdAt)}</p>

              {q.answer && (
                <div className="mt-4 border-t border-luxury-border pt-4">
                  <p className="font-sans text-[10px] uppercase tracking-wider text-gold-500 mb-1">Admin Reply</p>
                  <p className="font-sans text-sm text-white/90">{q.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
