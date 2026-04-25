import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Wrench,
  PlusCircle,
  KanbanSquare,
  ShoppingCart,
  Package,
  Smartphone,
  KeyRound,
  Vault,
  WandSparkles,
  BotMessageSquare,
  BarChart3,
  CalendarDays,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  roles: string[];
  section?: string;
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'employee'], section: 'main' },
  { to: '/sales', label: 'Sales', icon: ShoppingCart, roles: ['admin', 'manager', 'employee'], section: 'main' },
  { to: '/repair-intake', label: 'New Repair', icon: PlusCircle, roles: ['admin', 'manager', 'employee'], section: 'repairs' },
  { to: '/repairs', label: 'Repair Jobs', icon: Wrench, roles: ['admin', 'manager', 'employee'], section: 'repairs' },
  { to: '/repair-tracker', label: 'Repair Board', icon: KanbanSquare, roles: ['admin', 'manager', 'employee'], section: 'repairs' },
  { to: '/pin-verify', label: 'PIN Pickup', icon: KeyRound, roles: ['admin', 'manager', 'employee'], section: 'repairs' },
  { to: '/inventory', label: 'Inventory', icon: Package, roles: ['admin', 'manager'], section: 'manage' },
  { to: '/vouchers', label: 'Top-Up Vouchers', icon: Smartphone, roles: ['admin', 'manager', 'employee'], section: 'manage' },
  { to: '/open-register', label: 'Open Register', icon: Vault, roles: ['admin', 'manager', 'employee'], section: 'till' },
  { to: '/close-wizard', label: 'Close Day', icon: WandSparkles, roles: ['admin', 'manager', 'employee'], section: 'till' },
  { to: '/ai-listing', label: 'AI Tools', icon: BotMessageSquare, roles: ['admin', 'manager'], section: 'tools' },
  { to: '/reports', label: 'EOD Reports', icon: BarChart3, roles: ['admin', 'manager'], section: 'tools' },
  { to: '/monthly-report', label: 'Monthly Report', icon: CalendarDays, roles: ['admin'], section: 'tools' },
];

const sectionLabels: Record<string, string> = {
  main: 'Overview',
  repairs: 'Repairs',
  manage: 'Manage',
  till: 'Register',
  tools: 'Analytics',
};

const roleConfig: Record<string, { label: string; color: string; dot: string }> = {
  admin:    { label: 'Admin',    color: 'bg-violet-100 text-violet-700', dot: 'bg-violet-500' },
  manager:  { label: 'Manager', color: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-500'   },
  employee: { label: 'Staff',   color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
};

const Sidebar: React.FC<{ collapsed: boolean; onToggle: () => void }> = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredItems = navItems.filter(item => user && item.roles.includes(user.role));

  // Group items by section, maintaining order
  const sections: string[] = [];
  const grouped: Record<string, NavItem[]> = {};
  filteredItems.forEach(item => {
    const s = item.section || 'main';
    if (!grouped[s]) {
      grouped[s] = [];
      sections.push(s);
    }
    grouped[s].push(item);
  });

  const initials = user?.name
    ? (user.name.match(/\b[a-zA-Z]/g) || []).slice(0, 2).join('').toUpperCase() || '?'
    : '?';

  const role = user?.role || 'employee';
  const rc = roleConfig[role] || roleConfig.employee;

  return (
    <aside
      className={`${collapsed ? 'w-[68px]' : 'w-60'} bg-slate-900 text-white flex flex-col min-h-screen transition-all duration-300 ease-in-out flex-shrink-0 relative`}
    >
      {/* Logo + toggle — always visible */}
      <div className="flex items-center h-16 border-b border-slate-700/60 px-3 justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-900/40 flex-shrink-0">
            <Zap size={14} className="text-white" />
          </div>
          {!collapsed && (
            <span className="text-[15px] font-bold tracking-tight text-white">CogniTill</span>
          )}
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700/60 transition-colors flex-shrink-0"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* User profile */}
      {!collapsed && user && (
        <div className="px-3 py-3 border-b border-slate-700/60">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-100 truncate">{user.name}</p>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${rc.color}`}>
                {rc.label}
              </span>
            </div>
          </div>
        </div>
      )}

      {collapsed && user && (
        <div className="flex justify-center py-3 border-b border-slate-700/60">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white">
            {initials}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {sections.map(section => (
          <div key={section}>
            {!collapsed && (
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 mb-1">
                {sectionLabels[section] || section}
              </p>
            )}
            <div className="space-y-0.5">
              {grouped[section].map(item => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-700/50'
                      } ${collapsed ? 'justify-center' : ''}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon size={16} className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-2 py-3 border-t border-slate-700/60">
        <button
          onClick={handleLogout}
          title={collapsed ? 'Sign Out' : undefined}
          className={`group flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150 ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={16} className="flex-shrink-0 group-hover:text-red-400" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
