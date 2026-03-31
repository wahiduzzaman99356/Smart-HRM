export type SepStatus =
  | 'Pending'
  | 'In Progress'
  | 'Completed'
  | 'On Hold'
  | 'Cancelled'
  | 'Rejected';

export type EmpStatus = 'Permanent' | 'Contractual' | 'Probationary' | 'Intern';

export type SepMode =
  | 'Resignation'
  | 'Mutual Agreement'
  | 'End of Contract'
  | 'Termination'
  | 'Retirement'
  | 'Retrenchment';

export interface TimelineEvent {
  action: string;
  date: string;
  by?: string;
}

export type SeparationWorkflowStage =
  | 'Submitted'
  | 'Under Review'
  | 'Clearance'
  | 'Settlement'
  | 'Completed';

export interface FinalDecision {
  outcome: 'End Separation Process' | 'Keep Separation Open';
  date: string;
  by: string;
  notes?: string;
}

export interface SeparationRequest {
  id: string;
  empId: string;
  empName: string;
  department: string;
  section: string;
  designation: string;
  dateOfJoining: string;
  /** "DD-MM-YYYY; HH:MM AM/PM" */
  resignationSubmissionDate: string;
  dateOfSeparation: string;
  noticePeriod: number;
  employmentStatus: EmpStatus;
  modeOfSeparation: SepMode;
  status: SepStatus;
  workflowStage?: SeparationWorkflowStage;
  lineManager: { name: string; id: string };
  reason?: string;
  remarks?: string;
  /** HR-edited values during approval */
  noticePeriodOverride?: number;
  dateOfSeparationOverride?: string;
  rejectionRemarks?: string;
  activityTimeline?: TimelineEvent[];
  finalDecision?: FinalDecision;
}

