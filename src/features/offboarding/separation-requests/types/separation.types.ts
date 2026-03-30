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

export interface SeparationRequest {
  id: string;
  empId: string;
  empName: string;
  department: string;
  section: string;
  designation: string;
  dateOfJoining: string;
  /** "YYYY-MM-DD HH:mm" */
  resignationSubmissionDate: string;
  dateOfSeparation: string;
  noticePeriod: number;
  employmentStatus: EmpStatus;
  modeOfSeparation: SepMode;
  status: SepStatus;
  lineManager: { name: string; id: string };
  remarks?: string;
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
    lineManager: { name: 'Robert Kim', id: 'EMP-0110' },
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
    lineManager: { name: 'Sandra Lee', id: 'EMP-0085' },
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
    lineManager: { name: 'Marcus Tan', id: 'EMP-0201' },
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
    lineManager: { name: 'David Park', id: 'EMP-0174' },
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
    lineManager: { name: 'Linda Cruz', id: 'EMP-0143' },
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
    lineManager: { name: 'Priya Sharma', id: 'EMP-0067' },
  },
];
