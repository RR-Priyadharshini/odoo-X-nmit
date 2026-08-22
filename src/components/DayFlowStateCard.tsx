import React, { useState } from 'react';
import { LogIn, LogOut, CheckCircle2, Clock, Calendar, Sparkles, Activity } from 'lucide-react';
import { Attendance } from '../types.js';
import { formatTime } from '../utils/formatters.js';

interface DayFlowStateCardProps {
  workState: 'NOT STARTED' | 'WORKING' | 'CHECKED OUT' | 'LEAVE';
  todayAttendance: Attendance | null;
  onCheckIn: () => Promise<void>;
  onCheckOut: () => Promise<void>;
  loading?: boolean;
}

export const DayFlowStateCard: React.FC<DayFlowStateCardProps> = ({
  workState,
  todayAttendance,
  onCheckIn,
  onCheckOut,
  loading = false
}) => {
  const [actionLoading, setActionLoading] = useState(false);

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      await onCheckIn();
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      await onCheckOut();
    } finally {
      setActionLoading(false);
    }
  };

  // State configurations
  const stateConfig = {
    'NOT STARTED': {
      title: 'Ready to start your workday',
      subtitle: 'Clock in to mark presence and initiate today’s session.',
      badgeText: 'NOT STARTED',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
      activeStep: 0,
      glowBorder: 'border-slate-300'
    },
    'WORKING': {
      title: 'Work Session Active',
      subtitle: `Clocked in at ${formatTime(todayAttendance?.check_in)}. Productive flow in progress.`,
      badgeText: 'WORKING',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse',
      activeStep: 1,
      glowBorder: 'border-emerald-300 shadow-sm shadow-emerald-100'
    },
    'CHECKED OUT': {
      title: 'Workday Complete',
      subtitle: `Shift finished at ${formatTime(todayAttendance?.check_out)}. Excellent work today!`,
      badgeText: 'CHECKED OUT',
      badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      activeStep: 2,
      glowBorder: 'border-indigo-200'
    },
    'LEAVE': {
      title: 'Approved Time Away',
      subtitle: 'You are on scheduled leave today. Rest and recharge.',
      badgeText: 'ON LEAVE',
      badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
      activeStep: -1,
      glowBorder: 'border-purple-200'
    }
  }[workState];

  return (
    <div
      id="day-flow-state-card"
      className={`relative overflow-hidden rounded-3xl border bg-gradient-to-br from-white via-slate-50/50 to-slate-100/60 p-6 sm:p-8 transition-all duration-300 ${stateConfig.glowBorder}`}
    >
      {/* Top Banner & State Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-600">Workforce State</span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${stateConfig.badgeClass}`}>
              <span className="w-2 h-2 rounded-full bg-current mr-1.5 shrink-0" />
              {stateConfig.badgeText}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2 tracking-tight">
            {stateConfig.title}
          </h2>
          <p className="text-sm text-slate-700 mt-1 max-w-xl">
            {stateConfig.subtitle}
          </p>
        </div>

        {/* Primary CTA Buttons */}
        <div className="shrink-0 flex items-center gap-3">
          {workState === 'NOT STARTED' && (
            <button
              id="btn-check-in"
              onClick={handleCheckIn}
              disabled={loading || actionLoading}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{actionLoading ? 'Clocking In...' : 'Check In Now'}</span>
            </button>
          )}

          {workState === 'WORKING' && (
            <button
              id="btn-check-out"
              onClick={handleCheckOut}
              disabled={loading || actionLoading}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-md shadow-slate-300 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{actionLoading ? 'Clocking Out...' : 'Check Out / End Day'}</span>
            </button>
          )}

          {workState === 'CHECKED OUT' && (
            <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Completed for Today</span>
            </div>
          )}

          {workState === 'LEAVE' && (
            <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-purple-50 text-purple-800 border border-purple-200 text-sm font-medium">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Out of Office</span>
            </div>
          )}
        </div>
      </div>

      {/* Visual Day Flow Timeline: Check In -> Working -> Check Out */}
      {workState !== 'LEAVE' && (
        <div className="pt-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-700" />
            <span>Today's Flow Progression</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1: Check In */}
            <div
              className={`rounded-2xl p-4 border transition-all ${
                stateConfig.activeStep >= 1
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                  : stateConfig.activeStep === 0
                  ? 'bg-indigo-50/40 border-indigo-300 text-indigo-950 ring-2 ring-indigo-200'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">01 • Check In</span>
                {stateConfig.activeStep >= 1 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-500" />
                )}
              </div>
              <div className="mt-2 text-base font-bold">
                {todayAttendance?.check_in ? formatTime(todayAttendance.check_in) : 'Pending Clock In'}
              </div>
              <div className="text-xs text-slate-600 mt-0.5">
                {todayAttendance?.check_in ? 'Presence recorded on-time' : 'Awaiting start'}
              </div>
            </div>

            {/* Step 2: Working */}
            <div
              className={`rounded-2xl p-4 border transition-all ${
                stateConfig.activeStep === 1
                  ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 ring-2 ring-emerald-300'
                  : stateConfig.activeStep > 1
                  ? 'bg-slate-50 border-slate-200 text-slate-800'
                  : 'bg-white border-slate-200 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">02 • Working</span>
                {stateConfig.activeStep === 1 ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                ) : stateConfig.activeStep > 1 ? (
                  <CheckCircle2 className="w-4 h-4 text-slate-500" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <div className="mt-2 text-base font-bold">
                {stateConfig.activeStep === 1 ? 'Active In Office' : stateConfig.activeStep > 1 ? 'Shift Concluded' : 'Pending Start'}
              </div>
              <div className="text-xs text-slate-600 mt-0.5">
                {stateConfig.activeStep === 1 ? 'Focus & collaboration' : stateConfig.activeStep > 1 ? 'Logged 8+ hours' : 'Awaiting check-in'}
              </div>
            </div>

            {/* Step 3: Check Out */}
            <div
              className={`rounded-2xl p-4 border transition-all ${
                stateConfig.activeStep >= 2
                  ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950 ring-2 ring-indigo-200'
                  : 'bg-white border-slate-200 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">03 • Check Out</span>
                {stateConfig.activeStep >= 2 ? (
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <div className="mt-2 text-base font-bold">
                {todayAttendance?.check_out ? formatTime(todayAttendance.check_out) : 'Pending End'}
              </div>
              <div className="text-xs text-slate-600 mt-0.5">
                {todayAttendance?.check_out ? 'Day summary reconciled' : 'End of workday'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
