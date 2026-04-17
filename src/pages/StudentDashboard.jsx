import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  CalendarDays, MapPin, Users, Clock, Image as ImageIcon,
  X, LogOut, CheckCircle2, AlertCircle, Loader2,
  ExternalLink, GraduationCap, Menu, Sparkles, Cpu, Music2
} from 'lucide-react';

// ─── THE CONNECTION FIX ─────────────────────────────────────────────────────
const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL || 'https://eventify-backend-jm6t.onrender.com' 
});

const getAuthHeader = () => ({ 
  headers: { Authorization: `Bearer ${localStorage.getItem('eventify_token')}` } 
});

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

/* ── Gallery Modal ── */
function GalleryModal({ event, onClose }) {
  if (!event) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <div>
            <h2 className="font-bold text-stone-800 text-lg" style={{ fontFamily: '"Playfair Display", serif' }}>{event.title}</h2>
            <p className="text-stone-400 text-xs mt-0.5">Event Gallery · {event.galleryImages?.length || 0} photos</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-stone-600" />
          </button>
        </div>
        <div className="overflow-y-auto p-5">
          {(!event.galleryImages || event.galleryImages.length === 0) ? (
            <div className="text-center py-16 text-stone-400">
              <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No gallery images yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {event.galleryImages.map((url, i) => (
                <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-stone-100 group cursor-pointer">
                  <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={e => { e.target.style.display = 'none'; }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Event Type Badge ── */
function TypeBadge({ type }) {
  if (!type) return null;
  const isTech = type === 'Tech Event';
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${isTech ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
      {isTech ? <Cpu className="w-3 h-3" /> : <Music2 className="w-3 h-3" />}
      {type}
    </span>
  );
}

/* ── Upcoming Event Card ── */
function UpcomingCard({ event }) {
  const date = new Date(event.date);
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return (
    <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col">
      <div className="px-5 py-4 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #162d4a 100%)' }}>
        <div className="flex items-center gap-3">
          <div className="bg-white/15 rounded-xl px-3 py-2 text-center min-w-[52px]">
            <p className="text-white/70 text-xs">{monthNames[date.getMonth()]}</p>
            <p className="text-white text-xl font-bold leading-none">{date.getDate()}</p>
          </div>
          <div><h3 className="text-white font-bold text-base leading-snug line-clamp-1">{event.title}</h3></div>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <TypeBadge type={event.eventType} />
        <p className="text-stone-600 text-sm leading-relaxed my-3 line-clamp-2">{event.description}</p>
        <div className="space-y-2 mb-4 text-xs text-stone-500">
          <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /><span>{event.venue || 'TBA'}</span></div>
          <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /><span>{event.time || 'All Day'}</span></div>
        </div>
        <div className="mt-auto">
          {event.registrationLink ? (
            <a href={event.registrationLink} target="_blank" rel="noreferrer" className="w-full py-2.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' }}>Register <ExternalLink className="w-4 h-4" /></a>
          ) : (
            <div className="w-full py-2.5 rounded-xl bg-amber-50 text-amber-700 text-sm font-semibold text-center">Registrations Coming Soon</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main Dashboard ── */
export default function StudentDashboard() {
  const navigate = useNavigate();
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [galleryEvent, setGallery] = useState(null);
  const [filter, setFilter] = useState('All');

  const user = JSON.parse(localStorage.getItem('eventify_user') || '{}');
  const showToast = (type, message) => { setToast({ type, message }); setTimeout(() => setToast(null), 4000); };

  const fetchEvents = useCallback(async () => {
    try {
      const { data } = await api.get('/api/events', getAuthHeader());
      const all = data.data || data;
      setUpcoming(all.filter(e => e.status === 'upcoming'));
      setPast(all.filter(e => e.status === 'completed'));
    } catch { showToast('error', 'Failed to load events.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const filteredUpcoming = filter === 'All' ? upcoming : upcoming.filter(e => e.eventType === filter);
  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <GalleryModal event={galleryEvent} onClose={() => setGallery(null)} />

      <nav className="text-white px-6 py-4 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #162d4a 100%)' }}>
        <div className="flex items-center gap-3"><GraduationCap className="w-6 h-6" /><span className="font-bold text-xl" style={{ fontFamily: '"Playfair Display", serif' }}>Eventify</span></div>
        <button onClick={handleLogout} className="bg-white/10 p-2 rounded-lg"><LogOut className="w-4 h-4" /></button>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="rounded-2xl px-6 py-6 mb-8 flex items-center justify-between shadow-lg text-white" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #162d4a 100%)' }}>
          <div>
            <h1 className="text-xl font-bold">Hello, {user.name || 'Student'}! 👋</h1>
            <p className="text-blue-200 text-sm mt-1">{upcoming.length} events matching your profile.</p>
          </div>
          <Sparkles className="w-10 h-10 text-blue-300/30" />
        </div>

        {loading ? (
          <div className="text-center py-24"><Loader2 className="animate-spin mx-auto w-8 h-8 text-blue-900" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUpcoming.map(ev => <UpcomingCard key={ev._id} event={ev} />)}
          </div>
        )}
      </div>
    </div>
  );
}