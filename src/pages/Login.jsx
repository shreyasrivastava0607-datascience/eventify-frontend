import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GraduationCap, Eye, EyeOff, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'https://eventify-backend-jm6t.onrender.com' });

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm]         = useState({ rollNumber: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

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

      console.log('Login response:', data);

      const role = data.role || data.user?.role;

      localStorage.setItem('eventify_token', data.token);
      localStorage.setItem('eventify_role',  role);
      localStorage.setItem('eventify_user',  JSON.stringify(data.user));

      console.log('Saved role:', role);

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

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="bg-white border border-slate-200 rounded-3xl shadow-lg overflow-hidden">

          <div className="bg-blue-900 px-8 pt-8 pb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-white text-xl font-semibold">Eventify</span>
            </div>
            <h1 className="text-white text-2xl font-bold leading-snug">Welcome back</h1>
            <p className="text-blue-200 text-sm mt-1">Sign in to your campus portal</p>
          </div>

          <div className="bg-blue-900 h-6 relative">
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
                <label className="block text-sm font-medium text-slate-700" htmlFor="rollNumber">
                  Roll Number
                </label>
                <input
                  id="rollNumber" name="rollNumber" type="text"
                  placeholder="e.g. CS2023001"
                  value={form.rollNumber} onChange={handleChange} disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 disabled:opacity-50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password" name="password"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={form.password} onChange={handleChange} disabled={loading}
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 disabled:opacity-50"
                  />
                  <button type="button" onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 px-6 rounded-xl bg-blue-900 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-blue-800 transition-all duration-200 disabled:opacity-60 mt-2">
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
                  : <>Sign In <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-slate-400">
              Facing issues? Contact{' '}
              <a href="mailto:admin@college.edu" className="text-blue-600 hover:underline font-medium">
                admin@college.edu
              </a>
            </p>
          </div>
        </div>
        <p className="text-center text-xs text-slate-400 mt-4">
          © {new Date().getFullYear()} Eventify · Campus Event Management
        </p>
      </div>
    </div>
  );
}