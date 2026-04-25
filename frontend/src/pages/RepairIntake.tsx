import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { CheckCircle2, Smartphone, User, Phone, DollarSign, FileText, MessageSquare } from 'lucide-react';

const RepairIntake: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    device_model: '',
    issue_description: '',
    quoted_price: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await client.post('/repairs', {
        ...form,
        quoted_price: parseFloat(form.quoted_price),
      });
      setSuccess(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create repair');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="card text-center py-8">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={28} className="text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Intake Complete</h2>
          <p className="text-slate-500 text-sm mt-1 mb-6">SMS confirmation sent to customer</p>

          {/* PIN Display */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-100 rounded-2xl p-6 mb-6">
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-3">Customer Pickup PIN</p>
            <div className="flex items-center justify-center gap-3">
              {success.pickup_pin?.split('').map((digit: string, i: number) => (
                <div key={i} className="w-14 h-16 bg-white rounded-xl border-2 border-indigo-200 flex items-center justify-center shadow-sm">
                  <span className="text-3xl font-bold text-indigo-700 font-mono">{digit}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-indigo-400 mt-3">Give this PIN to the customer for pickup</p>
          </div>

          {/* Details */}
          <div className="text-left bg-slate-50 rounded-xl p-4 mb-6 space-y-2">
            {[
              { label: 'Customer', value: success.customer_name },
              { label: 'Phone',    value: success.customer_phone },
              { label: 'Device',   value: success.device_model },
              { label: 'Quoted',   value: `$${parseFloat(success.quoted_price).toFixed(2)}` },
              { label: 'Status',   value: success.status, badge: true },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-center">
                <span className="text-xs text-slate-400 font-medium">{row.label}</span>
                {row.badge
                  ? <span className="badge-blue">{row.value}</span>
                  : <span className="text-sm font-medium text-slate-700">{row.value}</span>
                }
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setSuccess(null);
                setForm({ customer_name: '', customer_phone: '', device_model: '', issue_description: '', quoted_price: '' });
              }}
              className="btn-primary flex-1"
            >
              New Intake
            </button>
            <button onClick={() => navigate('/repairs')} className="btn-secondary flex-1">
              View All
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="page-title">New Repair Intake</h1>
        <p className="page-subtitle">Register a device for repair — a PIN will be generated automatically</p>
      </div>

      <div className="card">
        {error && (
          <div className="mb-5 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label flex items-center gap-1.5">
                <User size={13} className="text-slate-400" /> Customer Name
              </label>
              <input
                className="input"
                type="text"
                name="customer_name"
                value={form.customer_name}
                onChange={handleChange}
                placeholder="John Smith"
                required
              />
            </div>
            <div>
              <label className="label flex items-center gap-1.5">
                <Phone size={13} className="text-slate-400" /> Phone Number
              </label>
              <input
                className="input"
                type="tel"
                name="customer_phone"
                value={form.customer_phone}
                onChange={handleChange}
                placeholder="6471234567"
                required
              />
            </div>
          </div>

          <div>
            <label className="label flex items-center gap-1.5">
              <Smartphone size={13} className="text-slate-400" /> Device Model
            </label>
            <input
              className="input"
              type="text"
              name="device_model"
              value={form.device_model}
              onChange={handleChange}
              placeholder="iPhone 15 Pro, Samsung Galaxy S24…"
              required
            />
          </div>

          <div>
            <label className="label flex items-center gap-1.5">
              <FileText size={13} className="text-slate-400" /> Issue Description
            </label>
            <textarea
              className="input min-h-[100px] resize-y"
              name="issue_description"
              value={form.issue_description}
              onChange={handleChange}
              placeholder="Describe the issue in detail…"
              required
            />
          </div>

          <div>
            <label className="label flex items-center gap-1.5">
              <DollarSign size={13} className="text-slate-400" /> Quoted Price
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">$</span>
              <input
                className="input pl-7"
                type="number"
                name="quoted_price"
                value={form.quoted_price}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <MessageSquare size={15} className="text-blue-500 flex-shrink-0" />
            <p className="text-sm text-blue-700">
              An SMS with the pickup PIN will be sent to the customer automatically.
            </p>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={loading} className="btn-primary flex-1 py-2.5">
              {loading ? (
                <>
                  <span className="spinner w-4 h-4" />
                  Creating…
                </>
              ) : 'Register Repair'}
            </button>
            <button type="button" onClick={() => navigate('/repairs')} className="btn-secondary px-6">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RepairIntake;
