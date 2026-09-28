import React from 'react';
import { BookOpen, FolderOpen, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmptyState = ({
  icon: Icon = FolderOpen,
  title = 'No items found',
  description = 'There are no items matching your criteria at this moment.',
  actionLabel,
  actionLink,
  onActionClick
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-2xl border border-slate-200/80 my-4 shadow-sm max-w-lg mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 mb-4 shadow-sm">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="font-display font-bold text-lg text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionLabel && (
        actionLink ? (
          <Link
            to={actionLink}
            className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-sm shadow-brand-500/20"
          >
            {actionLabel}
          </Link>
        ) : (
          <button
            onClick={onActionClick}
            className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-sm shadow-brand-500/20"
          >
            {actionLabel}
          </button>
        )
      )}
    </div>
  );
};
