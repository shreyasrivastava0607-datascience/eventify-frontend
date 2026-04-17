import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, Lock, Eye, EyeOff, Loader2, ArrowRight, CheckCircle2, X } from 'lucide-react';

const api = axios.create({ baseURL: 'https://eventify-backend-jm6t.onrender.com' });

/* ── PASSWORD STRENGTH ── */
function PasswordStrength({ password }) {
  if (!password) return null;

  const checks = [
    { label: 'At least 8 characters', pass: password.length >= 8 },
    { label: 'Uppercase letter', pass: /[A-Z]/.test(password) },
    { label: 'Number', pass: /\d/.test(password) },
    { label: 'Special character', pass: /[^a-zA-Z0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.pass).length;
  const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-500'];
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="space-y-3 mt-2">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i < score ? colors[score - 1] : 'bg-stone-100'}`} />
        ))}
      </div>
      {score > 0 && (
        <p className={`text-[10px] font-black uppercase tracking-widest ${['text-red-400', 'text-orange-400', 'text-yellow-500', 'text-emerald-500'][score - 1]}`}>
          {labels[score - 1]} Password
        </p>
      )}
      <div className="space-y-1.5">
        {checks.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            {c.pass
              ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              : <X className="w-3.5 h-3.5 text-stone-200 flex-shrink-0" />}
            <span className={`text-[10px] font-bold ${c.pass ? 'text-stone-500' : 'text-stone-300'}`}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ChangePassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Safely read token and user
  const token = location.state?.token || localStorage.getItem('eventify_token');

  const storedUserRaw = localStorage.getItem('eventify_user');
  let storedUser = {};
  try { storedUser = JSON.parse(storedUserRaw || '{}'); } catch { storedUser = {}; }

  const isFirstLogin =
    location.state?.isFirstLogin ||
    storedUser?.isFirstLogin === true ||
    storedUser?.mustChangePassword === true;

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');

    if (form.newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match. Please try again.');
      return;
    }
    if (form.currentPassword === form.newPassword) {
      setError('New password must be different from the current password.');
      return;
    }

    setLoading(true);
    try {
      await api.post(
        '/api/auth/change-password',
        { currentPassword: form.currentPassword, newPassword: form.newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Mark first login as complete in stored user
      const updated = { ...storedUser, isFirstLogin: false, mustChangePassword: false };
      localStorage.setItem('eventify_user', JSON.stringify(updated));

      setSuccess(true);
      // Clear everything and redirect to login after 2.5s
      setTimeout(() => {
        localStorage.removeItem('eventify_token');
        localStorage.removeItem('eventify_user');
        navigate('/login', { replace: true });
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed. Please verify your current password.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full p-5 pl-12 bg-stone-50 border border-stone-200 rounded-[28px] outline-none text-sm font-bold focus:ring-4 focus:ring-blue-900/5 transition-all placeholder:text-stone-300";

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f7f4] p-4 font-sans">
        <div className="w-full max-w-md bg-white p-12 rounded-[56px] shadow-2xl border border-stone-100 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-3 rounded-t-[56px] bg-emerald-500" />
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-emerald-100">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-bold text-stone-900 mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>
            Security Updated!
          </h2>
          <p className="text-stone-400 text-sm font-medium mb-2">Your password has been changed successfully.</p>
          <p className="text-stone-300 text-xs font-bold uppercase tracking-widest">Redirecting to login...</p>
          <div className="mt-8 w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{
                animation: 'shrinkProgress 2.5s linear forwards',
                width: '100%',
              }}
            />
          </div>
          <style>{`
            @keyframes shrinkProgress {
              from { width: 100%; }
              to { width: 0%; }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f7f4] p-4 font-sans">
      <div className="w-full max-w-md bg-white p-12 rounded-[56px] shadow-2xl border border-stone-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-3 rounded-t-[56px]" style={{ background: 'linear-gradient(90deg, #1e3a5f, #2563eb)' }} />

        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-24 h-24 bg-blue-50 rounded-[32px] flex items-center justify-center mb-8 border border-blue-100 shadow-inner">
            <ShieldCheck className="w-12 h-12 text-[#1e3a5f]" />
          </div>
          <h2 className="text-3xl font-bold text-stone-900 tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>
            {isFirstLogin ? 'Set Your Password' : 'Change Password'}
          </h2>
          <p className="text-stone-400 text-[10px] font-black uppercase tracking-[0.3em] mt-4">
            {isFirstLogin ? 'First Login — Secure Your Account' : 'Account Security Settings'}
          </p>

          {isFirstLogin && (
            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 text-left w-full">
              <p className="text-amber-700 text-xs font-bold">
                🔐 You're using a default password. Please create a private password to continue.
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-center gap-3">
            <X className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-red-600 text-xs font-bold">{error}</p>
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
            <input
              type={showPass ? 'text' : 'password'}
              placeholder={isFirstLogin ? 'Default Password (given by Admin)' : 'Current Password'}
              required
              className={inputCls}
              value={form.currentPassword}
              onChange={e => setForm({ ...form, currentPassword: e.target.value })}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="New Password"
              required
              className={inputCls}
              value={form.newPassword}
              onChange={e => setForm({ ...form, newPassword: e.target.value })}
            />
          </div>

          {form.newPassword && <PasswordStrength password={form.newPassword} />}

          <div className="relative">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Confirm New Password"
              required
              className={inputCls}
              value={form.confirmPassword}
              onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
            />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors">
              {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {form.confirmPassword && form.newPassword !== form.confirmPassword && (
            <p className="text-red-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
              <X className="w-3 h-3" /> Passwords don't match
            </p>
          )}
          {form.confirmPassword && form.newPassword === form.confirmPassword && (
            <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Passwords match
            </p>
          )}

          <button
            disabled={loading}
            className="w-full py-5 mt-4 text-white font-black text-[11px] rounded-[32px] shadow-xl flex items-center justify-center gap-4 uppercase tracking-[0.3em] transition-all hover:scale-[1.02] disabled:opacity-70"
            style={{ background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' }}>
            {loading
              ? <Loader2 className="animate-spin w-6 h-6" />
              : <>{isFirstLogin ? 'Secure My Account' : 'Update Password'} <ArrowRight className="w-5 h-5" /></>}
          </button>

          {!isFirstLogin && (
            <button type="button" onClick={() => navigate(-1)}
              className="w-full py-4 text-stone-400 font-bold text-sm text-center hover:text-stone-600 transition-colors">
              ← Go Back
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
