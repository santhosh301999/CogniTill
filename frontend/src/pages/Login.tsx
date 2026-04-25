import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Eye, EyeOff, ArrowRight } from 'lucide-react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (u: string, p: string) => {
    setError('');
    setLoading(true);
    try {
      await login(u, p);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900" />
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.15) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(99,102,241,0.4) 0%, transparent 60%)' }}
        />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white">CogniTill</span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight">
              The smart POS for<br />mobile repair shops.
            </h2>
            <p className="text-indigo-200 mt-3 text-lg leading-relaxed">
              Repairs, sales, inventory, and AI tools — all in one place.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Repair tracking', desc: 'Digital intake with PIN' },
              { label: 'Smart sales', desc: 'Discount & tax controls' },
              { label: 'AI stock alerts', desc: '14-day velocity analysis' },
              { label: 'Guided close', desc: '5-step EOD wizard' },
            ].map(f => (
              <div key={f.label} className="bg-white/10 backdrop-blur rounded-xl p-3.5 border border-white/10">
                <p className="text-white text-sm font-semibold">{f.label}</p>
                <p className="text-indigo-200 text-xs mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-indigo-300 text-xs">© 2024 CogniTill. Built for repair pros.</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">CogniTill</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
            <p className="text-slate-500 text-sm mt-1">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Username</label>
              <input
                className="input"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  className="input pr-10"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 text-sm mt-2"
            >
              {loading ? (
                <>
                  <span className="spinner w-4 h-4" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest text-center mb-3">
              Demo Accounts
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { u: 'danees', p: 'admin123',    label: 'Admin',    sub: 'danees',  color: 'hover:border-violet-300 hover:bg-violet-50', dot: 'bg-violet-500', text: 'text-violet-700' },
                { u: 'kiran',  p: 'manager123',  label: 'Manager',  sub: 'kiran',   color: 'hover:border-blue-300 hover:bg-blue-50',     dot: 'bg-blue-500',   text: 'text-blue-700' },
                { u: 'waseem', p: 'employee123', label: 'Staff',    sub: 'waseem',  color: 'hover:border-emerald-300 hover:bg-emerald-50', dot: 'bg-emerald-500', text: 'text-emerald-700' },
              ].map(acc => (
                <button
                  key={acc.u}
                  onClick={() => demoLogin(acc.u, acc.p)}
                  disabled={loading}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border border-slate-200 bg-slate-50 transition-all duration-150 disabled:opacity-50 ${acc.color}`}
                >
                  <div className={`w-2 h-2 rounded-full ${acc.dot}`} />
                  <span className={`text-xs font-semibold ${acc.text}`}>{acc.label}</span>
                  <span className="text-[10px] text-slate-400">{acc.sub}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
