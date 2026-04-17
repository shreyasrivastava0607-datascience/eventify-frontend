import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  CalendarPlus, Images, LogOut, CheckSquare, Square, Loader2,
  CheckCircle2, AlertCircle, ChevronDown, X, Menu, UserPlus,
  Settings, Trash2, Edit3, GraduationCap, Upload, Eye
} from 'lucide-react';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000' });
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
          <p className="text-xs text-stone-400 mt-1">If empty, students will see "Registrations will open soon"</p>
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

/* ── Manage Events ── */
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
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-stone-50 border-b border-stone-200">
            <div className="flex items-center gap-3">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ev.eventType === 'Tech Event' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                {ev.eventType || 'Event'}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ev.status === 'upcoming' ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-200 text-stone-600'}`}>
                {ev.status}
              </span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => editing === ev._id ? setEditing(null) : startEdit(ev)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all">
                <Edit3 className="w-3.5 h-3.5" /> {editing === ev._id ? 'Cancel' : 'Edit'}
              </button>
              <button onClick={() => handleDelete(ev._id, ev.title)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-all">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-5 py-4">
            {editing === ev._id ? (
              <div className="space-y-3">
                <input value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} placeholder="Title" className={inputCls} />
                <textarea value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" rows={2} className={inputCls + ' resize-none'} />
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" value={editForm.date} onChange={e => setEditForm(p => ({ ...p, date: e.target.value }))} className={inputCls} />
                  <input type="time" value={editForm.time} onChange={e => setEditForm(p => ({ ...p, time: e.target.value }))} className={inputCls} />
                </div>
                <input value={editForm.venue} onChange={e => setEditForm(p => ({ ...p, venue: e.target.value }))} placeholder="Venue" className={inputCls} />
                <input value={editForm.registrationLink} onChange={e => setEditForm(p => ({ ...p, registrationLink: e.target.value }))} placeholder="Registration link (optional)" className={inputCls} />
                <input value={editForm.brochureURL} onChange={e => setEditForm(p => ({ ...p, brochureURL: e.target.value }))} placeholder="Brochure URL (optional)" className={inputCls} />
                <div className="relative">
                  <select value={editForm.status} onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))} className={inputCls + ' appearance-none pr-8'}>
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                </div>
                <button onClick={handleSave} disabled={saving}
                  className="w-full py-2.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' }}>
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : 'Save Changes'}
                </button>
              </div>
            ) : (
              <div>
                <h3 className="font-bold text-stone-800 mb-1">{ev.title}</h3>
                <p className="text-stone-500 text-sm mb-3 line-clamp-2">{ev.description}</p>
                <div className="flex flex-wrap gap-3 text-xs text-stone-500">
                  <span>📅 {ev.date ? new Date(ev.date).toLocaleDateString('en-IN') : 'TBA'}</span>
                  {ev.time && <span>🕐 {ev.time}</span>}
                  <span>📍 {ev.venue}</span>
                  <span>👥 {ev.registeredStudents?.length || 0} registered</span>
                </div>
                {ev.registrationLink && (
                  <a href={ev.registrationLink} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-xs text-blue-700 hover:underline">
                    <Eye className="w-3 h-3" /> View registration link
                  </a>
                )}
              </div>
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
      showToast('success', `User created! Default password: ${form.name.split(' ')[0]}@123`);
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
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <p className="text-xs text-blue-700 font-medium">
          🔑 Default password will be set to <strong>[FirstName@123]</strong> — e.g. if name is "Shreya Srivastava", password = <strong>Shreya@123</strong>
        </p>
        <p className="text-xs text-blue-600 mt-1">The user will be prompted to change it on first login.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Full Name *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Shreya Srivastava" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Roll Number *</label>
          <input value={form.rollNumber} onChange={e => set('rollNumber', e.target.value)} placeholder="e.g. CS2024001" className={inputCls + ' font-mono'} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Department *</label>
          <div className="relative">
            <select value={form.department} onChange={e => set('department', e.target.value)} className={inputCls + ' appearance-none pr-8'}>
              <option value="">— Select —</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Year *</label>
          <div className="relative">
            <select value={form.year} onChange={e => set('year', e.target.value)} className={inputCls + ' appearance-none pr-8'}>
              <option value="">— Select —</option>
              {[1,2,3,4,5].map(y => <option key={y} value={y}>Year {y}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Role</label>
          <div className="relative">
            <select value={form.role} onChange={e => set('role', e.target.value)} className={inputCls + ' appearance-none pr-8'}>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <button type="submit" disabled={loading}
        className="w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' }}>
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : <><UserPlus className="w-4 h-4" /> Create User</>}
      </button>
    </form>
  );
}

