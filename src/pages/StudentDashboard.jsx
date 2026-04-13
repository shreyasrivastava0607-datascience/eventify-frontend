import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  CalendarDays, MapPin, Users, Clock, Image as ImageIcon,
  X, LogOut, CheckCircle2, AlertCircle, Loader2,
  ChevronRight, GraduationCap, Menu, Sparkles,
  ExternalLink, ClipboardCheck
} from 'lucide-react';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'https://eventify-backend-jm6t.onrender.com' });
const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${window.localStorage.getItem('eventify_token')}` },
});

function Toast({ toast, onClose }) {
  if (!toast) return null;
  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-medium
      ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
      {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
      {toast.message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X className="w-3.5 h-3.5" /></button>
    </div>
  );
}

function GalleryModal({ event, onClose }) {
  if (!event) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-slate-800 text-lg">{event.title}</h2>
            <p className="text-slate-400 text-xs mt-0.5">Event Gallery · {event.galleryImages?.length || 0} photos</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>
        <div className="overflow-y-auto p-5">
          {(!event.galleryImages || event.galleryImages.length === 0) ? (
            <div className="text-center py-16 text-slate-400">
              <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No gallery images yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {event.galleryImages.map((url, i) => (
                <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-slate-100 group cursor-pointer">
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

// ─── Upcoming Event Card ──────────────────────────────────────────────────────
function UpcomingCard({ event, onRegister, registering }) {
  const date         = new Date(event.date);
  const isRegistered = event.isRegistered;
  const hasForm      = !!event.formLink;

  // Track if student has opened the form (stored in localStorage per event)
  const formOpenedKey = `form_opened_${event._id}`;
  const [formOpened, setFormOpened] = useState(() => {
    try { return !!window.localStorage.getItem(formOpenedKey); }
    catch { return false; }
  });

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const handleOpenForm = () => {
    window.open(event.formLink, '_blank');
    try { window.localStorage.setItem(formOpenedKey, 'true'); } catch {}
    setFormOpened(true);
  };

  const handleMarkRegistered = () => {
    onRegister(event._id);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col">
      {/* Header */}
      <div className="bg-blue-900 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/15 rounded-xl px-3 py-2 text-center min-w-[52px]">
            <p className="text-white/70 text-xs">{monthNames[date.getMonth()]}</p>
            <p className="text-white text-xl font-bold leading-none">{date.getDate()}</p>
          </div>
          <div>
            <h3 className="text-white font-bold text-base leading-snug">{event.title}</h3>
            {event.time && (
              <div className="flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-blue-300" />
                <span className="text-blue-200 text-xs">{event.time}</span>
              </div>
            )}
          </div>
        </div>
        {isRegistered && (
          <div className="flex items-center gap-1 bg-emerald-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shrink-0">
            <CheckCircle2 className="w-3 h-3" /> Registered
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        {event.description && (
          <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-2">{event.description}</p>
        )}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{event.venue || 'TBA'}</span>
          </div>
          {event.maxParticipants && (
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
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
              <span className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-full">+{event.targetDepartments.length - 4}</span>
            )}
          </div>
        )}

        {/* ── Action Buttons ── */}
        <div className="mt-auto space-y-2">
          {isRegistered ? (
            <div className="space-y-2">
              <button disabled
                className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default">
                <CheckCircle2 className="w-4 h-4" /> Already Registered
              </button>
              {/* Show form link even after registration */}
              {hasForm && (
                <button onClick={() => window.open(event.formLink, '_blank')}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all">
                  <ExternalLink className="w-4 h-4" /> Open Registration Form
                </button>
              )}
            </div>

          ) : hasForm ? (
            // Google Form flow — two step buttons
            <>
              {/* Step 1: Open Google Form */}
              <button onClick={handleOpenForm}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all border
                  ${formOpened
                    ? 'bg-slate-50 text-slate-500 border-slate-200'
                    : 'bg-blue-900 text-white border-blue-900 hover:bg-blue-800 hover:shadow-lg'}`}>
                <ExternalLink className="w-4 h-4" />
                {formOpened ? 'Form Opened ✓' : 'Fill Registration Form'}
              </button>

              {/* Step 2: Mark as Registered (only shown after opening form) */}
              {formOpened && (
                <button onClick={handleMarkRegistered}
                  disabled={registering === event._id}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-500 transition-all disabled:opacity-60">
                  {registering === event._id
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Confirming…</>
                    : <><ClipboardCheck className="w-4 h-4" /> Mark as Registered</>}
                </button>
              )}

              {!formOpened && (
                <p className="text-xs text-slate-400 text-center">
                  Fill the form first, then confirm your registration here.
                </p>
              )}
            </>

          ) : (
            // No form — direct register button
            <button onClick={() => onRegister(event._id)}
              disabled={registering === event._id}
              className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-blue-900 text-white hover:bg-blue-800 hover:shadow-lg transition-all disabled:opacity-60">
              {registering === event._id
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Registering…</>
                : <>Register Now <ChevronRight className="w-4 h-4" /></>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function PastCard({ event, onViewGallery }) {
  const date = new Date(event.date);
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col opacity-90 hover:opacity-100 transition-all duration-200">
      <div className="h-36 bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
        {event.galleryImages?.[0] ? (
          <img src={event.galleryImages[0]} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <CalendarDays className="w-10 h-10 text-slate-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-3 left-4 text-white">
          <p className="text-xs opacity-75">{date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        </div>
        <div className="absolute top-3 right-3 bg-slate-700/80 text-white text-xs px-2.5 py-1 rounded-full font-medium backdrop-blur-sm">
          Completed
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-slate-800 text-sm mb-1 line-clamp-1">{event.title}</h3>
        <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-3">
          <MapPin className="w-3 h-3" /> {event.venue || 'TBA'}
        </div>
        <div className="mt-auto">
          <button onClick={() => onViewGallery(event)}
            className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all">
            <ImageIcon className="w-3.5 h-3.5" />
            View Gallery
            {event.galleryImages?.length > 0 && (
              <span className="bg-slate-300 text-slate-600 text-xs px-1.5 py-0.5 rounded-full ml-1">{event.galleryImages.length}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Student Dashboard ────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const navigate = useNavigate();
  const [upcoming, setUpcoming]    = useState([]);
  const [past, setPast]            = useState([]);
  const [loading, setLoading]      = useState(true);
  const [registering, setReg]      = useState(null);
  const [toast, setToast]          = useState(null);
  const [galleryEvent, setGallery] = useState(null);
  const [menuOpen, setMenuOpen]    = useState(false);

  const [user] = useState(() => {
    try { return JSON.parse(window.localStorage.getItem('eventify_user') || '{}'); }
    catch { return {}; }
  });

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/events', getAuthHeader());
      const allEvents = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      setUpcoming(allEvents.filter(e => e.status === 'upcoming'));
      setPast(allEvents.filter(e => e.status === 'completed'));
    } catch {
      showToast('error', 'Failed to load events. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleRegister = async (eventId) => {
    setReg(eventId);
    try {
      const { data } = await api.post(`/api/events/${eventId}/register`, {}, getAuthHeader());
      showToast('success', 'Successfully registered! 🎉');
      setUpcoming(prev => prev.map(ev =>
        ev._id === eventId ? { ...ev, isRegistered: true } : ev
      ));
      // Clear the form_opened key now that they're fully registered
      try { window.localStorage.removeItem(`form_opened_${eventId}`); } catch {}
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Registration failed.');
    } finally {
      setReg(null);
    }
  };

  const handleLogout = () => { window.localStorage.clear(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <GalleryModal event={galleryEvent} onClose={() => setGallery(null)} />

      <nav className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between shadow-lg sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-base tracking-wide">Eventify</span>
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
        <button className="sm:hidden" onClick={() => setMenuOpen(v => !v)}>
          <Menu className="w-5 h-5" />
        </button>
      </nav>

      {menuOpen && (
        <div className="sm:hidden bg-blue-800 text-white px-6 py-3 flex flex-col gap-2">
          <span className="text-sm text-blue-200">Hello, {user.name || 'Student'} 👋</span>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm w-fit">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-blue-900 rounded-2xl px-6 py-6 mb-8 flex items-center justify-between shadow-lg">
          <div>
            <h1 className="text-white text-xl font-bold">Welcome back{user.name ? `, ${user.name}` : ''}! 👋</h1>
            <p className="text-blue-200 text-sm mt-1">
              {upcoming.length > 0
                ? `You have ${upcoming.length} upcoming event${upcoming.length > 1 ? 's' : ''} tailored for you.`
                : 'No upcoming events right now. Check back soon!'}
            </p>
          </div>
          <div className="hidden sm:block">
            <Sparkles className="w-10 h-10 text-blue-300/50" />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-700" />
            <p className="text-slate-500 text-sm">Loading your events…</p>
          </div>
        ) : (
          <>
            <section className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <CalendarDays className="w-5 h-5 text-blue-900" />
                <h2 className="text-lg font-bold text-slate-800">Upcoming Events</h2>
                {upcoming.length > 0 && (
                  <span className="bg-blue-900 text-white text-xs font-bold px-2 py-0.5 rounded-full">{upcoming.length}</span>
                )}
              </div>
              {upcoming.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl py-16 text-center">
                  <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm font-medium">No upcoming events for you right now.</p>
                  <p className="text-slate-400 text-xs mt-1">Events matching your department & year will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {upcoming.map(ev => (
                    <UpcomingCard key={ev._id} event={ev} onRegister={handleRegister} registering={registering} />
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="w-5 h-5 text-slate-500" />
                <h2 className="text-lg font-bold text-slate-800">Past Events</h2>
                {past.length > 0 && (
                  <span className="bg-slate-300 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">{past.length}</span>
                )}
              </div>
              {past.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl py-12 text-center">
                  <p className="text-slate-400 text-sm">No past events yet.</p>
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