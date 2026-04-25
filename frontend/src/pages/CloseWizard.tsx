import React, { useEffect, useState } from 'react';
import client from '../api/client';
import {
  Banknote, Calculator, Vault, FileCheck, CheckCircle2,
  ChevronLeft, ChevronRight, PartyPopper, Info, AlertTriangle, TrendingDown, TrendingUp,
} from 'lucide-react';

interface Denomination {
  label: string;
  value: number;
  count: string;
}

interface TodayData {
  total_sales: number;
  cash_sales: number;
  debit_sales: number;
  credit_sales: number;
  transaction_count: number;
  opening_float: number;
  expected_cash: number;
  float_to_remove: number;
  expected_deposit: number;
}

const FLOAT_TARGET = 200;

const INITIAL_DENOMS: Denomination[] = [
  { label: '$100', value: 100,  count: '' },
  { label: '$50',  value: 50,   count: '' },
  { label: '$20',  value: 20,   count: '' },
  { label: '$10',  value: 10,   count: '' },
  { label: '$5',   value: 5,    count: '' },
  { label: '$2',   value: 2,    count: '' },
  { label: '$1',   value: 1,    count: '' },
  { label: '25¢',  value: 0.25, count: '' },
  { label: '10¢',  value: 0.10, count: '' },
  { label: '5¢',   value: 0.05, count: '' },
];

const STEPS = [
  { num: 1, label: 'Count Cash',   icon: Banknote },
  { num: 2, label: 'Reconcile',    icon: Calculator },
  { num: 3, label: 'Remove Float', icon: Vault },
  { num: 4, label: 'Deposit',      icon: FileCheck },
  { num: 5, label: 'Submit',       icon: CheckCircle2 },
];

// Greedy algorithm: given counted denominations, suggest which to physically remove
// to leave exactly FLOAT_TARGET in the till
function computeRemoval(denoms: Denomination[], totalCounted: number): {
  removeMap: Record<string, number>;
  removedTotal: number;
  canExact: boolean;
} {
  const toRemove = Math.round((totalCounted - FLOAT_TARGET) * 100) / 100;
  if (toRemove <= 0) return { removeMap: {}, removedTotal: 0, canExact: totalCounted <= FLOAT_TARGET };

  const removeMap: Record<string, number> = {};
  let remaining = toRemove;

  for (const d of denoms) {
    const available = parseInt(d.count) || 0;
    if (available === 0 || remaining <= 0) continue;
    const canRemove = Math.floor(Math.round(remaining / d.value * 100) / 100);
    const actual = Math.min(canRemove, available);
    if (actual > 0) {
      removeMap[d.label] = actual;
      remaining = Math.round((remaining - actual * d.value) * 100) / 100;
    }
  }

  const removedTotal = toRemove - remaining;
  return { removeMap, removedTotal: Math.round(removedTotal * 100) / 100, canExact: remaining < 0.01 };
}

