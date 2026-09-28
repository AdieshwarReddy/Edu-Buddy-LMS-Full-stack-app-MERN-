import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  CreditCard,
  UserCheck,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import api from '../../api/axios';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        if (res.data?.success) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error('Failed to load admin stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading platform administration data..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Root System Administrator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
            Platform Operations & Moderation
          </h1>
          <p className="text-sm text-slate-300 max-w-xl">
            Oversee all registered students, instructors, courses, orders, and financial health.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/admin/users"
            className="px-4 py-2.5 rounded-xl font-bold text-slate-900 bg-white hover:bg-slate-100 transition-all text-xs"
          >
            Manage Users
          </Link>
          <Link
            to="/admin/courses"
            className="px-4 py-2.5 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-500 transition-all text-xs shadow-md shadow-rose-600/30"
          >
            Moderate Courses
          </Link>
        </div>
      </div>

      {/* Platform Financial & User Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Platform Sales
            </p>
            <h3 className="text-2xl font-display font-extrabold text-slate-900">
              ${stats?.totalRevenue?.toFixed(2) || '0.00'}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Accounts
            </p>
            <h3 className="text-2xl font-display font-extrabold text-slate-900">
              {stats?.totalUsers || 0}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {stats?.studentCount || 0} Students • {stats?.instructorCount || 0} Instructors
            </p>
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
              {stats?.totalCourses || 0}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {stats?.publishedCourses || 0} Published • {stats?.draftCourses || 0} Drafts
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Enrollments
            </p>
            <h3 className="text-2xl font-display font-extrabold text-slate-900">
              {stats?.totalEnrollments || 0}
            </h3>
          </div>
        </div>
      </div>

      {/* Grid: Recent Users & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Transactions */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-slate-900">
              Recent Transactions
            </h3>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {!stats?.recentOrders || stats.recentOrders.length === 0 ? (
              <p className="p-8 text-center text-xs text-slate-400 italic">
                No orders recorded yet.
              </p>
            ) : (
              stats.recentOrders.map((order) => (
                <div key={order._id} className="p-4 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-800 line-clamp-1">
                      {order.course?.title || 'Course Purchase'}
                    </p>
                    <p className="text-slate-400">
                      By {order.student?.name || 'Student'} ({order.student?.email})
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-slate-900">
                      ${order.amount?.toFixed(2)}
                    </span>
                    <span className="block text-[10px] text-emerald-600 font-bold uppercase">
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-slate-900">
              New Registered Users
            </h3>
            <Link
              to="/admin/users"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {!stats?.recentUsers || stats.recentUsers.length === 0 ? (
              <p className="p-8 text-center text-xs text-slate-400 italic">
                No users found.
              </p>
            ) : (
              stats.recentUsers.map((u) => (
                <div key={u._id} className="p-4 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <img
                      src={
                        u.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          u.name || 'User'
                        )}&background=6366f1&color=fff`
                      }
                      alt={u.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-bold text-slate-800">{u.name}</p>
                      <p className="text-slate-400">{u.email}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 capitalize">
                    {u.role}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
