import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, CheckCircle2, AlertCircle, Info, MessageSquare } from 'lucide-react';
import { leavesApi } from '../../api/index.js';
import { Leave, LeaveType } from '../../types.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { Modal } from '../../components/Modal.js';
import { useToast } from '../../context/ToastContext.js';
import { formatDate } from '../../utils/formatters.js';

export const TimeAway: React.FC = () => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [meta, setMeta] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    leave_type: 'paid' as LeaveType,
    start_date: todayStr,
    end_date: todayStr,
    reason: ''
  });

  const { success, error } = useToast();

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await leavesApi.getList();
      setLeaves(res.data);
      setMeta(res.meta);
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to load leaves.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (formData.end_date < formData.start_date) {
      setFormError('End date must be greater than or equal to start date.');
      return;
    }

    if (!formData.reason.trim() || formData.reason.trim().length < 5) {
      setFormError('Please enter a descriptive reason (at least 5 characters).');
      return;
    }

    try {
      setSubmitting(true);
      await leavesApi.apply(formData);
      success('Leave application submitted for managerial review.', 'Application Filed');
      setModalOpen(false);
      setFormData({
        leave_type: 'paid',
        start_date: todayStr,
        end_date: todayStr,
        reason: ''
      });
      await fetchLeaves();
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to apply for leave.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Time Away & Leaves
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Submit leave requests, check approvals, and manage scheduled out-of-office dates.
          </p>
        </div>

        <button
          id="btn-apply-leave"
          onClick={() => {
            setFormError('');
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-200 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Summary KPI Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Applications</span>
          <div className="mt-1 text-2xl font-bold text-slate-900">{meta.total}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Pending Review</span>
          <div className="mt-1 text-2xl font-bold text-amber-600">{meta.pending}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Approved Leaves</span>
          <div className="mt-1 text-2xl font-bold text-emerald-600">{meta.approved}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Rejected / Closed</span>
          <div className="mt-1 text-2xl font-bold text-slate-500">{meta.rejected}</div>
        </div>
      </div>

      {/* Leaves Applications Table */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs">
        <div className="mb-5">
          <h3 className="text-base font-bold text-slate-900">Your Leave History</h3>
          <p className="text-xs text-slate-500">Live synchronization with people operations review queue</p>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading leaves...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-3">Type</th>
                  <th className="py-3.5 px-3">Dates</th>
                  <th className="py-3.5 px-3">Reason</th>
                  <th className="py-3.5 px-3">Manager Feedback</th>
                  <th className="py-3.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-3">
                      <StatusBadge status={leave.leave_type} size="sm" />
                    </td>
                    <td className="py-3.5 px-3 text-xs text-slate-900 font-medium">
                      <div>{formatDate(leave.start_date)}</div>
                      <div className="text-[11px] text-slate-400">to {formatDate(leave.end_date)}</div>
                    </td>
                    <td className="py-3.5 px-3 text-xs text-slate-700 max-w-xs">
                      {leave.reason}
                    </td>
                    <td className="py-3.5 px-3 text-xs text-slate-500 max-w-xs">
                      {leave.admin_comment ? (
                        <div className="flex items-start gap-1.5 p-2 rounded-lg bg-slate-50 border border-slate-200/60">
                          <MessageSquare className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                          <span className="text-[11px] text-slate-700">{leave.admin_comment}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No notes yet</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <StatusBadge status={leave.status} size="sm" />
                    </td>
                  </tr>
                ))}
                {leaves.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                      No leave applications found. Click "Apply for Leave" above to file a request.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Apply Leave Modal Dialog */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Apply for Time Away"
        subtitle="Submit dates for managerial review and scheduling coverage"
      >
        <form onSubmit={handleApply} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Leave Classification *
            </label>
            <select
              value={formData.leave_type}
              onChange={(e) => setFormData({ ...formData, leave_type: e.target.value as LeaveType })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="paid">Paid Annual Leave (Vacation / Personal)</option>
              <option value="sick">Medical & Sick Leave</option>
              <option value="unpaid">Unpaid Leave of Absence</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                End Date *
              </label>
              <input
                type="date"
                value={formData.end_date}
                min={formData.start_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Reason / Purpose *
            </label>
            <textarea
              rows={3}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="e.g. Attending family milestone event in Jaipur, Rajasthan."
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
