// ─── Domain Types ─────────────────────────────────────────────────────────────

export type ShiftChangeType = 'Change' | 'Exchange';

export type ShiftRequestStatus = 'To Approve' | 'Approved' | 'Rejected' | 'Cancelled';

export interface Shift {
  id: string;
  name: string;
  timeRange: string;
  policy?: string;
}

export interface ExchangeableEmployee {
  employeeId: string;
  name: string;
  designation: string;
  department: string;
  section: string;
  shift: string;
}

export interface ShiftChangeRequest {
  id: string;
  date: string;                        // e.g. "20 Feb 2026"
  requestType: ShiftChangeType;
  fromShift: Shift;
  toShift: Shift;
  exchangeWith?: ExchangeableEmployee;   // Exchange type — peer selected by approver
  assignedEmployee?: ExchangeableEmployee; // Change type — employee assigned by approver to the new shift
  reason: string;
  status: ShiftRequestStatus;
  remarks?: string;                    // Approver remarks (mandatory on reject)
  // Employee context (used in Approvals view)
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  section: string;
  createdAt: string;
}

// ─── Static Reference Data ─────────────────────────────────────────────────────

export const AVAILABLE_SHIFTS: Shift[] = [
  { id: 'GEN_A', name: 'General A', timeRange: '09:00 AM - 06:00 PM', policy: 'Standard 8-hour shift with 1 hour lunch break.' },
  { id: 'GEN_B', name: 'General B', timeRange: '10:00 AM - 07:00 PM', policy: 'Standard 8-hour shift with 1 hour lunch break.' },
  { id: 'MORNING', name: 'Morning', timeRange: '06:00 AM - 02:00 PM', policy: 'Early morning shift, maximum 3 exchanges per month.' },
  { id: 'EVENING', name: 'Evening', timeRange: '02:00 PM - 10:00 PM', policy: 'Evening shift, eligible for shift allowance.' },
  { id: 'NIGHT', name: 'Night', timeRange: '10:00 PM - 06:00 AM', policy: 'Night shift, night allowance applicable.' },
];

export const CURRENT_EMPLOYEE_SHIFT: Shift = AVAILABLE_SHIFTS[0]; // General A

export const EXCHANGEABLE_EMPLOYEES: ExchangeableEmployee[] = [
  { employeeId: 'TN-99318', name: 'Shanto Karmoker',  designation: 'Business Analyst',  department: 'Business Analysis', section: 'Analytics', shift: '10:00 AM - 07:00 PM' },
  { employeeId: 'TN-99210', name: 'Wahid Uzzaman',    designation: 'Senior Developer',   department: 'IT',                 section: 'Development', shift: '10:00 AM - 07:00 PM' },
  { employeeId: 'TN-88401', name: 'Farjana Alim',     designation: 'HR Executive',       department: 'Human Resources',    section: 'Recruitment', shift: '10:00 AM - 07:00 PM' },
  { employeeId: 'TN-77312', name: 'Tahamid Hossain',  designation: 'Operations Manager', department: 'Operations',          section: 'Planning',    shift: '10:00 AM - 07:00 PM' },
];

export const DEPARTMENTS  = ['Business Analysis', 'IT', 'Human Resources', 'Operations', 'Finance', 'Marketing'];
export const DESIGNATIONS = ['Business Analyst', 'Senior Developer', 'HR Executive', 'Operations Manager', 'Accountant'];
export const SECTIONS     = ['Analytics', 'Development', 'Recruitment', 'Planning', 'Accounts'];

// ─── Mock Requests ─────────────────────────────────────────────────────────────

export const INITIAL_SHIFT_REQUESTS: ShiftChangeRequest[] = [
  {
    id: 'SCR-2026-001',
    date: '20 Feb 2026',
    requestType: 'Exchange',
    fromShift: AVAILABLE_SHIFTS[0],
    toShift: AVAILABLE_SHIFTS[1],
    exchangeWith: EXCHANGEABLE_EMPLOYEES[0],
    reason: 'Personal commitment',
    status: 'To Approve',
    employeeId: 'TN-99318',
    employeeName: 'Shanto Karmoker',
    designation: 'Business Analyst',
    department: 'Business Analysis',
    section: 'Analytics',
    createdAt: '15 Feb 2026, 10:30 AM',
  },
  {
    id: 'SCR-2026-002',
    date: '15 Feb 2026',
    requestType: 'Change',
    fromShift: AVAILABLE_SHIFTS[0],
    toShift: AVAILABLE_SHIFTS[2],
    reason: 'Medical appointment in the morning',
    status: 'Approved',
    remarks: 'Approved as one-time exception.',
    employeeId: 'TN-99318',
    employeeName: 'Shanto Karmoker',
    designation: 'Business Analyst',
    department: 'Business Analysis',
    section: 'Analytics',
    createdAt: '10 Feb 2026, 09:15 AM',
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

export const STATUS_STYLE: Record<ShiftRequestStatus, { color: string; bg: string; border: string }> = {
  'To Approve': { color: '#d97706', bg: 'var(--color-status-pending-bg)', border: 'rgba(252, 211, 77, 0.45)' },
  'Approved':   { color: 'var(--color-primary-dark)', bg: 'var(--color-status-approved-bg)', border: 'var(--color-status-approved-bg)' },
  'Rejected':   { color: '#991b1b', bg: 'var(--color-status-rejected-bg)', border: 'var(--color-status-rejected-bg)' },
  'Cancelled':  { color: 'var(--color-text-secondary)', bg: 'var(--color-bg-subtle)', border: 'var(--color-border)' },
};

let _counter = 2;
export function nextRequestId(): string {
  _counter += 1;
  return `SCR-2026-${String(_counter).padStart(3, '0')}`;
}

export function nowTs(): string {
  return new Date().toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}
