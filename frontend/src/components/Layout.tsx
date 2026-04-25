import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, UserCircle, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/sales': 'Sale Screen',
  '/repairs': 'Repair Jobs',
  '/repair-intake': 'New Repair Intake',
  '/repair-tracker': 'Repair Board',
  '/pin-verify': 'PIN Pickup',
  '/inventory': 'Inventory',
  '/vouchers': 'Top-Up Vouchers',
  '/open-register': 'Open Register',
  '/close-wizard': 'Close Day Wizard',
  '/ai-listing': 'AI Tools',
  '/reports': 'EOD Reports',
  '/profile': 'My Profile',
};

const roleConfig: Record<string, { label: string; color: string }> = {
  admin:    { label: 'Admin',   color: 'bg-violet-100 text-violet-700' },
  manager:  { label: 'Manager', color: 'bg-blue-100 text-blue-700'    },
  employee: { label: 'Staff',   color: 'bg-emerald-100 text-emerald-700' },
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const pageTitle = pageTitles[location.pathname] || 'CogniTill';

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = now.toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' });

  const initials = user?.name
    ? (user.name.match(/\b[a-zA-Z]/g) || []).slice(0, 2).join('').toUpperCase() || '?'
    : '?';

  const rc = roleConfig[user?.role || 'employee'] || roleConfig.employee;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(prev => !prev)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-10">
          <h1 className="text-[15px] font-semibold text-slate-800">{pageTitle}</h1>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 hidden sm:block">{dateStr} · {timeStr}</span>

            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <Bell size={16} />
            </button>

            {/* Avatar dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(v => !v)}
                className="flex items-center gap-1.5 rounded-full hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white">
                  {initials}
                </div>
                <ChevronDown size={13} className={`text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50">
                  {/* User info */}
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${rc.color}`}>
                      {rc.label}
                    </span>
                  </div>

                  {/* My Profile */}
                  <button
                    onClick={() => { setDropdownOpen(false); navigate('/profile'); }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <UserCircle size={15} className="text-slate-400" />
                    My Profile
                  </button>

                  {/* Sign out */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
