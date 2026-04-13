import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, Eye, EyeOff, AlertCircle, Loader2, CheckCircle2, Circle, ArrowRight, Lock } from 'lucide-react';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'https://eventify-backend-jm6t.onrender.com' });

const RULES = [
  { id: 'length',  label: 'At least 8 characters',       test: (p) => p.length >= 8 },
  { id: 'upper',   label: 'One uppercase letter (A–Z)',   test: (p) => /[A-Z]/.test(p) },
  { id: 'lower',   label: 'One lowercase letter (a–z)',   test: (p) => /[a-z]/.test(p) },
  { id: 'number',  label: 'One number (0–9)',             test: (p) => /\d/.test(p) },
  { id: 'special', label: 'One special character (!@#…)', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

function strengthMeta(password) {
  const passed = RULES.filter((r) => r.test(password)).length;
  if (passed === 0) return { label: '',       color: 'bg-slate-200', pct: 0   };
  if (passed <= 2)  return { label: 'Weak',   color: 'bg-red-400',   pct: 25  };
  if (passed === 3) return { label: 'Fair',   color: 'bg-amber-400', pct: 55  };
  if (passed === 4) return { label: 'Good',   color: 'bg-blue-400',  pct: 78  };
  return                   { label: 'Strong', color: 'bg-green-500', pct: 100 };
}

export default function ChangePassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = location.state?.token || localStorage.getItem('eventify_token');

  const [form, setForm]       = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow]       = useState({ current: false, new: false, confirm: false });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = strengthMeta(form.newPassword);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const toggleShow = (field) => setShow((prev) => ({ ...prev, [field]: !prev[field] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.currentPassword) {
      setError('Please enter your current password.'); return;
    }
    if (!RULES.every((r) => r.test(form.newPassword))) {
      setError('Your password does not meet all the requirements below.'); return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match.'); return;
    }
    setLoading(true);
    try {
      await api.patch(
        '/api/auth/change-password',
        { currentPassword: form.currentPassword, newPassword: form.newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(true);
      const role = localStorage.getItem('eventify_role');
      setTimeout(() => navigate(role === 'admin' ? '/admin' : '/dashboard', { replace: true }), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Password updated!</h2>
          <p className="text-slate-500 text-sm">Taking you to your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="bg-white border border-slate-200 rounded-3xl shadow-lg overflow-hidden">

          <div className="bg-green-700 px-8 pt-8 pb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <span className="text-white text-xl font-semibold">Security Setup</span>
            </div>
            <h1 className="text-white text-2xl font-bold leading-snug">Create your password</h1>
            <p className="text-green-100 text-sm mt-1.5">First login — set a strong password to continue.</p>
          </div>

          <div className="bg-green-700 h-6 relative">
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-white rounded-tl-[2rem] rounded-tr-[2rem]" />
          </div>

          <div className="px-8 pb-8 pt-3">
            {error && (
              <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-3.5">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">

              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700" htmlFor="currentPassword">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    id="currentPassword" name="currentPassword"
                    type={show.current ? 'text' : 'password'}
                    placeholder="Enter your current password"
                    value={form.currentPassword} onChange={handleChange} disabled={loading}
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 disabled:opacity-50"
                  />
                  <button type="button" onClick={() => toggleShow('current')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600">
                    {show.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700" htmlFor="newPassword">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="newPassword" name="newPassword"
                    type={show.new ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={form.newPassword} onChange={handleChange} disabled={loading}
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 disabled:opacity-50"
                  />
                  <button type="button" onClick={() => toggleShow('new')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600">
                    {show.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.newPassword && (
                  <div className="space-y-1">
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${strength.color}`}
                        style={{ width: `${strength.pct}%` }} />
                    </div>
                    {strength.label && (
                      <p className={`text-xs font-medium ${
                        strength.label === 'Strong' ? 'text-green-600' :
                        strength.label === 'Good'   ? 'text-blue-500'  :
                        strength.label === 'Fair'   ? 'text-amber-500' : 'text-red-500'}`}>
                        {strength.label}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword" name="confirmPassword"
                    type={show.confirm ? 'text' : 'password'}
                    placeholder="Re-enter your password"
                    value={form.confirmPassword} onChange={handleChange} disabled={loading}
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 disabled:opacity-50"
                  />
                  <button type="button" onClick={() => toggleShow('confirm')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600">
                    {show.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.confirmPassword && (
                  <p className={`text-xs font-medium flex items-center gap-1 ${
                    form.newPassword === form.confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                    {form.newPassword === form.confirmPassword
                      ? <><CheckCircle2 className="w-3.5 h-3.5" /> Passwords match</>
                      : <><AlertCircle  className="w-3.5 h-3.5" /> Passwords do not match</>}
                  </p>
                )}
              </div>

              {/* Requirements */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Requirements
                </p>
                {RULES.map((rule) => {
                  const passed = rule.test(form.newPassword);
                  return (
                    <div key={rule.id} className="flex items-center gap-2.5 mb-2 last:mb-0">
                      {passed
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                        : <Circle       className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                      <span className={`text-xs ${passed ? 'text-green-700 font-medium' : 'text-slate-400'}`}>
                        {rule.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 px-6 rounded-xl bg-green-700 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-green-800 transition-all duration-200 disabled:opacity-60">
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</>
                  : <><ShieldCheck className="w-4 h-4" /> Set Password & Continue <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          </div>
        </div>
        <p className="text-center text-xs text-slate-400 mt-4">
          © {new Date().getFullYear()} Eventify
        </p>
      </div>
    </div>
  );
}