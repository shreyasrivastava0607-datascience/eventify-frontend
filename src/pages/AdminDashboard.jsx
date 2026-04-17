import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  CalendarPlus, Images, LogOut, CheckSquare, Square, Loader2,
  CheckCircle2, AlertCircle, ChevronDown, X, Menu, UserPlus,
  Settings, Trash2, Edit3, GraduationCap, Upload, Eye
} from 'lucide-react';

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
  const empty = {
    title: '', description: '', venue: '', date: '', time: '',
    targetDepartments: [], targetYears: [], maxParticipants: '',
    eventType: '', registrationLink: '', brochureURL: '',
  };
  const [form, setForm]   = useState(empty);
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.venue || !form.description) {
      showToast('error', 'Required fields missing.'); return;
    }
    setLoading(true);
    try {
      await api.post('/api/events', {
        ...form,
        targetYears: form.targetYears.map(y => Number(y)),
      }, getAuthHeader());
      showToast('success', 'Event created!');
      setForm(empty);
      onCreated?.();
    } catch (err) {
      showToast('error', 'Failed to create event.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Event Title *</label>
          <input value={form.title} onChange={e => set('title', e.target.value)} className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Description *</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} className={inputCls + ' resize-none'} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Event Type *</label>
          <select value={form.eventType} onChange={e => set('eventType', e.target.value)} className={inputCls}>
            <option value="">— Select —</option>
            {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Venue *</label>
          <input value={form.venue} onChange={e => set('venue', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Date *</label>
          <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Time</label>
          <input type="time" value={form.time} onChange={e => set('time', e.target.value)} className={inputCls} />
        </div>
      </div>
      <CheckboxGroup label="Target Departments *" options={DEPARTMENTS} selected={form.targetDepartments} onChange={v => set('targetDepartments', v)} />
      <CheckboxGroup label="Target Years *" options={YEARS} selected={form.targetYears} onChange={v => set('targetYears', v)} />
      <button type="submit" disabled={loading} className="w-full py-3 rounded-xl text-white font-semibold text-sm bg-blue-900 hover:bg-blue-800 disabled:opacity-60">
        {loading ? 'Creating...' : 'Create Event'}
      </button>
    </form>
  );
}

/* ── Add User Form ── */
function AddUserForm({ showToast }) {
  const empty = { rollNumber: '', name: '', department: '', year: '', role: 'student' };
  const [form, setForm]   = useState(empty);
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.rollNumber || !form.name || !form.department || !form.year) {
      showToast('error', 'All fields are required.'); return;
    }
    setLoading(true);
    try {
      await api.post('/api/auth/create-student', {
        rollNumber:  form.rollNumber.trim(),
        name:        form.name.trim(),
        department:  form.department,
        year:        Number(form.year),
        role:        form.role,
      }, getAuthHeader());
      showToast('success', `User created!`);
      setForm(empty);
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to create user.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Full Name *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Roll Number *</label>
          <input value={form.rollNumber} onChange={e => set('rollNumber', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Department *</label>
          <select value={form.department} onChange={e => set('department', e.target.value)} className={inputCls}>
            <option value="">— Select —</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Year *</label>
          <select value={form.year} onChange={e => set('year', e.target.value)} className={inputCls}>
            <option value="">— Select —</option>
            {[1,2,3,4,5].map(y => <option key={y} value={y}>Year {y}</option>)}
          </select>
        </div>
      </div>
      <button type="submit" disabled={loading} className="w-full py-3 rounded-xl text-white font-semibold text-sm bg-blue-900 hover:bg-blue-800 disabled:opacity-60">
        {loading ? 'Creating...' : 'Create User'}
      </button>
    </form>
  );
}

/* ── Main Dashboard ── */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('create');
  const [toast, setToast] = useState(null);
  const showToast = (type, message) => { setToast({ type, message }); setTimeout(() => setToast(null), 4000); };
  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <nav className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="font-bold">Eventify Admin</div>
        <button onClick={handleLogout} className="text-sm bg-white/10 px-3 py-1.5 rounded-lg">Logout</button>
      </nav>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('create')} className={`px-4 py-2 rounded-xl text-sm font-semibold ${tab === 'create' ? 'bg-blue-900 text-white' : 'bg-white text-stone-500'}`}>Create Event</button>
          <button onClick={() => setTab('users')} className={`px-4 py-2 rounded-xl text-sm font-semibold ${tab === 'users' ? 'bg-blue-900 text-white' : 'bg-white text-stone-500'}`}>Add User</button>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
          {tab === 'create' ? <CreateEventForm showToast={showToast} /> : <AddUserForm showToast={showToast} />}
        </div>
      </div>
    </div>
  );
}