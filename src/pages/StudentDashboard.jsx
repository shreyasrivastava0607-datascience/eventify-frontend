import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  CalendarDays, MapPin, Users, Clock, Image as ImageIcon, 
  X, LogOut, Loader2, ExternalLink, GraduationCap, 
  Sparkles, Cpu, Music2 
} from 'lucide-react';

// ─── PRODUCTION CONNECTION ──────────────────────────────────────────────────
const api = axios.create({ 
  baseURL: 'https://eventify-backend-jm6t.onrender.com' 
});

const getAuthHeader = () => ({ 
  headers: { Authorization: `Bearer ${localStorage.getItem('eventify_token')}` } 
});

/* ── Gallery Modal (Full Interactive Logic) ── */
function GalleryModal({ event, onClose }) {
  if (!event) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={onClose}>
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-10 py-6 border-b border-stone-100">
          <div>
            <h2 className="font-bold text-stone-900 text-xl" style={{ fontFamily: '"Playfair Display", serif' }}>{event.title}</h2>
            <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mt-1">Event Memories</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-stone-50 hover:bg-stone-100 flex items-center justify-center transition-all">
            <X className="w-6 h-6 text-stone-500" />
          </button>
        </div>
        <div className="overflow-y-auto p-10 lg:p-14">
          {(!event.galleryImages || event.galleryImages.length === 0) ? (
            <div className="text-center py-20 text-stone-300">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="font-bold uppercase tracking-widest text-[10px]">No memories uploaded yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {event.galleryImages.map((url, i) => (
                <div key={i} className="aspect-square rounded-[32px] overflow-hidden bg-stone-100 border border-stone-200 shadow-inner group">
                  <img src={url} alt="Campus Memory" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Upcoming Event Card (Full Styling) ── */
function UpcomingCard({ event }) {
  const date = new Date(event.date);
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const isTech = event.eventType === 'Tech Event';

  return (
    <div className="bg-white border border-stone-200 rounded-[48px] overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col group">
      <div className="px-8 py-7 flex items-center justify-between" 
        style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #162d4a 100%)' }}>
        <div className="flex items-center gap-5">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl px-4 py-3 text-center border border-white/10 min-w-[65px] shadow-lg">
            <p className="text-white/60 text-[10px] font-black uppercase tracking-tighter">{monthNames[date.getMonth()]}</p>
            <p className="text-white text-2xl font-black leading-none">{date.getDate()}</p>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg leading-tight line-clamp-1" style={{ fontFamily: '"Playfair Display", serif' }}>{event.title}</h3>
            <div className="flex items-center gap-1.5 mt-1 text-blue-300/80 text-[10px] font-bold uppercase tracking-widest">
              <Clock className="w-3.5 h-3.5" /> {event.time || 'TBA'}
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 lg:p-10 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-5">
          <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${isTech ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
            {isTech ? <Cpu className="w-3.5 h-3.5" /> : <Music2 className="w-3.5 h-3.5" />} {event.eventType}
          </div>
        </div>
        <p className="text-stone-500 text-sm leading-relaxed line-clamp-3 mb-8 font-medium italic">"{event.description}"</p>
        <div className="mt-auto space-y-4 pt-8 border-t border-stone-50">
          <div className="flex items-center gap-3 text-stone-400 text-[11px] font-black uppercase tracking-wider"><MapPin className="w-4 h-4 text-blue-900/30" /> {event.venue}</div>
          <div className="flex items-center gap-3 text-stone-400 text-[11px] font-black uppercase tracking-wider"><Users className="w-4 h-4 text-blue-900/30" /> {event.registeredStudents?.length || 0} RSVPs</div>
        </div>
        {event.registrationLink && (
          <a href={event.registrationLink} target="_blank" rel="noreferrer" 
            className="mt-8 w-full py-4 rounded-3xl text-white font-black text-[11px] tracking-[0.2em] text-center shadow-xl transition-all hover:brightness-110 active:scale-95 uppercase"
            style={{ background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' }}>
            Join Event
          </a>
        )}
      </div>
    </div>
  );
}

/* ── Main Student Dashboard ── */
export default function StudentDashboard() {
  const navigate = useNavigate();
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gallery, setGallery] = useState(null);
  const [filter, setFilter] = useState('All');

  const user = JSON.parse(localStorage.getItem('eventify_user') || '{}');

  const fetchEvents = useCallback(async () => {
    try {
      const { data } = await api.get('/api/events', getAuthHeader());
      const all = data.data || data;
      setUpcoming(all.filter(e => e.status === 'upcoming'));
      setPast(all.filter(e => e.status === 'completed'));
    } catch { console.error("Data fetch failed"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const filteredUpcoming = filter === 'All' ? upcoming : upcoming.filter(e => e.eventType === filter);

  return (
    <div className="min-h-screen bg-[#f8f7f4] font-sans pb-32">
      <GalleryModal event={gallery} onClose={() => setGallery(null)} />
      
      <nav className="text-white px-8 py-6 flex items-center justify-between shadow-2xl sticky top-0 z-30" 
        style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #162d4a 100%)' }}>
        <div className="flex items-center gap-3">
          <GraduationCap className="w-9 h-9" />
          <span className="font-bold text-2xl tracking-tighter" style={{ fontFamily: '"Playfair Display", serif' }}>Eventify</span>
        </div>
        <button onClick={() => { localStorage.clear(); navigate('/login'); }} 
          className="bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition-all shadow-inner"><LogOut className="w-5 h-5" /></button>
      </nav>

      <div className="max-w-7xl mx-auto px-6 mt-12">
        <div className="rounded-[56px] p-12 lg:p-20 mb-16 flex justify-between items-center text-white shadow-2xl relative overflow-hidden" 
          style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #162d4a 100%)' }}>
          <div className="relative z-10">
            <h1 className="text-5xl font-black tracking-tighter" style={{ fontFamily: '"Playfair Display", serif' }}>Hi, {user.name}! 👋</h1>
            <p className="text-blue-200 text-xl mt-4 font-medium opacity-90 max-w-md leading-relaxed">Discover {upcoming.length} exclusive events curated for your profile.</p>
            <div className="flex gap-3 mt-10">
              <span className="bg-white/15 backdrop-blur-xl px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] border border-white/10 shadow-lg">{user.department}</span>
              <span className="bg-white/15 backdrop-blur-xl px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] border border-white/10 shadow-lg">Year {user.year}</span>
            </div>
          </div>
          <Sparkles className="w-56 h-56 text-blue-300/10 absolute -right-10 -bottom-10 rotate-12" />
        </div>

        {loading ? (
          <div className="py-48 text-center"><Loader2 className="animate-spin mx-auto w-12 h-12 text-blue-900" /></div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
              <h2 className="text-3xl font-black text-stone-900 tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>Live Campus Events</h2>
              <div className="flex gap-2 p-2 bg-white rounded-3xl border border-stone-200 shadow-sm w-fit overflow-x-auto no-scrollbar">
                {['All', 'Tech Event', 'Cultural Event'].map(f => (
                  <button key={f} onClick={() => setFilter(f)} 
                    className={`px-8 py-3 rounded-2xl text-[10px] font-black transition-all uppercase tracking-widest whitespace-nowrap ${filter === f ? 'text-white shadow-xl scale-105' : 'text-stone-400 hover:text-stone-600'}`}
                    style={filter === f ? { background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' } : {}}>{f}</button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-32">
              {filteredUpcoming.map(ev => <UpcomingCard key={ev._id} event={ev} />)}
            </div>

            <h2 className="text-3xl font-black text-stone-900 mb-10 tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>Recent Memories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
              {past.map(ev => (
                <div key={ev._id} onClick={() => setGallery(ev)}
                  className="bg-white p-8 rounded-[48px] border border-stone-200 shadow-sm hover:shadow-2xl hover:-translate-y-3 cursor-pointer transition-all duration-700 group text-center">
                  <div className="w-16 h-16 bg-stone-50 rounded-[24px] flex items-center justify-center mx-auto mb-8 border border-stone-100 group-hover:bg-blue-50 group-hover:rotate-6 transition-all"><ImageIcon className="w-8 h-8 text-stone-300 group-hover:text-blue-500" /></div>
                  <h4 className="font-bold text-stone-800 text-sm line-clamp-1 mb-2 uppercase tracking-tight">{ev.title}</h4>
                  <p className="text-[10px] text-stone-400 font-black uppercase tracking-[0.2em]">{ev.galleryImages?.length || 0} Photos</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}