import React, { useState, useEffect } from 'react';
import { CheckSquare, CheckCircle2, XCircle, Clock, Calendar, MessageSquare, Filter } from 'lucide-react';
import { leavesApi } from '../../api/index.js';
import { Leave, LeaveStatus } from '../../types.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { Modal } from '../../components/Modal.js';
import { useToast } from '../../context/ToastContext.js';
import { formatDate } from '../../utils/formatters.js';

export const LeaveApprovals: React.FC = () => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [adminComment, setAdminComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { success, error } = useToast();

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await leavesApi.getList({
        status: statusFilter === 'all' ? undefined : (statusFilter as LeaveStatus)
      });
      setLeaves(res.data);
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to load leave requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [statusFilter]);

  const openDecisionModal = (leave: Leave, type: 'approve' | 'reject') => {
    setSelectedLeave(leave);
    setActionType(type);
    setAdminComment(type === 'approve' ? 'Approved for company schedule.' : '');
    setModalOpen(true);
  };

  const handleDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeave) return;

    if (actionType === 'reject' && !adminComment.trim()) {
      error('Rejection reason is required.');
      return;
    }

    try {
      setSubmitting(true);
      if (actionType === 'approve') {
        await leavesApi.approve(selectedLeave.id, adminComment);
        success(`Approved leave request for ${selectedLeave.employee?.name}.`, 'Leave Approved');
      } else {
        await leavesApi.reject(selectedLeave.id, adminComment);
        success(`Rejected leave request for ${selectedLeave.employee?.name}.`, 'Leave Rejected');
      }
      setModalOpen(false);
      await fetchLeaves();
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to process leave decision.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-700">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Administrative Review Queue</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Leave Approvals & Scheduling
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Review time-off requests, cross-reference team coverage, and manage employee leave balances.
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs">
        {/* Status Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Application Requests</h3>
            <p className="text-xs text-slate-500">Live decision audit tracking</p>
          </div>

          <div className="inline-flex p-1 bg-slate-100 rounded-xl">
            {(['pending', 'approved', 'rejected', 'all'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                  statusFilter === tab ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Requests Table */}
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading leave requests...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-3">Employee</th>
                  <th className="py-3.5 px-3">Classification</th>
                  <th className="py-3.5 px-3">Requested Period</th>
                  <th className="py-3.5 px-3">Reason</th>
                  <th className="py-3.5 px-3">Decision Notes</th>
                  <th className="py-3.5 px-3 text-right">Actions / Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaves.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-900 text-xs">{l.employee?.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {l.employee?.employee_code} • {l.employee?.department}
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <StatusBadge status={l.leave_type} size="sm" />
                    </td>
                    <td className="py-3.5 px-3 text-xs text-slate-900 font-medium">
                      <div>{formatDate(l.start_date)}</div>
                      <div className="text-[11px] text-slate-400">to {formatDate(l.end_date)}</div>
                    </td>
                    <td className="py-3.5 px-3 text-xs text-slate-600 max-w-xs">
                      {l.reason}
                    </td>
                    <td className="py-3.5 px-3 text-xs text-slate-500 max-w-xs">
                      {l.admin_comment ? (
                        <span className="italic">{l.admin_comment}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {l.status === 'pending' ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => openDecisionModal(l, 'reject')}
                            className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 bg-white hover:bg-rose-50 text-xs font-semibold cursor-pointer transition-colors"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => openDecisionModal(l, 'approve')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs shadow-emerald-200 cursor-pointer transition-colors"
                          >
                            Approve
                          </button>
                        </div>
                      ) : (
                        <StatusBadge status={l.status} size="sm" />
                      )}
                    </td>
                  </tr>
                ))}
                {leaves.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                      No leave requests found for filter: <strong className="capitalize">{statusFilter}</strong>.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Decision Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={actionType === 'approve' ? 'Approve Leave Application' : 'Reject Leave Application'}
        subtitle={`Employee: ${selectedLeave?.employee?.name} (${selectedLeave?.employee?.employee_code})`}
      >
        <form onSubmit={handleDecision} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Reviewer Notes / Feedback {actionType === 'reject' && '* (Required)'}
            </label>
            <textarea
              rows={3}
              value={adminComment}
              onChange={(e) => setAdminComment(e.target.value)}
              placeholder={
                actionType === 'approve'
                  ? 'e.g. Approved. Sprint coverage confirmed with team lead.'
                  : 'e.g. Critical release deliverables scheduled during this period.'
              }
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              required={actionType === 'reject'}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-5 py-2 rounded-xl text-white font-semibold text-xs transition-all cursor-pointer disabled:opacity-50 ${
                actionType === 'approve'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-200'
              }`}
            >
              {submitting ? 'Updating...' : actionType === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
