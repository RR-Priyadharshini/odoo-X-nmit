import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Activity,
  Calendar,
  Clock,
  CreditCard,
  User,
  Users,
  CheckSquare,
  BarChart3,
  Sparkles,
  Layers,
  X,
  Compass
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const employeeLinks = [
    { to: '/employee/my-day', label: 'My Day', icon: Compass, description: 'Work state & today flow' },
    { to: '/employee/attendance', label: 'Time & Presence', icon: Clock, description: 'Check-in history' },
    { to: '/employee/leaves', label: 'Time Away', icon: Calendar, description: 'Leave applications' },
    { to: '/employee/payroll', label: 'My Pay', icon: CreditCard, description: 'Salary breakdown' },
    { to: '/employee/profile', label: 'Profile & Details', icon: User, description: 'Contact & job details' }
  ];

  const adminLinks = [
    { to: '/admin/pulse', label: 'Workforce Pulse', icon: Activity, description: 'Live workforce operating view' },
    { to: '/admin/intelligence', label: 'Flow Intelligence', icon: Sparkles, description: 'Explainable operational signals' },
    { to: '/admin/leave-approvals', label: 'Leave Approvals', icon: CheckSquare, description: 'Pending queue & actions' },
    { to: '/admin/employees', label: 'Employee Directory', icon: Users, description: 'Headcount & member profiles' },
    { to: '/admin/attendance', label: 'Time & Presence', icon: Clock, description: 'Daily attendance logs' },
    { to: '/admin/payroll', label: 'Compensation', icon: CreditCard, description: 'Salary structure & review' },
    { to: '/admin/patterns', label: 'Patterns & Reports', icon: BarChart3, description: 'Workforce analytics' }
  ];

  const navLinks = isAdmin ? adminLinks : employeeLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-df-sidebar text-df-text/90 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundImage: 'linear-gradient(180deg, #262d1e 0%, #1c2216 100%)' }}
      >
        {/* Brand Wordmark & Role Badge */}
        <div className="h-18 px-6 flex items-center justify-between border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-df-lime flex items-center justify-center text-df-ink font-bold font-display shadow-md shadow-df-lime/10">
              <Layers className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-base font-semibold text-df-text tracking-tight font-display">
                Dayflow
              </div>
              <p className="text-[11px] text-white/40 font-medium truncate">Workforce Operating System</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="md:hidden text-white/50 hover:text-white p-1 rounded-lg hover:bg-white/5"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Segment Indicator */}
        <div className="px-5 py-3 border-b border-white/[0.06]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/40 font-medium">Console Space:</span>
            <span
              className={`font-semibold uppercase tracking-wider text-[10.5px] px-2 py-0.5 rounded-full ${
                isAdmin
                  ? 'bg-df-warning/10 text-df-warning border border-df-warning/20'
                  : 'bg-df-lime/10 text-df-lime border border-df-lime/20'
              }`}
            >
              {isAdmin ? 'Admin Console' : 'Employee Workspace'}
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-white/30 px-3 mb-2">
            Navigation
          </div>

          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => {
                  if (window.innerWidth < 768) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.75 rounded-xl text-sm transition-all group ${
                    isActive
                      ? 'bg-df-lime text-df-ink font-semibold shadow-sm shadow-df-lime/10'
                      : 'text-white/65 font-medium hover:bg-white/[0.06] hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-df-ink' : 'text-white/40 group-hover:text-white/70'
                      }`}
                    />
                    <div className="flex-1 truncate">
                      <div>{item.label}</div>
                    </div>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-white/[0.06] text-[11px] text-white/35 flex items-center justify-between">
          <span>Every workday, aligned.</span>
          <span className="font-mono text-white/25 text-[10px]">v1.0</span>
        </div>
      </aside>
    </>
  );
};
