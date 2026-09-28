import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Clock, ArrowRight } from 'lucide-react';
import { StarRating } from '../common/StarRating';

export const CourseCard = ({ course }) => {
  const isFree = course.price === 0;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-brand-200 transition-all duration-300 flex flex-col hover:-translate-y-1">
      {/* Thumbnail Header */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
        <img
          src={
            course.thumbnail ||
            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'
          }
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-white/95 text-slate-800 shadow-sm backdrop-blur-sm">
            {course.category}
          </span>
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-900/80 text-white shadow-sm backdrop-blur-sm">
            {course.level}
          </span>
        </div>
      </div>

      {/* Course Body */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Rating and Reviews */}
        <div className="flex items-center justify-between mb-2">
          <StarRating
            rating={course.averageRating}
            ratingsCount={course.ratingsCount}
            showNumber={true}
          />
          {course.enrolledStudentsCount > 0 && (
            <div className="flex items-center space-x-1 text-xs text-slate-500">
              <Users className="w-3.5 h-3.5" />
              <span>{course.enrolledStudentsCount}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="font-display font-bold text-base text-slate-900 line-clamp-2 group-hover:text-brand-600 transition-colors mb-2">
          <Link to={`/courses/${course._id}`}>{course.title}</Link>
        </h3>

        {/* Short Description */}
        <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
          {course.shortDescription || course.description}
        </p>

        {/* Instructor */}
        {course.instructor && (
          <div className="flex items-center space-x-2.5 mb-4">
            <img
              src={
                course.instructor.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  course.instructor.name || 'Instructor'
                )}&background=6366f1&color=fff`
              }
              alt={course.instructor.name}
              className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200"
            />
            <span className="text-xs font-medium text-slate-600 truncate">
              {course.instructor.name}
            </span>
          </div>
        )}

        {/* Price and CTA */}
        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            {isFree ? (
              <span className="text-base font-extrabold text-emerald-600">
                Free
              </span>
            ) : (
              <div className="flex items-baseline space-x-1">
                <span className="text-lg font-extrabold text-slate-900">
                  ${course.price.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <Link
            to={`/courses/${course._id}`}
            className="inline-flex items-center space-x-1 text-xs font-bold text-brand-600 group-hover:text-brand-700 bg-brand-50 group-hover:bg-brand-100/80 px-3 py-1.5 rounded-lg transition-colors"
          >
            <span>Explore</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};
