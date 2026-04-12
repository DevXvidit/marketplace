import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import { clearWishlist } from '../../store/cartSlice';
import toast from 'react-hot-toast';
import ajLogo from '../../assets/aj-logo.webp';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const { user } = useSelector(s => s.auth);
  const { items: cartItems } = useSelector(s => s.cart);
  const { wishlist } = useSelector(s => s.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearWishlist());
    setUserMenu(false);
    toast.success('Logged out');
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Collections' },
    { to: '/trending', label: 'Trending' },
    { to: '/category/rings', label: 'Rings' },
    { to: '/category/necklaces', label: 'Necklaces' },
    { to: '/category/bridal-sets', label: 'Bridal' },
    { to: '/about', label: 'About' },
  ];

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-8 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-luxury-black/95 backdrop-blur-md border-b border-luxury-border shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="brand-logo">
              <img src={ajLogo} alt="Akshar Jewellers logo" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-lg tracking-[0.28em] text-white uppercase">Akshar</span>
              <span className="font-sans text-[11px] tracking-[0.45em] text-gold-500 uppercase">Jewellers</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `font-sans text-xs tracking-widest uppercase transition-colors duration-300 relative group ${
                    isActive ? 'text-gold-500' : 'text-white/70 hover:text-white'
                  }`
                }
              >
                {label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-gold-500 transition-all duration-300 group-hover:w-full" />
              </NavLink>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <button
              onClick={() => navigate('/shop')}
              className="text-white/70 hover:text-gold-500 transition-colors focus-visible:ring-1 focus-visible:ring-gold-500 focus:outline-none rounded-sm p-1"
              aria-label="Search"
              title="Search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Wishlist */}
            {user && (
              <Link
                to="/wishlist"
                className="relative text-white/70 hover:text-gold-500 transition-colors group focus-visible:ring-1 focus-visible:ring-gold-500 focus:outline-none rounded-sm p-1"
                title="My Wishlist"
                aria-label="My Wishlist"
              >
                <motion.span
                  className="text-xl leading-none block"
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {wishlist.length > 0 ? '♥' : '♡'}
                </motion.span>
                {wishlist.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5 bg-gold-500 text-luxury-black font-sans text-[8px] font-bold rounded-full flex items-center justify-center leading-none"
                  >
                    {wishlist.length > 9 ? '9+' : wishlist.length}
                  </motion.span>
                )}
              </Link>
            )}

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenu(!userMenu)}
                  className="flex items-center gap-2 text-white/70 hover:text-white transition-colors focus-visible:ring-1 focus-visible:ring-gold-500 focus:outline-none rounded-sm p-1"
                  aria-label="User Menu"
                  title="User Menu"
                >
                  <div className="w-7 h-7 border border-gold-500 flex items-center justify-center text-gold-500 text-xs font-display">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                </button>
                <AnimatePresence>
                  {userMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-10 w-48 bg-luxury-card border border-luxury-border shadow-2xl"
                    >
                      <div className="px-4 py-3 border-b border-luxury-border">
                        <p className="text-xs font-sans text-gold-500 truncate">{user.name}</p>
                        <p className="text-xs text-luxury-muted truncate">{user.email}</p>
                      </div>
                      {user.role === 'admin' && (
                        <Link to="/admin" onClick={() => setUserMenu(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-xs font-sans text-gold-400 hover:bg-luxury-border transition-colors">
                          <span>⚙️</span> Admin Dashboard
                        </Link>
                      )}
                      <Link to="/profile" onClick={() => setUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs font-sans text-white/70 hover:text-white hover:bg-luxury-border transition-colors">
                        <span>👤</span> My Profile
                      </Link>
                      <Link to="/wishlist" onClick={() => setUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs font-sans text-white/70 hover:text-white hover:bg-luxury-border transition-colors">
                        <span>{wishlist.length > 0 ? '♥' : '♡'}</span> My Wishlist
                        {wishlist.length > 0 && (
                          <span className="ml-auto bg-gold-500/20 text-gold-400 text-[8px] px-1.5 py-0.5 rounded-full font-bold">
                            {wishlist.length}
                          </span>
                        )}
                      </Link>
                      <button onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-xs font-sans text-red-400 hover:bg-luxury-border transition-colors border-t border-luxury-border">
                        <span>→</span> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="btn-outline-gold text-[10px] px-4 py-2">Login</Link>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden text-white/70 hover:text-white transition-colors ml-2 focus-visible:ring-1 focus-visible:ring-gold-500 focus:outline-none rounded-sm p-1"
              aria-label="Toggle Menu"
              title="Toggle Menu"
            >
              <div className="w-5 flex flex-col gap-1.5">
                <span className={`h-px bg-current transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`h-px bg-current transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
                <span className={`h-px bg-current transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-luxury-border bg-luxury-black/98 overflow-hidden"
            >
              <nav className="py-4 flex flex-col gap-1">
                {navLinks.map(({ to, label }) => (
                  <NavLink key={to} to={to} onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `px-4 py-3 font-sans text-xs tracking-widest uppercase ${isActive ? 'text-gold-500' : 'text-white/70'}`
                    }>{label}</NavLink>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
