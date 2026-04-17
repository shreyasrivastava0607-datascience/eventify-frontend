import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  CalendarDays, MapPin, Clock, LogOut, Loader2, 
  ExternalLink, GraduationCap, Sparkles, Image as ImageIcon,
  Cpu, Music2 
} from 'lucide-react';

// ─── THE LIVE CONNECTION ──────────────────────────────────────────────────
const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL || 'https://eventify-backend-jm6t.onrender.com' 
});

const getAuthHeader = () => ({ 
  headers: { Authorization: `Bearer ${localStorage.getItem('eventify_token')}` } 
});

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const user = JSON.parse(localStorage.getItem('eventify_user') || '{}');

  const fetchEvents = useCallback(async () => {
    try {
      const { data } = await api.get('/api/events', getAuthHeader());
      const all = data.data || data;
      // Only show events marked as "upcoming"
      setUpcoming(all.filter(e => e.status === 'upcoming'));
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleRegister = (link) => {
    if (!link) return;
    window.open(link, '_blank');
    alert("Redirecting to Registration Form... Registered Successfully!");
  };

  const filteredEvents = filter === 'All' ? upcoming : upcoming.filter(e => e.eventType === filter);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4] font-sans pb-20">
      {/* Navbar */}
      <nav className="text-white px-8 py-5 flex items-center justify-between shadow-2xl sticky top-0 z-30" 
        style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #162d4a 100%)' }}>
        <div className="flex items-center gap-3">
          <GraduationCap className="w-8 h-8" />
          <span className="font-bold text-xl tracking-tighter" style={{ fontFamily: '"Playfair Display", serif' }}>Eventify</span>
        </div>
        <button onClick={handleLogout} className="bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition-all">
          <LogOut className="w-5 h-5" />
        </button>
      </nav>

      <div className="max-w-6xl mx-auto px-6 mt-10">
        {/* Hero Section */}
        <div className="rounded-[40px] p-10 mb-10 flex justify-between items-center text-white shadow-2xl relative overflow-hidden" 
          style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #162d4a 100%)' }}>
          <div className="relative z-10">
            <h1 className="text-4xl font-bold tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>Hello, {user.name}! 👋</h1>
            <p className="text-blue-200 text-lg mt-3 font-medium opacity-90">{upcoming.length} events tailored for your profile.</p>
            <div className="flex gap-3 mt-6">
              <span className="bg-white/15 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">{user.department}</span>
              <span className="bg-white/15 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">Year {user.year}</span>
            </div>
          </div>
          <Sparkles className="w-32 h-32 text-blue-300/10 absolute -right-6 -bottom-6 rotate-12" />
        </div>

        {/* Filters */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-stone-900" style={{ fontFamily: '"Playfair Display", serif' }}>Explore Events</h2>
          <div className="flex gap-2 p-1 bg-white rounded-2xl border border-stone-200 shadow-sm">
            {['All', 'Tech Event', 'Cultural Event'].map(f => (
              <button key={f} onClick={() => setFilter(f)} 
                className={`px-5 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${filter === f ? 'text-white' : 'text-stone-400'}`}
                style={filter === f ? { background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' } : {}}>{f}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-40 text-center"><Loader2 className="animate-spin mx-auto w-10 h-10 text-blue-900" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map(ev => (
              <div key={ev._id} className="bg-white rounded-[40px] border border-stone-200 shadow-sm overflow-hidden flex flex-col hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                
                {/* ── BROCHURE IMAGE RESTORED ── */}
                {ev.brochureURL ? (
                  <img src={ev.brochureURL} alt="Event Brochure" className="w-full h-52 object-cover border-b border-stone-50" />
                ) : (
                  <div className="w-full h-52 bg-stone-50 flex items-center justify-center text-stone-200">
                    <ImageIcon className="w-12 h-12" />
                  </div>
                )}

                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    {ev.eventType === 'Tech Event' ? <Cpu className="w-4 h-4 text-blue-600" /> : <Music2 className="w-4 h-4 text-amber-600" />}
                    <span className="text-[10px] font-black uppercase tracking-tighter text-stone-400">{ev.eventType}</span>
                  </div>
                  <h3 className="font-bold text-stone-900 text-xl mb-3 leading-tight" style={{ fontFamily: '"Playfair Display", serif' }}>{ev.title}</h3>
                  <p className="text-sm text-stone-500 line-clamp-3 mb-8 leading-relaxed font-medium italic">"{ev.description}"</p>
                  
                  <div className="mt-auto pt-6 border-t border-stone-50 space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-stone-400 text-xs font-bold"><CalendarDays className="w-4 h-4 text-blue-900/30" /> {new Date(ev.date).toDateString()}</div>
                    <div className="flex items-center gap-3 text-stone-400 text-xs font-bold"><MapPin className="w-4 h-4 text-blue-900/30" /> {ev.venue}</div>
                  </div>

                  {/* ── REGISTRATION BUTTON FIXED ── */}
                  {ev.registrationLink ? (
                    <button 
                      onClick={() => handleRegister(ev.registrationLink)}
                      className="w-full py-4 rounded-2xl text-white font-black text-[11px] tracking-widest text-center shadow-lg transition-all hover:brightness-110 active:scale-95 flex items-center justify-center gap-2"
                      style={{ background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' }}
                    >
                      REGISTER FOR EVENT <ExternalLink className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="w-full py-4 bg-stone-100 text-stone-300 rounded-2xl text-center text-[10px] font-black uppercase tracking-widest">Registrations Pending</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}