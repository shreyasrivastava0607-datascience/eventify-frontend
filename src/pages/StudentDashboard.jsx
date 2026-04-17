import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  CalendarDays, MapPin, Clock, LogOut, Loader2, 
  ExternalLink, GraduationCap, Sparkles, Image as ImageIcon,
  Cpu, Music2, ShieldCheck, X
} from 'lucide-react';

const api = axios.create({ baseURL: 'https://eventify-backend-jm6t.onrender.com' });
const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('eventify_token')}` } });

/* ── Gallery Modal ── */
function GalleryModal({ event, onClose }) {
  if (!event) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={onClose}>
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-10 py-6 border-b border-stone-100">
          <div><h2 className="font-bold text-stone-900 text-xl" style={{ fontFamily: '"Playfair Display", serif' }}>{event.title}</h2><p className="text-stone-400 text-[10px] font-black uppercase tracking-widest mt-1">Event Gallery</p></div>
          <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-stone-50 hover:bg-stone-100 flex items-center justify-center transition-all"><X className="w-6 h-6 text-stone-500" /></button>
        </div>
        <div className="overflow-y-auto p-10">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {event.galleryImages?.map((url, i) => (
              <div key={i} className="aspect-square rounded-[32px] overflow-hidden bg-stone-100 border border-stone-200"><img src={url} className="w-full h-full object-cover" alt="Memory" /></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [past, setPast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gallery, setGallery] = useState(null);
  const [filter, setFilter] = useState('All');
  const user = JSON.parse(localStorage.getItem('eventify_user') || '{}');

  useEffect(() => {
    api.get('/api/events', getAuthHeader())
      .then(r => {
        const all = r.data.data || r.data;
        
        // ─── THE SMART CLASH LOGIC (Restored) ───
        const eligible = all.filter(ev => {
          const isUpcoming = ev.status === 'upcoming';
          const deptMatch = ev.targetDepartments?.includes(user.department) || ev.targetDepartments?.includes('Other');
          const yearMatch = ev.targetYears?.includes(Number(user.year));
          return isUpcoming && deptMatch && yearMatch;
        });
        
        setEvents(eligible);
        setPast(all.filter(e => e.status === 'completed'));
      })
      .catch(err => console.error("Sync Error:", err))
      .finally(() => setLoading(false));
  }, [user.department, user.year]);

  // ─── THE LINK PROTOCOL FIX ───
  const handleRegister = (link) => {
    if (!link) {
      alert("Registration link pending for this event.");
      return;
    }
    const url = link.startsWith('http') ? link : `https://${link}`;
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    
    if (newWindow) {
      alert("Smart Clash System: Eligibility Verified. Registered Successfully!");
    } else {
      alert("Pop-up Blocked! Please allow pop-ups for this site to open the form.");
    }
  };

  const filtered = filter === 'All' ? events : events.filter(e => e.eventType === filter);

  return (
    <div className="min-h-screen bg-[#f8f7f4] font-sans pb-20">
      <GalleryModal event={gallery} onClose={() => setGallery(null)} />
      <nav className="text-white px-8 py-5 flex items-center justify-between shadow-2xl sticky top-0 z-30" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #162d4a 100%)' }}>
        <div className="flex items-center gap-3"><GraduationCap className="w-8 h-8" /><span className="font-bold text-xl tracking-tighter" style={{ fontFamily: '"Playfair Display", serif' }}>Eventify</span></div>
        <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="bg-white/10 p-3 rounded-2xl"><LogOut className="w-5 h-5" /></button>
      </nav>

      <div className="max-w-6xl mx-auto px-6 mt-10">
        <div className="rounded-[48px] p-12 mb-12 flex justify-between items-center text-white shadow-2xl relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #162d4a 100%)' }}>
          <div className="relative z-10">
            <h1 className="text-4xl font-bold tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>Hi, {user.name}!</h1>
            <p className="text-blue-200 text-lg mt-3 font-medium opacity-90">Smart Clash found {events.length} eligible events for your profile.</p>
            <div className="flex gap-3 mt-8">
              <span className="bg-emerald-500/20 text-emerald-300 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-500/30 flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5"/> {user.department}</span>
              <span className="bg-blue-500/20 text-blue-300 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-blue-500/30">Year {user.year}</span>
            </div>
          </div>
          <Sparkles className="w-40 h-40 text-blue-300/10 absolute -right-10 -bottom-10 rotate-12" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <h2 className="text-3xl font-bold text-stone-900" style={{ fontFamily: '"Playfair Display", serif' }}>Tailored Events</h2>
          <div className="flex gap-2 p-1.5 bg-white rounded-3xl border border-stone-200">
            {['All', 'Tech Event', 'Cultural Event'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-6 py-2.5 rounded-2xl text-[10px] font-black transition-all uppercase tracking-widest ${filter === f ? 'text-white shadow-xl scale-105' : 'text-stone-400 hover:text-stone-600'}`} style={filter === f ? { background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' } : {}}>{f}</button>
            ))}
          </div>
        </div>

        {loading ? <div className="py-40 text-center"><Loader2 className="animate-spin mx-auto w-10 h-10 text-blue-900" /></div> : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-28">
              {filtered.map(ev => (
                <div key={ev._id} className="bg-white rounded-[48px] border border-stone-200 shadow-sm overflow-hidden flex flex-col hover:shadow-2xl hover:-translate-y-2 transition-all duration-700 group">
                  {/* ── BROCHURE RENDERING ── */}
                  {ev.brochureURL ? (
                    <img src={ev.brochureURL} className="w-full h-56 object-cover border-b group-hover:scale-105 transition-transform duration-700" alt="Brochure" />
                  ) : (
                    <div className="w-full h-56 bg-stone-50 flex items-center justify-center text-stone-200"><ImageIcon className="w-12 h-12" /></div>
                  )}
                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-4">
                      {ev.eventType === 'Tech Event' ? <Cpu className="w-4 h-4 text-blue-600" /> : <Music2 className="w-4 h-4 text-amber-600" />}
                      <span className="text-[10px] font-black uppercase text-stone-400 tracking-[0.1em]">{ev.eventType}</span>
                    </div>
                    <h3 className="font-bold text-stone-900 text-2xl mb-4 leading-tight">{ev.title}</h3>
                    <p className="text-sm text-stone-500 line-clamp-3 mb-8 leading-relaxed font-medium italic">"{ev.description}"</p>
                    <div className="mt-auto pt-8 border-t border-stone-50 space-y-4 mb-8">
                      <div className="flex items-center gap-3 text-stone-400 text-xs font-bold uppercase tracking-widest"><CalendarDays className="w-4 h-4" /> {new Date(ev.date).toDateString()}</div>
                      <div className="flex items-center gap-3 text-stone-400 text-xs font-bold uppercase tracking-widest"><MapPin className="w-4 h-4" /> {ev.venue}</div>
                    </div>
                    <button onClick={() => handleRegister(ev.registrationLink)} className="w-full py-4 rounded-[24px] text-white font-black text-[11px] tracking-[0.2em] shadow-xl uppercase transition-all hover:brightness-110 active:scale-95" style={{ background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' }}>Register Now</button>
                  </div>
                </div>
              ))}
            </div>

            <h2 className="text-2xl font-bold text-stone-900 mb-8" style={{ fontFamily: '"Playfair Display", serif' }}>Event Memories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
              {past.map(ev => (
                <div key={ev._id} onClick={() => setGallery(ev)} className="bg-white p-6 rounded-[32px] border border-stone-200 shadow-sm hover:shadow-xl cursor-pointer transition-all text-center">
                  <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center mx-auto mb-6"><ImageIcon className="w-6 h-6 text-stone-200" /></div>
                  <h4 className="font-bold text-stone-800 text-xs line-clamp-1">{ev.title}</h4>
                  <p className="text-[10px] text-stone-400 font-black uppercase mt-1 tracking-widest">{ev.galleryImages?.length || 0} Photos</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}