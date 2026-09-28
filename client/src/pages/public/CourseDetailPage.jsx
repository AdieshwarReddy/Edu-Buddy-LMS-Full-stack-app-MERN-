import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Play,
  CheckCircle,
  Lock,
  Clock,
  BookOpen,
  Award,
  Globe,
  Share2,
  Users,
  ShieldCheck,
  Star,
  MessageSquarePlus,
  PlayCircle
} from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StarRating } from '../../components/common/StarRating';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { VideoModal } from '../../components/course/VideoModal';
import { ReviewModal } from '../../components/course/ReviewModal';

export const CourseDetailPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  // Video preview modal state
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedPreviewLesson, setSelectedPreviewLesson] = useState(null);

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [userReview, setUserReview] = useState(null);

  const fetchCourseData = async () => {
    try {
      const res = await api.get(`/courses/${id}`);
      if (res.data?.success) {
        setCourse(res.data.course);
        setLessons(res.data.lessons || []);
        setIsEnrolled(res.data.isEnrolled || false);
        setIsOwner(res.data.isOwner || false);

        // Check if user already reviewed
        if (user && res.data.course.reviews) {
          const found = res.data.course.reviews.find(
            (r) => r.student?._id === user._id || r.student === user._id
          );
          setUserReview(found || null);
        }
      }
    } catch (err) {
      toast.error('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [id, user]);

  const handleEnrollOrBuy = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in or create an account to enroll.');
      navigate('/login', { state: { from: { pathname: `/courses/${id}` } } });
      return;
    }

    if (course.price === 0) {
      // Free enrollment
      setEnrolling(true);
      try {
        const res = await api.post(`/enrollments/free/${course._id}`);
        if (res.data?.success) {
          toast.success('Successfully enrolled in course!');
          setIsEnrolled(true);
          navigate(`/student/course/${course._id}/learn`);
        }
      } catch (err) {
        toast.error(err.message || 'Enrollment failed');
      } finally {
        setEnrolling(false);
      }
    } else {
      // Paid Stripe Checkout flow
      setEnrolling(true);
      try {
        const res = await api.post('/payments/create-checkout-session', {
          courseId: course._id
        });

        if (res.data?.url) {
          // Redirect to Stripe checkout (or dev mock url)
          window.location.href = res.data.url;
        }
      } catch (err) {
        toast.error(err.message || 'Payment initiation failed');
        setEnrolling(false);
      }
    }
  };

  const handleOpenPreview = (lesson) => {
    setSelectedPreviewLesson(lesson);
    setPreviewModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading course details..." />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <h2 className="text-2xl font-bold text-slate-800">Course Not Found</h2>
        <p className="text-slate-500 mt-2">
          The requested course might have been removed or unpublished.
        </p>
        <Link
          to="/courses"
          className="inline-block mt-4 px-6 py-2.5 rounded-xl bg-brand-600 text-white font-semibold"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  const totalDurationMinutes = Math.round(
    lessons.reduce((acc, curr) => acc + (curr.duration || 0), 0) / 60
  );

  return (
    <div className="space-y-10 pb-20">
      {/* Course Hero Banner */}
      <section className="bg-slate-900 text-white py-12 lg:py-16 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                {course.category}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300">
                {course.level}
              </span>
              <span className="flex items-center space-x-1 text-slate-400">
                <Globe className="w-3.5 h-3.5" />
                <span>{course.language}</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-white leading-tight">
              {course.title}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              {course.shortDescription || course.description.slice(0, 180)}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-300 pt-2">
              <div className="flex items-center space-x-2">
                <StarRating
                  rating={course.averageRating}
                  ratingsCount={course.ratingsCount}
                  showNumber={true}
                  size="md"
                />
              </div>
              <div className="flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-slate-400" />
                <span>{course.enrolledStudentsCount || 0} Enrolled Students</span>
              </div>
            </div>

            {/* Instructor signature */}
            {course.instructor && (
              <div className="flex items-center space-x-3 pt-2">
                <img
                  src={
                    course.instructor.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      course.instructor.name || 'Instructor'
                    )}&background=6366f1&color=fff`
                  }
                  alt={course.instructor.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-500/40"
                />
                <div>
                  <p className="text-xs text-slate-400">Created by</p>
                  <p className="text-sm font-bold text-white">{course.instructor.name}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content & Sticky Purchase Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Course Details, Curriculum, Reviews */}
          <div className="lg:col-span-8 space-y-10">
            {/* Description */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
              <h2 className="text-xl font-display font-bold text-slate-900">
                Course Overview & Description
              </h2>
              <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-600 whitespace-pre-line">
                {course.description}
              </div>
            </div>

            {/* Curriculum Breakdown */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <h2 className="text-xl font-display font-bold text-slate-900">
                    Course Curriculum
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {lessons.length} lectures • ~{totalDurationMinutes || 45} minutes total runtime
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {lessons.length === 0 ? (
                  <p className="text-sm text-slate-400 italic py-4">
                    Curriculum content is currently being finalized by the instructor.
                  </p>
                ) : (
                  lessons.map((lesson, idx) => (
                    <div
                      key={lesson._id}
                      className="py-3.5 flex items-center justify-between group hover:bg-slate-50/80 px-3 rounded-xl transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 shrink-0 font-bold text-xs">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {lesson.title}
                          </p>
                          {lesson.description && (
                            <p className="text-xs text-slate-400 line-clamp-1">
                              {lesson.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {lesson.previewAllowed ? (
                          <button
                            onClick={() => handleOpenPreview(lesson)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 transition-colors"
                          >
                            <Play className="w-3 h-3 fill-brand-600" />
                            <span>Preview</span>
                          </button>
                        ) : isEnrolled || isOwner ? (
                          <span className="text-xs text-emerald-600 font-semibold flex items-center space-x-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Available</span>
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 flex items-center space-x-1">
                            <Lock className="w-3.5 h-3.5" />
                            <span>Locked</span>
                          </span>
                        )}
                        <span className="text-xs text-slate-400 w-12 text-right">
                          {Math.round((lesson.duration || 0) / 60)}m
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Instructor Bio Card */}
            {course.instructor && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
                <h2 className="text-xl font-display font-bold text-slate-900">
                  About the Instructor
                </h2>
                <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
                  <img
                    src={
                      course.instructor.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        course.instructor.name || 'Instructor'
                      )}&background=6366f1&color=fff`
                    }
                    alt={course.instructor.name}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-brand-500/20"
                  />
                  <div className="space-y-2">
                    <h3 className="font-display font-bold text-base text-slate-900">
                      {course.instructor.name}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {course.instructor.bio ||
                        'Senior technology architect and experienced educator passionate about building production systems.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Student Reviews Section */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
                <div>
                  <h2 className="text-xl font-display font-bold text-slate-900">
                    Student Feedback & Reviews
                  </h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <StarRating
                      rating={course.averageRating}
                      showNumber={true}
                      ratingsCount={course.ratingsCount}
                      size="sm"
                    />
                  </div>
                </div>

                {isEnrolled && (
                  <button
                    onClick={() => setReviewModalOpen(true)}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 transition-colors shrink-0"
                  >
                    <MessageSquarePlus className="w-4 h-4" />
                    <span>{userReview ? 'Edit My Review' : 'Write a Review'}</span>
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {!course.reviews || course.reviews.length === 0 ? (
                  <p className="text-sm text-slate-400 italic py-2">
                    No reviews submitted yet for this course. Be the first enrolled student to leave a review!
                  </p>
                ) : (
                  course.reviews.map((rev) => (
                    <div key={rev._id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <img
                            src={
                              rev.student?.avatar ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                rev.student?.name || 'Student'
                              )}&background=6366f1&color=fff`
                            }
                            alt={rev.student?.name}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <span className="text-sm font-bold text-slate-800">
                            {rev.student?.name || 'Verified Student'}
                          </span>
                        </div>
                        <StarRating rating={rev.rating} size="xs" />
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-9">
                        {rev.comment}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Floating Purchase Card */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xl p-6 space-y-6">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100">
                <img
                  src={
                    course.thumbnail ||
                    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'
                  }
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Price */}
              <div className="flex items-baseline justify-between">
                {course.price === 0 ? (
                  <span className="text-3xl font-extrabold text-emerald-600">
                    Free
                  </span>
                ) : (
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-extrabold text-slate-900">
                      ${course.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-slate-400 line-through">
                      ${(course.price * 1.5).toFixed(2)}
                    </span>
                  </div>
                )}
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Full Lifetime Access
                </span>
              </div>

              {/* Action Button */}
              {isEnrolled ? (
                <Link
                  to={`/student/course/${course._id}/learn`}
                  className="w-full py-3.5 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 text-center flex items-center justify-center space-x-2 transition-all hover:scale-[1.02]"
                >
                  <PlayCircle className="w-5 h-5" />
                  <span>Resume Learning</span>
                </Link>
              ) : isOwner ? (
                <Link
                  to={`/instructor/courses/${course._id}/curriculum`}
                  className="w-full py-3.5 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 text-center flex items-center justify-center space-x-2 transition-all"
                >
                  <span>Manage in Studio</span>
                </Link>
              ) : (
                <button
                  type="button"
                  disabled={enrolling}
                  onClick={handleEnrollOrBuy}
                  className="w-full py-3.5 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {enrolling ? (
                    <LoadingSpinner size="small" text="" />
                  ) : course.price === 0 ? (
                    <span>Enroll for Free</span>
                  ) : (
                    <span>Enroll Now with Stripe</span>
                  )}
                </button>
              )}

              {/* Guarantee highlights */}
              <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Interactive HD video lessons & code</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-brand-500 shrink-0" />
                  <span>Certificate of Completion</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Direct instructor support & Q&A</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Preview Modal */}
      <VideoModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        videoUrl={selectedPreviewLesson?.videoUrl}
        title={selectedPreviewLesson?.title}
        isPreview={true}
      />

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        courseId={course._id}
        existingReview={userReview}
        onReviewSubmitted={() => fetchCourseData()}
      />
    </div>
  );
};
