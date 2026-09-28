import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, CheckCircle, XCircle, Trash2, Eye, BookOpen } from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ConfirmationModal } from '../../components/common/Modal';

export const AdminCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [publishedFilter, setPublishedFilter] = useState('All');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const toast = useToast();

  const fetchCourses = async () => {
    try {
      const params = { limit: 50 };
      if (searchTerm) params.search = searchTerm;
      if (publishedFilter !== 'All') params.published = publishedFilter;

      const res = await api.get('/admin/courses', { params });
      if (res.data?.success) {
        setCourses(res.data.courses || []);
        setTotal(res.data.total || 0);
      }
    } catch (err) {
      toast.error('Failed to load courses for moderation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [searchTerm, publishedFilter]);

  const handleTogglePublish = async (courseId) => {
    try {
      const res = await api.patch(`/courses/${courseId}/publish`);
      if (res.data?.success) {
        toast.success(res.data.message);
        fetchCourses();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to toggle publication');
    }
  };

  const confirmDeleteCourse = async () => {
    if (!courseToDelete) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/courses/${courseToDelete._id}`);
      if (res.data?.success) {
        toast.success('Course deleted from platform.');
        setDeleteModalOpen(false);
        setCourseToDelete(null);
        fetchCourses();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete course');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading course catalog for moderation..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-display font-extrabold text-slate-900">
          Course Moderation & Quality Control
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review, publish/unpublish, and remove any inappropriate courses across the platform
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          {['All', 'true', 'false'].map((val) => (
            <button
              key={val}
              onClick={() => setPublishedFilter(val)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                publishedFilter === val
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {val === 'All' ? 'All Courses' : val === 'true' ? 'Published' : 'Drafts'}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by course title..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>
      </div>

      {/* Course Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-400 border-b border-slate-200/80">
              <tr>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Instructor</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {courses.map((course) => (
                <tr key={course._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={
                          course.thumbnail ||
                          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'
                        }
                        alt={course.title}
                        className="w-14 h-10 rounded-lg object-cover ring-1 ring-slate-200 shrink-0"
                      />
                      <p className="font-bold text-slate-900 line-clamp-1 max-w-xs">
                        {course.title}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-700">
                    {course.instructor?.name || 'Unknown'}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-slate-600">
                    {course.category}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900 text-xs">
                    {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleTogglePublish(course._id)}
                      className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                        course.published
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                      }`}
                    >
                      {course.published ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Published</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Draft</span>
                        </>
                      )}
                    </button>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                    <Link
                      to={`/courses/${course._id}`}
                      target="_blank"
                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
                      title="View public preview"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      onClick={() => {
                        setCourseToDelete(course);
                        setDeleteModalOpen(true);
                      }}
                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100"
                      title="Delete Course"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDeleteCourse}
        title="Moderate & Delete Course"
        message={`Are you sure you want to permanently delete "${courseToDelete?.title}" from the entire platform?`}
        confirmText="Yes, Delete Course"
        loading={deleting}
      />
    </div>
  );
};
