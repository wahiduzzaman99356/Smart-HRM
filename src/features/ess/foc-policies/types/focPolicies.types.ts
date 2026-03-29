export type FocScope = 'Domestic' | 'International';

export type FocStatus =
  | 'Draft'
  | 'Pending Approval'
  | 'Approved & Active'
  | 'Approved & Inactive'
  | 'Rejected';

export type ApplicabilityMode = 'Job Grade Level' | 'Specific Designations' | 'Specific Work Location';

export interface CycleRule {
  id: string;
  yearLabel: string;
  ticketType: string;
  ticketCount: number;
}

export interface SeatAllocationRule {
  id: string;
  aircraft: string;
  ticketType: string;
  maxSeats: number;
}

export interface RouteEligibilityRule {
  id: string;
  operator: 'Less Than' | 'More Than' | 'Range';
  fromYear: number;
  toYear: number | null;
  routeCode: string;
}

export interface FocPolicyConfig {
  policyName: string;
  effectiveDate: string;
  hasExpiryDate: boolean;
  expiryDate: string;
  applicabilityMode: ApplicabilityMode;
  gradeLevels: string[];
  designations: string[];
  workLocations: string[];
  restrictedGradeLevels: string[];
  restrictedDesignations: string[];
  restrictedWorkLocations: string[];
  nationality: string;
  yearsAfterConfirmation: number;
  eligibilityBasis: 'Confirmation' | 'Joining';
  cycleRules: CycleRule[];
  selfTicketEnabled: boolean;
  selfTicketCount: number;
  selfEntitlementEnabled: boolean;
  carryForwardEnabled: boolean;
  carryForwardCount: number;
  allowParents: boolean;
  allowSpouse: boolean;
  allowChildren: boolean;
  allowUnmarriedChildrenOnly: boolean;
  maxChildren: number;
  childAgeLimitYears: number;
  childrenMaritalStatus: 'Any' | 'Unmarried' | 'Married';
  allowAdoptedChildren: boolean;
  parentEligibilityYears: number;
  parentTransferTarget: 'Children' | 'Spouse' | 'Family';
  parentTicketCount: number;
  parentRuleEnabled: boolean;
  parentFrequency: 'Lifetime' | 'Year Range' | 'Annual';
  parentYearRange: number;
  requirePassportValidation: boolean;
  passportValidityMonths: number;
  termsAndConditions: string;
  routeEligibilityRules: RouteEligibilityRule[];
}

export interface FocPolicy {
  id: string;
  policyName: string;
  scope: FocScope;
  effectiveDate: string;
  applicability: string;
  createdBy: string;
  status: FocStatus;
  updatedAt: string;
  approvedBy?: string;
  approvalNote?: string;
  config: FocPolicyConfig;
}

export const STATUS_COLORS: Record<FocStatus, { bg: string; fg: string; border: string }> = {
  Draft: {
    bg: '#f8fafc',
    fg: '#64748b',
    border: '#cbd5e1',
  },
  'Pending Approval': {
    bg: '#fff7ed',
    fg: '#d97706',
    border: '#fed7aa',
  },
  'Approved & Active': {
    bg: '#ecfdf5',
    fg: '#059669',
    border: '#a7f3d0',
  },
  'Approved & Inactive': {
    bg: '#eef2ff',
    fg: '#4f46e5',
    border: '#c7d2fe',
  },
  Rejected: {
    bg: '#fef2f2',
    fg: '#dc2626',
    border: '#fecaca',
  },
};

export const AIRCRAFT_TYPES = ['ATR', 'B737', 'A320', 'Q400'];
export const TICKET_TYPES = ['Confirm', 'Subload', 'Standby'];
export const GRADE_LEVELS = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6'];
export const DESIGNATIONS = ['Captain', 'GM', 'Manager', 'Engineer', 'Analyst'];
export const WORK_LOCATIONS = ['Dhaka HQ', 'CXB', 'JED', 'DAC', 'USA', 'BKK'];

export const INITIAL_SEAT_RULES: SeatAllocationRule[] = [
  { id: 'SR-1', aircraft: 'ATR', ticketType: 'Confirm', maxSeats: 4 },
  { id: 'SR-2', aircraft: 'B737', ticketType: 'Confirm', maxSeats: 8 },
];

