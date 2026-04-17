import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, Lock, Eye, EyeOff, Loader2, ArrowRight, AlertCircle } from 'lucide-react';

const api = axios.create({ 
  baseURL: 'https://eventify-backend-jm6t.onrender.com' 
});

export default function ChangePassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const token = location.state?.token || localStorage.getItem('eventify_token');

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');

    if (form.newPassword !== form.confirmPassword) return setError("New passwords do not match.");
    if (form.newPassword.length < 6) return setError("Must be at least 6 characters.");
    
    setLoading(true);
    try {
      await api.post('/api/auth/change-password', 
        { currentPassword: form.currentPassword, newPassword: form.newPassword }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Account Secured! Please login again with your new password.");
      localStorage.clear();
      navigate('/login');
    } catch (err) { 
      setError(err.response?.data?.message || "Verification failed. Check current password."); 
    } finally { setLoading(false); }
  };

  const inputCls = "w-full p-5 pl-14 bg-stone-50 border border-stone-200 rounded-[28px] outline-none focus:ring-8 focus:ring-blue-900/5 text-sm font-black transition-all placeholder:text-stone-300";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f7f4] p-6 font-sans">
      <div className="w-full max-w-md bg-white p-12 rounded-[56px] shadow-2xl border border-stone-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-[#1e3a5f] via-[#162d4a] to-[#1e3a5f]" />
        
        <div className="flex flex-col items-center mb-12 text-center">
          <div className="w-24 h-24 bg-blue-50 rounded-[32px] flex items-center justify-center mb-8 border border-blue-100 shadow-inner">
            <ShieldCheck className="w-12 h-12 text-[#1e3a5f]" />
          </div>
          <h2 className="text-4xl font-black text-stone-900 tracking-tighter" style={{ fontFamily: '"Playfair Display", serif' }}>Account Security</h2>
          <p className="text-stone-300 text-[11px] font-black uppercase tracking-[0.4em] mt-4">Initialize Private Profile</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-5">
          {error && (
            <div className="p-5 bg-red-50 text-red-700 text-[10px] font-black rounded-3xl flex items-center gap-3 border border-red-100 animate-bounce">
              <AlertCircle className="w-5 h-5" /> {error.toUpperCase()}
            </div>
          )}
          
          <div className="relative group">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-stone-200 group-focus-within:text-blue-900 transition-colors" />
            <input type={showPass ? "text" : "password"} placeholder="Current Password" required className={inputCls} onChange={e => setForm({...form, currentPassword: e.target.value})} />
          </div>

          <div className="relative group">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-stone-200 group-focus-within:text-blue-900 transition-colors" />
            <input type={showPass ? "text" : "password"} placeholder="New Private Password" required className={inputCls} onChange={e => setForm({...form, newPassword: e.target.value})} />
          </div>

          <div className="relative group">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-stone-200 group-focus-within:text-blue-900 transition-colors" />
            <input type={showPass ? "text" : "password"} placeholder="Confirm New Password" required className={inputCls} onChange={e => setForm({...form, confirmPassword: e.target.value})} />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-5 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-600 transition-all p-2">
              {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <button disabled={loading} className="w-full py-6 mt-8 text-white font-black text-[11px] rounded-[30px] shadow-2xl transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-4 uppercase tracking-[0.3em]" style={{ background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' }}>
            {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <>Finalize Setup <ArrowRight className="w-5 h-5" /></>}
          </button>
        </form>

        <div className="mt-14 pt-8 border-t border-stone-50 text-center">
          <p className="text-[9px] text-stone-300 font-black uppercase tracking-[0.3em]">Encrypted Session Securely Established</p>
        </div>
      </div>
    </div>
  );
}