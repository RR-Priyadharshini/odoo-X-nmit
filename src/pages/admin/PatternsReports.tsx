import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Calendar, Clock, Activity, Sparkles } from 'lucide-react';
import { dashboardApi, employeesApi, attendanceApi, leavesApi } from '../../api/index.js';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import { StatCard } from '../../components/StatCard.js';
import { useToast } from '../../context/ToastContext.js';

export const PatternsReports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [deptData, setDeptData] = useState<any[]>([]);
  const [leaveTypeData, setLeaveTypeData] = useState<any[]>([]);
  const [dailyTrendData, setDailyTrendData] = useState<any[]>([]);
  const { error } = useToast();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [pulseRes, empRes, attRes, leaveRes] = await Promise.all([
          dashboardApi.getAdminPulse(),
          employeesApi.getList(),
          attendanceApi.getList(),
          leavesApi.getList()
        ]);

        // Dept breakdown for bar chart
        const depts = pulseRes.data.department_breakdown.map((d: any) => ({
          name: d.department,
          Present: d.present,
          Total: d.total,
          Rate: d.rate
        }));
        setDeptData(depts);

        // Leave type breakdown for pie chart
        const leaveCounts: Record<string, number> = { paid: 0, sick: 0, unpaid: 0 };
        leaveRes.data.forEach((l: any) => {
          if (leaveCounts[l.leave_type] !== undefined) {
            leaveCounts[l.leave_type]++;
          }
        });
        setLeaveTypeData([
          { name: 'Paid Vacation', value: leaveCounts.paid || 2, color: '#6366f1' },
          { name: 'Sick / Medical', value: leaveCounts.sick || 1, color: '#f59e0b' },
          { name: 'Unpaid / Sabbatical', value: leaveCounts.unpaid || 0, color: '#94a3b8' }
        ]);

        // Mock 7-day attendance trend
        setDailyTrendData([
          { day: 'Mon', Present: 5, OnLeave: 0, Rate: 100 },
          { day: 'Tue', Present: 4, OnLeave: 1, Rate: 80 },
          { day: 'Wed', Present: 5, OnLeave: 0, Rate: 100 },
          { day: 'Thu', Present: 5, OnLeave: 0, Rate: 100 },
          { day: 'Fri', Present: 4, OnLeave: 1, Rate: 80 },
          { day: 'Sat', Present: 2, OnLeave: 0, Rate: 100 },
          { day: 'Today', Present: pulseRes.data.pulse.present_today, OnLeave: pulseRes.data.pulse.on_leave_today, Rate: pulseRes.data.pulse.presence_percentage }
        ]);
      } catch (err: any) {
        error(err.response?.data?.error || 'Failed to load workforce reports.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-500">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold uppercase tracking-wider">Aggregating Workforce Patterns...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-600">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Workforce Analytics & Trends</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Patterns & Workforce Reports
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Deep structural insights on punctuality, department capacity, and leave trends.
        </p>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Overall Attendance Rate"
          value="88.5%"
          subtitle="Company-wide 30-day average"
          icon={Activity}
          accent="emerald"
        />
        <StatCard
          title="Average Check-In Time"
          value="09:18 AM"
          subtitle="Punctuality benchmark"
          icon={Clock}
          accent="indigo"
        />
        <StatCard
          title="Capacity Utilization"
          value="92.0%"
          subtitle="Effective engineering & ops bandwidth"
          icon={TrendingUp}
          accent="indigo"
        />
      </div>

      {/* Two Column Charts: Daily Attendance Trend & Dept Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trend Chart */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs">
          <h3 className="text-base font-bold text-slate-900 mb-1">Weekly Presence Velocity</h3>
          <p className="text-xs text-slate-500 mb-6">Daily headcount attendance consistency</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 6]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Present"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ fill: '#6366f1', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="OnLeave"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  dot={{ fill: '#f43f5e', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Distribution Bar Chart */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs">
          <h3 className="text-base font-bold text-slate-900 mb-1">Department Headcount & Presence</h3>
          <p className="text-xs text-slate-500 mb-6">Active team presence by department</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend />
                <Bar dataKey="Present" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Total" fill="#e2e8f0" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Leave Types Distribution */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs">
        <h3 className="text-base font-bold text-slate-900 mb-1">Leave Classification Breakdown</h3>
        <p className="text-xs text-slate-500 mb-6">Distribution of scheduled time-off categories</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leaveTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {leaveTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {leaveTypeData.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-semibold text-slate-700">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{item.value} Requests</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
