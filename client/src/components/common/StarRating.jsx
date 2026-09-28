import React from 'react';
import { Star } from 'lucide-react';

export const StarRating = ({
  rating = 0,
  maxStars = 5,
  showNumber = false,
  ratingsCount = null,
  size = 'sm',
  interactive = false,
  onChange = () => {}
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7'
  };

  const starSize = sizeClasses[size] || sizeClasses.sm;

  return (
    <div className="inline-flex items-center space-x-1">
      {Array.from({ length: maxStars }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= Math.round(rating);

        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange(starValue)}
            className={`${interactive ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default'} focus:outline-none`}
            aria-label={`Rate ${starValue} out of 5 stars`}
          >
            <Star
              className={`${starSize} ${
                isFilled
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-300 fill-slate-100'
              }`}
            />
          </button>
        );
      })}

      {showNumber && (
        <span className="text-xs sm:text-sm font-bold text-slate-700 ml-1.5">
          {Number(rating).toFixed(1)}
        </span>
      )}

      {ratingsCount !== null && (
        <span className="text-xs text-slate-400">
          ({ratingsCount})
        </span>
      )}
    </div>
  );
};
