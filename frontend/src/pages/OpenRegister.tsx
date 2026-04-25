import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { Vault, CheckCircle2, AlertTriangle, TrendingDown, TrendingUp, Info } from 'lucide-react';

const FLOAT_TARGET = 200;

interface Denomination {
  label: string;
  value: number;
  count: string;
}

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

const OpenRegister: React.FC = () => {
  const navigate = useNavigate();
  const [denominations, setDenominations] = useState<Denomination[]>(INITIAL_DENOMS);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<any>(null);
  const [todaySession, setTodaySession] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/reports/register-status')
      .then(res => {
        // Only show the "already open" screen if register is currently open
        if (res.data.is_open) {
          setTodaySession(res.data.open_session);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateCount = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    setDenominations(prev => prev.map((d, i) => i === idx ? { ...d, count: val } : d));
  };

  const total = denominations.reduce((sum, d) => {
    const n = parseInt(d.count) || 0;
    return sum + n * d.value;
  }, 0);
  const totalRounded = Math.round(total * 100) / 100;

  const shortage = Math.max(0, FLOAT_TARGET - totalRounded);
  const surplus  = Math.max(0, totalRounded - FLOAT_TARGET);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await client.post('/reports/open-register', {
        float_counted: totalRounded,
        notes,
        denominations: denominations.map(d => ({ label: d.label, value: d.value, count: parseInt(d.count) || 0 })),
      });
      setSubmitted(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="spinner text-indigo-600 w-8 h-8" />
    </div>
  );

  if (submitted || todaySession) {
    const session = submitted || todaySession;
    const s = parseFloat(session.shortage);
    const denoms: any[] = session.denominations ? JSON.parse(session.denominations) : [];
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <div className="card text-center py-6">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 size={22} className="text-emerald-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Register Open</h2>
          <p className="text-slate-400 text-sm mt-0.5">Float count recorded — register is open</p>
        </div>

        <div className="card space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-1">Target Float</p>
              <p className="text-2xl font-bold text-slate-800">${FLOAT_TARGET.toFixed(2)}</p>
            </div>
            <div className="bg-indigo-50 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-1">Counted</p>
              <p className="text-2xl font-bold text-indigo-700">${parseFloat(session.float_counted).toFixed(2)}</p>
            </div>
          </div>

          <div className={`rounded-xl p-4 text-center ${s > 0 ? 'bg-red-50 border border-red-100' : 'bg-emerald-50 border border-emerald-100'}`}>
            {s > 0 ? (
              <>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <AlertTriangle size={14} className="text-red-500" />
                  <p className="text-sm font-semibold text-red-700">Shortage of ${s.toFixed(2)}</p>
                </div>
                <p className="text-xs text-red-400">Notify manager</p>
              </>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-600" />
                <p className="text-sm font-semibold text-emerald-700">Float OK — no shortage</p>
              </div>
            )}
          </div>

          {denoms.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Breakdown</p>
              <div className="grid grid-cols-2 gap-1.5">
                {denoms.filter(d => d.count > 0).map(d => (
                  <div key={d.label} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                    <span className="text-xs font-medium text-slate-600">{d.label}</span>
                    <span className="text-xs text-slate-400">× {d.count} = <span className="font-semibold text-slate-700">${(d.count * d.value).toFixed(2)}</span></span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {session.notes && <p className="text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2">Note: {session.notes}</p>}
        </div>

        <button onClick={() => navigate('/sales')} className="btn-primary w-full py-2.5">
          Proceed to Sales
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="card space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <Vault size={18} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">Open Register</h1>
            <p className="text-xs text-slate-400">Count opening float before starting the day</p>
          </div>
        </div>

        {/* Target banner */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50/50 border border-indigo-100 rounded-xl p-4 text-center">
          <p className="text-xs text-indigo-500 uppercase tracking-widest mb-1">Float Target</p>
          <p className="text-4xl font-bold text-indigo-700">${FLOAT_TARGET.toFixed(2)}</p>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
            <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Denomination grid */}
          <div>
            <p className="label">Count each denomination</p>
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
          </div>

          {/* Live total */}
          <div className={`rounded-xl p-4 border text-center transition-all ${
            totalRounded === 0          ? 'bg-slate-50 border-slate-100' :
            shortage > 0               ? 'bg-red-50 border-red-200' :
            surplus > 0                ? 'bg-blue-50 border-blue-200' :
                                         'bg-emerald-50 border-emerald-200'
          }`}>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Total Counted</p>
            <p className={`text-3xl font-bold ${
              totalRounded === 0 ? 'text-slate-300' :
              shortage > 0 ? 'text-red-700' :
              surplus > 0  ? 'text-blue-700' : 'text-emerald-700'
            }`}>
              ${totalRounded.toFixed(2)}
            </p>
            {totalRounded > 0 && (
              <div className="mt-2 flex items-center justify-center gap-1.5">
                {shortage > 0 && <><TrendingDown size={13} className="text-red-500" /><p className="text-xs text-red-600 font-medium">Short by ${shortage.toFixed(2)} — notify manager</p></>}
                {surplus > 0  && <><TrendingUp  size={13} className="text-blue-500" /><p className="text-xs text-blue-600 font-medium">Surplus of ${surplus.toFixed(2)}</p></>}
                {shortage === 0 && surplus === 0 && <><CheckCircle2 size={13} className="text-emerald-500" /><p className="text-xs text-emerald-600 font-medium">Perfect match!</p></>}
              </div>
            )}
          </div>

          <div>
            <label className="label">Notes (optional)</label>
            <textarea className="input resize-none" rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any notes about the float…" />
          </div>

          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
            <Info size={13} className="text-amber-500 flex-shrink-0" />
            <p className="text-xs text-amber-700">Register can only be opened once per day.</p>
          </div>

          <button type="submit" disabled={submitting || totalRounded === 0} className="btn-primary w-full py-3 font-semibold">
            {submitting ? <><span className="spinner w-4 h-4" /> Opening…</> : 'Open Register'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OpenRegister;
