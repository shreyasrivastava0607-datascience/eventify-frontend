import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CalendarDays, MapPin, Users, Clock, LogOut, Loader2, Sparkles, GraduationCap, Cpu, Music2, ExternalLink, Image as ImageIcon, X } from 'lucide-react';

const api = axios.create({ baseURL: 'https://eventify-backend-jm6t.onrender.com' });
const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('eventify_token')}` } });

function GalleryModal({ event, onClose }) {
  if (!event) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md" onClick={onClose}>
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-10 py-6 border-b border-stone-100">
          <div><h2 className="font-bold text-stone-900 text-xl" style={{ fontFamily: '"Playfair Display", serif' }}>{event.title}</h2><p className="text-stone-400 text-xs font-bold uppercase tracking-widest mt-1">Event Memories</p></div>
          <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-all"><X className="w-6 h-6 text-stone-600" /></button>
        </div>
        <div className="overflow-y-auto p-10">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {event.galleryImages?.map((url, i) => (
              <div key={i} className="aspect-square rounded-[32px] overflow-hidden bg-stone-100 shadow-sm border border-stone-200"><img src={url} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" alt="Memory" /></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gallery, setGallery] = useState(null);
  const user = JSON.parse(localStorage.getItem('eventify_user') || '{}');

  useEffect(() => {
    api.get('/api/events', getAuthHeader()).then(r => {
      const all = r.data.data || r.data;
      setUpcoming(all.filter(e => e.status === 'upcoming'));
      setPast(all.filter(e => e.status === 'completed'));
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f7f4] font-sans pb-20">
      <GalleryModal event={gallery} onClose={() => setGallery(null)} />
      <nav className="text-white px-8 py-5 flex items-center justify-between shadow-2xl sticky top-0 z-30" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #162d4a 100%)' }}>
        <div className="flex items-center gap-3"><GraduationCap className="w-8 h-8" /><span className="font-bold text-xl tracking-tighter" style={{ fontFamily: '"Playfair Display", serif' }}>Eventify</span></div>
        <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="bg-white/10 p-3 rounded-2xl hover:bg-white/20 transition-all"><LogOut className="w-5 h-5" /></button>
      </nav>

      <div className="max-w-6xl mx-auto px-6 mt-10">
        <div className="rounded-[48px] p-12 mb-12 flex justify-between items-center text-white shadow-2xl relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #162d4a 100%)' }}>
          <div className="relative z-10">
            <h1 className="text-4xl font-bold tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>Hello, {user.name}! 👋</h1>
            <p className="text-blue-200 text-lg mt-3 font-medium opacity-90">{upcoming.length} events matching your profile.</p>
            <div className="flex gap-3 mt-6"><span className="bg-white/15 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">{user.department}</span><span className="bg-white/15 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Year {user.year}</span></div>
          </div>
          <Sparkles className="w-32 h-32 text-blue-300/10 absolute -right-6 -bottom-6 rotate-12" />
        </div>

        {loading ? <div className="py-40 text-center"><Loader2 className="animate-spin mx-auto w-10 h-10 text-blue-900" /></div> : (
          <>
            <h2 className="text-2xl font-bold text-stone-900 mb-8" style={{ fontFamily: '"Playfair Display", serif' }}>Upcoming Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
              {upcoming.map(ev => (
                <div key={ev._id} className="bg-white p-10 rounded-[48px] border border-stone-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col">
                  <div className="flex items-center gap-2 mb-6">
                    {ev.eventType === 'Tech Event' ? <Cpu className="w-4 h-4 text-blue-600" /> : <Music2 className="w-4 h-4 text-amber-600" />}
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">{ev.eventType}</span>
                  </div>
                  <h3 className="font-bold text-stone-900 text-2xl mb-4 leading-tight">{ev.title}</h3>
                  <p className="text-sm text-stone-500 line-clamp-3 mb-8 leading-relaxed font-medium">{ev.description}</p>
                  <div className="mt-auto pt-8 border-t border-stone-100 space-y-4 font-bold text-stone-400 text-xs">
                    <div className="flex items-center gap-3"><CalendarDays className="w-4 h-4" /> {new Date(ev.date).toDateString()}</div>
                    <div className="flex items-center gap-3"><MapPin className="w-4 h-4" /> {ev.venue}</div>
                  </div>
                  {ev.registrationLink && <a href={ev.registrationLink} target="_blank" rel="noreferrer" className="mt-8 w-full py-4 rounded-3xl text-white font-black text-xs text-center shadow-lg transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' }}>REGISTER NOW</a>}
                </div>
              ))}
            </div>

            <h2 className="text-2xl font-bold text-stone-900 mb-8" style={{ fontFamily: '"Playfair Display", serif' }}>Memories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {past.map(ev => (
                <div key={ev._id} className="bg-white p-6 rounded-[32px] border border-stone-200 shadow-sm hover:shadow-xl cursor-pointer transition-all" onClick={() => setGallery(ev)}>
                  <ImageIcon className="w-8 h-8 text-stone-300 mb-4" />
                  <h4 className="font-bold text-stone-800 text-sm line-clamp-1">{ev.title}</h4>
                  <p className="text-[10px] text-stone-400 font-bold uppercase mt-1">{ev.galleryImages?.length || 0} Photos</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}