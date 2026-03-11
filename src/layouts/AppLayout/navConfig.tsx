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
  IdcardOutlined,
} from '@ant-design/icons';

export interface NavSubItem {
  /** Used as both the menu `key` and the navigation target path (leaf) or sub-menu identifier (parent). */
  key: string;
  label: string;
  /** If present, this item renders as a collapsible sub-menu rather than a leaf route. */
  children?: NavSubItem[];
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
    label: 'Core HR Functions',
    icon: <TeamOutlined />,
    children: [
      { key: '/core-hr/organogram',          label: 'Organogram' },
      { key: '/core-hr/employees',           label: 'My Employees' },
      { key: '/core-hr/manpower-headcount',  label: 'Manpower Headcount' },
      { key: '/core-hr/requisition',         label: 'Manpower Requisition' },
      { key: '/core-hr/templates',   label: 'HR Template Creation' },
      { key: '/core-hr/policies',    label: 'Policy Management' },
      { key: '/core-hr/notices',          label: 'Notice & Announcement' },
      { key: '/core-hr/question-bank',    label: 'Question Bank Management' },
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

  // ── 4. Employee Self Service (ESS) ────────────────────────────────────────────
  {
    key: 'ess',
    label: 'Self Service',
    icon: <IdcardOutlined />,
    children: [
      { key: '/ess/dashboard',          label: 'Dashboard' },
      { key: '/ess/attendance',         label: 'Attendance' },
      { key: '/ess/leave',              label: 'Leave' },
      { key: '/ess/apply-for-document', label: 'Apply for Document' },
      { key: '/ess/reach-hr',           label: 'Reach HR' },
      { key: '/ess/loan-management',    label: 'Loan Management' },
      { key: '/ess/foc',                label: 'FOC' },
      { key: '/ess/pf',                 label: 'Provident Fund' },
      { key: '/ess/gf',                 label: 'GF' },
      { key: '/ess/outstation',         label: 'Out Station' },
      { key: '/ess/my-shift',           label: 'My Shift' },
      { key: '/ess/demand',             label: 'Demand' },
    ],
  },

  // ── 5. Employee Relationship ──────────────────────────────────────────────────
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
    label: 'Payroll',
    icon: <DollarOutlined />,
    children: [
      {
        key: 'payroll-generation',
        label: 'Generation',
        children: [
          { key: '/payroll/salary-generation', label: 'Salary Generation' },
          { key: '/payroll/bonus-generation',  label: 'Bonus Generation' },
        ],
      },
      {
        key: 'payroll-salary',
        label: 'Salary',
        children: [
          { key: '/payroll/salary/current-approval', label: 'Current Salary Approval' },
          { key: '/payroll/salary/hold',             label: 'Hold Salary' },
          { key: '/payroll/salary/separated',        label: 'Separated Salary' },
          { key: '/payroll/salary/history',          label: 'History' },
        ],
      },
      { key: '/payroll/rate-of-exchange', label: 'Rate of Exchange' },
      {
        key: 'payroll-bonus',
        label: 'Bonus',
        children: [
          { key: '/payroll/bonus/current-approval', label: 'Current Bonus Approval' },
          { key: '/payroll/bonus/hold',             label: 'Hold Bonus' },
          { key: '/payroll/bonus/separated',        label: 'Separated Bonus' },
          { key: '/payroll/bonus/history',          label: 'History' },
        ],
      },
      { key: '/payroll/reports', label: 'Reports' },
      {
        key: 'payroll-configuration',
        label: 'Configuration',
        children: [
          { key: '/payroll/configuration/salary-structure',        label: 'Salary Structure' },
          { key: '/payroll/configuration/salary-rules',            label: 'Salary Rules' },
          { key: '/payroll/configuration/cash-salary-employees',   label: 'Cash Salary Employee List' },
          { key: '/payroll/configuration/payment-accounts',        label: 'Payment Account' },
        ],
      },
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
      { key: '/assets/assign-asset', label: 'Assign Asset' },
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
