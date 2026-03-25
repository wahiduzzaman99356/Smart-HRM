export type OutstationPurpose  = 'Work From Home' | 'Others Concern Visit';
export type RadiusUnit         = 'Kilometer' | 'Meter';
export type DateSelectionMode  = 'specific' | 'date-range';
export type AttendanceStatus   = 'Present' | 'Late' | 'Early Leave' | 'Absent';

// ─── Attendance Record ─────────────────────────────────────────────────────────

export interface AttendanceRecord {
  date:         string;          // YYYY-MM-DD
  status:       AttendanceStatus;
  checkInTime:  string | null;   // e.g. "09:05 AM"
  checkOutTime: string | null;
  checkInLat:   number | null;
  checkInLng:   number | null;
  checkOutLat:  number | null;
  checkOutLng:  number | null;
  remarks:      string;
  proofFileName:string | null;
}

export const ATTENDANCE_STATUS_STYLE: Record<AttendanceStatus, { color: string; bg: string; border: string }> = {
  'Present':     { color: '#065f46', bg: '#d1fae5', border: '#6ee7b7' },
  'Late':        { color: '#92400e', bg: '#fef3c7', border: '#fcd34d' },
  'Early Leave': { color: '#1e40af', bg: '#dbeafe', border: '#93c5fd' },
  'Absent':      { color: '#991b1b', bg: '#fee2e2', border: '#fca5a5' },
};

export const INITIAL_ATTENDANCE: Record<string, AttendanceRecord[]> = {
  'OS-1001': [
    {
      date: '2026-03-20',
      status: 'Present',
      checkInTime: '09:03 AM',
      checkOutTime: '06:04 PM',
      checkInLat: 23.8103,
      checkInLng: 90.4125,
      checkOutLat: 23.8104,
      checkOutLng: 90.4126,
      remarks: 'Worked from approved home location.',
      proofFileName: 'attendance_2026_03_20.jpg',
    },
    {
      date: '2026-03-21',
      status: 'Late',
      checkInTime: '09:41 AM',
      checkOutTime: '06:02 PM',
      checkInLat: 23.8103,
      checkInLng: 90.4125,
      checkOutLat: 23.8104,
      checkOutLng: 90.4126,
      remarks: 'Late check-in due to network outage.',
      proofFileName: 'attendance_2026_03_21.jpg',
    },
  ],
  'OS-1002': [
    {
      date: '2026-03-22',
      status: 'Present',
      checkInTime: '07:01 AM',
      checkOutTime: '03:02 PM',
      checkInLat: 23.7937,
      checkInLng: 90.4066,
      checkOutLat: 23.7937,
      checkOutLng: 90.4066,
      remarks: 'Client visit completed and signed off.',
      proofFileName: 'visit_2026_03_22.jpg',
    },
  ],
};

export interface Employee {
  id: string;
  name: string;
  department: string;
  designation: string;
  section: string;
}

export interface ShiftOption {
  id: string;
  name: string;
  start: string;
  end: string;
}

export interface LocationDraft {
  id: string;
  query: string;
  lat: number;
  lng: number;
  radiusUnit: RadiusUnit;
  radiusValue: number;
}

export interface OutstationAuditLog {
  id: string;
  action: string;
  actor: string;
  at: string;
  note: string;
}

export interface OutstationSetup {
  id: string;
  employeeId: string;
  employeeName: string;
  purpose: OutstationPurpose;
  status: 'Active' | 'Inactive';
  shiftId: string;
  shiftLabel: string;
  dateMode: DateSelectionMode;
  specificDates: string[];
  dateRange: [string, string] | null;
  locations: LocationDraft[];
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  auditLogs: OutstationAuditLog[];
}

export const PURPOSE_OPTIONS: OutstationPurpose[] = [
  'Work From Home',
  'Others Concern Visit',
];

