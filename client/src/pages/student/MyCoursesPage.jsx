import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle, PlayCircle, Search } from 'lucide-react';
import api from '../../api/axios';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export const MyCoursesPage = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'in_progress', 'completed'
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res = await api.get('/enrollments/me');
        if (res.data?.success) {
          setEnrollments(res.data.enrollments || []);
        }
      } catch (err) {
        console.error('Failed to load courses', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  const filteredEnrollments = enrollments.filter((item) => {
    if (!item.course) return false;
    const matchesSearch = item.course.title.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (filter === 'in_progress') return !item.completed;
    if (filter === 'completed') return item.completed;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading your courses..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-display font-extrabold text-slate-900">
          My Enrolled Courses
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage and resume your active learning curriculum
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === 'all'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Courses ({enrollments.length})
          </button>
          <button
            onClick={() => setFilter('in_progress')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === 'in_progress'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            In Progress ({enrollments.filter((e) => !e.completed).length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === 'completed'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Completed ({enrollments.filter((e) => e.completed).length})
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter courses..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>
      </div>

      {filteredEnrollments.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No matching courses found"
          description="You don't have any courses under this filter."
          actionLabel="Explore Catalog"
          actionLink="/courses"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEnrollments.map((item) => {
            const course = item.course;
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
                  </div>

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
  );
};
