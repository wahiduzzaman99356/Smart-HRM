// ─── Domain Types ─────────────────────────────────────────────────────────────

export type LoanType   = 'Loan' | 'Advance Salary';
export type LoanStatus = 'To Approve' | 'Approved' | 'Rejected' | 'Cancelled';

export interface LoanRequest {
  id:                   string;
  initiateDate:         string;       // e.g. "20 Feb 2026"
  type:                 LoanType;
  amount:               number;       // total amount (with interest for Loan)
  principalAmount:      number;       // original amount before interest
  interestRate:         number;       // percentage e.g. 10
  installmentNumber:    number;
  // Loan-specific
  loanAmount?:          number;       // raw entered amount
  // Advance Salary-specific
  selectedMonth?:       number;       // how many months of advance
  monthlySalary?:       number;       // employee monthly salary
  // Common
  guarantorEmployeeId:  string;
  guarantorEmployeeName:string;
  reason:               string;
  attachmentName?:      string;
  status:               LoanStatus;
  remarks?:             string;       // Approver remarks
  // Employee context (for Approvals view)
  employeeId:           string;
  employeeName:         string;
  designation:          string;
  department:           string;
  section:              string;
  createdAt:            string;
}

export interface GuarantorEmployee {
  employeeId:   string;
  name:         string;
  designation:  string;
  department:   string;
}

// ─── Static Reference Data ─────────────────────────────────────────────────────

export const EMPLOYEE_MONTHLY_SALARY = 25800;
export const LOAN_INTEREST_RATE      = 10;    // %
export const LOAN_MIN_AMOUNT         = 5000;
export const LOAN_MAX_AMOUNT         = 500000;

export const GUARANTOR_EMPLOYEES: GuarantorEmployee[] = [
  { employeeId: 'TN-99210', name: 'Wahid Uzzaman',   designation: 'Senior Developer',   department: 'IT' },
  { employeeId: 'TN-88401', name: 'Farjana Alim',    designation: 'HR Executive',       department: 'Human Resources' },
  { employeeId: 'TN-77312', name: 'Tahamid Hossain', designation: 'Operations Manager', department: 'Operations' },
  { employeeId: 'TN-66205', name: 'Nasrin Sultana',  designation: 'Accountant',         department: 'Finance' },
];

export const DEPARTMENTS  = ['Business Analysis', 'IT', 'Human Resources', 'Operations', 'Finance', 'Marketing'];
export const DESIGNATIONS = ['Business Analyst', 'Senior Developer', 'HR Executive', 'Operations Manager', 'Accountant'];
export const SECTIONS     = ['Analytics', 'Development', 'Recruitment', 'Planning', 'Accounts'];

export const INSTALLMENT_OPTIONS = [1, 2, 3, 6, 9, 12, 18, 24].map(n => ({ value: n, label: String(n) }));

export const LOAN_POLICY_NOTES = [
  'You may apply for a loan amount between a minimum of 5,000 and a maximum of 500,000 (as per policy limits).',
  'A standard annual interest rate of 8.5% applies. You can choose a flexible repayment schedule of up to 24 months.',
  'For ease of payment, your monthly loan installments will be automatically deducted from your payroll.',
  'To be eligible for this loan, you must maintain a minimum attendance record of 85%.',
  'You are allowed one active loan at a time. After a loan is closed or an application is processed, a 90-day cooling period is required before applying again.',
  'Please ensure all details are accurate; once submitted, your application will be routed for administrative review and approval.',
];

// ─── Status Styles ─────────────────────────────────────────────────────────────

export const STATUS_STYLE: Record<LoanStatus, { color: string; bg: string; border: string }> = {
  'To Approve': { color: '#d97706', bg: 'var(--color-status-pending-bg)', border: 'rgba(252, 211, 77, 0.45)' },
  'Approved':   { color: 'var(--color-primary-dark)', bg: 'var(--color-status-approved-bg)', border: 'var(--color-status-approved-bg)' },
  'Rejected':   { color: '#991b1b', bg: 'var(--color-status-rejected-bg)', border: 'var(--color-status-rejected-bg)' },
  'Cancelled':  { color: 'var(--color-text-secondary)', bg: 'var(--color-bg-subtle)', border: 'var(--color-border)' },
};

// ─── Mock Requests ─────────────────────────────────────────────────────────────

export const INITIAL_LOAN_REQUESTS: LoanRequest[] = [
  {
    id:                    'LN-2026-001',
    initiateDate:          '20 Feb 2026',
    type:                  'Loan',
    amount:                22000,
    principalAmount:       20000,
    interestRate:          10,
    installmentNumber:     2,
    loanAmount:            20000,
    guarantorEmployeeId:   'TN-99210',
    guarantorEmployeeName: 'Wahid Uzzaman',
    reason:                'Home renovation expenses',
    status:                'To Approve',
    employeeId:            'TN-99318',
    employeeName:          'Shanto Karmoker',
    designation:           'Business Analyst',
    department:            'Business Analysis',
    section:               'Analytics',
    createdAt:             '20 Feb 2026, 10:30 AM',
  },
  {
    id:                    'LN-2026-002',
    initiateDate:          '15 Jan 2026',
    type:                  'Advance Salary',
    amount:                51600,
    principalAmount:       51600,
    interestRate:          0,
    installmentNumber:     3,
    selectedMonth:         2,
    monthlySalary:         25800,
    guarantorEmployeeId:   'TN-88401',
    guarantorEmployeeName: 'Farjana Alim',
    reason:                'Educational expenses',
    status:                'Approved',
    remarks:               'Approved as per policy.',
    employeeId:            'TN-99318',
    employeeName:          'Shanto Karmoker',
    designation:           'Business Analyst',
    department:            'Business Analysis',
    section:               'Analytics',
    createdAt:             '15 Jan 2026, 09:00 AM',
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

let _counter = 2;
export function nextLoanRequestId(): string {
  _counter += 1;
  return `LN-2026-${String(_counter).padStart(3, '0')}`;
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
