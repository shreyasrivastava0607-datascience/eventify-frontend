import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  CalendarPlus, Images, LogOut, CheckSquare, Square, Loader2,
  CheckCircle2, AlertCircle, X, UserPlus, Settings, Trash2, 
  GraduationCap, ClipboardList
} from 'lucide-react';

const api = axios.create({ baseURL: 'https://eventify-backend-jm6t.onrender.com' });
const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('eventify_token')}` } });

const DEPARTMENTS = ['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'BBA', 'MBA', 'MCA', 'BCA', 'BSC', 'Other'];
const YEARS = [1, 2, 3, 4, 5];

/* ── UI Components ── */
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

function CheckboxGroup({ label, options, selected, onChange }) {
  return (
    <div className="space-y-3">
      <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => {
          const active = selected.includes(opt);
          return (
            <button key={opt} type="button" onClick={() => onChange(active ? selected.filter(s => s !== opt) : [...selected, opt])}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${active ? 'text-white border-transparent shadow-md' : 'bg-white border-stone-200 text-stone-400 hover:border-blue-200'}`}
              style={active ? { background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' } : {}}>
              {active ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />} {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── TAB: CREATE EVENT ── */
function CreateEventForm({ showToast }) {
  const [form, setForm] = useState({ title: '', description: '', venue: '', date: '', time: '', targetDepartments: [], targetYears: [], eventType: '', registrationLink: '', brochureURL: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.venue) return showToast('error', 'Required fields missing!');
    
    setLoading(true);
    try {
      // 100% Fail-Safe Data Mapping for backend compatibility
      const eventData = { 
        ...form, 
        link: form.registrationLink, 
        image: form.brochureURL,
        registrationLink: form.registrationLink,
        brochureURL: form.brochureURL,
        targetYears: form.targetYears.map(Number) 
      };

      await api.post('/api/events', eventData, getAuthHeader());
      showToast('success', 'Event Published Successfully!');
      setForm({ title: '', description: '', venue: '', date: '', time: '', targetDepartments: [], targetYears: [], eventType: '', registrationLink: '', brochureURL: '' });
    } catch { 
      showToast('error', 'Failed to publish event. Check connection.'); 
    } finally { 
      setLoading(false); 
    }
  };

  const inputCls = "w-full p-4 border border-stone-200 rounded-2xl bg-stone-50 font-bold text-sm outline-none focus:ring-4 focus:ring-blue-900/5 transition-all";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <input placeholder="Event Title *" className={inputCls} value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
        <select className={inputCls} value={form.eventType} onChange={e => setForm({...form, eventType: e.target.value})}><option value="">Select Event Type</option><option value="Tech Event">Tech Event</option><option value="Cultural Event">Cultural Event</option></select>
        <textarea placeholder="Event Description *" className={`md:col-span-2 h-32 ${inputCls}`} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
        <input placeholder="Venue *" className={inputCls} value={form.venue} onChange={e => setForm({...form, venue: e.target.value})} />
        <input type="date" className={inputCls} value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
        <input type="time" className={inputCls} value={form.time} onChange={e => setForm({...form, time: e.target.value})} />
        <input placeholder="Registration Link (Google Forms etc.)" className={`md:col-span-2 ${inputCls}`} value={form.registrationLink} onChange={e => setForm({...form, registrationLink: e.target.value})} />
        <input placeholder="Brochure Image URL (Direct Link)" className={`md:col-span-2 ${inputCls}`} value={form.brochureURL} onChange={e => setForm({...form, brochureURL: e.target.value})} />
      </div>
      
      <CheckboxGroup label="Target Departments (Smart Clash Filter)" options={DEPARTMENTS} selected={form.targetDepartments} onChange={v => setForm({...form, targetDepartments: v})} />
      <CheckboxGroup label="Target Academic Years" options={YEARS} selected={form.targetYears} onChange={v => setForm({...form, targetYears: v})} />
      
      <button disabled={loading} className="w-full py-5 text-white rounded-3xl font-black shadow-xl uppercase tracking-widest transition-all hover:scale-[1.01]" style={{ background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' }}>
        {loading ? <Loader2 className="animate-spin mx-auto w-6 h-6" /> : 'PUBLISH EVENT'}
      </button>
    </form>
  );
}

/* ── TAB: MANAGE EVENTS ── */
function ManageEvents({ showToast }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/events', getAuthHeader())
      .then(r => setEvents(r.data.data || r.data))
      .finally(() => setLoading(false));
  }, []);

  const del = async (id, title) => {
    if (!window.confirm(`Permanently delete "${title}"?`)) return;
    try {
      await api.delete(`/api/events/${id}`, getAuthHeader());
      showToast('success', 'Event Deleted!');
      setEvents(events.filter(e => e._id !== id));
    } catch { showToast('error', 'Deletion failed.'); }
  };

  if (loading) return <Loader2 className="animate-spin mx-auto text-blue-900 mt-20 w-10 h-10" />;

  return (
    <div className="space-y-4">
      {events.map(ev => (
        <div key={ev._id} className="p-6 border border-stone-200 rounded-[32px] bg-white flex justify-between items-center shadow-sm hover:border-blue-200 transition-all">
          <div>
            <h4 className="font-bold text-stone-800">{ev.title}</h4>
            <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest mt-1">{new Date(ev.date).toDateString()} • {ev.venue}</p>
          </div>
          <button onClick={() => del(ev._id, ev.title)} className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><Trash2 className="w-5 h-5" /></button>
        </div>
      ))}
      {events.length === 0 && <div className="text-center py-10 text-stone-400 italic font-medium">No events found in the database.</div>}
    </div>
  );
}

/* ── TAB: RSVPS / REGISTRATIONS ── */
function RegistrationsView() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/events', getAuthHeader())
      .then(r => setEvents(r.data.data || r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader2 className="animate-spin mx-auto text-blue-900 mt-20 w-10 h-10" />;

  return (
    <div className="space-y-8">
      {events.map(ev => (
        <div key={ev._id} className="bg-stone-50 p-6 rounded-[32px] border border-stone-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-stone-900">{ev.title}</h3>
            <span className="bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase">{ev.registeredStudents?.length || 0} RSVPs</span>
          </div>
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 text-stone-400 font-black uppercase tracking-widest border-b">
                <tr><th className="px-6 py-4">Student Name</th><th className="px-6 py-4">Roll Number</th></tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {ev.registeredStudents?.map((s, i) => (
                  <tr key={i} className="hover:bg-stone-50 transition-colors"><td className="px-6 py-4 font-bold text-stone-800">{s.name}</td><td className="px-6 py-4 font-mono text-stone-500">{s.rollNumber}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── TAB: ADD STUDENT ── */
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
      showToast('success', `User Created! Default Password: ${pass}`);
      setForm({ rollNumber: '', name: '', department: '', year: '', role: 'student' });
    } catch (err) { 
      showToast('error', err.response?.data?.message || 'Failed to create user.'); 
    } finally { setLoading(false); }
  };

  const inputCls = "w-full p-4 border border-stone-200 rounded-2xl bg-stone-50 font-bold text-sm outline-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <input placeholder="Full Name" className={inputCls} value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        <input placeholder="Roll Number" className={inputCls} value={form.rollNumber} onChange={e => setForm({...form, rollNumber: e.target.value})} />
        <select className={inputCls} value={form.department} onChange={e => setForm({...form, department: e.target.value})}><option value="">Select Department</option>{DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}</select>
        <select className={inputCls} value={form.year} onChange={e => setForm({...form, year: e.target.value})}><option value="">Select Year</option>{YEARS.map(y => <option key={y} value={y}>Year {y}</option>)}</select>
      </div>
      <button disabled={loading} className="w-full py-5 text-white rounded-3xl font-black shadow-xl uppercase tracking-widest" style={{ background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' }}>{loading ? 'ADDING...' : 'ADD STUDENT TO DIRECTORY'}</button>
    </form>
  );
}

/* ── MAIN LAYOUT ── */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('create');
  const [toast, setToast] = useState(null);
  const user = JSON.parse(localStorage.getItem('eventify_user') || '{}');
  const showToast = (type, message) => { setToast({ type, message }); setTimeout(() => setToast(null), 4000); };

  const TABS = [
    { id: 'create', label: 'Create Event', icon: CalendarPlus }, 
    { id: 'manage', label: 'Manage Events', icon: Settings }, 
    { id: 'registrations', label: 'RSVPs', icon: ClipboardList }, 
    { id: 'users', label: 'Directory', icon: UserPlus }
  ];

  return (
    <div className="min-h-screen bg-[#f8f7f4] font-sans pb-20">
      <Toast toast={toast} onClose={() => setToast(null)} />
      
      <nav className="text-white px-8 py-5 flex items-center justify-between shadow-2xl sticky top-0 z-30" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #162d4a 100%)' }}>
        <div className="flex items-center gap-4">
          <GraduationCap className="w-10 h-10" />
          <span className="font-bold text-2xl tracking-tighter" style={{ fontFamily: '"Playfair Display", serif' }}>Eventify Admin</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-sm font-bold opacity-80 hidden md:block">Welcome, {user.name}</span>
          <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="bg-white/10 p-3 rounded-2xl hover:bg-white/20 transition-all"><LogOut className="w-5 h-5" /></button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 mt-10">
        <div className="flex gap-3 mb-10 bg-white p-3 rounded-[32px] shadow-sm border border-stone-200 overflow-x-auto no-scrollbar">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-8 py-4 rounded-3xl text-[11px] font-black transition-all whitespace-nowrap uppercase tracking-widest ${tab === t.id ? 'text-white shadow-xl scale-[1.02]' : 'text-stone-400 hover:text-stone-600'}`} style={tab === t.id ? { background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' } : {}}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-[48px] border border-stone-200 shadow-2xl p-10 lg:p-16">
          {tab === 'create' && <CreateEventForm showToast={showToast} />}
          {tab === 'manage' && <ManageEvents showToast={showToast} />}
          {tab === 'registrations' && <RegistrationsView />}
          {tab === 'users' && <AddUserForm showToast={showToast} />}
        </div>
      </div>
    </div>
  );
}