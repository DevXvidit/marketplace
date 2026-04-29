// ─────────────────── RegisterPage ───────────────────
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../store/authSlice';
import { fetchWishlist } from '../store/cartSlice';
import toast from 'react-hot-toast';

export function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPw, setShowPw] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector(s => s.auth);

  useEffect(() => { if (user) navigate('/'); }, [user]);
  useEffect(() => { dispatch(clearError()); }, []);

  const validatePassword = (password) => {
    if (password.length < 8) return 'Password must be at least 8 characters long.';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter.';
    if (!/\d/.test(password)) return 'Password must contain at least one number.';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Password must contain at least one special character.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const passwordError = validatePassword(form.password);
    if (passwordError) {
      return toast.error(passwordError);
    }

    const r = await dispatch(registerUser(form));
    if (r.meta.requestStatus === 'fulfilled') {
      toast.success('Account created! Please log in to continue.');
      navigate('/login');
    } else {
      toast.error(r.payload || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-luxury-black pt-16 px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(212,175,55,0.08)_0%,_transparent_60%)]" />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md bg-luxury-dark/90 backdrop-blur-xl border border-luxury-border p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">✨</div>
          <h1 className="font-display text-2xl text-white">Create Account</h1>
          <p className="font-sans text-xs text-luxury-muted mt-1">Join the Akshar family</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            ['name', 'Full Name', 'text', 'Your full name'],
            ['email', 'Email Address', 'email', 'your@email.com'],
            ['phone', 'Phone Number', 'tel', '+91 XXXXX XXXXX'],
            ['password', 'Password', 'password', '••••••••'],
          ].map(([key, label, type, placeholder]) => (
            <div key={key}>
              <label className="font-sans text-[10px] tracking-widest uppercase text-luxury-muted block mb-2">{label}</label>
              {key === 'password' ? (
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    required
                    className="input-luxury w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    aria-label={showPw ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-luxury-muted hover:text-gold-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 rounded"
                  >
                    {showPw ? '🙈' : '👁️'}
                  </button>
                </div>
              ) : (
                <input
                  type={type}
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  required={key !== 'phone'}
                  className="input-luxury w-full"
                />
              )}
              {key === 'password' && (
                <div className="mt-3 grid grid-cols-2 gap-y-1.5 gap-x-2">
                  {[
                    { label: '8+ Characters', valid: form.password.length >= 8 },
                    { label: 'Uppercase', valid: /[A-Z]/.test(form.password) },
                    { label: 'Lowercase', valid: /[a-z]/.test(form.password) },
                    { label: 'Number', valid: /\d/.test(form.password) },
                    { label: 'Special Symbol', valid: /[!@#$%^&*(),.?":{}|<>]/.test(form.password) }
                  ].map((req, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className={`text-[9px] ${req.valid ? 'text-gold-500' : 'text-white/20'}`}>
                        {req.valid ? '✓' : '○'}
                      </span>
                      <span className={`text-[9px] font-sans uppercase tracking-wider ${req.valid ? 'text-gold-500/90' : 'text-white/40'}`}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {error && <p className="text-red-400 font-sans text-xs border border-red-900 bg-red-900/20 px-4 py-2 text-center">{error}</p>}
          <button type="submit" disabled={loading} className="btn-gold w-full">
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <p className="text-center font-sans text-xs text-luxury-muted mt-6">
          Already have an account? <Link to="/login" className="text-gold-500 hover:text-gold-400">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
}

// ─────────────────── ProfilePage ───────────────────

export function ProfilePage() {
  const { user } = useSelector(s => s.auth);
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changing, setChanging] = useState(false);

  const handlePassChange = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) return toast.error('Passwords do not match');
    setChanging(true);
    try {
      const { data } = await api.put('/auth/change-password', {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword
      });
      toast.success(data.message);
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="pt-32 min-h-screen max-w-4xl mx-auto px-4 pb-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Identity Suite */}
          <div className="space-y-8">
            <h1 className="font-display text-3xl text-white">Identity<br /><span className="italic text-gold-400 font-serif lowercase">Registry</span></h1>
            <div className="bg-luxury-card border border-luxury-border p-8 space-y-6">
              <div className="flex items-center gap-6 pb-6 border-b border-luxury-border">
                <div className="w-16 h-16 border-2 border-gold-500 flex items-center justify-center text-gold-500 font-display text-3xl">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h2 className="font-display text-2xl text-white">{user?.name}</h2>
                  <p className="font-sans text-xs text-luxury-muted uppercase tracking-widest">{user?.role} Profile</p>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  ['Full Name', user?.name],
                  ['Email Portal', user?.email],
                  ['Cellular Contact', user?.phone || 'No direct line'],
                  ['Loyalty Tenure', new Date(user?.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })]
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center group">
                    <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-luxury-muted group-hover:text-gold-500 transition-colors">{k}</span>
                    <span className="font-sans text-sm text-white/80">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Security Suite */}
          <div className="space-y-8">
            <h1 className="font-display text-3xl text-white">Security<br /><span className="italic text-gold-400 font-serif lowercase">Protocals</span></h1>
            <div className="bg-luxury-card border border-luxury-border p-8">
              <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-white/20 mb-8 border-b border-white/[0.03] pb-4">Update Cipher</p>
              <form onSubmit={handlePassChange} className="space-y-6">
                {[
                  ['currentPassword', 'Current Authentication', 'Password'],
                  ['newPassword', 'New Security Key', 'New Password'],
                  ['confirmPassword', 'Confirm Security Key', 'Confirm Password']
                ].map(([key, label, placeholder]) => (
                  <div key={key}>
                    <label className="font-sans text-[9px] tracking-[0.3em] uppercase text-luxury-muted block mb-3">{label}</label>
                    <input type="password" required value={passForm[key]}
                      onChange={e => setPassForm(f => ({ ...f, [key]: e.target.value }))}
                      className="input-luxury w-full bg-white/[0.02] border-white/10" placeholder={placeholder} />
                  </div>
                ))}
                <button type="submit" disabled={changing} className="btn-gold w-full h-14 tracking-[0.3em] text-[10px] mt-4">
                  {changing ? 'Synchronizing...' : 'Update Protocol'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─────────────────── WishlistPage ───────────────────
import api from '../services/api';
import ProductCard from '../components/jewelry/ProductCard';
import { toggleWishlistRemote } from '../store/cartSlice';
import { formatPrice, calculateJewelryPrice } from '../utils/helpers';

export function WishlistPage() {
  const dispatch = useDispatch();
  const { wishlist, wishlistLoading } = useSelector(s => s.cart);
  const rates = useSelector(s => s.rates);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const totalValue = wishlist.reduce((sum, p) => {
    const price = p.calculatedPrice || calculateJewelryPrice(p, rates);
    return sum + (price || 0);
  }, 0);

  const sparkles = ['✦', '✧', '⋆', '✦', '✧'];

  return (
    <div className="min-h-screen bg-luxury-black">
      {/* ── Hero Banner ── */}
      <div className="relative pt-24 pb-16 overflow-hidden">
        {/* Background radial */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,_rgba(212,175,55,0.07)_0%,_transparent_70%)]" />
        {/* Floating sparkles */}
        {sparkles.map((s, i) => (
          <motion.span
            key={i}
            className="absolute text-gold-500/20 font-sans select-none pointer-events-none"
            style={{
              top: `${15 + i * 14}%`,
              left: `${8 + i * 18}%`,
              fontSize: `${10 + i * 3}px`,
            }}
            animate={{ y: [0, -12, 0], opacity: [0.15, 0.5, 0.15] }}
            transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.6, ease: 'easeInOut' }}
          >
            {s}
          </motion.span>
        ))}
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <motion.p
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-sans text-[10px] tracking-[0.5em] uppercase text-gold-500 mb-3"
          >
            Your Curated Selection
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-5xl md:text-6xl text-white mb-4"
          >
            My <span className="italic text-gold-400 font-serif">Wishlist</span>
          </motion.h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-24 h-px bg-gold-gradient mx-auto mb-6"
          />
          {wishlist.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex items-center justify-center gap-8 mt-4"
            >
              <div className="text-center">
                <p className="font-display text-2xl text-gold-400">{wishlist.length}</p>
                <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-luxury-muted mt-1">
                  {wishlist.length === 1 ? 'Piece' : 'Pieces'} Saved
                </p>
              </div>
              <div className="w-px h-10 bg-luxury-border" />
              <div className="text-center">
                <p className="font-display text-2xl text-gold-400">{formatPrice(totalValue)}</p>
                <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-luxury-muted mt-1">
                  Combined Value
                </p>
              </div>
            </motion.div>
          )}
        </div>
        {/* Decorative bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-4 py-12 pb-24">
        {wishlistLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="relative w-12 h-12">
              <div className="w-12 h-12 border border-gold-500/20 rounded-full" />
              <div className="absolute inset-0 w-12 h-12 border-t-2 border-gold-500 rounded-full animate-spin" />
            </div>
            <p className="font-sans text-xs tracking-widest uppercase text-luxury-muted">Loading your collection...</p>
          </div>
        ) : wishlist.length === 0 ? (
          /* ── Empty State ── */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="text-8xl mb-8 select-none"
            >
              ♡
            </motion.div>
            <h2 className="font-display text-3xl text-white mb-3">Your wishlist is empty</h2>
            <p className="font-sans text-sm text-luxury-muted max-w-sm mb-10 leading-relaxed">
              Discover our curated collection of handcrafted pieces and save the ones that speak to your heart.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/shop" className="btn-gold">
                Explore Collection
              </Link>
              <Link to="/category/rings" className="btn-outline-gold">
                Browse Rings
              </Link>
            </div>
            {/* Decorative dots */}
            <div className="flex gap-2 mt-16">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 h-1 rounded-full bg-gold-500/30"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </motion.div>
        ) : (
          /* ── Wishlist Grid ── */
          <>
            {/* Toolbar */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-between mb-10"
            >
              <p className="font-sans text-xs tracking-[0.3em] uppercase text-luxury-muted">
                {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} in your wishlist
              </p>
              <Link
                to="/shop"
                className="group flex items-center gap-2 font-sans text-[10px] tracking-[0.25em] uppercase text-gold-500 hover:text-gold-300 transition-colors"
              >
                Continue Shopping
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </motion.div>

            <AnimatePresence mode="popLayout">
              <motion.div
                layout
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
              >
                {wishlist.map((p, i) => (
                  <motion.div
                    key={p._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.25 } }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                  >
                    <ProductCard product={p} index={i} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* CTA Banner */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="mt-20 relative overflow-hidden border border-luxury-border p-10 text-center"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,175,55,0.06)_0%,_transparent_70%)]" />
              <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold-500 mb-3 relative z-10">Ready to make it yours?</p>
              <h3 className="font-display text-3xl text-white mb-2 relative z-10">
                Turn Your Wishes Into <span className="italic text-gold-400 font-serif">Reality</span>
              </h3>
              <p className="font-sans text-sm text-luxury-muted mb-8 max-w-md mx-auto relative z-10">
                Each piece in your wishlist is crafted with 22K hallmarked gold, priced live at today's market rates.
              </p>
              <Link to="/shop" className="btn-gold relative z-10">
                View Full Collection
              </Link>
              {/* Corner decorations */}
              <span className="absolute top-4 left-4 text-gold-500/20 text-xl">✦</span>
              <span className="absolute top-4 right-4 text-gold-500/20 text-xl">✦</span>
              <span className="absolute bottom-4 left-4 text-gold-500/20 text-xl">✧</span>
              <span className="absolute bottom-4 right-4 text-gold-500/20 text-xl">✧</span>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────── CategoryPage ───────────────────
import { useParams } from 'react-router-dom';

// Categories where both Male and Female sub-tabs make sense
const UNISEX_CATEGORY_SLUGS = ['rings', 'chains', 'bracelets', 'pendants', 'earrings'];

const GENDER_TABS = [
  { value: 'all',    label: 'All'    },
  { value: 'male',   label: '♂ Male'   },
  { value: 'female', label: '♀ Female' },
];

export function CategoryPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [genderTab, setGenderTab] = useState('all');

  const isUnisex = UNISEX_CATEGORY_SLUGS.includes(slug);

  useEffect(() => {
    const load = async () => {
      try {
        const cats = await api.get('/categories');
        const cat = cats.data.data.find(c => c.slug === slug);
        if (cat) {
          setCategory(cat);
          const prods = await api.get(`/products?category=${cat._id}&limit=100`);
          setProducts(prods.data.data);
        }
      } catch {}
      setLoading(false);
    };
    load();
    setGenderTab('all'); // reset tab when navigating to a new category
  }, [slug]);

  // Client-side gender filter:
  // 'male' tab  → show male + unisex products
  // 'female' tab → show female + unisex products
  // 'all' tab   → show everything
  const displayed = isUnisex && genderTab !== 'all'
    ? products.filter(p => !p.gender || p.gender === genderTab || p.gender === 'unisex')
    : products;

  return (
    <div className="pt-24 min-h-screen">
      {/* Hero */}
      <div className="relative py-16 px-4 text-center border-b border-luxury-border bg-luxury-dark">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,175,55,0.05)_0%,_transparent_70%)]" />
        <p className="text-3xl mb-2">{category?.icon || '💍'}</p>
        <h1 className="font-display text-4xl text-white">{category?.name || slug}</h1>
        <p className="font-sans text-sm text-luxury-muted mt-2">Handpicked designs curated for you</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Gender Tabs — only for unisex-eligible categories */}
        {isUnisex && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex justify-center mb-10"
          >
            <div className="flex border border-luxury-border overflow-hidden">
              {GENDER_TABS.map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setGenderTab(tab.value)}
                  className={`px-8 py-3 font-sans text-xs tracking-widest uppercase transition-all duration-300 ${
                    genderTab === tab.value
                      ? 'bg-gold-500 text-luxury-black font-semibold'
                      : 'text-luxury-muted hover:text-white hover:bg-luxury-dark'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Product grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">💎</p>
            <p className="font-display text-2xl text-white/50 mb-2">No products found</p>
            <p className="font-sans text-sm text-luxury-muted">Try a different gender filter</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={genderTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            >
              {displayed.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

// ─────────────────── AboutPage ───────────────────
export function AboutPage() {
  return (
    <div className="pt-24 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-16">
          <p className="font-sans text-xs tracking-[0.4em] uppercase text-gold-500 mb-4">Our Story</p>
          <h1 className="font-display text-5xl text-white mb-6">Crafting Dreams<br /><span className="italic text-gold-400">Since 2012</span></h1>
          <div className="w-20 h-px bg-gold-500 mx-auto" />
        </motion.div>
        <div className="prose prose-invert max-w-none">
          <p className="font-serif text-lg text-white/60 leading-relaxed mb-6">
            Founded in the heart of Ahmedabad's jewelry district, Akshar Jewellers has been a symbol of trust, craftsmanship, and timeless beauty for four decades. Our master artisans bring generational knowledge to every piece we create.
          </p>
          <p className="font-serif text-lg text-white/60 leading-relaxed">
            We believe in radical transparency — every price on our platform is calculated in real-time using live gold and silver market rates. No hidden charges, no static markups. Just pure, honest jewelry pricing.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          {[['40+', 'Years of Heritage'], ['10,000+', 'Happy Customers'], ['100%', 'BIS Hallmarked'], ['Live', 'Pricing Engine']].map(([v, l]) => (
            <div key={l} className="text-center border border-luxury-border p-6">
              <p className="font-display text-3xl text-gold-400 mb-2">{v}</p>
              <p className="font-sans text-xs tracking-widest uppercase text-luxury-muted">{l}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
