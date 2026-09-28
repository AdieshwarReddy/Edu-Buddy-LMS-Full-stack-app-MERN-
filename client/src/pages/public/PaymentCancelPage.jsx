import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { XCircle, ArrowLeft, ShoppingCart } from 'lucide-react';

export const PaymentCancelPage = () => {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('course_id');

  return (
    <div className="max-w-md mx-auto py-20 px-4">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
          <XCircle className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-display font-extrabold text-slate-900">
            Payment Cancelled
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Your Stripe checkout session was cancelled. No charges were made to your account.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {courseId && (
            <Link
              to={`/courses/${courseId}`}
              className="w-full py-3 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 text-center flex items-center justify-center space-x-2 transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Return to Course Page</span>
            </Link>
          )}

          <Link
            to="/courses"
            className="w-full py-3 rounded-xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 text-center flex items-center justify-center space-x-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse Other Courses</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
