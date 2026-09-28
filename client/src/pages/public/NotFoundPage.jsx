import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, BookOpen } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto shadow-inner">
          <Compass className="w-9 h-9 animate-spin-slow" />
        </div>

        <div className="space-y-2">
          <span className="text-4xl font-extrabold text-brand-600 font-display">
            404
          </span>
          <h1 className="text-2xl font-display font-bold text-slate-900">
            Page Not Found
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            to="/"
            className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-700 text-sm flex items-center justify-center space-x-1.5 shadow-md shadow-brand-500/20"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>

          <Link
            to="/courses"
            className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 text-sm flex items-center justify-center space-x-1.5 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            <span>Explore Courses</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
