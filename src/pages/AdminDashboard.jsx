import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  CalendarPlus, Images, LogOut, CheckSquare, Square,
  Loader2, CheckCircle2, AlertCircle, ChevronDown, X, Menu,
  Users, Link as LinkIcon, ClipboardList, Trash2, Settings,
  MapPin, CalendarDays, AlertTriangle
} from 'lucide-react';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'https://eventify-backend-jm6t.onrender.com' });

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('eventify_token')}` },
});

const DEPARTMENTS = ['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'BBA', 'MBA', 'MCA', 'Other'];
const YEARS = [1, 2, 3, 4, 5];

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ toast, onClose }) {
  if (!toast) return null;
  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-medium ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
      {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
      {toast.message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X className="w-3.5 h-3.5" /></button>
    </div>
  );
}

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────
function ConfirmModal({ event, onConfirm, onCancel, loading }) {
  if (!event) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-center font-bold text-slate-800 text-lg mb-1">Delete Event?</h3>
        <p className="text-center text-slate-500 text-sm mb-1">
          Are you sure you want to delete
        </p>
        <p className="text-center font-semibold text-slate-800 text-sm mb-5">"{event.title}"?</p>
        <p className="text-center text-xs text-red-500 mb-6">
          This will also remove all student registrations for this event. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all disabled:opacity-60">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-500 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting…</> : <><Trash2 className="w-4 h-4" /> Delete</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CheckboxGroup ────────────────────────────────────────────────────────────
function CheckboxGroup({ label, options, selected, onChange }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button key={opt} type="button"
              onClick={() => onChange(active ? selected.filter(s => s !== opt) : [...selected, opt])}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150
                ${active ? 'bg-blue-900 border-blue-900 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-700'}`}>
              {active ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
              {opt}
            </button>
          );
        })}
      </div>
      {selected.length > 0 && <p className="text-xs text-blue-600 mt-1.5 font-medium">{selected.length} selected</p>}
    </div>
  );
}

// ─── Create Event Form ────────────────────────────────────────────────────────
function CreateEventForm({ showToast }) {
  const empty = {
    title: '', description: '', venue: '', date: '', time: '',
    targetDepartments: [], targetYears: [], maxParticipants: '', formLink: '',
  };
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.venue) { showToast('error', 'Title, Date and Venue are required.'); return; }
    if (!form.description) { showToast('error', 'Description is required.'); return; }
    if (form.targetDepartments.length === 0 || form.targetYears.length === 0) {
      showToast('error', 'Select at least one department and one year.'); return;
    }
    setLoading(true);
    try {
      await api.post('/api/events', {
        ...form,
        targetYears:     form.targetYears.map(y => Number(y)),
        maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : undefined,
        formLink:        form.formLink.trim(),
      }, getAuthHeader());
      showToast('success', 'Event created successfully!');
      setForm(empty);
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to create event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Event Title *</label>
        <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Annual Tech Fest 2026"
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Description *</label>
        <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe the event…" rows={3}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Date *</label>
          <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Time</label>
          <input type="time" value={form.time} onChange={e => set('time', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Max Participants</label>
          <input type="number" value={form.maxParticipants} onChange={e => set('maxParticipants', e.target.value)} placeholder="e.g. 100"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Venue *</label>
        <input value={form.venue} onChange={e => set('venue', e.target.value)} placeholder="e.g. Main Auditorium, Block A"
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          <span className="flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5" /> Registration Form Link
            <span className="normal-case font-normal text-slate-400">(optional — Google Form URL)</span>
          </span>
        </label>
        <input value={form.formLink} onChange={e => set('formLink', e.target.value)}
          placeholder="https://forms.gle/your-form-link"
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
        <p className="text-xs text-slate-400 mt-1">Students will be directed to this form before confirming registration on the website.</p>
      </div>

      <CheckboxGroup
        label="Target Departments * (Smart Clash Filter)"
        options={DEPARTMENTS}
        selected={form.targetDepartments}
        onChange={v => set('targetDepartments', v)}
      />

      <CheckboxGroup
        label="Target Years * — 1=First Year, 2=Second, 3=Third, 4=Fourth, 5=Postgrad"
        options={YEARS}
        selected={form.targetYears}
        onChange={v => set('targetYears', v)}
      />

      <button type="submit" disabled={loading}
        className="w-full py-3 rounded-xl bg-blue-900 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-blue-800 transition-all disabled:opacity-60">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : <><CalendarPlus className="w-4 h-4" /> Create Event</>}
      </button>
    </form>
  );
}

