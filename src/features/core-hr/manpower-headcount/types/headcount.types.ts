// ─── Headcount Domain Types ────────────────────────────────────────────────────

export type HCStatus = 'Draft' | 'Pending' | 'Approved' | 'Rejected';

export const PLAN_YEAR_OPTIONS = [
  { value: 'FY 2026 (Jan - Dec)', label: 'FY 2026 (Jan - Dec)' },
  { value: 'FY 2025 (Jan - Dec)', label: 'FY 2025 (Jan - Dec)' },
  { value: 'FY 2024 (Jan - Dec)', label: 'FY 2024 (Jan - Dec)' },
  { value: 'FY 2023 (Jan - Dec)', label: 'FY 2023 (Jan - Dec)' },
];

/** One row in the headcount request form (one org-level / designation). */
export interface HCOrgLevelRow {
  id: string;
  orgLevelPath: string;  // "Flight Operations > Director Flight Operations"
  department: string;    // dept key
  designation: string;
  currentHC: number;
  requiredHC: string;
  budgetRange: string;
  justification: string;
}

/** One step in the multi-level approval workflow. */
export interface ApprovalStep {
  approverName: string;
  approverId: string;
  action: 'Approved' | 'Rejected' | 'Pending';
  timestamp?: string;
  reason?: string;
  note?: string;
}

/** One entry in the audit / action history log. */
export interface ActionHistoryEntry {
  initiatedBy: string;
  timestamp: string;
  actionType: 'Created' | 'Submitted' | 'Approved' | 'Rejected' | 'Updated';
}

/** Full headcount request record. */
export interface HCRequest {
  id: string;
  planYear: string;
  initiationDate: string;
  rows: HCOrgLevelRow[];
  status: HCStatus;
  totalReqHC: number;
  totalApprHC: number | null;
  approvalWorkflow: ApprovalStep[];
  actionHistory: ActionHistoryEntry[];
}

// ─── Seed data ────────────────────────────────────────────────────────────────
export const INITIAL_REQUESTS: HCRequest[] = [
  {
    id: 'TSL-2026-00142',
    planYear: 'FY 2026 (Jan - Dec)',
    initiationDate: '20 Jan 2026',
    status: 'Draft',
    totalReqHC: 10,
    totalApprHC: 9,
    rows: [
      {
        id: 'row-1',
        orgLevelPath: 'Flight Operations > Captain ATR 72-600',
        department: 'flight_ops',
        designation: 'Captain ATR 72-600',
        currentHC: 2,
        requiredHC: '10',
        budgetRange: '',
        justification: '',
      },
    ],
    approvalWorkflow: [
      {
        approverName: 'Farjana Alim',
        approverId: '999',
        action: 'Approved',
        timestamp: '20 Jan 2026, 10:30 AM',
      },
      {
        approverName: 'Tahamid',
        approverId: '007',
        action: 'Rejected',
        timestamp: '20 Jan 2026, 11:15 AM',
        reason: 'Budget needs reconsideration',
        note: 'NOTE: EXCEEDS ANNUAL BUDGET CAP.',
      },
      {
        approverName: 'Approver 3',
        approverId: '',
        action: 'Pending',
      },
    ],
    actionHistory: [
      { initiatedBy: 'Shanto (Admin)',   timestamp: '20 Jan 2026, 10:30:22 AM', actionType: 'Created'  },
      { initiatedBy: 'Wahid (Manager)',  timestamp: '20 Jan 2026, 10:34:22 AM', actionType: 'Approved' },
    ],
  },
  {
    id: 'TSL-2026-00143',
    planYear: 'FY 2026 (Jan - Dec)',
    initiationDate: '21 Jan 2026',
    status: 'Approved',
    totalReqHC: 15,
    totalApprHC: null,
    rows: [
      {
        id: 'row-1',
        orgLevelPath: 'Ground Operations > Passenger Service Agent',
        department: 'ground_operations',
        designation: 'Passenger Service Agent',
        currentHC: 3,
        requiredHC: '15',
        budgetRange: '',
        justification: '',
      },
    ],
    approvalWorkflow: [
      { approverName: 'Carlos Mendez', approverId: '101', action: 'Approved', timestamp: '21 Jan 2026, 09:00 AM' },
      { approverName: 'Farjana Alim',  approverId: '999', action: 'Approved', timestamp: '21 Jan 2026, 10:00 AM' },
    ],
    actionHistory: [
      { initiatedBy: 'Shanto (Admin)', timestamp: '21 Jan 2026, 08:00:00 AM', actionType: 'Created'  },
      { initiatedBy: 'Carlos Mendez', timestamp: '21 Jan 2026, 09:00:00 AM', actionType: 'Approved' },
    ],
  },
];
