import React, { useState } from 'react';
import client from '../api/client';
import { KeyRound, CheckCircle2, Clock, RotateCcw, Smartphone, User, Phone, DollarSign } from 'lucide-react';

interface Repair {
  id: number;
  customer_name: string;
  customer_phone: string;
  device_model: string;
  issue_description: string;
  quoted_price: number;
  pickup_pin: string;
  status: string;
  created_at: string;
}

const statusBadge: Record<string, string> = {
  'Received':    'badge-gray',
  'In Progress': 'badge-blue',
  'Complete':    'badge-green',
  'Collected':   'badge-amber',
};

const PinVerification: React.FC = () => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [repair, setRepair] = useState<Repair | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [collecting, setCollecting] = useState(false);
  const [collected, setCollected] = useState(false);

  const pinRefs = [
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
  ];

  const handlePinChange = (idx: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pin];
    newPin[idx] = value.slice(-1);
    setPin(newPin);
    if (value && idx < 3) pinRefs[idx + 1].current?.focus();
    if (newPin.every(d => d !== '')) lookupPin(newPin.join(''));
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[idx] && idx > 0) {
      pinRefs[idx - 1].current?.focus();
    }
  };

  const lookupPin = async (fullPin: string) => {
    setError('');
    setRepair(null);
    setCollected(false);
    setLoading(true);
    try {
      const res = await client.get(`/repairs/pin/${fullPin}`);
      setRepair(res.data);
    } catch (err: any) {
      setError(err.response?.status === 404
        ? 'No repair found with this PIN. Please check and try again.'
        : 'Lookup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const fullPin = pin.join('');
    if (fullPin.length === 4) lookupPin(fullPin);
  };

  const handleCollect = async () => {
    if (!repair) return;
    setCollecting(true);
    try {
      await client.patch(`/repairs/${repair.id}/status`, { status: 'Collected' });
      setRepair(prev => prev ? { ...prev, status: 'Collected' } : prev);
      setCollected(true);
    } catch (err) {
      console.error(err);
    } finally {
      setCollecting(false);
    }
  };

  const reset = () => {
    setPin(['', '', '', '']);
    setRepair(null);
    setError('');
    setCollected(false);
    setTimeout(() => pinRefs[0].current?.focus(), 50);
  };

  return (
    <div className="max-w-lg mx-auto space-y-5">
      {/* PIN entry card */}
      <div className="card">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center">
            <KeyRound size={16} className="text-indigo-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Enter Pickup PIN</h2>
            <p className="text-xs text-slate-400">4-digit code given to customer at intake</p>
          </div>
        </div>

        <form onSubmit={handleSearch}>
          <div className="flex justify-center gap-3 mb-6">
            {pin.map((digit, idx) => (
              <input
                key={idx}
                ref={pinRefs[idx]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handlePinChange(idx, e.target.value)}
                onKeyDown={e => handleKeyDown(idx, e)}
                className={`w-16 h-18 text-center text-3xl font-bold rounded-xl border-2 focus:outline-none transition-all duration-150 ${
                  digit
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100'
                    : 'border-slate-200 bg-white text-slate-900 focus:border-indigo-400 focus:bg-indigo-50/30'
                }`}
                style={{ paddingTop: '1.25rem', paddingBottom: '1.25rem' }}
                autoFocus={idx === 0}
              />
            ))}
          </div>

          {loading && (
            <div className="flex justify-center mb-4">
              <div className="spinner text-indigo-600" />
            </div>
          )}

          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pin.join('').length !== 4 || loading}
              className="btn-primary flex-1 py-2.5"
            >
              Look Up Repair
            </button>
            <button type="button" onClick={reset} className="btn-ghost px-3">
              <RotateCcw size={15} />
            </button>
          </div>
        </form>
      </div>

      {/* Result */}
      {repair && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Repair Found</h2>
            <span className={statusBadge[repair.status] || 'badge-gray'}>{repair.status}</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-slate-50 rounded-xl p-3.5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <User size={11} className="text-slate-400" />
                <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">Customer</p>
              </div>
              <p className="font-semibold text-slate-800 text-sm">{repair.customer_name}</p>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <Phone size={10} /> {repair.customer_phone}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3.5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Smartphone size={11} className="text-slate-400" />
                <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">Device</p>
              </div>
              <p className="font-semibold text-slate-800 text-sm">{repair.device_model}</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5">
            <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium mb-1.5">Issue</p>
            <p className="text-sm text-slate-600">{repair.issue_description}</p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-emerald-50 rounded-xl p-3.5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <DollarSign size={11} className="text-emerald-500" />
                <p className="text-[10px] text-emerald-600 uppercase tracking-wide font-medium">Quote</p>
              </div>
              <p className="text-xl font-bold text-emerald-700">
                ${parseFloat(String(repair.quoted_price)).toFixed(2)}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3.5">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium mb-1.5">Intake Date</p>
              <p className="text-sm font-medium text-slate-700">
                {new Date(repair.created_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          {collected || repair.status === 'Collected' ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
              <CheckCircle2 size={24} className="text-emerald-600 mx-auto mb-2" />
              <p className="font-semibold text-emerald-700">Device Collected!</p>
              <p className="text-xs text-emerald-600 mt-0.5">Status updated to Collected</p>
              <button onClick={reset} className="btn-secondary mt-3 w-full text-sm">
                New Lookup
              </button>
            </div>
          ) : repair.status === 'Complete' ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <p className="text-sm text-emerald-700 font-medium">Device is ready for pickup!</p>
              </div>
              <button
                onClick={handleCollect}
                disabled={collecting}
                className="btn-success w-full py-3"
              >
                {collecting ? <><span className="spinner w-4 h-4" /> Marking…</> : 'Confirm Pickup — Mark as Collected'}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 p-3.5 bg-amber-50 border border-amber-100 rounded-xl">
              <Clock size={14} className="text-amber-500 flex-shrink-0" />
              <p className="text-sm text-amber-700">
                Repair is <strong>{repair.status}</strong> — not ready for pickup yet
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PinVerification;
