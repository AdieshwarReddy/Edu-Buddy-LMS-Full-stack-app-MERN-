import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  BookOpen,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Video,
  Eye,
  DollarSign
} from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ConfirmationModal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';

export const InstructorCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCourseToDelete, setSelectedCourseToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses/instructor/my-courses');
      if (res.data?.success) {
        setCourses(res.data.courses || []);
      }
    } catch (err) {
      toast.error('Failed to load instructor courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleTogglePublish = async (courseId) => {
    try {
      const res = await api.patch(`/courses/${courseId}/publish`);
      if (res.data?.success) {
        toast.success(res.data.message);
        fetchCourses();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to toggle course publication');
    }
  };

  const confirmDeleteCourse = async () => {
    if (!selectedCourseToDelete) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/courses/${selectedCourseToDelete._id}`);
      if (res.data?.success) {
        toast.success('Course deleted successfully');
        setDeleteModalOpen(false);
        setSelectedCourseToDelete(null);
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
        <LoadingSpinner size="large" text="Loading course catalog..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-slate-900">
            Instructor Course Catalog
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Build, edit curriculum, upload video lectures, and publish your courses
          </p>
        </div>

        <Link
          to="/instructor/courses/new"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-700 shadow-sm shadow-brand-500/20 transition-all hover:scale-105"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Course</span>
        </Link>
      </div>

      {courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses created yet"
          description="Create your first masterclass with lessons and videos today."
          actionLabel="Create Course"
          actionLink="/instructor/courses/new"
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-400 border-b border-slate-200/80">
                <tr>
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Students</th>
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
                        <div>
                          <p className="font-bold text-slate-900 line-clamp-1 max-w-xs">
                            {course.title}
                          </p>
                          <p className="text-xs text-slate-400">
                            {course.lessonCount || 0} Lessons
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-slate-600">
                      {course.category}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900 text-xs">
                      {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-slate-600">
                      {course.enrollmentCount || 0}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleTogglePublish(course._id)}
                        className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                          course.published
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                        }`}
                        title="Click to toggle publish status"
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
                        to={`/instructor/courses/${course._id}/curriculum`}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Curriculum</span>
                      </Link>

                      <Link
                        to={`/instructor/courses/${course._id}/edit`}
                        className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
                        title="Edit course details"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Link>

                      <Link
                        to={`/courses/${course._id}`}
                        target="_blank"
                        className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
                        title="View public page"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        onClick={() => {
                          setSelectedCourseToDelete(course);
                          setDeleteModalOpen(true);
                        }}
                        className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100"
                        title="Delete course"
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
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDeleteCourse}
        title="Delete Course"
        message={`Are you sure you want to permanently delete "${selectedCourseToDelete?.title}"? All associated lessons and student enrollments will also be removed.`}
        confirmText="Yes, Delete Course"
        loading={deleting}
      />
    </div>
  );
};
