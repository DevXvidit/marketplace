import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminProfile() {
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
      toast.success(data.message || 'Password updated');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="mb-10">
          <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold-500 mb-2">Admin</p>
          <h1 className="font-display text-3xl text-white">Profile & Security</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Identity Card */}
          <div className="bg-white/[0.02] border border-white/[0.05] p-6">
            <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-white/30 mb-5">Identity</p>
            <div className="flex items-center gap-4 pb-5 border-b border-white/[0.05]">
              <div className="w-12 h-12 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-500 font-display text-lg">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-display text-xl text-white">{user?.name}</p>
                <p className="font-sans text-[10px] uppercase tracking-widest text-white/40">{user?.role}</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {[
                ['Email', user?.email],
                ['Phone', user?.phone || '—'],
                ['Joined', user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="font-sans text-[9px] uppercase tracking-[0.25em] text-white/30">{k}</span>
                  <span className="font-sans text-xs text-white/70">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Password Card */}
          <div className="bg-white/[0.02] border border-white/[0.05] p-6">
            <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-white/30 mb-5">Change Password</p>
            <form onSubmit={handlePassChange} className="space-y-4">
              {[
                ['currentPassword', 'Current Password', 'Current password'],
                ['newPassword', 'New Password', 'New password'],
                ['confirmPassword', 'Confirm Password', 'Confirm new password']
              ].map(([key, label, placeholder]) => (
                <div key={key}>
                  <label className="font-sans text-[9px] tracking-[0.25em] uppercase text-white/30 block mb-2">{label}</label>
                  <input
                    type="password"
                    required
                    value={passForm[key]}
                    onChange={e => setPassForm(f => ({ ...f, [key]: e.target.value }))}
                    className="input-luxury w-full bg-white/[0.02] border-white/10"
                    placeholder={placeholder}
                  />
                </div>
              ))}
              <button type="submit" disabled={changing} className="btn-gold w-full h-12 tracking-[0.3em] text-[10px]">
                {changing ? 'Updating...' : 'Update Password'}
              </button>
            </form>

          </div>
        </div>
      </motion.div>
    </div>
  );
}
