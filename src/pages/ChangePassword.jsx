import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, Lock, Eye, EyeOff, Loader2, ArrowRight, AlertCircle } from 'lucide-react';

// ─── THE LIVE CONNECTION ──────────────────────────────────────────────────
const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL || 'https://eventify-backend-jm6t.onrender.com' 
});

export default function ChangePassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get token from the login navigation state or local storage
  const token = location.state?.token || localStorage.getItem('eventify_token');

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');

    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (form.newPassword.length < 6) {
      setError("Security requirement: Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/auth/change-password', 
        { currentPassword: form.currentPassword, newPassword: form.newPassword }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert("Password updated successfully! Please login with your new credentials.");
      localStorage.clear();
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password. Please check your current password.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full p-4 pl-12 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-900/5 transition-all text-sm font-medium";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f7f4] p-4 font-sans">
      <div className="w-full max-w-md bg-white p-10 rounded-[40px] shadow-2xl border border-stone-200 relative overflow-hidden">
        {/* Top Decorative Branding Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#1e3a5f] via-[#162d4a] to-[#1e3a5f]"></div>
        
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 border border-blue-100">
            <ShieldCheck className="w-8 h-8 text-[#1e3a5f]" />
          </div>
          <h2 className="text-3xl font-bold text-stone-900 tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>
            Secure Your Account
          </h2>
          <p className="text-stone-400 text-xs mt-2 font-bold uppercase tracking-widest">Initial Security Setup</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-700 text-[11px] font-black rounded-2xl flex items-center gap-2 animate-pulse">
              <AlertCircle className="w-4 h-4" /> {error.toUpperCase()}
            </div>
          )}

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
            <input 
              type={showPass ? "text" : "password"} 
              placeholder="Current (Default) Password" 
              className={inputCls} 
              value={form.currentPassword}
              onChange={e => setForm({...form, currentPassword: e.target.value})}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
            <input 
              type={showPass ? "text" : "password"} 
              placeholder="New Secure Password" 
              className={inputCls} 
              value={form.newPassword}
              onChange={e => setForm({...form, newPassword: e.target.value})}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
            <input 
              type={showPass ? "text" : "password"} 
              placeholder="Confirm New Password" 
              className={inputCls} 
              value={form.confirmPassword}
              onChange={e => setForm({...form, confirmPassword: e.target.value})}
              required
            />
            <button 
              type="button" 
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button 
            disabled={loading}
            className="w-full py-4 mt-4 text-white font-black text-xs rounded-2xl shadow-xl transition-all hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-widest" 
            style={{ background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' }}
          >
            {loading ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              <>Update & Continue <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-stone-100 text-center">
          <p className="text-[10px] text-stone-300 font-black uppercase tracking-[0.2em]">
            Eventify Encryption Verified
          </p>
        </div>
      </div>
    </div>
  );
}