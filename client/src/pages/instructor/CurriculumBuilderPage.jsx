import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  PlusCircle,
  Video,
  Edit,
  Trash2,
  Play,
  ArrowLeft,
  CheckCircle,
  Clock,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal, ConfirmationModal } from '../../components/common/Modal';
import { MediaUploader } from '../../components/upload/MediaUploader';
import { VideoModal } from '../../components/course/VideoModal';
import { QuizBuilder } from '../../components/course/QuizBuilder';

export const CurriculumBuilderPage = () => {
  const { id: courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lesson Form Modal State (for both Create and Edit)
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoPublicId, setVideoPublicId] = useState('');
  const [duration, setDuration] = useState(0);
  const [previewAllowed, setPreviewAllowed] = useState(false);
  const [savingLesson, setSavingLesson] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // 'details' or 'quiz'

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Preview Video Player Modal
  const [previewVideoModalOpen, setPreviewVideoModalOpen] = useState(false);
  const [activePreviewVideo, setActivePreviewVideo] = useState(null);

  const toast = useToast();

  const fetchCourseAndLessons = async () => {
    try {
      const res = await api.get(`/courses/${courseId}`);
      if (res.data?.success) {
        setCourse(res.data.course);
        setLessons(res.data.lessons || []);
      }
    } catch (err) {
      toast.error('Failed to load course curriculum');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseAndLessons();
  }, [courseId]);

  const openCreateLessonModal = () => {
    setEditingLesson(null);
    setLessonTitle('');
    setLessonDescription('');
    setVideoUrl('');
    setVideoPublicId('');
    setDuration(0);
    setPreviewAllowed(false);
    setActiveTab('details');
    setLessonModalOpen(true);
  };

  const openEditLessonModal = (lesson) => {
    setEditingLesson(lesson);
    setLessonTitle(lesson.title || '');
    setLessonDescription(lesson.description || '');
    setVideoUrl(lesson.videoUrl || '');
    setVideoPublicId(lesson.videoPublicId || '');
    setDuration(lesson.duration || 0);
    setPreviewAllowed(lesson.previewAllowed || false);
    setActiveTab('details');
    setLessonModalOpen(true);
  };

  const handleSaveLesson = async (e) => {
    e.preventDefault();
    if (!lessonTitle.trim()) {
      toast.error('Please enter a lesson title.');
      return;
    }

    setSavingLesson(true);
    try {
      if (editingLesson) {
        // Update lesson
        const res = await api.put(`/lessons/${editingLesson._id}`, {
          title: lessonTitle.trim(),
          description: lessonDescription.trim(),
          videoUrl,
          videoPublicId,
          duration: Number(duration) || 0,
          previewAllowed
        });

        if (res.data?.success) {
          toast.success('Lesson updated successfully!');
          setLessonModalOpen(false);
          fetchCourseAndLessons();
        }
      } else {
        // Create lesson
        const res = await api.post(`/courses/${courseId}/lessons`, {
          title: lessonTitle.trim(),
          description: lessonDescription.trim(),
          videoUrl,
          videoPublicId,
          duration: Number(duration) || 0,
          previewAllowed,
          order: lessons.length + 1
        });

        if (res.data?.success) {
          toast.success('Lesson created successfully!');
          setLessonModalOpen(false);
          fetchCourseAndLessons();
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save lesson');
    } finally {
      setSavingLesson(false);
    }
  };

  const confirmDeleteLesson = async () => {
    if (!lessonToDelete) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/lessons/${lessonToDelete._id}`);
      if (res.data?.success) {
        toast.success('Lesson deleted successfully.');
        setDeleteModalOpen(false);
        setLessonToDelete(null);
        fetchCourseAndLessons();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete lesson');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading Curriculum Studio..." />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/instructor/courses"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-brand-600 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Courses</span>
          </Link>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900">
              Curriculum Builder
            </h1>
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700">
              {lessons.length} Lectures
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Course: <span className="font-bold text-slate-800">{course?.title}</span>
          </p>
        </div>

        <button
          onClick={openCreateLessonModal}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all hover:scale-105"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Lesson</span>
        </button>
      </div>

      {/* Lesson List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden divide-y divide-slate-100">
        {lessons.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Layers className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-base">No lessons added yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add lectures, upload video assets via Cloudinary, and choose free preview options.
            </p>
            <button
              onClick={openCreateLessonModal}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Your First Lecture</span>
            </button>
          </div>
        ) : (
          lessons.map((lesson, idx) => (
            <div
              key={lesson._id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
            >
              <div className="flex items-start space-x-3.5">
                <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 font-bold flex items-center justify-center shrink-0 text-sm">
                  {idx + 1}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-display font-bold text-sm sm:text-base text-slate-900">
                      {lesson.title}
                    </h3>
                    {lesson.previewAllowed && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Free Preview
                      </span>
                    )}
                  </div>

                  {lesson.description && (
                    <p className="text-xs text-slate-500 line-clamp-1">
                      {lesson.description}
                    </p>
                  )}

                  <div className="flex items-center space-x-3 text-xs text-slate-400 pt-0.5">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{Math.round((lesson.duration || 0) / 60)} mins</span>
                    </span>
                    <span>•</span>
                    <span className={lesson.videoUrl ? 'text-emerald-600 font-semibold' : 'text-amber-600'}>
                      {lesson.videoUrl ? 'Video Attached' : 'No Video'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                {lesson.videoUrl && (
                  <button
                    onClick={() => {
                      setActivePreviewVideo(lesson);
                      setPreviewVideoModalOpen(true);
                    }}
                    className="p-2 rounded-lg text-brand-600 bg-brand-50 hover:bg-brand-100 transition-colors"
                    title="Watch lesson video"
                  >
                    <Play className="w-4 h-4 fill-brand-600" />
                  </button>
                )}

                <button
                  onClick={() => openEditLessonModal(lesson)}
                  className="p-2 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                  title="Edit lecture"
                >
                  <Edit className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    setLessonToDelete(lesson);
                    setDeleteModalOpen(true);
                  }}
                  className="p-2 rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                  title="Delete lecture"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Lesson Form Modal */}
      <Modal
        isOpen={lessonModalOpen}
        onClose={() => setLessonModalOpen(false)}
        title={editingLesson ? 'Edit Lecture' : 'Add New Lecture'}
        maxWidth="max-w-2xl"
      >
        {/* Tabs */}
        {editingLesson && (
          <div className="flex border-b border-slate-200 mb-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
                activeTab === 'details' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Lecture Details
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
                activeTab === 'quiz' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Quiz Assessment
            </button>
          </div>
        )}

        {activeTab === 'details' ? (
          <form onSubmit={handleSaveLesson} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Lecture Title *
              </label>
              <input
                type="text"
                required
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="e.g. 1. Introduction to Redux Toolkit"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Lecture Description / Lesson Notes
              </label>
              <textarea
                rows={3}
                value={lessonDescription}
                onChange={(e) => setLessonDescription(e.target.value)}
                placeholder="Key takeaways, resources, documentation links..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            {/* Video Upload or YouTube Link */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Lesson Video Stream
              </label>
              
              <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
                <button
                  type="button"
                  onClick={() => setVideoPublicId('')} // clear public ID to indicate Youtube Mode
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${!videoPublicId && videoUrl.includes('youtube.com') ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  YouTube Link
                </button>
                <button
                  type="button"
                  onClick={() => { if(videoUrl.includes('youtube.com')) setVideoUrl('') }} // switch to upload mode
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${!videoUrl.includes('youtube.com') ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Upload File
                </button>
              </div>

              {!videoPublicId && videoUrl.includes('youtube.com') || (videoUrl === '' && !videoPublicId && activeTab === 'details' && false) /* fallback logic handled below */ ? null : null}
              
              {videoUrl.includes('youtube.com') || (!videoUrl && !videoPublicId && document?.activeElement?.id === 'yt-input') ? (
                <div>
                  <input
                    id="yt-input"
                    type="url"
                    value={videoUrl}
                    onChange={(e) => {
                      setVideoUrl(e.target.value);
                      setVideoPublicId(''); // Clear public ID for youtube links
                    }}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Paste your YouTube channel video URL here.</p>
                </div>
              ) : (
                <MediaUploader
                  type="video"
                  label=""
                  currentUrl={videoUrl}
                  onUploadSuccess={({ url, publicId, duration: vidDuration }) => {
                    setVideoUrl(url);
                    setVideoPublicId(publicId);
                    if (vidDuration) setDuration(vidDuration);
                  }}
                  helpText="MP4, WEBM, MOV up to 100MB"
                />
              )}
            </div>

            {/* Duration & Preview Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Duration (Seconds)
                </label>
                <input
                  type="number"
                  min="0"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="previewAllowed"
                  checked={previewAllowed}
                  onChange={(e) => setPreviewAllowed(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                />
                <label
                  htmlFor="previewAllowed"
                  className="text-xs font-bold text-slate-800 cursor-pointer"
                >
                  Allow Free Preview for this lesson
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setLessonModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingLesson}
                className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-colors disabled:opacity-50"
              >
                {savingLesson ? 'Saving Lecture...' : 'Save Lecture'}
              </button>
            </div>
          </form>
        ) : (
          <QuizBuilder lessonId={editingLesson?._id} onClose={() => setLessonModalOpen(false)} />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDeleteLesson}
        title="Delete Lecture"
        message={`Are you sure you want to delete "${lessonToDelete?.title}"? This cannot be undone.`}
        confirmText="Yes, Delete Lecture"
        loading={deleting}
      />

      {/* Video Preview Modal */}
      <VideoModal
        isOpen={previewVideoModalOpen}
        onClose={() => setPreviewVideoModalOpen(false)}
        videoUrl={activePreviewVideo?.videoUrl}
        title={activePreviewVideo?.title}
        isPreview={true}
      />
    </div>
  );
};
