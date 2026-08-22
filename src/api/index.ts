import { api } from './client.js';
import {
  User,
  Employee,
  Attendance,
  AttendanceStatus,
  Leave,
  LeaveStatus,
  Payroll,
  EmployeeDashboardData,
  AdminPulseData,
  FlowSignal,
  TimelineEvent
} from '../types.js';

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await api.post<{ token: string; role: 'employee' | 'admin'; user: User; employee: Employee }>('/auth/login', { email, password });
    return res.data;
  },
  register: async (payload: { name: string; email: string; password: string; designation?: string; department?: string; phone?: string; address?: string }) => {
    const res = await api.post<{ token: string; role: 'employee' | 'admin'; user: User; employee: Employee }>('/auth/register', payload);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get<{ user: User; employee: Employee }>('/auth/me');
    return res.data;
  }
};

export const employeesApi = {
  getAll: async (params?: { search?: string; department?: string }) => {
    const res = await api.get<{ data: Employee[]; meta: { total: number; departments: string[] } }>('/employees', { params });
    return res.data;
  },
  getList: async (params?: { search?: string; department?: string }) => {
    const res = await api.get<{ data: Employee[]; meta: { total: number; departments: string[] } }>('/employees', { params });
    return res.data;
  },
  getById: async (id: number) => {
    const res = await api.get<{ data: Employee & { user: User; payroll?: Payroll; attendance_history?: Attendance[]; leave_history?: Leave[] } }>(`/employees/${id}`);
    return res.data;
  },
  create: async (data: {
    name: string;
    email: string;
    password?: string;
    department?: string;
    designation?: string;
    phone?: string;
    address?: string;
    basic_salary?: number;
    allowances?: number;
    deductions?: number;
    role?: string;
  }) => {
    const res = await api.post<{ data: Employee }>('/employees', data);
    return res.data;
  },
  update: async (id: number, data: Partial<Employee & { name?: string }>) => {
    const res = await api.put<{ data: Employee }>(`/employees/${id}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete<{ message: string }>(`/employees/${id}`);
    return res.data;
  }
};

export const attendanceApi = {
  checkIn: async () => {
    const res = await api.post<{ data: Attendance }>('/attendance/check-in');
    return res.data;
  },
  checkOut: async () => {
    const res = await api.post<{ data: Attendance }>('/attendance/check-out');
    return res.data;
  },
  getList: async (params?: { range?: 'daily' | 'weekly' | 'all'; employee_id?: string | number; date?: string; status?: AttendanceStatus }) => {
    const res = await api.get<{ data: Attendance[]; meta: { total: number; present_count: number; half_day_count: number; leave_count: number } }>('/attendance', { params });
    return res.data;
  },
  getEmployeeAttendance: async (employeeId: number) => {
    const res = await api.get<{ data: Attendance[] }>(`/attendance/${employeeId}`);
    return res.data;
  }
};

export const leavesApi = {
  apply: async (data: { leave_type: 'paid' | 'sick' | 'unpaid'; start_date: string; end_date: string; reason: string }) => {
    const res = await api.post<{ data: Leave }>('/leaves', data);
    return res.data;
  },
  getList: async (params?: { status?: LeaveStatus | 'all'; employee_id?: number }) => {
    const res = await api.get<{ data: Leave[]; meta: { total: number; pending: number; approved: number; rejected: number } }>('/leaves', { params });
    return res.data;
  },
  getById: async (id: number) => {
    const res = await api.get<{ data: Leave }>(`/leaves/${id}`);
    return res.data;
  },
  approve: async (id: number, admin_comment?: string) => {
    const res = await api.put<{ data: Leave }>(`/leaves/${id}/approve`, { admin_comment });
    return res.data;
  },
  reject: async (id: number, admin_comment: string) => {
    const res = await api.put<{ data: Leave }>(`/leaves/${id}/reject`, { admin_comment });
    return res.data;
  }
};

export const payrollApi = {
  getList: async () => {
    const res = await api.get<{ data: Payroll[]; meta: { total_employees: number; total_monthly_disbursement: number; currency: string } }>('/payroll');
    return res.data;
  },
  getEmployeePayroll: async (employeeId: number) => {
    const res = await api.get<{ data: Payroll }>(`/payroll/${employeeId}`);
    return res.data;
  },
  update: async (employeeId: number, data: { basic_salary: number; allowances?: number; deductions?: number }) => {
    const res = await api.put<{ data: Payroll }>(`/payroll/${employeeId}`, data);
    return res.data;
  }
};

export const dashboardApi = {
  getEmployeeDashboard: async () => {
    const res = await api.get<{ data: EmployeeDashboardData }>('/dashboard/employee');
    return res.data;
  },
  getAdminPulse: async () => {
    const res = await api.get<{ data: AdminPulseData }>('/dashboard/admin');
    return res.data;
  },
  getFlowSignals: async () => {
    const res = await api.get<{ data: FlowSignal[] }>('/flow-intelligence');
    return res.data;
  },
  getWorkforceTimeline: async () => {
    const res = await api.get<{ data: TimelineEvent[] }>('/workforce-timeline');
    return res.data;
  },
  resetDb: async () => {
    const res = await api.post<{ message: string }>('/admin/reset-db');
    return res.data;
  }
};
