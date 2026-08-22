import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CreditCard,
  ArrowRight,
  Sparkles,
  Shield,
  Filter,
  CheckSquare
} from 'lucide-react';
import { dashboardApi, leavesApi } from '../../api/index.js';
import { AdminPulseData } from '../../types.js';
import { StatCard } from '../../components/StatCard.js';
import { FlowIntelligenceCard } from '../../components/FlowIntelligenceCard.js';
import { WorkforceTimeline } from '../../components/WorkforceTimeline.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { Modal } from '../../components/Modal.js';
import { useToast } from '../../context/ToastContext.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

export const WorkforcePulse: React.FC = () => {
  const [data, setData] = useState<AdminPulseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [adminComment, setAdminComment] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const { success, error } = useToast();
  const navigate = useNavigate();

  const fetchPulse = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await dashboardApi.getAdminPulse();
      setData(res.data);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Failed to load Workforce Pulse.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPulse();
  }, []);

  const openActionModal = (leaveId: number, type: 'approve' | 'reject') => {
    setSelectedLeaveId(leaveId);
    setActionType(type);
    setAdminComment(type === 'approve' ? 'Approved for company calendar coverage.' : '');
    setApprovalModalOpen(true);
  };

  const handleDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeaveId) return;

    if (actionType === 'reject' && !adminComment.trim()) {
      error('Please provide a reason for rejecting the leave request.');
      return;
    }

    try {
      setSubmittingAction(true);
      if (actionType === 'approve') {
        await leavesApi.approve(selectedLeaveId, adminComment);
        success('Leave request approved successfully.', 'Approved');
      } else {
        await leavesApi.reject(selectedLeaveId, adminComment);
        success('Leave request rejected with comment.', 'Rejected');
      }
      setApprovalModalOpen(false);
      await fetchPulse();
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to process leave action.');
    } finally {
      setSubmittingAction(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-500">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold uppercase tracking-wider">Measuring Workforce Pulse...</p>
      </div>
    );
  }

  if (errorMsg || !data) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-rose-200">
        <p className="text-sm font-semibold text-rose-600 mb-4">{errorMsg || 'Failed to load workforce pulse.'}</p>
        <button
          onClick={fetchPulse}
          className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-slate-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { pulse, department_breakdown, pending_leave_queue, signals, timeline } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header & Status Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Operational Console • Workforce Operating System</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Workforce Pulse
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time presence, explainable operational signals, and priority action areas.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/admin/leave-approvals')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900 hover:bg-amber-100 shadow-2xs transition-all cursor-pointer"
          >
            <CheckSquare className="w-3.5 h-3.5 text-amber-700" />
            <span>{pulse.pending_leave_approvals} Pending Approvals</span>
          </button>
          <button
            onClick={() => navigate('/admin/intelligence')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Flow Signals</span>
          </button>
        </div>
      </div>

      {/* PROMINENT WORKFORCE STATUS HERO VISUALIZATION */}
      {/* "What needs my attention right now?" + Live presence count */}
      <div
        id="workforce-pulse-banner"
        className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl shadow-indigo-950/10"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-md">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Current Operating Status</span>
            </div>

            <div className="flex items-baseline gap-3">
              <div className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                {pulse.present_today} / {pulse.total_headcount}
              </div>
              <span className="text-base sm:text-lg font-semibold text-slate-300">
                active team members clocked in
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {pulse.currently_working} members actively at work sessions, {pulse.checked_out_today} concluded shifts, and {pulse.on_leave_today} on approved leave.
            </p>
          </div>

          {/* Quick Metrics Cluster */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 shrink-0">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Presence Rate</div>
              <div className="text-xl font-extrabold text-emerald-400 mt-0.5">{pulse.presence_percentage}%</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Approvals Queue</div>
              <div className="text-xl font-extrabold text-amber-400 mt-0.5">{pulse.pending_leave_approvals} Req</div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Monthly Payroll</div>
              <div className="text-base font-extrabold text-white mt-1">{formatCurrency(pulse.total_monthly_payroll)}</div>
            </div>
          </div>
        </div>

        {/* Department Presence Distribution Progress Bar */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
            <span>Department Presence Distribution</span>
            <span>Real-time Sync</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {department_breakdown.map((dept) => (
              <div key={dept.department} className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-200">{dept.department}</span>
                  <span className="text-emerald-300">{dept.present} / {dept.total}</span>
                </div>
                <div className="mt-2 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${dept.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ACTIONABLE FLOW INTELLIGENCE SIGNALS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-tight">
              Flow Intelligence & Explainable Signals
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">Derived from real-time database queries</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {signals.map((sig) => (
            <FlowIntelligenceCard key={sig.id} signal={sig} />
          ))}
        </div>
      </div>

      {/* TWO COLUMNS: Pending Approvals Queue (Left) & Workforce Timeline (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Approvals Queue (2 cols) */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Pending Leave Approvals Queue</h3>
                {pending_leave_queue.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                    {pending_leave_queue.length} Awaiting
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">Require administrative review & coverage approval</p>
            </div>

            <button
              onClick={() => navigate('/admin/leave-approvals')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {pending_leave_queue.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/40 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{req.employee?.name}</span>
                    <span className="text-xs text-slate-400 font-mono">({req.employee?.employee_code})</span>
                    <span className="text-xs text-slate-500">• {req.employee?.department}</span>
                  </div>
                  <div className="text-xs text-slate-600">
                    <strong className="capitalize">{req.leave_type} Leave: </strong>
                    <span>{formatDate(req.start_date)} to {formatDate(req.end_date)}</span>
                  </div>
                  <div className="text-xs text-slate-500 italic max-w-md">
                    "{req.reason}"
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openActionModal(req.id, 'reject')}
                    className="px-3.5 py-1.5 rounded-xl border border-rose-200 text-rose-700 bg-white hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => openActionModal(req.id, 'approve')}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs shadow-emerald-200 transition-colors cursor-pointer"
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))}

            {pending_leave_queue.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                <span>All caught up! Zero pending leave applications awaiting review.</span>
              </div>
            )}
          </div>
        </div>

        {/* Workforce Timeline (1 col) */}
        <div>
          <WorkforceTimeline events={timeline} />
        </div>
      </div>

      {/* Decision Modal */}
      <Modal
        isOpen={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
        title={actionType === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
        subtitle="This action updates the employee’s leave balance and notifies them immediately"
      >
        <form onSubmit={handleDecision} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Manager / HR Comment {actionType === 'reject' && '* (Required)'}
            </label>
            <textarea
              rows={3}
              value={adminComment}
              onChange={(e) => setAdminComment(e.target.value)}
              placeholder={
                actionType === 'approve'
                  ? 'e.g. Approved. Sprint coverage confirmed.'
                  : 'e.g. Key client delivery presentations scheduled during this period.'
              }
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              required={actionType === 'reject'}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setApprovalModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingAction}
              className={`px-5 py-2 rounded-xl text-white font-semibold text-xs transition-all cursor-pointer disabled:opacity-50 ${
                actionType === 'approve'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-200'
              }`}
            >
              {submittingAction
                ? 'Processing...'
                : actionType === 'approve'
                ? 'Confirm Approval'
                : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
