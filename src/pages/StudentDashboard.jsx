import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  CalendarDays, MapPin, Users, Clock, Image as ImageIcon,
  X, LogOut, CheckCircle2, AlertCircle, Loader2,
  ExternalLink, GraduationCap, Menu, Sparkles, Cpu, Music2
} from 'lucide-react';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000' });
const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('eventify_token')}` } });

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
                  <img src={url} alt={`Gallery ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={e => { e.target.style.display = 'none'; }} />
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
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full
      ${isTech ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
      {isTech ? <Cpu className="w-3 h-3" /> : <Music2 className="w-3 h-3" />}
      {type}
    </span>
  );
}

/* ── Upcoming Event Card ── */
function UpcomingCard({ event }) {
  const date = new Date(event.date);
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const hasRegLink = !!event.registrationLink;

  return (
    <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col">
      {/* Brochure image if available */}
      {event.brochureURL && (
        <div className="h-40 overflow-hidden">
          <img src={event.brochureURL} alt={event.title}
            className="w-full h-full object-cover"
            onError={e => { e.target.parentElement.style.display = 'none'; }} />
        </div>
      )}

      {/* Date banner */}
      <div className="px-5 py-4 flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #162d4a 100%)' }}>
        <div className="flex items-center gap-3">
          <div className="bg-white/15 rounded-xl px-3 py-2 text-center min-w-[52px]">
            <p className="text-white/70 text-xs">{monthNames[date.getMonth()]}</p>
            <p className="text-white text-xl font-bold leading-none">{date.getDate()}</p>
          </div>
          <div>
            <h3 className="text-white font-bold text-base leading-snug line-clamp-1">{event.title}</h3>
            {event.time && (
              <div className="flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-blue-300" />
                <span className="text-blue-200 text-xs">{event.time}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <TypeBadge type={event.eventType} />
        </div>

        {event.description && <p className="text-stone-600 text-sm leading-relaxed mb-4 line-clamp-2">{event.description}</p>}

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-stone-500 text-xs">
            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span>{event.venue || 'TBA'}</span>
          </div>
          {event.maxParticipants && (
            <div className="flex items-center gap-2 text-stone-500 text-xs">
              <Users className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span>{event.registeredStudents?.length || 0} / {event.maxParticipants} participants</span>
            </div>
          )}
        </div>

        {event.targetDepartments?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {event.targetDepartments.slice(0, 4).map(d => (
              <span key={d} className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full border border-blue-100">{d}</span>
            ))}
            {event.targetDepartments.length > 4 && (
              <span className="bg-stone-100 text-stone-500 text-xs px-2 py-0.5 rounded-full">+{event.targetDepartments.length - 4}</span>
            )}
          </div>
        )}

        <div className="mt-auto">
          {hasRegLink ? (
            <a href={event.registrationLink} target="_blank" rel="noreferrer"
              className="w-full py-2.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' }}>
              Register Now <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <div className="w-full py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm font-semibold flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" />
              Registrations will open soon
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Past Event Card ── */
function PastCard({ event, onViewGallery }) {
  const date = new Date(event.date);
  return (
    <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm flex flex-col opacity-90 hover:opacity-100 transition-all duration-200">
      <div className="h-36 bg-gradient-to-br from-stone-100 to-stone-200 relative overflow-hidden">
        {event.galleryImages?.[0] || event.brochureURL ? (
          <img src={event.galleryImages?.[0] || event.brochureURL} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <CalendarDays className="w-10 h-10 text-stone-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-3 left-4 text-white">
          <p className="text-xs opacity-75">{date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        </div>
        <div className="absolute top-3 right-3 bg-stone-700/80 text-white text-xs px-2.5 py-1 rounded-full font-medium backdrop-blur-sm">
          Completed
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <TypeBadge type={event.eventType} />
        <h3 className="font-bold text-stone-800 text-sm mt-2 mb-1 line-clamp-1">{event.title}</h3>
        <div className="flex items-center gap-1.5 text-stone-400 text-xs mb-3">
          <MapPin className="w-3 h-3" /> {event.venue || 'TBA'}
        </div>
        <div className="mt-auto">
          <button onClick={() => onViewGallery(event)}
            className="w-full py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all">
            <ImageIcon className="w-3.5 h-3.5" />
            View Gallery
            {event.galleryImages?.length > 0 && (
              <span className="bg-stone-300 text-stone-600 text-xs px-1.5 py-0.5 rounded-full ml-1">{event.galleryImages.length}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Dashboard ── */
export default function StudentDashboard() {
  const navigate = useNavigate();
  const [upcoming, setUpcoming]    = useState([]);
  const [past, setPast]            = useState([]);
  const [loading, setLoading]      = useState(true);
  const [toast, setToast]          = useState(null);
  const [galleryEvent, setGallery] = useState(null);
  const [menuOpen, setMenuOpen]    = useState(false);
  const [filter, setFilter]        = useState('All');

  const user = (() => { try { return JSON.parse(localStorage.getItem('eventify_user') || '{}'); } catch { return {}; } })();
  const showToast = (type, message) => { setToast({ type, message }); setTimeout(() => setToast(null), 4000); };

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/events', getAuthHeader());
      const all = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      setUpcoming(all.filter(e => e.status === 'upcoming'));
      setPast(all.filter(e => e.status === 'completed'));
    } catch {
      showToast('error', 'Failed to load events. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const filteredUpcoming = filter === 'All' ? upcoming : upcoming.filter(e => e.eventType === filter);
  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  return (
    <div className="min-h-screen font-sans" style={{ background: '#f8f7f4', fontFamily: '"DM Sans", sans-serif' }}>
      <Toast toast={toast} onClose={() => setToast(null)} />
      <GalleryModal event={galleryEvent} onClose={() => setGallery(null)} />

      {/* Navbar */}
      <nav className="text-white px-6 py-4 flex items-center justify-between shadow-lg sticky top-0 z-30"
        style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #162d4a 100%)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-base tracking-wide" style={{ fontFamily: '"Playfair Display", serif' }}>Eventify</span>
            <span className="ml-2 text-xs bg-white/15 px-2 py-0.5 rounded-full">Student</span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <span className="text-sm text-blue-200">Hello, {user.name || 'Student'} 👋</span>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
        <button className="sm:hidden" onClick={() => setMenuOpen(v => !v)}><Menu className="w-5 h-5" /></button>
      </nav>

      {menuOpen && (
        <div className="sm:hidden text-white px-6 py-3 flex flex-col gap-2"
          style={{ background: 'linear-gradient(135deg, #162d4a, #0f2035)' }}>
          <span className="text-sm text-blue-200">Hello, {user.name || 'Student'} 👋</span>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm w-fit">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Hero */}
        <div className="rounded-2xl px-6 py-6 mb-8 flex items-center justify-between shadow-lg"
          style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #162d4a 100%)' }}>
          <div>
            <h1 className="text-white text-xl font-bold" style={{ fontFamily: '"Playfair Display", serif' }}>
              Hello, {user.name || 'Student'}! 👋
            </h1>
            <p className="text-blue-200 text-sm mt-1">
              {upcoming.length > 0
                ? `${upcoming.length} upcoming event${upcoming.length > 1 ? 's' : ''} tailored for you.`
                : 'No upcoming events right now. Check back soon!'}
            </p>
            <div className="flex items-center gap-2 mt-2 text-xs text-blue-300">
              <span className="bg-white/10 px-2 py-0.5 rounded-full">{user.department || '—'}</span>
              <span className="bg-white/10 px-2 py-0.5 rounded-full">Year {user.year || '—'}</span>
            </div>
          </div>
          <div className="hidden sm:block">
            <Sparkles className="w-10 h-10 text-blue-300/50" />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-900" />
            <p className="text-stone-500 text-sm">Loading your events…</p>
          </div>
        ) : (
          <>
            {/* Upcoming Events */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-blue-900" />
                  <h2 className="text-lg font-bold text-stone-800" style={{ fontFamily: '"Playfair Display", serif' }}>Upcoming Events</h2>
                  {upcoming.length > 0 && (
                    <span className="text-white text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' }}>{upcoming.length}</span>
                  )}
                </div>
                {/* Filter tabs */}
                <div className="flex gap-2">
                  {['All', 'Tech Event', 'Cultural Event'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all
                        ${filter === f ? 'text-white border-transparent shadow-sm' : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'}`}
                      style={filter === f ? { background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' } : {}}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {filteredUpcoming.length === 0 ? (
                <div className="bg-white border border-stone-200 rounded-2xl py-16 text-center">
                  <CalendarDays className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                  <p className="text-stone-500 text-sm font-medium">No upcoming events for you right now.</p>
                  <p className="text-stone-400 text-xs mt-1">Events matching your department & year will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredUpcoming.map(ev => <UpcomingCard key={ev._id} event={ev} />)}
                </div>
              )}
            </section>

            {/* Past Events */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="w-5 h-5 text-stone-500" />
                <h2 className="text-lg font-bold text-stone-800" style={{ fontFamily: '"Playfair Display", serif' }}>Past Events</h2>
                {past.length > 0 && (
                  <span className="bg-stone-200 text-stone-600 text-xs font-bold px-2 py-0.5 rounded-full">{past.length}</span>
                )}
              </div>

              {past.length === 0 ? (
                <div className="bg-white border border-stone-200 rounded-2xl py-12 text-center">
                  <p className="text-stone-400 text-sm">No past events yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {past.map(ev => <PastCard key={ev._id} event={ev} onViewGallery={setGallery} />)}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
