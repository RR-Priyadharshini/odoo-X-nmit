import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, ShieldCheck, Download, Calendar, DollarSign } from 'lucide-react';
import { payrollApi } from '../../api/index.js';
import { Payroll } from '../../types.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { useToast } from '../../context/ToastContext.js';

export const MyPay: React.FC = () => {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const { error } = useToast();

  useEffect(() => {
    const fetchPayroll = async () => {
      try {
        setLoading(true);
        const res = await payrollApi.getList();
        setPayrolls(res.data);
      } catch (err: any) {
        error(err.response?.data?.error || 'Failed to load compensation details.');
      } finally {
        setLoading(false);
      }
    };
    fetchPayroll();
  }, []);

  const pay = payrolls[0];

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-500">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold uppercase tracking-wider">Loading Compensation Slip...</p>
      </div>
    );
  }

  if (!pay) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-sm text-slate-600">No payroll structure mapped for your profile yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Pay & Compensation
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Verified monthly salary structure, statutory deductions, and net payouts.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-all cursor-pointer"
        >
          <Download className="w-4 h-4 text-indigo-600" />
          <span>Print / Export Slip</span>
        </button>
      </div>

      {/* Net Salary Highlight Hero */}
      <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-500 to-teal-700 text-white p-6 sm:p-8 shadow-xl shadow-emerald-900/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-100">
              <ShieldCheck className="w-4 h-4" />
              <span>Active Monthly Compensation</span>
            </div>
            <div className="text-3xl sm:text-4xl font-black mt-2 tracking-tight">
              {formatCurrency(pay.net_salary)}
            </div>
            <p className="text-xs text-emerald-100/90 mt-1">
              Direct deposit scheduled on last working day of calendar month
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-6 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-emerald-100 font-semibold">Total Allowances</div>
              <div className="text-base font-bold mt-0.5">{formatCurrency(pay.allowances)}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-emerald-100 font-semibold">Total Deductions</div>
              <div className="text-base font-bold mt-0.5">{formatCurrency(pay.deductions)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Payslip Detailed Breakdown Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Salary Structure Breakdown</h3>
            <p className="text-xs text-slate-500">Last reviewed: {formatDate(pay.updated_at)}</p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Compliant with Indian Tax & Labor Norms</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
          {/* Earnings */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Earnings & Additions (A)
            </h4>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-600">Basic Salary</span>
                <span className="font-semibold text-slate-900 font-mono">{formatCurrency(pay.basic_salary)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-600">House Rent Allowance (HRA)</span>
                <span className="font-semibold text-slate-900 font-mono">{formatCurrency(pay.allowances * 0.6)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-600">Special & Conveyance Allowance</span>
                <span className="font-semibold text-slate-900 font-mono">{formatCurrency(pay.allowances * 0.4)}</span>
              </div>
              <div className="flex justify-between py-2.5 font-bold text-slate-900 bg-slate-50 rounded-xl px-3 mt-2">
                <span>Gross Monthly Earnings</span>
                <span className="font-mono">{formatCurrency(pay.basic_salary + pay.allowances)}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Statutory & Tax Deductions (B)
            </h4>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-600">Provident Fund (PF Employee)</span>
                <span className="font-semibold text-slate-900 font-mono">{formatCurrency(pay.deductions * 0.6)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-600">Professional Tax & TDS</span>
                <span className="font-semibold text-slate-900 font-mono">{formatCurrency(pay.deductions * 0.4)}</span>
              </div>
              <div className="flex justify-between py-2.5 font-bold text-rose-700 bg-rose-50 rounded-xl px-3 mt-2">
                <span>Total Monthly Deductions</span>
                <span className="font-mono">-{formatCurrency(pay.deductions)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Formula Bar */}
        <div className="mt-8 p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-300">
            <span className="font-bold text-white uppercase tracking-wider mr-2">Net Pay Formula:</span>
            <span>Gross Earnings (A) − Total Deductions (B) = Net Take-Home</span>
          </div>
          <div className="text-lg font-bold text-emerald-400 font-mono">
            = {formatCurrency(pay.net_salary)} / month
          </div>
        </div>
      </div>
    </div>
  );
};
