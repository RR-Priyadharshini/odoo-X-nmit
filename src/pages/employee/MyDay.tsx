import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  CreditCard,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import { dashboardApi, attendanceApi } from '../../api/index.js';
import { EmployeeDashboardData } from '../../types.js';
import { DayFlowStateCard } from '../../components/DayFlowStateCard.js';
import { StatCard } from '../../components/StatCard.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { useToast } from '../../context/ToastContext.js';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters.js';

export const MyDay: React.FC = () => {
  const [data, setData] = useState<EmployeeDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const { success, error } = useToast();
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await dashboardApi.getEmployeeDashboard();
      setData(res.data);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Failed to load My Day dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCheckIn = async () => {
    try {
      await attendanceApi.checkIn();
      success('Checked in successfully. Have a productive day!', 'Check-In Recorded');
      await fetchDashboard();
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to check in.');
    }
  };

  const handleCheckOut = async () => {
    try {
      await attendanceApi.checkOut();
      success('Checked out successfully. Shift completed!', 'Check-Out Recorded');
      await fetchDashboard();
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to check out.');
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-500">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold uppercase tracking-wider">Syncing My Day State...</p>
      </div>
    );
  }

  if (errorMsg || !data) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-rose-200">
        <p className="text-sm font-semibold text-rose-600 mb-4">{errorMsg || 'Failed to load dashboard.'}</p>
        <button
          onClick={fetchDashboard}
          className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-slate-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { employee, today_attendance, work_state, attendance_rate, leave_balance, payroll, recent_leaves, recent_attendance } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Greeting & Member Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
            <span>{employee.department}</span>
            <span>•</span>
            <span>{employee.employee_code}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Hello, {employee.name.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {employee.designation} • Here is your current flow and day progress.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/employee/leaves')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition-all cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            <span>Apply Leave</span>
          </button>
          <button
            onClick={() => navigate('/employee/payroll')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition-all cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
            <span>View Salary Slip</span>
          </button>
        </div>
      </div>

      {/* CORE WORK STATE VISUAL: "Day Flow" */}
      <DayFlowStateCard
        workState={work_state}
        todayAttendance={today_attendance}
        onCheckIn={handleCheckIn}
        onCheckOut={handleCheckOut}
      />

      {/* Secondary Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Attendance Rate */}
        <StatCard
          title="Attendance Score"
          value={`${attendance_rate}%`}
          subtitle="Rolling 30-day punctuality & presence"
          icon={Clock}
          trend={{ value: 'Optimal', isPositive: true }}
          accent="indigo"
          onClick={() => navigate('/employee/attendance')}
        />

        {/* Leave Balances */}
        <div
          onClick={() => navigate('/employee/leaves')}
          className="rounded-2xl border border-slate-200/80 bg-white p-5 cursor-pointer hover:border-slate-300 hover:shadow-xs transition-all"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Available Time Away</span>
              <div className="mt-2 text-2xl font-bold text-slate-900">
                {leave_balance.paid_available + leave_balance.sick_available} <span className="text-sm font-normal text-slate-500">Days</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-600 border-t border-slate-100 pt-2.5">
            <span>Paid: <strong>{leave_balance.paid_available}</strong> left</span>
            <span>Sick: <strong>{leave_balance.sick_available}</strong> left</span>
          </div>
        </div>

        {/* Salary Summary */}
        <div
          onClick={() => navigate('/employee/payroll')}
          className="rounded-2xl border border-slate-200/80 bg-white p-5 cursor-pointer hover:border-slate-300 hover:shadow-xs transition-all"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Monthly Compensation</span>
              <div className="mt-2 text-2xl font-bold text-slate-900">
                {formatCurrency(payroll?.net_salary)}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-600 border-t border-slate-100 pt-2.5">
            <span>Net Monthly Payout</span>
            <span className="font-semibold text-emerald-600">Reconciled</span>
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Attendance & Recent Leaves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Attendance */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Attendance Logs</h3>
              <p className="text-xs text-slate-500">Your presence records over the past sessions</p>
            </div>
            <button
              onClick={() => navigate('/employee/attendance')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Check In</th>
                  <th className="pb-3">Check Out</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recent_attendance.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 font-semibold text-slate-900">{formatDate(att.date)}</td>
                    <td className="py-3 text-slate-600 font-mono">{formatTime(att.check_in)}</td>
                    <td className="py-3 text-slate-600 font-mono">{formatTime(att.check_out)}</td>
                    <td className="py-3 text-right">
                      <StatusBadge status={att.status} size="sm" />
                    </td>
                  </tr>
                ))}
                {recent_attendance.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">
                      No recent attendance records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Leave Requests */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Time Away Applications</h3>
              <p className="text-xs text-slate-500">Track approvals and manager reviews</p>
            </div>
            <button
              onClick={() => navigate('/employee/leaves')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recent_leaves.map((leave) => (
              <div
                key={leave.id}
                className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 capitalize">{leave.leave_type} Leave</span>
                      <span className="text-[11px] text-slate-400">• {formatDate(leave.start_date)} to {formatDate(leave.end_date)}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-1">"{leave.reason}"</p>
                  </div>
                  <StatusBadge status={leave.status} size="sm" />
                </div>

                {leave.admin_comment && (
                  <div className="mt-2 text-[11px] text-slate-500 bg-white p-2 rounded-xl border border-slate-200/70">
                    <span className="font-semibold text-slate-700">Manager comment: </span>
                    <span>{leave.admin_comment}</span>
                  </div>
                )}
              </div>
            ))}

            {recent_leaves.length === 0 && (
              <div className="py-8 text-center text-slate-400 text-xs">
                No leave requests filed yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
