import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GraduationCap, Eye, EyeOff, AlertCircle, Loader2, ArrowRight, Calendar, Users, Sparkles } from 'lucide-react';

// ─── THE FIX: Pointing directly to your Render Backend ───────────────────────
const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL || 'https://eventify-backend-jm6t.onrender.com' 
});

/* ── Welcome Splash ── */
function WelcomeSplash({ onDone }) {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #162d4a 60%, #0f2035 100%)', fontFamily: '"DM Sans", sans-serif' }}
      onClick={onDone}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #60a5fa, transparent)' }} />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #34d399, transparent)' }} />
      </div>
      <div className="relative text-center px-8">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-2xl">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="text-5xl font-bold text-white mb-2 tracking-tight"
          style={{ fontFamily: '"Playfair Display", serif' }}>Eventify</h1>
        <p className="text-blue-200 mb-8 tracking-widest uppercase text-xs font-medium">Campus Event Management</p>
        <div className="flex items-center justify-center gap-3 flex-wrap mb-10">
          {[{ icon: Calendar, label: 'Smart Events' }, { icon: Users, label: 'All Departments' }, { icon: Sparkles, label: 'Clash Detection' }]
            .map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 bg-white/10 border border-white/15 px-3 py-1.5 rounded-full">
                <Icon className="w-3.5 h-3.5 text-blue-300" />
                <span className="text-white/80 text-xs font-medium">{label}</span>
              </div>
            ))}
        </div>
        <div className="w-48 mx-auto h-0.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-blue-400 rounded-full" style={{ animation: 'loadbar 2.5s ease-in-out forwards' }} />
        </div>
        <p className="text-white/40 text-xs mt-6">Tap anywhere to continue</p>
        <style>{`@keyframes loadbar { from{width:0%} to{width:100%} }`}</style>
      </div>
    </div>
  );
}

/* ── Login Page ── */
export default function Login() {
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(true);
  const [form, setForm]             = useState({ rollNumber: '', password: '' });
  const [showPass, setShowPass]     = useState(false);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.rollNumber.trim()) { setError('Roll number is required.'); return; }
    if (!form.password.trim())   { setError('Password is required.');    return; }
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', {
        rollNumber: form.rollNumber.trim(),
        password:   form.password,
      });
      const role = data.role || data.user?.role;
      localStorage.setItem('eventify_token', data.token);
      localStorage.setItem('eventify_role',  role);
      localStorage.setItem('eventify_user',  JSON.stringify(data.user));
      if (data.isFirstLogin) {
        navigate('/change-password', { state: { token: data.token } });
      } else if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (showSplash) return <WelcomeSplash onDone={() => setShowSplash(false)} />;

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: '#f8f7f4', fontFamily: '"DM Sans", sans-serif' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #1e3a5f, transparent)' }} />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #1e3a5f, transparent)' }} />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white border border-stone-200 rounded-3xl shadow-xl overflow-hidden">
          <div className="px-8 pt-8 pb-10" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #162d4a 100%)' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-white text-xl font-semibold" style={{ fontFamily: '"Playfair Display", serif' }}>Eventify</span>
            </div>
            <h1 className="text-white text-2xl font-bold" style={{ fontFamily: '"Playfair Display", serif' }}>Welcome back</h1>
            <p className="text-blue-200 text-sm mt-1">Sign in to your campus portal</p>
          </div>
          <div className="h-6 relative" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #162d4a 100%)' }}>
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-white rounded-tl-[2rem] rounded-tr-[2rem]" />
          </div>

          <div className="px-8 pb-8 pt-2">
            {error && (
              <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-3.5">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider" htmlFor="rollNumber">Roll Number</label>
                <input id="rollNumber" name="rollNumber" type="text" placeholder="e.g. CS2023001"
                  value={form.rollNumber} onChange={handleChange} disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 placeholder-stone-400 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 disabled:opacity-50" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider" htmlFor="password">Password</label>
                <div className="relative">
                  <input id="password" name="password" type={showPass ? 'text' : 'password'} placeholder="Enter your password"
                    value={form.password} onChange={handleChange} disabled={loading}
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 disabled:opacity-50" />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 px-6 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-60 mt-2"
                style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #162d4a 100%)' }}>
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
            <p className="mt-6 text-center text-xs text-stone-400">
              Facing issues? Contact{' '}
              <a href="mailto:admin@college.edu" className="text-blue-800 hover:underline font-medium">admin@college.edu</a>
            </p>
          </div>
        </div>
        <p className="text-center text-xs text-stone-400 mt-4">© {new Date().getFullYear()} Eventify · Campus Event Management</p>
      </div>
    </div>
  );
}