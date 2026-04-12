import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import socket from '../../services/socket';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: '', end: true },
  { to: '/admin/products', label: 'Products', icon: '' },
  { to: '/admin/categories', label: 'Categories', icon: '' },
  { to: '/admin/rates', label: 'Metal Rates', icon: '' },
  { to: '/admin/users', label: 'Users', icon: '' },
  { to: '/admin/questions', label: 'Q&A / Questions', icon: '', end: false },
  { to: '/admin/offers', label: 'Offers', icon: '' },
  { to: '/admin/profile', label: 'Profile', icon: '' },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);

  const handleLogout = () => { dispatch(logout()); navigate('/'); };

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/admin/notifications?limit=10');
        setNotifications(data.data || []);
        setUnreadCount(data.unreadCount || 0);
      } catch {}
    };
    load();
  }, []);

  useEffect(() => {
    const onNew = (notif) => {
      setNotifications(n => [notif, ...n].slice(0, 10));
      setUnreadCount(c => c + 1);
    };
    socket.on('notification:new', onNew);
    return () => socket.off('notification:new', onNew);
  }, []);

  const markRead = async (id) => {
    try {
      await api.put(`/admin/notifications/${id}/read`);
      setNotifications(n => n.map(x => x._id === id ? { ...x, isRead: true } : x));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch {}
  };

  return (
    <div className="flex min-h-screen bg-[#050505] selection:bg-gold-500/30">
      {/* Sidebar - Glassmorphic Pillar */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 260 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 h-full bg-black/60 backdrop-blur-2xl border-r border-white/[0.03] z-50 flex flex-col overflow-hidden"
      >
        {/* Modern Logo Area */}
        <div className="h-24 flex items-center justify-between px-6 border-b border-white/[0.03] flex-shrink-0">
          {!collapsed && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-sm bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center p-[1px]">
                <div className="w-full h-full bg-black flex items-center justify-center">
                  <span className="text-gold-500 font-display text-xs font-bold leading-none">A</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-display text-[11px] tracking-[0.3em] text-white uppercase leading-none mb-1">Elite</span>
                <span className="font-sans text-[9px] tracking-[0.2em] text-gold-500 uppercase leading-none opacity-80">Management</span>
              </div>
            </motion.div>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)} 
            className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-gold-500 transition-all ml-auto hover:bg-white/5 rounded-full focus-visible:ring-1 focus-visible:ring-gold-500 focus:outline-none"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={collapsed ? "M13 5l7 7-7 7" : "M11 19l-7-7 7-7"} />
            </svg>
          </button>
        </div>

        {/* Navigation - Polished Links */}
        <nav className="flex-1 py-10 overflow-y-auto px-4 min-h-0 flex flex-col gap-6">
          <div className="space-y-2">
            {navItems.map(({ to, label, icon, end }) => (
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) =>
                  `group relative flex items-center gap-4 px-4 py-4 rounded-lg transition-all duration-500 whitespace-nowrap overflow-hidden ${
                    isActive
                      ? 'bg-gold-500/[0.08] text-gold-500'
                      : 'text-white/40 hover:text-white/80 hover:bg-white/[0.02]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {icon && <span className="text-xl flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">{icon}</span>}
                    {!collapsed && (
                      <motion.span 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        className="font-sans text-[10px] uppercase tracking-[0.2em] font-medium"
                      >
                        {label}
                      </motion.span>
                    )}
                    {/* Active Indicator Glimmer */}
                    {isActive && (
                      <motion.div layoutId="nav-glow" className="absolute left-0 w-1 h-1/2 bg-gold-500 rounded-full" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* User Suite - directly under the menu */}
          <div className="border-t border-white/[0.03] p-6 bg-white/[0.01]">
            {!collapsed && (
              <div className="mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gold-500/20 to-transparent border border-white/10 flex items-center justify-center">
                  <span className="text-white/60 text-xs font-display">{user?.name?.charAt(0)}</span>
                </div>
                <div className="overflow-hidden">
                  <p className="font-sans text-[11px] font-bold text-white truncate tracking-wide">{user?.name}</p>
                  <p className="font-sans text-[9px] text-white/30 truncate tracking-tight">{user?.email}</p>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-3">
              <NavLink
                to="/admin/profile"
                className="flex-1 h-10 flex items-center justify-center gap-2 rounded-lg border border-white/[0.06] text-white/50 hover:text-white hover:border-gold-500/30 hover:bg-white/[0.02] transition-all text-[9px] font-sans uppercase tracking-[0.2em] w-full"
              >
                {!collapsed && <span>Profile & Password</span>}
              </NavLink>
              <button onClick={handleLogout} className="flex-1 h-10 flex items-center justify-center gap-2 rounded-lg border border-red-900/30 text-red-500/60 hover:bg-red-900/10 hover:text-red-500 transition-all text-[9px] font-sans uppercase tracking-[0.2em] w-full">
                {!collapsed && <span>Exit Dashboard</span>}
              </button>
            </div>
          </div>
        </nav>
      </motion.aside>

      {/* Main Content Area */}
      <main className={`flex-1 transition-all duration-500 ${collapsed ? 'ml-[80px]' : 'ml-[260px]'}`}>
        {/* Top Activity Bar */}
        <header className="h-20 border-b border-white/[0.03] flex items-center justify-between px-10 relative bg-black/20 backdrop-blur-md sticky top-0 z-40">
           <div />
           <div className="flex items-center gap-8">
              <button
                onClick={() => setShowNotifs(s => !s)}
                className="group relative h-10 px-6 rounded-full border border-white/[0.05] hover:border-gold-500/30 transition-all bg-white/[0.02] flex items-center gap-3"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse shadow-[0_0_8px_rgba(212,175,55,0.6)]" />
                <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-white/40 group-hover:text-gold-500 transition-colors">Insights & Alerts</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 text-[9px] bg-gold-500 text-black font-bold flex items-center justify-center rounded-full shadow-lg">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifs && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    className="absolute right-10 top-24 w-96 bg-black/90 backdrop-blur-3xl border border-white/[0.05] p-6 z-50 shadow-2xl rounded-sm"
                  >
                    <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/5">
                      <p className="font-display text-[10px] uppercase tracking-[0.4em] text-gold-500">System Logs</p>
                      <span className="text-[9px] text-white/20 uppercase tracking-widest">{unreadCount} Unread</span>
                    </div>
                    {notifications.length === 0 ? (
                      <p className="font-sans text-xs text-white/20 py-10 text-center">No active alerts</p>
                    ) : (
                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {notifications.map(n => (
                          <button
                            key={n._id}
                            onClick={() => {
                              markRead(n._id);
                              setShowNotifs(false);
                              if (n.type === 'general-question') {
                                navigate(`/admin/questions?mode=general&questionId=${n.questionId}`);
                              } else {
                                navigate(`/admin/questions?questionId=${n.questionId}`);
                              }
                            }}
                            className={`w-full text-left p-4 rounded-sm transition-all border ${
                              n.isRead ? 'border-white/[0.02] text-white/30 bg-transparent' : 'border-gold-500/20 text-white bg-gold-500/[0.03]'
                            } hover:border-gold-500/40`}
                          >
                            <p className="font-sans text-[11px] leading-relaxed mb-2 font-medium">{n.message}</p>
                            <p className="font-sans text-[8px] text-white/20 uppercase tracking-[0.1em]">{new Date(n.createdAt).toLocaleString()}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
        </header>

        <div className="p-10 lg:p-16">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
