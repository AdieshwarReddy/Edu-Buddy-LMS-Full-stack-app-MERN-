import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, PlayCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import api from '../../api/axios';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';

export const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const isMock = searchParams.get('mock') === 'true';

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      if (!sessionId) {
        setError('Missing checkout session identifier.');
        setLoading(false);
        return;
      }

      try {
        // In dev mock mode, confirm order state first
        if (isMock) {
          await api.post('/payments/mock-confirm', { sessionId });
        }

        // Verify status from backend database
        const res = await api.get(`/payments/verify/${sessionId}`);
        if (res.data?.success) {
          setOrder(res.data.order);
        }
      } catch (err) {
        setError(err.message || 'Could not verify payment status.');
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [sessionId, isMock]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="large" text="Verifying your purchase with backend..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto py-20 px-4 text-center">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Verification Pending</h2>
          <p className="text-sm text-slate-600">{error}</p>
          <div className="pt-2">
            <Link
              to="/student/dashboard"
              className="inline-block px-6 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-sm"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-16 px-4">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto shadow-inner animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            Payment Confirmed
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 pt-2">
            Enrollment Successful!
          </h1>
          <p className="text-sm text-slate-500">
            You now have full lifetime access to this course and its lectures.
          </p>
        </div>

        {order?.course && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Purchased Course
            </p>
            <h3 className="text-sm font-bold text-slate-800 line-clamp-2">
              {order.course.title}
            </h3>
            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/60">
              <span>Amount Paid:</span>
              <span className="font-extrabold text-slate-900">${order.amount?.toFixed(2)}</span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {order?.course?._id ? (
            <Link
              to={`/student/course/${order.course._id}/learn`}
              className="w-full py-3.5 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 text-center flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
            >
              <PlayCircle className="w-5 h-5" />
              <span>Start Learning Now</span>
            </Link>
          ) : (
            <Link
              to="/student/dashboard"
              className="w-full py-3.5 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 text-center flex items-center justify-center space-x-2"
            >
              <span>Go to Student Dashboard</span>
            </Link>
          )}

          <Link
            to="/student/orders"
            className="block text-xs font-semibold text-slate-500 hover:text-slate-700"
          >
            View Order Invoice & Receipts
          </Link>
        </div>
      </div>
    </div>
  );
};
