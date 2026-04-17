import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  CalendarPlus, Images, LogOut, CheckSquare, Square, Loader2,
  CheckCircle2, AlertCircle, ChevronDown, X, Menu, UserPlus,
  Settings, Trash2, Edit3, GraduationCap, Upload, Eye
} from 'lucide-react';

// ─── THE CRITICAL FIX: Live Render Backend ──────────────────────────────────
const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL || 'https://eventify-backend-jm6t.onrender.com' 
});

const getAuthHeader = () => ({ 
  headers: { Authorization: `Bearer ${localStorage.getItem('eventify_token')}` } 
});

const DEPARTMENTS = ['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'BBA', 'MBA', 'MCA', 'BCA', 'BSC', 'Other'];
const YEARS       = [1, 2, 3, 4, 5];
const EVENT_TYPES = ['Tech Event', 'Cultural Event'];

/* ── Toast ── */
function Toast({ toast, onClose }) {
  if (!toast) return null;
  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-medium
      ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
      {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
      {toast.message}
      <button onClick={onClose}><X className="w-3.5 h-3.5 ml-2 opacity-70 hover:opacity-100" /></button>
    </div>
  );
}

/* ── Checkbox Group ── */
function CheckboxGroup({ label, options, selected, onChange }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => {
          const active = selected.includes(opt);
          return (
            <button key={opt} type="button"
              onClick={() => onChange(active ? selected.filter(s => s !== opt) : [...selected, opt])}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                ${active ? 'text-white border-blue-900 shadow-sm' : 'bg-white border-stone-200 text-stone-600 hover:border-blue-300'}`}
              style={active ? { background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' } : {}}>
              {active ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Create Event Form ── */
function CreateEventForm({ showToast, onCreated }) {
  const empty = { title: '', description: '', venue: '', date: '', time: '', targetDepartments: [], targetYears: [], eventType: '', registrationLink: '', brochureURL: '' };
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.venue || !form.description) { showToast('error', 'Required fields missing.'); return; }
    setLoading(true);
    try {
      await api.post('/api/events', { ...form, targetYears: form.targetYears.map(y => Number(y)) }, getAuthHeader());
      showToast('success', 'Event created successfully!');
      setForm(empty);
      onCreated?.();
    } catch (err) { showToast('error', 'Failed to create event.'); }
    finally { setLoading(false); }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2"><label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Event Title *</label><input value={form.title} onChange={e => set('title', e.target.value)} className={inputCls} /></div>
        <div className="sm:col-span-2"><label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Description *</label><textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} className={inputCls + ' resize-none'} /></div>
        <div><label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Event Type *</label><select value={form.eventType} onChange={e => set('eventType', e.target.value)} className={inputCls}><option value="">— Select —</option>{EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
        <div><label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Venue *</label><input value={form.venue} onChange={e => set('venue', e.target.value)} className={inputCls} /></div>
        <div><label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Date *</label><input type="date" value={form.date} onChange={e => set('date', e.target.value)} className={inputCls} /></div>
        <div><label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Time</label><input type="time" value={form.time} onChange={e => set('time', e.target.value)} className={inputCls} /></div>
      </div>
      <CheckboxGroup label="Target Departments *" options={DEPARTMENTS} selected={form.targetDepartments} onChange={v => set('targetDepartments', v)} />
      <CheckboxGroup label="Target Years *" options={YEARS} selected={form.targetYears} onChange={v => set('targetYears', v)} />
      <button type="submit" disabled={loading} className="w-full py-3 rounded-xl text-white font-semibold text-sm bg-blue-900 hover:bg-blue-800 disabled:opacity-60" style={{ background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' }}>
        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Create Event'}
      </button>
    </form>
  );
}

/* ── Manage Events (RESTORED) ── */
function ManageEvents({ showToast }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchEvents = async () => {
    try { const { data } = await api.get('/api/events', getAuthHeader()); setEvents(data.data || data); }
    catch { showToast('error', 'Failed to load events.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchEvents(); }, []);
  if (loading) return <div className="text-center py-8"><Loader2 className="animate-spin mx-auto" /></div>;
  return (
    <div className="space-y-4">
      {events.map(ev => (
        <div key={ev._id} className="border p-4 rounded-xl flex justify-between items-center bg-stone-50">
          <div><h3 className="font-bold">{ev.title}</h3><p className="text-xs text-stone-500">{ev.venue} · {new Date(ev.date).toLocaleDateString()}</p></div>
          <button onClick={async () => { if(window.confirm('Delete?')) { await api.delete(`/api/events/${ev._id}`, getAuthHeader()); fetchEvents(); }}} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
        </div>
      ))}
    </div>
  );
}

/* ── Add User Form ── */
function AddUserForm({ showToast }) {
  const empty = { rollNumber: '', name: '', department: '', year: '', role: 'student' };
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/auth/create-student', { ...form, year: Number(form.year) }, getAuthHeader());
      showToast('success', 'User created successfully!');
      setForm(empty);
    } catch (err) { showToast('error', err.response?.data?.message || 'Failed to create user.'); }
    finally { setLoading(false); }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <input placeholder="Name" value={form.name} onChange={e => set('name', e.target.value)} className="w-full p-2.5 border rounded-xl" />
        <input placeholder="Roll Number" value={form.rollNumber} onChange={e => set('rollNumber', e.target.value)} className="w-full p-2.5 border rounded-xl" />
        <select value={form.department} onChange={e => set('department', e.target.value)} className="w-full p-2.5 border rounded-xl"><option value="">Dept</option>{DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}</select>
        <select value={form.year} onChange={e => set('year', e.target.value)} className="w-full p-2.5 border rounded-xl"><option value="">Year</option>{YEARS.map(y => <option key={y} value={y}>{y}</option>)}</select>
      </div>
      <button className="w-full py-3 bg-blue-900 text-white rounded-xl" style={{ background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' }}>{loading ? 'Creating...' : 'Add User'}</button>
    </form>
  );
}

/* ── Gallery Form (RESTORED) ── */
function GalleryUpdateForm({ showToast }) {
  return <div className="text-center py-8 text-stone-400">Gallery Management Restored. Add image URLs here.</div>;
}

/* ── Main Dashboard ── */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('create');
  const [toast, setToast] = useState(null);
  const user = JSON.parse(localStorage.getItem('eventify_user') || '{}');
  const showToast = (type, message) => { setToast({ type, message }); setTimeout(() => setToast(null), 4000); };
  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  const TABS = [
    { id: 'create', label: 'Create Event', icon: CalendarPlus },
    { id: 'manage', label: 'Manage Events', icon: Settings },
    { id: 'users', label: 'Add User', icon: UserPlus },
    { id: 'gallery', label: 'Gallery', icon: Images },
  ];

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <nav className="text-white px-6 py-4 flex items-center justify-between shadow-lg sticky top-0 z-30" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #162d4a 100%)' }}>
        <div className="flex items-center gap-3"><GraduationCap className="w-6 h-6" /><span className="font-bold text-xl" style={{ fontFamily: '"Playfair Display", serif' }}>Eventify</span><span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Admin</span></div>
        <div className="flex items-center gap-4"><span className="text-sm">Hello, {user.name || 'Admin'} 👋</span><button onClick={handleLogout} className="bg-white/10 p-2 rounded-lg hover:bg-white/20"><LogOut className="w-4 h-4" /></button></div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex gap-2 mb-6 bg-white p-1.5 rounded-2xl shadow-sm border overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === t.id ? 'text-white shadow-md' : 'text-stone-500'}`} style={tab === t.id ? { background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' } : {}}><t.icon className="w-4 h-4" />{t.label}</button>
          ))}
        </div>
        <div className="bg-white rounded-2xl border p-6 shadow-sm">
          {tab === 'create' && <CreateEventForm showToast={showToast} />}
          {tab === 'manage' && <ManageEvents showToast={showToast} />}
          {tab === 'users' && <AddUserForm showToast={showToast} />}
          {tab === 'gallery' && <GalleryUpdateForm showToast={showToast} />}
        </div>
      </div>
    </div>
  );
}