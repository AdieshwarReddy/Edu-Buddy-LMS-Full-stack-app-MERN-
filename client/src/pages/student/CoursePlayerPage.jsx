import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  PlayCircle,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Award,
  MessageSquarePlus,
  BookOpen,
  ArrowLeft,
  Lock
} from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ReviewModal } from '../../components/course/ReviewModal';
import { QuizTaker } from '../../components/course/QuizTaker';
import { QnABoard } from '../../components/course/QnABoard';

export const CoursePlayerPage = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingProgress, setUpdatingProgress] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('lesson'); // 'lesson' or 'qna'

  const videoRef = useRef(null);
  const toast = useToast();
  const navigate = useNavigate();

  const fetchCourseAndEnrollment = async () => {
    try {
      // 1. Fetch Course details & lessons
      const courseRes = await api.get(`/courses/${courseId}`);
      if (!courseRes.data?.success) throw new Error('Course not found');

      setCourse(courseRes.data.course);
      const lessonList = courseRes.data.lessons || [];
      setLessons(lessonList);

      // 2. Fetch Enrollment status
      const enrollRes = await api.get(`/enrollments/course/${courseId}`);
      if (enrollRes.data?.success) {
        const enr = enrollRes.data.enrollment;
        setEnrollment(enr);

        // Find last accessed lesson or default to first lesson
        if (enr.lastAccessedLesson && lessonList.some((l) => l._id === enr.lastAccessedLesson._id || l._id === enr.lastAccessedLesson)) {
          const matched = lessonList.find((l) => l._id === (enr.lastAccessedLesson._id || enr.lastAccessedLesson));
          setCurrentLesson(matched || lessonList[0]);
        } else if (lessonList.length > 0) {
          setCurrentLesson(lessonList[0]);
        }
      } else {
        toast.error('You are not enrolled in this course.');
        navigate(`/courses/${courseId}`);
      }
    } catch (err) {
      toast.error('Failed to load course player.');
      navigate('/student/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseAndEnrollment();
  }, [courseId]);

  const isLessonCompleted = (lessonId) => {
    if (!enrollment || !enrollment.completedLessonIds) return false;
    return enrollment.completedLessonIds.some(
      (id) => id.toString() === lessonId.toString()
    );
  };

  const handleToggleLessonComplete = async (lessonId) => {
    if (updatingProgress) return;
    setUpdatingProgress(true);

    const completed = !isLessonCompleted(lessonId);
    try {
      const res = await api.patch(`/enrollments/course/${courseId}/progress`, {
        lessonId,
        completed
      });

      if (res.data?.success) {
        setEnrollment(res.data.enrollment);
        if (completed) {
          toast.success('Lesson marked as completed! 🎉');
          if (res.data.enrollment.completed) {
            toast.success('Congratulations! You completed 100% of this course! 🏆');
          }
        }
      }
    } catch (err) {
      toast.error('Failed to update progress');
    } finally {
      setUpdatingProgress(false);
    }
  };

  const handleSelectLesson = async (lesson) => {
    setCurrentLesson(lesson);
    // Update last accessed in backend
    try {
      await api.patch(`/enrollments/course/${courseId}/progress`, {
        lessonId: lesson._id,
        completed: isLessonCompleted(lesson._id)
      });
    } catch (e) {
      // Background sync
    }
  };

  const handleNextLesson = () => {
    const currentIndex = lessons.findIndex((l) => l._id === currentLesson?._id);
    if (currentIndex < lessons.length - 1) {
      handleSelectLesson(lessons[currentIndex + 1]);
    }
  };

  const handlePrevLesson = () => {
    const currentIndex = lessons.findIndex((l) => l._id === currentLesson?._id);
    if (currentIndex > 0) {
      handleSelectLesson(lessons[currentIndex - 1]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <LoadingSpinner size="large" text="Opening course player..." />
      </div>
    );
  }

  const currentIdx = lessons.findIndex((l) => l._id === currentLesson?._id);

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-slate-950 text-white">
      {/* Top Learning Bar */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <Link
            to="/student/dashboard"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-display font-bold text-sm sm:text-base text-slate-200 truncate max-w-xs sm:max-w-md">
            {course?.title}
          </span>
        </div>

        <div className="flex items-center space-x-4">
          {/* Progress Indicator */}
          <div className="hidden sm:flex items-center space-x-3">
            <div className="w-28 sm:w-36 h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${enrollment?.progressPercentage || 0}%` }}
              />
            </div>
            <span className="text-xs font-bold text-emerald-400">
              {enrollment?.progressPercentage || 0}% Complete
            </span>
          </div>

          {enrollment?.completed && (
            <button
              onClick={async () => {
                try {
                  toast.info('Generating certificate...', 2000);
                  const res = await api.get(`/enrollments/course/${courseId}/certificate`, { responseType: 'blob' });
                  const url = window.URL.createObjectURL(new Blob([res.data]));
                  const link = document.createElement('a');
                  link.href = url;
                  link.setAttribute('download', `Certificate_${course.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
                  document.body.appendChild(link);
                  link.click();
                  link.parentNode.removeChild(link);
                  toast.success('Certificate downloaded successfully!');
                } catch (err) {
                  toast.error('Failed to download certificate.');
                }
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-900 bg-brand-400 hover:bg-brand-300 transition-colors flex items-center space-x-1.5 shadow-[0_0_15px_rgba(79,70,229,0.3)]"
            >
              <Award className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Get Certificate</span>
            </button>
          )}

          <button
            onClick={() => setReviewModalOpen(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors flex items-center space-x-1.5"
          >
            <MessageSquarePlus className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Rate Course</span>
          </button>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors lg:hidden"
            aria-label="Toggle curriculum sidebar"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Player Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Video Stage and Lesson Details */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-slate-950">
          {/* Video Container */}
          <div className="relative aspect-video w-full bg-black flex items-center justify-center shadow-2xl">
            {currentLesson?.videoUrl ? (
              currentLesson.videoUrl.includes('youtube.com') || currentLesson.videoUrl.includes('youtu.be') ? (
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${
                    currentLesson.videoUrl.includes('v=') 
                      ? currentLesson.videoUrl.split('v=')[1].split('&')[0] 
                      : currentLesson.videoUrl.split('youtu.be/')[1]?.split('?')[0] || ''
                  }?autoplay=1&rel=0`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <video
                  key={currentLesson._id}
                  ref={videoRef}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                  src={currentLesson.videoUrl}
                  onEnded={() => {
                    if (!isLessonCompleted(currentLesson._id)) {
                      handleToggleLessonComplete(currentLesson._id);
                    }
                  }}
                >
                  Your browser does not support HTML5 video streaming.
                </video>
              )
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
                <Lock className="w-12 h-12 text-slate-700 mb-3" />
                <p className="text-base font-bold text-slate-300">
                  Video stream not attached yet
                </p>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  The instructor is preparing the video media for this lecture.
                </p>
              </div>
            )}
          </div>

          {/* Lesson Control & Description Footer */}
          <div className="p-6 sm:p-8 space-y-6 max-w-5xl">
            {/* Tabs */}
            <div className="flex border-b border-slate-800 space-x-6">
              <button
                onClick={() => setActiveTab('lesson')}
                className={`pb-3 text-sm font-bold transition-colors relative ${
                  activeTab === 'lesson' ? 'text-brand-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Lesson Content
                {activeTab === 'lesson' && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-500 rounded-t-full" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('qna')}
                className={`pb-3 text-sm font-bold transition-colors relative ${
                  activeTab === 'qna' ? 'text-brand-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Q&A Discussions
                {activeTab === 'qna' && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-500 rounded-t-full" />
                )}
              </button>
            </div>

            {activeTab === 'lesson' ? (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">
                      Lecture {currentIdx + 1} of {lessons.length}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-display font-bold text-white mt-1">
                      {currentLesson?.title || 'Select a lesson'}
                    </h2>
                  </div>

                  {/* Complete Toggle Button */}
                  {currentLesson && (
                    <button
                      type="button"
                      disabled={updatingProgress}
                      onClick={() => handleToggleLessonComplete(currentLesson._id)}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center space-x-2 transition-all ${
                        isLessonCompleted(currentLesson._id)
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                          : 'bg-brand-600 text-white hover:bg-brand-500 shadow-md shadow-brand-500/20'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {isLessonCompleted(currentLesson._id)
                          ? 'Completed (Click to undo)'
                          : 'Mark as Completed'}
                      </span>
                    </button>
                  )}
                </div>

                {/* Description */}
                {currentLesson?.description && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Lecture Notes & Overview
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                      {currentLesson.description}
                    </p>
                  </div>
                )}

                {/* Quiz Assessment */}
                {currentLesson && (
                  <div className="pt-6">
                    <QuizTaker 
                      key={`quiz-${currentLesson._id}`} 
                      lessonId={currentLesson._id} 
                      onComplete={() => {
                        if (!isLessonCompleted(currentLesson._id)) {
                          handleToggleLessonComplete(currentLesson._id);
                        }
                      }} 
                    />
                  </div>
                )}

                {/* Navigation Buttons (Prev / Next) */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-800">
                  <button
                    type="button"
                    disabled={currentIdx <= 0}
                    onClick={handlePrevLesson}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed flex items-center space-x-1.5 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous Lecture</span>
                  </button>

                  <button
                    type="button"
                    disabled={currentIdx >= lessons.length - 1}
                    onClick={handleNextLesson}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center space-x-1.5 transition-colors"
                  >
                    <span>Next Lecture</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="animate-fade-in pt-4">
                <QnABoard courseId={courseId} currentLessonId={currentLesson?._id} />
              </div>
            )}
          </div>
        </div>

        {/* Right: Curriculum Sidebar */}
        {sidebarOpen && (
          <div className="w-full lg:w-96 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 overflow-y-auto max-h-[50vh] lg:max-h-none">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                Course Curriculum ({lessons.length})
              </h3>
            </div>

            <div className="divide-y divide-slate-800/60 flex-1">
              {lessons.map((lesson, idx) => {
                const isActive = lesson._id === currentLesson?._id;
                const isCompleted = isLessonCompleted(lesson._id);

                return (
                  <button
                    key={lesson._id}
                    onClick={() => handleSelectLesson(lesson)}
                    className={`w-full p-4 text-left flex items-start space-x-3 transition-colors ${
                      isActive
                        ? 'bg-brand-950/70 border-l-4 border-brand-500 text-white'
                        : 'hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-600" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-xs sm:text-sm font-semibold truncate ${isActive ? 'text-brand-300' : 'text-slate-200'}`}>
                        {idx + 1}. {lesson.title}
                      </p>
                      <span className="text-[11px] text-slate-500 mt-0.5 block">
                        {Math.round((lesson.duration || 0) / 60)} mins
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        courseId={courseId}
        onReviewSubmitted={() => fetchCourseAndEnrollment()}
      />
    </div>
  );
};