/* ── Gallery Update ── */
function GalleryUpdateForm({ showToast }) {
  const [events, setEvents]   = useState([]);
  const [selId, setSelId]     = useState('');
  const [urls, setUrls]       = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    api.get('/api/events', getAuthHeader())
      .then(r => {
        const all = Array.isArray(r.data?.data) ? r.data.data : Array.isArray(r.data) ? r.data : [];
        setEvents(all.filter(e => e.status === 'completed'));
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selId) { showToast('error', 'Please select an event.'); return; }
    const galleryImages = urls.split('\n').map(u => u.trim()).filter(Boolean);
    if (galleryImages.length === 0) { showToast('error', 'Add at least one image URL.'); return; }
    setLoading(true);
    try {
      await api.patch(`/api/events/${selId}/gallery`, { galleryImages }, getAuthHeader());
      showToast('success', 'Gallery updated!');
      setSelId(''); setUrls('');
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update gallery.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Select Completed Event</label>
        {fetching ? (
          <div className="flex items-center gap-2 text-stone-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>
        ) : (
          <div className="relative">
            <select value={selId} onChange={e => setSelId(e.target.value)} className={inputCls + ' appearance-none pr-8'}>
              <option value="">— Choose a completed event —</option>
              {events.map(ev => <option key={ev._id} value={ev._id}>{ev.title} · {new Date(ev.date).toLocaleDateString()}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          </div>
        )}
        {!fetching && events.length === 0 && <p className="text-xs text-stone-400 mt-2">No completed events yet.</p>}
      </div>
      <div>
        <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
          Image URLs <span className="normal-case font-normal text-stone-400">(one per line)</span>
        </label>
        <textarea value={urls} onChange={e => setUrls(e.target.value)}
          placeholder={"https://example.com/photo1.jpg\nhttps://example.com/photo2.jpg"} rows={5}
          className={inputCls + ' font-mono resize-none'} />
        <p className="text-xs text-stone-400 mt-1">{urls.split('\n').filter(u => u.trim()).length} URLs entered</p>
      </div>
      <button type="submit" disabled={loading}
        className="w-full py-3 rounded-xl bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all disabled:opacity-60">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</> : <><Upload className="w-4 h-4" /> Update Gallery</>}
      </button>
    </form>
  );
}

/* ── Main Dashboard ── */
export default function AdminDashboard() {
  const navigate              = useNavigate();
  const [tab, setTab]         = useState('create');
  const [toast, setToast]     = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const user = (() => { try { return JSON.parse(localStorage.getItem('eventify_user') || '{}'); } catch { return {}; } })();
  const showToast = (type, message) => { setToast({ type, message }); setTimeout(() => setToast(null), 4000); };
  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  const TABS = [
    { id: 'create',  label: 'Create Event',  icon: CalendarPlus },
    { id: 'manage',  label: 'Manage Events', icon: Settings },
    { id: 'users',   label: 'Add User',      icon: UserPlus },
    { id: 'gallery', label: 'Gallery',       icon: Images },
  ];

  return (
    <div className="min-h-screen font-sans" style={{ background: '#f8f7f4', fontFamily: '"DM Sans", sans-serif' }}>
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Navbar */}
      <nav className="text-white px-6 py-4 flex items-center justify-between shadow-lg sticky top-0 z-30"
        style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #162d4a 100%)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-base tracking-wide" style={{ fontFamily: '"Playfair Display", serif' }}>Eventify</span>
            <span className="ml-2 text-xs bg-white/15 px-2 py-0.5 rounded-full">Admin</span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <span className="text-sm text-blue-200">Hello, {user.name || 'Admin'} 👋</span>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
        <button className="sm:hidden" onClick={() => setMenuOpen(v => !v)}><Menu className="w-5 h-5" /></button>
      </nav>

      {menuOpen && (
        <div className="sm:hidden text-white px-6 py-3 flex flex-col gap-2"
          style={{ background: 'linear-gradient(135deg, #162d4a, #0f2035)' }}>
          <span className="text-sm text-blue-200">Hello, {user.name || 'Admin'} 👋</span>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm w-fit">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-stone-800" style={{ fontFamily: '"Playfair Display", serif' }}>Admin Dashboard</h1>
          <p className="text-stone-500 text-sm mt-1">Manage campus events, users and galleries</p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-2 mb-6 bg-white border border-stone-200 rounded-2xl p-1.5 shadow-sm overflow-x-auto">
          {TABS.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                  ${active ? 'text-white shadow-md' : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50'}`}
                style={active ? { background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' } : {}}>
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
          {tab === 'create' && (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-bold text-stone-800">Post New Event</h2>
                <p className="text-stone-400 text-xs mt-1">Fill in details. Smart Clash Detection runs automatically.</p>
              </div>
              <CreateEventForm showToast={showToast} />
            </>
          )}
          {tab === 'manage' && (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-bold text-stone-800">Manage Events</h2>
                <p className="text-stone-400 text-xs mt-1">Edit details, update timings, or delete events.</p>
              </div>
              <ManageEvents showToast={showToast} />
            </>
          )}
          {tab === 'users' && (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-bold text-stone-800">Add User</h2>
                <p className="text-stone-400 text-xs mt-1">Create student or admin accounts. Default password = FirstName@123.</p>
              </div>
              <AddUserForm showToast={showToast} />
            </>
          )}
          {tab === 'gallery' && (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-bold text-stone-800">Update Event Gallery</h2>
                <p className="text-stone-400 text-xs mt-1">Add photo URLs to completed events for students to view.</p>
              </div>
              <GalleryUpdateForm showToast={showToast} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
