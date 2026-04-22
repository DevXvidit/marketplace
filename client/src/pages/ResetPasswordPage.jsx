import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';

export default function ResetPasswordPage() {
  const location = useLocation();
  const prefilledEmail = location.state?.email || '';
  const prefilledCode = location.state?.code || '';

  const [email, setEmail] = useState(prefilledEmail);
  const [code, setCode] = useState(prefilledCode);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) return setError('Password must be at least 6 characters.');
    if (newPassword !== confirmPassword) return setError('Passwords do not match.');

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, code, newPassword });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-luxury-black pt-16">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,175,55,0.08)_0%,_transparent_70%)]" />

      <div className="relative z-10 w-full max-w-md px-4">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="bg-luxury-dark/90 backdrop-blur-xl border border-luxury-border p-8 shadow-2xl"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center shadow-lg">
              <span className="text-2xl text-luxury-black">🛡️</span>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="font-display text-2xl text-white">Reset Password</h1>
            <p className="font-sans text-xs text-luxury-muted mt-1 tracking-wider">
              Enter your code and choose a new password
            </p>
          </div>

          {success ? (
            <div className="text-center">
              <div className="mb-6 p-5 border border-gold-700/40 bg-luxury-black/40">
                <p className="font-display text-xl text-white mb-1">Password Reset</p>
                <p className="font-sans text-xs text-luxury-muted">
                  You can now log in with your new password.
                </p>
              </div>
              <Link to="/login" className="btn-gold w-full flex items-center justify-center gap-2">
                Go to Login <span className="text-sm">→</span>
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 font-sans text-xs text-center border border-red-900 bg-red-900/20 px-4 py-2 mb-4"
                >
                  {error}
                </motion.p>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="font-sans text-[10px] tracking-widest uppercase text-luxury-muted block mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-luxury w-full"
                    placeholder="your@email.com"
                    required
                    id="reset-email"
                  />
                </div>

                <div>
                  <label className="font-sans text-[10px] tracking-widest uppercase text-luxury-muted block mb-2">6-Digit Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="input-luxury w-full font-mono tracking-[0.4em] text-center text-lg"
                    placeholder="000000"
                    maxLength={6}
                    required
                    id="reset-code"
                  />
                </div>

                <div>
                  <label className="font-sans text-[10px] tracking-widest uppercase text-luxury-muted block mb-2">New Password</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-luxury-muted text-sm">🔒</span>
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="input-luxury w-full pl-9 pr-9"
                      placeholder="Min. 6 characters"
                      required
                      id="reset-new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-luxury-muted hover:text-gold-400 focus-visible:ring-1 focus-visible:ring-gold-500 focus:outline-none rounded-sm"
                      aria-label={showPw ? "Hide password" : "Show password"}
                      title={showPw ? "Hide password" : "Show password"}
                    >
                      {showPw ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-sans text-[10px] tracking-widest uppercase text-luxury-muted block mb-2">Confirm New Password</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-luxury-muted text-sm">🔒</span>
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-luxury w-full pl-9"
                      placeholder="Repeat new password"
                      required
                      id="reset-confirm-password"
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-gold w-full flex items-center justify-center gap-2">
                  {loading ? (
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-luxury-black border-t-transparent rounded-full inline-block"
                    />
                  ) : (
                    <>
                      Reset Password <span className="text-sm">→</span>
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          <div className="mt-6 text-center">
            <Link to="/forgot-password" className="inline-flex items-center gap-1.5 text-xs text-luxury-muted hover:text-gold-400 transition-colors">
              <span>←</span> Back
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
