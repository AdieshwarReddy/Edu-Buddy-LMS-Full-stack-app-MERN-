import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  PlayCircle,
  TrendingUp,
  Award,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [webinars, setWebinars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [enrollRes, webinarRes] = await Promise.all([
          api.get('/enrollments/me'),
          api.get('/webinars/student').catch(() => ({ data: { webinars: [] } }))
        ]);
        
        if (enrollRes.data?.success) {
          setEnrollments(enrollRes.data.enrollments || []);
        }
        if (webinarRes.data?.success) {
          setWebinars(webinarRes.data.webinars || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const completedCount = enrollments.filter((e) => e.completed).length;
  const inProgressCount = enrollments.length - completedCount;

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Student Learning Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-sm text-slate-300 max-w-xl">
            You are making great progress. Resume your active lessons or discover new skill tracks today.
          </p>
        </div>

        <Link
          to="/courses"
          className="self-start md:self-auto px-5 py-2.5 rounded-xl font-bold text-slate-900 bg-white hover:bg-slate-100 transition-all hover:scale-105 shadow-md flex items-center space-x-2 text-sm shrink-0"
        >
          <BookOpen className="w-4 h-4" />
          <span>Explore More Courses</span>
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Enrolled
            </p>
            <h3 className="text-2xl font-display font-extrabold text-slate-900">
              {enrollments.length}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              In Progress
            </p>
            <h3 className="text-2xl font-display font-extrabold text-slate-900">
              {inProgressCount}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Completed Courses
            </p>
            <h3 className="text-2xl font-display font-extrabold text-slate-900">
              {completedCount}
            </h3>
          </div>
        </div>
      </div>

      {/* Live Classes Section */}
      {webinars.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-rose-500">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <h2 className="text-lg font-display font-bold text-slate-900">
              Upcoming Live Sessions
            </h2>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x">
            {webinars.map(webinar => (
              <div key={webinar._id} className="min-w-[300px] max-w-[350px] bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-5 text-white shadow-lg shrink-0 snap-center border border-indigo-500/20">
                <div className="flex items-start justify-between mb-3">
                  <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[10px] font-bold tracking-wide">
                    {webinar.course?.title || 'Course'}
                  </span>
                  <div className="flex items-center space-x-1 text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded text-xs font-bold border border-rose-500/20">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(webinar.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>
                <h3 className="font-display font-bold text-lg leading-tight line-clamp-2">{webinar.title}</h3>
                <p className="text-indigo-200 text-xs mt-1">Instructor: {webinar.instructor?.name}</p>
                <div className="mt-4 pt-4 border-t border-indigo-500/30">
                   <Link 
                    to={`/live/${webinar.roomName}`}
                    className="w-full py-2.5 rounded-xl font-bold text-sm text-slate-900 bg-white hover:bg-slate-100 transition-colors flex items-center justify-center space-x-2"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>Join Class Now</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enrolled Courses Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900">
            My Enrolled Courses
          </h2>
          {enrollments.length > 0 && (
            <Link
              to="/student/my-courses"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {enrollments.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No enrolled courses yet"
            description="Explore our catalog of top-rated engineering courses and start learning today!"
            actionLabel="Browse Catalog"
            actionLink="/courses"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((item) => {
              const course = item.course;
              if (!course) return null;

              return (
                <div
                  key={item._id}
                  className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
                >
                  <div className="relative h-44 w-full bg-slate-100">
                    <img
                      src={
                        course.thumbnail ||
                        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'
                      }
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-white/95 text-slate-800 shadow-sm backdrop-blur-sm">
                        {course.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col space-y-4">
                    <div>
                      <h3 className="font-display font-bold text-base text-slate-900 line-clamp-2">
                        {course.title}
                      </h3>
                      {course.instructor && (
                        <p className="text-xs text-slate-400 mt-1">
                          By {course.instructor.name}
                        </p>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-500">Progress</span>
                        <span className={item.completed ? 'text-emerald-600' : 'text-brand-600'}>
                          {item.progressPercentage || 0}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            item.completed ? 'bg-emerald-500' : 'bg-brand-600'
                          }`}
                          style={{ width: `${item.progressPercentage || 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-auto pt-2">
                      <Link
                        to={`/student/course/${course._id}/learn`}
                        className="w-full py-2.5 rounded-xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-700 shadow-sm shadow-brand-500/20 text-center flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
                      >
                        <PlayCircle className="w-4 h-4" />
                        <span>{item.completed ? 'Review Course' : 'Continue Learning'}</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
