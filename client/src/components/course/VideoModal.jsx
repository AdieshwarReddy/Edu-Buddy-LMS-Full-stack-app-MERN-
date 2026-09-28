import React, { useEffect } from 'react';
import { X, PlayCircle, Lock } from 'lucide-react';

export const VideoModal = ({ isOpen, onClose, videoUrl, title, isPreview = true }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4 sm:p-6 text-center">
        <div className="relative transform overflow-hidden rounded-2xl bg-slate-900 text-left shadow-2xl transition-all w-full max-w-4xl z-10 border border-slate-800">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
            <div className="flex items-center space-x-2.5">
              <PlayCircle className="w-5 h-5 text-brand-400" />
              <h3 className="text-base font-bold text-white truncate max-w-lg">
                {title || 'Lesson Video'}
              </h3>
              {isPreview && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Free Preview
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white rounded-lg p-1 hover:bg-slate-800 transition-colors"
              aria-label="Close video player"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Video Container */}
          <div className="relative aspect-video bg-black flex items-center justify-center">
            {videoUrl ? (
              videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${
                    videoUrl.includes('v=') 
                      ? videoUrl.split('v=')[1].split('&')[0] 
                      : videoUrl.split('youtu.be/')[1]?.split('?')[0] || ''
                  }?autoplay=1&rel=0`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <video
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                  src={videoUrl}
                >
                  Your browser does not support the video tag.
                </video>
              )
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                <Lock className="w-12 h-12 text-slate-600 mb-3" />
                <p className="text-base font-semibold text-slate-300">
                  This lesson is locked.
                </p>
                <p className="text-sm text-slate-500 max-w-sm mt-1">
                  Please enroll in this course to get full access to all lectures, videos, and materials.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
