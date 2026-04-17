import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  CalendarPlus, Images, LogOut, CheckSquare, Square, Loader2,
  CheckCircle2, AlertCircle, ChevronDown, X, Menu, UserPlus,
  Settings, Trash2, Edit3, GraduationCap, Upload, Eye
} from 'lucide-react';

// ─── THE ONLY CHANGE: Pointing to Render ────────────────────────────────────
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'https://eventify-backend-jm6t.onrender.com' });
const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('eventify_token')}` } });

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
      {selected.length > 0 && <p className="text-xs text-blue-700 mt-1.5 font-medium">{selected.length} selected</p>}
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
      showToast('error', 'Title, Description, Date and Venue are required.'); return;
    }
    if (!form.eventType) { showToast('error', 'Please select an event type.'); return; }
    if (form.targetDepartments.length === 0 || form.targetYears.length === 0) {
      showToast('error', 'Select at least one department and one year.'); return;
    }
    setLoading(true);
    try {
      await api.post('/api/events', {
        ...form,
        targetYears: form.targetYears.map(y => Number(y)),
        maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : undefined,
      }, getAuthHeader());
      showToast('success', 'Event created successfully!');
      setForm(empty);
      onCreated?.();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to create event.');
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
          <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Annual Tech Fest 2026" className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Description *</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe the event…" rows={3} className={inputCls + ' resize-none'} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Event Type *</label>
          <div className="relative">
            <select value={form.eventType} onChange={e => set('eventType', e.target.value)} className={inputCls + ' appearance-none pr-8'}>
              <option value="">— Select type —</option>
              {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Venue *</label>
          <input value={form.venue} onChange={e => set('venue', e.target.value)} placeholder="e.g. Main Auditorium" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Date *</label>
          <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Time</label>
          <input type="time" value={form.time} onChange={e => set('time', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Max Participants</label>
          <input type="number" value={form.maxParticipants} onChange={e => set('maxParticipants', e.target.value)} placeholder="e.g. 200" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Registration Link <span className="normal-case font-normal text-stone-400">(optional)</span></label>
          <input value={form.registrationLink} onChange={e => set('registrationLink', e.target.value)} placeholder="https://forms.google.com/..." className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Brochure / Poster URL <span className="normal-case font-normal text-stone-400">(optional)</span></label>
          <input value={form.brochureURL} onChange={e => set('brochureURL', e.target.value)} placeholder="https://example.com/brochure.jpg" className={inputCls} />
        </div>
      </div>
      <CheckboxGroup label="Target Departments * (Smart Clash Filter)" options={DEPARTMENTS} selected={form.targetDepartments} onChange={v => set('targetDepartments', v)} />
      <CheckboxGroup label="Target Years * — 1=First, 2=Second, 3=Third, 4=Fourth, 5=Postgrad" options={YEARS} selected={form.targetYears} onChange={v => set('targetYears', v)} />
      <button type="submit" disabled={loading}
        className="w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' }}>
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : <><CalendarPlus className="w-4 h-4" /> Create Event</>}
      </button>
    </form>
  );
}

/* ── Manage Events (RESTORING ORIGINAL) ── */
function ManageEvents({ showToast }) {
  const [events, setEvents]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving]     = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/events', getAuthHeader());
      const all = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      setEvents(all);
    } catch { showToast('error', 'Failed to load events.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/events/${id}`, getAuthHeader());
      showToast('success', 'Event deleted.');
      fetchEvents();
    } catch { showToast('error', 'Failed to delete event.'); }
  };

  const startEdit = (ev) => {
    setEditing(ev._id);
    setEditForm({
      title: ev.title,
      description: ev.description,
      date: ev.date?.slice(0, 10) || '',
      time: ev.time || '',
      venue: ev.venue,
      registrationLink: ev.registrationLink || '',
      brochureURL: ev.brochureURL || '',
      status: ev.status,
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/api/events/${editing}`, editForm, getAuthHeader());
      showToast('success', 'Event updated!');
      setEditing(null);
      fetchEvents();
    } catch { showToast('error', 'Failed to update event.'); }
    finally { setSaving(false); }
  };

  const inputCls = "w-full px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900";

  if (loading) return <div className="flex items-center gap-2 text-stone-400 py-8 justify-center"><Loader2 className="w-5 h-5 animate-spin" /> Loading events…</div>;
  if (events.length === 0) return <div className="text-center py-12 text-stone-400"><CalendarPlus className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No events yet. Create one!</p></div>;

  return (
    <div className="space-y-4">
      {events.map(ev => (
        <div key={ev._id} className="border border-stone-200 rounded-2xl overflow-hidden bg-white">
          <div className="flex items-center justify-between px-5 py-4 bg-stone-50 border-b border-stone-200">
            <div className="flex items-center gap-3">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ev.eventType === 'Tech Event' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{ev.eventType || 'Event'}</span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ev.status === 'upcoming' ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-200 text-stone-600'}`}>{ev.status}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => editing === ev._id ? setEditing(null) : startEdit(ev)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all">
                <Edit3 className="w-3.5 h-3.5" /> {editing === ev._id ? 'Cancel' : 'Edit'}
              </button>
              <button onClick={() => handleDelete(ev._id, ev.title)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-all"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
            </div>
          </div>
          <div className="px-5 py-4">
            {editing === ev._id ? (
              <div className="space-y-3">
                <input value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} placeholder="Title" className={inputCls} />
                <textarea value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" rows={2} className={inputCls + ' resize-none'} />
                <div className="grid grid-cols-2 gap-3"><input type="date" value={editForm.date} onChange={e => setEditForm(p => ({ ...p, date: e.target.value }))} className={inputCls} /><input type="time" value={editForm.time} onChange={e => setEditForm(p => ({ ...p, time: e.target.value }))} className={inputCls} /></div>
                <input value={editForm.venue} onChange={e => setEditForm(p => ({ ...p, venue: e.target.value }))} placeholder="Venue" className={inputCls} />
                <button onClick={handleSave} disabled={saving} className="w-full py-2.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60" style={{ background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' }}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}</button>
              </div>
            ) : (
              <div><h3 className="font-bold text-stone-800 mb-1">{ev.title}</h3><p className="text-stone-500 text-sm mb-3 line-clamp-2">{ev.description}</p><div className="flex flex-wrap gap-3 text-xs text-stone-500"><span>📅 {ev.date ? new Date(ev.date).toLocaleDateString('en-IN') : 'TBA'}</span><span>📍 {ev.venue}</span><span>👥 {ev.registeredStudents?.length || 0} registered</span></div></div>
            )}
          </div>
        </div>
      ))}
    </div>
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
    if (!form.rollNumber || !form.name || !form.department || !form.year) { showToast('error', 'All fields are required.'); return; }
    setLoading(true);
    try { await api.post('/api/auth/create-student', { ...form, year: Number(form.year) }, getAuthHeader()); showToast('success', `User created!`); setForm(empty); }
    catch (err) { showToast('error', err.response?.data?.message || 'Failed to create user.'); }
    finally { setLoading(false); }
  };
  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900";
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4"><p className="text-xs text-blue-700 font-medium">🔑 Default password will be set to [FirstName@123]</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Full Name *</label><input value={form.name} onChange={e => set('name', e.target.value)} className={inputCls} /></div>
        <div><label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Roll Number *</label><input value={form.rollNumber} onChange={e => set('rollNumber', e.target.value)} className={inputCls} /></div>
        <div><label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Department *</label><select value={form.department} onChange={e => set('department', e.target.value)} className={inputCls}>{DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
        <div><label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Year *</label><select value={form.year} onChange={e => set('year', e.target.value)} className={inputCls}>{[1,2,3,4,5].map(y => <option key={y} value={y}>Year {y}</option>)}</select></div>
      </div>
      <button type="submit" disabled={loading} className="w-full py-3 rounded-xl text-white font-semibold text-sm bg-blue-900" style={{ background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' }}>{loading ? 'Creating…' : 'Create User'}</button>
    </form>
  );
}

/* ── Gallery Update (RESTORING ORIGINAL) ── */
function GalleryUpdateForm({ showToast }) {
  const [events, setEvents]   = useState([]);
  const [selId, setSelId]     = useState('');
  const [urls, setUrls]       = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    api.get('/api/events', getAuthHeader())
      .then(r => { const all = Array.isArray(r.data?.data) ? r.data.data : Array.isArray(r.data) ? r.data : []; setEvents(all.filter(e => e.status === 'completed')); })
      .finally(() => setFetching(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selId) { showToast('error', 'Please select an event.'); return; }
    const galleryImages = urls.split('\n').map(u => u.trim()).filter(Boolean);
    setLoading(true);
    try { await api.patch(`/api/events/${selId}/gallery`, { galleryImages }, getAuthHeader()); showToast('success', 'Gallery updated!'); setSelId(''); setUrls(''); }
    catch { showToast('error', 'Failed to update gallery.'); }
    finally { setLoading(false); }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900";
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div><label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Select Completed Event</label><select value={selId} onChange={e => setSelId(e.target.value)} className={inputCls}>{events.map(ev => <option key={ev._id} value={ev._id}>{ev.title}</option>)}</select></div>
      <div><label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Image URLs (one per line)</label><textarea value={urls} onChange={e => setUrls(e.target.value)} rows={5} className={inputCls + ' font-mono resize-none'} /></div>
      <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-emerald-700 text-white font-semibold text-sm" style={{ background: 'linear-gradient(135deg, #059669, #047857)' }}>{loading ? 'Updating…' : 'Update Gallery'}</button>
    </form>
  );
}

/* ── Main Dashboard (RESTORING ORIGINAL) ── */
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
    <div className="min-h-screen bg-stone-50 font-sans" style={{ fontFamily: '"DM Sans", sans-serif' }}>
      <Toast toast={toast} onClose={() => setToast(null)} />
      <nav className="text-white px-6 py-4 flex items-center justify-between shadow-lg sticky top-0 z-30" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #162d4a 100%)' }}>
        <div className="flex items-center gap-3"><GraduationCap className="w-8 h-8" /><span className="font-bold text-xl" style={{ fontFamily: '"Playfair Display", serif' }}>Eventify</span><span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Admin</span></div>
        <div className="flex items-center gap-4"><span className="text-sm">Hello, {user.name || 'Admin'} 👋</span><button onClick={handleLogout} className="bg-white/10 p-2 rounded-lg hover:bg-white/20 transition-all"><LogOut className="w-4 h-4" /></button></div>
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