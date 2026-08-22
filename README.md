# Dayflow — Human Resource Management System (HRMS)
> *"Every workday, perfectly aligned."*

Dayflow is a modern, full-stack Workforce Operating System designed to replace fragmented legacy HR dashboards with an intentional, timeline-driven workspace and explainable operational signals (**Flow Intelligence**).

---

## 🚀 Key Features

### 1. Employee Experience ("My Day")
- **Work State & Day Flow**: Prominent work progression tracker (`NOT STARTED` → `WORKING` → `CHECKED OUT` or `ON LEAVE`).
- **Time & Presence**: Live punch-in and clock-out with server-validated timestamps, duration calculation, and daily/weekly history logs.
- **Time Away (Leaves)**: Self-service leave applications with date-range validation, real-time balance checks (Paid, Sick, Unpaid), and manager feedback.
- **My Pay (Compensation)**: Monthly salary breakdown (Basic, HRA/Allowances, PF & TDS deductions) in INR (₹) with exportable payslip view.
- **Member Profile**: Official job information and self-service editable contact fields.

### 2. Admin & HR Experience ("Workforce Pulse")
- **Workforce Pulse**: Real-time operating dashboard displaying live active headcount, presence percentage, department presence distribution, and immediate attention areas.
- **Flow Intelligence**: Explainable HR heuristics and operational signals with drill-down *"Why am I seeing this?"* evidence inspectors.
- **Leave Approvals Queue**: Priority decision queue with one-click approve/reject actions and mandatory audit comments.
- **Employee Directory**: Searchable workforce roster, department filter, and multi-field member creation modal (Auth credentials + Profile + Compensation).
- **Employee Detail Inspector**: Comprehensive 360° profile view, attendance logs, leave records, and compensation package adjustment.
- **Payroll & Compensation Engine**: Company-wide payroll budgeting, base/allowance/deduction distributions, and salary structure editor.
- **Patterns & Reports**: Visual workforce analytics powered by interactive charts (Presence velocity, Department capacity, Leave usage).

---

## 🔑 Demo Accounts & Credentials

| Persona | Name | Role | Email | Password |
| :--- | :--- | :--- | :--- | :--- |
| **Admin / Head of HR** | Aditi Rao | `admin` | `admin@dayflow.com` | `Admin@123` |
| **Sr. Backend Engineer** | Aarav Sharma | `employee` | `aarav@dayflow.com` | `Employee@123` |
| **Lead Product Designer** | Priya Patel | `employee` | `priya@dayflow.com` | `Employee@123` |
| **Sales Executive** | Rohit Verma | `employee` | `rohit@dayflow.com` | `Employee@123` |
| **HR Operations Partner** | Ananya Iyer | `employee` | `ananya@dayflow.com` | `Employee@123` |

> 💡 **Quick Switch**: Use the **"Switch Persona"** dropdown in the top bar or click any 1-click login card on the sign-in screen to instantly switch accounts without typing.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Recharts, React Router v7
- **Backend API**: Node.js, Express, TypeScript (`tsx`)
- **Database & Storage**: JSON file database (`dayflow.db.json`) with auto-seeding and transactional write operations
- **Authentication**: JWT tokens stored securely with role-based access control (`admin`, `employee`) and bcrypt password hashing
- **Formatting**: Localized Indian Rupee formatting (`₹ Lakhs / Crores`) and ISO date formatting

---

## 🔄 Resetting Demo Data
To restore the initial database state at any time, click **"Reset Demo Data"** in the top bar or send a `POST` request to `/api/admin/reset-db`.
