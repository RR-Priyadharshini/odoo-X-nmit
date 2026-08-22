import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, TrendingUp, ShieldCheck, Download, Edit3, CheckCircle2 } from 'lucide-react';
import { payrollApi } from '../../api/index.js';
import { Payroll } from '../../types.js';
import { StatCard } from '../../components/StatCard.js';
import { Modal } from '../../components/Modal.js';
import { useToast } from '../../context/ToastContext.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

export const PayrollManager: React.FC = () => {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPay, setSelectedPay] = useState<Payroll | null>(null);
  const [editForm, setEditForm] = useState({
    basic_salary: 0,
    allowances: 0,
    deductions: 0
  });
  const [saving, setSaving] = useState(false);

  const { success, error } = useToast();

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const res = await payrollApi.getList();
      setPayrolls(res.data);
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to load compensation records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, []);

  const totalBasic = payrolls.reduce((acc, p) => acc + p.basic_salary, 0);
  const totalAllowances = payrolls.reduce((acc, p) => acc + p.allowances, 0);
  const totalDeductions = payrolls.reduce((acc, p) => acc + p.deductions, 0);
  const totalNet = payrolls.reduce((acc, p) => acc + p.net_salary, 0);

  const openEditModal = (pay: Payroll) => {
    setSelectedPay(pay);
    setEditForm({
      basic_salary: pay.basic_salary,
      allowances: pay.allowances,
      deductions: pay.deductions
    });
    setModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPay) return;

    try {
      setSaving(true);
      await payrollApi.update(selectedPay.id, editForm);
      success(`Updated salary structure for ${selectedPay.employee?.name}.`, 'Compensation Saved');
      setModalOpen(false);
      await fetchPayroll();
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to update salary.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-600">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Compensation & Payroll Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Workforce Payroll & Compensation
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Audit salary disbursements, statutory PF & tax deductions, and manage compensation structures.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-all cursor-pointer"
        >
          <Download className="w-4 h-4 text-indigo-600" />
          <span>Export Payroll Report</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Monthly Net Spend"
          value={formatCurrency(totalNet)}
          subtitle="Net monthly payroll disbursement"
          icon={CreditCard}
          accent="emerald"
        />
        <StatCard
          title="Base Salaries"
          value={formatCurrency(totalBasic)}
          subtitle="Fixed basic salary total"
          icon={TrendingUp}
          accent="indigo"
        />
        <StatCard
          title="Total Allowances & HRA"
          value={formatCurrency(totalAllowances)}
          subtitle="Special, travel & house rent"
          icon={DollarSign}
          accent="indigo"
        />
        <StatCard
          title="Statutory Deductions"
          value={formatCurrency(totalDeductions)}
          subtitle="PF, professional tax & TDS"
          icon={ShieldCheck}
          accent="rose"
        />
      </div>

      {/* Main Table Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs">
        <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Member Compensation Structures</h3>
            <p className="text-xs text-slate-500">Live reconciliation with employee contracts</p>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading compensation data...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-3">Employee</th>
                  <th className="py-3.5 px-3">Department</th>
                  <th className="py-3.5 px-3">Basic (₹)</th>
                  <th className="py-3.5 px-3">Allowances (₹)</th>
                  <th className="py-3.5 px-3">Deductions (₹)</th>
                  <th className="py-3.5 px-3">Net Payout (₹)</th>
                  <th className="py-3.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payrolls.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-900 text-xs">{p.employee?.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {p.employee?.employee_code}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-xs text-slate-600">
                      {p.employee?.department}
                    </td>
                    <td className="py-3.5 px-3 text-xs text-slate-800 font-mono">
                      {formatCurrency(p.basic_salary)}
                    </td>
                    <td className="py-3.5 px-3 text-xs text-slate-800 font-mono">
                      +{formatCurrency(p.allowances)}
                    </td>
                    <td className="py-3.5 px-3 text-xs text-rose-600 font-mono">
                      -{formatCurrency(p.deductions)}
                    </td>
                    <td className="py-3.5 px-3 text-xs font-bold text-emerald-700 font-mono">
                      {formatCurrency(p.net_salary)}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => openEditModal(p)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Adjust</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Adjust Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Adjust Compensation Structure"
        subtitle={`Employee: ${selectedPay?.employee?.name} (${selectedPay?.employee?.employee_code})`}
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Basic Salary (₹)
            </label>
            <input
              type="number"
              value={editForm.basic_salary}
              onChange={(e) => setEditForm({ ...editForm, basic_salary: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Allowances & HRA (₹)
            </label>
            <input
              type="number"
              value={editForm.allowances}
              onChange={(e) => setEditForm({ ...editForm, allowances: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Statutory Deductions (PF & Tax) (₹)
            </label>
            <input
              type="number"
              value={editForm.deductions}
              onChange={(e) => setEditForm({ ...editForm, deductions: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 bg-white"
              required
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-xl text-xs flex justify-between font-bold text-slate-900">
            <span>Computed Net Payout:</span>
            <span className="font-mono text-emerald-600">
              {formatCurrency(editForm.basic_salary + editForm.allowances - editForm.deductions)}
            </span>
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
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Updating...' : 'Save Structure'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
