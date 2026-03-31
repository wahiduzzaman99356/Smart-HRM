/**
 * navConfig.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for the entire sidebar navigation tree.
 * Maps every HRIS module and sub-feature to a route path.
 */

import type { ReactElement } from 'react';
import {
  // ── Module-level icons ───────────────────────────────────────────────────
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
  // ── Sub-item icons ───────────────────────────────────────────────────────
  ApartmentOutlined,
  UserOutlined,
  FileAddOutlined,
  FileTextOutlined,
  SafetyOutlined,
  NotificationOutlined,
  FolderOpenOutlined,
  FileSearchOutlined,
  GlobalOutlined,
  NodeIndexOutlined,
  ControlOutlined,
  EyeOutlined,
  CheckSquareOutlined,
  PieChartOutlined,
  TrophyOutlined,
  QuestionCircleOutlined,
  SwapOutlined,
  FormOutlined,
  CheckCircleOutlined,
  DashboardOutlined,
  FieldTimeOutlined,
  CalendarOutlined,
  FileProtectOutlined,
  MessageOutlined,
  BankOutlined,
  GiftOutlined,
  SafetyCertificateOutlined,
  WalletOutlined,
  CompassOutlined,
  ScheduleOutlined,
  InboxOutlined,
  ReconciliationOutlined,
  AuditOutlined,
  StarOutlined,
  AlertOutlined,
  TagsOutlined,
  SlidersOutlined,
  UsergroupAddOutlined,
  SunOutlined,
  EditOutlined,
  ThunderboltOutlined,
  DollarCircleOutlined,
  PauseCircleOutlined,
  MinusCircleOutlined,
  HistoryOutlined,
  AccountBookOutlined,
  AreaChartOutlined,
  ToolOutlined,
  PartitionOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  CreditCardOutlined,
  LaptopOutlined,
  PaperClipOutlined,
  LinkOutlined,
  AimOutlined,
  FundOutlined,
  BookOutlined,
  CheckOutlined,
  ExportOutlined,
  FileDoneOutlined,
  ClearOutlined,
  CommentOutlined,
  ProfileOutlined,
  MobileOutlined,
  CarOutlined,
  BranchesOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';

export interface NavSubItem {
  /** Used as both the menu `key` and the navigation target path (leaf) or sub-menu identifier (parent). */
  key: string;
  label: string;
  icon?: ReactElement;
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
      { key: '/core-hr/organogram',         icon: <ApartmentOutlined />,       label: 'Organogram' },
      { key: '/core-hr/employees',          icon: <UserOutlined />,            label: 'My Employees' },
      { key: '/core-hr/manpower-headcount', icon: <BarChartOutlined />,        label: 'Manpower Headcount' },
      { key: '/core-hr/requisition',        icon: <FileAddOutlined />,         label: 'Manpower Requisition' },
      { key: '/core-hr/templates',          icon: <FileTextOutlined />,        label: 'HR Template Creation' },
      { key: '/core-hr/policies',           icon: <SafetyOutlined />,          label: 'Policy Management' },
      { key: '/core-hr/notices',            icon: <NotificationOutlined />,    label: 'Notice & Announcement' },
    ],
  },

  // ── 2. Recruitment & ATS ─────────────────────────────────────────────────────
  {
    key: 'recruitment',
    label: 'Recruitment & ATS',
    icon: <SolutionOutlined />,
    children: [
      { key: '/recruitment/cv-bank',                      icon: <FolderOpenOutlined />,       label: 'CV Bank' },
      { key: '/recruitment/job-postings',                 icon: <FileSearchOutlined />,       label: 'Job Posting' },
      { key: '/recruitment/job-portal',                   icon: <GlobalOutlined />,           label: 'Job Portal Integration' },
      { key: '/recruitment/pipelines',                    icon: <NodeIndexOutlined />,        label: 'Pipeline' },
      { key: '/recruitment/assessment-configuration',     icon: <ControlOutlined />,          label: 'Assessment Configuration' },
      { key: '/recruitment/talent-tracking',              icon: <EyeOutlined />,              label: 'Talent Tracking' },
      { key: '/recruitment/evaluation',                   icon: <CheckSquareOutlined />,      label: 'Assessment Evaluation Management' },
      { key: '/recruitment/assessment-results-overview',  icon: <PieChartOutlined />,         label: 'Assessment Results Overview' },
      { key: '/recruitment/offers',                       icon: <TrophyOutlined />,           label: 'Offer Management & Hiring' },
      { key: '/core-hr/question-bank',                    icon: <QuestionCircleOutlined />,   label: 'Question Bank Management' },
    ],
  },

  // ── 3. Onboarding ─────────────────────────────────────────────────────────────
  {
    key: 'onboarding',
    label: 'Onboarding',
    icon: <UserAddOutlined />,
    children: [
      { key: '/onboarding/candidate-to-employee', icon: <SwapOutlined />,        label: 'Candidate to Employee' },
      { key: '/onboarding/self-service',          icon: <FormOutlined />,        label: 'Self-Service Pre-Work' },
      { key: '/onboarding/confirmation',          icon: <CheckCircleOutlined />, label: 'Confirmation' },
    ],
  },

  // ── 4. Employee Self Service (ESS) ────────────────────────────────────────────
  {
    key: 'ess',
    label: 'Self Service',
    icon: <IdcardOutlined />,
    children: [
      { key: '/ess/dashboard',          icon: <DashboardOutlined />,         label: 'ESS Dashboard' },
      { key: '/ess/attendance',         icon: <FieldTimeOutlined />,         label: 'Attendance' },
      { key: '/ess/leave',              icon: <CalendarOutlined />,          label: 'Leave' },
      { key: '/ess/apply-for-document', icon: <FileProtectOutlined />,       label: 'Apply for Document' },
      { key: '/ess/reach-hr',           icon: <MessageOutlined />,           label: 'Reach HR' },
      { key: '/ess/loan-management',    icon: <BankOutlined />,              label: 'Loan Management' },
      { key: '/ess/foc',                icon: <GiftOutlined />,              label: 'FOC' },
      { key: '/ess/pf',                 icon: <SafetyCertificateOutlined />, label: 'Provident Fund' },
      { key: '/ess/gf',                 icon: <WalletOutlined />,            label: 'GF' },
      { key: '/ess/outstation',         icon: <CompassOutlined />,           label: 'Out Station' },
      { key: '/ess/my-shift',           icon: <ScheduleOutlined />,          label: 'My Shift' },
      { key: '/ess/demand',             icon: <InboxOutlined />,             label: 'Demand' },
      { key: '/ess/my-cases',           icon: <ReconciliationOutlined />,    label: 'My Complaints' },
    ],
  },

  // ── 5. Employee Relationship ──────────────────────────────────────────────────
  {
    key: 'employee-relations',
    label: 'Employee Relationship',
    icon: <HeartOutlined />,
    children: [
      {
        key: 'employee-relations-disciplinary',
        icon: <AlertOutlined />,
        label: 'Disciplinary Actions',
        children: [
          { key: '/employee-relations/disciplinary/conflict-resolution', icon: <ReconciliationOutlined />, label: 'Conflict Resolution Tracker' },
          { key: '/employee-relations/disciplinary/compliance-tracker',  icon: <AuditOutlined />,          label: 'Compliance' },
        ],
      },
      { key: '/employee-relations/surveys',     icon: <FormOutlined />,  label: 'Surveys' },
      { key: '/employee-relations/recognition', icon: <StarOutlined />,  label: 'Recognition & Rewards' },
    ],
  },

  // ── 6. Attendance, Adjustment & Leave ────────────────────────────────────────
  {
    key: 'attendance',
    label: 'Attendance & Leave',
    icon: <ClockCircleOutlined />,
    children: [
      { key: '/attendance/time-capture', icon: <FieldTimeOutlined />, label: 'Time Capture & Validation' },
      { key: '/attendance/outstation',   icon: <CompassOutlined />,   label: 'Outstation / Movement' },
      {
        key: 'attendance-leave-management',
        icon: <CalendarOutlined />,
        label: 'Leave Management',
        children: [
          { key: '/attendance/leave/leave-types',                label: 'Leave Types',                icon: <TagsOutlined /> },
          { key: '/attendance/leave/leave-policy-configuration', label: 'Leave Policy Configuration', icon: <SlidersOutlined /> },
          { key: '/attendance/leave/holiday-group',              label: 'Holiday Group',              icon: <SunOutlined /> },
          { key: '/attendance/leave/assign-holiday-group',       label: 'Assign Holiday Group',       icon: <UsergroupAddOutlined /> },
        ],
      },
      {
        key: 'attendance-master-shift-engine',
        icon: <ClockCircleOutlined />,
        label: 'Master Shift Engine',
        children: [
          { key: '/attendance/master-shift-engine/shift-configuration', label: 'Shift Configuration', icon: <SettingOutlined /> },
          { key: '/attendance/master-shift-engine/assign-shift',        label: 'Assign Shift',        icon: <ScheduleOutlined /> },
        ],
      },
      { key: '/attendance/adjustments', icon: <EditOutlined />, label: 'Adjustment' },
    ],
  },

  // ── 7. Payroll & Compensation & Benefits ──────────────────────────────────────
  {
    key: 'payroll',
    label: 'Payroll',
    icon: <DollarOutlined />,
    children: [
      {
        key: 'payroll-generation',
        icon: <ThunderboltOutlined />,
        label: 'Generation',
        children: [
          { key: '/payroll/salary-generation', icon: <DollarCircleOutlined />, label: 'Salary Generation' },
          { key: '/payroll/bonus-generation',  icon: <GiftOutlined />,         label: 'Bonus Generation' },
        ],
      },
      {
        key: 'payroll-salary',
        icon: <AccountBookOutlined />,
        label: 'Salary',
        children: [
          { key: '/payroll/salary/current-approval', icon: <CheckCircleOutlined />,  label: 'Current Salary Approval' },
          { key: '/payroll/salary/hold',             icon: <PauseCircleOutlined />,  label: 'Hold Salary' },
          { key: '/payroll/salary/separated',        icon: <MinusCircleOutlined />,  label: 'Separated Salary' },
          { key: '/payroll/salary/history',          icon: <HistoryOutlined />,      label: 'History' },
        ],
      },
      { key: '/payroll/rate-of-exchange', icon: <SwapOutlined />, label: 'Rate of Exchange' },
      {
        key: 'payroll-bonus',
        icon: <StarOutlined />,
        label: 'Bonus',
        children: [
          { key: '/payroll/bonus/current-approval', icon: <CheckCircleOutlined />, label: 'Current Bonus Approval' },
          { key: '/payroll/bonus/hold',             icon: <PauseCircleOutlined />, label: 'Hold Bonus' },
          { key: '/payroll/bonus/separated',        icon: <MinusCircleOutlined />, label: 'Separated Bonus' },
          { key: '/payroll/bonus/history',          icon: <HistoryOutlined />,     label: 'History' },
        ],
      },
      { key: '/payroll/reports', icon: <AreaChartOutlined />, label: 'Reports' },
      {
        key: 'payroll-configuration',
        icon: <ToolOutlined />,
        label: 'Configuration',
        children: [
          { key: '/payroll/configuration/salary-structure',      icon: <PartitionOutlined />,    label: 'Salary Structure' },
          { key: '/payroll/configuration/salary-rules',          icon: <OrderedListOutlined />,  label: 'Salary Rules' },
          { key: '/payroll/configuration/cash-salary-employees', icon: <UnorderedListOutlined />,label: 'Cash Salary Employee List' },
          { key: '/payroll/configuration/payment-accounts',      icon: <CreditCardOutlined />,   label: 'Payment Account' },
        ],
      },
    ],
  },

  // ── 8. Asset Management ───────────────────────────────────────────────────────
  {
    key: 'assets',
    label: 'Asset Management',
    icon: <DesktopOutlined />,
    children: [
      { key: '/assets/it-equipment', icon: <LaptopOutlined />,     label: 'IT Equipment' },
      { key: '/assets/stationery',   icon: <PaperClipOutlined />,  label: 'Stationery' },
      { key: '/assets/assign-asset', icon: <LinkOutlined />,       label: 'Assign Asset' },
    ],
  },

  // ── 9. Performance Management ─────────────────────────────────────────────────
  {
    key: 'performance',
    label: 'Performance Management',
    icon: <RiseOutlined />,
    children: [
      { key: '/performance/dashboard',          icon: <DashboardOutlined />,      label: 'Dashboard' },
      { key: '/performance/my-appraisal',       icon: <StarOutlined />,           label: 'My Appraisal' },
      { key: '/performance/main-kpi',           icon: <AimOutlined />,            label: 'Main KPI Areas' },
      { key: '/performance/sub-kpi-setup',      icon: <PartitionOutlined />,      label: 'Sub KPI Setup' },
      { key: '/performance/evaluation',         icon: <FormOutlined />,           label: 'Evaluation' },
      { key: '/performance/employee-kpi-view',  icon: <FundOutlined />,           label: 'Employee KPI View' },
      { key: '/performance/designation-matrix', icon: <ReconciliationOutlined />, label: 'Designation Matrix' },
      { key: '/performance/achievement-level',   icon: <TrophyOutlined />,         label: 'Achievement Level Setup' },
      { key: '/performance/appraisal-config',   icon: <SettingOutlined />,        label: 'Appraisal Configuration' },
    ],
  },

  // ── 10. Training & L&D ─────────────────────────────────────────────────────────
  {
    key: 'training',
    label: 'Training & L&D',
    icon: <ReadOutlined />,
    children: [
      { key: '/training/requisitions', icon: <FileAddOutlined />, label: 'Training Requisition' },
      { key: '/training/programs',     icon: <BookOutlined />,    label: 'Program Creation' },
      { key: '/training/approval',     icon: <CheckOutlined />,   label: 'Approval' },
    ],
  },

  // ── 11. Employee Separation / Offboarding ─────────────────────────────────────
  {
    key: 'offboarding',
    label: 'Offboarding',
    icon: <UserDeleteOutlined />,
    children: [
      { key: '/offboarding/my-resignation',      icon: <FormOutlined />,        label: 'My Resignation' },
      { key: '/offboarding/separation-requests', icon: <ExportOutlined />,      label: 'Separation Requests' },
      { key: '/offboarding/clearance',           icon: <ClearOutlined />,       label: 'Clearance Management' },
      { key: '/offboarding/final-settlement',    icon: <FileDoneOutlined />,    label: 'Final Settlement' },
      { key: '/offboarding/exit-interview',      icon: <CommentOutlined />,     label: 'Exit Interview' },
      { key: '/offboarding/separation-policy',   icon: <ProfileOutlined />,     label: 'Separation Policy' },
    ],
  },

  // ── 12. System Administration ─────────────────────────────────────────────────
  {
    key: 'system-admin',
    label: 'System Administration',
    icon: <SettingOutlined />,
    children: [
      { key: '/system-admin/device-setup', icon: <MobileOutlined />,   label: 'Mobile / Device Setup' },
      { key: '/system-admin/fleet',        icon: <CarOutlined />,       label: 'Fleet' },
      { key: '/system-admin/workflows',    icon: <BranchesOutlined />,  label: 'Workflow & Approval Layer' },
    ],
  },

  // ── 13. Analytics & Reporting ─────────────────────────────────────────────────
  {
    key: 'analytics',
    label: 'Analytics & Reporting',
    icon: <BarChartOutlined />,
    children: [
      { key: '/analytics/system-logs',     icon: <FileSearchOutlined />, label: 'System Log' },
      { key: '/analytics/employee-master', icon: <DatabaseOutlined />,   label: 'Employee Master Data' },
    ],
  },

];
