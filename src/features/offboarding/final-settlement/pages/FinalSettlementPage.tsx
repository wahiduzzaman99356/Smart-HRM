import { Fragment, useMemo, useState } from 'react';
import {
  ApartmentOutlined,
  BarChartOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  DollarCircleOutlined,
  DownloadOutlined,
  DownOutlined,
  EditOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  FilterOutlined,
  PlusOutlined,
  ReloadOutlined,
  RightOutlined,
  SafetyOutlined,
  SearchOutlined,
  SendOutlined,
  TeamOutlined,
  UpOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar, Button, Col, Input, InputNumber, Modal,
  Progress, Row, Select, Space, message,
} from 'antd';
import type { ReactNode } from 'react';

// ─── Domain types ─────────────────────────────────────────────────────────────

type SettlementStage = 'Draft' | 'Under Review' | 'Approved' | 'Paid';
type SettlementStatus = SettlementStage | 'Disputed';
type AmountBand = '' | 'under-12000' | '12000-18000' | 'above-18000';

interface SettlementLineItem {
  label: string;
  amount: number;
}

interface SettlementRecord {
  id: string;
  empName: string;
  empId: string;
  department: string;
  designation: string;
  reason: string;
  tenure: string;
  lastWorkingDay: string;
  dateOfJoining: string;
  payables: SettlementLineItem[];
  deductions: SettlementLineItem[];
  status: SettlementStatus;
  preparedBy: string;
  checkedBy?: string;
  approvedBy?: string;
  resignationDetails?: ResignationDetails;
  clearanceReport?: ClearanceReport;
}

interface Filters {
  search: string;
  department: string;
  reason: string;
  amountBand: AmountBand;
}

interface EligibleEmployee {
  id: string;
  name: string;
  department: string;
  designation: string;
  reason: string;
  lastWorkingDay: string;
  noticePeriod: string;
  dateOfJoining: string;
  grossSalary: number;
  tenure: string;
}

type CardDetailTab = 'settlement' | 'resignation' | 'clearance';

interface ResignationDetails {
  requestId: string;
  employeeId: string;
  separationType: string;
  employmentStatus: string;
  resignationDate: string;
  noticePeriodDays: string;
  noticeDuration: string;
  separationStatus: string;
  reasonForSeparation: string;
  approver: string;
  lineManager: string;
}

interface ClearanceDeptRow {
  department: string;
  status: 'Cleared' | 'Pending' | 'In Review';
  approver: string;
  date: string;
  remarks: string;
}

interface ClearanceReport {
  clearanceId: string;
  status: 'Cleared' | 'Pending' | 'In Review';
  departments: ClearanceDeptRow[];
}

interface ComputationRow {
  id: string;
  type: string;
  days: number | null;
  amount: number;
}

// ─── Color palette ────────────────────────────────────────────────────────────

const C = {
  primary: '#0f766e',
  primaryDark: '#115e59',
  primaryLight: '#f0fdfa',
  border: '#d8e7e5',
  borderStrong: '#bdd6d2',
  surface: '#ffffff',
  surfaceMuted: '#f8fafc',
  text: '#111827',
  textSecondary: '#374151',
  textMuted: '#6b7280',
  textSoft: '#9ca3af',
  success: '#059669',
  successBg: '#f0fdf4',
  successBorder: '#bbf7d0',
  warning: '#d97706',
  warningBg: '#fffbeb',
  warningBorder: '#fde68a',
  info: '#0284c7',
  infoBg: '#f0f9ff',
  infoBorder: '#bae6fd',
  danger: '#dc2626',
  dangerBg: '#fef2f2',
  dangerBorder: '#fecaca',
  neutralBg: '#f8fafc',
  neutralBorder: '#e5e7eb',
  neutralText: '#6b7280',
};

// ─── Static data ──────────────────────────────────────────────────────────────

const AVATAR_COLORS = ['#0d9488', '#3b82f6', '#f59e0b', '#8b5cf6', '#10b981', '#64748b', '#ef4444'];

const ELIGIBLE_EMPLOYEES: EligibleEmployee[] = [
  {
    id: 'EMP-1042',
    name: 'Sarah Chen',
    department: 'Engineering',
    designation: 'Sr. Software Engineer',
    reason: 'Resignation',
    lastWorkingDay: '2026-04-15',
    noticePeriod: '60 days',
    dateOfJoining: '2024-01-15',
    grossSalary: 12000,
    tenure: '2 Years, 3 Months',
  },
  {
    id: 'EMP-2103',
    name: 'James Okafor',
    department: 'Finance',
    designation: 'Finance Manager',
    reason: 'Retirement',
    lastWorkingDay: '2026-05-31',
    noticePeriod: '90 days',
    dateOfJoining: '2019-05-01',
    grossSalary: 15000,
    tenure: '7 Years, 0 Months',
  },
  {
    id: 'EMP-3058',
    name: 'Priya Nair',
    department: 'HR',
    designation: 'HR Business Partner',
    reason: 'Resignation',
    lastWorkingDay: '2026-04-30',
    noticePeriod: '30 days',
    dateOfJoining: '2022-10-12',
    grossSalary: 9800,
    tenure: '3 Years, 5 Months',
  },
  {
    id: 'EMP-4219',
    name: 'David Kurz',
    department: 'Sales',
    designation: 'Regional Sales Manager',
    reason: 'Resignation',
    lastWorkingDay: '2026-06-15',
    noticePeriod: '30 days',
    dateOfJoining: '2023-06-01',
    grossSalary: 11200,
    tenure: '2 Years, 9 Months',
  },
  {
    id: 'EMP-5087',
    name: 'Amara Diallo',
    department: 'Operations',
    designation: 'Operations Analyst',
    reason: 'End of Contract',
    lastWorkingDay: '2026-04-01',
    noticePeriod: 'N/A',
    dateOfJoining: '2024-04-01',
    grossSalary: 8500,
    tenure: '2 Years, 0 Months',
  },
];

const SALARY_COMPONENTS = [
  { label: 'Basic Salary', pct: 40 },
  { label: 'House Rent Allowance', pct: 25 },
  { label: 'Medical Allowance', pct: 10 },
  { label: 'Transport Allowance', pct: 8 },
  { label: 'Food Allowance', pct: 6 },
  { label: 'Other Allowances', pct: 11 },
];

const MOCK_LEAVE_ROWS = [
  { type: 'Annual Leave', entitled: 18, availed: 12, balance: 6 },
  { type: 'Sick Leave', entitled: 14, availed: 5, balance: 9 },
  { type: 'Casual Leave', entitled: 10, availed: 7, balance: 3 },
  { type: 'Maternity/Paternity', entitled: 0, availed: 0, balance: 0 },
  { type: 'Compensatory Off', entitled: 4, availed: 2, balance: 2 },
];

const PAYABLE_TYPES = [
  'Monthly Salary (Pro-rata)',
  'Leave Encashment',
  'Bonus',
  'Gratuity',
  'Performance Bonus',
  'Retention Bonus',
  'Notice Period Pay',
  'Other Allowance',
];

const DEDUCTION_TYPES = [
  'Tax Deduction',
  'Advance Salary Recovery',
  'Asset Recovery',
  'Notice Recovery',
  'Loan Recovery',
  'Other Deduction',
];

