import React, { useState, useEffect } from 'react';
import { DollarSign, Users, BookOpen, Star, TrendingUp } from 'lucide-react';
import api from '../../api/axios';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StarRating } from '../../components/common/StarRating';

export const InstructorAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/courses/instructor/analytics');
        if (res.data?.success) {
          setAnalytics(res.data.analytics);
        }
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="large" text="Calculating revenue and enrollment metrics..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-display font-extrabold text-slate-900">
          Instructor Revenue & Analytics
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Detailed breakdown of your courses, active students, and Stripe sales
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Earnings
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
              Total Enrollments
            </p>
            <h3 className="text-2xl font-display font-extrabold text-slate-900">
              {analytics?.totalEnrollments || 0}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Unique Students
            </p>
            <h3 className="text-2xl font-display font-extrabold text-slate-900">
              {analytics?.totalStudents || 0}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Created Courses
            </p>
            <h3 className="text-2xl font-display font-extrabold text-slate-900">
              {analytics?.totalCourses || 0}
            </h3>
          </div>
        </div>
      </div>

      {/* Per-Course Breakdown Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4">
        <div className="p-6 border-b border-slate-100">
          <h2 className="font-display font-bold text-lg text-slate-900">
            Per-Course Financial Breakdown
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-400 border-b border-slate-200/80">
              <tr>
                <th className="px-6 py-4">Course Title</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Enrollments</th>
                <th className="px-6 py-4 text-right">Total Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {analytics?.courseBreakdown?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-400 italic">
                    No course sales records yet.
                  </td>
                </tr>
              ) : (
                analytics?.courseBreakdown?.map((course) => (
                  <tr key={course._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {course.title}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
                    </td>
                    <td className="px-6 py-4">
                      <StarRating
                        rating={course.averageRating}
                        ratingsCount={course.ratingsCount}
                        showNumber={true}
                        size="xs"
                      />
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {course.enrollments}
                    </td>
                    <td className="px-6 py-4 font-extrabold text-emerald-600 text-right">
                      ${course.revenue?.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
