import React, { useEffect, useState } from 'react';
import client from '../api/client';
import { Plus, Smartphone, TrendingUp, DollarSign, X, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';

interface Voucher {
  id: number;
  carrier: string;
  amount: number;
  customer_phone: string;
  sold_at: number;
  cost_price: number;
  status: 'Sold' | 'Pending' | 'Failed';
  created_at: string;
}

const carriers = ['Koodo', 'Rogers', 'Telus', 'Bell', 'Freedom', 'Public Mobile', 'Fido', 'Virgin'];
const amounts = [10, 15, 20, 25, 30, 35, 40, 50, 60, 75, 100];

const statusBadge: Record<string, string> = {
  Sold:    'badge-green',
  Pending: 'badge-amber',
  Failed:  'badge-red',
};

const Vouchers: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ carrier: 'Koodo', amount: 30, customer_phone: '', sold_at: 30, cost_price: 0, status: 'Sold' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { loadVouchers(); }, []);

  const loadVouchers = async () => {
    setLoading(true);
    try {
      const res = await client.get('/vouchers');
      setVouchers(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await client.post('/vouchers', form);
      setSuccess('Voucher recorded');
      setShowForm(false);
      setForm({ carrier: 'Koodo', amount: 30, customer_phone: '', sold_at: 30, cost_price: 0, status: 'Sold' });
      loadVouchers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to record voucher');
    } finally { setSubmitting(false); }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await client.patch(`/vouchers/${id}/status`, { status });
      loadVouchers();
    } catch (err) { console.error(err); }
  };

  const deleteVoucher = async (id: number) => {
    if (!confirm('Delete this voucher?')) return;
    try {
      await client.delete(`/vouchers/${id}`);
      loadVouchers();
    } catch (err) { console.error(err); }
  };

  const totalRevenue = vouchers.reduce((s, v) => s + v.sold_at, 0);
  const totalProfit = vouchers.reduce((s, v) => s + (v.sold_at - v.cost_price), 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Top-Up Vouchers</h1>
          <p className="page-subtitle">{vouchers.length} vouchers recorded</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="btn-primary">
          <Plus size={14} /> Sell Voucher
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl border border-slate-100 p-4 text-center">
          <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Smartphone size={14} className="text-slate-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{vouchers.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">Total Vouchers</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-xl border border-emerald-100 p-4 text-center">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <DollarSign size={14} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700">${totalRevenue.toFixed(2)}</p>
          <p className="text-xs text-slate-400 mt-0.5">Revenue</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50/50 rounded-xl border border-indigo-100 p-4 text-center">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <TrendingUp size={14} className="text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-indigo-700">${totalProfit.toFixed(2)}</p>
          <p className="text-xs text-slate-400 mt-0.5">Profit</p>
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm">
          <CheckCircle2 size={14} /> {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
          <AlertTriangle size={14} /> {error}
          <button onClick={() => setError('')} className="ml-auto"><X size={13} /></button>
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-800">Record Voucher Sale</h2>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Carrier *</label>
              <select className="input" value={form.carrier} onChange={e => setForm(p => ({ ...p, carrier: e.target.value }))}>
                {carriers.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Voucher Amount *</label>
              <select className="input" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: parseFloat(e.target.value), sold_at: parseFloat(e.target.value) }))}>
                {amounts.map(a => <option key={a} value={a}>${a}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Sold For ($) *</label>
              <input type="number" step="0.01" className="input" value={form.sold_at} onChange={e => setForm(p => ({ ...p, sold_at: parseFloat(e.target.value) || 0 }))} required />
            </div>
            <div>
              <label className="label">Cost Price ($)</label>
              <input type="number" step="0.01" className="input" value={form.cost_price} onChange={e => setForm(p => ({ ...p, cost_price: parseFloat(e.target.value) || 0 }))} />
            </div>
            <div>
              <label className="label">Customer Phone *</label>
              <input type="tel" className="input" value={form.customer_phone} onChange={e => setForm(p => ({ ...p, customer_phone: e.target.value }))} placeholder="6471234567" required />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                <option>Sold</option><option>Pending</option><option>Failed</option>
              </select>
            </div>
            <div className="col-span-2 sm:col-span-3 flex gap-2 justify-end pt-1">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? <><span className="spinner w-3.5 h-3.5" /> Saving…</> : 'Record Sale'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="spinner text-indigo-600" />
          </div>
        ) : vouchers.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Smartphone size={20} className="text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">No vouchers yet</p>
            <p className="text-slate-400 text-sm mt-1">Record your first sale to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="table-header">
                <tr>
                  {['Carrier', 'Amount', 'Sold For', 'Profit', 'Phone', 'Status', 'Date', ''].map(h => (
                    <th key={h} className="table-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vouchers.map(v => (
                  <tr key={v.id} className="table-row">
                    <td className="table-td font-semibold text-slate-800">{v.carrier}</td>
                    <td className="table-td text-slate-500">${v.amount}</td>
                    <td className="table-td font-semibold text-slate-800">${v.sold_at.toFixed(2)}</td>
                    <td className="table-td font-semibold text-emerald-600">${(v.sold_at - v.cost_price).toFixed(2)}</td>
                    <td className="table-td text-slate-500">{v.customer_phone}</td>
                    <td className="table-td">
                      <span className={statusBadge[v.status] || 'badge-gray'}>{v.status}</span>
                    </td>
                    <td className="table-td text-slate-400 text-xs">{new Date(v.created_at).toLocaleDateString()}</td>
                    <td className="table-td">
                      <div className="flex items-center gap-1.5">
                        {v.status === 'Pending' && (
                          <>
                            <button onClick={() => updateStatus(v.id, 'Sold')} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">Sold</button>
                            <span className="text-slate-200">·</span>
                            <button onClick={() => updateStatus(v.id, 'Failed')} className="text-xs text-red-500 hover:text-red-600 font-medium">Failed</button>
                            <span className="text-slate-200">·</span>
                          </>
                        )}
                        <button onClick={() => deleteVoucher(v.id)} className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Vouchers;
