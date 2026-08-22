import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Briefcase,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Clock,
  Save,
  Trash2,
  Shield,
  CheckCircle2
} from 'lucide-react';
import { employeesApi, attendanceApi, leavesApi, payrollApi } from '../../api/index.js';
import { Employee, Attendance, Leave, Payroll } from '../../types.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { Modal } from '../../components/Modal.js';
import { useToast } from '../../context/ToastContext.js';
import { formatCurrency, formatDate, formatTime, getInitials } from '../../utils/formatters.js';

export const EmployeeDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [payroll, setPayroll] = useState<Payroll | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit forms
  const [editForm, setEditForm] = useState({
    name: '',
    department: '',
    designation: '',
    phone: '',
    address: '',
    profile_picture: ''
  });

  const [salaryForm, setSalaryForm] = useState({
    basic_salary: 0,
    allowances: 0,
    deductions: 0
  });

  const [salaryModalOpen, setSalaryModalOpen] = useState(false);
  const [savingSalary, setSavingSalary] = useState(false);

  const fetchEmployeeFullDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const empRes = await employeesApi.getById(Number(id));
      setEmployee(empRes.data);

      setEditForm({
        name: empRes.data.name,
        department: empRes.data.department,
        designation: empRes.data.designation,
        phone: empRes.data.phone || '',
        address: empRes.data.address || '',
        profile_picture: empRes.data.profile_picture || ''
      });

      // Load attendance & leaves filtered for this employee
      const [attRes, leaveRes, payRes] = await Promise.all([
        attendanceApi.getList({ employee_id: Number(id) }),
        leavesApi.getList({ employee_id: Number(id) }),
        payrollApi.getList()
      ]);

      setAttendances(attRes.data);
      setLeaves(leaveRes.data);

      const matchingPay = payRes.data.find((p: Payroll) => p.employee_id === Number(id));
      if (matchingPay) {
        setPayroll(matchingPay);
        setSalaryForm({
          basic_salary: matchingPay.basic_salary,
          allowances: matchingPay.allowances,
          deductions: matchingPay.deductions
        });
      }
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to load employee profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeFullDetails();
  }, [id]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setSaving(true);
      await employeesApi.update(Number(id), editForm);
      success('Employee profile updated successfully.', 'Profile Saved');
      await fetchEmployeeFullDetails();
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to update employee.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payroll) return;
    try {
      setSavingSalary(true);
      await payrollApi.update(payroll.id, salaryForm);
      success('Compensation package updated.', 'Salary Saved');
      setSalaryModalOpen(false);
      await fetchEmployeeFullDetails();
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to update salary.');
    } finally {
      setSavingSalary(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !employee) return;
    if (!window.confirm(`Are you sure you want to remove ${employee.name} from the active workforce? This action cannot be undone.`)) {
      return;
    }

    try {
      await employeesApi.delete(Number(id));
      success(`${employee.name} removed from roster.`, 'Employee Deleted');
      navigate('/admin/employees');
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to delete employee.');
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-500">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold uppercase tracking-wider">Loading Member Details...</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-sm text-slate-600">Employee not found.</p>
        <button
          onClick={() => navigate('/admin/employees')}
          className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer"
        >
          Back to Directory
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Back Button & Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/employees')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Directory</span>
        </button>

        <button
          onClick={handleDelete}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Remove Employee</span>
        </button>
      </div>

      {/* Profile Overview Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            {employee.profile_picture ? (
              <img
                src={employee.profile_picture}
                alt={employee.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-200 shadow-xs"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-900 text-white font-bold text-xl flex items-center justify-center">
                {getInitials(employee.name)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {employee.name}
                </h1>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                  {employee.employee_code}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {employee.designation} • {employee.department}
              </p>
              <div className="text-[11px] text-slate-400 mt-1">
                Joined Dayflow: {formatDate(employee.joining_date)}
              </div>
            </div>
          </div>

          {/* Quick Pay summary tile */}
          {payroll && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Monthly Compensation</span>
                <div className="text-xl font-black text-slate-900 mt-0.5">{formatCurrency(payroll.net_salary)}</div>
              </div>
              <button
                onClick={() => setSalaryModalOpen(true)}
                className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-white border border-slate-200 rounded-xl hover:bg-indigo-50 transition-colors cursor-pointer"
              >
                Adjust
              </button>
            </div>
          )}
        </div>

        {/* Edit Form */}
        <form onSubmit={handleUpdateProfile} className="pt-6 space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Edit Workforce Record Details
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Department
              </label>
              <select
                value={editForm.department}
                onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 bg-white"
              >
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Sales">Sales</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Designation
              </label>
              <input
                type="text"
                value={editForm.designation}
                onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 bg-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Residential Location
              </label>
              <input
                type="text"
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Profile Image URL
              </label>
              <input
                type="url"
                value={editForm.profile_picture}
                onChange={(e) => setEditForm({ ...editForm, profile_picture: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Update Member Data'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Two Column Section: Attendance Logs & Leave Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Attendance Records */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs">
          <h3 className="text-base font-bold text-slate-900 mb-1">Attendance History</h3>
          <p className="text-xs text-slate-500 mb-4">Total sessions recorded: {attendances.length}</p>

          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-white border-b border-slate-100 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Check In</th>
                  <th className="pb-2">Check Out</th>
                  <th className="pb-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendances.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="py-2.5 font-semibold text-slate-900">{formatDate(a.date)}</td>
                    <td className="py-2.5 font-mono text-slate-600">{formatTime(a.check_in)}</td>
                    <td className="py-2.5 font-mono text-slate-600">{formatTime(a.check_out)}</td>
                    <td className="py-2.5 text-right">
                      <StatusBadge status={a.status} size="sm" />
                    </td>
                  </tr>
                ))}
                {attendances.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      No attendance logs recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Leave Requests */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs">
          <h3 className="text-base font-bold text-slate-900 mb-1">Leave Applications</h3>
          <p className="text-xs text-slate-500 mb-4">Total requests filed: {leaves.length}</p>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {leaves.map((l) => (
              <div key={l.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 capitalize">{l.leave_type} Leave</span>
                  <StatusBadge status={l.status} size="sm" />
                </div>
                <div className="text-slate-500 text-[11px] mt-1">
                  {formatDate(l.start_date)} to {formatDate(l.end_date)}
                </div>
                <p className="text-slate-700 mt-1 italic">"{l.reason}"</p>
                {l.admin_comment && (
                  <div className="mt-1.5 text-[11px] text-slate-600 bg-white p-1.5 rounded-lg border border-slate-200">
                    <span className="font-semibold">Manager note:</span> {l.admin_comment}
                  </div>
                )}
              </div>
            ))}
            {leaves.length === 0 && (
              <div className="py-8 text-center text-slate-400 text-xs">
                No leave requests filed yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Salary Adjustment Modal */}
      <Modal
        isOpen={salaryModalOpen}
        onClose={() => setSalaryModalOpen(false)}
        title="Adjust Compensation Package"
        subtitle={`Employee: ${employee.name} (${employee.employee_code})`}
      >
        <form onSubmit={handleUpdateSalary} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Monthly Basic Salary (₹)
            </label>
            <input
              type="number"
              value={salaryForm.basic_salary}
              onChange={(e) => setSalaryForm({ ...salaryForm, basic_salary: Number(e.target.value) })}
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
              value={salaryForm.allowances}
              onChange={(e) => setSalaryForm({ ...salaryForm, allowances: Number(e.target.value) })}
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
              value={salaryForm.deductions}
              onChange={(e) => setSalaryForm({ ...salaryForm, deductions: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 bg-white"
              required
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-xl text-xs flex justify-between font-bold text-slate-900">
            <span>Computed Net Payout:</span>
            <span className="font-mono text-emerald-600">
              {formatCurrency(salaryForm.basic_salary + salaryForm.allowances - salaryForm.deductions)}
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSalaryModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingSalary}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50"
            >
              {savingSalary ? 'Updating...' : 'Save Compensation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