const baseConfig = (scope: FocScope): FocPolicyConfig => ({
  policyName: scope === 'Domestic' ? 'Annual Staff Tickets 2026' : 'Expat Global Travel Rules',
  effectiveDate: '2026-01-01',
  hasExpiryDate: true,
  expiryDate: '2026-12-31',
  applicabilityMode: scope === 'International' ? 'Specific Work Location' : 'Job Grade Level',
  gradeLevels: scope === 'Domestic' ? ['G1', 'G2', 'G3'] : ['G4', 'G5'],
  designations: scope === 'Domestic' ? [] : ['Captain', 'GM'],
  workLocations: scope === 'International' ? ['USA'] : [],
  restrictedGradeLevels: scope === 'International' ? ['G1'] : [],
  restrictedDesignations: scope === 'Domestic' ? ['Engineer'] : [],
  restrictedWorkLocations: scope === 'Domestic' ? ['CXB'] : ['Dhaka HQ'],
  nationality: 'Bangladeshi',
  yearsAfterConfirmation: scope === 'International' ? 2 : 1,
  eligibilityBasis: 'Confirmation',
  cycleRules: [
    { id: 'CY-1', yearLabel: '1st Year', ticketType: 'Subload', ticketCount: 1 },
    { id: 'CY-2', yearLabel: '2nd Year', ticketType: 'Confirm', ticketCount: 1 },
  ],
  selfTicketEnabled: true,
  selfTicketCount: 1,
  selfEntitlementEnabled: true,
  carryForwardEnabled: true,
  carryForwardCount: 2,
  allowParents: true,
  allowSpouse: true,
  allowChildren: true,
  allowUnmarriedChildrenOnly: true,
  maxChildren: 2,
  childAgeLimitYears: 18,
  childrenMaritalStatus: 'Unmarried',
  allowAdoptedChildren: true,
  parentEligibilityYears: 5,
  parentTransferTarget: 'Children',
  parentTicketCount: 1,
  parentRuleEnabled: true,
  parentFrequency: 'Lifetime',
  parentYearRange: 5,
  requirePassportValidation: scope === 'International',
  passportValidityMonths: 6,
  termsAndConditions: '<p>FOC usage is subject to ticket class availability and approved service rules.</p>',
  routeEligibilityRules:
    scope === 'International'
      ? [
          { id: 'RE-1', operator: 'Less Than', fromYear: 5, toYear: null, routeCode: 'DAC' },
          { id: 'RE-2', operator: 'Range', fromYear: 5, toYear: 7, routeCode: 'JED' },
          { id: 'RE-3', operator: 'More Than', fromYear: 7, toYear: null, routeCode: 'BKK' },
        ]
      : [],
});

export const INITIAL_POLICIES: FocPolicy[] = [
  {
    id: 'FOC-1001',
    policyName: 'Annual Staff Tickets 2026',
    scope: 'Domestic',
    effectiveDate: '2026-01-01',
    applicability: 'G1, G2, G3',
    createdBy: 'HR Admin',
    status: 'Approved & Active',
    updatedAt: '2026-01-03T10:05:00.000Z',
    approvedBy: 'Head of HR',
    config: baseConfig('Domestic'),
  },
  {
    id: 'FOC-1002',
    policyName: 'Expat Global Travel Rules',
    scope: 'International',
    effectiveDate: '2026-01-01',
    applicability: 'Captains, GM',
    createdBy: 'Travel Desk',
    status: 'Pending Approval',
    updatedAt: '2026-01-05T09:30:00.000Z',
    config: baseConfig('International'),
  },
  {
    id: 'FOC-1003',
    policyName: 'Managerial Upgrade Policy',
    scope: 'Domestic',
    effectiveDate: '2026-06-01',
    applicability: 'G4, G5',
    createdBy: 'Comp & Ben',
    status: 'Draft',
    updatedAt: '2026-01-08T07:15:00.000Z',
    config: {
      ...baseConfig('Domestic'),
      policyName: 'Managerial Upgrade Policy',
      gradeLevels: ['G4', 'G5'],
      restrictedDesignations: ['Analyst'],
    },
  },
  {
    id: 'FOC-1004',
    policyName: 'Legacy International Tier',
    scope: 'International',
    effectiveDate: '2025-07-01',
    applicability: 'G5, G6',
    createdBy: 'Travel Desk',
    status: 'Approved & Inactive',
    updatedAt: '2026-01-02T08:50:00.000Z',
    approvedBy: 'Head of HR',
    config: { ...baseConfig('International'), policyName: 'Legacy International Tier' },
  },
  {
    id: 'FOC-1005',
    policyName: 'Seasonal Route Trial',
    scope: 'International',
    effectiveDate: '2026-03-01',
    applicability: 'Specific work location',
    createdBy: 'Travel Ops',
    status: 'Rejected',
    updatedAt: '2026-01-09T11:40:00.000Z',
    approvalNote: 'Eligibility matrix incomplete for parents rule.',
    config: { ...baseConfig('International'), policyName: 'Seasonal Route Trial' },
  },
];
