import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ size = 'default', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3 py-6">
      <Loader2 className={`${sizeClasses[size] || sizeClasses.default} text-brand-600 animate-spin`} />
      {text && <p className="text-sm font-medium text-slate-500">{text}</p>}
    </div>
  );
};

export const CourseCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm animate-pulse flex flex-col">
      <div className="h-44 bg-slate-200 w-full" />
      <div className="p-5 flex-1 flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-5 bg-slate-200 rounded-full w-24" />
          <div className="h-4 bg-slate-200 rounded w-12" />
        </div>
        <div className="h-6 bg-slate-200 rounded w-4/5" />
        <div className="h-4 bg-slate-200 rounded w-full" />
        <div className="h-4 bg-slate-200 rounded w-2/3" />
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
          <div className="h-5 bg-slate-200 rounded w-28" />
          <div className="h-6 bg-slate-200 rounded w-16" />
        </div>
      </div>
    </div>
  );
};
