import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';

export const UnauthorizedPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <span className="text-4xl font-extrabold text-rose-600 font-display">
            403
          </span>
          <h1 className="text-2xl font-display font-bold text-slate-900">
            Access Denied
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            You do not have the required permissions or role to view this restricted page.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            to="/"
            className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-700 text-sm flex items-center justify-center space-x-1.5 shadow-md shadow-brand-500/20"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 text-sm flex items-center justify-center space-x-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
};
