import React, { useState, useEffect } from 'react';
import { Clock, LogIn, LogOut, CheckCircle2, Calendar, Filter } from 'lucide-react';
import { attendanceApi } from '../../api/index.js';
import { Attendance } from '../../types.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { useToast } from '../../context/ToastContext.js';
import { formatDate, formatTime } from '../../utils/formatters.js';

export const TimePresence: React.FC = () => {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [meta, setMeta] = useState({ total: 0, present_count: 0, half_day_count: 0, leave_count: 0 });
  const [range, setRange] = useState<'daily' | 'weekly' | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { success, error } = useToast();

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await attendanceApi.getList({ range });
      setRecords(res.data);
      setMeta(res.meta);
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to load attendance records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [range]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = records.find(r => r.date === todayStr);

  const canCheckIn = !todayRecord;
  const canCheckOut = todayRecord && todayRecord.check_in && !todayRecord.check_out;

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      await attendanceApi.checkIn();
      success('Clocked in successfully for today!', 'Check-In Success');
      await fetchAttendance();
    } catch (err: any) {
      error(err.response?.data?.error || 'Check-in failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      await attendanceApi.checkOut();
      success('Clocked out successfully. Work session recorded!', 'Check-Out Success');
      await fetchAttendance();
    } catch (err: any) {
      error(err.response?.data?.error || 'Check-out failed.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Time & Presence
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track daily work sessions, punch timestamps, and presence logs.
          </p>
        </div>

        {/* Live Clock In / Out Action Bar */}
        <div className="flex items-center gap-3">
          {canCheckIn && (
            <button
              onClick={handleCheckIn}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{actionLoading ? 'Clocking In...' : 'Check In Today'}</span>
            </button>
          )}

          {canCheckOut && (
            <button
              onClick={handleCheckOut}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-md shadow-slate-300 transition-all cursor-pointer disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              <span>{actionLoading ? 'Clocking Out...' : 'Check Out / End Shift'}</span>
            </button>
          )}

          {todayRecord && todayRecord.check_out && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Today's Shift Completed</span>
            </div>
          )}
        </div>
      </div>

      {/* Summary KPI Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Present Sessions</span>
          <div className="mt-1 text-2xl font-bold text-slate-900">{meta.present_count}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Half-Day Sessions</span>
          <div className="mt-1 text-2xl font-bold text-amber-600">{meta.half_day_count}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Scheduled Leaves</span>
          <div className="mt-1 text-2xl font-bold text-indigo-600">{meta.leave_count}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Tracked Days</span>
          <div className="mt-1 text-2xl font-bold text-slate-900">{meta.total}</div>
        </div>
      </div>

      {/* Attendance History Table Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs">
        {/* Table Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Attendance Log History</h3>
            <p className="text-xs text-slate-500">Verified server-side timestamps</p>
          </div>

          <div className="inline-flex p-1 bg-slate-100 rounded-xl">
            {(['all', 'weekly', 'daily'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setRange(tab)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                  range === tab ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab === 'all' ? 'All History' : tab === 'weekly' ? 'Past 7 Days' : 'Today'}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading attendance records...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-3">Date</th>
                  <th className="py-3.5 px-3">Check-In</th>
                  <th className="py-3.5 px-3">Check-Out</th>
                  <th className="py-3.5 px-3">Session Length</th>
                  <th className="py-3.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((r) => {
                  let duration = '—';
                  if (r.check_in && r.check_out) {
                    const diffMs = new Date(r.check_out).getTime() - new Date(r.check_in).getTime();
                    const hours = (diffMs / (1000 * 60 * 60)).toFixed(1);
                    duration = `${hours} hrs`;
                  } else if (r.check_in && !r.check_out) {
                    duration = 'In Progress';
                  }

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-3 font-semibold text-slate-900">{formatDate(r.date)}</td>
                      <td className="py-3.5 px-3 text-slate-600 font-mono text-xs">{formatTime(r.check_in)}</td>
                      <td className="py-3.5 px-3 text-slate-600 font-mono text-xs">{formatTime(r.check_out)}</td>
                      <td className="py-3.5 px-3 text-slate-600 text-xs">{duration}</td>
                      <td className="py-3.5 px-3 text-right">
                        <StatusBadge status={r.status} size="sm" />
                      </td>
                    </tr>
                  );
                })}
                {records.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                      No attendance records found for this filter range.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
