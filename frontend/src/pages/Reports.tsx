import React, { useEffect, useState } from 'react';
import client from '../api/client';

interface EODReport {
  date: string;
  sales: {
    transaction_count: number;
    total_revenue: number;
    cash_sales: number;
    debit_sales: number;
    credit_sales: number;
    sim_revenue: number;
    accessory_revenue: number;
  };
  repairs: {
    total_repairs: number;
    completed: number;
    collected: number;
    in_progress: number;
    received: number;
  };
  vouchers: {
    count: number;
    revenue: number;
  };
  inventory_alerts: any[];
  close_session: any;
  open_session: any;
  top_items: any[];
}

const Reports: React.FC = () => {
  const [report, setReport] = useState<EODReport | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [categoryBreakdown, setCategoryBreakdown] = useState<any[]>([]);

  useEffect(() => {
    loadReport();
    loadCategoryBreakdown();
  }, [selectedDate]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await client.get('/reports/eod', { params: { date: selectedDate } });
      setReport(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategoryBreakdown = async () => {
    try {
      const res = await client.get('/reports/sales-by-category');
      setCategoryBreakdown(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const SectionCard: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="card">
      <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <span>{icon}</span> {title}
      </h3>
      {children}
    </div>
  );

  const StatRow: React.FC<{ label: string; value: string; highlight?: boolean }> = ({ label, value, highlight }) => (
    <div className="flex justify-between items-center py-2.5 border-b border-slate-50 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-sm font-medium ${highlight ? 'text-slate-900 font-semibold' : 'text-slate-700'}`}>{value}</span>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">EOD Reports</h1>
          <p className="page-subtitle">End-of-Day Summary Report</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            className="input w-auto"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
          />
          <button onClick={loadReport} className="btn-secondary">Refresh</button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="spinner text-indigo-600 w-8 h-8" />
        </div>
      ) : report ? (
        <>
          {/* Date Banner */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-800 text-white p-6">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.3) 0%, transparent 60%)' }} />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-indigo-300 text-xs uppercase tracking-wide mb-1">Report for</p>
                <p className="text-xl font-bold">{new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="text-right">
                <p className="text-indigo-300 text-xs uppercase tracking-wide mb-1">Total Revenue</p>
                <p className="text-3xl font-bold">${Number(report.sales?.total_revenue || 0).toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Transactions',  value: report.sales?.transaction_count || 0,  icon: '🧾', bg: 'bg-blue-50',    text: 'text-blue-700'    },
              { label: 'Repairs Taken', value: report.repairs?.total_repairs || 0,     icon: '🔧', bg: 'bg-orange-50',  text: 'text-orange-700'  },
              { label: 'Repairs Done',  value: report.repairs?.completed || 0,         icon: '✅', bg: 'bg-emerald-50', text: 'text-emerald-700' },
              { label: 'Vouchers Sold', value: report.vouchers?.count || 0,            icon: '📱', bg: 'bg-violet-50',  text: 'text-violet-700'  },
            ].map(stat => (
              <div key={stat.label} className={`rounded-xl p-4 ${stat.bg} border border-white`}>
                <span className="text-xl">{stat.icon}</span>
                <p className={`text-2xl font-bold mt-1.5 ${stat.text}`}>{stat.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Sales Breakdown */}
            <SectionCard title="Sales Breakdown" icon="💰">
              <StatRow label="Total Revenue" value={`$${Number(report.sales?.total_revenue || 0).toFixed(2)}`} highlight />
              <StatRow label="Cash Sales" value={`$${Number(report.sales?.cash_sales || 0).toFixed(2)}`} />
              <StatRow label="Debit Sales" value={`$${Number(report.sales?.debit_sales || 0).toFixed(2)}`} />
              <StatRow label="Credit Sales" value={`$${Number(report.sales?.credit_sales || 0).toFixed(2)}`} />
              <StatRow label="SIM Revenue" value={`$${Number(report.sales?.sim_revenue || 0).toFixed(2)}`} />
              <StatRow label="Accessory Revenue" value={`$${Number(report.sales?.accessory_revenue || 0).toFixed(2)}`} />
              <StatRow label="Voucher Revenue" value={`$${Number(report.vouchers?.revenue || 0).toFixed(2)}`} />
            </SectionCard>

            {/* Repair Summary */}
            <SectionCard title="Repair Summary" icon="🔧">
              <StatRow label="New Intakes" value={String(report.repairs?.received || 0)} />
              <StatRow label="In Progress" value={String(report.repairs?.in_progress || 0)} />
              <StatRow label="Completed" value={String(report.repairs?.completed || 0)} />
              <StatRow label="Collected" value={String(report.repairs?.collected || 0)} />
              <StatRow label="Total Active" value={String(report.repairs?.total_repairs || 0)} highlight />
            </SectionCard>

            {/* Top Selling Items */}
            {report.top_items && report.top_items.length > 0 && (
              <SectionCard title="Top Selling Items Today" icon="🏆">
                <div className="space-y-2">
                  {report.top_items.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-bold text-slate-300 w-5">#{i + 1}</span>
                        <span className="text-sm font-semibold text-slate-800">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">${parseFloat(item.revenue).toFixed(2)}</p>
                        <p className="text-xs text-slate-400">{item.units_sold} units</p>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Inventory Alerts */}
            {report.inventory_alerts && report.inventory_alerts.length > 0 && (
              <SectionCard title="Low Stock Alerts" icon="⚠️">
                <div className="space-y-2">
                  {report.inventory_alerts.map((item: any) => (
                    <div key={item.sku} className="flex items-center justify-between p-2 bg-red-50 rounded-lg border border-red-100">
                      <div>
                        <p className="text-sm font-medium text-red-900">{item.name}</p>
                        <p className="text-xs text-red-400">SKU: {item.sku}</p>
                      </div>
                      <span className="badge-red">{item.quantity} left</span>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Close/Open Sessions */}
            {(report.close_session || report.open_session) && (
              <SectionCard title="Till Activity" icon="🏦">
                {report.open_session && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 font-medium uppercase mb-2">Opening Float</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-xs text-gray-400">Counted</p>
                        <p className="font-semibold">${parseFloat(report.open_session.float_counted).toFixed(2)}</p>
                      </div>
                      <div className={`rounded p-2 ${report.open_session.shortage > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                        <p className="text-xs text-gray-400">Shortage</p>
                        <p className={`font-semibold ${report.open_session.shortage > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ${parseFloat(report.open_session.shortage || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {report.close_session && (
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase mb-2">Day Close</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-xs text-gray-400">Cash Counted</p>
                        <p className="font-semibold">${parseFloat(report.close_session.cash_counted).toFixed(2)}</p>
                      </div>
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-xs text-gray-400">Bank Deposit</p>
                        <p className="font-semibold text-green-700">${parseFloat(report.close_session.deposit_amount).toFixed(2)}</p>
                      </div>
                      <div className={`rounded p-2 ${report.close_session.variance < 0 ? 'bg-red-50' : 'bg-green-50'} col-span-2`}>
                        <p className="text-xs text-gray-400">Variance</p>
                        <p className={`font-semibold ${report.close_session.variance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {report.close_session.variance >= 0 ? '+' : ''}${parseFloat(report.close_session.variance).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </SectionCard>
            )}
          </div>

          {/* All-Time Category Breakdown */}
          {categoryBreakdown.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">All-Time Sales by Category</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {categoryBreakdown.map((cat: any) => (
                  <div key={cat.category} className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{cat.category}</p>
                    <p className="text-xl font-bold text-slate-900 mt-1.5">${parseFloat(cat.total).toFixed(2)}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{cat.transactions} transactions</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="card text-center py-16">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-xl">📊</span>
          </div>
          <p className="text-slate-500 font-medium">No data for this date</p>
          <p className="text-slate-400 text-sm mt-1">Try a different date</p>
        </div>
      )}
    </div>
  );
};

export default Reports;
