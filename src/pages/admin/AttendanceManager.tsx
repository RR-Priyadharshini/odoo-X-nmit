import React, { useState, useEffect } from 'react';
import { Clock, Filter, Calendar, Search, ArrowRight, Download } from 'lucide-react';
import { attendanceApi } from '../../api/index.js';
import { Attendance, AttendanceStatus } from '../../types.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { useToast } from '../../context/ToastContext.js';
import { formatDate, formatTime } from '../../utils/formatters.js';

export const AttendanceManager: React.FC = () => {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<'all' | 'weekly' | 'daily'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { error } = useToast();

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await attendanceApi.getList({
        range,
        status: statusFilter === 'all' ? undefined : (statusFilter as AttendanceStatus)
      });
      setRecords(res.data);
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to load attendance logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [range, statusFilter]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-600">
            <Clock className="w-3.5 h-3.5" />
            <span>Time & Presence Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Workforce Attendance Logs
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Audit presence timestamps, monitor punctuality, and view team clock-in logs.
          </p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Filters:</span>

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

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="present">Present</option>
            <option value="half_day">Half Day</option>
            <option value="leave">On Leave</option>
          </select>
        </div>

        <span className="text-xs text-slate-400 font-medium">
          {records.length} attendance sessions
        </span>
      </div>

      {/* Main Table Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs">
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
                  <th className="py-3.5 px-3">Employee</th>
                  <th className="py-3.5 px-3">Check-In</th>
                  <th className="py-3.5 px-3">Check-Out</th>
                  <th className="py-3.5 px-3">Logged Duration</th>
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
                    duration = 'Active In Office';
                  }

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-3 font-semibold text-slate-900 text-xs">{formatDate(r.date)}</td>
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900 text-xs">{r.employee?.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {r.employee?.employee_code} • {r.employee?.department}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 font-mono text-xs">{formatTime(r.check_in)}</td>
                      <td className="py-3.5 px-3 text-slate-600 font-mono text-xs">{formatTime(r.check_out)}</td>
                      <td className="py-3.5 px-3 text-slate-600 text-xs font-medium">{duration}</td>
                      <td className="py-3.5 px-3 text-right">
                        <StatusBadge status={r.status} size="sm" />
                      </td>
                    </tr>
                  );
                })}
                {records.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                      No attendance records found matching current filters.
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
