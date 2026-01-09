import React from 'react';
import { Student, Lead, PaymentRecord } from '../types';

interface AnalyticsChartsProps {
  students: Student[];
  leads: Lead[];
  payments: PaymentRecord[];
}

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ students, leads, payments }) => {
  // Calculate membership distribution
  const membershipDistribution = {
    Active: students.filter(s => s.membershipStatus === 'Active').length,
    Paused: students.filter(s => s.membershipStatus === 'Paused').length,
    Cancelled: students.filter(s => s.membershipStatus === 'Cancelled').length,
  };

  const totalMembers = students.length || 1; // Avoid division by zero

  // Calculate lead source distribution
  const leadSources = {
    Instagram: leads.filter(l => l.source === 'Instagram').length,
    Facebook: leads.filter(l => l.source === 'Facebook').length,
    Website: leads.filter(l => l.source === 'Website').length,
    'Walk-in': leads.filter(l => l.source === 'Walk-in').length,
  };

  // Calculate lead status distribution
  const leadStatuses = {
    New: leads.filter(l => l.status === 'New').length,
    Contacted: leads.filter(l => l.status === 'Contacted').length,
    'Trial Booked': leads.filter(l => l.status === 'Trial Booked').length,
    Converted: leads.filter(l => l.status === 'Converted').length,
  };

  // Calculate revenue by month (last 6 months)
  const getMonthlyRevenue = () => {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });

      const monthPayments = payments.filter(p => {
        const paymentDate = new Date(p.date);
        return paymentDate.getMonth() === date.getMonth() &&
               paymentDate.getFullYear() === date.getFullYear() &&
               p.status === 'Succeeded';
      });

      const revenue = monthPayments.reduce((sum, p) => sum + p.amount, 0);

      months.push({ month: monthName, revenue });
    }

    return months;
  };

  const monthlyRevenue = getMonthlyRevenue();
  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue), 1);

  return (
    <div className="space-y-6">
      {/* Membership Status Distribution */}
      <div className="glass-card-tinted p-6 rounded-2xl border border-white/10">
        <h3 className="relative z-10 text-xl font-bold text-white mb-6">Membership Status</h3>
        <div className="relative z-10 space-y-4">
          {Object.entries(membershipDistribution).map(([status, count]) => {
            const percentage = (count / totalMembers) * 100;
            const color = status === 'Active' ? 'bg-green-500' :
                         status === 'Paused' ? 'bg-yellow-500' : 'bg-red-500';

            return (
              <div key={status}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/80 font-semibold">{status}</span>
                  <span className="text-white/60">{count} ({percentage.toFixed(0)}%)</span>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${color} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="glass-card-tinted p-6 rounded-2xl border border-white/10">
        <h3 className="relative z-10 text-xl font-bold text-white mb-6">Revenue Trend (Last 6 Months)</h3>
        <div className="relative z-10">
          <div className="flex items-end justify-between h-48 gap-2">
            {monthlyRevenue.map((data, idx) => {
              const height = (data.revenue / maxRevenue) * 100;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col justify-end h-full">
                    <div className="relative group">
                      <div
                        className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg transition-all duration-500 hover:opacity-80"
                        style={{ height: `${height}%`, minHeight: data.revenue > 0 ? '8px' : '0px' }}
                      />
                      {data.revenue > 0 && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          ${data.revenue.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-white/60 text-xs font-semibold">{data.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lead Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card-tinted p-6 rounded-2xl border border-white/10">
          <h3 className="relative z-10 text-xl font-bold text-white mb-6">Lead Sources</h3>
          <div className="relative z-10 space-y-3">
            {Object.entries(leadSources).map(([source, count]) => {
              const icon = source === 'Instagram' ? '📸' :
                          source === 'Facebook' ? '👍' :
                          source === 'Walk-in' ? '🚶' : '🌐';

              return (
                <div key={source} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{icon}</span>
                    <span className="text-white font-semibold">{source}</span>
                  </div>
                  <span className="text-white/60 font-bold">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lead Pipeline */}
        <div className="glass-card-tinted p-6 rounded-2xl border border-white/10">
          <h3 className="relative z-10 text-xl font-bold text-white mb-6">Lead Pipeline</h3>
          <div className="relative z-10 space-y-3">
            {Object.entries(leadStatuses).map(([status, count]) => {
              const color = status === 'Converted' ? 'bg-green-500/20 text-green-300' :
                           status === 'Trial Booked' ? 'bg-blue-500/20 text-blue-300' :
                           status === 'Contacted' ? 'bg-yellow-500/20 text-yellow-300' :
                           'bg-white/10 text-white/70';

              return (
                <div key={status} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-white font-semibold">{status}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${color}`}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Payment Stats */}
      <div className="glass-card-tinted p-6 rounded-2xl border border-white/10">
        <h3 className="relative z-10 text-xl font-bold text-white mb-6">Payment Overview</h3>
        <div className="relative z-10 grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white/5 rounded-lg">
            <p className="text-xs text-white/60 uppercase tracking-wider mb-2">Succeeded</p>
            <p className="text-2xl font-bold text-green-300">
              {payments.filter(p => p.status === 'Succeeded').length}
            </p>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-lg">
            <p className="text-xs text-white/60 uppercase tracking-wider mb-2">Pending</p>
            <p className="text-2xl font-bold text-yellow-300">
              {payments.filter(p => p.status === 'Pending').length}
            </p>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-lg">
            <p className="text-xs text-white/60 uppercase tracking-wider mb-2">Failed</p>
            <p className="text-2xl font-bold text-red-300">
              {payments.filter(p => p.status === 'Failed').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
