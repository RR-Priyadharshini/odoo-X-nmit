import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface User {
  id: number;
  employee_code: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'employee' | 'admin';
  created_at: string;
}

export interface Employee {
  id: number;
  user_id: number;
  phone: string;
  address: string;
  designation: string;
  department: string;
  joining_date: string;
  profile_picture?: string;
}

export interface Attendance {
  id: number;
  employee_id: number;
  date: string; // YYYY-MM-DD
  check_in?: string | null; // ISO string or HH:mm
  check_out?: string | null;
  status: 'present' | 'absent' | 'half-day' | 'leave';
}

export interface Leave {
  id: number;
  employee_id: number;
  leave_type: 'paid' | 'sick' | 'unpaid';
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_comment?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface Payroll {
  id: number;
  employee_id: number;
  basic_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  updated_at: string;
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

interface DatabaseSchema {
  users: User[];
  employees: Employee[];
  attendance: Attendance[];
  leaves: Leave[];
  payroll: Payroll[];
  signals: FlowSignal[];
  timeline: TimelineEvent[];
  lastIds: {
    users: number;
    employees: number;
    attendance: number;
    leaves: number;
    payroll: number;
  };
}

const DB_FILE = path.join(process.cwd(), 'dayflow.db.json');

class Database {
  private data: DatabaseSchema = {
    users: [],
    employees: [],
    attendance: [],
    leaves: [],
    payroll: [],
    signals: [],
    timeline: [],
    lastIds: { users: 0, employees: 0, attendance: 0, leaves: 0, payroll: 0 }
  };

  constructor() {
    this.load();
  }

  private load() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        return;
      } catch (e) {
        console.error('Error reading db file, re-initializing...', e);
      }
    }
    this.seedInitialData();
  }

  public save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving db file:', e);
    }
  }

  public resetDatabase() {
    this.seedInitialData();
  }

  public seedInitialData() {
    const adminPasswordHash = bcrypt.hashSync('Admin@123', 10);
    const employeePasswordHash = bcrypt.hashSync('Employee@123', 10);

    const now = new Date().toISOString();
    const todayStr = new Date().toISOString().split('T')[0];

    // Helper to generate past dates
    const getPastDate = (daysAgo: number) => {
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      return d.toISOString().split('T')[0];
    };

    const users: User[] = [
      {
        id: 1,
        employee_code: 'ADM001',
        name: 'Aditi Rao',
        email: 'admin@dayflow.com',
        password_hash: adminPasswordHash,
        role: 'admin',
        created_at: '2024-01-10T09:00:00.000Z'
      },
      {
        id: 2,
        employee_code: 'EMP101',
        name: 'Aarav Sharma',
        email: 'aarav@dayflow.com',
        password_hash: employeePasswordHash,
        role: 'employee',
        created_at: '2024-02-15T09:00:00.000Z'
      },
      {
        id: 3,
        employee_code: 'EMP102',
        name: 'Priya Patel',
        email: 'priya@dayflow.com',
        password_hash: employeePasswordHash,
        role: 'employee',
        created_at: '2024-03-01T09:00:00.000Z'
      },
      {
        id: 4,
        employee_code: 'EMP103',
        name: 'Rohit Verma',
        email: 'rohit@dayflow.com',
        password_hash: employeePasswordHash,
        role: 'employee',
        created_at: '2024-04-12T09:00:00.000Z'
      },
      {
        id: 5,
        employee_code: 'EMP104',
        name: 'Ananya Iyer',
        email: 'ananya@dayflow.com',
        password_hash: employeePasswordHash,
        role: 'employee',
        created_at: '2024-06-20T09:00:00.000Z'
      }
    ];

    const employees: Employee[] = [
      {
        id: 1,
        user_id: 1,
        phone: '+91 98765 43210',
        address: '14th Floor, Skyline Towers, Indiranagar, Bengaluru',
        designation: 'Head of People & Operations',
        department: 'Human Resources',
        joining_date: '2024-01-10',
        profile_picture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
      },
      {
        id: 2,
        user_id: 2,
        phone: '+91 98234 56789',
        address: '42, Garden View Apts, Koramangala, Bengaluru',
        designation: 'Senior Backend Engineer',
        department: 'Engineering',
        joining_date: '2024-02-15',
        profile_picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      },
      {
        id: 3,
        user_id: 3,
        phone: '+91 98111 22334',
        address: '702, Palm Heights, HSR Layout Sector 4, Bengaluru',
        designation: 'Product Design Lead',
        department: 'Design',
        joining_date: '2024-03-01',
        profile_picture: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
      },
      {
        id: 4,
        user_id: 4,
        phone: '+91 97654 32190',
        address: '18, Residency Road, Shanthala Nagar, Bengaluru',
        designation: 'Enterprise Account Executive',
        department: 'Sales',
        joining_date: '2024-04-12',
        profile_picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
      },
      {
        id: 5,
        user_id: 5,
        phone: '+91 99000 11223',
        address: '204, Green Glen Layout, Bellandur, Bengaluru',
        designation: 'HR & Talent Partner',
        department: 'Human Resources',
        joining_date: '2024-06-20',
        profile_picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      }
    ];

    // Seed payroll with realistic Indian salaries (INR)
    const payroll: Payroll[] = [
      {
        id: 1,
        employee_id: 1,
        basic_salary: 160000,
        allowances: 35000,
        deductions: 18000,
        net_salary: 177000,
        updated_at: now
      },
      {
        id: 2,
        employee_id: 2,
        basic_salary: 140000,
        allowances: 25000,
        deductions: 15000,
        net_salary: 150000,
        updated_at: now
      },
      {
        id: 3,
        employee_id: 3,
        basic_salary: 125000,
        allowances: 20000,
        deductions: 12000,
        net_salary: 133000,
        updated_at: now
      },
      {
        id: 4,
        employee_id: 4,
        basic_salary: 110000,
        allowances: 30000,
        deductions: 14000,
        net_salary: 126000,
        updated_at: now
      },
      {
        id: 5,
        employee_id: 5,
        basic_salary: 85000,
        allowances: 15000,
        deductions: 9000,
        net_salary: 91000,
        updated_at: now
      }
    ];

    // Generate 12-14 days of realistic historical attendance
    const attendance: Attendance[] = [];
    let attId = 1;

    // Past 12 working days
    for (let day = 12; day >= 1; day--) {
      const date = getPastDate(day);
      const dayOfWeek = new Date(date).getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip weekends

      // Aarav (id 2) - very punctual engineer
      attendance.push({
        id: attId++,
        employee_id: 2,
        date,
        check_in: `${date}T09:12:00.000Z`,
        check_out: `${date}T18:30:00.000Z`,
        status: 'present'
      });

      // Priya (id 3) - designer, had 1 half day 4 days ago
      if (day === 4) {
        attendance.push({
          id: attId++,
          employee_id: 3,
          date,
          check_in: `${date}T09:45:00.000Z`,
          check_out: `${date}T13:30:00.000Z`,
          status: 'half-day'
        });
      } else {
        attendance.push({
          id: attId++,
          employee_id: 3,
          date,
          check_in: `${date}T09:25:00.000Z`,
          check_out: `${date}T18:15:00.000Z`,
          status: 'present'
        });
      }

      // Rohit (id 4) - sales, was on approved client leave 7 days ago
      if (day === 7) {
        attendance.push({
          id: attId++,
          employee_id: 4,
          date,
          check_in: null,
          check_out: null,
          status: 'leave'
        });
      } else {
        attendance.push({
          id: attId++,
          employee_id: 4,
          date,
          check_in: `${date}T10:05:00.000Z`,
          check_out: `${date}T19:20:00.000Z`,
          status: 'present'
        });
      }

      // Ananya (id 5) - HR partner
      attendance.push({
        id: attId++,
        employee_id: 5,
        date,
        check_in: `${date}T08:58:00.000Z`,
        check_out: `${date}T17:45:00.000Z`,
        status: 'present'
      });

      // Admin (id 1)
      attendance.push({
        id: attId++,
        employee_id: 1,
        date,
        check_in: `${date}T08:50:00.000Z`,
        check_out: `${date}T18:00:00.000Z`,
        status: 'present'
      });
    }

    // Today's attendance
    // Aarav checked in today at 09:05 AM and is currently working
    attendance.push({
      id: attId++,
      employee_id: 2,
      date: todayStr,
      check_in: `${todayStr}T09:05:00.000Z`,
      check_out: null,
      status: 'present'
    });

    // Priya checked in today at 09:20 AM and is currently working
    attendance.push({
      id: attId++,
      employee_id: 3,
      date: todayStr,
      check_in: `${todayStr}T09:20:00.000Z`,
      check_out: null,
      status: 'present'
    });

    // Ananya checked in early at 08:45 AM
    attendance.push({
      id: attId++,
      employee_id: 5,
      date: todayStr,
      check_in: `${todayStr}T08:45:00.000Z`,
      check_out: null,
      status: 'present'
    });

    // Admin checked in
    attendance.push({
      id: attId++,
      employee_id: 1,
      date: todayStr,
      check_in: `${todayStr}T08:30:00.000Z`,
      check_out: null,
      status: 'present'
    });

    // Rohit has not checked in yet today (in field or not started)

    // Seed Leaves (pending, approved, rejected)
    const leaves: Leave[] = [
      {
        id: 1,
        employee_id: 2, // Aarav
        leave_type: 'paid',
        start_date: getPastDate(-5), // 5 days in future
        end_date: getPastDate(-7), // 7 days in future
        reason: 'Family wedding ceremony in Jaipur, Rajasthan.',
        status: 'pending',
        admin_comment: null,
        created_at: getPastDate(1) + 'T11:20:00.000Z',
        updated_at: null
      },
      {
        id: 2,
        employee_id: 3, // Priya
        leave_type: 'sick',
        start_date: getPastDate(4),
        end_date: getPastDate(4),
        reason: 'Severe migraine; requested half day afternoon rest.',
        status: 'approved',
        admin_comment: 'Approved. Please rest well and take care.',
        created_at: getPastDate(4) + 'T08:15:00.000Z',
        updated_at: getPastDate(4) + 'T09:30:00.000Z'
      },
      {
        id: 3,
        employee_id: 4, // Rohit
        leave_type: 'paid',
        start_date: getPastDate(7),
        end_date: getPastDate(7),
        reason: 'Personal relocation and home setup.',
        status: 'approved',
        admin_comment: 'Approved as planned.',
        created_at: getPastDate(10) + 'T14:00:00.000Z',
        updated_at: getPastDate(9) + 'T10:00:00.000Z'
      },
      {
        id: 4,
        employee_id: 4, // Rohit
        leave_type: 'unpaid',
        start_date: getPastDate(-2),
        end_date: getPastDate(-1),
        reason: 'Unplanned extended personal travel.',
        status: 'rejected',
        admin_comment: 'Key client Q3 closing presentations scheduled during this window.',
        created_at: getPastDate(2) + 'T16:45:00.000Z',
        updated_at: getPastDate(1) + 'T09:00:00.000Z'
      },
      {
        id: 5,
        employee_id: 5, // Ananya
        leave_type: 'paid',
        start_date: getPastDate(-10),
        end_date: getPastDate(-12),
        reason: 'Attending annual SHRM Global HR Leadership Summit.',
        status: 'pending',
        admin_comment: null,
        created_at: getPastDate(0) + 'T08:30:00.000Z',
        updated_at: null
      }
    ];

    // Flow Intelligence Signals
    const signals: FlowSignal[] = [
      {
        id: 'sig-1',
        severity: 'high',
        title: 'PENDING APPROVAL BOTTLENECK',
        what_happened: '2 leave applications are awaiting managerial review for > 24 hours.',
        why_it_matters: 'Upcoming leaves fall within next 5 business days, impacting Engineering & HR sprint coverage.',
        underlying_data: [
          { label: 'Pending Requests', value: 2 },
          { label: 'Avg Wait Time', value: '28.4 hours' },
          { label: 'Earliest Start Date', value: getPastDate(-5) },
          { label: 'Departments Affected', value: 'Engineering, HR' }
        ],
        recommended_action: 'Review pending leaves queue in Time Away panel to clear scheduling blockers.',
        department: 'Company-wide',
        created_at: now
      },
      {
        id: 'sig-2',
        severity: 'medium',
        title: 'MORNING ATTENDANCE VELOCITY',
        what_happened: '80% of active workforce clocked in before 09:30 AM.',
        why_it_matters: 'Strong operational pulse with 4 on-site check-ins recorded smoothly.',
        underlying_data: [
          { label: 'Present Today', value: '4 / 5' },
          { label: 'Avg Check-In Time', value: '09:02 AM' },
          { label: 'Unstarted Shift', value: '1 (Sales)' }
        ],
        recommended_action: 'Monitor field sales team check-ins by 11:00 AM.',
        department: 'Operations',
        created_at: now
      },
      {
        id: 'sig-3',
        severity: 'low',
        title: 'MONTHLY PAYROLL RECONCILIATION READY',
        what_happened: 'All 5 employee salary structures and allowance deductions are in balance.',
        why_it_matters: 'Total monthly net disbursement is projected at ₹6,77,000 with zero unallocated deductions.',
        underlying_data: [
          { label: 'Total Payroll', value: '₹6,77,000' },
          { label: 'Total Employees', value: 5 },
          { label: 'Compliance Score', value: '100%' }
        ],
        recommended_action: 'Lock monthly payroll batch prior to month-end payout cycle.',
        department: 'Finance',
        created_at: now
      }
    ];

    // Workforce Pulse Timeline
    const timeline: TimelineEvent[] = [
      {
        id: 'tl-1',
        time: '08:30 AM',
        title: 'Aditi Rao (Admin) started workday',
        description: 'Operations console initiated with system status normal.',
        category: 'arrival',
        severity: 'normal'
      },
      {
        id: 'tl-2',
        time: '08:45 AM',
        title: 'Ananya Iyer clocked in',
        description: 'HR Talent partner active at desk.',
        category: 'arrival',
        severity: 'normal'
      },
      {
        id: 'tl-3',
        time: '09:05 AM',
        title: 'Aarav Sharma clocked in',
        description: 'Engineering shift started on time.',
        category: 'arrival',
        severity: 'normal'
      },
      {
        id: 'tl-4',
        time: '09:20 AM',
        title: 'Priya Patel clocked in',
        description: 'Design team active on sprint boards.',
        category: 'arrival',
        severity: 'normal'
      },
      {
        id: 'tl-5',
        time: '10:00 AM',
        title: 'Leave application submitted',
        description: 'Ananya submitted request for SHRM Global HR Summit.',
        category: 'leave',
        severity: 'attention'
      },
      {
        id: 'tl-6',
        time: '10:30 AM',
        title: 'Workforce pulse check: 80% on-duty',
        description: 'System health verified with 4 active working sessions.',
        category: 'milestone',
        severity: 'positive'
      }
    ];

    this.data = {
      users,
      employees,
      attendance,
      leaves,
      payroll,
      signals,
      timeline,
      lastIds: {
        users: 5,
        employees: 5,
        attendance: attId - 1,
        leaves: 5,
        payroll: 5
      }
    };

    this.save();
    console.log('Database seeded with demo admin, employees, attendance, leaves, payroll & signals.');
  }

  // Repository Getters
  public getUsers() { return this.data.users; }
  public getEmployees() { return this.data.employees; }
  public getAttendance() { return this.data.attendance; }
  public getLeaves() { return this.data.leaves; }
  public getPayroll() { return this.data.payroll; }
  public getSignals() { return this.data.signals; }
  public getTimeline() { return this.data.timeline; }

  // Helpers
  public findUserById(id: number) {
    return this.data.users.find(u => u.id === id);
  }

  public findUserByEmail(email: string) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  }

  public findEmployeeByUserId(userId: number) {
    return this.data.employees.find(e => e.user_id === userId);
  }

  public findEmployeeById(id: number) {
    return this.data.employees.find(e => e.id === id);
  }

  public addUser(user: Omit<User, 'id'>): User {
    const id = ++this.data.lastIds.users;
    const newUser: User = { ...user, id };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  public addEmployee(emp: Omit<Employee, 'id'>): Employee {
    const id = ++this.data.lastIds.employees;
    const newEmp: Employee = { ...emp, id };
    this.data.employees.push(newEmp);
    this.save();
    return newEmp;
  }

  public updateEmployee(id: number, updates: Partial<Employee>): Employee | null {
    const idx = this.data.employees.findIndex(e => e.id === id);
    if (idx === -1) return null;
    this.data.employees[idx] = { ...this.data.employees[idx], ...updates };
    this.save();
    return this.data.employees[idx];
  }

  public addAttendance(att: Omit<Attendance, 'id'>): Attendance {
    const id = ++this.data.lastIds.attendance;
    const newAtt: Attendance = { ...att, id };
    this.data.attendance.push(newAtt);
    this.save();
    return newAtt;
  }

  public updateAttendance(id: number, updates: Partial<Attendance>): Attendance | null {
    const idx = this.data.attendance.findIndex(a => a.id === id);
    if (idx === -1) return null;
    this.data.attendance[idx] = { ...this.data.attendance[idx], ...updates };
    this.save();
    return this.data.attendance[idx];
  }

  public addLeave(leave: Omit<Leave, 'id'>): Leave {
    const id = ++this.data.lastIds.leaves;
    const newLeave: Leave = { ...leave, id };
    this.data.leaves.push(newLeave);
    this.save();
    return newLeave;
  }

  public updateLeave(id: number, updates: Partial<Leave>): Leave | null {
    const idx = this.data.leaves.findIndex(l => l.id === id);
    if (idx === -1) return null;
    this.data.leaves[idx] = { ...this.data.leaves[idx], ...updates, updated_at: new Date().toISOString() };
    this.save();
    return this.data.leaves[idx];
  }

  public setPayroll(payroll: Omit<Payroll, 'id'>): Payroll {
    const idx = this.data.payroll.findIndex(p => p.employee_id === payroll.employee_id);
    if (idx >= 0) {
      this.data.payroll[idx] = {
        ...this.data.payroll[idx],
        ...payroll,
        net_salary: payroll.basic_salary + (payroll.allowances || 0) - (payroll.deductions || 0),
        updated_at: new Date().toISOString()
      };
      this.save();
      return this.data.payroll[idx];
    } else {
      const id = ++this.data.lastIds.payroll;
      const newPay: Payroll = {
        ...payroll,
        id,
        net_salary: payroll.basic_salary + (payroll.allowances || 0) - (payroll.deductions || 0),
        updated_at: new Date().toISOString()
      };
      this.data.payroll.push(newPay);
      this.save();
      return newPay;
    }
  }

  public addTimelineEvent(event: Omit<TimelineEvent, 'id'>) {
    const newEvent: TimelineEvent = {
      id: `tl-${Date.now()}`,
      ...event
    };
    this.data.timeline.unshift(newEvent);
    if (this.data.timeline.length > 50) this.data.timeline.pop();
    this.save();
    return newEvent;
  }
}

export const db = new Database();
