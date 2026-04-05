// ─── Domain Types ─────────────────────────────────────────────────────────────

export type PFLoanStatus = 'To Approve' | 'Approved' | 'Rejected' | 'Cancelled';

export interface PFGuarantorEmployee {
  employeeId: string;
  name: string;
  designation: string;
  department: string;
}

export interface PFLoanRequest {
  id: string;
  initiateDate: string;       // e.g. "20 Feb 2026"
  loanAmount: number;
  reason: string;
  guarantorEmployeeId: string;
  guarantorEmployeeName: string;
  attachmentName?: string;
  status: PFLoanStatus;
  remarks?: string;           // Approver remarks
  // Employee context (used in Approvals view)
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  section: string;
  createdAt: string;
}

export interface PFBalance {
  currentBalance: number;
  employeeContribution: number;
  employerContribution: number;
}

// ─── Static Reference Data ─────────────────────────────────────────────────────

export const CURRENT_EMPLOYEE_PF_BALANCE: PFBalance = {
  currentBalance:       7890,
  employeeContribution: 4890,
  employerContribution: 3000,
};

export const GUARANTOR_EMPLOYEES: PFGuarantorEmployee[] = [
  { employeeId: 'TN-99210', name: 'Wahid Uzzaman',    designation: 'Senior Developer',   department: 'IT' },
  { employeeId: 'TN-88401', name: 'Farjana Alim',     designation: 'HR Executive',       department: 'Human Resources' },
  { employeeId: 'TN-77312', name: 'Tahamid Hossain',  designation: 'Operations Manager', department: 'Operations' },
  { employeeId: 'TN-66205', name: 'Nasrin Sultana',   designation: 'Accountant',         department: 'Finance' },
];

export const DEPARTMENTS  = ['Business Analysis', 'IT', 'Human Resources', 'Operations', 'Finance', 'Marketing'];
export const DESIGNATIONS = ['Business Analyst', 'Senior Developer', 'HR Executive', 'Operations Manager', 'Accountant'];
export const SECTIONS     = ['Analytics', 'Development', 'Recruitment', 'Planning', 'Accounts'];

export const PF_POLICY_NOTES = [
  'Provident Fund contributions will start only after your employment confirmation.',
  'The employer\'s contribution cannot be redeemed during employment and will only be payable at the time of separation from the company.',
  'Withdrawal of the employer\'s accumulated PF amount will follow the service eligibility policy:',
  'Employees with 3 years of service will receive 5% of the employer\'s accumulated PF amount.',
  'Employees with more than 5 years of service will receive 10% of the employer\'s accumulated PF amount.',
  'Employees may apply for a PF loan of up to 80% of their own contributed amount.',
  'Approved PF loans will become effective 30 days after the request date.',
  'The loan repayment period is 3 months, and the amount will be automatically deducted from the employee\'s salary.',
];

// ─── Mock Requests ─────────────────────────────────────────────────────────────

export const INITIAL_PF_REQUESTS: PFLoanRequest[] = [
  {
    id: 'PF-2026-001',
    initiateDate: '20 Feb 2026',
    loanAmount: 5000,
    reason: 'Medical emergency expenses',
    guarantorEmployeeId: 'TN-99210',
    guarantorEmployeeName: 'Wahid Uzzaman',
    attachmentName: 'medical_report.pdf',
    status: 'To Approve',
    employeeId: 'TN-99318',
    employeeName: 'Shanto Karmoker',
    designation: 'Business Analyst',
    department: 'Business Analysis',
    section: 'Analytics',
    createdAt: '20 Feb 2026, 10:30 AM',
  },
  {
    id: 'PF-2026-002',
    initiateDate: '15 Jan 2026',
    loanAmount: 3000,
    reason: 'Home renovation',
    guarantorEmployeeId: 'TN-88401',
    guarantorEmployeeName: 'Farjana Alim',
    status: 'Approved',
    remarks: 'Approved as per policy.',
    employeeId: 'TN-99318',
    employeeName: 'Shanto Karmoker',
    designation: 'Business Analyst',
    department: 'Business Analysis',
    section: 'Analytics',
    createdAt: '15 Jan 2026, 09:00 AM',
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

export const STATUS_STYLE: Record<PFLoanStatus, { color: string; bg: string; border: string }> = {
  'To Approve': { color: '#d97706', bg: 'var(--color-status-pending-bg)', border: 'rgba(252, 211, 77, 0.45)' },
  'Approved':   { color: 'var(--color-primary-dark)', bg: 'var(--color-status-approved-bg)', border: 'var(--color-status-approved-bg)' },
  'Rejected':   { color: '#991b1b', bg: 'var(--color-status-rejected-bg)', border: 'var(--color-status-rejected-bg)' },
  'Cancelled':  { color: 'var(--color-text-secondary)', bg: 'var(--color-bg-subtle)', border: 'var(--color-border)' },
};

let _counter = 2;
export function nextPFRequestId(): string {
  _counter += 1;
  return `PF-2026-${String(_counter).padStart(3, '0')}`;
}

export function nowTs(): string {
  return new Date().toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

export function todayLabel(): string {
  return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