const INITIAL_SETTLEMENTS: SettlementRecord[] = [
  {
    id: 'fst-001',
    empName: 'Aisha Patel',
    empId: 'FS-001',
    department: 'Finance',
    designation: 'Financial Analyst',
    reason: 'Contract Expiry',
    tenure: '2 Years, 9 Months',
    lastWorkingDay: '2026-03-28',
    dateOfJoining: '2023-06-01',
    payables: [
      { label: 'Monthly Salary (Pro-rata) (28d)', amount: 8500 },
      { label: 'Leave Encashment (12d)', amount: 2400 },
      { label: 'Bonus', amount: 1200 },
    ],
    deductions: [
      { label: 'Tax Deduction', amount: 350 },
      { label: 'ID Card', amount: 100 },
    ],
    status: 'Paid',
    preparedBy: 'Payroll Officer',
    checkedBy: 'Manager, Human Resources',
    approvedBy: 'CEO',
    resignationDetails: {
      requestId: 'SEP-003',
      employeeId: 'EMP-0654',
      separationType: 'End of Contract',
      employmentStatus: 'Contractual',
      resignationDate: '2026-02-28',
      noticePeriodDays: '15 days',
      noticeDuration: 'Serve Full Notice',
      separationStatus: 'Completed',
      reasonForSeparation: 'Contract expiry',
      approver: 'Robert Kim',
      lineManager: 'Monica Shah',
    },
    clearanceReport: {
      clearanceId: 'CLR-002',
      status: 'Cleared',
      departments: [
        { department: 'Immediate Supervisor', status: 'Cleared', approver: 'Finance Director',  date: '2026-03-20', remarks: '' },
        { department: 'Finance & Accounts',   status: 'Cleared', approver: 'Finance Head',      date: '2026-03-21', remarks: '' },
        { department: 'Administration',       status: 'Cleared', approver: 'Admin Head',        date: '2026-03-20', remarks: '' },
        { department: 'Asset Management (IT)',status: 'Cleared', approver: 'IT Admin',          date: '2026-03-20', remarks: '' },
        { department: 'IT Department',        status: 'Cleared', approver: 'IT Manager',        date: '2026-03-21', remarks: '' },
        { department: 'Airline Security',     status: 'Cleared', approver: 'Security Head',     date: '2026-03-20', remarks: '' },
        { department: 'Revenue Department',   status: 'Cleared', approver: 'Revenue Manager',   date: '2026-03-22', remarks: '' },
        { department: 'Head of Department',   status: 'Cleared', approver: 'Finance Director',  date: '2026-03-22', remarks: '' },
        { department: 'HR Department',        status: 'Cleared', approver: 'HR Manager',        date: '2026-03-23', remarks: '' },
      ],
    },
  },
  {
    id: 'fst-002',
    empName: 'Sarah Chen',
    empId: 'FS-002',
    department: 'Engineering',
    designation: 'Sr. Software Engineer',
    reason: 'Resignation',
    tenure: '2 Years, 3 Months',
    lastWorkingDay: '2026-04-15',
    dateOfJoining: '2024-01-15',
    payables: [
      { label: 'Monthly Salary (Pro-rata) (30d)', amount: 12000 },
      { label: 'Leave Encashment (18d)', amount: 3600 },
      { label: 'Bonus', amount: 2500 },
    ],
    deductions: [
      { label: 'Tax Deduction', amount: 600 },
      { label: 'Advance Salary Recovery', amount: 200 },
    ],
    status: 'Under Review',
    preparedBy: 'Payroll Officer',
    checkedBy: 'Manager, Human Resources',
    resignationDetails: {
      requestId: 'SEP-011',
      employeeId: 'EMP-1042',
      separationType: 'Resignation',
      employmentStatus: 'Permanent',
      resignationDate: '2026-02-14',
      noticePeriodDays: '60 days',
      noticeDuration: 'Serve Full Notice',
      separationStatus: 'In Progress',
      reasonForSeparation: 'Personal reasons – career transition',
      approver: 'James Wilson',
      lineManager: 'David Park',
    },
    clearanceReport: {
      clearanceId: 'CLR-008',
      status: 'Pending',
      departments: [
        { department: 'Immediate Supervisor', status: 'Cleared',    approver: 'Engineering Manager', date: '2026-04-01', remarks: '' },
        { department: 'IT Department',        status: 'Cleared',    approver: 'IT Head',             date: '2026-04-02', remarks: '' },
        { department: 'HR Department',        status: 'Pending',    approver: 'HR Manager',          date: '',          remarks: '' },
        { department: 'Finance & Accounts',   status: 'Pending',    approver: 'Finance Head',        date: '',          remarks: '' },
        { department: 'Administration',       status: 'Pending',    approver: 'Admin Head',          date: '',          remarks: '' },
      ],
    },
  },
  {
    id: 'fst-003',
    empName: 'Michael Thompson',
    empId: 'FS-003',
    department: 'Sales',
    designation: 'Account Executive',
    reason: 'Resignation',
    tenure: '1 Year, 11 Months',
    lastWorkingDay: '2026-03-29',
    dateOfJoining: '2024-04-02',
    payables: [
      { label: 'Monthly Salary (Pro-rata) (29d)', amount: 7800 },
      { label: 'Incentive Adjustment', amount: 1800 },
      { label: 'Leave Encashment (9d)', amount: 900 },
    ],
    deductions: [
      { label: 'Tax Deduction', amount: 250 },
      { label: 'Asset Recovery', amount: 150 },
    ],
    status: 'Draft',
    preparedBy: 'Payroll Officer',
    resignationDetails: {
      requestId: 'SEP-018',
      employeeId: 'EMP-3058',
      separationType: 'Resignation',
      employmentStatus: 'Permanent',
      resignationDate: '2026-02-27',
      noticePeriodDays: '30 days',
      noticeDuration: 'Serve Full Notice',
      separationStatus: 'Completed',
      reasonForSeparation: 'Career growth opportunity',
      approver: 'Angela Torres',
      lineManager: 'Peter Chang',
    },
    clearanceReport: {
      clearanceId: 'CLR-014',
      status: 'Pending',
      departments: [
        { department: 'Immediate Supervisor', status: 'Cleared', approver: 'Sales Manager', date: '2026-03-25', remarks: '' },
        { department: 'IT Department',        status: 'Pending', approver: 'IT Head',        date: '',          remarks: '' },
        { department: 'HR Department',        status: 'Pending', approver: 'HR Manager',     date: '',          remarks: '' },
        { department: 'Finance & Accounts',   status: 'Pending', approver: 'Finance Head',   date: '',          remarks: '' },
      ],
    },
  },
  {
    id: 'fst-004',
    empName: 'Elena Vasquez',
    empId: 'FS-004',
    department: 'HR',
    designation: 'HR Specialist',
    reason: 'Retirement',
    tenure: '4 Years, 2 Months',
    lastWorkingDay: '2026-06-30',
    dateOfJoining: '2022-04-15',
    payables: [
      { label: 'Monthly Salary (Pro-rata) (30d)', amount: 11000 },
      { label: 'Leave Encashment (22d)', amount: 5200 },
      { label: 'Gratuity', amount: 3000 },
    ],
    deductions: [
      { label: 'Tax Deduction', amount: 600 },
    ],
    status: 'Draft',
    preparedBy: 'Payroll Officer',
    resignationDetails: {
      requestId: 'SEP-025',
      employeeId: 'EMP-4219',
      separationType: 'Retirement',
      employmentStatus: 'Permanent',
      resignationDate: '2026-03-15',
      noticePeriodDays: '90 days',
      noticeDuration: 'Serve Full Notice',
      separationStatus: 'In Progress',
      reasonForSeparation: 'Superannuation – reached mandatory retirement age',
      approver: 'Maria Santos',
      lineManager: 'James Okafor',
    },
    clearanceReport: {
      clearanceId: 'CLR-021',
      status: 'In Review',
      departments: [
        { department: 'Immediate Supervisor', status: 'In Review', approver: 'HR Director',   date: '',          remarks: '' },
        { department: 'Finance & Accounts',   status: 'Pending',   approver: 'Finance Head',  date: '',          remarks: '' },
        { department: 'Administration',       status: 'Pending',   approver: 'Admin Head',    date: '',          remarks: '' },
        { department: 'IT Department',        status: 'Pending',   approver: 'IT Manager',    date: '',          remarks: '' },
        { department: 'HR Department',        status: 'Pending',   approver: 'HR Admin',      date: '',          remarks: '' },
      ],
    },
  },
];

// ─── Filters & constants ───────────────────────────────────────────────────────

const EMPTY_FILTERS: Filters = { search: '', department: '', reason: '', amountBand: '' };

const STAGES: SettlementStage[] = ['Draft', 'Under Review', 'Approved', 'Paid'];
const FILTER_TABS: Array<{ key: 'All' | SettlementStatus; label: string }> = [
  { key: 'All', label: 'All' },
  { key: 'Draft', label: 'Draft' },
  { key: 'Under Review', label: 'Under Review' },
  { key: 'Approved', label: 'Approved' },
  { key: 'Paid', label: 'Paid' },
  { key: 'Disputed', label: 'Disputed' },
];

const STATUS_THEME: Record<SettlementStatus, { bg: string; border: string; text: string; accent: string }> = {
  Draft:          { bg: C.neutralBg,  border: C.neutralBorder, text: C.neutralText, accent: C.primary },
  'Under Review': { bg: C.warningBg,  border: C.warningBorder, text: C.warning,     accent: C.warning },
  Approved:       { bg: C.infoBg,     border: C.infoBorder,    text: C.info,         accent: C.info },
  Paid:           { bg: C.successBg,  border: C.successBorder, text: C.success,      accent: C.success },
  Disputed:       { bg: C.dangerBg,   border: C.dangerBorder,  text: C.danger,       accent: C.danger },
};