export const INITIAL_SEPARATIONS: SeparationRequest[] = [
  {
    id: 'SEP-0001',
    empId: 'EMP-0322',
    empName: 'Elena Vasquez',
    department: 'HR',
    section: 'Talent Management',
    designation: 'HR Specialist',
    dateOfJoining: '2015-02-10',
    resignationSubmissionDate: '22-03-2026; 09:15 AM',
    dateOfSeparation: '2026-06-30',
    noticePeriod: 90,
    employmentStatus: 'Permanent',
    modeOfSeparation: 'Retirement',
    status: 'Pending',
    workflowStage: 'Submitted',
    lineManager: { name: 'Robert Kim', id: 'EMP-0110' },
    reason: 'Retirement',
    activityTimeline: [
      { action: 'Separation request created', date: '22-03-2026', by: 'HR Admin' },
      { action: 'Notice period and last working day captured', date: '22-03-2026', by: 'HR Admin' },
    ],
  },
  {
    id: 'SEP-0002',
    empId: 'EMP-0871',
    empName: 'James Rodriguez',
    department: 'Marketing',
    section: 'Digital Marketing',
    designation: 'Marketing Manager',
    dateOfJoining: '2020-09-01',
    resignationSubmissionDate: '20-03-2026; 11:42 AM',
    dateOfSeparation: '2026-04-20',
    noticePeriod: 30,
    employmentStatus: 'Permanent',
    modeOfSeparation: 'Mutual Agreement',
    status: 'Pending',
    workflowStage: 'Submitted',
    lineManager: { name: 'Sandra Lee', id: 'EMP-0085' },
    reason: 'Mutual agreement',
  },
  {
    id: 'SEP-0003',
    empId: 'EMP-0918',
    empName: 'Daniel Okafor',
    department: 'Operations',
    section: 'Logistics',
    designation: 'Operations Lead',
    dateOfJoining: '2019-11-05',
    resignationSubmissionDate: '18-03-2026; 02:05 PM',
    dateOfSeparation: '2026-04-18',
    noticePeriod: 30,
    employmentStatus: 'Permanent',
    modeOfSeparation: 'Retrenchment',
    status: 'On Hold',
    workflowStage: 'Clearance',
    lineManager: { name: 'Marcus Tan', id: 'EMP-0201' },
    reason: 'Business restructuring',
    remarks: 'Awaiting finance clearance sign-off before next action.',
    activityTimeline: [
      { action: 'Separation request created', date: '18-03-2026', by: 'HR Admin' },
      { action: 'Request approved for workflow processing', date: '20-03-2026', by: 'HR Admin' },
      { action: 'Request placed on hold pending finance confirmation', date: '25-03-2026', by: 'HR Admin' },
    ],
  },
  {
    id: 'SEP-0004',
    empId: 'EMP-1042',
    empName: 'Sarah Chen',
    department: 'Engineering',
    section: 'Frontend',
    designation: 'Sr. Software Engineer',
    dateOfJoining: '2021-06-15',
    resignationSubmissionDate: '15-03-2026; 08:30 AM',
    dateOfSeparation: '2026-04-15',
    noticePeriod: 60,
    employmentStatus: 'Permanent',
    modeOfSeparation: 'Resignation',
    status: 'In Progress',
    workflowStage: 'Clearance',
    lineManager: { name: 'David Park', id: 'EMP-0174' },
    reason: 'Career growth opportunity',
    activityTimeline: [
      { action: 'Resignation submitted', date: '15-03-2026', by: 'Sarah Chen' },
      { action: 'Request approved for offboarding workflow', date: '17-03-2026', by: 'HR Admin' },
      { action: 'Clearance workflow started', date: '17-03-2026', by: 'HR Admin' },
    ],
  },
  {
    id: 'SEP-0005',
    empId: 'EMP-1105',
    empName: 'Michael Thompson',
    department: 'Sales',
    section: 'Enterprise Sales',
    designation: 'Account Executive',
    dateOfJoining: '2022-01-20',
    resignationSubmissionDate: '10-03-2026; 04:55 PM',
    dateOfSeparation: '2026-03-25',
    noticePeriod: 120,
    employmentStatus: 'Probationary',
    modeOfSeparation: 'Termination',
    status: 'In Progress',
    workflowStage: 'Settlement',
    lineManager: { name: 'Linda Cruz', id: 'EMP-0143' },
    reason: 'Performance-based termination',
    activityTimeline: [
      { action: 'Separation request created', date: '10-03-2026', by: 'HR Admin' },
      { action: 'Request approved for workflow processing', date: '11-03-2026', by: 'HR Admin' },
      { action: 'Exit clearance initiated', date: '12-03-2026', by: 'HR Admin' },
      { action: 'Final settlement is being processed', date: '25-03-2026', by: 'Payroll Team' },
    ],
  },
  {
    id: 'SEP-0006',
    empId: 'EMP-0654',
    empName: 'Aisha Patel',
    department: 'Finance',
    section: 'Accounts Payable',
    designation: 'Financial Analyst',
    dateOfJoining: '2023-04-10',
    resignationSubmissionDate: '28-02-2026; 10:20 AM',
    dateOfSeparation: '2026-03-28',
    noticePeriod: 15,
    employmentStatus: 'Contractual',
    modeOfSeparation: 'End of Contract',
    status: 'Completed',
    workflowStage: 'Completed',
    lineManager: { name: 'Priya Sharma', id: 'EMP-0067' },
    reason: 'Contract completed',
    activityTimeline: [
      { action: 'Separation request created', date: '28-02-2026', by: 'HR Admin' },
      { action: 'Request approved for workflow processing', date: '01-03-2026', by: 'HR Admin' },
      { action: 'Final settlement completed', date: '28-03-2026', by: 'Payroll Team' },
      { action: 'Final decision recorded', date: '29-03-2026', by: 'HR Admin' },
    ],
    finalDecision: {
      outcome: 'End Separation Process',
      date: '29-03-2026',
      by: 'HR Admin',
      notes: 'All clearance and settlement checkpoints are complete. Separation process is closed.',
    },
  },
];
