import express, { Response } from 'express';
import cors from 'cors';
import path from 'path';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import { db, User, Employee, Attendance, Leave, Payroll } from './server/db.js';
import { authenticate, requireRole, generateToken, AuthRequest } from './server/auth.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // ==========================================
  // AUTHENTICATION ROUTES
  // ==========================================

  // POST /api/auth/register (public employee registration)
  app.post('/api/auth/register', (req, res) => {
    try {
      const { name, email, password, designation, department, phone, address } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required.' });
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Please enter a valid email address.' });
      }

      // Password length validation
      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
      }

      // Check existing user
      if (db.findUserByEmail(email)) {
        return res.status(409).json({ error: 'An account with this email address already exists.' });
      }

      const users = db.getUsers();
      const empCount = users.filter(u => u.role === 'employee').length + 1;
      const employeeCode = `EMP${String(100 + empCount).padStart(3, '0')}`;

      const password_hash = bcrypt.hashSync(password, 10);
      const user = db.addUser({
        employee_code: employeeCode,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password_hash,
        role: 'employee', // strictly employee for public register
        created_at: new Date().toISOString()
      });

      // Create employee profile
      const employee = db.addEmployee({
        user_id: user.id,
        phone: phone || '+91 98000 00000',
        address: address || 'Bengaluru, Karnataka, India',
        designation: designation || 'Associate Engineer',
        department: department || 'Engineering',
        joining_date: new Date().toISOString().split('T')[0],
        profile_picture: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`
      });

      // Create default payroll
      const basic = 60000;
      const allowances = 10000;
      const deductions = 5000;
      db.setPayroll({
        employee_id: employee.id,
        basic_salary: basic,
        allowances,
        deductions,
        net_salary: basic + allowances - deductions,
        updated_at: new Date().toISOString()
      });

      const token = generateToken(user);

      // Log timeline event
      db.addTimelineEvent({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        title: `New Employee Onboarded: ${user.name}`,
        description: `${user.name} joined as ${employee.designation} (${employee.department})`,
        category: 'arrival',
        severity: 'positive'
      });

      return res.status(201).json({
        token,
        role: user.role,
        user: {
          id: user.id,
          employee_id: employee.id,
          employee_code: user.employee_code,
          name: user.name,
          email: user.email,
          role: user.role
        },
        employee
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Internal server error during registration.' });
    }
  });

  // POST /api/auth/login
  app.post('/api/auth/login', (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const user = db.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const match = bcrypt.compareSync(password, user.password_hash);
      if (!match) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const employee = db.findEmployeeByUserId(user.id);
      const token = generateToken(user);

      return res.json({
        token,
        role: user.role,
        user: {
          id: user.id,
          employee_id: employee?.id,
          employee_code: user.employee_code,
          name: user.name,
          email: user.email,
          role: user.role
        },
        employee
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Internal server error during login.' });
    }
  });

  // GET /api/auth/me
  app.get('/api/auth/me', authenticate, (req: AuthRequest, res) => {
    const user = req.user!;
    const employee = db.findEmployeeByUserId(user.id);
    return res.json({
      user: {
        id: user.id,
        employee_id: employee?.id,
        employee_code: user.employee_code,
        name: user.name,
        email: user.email,
        role: user.role
      },
      employee
    });
  });

  // ==========================================
  // EMPLOYEE MANAGEMENT ROUTES
  // ==========================================

  // GET /api/employees (admin only; ?search=&department=)
  app.get('/api/employees', authenticate, requireRole('admin'), (req: AuthRequest, res) => {
    try {
      const { search, department } = req.query;
      let employees = db.getEmployees();
      const users = db.getUsers();
      const payrolls = db.getPayroll();
      const attendance = db.getAttendance();

      const todayStr = new Date().toISOString().split('T')[0];

      // Join user and latest status
      let results = employees.map(emp => {
        const u = users.find(user => user.id === emp.user_id);
        const p = payrolls.find(pay => pay.employee_id === emp.id);
        const todayAtt = attendance.find(a => a.employee_id === emp.id && a.date === todayStr);

        let currentWorkState = 'not_started';
        if (todayAtt) {
          if (todayAtt.status === 'leave') currentWorkState = 'leave';
          else if (todayAtt.check_out) currentWorkState = 'checked_out';
          else if (todayAtt.check_in) currentWorkState = 'working';
        }

        return {
          ...emp,
          user: u ? {
            id: u.id,
            name: u.name,
            email: u.email,
            employee_code: u.employee_code,
            role: u.role,
            created_at: u.created_at
          } : null,
          payroll: p || null,
          today_attendance: todayAtt || null,
          work_state: currentWorkState
        };
      });

      // Filters
      if (department && typeof department === 'string' && department !== 'all') {
        results = results.filter(e => e.department.toLowerCase() === department.toLowerCase());
      }

      if (search && typeof search === 'string' && search.trim() !== '') {
        const q = search.toLowerCase().trim();
        results = results.filter(e =>
          e.user?.name.toLowerCase().includes(q) ||
          e.user?.email.toLowerCase().includes(q) ||
          e.user?.employee_code.toLowerCase().includes(q) ||
          e.designation.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q)
        );
      }

      return res.json({
        data: results,
        meta: {
          total: results.length,
          departments: Array.from(new Set(employees.map(e => e.department)))
        }
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error fetching employees list.' });
    }
  });

  // GET /api/employees/:id (admin, or self if employee)
  app.get('/api/employees/:id', authenticate, (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const employee = db.findEmployeeById(id);
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found.' });
      }

      const currentUser = req.user!;
      if (currentUser.role !== 'admin' && employee.user_id !== currentUser.id) {
        return res.status(403).json({ error: 'Forbidden: You can only view your own employee profile.' });
      }

      const user = db.findUserById(employee.user_id);
      const payroll = db.getPayroll().find(p => p.employee_id === employee.id);
      const attendance = db.getAttendance().filter(a => a.employee_id === employee.id);
      const leaves = db.getLeaves().filter(l => l.employee_id === employee.id);

      return res.json({
        data: {
          ...employee,
          user: user ? {
            id: user.id,
            name: user.name,
            email: user.email,
            employee_code: user.employee_code,
            role: user.role
          } : null,
          payroll,
          attendance_history: attendance.slice(-14),
          leave_history: leaves
        }
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error fetching employee details.' });
    }
  });

  // PUT /api/employees/:id (self: phone, address, profile_picture only; admin: all)
  app.put('/api/employees/:id', authenticate, (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const employee = db.findEmployeeById(id);
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found.' });
      }

      const currentUser = req.user!;
      const isSelf = employee.user_id === currentUser.id;
      const isAdmin = currentUser.role === 'admin';

      if (!isAdmin && !isSelf) {
        return res.status(403).json({ error: 'Forbidden: You cannot edit another employee.' });
      }

      let updates: Partial<Employee> = {};

      if (!isAdmin && isSelf) {
        // Employee can ONLY touch phone, address, profile_picture
        const { phone, address, profile_picture } = req.body;
        if (phone !== undefined) updates.phone = phone;
        if (address !== undefined) updates.address = address;
        if (profile_picture !== undefined) updates.profile_picture = profile_picture;
      } else if (isAdmin) {
        // Admin can edit all fields
        const { phone, address, profile_picture, designation, department, joining_date, name } = req.body;
        if (phone !== undefined) updates.phone = phone;
        if (address !== undefined) updates.address = address;
        if (profile_picture !== undefined) updates.profile_picture = profile_picture;
        if (designation !== undefined) updates.designation = designation;
        if (department !== undefined) updates.department = department;
        if (joining_date !== undefined) updates.joining_date = joining_date;

        if (name && employee.user_id) {
          const u = db.findUserById(employee.user_id);
          if (u) {
            u.name = name;
            db.save();
          }
        }
      }

      const updated = db.updateEmployee(id, updates);
      return res.json({ data: updated });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error updating employee.' });
    }
  });

  // ==========================================
  // ATTENDANCE / TIME & PRESENCE ROUTES
  // ==========================================

  // POST /api/attendance/check-in (creates today's record; 409 if duplicate)
  app.post('/api/attendance/check-in', authenticate, (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const employee = db.findEmployeeByUserId(user.id);
      if (!employee) {
        return res.status(404).json({ error: 'Employee record not found for user.' });
      }

      const todayStr = new Date().toISOString().split('T')[0];
      const existing = db.getAttendance().find(a => a.employee_id === employee.id && a.date === todayStr);

      if (existing) {
        return res.status(409).json({ error: 'You have already checked in for today.' });
      }

      const nowIso = new Date().toISOString();
      const newRecord = db.addAttendance({
        employee_id: employee.id,
        date: todayStr,
        check_in: nowIso,
        check_out: null,
        status: 'present'
      });

      // Log event
      db.addTimelineEvent({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        title: `${user.name} clocked in`,
        description: `Workday started at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
        category: 'arrival',
        severity: 'normal'
      });

      return res.status(201).json({ data: newRecord });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error during check-in.' });
    }
  });

  // POST /api/attendance/check-out (updates today's record; 400 if no check-in or already checked out)
  app.post('/api/attendance/check-out', authenticate, (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const employee = db.findEmployeeByUserId(user.id);
      if (!employee) {
        return res.status(404).json({ error: 'Employee record not found.' });
      }

      const todayStr = new Date().toISOString().split('T')[0];
      const existing = db.getAttendance().find(a => a.employee_id === employee.id && a.date === todayStr);

      if (!existing || !existing.check_in) {
        return res.status(400).json({ error: 'No check-in record found for today. You must check in first.' });
      }

      if (existing.check_out) {
        return res.status(400).json({ error: 'You have already checked out for today.' });
      }

      const nowIso = new Date().toISOString();
      // Enforce checkout after checkin
      if (new Date(nowIso).getTime() <= new Date(existing.check_in).getTime()) {
        return res.status(400).json({ error: 'Check-out timestamp must be after check-in timestamp.' });
      }

      const updated = db.updateAttendance(existing.id, {
        check_out: nowIso
      });

      db.addTimelineEvent({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        title: `${user.name} clocked out`,
        description: `Completed shift at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
        category: 'milestone',
        severity: 'positive'
      });

      return res.json({ data: updated });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error during check-out.' });
    }
  });

  // GET /api/attendance (self: own with ?range=daily|weekly|all ; admin: all with ?employee_id=&date=)
  app.get('/api/attendance', authenticate, (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const { range, employee_id, date } = req.query;
      let records = db.getAttendance();
      const employees = db.getEmployees();
      const users = db.getUsers();

      if (user.role === 'employee') {
        const emp = db.findEmployeeByUserId(user.id);
        if (!emp) return res.status(404).json({ error: 'Employee profile not found.' });
        records = records.filter(a => a.employee_id === emp.id);

        if (range === 'daily') {
          const today = new Date().toISOString().split('T')[0];
          records = records.filter(a => a.date === today);
        } else if (range === 'weekly') {
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          const cutoff = oneWeekAgo.toISOString().split('T')[0];
          records = records.filter(a => a.date >= cutoff);
        }
      } else {
        // Admin
        if (employee_id && typeof employee_id === 'string' && employee_id !== 'all') {
          const eid = parseInt(employee_id, 10);
          records = records.filter(a => a.employee_id === eid);
        }
        if (date && typeof date === 'string' && date !== 'all') {
          records = records.filter(a => a.date === date);
        }
      }

      // Sort newest first
      records.sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);

      // Populate employee details
      const populated = records.map(r => {
        const emp = employees.find(e => e.id === r.employee_id);
        const u = emp ? users.find(usr => usr.id === emp.user_id) : null;
        return {
          ...r,
          employee: emp ? {
            id: emp.id,
            name: u?.name || 'Unknown',
            employee_code: u?.employee_code || 'EMP',
            department: emp.department,
            designation: emp.designation,
            profile_picture: emp.profile_picture
          } : null
        };
      });

      return res.json({
        data: populated,
        meta: {
          total: populated.length,
          present_count: populated.filter(p => p.status === 'present').length,
          half_day_count: populated.filter(p => p.status === 'half-day').length,
          leave_count: populated.filter(p => p.status === 'leave').length
        }
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error fetching attendance records.' });
    }
  });

  // GET /api/attendance/:employee_id (admin only, or self if id matches token)
  app.get('/api/attendance/:employee_id', authenticate, (req: AuthRequest, res) => {
    try {
      const eid = parseInt(req.params.employee_id, 10);
      const user = req.user!;
      const selfEmp = db.findEmployeeByUserId(user.id);

      if (user.role !== 'admin' && (!selfEmp || selfEmp.id !== eid)) {
        return res.status(403).json({ error: 'Forbidden: Access restricted.' });
      }

      const records = db.getAttendance()
        .filter(a => a.employee_id === eid)
        .sort((a, b) => b.date.localeCompare(a.date));

      return res.json({ data: records });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error fetching employee attendance.' });
    }
  });

  // ==========================================
  // LEAVES / TIME AWAY ROUTES
  // ==========================================

  // POST /api/leaves (employee creates; validates dates, no overlap with pending/approved)
  app.post('/api/leaves', authenticate, (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const emp = db.findEmployeeByUserId(user.id);
      if (!emp) {
        return res.status(404).json({ error: 'Employee record not found.' });
      }

      const { leave_type, start_date, end_date, reason } = req.body;

      if (!leave_type || !start_date || !end_date || !reason) {
        return res.status(400).json({ error: 'All fields (leave_type, start_date, end_date, reason) are required.' });
      }

      if (!['paid', 'sick', 'unpaid'].includes(leave_type)) {
        return res.status(400).json({ error: 'Invalid leave type. Allowed: paid, sick, unpaid.' });
      }

      if (end_date < start_date) {
        return res.status(400).json({ error: 'End date must be greater than or equal to start date.' });
      }

      if (reason.trim().length < 5) {
        return res.status(400).json({ error: 'Please provide a descriptive reason (at least 5 characters).' });
      }

      // Check overlap with pending or approved leaves
      const existingLeaves = db.getLeaves().filter(l =>
        l.employee_id === emp.id &&
        (l.status === 'pending' || l.status === 'approved')
      );

      const hasOverlap = existingLeaves.some(l => {
        return (start_date <= l.end_date && end_date >= l.start_date);
      });

      if (hasOverlap) {
        return res.status(400).json({
          error: 'You already have an active or pending leave application covering this date range.'
        });
      }

      const newLeave = db.addLeave({
        employee_id: emp.id,
        leave_type,
        start_date,
        end_date,
        reason: reason.trim(),
        status: 'pending',
        admin_comment: null,
        created_at: new Date().toISOString()
      });

      db.addTimelineEvent({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        title: `Leave request submitted: ${user.name}`,
        description: `${leave_type.toUpperCase()} leave requested for ${start_date} to ${end_date}.`,
        category: 'leave',
        severity: 'attention'
      });

      return res.status(201).json({ data: newLeave });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error submitting leave application.' });
    }
  });

  // GET /api/leaves (self: own; admin: all with ?status=pending|approved|rejected|all)
  app.get('/api/leaves', authenticate, (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const { status } = req.query;
      let leaves = db.getLeaves();
      const employees = db.getEmployees();
      const users = db.getUsers();

      if (user.role === 'employee') {
        const emp = db.findEmployeeByUserId(user.id);
        if (!emp) return res.status(404).json({ error: 'Employee not found.' });
        leaves = leaves.filter(l => l.employee_id === emp.id);
      }

      if (status && typeof status === 'string' && status !== 'all') {
        leaves = leaves.filter(l => l.status === status);
      }

      // Sort newest created first
      leaves.sort((a, b) => b.created_at.localeCompare(a.created_at) || b.id - a.id);

      const populated = leaves.map(l => {
        const emp = employees.find(e => e.id === l.employee_id);
        const u = emp ? users.find(usr => usr.id === emp.user_id) : null;
        return {
          ...l,
          employee: emp ? {
            id: emp.id,
            name: u?.name || 'Unknown',
            employee_code: u?.employee_code || 'EMP',
            department: emp.department,
            designation: emp.designation,
            profile_picture: emp.profile_picture
          } : null
        };
      });

      return res.json({
        data: populated,
        meta: {
          total: populated.length,
          pending: populated.filter(p => p.status === 'pending').length,
          approved: populated.filter(p => p.status === 'approved').length,
          rejected: populated.filter(p => p.status === 'rejected').length
        }
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error retrieving leaves.' });
    }
  });

  // GET /api/leaves/:id
  app.get('/api/leaves/:id', authenticate, (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const leave = db.getLeaves().find(l => l.id === id);
      if (!leave) return res.status(404).json({ error: 'Leave request not found.' });

      const user = req.user!;
      const emp = db.findEmployeeById(leave.employee_id);
      if (user.role !== 'admin' && (!emp || emp.user_id !== user.id)) {
        return res.status(403).json({ error: 'Forbidden: Access restricted.' });
      }

      return res.json({ data: leave });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error fetching leave.' });
    }
  });

  // PUT /api/leaves/:id/approve (admin only)
  app.put('/api/leaves/:id/approve', authenticate, requireRole('admin'), (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { admin_comment } = req.body;
      const leave = db.getLeaves().find(l => l.id === id);
      if (!leave) return res.status(404).json({ error: 'Leave request not found.' });

      const updated = db.updateLeave(id, {
        status: 'approved',
        admin_comment: admin_comment ? admin_comment.trim() : 'Approved by People Operations.'
      });

      const emp = db.findEmployeeById(leave.employee_id);
      const u = emp ? db.findUserById(emp.user_id) : null;

      db.addTimelineEvent({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        title: `Leave Approved: ${u?.name || 'Employee'}`,
        description: `Approved ${leave.leave_type.toUpperCase()} leave (${leave.start_date} to ${leave.end_date}).`,
        category: 'leave',
        severity: 'positive'
      });

      return res.json({ data: updated });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error approving leave.' });
    }
  });

  // PUT /api/leaves/:id/reject (admin only)
  app.put('/api/leaves/:id/reject', authenticate, requireRole('admin'), (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { admin_comment } = req.body;
      const leave = db.getLeaves().find(l => l.id === id);
      if (!leave) return res.status(404).json({ error: 'Leave request not found.' });

      if (!admin_comment || admin_comment.trim().length === 0) {
        return res.status(400).json({ error: 'Admin comment explaining the rejection is required.' });
      }

      const updated = db.updateLeave(id, {
        status: 'rejected',
        admin_comment: admin_comment.trim()
      });

      const emp = db.findEmployeeById(leave.employee_id);
      const u = emp ? db.findUserById(emp.user_id) : null;

      db.addTimelineEvent({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        title: `Leave Rejected: ${u?.name || 'Employee'}`,
        description: `Reason: ${admin_comment.trim()}`,
        category: 'leave',
        severity: 'attention'
      });

      return res.json({ data: updated });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error rejecting leave.' });
    }
  });

  // ==========================================
  // PAYROLL / MY PAY ROUTES
  // ==========================================

  // GET /api/payroll (self: own; admin: all)
  app.get('/api/payroll', authenticate, (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const payrolls = db.getPayroll();
      const employees = db.getEmployees();
      const users = db.getUsers();

      if (user.role === 'employee') {
        const emp = db.findEmployeeByUserId(user.id);
        if (!emp) return res.status(404).json({ error: 'Employee not found.' });
        const p = payrolls.find(pay => pay.employee_id === emp.id);
        return res.json({
          data: p ? [{
            ...p,
            employee: {
              id: emp.id,
              name: user.name,
              employee_code: user.employee_code,
              department: emp.department,
              designation: emp.designation
            }
          }] : []
        });
      }

      // Admin - all
      const populated = payrolls.map(p => {
        const emp = employees.find(e => e.id === p.employee_id);
        const u = emp ? users.find(usr => usr.id === emp.user_id) : null;
        return {
          ...p,
          employee: emp ? {
            id: emp.id,
            name: u?.name || 'Unknown',
            employee_code: u?.employee_code || 'EMP',
            department: emp.department,
            designation: emp.designation,
            joining_date: emp.joining_date
          } : null
        };
      });

      const totalDisbursement = populated.reduce((sum, p) => sum + p.net_salary, 0);

      return res.json({
        data: populated,
        meta: {
          total_employees: populated.length,
          total_monthly_disbursement: totalDisbursement,
          currency: 'INR'
        }
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error retrieving payroll data.' });
    }
  });

  // GET /api/payroll/:employee_id
  app.get('/api/payroll/:employee_id', authenticate, (req: AuthRequest, res) => {
    try {
      const eid = parseInt(req.params.employee_id, 10);
      const user = req.user!;
      const selfEmp = db.findEmployeeByUserId(user.id);

      if (user.role !== 'admin' && (!selfEmp || selfEmp.id !== eid)) {
        return res.status(403).json({ error: 'Forbidden: Access restricted.' });
      }

      const p = db.getPayroll().find(pay => pay.employee_id === eid);
      if (!p) return res.status(404).json({ error: 'Payroll record not found for this employee.' });

      return res.json({ data: p });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error fetching employee payroll.' });
    }
  });

  // PUT /api/payroll/:employee_id (admin only; recomputes net_salary server-side)
  app.put('/api/payroll/:employee_id', authenticate, requireRole('admin'), (req: AuthRequest, res) => {
    try {
      const eid = parseInt(req.params.employee_id, 10);
      const { basic_salary, allowances, deductions } = req.body;

      if (basic_salary === undefined || basic_salary < 0) {
        return res.status(400).json({ error: 'basic_salary must be a non-negative number.' });
      }

      const validAllowances = Math.max(0, Number(allowances) || 0);
      const validDeductions = Math.max(0, Number(deductions) || 0);
      const basic = Number(basic_salary);

      const updated = db.setPayroll({
        employee_id: eid,
        basic_salary: basic,
        allowances: validAllowances,
        deductions: validDeductions,
        net_salary: basic + validAllowances - validDeductions,
        updated_at: new Date().toISOString()
      });

      const emp = db.findEmployeeById(eid);
      const u = emp ? db.findUserById(emp.user_id) : null;

      db.addTimelineEvent({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        title: `Compensation Updated: ${u?.name || 'Employee'}`,
        description: `New monthly net compensation set to ₹${updated.net_salary.toLocaleString('en-IN')}`,
        category: 'payroll',
        severity: 'positive'
      });

      return res.json({ data: updated });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error updating payroll.' });
    }
  });

  // ==========================================
  // DASHBOARDS & FLOW INTELLIGENCE
  // ==========================================

  // GET /api/dashboard/employee (Aggregated for "My Day")
  app.get('/api/dashboard/employee', authenticate, (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const emp = db.findEmployeeByUserId(user.id);
      if (!emp) return res.status(404).json({ error: 'Employee not found.' });

      const todayStr = new Date().toISOString().split('T')[0];
      const todayAtt = db.getAttendance().find(a => a.employee_id === emp.id && a.date === todayStr);

      // Determine state: NOT STARTED, WORKING, CHECKED OUT, LEAVE
      let work_state: 'NOT STARTED' | 'WORKING' | 'CHECKED OUT' | 'LEAVE' = 'NOT STARTED';
      if (todayAtt) {
        if (todayAtt.status === 'leave') work_state = 'LEAVE';
        else if (todayAtt.check_out) work_state = 'CHECKED OUT';
        else if (todayAtt.check_in) work_state = 'WORKING';
      }

      // Check if active leave today
      const todayLeave = db.getLeaves().find(l =>
        l.employee_id === emp.id &&
        l.status === 'approved' &&
        todayStr >= l.start_date &&
        todayStr <= l.end_date
      );
      if (todayLeave) work_state = 'LEAVE';

      // Attendance history
      const allAtt = db.getAttendance().filter(a => a.employee_id === emp.id);
      const totalDays = allAtt.length || 1;
      const presentDays = allAtt.filter(a => a.status === 'present').length;
      const halfDays = allAtt.filter(a => a.status === 'half-day').length;
      const attendance_rate = Math.round(((presentDays + halfDays * 0.5) / totalDays) * 100);

      // Leave balances
      const allLeaves = db.getLeaves().filter(l => l.employee_id === emp.id);
      const paidApproved = allLeaves.filter(l => l.leave_type === 'paid' && l.status === 'approved').length;
      const sickApproved = allLeaves.filter(l => l.leave_type === 'sick' && l.status === 'approved').length;

      const leave_balance = {
        paid_total: 18,
        paid_used: paidApproved,
        paid_available: Math.max(0, 18 - paidApproved),
        sick_total: 10,
        sick_used: sickApproved,
        sick_available: Math.max(0, 10 - sickApproved)
      };

      // Payroll
      const payroll = db.getPayroll().find(p => p.employee_id === emp.id);

      // Recent Leaves
      const recent_leaves = allLeaves.slice(-5).reverse();

      // Recent Attendance
      const recent_attendance = allAtt.slice(-7).reverse();

      return res.json({
        data: {
          employee: {
            ...emp,
            name: user.name,
            email: user.email,
            employee_code: user.employee_code
          },
          today_attendance: todayAtt || null,
          work_state,
          attendance_rate,
          leave_balance,
          payroll,
          recent_leaves,
          recent_attendance
        }
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error generating employee dashboard.' });
    }
  });

  // GET /api/dashboard/admin (Aggregated for "Workforce Pulse")
  app.get('/api/dashboard/admin', authenticate, requireRole('admin'), (req: AuthRequest, res) => {
    try {
      const employees = db.getEmployees();
      const users = db.getUsers();
      const attendance = db.getAttendance();
      const leaves = db.getLeaves();
      const payrolls = db.getPayroll();
      const signals = db.getSignals();
      const timeline = db.getTimeline();

      const todayStr = new Date().toISOString().split('T')[0];
      const todayRecords = attendance.filter(a => a.date === todayStr);

      const totalEmployees = employees.length;
      const presentToday = todayRecords.filter(a => a.status === 'present').length;
      const checkedOutToday = todayRecords.filter(a => a.status === 'present' && a.check_out).length;
      const currentlyWorking = todayRecords.filter(a => a.status === 'present' && !a.check_out).length;
      const halfDayToday = todayRecords.filter(a => a.status === 'half-day').length;
      const onLeaveToday = leaves.filter(l => l.status === 'approved' && todayStr >= l.start_date && todayStr <= l.end_date).length;
      const notStartedToday = Math.max(0, totalEmployees - (presentToday + halfDayToday + onLeaveToday));

      const pendingLeaves = leaves.filter(l => l.status === 'pending');
      const totalMonthlyPayroll = payrolls.reduce((sum, p) => sum + p.net_salary, 0);

      // Department distribution
      const departments: Record<string, { total: number; present: number }> = {};
      employees.forEach(emp => {
        if (!departments[emp.department]) {
          departments[emp.department] = { total: 0, present: 0 };
        }
        departments[emp.department].total += 1;
        const isPres = todayRecords.some(a => a.employee_id === emp.id && a.status === 'present');
        if (isPres) departments[emp.department].present += 1;
      });

      const departmentBreakdown = Object.entries(departments).map(([dept, val]) => ({
        department: dept,
        total: val.total,
        present: val.present,
        rate: Math.round((val.present / (val.total || 1)) * 100)
      }));

      // Recent Leave Requests
      const recentPendingRequests = pendingLeaves.map(l => {
        const emp = employees.find(e => e.id === l.employee_id);
        const u = emp ? users.find(usr => usr.id === emp.user_id) : null;
        return {
          ...l,
          employee: {
            name: u?.name || 'Unknown',
            employee_code: u?.employee_code || 'EMP',
            department: emp?.department || '',
            designation: emp?.designation || '',
            profile_picture: emp?.profile_picture
          }
        };
      });

      return res.json({
        data: {
          pulse: {
            total_headcount: totalEmployees,
            present_today: presentToday,
            currently_working: currentlyWorking,
            checked_out_today: checkedOutToday,
            half_day_today: halfDayToday,
            on_leave_today: onLeaveToday,
            not_started_today: notStartedToday,
            presence_ratio_str: `${presentToday} / ${totalEmployees} active on-duty`,
            presence_percentage: Math.round((presentToday / (totalEmployees || 1)) * 100),
            pending_leave_approvals: pendingLeaves.length,
            total_monthly_payroll: totalMonthlyPayroll
          },
          department_breakdown: departmentBreakdown,
          pending_leave_queue: recentPendingRequests,
          signals,
          timeline: timeline.slice(0, 10)
        }
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error generating admin workforce pulse.' });
    }
  });

  // GET /api/flow-intelligence (Explainable signals)
  app.get('/api/flow-intelligence', authenticate, (req: AuthRequest, res) => {
    try {
      const signals = db.getSignals();
      return res.json({ data: signals });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error retrieving flow signals.' });
    }
  });

  // GET /api/workforce-timeline
  app.get('/api/workforce-timeline', authenticate, (req: AuthRequest, res) => {
    try {
      const timeline = db.getTimeline();
      return res.json({ data: timeline });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error retrieving workforce timeline.' });
    }
  });

  // POST /api/admin/reset-db (Instant reset for test/review ease)
  app.post('/api/admin/reset-db', (req, res) => {
    db.resetDatabase();
    return res.json({ message: 'Database reset to clean initial seed data successfully.' });
  });

  // ==========================================
  // VITE / STATIC SERVING
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Dayflow HRMS Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
