import React, { useState, useEffect } from 'react';
import { Menu, LogOut, User, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { getInitials } from '../utils/formatters.js';

interface TopbarProps {
  onToggleSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar }) => {
  const { user, employee, role, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-18 sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-df-card-border px-4 sm:px-8 flex items-center justify-between">
      {/* Left: Mobile Toggle & Page context */}
      <div className="flex items-center gap-4">
        <button
          id="btn-toggle-sidebar"
          onClick={onToggleSidebar}
          className="md:hidden p-2 text-df-ink-2/70 hover:text-df-ink-2 hover:bg-black/5 rounded-xl transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Live Workday Pulse clock */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/60 border border-df-card-border text-xs font-medium text-df-ink-2/80">
          <span className="w-2 h-2 rounded-full bg-df-success animate-pulse" />
          <span className="text-df-muted-2">Workforce Time:</span>
          <span className="font-mono font-semibold text-df-ink-2">{currentTime}</span>
        </div>
      </div>

      {/* Right: Actions, User Profile */}
      <div className="flex items-center gap-3">
        {/* Profile Card & Logout */}
        <div className="flex items-center gap-3 pl-2 sm:pl-3">
          <div className="flex items-center gap-2.5">
            {employee?.profile_picture ? (
              <img
                src={employee.profile_picture}
                alt={user?.name}
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-xl object-cover border border-df-card-border shadow-xs"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-df-ink-2 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {user ? getInitials(user.name) : 'DF'}
              </div>
            )}

            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-df-ink-2 leading-tight truncate max-w-[120px]">
                {user?.name}
              </div>
              <div className="text-[10px] font-semibold text-df-muted-2 flex items-center gap-1">
                {role === 'admin' ? (
                  <Shield className="w-3 h-3 text-df-warning" />
                ) : (
                  <User className="w-3 h-3 text-df-muted-2" />
                )}
                <span className="capitalize">{role || 'Member'}</span>
              </div>
            </div>
          </div>

          <button
            id="btn-logout"
            onClick={logout}
            title="Sign out of Dayflow"
            className="p-2 text-df-muted-2 hover:text-df-danger hover:bg-df-danger/10 rounded-xl transition-colors cursor-pointer"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
