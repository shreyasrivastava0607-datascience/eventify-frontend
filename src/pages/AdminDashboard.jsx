import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  CalendarPlus, Images, LogOut, CheckSquare, Square, Loader2,
  CheckCircle2, AlertCircle, X, UserPlus, Settings, Trash2, 
  GraduationCap, ClipboardList, Link as LinkIcon, Image as ImageIcon
} from 'lucide-react';

const api = axios.create({ baseURL: 'https://eventify-backend-jm6t.onrender.com' });
const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('eventify_token')}` } });

const DEPARTMENTS = ['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'BBA', 'MBA', 'MCA', 'BCA', 'BSC', 'Other'];
const YEARS       = [1, 2, 3, 4, 5];
const EVENT_TYPES = ['Tech Event', 'Cultural Event'];

/* ── Toast ── */
function Toast({ toast, onClose }) {
  if (!toast) return null;
  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-bold ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
      {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {toast.message}
      <button onClick={onClose}><X className="w-3.5 h-3.5 opacity-70" /></button>
    </div>
  );
}

/* ── Checkbox Group Component ── */
function CheckboxGroup({ label, options, selected, onChange }) {
  return (
    <div className="space-y-3">
      <label className="block text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => {
          const active = selected.includes(opt);
          return (
            <button key={opt} type="button" onClick={() => onChange(active ? selected.filter(s => s !== opt) : [...selected, opt])}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${active ? 'text-white border-transparent shadow-lg' : 'bg-white border-stone-200 text-stone-400 hover:border-blue-300'}`}
              style={active ? { background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' } : {}}>
              {active ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />} {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── 1. Create Event Form (FULL RESTORATION) ── */
function CreateEventForm({ showToast }) {
  const [form, setForm] = useState({ title: '', description: '', venue: '', date: '', time: '', targetDepartments: [], targetYears: [], eventType: '', registrationLink: '', brochureURL: '' });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.venue || form.targetDepartments.length === 0) {
      return showToast('error', 'Required fields or Departments missing!');
    }
    setLoading(true);
    try {
      await api.post('/api/events', { ...form, targetYears: form.targetYears.map(Number) }, getAuthHeader());
      showToast('success', 'Event Published Successfully!');
      setForm({ title: '', description: '', venue: '', date: '', time: '', targetDepartments: [], targetYears: [], eventType: '', registrationLink: '', brochureURL: '' });
    } catch { showToast('error', 'Server error. Check database connection.'); }
    finally { setLoading(false); }
  };

  const inputCls = "w-full p-4 border border-stone-200 rounded-2xl bg-stone-50 outline-none text-sm font-bold focus:ring-4 focus:ring-blue-900/5 transition-all";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2"><input placeholder="Event Title *" className={inputCls} value={form.title} onChange={e => set('title', e.target.value)} /></div>
        <div className="md:col-span-2"><textarea placeholder="Event Description *" className={inputCls + " h-32"} value={form.description} onChange={e => set('description', e.target.value)} /></div>
        <select className={inputCls} value={form.eventType} onChange={e => set('eventType', e.target.value)}><option value="">Select Category</option>{EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select>
        <input placeholder="Venue *" className={inputCls} value={form.venue} onChange={e => set('venue', e.target.value)} />
        <input type="date" className={inputCls} value={form.date} onChange={e => set('date', e.target.value)} />
        <input type="time" className={inputCls} value={form.time} onChange={e => set('time', e.target.value)} />
        <div className="md:col-span-2"><input placeholder="External Registration Link (Google Forms etc.)" className={inputCls} value={form.registrationLink} onChange={e => set('registrationLink', e.target.value)} /></div>
        <div className="md:col-span-2"><input placeholder="Brochure Image URL (Direct Link)" className={inputCls} value={form.brochureURL} onChange={e => set('brochureURL', e.target.value)} /></div>
      </div>
      
      {/* ── THE MISSING DEPARTMENTS ── */}
      <CheckboxGroup label="Target Departments (Smart Clash Filter)" options={DEPARTMENTS} selected={form.targetDepartments} onChange={v => set('targetDepartments', v)} />
      <CheckboxGroup label="Target Academic Years" options={YEARS} selected={form.targetYears} onChange={v => set('targetYears', v)} />
      
      <button disabled={loading} className="w-full py-5 text-white rounded-3xl font-black shadow-2xl transition-all" style={{ background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' }}>
        {loading ? <Loader2 className="animate-spin mx-auto" /> : 'PUBLISH EVENT'}
      </button>
    </form>
  );
}

/* ── 2. Manage Events ── */
function ManageEvents({ showToast }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    try { const { data } = await api.get('/api/events', getAuthHeader()); setEvents(data.data || data); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const del = async (id, title) => {
    if (!window.confirm(`Permanently delete "${title}"?`)) return;
    try {
      await api.delete(`/api/events/${id}`, getAuthHeader());
      showToast('success', 'Event Deleted!');
      fetch();
    } catch { showToast('error', 'Deletion failed.'); }
  };

  if (loading) return <Loader2 className="animate-spin mx-auto text-blue-900 mt-20" />;

  return (
    <div className="space-y-4">
      {events.map(ev => (
        <div key={ev._id} className="p-6 border rounded-3xl bg-white flex justify-between items-center shadow-sm">
          <div><h4 className="font-bold text-stone-800">{ev.title}</h4><p className="text-[10px] text-stone-400 font-bold uppercase">{new Date(ev.date).toDateString()} · {ev.venue}</p></div>
          <button onClick={() => del(ev._id, ev.title)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
        </div>
      ))}
    </div>
  );
}

/* ── 3. RSVP View ── */
function RegistrationsView() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/events', getAuthHeader()).then(r => setEvents(r.data.data || r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader2 className="animate-spin mx-auto text-blue-900 mt-20" />;

  return (
    <div className="space-y-8">
      {events.map(ev => (
        <div key={ev._id} className="bg-stone-50 p-6 rounded-[32px] border border-stone-100">
          <div className="flex justify-between items-center mb-4"><h3 className="font-bold">{ev.title}</h3><span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">{ev.registeredStudents?.length || 0} RSVPs</span></div>
          <div className="bg-white rounded-2xl border overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 text-stone-400 font-black uppercase tracking-widest border-b">
                <tr><th className="px-6 py-4">Name</th><th className="px-6 py-4">Roll Number</th></tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {ev.registeredStudents?.map((s, i) => (
                  <tr key={i}><td className="px-6 py-4 font-bold">{s.name}</td><td className="px-6 py-4 font-mono">{s.rollNumber}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── 4. Add User Form ── */
function AddUserForm({ showToast }) {
  const [form, setForm] = useState({ rollNumber: '', name: '', department: '', year: '', role: 'student' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.rollNumber || !form.department || !form.year) return showToast('error', 'All fields required!');
    setLoading(true);
    try {
      const first = form.name.trim().split(' ')[0];
      const pass = first.charAt(0).toUpperCase() + first.slice(1).toLowerCase() + "@123";
      await api.post('/api/auth/create-student', { ...form, year: Number(form.year) }, getAuthHeader());
      showToast('success', `Created! Password is: ${pass}`);
      setForm({ rollNumber: '', name: '', department: '', year: '', role: 'student' });
    } catch (err) { showToast('error', err.response?.data?.message || 'Failed.'); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input placeholder="Full Name" className="w-full p-4 border rounded-2xl bg-stone-50 font-bold" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        <input placeholder="Roll Number" className="w-full p-4 border rounded-2xl bg-stone-50 font-bold" value={form.rollNumber} onChange={e => setForm({...form, rollNumber: e.target.value})} />
        <select className="w-full p-4 border rounded-2xl bg-stone-50 font-bold" value={form.department} onChange={e => setForm({...form, department: e.target.value})}><option value="">Select Dept</option>{DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}</select>
        <select className="w-full p-4 border rounded-2xl bg-stone-50 font-bold" value={form.year} onChange={e => setForm({...form, year: e.target.value})}><option value="">Select Year</option>{YEARS.map(y => <option key={y} value={y}>Year {y}</option>)}</select>
      </div>
      <button disabled={loading} className="w-full py-5 text-white rounded-3xl font-black shadow-xl" style={{ background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' }}>ADD STUDENT</button>
    </form>
  );
}

/* ── Main Component ── */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('create');
  const [toast, setToast] = useState(null);
  const user = JSON.parse(localStorage.getItem('eventify_user') || '{}');
  const showToast = (type, message) => { setToast({ type, message }); setTimeout(() => setToast(null), 4000); };

  const TABS = [{ id: 'create', label: 'Create', icon: CalendarPlus }, { id: 'manage', label: 'Manage', icon: Settings }, { id: 'registrations', label: 'RSVPs', icon: ClipboardList }, { id: 'users', label: 'Directory', icon: UserPlus }, { id: 'gallery', label: 'Gallery', icon: Images }];

  return (
    <div className="min-h-screen bg-[#f8f7f4] font-sans pb-20">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <nav className="text-white px-8 py-5 flex items-center justify-between shadow-2xl sticky top-0 z-30" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #162d4a 100%)' }}>
        <div className="flex items-center gap-4"><GraduationCap className="w-10 h-10" /><span className="font-bold text-2xl" style={{ fontFamily: '"Playfair Display", serif' }}>Eventify Admin</span></div>
        <div className="flex items-center gap-6"><span className="text-sm font-bold opacity-80">Hello, {user.name}</span><button onClick={() => { localStorage.clear(); navigate('/login'); }} className="bg-white/10 p-3 rounded-2xl hover:bg-white/20"><LogOut className="w-5 h-5" /></button></div>
      </nav>
      <div className="max-w-5xl mx-auto px-4 mt-10">
        <div className="flex gap-2 mb-10 bg-white p-2 rounded-[32px] shadow-sm border border-stone-200 overflow-x-auto no-scrollbar">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-8 py-4 rounded-3xl text-[10px] font-black transition-all whitespace-nowrap ${tab === t.id ? 'text-white shadow-xl scale-[1.05]' : 'text-stone-400 hover:text-stone-600'}`} style={tab === t.id ? { background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' } : {}}><t.icon className="w-4 h-4" /> {t.label.toUpperCase()}</button>
          ))}
        </div>
        <div className="bg-white rounded-[48px] border border-stone-200 shadow-2xl p-10 lg:p-16">
          {tab === 'create' && <CreateEventForm showToast={showToast} />}
          {tab === 'manage' && <ManageEvents showToast={showToast} />}
          {tab === 'registrations' && <RegistrationsView />}
          {tab === 'users' && <AddUserForm showToast={showToast} />}
          {tab === 'gallery' && <div className="text-center py-20 text-stone-300 font-bold uppercase tracking-widest">Gallery Mode Active</div>}
        </div>
      </div>
    </div>
  );
}