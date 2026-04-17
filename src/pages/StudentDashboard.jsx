import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CalendarDays, MapPin, Users, Clock, LogOut, Loader2, Sparkles, GraduationCap, Cpu, Music2, ExternalLink } from 'lucide-react';

const api = axios.create({ baseURL: 'https://eventify-backend-jm6t.onrender.com' });
const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('eventify_token')}` } });

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('eventify_user') || '{}');

  useEffect(() => {
    api.get('/api/events', getAuthHeader()).then(r => setUpcoming((r.data.data || r.data).filter(e => e.status === 'upcoming'))).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f7f4] font-sans pb-20">
      <nav className="text-white px-8 py-5 flex items-center justify-between shadow-2xl sticky top-0 z-30" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #162d4a 100%)' }}>
        <div className="flex items-center gap-3"><GraduationCap /><span className="font-bold text-xl" style={{ fontFamily: '"Playfair Display", serif' }}>Eventify</span></div>
        <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="bg-white/10 p-3 rounded-2xl"><LogOut className="w-5 h-5" /></button>
      </nav>

      <div className="max-w-6xl mx-auto px-6 mt-10">
        <div className="rounded-[40px] p-10 mb-10 flex justify-between items-center text-white shadow-2xl relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #162d4a 100%)' }}>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold" style={{ fontFamily: '"Playfair Display", serif' }}>Hello, {user.name}! 👋</h1>
            <p className="text-blue-200 text-lg mt-2 font-medium">{upcoming.length} events matching your profile.</p>
            <div className="flex gap-2 mt-4"><span className="bg-white/15 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">{user.department}</span><span className="bg-white/15 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">Year {user.year}</span></div>
          </div>
          <Sparkles className="w-24 h-24 text-blue-300/20 absolute -right-4 -bottom-4" />
        </div>

        {loading ? <div className="py-40 text-center"><Loader2 className="animate-spin mx-auto w-10 h-10 text-blue-900" /></div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcoming.map(ev => (
              <div key={ev._id} className="bg-white p-8 rounded-[36px] border border-stone-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                   {ev.eventType === 'Tech Event' ? <Cpu className="w-4 h-4 text-blue-600" /> : <Music2 className="w-4 h-4 text-amber-600" />}
                   <span className="text-[10px] font-black uppercase tracking-tighter text-stone-400">{ev.eventType}</span>
                </div>
                <h3 className="font-bold text-stone-800 text-xl mb-3 leading-tight">{ev.title}</h3>
                <p className="text-sm text-stone-500 line-clamp-3 mb-6 leading-relaxed">{ev.description}</p>
                <div className="mt-auto pt-6 border-t border-stone-100 space-y-3">
                  <div className="flex items-center gap-3 text-stone-400 text-xs font-bold"><CalendarDays className="w-4 h-4" /> {new Date(ev.date).toDateString()}</div>
                  <div className="flex items-center gap-3 text-stone-400 text-xs font-bold"><MapPin className="w-4 h-4" /> {ev.venue}</div>
                </div>
                {ev.registrationLink && <a href={ev.registrationLink} className="mt-6 w-full py-3.5 rounded-2xl text-white font-bold text-sm text-center shadow-lg" style={{ background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' }}>Register Now</a>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}