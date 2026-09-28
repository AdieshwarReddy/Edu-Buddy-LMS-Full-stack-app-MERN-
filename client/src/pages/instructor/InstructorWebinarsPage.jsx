import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Video, PlusCircle, Trash2, Clock, Play } from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';

export const InstructorWebinarsPage = () => {
  const [webinars, setWebinars] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [duration, setDuration] = useState(60);

  const toast = useToast();

  const fetchData = async () => {
    try {
      const [webRes, curRes] = await Promise.all([
        api.get('/webinars/instructor'),
        api.get('/courses/instructor/my-courses')
      ]);
      if (webRes.data?.success) setWebinars(webRes.data.webinars);
      if (curRes.data?.success) setCourses(curRes.data.courses);
    } catch (err) {
      toast.error('Failed to load webinars');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/webinars', {
        courseId, title, description, scheduledAt, duration
      });
      if (res.data?.success) {
        toast.success('Live class scheduled!');
        setModalOpen(false);
        fetchData();
        // Reset form
        setTitle(''); setDescription(''); setScheduledAt(''); setCourseId(''); setDuration(60);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule live class');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this live class?')) return;
    try {
      const res = await api.delete(`/webinars/${id}`);
      if (res.data?.success) {
        toast.success('Live class cancelled');
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to cancel');
    }
  };

  if (loading) return <div className="py-20"><LoadingSpinner text="Loading Live Classes..." /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900">
            Live Classes & Webinars 🔴
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Schedule and host live interactive video sessions for your courses.
          </p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all flex items-center space-x-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Schedule Live Class</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {webinars.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-slate-200">
            <Video className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800">No upcoming classes</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Schedule your first live webinar to engage with your students in real-time.
            </p>
          </div>
        ) : (
          webinars.map(webinar => (
            <div key={webinar._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-100">
                  {webinar.course?.title || 'Unknown Course'}
                </span>
                <button onClick={() => handleDelete(webinar._id)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900 line-clamp-1">{webinar.title}</h3>
                <div className="flex items-center space-x-4 text-xs text-slate-500 mt-2">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(webinar.scheduledAt).toLocaleString()}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{webinar.duration} mins</span>
                  </span>
                  <span className="flex items-center space-x-1 text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                    <span>{webinar.attendees?.length || 0} Attended</span>
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-500 line-clamp-2">{webinar.description}</p>
              <div className="pt-2 border-t border-slate-100">
                <Link 
                  to={`/live/${webinar.roomName}`}
                  target="_blank"
                  className="w-full py-2.5 rounded-xl font-bold text-sm text-white bg-slate-900 hover:bg-slate-800 transition-colors flex items-center justify-center space-x-2"
                >
                  <Play className="w-4 h-4" />
                  <span>Join Instructor Room</span>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Schedule Live Class">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Course</label>
            <select required value={courseId} onChange={e => setCourseId(e.target.value)} className="w-full px-4 py-2 border rounded-xl">
              <option value="">Select Course</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Topic / Title</label>
            <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 border rounded-xl" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2 border rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date & Time</label>
              <input required type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} className="w-full px-4 py-2 border rounded-xl" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Duration (Mins)</label>
              <input required type="number" value={duration} onChange={e => setDuration(e.target.value)} className="w-full px-4 py-2 border rounded-xl" />
            </div>
          </div>
          <button type="submit" disabled={saving} className="w-full py-3 mt-2 rounded-xl text-white bg-brand-600 font-bold hover:bg-brand-700">
            {saving ? 'Scheduling...' : 'Schedule Live Class'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