const STATUS_STEP_INDEX: Record<SettlementStatus, number> = {
  Draft: 0, 'Under Review': 1, Approved: 2, Paid: 3, Disputed: 1,
};

// ─── Utility functions ────────────────────────────────────────────────────────

function avatarColor(name: string) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(part => part[0]).join('').toUpperCase();
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

function getPayablesTotal(record: SettlementRecord) {
  return record.payables.reduce((sum, item) => sum + item.amount, 0);
}

function getDeductionsTotal(record: SettlementRecord) {
  return record.deductions.reduce((sum, item) => sum + item.amount, 0);
}

function getNetPayable(record: SettlementRecord) {
  return getPayablesTotal(record) - getDeductionsTotal(record);
}

function matchesAmountBand(amount: number, amountBand: AmountBand) {
  if (!amountBand) return true;
  if (amountBand === 'under-12000') return amount < 12000;
  if (amountBand === '12000-18000') return amount >= 12000 && amount <= 18000;
  return amount > 18000;
}

function downloadCsv(rows: SettlementRecord[]) {
  if (rows.length === 0) { message.info('No settlements available for export.'); return; }
  const header = ['Employee', 'Employee ID', 'Department', 'Designation', 'Status', 'Reason', 'Last Working Day', 'Net Payable'];
  const lines = rows.map(record => [
    record.empName, record.empId, record.department, record.designation,
    record.status, record.reason, record.lastWorkingDay, String(getNetPayable(record)),
  ]);
  const csv = [header, ...lines].map(line => line.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'final-settlements.csv';
  link.click();
  window.URL.revokeObjectURL(url);
}

let rowCounter = 100;
function newRow(type = ''): ComputationRow {
  return { id: String(rowCounter++), type, days: null, amount: 0 };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricCard({ label, value, hint, accent, icon }: {
  label: string; value: string; hint: string; accent: string; icon: ReactNode;
}) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 18px', boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.textSoft, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>{label}</div>
          <div style={{ fontSize: 34, fontWeight: 800, color: accent, lineHeight: 1, letterSpacing: '-0.03em' }}>{value}</div>
          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 10 }}>{hint}</div>
        </div>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: `${accent}14`, color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: SettlementStatus }) {
  const theme = STATUS_THEME[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 999, border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: theme.accent, flexShrink: 0 }} />
      {status}
    </span>
  );
}