// ─── Gallery Update Form ──────────────────────────────────────────────────────
function GalleryUpdateForm({ showToast }) {
  const [events, setEvents]     = useState([]);
  const [selId, setSelId]       = useState('');
  const [urls, setUrls]         = useState('');
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    api.get('/api/events', getAuthHeader())
      .then(r => {
        const all = Array.isArray(r.data?.data) ? r.data.data : Array.isArray(r.data) ? r.data : [];
        const normalized = all
          .filter(e => e.status === 'completed')
          .map(ev => ({
            ...ev,
            _id: String(ev._id?.$oid || ev._id || ev.id || ''),
          }));
        setEvents(normalized);
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selId) { showToast('error', 'Please select an event.'); return; }
    const galleryImages = urls.split('\n').map(u => u.trim()).filter(Boolean);
    if (galleryImages.length === 0) { showToast('error', 'Add at least one image URL.'); return; }
    setLoading(true);
    try {
      await api.patch(`/api/events/${selId}/gallery`, { galleryImages }, getAuthHeader());
      showToast('success', 'Gallery updated successfully!');
      setSelId(''); setUrls('');
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update gallery.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Select Past Event</label>
        {fetching ? (
          <div className="flex items-center gap-2 text-slate-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Loading events…</div>
        ) : (
          <div className="relative">
            <select value={selId} onChange={e => setSelId(e.target.value)}
              className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 appearance-none">
              <option value="">— Choose a completed event —</option>
              {events.map(ev => (
                <option key={ev._id} value={ev._id}>{ev.title} · {new Date(ev.date).toLocaleDateString()}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        )}
        {!fetching && events.length === 0 && (
          <p className="text-xs text-slate-400 mt-2">No completed events yet.</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          Image URLs <span className="normal-case font-normal text-slate-400">(one per line)</span>
        </label>
        <textarea value={urls} onChange={e => setUrls(e.target.value)}
          placeholder={"https://example.com/photo1.jpg\nhttps://example.com/photo2.jpg"} rows={5}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none" />
        <p className="text-xs text-slate-400 mt-1">{urls.split('\n').filter(u => u.trim()).length} URLs entered</p>
      </div>

      <button type="submit" disabled={loading}
        className="w-full py-3 rounded-xl bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all disabled:opacity-60">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</> : <><Images className="w-4 h-4" /> Update Gallery</>}
      </button>
    </form>
  );
}

// ─── Registrations Viewer ─────────────────────────────────────────────────────
function RegistrationsViewer() {
  const [events, setEvents]         = useState([]);
  const [selId, setSelId]           = useState('');
  const [students, setStudents]     = useState([]);
  const [eventTitle, setEventTitle] = useState('');
  const [fetching, setFetching]     = useState(true);
  const [loading, setLoading]       = useState(false);

  useEffect(() => {
    api.get('/api/events', getAuthHeader())
      .then(r => {
        const all = Array.isArray(r.data?.data) ? r.data.data : [];
        // Normalize each event so _id is always a plain string
        const normalized = all.map(ev => ({
          ...ev,
          _id: String(ev._id?.$oid || ev._id || ev.id || ''),
        }));
        setEvents(normalized);
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, []);

  const loadRegistrations = async (id) => {
    if (!id) { setStudents([]); setEventTitle(''); return; }
    setLoading(true);
    try {
      const { data } = await api.get(`/api/events/${id}/registrations`, getAuthHeader());
      setStudents(data.data || []);
      setEventTitle(data.event?.title || '');
    } catch {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (id) => { setSelId(id); loadRegistrations(id); };
  const yearLabel = (y) => ['', 'First', 'Second', 'Third', 'Fourth', 'Postgrad'][y] || y;

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Select Event</label>
        {fetching ? (
          <div className="flex items-center gap-2 text-slate-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Loading events…</div>
        ) : (
          <div className="relative">
            <select value={selId} onChange={e => handleSelect(e.target.value)}
              className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 appearance-none">
              <option value="">— Choose an event —</option>
              {events.map(ev => (
                <option key={ev._id} value={ev._id}>
                  {ev.title} · {new Date(ev.date).toLocaleDateString()} · {ev.status}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        )}
      </div>

      {selId && (
        <div>
          {loading ? (
            <div className="flex items-center gap-2 text-slate-400 text-sm py-6 justify-center">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading registrations…
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200">
              <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm font-medium">No registrations yet</p>
              <p className="text-slate-400 text-xs mt-1">Students who register will appear here.</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-slate-700">{eventTitle}</p>
                <span className="bg-blue-900 text-white text-xs font-bold px-2.5 py-1 rounded-full">{students.length} registered</span>
              </div>
              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">#</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Roll Number</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Dept</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Year</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.map((s, i) => (
                      <tr key={s._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-slate-400 text-xs">{i + 1}</td>
                        <td className="px-4 py-3 font-mono text-slate-800 font-medium text-xs">{s.rollNumber}</td>
                        <td className="px-4 py-3 text-slate-700">{s.name || <span className="text-slate-400 italic">—</span>}</td>
                        <td className="px-4 py-3"><span className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full border border-blue-100">{s.department}</span></td>
                        <td className="px-4 py-3 text-slate-600 text-xs">{yearLabel(s.year)} Year</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Manage Events (Delete) ───────────────────────────────────────────────────
function ManageEvents({ showToast }) {
  const [events, setEvents]         = useState([]);
  const [fetching, setFetching]     = useState(true);
  const [confirmEvent, setConfirm]  = useState(null); // event to delete
  const [deleting, setDeleting]     = useState(false);
  const [filter, setFilter]         = useState('all'); // 'all' | 'upcoming' | 'completed'

  const fetchEvents = useCallback(async () => {
    setFetching(true);
    try {
      const { data } = await api.get('/api/events', getAuthHeader());
      const all = Array.isArray(data?.data) ? data.data : [];
      const normalized = all.map(ev => ({
        ...ev,
        _id: String(ev._id?.$oid || ev._id || ev.id || ''),
      }));
      setEvents(normalized);
    } catch {
      showToast('error', 'Failed to load events.');
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleDelete = async () => {
    if (!confirmEvent) return;
    setDeleting(true);
    try {
      await api.delete(`/api/events/${confirmEvent._id}`, getAuthHeader());
      showToast('success', `"${confirmEvent.title}" deleted successfully.`);
      setEvents(prev => prev.filter(e => e._id !== confirmEvent._id));
      setConfirm(null);
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to delete event.');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = filter === 'all' ? events : events.filter(e => e.status === filter);
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div className="space-y-5">
      <ConfirmModal
        event={confirmEvent}
        onConfirm={handleDelete}
        onCancel={() => setConfirm(null)}
        loading={deleting}
      />

      {/* Filter tabs */}
      <div className="flex gap-2">
        {['all', 'upcoming', 'completed'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all border
              ${filter === f
                ? 'bg-blue-900 text-white border-blue-900'
                : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-700'}`}>
            {f}
            <span className="ml-1.5 opacity-70">
              ({f === 'all' ? events.length : events.filter(e => e.status === f).length})
            </span>
          </button>
        ))}
      </div>

      {fetching ? (
        <div className="flex items-center justify-center gap-2 text-slate-400 text-sm py-12">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading events…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-14 bg-slate-50 rounded-2xl border border-slate-200">
          <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm font-medium">No events found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(ev => {
            const date = new Date(ev.date);
            return (
              <div key={ev._id}
                className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 hover:shadow-sm transition-all">
                {/* Date badge */}
                <div className="bg-blue-900 rounded-xl px-3 py-2 text-center min-w-[48px] shrink-0">
                  <p className="text-blue-300 text-xs">{monthNames[date.getMonth()]}</p>
                  <p className="text-white text-lg font-bold leading-none">{date.getDate()}</p>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-slate-800 text-sm truncate">{ev.title}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      ev.status === 'upcoming'
                        ? 'bg-blue-50 text-blue-700 border border-blue-100'
                        : 'bg-slate-100 text-slate-500'}`}>
                      {ev.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="flex items-center gap-1 text-slate-400 text-xs">
                      <MapPin className="w-3 h-3" /> {ev.venue}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400 text-xs">
                      <Users className="w-3 h-3" /> {ev.registeredStudents?.length || 0} registered
                    </span>
                  </div>
                  {ev.targetDepartments?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {ev.targetDepartments.slice(0, 3).map(d => (
                        <span key={d} className="bg-slate-100 text-slate-500 text-xs px-1.5 py-0.5 rounded-md">{d}</span>
                      ))}
                      {ev.targetDepartments.length > 3 && (
                        <span className="text-slate-400 text-xs">+{ev.targetDepartments.length - 3} more</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Delete button */}
                <button onClick={() => setConfirm(ev)}
                  className="shrink-0 w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center transition-all group">
                  <Trash2 className="w-4 h-4 text-red-400 group-hover:text-red-600" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab]           = useState('create');
  const [toast, setToast]       = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const user = (() => { try { return JSON.parse(localStorage.getItem('eventify_user') || '{}'); } catch { return {}; } })();

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  const TABS = [
    { id: 'create',        label: 'Create Event',   icon: CalendarPlus  },
    { id: 'manage',        label: 'Manage Events',  icon: Settings       },
    { id: 'gallery',       label: 'Update Gallery', icon: Images         },
    { id: 'registrations', label: 'Registrations',  icon: ClipboardList  },
  ];

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <nav className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between shadow-lg sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-sm font-bold">E</div>
          <div>
            <span className="font-bold text-base tracking-wide">Eventify</span>
            <span className="ml-2 text-xs bg-white/15 px-2 py-0.5 rounded-full">Admin</span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <span className="text-sm text-blue-200">Hello, {user.name || 'Admin'} 👋</span>
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
          <span className="text-sm text-blue-200">Hello, {user.name || 'Admin'} 👋</span>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm w-fit">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Manage campus events and galleries</p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-2 mb-6 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm">
          {TABS.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                  ${active ? 'bg-blue-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          {tab === 'create' && (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-800">Post New Event</h2>
                <p className="text-slate-500 text-xs mt-1">Select Target Departments and Years to enable Smart Clash Detection.</p>
              </div>
              <CreateEventForm showToast={showToast} />
            </>
          )}
          {tab === 'manage' && (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-800">Manage Events</h2>
                <p className="text-slate-500 text-xs mt-1">View and delete existing events.</p>
              </div>
              <ManageEvents showToast={showToast} />
            </>
          )}
          {tab === 'gallery' && (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-800">Update Event Gallery</h2>
                <p className="text-slate-500 text-xs mt-1">Add image URLs to a completed event's gallery for students to view.</p>
              </div>
              <GalleryUpdateForm showToast={showToast} />
            </>
          )}
          {tab === 'registrations' && (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-800">Registrations</h2>
                <p className="text-slate-500 text-xs mt-1">View students who registered for each event.</p>
              </div>
              <RegistrationsViewer />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
