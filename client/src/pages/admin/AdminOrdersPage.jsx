import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, CheckCircle2, DollarSign, Clock } from 'lucide-react';
import api from '../../api/axios';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/admin/orders');
        if (res.data?.success) {
          setOrders(res.data.orders || []);
          setTotal(res.data.total || 0);
        }
      } catch (err) {
        console.error('Failed to load admin orders', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading platform transactions ledger..." />
      </div>
    );
  }

  const totalSales = orders
    .filter((o) => o.status === 'completed')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-slate-900">
            Platform Transactions & Orders
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Global ledger of all course purchases, Stripe checkout sessions, and payment verifications
          </p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 px-5 py-3 rounded-2xl flex items-center space-x-3">
          <DollarSign className="w-5 h-5 text-emerald-600" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              Total Volume
            </p>
            <p className="text-lg font-extrabold text-emerald-800">
              ${totalSales.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-400 border-b border-slate-200/80">
              <tr>
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-400 italic">
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                      {order._id.substring(0, 12)}...
                    </td>

                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-900">{order.student?.name || 'Student'}</p>
                        <p className="text-xs text-slate-400">{order.student?.email}</p>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-semibold text-slate-800 max-w-xs truncate">
                      {order.course?.title || 'Course'}
                    </td>

                    <td className="px-6 py-4 font-extrabold text-slate-900 text-xs">
                      ${order.amount?.toFixed(2)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          order.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        <span className="capitalize">{order.status}</span>
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
