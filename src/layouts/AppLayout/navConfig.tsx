/**
 * navConfig.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for the entire sidebar navigation tree.
 * Maps every HRIS module and sub-feature to a route path.
 */

import type { ReactElement } from 'react';
import {
  TeamOutlined,
  SolutionOutlined,
  UserAddOutlined,
  HeartOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  DesktopOutlined,
  RiseOutlined,
  ReadOutlined,
  UserDeleteOutlined,
  SettingOutlined,
  BarChartOutlined,
} from '@ant-design/icons';

export interface NavSubItem {
  /** Used as both the menu `key` and the navigation target path. */
  key: string;
  label: string;
}

export interface NavModule {
  key: string;
  label: string;
  icon: ReactElement;
  children: NavSubItem[];
}

export const NAV_MODULES: NavModule[] = [
  // ── 1. Core HR & Employee Data Management ───────────────────────────────────
  {
    key: 'core-hr',
    label: 'Core HR & Employee',
    icon: <TeamOutlined />,
    children: [
      { key: '/core-hr/organogram',          label: 'Organogram' },
      { key: '/core-hr/employees',           label: 'Employee Management & Life-Cycle' },
      { key: '/core-hr/manpower-headcount',  label: 'Manpower Headcount' },
      { key: '/core-hr/requisition',         label: 'Manpower Requisition' },
      { key: '/core-hr/templates',   label: 'HR Template Creation' },
      { key: '/core-hr/policies',    label: 'Policy Management' },
      { key: '/core-hr/notices',     label: 'Notice & Announcement' },
    ],
  },

  // ── 2. Recruitment & ATS ─────────────────────────────────────────────────────
  {
    key: 'recruitment',
    label: 'Recruitment & ATS',
    icon: <SolutionOutlined />,
    children: [
      { key: '/recruitment/cv-bank',              label: 'CV Bank' },
      { key: '/recruitment/job-postings',         label: 'Job Posting' },
      { key: '/recruitment/job-portal',           label: 'Job Portal Integration' },
      { key: '/recruitment/sourcing',             label: 'Sourcing & Candidate Pipeline' },
      { key: '/recruitment/candidates',           label: 'Intelligent Candidate Processing' },
      { key: '/recruitment/shortlisting',         label: 'Shortlisting' },
      { key: '/recruitment/assessment',           label: 'Assessment & Interview' },
      { key: '/recruitment/evaluation',           label: 'Evaluation' },
      { key: '/recruitment/offers',               label: 'Offer Management & Hiring' },
    ],
  },

  // ── 3. Onboarding ─────────────────────────────────────────────────────────────
  {
    key: 'onboarding',
    label: 'Onboarding',
    icon: <UserAddOutlined />,
    children: [
      { key: '/onboarding/candidate-to-employee', label: 'Candidate to Employee' },
      { key: '/onboarding/self-service',          label: 'Self-Service Pre-Work' },
      { key: '/onboarding/confirmation',          label: 'Confirmation' },
    ],
  },

  // ── 4. Employee Relationship ──────────────────────────────────────────────────
  {
    key: 'employee-relations',
    label: 'Employee Relationship',
    icon: <HeartOutlined />,
    children: [
      { key: '/employee-relations/compliance',    label: 'Compliance' },
      { key: '/employee-relations/investigation', label: 'Investigation' },
      { key: '/employee-relations/surveys',       label: 'Surveys' },
      { key: '/employee-relations/recognition',   label: 'Recognition & Rewards' },
    ],
  },

  // ── 5. Attendance, Adjustment & Leave ────────────────────────────────────────
  {
    key: 'attendance',
    label: 'Attendance & Leave',
    icon: <ClockCircleOutlined />,
    children: [
      { key: '/attendance/time-capture', label: 'Time Capture & Validation' },
      { key: '/attendance/outstation',   label: 'Outstation / Movement' },
      { key: '/attendance/leave',        label: 'Leave Management' },
      { key: '/attendance/scheduling',   label: 'Scheduling & Roster' },
      { key: '/attendance/adjustments',  label: 'Adjustment' },
    ],
  },

  // ── 6. Payroll & Compensation & Benefits ──────────────────────────────────────
  {
    key: 'payroll',
    label: 'Payroll & C&B',
    icon: <DollarOutlined />,
    children: [
      { key: '/payroll/salary-generation',   label: 'Salary Generation' },
      { key: '/payroll/bonus',               label: 'Bonus Generation' },
      { key: '/payroll/salary-certificate',  label: 'Salary Certificate' },
      { key: '/payroll/income-tax',          label: 'Income Tax' },
      { key: '/payroll/foc',                 label: 'FOC' },
      { key: '/payroll/provident-fund',      label: 'Provident Fund (PF)' },
      { key: '/payroll/gratuity-fund',       label: 'Gratuity Fund (GF)' },
      { key: '/payroll/medical-benefit',     label: 'Medical Benefit' },
      { key: '/payroll/meals',               label: 'Lunch / Meals' },
      { key: '/payroll/loans',               label: 'Loan Management' },
      { key: '/payroll/advances',            label: 'Advance' },
      { key: '/payroll/salary-settings',     label: 'Salary Settings' },
      { key: '/payroll/overtime',            label: 'Overtime' },
      { key: '/payroll/expense-application', label: 'Expense Application' },
      { key: '/payroll/payment-accounts',    label: 'Payment Account' },
    ],
  },

  // ── 7. Asset Management ───────────────────────────────────────────────────────
  {
    key: 'assets',
    label: 'Asset Management',
    icon: <DesktopOutlined />,
    children: [
      { key: '/assets/it-equipment', label: 'IT Equipment' },
      { key: '/assets/stationery',   label: 'Stationery' },
    ],
  },

  // ── 8. Performance Management ─────────────────────────────────────────────────
  {
    key: 'performance',
    label: 'Performance Management',
    icon: <RiseOutlined />,
    children: [
      { key: '/performance/goals-okr', label: 'Goals & Alignment (OKRs)' },
      { key: '/performance/kpi',       label: 'KPI' },
    ],
  },

  // ── 9. Training & L&D ─────────────────────────────────────────────────────────
  {
    key: 'training',
    label: 'Training & L&D',
    icon: <ReadOutlined />,
    children: [
      { key: '/training/requisitions', label: 'Training Requisition' },
      { key: '/training/programs',     label: 'Program Creation' },
      { key: '/training/approval',     label: 'Approval' },
    ],
  },

  // ── 10. Employee Separation / Offboarding ─────────────────────────────────────
  {
    key: 'offboarding',
    label: 'Offboarding',
    icon: <UserDeleteOutlined />,
    children: [
      { key: '/offboarding/separation', label: 'Separation' },
    ],
  },

  // ── 11. System Administration ─────────────────────────────────────────────────
  {
    key: 'system-admin',
    label: 'System Administration',
    icon: <SettingOutlined />,
    children: [
      { key: '/system-admin/device-setup', label: 'Mobile / Device Setup' },
      { key: '/system-admin/fleet',        label: 'Fleet' },
      { key: '/system-admin/workflows',    label: 'Workflow & Approval Layer' },
    ],
  },

  // ── 12. Analytics & Reporting ─────────────────────────────────────────────────
  {
    key: 'analytics',
    label: 'Analytics & Reporting',
    icon: <BarChartOutlined />,
    children: [
      { key: '/analytics/system-logs',     label: 'System Log' },
      { key: '/analytics/employee-master', label: 'Employee Master Data' },
    ],
  },
];
