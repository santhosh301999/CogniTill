import React, { useEffect, useState, useCallback } from 'react';
import client from '../api/client';
import { TrendingUp, TrendingDown, Minus, ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthlySummary {
  transaction_count: number;
  total_revenue: number;
  cash_sales: number;
  debit_sales: number;
  credit_sales: number;
  avg_transaction: number;
}

interface DailyRow {
  day: string;
  revenue: number;
  transactions: number;
}

interface TopItem {
  name: string;
  units_sold: number;
  revenue: number;
}

interface CategoryRow {
  category: string;
  transactions: number;
  total: number;
}

interface RepairStats {
  total: number;
  completed: number;
  collected: number;
  in_progress: number;
  received: number;
}

interface MonthlyReport {
  year: number;
  month: number;
  summary: MonthlySummary;
  prev_summary: { total_revenue: number; transaction_count: number };
  daily: DailyRow[];
  top_items: TopItem[];
  category_breakdown: CategoryRow[];
  repairs: RepairStats;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const fmt = (n: number | string) => `$${Number(n).toFixed(2)}`;

const pctChange = (current: number, prev: number): number | null => {
  if (prev === 0) return null;
  return ((current - prev) / prev) * 100;
};

const MonthlySalesReport: React.FC = () => {
  const now = new Date();
  const [year, setYear]   = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await client.get('/reports/monthly', { params: { year, month } });
      setReport(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => { load(); }, [load]);

  const stepMonth = (dir: 1 | -1) => {
    let m = month + dir;
    let y = year;
    if (m > 12) { m = 1; y++; }
    if (m < 1)  { m = 12; y--; }
    setMonth(m);
    setYear(y);
  };

  const TrendBadge: React.FC<{ current: number; prev: number }> = ({ current, prev }) => {
    const pct = pctChange(current, prev);
    if (pct === null) return <span className="text-xs text-slate-400">No prior data</span>;
    const up = pct >= 0;
    const Icon = pct === 0 ? Minus : up ? TrendingUp : TrendingDown;
    return (
      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${up ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
        <Icon size={11} />
        {pct >= 0 ? '+' : ''}{pct.toFixed(1)}% vs last month
      </span>
    );
  };

  // Daily chart helpers
  const maxRevenue = report ? Math.max(...report.daily.map(d => Number(d.revenue)), 1) : 1;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Monthly Sales Report</h1>
          <p className="page-subtitle">Revenue & performance breakdown by month</p>
        </div>

        {/* Month picker */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
          <button
            onClick={() => stepMonth(-1)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <ChevronLeft size={15} />
          </button>
          <select
            className="text-sm font-semibold text-slate-800 bg-transparent border-none outline-none cursor-pointer"
            value={month}
            onChange={e => setMonth(Number(e.target.value))}
          >
            {MONTH_NAMES.map((n, i) => <option key={n} value={i + 1}>{n}</option>)}
          </select>
          <select
            className="text-sm font-semibold text-slate-800 bg-transparent border-none outline-none cursor-pointer"
            value={year}
            onChange={e => setYear(Number(e.target.value))}
          >
            {Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button
            onClick={() => stepMonth(1)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="spinner text-indigo-600 w-8 h-8" />
        </div>
      ) : !report ? (
        <div className="card text-center py-16">
          <p className="text-slate-500 font-medium">No data available</p>
        </div>
      ) : (
        <>
          {/* Hero banner */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-800 text-white p-6">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.3) 0%, transparent 60%)' }} />
            <div className="relative flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-indigo-300 text-xs uppercase tracking-wide mb-1">
                  {MONTH_NAMES[report.month - 1]} {report.year}
                </p>
                <p className="text-3xl font-bold">{fmt(report.summary.total_revenue)}</p>
                <p className="text-indigo-300 text-sm mt-1">Total Revenue</p>
              </div>
              <div className="flex flex-wrap gap-6 text-right">
                <div>
                  <p className="text-2xl font-bold">{report.summary.transaction_count}</p>
                  <p className="text-indigo-300 text-xs mt-0.5">Transactions</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{fmt(report.summary.avg_transaction)}</p>
                  <p className="text-indigo-300 text-xs mt-0.5">Avg / Sale</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{report.repairs?.total || 0}</p>
                  <p className="text-indigo-300 text-xs mt-0.5">Repairs Logged</p>
                </div>
              </div>
            </div>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Revenue',       value: fmt(report.summary.total_revenue),      prev: Number(report.prev_summary?.total_revenue),      current: Number(report.summary.total_revenue),      bg: 'bg-indigo-50', text: 'text-indigo-700' },
              { label: 'Transactions',  value: String(report.summary.transaction_count), prev: Number(report.prev_summary?.transaction_count),  current: Number(report.summary.transaction_count),  bg: 'bg-blue-50',   text: 'text-blue-700'   },
              { label: 'Cash Sales',    value: fmt(report.summary.cash_sales),          prev: 0, current: 0, bg: 'bg-emerald-50', text: 'text-emerald-700', noTrend: true },
              { label: 'Repairs Done',  value: String(report.repairs?.completed || 0),  prev: 0, current: 0, bg: 'bg-amber-50',   text: 'text-amber-700',   noTrend: true },
            ].map(card => (
              <div key={card.label} className={`rounded-xl p-4 ${card.bg} border border-white`}>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{card.label}</p>
                <p className={`text-2xl font-bold mt-1.5 ${card.text}`}>{card.value}</p>
                {!card.noTrend && (
                  <div className="mt-1.5">
                    <TrendBadge current={card.current} prev={card.prev} />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Daily revenue chart */}
            <div className="card lg:col-span-2">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Daily Revenue — {MONTH_NAMES[report.month - 1]}</h3>
              {report.daily.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">No sales recorded this month</p>
              ) : (
                <div className="flex items-end gap-1 h-40 overflow-x-auto pb-2">
                  {report.daily.map(d => {
                    const pct = (Number(d.revenue) / maxRevenue) * 100;
                    const dayNum = new Date(d.day + 'T12:00:00').getDate();
                    return (
                      <div key={d.day} className="flex flex-col items-center gap-1 flex-1 min-w-[24px] group relative">
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] rounded-lg px-2 py-1.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                          <p className="font-semibold">{fmt(d.revenue)}</p>
                          <p className="text-slate-300">{d.transactions} txn{Number(d.transactions) !== 1 ? 's' : ''}</p>
                        </div>
                        <div
                          className="w-full bg-indigo-500 rounded-t-md hover:bg-indigo-400 transition-colors"
                          style={{ height: `${Math.max(pct, 3)}%` }}
                        />
                        <span className="text-[9px] text-slate-400">{dayNum}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Payment mode breakdown */}
            <div className="card">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Payment Breakdown</h3>
              {(() => {
                const total = Number(report.summary.total_revenue) || 1;
                const modes = [
                  { label: 'Cash',   value: Number(report.summary.cash_sales),   color: 'bg-emerald-500' },
                  { label: 'Debit',  value: Number(report.summary.debit_sales),  color: 'bg-blue-500'    },
                  { label: 'Credit', value: Number(report.summary.credit_sales), color: 'bg-violet-500'  },
                ];
                return (
                  <div className="space-y-3">
                    {modes.map(m => {
                      const pct = (m.value / total) * 100;
                      return (
                        <div key={m.label}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-600 font-medium">{m.label}</span>
                            <span className="text-slate-800 font-semibold">{fmt(m.value)}</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full ${m.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">{pct.toFixed(1)}% of revenue</p>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Top selling items */}
            <div className="card">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Top Selling Items</h3>
              {report.top_items.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-6">No item sales this month</p>
              ) : (
                <div className="space-y-2">
                  {report.top_items.map((item, i) => {
                    const maxRev = Number(report.top_items[0]?.revenue) || 1;
                    const barPct = (Number(item.revenue) / maxRev) * 100;
                    return (
                      <div key={item.name} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-300 w-5 flex-shrink-0">#{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-1">
                            <span className="text-sm font-medium text-slate-800 truncate">{item.name}</span>
                            <span className="text-sm font-bold text-slate-900 ml-2 flex-shrink-0">{fmt(item.revenue)}</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${barPct}%` }} />
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">{item.units_sold} units sold</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Category breakdown */}
            <div className="card">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Revenue by Category</h3>
              {report.category_breakdown.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-6">No sales this month</p>
              ) : (
                <div className="space-y-3">
                  {report.category_breakdown.map(cat => {
                    const totalRev = Number(report.summary.total_revenue) || 1;
                    const pct = (Number(cat.total) / totalRev) * 100;
                    const colors: Record<string, string> = {
                      Accessory: 'bg-blue-500',
                      SIM: 'bg-emerald-500',
                      Parts: 'bg-amber-500',
                      Voucher: 'bg-violet-500',
                      Other: 'bg-slate-400',
                    };
                    return (
                      <div key={cat.category}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-600 font-medium">{cat.category || 'Uncategorised'}</span>
                          <span className="text-slate-800 font-semibold">{fmt(cat.total)}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${colors[cat.category] || 'bg-slate-400'} rounded-full`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">{cat.transactions} transactions · {pct.toFixed(1)}%</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Repair stats */}
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Repair Activity — {MONTH_NAMES[report.month - 1]}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: 'Total Logged',  value: report.repairs?.total || 0,       color: 'text-slate-800' },
                { label: 'Received',      value: report.repairs?.received || 0,     color: 'text-blue-600'    },
                { label: 'In Progress',   value: report.repairs?.in_progress || 0,  color: 'text-amber-600'   },
                { label: 'Completed',     value: report.repairs?.completed || 0,    color: 'text-emerald-600' },
                { label: 'Collected',     value: report.repairs?.collected || 0,    color: 'text-indigo-600'  },
              ].map(stat => (
                <div key={stat.label} className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MonthlySalesReport;