function StageTrack({ status }: { status: SettlementStatus }) {
  const activeIndex = STATUS_STEP_INDEX[status];
  const theme = STATUS_THEME[status];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(70px, 1fr))', gap: 8 }}>
      {STAGES.map((stage, index) => {
        const isReached = index <= activeIndex;
        const isCurrent = index === activeIndex;
        return (
          <div key={stage} style={{ minWidth: 0 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: isCurrent ? theme.text : C.textSoft, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {stage}
            </div>
            <div style={{ height: 4, borderRadius: 999, background: '#e5e7eb', overflow: 'hidden' }}>
              <div style={{ width: isReached ? '100%' : '0%', height: '100%', background: theme.accent, transition: 'width 0.2s ease' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MetaItem({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, background: C.surfaceMuted, padding: '10px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, color: C.textSoft, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{value}</div>
    </div>
  );
}

function AmountPanel({ title, accent, background, border, items, total }: {
  title: string; accent: string; background: string; border: string;
  items: SettlementLineItem[]; total: number;
}) {
  return (
    <div style={{ border: `1px solid ${border}`, borderRadius: 12, overflow: 'hidden', background: C.surface }}>
      <div style={{ padding: '10px 14px', background, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: accent, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{title}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color: accent }}>{formatCurrency(total)}</span>
      </div>
      <div style={{ padding: '4px 14px 10px' }}>
        {items.map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 12, color: C.textSecondary }}>{item.label}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: accent }}>{formatCurrency(item.amount)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step indicator for modal ─────────────────────────────────────────────────

function ModalStepIndicator({ current }: { current: 0 | 1 }) {
  const steps = ['Employee Selection', 'Settlement Breakdown'] as const;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
      {steps.map((label, idx) => (
        <Fragment key={label}>
          {idx > 0 && <RightOutlined style={{ fontSize: 10, color: C.textSoft }} />}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
              background: current >= idx ? C.primaryDark : '#e5e7eb',
              color: current >= idx ? '#ffffff' : C.textSoft,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700,
            }}>{idx + 1}</div>
            <span style={{ fontSize: 12, fontWeight: current === idx ? 700 : 400, color: current === idx ? C.text : C.textMuted }}>
              {label}
            </span>
          </div>
        </Fragment>
      ))}
    </div>
  );
}

// ─── Collapsible section for modal ───────────────────────────────────────────

function CollapsibleSection({ title, tag, tagColor, tagBg, children }: {
  title: string; tag?: string; tagColor?: string; tagBg?: string; children: ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden', marginBottom: 12 }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px', background: C.surfaceMuted, border: 'none', cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{title}</span>
          {tag && (
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: tagBg ?? C.primaryLight, color: tagColor ?? C.primary }}>
              {tag}
            </span>
          )}
        </div>
        {open ? <UpOutlined style={{ fontSize: 10, color: C.textMuted }} /> : <DownOutlined style={{ fontSize: 10, color: C.textMuted }} />}
      </button>
      {open && <div style={{ padding: '14px' }}>{children}</div>}
    </div>
  );
}

// ─── Settlement computation rows editor ──────────────────────────────────────

function ComputationRowEditor({ rows, typeOptions, onRowsChange, accent, label, emptyHint }: {
  rows: ComputationRow[];
  typeOptions: string[];
  onRowsChange: (rows: ComputationRow[]) => void;
  accent: string;
  label: string;
  emptyHint: string;
}) {
  const updateRow = (id: string, patch: Partial<ComputationRow>) => {
    onRowsChange(rows.map(r => r.id === id ? { ...r, ...patch } : r));
  };
  const removeRow = (id: string) => {
    onRowsChange(rows.filter(r => r.id !== id));
  };
  const addRow = () => {
    onRowsChange([...rows, newRow()]);
  };

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 18, height: 18, borderRadius: '50%', background: accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800 }}>
            {label}
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.text, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {label === 'A' ? 'Payable to Employee' : 'Deductions'}
          </span>
        </div>
        <Button type="link" size="small" icon={<PlusOutlined />} onClick={addRow} style={{ padding: 0, fontSize: 12, color: C.primary }}>
          Add Row
        </Button>
      </div>

      {rows.length === 0 ? (
        <div style={{ fontSize: 12, color: C.textSoft, fontStyle: 'italic', padding: '10px 0 6px' }}>
          {emptyHint}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rows.map(row => (
            <div key={row.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Select
                style={{ flex: '2 1 160px', minWidth: 0 }}
                placeholder="Select type..."
                value={row.type || undefined}
                onChange={value => updateRow(row.id, { type: value })}
                options={typeOptions.map(t => ({ label: t, value: t }))}
                size="small"
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: '0 0 auto' }}>
                <InputNumber
                  size="small"
                  placeholder="Days"
                  min={0}
                  value={row.days ?? undefined}
                  onChange={value => updateRow(row.id, { days: value ?? null })}
                  style={{ width: 64 }}
                />
                <span style={{ fontSize: 11, color: C.textSoft }}>d</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: '1 1 100px' }}>
                <span style={{ fontSize: 12, color: C.textMuted, flexShrink: 0 }}>$</span>
                <InputNumber
                  size="small"
                  placeholder="0"
                  min={0}
                  value={row.amount || undefined}
                  onChange={value => updateRow(row.id, { amount: value ?? 0 })}
                  style={{ width: '100%' }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => Number(value?.replace(/,/g, '') ?? 0)}
                />
              </div>
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => removeRow(row.id)}
                style={{ color: C.textSoft, flexShrink: 0 }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Generate Settlement Modal (2-step wizard) ────────────────────────────────

function GenerateSettlementModal({ open, onClose, onSave }: {
  open: boolean;
  onClose: () => void;
  onSave: (record: SettlementRecord, asDraft: boolean) => void;
}) {
  const [step, setStep] = useState<0 | 1>(0);
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [payableRows, setPayableRows] = useState<ComputationRow[]>([
    newRow('Monthly Salary (Pro-rata)'),
    newRow('Leave Encashment'),
  ]);
  const [deductionRows, setDeductionRows] = useState<ComputationRow[]>([]);

  const selectedEmp = ELIGIBLE_EMPLOYEES.find(e => e.id === selectedEmpId);
  const subTotalA = payableRows.reduce((sum, r) => sum + (r.amount || 0), 0);
  const subTotalB = deductionRows.reduce((sum, r) => sum + (r.amount || 0), 0);
  const netPayable = subTotalA - subTotalB;

  const handleClose = () => {
    setStep(0);
    setSelectedEmpId('');
    setPayableRows([newRow('Monthly Salary (Pro-rata)'), newRow('Leave Encashment')]);
    setDeductionRows([]);
    onClose();
  };

  const handleSave = (asDraft: boolean) => {
    if (!selectedEmp) return;
    const record: SettlementRecord = {
      id: `fst-${Date.now()}`,
      empName: selectedEmp.name,
      empId: selectedEmp.id,
      department: selectedEmp.department,
      designation: selectedEmp.designation,
      reason: selectedEmp.reason,
      tenure: selectedEmp.tenure,
      lastWorkingDay: selectedEmp.lastWorkingDay,
      dateOfJoining: selectedEmp.dateOfJoining,
      payables: payableRows.filter(r => r.type).map(r => ({ label: r.type, amount: r.amount || 0 })),
      deductions: deductionRows.filter(r => r.type).map(r => ({ label: r.type, amount: r.amount || 0 })),
      status: 'Draft',
      preparedBy: 'Md. Wahiduzzaman Nayem (TN-99356)',
    };
    onSave(record, asDraft);
    handleClose();
  };

  const totalLeaveBalance = MOCK_LEAVE_ROWS.reduce((s, r) => s + r.balance, 0);

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title={
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
            <FileDoneOutlined style={{ color: C.primaryDark, fontSize: 16 }} />
            <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Generate Final Settlement</span>
          </div>
          <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 400, marginLeft: 26 }}>
            Full & final settlement computation based on company policy
          </div>
        </div>
      }
      footer={null}
      width={660}
      centered
      styles={{ body: { padding: '20px 24px 24px', maxHeight: '72vh', overflowY: 'auto' } }}
      destroyOnClose
    >
      <ModalStepIndicator current={step} />

      {step === 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>
            Select Employee
          </div>
          <Select
            style={{ width: '100%' }}
            placeholder="Select employee..."
            value={selectedEmpId || undefined}
            onChange={value => setSelectedEmpId(value)}
            options={ELIGIBLE_EMPLOYEES.map(e => ({
              label: `${e.name} — ${e.department} — ${e.reason}`,
              value: e.id,
            }))}
            showSearch
            filterOption={(input, option) =>
              String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          />

          {selectedEmp && (
            <div style={{ marginTop: 16, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                {[
                  { label: 'Employee ID', value: selectedEmp.id },
                  { label: 'Designation', value: selectedEmp.designation },
                  { label: 'Separation Type', value: selectedEmp.reason },
                  { label: 'Last Working Day', value: selectedEmp.lastWorkingDay },
                  { label: 'Notice Period', value: selectedEmp.noticePeriod },
                  { label: 'Department', value: selectedEmp.department },
                ].map((item, idx) => (
                  <div
                    key={item.label}
                    style={{
                      padding: '12px 16px',
                      borderBottom: idx < 4 ? `1px solid ${C.border}` : 'none',
                      borderRight: idx % 2 === 0 ? `1px solid ${C.border}` : 'none',
                    }}
                  >
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.textSoft, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 4 }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              type="primary"
              disabled={!selectedEmpId}
              onClick={() => setStep(1)}
              style={{ background: C.primaryDark, borderColor: C.primaryDark }}
            >
              Next: Settlement Breakdown
            </Button>
          </div>
        </>
      )}

      {step === 1 && selectedEmp && (
        <>
          {/* Employee header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: C.surfaceMuted, border: `1px solid ${C.border}`, borderRadius: 10, marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar size={36} style={{ background: avatarColor(selectedEmp.name), fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                {initials(selectedEmp.name)}
              </Avatar>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{selectedEmp.name}</div>
                <div style={{ fontSize: 11, color: C.textMuted }}>{selectedEmp.designation} · {selectedEmp.department} · {selectedEmp.id}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textSoft, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Gross Salary</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{formatCurrency(selectedEmp.grossSalary)}</div>
            </div>
          </div>

          {/* Attendance Summary */}
          <CollapsibleSection title="Attendance Summary" tag="91% rate" tagColor={C.success} tagBg={C.successBg}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {[
                { label: 'Working Days', value: 240, color: C.text, bg: C.surfaceMuted },
                { label: 'Present', value: 218, color: C.success, bg: C.successBg },
                { label: 'Absent', value: 5, color: C.danger, bg: C.dangerBg },
                { label: 'Late Entry', value: 8, color: C.warning, bg: C.warningBg },
                { label: 'Early Exit', value: 3, color: C.info, bg: C.infoBg },
              ].map(item => (
                <div key={item.label} style={{ flex: 1, textAlign: 'center', padding: '10px 6px', borderRadius: 8, background: item.bg, border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: item.color }}>{item.value}</div>
                  <div style={{ fontSize: 9, fontWeight: 600, color: C.textSoft, letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: 3 }}>{item.label}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 6 }}>Attendance Rate</div>
            <Progress percent={91} strokeColor={C.success} trailColor="#e5e7eb" size="small" />
          </CollapsibleSection>

          {/* Salary Breakdown */}
          <CollapsibleSection title="Salary Breakdown" tag={formatCurrency(selectedEmp.grossSalary)} tagColor={C.primary} tagBg={C.primaryLight}>
            <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 0 }}>
                <div style={{ padding: '8px 12px', fontSize: 10, fontWeight: 700, color: C.textSoft, letterSpacing: '0.07em', textTransform: 'uppercase', borderBottom: `1px solid ${C.border}` }}>Component</div>
                <div style={{ padding: '8px 12px', fontSize: 10, fontWeight: 700, color: C.textSoft, letterSpacing: '0.07em', textTransform: 'uppercase', borderBottom: `1px solid ${C.border}`, textAlign: 'right' }}>Pct.</div>
                <div style={{ padding: '8px 12px', fontSize: 10, fontWeight: 700, color: C.textSoft, letterSpacing: '0.07em', textTransform: 'uppercase', borderBottom: `1px solid ${C.border}`, textAlign: 'right' }}>Amount</div>
                {SALARY_COMPONENTS.map((comp, idx) => {
                  const amt = Math.round(selectedEmp.grossSalary * comp.pct / 100);
                  const isLast = idx === SALARY_COMPONENTS.length - 1;
                  return (
                    <Fragment key={comp.label}>
                      <div style={{ padding: '9px 12px', fontSize: 12, color: C.textSecondary, borderBottom: isLast ? 'none' : `1px solid ${C.border}` }}>{comp.label}</div>
                      <div style={{ padding: '9px 12px', fontSize: 12, color: C.textMuted, textAlign: 'right', borderBottom: isLast ? 'none' : `1px solid ${C.border}` }}>
                        <span style={{ display: 'inline-block', width: 32, height: 3, background: `${C.primary}40`, borderRadius: 2, verticalAlign: 'middle', marginRight: 4 }} />
                        {comp.pct}%
                      </div>
                      <div style={{ padding: '9px 12px', fontSize: 12, fontWeight: 600, color: C.text, textAlign: 'right', borderBottom: isLast ? 'none' : `1px solid ${C.border}` }}>
                        {formatCurrency(amt)}
                      </div>
                    </Fragment>
                  );
                })}
                <div style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: C.text, borderTop: `1px solid ${C.border}` }}>Gross Salary</div>
                <div style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: C.text, borderTop: `1px solid ${C.border}`, textAlign: 'right' }}>100%</div>
                <div style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: C.text, borderTop: `1px solid ${C.border}`, textAlign: 'right' }}>{formatCurrency(selectedEmp.grossSalary)}</div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Leave Breakdown */}
          <CollapsibleSection title="Leave Breakdown" tag={`${totalLeaveBalance}d balance`} tagColor={C.info} tagBg={C.infoBg}>
            <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden', marginBottom: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 0 }}>
                {['Leave Type', 'Entitled', 'Availed', 'Balance'].map(h => (
                  <div key={h} style={{ padding: '8px 12px', fontSize: 10, fontWeight: 700, color: C.textSoft, letterSpacing: '0.07em', textTransform: 'uppercase', borderBottom: `1px solid ${C.border}` }}>{h}</div>
                ))}
                {MOCK_LEAVE_ROWS.map((row, idx) => {
                  const isLast = idx === MOCK_LEAVE_ROWS.length - 1;
                  return (
                    <Fragment key={row.type}>
                      <div style={{ padding: '9px 12px', fontSize: 12, color: C.textSecondary, borderBottom: isLast ? 'none' : `1px solid ${C.border}` }}>{row.type}</div>
                      <div style={{ padding: '9px 12px', fontSize: 12, color: C.text, textAlign: 'center', borderBottom: isLast ? 'none' : `1px solid ${C.border}` }}>{row.entitled}</div>
                      <div style={{ padding: '9px 12px', fontSize: 12, color: row.availed > 0 ? C.warning : C.textMuted, fontWeight: row.availed > 0 ? 600 : 400, textAlign: 'center', borderBottom: isLast ? 'none' : `1px solid ${C.border}` }}>{row.availed}</div>
                      <div style={{ padding: '9px 12px', fontSize: 12, color: row.balance > 0 ? C.success : C.textMuted, fontWeight: row.balance > 0 ? 600 : 400, textAlign: 'center', borderBottom: isLast ? 'none' : `1px solid ${C.border}` }}>{row.balance}</div>
                    </Fragment>
                  );
                })}
                {/* Total row */}
                <div style={{ padding: '9px 12px', fontSize: 12, fontWeight: 700, color: C.text, borderTop: `1px solid ${C.border}` }}>Total</div>
                <div style={{ padding: '9px 12px', fontSize: 12, fontWeight: 700, color: C.text, textAlign: 'center', borderTop: `1px solid ${C.border}` }}>{MOCK_LEAVE_ROWS.reduce((s, r) => s + r.entitled, 0)}</div>
                <div style={{ padding: '9px 12px', fontSize: 12, fontWeight: 700, color: C.warning, textAlign: 'center', borderTop: `1px solid ${C.border}` }}>{MOCK_LEAVE_ROWS.reduce((s, r) => s + r.availed, 0)}</div>
                <div style={{ padding: '9px 12px', fontSize: 12, fontWeight: 700, color: C.success, textAlign: 'center', borderTop: `1px solid ${C.border}` }}>{totalLeaveBalance}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.info }}>
              <ClockCircleOutlined style={{ fontSize: 12 }} />
              <span>{totalLeaveBalance} days leave balance eligible for encashment</span>
            </div>
          </CollapsibleSection>

          {/* Settlement Computation */}
          <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden', marginBottom: 12 }}>
            <div style={{ padding: '10px 14px', background: C.surfaceMuted, display: 'flex', alignItems: 'center', gap: 8, borderBottom: `1px solid ${C.border}` }}>
              <FileDoneOutlined style={{ color: C.primary, fontSize: 13 }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Settlement Computation</span>
              <span style={{ fontSize: 11, color: C.textMuted }}>Final payable calculation</span>
            </div>
            <div style={{ padding: 14 }}>
              <ComputationRowEditor
                rows={payableRows}
                typeOptions={PAYABLE_TYPES}
                onRowsChange={setPayableRows}
                accent={C.success}
                label="A"
                emptyHint="No payable items — click Add Row to add"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: `${C.success}10`, borderRadius: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.textSecondary }}>Sub-Total (A)</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: C.success }}>{formatCurrency(subTotalA)}</span>
              </div>

              <ComputationRowEditor
                rows={deductionRows}
                typeOptions={DEDUCTION_TYPES}
                onRowsChange={setDeductionRows}
                accent={C.danger}
                label="B"
                emptyHint="No deductions — click Add Row to add"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: `${C.danger}10`, borderRadius: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.textSecondary }}>Sub-Total (B)</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: C.danger }}>−{formatCurrency(subTotalB)}</span>
              </div>

              {/* Net Payable */}
              <div style={{ background: 'linear-gradient(135deg, #163563 0%, #1e3a6f 100%)', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DollarCircleOutlined style={{ color: '#ffffff' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.82)' }}>Net Payable (A − B)</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>Final settlement amount due</div>
                  </div>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.03em' }}>{formatCurrency(netPayable)}</div>
              </div>

              <div style={{ marginTop: 12, fontSize: 11, color: C.textMuted }}>
                Prepared by: <strong style={{ color: C.textSecondary }}>Md. Wahiduzzaman Nayem (TN-99356)</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, paddingTop: 4 }}>
            <Button onClick={() => setStep(0)}>Back</Button>
            <Space>
              <Button onClick={handleClose}>Cancel</Button>
              <Button onClick={() => handleSave(true)}>Save as Draft</Button>
              <Button
                type="primary"
                onClick={() => handleSave(false)}
                style={{ background: C.primaryDark, borderColor: C.primaryDark }}
              >
                Generate Settlement
              </Button>
            </Space>
          </div>
        </>
      )}
    </Modal>
  );
}

