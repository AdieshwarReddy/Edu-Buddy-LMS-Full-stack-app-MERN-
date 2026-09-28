import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, CheckCircle2, Clock, BookOpen } from 'lucide-react';
import api from '../../api/axios';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/payments/my-orders');
        if (res.data?.success) {
          setOrders(res.data.orders || []);
        }
      } catch (err) {
        console.error('Failed to load orders', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading your purchase invoices..." />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-display font-extrabold text-slate-900">
          Order & Payment History
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review your verified Stripe transactions and course access invoices
        </p>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No purchase orders found"
          description="You have not purchased any paid courses yet."
          actionLabel="Explore Paid Masterclasses"
          actionLink="/courses"
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden divide-y divide-slate-100">
          {orders.map((order) => (
            <div
              key={order._id}
              className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-base text-slate-900">
                    {order.course?.title || 'Course Enrollment'}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </span>
                    <span>•</span>
                    <span>Order ID: {order._id.substring(0, 10)}...</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end space-x-6">
                <div className="text-right">
                  <span className="text-lg font-extrabold text-slate-900">
                    ${order.amount?.toFixed(2)}
                  </span>
                  <p className="text-xs text-slate-400 capitalize">
                    Via {order.paymentMethod}
                  </p>
                </div>

                <div>
                  {order.status === 'completed' ? (
                    <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Paid</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="capitalize">{order.status}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
