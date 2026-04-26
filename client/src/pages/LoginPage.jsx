import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../store/authSlice';
import toast from 'react-hot-toast';

function GoldParticles() {
  const canvasRef = useRef();
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4 - 0.2,
      alpha: Math.random(),
      dAlpha: (Math.random() - 0.5) * 0.01,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        p.alpha += p.dAlpha;
        if (p.alpha <= 0 || p.alpha >= 1) p.dAlpha *= -1;
        if (p.y < 0) p.y = canvas.height;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,175,55,${p.alpha * 0.7})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector(s => s.auth);

  useEffect(() => { if (user) navigate(user.role === 'admin' ? '/admin' : '/'); }, [user]);
  useEffect(() => { dispatch(clearError()); }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser(form));
    if (result.meta.requestStatus === 'fulfilled') toast.success('Welcome back!');
    else toast.error(result.payload || 'Login failed');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-luxury-black pt-16">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,175,55,0.08)_0%,_transparent_70%)]" />
        <GoldParticles />
        {/* Grid */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(212,175,55,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Floating ring decoration */}
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="text-6xl text-center mb-8 block"
        >
          💍
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="bg-luxury-dark/90 backdrop-blur-xl border border-luxury-border p-8 shadow-2xl"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-8 h-8 border border-gold-500 flex items-center justify-center">
                <span className="text-gold-500 font-serif text-sm font-bold">A</span>
              </div>
              <span className="font-display text-base tracking-[0.3em] text-white uppercase">Akshar Jewellers</span>
            </Link>
            <h1 className="font-display text-2xl text-white">Welcome Back</h1>
            <p className="font-sans text-xs text-luxury-muted mt-1 tracking-wider">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="group">
              <label className="font-sans text-[10px] tracking-widest uppercase text-luxury-muted block mb-2">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="your@email.com"
                required
                className="input-luxury w-full"
              />
            </div>

            {/* Password */}
            <div>
              <label className="font-sans text-[10px] tracking-widest uppercase text-luxury-muted block mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                  className="input-luxury w-full pr-10"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-luxury-muted hover:text-gold-400 transition-colors">
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link to="/forgot-password" className="font-sans text-[10px] tracking-widest uppercase text-gold-500 hover:text-gold-400 transition-colors">
                Forgot Password?
              </Link>
            </div>

            {/* Error */}
            {error && (
              <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                className="text-red-400 font-sans text-xs text-center border border-red-900 bg-red-900/20 px-4 py-2">
                {error}
              </motion.p>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="btn-gold w-full flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-luxury-black border-t-transparent rounded-full inline-block" />
                  Signing In...
                </>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="font-sans text-xs text-luxury-muted">
              New to Akshar?{' '}
              <Link to="/register" className="text-gold-500 hover:text-gold-400 transition-colors">Create Account</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
