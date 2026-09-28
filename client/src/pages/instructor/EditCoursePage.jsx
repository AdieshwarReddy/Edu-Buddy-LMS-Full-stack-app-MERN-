import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Video } from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { MediaUploader } from '../../components/upload/MediaUploader';

export const EditCoursePage = () => {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [level, setLevel] = useState('All Levels');
  const [language, setLanguage] = useState('English');
  const [price, setPrice] = useState('0');
  const [thumbnail, setThumbnail] = useState('');
  const [thumbnailPublicId, setThumbnailPublicId] = useState('');
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  const categories = [
    'Web Development',
    'Mobile Development',
    'Data Science & AI',
    'Cloud & DevOps',
    'UI/UX Design',
    'Cybersecurity',
    'Business & Marketing',
    'Other'
  ];

  const levels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/courses/${id}`);
        if (res.data?.success) {
          const c = res.data.course;
          setTitle(c.title || '');
          setShortDescription(c.shortDescription || '');
          setDescription(c.description || '');
          setCategory(c.category || 'Web Development');
          setLevel(c.level || 'All Levels');
          setLanguage(c.language || 'English');
          setPrice(c.price !== undefined ? c.price.toString() : '0');
          setThumbnail(c.thumbnail || '');
          setThumbnailPublicId(c.thumbnailPublicId || '');
          setPublished(c.published || false);
        }
      } catch (err) {
        toast.error('Failed to load course details');
        navigate('/instructor/courses');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Please provide both course title and description.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.put(`/courses/${id}`, {
        title: title.trim(),
        shortDescription: shortDescription.trim(),
        description: description.trim(),
        category,
        level,
        language,
        price: parseFloat(price) || 0,
        thumbnail,
        thumbnailPublicId,
        published
      });

      if (res.data?.success) {
        toast.success('Course details updated successfully!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update course');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading course editor..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/instructor/courses"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-brand-600 mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Instructor Courses</span>
          </Link>
          <h1 className="text-3xl font-display font-extrabold text-slate-900">
            Edit Course Settings
          </h1>
        </div>

        <Link
          to={`/instructor/courses/${id}/curriculum`}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 transition-colors"
        >
          <Video className="w-4 h-4" />
          <span>Curriculum Builder</span>
        </Link>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Course Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Short Summary (Max 250 chars)
            </label>
            <input
              type="text"
              maxLength={250}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                {levels.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Price (USD)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-bold"
              />
            </div>
          </div>

          <div>
            <MediaUploader
              type="image"
              label="Course Thumbnail Cover"
              currentUrl={thumbnail}
              onUploadSuccess={({ url, publicId }) => {
                setThumbnail(url);
                setThumbnailPublicId(publicId);
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Full Course Description
            </label>
            <textarea
              rows={6}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <input
              type="checkbox"
              id="published"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="published" className="text-sm font-bold text-slate-800 cursor-pointer">
              Publish course immediately in public catalog
            </label>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-slate-100">
            <Link
              to="/instructor/courses"
              className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Update Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
