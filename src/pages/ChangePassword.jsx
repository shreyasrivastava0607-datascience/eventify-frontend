import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';

const api = axios.create({ baseURL: 'https://eventify-backend-jm6t.onrender.com' });

export default function ChangePassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const token = location.state?.token || localStorage.getItem('eventify_token');

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) return alert("Passwords do not match");
    setLoading(true);
    try {
      await api.post('/api/auth/change-password', { currentPassword: form.currentPassword, newPassword: form.newPassword }, { headers: { Authorization: `Bearer ${token}` } });
      alert("Security Setup Complete! Please log in with your new password.");
      localStorage.clear();
      navigate('/login');
    } catch { 
      alert("Update failed. Please verify your current password."); 
    } finally { setLoading(false); }
  };

  const inputCls = "w-full p-5 pl-12 bg-stone-50 border border-stone-200 rounded-[28px] outline-none text-sm font-bold focus:ring-4 focus:ring-blue-900/5 transition-all";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f7f4] p-4 font-sans">
      <div className="w-full max-w-md bg-white p-12 rounded-[56px] shadow-2xl border border-stone-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-[#1e3a5f] to-[#162d4a]" />
        
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-24 h-24 bg-blue-50 rounded-[32px] flex items-center justify-center mb-8 border border-blue-100 shadow-inner"><ShieldCheck className="w-12 h-12 text-[#1e3a5f]" /></div>
          <h2 className="text-3xl font-bold text-stone-900 tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>Account Security</h2>
          <p className="text-stone-400 text-[10px] font-black uppercase tracking-[0.3em] mt-4">Initialize Private Profile</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-5">
          <div className="relative">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
            <input type={showPass ? "text" : "password"} placeholder="Current Password" required className={inputCls} onChange={e => setForm({...form, currentPassword: e.target.value})} />
          </div>
          <div className="relative">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
            <input type={showPass ? "text" : "password"} placeholder="New Private Password" required className={inputCls} onChange={e => setForm({...form, newPassword: e.target.value})} />
          </div>
          <div className="relative">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
            <input type={showPass ? "text" : "password"} placeholder="Confirm Private Password" required className={inputCls} onChange={e => setForm({...form, confirmPassword: e.target.value})} />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors">
              {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          <button disabled={loading} className="w-full py-5 mt-8 text-white font-black text-[11px] rounded-[32px] shadow-xl flex items-center justify-center gap-4 uppercase tracking-[0.3em] transition-all hover:scale-[1.02]" style={{ background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' }}>
            {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <>Finalize Security <ArrowRight className="w-5 h-5" /></>}
          </button>
        </form>
      </div>
    </div>
  );
}