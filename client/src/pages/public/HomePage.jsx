import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Play,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Award,
  ArrowRight,
  TrendingUp,
  Star,
  Users
} from 'lucide-react';
import api from '../../api/axios';
import { CourseCard } from '../../components/course/CourseCard';
import { CourseCardSkeleton } from '../../components/common/LoadingSpinner';

export const HomePage = () => {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/courses?limit=4&sort=popular');
        if (res.data?.success) {
          setFeaturedCourses(res.data.courses || []);
        }
      } catch (err) {
        console.error('Failed to load featured courses', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const categories = [
    { name: 'Web Development', count: '12+ Courses', icon: '💻', color: 'from-blue-500 to-indigo-600' },
    { name: 'Cloud & DevOps', count: '8+ Courses', icon: '☁️', color: 'from-sky-500 to-cyan-600' },
    { name: 'Data Science & AI', count: '10+ Courses', icon: '🤖', color: 'from-purple-500 to-indigo-700' },
    { name: 'UI/UX Design', count: '6+ Courses', icon: '🎨', color: 'from-pink-500 to-rose-600' },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-mesh-gradient text-white pt-16 pb-24 lg:pt-24 lg:pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs sm:text-sm font-semibold backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span>The Next-Gen Engineering Learning Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-white leading-[1.1]">
              Master In-Demand Tech with{' '}
              <span className="bg-gradient-to-r from-brand-300 via-indigo-200 to-pink-300 bg-clip-text text-transparent">
                Adhi EduBuddy
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Accelerate your engineering journey with real-world architecture courses, interactive HD video lessons, verified progress tracking, and placement-ready portfolio projects.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/courses"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-slate-900 bg-white hover:bg-slate-100 shadow-xl shadow-brand-500/10 transition-all hover:scale-105 active:scale-95 text-center flex items-center justify-center space-x-2"
              >
                <span>Browse Courses</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/register"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-500 border border-brand-400/30 transition-all hover:scale-105 active:scale-95 text-center"
              >
                Join for Free
              </Link>
            </div>

            {/* Micro Highlights */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800 text-slate-400 text-xs sm:text-sm font-medium">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Verified Certificates</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Production Code</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Lifetime Access</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-700/60 bg-slate-800/80 backdrop-blur-xl p-6 space-y-6">
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900 shadow-inner group">
                <img
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80"
                  alt="EduBuddy Platform"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-brand-600/90 text-white flex items-center justify-center shadow-lg shadow-brand-600/50 group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 ml-1 fill-white" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
                    Featured Masterclass
                  </span>
                  <div className="flex items-center space-x-1 text-amber-400 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>5.0 (480 reviews)</span>
                  </div>
                </div>
                <h4 className="font-display font-bold text-lg text-white">
                  Full-Stack MERN Architecture: Production Ready Masterclass
                </h4>
                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-700">
                  <span className="flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>1,420 Enrolled Students</span>
                  </span>
                  <span className="font-bold text-emerald-400 text-sm">$49.99</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900">
            Explore Top Categories
          </h2>
          <p className="text-sm text-slate-500 max-w-lg mx-auto">
            Choose from industry-aligned tracks curated by top engineering instructors.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat, i) => (
            <Link
              key={i}
              to={`/courses?category=${encodeURIComponent(cat.name)}`}
              className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-brand-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group flex flex-col items-center text-center space-y-3"
            >
              <div className="text-3xl p-3 rounded-2xl bg-slate-50 group-hover:scale-110 transition-transform">
                {cat.icon}
              </div>
              <div>
                <h4 className="font-display font-bold text-slate-800 group-hover:text-brand-600 transition-colors text-sm sm:text-base">
                  {cat.name}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">{cat.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Courses Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-brand-600 font-bold text-xs uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Trending Now</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900">
              Popular Learning Tracks
            </h2>
          </div>
          <Link
            to="/courses"
            className="mt-2 sm:mt-0 text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
          >
            <span>View all courses</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <CourseCardSkeleton key={idx} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCourses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}
      </section>

      {/* Free YouTube Resources Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-rose-600 font-bold text-xs uppercase tracking-wider mb-1">
              <Play className="w-4 h-4 fill-rose-600" />
              <span>Free Resources</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900">
              Explore Free Videos from Adhi
            </h2>
            <p className="text-sm text-slate-500 max-w-lg mt-2">
              Before enrolling, check out our free tech tutorials and placement-prep videos straight from our YouTube channel.
            </p>
          </div>
          <a
            href="https://www.youtube.com/@AdieshwarReddyMogili"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 sm:mt-0 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-500/20 transition-all hover:-translate-y-0.5 flex items-center space-x-2 w-fit"
          >
            <span>Subscribe on YouTube</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Latest YouTube Videos from Channel */}
          {[
            { id: '0XNL2cjbHdw', title: 'SNITCH Presentation That Won 1st Prize..|Startup Competition Champions' },
            { id: '7AnzSBszSGw', title: 'Skyroot Aerospace Presentation | Startup Competition | 3rd Prize' },
            { id: 'GxsF8P1T63w', title: 'My Professor Shared This Story It Changed My Thinking' }
          ].map((video, idx) => (
            <div key={idx} className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="aspect-video relative bg-slate-100">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${video.id}?rel=0`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-slate-900 text-sm line-clamp-2">
                  {video.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Instructor CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 p-8 sm:p-12 lg:p-16 text-white shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="px-3 py-1 rounded-full bg-brand-500/30 text-brand-300 text-xs font-bold uppercase tracking-wider">
              Instructor Studio
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
              Teach What You Love. Share Your Knowledge.
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Create curriculum, upload video lessons with Cloudinary, track student progress, and earn revenue with seamless Stripe payouts.
            </p>
            <div className="pt-2">
              <Link
                to="/register?role=instructor"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-slate-900 bg-white hover:bg-slate-100 transition-all hover:scale-105 shadow-lg"
              >
                <span>Become an Instructor Today</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
