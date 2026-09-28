import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  BookOpen,
  Users,
  DollarSign,
  TrendingUp,
  Star,
  Settings,
  ArrowRight,
  Video
} from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const InstructorDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, analyticsRes] = await Promise.all([
          api.get('/courses/instructor/my-courses'),
          api.get('/courses/instructor/analytics')
        ]);

        if (coursesRes.data?.success) {
          setCourses(coursesRes.data.courses || []);
        }
        if (analyticsRes.data?.success) {
          setAnalytics(analyticsRes.data.analytics || null);
        }
      } catch (err) {
        console.error('Failed to load instructor data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading Instructor Studio..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Studio Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold">
            Instructor Studio
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
            Welcome back, {user?.name}! 🎓
          </h1>
          <p className="text-sm text-slate-300 max-w-xl">
            Track student enrollment growth, monitor course revenues, and publish new interactive video curricula.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            to="/instructor/webinars"
            className="w-full sm:w-auto px-5 py-3 rounded-xl font-bold text-white bg-brand-500/20 hover:bg-brand-500/30 border border-brand-500/30 transition-all flex items-center justify-center space-x-2 text-sm shrink-0"
          >
            <Video className="w-4 h-4 text-brand-300" />
            <span>Live Classes</span>
          </Link>
          <Link
            to="/instructor/courses/new"
            className="w-full sm:w-auto px-5 py-3 rounded-xl font-bold text-slate-900 bg-white hover:bg-slate-100 transition-all hover:scale-105 shadow-md flex items-center justify-center space-x-2 text-sm shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-brand-600" />
            <span>Create New Course</span>
          </Link>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Revenue
            </p>
            <h3 className="text-2xl font-display font-extrabold text-slate-900">
              ${analytics?.totalRevenue?.toFixed(2) || '0.00'}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Enrolled Students
            </p>
            <h3 className="text-2xl font-display font-extrabold text-slate-900">
              {analytics?.totalEnrollments || 0}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Courses
            </p>
            <h3 className="text-2xl font-display font-extrabold text-slate-900">
              {courses.length}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Published
            </p>
            <h3 className="text-2xl font-display font-extrabold text-slate-900">
              {courses.filter((c) => c.published).length} / {courses.length}
            </h3>
          </div>
        </div>
      </div>

      {/* Courses Overview */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display font-bold text-slate-900">
            My Courses Management
          </h2>
          <Link
            to="/instructor/courses"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
          >
            <span>Manage All Courses</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden divide-y divide-slate-100">
          {courses.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800">No courses created yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Ready to build your first curriculum? Click create course to start adding lessons!
              </p>
              <Link
                to="/instructor/courses/new"
                className="inline-block px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs"
              >
                Create First Course
              </Link>
            </div>
          ) : (
            courses.slice(0, 5).map((course) => (
              <div
                key={course._id}
                className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  <img
                    src={
                      course.thumbnail ||
                      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'
                    }
                    alt={course.title}
                    className="w-16 h-12 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-display font-bold text-base text-slate-900 line-clamp-1">
                        {course.title}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          course.published
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {course.published ? 'Published' : 'Draft'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span>{course.lessonCount || 0} Lessons</span>
                      <span>•</span>
                      <span>{course.enrollmentCount || 0} Students</span>
                      <span>•</span>
                      <span className="font-bold text-slate-700">
                        {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <Link
                    to={`/instructor/courses/${course._id}/curriculum`}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm"
                  >
                    Edit Curriculum
                  </Link>
                  <Link
                    to={`/instructor/courses/${course._id}/edit`}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200"
                  >
                    Settings
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
