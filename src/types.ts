export type Role = 'employee' | 'admin';

export interface User {
  id: number;
  employee_id?: number;
  employee_code: string;
  name: string;
  email: string;
  role: Role;
  created_at?: string;
}

export interface Employee {
  id: number;
  user_id: number;
  name: string;
  email: string;
  employee_code: string;
  phone: string;
  address: string;
  designation: string;
  department: string;
  joining_date: string;
  profile_picture?: string;
  user?: User;
  payroll?: Payroll;
  today_attendance?: Attendance | null;
  work_state?: 'not_started' | 'working' | 'checked_out' | 'leave';
}

export type AttendanceStatus = 'present' | 'absent' | 'half-day' | 'half_day' | 'leave';

export interface Attendance {
  id: number;
  employee_id: number;
  date: string;
  check_in?: string | null;
  check_out?: string | null;
  status: AttendanceStatus;
  employee?: {
    id: number;
    name: string;
    employee_code: string;
    department: string;
    designation: string;
    profile_picture?: string;
  };
}

export type LeaveType = 'paid' | 'sick' | 'unpaid';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface Leave {
  id: number;
  employee_id: number;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  reason: string;
  status: LeaveStatus;
  admin_comment?: string | null;
  created_at: string;
  updated_at?: string | null;
  employee?: {
    id: number;
    name: string;
    employee_code: string;
    department: string;
    designation: string;
    profile_picture?: string;
  };
}

export interface Payroll {
  id: number;
  employee_id: number;
  basic_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  updated_at: string;
  employee?: {
    id: number;
    name: string;
    employee_code: string;
    department: string;
    designation: string;
    joining_date?: string;
  };
}

export interface FlowSignal {
  id: string;
  severity: 'high' | 'medium' | 'low' | 'info';
  title: string;
  what_happened: string;
  why_it_matters: string;
  underlying_data: {
    label: string;
    value: string | number;
  }[];
  recommended_action: string;
  department?: string;
  created_at: string;
}

export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  category: 'arrival' | 'anomaly' | 'leave' | 'payroll' | 'milestone';
  severity?: 'normal' | 'attention' | 'positive';
}

export interface EmployeeDashboardData {
  employee: Employee;
  today_attendance: Attendance | null;
  work_state: 'NOT STARTED' | 'WORKING' | 'CHECKED OUT' | 'LEAVE';
  attendance_rate: number;
  leave_balance: {
    paid_total: number;
    paid_used: number;
    paid_available: number;
    sick_total: number;
    sick_used: number;
    sick_available: number;
  };
  payroll: Payroll | null;
  recent_leaves: Leave[];
  recent_attendance: Attendance[];
}

export interface AdminPulseData {
  pulse: {
    total_headcount: number;
    present_today: number;
    currently_working: number;
    checked_out_today: number;
    half_day_today: number;
    on_leave_today: number;
    not_started_today: number;
    presence_ratio_str: string;
    presence_percentage: number;
    pending_leave_approvals: number;
    total_monthly_payroll: number;
  };
  department_breakdown: {
    department: string;
    total: number;
    present: number;
    rate: number;
  }[];
  pending_leave_queue: Leave[];
  signals: FlowSignal[];
  timeline: TimelineEvent[];
}
