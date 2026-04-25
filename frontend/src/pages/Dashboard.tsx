import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import {
  TrendingUp, Wrench, CheckCircle2, Banknote, CreditCard,
  PlusCircle, ShoppingCart, KeyRound, Smartphone, Vault,
  WandSparkles, ArrowRight, AlertTriangle, Package,
} from 'lucide-react';

interface TodaySales {
  transaction_count: number;
  total_revenue: number;
  cash_total: number;
  debit_total: number;
  credit_total: number;
}

interface RepairsSummary {
  total_repairs: number;
  completed: number;
  in_progress: number;
  received: number;
}

interface InventoryAlert {
  name: string;
  sku: string;
  quantity: number;
  low_stock_threshold: number;
}

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ElementType;
  gradient: string;
  iconBg: string;
  iconColor: string;
  subtitle?: string;
  trend?: string;
}> = ({ title, value, icon: Icon, gradient, iconBg, iconColor, subtitle, trend }) => (
  <div className={`relative overflow-hidden rounded-xl p-5 ${gradient} border border-white/60`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-slate-900 mt-1.5 tracking-tight">{value}</p>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        {trend && <p className="text-xs text-emerald-600 font-medium mt-1">{trend}</p>}
      </div>
      <div className={`p-2.5 rounded-xl ${iconBg} flex-shrink-0`}>
        <Icon size={18} className={iconColor} />
      </div>
    </div>
  </div>
);

const QuickLink: React.FC<{ to: string; icon: React.ElementType; label: string; desc: string; color: string }> = ({ to, icon: Icon, label, desc, color }) => (
  <Link
    to={to}
    className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all duration-150 group"
  >
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon size={15} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-slate-800">{label}</p>
      <p className="text-xs text-slate-400 truncate">{desc}</p>
    </div>
    <ArrowRight size={14} className="text-slate-300 group-hover:text-slate-500 flex-shrink-0 transition-colors" />
  </Link>
);

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [sales, setSales] = useState<TodaySales | null>(null);
  const [repairs, setRepairs] = useState<RepairsSummary | null>(null);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [eodReport, setEodReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [salesRes, repairsRes] = await Promise.all([
        client.get('/sales/summary/today'),
        client.get('/repairs?status='),
      ]);
      setSales(salesRes.data);

      const repairList = repairsRes.data as any[];
      setRepairs({
        total_repairs: repairList.length,
        completed: repairList.filter(r => r.status === 'Complete').length,
        in_progress: repairList.filter(r => r.status === 'In Progress').length,
        received: repairList.filter(r => r.status === 'Received').length,
      });

      if (user?.role === 'admin' || user?.role === 'manager') {
        const [alertsRes, eodRes] = await Promise.all([
          client.get('/inventory?low_stock=true'),
          client.get('/reports/eod'),
        ]);
        setAlerts(alertsRes.data.slice(0, 5));
        setEodReport(eodRes.data);
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const pipelineStages = [
    { label: 'Received',    count: repairs?.received || 0,    bg: 'bg-slate-100',   text: 'text-slate-700',   ring: 'ring-slate-200' },
    { label: 'In Progress', count: repairs?.in_progress || 0, bg: 'bg-blue-50',     text: 'text-blue-700',    ring: 'ring-blue-100'  },
    { label: 'Complete',    count: repairs?.completed || 0,   bg: 'bg-emerald-50',  text: 'text-emerald-700', ring: 'ring-emerald-100' },
    { label: 'Collected',   count: 0,                          bg: 'bg-violet-50',   text: 'text-violet-700',  ring: 'ring-violet-100' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
            {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">{today}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/repair-intake" className="btn-primary text-sm">
            <PlusCircle size={14} />
            New Repair
          </Link>
          <Link to="/sales" className="btn-secondary text-sm">
            <ShoppingCart size={14} />
            New Sale
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Revenue"
          value={`$${Number(sales?.total_revenue || 0).toFixed(2)}`}
          icon={TrendingUp}
          gradient="bg-gradient-to-br from-emerald-50 to-teal-50/50"
          iconBg="bg-emerald-500"
          iconColor="text-white"
          subtitle={`${sales?.transaction_count || 0} transactions`}
        />
        <StatCard
          title="Active Repairs"
          value={repairs?.in_progress || 0}
          icon={Wrench}
          gradient="bg-gradient-to-br from-blue-50 to-indigo-50/50"
          iconBg="bg-blue-500"
          iconColor="text-white"
          subtitle={`${repairs?.received || 0} awaiting intake`}
        />
        <StatCard
          title="Ready for Pickup"
          value={repairs?.completed || 0}
          icon={CheckCircle2}
          gradient="bg-gradient-to-br from-amber-50 to-orange-50/50"
          iconBg="bg-amber-500"
          iconColor="text-white"
          subtitle="Awaiting collection"
        />
        <StatCard
          title="Cash Sales"
          value={`$${Number(sales?.cash_total || 0).toFixed(2)}`}
          icon={Banknote}
          gradient="bg-gradient-to-br from-violet-50 to-purple-50/50"
          iconBg="bg-violet-500"
          iconColor="text-white"
          subtitle={`Debit: $${Number(sales?.debit_total || 0).toFixed(2)}`}
        />
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Quick Actions */}
        <div className="card space-y-1">
          <h2 className="font-semibold text-slate-800 mb-3 text-sm">Quick Actions</h2>
          <QuickLink to="/repair-intake" icon={PlusCircle}  label="New Repair Intake"  desc="Register a new device"       color="bg-indigo-100 text-indigo-600" />
          <QuickLink to="/sales"         icon={ShoppingCart} label="Process Sale"        desc="Sell accessories or SIMs"   color="bg-emerald-100 text-emerald-600" />
          <QuickLink to="/pin-verify"    icon={KeyRound}     label="PIN Pickup"           desc="Verify customer PIN"        color="bg-amber-100 text-amber-600" />
          <QuickLink to="/vouchers"      icon={Smartphone}   label="Top-Up Voucher"       desc="Sell carrier top-up"        color="bg-blue-100 text-blue-600" />
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <>
              <QuickLink to="/open-register" icon={Vault}        label="Open Register"  desc="Count opening float"    color="bg-slate-100 text-slate-600" />
              <QuickLink to="/close-wizard"  icon={WandSparkles} label="Close Day"      desc="End-of-day wizard"      color="bg-rose-100 text-rose-600" />
            </>
          )}
        </div>

        {/* Repair Pipeline */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800 text-sm">Repair Pipeline</h2>
            <Link to="/repair-tracker" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
              View Board <ArrowRight size={11} />
            </Link>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {pipelineStages.map(stage => (
              <div key={stage.label} className={`rounded-xl p-4 text-center ring-1 ${stage.bg} ${stage.ring}`}>
                <p className={`text-2xl font-bold ${stage.text}`}>{stage.count}</p>
                <p className={`text-xs font-medium mt-1 ${stage.text} opacity-80`}>{stage.label}</p>
              </div>
            ))}
          </div>

          {/* Payment breakdown */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Today's Payment Breakdown
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Cash',   icon: Banknote,   value: sales?.cash_total || 0,   color: 'text-emerald-600' },
                { label: 'Debit',  icon: CreditCard, value: sales?.debit_total || 0,  color: 'text-blue-600' },
                { label: 'Credit', icon: CreditCard, value: sales?.credit_total || 0, color: 'text-violet-600' },
              ].map(p => (
                <div key={p.label} className="bg-slate-50 rounded-xl p-3 text-center">
                  <p.icon size={14} className={`${p.color} mx-auto mb-1.5`} />
                  <p className="text-sm font-bold text-slate-800">${Number(p.value).toFixed(2)}</p>
                  <p className="text-xs text-slate-400">{p.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Admin/Manager bottom row */}
      {(user?.role === 'admin' || user?.role === 'manager') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Low Stock Alerts */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-slate-800 text-sm">Low Stock Alerts</h2>
                {alerts.length > 0 && (
                  <span className="badge-red">{alerts.length}</span>
                )}
              </div>
              <Link to="/inventory" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                Manage <ArrowRight size={11} />
              </Link>
            </div>
            {alerts.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Package size={18} className="text-emerald-500" />
                </div>
                <p className="text-sm text-slate-400">All stock levels are healthy</p>
              </div>
            ) : (
              <div className="space-y-2">
                {alerts.map((item) => (
                  <div key={item.sku} className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-100">
                    <div className="flex items-center gap-2.5">
                      <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-slate-800">{item.name}</p>
                        <p className="text-xs text-slate-400">SKU: {item.sku}</p>
                      </div>
                    </div>
                    <span className="badge-red">{item.quantity} left</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* EOD Summary */}
          {user?.role === 'admin' && eodReport && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-800 text-sm">Today's Summary</h2>
                <Link to="/reports" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                  Full Report <ArrowRight size={11} />
                </Link>
              </div>
              <div className="space-y-1">
                {[
                  { label: 'Total Revenue',       value: `$${Number(eodReport?.sales?.total_revenue || 0).toFixed(2)}`,  highlight: false },
                  { label: 'Transactions',         value: eodReport?.sales?.transaction_count || 0,                 highlight: false },
                  { label: 'Repairs Logged',       value: eodReport?.repairs?.total_repairs || 0,                   highlight: false },
                  { label: 'Repairs Completed',    value: eodReport?.repairs?.completed || 0,                       highlight: true  },
                  { label: 'SIM Sales',            value: `$${Number(eodReport?.sales?.sim_revenue || 0).toFixed(2)}`,    highlight: false },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                    <span className="text-sm text-slate-500">{row.label}</span>
                    <span className={`text-sm font-semibold ${row.highlight ? 'text-emerald-600' : 'text-slate-800'}`}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
