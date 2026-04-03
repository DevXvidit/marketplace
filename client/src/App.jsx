import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRates } from './store/ratesSlice';
import { fetchWishlist } from './store/cartSlice';

import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import TrendingPage from './pages/TrendingPage';
import ProductPage from './pages/ProductPage';
import LoginPage from './pages/LoginPage';
import RegisterPage, { ProfilePage, WishlistPage, CategoryPage, AboutPage } from './pages/OtherPages';
import { PrivacyPolicyPage, TermsOfServicePage } from './pages/LegalPages';
import FaqPage from './pages/FaqPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminCategories from './pages/admin/AdminCategories';
import AdminRates from './pages/admin/AdminRates';
import AdminUsers from './pages/admin/AdminUsers';
import AdminQA from './pages/admin/AdminQA';
import AdminOffers from './pages/admin/AdminOffers';
import AdminProfile from './pages/admin/AdminProfile';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 24,
    scale: 0.985,
    filter: 'blur(8px)',
    transition: { duration: 0.2 }
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }
  },
  exit: {
    opacity: 0,
    y: -12,
    scale: 1.01,
    filter: 'blur(6px)',
    transition: { duration: 0.35, ease: [0.4, 0, 0.6, 1] }
  }
};

const curtainVariants = {
  initial: { scaleY: 1, originY: 0 },
  animate: { scaleY: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
  exit: { scaleY: 1, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } }
};

const streakVariants = {
  initial: { opacity: 0, x: '-25%' },
  animate: { opacity: 0.35, x: '25%', transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, x: '45%', transition: { duration: 0.4, ease: [0.4, 0, 0.6, 1] } }
};

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ position: 'relative' }}
      >
        <motion.div
          variants={curtainVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{
            position: 'fixed',
            top: '-10vh',
            bottom: '-10vh',
            left: 0,
            right: 0,
            background: 'linear-gradient(180deg, rgba(6,6,6,0.98) 0%, rgba(16,16,16,0.98) 100%)',
            zIndex: 9999,
            pointerEvents: 'none'
          }}
        />
        <motion.div
          variants={streakVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{
            position: 'fixed',
            top: '-15vh',
            bottom: '-15vh',
            left: 0,
            right: 0,
            background: 'linear-gradient(110deg, rgba(212,175,55,0) 30%, rgba(212,175,55,0.35) 48%, rgba(255,240,180,0.55) 50%, rgba(212,175,55,0.35) 52%, rgba(212,175,55,0) 70%)',
            filter: 'blur(18px)',
            mixBlendMode: 'screen',
            zIndex: 10000,
            pointerEvents: 'none'
          }}
        />
        <Routes location={location}>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/trending" element={<TrendingPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-of-service" element={<TermsOfServicePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
          </Route>
          <Route path="/admin" element={<ProtectedRoute admin><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<AdminProductForm />} />
            <Route path="products/edit/:id" element={<AdminProductForm />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="rates" element={<AdminRates />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="questions" element={<AdminQA />} />
            <Route path="offers" element={<AdminOffers />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const dispatch = useDispatch();
  const token = useSelector(s => s.auth.token);

  useEffect(() => {
    dispatch(fetchRates());
    const interval = setInterval(() => dispatch(fetchRates()), 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    if (token) dispatch(fetchWishlist());
  }, [dispatch, token]);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ScrollToTop />
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1A1A1A', color: '#F5F5F0', border: '1px solid #2A2A2A' },
          success: { iconTheme: { primary: '#D4AF37', secondary: '#0A0A0A' } },
        }}
      />
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