export const SHIFT_OPTIONS: ShiftOption[] = [
  { id: 'general', name: 'General', start: '09:00 AM', end: '06:00 PM' },
  { id: 'morning', name: 'Morning', start: '07:00 AM', end: '03:00 PM' },
  { id: 'evening', name: 'Evening', start: '03:00 PM', end: '11:00 PM' },
];

export const EMPLOYEES: Employee[] = [
  {
    id: 'TN-99318',
    name: 'Shanto Karmoker',
    department: 'Business Analysis',
    designation: 'Business Analyst',
    section: 'Corporate',
  },
  {
    id: 'TN-99319',
    name: 'Wahiduzzaman',
    department: 'Business Analysis',
    designation: 'Business Analyst',
    section: 'Corporate',
  },
  {
    id: 'TN-99325',
    name: 'Nadia Tasnim',
    department: 'Operations',
    designation: 'Senior Executive',
    section: 'Field Ops',
  },
  {
    id: 'TN-99342',
    name: 'Rakibul Hasan',
    department: 'Technology',
    designation: 'Software Engineer',
    section: 'Platform',
  },
];

export const MAP_CENTER = { lat: 23.8103, lng: 90.4125 };

export const INITIAL_SETUPS: OutstationSetup[] = [
  {
    id: 'OS-1001',
    employeeId: 'TN-99318',
    employeeName: 'Shanto Karmoker',
    purpose: 'Work From Home',
    status: 'Active',
    shiftId: 'general',
    shiftLabel: 'General (09:00 AM - 06:00 PM)',
    dateMode: 'specific',
    specificDates: ['2026-03-20', '2026-03-22'],
    dateRange: null,
    locations: [
      {
        id: 'LOC-1',
        query: 'Dhaka Cantonment, Dhaka, Bangladesh',
        lat: 23.8103,
        lng: 90.4125,
        radiusUnit: 'Kilometer',
        radiusValue: 1.0,
      },
      {
        id: 'LOC-2',
        query: 'DOHS Baridhara Main Road, Dhaka, Bangladesh',
        lat: 23.8021,
        lng: 90.4251,
        radiusUnit: 'Kilometer',
        radiusValue: 1.5,
      },
    ],
    createdBy: 'Admin User',
    createdAt: '2026-02-20T15:09:00',
    updatedBy: 'Admin User',
    updatedAt: '2026-02-20T15:09:00',
    auditLogs: [
      {
        id: 'AL-1001-1',
        action: 'Created',
        actor: 'Admin User',
        at: '2026-02-20T15:09:00',
        note: 'Initial outstation setup created with 2 locations.',
      },
    ],
  },
  {
    id: 'OS-1002',
    employeeId: 'TN-99319',
    employeeName: 'Wahiduzzaman',
    purpose: 'Others Concern Visit',
    status: 'Active',
    shiftId: 'morning',
    shiftLabel: 'Morning (07:00 AM - 03:00 PM)',
    dateMode: 'date-range',
    specificDates: [],
    dateRange: ['2026-03-18', '2026-03-25'],
    locations: [
      {
        id: 'LOC-3',
        query: 'Gulshan 2, Dhaka, Bangladesh',
        lat: 23.7937,
        lng: 90.4066,
        radiusUnit: 'Meter',
        radiusValue: 500,
      },
    ],
    createdBy: 'Admin User',
    createdAt: '2026-02-18T11:30:00',
    updatedBy: 'Admin User',
    updatedAt: '2026-02-19T10:15:00',
    auditLogs: [
      {
        id: 'AL-1002-1',
        action: 'Created',
        actor: 'Admin User',
        at: '2026-02-18T11:30:00',
        note: 'Initial outstation setup created with date range.',
      },
      {
        id: 'AL-1002-2',
        action: 'Updated',
        actor: 'Admin User',
        at: '2026-02-19T10:15:00',
        note: 'Radius updated to 500 meter.',
      },
    ],
  },
];
