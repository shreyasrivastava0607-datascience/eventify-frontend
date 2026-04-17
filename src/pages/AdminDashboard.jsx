import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  CalendarPlus, Images, LogOut, CheckSquare, Square, Loader2,
  CheckCircle2, AlertCircle, ChevronDown, X, Menu, UserPlus,
  Settings, Trash2, Edit3, GraduationCap, Upload, Eye, ClipboardList
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
    <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-medium ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
      {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {toast.message}
      <button onClick={onClose}><X className="w-3.5 h-3.5 opacity-70" /></button>
    </div>
  );
}

/* ── Checkbox Group ── */
function CheckboxGroup({ label, options, selected, onChange }) {
  return (
    <div className="space-y-3">
      <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => {
          const active = selected.includes(opt);
          return (
            <button key={opt} type="button" onClick={() => onChange(active ? selected.filter(s => s !== opt) : [...selected, opt])}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${active ? 'text-white border-transparent' : 'bg-white border-stone-200 text-stone-500 hover:border-blue-300'}`}
              style={active ? { background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' } : {}}>
              {active ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />} {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── 1. CREATE EVENT FORM (Now with ALL fields) ── */
function CreateEventForm({ showToast }) {
  const empty = { title: '', description: '', venue: '', date: '', time: '', targetDepartments: [], targetYears: [], eventType: '', registrationLink: '', brochureURL: '', maxParticipants: '' };
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.venue) return showToast('error', 'Title, Date, and Venue are required!');
    setLoading(true);
    try {
      await api.post('/api/events', { 
        ...form, 
        targetYears: form.targetYears.map(Number),
        maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : undefined 
      }, getAuthHeader());
      showToast('success', 'Event Published Successfully!');
      setForm(empty);
    } catch { showToast('error', 'Failed to publish event.'); }
    finally { setLoading(false); }
  };

  const inputCls = "w-full p-4 border border-stone-200 rounded-2xl bg-stone-50 outline-none focus:ring-4 focus:ring-blue-900/5 text-sm font-medium transition-all";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2"><input placeholder="Event Title *" className={inputCls} value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
        <div className="md:col-span-2"><textarea placeholder="Event Description *" className={inputCls + " h-32"} value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
        
        <select className={inputCls} value={form.eventType} onChange={e => setForm({...form, eventType: e.target.value})}>
          <option value="">Select Event Type</option>
          {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        
        <input placeholder="Venue *" className={inputCls} value={form.venue} onChange={e => setForm({...form, venue: e.target.value})} />
        <input type="date" className={inputCls} value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
        <input type="time" className={inputCls} value={form.time} onChange={e => setForm({...form, time: e.target.value})} />
        
        <input placeholder="Max Participants (optional)" type="number" className={inputCls} value={form.maxParticipants} onChange={e => setForm({...form, maxParticipants: e.target.value})} />
        
        {/* RESTORED FIELDS BELOW */}
        <div className="md:col-span-2"><input placeholder="Registration Link (Google Forms URL, etc.)" className={inputCls} value={form.registrationLink} onChange={e => setForm({...form, registrationLink: e.target.value})} /></div>
        <div className="md:col-span-2"><input placeholder="Brochure / Poster Image URL" className={inputCls} value={form.brochureURL} onChange={e => setForm({...form, brochureURL: e.target.value})} /></div>
      </div>

      <CheckboxGroup label="Target Departments" options={DEPARTMENTS} selected={form.targetDepartments} onChange={v => setForm({...form, targetDepartments: v})} />
      <CheckboxGroup label="Target Years" options={YEARS} selected={form.targetYears} onChange={v => setForm({...form, targetYears: v})} />
      
      <button disabled={loading} className="w-full py-4 text-white rounded-2xl font-black shadow-xl transition-all hover:scale-[1.01]" style={{ background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' }}>
        {loading ? 'SYNCING...' : 'PUBLISH CAMPUS EVENT'}
      </button>
    </form>
  );
}

/* ── 2. MANAGE EVENTS (Actual list restored) ── */
function ManageEvents({ showToast }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    try { const { data } = await api.get('/api/events', getAuthHeader()); setEvents(data.data || data); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const del = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      await api.delete(`/api/events/${id}`, getAuthHeader());
      showToast('success', 'Event Deleted!');
      fetch();
    } catch { showToast('error', 'Failed to delete.'); }
  };

  if (loading) return <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-900" /></div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-stone-800 mb-6" style={{ fontFamily: '"Playfair Display", serif' }}>Current Events</h2>
      {events.map(ev => (
        <div key={ev._id} className="p-6 border border-stone-200 rounded-3xl bg-white flex justify-between items-center shadow-sm hover:border-blue-200 transition-all">
          <div>
            <h4 className="font-bold text-stone-800">{ev.title}</h4>
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">
              {new Date(ev.date).toDateString()} • {ev.venue}
            </p>
          </div>
          <button onClick={() => del(ev._id, ev.title)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      {events.length === 0 && <div className="text-center py-10 text-stone-400">No events found.</div>}
    </div>
  );
}

/* ── 3. RSVPS / REGISTRATIONS (Actual Table) ── */
function RegistrationsView() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/events', getAuthHeader()).then(r => setEvents(r.data.data || r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader2 className="animate-spin mx-auto mt-20 text-blue-900" />;

  return (
    <div className="space-y-8">
      {events.map(ev => (
        <div key={ev._id} className="bg-stone-50 p-8 rounded-[40px] border border-stone-100 shadow-inner">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-stone-900 text-lg">{ev.title}</h3>
            <span className="bg-blue-600 text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-md">
              {ev.registeredStudents?.length || 0} Registered
            </span>
          </div>
          <div className="bg-white rounded-[24px] border border-stone-200 overflow-hidden shadow-sm">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 text-stone-400 font-black uppercase tracking-widest border-b border-stone-100">
                <tr><th className="px-6 py-4">Student Name</th><th className="px-6 py-4">Roll Number</th></tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {ev.registeredStudents?.map((s, i) => (
                  <tr key={i} className="hover:bg-blue-50/30">
                    <td className="px-6 py-4 font-bold text-stone-700">{s.name}</td>
                    <td className="px-6 py-4 text-stone-400 font-mono font-bold uppercase">{s.rollNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!ev.registeredStudents || ev.registeredStudents.length === 0) && <div className="text-center py-10 text-stone-300 italic">No registrations for this event yet.</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── 4. ADD USER (Year Bug Fixed) ── */
function AddUserForm({ showToast }) {
  const [form, setForm] = useState({ rollNumber: '', name: '', department: '', year: '', role: 'student' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.rollNumber || !form.department || !form.year) return showToast('error', 'All fields required!');
    setLoading(true);
    try {
      const firstName = form.name.trim().split(' ')[0];
      const pass = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase() + "@123";
      await api.post('/api/auth/create-student', { ...form, year: Number(form.year) }, getAuthHeader());
      showToast('success', `Added! Password: ${pass}`);
      setForm({ rollNumber: '', name: '', department: '', year: '', role: 'student' });
    } catch (err) { showToast('error', err.response?.data?.message || 'Error.'); }
    finally { setLoading(false); }
  };

  const inputCls = "w-full p-4 border border-stone-200 rounded-2xl bg-stone-50 outline-none text-sm font-bold focus:ring-4 focus:ring-blue-900/5 transition-all";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <input placeholder="Full Name" className={inputCls} value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        <input placeholder="Roll Number" className={inputCls} value={form.rollNumber} onChange={e => setForm({...form, rollNumber: e.target.value})} />
        <select className={inputCls} value={form.department} onChange={e => setForm({...form, department: e.target.value})}><option value="">Select Dept</option>{DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}</select>
        <select className={inputCls} value={form.year} onChange={e => setForm({...form, year: e.target.value})}><option value="">Select Year</option>{YEARS.map(y => <option key={y} value={y}>Year {y}</option>)}</select>
      </div>
      <button disabled={loading} className="w-full py-4 text-white rounded-2xl font-black shadow-xl" style={{ background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' }}>
        {loading ? 'ADDING...' : 'ADD USER TO CAMPUS DIRECTORY'}
      </button>
    </form>
  );
}

/* ── 5. GALLERY UPDATE FORM (Actual Form restored) ── */
function GalleryUpdateForm({ showToast }) {
  const [events, setEvents] = useState([]);
  const [sel, setSel] = useState('');
  const [urls, setUrls] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/api/events', getAuthHeader()).then(r => {
        const all = r.data.data || r.data;
        setEvents(all.filter(e => e.status === 'completed'));
    });
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!sel || !urls) return showToast('error', 'Select event and add image URLs.');
    setLoading(true);
    try {
      await api.patch(`/api/events/${sel}/gallery`, { galleryImages: urls.split('\n').filter(u => u.trim()) }, getAuthHeader());
      showToast('success', 'Gallery Updated Successfully!');
      setUrls('');
    } catch { showToast('error', 'Update failed.'); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleUpdate} className="space-y-6">
      <select className="w-full p-4 border border-stone-200 rounded-2xl bg-stone-50 font-bold text-sm" value={sel} onChange={e => setSel(e.target.value)}>
        <option value="">Select Completed Event</option>
        {events.map(ev => <option key={ev._id} value={ev._id}>{ev.title}</option>)}
      </select>
      <textarea placeholder="Image URLs (Paste one URL per line)" className="w-full p-4 border border-stone-200 rounded-2xl bg-stone-50 h-40 font-mono text-xs font-bold" value={urls} onChange={e => setUrls(e.target.value)} />
      <button disabled={loading} className="w-full py-4 text-white rounded-2xl font-black shadow-xl" style={{ background: 'linear-gradient(135deg, #059669, #047857)' }}>
        {loading ? 'UPDATING...' : 'UPDATE EVENT GALLERY'}
      </button>
    </form>
  );
}

/* ── MAIN DASHBOARD COMPONENT ── */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('create');
  const [toast, setToast] = useState(null);
  const user = JSON.parse(localStorage.getItem('eventify_user') || '{}');
  const showToast = (type, message) => { setToast({ type, message }); setTimeout(() => setToast(null), 4000); };

  const TABS = [
    { id: 'create', label: 'Create', icon: CalendarPlus },
    { id: 'manage', label: 'Manage', icon: Settings },
    { id: 'registrations', label: 'RSVPs', icon: ClipboardList },
    { id: 'users', label: 'Directory', icon: UserPlus },
    { id: 'gallery', label: 'Gallery', icon: Images }
  ];

  return (
    <div className="min-h-screen bg-[#f8f7f4] font-sans pb-20">
      <Toast toast={toast} onClose={() => setToast(null)} />
      
      <nav className="text-white px-8 py-5 flex items-center justify-between shadow-2xl sticky top-0 z-30" style={{ background: 'linear-gradient(135deg, #1e3a5f, #162d4a 100%)' }}>
        <div className="flex items-center gap-4">
          <GraduationCap className="w-10 h-10" />
          <span className="font-bold text-2xl tracking-tighter" style={{ fontFamily: '"Playfair Display", serif' }}>Eventify Admin</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-sm font-bold opacity-80 hidden sm:inline">Welcome back, {user.name}</span>
          <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="bg-white/10 p-3 rounded-2xl transition-all hover:bg-white/20 shadow-inner"><LogOut className="w-5 h-5" /></button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 mt-12">
        <div className="flex gap-2 mb-12 bg-white p-2 rounded-[32px] shadow-sm border border-stone-200 overflow-x-auto no-scrollbar">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} 
              className={`flex items-center gap-2 px-8 py-4 rounded-3xl text-[10px] font-black transition-all whitespace-nowrap uppercase tracking-[0.1em]
              ${tab === t.id ? 'text-white shadow-xl scale-[1.05]' : 'text-stone-400 hover:text-stone-600'}`}
              style={tab === t.id ? { background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' } : {}}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-[48px] border border-stone-200 shadow-2xl p-10 lg:p-16">
          {tab === 'create' && <CreateEventForm showToast={showToast} />}
          {tab === 'manage' && <ManageEvents showToast={showToast} />}
          {tab === 'registrations' && <RegistrationsView />}
          {tab === 'users' && <AddUserForm showToast={showToast} />}
          {tab === 'gallery' && <GalleryUpdateForm showToast={showToast} />}
        </div>
      </div>
    </div>
  );
}