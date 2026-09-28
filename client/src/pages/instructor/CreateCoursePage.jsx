import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Sparkles, Image, Check } from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { MediaUploader } from '../../components/upload/MediaUploader';

export const CreateCoursePage = () => {
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [level, setLevel] = useState('All Levels');
  const [language, setLanguage] = useState('English');
  const [price, setPrice] = useState('0');
  const [thumbnail, setThumbnail] = useState('');
  const [thumbnailPublicId, setThumbnailPublicId] = useState('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Please provide both course title and description.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/courses', {
        title: title.trim(),
        shortDescription: shortDescription.trim(),
        description: description.trim(),
        category,
        level,
        language,
        price: parseFloat(price) || 0,
        thumbnail,
        thumbnailPublicId
      });

      if (res.data?.success) {
        toast.success('Course created! Now add your lessons and video curriculum.');
        navigate(`/instructor/courses/${res.data.course._id}/curriculum`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create course');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Link
          to="/instructor/courses"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-brand-600 mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Instructor Courses</span>
        </Link>
        <h1 className="text-3xl font-display font-extrabold text-slate-900">
          Create New Course
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Set up your masterclass details, category, and pricing
        </p>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Course Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Modern Full-Stack MERN Architecture"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Short Summary / Subtitle (Max 250 chars)
            </label>
            <input
              type="text"
              maxLength={250}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Brief 1-2 sentence hook describing what students will learn..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          {/* Category & Level */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Category *
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
                Difficulty Level
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
                Price (USD) * (0 for Free)
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

          {/* Thumbnail Upload */}
          <div>
            <MediaUploader
              type="image"
              label="Course Thumbnail Cover"
              currentUrl={thumbnail}
              onUploadSuccess={({ url, publicId }) => {
                setThumbnail(url);
                setThumbnailPublicId(publicId);
              }}
              helpText="PNG, JPG, or WEBP (1280x720 recommended)"
            />
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Full Course Description & Curriculum Overview *
            </label>
            <textarea
              rows={6}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed explanation of prerequisites, curriculum structure, technologies used, and final projects..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-100">
            <Link
              to="/instructor/courses"
              className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all hover:scale-105 disabled:opacity-50"
            >
              {submitting ? 'Creating Course...' : 'Save & Continue to Curriculum'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
