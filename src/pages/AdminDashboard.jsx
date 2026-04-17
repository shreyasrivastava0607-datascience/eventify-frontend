import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CalendarPlus, Images, LogOut, CheckSquare, Square, Loader2, CheckCircle2, AlertCircle, X, UserPlus, Settings, Trash2, GraduationCap, ClipboardList } from 'lucide-react';

const api = axios.create({ baseURL: 'https://eventify-backend-jm6t.onrender.com' });
const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('eventify_token')}` } });

const DEPARTMENTS = ['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'BBA', 'MBA', 'MCA', 'BCA', 'BSC', 'Other'];
const YEARS = [1, 2, 3, 4, 5];

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
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${active ? 'text-white border-transparent' : 'bg-white border-stone-200 text-stone-400'}`}
              style={active ? { background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' } : {}}>
              {active ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />} {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── TAB: CREATE ── */
function CreateEventForm({ showToast }) {
  const [form, setForm] = useState({ title: '', description: '', venue: '', date: '', time: '', targetDepartments: [], targetYears: [], eventType: '', registrationLink: '', brochureURL: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // REDUNDANCY: Map fields to both common naming styles
      const payload = { 
        ...form, 
        link: form.registrationLink, 
        image: form.brochureURL, 
        targetYears: form.targetYears.map(Number) 
      };
      await api.post('/api/events', payload, getAuthHeader());
      showToast('success', 'Smart Clash Verified: Event Published!');
      setForm({ title: '', description: '', venue: '', date: '', time: '', targetDepartments: [], targetYears: [], eventType: '', registrationLink: '', brochureURL: '' });
    } catch { showToast('error', 'Sync Failed.'); }
    finally { setLoading(false); }
  };

  const inputCls = "w-full p-4 border rounded-2xl bg-stone-50 font-bold text-sm focus:ring-4 focus:ring-blue-900/5 transition-all outline-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input placeholder="Event Title" className={inputCls} value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
        <select className={inputCls} value={form.eventType} onChange={e => setForm({...form, eventType: e.target.value})}><option value="">Type</option><option value="Tech Event">Tech Event</option><option value="Cultural Event">Cultural Event</option></select>
        <textarea placeholder="Description" className="md:col-span-2 w-full p-4 border rounded-2xl bg-stone-50 font-bold text-sm h-24" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
        <input placeholder="Venue" className={inputCls} value={form.venue} onChange={e => setForm({...form, venue: e.target.value})} />
        <input type="date" className={inputCls} value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
        <input placeholder="Reg Link (Forms)" className="md:col-span-2 p-4 border rounded-2xl bg-stone-50 font-bold text-sm" value={form.registrationLink} onChange={e => setForm({...form, registrationLink: e.target.value})} />
        <input placeholder="Brochure Image URL" className="md:col-span-2 p-4 border rounded-2xl bg-stone-50 font-bold text-sm" value={form.brochureURL} onChange={e => setForm({...form, brochureURL: e.target.value})} />
      </div>
      <CheckboxGroup label="Target Departments" options={DEPARTMENTS} selected={form.targetDepartments} onChange={v => setForm({...form, targetDepartments: v})} />
      <CheckboxGroup label="Target Years" options={YEARS} selected={form.targetYears} onChange={v => setForm({...form, targetYears: v})} />
      <button disabled={loading} className="w-full py-5 text-white rounded-3xl font-black shadow-xl" style={{ background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' }}>{loading ? 'SYNCING...' : 'PUBLISH TO CAMPUS'}</button>
    </form>
  );
}

/* ── TAB: MANAGE ── */
function ManageEvents({ showToast }) {
  const [events, setEvents] = useState([]);
  useEffect(() => { api.get('/api/events', getAuthHeader()).then(r => setEvents(r.data.data || r.data)); }, []);
  const del = async (id) => { if (window.confirm('Delete Event?')) { await api.delete(`/api/events/${id}`, getAuthHeader()); window.location.reload(); } };
  return (
    <div className="space-y-4">
      {events.map(ev => (
        <div key={ev._id} className="p-6 border rounded-[32px] flex justify-between items-center bg-white shadow-sm">
          <div><h4 className="font-bold">{ev.title}</h4><p className="text-[10px] font-black text-stone-300 uppercase">{ev.venue} • {new Date(ev.date).toDateString()}</p></div>
          <button onClick={() => del(ev._id)} className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
        </div>
      ))}
    </div>
  );
}

/* ── MAIN ADMIN ── */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('create');
  const [toast, setToast] = useState(null);
  const showToast = (type, message) => { setToast({ type, message }); setTimeout(() => setToast(null), 4000); };
  return (
    <div className="min-h-screen bg-[#f8f7f4] font-sans pb-20">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <nav className="text-white px-8 py-5 flex items-center justify-between shadow-2xl" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #162d4a 100%)' }}>
        <div className="flex items-center gap-4"><GraduationCap className="w-10 h-10" /><span className="font-bold text-2xl" style={{ fontFamily: '"Playfair Display", serif' }}>Eventify Admin</span></div>
        <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="bg-white/10 p-3 rounded-2xl"><LogOut className="w-5 h-5" /></button>
      </nav>
      <div className="max-w-5xl mx-auto px-4 mt-10">
        <div className="flex gap-2 mb-10 bg-white p-2 rounded-full shadow-sm">
          {['create', 'manage', 'registrations'].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-10 py-3 rounded-full text-[10px] font-black uppercase transition-all ${tab === t ? 'text-white' : 'text-stone-400'}`} style={tab === t ? { background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' } : {}}>{t}</button>
          ))}
        </div>
        <div className="bg-white rounded-[48px] shadow-2xl p-12">
          {tab === 'create' && <CreateEventForm showToast={showToast} />}
          {tab === 'manage' && <ManageEvents showToast={showToast} />}
        </div>
      </div>
    </div>
  );
}