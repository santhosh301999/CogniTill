import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserCircle, Shield, Calendar, AtSign, LogOut } from 'lucide-react';

const roleConfig: Record<string, { label: string; color: string; dot: string; description: string }> = {
  admin:    { label: 'Admin',    color: 'bg-violet-100 text-violet-700 border border-violet-200', dot: 'bg-violet-500', description: 'Full access to all features and settings' },
  manager:  { label: 'Manager', color: 'bg-blue-100 text-blue-700 border border-blue-200',       dot: 'bg-blue-500',   description: 'Access to sales, reports, register, and inventory' },
  employee: { label: 'Staff',   color: 'bg-emerald-100 text-emerald-700 border border-emerald-200', dot: 'bg-emerald-500', description: 'Access to sales, repairs, vouchers, and register' },
};

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const rc = roleConfig[user.role] || roleConfig.employee;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Avatar + name card */}
      <div className="card text-center py-8">
        <div className="w-20 h-20 rounded-full bg-indigo-500 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4 shadow-lg shadow-indigo-200">
          {initials}
        </div>
        <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full ${rc.color}`}>
            <span className={`w-2 h-2 rounded-full ${rc.dot}`} />
            {rc.label}
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-2">{rc.description}</p>
      </div>

      {/* Details card */}
      <div className="card space-y-0 p-0 overflow-hidden">
        <div className="flex items-center gap-4 px-5 py-4 border-b border-slate-100">
          <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <UserCircle size={17} className="text-slate-500" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Full Name</p>
            <p className="text-sm font-semibold text-slate-800">{user.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 px-5 py-4 border-b border-slate-100">
          <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <AtSign size={17} className="text-slate-500" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Username</p>
            <p className="text-sm font-semibold text-slate-800">{user.username}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 px-5 py-4 border-b border-slate-100">
          <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield size={17} className="text-slate-500" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Role</p>
            <p className="text-sm font-semibold text-slate-800 capitalize">{user.role}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 px-5 py-4">
          <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Calendar size={17} className="text-slate-500" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Session</p>
            <p className="text-sm font-semibold text-slate-800">Active — logged in</p>
          </div>
        </div>
      </div>

      {/* Permissions */}
      <div className="card">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Permissions</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Sales',       allowed: true },
            { label: 'Repairs',     allowed: true },
            { label: 'Vouchers',    allowed: true },
            { label: 'Register',    allowed: true },
            { label: 'Inventory',   allowed: user.role !== 'employee' },
            { label: 'EOD Reports', allowed: user.role !== 'employee' },
            { label: 'AI Tools',    allowed: user.role !== 'employee' },
            { label: 'User Mgmt',   allowed: user.role === 'admin' },
          ].map(p => (
            <div key={p.label} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${p.allowed ? 'bg-emerald-50' : 'bg-slate-50'}`}>
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${p.allowed ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              <span className={`text-xs font-medium ${p.allowed ? 'text-emerald-700' : 'text-slate-400'}`}>{p.label}</span>
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleLogout} className="btn-danger w-full py-2.5 flex items-center justify-center gap-2">
        <LogOut size={15} />
        Sign Out
      </button>
    </div>
  );
};

export default Profile;
