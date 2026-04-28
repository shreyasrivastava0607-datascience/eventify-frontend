import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  CalendarPlus, Images, LogOut, CheckSquare, Square, Loader2,
  CheckCircle2, AlertCircle, X, UserPlus, Settings, Trash2,
  GraduationCap, ClipboardList, Link2, ImageIcon,
  Users, Eye, Search, ToggleLeft, ToggleRight, Plus
} from 'lucide-react';

const api = axios.create({ baseURL: 'https://eventify-backend-jm6t.onrender.com' });
const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('eventify_token')}` } });

const DEPARTMENTS = ['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'BBA', 'MBA', 'MCA', 'BCA', 'BSC', 'Other'];
const YEARS = [1, 2, 3, 4, 5];

/* ── TOAST ── */
function Toast({ toast, onClose }) {
  if (!toast) return null;
  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-bold animate-fade-in ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
      {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {toast.message}
      <button onClick={onClose}><X className="w-3.5 h-3.5 opacity-70" /></button>
    </div>
  );
}

/* ── CHECKBOX GROUP ── */
function CheckboxGroup({ label, options, selected, onChange }) {
  return (
    <div className="space-y-3">
      <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => {
          const active = selected.includes(String(opt));
          return (
            <button key={opt} type="button"
              onClick={() => {
                const strOpt = String(opt);
                onChange(active ? selected.filter(s => s !== strOpt) : [...selected, strOpt]);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${active ? 'text-white border-transparent shadow-md' : 'bg-white border-stone-200 text-stone-400 hover:border-blue-200'}`}
              style={active ? { background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' } : {}}>
              {active ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />} {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── TAB: CREATE EVENT ── */
function CreateEventForm({ showToast }) {
  const [form, setForm] = useState({
    title: '', description: '', venue: '', date: '', time: '',
    targetDepartments: [], targetYears: [], eventType: '',
    formLink: '', imageURL: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.venue) return showToast('error', 'Title, date and venue are required!');
    if (form.targetDepartments.length === 0) return showToast('error', 'Select at least one target department!');
    if (form.targetYears.length === 0) return showToast('error', 'Select at least one target year!');

    setLoading(true);
    try {
      const eventData = {
        title: form.title,
        description: form.description,
        venue: form.venue,
        date: form.date,
        time: form.time,
        eventType: form.eventType,
        // FIX: send as formLink to match the backend model field name
        formLink: form.formLink.trim(),
        imageURL: form.imageURL.trim(),
        targetDepartments: form.targetDepartments,
        targetYears: form.targetYears.map(Number),
        status: 'upcoming',
      };
      await api.post('/api/events', eventData, getAuthHeader());
      showToast('success', 'Event Published Successfully!');
      setForm({
        title: '', description: '', venue: '', date: '', time: '',
        targetDepartments: [], targetYears: [], eventType: '',
        formLink: '', imageURL: ''
      });
    } catch {
      showToast('error', 'Failed to publish event. Check connection.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full p-4 border border-stone-200 rounded-2xl bg-stone-50 font-bold text-sm outline-none focus:ring-4 focus:ring-blue-900/5 transition-all placeholder:text-stone-300";

  return (
    <div>
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-stone-900" style={{ fontFamily: '"Playfair Display", serif' }}>Create New Event</h3>
        <p className="text-stone-400 text-sm mt-1 font-medium">Fill in details and Smart Clash will match students automatically.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input placeholder="Event Title *" className={inputCls} value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })} />
          <select className={inputCls} value={form.eventType}
            onChange={e => setForm({ ...form, eventType: e.target.value })}>
            <option value="">Select Event Type</option>
            <option value="Tech Event">⚙️ Tech Event</option>
            <option value="Cultural Event">🎭 Cultural Event</option>
          </select>
          <textarea placeholder="Event Description *" rows={4}
            className={`md:col-span-2 resize-none ${inputCls}`}
            value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <input placeholder="Venue *" className={inputCls} value={form.venue}
            onChange={e => setForm({ ...form, venue: e.target.value })} />
          <input type="date" className={inputCls} value={form.date}
            onChange={e => setForm({ ...form, date: e.target.value })} />
          <input type="time" className={inputCls} value={form.time}
            onChange={e => setForm({ ...form, time: e.target.value })} />

          {/* Registration Link */}
          <div className="relative">
            <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
            <input
              placeholder="Registration Link (Google Form URL)"
              className={`pl-10 ${inputCls}`}
              value={form.formLink}
              onChange={e => setForm({ ...form, formLink: e.target.value })}
            />
          </div>

          {/* Brochure / Banner Image URL */}
          <div className="relative">
            <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
            <input
              placeholder="Brochure Image URL (Direct Link)"
              className={`pl-10 ${inputCls}`}
              value={form.imageURL}
              onChange={e => setForm({ ...form, imageURL: e.target.value })}
            />
          </div>
        </div>

        {/* Preview link if provided */}
        {form.formLink && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-3 flex items-center gap-3">
            <Link2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <p className="text-blue-700 text-xs font-bold truncate">
              Registration link saved: {form.formLink}
            </p>
          </div>
        )}

        <div className="bg-stone-50 rounded-[28px] p-8 border border-stone-100 space-y-8">
          <p className="text-[11px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-2">
            🎯 Smart Clash Configuration — Only matching students will see this event
          </p>
          <CheckboxGroup
            label="Target Departments"
            options={DEPARTMENTS}
            selected={form.targetDepartments}
            onChange={v => setForm({ ...form, targetDepartments: v })}
          />
          <CheckboxGroup
            label="Target Academic Years"
            options={YEARS}
            selected={form.targetYears.map(String)}
            onChange={v => setForm({ ...form, targetYears: v })}
          />
        </div>

        <button disabled={loading}
          className="w-full py-5 text-white rounded-3xl font-black shadow-xl uppercase tracking-widest transition-all hover:scale-[1.01] flex items-center justify-center gap-3"
          style={{ background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' }}>
          {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <><CalendarPlus className="w-5 h-5" /> PUBLISH EVENT</>}
        </button>
      </form>
    </div>
  );
}

/* ── TAB: MANAGE EVENTS ── */
function ManageEvents({ showToast }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [galleryModal, setGalleryModal] = useState(null);
  const [galleryInput, setGalleryInput] = useState('');
  const [uploadingGallery, setUploadingGallery] = useState(false);

  useEffect(() => {
    api.get('/api/events', getAuthHeader())
      .then(r => setEvents(r.data.data || r.data))
      .catch(() => showToast('error', 'Could not load events.'))
      .finally(() => setLoading(false));
  }, []);

  const del = async (id, title) => {
    if (!window.confirm(`Permanently delete "${title}"?`)) return;
    try {
      await api.delete(`/api/events/${id}`, getAuthHeader());
      showToast('success', 'Event Deleted!');
      setEvents(prev => prev.filter(e => e._id !== id));
    } catch { showToast('error', 'Deletion failed.'); }
  };

  const toggleStatus = async (ev) => {
    const newStatus = ev.status === 'upcoming' ? 'completed' : 'upcoming';
    try {
      await api.patch(`/api/events/${ev._id}`, { status: newStatus }, getAuthHeader());
      setEvents(prev => prev.map(e => e._id === ev._id ? { ...e, status: newStatus } : e));
      showToast('success', `Marked as ${newStatus}!`);
    } catch { showToast('error', 'Status update failed.'); }
  };

  const addGalleryImage = async () => {
    const url = galleryInput.trim();
    if (!url) return;
    setUploadingGallery(true);
    try {
      const ev = galleryModal;
      const newImages = [...(ev.galleryImages || []), url];
      await api.patch(`/api/events/${ev._id}`, { galleryImages: newImages }, getAuthHeader());
      const updated = { ...ev, galleryImages: newImages };
      setEvents(prev => prev.map(e => e._id === ev._id ? updated : e));
      setGalleryModal(updated);
      setGalleryInput('');
      showToast('success', 'Gallery image added!');
    } catch { showToast('error', 'Failed to add image.'); }
    finally { setUploadingGallery(false); }
  };

  const removeGalleryImage = async (ev, idx) => {
    try {
      const newImages = (ev.galleryImages || []).filter((_, i) => i !== idx);
      await api.patch(`/api/events/${ev._id}`, { galleryImages: newImages }, getAuthHeader());
      const updated = { ...ev, galleryImages: newImages };
      setEvents(prev => prev.map(e => e._id === ev._id ? updated : e));
      setGalleryModal(updated);
      showToast('success', 'Image removed!');
    } catch { showToast('error', 'Failed to remove image.'); }
  };

  const filtered = events.filter(e =>
    !search || e.title?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-blue-900 w-10 h-10" /></div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-2xl font-bold text-stone-900" style={{ fontFamily: '"Playfair Display", serif' }}>Manage Events</h3>
          <p className="text-stone-400 text-sm mt-1">{events.length} total events</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events..."
            className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-2xl bg-stone-50 font-bold text-sm outline-none focus:ring-4 focus:ring-blue-900/5" />
        </div>
      </div>

      {/* GALLERY MODAL */}
      {galleryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => { setGalleryModal(null); setGalleryInput(''); }}>
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-8 py-5 border-b border-stone-100">
              <div>
                <h4 className="font-bold text-stone-900" style={{ fontFamily: '"Playfair Display", serif' }}>{galleryModal.title}</h4>
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mt-1">Gallery Manager · {galleryModal.galleryImages?.length || 0} images</p>
              </div>
              <button onClick={() => { setGalleryModal(null); setGalleryInput(''); }} className="w-10 h-10 rounded-xl bg-stone-50 hover:bg-stone-100 flex items-center justify-center">
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>
            <div className="overflow-y-auto p-8 space-y-6">
              {/* Add URL */}
              <div className="flex gap-3">
                <input
                  value={galleryInput}
                  onChange={e => setGalleryInput(e.target.value)}
                  placeholder="Paste image URL here..."
                  className="flex-1 p-3 border border-stone-200 rounded-2xl bg-stone-50 font-bold text-sm outline-none focus:ring-4 focus:ring-blue-900/5"
                  onKeyDown={e => e.key === 'Enter' && addGalleryImage()}
                />
                <button onClick={addGalleryImage} disabled={uploadingGallery || !galleryInput.trim()}
                  className="px-6 py-3 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all hover:brightness-110 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' }}>
                  {uploadingGallery ? <Loader2 className="animate-spin w-4 h-4" /> : <><Plus className="w-4 h-4" />Add</>}
                </button>
              </div>
              {/* Grid */}
              {galleryModal.galleryImages?.length > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {galleryModal.galleryImages.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group border border-stone-100">
                      <img src={url} className="w-full h-full object-cover" alt={`Gallery ${i + 1}`}
                        onError={e => { e.target.style.display = 'none'; }} />
                      <button onClick={() => removeGalleryImage(galleryModal, i)}
                        className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-stone-300">
                  <ImageIcon className="w-10 h-10 mx-auto mb-3" />
                  <p className="text-sm font-bold">No images yet. Paste a URL above.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {filtered.map(ev => (
          <div key={ev._id} className="p-6 border border-stone-200 rounded-[32px] bg-white shadow-sm hover:border-blue-200 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h4 className="font-bold text-stone-800 truncate">{ev.title}</h4>
                  <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${ev.status === 'upcoming' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {ev.status}
                  </span>
                  {ev.formLink && (
                    <span className="text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest bg-purple-50 text-purple-600">
                      Has Reg. Link
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest mt-1">
                  {new Date(ev.date).toDateString()} · {ev.venue} · <span className="text-blue-500">{ev.registeredStudents?.length || 0} RSVPs</span>
                  {ev.targetDepartments?.length > 0 && (
                    <span className="ml-2 text-emerald-500">· {ev.targetDepartments.join(', ')}</span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
                {/* Toggle status */}
                <button onClick={() => toggleStatus(ev)}
                  title={`Mark as ${ev.status === 'upcoming' ? 'completed' : 'upcoming'}`}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all border ${ev.status === 'upcoming' ? 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100'}`}>
                  {ev.status === 'upcoming' ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                  {ev.status === 'upcoming' ? 'Complete' : 'Reopen'}
                </button>
                {/* Gallery */}
                <button onClick={() => { setGalleryInput(''); setGalleryModal(ev); }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-600 border border-purple-100 hover:bg-purple-100 transition-all">
                  <Images className="w-4 h-4" /> Gallery ({ev.galleryImages?.length || 0})
                </button>
                {/* Delete */}
                <button onClick={() => del(ev._id, ev.title)}
                  className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-stone-400 italic font-medium">No events found.</div>
        )}
      </div>
    </div>
  );
}

/* ── TAB: RSVPs ── */
function RegistrationsView() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  // FIX: store populated student data per event fetched from /registrations endpoint
  const [studentMap, setStudentMap] = useState({});
  const [loadingStudents, setLoadingStudents] = useState({});

  useEffect(() => {
    api.get('/api/events', getAuthHeader())
      .then(r => setEvents(r.data.data || r.data))
      .finally(() => setLoading(false));
  }, []);

  // FIX: when an event is expanded, fetch populated registrations for that event
  const handleExpand = async (eventId) => {
    if (expanded === eventId) {
      setExpanded(null);
      return;
    }
    setExpanded(eventId);
    // Only fetch if we haven't already
    if (studentMap[eventId]) return;

    setLoadingStudents(prev => ({ ...prev, [eventId]: true }));
    try {
      const r = await api.get(`/api/events/${eventId}/registrations`, getAuthHeader());
      setStudentMap(prev => ({ ...prev, [eventId]: r.data.data || [] }));
    } catch {
      setStudentMap(prev => ({ ...prev, [eventId]: [] }));
    } finally {
      setLoadingStudents(prev => ({ ...prev, [eventId]: false }));
    }
  };

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-blue-900 w-10 h-10" /></div>;

  const totalRsvps = events.reduce((sum, ev) => sum + (ev.registeredStudents?.length || 0), 0);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-2xl font-bold text-stone-900" style={{ fontFamily: '"Playfair Display", serif' }}>RSVPs & Registrations</h3>
          <p className="text-stone-400 text-sm mt-1 font-medium">{totalRsvps} total registrations across {events.length} events</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student..."
            className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-2xl bg-stone-50 font-bold text-sm outline-none" />
        </div>
      </div>

      <div className="space-y-4">
        {events.map(ev => {
          const isOpen = expanded === ev._id;
          const students = studentMap[ev._id] || [];
          const isFetchingStudents = loadingStudents[ev._id];
          const rsvpCount = ev.registeredStudents?.length || 0;

          const filteredStudents = search
            ? students.filter(s =>
                s.name?.toLowerCase().includes(search.toLowerCase()) ||
                s.rollNumber?.toLowerCase().includes(search.toLowerCase())
              )
            : students;

          return (
            <div key={ev._id} className="bg-white border border-stone-200 rounded-[32px] shadow-sm overflow-hidden">
              <button
                onClick={() => handleExpand(ev._id)}
                className="w-full flex items-center justify-between p-6 hover:bg-stone-50 transition-all text-left"
              >
                <div>
                  <h4 className="font-bold text-stone-800">{ev.title}</h4>
                  <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest mt-1">
                    {new Date(ev.date).toDateString()} · {ev.venue}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-2 bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase">
                    <Users className="w-3.5 h-3.5" /> {rsvpCount} RSVPs
                  </span>
                  <Eye className={`w-5 h-5 text-stone-300 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-stone-100">
                  {isFetchingStudents ? (
                    <div className="py-10 flex justify-center">
                      <Loader2 className="animate-spin text-blue-900 w-6 h-6" />
                    </div>
                  ) : filteredStudents.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-stone-50 text-stone-400 font-black uppercase tracking-widest border-b border-stone-100">
                          <tr>
                            <th className="px-8 py-4">#</th>
                            <th className="px-8 py-4">Student Name</th>
                            <th className="px-8 py-4">Roll Number</th>
                            <th className="px-8 py-4">Department</th>
                            <th className="px-8 py-4">Year</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-50">
                          {filteredStudents.map((s, i) => (
                            <tr key={i} className="hover:bg-stone-50 transition-colors">
                              <td className="px-8 py-4 text-stone-300 font-bold">{i + 1}</td>
                              <td className="px-8 py-4 font-bold text-stone-800">{s.name || '—'}</td>
                              <td className="px-8 py-4 font-mono text-stone-500">{s.rollNumber || '—'}</td>
                              <td className="px-8 py-4 text-stone-500">{s.department || '—'}</td>
                              <td className="px-8 py-4 text-stone-500">{s.year ? `Year ${s.year}` : '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-stone-300 text-sm font-bold italic">
                      {search ? 'No students match your search.' : 'No registrations yet.'}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── TAB: ADD STUDENT ── */
function AddUserForm({ showToast }) {
  const [form, setForm] = useState({ rollNumber: '', name: '', department: '', year: '', role: 'student' });
  const [loading, setLoading] = useState(false);
  const [lastCreated, setLastCreated] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.rollNumber || !form.department || !form.year) return showToast('error', 'All fields required!');
    setLoading(true);
    try {
      const first = form.name.trim().split(' ')[0];
      const pass = first.charAt(0).toUpperCase() + first.slice(1).toLowerCase() + '@123';
      await api.post('/api/auth/create-student', { ...form, year: Number(form.year) }, getAuthHeader());
      showToast('success', `Student added! Default password: ${pass}`);
      setLastCreated({ name: form.name, rollNumber: form.rollNumber, department: form.department, year: form.year, defaultPassword: pass });
      setForm({ rollNumber: '', name: '', department: '', year: '', role: 'student' });
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to create student.');
    } finally { setLoading(false); }
  };

  const inputCls = "w-full p-4 border border-stone-200 rounded-2xl bg-stone-50 font-bold text-sm outline-none focus:ring-4 focus:ring-blue-900/5 transition-all";

  return (
    <div>
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-stone-900" style={{ fontFamily: '"Playfair Display", serif' }}>Student Directory</h3>
        <p className="text-stone-400 text-sm mt-1 font-medium">Add students — they'll be prompted to change their password on first login.</p>
      </div>

      {lastCreated && (
        <div className="mb-8 bg-emerald-50 border border-emerald-200 rounded-[28px] p-6">
          <div className="flex items-start gap-4">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-800 text-sm">Student Added Successfully!</p>
              <p className="text-emerald-600 text-xs mt-1 font-mono">
                {lastCreated.name} · {lastCreated.rollNumber} · {lastCreated.department} · Year {lastCreated.year}
              </p>
              <div className="mt-3 bg-white rounded-xl p-3 border border-emerald-200 inline-block">
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Default Password (share with student)</p>
                <p className="font-mono font-bold text-stone-800 mt-1 text-lg">{lastCreated.defaultPassword}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input placeholder="Full Name *" className={inputCls} value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Roll Number *" className={inputCls} value={form.rollNumber}
            onChange={e => setForm({ ...form, rollNumber: e.target.value })} />
          <select className={inputCls} value={form.department}
            onChange={e => setForm({ ...form, department: e.target.value })}>
            <option value="">Select Department *</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className={inputCls} value={form.year}
            onChange={e => setForm({ ...form, year: e.target.value })}>
            <option value="">Select Year *</option>
            {YEARS.map(y => <option key={y} value={y}>Year {y}</option>)}
          </select>
          <select className={`md:col-span-2 ${inputCls}`} value={form.role}
            onChange={e => setForm({ ...form, role: e.target.value })}>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button disabled={loading}
          className="w-full py-5 text-white rounded-3xl font-black shadow-xl uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:scale-[1.01]"
          style={{ background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' }}>
          {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <><UserPlus className="w-5 h-5" /> ADD TO DIRECTORY</>}
        </button>
      </form>
    </div>
  );
}

/* ── MAIN LAYOUT ── */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('create');
  const [toast, setToast] = useState(null);

  let user = {};
  try { user = JSON.parse(localStorage.getItem('eventify_user') || '{}'); } catch { user = {}; }

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const TABS = [
    { id: 'create', label: 'Create Event', icon: CalendarPlus },
    { id: 'manage', label: 'Manage Events', icon: Settings },
    { id: 'registrations', label: 'RSVPs', icon: ClipboardList },
    { id: 'users', label: 'Directory', icon: UserPlus }
  ];

  return (
    <div className="min-h-screen bg-[#f8f7f4] font-sans pb-20">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* NAV */}
      <nav className="text-white px-8 py-5 flex items-center justify-between shadow-2xl sticky top-0 z-30"
        style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #162d4a 100%)' }}>
        <div className="flex items-center gap-4">
          <GraduationCap className="w-10 h-10" />
          <span className="font-bold text-2xl tracking-tighter" style={{ fontFamily: '"Playfair Display", serif' }}>
            Eventify Admin
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-sm font-bold opacity-80 hidden md:block">Welcome, {user.name}</span>
          <button onClick={() => { localStorage.clear(); navigate('/login'); }}
            className="bg-white/10 p-3 rounded-2xl hover:bg-white/20 transition-all">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 mt-10">
        {/* TABS */}
        <div className="flex gap-3 mb-10 bg-white p-3 rounded-[32px] shadow-sm border border-stone-200 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-8 py-4 rounded-3xl text-[11px] font-black transition-all whitespace-nowrap uppercase tracking-widest ${tab === t.id ? 'text-white shadow-xl scale-[1.02]' : 'text-stone-400 hover:text-stone-600'}`}
              style={tab === t.id ? { background: 'linear-gradient(135deg, #1e3a5f, #162d4a)' } : {}}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div className="bg-white rounded-[48px] border border-stone-200 shadow-2xl p-10 lg:p-16">
          {tab === 'create' && <CreateEventForm showToast={showToast} />}
          {tab === 'manage' && <ManageEvents showToast={showToast} />}
          {tab === 'registrations' && <RegistrationsView />}
          {tab === 'users' && <AddUserForm showToast={showToast} />}
        </div>
      </div>
    </div>
  );
}