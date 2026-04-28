import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  CalendarDays, MapPin, LogOut, Loader2, ExternalLink,
  GraduationCap, Sparkles, Image as ImageIcon, Cpu, Music2,
  ShieldCheck, X, Search, CheckCircle2, Clock, Filter
} from 'lucide-react';

const api = axios.create({ baseURL: 'https://eventify-backend-jm6t.onrender.com' });
const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('eventify_token')}` } });

/* ── HELPERS ── */
function safeLink(raw) {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return trimmed.startsWith('http://') || trimmed.startsWith('https://')
    ? trimmed
    : `https://${trimmed}`;
}

function eventMatchesStudent(ev, student) {
  const studentYear = Number(student.year);
  const studentDept = student.department;

  const deptMatch =
    Array.isArray(ev.targetDepartments) &&
    ev.targetDepartments.length > 0 &&
    ev.targetDepartments.includes(studentDept);

  const yearMatch =
    Array.isArray(ev.targetYears) &&
    ev.targetYears.length > 0 &&
    ev.targetYears.map(Number).includes(studentYear);

  return deptMatch && yearMatch;
}

/* ── GALLERY MODAL ── */
function GalleryModal({ event, onClose }) {
  if (!event) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={onClose}>
      <div
        className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-10 py-6 border-b border-stone-100">
          <div>
            <h2 className="font-bold text-stone-900 text-xl" style={{ fontFamily: '"Playfair Display", serif' }}>
              {event.title}
            </h2>
            <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest mt-1">
              Event Memories · {event.galleryImages?.length || 0} photos
            </p>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-stone-50 hover:bg-stone-100 flex items-center justify-center transition-all">
            <X className="w-6 h-6 text-stone-500" />
          </button>
        </div>
        <div className="overflow-y-auto p-10">
          {event.galleryImages?.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {event.galleryImages.map((url, i) => (
                <div key={i} className="aspect-square rounded-[32px] overflow-hidden bg-stone-50 border border-stone-200 group">
                  <img src={url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={`Memory ${i + 1}`}
                    onError={e => { e.target.style.display = 'none'; }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-stone-400">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="font-bold">No gallery images yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── REGISTRATION MODAL ── */
function RegisterModal({ event, onClose, onSuccess, user }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // FIX: use event.formLink (matches backend model field name)
  const regLink = safeLink(event.formLink);

  const handleRegister = async () => {
    setLoading(true);
    try {
      // 1. Perform the database registration first
      await api.post(
        `/api/events/${event._id}/register`,
        { name: user.name, rollNumber: user.rollNumber },
        getAuthHeader()
      );

      onSuccess && onSuccess(event._id);
      setDone(true);

      // 2. Open the Google Form AFTER successful registration (if link exists)
      if (regLink) {
        window.open(regLink, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      const msg = (err.response?.data?.message || '').toLowerCase();
      // If already registered, still show the "Done" state
      if (msg.includes('already')) {
        onSuccess && onSuccess(event._id);
        setDone(true);
        if (regLink) {
          window.open(regLink, '_blank', 'noopener,noreferrer');
        }
      } else {
        alert('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={onClose}>
      <div
        className="bg-white rounded-[48px] shadow-2xl w-full max-w-md p-12 text-center relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-2 rounded-t-[48px]" style={{ background: 'linear-gradient(90deg, #1e3a5f, #2563eb)' }} />

        {done ? (
          <>
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-bold text-stone-900 mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>
              You're Registered!
            </h3>
            <p className="text-stone-400 text-sm mb-2">Your spot is confirmed for</p>
            <p className="font-bold text-stone-700 mb-6">{event.title}</p>
            {regLink && (
              <p className="text-xs text-blue-600 font-bold mb-6 flex items-center justify-center gap-2">
                <ExternalLink className="w-3.5 h-3.5" /> Google Form opened in a new tab.
              </p>
            )}
            <button
              onClick={onClose}
              className="w-full py-4 text-white rounded-[24px] font-black text-[11px] uppercase tracking-widest"
              style={{ background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' }}
            >
              Close
            </button>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-blue-50 rounded-[28px] flex items-center justify-center mx-auto mb-6 border border-blue-100">
              {event.eventType === 'Tech Event'
                ? <Cpu className="w-10 h-10 text-blue-700" />
                : <Music2 className="w-10 h-10 text-amber-500" />}
            </div>
            <h3 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: '"Playfair Display", serif' }}>
              Confirm Registration
            </h3>
            <p className="text-stone-500 text-sm mb-1 font-medium">{event.title}</p>
            <p className="text-stone-400 text-xs mb-8">{new Date(event.date).toDateString()} · {event.venue}</p>

            <div className="bg-stone-50 rounded-2xl p-5 mb-8 text-left space-y-2 border border-stone-100">
              <div className="flex justify-between text-xs">
                <span className="text-stone-400 font-bold uppercase tracking-widest">Name</span>
                <span className="font-bold text-stone-800">{user.name}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-stone-400 font-bold uppercase tracking-widest">Roll No.</span>
                <span className="font-bold text-stone-800">{user.rollNumber}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-stone-400 font-bold uppercase tracking-widest">Department</span>
                <span className="font-bold text-stone-800">{user.department}</span>
              </div>
            </div>

            {regLink && (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 mb-6">
                <p className="text-xs text-blue-600 font-bold flex items-center justify-center gap-2">
                  <ExternalLink className="w-3.5 h-3.5" /> Google Form will open in a new tab after confirming
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={onClose}
                className="flex-1 py-4 rounded-[24px] font-black text-[11px] uppercase tracking-widest text-stone-400 border border-stone-200 hover:bg-stone-50 transition-all">
                Cancel
              </button>
              <button
                onClick={handleRegister}
                disabled={loading}
                className="flex-1 py-4 text-white rounded-[24px] font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:brightness-110 disabled:opacity-70"
                style={{ background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' }}
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <>Confirm <ExternalLink className="w-4 h-4" /></>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── MAIN DASHBOARD ── */
export default function StudentDashboard() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [past, setPast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gallery, setGallery] = useState(null);
  const [registerModal, setRegisterModal] = useState(null);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [registeredIds, setRegisteredIds] = useState(new Set());

  let user = {};
  try { user = JSON.parse(localStorage.getItem('eventify_user') || '{}'); } catch { user = {}; }

  useEffect(() => {
    if (user.isFirstLogin === true || user.mustChangePassword === true) {
      navigate('/change-password', {
        replace: true,
        state: { token: localStorage.getItem('eventify_token'), isFirstLogin: true }
      });
    }
  }, []);

  const autoUpdateStatuses = useCallback(async (allEvents) => {
    const now = new Date();
    const toUpdate = allEvents.filter(ev => {
      const evDate = new Date(ev.date);
      return ev.status === 'upcoming' && evDate < now;
    });
    await Promise.allSettled(
      toUpdate.map(ev =>
        api.patch(`/api/events/${ev._id}`, { status: 'completed' }, getAuthHeader())
      )
    );
  }, []);

  useEffect(() => {
    if (user.isFirstLogin === true || user.mustChangePassword === true) return;

    api.get('/api/events', getAuthHeader())
      .then(r => {
        const all = r.data.data || r.data;

        autoUpdateStatuses(all);

        const upcoming = all.filter(ev => {
          if (ev.status !== 'upcoming') return false;
          return eventMatchesStudent(ev, user);
        });

        // FIX: registeredStudents from /api/events are ObjectIds, not populated objects.
        // Use the isRegistered flag set by the backend instead.
        const myIds = new Set();
        all.forEach(ev => {
          if (ev.isRegistered) myIds.add(ev._id);
        });

        setRegisteredIds(myIds);
        setEvents(upcoming);
        setPast(all.filter(e => e.status === 'completed'));
      })
      .catch(() => {
        localStorage.clear();
        navigate('/login', { replace: true });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSuccess = (eventId) => {
    setRegisteredIds(prev => new Set([...prev, eventId]));
  };

  const filtered = events
    .filter(e => filter === 'All' || e.eventType === filter)
    .filter(e =>
      !search ||
      e.title?.toLowerCase().includes(search.toLowerCase()) ||
      e.venue?.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-[#f8f7f4] font-sans pb-20">
      {gallery && <GalleryModal event={gallery} onClose={() => setGallery(null)} />}
      {registerModal && (
        <RegisterModal
          event={registerModal}
          user={user}
          onClose={() => setRegisterModal(null)}
          onSuccess={handleSuccess}
        />
      )}

      {/* NAV */}
      <nav className="text-white px-8 py-5 flex items-center justify-between shadow-2xl sticky top-0 z-30"
        style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #162d4a 100%)' }}>
        <div className="flex items-center gap-3">
          <GraduationCap className="w-8 h-8" />
          <span className="font-bold text-xl tracking-tighter" style={{ fontFamily: '"Playfair Display", serif' }}>Eventify</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold opacity-70 hidden md:block">{user.department} · Year {user.year}</span>
          <button
            onClick={() => { localStorage.clear(); navigate('/login'); }}
            className="bg-white/10 p-3 rounded-2xl transition-all hover:bg-white/20"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 mt-10">

        {/* HERO */}
        <div className="rounded-[56px] p-12 lg:p-16 mb-12 flex flex-col md:flex-row justify-between items-start md:items-center text-white shadow-2xl relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #162d4a 100%)' }}>
          <div className="relative z-10">
            <h1 className="text-4xl font-bold tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>
              Hello, {user.name?.split(' ')[0]}!
            </h1>
            <p className="text-blue-200 text-lg mt-3 font-medium opacity-90">
              Smart Clash matched{' '}
              <span className="font-black text-white">{events.length}</span>{' '}
              {events.length === 1 ? 'event' : 'events'} to your profile.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <span className="bg-emerald-500/20 text-emerald-300 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/30 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> {user.department} Verified
              </span>
              <span className="bg-blue-500/20 text-blue-300 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-blue-500/30">
                Year {user.year}
              </span>
              <span className="bg-amber-500/20 text-amber-300 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-amber-500/30 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {registeredIds.size} Registered
              </span>
            </div>
          </div>
          <Sparkles className="w-48 h-48 text-blue-300/10 absolute -right-10 -bottom-10 rotate-12" />
        </div>

        {/* SEARCH + FILTERS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <h2 className="text-3xl font-bold text-stone-900" style={{ fontFamily: '"Playfair Display", serif' }}>
            Your Events
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search events or venue..."
                className="w-full pl-11 pr-5 py-4 rounded-2xl border border-stone-200 bg-white text-sm font-bold outline-none focus:ring-4 focus:ring-blue-900/5 transition-all shadow-sm"
              />
            </div>
            <div className="flex gap-2 p-1.5 bg-white rounded-3xl border border-stone-200 shadow-sm">
              {['All', 'Tech Event', 'Cultural Event'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-5 py-3 rounded-2xl text-[10px] font-black transition-all uppercase tracking-widest ${filter === f ? 'text-white shadow-xl scale-105' : 'text-stone-400 hover:text-stone-600'}`}
                  style={filter === f ? { background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' } : {}}
                >
                  {f === 'All' ? <><Filter className="w-4 h-4 inline mr-1" />All</> : f === 'Tech Event' ? '⚙️ Tech' : '🎭 Cultural'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-40 text-center"><Loader2 className="animate-spin mx-auto w-12 h-12 text-blue-900" /></div>
        ) : (
          <>
            {filtered.length === 0 ? (
              <div className="text-center py-32 text-stone-400">
                <CalendarDays className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="font-bold text-lg">No events found</p>
                <p className="text-sm mt-2">
                  {events.length === 0
                    ? `No upcoming events are targeted at ${user.department} Year ${user.year} yet.`
                    : 'Try changing your search or filter.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-28">
                {filtered.map(ev => {
                  // FIX: use ev.formLink (backend field name)
                  const regLink = safeLink(ev.formLink);
                  const actualImage = ev.imageURL;
                  const isRegistered = registeredIds.has(ev._id);

                  return (
                    <div key={ev._id} className="bg-white rounded-[48px] border border-stone-200 shadow-sm overflow-hidden flex flex-col hover:shadow-2xl hover:-translate-y-2 transition-all duration-700 group">
                      {actualImage ? (
                        <img
                          src={actualImage}
                          className="w-full h-60 object-cover border-b group-hover:scale-105 transition-transform duration-700"
                          alt="Event brochure"
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-full h-60 bg-stone-50 flex items-center justify-center text-stone-200 border-b border-stone-100">
                          <ImageIcon className="w-12 h-12" />
                        </div>
                      )}

                      <div className="p-10 flex flex-col flex-1">
                        <div className="flex items-center gap-2 mb-4">
                          {ev.eventType === 'Tech Event'
                            ? <Cpu className="w-4 h-4 text-blue-600" />
                            : <Music2 className="w-4 h-4 text-amber-600" />}
                          <span className="text-[10px] font-black uppercase text-stone-400 tracking-[0.1em]">
                            {ev.eventType || 'Event'}
                          </span>
                        </div>

                        <h3 className="font-bold text-stone-900 text-2xl mb-4 leading-tight">{ev.title}</h3>

                        {ev.description && (
                          <p className="text-sm text-stone-500 line-clamp-3 mb-8 leading-relaxed font-medium italic">
                            "{ev.description}"
                          </p>
                        )}

                        <div className="mt-auto pt-8 border-t border-stone-50 space-y-4 mb-8">
                          <div className="flex items-center gap-3 text-stone-400 text-xs font-bold uppercase tracking-widest">
                            <CalendarDays className="w-4 h-4 flex-shrink-0" />
                            {new Date(ev.date).toDateString()}
                          </div>
                          <div className="flex items-center gap-3 text-stone-400 text-xs font-bold uppercase tracking-widest">
                            <MapPin className="w-4 h-4 flex-shrink-0" /> {ev.venue}
                          </div>
                          {ev.time && (
                            <div className="flex items-center gap-3 text-stone-400 text-xs font-bold uppercase tracking-widest">
                              <Clock className="w-4 h-4 flex-shrink-0" /> {ev.time}
                            </div>
                          )}
                          {regLink && (
                            <div className="flex items-center gap-2 text-blue-500 text-xs font-bold">
                              <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="truncate">Google Form available</span>
                            </div>
                          )}
                        </div>

                        {isRegistered ? (
                          <div className="space-y-3">
                            <div className="w-full py-5 rounded-[24px] bg-emerald-50 border-2 border-emerald-200 text-emerald-600 font-black text-[11px] tracking-[0.2em] uppercase flex items-center justify-center gap-2">
                              <CheckCircle2 className="w-4 h-4" /> Registered
                            </div>
                            {regLink && (
                              <a
                                href={regLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-3 rounded-[24px] border border-blue-200 text-blue-500 font-black text-[10px] tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-blue-50 transition-all"
                              >
                                <ExternalLink className="w-3.5 h-3.5" /> Open Google Form
                              </a>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => setRegisterModal(ev)}
                            className="w-full py-5 rounded-[24px] text-white font-black text-[11px] tracking-[0.2em] shadow-xl uppercase transition-all hover:brightness-110 active:scale-95 flex items-center justify-center gap-2"
                            style={{ background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' }}
                          >
                            Register Now
                            {regLink && <ExternalLink className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {past.length > 0 && (
              <>
                <h2 className="text-2xl font-bold text-stone-900 mb-8" style={{ fontFamily: '"Playfair Display", serif' }}>
                  Event Memories
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                  {past.map(ev => (
                    <div
                      key={ev._id}
                      onClick={() => setGallery(ev)}
                      className="bg-white p-8 rounded-[40px] border border-stone-200 shadow-sm hover:shadow-2xl cursor-pointer transition-all text-center group"
                    >
                      {ev.galleryImages?.[0] ? (
                        <div className="w-16 h-16 rounded-[20px] overflow-hidden mx-auto mb-6">
                          <img
                            src={ev.galleryImages[0]}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            alt={ev.title}
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-stone-50 rounded-[20px] flex items-center justify-center mx-auto mb-6">
                          <ImageIcon className="w-8 h-8 text-stone-300" />
                        </div>
                      )}
                      <h4 className="font-bold text-stone-800 text-xs line-clamp-1">{ev.title}</h4>
                      <p className="text-[10px] text-stone-400 font-black uppercase mt-2 tracking-widest">
                        {ev.galleryImages?.length || 0} Photos
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}