const CloseWizard: React.FC = () => {
  const [step, setStep] = useState(1);
  const [todayData, setTodayData] = useState<TodayData | null>(null);
  const [denominations, setDenominations] = useState<Denomination[]>(INITIAL_DENOMS);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => { loadTodayData(); }, []);

  const loadTodayData = async () => {
    setLoading(true);
    try {
      const res = await client.get('/close-wizard/today-sales');
      setTodayData(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const updateCount = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    setDenominations(prev => prev.map((d, i) => i === idx ? { ...d, count: val } : d));
  };

  const totalCounted = Math.round(
    denominations.reduce((sum, d) => sum + (parseInt(d.count) || 0) * d.value, 0) * 100
  ) / 100;

  const expectedCash = Number(todayData?.expected_cash || 0);
  const variance = totalCounted - expectedCash;
  const depositAmount = Math.max(0, totalCounted - FLOAT_TARGET);
  const { removeMap, removedTotal, canExact } = computeRemoval(denominations, totalCounted);

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);
    try {
      const res = await client.post('/close-wizard/submit', {
        cash_counted: totalCounted,
        notes,
        denominations: denominations.map(d => ({ label: d.label, value: d.value, count: parseInt(d.count) || 0 })),
      });
      setSubmitted(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Submission failed');
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="spinner text-indigo-600 w-8 h-8" />
    </div>
  );

  if (submitted) return (
    <div className="max-w-lg mx-auto">
      <div className="card text-center py-8">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <PartyPopper size={28} className="text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Day Closed!</h2>
        <p className="text-slate-400 text-sm mt-1 mb-6">End-of-day successfully recorded</p>

        <div className="grid grid-cols-2 gap-3 mb-6 text-left">
          {[
            { label: 'Cash Counted',  value: `$${parseFloat(submitted.cash_counted).toFixed(2)}`,   bg: 'bg-slate-50' },
            { label: 'Expected Cash', value: `$${parseFloat(submitted.expected_cash).toFixed(2)}`,  bg: 'bg-slate-50' },
            { label: 'Variance',      value: `${submitted.variance >= 0 ? '+' : ''}$${parseFloat(submitted.variance).toFixed(2)}`, bg: submitted.variance >= 0 ? 'bg-emerald-50' : 'bg-red-50', color: submitted.variance >= 0 ? 'text-emerald-700' : 'text-red-700' },
            { label: 'Bank Deposit',  value: `$${parseFloat(submitted.deposit_amount).toFixed(2)}`, bg: 'bg-indigo-50', color: 'text-indigo-700' },
          ].map(row => (
            <div key={row.label} className={`${row.bg} rounded-xl p-4`}>
              <p className="text-xs text-slate-400 mb-1">{row.label}</p>
              <p className={`text-xl font-bold ${(row as any).color || 'text-slate-900'}`}>{row.value}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            setSubmitted(null); setStep(1);
            setDenominations(INITIAL_DENOMS); setNotes('');
            loadTodayData();
          }}
          className="btn-secondary w-full"
        >
          Start New Close
        </button>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 1: return (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
            <Info size={16} className="text-indigo-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-indigo-700">Count every bill and coin in the till. Enter the quantity of each denomination below.</p>
          </div>

          {/* Denomination grid */}
          <div className="rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
            {denominations.map((d, idx) => (
              <div key={d.label} className="flex items-center gap-3 px-4 py-2.5 bg-white hover:bg-slate-50/50">
                <span className="w-12 text-sm font-semibold text-slate-700">{d.label}</span>
                <span className="text-slate-300 text-xs">×</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={d.count}
                  onChange={e => updateCount(idx, e.target.value)}
                  placeholder="0"
                  className="w-20 text-center border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                />
                <span className="text-slate-300 text-xs">=</span>
                <span className="text-sm font-medium text-slate-600 ml-auto">
                  {(parseInt(d.count) || 0) > 0
                    ? `$${((parseInt(d.count) || 0) * d.value).toFixed(2)}`
                    : <span className="text-slate-300">—</span>
                  }
                </span>
              </div>
            ))}
          </div>

          {/* Live total */}
          <div className={`rounded-xl p-4 border text-center transition-all ${
            totalCounted === 0 ? 'bg-slate-50 border-slate-100' : 'bg-indigo-50 border-indigo-200'
          }`}>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Total Counted</p>
            <p className={`text-3xl font-bold ${totalCounted === 0 ? 'text-slate-300' : 'text-indigo-700'}`}>
              ${totalCounted.toFixed(2)}
            </p>
          </div>
        </div>
      );

      case 2: return (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
            <Info size={16} className="text-indigo-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-indigo-700">Compare your counted cash against what's expected from today's sales.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Opening Float',    value: `$${Number(todayData?.opening_float || 200).toFixed(2)}`, bg: 'bg-slate-50' },
              { label: 'Cash Sales Today', value: `$${Number(todayData?.cash_sales || 0).toFixed(2)}`,      bg: 'bg-slate-50' },
              { label: 'Expected in Till', value: `$${expectedCash.toFixed(2)}`,                      bg: 'bg-slate-50' },
              { label: 'You Counted',      value: `$${totalCounted.toFixed(2)}`,                      bg: 'bg-indigo-50', color: 'text-indigo-700' },
            ].map(row => (
              <div key={row.label} className={`${row.bg} rounded-xl p-4`}>
                <p className="text-xs text-slate-400 mb-1">{row.label}</p>
                <p className={`text-xl font-bold ${(row as any).color || 'text-slate-800'}`}>{row.value}</p>
              </div>
            ))}
          </div>
          <div className={`rounded-xl p-5 text-center border ${
            variance === 0 ? 'bg-emerald-50 border-emerald-200' :
            variance > 0   ? 'bg-blue-50 border-blue-200' :
                             'bg-red-50 border-red-200'
          }`}>
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Variance</p>
            <div className="flex items-center justify-center gap-2 mb-1">
              {variance > 0 && <TrendingUp size={18} className="text-blue-500" />}
              {variance < 0 && <TrendingDown size={18} className="text-red-500" />}
              {variance === 0 && <CheckCircle2 size={18} className="text-emerald-500" />}
              <p className={`text-4xl font-bold ${variance === 0 ? 'text-emerald-700' : variance > 0 ? 'text-blue-700' : 'text-red-700'}`}>
                {variance >= 0 ? '+' : ''}${variance.toFixed(2)}
              </p>
            </div>
            <p className="text-xs text-slate-400 mt-1.5">
              {variance === 0 ? 'Perfect match!' : variance > 0 ? 'Surplus — double check' : 'Shortage — check for missed sales'}
            </p>
          </div>
          <p className="text-xs text-slate-400 text-center">
            Transactions: {todayData?.transaction_count || 0} · Debit: ${Number(todayData?.debit_sales || 0).toFixed(2)} · Credit: ${Number(todayData?.credit_sales || 0).toFixed(2)}
          </p>
        </div>
      );

      case 3: {
        const removeEntries = Object.entries(removeMap).filter(([, qty]) => qty > 0);
        const floatAfterRemoval = Math.round((totalCounted - removedTotal) * 100) / 100;

        return (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
              <Info size={16} className="text-indigo-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-indigo-700">
                Remove the bills and coins listed below to leave exactly ${FLOAT_TARGET.toFixed(2)} as tomorrow's float.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <p className="text-xs text-slate-400 mb-1">In Drawer</p>
                <p className="text-lg font-bold text-slate-800">${totalCounted.toFixed(2)}</p>
              </div>
              <div className="bg-red-50 rounded-xl p-4 text-center">
                <p className="text-xs text-slate-400 mb-1">Remove</p>
                <p className="text-lg font-bold text-red-600">−${removedTotal.toFixed(2)}</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4 text-center">
                <p className="text-xs text-slate-400 mb-1">Stays</p>
                <p className="text-lg font-bold text-emerald-700">${floatAfterRemoval.toFixed(2)}</p>
              </div>
            </div>

            {totalCounted <= FLOAT_TARGET ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">Till is below float target</p>
                  <p className="text-xs text-amber-600 mt-0.5">
                    Counted ${totalCounted.toFixed(2)} — ${FLOAT_TARGET.toFixed(2)} float target not reached. Nothing to remove.
                  </p>
                </div>
              </div>
            ) : removeEntries.length > 0 ? (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Denominations to Remove
                </p>
                <div className="rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                  {denominations
                    .filter(d => removeMap[d.label] > 0)
                    .map(d => {
                      const qty = removeMap[d.label];
                      return (
                        <div key={d.label} className="flex items-center gap-3 px-4 py-3 bg-white">
                          <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-red-600">{d.label}</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-700">Remove {qty} × {d.label}</p>
                            <p className="text-xs text-slate-400">= ${(qty * d.value).toFixed(2)}</p>
                          </div>
                          <span className="text-sm font-bold text-red-600">−${(qty * d.value).toFixed(2)}</span>
                        </div>
                      );
                    })}
                </div>
                {!canExact && (
                  <div className="mt-2 flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                    <AlertTriangle size={13} className="text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-700">
                      Exact change unavailable with these denominations. Removed ${removedTotal.toFixed(2)} — float will be ${floatAfterRemoval.toFixed(2)}.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                <p className="text-sm text-slate-500">No denominations to remove.</p>
              </div>
            )}

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Amount to Deposit</p>
              <p className="text-4xl font-bold text-emerald-700">${depositAmount.toFixed(2)}</p>
              <p className="text-xs text-slate-400 mt-1">${totalCounted.toFixed(2)} counted − ${FLOAT_TARGET.toFixed(2)} float</p>
            </div>
          </div>
        );
      }

      case 4: return (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
            <Info size={16} className="text-indigo-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-indigo-700">This is the amount you'll deposit to the bank today.</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl p-8 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Bank Deposit Amount</p>
            <p className="text-6xl font-bold text-emerald-700 mb-2">${depositAmount.toFixed(2)}</p>
            <p className="text-xs text-slate-400">${totalCounted.toFixed(2)} counted − ${FLOAT_TARGET.toFixed(2)} float</p>
          </div>
          <div>
            <label className="label">Notes (optional)</label>
            <textarea
              className="input resize-none"
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any notes about today's close…"
            />
          </div>
        </div>
      );

      case 5: return (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
            <Info size={16} className="text-indigo-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-indigo-700">Review everything before submitting the day close.</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-1">
            {[
              { label: 'Cash Counted',    value: `$${totalCounted.toFixed(2)}` },
              { label: 'Expected Cash',   value: `$${expectedCash.toFixed(2)}` },
              { label: 'Variance',        value: `${variance >= 0 ? '+' : ''}$${variance.toFixed(2)}`, color: variance >= 0 ? 'text-emerald-600' : 'text-red-600' },
              { label: 'Float Kept',      value: `$${FLOAT_TARGET.toFixed(2)}`, color: 'text-slate-500' },
              { label: 'Bank Deposit',    value: `$${depositAmount.toFixed(2)}`, color: 'text-emerald-600' },
              { label: "Today's Revenue", value: `$${Number(todayData?.total_sales || 0).toFixed(2)}` },
              { label: 'Transactions',    value: String(todayData?.transaction_count || 0) },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between px-4 py-3 border-b border-slate-100 last:border-0">
                <span className="text-sm text-slate-500">{row.label}</span>
                <span className={`text-sm font-semibold ${(row as any).color || 'text-slate-800'}`}>{row.value}</span>
              </div>
            ))}
          </div>
          {notes && (
            <p className="text-xs text-slate-400 italic px-1">Note: {notes}</p>
          )}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
              <AlertTriangle size={14} /> {error}
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-success w-full py-3.5 text-base font-semibold"
          >
            {submitting ? <><span className="spinner w-4 h-4" /> Submitting…</> : 'Submit Day Close'}
          </button>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Step progress */}
      <div className="card py-4">
        <div className="flex items-center">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isActive = step === s.num;
            const isDone = step > s.num;
            return (
              <React.Fragment key={s.num}>
                <div
                  className={`flex flex-col items-center gap-1.5 cursor-pointer transition-opacity ${step >= s.num ? 'opacity-100' : 'opacity-30'}`}
                  onClick={() => isDone && setStep(s.num)}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    isActive ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200' :
                    isDone   ? 'bg-emerald-500 border-emerald-500 text-white' :
                               'bg-white border-slate-200 text-slate-400'
                  }`}>
                    {isDone ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                  </div>
                  <p className="text-[10px] font-medium text-slate-500 hidden sm:block text-center leading-tight max-w-[60px]">
                    {s.label}
                  </p>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 transition-colors ${isDone ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="card">
        <h2 className="text-base font-semibold text-slate-800 mb-5">
          Step {step} — {STEPS[step - 1].label}
        </h2>
        {renderStep()}
      </div>

      {/* Navigation */}
      {step < 5 && (
        <div className="flex gap-3">
          <button
            onClick={() => setStep(p => Math.max(1, p - 1))}
            disabled={step === 1}
            className="btn-secondary flex-1 disabled:opacity-30"
          >
            <ChevronLeft size={15} /> Previous
          </button>
          <button
            onClick={() => {
              if (step === 1 && totalCounted === 0) { alert('Please count denominations first'); return; }
              setStep(p => Math.min(5, p + 1));
            }}
            className="btn-primary flex-1"
          >
            Next Step <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
};

export default CloseWizard;
