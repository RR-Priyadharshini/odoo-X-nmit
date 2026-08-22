import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute.js';
import { EmployeeLayout } from '../layouts/EmployeeLayout.js';
import { AdminLayout } from '../layouts/AdminLayout.js';

// Auth Pages
import { Login } from '../pages/auth/Login.js';
import { Register } from '../pages/auth/Register.js';

// Employee Pages
import { MyDay } from '../pages/employee/MyDay.js';
import { TimePresence } from '../pages/employee/TimePresence.js';
import { TimeAway } from '../pages/employee/TimeAway.js';
import { MyPay } from '../pages/employee/MyPay.js';
import { Profile } from '../pages/employee/Profile.js';

// Admin Pages
import { WorkforcePulse } from '../pages/admin/WorkforcePulse.js';
import { FlowIntelligenceView } from '../pages/admin/FlowIntelligenceView.js';
import { LeaveApprovals } from '../pages/admin/LeaveApprovals.js';
import { EmployeesDirectory } from '../pages/admin/EmployeesDirectory.js';
import { EmployeeDetailView } from '../pages/admin/EmployeeDetailView.js';
import { AttendanceManager } from '../pages/admin/AttendanceManager.js';
import { PayrollManager } from '../pages/admin/PayrollManager.js';
import { PatternsReports } from '../pages/admin/PatternsReports.js';

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Employee Routes (Protected, role: employee or admin) */}
      <Route
        path="/employee"
        element={
          <ProtectedRoute>
            <EmployeeLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="my-day" replace />} />
        <Route path="my-day" element={<MyDay />} />
        <Route path="attendance" element={<TimePresence />} />
        <Route path="leaves" element={<TimeAway />} />
        <Route path="payroll" element={<MyPay />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Admin Routes (Protected, role: admin only) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="pulse" replace />} />
        <Route path="pulse" element={<WorkforcePulse />} />
        <Route path="intelligence" element={<FlowIntelligenceView />} />
        <Route path="leave-approvals" element={<LeaveApprovals />} />
        <Route path="employees" element={<EmployeesDirectory />} />
        <Route path="employees/:id" element={<EmployeeDetailView />} />
        <Route path="attendance" element={<AttendanceManager />} />
        <Route path="payroll" element={<PayrollManager />} />
        <Route path="patterns" element={<PatternsReports />} />
      </Route>

      {/* Default fallback route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