// ─── Edit Settlement Modal ────────────────────────────────────────────────────

function EditSettlementModal({ record, onClose, onSave }: {
  record: SettlementRecord | null;
  onClose: () => void;
  onSave: (updated: SettlementRecord) => void;
}) {
  const [payableRows, setPayableRows] = useState<ComputationRow[]>(
    () => (record?.payables ?? []).map(p => ({ id: String(rowCounter++), type: p.label, days: null, amount: p.amount })),
  );
  const [deductionRows, setDeductionRows] = useState<ComputationRow[]>(
    () => (record?.deductions ?? []).map(d => ({ id: String(rowCounter++), type: d.label, days: null, amount: d.amount })),
  );

  const subTotalA = payableRows.reduce((sum, r) => sum + (r.amount || 0), 0);
  const subTotalB = deductionRows.reduce((sum, r) => sum + (r.amount || 0), 0);
  const netPayable = subTotalA - subTotalB;

  const handleSave = (asDraft: boolean) => {
    if (!record) return;
    onSave({
      ...record,
      payables: payableRows.filter(r => r.type).map(r => ({ label: r.type, amount: r.amount || 0 })),
      deductions: deductionRows.filter(r => r.type).map(r => ({ label: r.type, amount: r.amount || 0 })),
      status: asDraft ? 'Draft' : record.status,
    });
    onClose();
  };

  const grossSalary = ELIGIBLE_EMPLOYEES.find(e => e.id === record?.empId)?.grossSalary;

  return (
    <Modal
      open={!!record}
      onCancel={onClose}
      title={
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
            <EditOutlined style={{ color: C.primaryDark, fontSize: 16 }} />
            <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Edit Settlement</span>
          </div>
          <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 400, marginLeft: 26 }}>
            {record?.empName} — {record?.department} — {record?.reason}
          </div>
        </div>
      }
      footer={null}
      width={660}
      centered
      styles={{ body: { padding: '20px 24px 24px', maxHeight: '72vh', overflowY: 'auto' } }}
      destroyOnClose
    >
      {record && (
        <>
          {/* Employee header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: C.surfaceMuted, border: `1px solid ${C.border}`, borderRadius: 10, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar size={36} style={{ background: avatarColor(record.empName), fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                {initials(record.empName)}
              </Avatar>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{record.empName}</div>
                <div style={{ fontSize: 11, color: C.textMuted }}>{record.designation} · {record.department} · {record.empId}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {grossSalary && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.textSoft, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Gross Salary</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{formatCurrency(grossSalary)}</div>
                </div>
              )}
              <StatusBadge status={record.status} />
            </div>
          </div>

          {/* Key info */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 16 }}>
            <MetaItem icon={<FileDoneOutlined style={{ fontSize: 11 }} />} label="Reason" value={record.reason} />
            <MetaItem icon={<ClockCircleOutlined style={{ fontSize: 11 }} />} label="Tenure" value={record.tenure} />
            <MetaItem icon={<CalendarOutlined style={{ fontSize: 11 }} />} label="Last Working Day" value={record.lastWorkingDay} />
            <MetaItem icon={<ApartmentOutlined style={{ fontSize: 11 }} />} label="Date of Joining" value={record.dateOfJoining} />
          </div>

          {/* Settlement Computation */}
          <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden', marginBottom: 14 }}>
            <div style={{ padding: '10px 14px', background: C.surfaceMuted, display: 'flex', alignItems: 'center', gap: 8, borderBottom: `1px solid ${C.border}` }}>
              <FileDoneOutlined style={{ color: C.primary, fontSize: 13 }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Settlement Computation</span>
            </div>
            <div style={{ padding: 14 }}>
              <ComputationRowEditor
                rows={payableRows}
                typeOptions={PAYABLE_TYPES}
                onRowsChange={setPayableRows}
                accent={C.success}
                label="A"
                emptyHint="No payable items — click Add Row to add"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: `${C.success}10`, borderRadius: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.textSecondary }}>Sub-Total (A)</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: C.success }}>{formatCurrency(subTotalA)}</span>
              </div>

              <ComputationRowEditor
                rows={deductionRows}
                typeOptions={DEDUCTION_TYPES}
                onRowsChange={setDeductionRows}
                accent={C.danger}
                label="B"
                emptyHint="No deductions — click Add Row to add"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: `${C.danger}10`, borderRadius: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.textSecondary }}>Sub-Total (B)</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: C.danger }}>−{formatCurrency(subTotalB)}</span>
              </div>

              {/* Net Payable */}
              <div style={{ background: 'linear-gradient(135deg, #163563 0%, #1e3a6f 100%)', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DollarCircleOutlined style={{ color: '#ffffff' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.82)' }}>Net Payable (A − B)</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>Final settlement amount due</div>
                  </div>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.03em' }}>{formatCurrency(netPayable)}</div>
              </div>

              <div style={{ marginTop: 12, fontSize: 11, color: C.textMuted }}>
                Prepared by: <strong style={{ color: C.textSecondary }}>{record.preparedBy}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={onClose}>Cancel</Button>
            <Button onClick={() => handleSave(true)}>Save as Draft</Button>
            <Button type="primary" onClick={() => handleSave(false)} style={{ background: C.primaryDark, borderColor: C.primaryDark }}>
              Update Settlement
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}

// ─── Settlement card ──────────────────────────────────────────────────────────

function SettlementCard({ record, expanded, onToggle, onSubmitForReview, onApprove, onDispute, onMarkPaid, onReopen, onEdit, onExportPdf }: {
  record: SettlementRecord;
  expanded: boolean;
  onToggle: () => void;
  onSubmitForReview: () => void;
  onApprove: () => void;
  onDispute: () => void;
  onMarkPaid: () => void;
  onReopen: () => void;
  onEdit: () => void;
  onExportPdf: () => void;
}) {
  const netPayable = getNetPayable(record);
  const payablesTotal = getPayablesTotal(record);
  const deductionsTotal = getDeductionsTotal(record);
  const theme = STATUS_THEME[record.status];
  const [activeDetailTab, setActiveDetailTab] = useState<CardDetailTab>('settlement');

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onToggle(); }
        }}
        style={{ cursor: 'pointer' }}
      >
        <div style={{ padding: '14px 18px 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: '1 1 320px' }}>
              <Avatar size={40} style={{ background: avatarColor(record.empName), fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                {initials(record.empName)}
              </Avatar>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text, lineHeight: 1.2 }}>{record.empName}</div>
                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span>{record.empId}</span>
                  <span>{record.department}</span>
                  <span>{record.designation}</span>
                  <span>{record.lastWorkingDay}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.textSoft, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Net Payable</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: C.text, letterSpacing: '-0.03em', marginTop: 2 }}>{formatCurrency(netPayable)}</div>
              </div>
              <StatusBadge status={record.status} />
              <Button type="text" size="small" icon={expanded ? <DownOutlined /> : <RightOutlined />} onClick={event => { event.stopPropagation(); onToggle(); }} style={{ color: C.textMuted }} />
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <StageTrack status={record.status} />
          </div>
        </div>

        {!expanded && (
          <div style={{ borderTop: `1px solid ${C.border}`, background: theme.bg, color: theme.text, padding: '8px 18px', fontSize: 11, fontWeight: 600 }}>
            {record.status === 'Paid' ? 'Settlement completed and payment disbursed.'
              : record.status === 'Under Review' ? 'Awaiting approval from HR and payroll stakeholders.'
              : record.status === 'Approved' ? 'Approved and pending disbursement.'
              : record.status === 'Disputed' ? 'Settlement disputed and returned for review.'
              : 'Draft settlement is ready for review submission.'}
          </div>
        )}
      </div>

      {expanded && (
        <div style={{ borderTop: `1px solid ${C.border}` }}>
          {/* ── Detail tab bar ─────────────────────────── */}
          <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${C.border}`, padding: '0 18px', background: C.surface }}>
            {([
              { key: 'settlement' as CardDetailTab, label: 'Settlement Breakdown', icon: <DollarCircleOutlined style={{ fontSize: 12 }} /> },
              { key: 'resignation' as CardDetailTab, label: 'Resignation Details',  icon: <FileTextOutlined   style={{ fontSize: 12 }} /> },
              { key: 'clearance'  as CardDetailTab, label: 'Clearance Report',     icon: <SafetyOutlined     style={{ fontSize: 12 }} /> },
            ]).map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={e => { e.stopPropagation(); setActiveDetailTab(tab.key); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: activeDetailTab === tab.key ? 700 : 500,
                  color: activeDetailTab === tab.key ? C.primary : C.textMuted,
                  borderBottom: activeDetailTab === tab.key ? `2px solid ${C.primary}` : '2px solid transparent',
                  marginBottom: -1, fontFamily: 'inherit', whiteSpace: 'nowrap',
                  transition: 'color 0.1s, border-color 0.1s',
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Settlement Breakdown ──────────────────── */}
          {activeDetailTab === 'settlement' && (
            <div style={{ padding: '16px 18px 18px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginBottom: 16 }}>
                <MetaItem icon={<FileDoneOutlined style={{ fontSize: 11 }} />} label="Reason"          value={record.reason} />
                <MetaItem icon={<ClockCircleOutlined style={{ fontSize: 11 }} />} label="Tenure"       value={record.tenure} />
                <MetaItem icon={<CalendarOutlined style={{ fontSize: 11 }} />} label="Last Working Day" value={record.lastWorkingDay} />
                <MetaItem icon={<ApartmentOutlined style={{ fontSize: 11 }} />} label="Date of Joining" value={record.dateOfJoining} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14, marginBottom: 16 }}>
                <AmountPanel title="Payable"    accent={C.success} background={C.successBg} border={C.successBorder} items={record.payables}   total={payablesTotal} />
                <AmountPanel title="Deductions" accent={C.danger}  background={C.dangerBg}  border={C.dangerBorder}  items={record.deductions} total={deductionsTotal} />
              </div>

              <div style={{ background: 'linear-gradient(135deg, #163563 0%, #1e3a6f 100%)', color: '#ffffff', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <DollarCircleOutlined style={{ color: '#ffffff' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', opacity: 0.82 }}>Net Payable (A - B)</div>
                    <div style={{ fontSize: 12, opacity: 0.88, marginTop: 2 }}>Ready for settlement workflow</div>
                  </div>
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em' }}>{formatCurrency(netPayable)}</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: C.textMuted }}>Prepared: <strong style={{ color: C.textSecondary }}>{record.preparedBy}</strong></span>
                  {record.checkedBy && (
                    <span style={{ fontSize: 11, color: C.textMuted }}>Checked: <strong style={{ color: C.textSecondary }}>{record.checkedBy}</strong></span>
                  )}
                  {record.approvedBy && (
                    <span style={{ fontSize: 11, color: C.textMuted }}>Approved: <strong style={{ color: C.textSecondary }}>{record.approvedBy}</strong></span>
                  )}
                </div>

                <Space wrap>
                  {record.status === 'Draft' && (
                    <>
                      <Button icon={<EditOutlined />} onClick={onEdit}>Edit</Button>
                      <Button type="primary" icon={<SendOutlined />} onClick={onSubmitForReview} style={{ background: C.primaryDark, borderColor: C.primaryDark }}>Submit for Review</Button>
                    </>
                  )}
                  {record.status === 'Under Review' && (
                    <>
                      <Button type="primary" icon={<CheckCircleOutlined />} onClick={onApprove} style={{ background: C.primaryDark, borderColor: C.primaryDark }}>Approve</Button>
                      <Button danger onClick={onDispute}>Dispute</Button>
                    </>
                  )}
                  {record.status === 'Approved' && (
                    <Button type="primary" icon={<CheckCircleOutlined />} onClick={onMarkPaid} style={{ background: C.primaryDark, borderColor: C.primaryDark }}>Mark as Paid</Button>
                  )}
                  {record.status === 'Disputed' && (
                    <Button onClick={onReopen}>Reopen Review</Button>
                  )}
                  <Button icon={<DownloadOutlined />} onClick={onExportPdf}>Export PDF</Button>
                </Space>
              </div>
            </div>
          )}

          {/* ── Resignation Details ───────────────────── */}
          {activeDetailTab === 'resignation' && (
            <div style={{ padding: '16px 18px 18px' }}>
              {record.resignationDetails == null ? (
                <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: '40px 20px', textAlign: 'center', background: C.surface }}>
                  <FileTextOutlined style={{ fontSize: 20, color: C.textSoft, display: 'block', marginBottom: 10 }} />
                  <div style={{ fontSize: 13, color: C.textMuted }}>No resignation details available.</div>
                </div>
              ) : (
                <>
                  {/* 3-column info grid */}
                  <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden', marginBottom: 12 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
                      {([
                        { label: 'REQUEST ID',        value: record.resignationDetails.requestId       },
                        { label: 'EMPLOYEE ID',       value: record.resignationDetails.employeeId      },
                        { label: 'SEPARATION TYPE',   value: record.resignationDetails.separationType  },
                        { label: 'EMPLOYMENT STATUS', value: record.resignationDetails.employmentStatus},
                        { label: 'DEPARTMENT',        value: record.department                         },
                        { label: 'DESIGNATION',       value: record.designation                        },
                        { label: 'DATE OF JOINING',   value: record.dateOfJoining                      },
                        { label: 'RESIGNATION DATE',  value: record.resignationDetails.resignationDate },
                        { label: 'LAST WORKING DAY',  value: record.lastWorkingDay                     },
                        { label: 'NOTICE PERIOD',     value: record.resignationDetails.noticePeriodDays},
                        { label: 'DURATION',          value: record.resignationDetails.noticeDuration  },
                        { label: 'STATUS',            value: record.resignationDetails.separationStatus},
                      ] as Array<{ label: string; value: string }>).map((cell, idx) => {
                        const col = idx % 3;
                        const row = Math.floor(idx / 3);
                        return (
                          <div key={cell.label} style={{
                            padding: '12px 16px',
                            borderRight:  col < 2 ? `1px solid ${C.border}` : 'none',
                            borderBottom: row < 3 ? `1px solid ${C.border}` : 'none',
                          }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: C.textSoft, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>{cell.label}</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{cell.value}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Reason for separation – full width */}
                  <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden', marginBottom: 12 }}>
                    <div style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: C.textSoft, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>REASON FOR SEPARATION</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{record.resignationDetails.reasonForSeparation}</div>
                    </div>
                  </div>

                  {/* Approver + Line Manager */}
                  <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden', marginBottom: 14 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                      <div style={{ padding: '12px 16px', borderRight: `1px solid ${C.border}` }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: C.textSoft, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>APPROVER</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{record.resignationDetails.approver}</div>
                      </div>
                      <div style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: C.textSoft, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>LINE MANAGER</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{record.resignationDetails.lineManager}</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button icon={<DownloadOutlined />} onClick={onExportPdf}>Export PDF</Button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Clearance Report ──────────────────────── */}
          {activeDetailTab === 'clearance' && (
            <div style={{ padding: '16px 18px 18px' }}>
              {record.clearanceReport == null ? (
                <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: '40px 20px', textAlign: 'center', background: C.surface }}>
                  <SafetyOutlined style={{ fontSize: 20, color: C.textSoft, display: 'block', marginBottom: 10 }} />
                  <div style={{ fontSize: 13, color: C.textMuted }}>No clearance report available.</div>
                </div>
              ) : (() => {
                const cr = record.clearanceReport;
                const clearedCount = cr.departments.filter(d => d.status === 'Cleared').length;
                const totalCount   = cr.departments.length;
                const pct = totalCount > 0 ? Math.round((clearedCount / totalCount) * 100) : 0;
                const crColor  = cr.status === 'Cleared' ? C.success : cr.status === 'In Review' ? C.info : C.warning;
                const crBg     = cr.status === 'Cleared' ? C.successBg : cr.status === 'In Review' ? C.infoBg : C.warningBg;
                const crBorder = cr.status === 'Cleared' ? C.successBorder : cr.status === 'In Review' ? C.infoBorder : C.warningBorder;
                return (
                  <>
                    {/* Status + ID + progress summary */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 999, border: `1px solid ${crBorder}`, background: crBg, color: crColor, fontSize: 11, fontWeight: 700 }}>
                          <CheckCircleOutlined style={{ fontSize: 11 }} />
                          {cr.status}
                        </span>
                        <span style={{ fontSize: 12, color: C.textMuted, fontWeight: 600 }}>{cr.clearanceId}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                        <span style={{ fontSize: 11, color: C.textMuted }}>Clearance Progress</span>
                        <span style={{ fontSize: 22, fontWeight: 800, color: C.text, lineHeight: 1 }}>{clearedCount}/{totalCount}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, color: C.textSoft, letterSpacing: '0.07em', textTransform: 'uppercase' }}>DEPARTMENTS CLEARED</span>
                      </div>
                    </div>

                    <Progress
                      percent={pct}
                      strokeColor={pct === 100 ? C.success : C.primary}
                      trailColor="#e5e7eb"
                      size="small"
                      style={{ marginBottom: 14 }}
                    />

                    {/* Departments table */}
                    <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden', marginBottom: 14 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr 1fr', padding: '8px 14px', background: C.surfaceMuted, borderBottom: `1px solid ${C.border}`, gap: 8 }}>
                        {(['DEPARTMENT', 'STATUS', 'APPROVER', 'DATE', 'REMARKS'] as const).map(h => (
                          <div key={h} style={{ fontSize: 10, fontWeight: 700, color: C.textSoft, letterSpacing: '0.07em', textTransform: 'uppercase' }}>{h}</div>
                        ))}
                      </div>
                      {cr.departments.map((dept, idx) => {
                        const dc     = dept.status === 'Cleared' ? C.success : dept.status === 'In Review' ? C.info : C.warning;
                        const dcBg   = dept.status === 'Cleared' ? C.successBg : dept.status === 'In Review' ? C.infoBg : C.warningBg;
                        const dcBord = dept.status === 'Cleared' ? C.successBorder : dept.status === 'In Review' ? C.infoBorder : C.warningBorder;
                        const dIcon  = dept.status === 'Cleared'
                          ? <CheckCircleOutlined style={{ color: C.success, fontSize: 14, flexShrink: 0 }} />
                          : <ClockCircleOutlined style={{ color: dc, fontSize: 14, flexShrink: 0 }} />;
                        return (
                          <div
                            key={dept.department}
                            style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr 1fr', padding: '10px 14px', gap: 8, borderBottom: idx < cr.departments.length - 1 ? `1px solid ${C.border}` : 'none', alignItems: 'center' }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: C.textSecondary }}>
                              {dIcon}
                              {dept.department}
                            </div>
                            <div>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999, border: `1px solid ${dcBord}`, background: dcBg, color: dc, fontSize: 11, fontWeight: 700 }}>
                                <span style={{ width: 5, height: 5, borderRadius: '50%', background: dc, flexShrink: 0 }} />
                                {dept.status}
                              </span>
                            </div>
                            <div style={{ fontSize: 12, color: C.textSecondary }}>{dept.approver}</div>
                            <div style={{ fontSize: 12, color: dept.date ? C.textSecondary : C.textSoft }}>{dept.date || '—'}</div>
                            <div style={{ fontSize: 12, color: C.textSoft }}>{dept.remarks || '—'}</div>
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button icon={<DownloadOutlined />} onClick={onExportPdf}>Export PDF</Button>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FinalSettlementPage() {
  const [settlements, setSettlements] = useState<SettlementRecord[]>(INITIAL_SETTLEMENTS);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'All' | SettlementStatus>('All');
  const [draftFilters, setDraftFilters] = useState<Filters>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [editTarget, setEditTarget] = useState<SettlementRecord | null>(null);

  const departmentOptions = useMemo(
    () => Array.from(new Set(settlements.map(r => r.department))).sort(),
    [settlements],
  );
  const reasonOptions = useMemo(
    () => Array.from(new Set(settlements.map(r => r.reason))).sort(),
    [settlements],
  );

  const filteredBase = useMemo(() => {
    const query = appliedFilters.search.trim().toLowerCase();
    return settlements.filter(record => {
      if (query) {
        const haystack = [record.empName, record.empId, record.department, record.designation].join(' ').toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      if (appliedFilters.department && record.department !== appliedFilters.department) return false;
      if (appliedFilters.reason && record.reason !== appliedFilters.reason) return false;
      if (!matchesAmountBand(getNetPayable(record), appliedFilters.amountBand)) return false;
      return true;
    });
  }, [appliedFilters, settlements]);

  const counts = useMemo(() => {
    const summary: Record<'All' | SettlementStatus, number> = { All: filteredBase.length, Draft: 0, 'Under Review': 0, Approved: 0, Paid: 0, Disputed: 0 };
    filteredBase.forEach(r => { summary[r.status] += 1; });
    return summary;
  }, [filteredBase]);

  const visibleRecords = useMemo(() => {
    if (activeTab === 'All') return filteredBase;
    return filteredBase.filter(r => r.status === activeTab);
  }, [activeTab, filteredBase]);

  const summary = useMemo(() => {
    const totalSettlements = visibleRecords.length;
    const pendingAmount = visibleRecords.filter(r => r.status !== 'Paid').reduce((sum, r) => sum + getNetPayable(r), 0);
    const totalPaid = visibleRecords.filter(r => r.status === 'Paid').reduce((sum, r) => sum + getNetPayable(r), 0);
    const averageSettlement = totalSettlements > 0 ? Math.round(visibleRecords.reduce((sum, r) => sum + getNetPayable(r), 0) / totalSettlements) : 0;
    return { totalSettlements, pendingAmount, totalPaid, averageSettlement };
  }, [visibleRecords]);

  const updateStatus = (id: string, status: SettlementStatus) => {
    setSettlements(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleApply = () => setAppliedFilters(draftFilters);

  const handleReset = () => {
    setDraftFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setActiveTab('All');
  };

  const handleSaveGenerated = (record: SettlementRecord, asDraft: boolean) => {
    setSettlements(prev => [record, ...prev]);
    if (asDraft) {
      message.success(`Draft settlement saved for ${record.empName}.`);
    } else {
      message.success(`Final settlement generated for ${record.empName}.`);
    }
  };

  const handleSaveEdited = (updated: SettlementRecord) => {
    setSettlements(prev => prev.map(r => r.id === updated.id ? updated : r));
    message.success(`Settlement updated for ${updated.empName}.`);
  };

  return (
    <div className="page-shell">
      <div className="page-header-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="module-icon-box">
            <FileDoneOutlined style={{ color: '#fff', fontSize: 15 }} />
          </div>
          <div>
            <h1>Final Settlement</h1>
            <p>Full and final settlement computation, approval, and payment tracking</p>
          </div>
        </div>

        <Space wrap>
          <Button icon={<DownloadOutlined />} onClick={() => downloadCsv(visibleRecords)}>
            Export CSV
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowGenerateModal(true)}>
            Generate New
          </Button>
        </Space>
      </div>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14, marginBottom: 20 }}>
        <MetricCard label="Total Settlements" value={String(summary.totalSettlements)} hint={`${counts['Under Review']} pending review`} accent={C.text} icon={<TeamOutlined />} />
        <MetricCard label="Pending Amount" value={formatCurrency(summary.pendingAmount)} hint={`${Math.max(summary.totalSettlements - counts.Paid, 0)} settlements`} accent={C.warning} icon={<ClockCircleOutlined />} />
        <MetricCard label="Total Paid" value={formatCurrency(summary.totalPaid)} hint={`${counts.Paid} completed`} accent={C.success} icon={<CheckCircleOutlined />} />
        <MetricCard label="Avg Settlement" value={formatCurrency(summary.averageSettlement)} hint="per employee" accent={C.info} icon={<BarChartOutlined />} />
      </div>

      {/* Filter bar */}
      <div className="filter-bar" style={{ marginBottom: showFilters ? 10 : 16 }}>
        <div style={{ flex: '1 1 280px', minWidth: 220 }}>
          <div className="filter-label">SEARCH</div>
          <Input
            allowClear
            prefix={<SearchOutlined style={{ color: C.textSoft }} />}
            placeholder="Search by name, ID, or department..."
            value={draftFilters.search}
            onChange={event => setDraftFilters(prev => ({ ...prev, search: event.target.value }))}
            onPressEnter={handleApply}
          />
        </div>

        <Space wrap style={{ paddingTop: 20 }}>
          <Button type="primary" icon={<SearchOutlined />} onClick={handleApply}>Apply</Button>
          <Button icon={<FilterOutlined />} onClick={() => setShowFilters(v => !v)}>Filters</Button>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>Reset</Button>
        </Space>
      </div>

      {showFilters && (
        <div style={{ padding: '16px 20px', background: '#f8fafc', border: '1px solid #e8edf3', borderLeft: '3px solid #cbd5e1', borderRadius: '0 0 8px 8px', marginTop: -8, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.07em', color: C.textSecondary, textTransform: 'uppercase' }}>Advanced Filtering</span>
            <Button type="link" size="small" onClick={handleReset} style={{ color: C.textMuted, padding: 0, fontSize: 12 }}>Reset All Filters</Button>
          </div>

          <Row gutter={[12, 12]} align="bottom">
            <Col flex="1 1 180px">
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: C.textMuted, marginBottom: 6, textTransform: 'uppercase' }}>Department</div>
              <Select allowClear placeholder="All Departments" value={draftFilters.department || undefined} onChange={value => setDraftFilters(prev => ({ ...prev, department: value ?? '' }))} options={departmentOptions.map(v => ({ label: v, value: v }))} style={{ width: '100%' }} />
            </Col>
            <Col flex="1 1 180px">
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: C.textMuted, marginBottom: 6, textTransform: 'uppercase' }}>Reason</div>
              <Select allowClear placeholder="All Reasons" value={draftFilters.reason || undefined} onChange={value => setDraftFilters(prev => ({ ...prev, reason: value ?? '' }))} options={reasonOptions.map(v => ({ label: v, value: v }))} style={{ width: '100%' }} />
            </Col>
            <Col flex="1 1 180px">
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: C.textMuted, marginBottom: 6, textTransform: 'uppercase' }}>Net Payable Band</div>
              <Select
                allowClear placeholder="Any Amount"
                value={draftFilters.amountBand || undefined}
                onChange={value => setDraftFilters(prev => ({ ...prev, amountBand: (value ?? '') as AmountBand }))}
                options={[
                  { value: 'under-12000', label: 'Under $12,000' },
                  { value: '12000-18000', label: '$12,000 - $18,000' },
                  { value: 'above-18000', label: 'Above $18,000' },
                ]}
                style={{ width: '100%' }}
              />
            </Col>
            <Col flex="0 0 auto">
              <Space>
                <Button type="primary" onClick={handleApply}>Apply</Button>
                <Button onClick={() => setShowFilters(false)}>Close Panel</Button>
              </Space>
            </Col>
          </Row>
        </div>
      )}

      {/* Status tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {FILTER_TABS.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button key={tab.key} type="button" className={`tab-pill${isActive ? ' active' : ''}`} onClick={() => setActiveTab(tab.key)}>
              {tab.label}
              <span style={{ marginLeft: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 18, height: 18, borderRadius: 9, padding: '0 4px', fontSize: 10, fontWeight: 700, background: isActive ? C.primary : '#e5e7eb', color: isActive ? '#ffffff' : C.textMuted, verticalAlign: 'middle' }}>
                {counts[tab.key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Settlement list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {visibleRecords.map(record => (
          <SettlementCard
            key={record.id}
            record={record}
            expanded={expandedIds.has(record.id)}
            onToggle={() => toggleExpanded(record.id)}
            onEdit={() => setEditTarget(record)}
            onSubmitForReview={() => {
              updateStatus(record.id, 'Under Review');
              message.success(`${record.empName}'s settlement moved to Under Review.`);
            }}
            onApprove={() => {
              updateStatus(record.id, 'Approved');
              message.success(`${record.empName}'s settlement approved.`);
            }}
            onDispute={() => {
              updateStatus(record.id, 'Disputed');
              message.warning(`${record.empName}'s settlement marked as disputed.`);
            }}
            onMarkPaid={() => {
              updateStatus(record.id, 'Paid');
              message.success(`${record.empName}'s settlement marked as paid.`);
            }}
            onReopen={() => {
              updateStatus(record.id, 'Under Review');
              message.info(`${record.empName}'s settlement reopened for review.`);
            }}
            onExportPdf={() => message.info(`Exporting settlement PDF for ${record.empName}...`)}
          />
        ))}

        {visibleRecords.length === 0 && (
          <div style={{ border: `1px solid ${C.border}`, borderRadius: 14, background: C.surface, padding: '56px 20px', textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: C.primaryLight, color: C.primary, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <FileDoneOutlined style={{ fontSize: 20 }} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 6 }}>No settlement records found</div>
            <div style={{ fontSize: 13, color: C.textMuted }}>Adjust the current search or filters to see matching employees.</div>
          </div>
        )}
      </div>

      {/* Modals */}
      <GenerateSettlementModal
        open={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        onSave={handleSaveGenerated}
      />

      <EditSettlementModal
        record={editTarget}
        onClose={() => setEditTarget(null)}
        onSave={handleSaveEdited}
      />
    </div>
  );
}
