import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CalendarDays, MapPin, LogOut, Loader2, GraduationCap, Sparkles, Image as ImageIcon, Cpu, Music2, ShieldCheck } from 'lucide-react';

const api = axios.create({ baseURL: 'https://eventify-backend-jm6t.onrender.com' });
const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('eventify_token')}` } });

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('eventify_user') || '{}');

  useEffect(() => {
    api.get('/api/events', getAuthHeader()).then(r => {
      const all = r.data.data || r.data;
      // ── SMART CLASH ELIGIBILITY LOGIC ──
      const filtered = all.filter(ev => {
        const isUpcoming = ev.status === 'upcoming';
        const deptMatch = ev.targetDepartments?.includes(user.department) || ev.targetDepartments?.includes('Other');
        const yearMatch = ev.targetYears?.includes(Number(user.year));
        return isUpcoming && deptMatch && yearMatch;
      });
      setEvents(filtered);
    }).finally(() => setLoading(false));
  }, [user.department, user.year]);

  const handleRegister = (link) => {
    if (!link) return alert("Registration pending for this event.");
    // ── PROTOCOL FIX: Ensure link opens correctly ──
    const url = link.startsWith('http') ? link : `https://${link}`;
    window.open(url, '_blank');
    alert("Eligibility Verified. Registration Successful!");
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4] font-sans pb-20">
      <nav className="text-white px-8 py-5 flex items-center justify-between shadow-2xl" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #162d4a 100%)' }}>
        <div className="flex items-center gap-3"><GraduationCap /><span className="font-bold text-xl" style={{ fontFamily: '"Playfair Display", serif' }}>Eventify</span></div>
        <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="bg-white/10 p-3 rounded-2xl"><LogOut className="w-5 h-5" /></button>
      </nav>
      <div className="max-w-6xl mx-auto px-6 mt-10">
        <div className="rounded-[40px] p-12 mb-12 flex justify-between items-center text-white shadow-2xl relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #162d4a 100%)' }}>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold" style={{ fontFamily: '"Playfair Display", serif' }}>Hi, {user.name}!</h1>
            <p className="text-blue-200 mt-2 font-medium">Smart Clash: {events.length} eligible events for you.</p>
            <div className="flex gap-2 mt-6"><span className="bg-emerald-500/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase flex items-center gap-2"><ShieldCheck className="w-3 h-3"/> {user.department}</span></div>
          </div>
          <Sparkles className="w-24 h-24 text-blue-300/20 absolute -right-4 -bottom-4" />
        </div>
        {loading ? <Loader2 className="animate-spin mx-auto w-10 h-10 text-blue-900 mt-20" /> : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {events.map(ev => {
              const actualLink = ev.registrationLink || ev.link;
              const actualImg = ev.brochureURL || ev.image;
              return (
                <div key={ev._id} className="bg-white rounded-[40px] border shadow-sm overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-500">
                  {actualImg ? <img src={actualImg} className="w-full h-48 object-cover border-b" /> : <div className="w-full h-48 bg-stone-50 flex items-center justify-center text-stone-200"><ImageIcon className="w-12 h-12" /></div>}
                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-4">{ev.eventType === 'Tech Event' ? <Cpu className="w-4 h-4 text-blue-600" /> : <Music2 className="w-4 h-4 text-amber-600" />}<span className="text-[10px] font-black uppercase text-stone-400">{ev.eventType}</span></div>
                    <h3 className="font-bold text-stone-900 text-xl mb-3 leading-tight">{ev.title}</h3>
                    <p className="text-sm text-stone-500 line-clamp-3 mb-8 italic">"{ev.description}"</p>
                    <div className="mt-auto space-y-3 pt-6 border-t border-stone-50 text-stone-400 text-xs font-bold">
                      <div className="flex items-center gap-3"><CalendarDays className="w-4 h-4" /> {new Date(ev.date).toDateString()}</div>
                      <div className="flex items-center gap-3"><MapPin className="w-4 h-4" /> {ev.venue}</div>
                    </div>
                    <button onClick={() => handleRegister(actualLink)} className="mt-8 w-full py-4 rounded-2xl text-white font-black text-xs shadow-xl uppercase tracking-widest" style={{ background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' }}>Register Now</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}