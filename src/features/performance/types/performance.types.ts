/**
 * performance.types.ts
 */

export type KPIPerspective = 'Financial' | 'Customer' | 'Internal Process' | 'Learning & Growth';
export type KPIType = 'Quantitative' | 'Qualitative';
export type MeasurementFrequency = 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';
export type EvalStatus = 'Pending' | 'Submitted' | 'Reviewed' | 'Finalized';
export type KPICategory = 'Leave' | 'Attendance' | 'Manual' | 'Disciplinary Ground';
export type KPIEvalType = 'Confirmation KPI' | 'Evaluation' | 'Appraisal';
export type ComparisonOperator = '>=' | '<=' | '>' | '<' | '=';
export type LeaveType = 'All' | 'Sick Leave' | 'Casual Leave' | 'Earned Leave';
export type DisciplinaryType = 'Show Cause' | 'Warning';

// ── Achievement Level types ───────────────────────────────────────────────────
export type ScoreOperator = 'more_than' | 'less_than' | 'range';
export type IncrementType = 'above' | 'exact' | 'no_increment';

export interface AchievementLevelRow {
  id: string;
  name: string;
  scoreOperator: ScoreOperator;
  scoreValue: number;
  scoreFrom: number;
  scoreTo: number;
  incrementType: IncrementType;
  incrementPercent: number;
}

export interface AchievementLevelConfig {
  id: string;
  department: string;
  section: string;
  designation: string;
  levels: AchievementLevelRow[];
}

export const INITIAL_ACHIEVEMENT_LEVEL_CONFIGS: AchievementLevelConfig[] = [
  {
    id: 'alc-1',
    department: 'Human Resources',
    section: 'General HR',
    designation: 'HOD',
    levels: [
      { id: 'l1', name: 'Outstanding',    scoreOperator: 'more_than', scoreValue: 90, scoreFrom: 0,  scoreTo: 0,  incrementType: 'above',        incrementPercent: 25 },
      { id: 'l2', name: 'Excellent',      scoreOperator: 'range',     scoreValue: 0,  scoreFrom: 75, scoreTo: 89, incrementType: 'above',        incrementPercent: 15 },
      { id: 'l3', name: 'Good',           scoreOperator: 'range',     scoreValue: 0,  scoreFrom: 60, scoreTo: 74, incrementType: 'exact',        incrementPercent: 10 },
      { id: 'l4', name: 'Average',        scoreOperator: 'range',     scoreValue: 0,  scoreFrom: 45, scoreTo: 59, incrementType: 'exact',        incrementPercent: 5  },
      { id: 'l5', name: 'Below Average',  scoreOperator: 'less_than', scoreValue: 45, scoreFrom: 0,  scoreTo: 0,  incrementType: 'no_increment', incrementPercent: 0  },
    ],
  },
  {
    id: 'alc-2',
    department: 'Human Resources',
    section: 'Recruitment',
    designation: 'Executive-HR',
    levels: [
      { id: 'l6', name: 'Outstanding', scoreOperator: 'more_than', scoreValue: 85, scoreFrom: 0,  scoreTo: 0,  incrementType: 'above',        incrementPercent: 20 },
      { id: 'l7', name: 'Good',        scoreOperator: 'range',     scoreValue: 0,  scoreFrom: 65, scoreTo: 85, incrementType: 'exact',        incrementPercent: 10 },
      { id: 'l8', name: 'Poor',        scoreOperator: 'less_than', scoreValue: 65, scoreFrom: 0,  scoreTo: 0,  incrementType: 'no_increment', incrementPercent: 0  },
    ],
  },
  {
    id: 'alc-3',
    department: 'IT',
    section: 'Development',
    designation: 'Software Engineer',
    levels: [
      { id: 'l9',  name: 'Exceptional', scoreOperator: 'more_than', scoreValue: 88, scoreFrom: 0,  scoreTo: 0,  incrementType: 'above',        incrementPercent: 22 },
      { id: 'l10', name: 'Proficient',  scoreOperator: 'range',     scoreValue: 0,  scoreFrom: 70, scoreTo: 88, incrementType: 'above',        incrementPercent: 12 },
      { id: 'l11', name: 'Developing',  scoreOperator: 'range',     scoreValue: 0,  scoreFrom: 50, scoreTo: 69, incrementType: 'exact',        incrementPercent: 5  },
      { id: 'l12', name: 'Needs Work',  scoreOperator: 'less_than', scoreValue: 50, scoreFrom: 0,  scoreTo: 0,  incrementType: 'no_increment', incrementPercent: 0  },
    ],
  },
];

export interface DesignationConfig {
  designation: string;
  department?: string;
  section?: string;
  weight: number;
  operator: ComparisonOperator;
  targetValue: number;
  responsibleTo: string[];
  frequency: MeasurementFrequency;
}

// ── Department → Section → Designation mapping ────────────────────────────────
export interface DeptSectionDesig {
  department: string;
  section: string;
  designations: string[];
}

export const DEPT_SECTION_DESIG_MAP: DeptSectionDesig[] = [
  { department: 'Human Resources', section: 'General HR',       designations: ['HOD', 'Senior Manager'] },
  { department: 'Human Resources', section: 'Recruitment',      designations: ['Executive-HR'] },
  { department: 'Human Resources', section: 'Training & Dev',   designations: ['Executive-HR'] },
  { department: 'Finance & Admin', section: 'Insurance',        designations: ['Executive-Insurance'] },
  { department: 'Finance & Admin', section: 'Payroll',          designations: ['Executive-Payroll'] },
  { department: 'Compliance',      section: 'Vetting & Audit',  designations: ['Executive-Vetting'] },
  { department: 'IT',              section: 'Development',      designations: ['Software Engineer'] },
  { department: 'Sales',           section: 'Sales Operations', designations: ['Sales Executive'] },
  { department: 'Operations',      section: 'General Ops',      designations: ['Operations Manager'] },
  { department: 'Executive',       section: 'Management',       designations: ['CEO / MD'] },
];

export interface MainKPIArea {
  id: string;
  code: string;
  name: string;
  perspective: KPIPerspective;
  weight: number;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export interface SubKPI {
  id: string;
  code: string;
  name: string;
  mainKPIAreaId: string;
  mainKPIAreaName: string;
  mainKPICode: string;
  measurementCriteria: string;
  markOutOf?: number;
  category: KPICategory;
  leaveType?: LeaveType;
  disciplinaryType?: DisciplinaryType;
  evalType: KPIEvalType;
  designationConfigs: DesignationConfig[];
  type: KPIType;
  unit: string;
  weight: number;
  targetValue: number;
  minValue: number;
  maxValue: number;
  measurementFrequency: MeasurementFrequency;
  formula: string;
  description: string;
  isActive: boolean;
}

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  designation: string;
  department: string;
  section: string;
  avatarColor: string;
}

export interface EmployeeSubKPIConfig {
  subKPIId: string;
  mainKPIAreaId: string;
  source: 'default' | 'added';
  weight: number;
  operator: ComparisonOperator;
  targetValue: number;
  responsibleTo: string[];
  isRemoved: boolean;
}

// ── KPI Change Approval Workflow ──────────────────────────────────────────────
export type KPIChangeStatus = 'Pending' | 'Approved' | 'Rejected';

export interface KPIChangeDetail {
  type: 'added' | 'removed' | 'modified';
  subKPIId: string;
  subKPIName: string;
  subKPICode: string;
  mainKPIAreaId: string;
  mainKPIAreaName: string;
  mainKPICode: string;
  // For added/modified
  newWeight?: number;
  newOperator?: ComparisonOperator;
  newTargetValue?: number;
  newResponsibleTo?: string[];
  // For modified (previous values)
  prevWeight?: number;
  prevOperator?: ComparisonOperator;
  prevTargetValue?: number;
}

export interface KPIChangeRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeDesignation: string;
  employeeDepartment: string;
  employeeSection: string;
  employeeAvatarColor: string;
  requestedBy: string;
  requestedAt: string;
  status: KPIChangeStatus;
  changes: KPIChangeDetail[];
  reviewedBy?: string;
  reviewedAt?: string;
  remarks?: string;
  /** Full proposed config snapshot — applied to empKPIMap on approval */
  proposedConfigs: EmployeeSubKPIConfig[];
}

export interface EmployeeKPIRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  period: string;
  kpiAreaName: string;
  subKPIName: string;
  targetValue: number;
  achievedValue: number;
  achievementPct: number;
  weightedScore: number;
  achievementLevel: string;
  status: EvalStatus;
}

export interface DesignationMatrix {
  id: string;
  designation: string;
  department: string;
  kpiAreaId: string;
  kpiAreaName: string;
  perspective: KPIPerspective;
  weight: number;
  isActive: boolean;
}

export interface AchievementLevel {
  id: string;
  code: string;
  name: string;
  minScore: number;
  maxScore: number;
  color: string;
  description: string;
  rating: number;
  isActive: boolean;
}

// ── Helper type for compact designation config creation ───────────────────────
type DC = DesignationConfig;
const dc = (
  designation: string,
  weight: number,
  operator: ComparisonOperator,
  targetValue: number,
  responsibleTo: string[],
  frequency: MeasurementFrequency
): DC => ({ designation, weight, operator, targetValue, responsibleTo, frequency });

// ══════════════════════════════════════════════════════════════════════════════
// INITIAL DATA
// ══════════════════════════════════════════════════════════════════════════════

export const INITIAL_MAIN_KPI_AREAS: MainKPIArea[] = [
  { id: 'mk-area-01', code: 'MK-01', name: 'Strategic HR & Organizational Development', perspective: 'Internal Process', weight: 10, description: 'HR strategy, organizational development, policy governance.', isActive: true, createdAt: '2026-01-01' },
  { id: 'mk-area-02', code: 'MK-02', name: 'Talent Acquisition & Workforce Management', perspective: 'Customer',         weight: 10, description: 'Recruitment, onboarding, workforce planning.', isActive: true, createdAt: '2026-01-01' },
  { id: 'mk-area-03', code: 'MK-03', name: 'Regulatory & Labor Law Compliance',          perspective: 'Internal Process', weight: 8,  description: 'BLA compliance, legal audit, regulatory reporting.', isActive: true, createdAt: '2026-01-01' },
  { id: 'mk-area-04', code: 'MK-04', name: 'Training & Development',                      perspective: 'Learning & Growth', weight: 9, description: 'Training programs, skill development, learning ROI.', isActive: true, createdAt: '2026-01-01' },
  { id: 'mk-area-05', code: 'MK-05', name: 'Performance Management',                      perspective: 'Internal Process', weight: 9,  description: 'Appraisal cycle, PIP management, KPI calibration.', isActive: true, createdAt: '2026-01-01' },
  { id: 'mk-area-06', code: 'MK-06', name: 'Payroll & Compensation Management',           perspective: 'Financial',        weight: 9,  description: 'Payroll accuracy, compensation benchmarking.', isActive: true, createdAt: '2026-01-01' },
  { id: 'mk-area-07', code: 'MK-07', name: 'Employee Engagement & Culture',               perspective: 'Customer',         weight: 8,  description: 'Engagement surveys, culture initiatives, retention.', isActive: true, createdAt: '2026-01-01' },
  { id: 'mk-area-08', code: 'MK-08', name: 'Leadership & Team Management',                perspective: 'Learning & Growth', weight: 7, description: 'Leadership pipeline, 360 feedback, team effectiveness.', isActive: true, createdAt: '2026-01-01' },
  { id: 'mk-area-09', code: 'MK-09', name: 'Safety, Security & Risk Management',          perspective: 'Internal Process', weight: 8,  description: 'Incident management, safety audits, risk mitigation.', isActive: true, createdAt: '2026-01-01' },
  { id: 'mk-area-10', code: 'MK-10', name: 'HR Administration & HRIS',                    perspective: 'Internal Process', weight: 7,  description: 'HRIS management, data integrity, document processing.', isActive: true, createdAt: '2026-01-01' },
  { id: 'mk-area-11', code: 'MK-11', name: 'HR Analytics & Reporting',                    perspective: 'Learning & Growth', weight: 7, description: 'HR metrics, dashboards, data-driven decision making.', isActive: true, createdAt: '2026-01-01' },
  { id: 'mk-area-12', code: 'MK-12', name: 'Attendance & Leave Management',               perspective: 'Internal Process', weight: 8,  description: 'Attendance compliance, leave tracking, absenteeism.', isActive: true, createdAt: '2026-01-01' },
];

export const ALL_DESIGNATIONS = [
  'HOD', 'Executive-HR', 'Executive-Insurance', 'Executive-Payroll',
  'Executive-Vetting', 'Senior Manager', 'CEO / MD', 'HR Executive',
  'Software Engineer', 'Sales Executive', 'Operations Manager',
];

export const MOCK_EMPLOYEES = [
  'Ahmed Rahman', 'Fatima Islam', 'Nasrin Akter', 'Karim Hossain',
  'Priya Das', 'Rahim Uddin', 'Sultana Begum', 'Jahangir Alam',
  'Roksana Khatun', 'Minhajul Abedin', 'Sharmin Jahan', 'Tanvir Ahmed',
];

// ── Sub KPIs ──────────────────────────────────────────────────────────────────
// Designation shorthands
const HOD   = 'HOD';
const EHR   = 'Executive-HR';
const EINS  = 'Executive-Insurance';
const EPAY  = 'Executive-Payroll';
const EVET  = 'Executive-Vetting';

export const INITIAL_SUB_KPIS: SubKPI[] = [
  // ── MK-01: Strategic HR ────────────────────────────────────────────────────
  {
    id: 'sk-01-01', code: 'MK-01-01', name: 'HR Strategic Plan Implementation',
    mainKPIAreaId: 'mk-area-01', mainKPIAreaName: 'Strategic HR & Organizational Development', mainKPICode: 'MK-01',
    measurementCriteria: 'Approved HR Plan vs. Achieved Milestones', category: 'Manual', evalType: 'Evaluation',
    designationConfigs: [
      dc(HOD, 5, '>=', 90, ['Line Manager'], 'Quarterly'),
      dc(EHR, 4, '>=', 85, ['Line Manager'], 'Quarterly'),
    ],
    type: 'Quantitative', unit: '%', weight: 5, targetValue: 90, minValue: 0, maxValue: 100, measurementFrequency: 'Quarterly', formula: 'Milestones achieved / Total milestones x 100', description: '', isActive: true,
  },
  {
    id: 'sk-01-02', code: 'MK-01-02', name: 'Manpower Planning Accuracy',
    mainKPIAreaId: 'mk-area-01', mainKPIAreaName: 'Strategic HR & Organizational Development', mainKPICode: 'MK-01',
    measurementCriteria: 'Variance between approved manpower budget & actual headcount', category: 'Manual', evalType: 'Evaluation',
    designationConfigs: [
      dc(HOD, 3, '<=', 5, ['HR'], 'Monthly'),
      dc(EHR, 3, '<=', 5, ['HR'], 'Monthly'),
    ],
    type: 'Quantitative', unit: '%', weight: 3, targetValue: 5, minValue: 0, maxValue: 20, measurementFrequency: 'Monthly', formula: '|Actual - Budget| / Budget x 100', description: '', isActive: true,
  },
  {
    id: 'sk-01-03', code: 'MK-01-03', name: 'Succession Planning Coverage',
    mainKPIAreaId: 'mk-area-01', mainKPIAreaName: 'Strategic HR & Organizational Development', mainKPICode: 'MK-01',
    measurementCriteria: 'Identified successors for key positions', category: 'Manual', evalType: 'Evaluation',
    designationConfigs: [
      dc(HOD, 2, '>=', 80, ['HR'], 'Quarterly'),
      dc(EHR, 2, '>=', 75, ['HR'], 'Quarterly'),
    ],
    type: 'Quantitative', unit: '%', weight: 2, targetValue: 80, minValue: 0, maxValue: 100, measurementFrequency: 'Quarterly', formula: 'Positions with successor / Total key positions x 100', description: '', isActive: true,
  },
  {
    id: 'sk-01-04', code: 'MK-01-04', name: 'Policy Development & Revision',
    mainKPIAreaId: 'mk-area-01', mainKPIAreaName: 'Strategic HR & Organizational Development', mainKPICode: 'MK-01',
    measurementCriteria: 'Policies developed and approved per plan', category: 'Manual', evalType: 'Evaluation',
    designationConfigs: [
      dc(HOD, 5, '>=', 100, ['HR'], 'Quarterly'),
      dc(EHR, 4, '>=', 100, ['Line Manager'], 'Quarterly'),
      dc(EINS, 3, '>=', 90, ['Line Manager'], 'Quarterly'),
      dc(EPAY, 3, '>=', 90, ['Line Manager'], 'Quarterly'),
    ],
    type: 'Quantitative', unit: '%', weight: 5, targetValue: 100, minValue: 0, maxValue: 100, measurementFrequency: 'Quarterly', formula: 'Policies approved / Target count x 100', description: '', isActive: true,
  },

  // ── MK-02: Talent Acquisition ──────────────────────────────────────────────
  {
    id: 'sk-02-01', code: 'MK-02-01', name: 'Time to Fill',
    mainKPIAreaId: 'mk-area-02', mainKPIAreaName: 'Talent Acquisition & Workforce Management', mainKPICode: 'MK-02',
    measurementCriteria: 'Average days from requisition to joining', category: 'Manual', evalType: 'Evaluation',
    designationConfigs: [
      dc(HOD,  3, '<=', 60, ['HR'],           'Monthly'),
      dc(EHR,  5, '<=', 60, ['Line Manager'], 'Monthly'),
      dc(EINS, 2, '<=', 60, ['HR'],           'Monthly'),
    ],
    type: 'Quantitative', unit: 'Days', weight: 5, targetValue: 60, minValue: 0, maxValue: 90, measurementFrequency: 'Monthly', formula: 'Sum(Days to fill) / Filled positions', description: '', isActive: true,
  },
  {
    id: 'sk-02-02', code: 'MK-02-02', name: 'Quality of Hire',
    mainKPIAreaId: 'mk-area-02', mainKPIAreaName: 'Talent Acquisition & Workforce Management', mainKPICode: 'MK-02',
    measurementCriteria: '6-month performance review rating of new hires', category: 'Manual', evalType: 'Evaluation',
    designationConfigs: [
      dc(HOD, 3, '>=', 80, ['HR'],           'Quarterly'),
      dc(EHR, 5, '>=', 80, ['Line Manager'], 'Quarterly'),
    ],
    type: 'Quantitative', unit: '%', weight: 5, targetValue: 80, minValue: 0, maxValue: 100, measurementFrequency: 'Quarterly', formula: '(New hire 6-month rating / Max rating) x 100', description: '', isActive: true,
  },
  {
    id: 'sk-02-03', code: 'MK-02-03', name: 'Hiring Compliance',
    mainKPIAreaId: 'mk-area-02', mainKPIAreaName: 'Talent Acquisition & Workforce Management', mainKPICode: 'MK-02',
    measurementCriteria: 'Recruitment per policy, aviation regulatory and BLA requirements', category: 'Manual', evalType: 'Evaluation',
    designationConfigs: [
      dc(HOD, 3, '>=', 100, ['HR'],           'Quarterly'),
      dc(EHR, 5, '>=', 100, ['Line Manager'], 'Quarterly'),
    ],
    type: 'Quantitative', unit: '%', weight: 5, targetValue: 100, minValue: 0, maxValue: 100, measurementFrequency: 'Quarterly', formula: 'Compliant hires / Total hires x 100', description: '', isActive: true,
  },
  {
    id: 'sk-02-04', code: 'MK-02-04', name: 'Offer Acceptance Rate',
    mainKPIAreaId: 'mk-area-02', mainKPIAreaName: 'Talent Acquisition & Workforce Management', mainKPICode: 'MK-02',
    measurementCriteria: 'Accepted offers vs issued offers', category: 'Manual', evalType: 'Evaluation',
    designationConfigs: [
      dc(HOD, 2, '>=', 85, ['HR'],           'Monthly'),
      dc(EHR, 4, '>=', 85, ['Line Manager'], 'Monthly'),
    ],
    type: 'Quantitative', unit: '%', weight: 4, targetValue: 85, minValue: 0, maxValue: 100, measurementFrequency: 'Monthly', formula: 'Accepted offers / Total offers x 100', description: '', isActive: true,
  },
  {
    id: 'sk-02-05', code: 'MK-02-05', name: 'HR Audit Follow-up & Closure',
    mainKPIAreaId: 'mk-area-02', mainKPIAreaName: 'Talent Acquisition & Workforce Management', mainKPICode: 'MK-02',
    measurementCriteria: 'Timely corrective action on HR audit findings', category: 'Manual', evalType: 'Evaluation',
    designationConfigs: [
      dc(HOD, 3, '>=', 90, ['HR'],           'Quarterly'),
      dc(EHR, 3, '>=', 90, ['Line Manager'], 'Quarterly'),
    ],
    type: 'Quantitative', unit: '%', weight: 3, targetValue: 90, minValue: 0, maxValue: 100, measurementFrequency: 'Quarterly', formula: 'Closed findings / Total findings x 100', description: '', isActive: true,
  },

  // ── MK-03: Regulatory & Compliance ─────────────────────────────────────────
  {
    id: 'sk-03-01', code: 'MK-03-01', name: 'BLA Compliance Rate',
    mainKPIAreaId: 'mk-area-03', mainKPIAreaName: 'Regulatory & Labor Law Compliance', mainKPICode: 'MK-03',
    measurementCriteria: 'Adherence to Bangladesh Labor Act requirements', category: 'Manual', evalType: 'Evaluation',
    designationConfigs: [
      dc(HOD,  4, '>=', 100, ['HR'],           'Quarterly'),
      dc(EHR,  3, '>=', 100, ['Line Manager'], 'Quarterly'),
      dc(EVET, 5, '>=', 100, ['Line Manager'], 'Quarterly'),
    ],
    type: 'Quantitative', unit: '%', weight: 4, targetValue: 100, minValue: 0, maxValue: 100, measurementFrequency: 'Quarterly', formula: 'Compliant clauses / Total clauses x 100', description: '', isActive: true,
  },
  {
    id: 'sk-03-02', code: 'MK-03-02', name: 'Legal Documentation Accuracy',
    mainKPIAreaId: 'mk-area-03', mainKPIAreaName: 'Regulatory & Labor Law Compliance', mainKPICode: 'MK-03',
    measurementCriteria: 'Accuracy and completeness of legal documents', category: 'Manual', evalType: 'Evaluation',
    designationConfigs: [
      dc(HOD,  3, '>=', 98, ['HR'],           'Monthly'),
      dc(EHR,  3, '>=', 95, ['Line Manager'], 'Monthly'),
      dc(EVET, 4, '>=', 98, ['HR'],           'Monthly'),
    ],
    type: 'Quantitative', unit: '%', weight: 3, targetValue: 98, minValue: 0, maxValue: 100, measurementFrequency: 'Monthly', formula: 'Accurate docs / Total docs x 100', description: '', isActive: true,
  },
  {
    id: 'sk-03-03', code: 'MK-03-03', name: 'Regulatory Audit Score',
    mainKPIAreaId: 'mk-area-03', mainKPIAreaName: 'Regulatory & Labor Law Compliance', mainKPICode: 'MK-03',
    measurementCriteria: 'Score from external regulatory audit', category: 'Manual', evalType: 'Evaluation',
    designationConfigs: [
      dc(HOD,  5, '>=', 85, ['HR'],           'Yearly'),
      dc(EHR,  3, '>=', 80, ['Line Manager'], 'Yearly'),
      dc(EVET, 5, '>=', 90, ['HR'],           'Yearly'),
    ],
    type: 'Quantitative', unit: '%', weight: 5, targetValue: 85, minValue: 0, maxValue: 100, measurementFrequency: 'Yearly', formula: 'Audit points achieved / Total points x 100', description: '', isActive: true,
  },

  // ── MK-04: Training & Development ──────────────────────────────────────────
  {
    id: 'sk-04-01', code: 'MK-04-01', name: 'Training Completion Rate',
    mainKPIAreaId: 'mk-area-04', mainKPIAreaName: 'Training & Development', mainKPICode: 'MK-04',
    measurementCriteria: 'Employees completing mandatory training', category: 'Manual', evalType: 'Evaluation',
    designationConfigs: [
      dc(HOD, 4, '>=', 95, ['HR'],           'Quarterly'),
      dc(EHR, 5, '>=', 95, ['Line Manager'], 'Quarterly'),
    ],
    type: 'Quantitative', unit: '%', weight: 4, targetValue: 95, minValue: 0, maxValue: 100, measurementFrequency: 'Quarterly', formula: 'Trained employees / Total employees x 100', description: '', isActive: true,
  },
  {
    id: 'sk-04-02', code: 'MK-04-02', name: 'Training Effectiveness Score',
    mainKPIAreaId: 'mk-area-04', mainKPIAreaName: 'Training & Development', mainKPICode: 'MK-04',
    measurementCriteria: 'Post-training assessment average score', category: 'Manual', evalType: 'Evaluation',
    designationConfigs: [
      dc(HOD, 3, '>=', 75, ['HR'],           'Quarterly'),
      dc(EHR, 4, '>=', 75, ['Line Manager'], 'Quarterly'),
    ],
    type: 'Quantitative', unit: '%', weight: 3, targetValue: 75, minValue: 0, maxValue: 100, measurementFrequency: 'Quarterly', formula: 'Sum of scores / Number of trainees', description: '', isActive: true,
  },
  {
    id: 'sk-04-03', code: 'MK-04-03', name: 'Skill Gap Closure Rate',
    mainKPIAreaId: 'mk-area-04', mainKPIAreaName: 'Training & Development', mainKPICode: 'MK-04',
    measurementCriteria: 'Identified skill gaps addressed through training', category: 'Manual', evalType: 'Evaluation',
    designationConfigs: [
      dc(HOD, 3, '>=', 70, ['HR'],           'Yearly'),
      dc(EHR, 4, '>=', 70, ['Line Manager'], 'Yearly'),
    ],
    type: 'Quantitative', unit: '%', weight: 3, targetValue: 70, minValue: 0, maxValue: 100, measurementFrequency: 'Yearly', formula: 'Gaps addressed / Total gaps identified x 100', description: '', isActive: true,
  },

  // ── MK-05: Performance Management ──────────────────────────────────────────
  {
    id: 'sk-05-01', code: 'MK-05-01', name: 'Appraisal Cycle Completion',
    mainKPIAreaId: 'mk-area-05', mainKPIAreaName: 'Performance Management', mainKPICode: 'MK-05',
    measurementCriteria: 'Appraisals completed on time', category: 'Manual', evalType: 'Evaluation',
    designationConfigs: [
      dc(HOD, 4, '>=', 100, ['HR'],           'Quarterly'),
      dc(EHR, 5, '>=', 100, ['Line Manager'], 'Quarterly'),
    ],
    type: 'Quantitative', unit: '%', weight: 4, targetValue: 100, minValue: 0, maxValue: 100, measurementFrequency: 'Quarterly', formula: 'Completed appraisals / Total appraisals x 100', description: '', isActive: true,
  },
  {
    id: 'sk-05-02', code: 'MK-05-02', name: 'PIP Conversion Rate',
    mainKPIAreaId: 'mk-area-05', mainKPIAreaName: 'Performance Management', mainKPICode: 'MK-05',
    measurementCriteria: 'Employees who improved after PIP', category: 'Manual', evalType: 'Evaluation',
    designationConfigs: [
      dc(HOD, 3, '>=', 60, ['HR'],           'Quarterly'),
      dc(EHR, 3, '>=', 60, ['Line Manager'], 'Quarterly'),
    ],
    type: 'Quantitative', unit: '%', weight: 3, targetValue: 60, minValue: 0, maxValue: 100, measurementFrequency: 'Quarterly', formula: 'PIP successes / Total PIPs x 100', description: '', isActive: true,
  },
  {
    id: 'sk-05-03', code: 'MK-05-03', name: 'KPI Calibration Accuracy',
    mainKPIAreaId: 'mk-area-05', mainKPIAreaName: 'Performance Management', mainKPICode: 'MK-05',
    measurementCriteria: 'Consistency of KPI ratings across departments', category: 'Manual', evalType: 'Evaluation',
    designationConfigs: [
      dc(HOD, 3, '>=', 85, ['HR'],           'Yearly'),
      dc(EHR, 3, '>=', 85, ['Line Manager'], 'Yearly'),
    ],
    type: 'Quantitative', unit: '%', weight: 3, targetValue: 85, minValue: 0, maxValue: 100, measurementFrequency: 'Yearly', formula: 'Calibrated scores / Total ratings x 100', description: '', isActive: true,
  },

  // ── MK-06: Payroll & Compensation ──────────────────────────────────────────
  {
    id: 'sk-06-01', code: 'MK-06-01', name: 'Payroll Accuracy Rate',
    mainKPIAreaId: 'mk-area-06', mainKPIAreaName: 'Payroll & Compensation Management', mainKPICode: 'MK-06',
    measurementCriteria: 'Payroll processed without errors', category: 'Manual', evalType: 'Evaluation',
    designationConfigs: [
      dc(HOD,  3, '>=', 99, ['HR'],           'Monthly'),
      dc(EHR,  2, '>=', 98, ['Line Manager'], 'Monthly'),
      dc(EPAY, 5, '>=', 99, ['HR'],           'Monthly'),
    ],
    type: 'Quantitative', unit: '%', weight: 5, targetValue: 99, minValue: 0, maxValue: 100, measurementFrequency: 'Monthly', formula: '(1 - Errors/Total) x 100', description: '', isActive: true,
  },
  {
    id: 'sk-06-02', code: 'MK-06-02', name: 'On-Time Payment Rate',
    mainKPIAreaId: 'mk-area-06', mainKPIAreaName: 'Payroll & Compensation Management', mainKPICode: 'MK-06',
    measurementCriteria: 'Salary disbursed within scheduled date', category: 'Manual', evalType: 'Evaluation',
    designationConfigs: [
      dc(HOD,  3, '=', 100, ['HR'],           'Monthly'),
      dc(EHR,  2, '=', 100, ['Line Manager'], 'Monthly'),
      dc(EPAY, 5, '=', 100, ['HR'],           'Monthly'),
    ],
    type: 'Quantitative', unit: '%', weight: 5, targetValue: 100, minValue: 0, maxValue: 100, measurementFrequency: 'Monthly', formula: 'On-time payments / Total payments x 100', description: '', isActive: true,
  },
  {
    id: 'sk-06-03', code: 'MK-06-03', name: 'Payroll Dispute Resolution Time',
    mainKPIAreaId: 'mk-area-06', mainKPIAreaName: 'Payroll & Compensation Management', mainKPICode: 'MK-06',
    measurementCriteria: 'Average days to resolve payroll disputes', category: 'Manual', evalType: 'Evaluation',
    designationConfigs: [
      dc(HOD,  2, '<=', 3, ['HR'],           'Monthly'),
      dc(EHR,  2, '<=', 3, ['Line Manager'], 'Monthly'),
      dc(EPAY, 4, '<=', 3, ['HR'],           'Monthly'),
    ],
    type: 'Quantitative', unit: 'Days', weight: 4, targetValue: 3, minValue: 0, maxValue: 30, measurementFrequency: 'Monthly', formula: 'Sum of days / Total disputes', description: '', isActive: true,
  },

  // ── MK-07: Employee Engagement ─────────────────────────────────────────────
  {
    id: 'sk-07-01', code: 'MK-07-01', name: 'Employee Engagement Score',
    mainKPIAreaId: 'mk-area-07', mainKPIAreaName: 'Employee Engagement & Culture', mainKPICode: 'MK-07',
    measurementCriteria: 'Annual engagement survey average score', category: 'Manual', evalType: 'Evaluation',
    designationConfigs: [
      dc(HOD, 5, '>=', 75, ['HR'],           'Yearly'),
      dc(EHR, 5, '>=', 75, ['Line Manager'], 'Yearly'),
    ],
    type: 'Quantitative', unit: '%', weight: 5, targetValue: 75, minValue: 0, maxValue: 100, measurementFrequency: 'Yearly', formula: 'Survey sum / Total respondents', description: '', isActive: true,
  },
  {
    id: 'sk-07-02', code: 'MK-07-02', name: 'Voluntary Turnover Rate',
    mainKPIAreaId: 'mk-area-07', mainKPIAreaName: 'Employee Engagement & Culture', mainKPICode: 'MK-07',
    measurementCriteria: 'Voluntary resignations vs. average headcount', category: 'Attendance', evalType: 'Evaluation',
    designationConfigs: [
      dc(HOD, 5, '<=', 5, ['HR'],           'Quarterly'),
      dc(EHR, 4, '<=', 5, ['Line Manager'], 'Quarterly'),
    ],
    type: 'Quantitative', unit: '%', weight: 5, targetValue: 5, minValue: 0, maxValue: 50, measurementFrequency: 'Quarterly', formula: 'Voluntary exits / Avg headcount x 100', description: '', isActive: true,
  },
  {
    id: 'sk-07-03', code: 'MK-07-03', name: 'eNPS Score',
    mainKPIAreaId: 'mk-area-07', mainKPIAreaName: 'Employee Engagement & Culture', mainKPICode: 'MK-07',
    measurementCriteria: 'Employee Net Promoter Score', category: 'Manual', evalType: 'Evaluation',
    designationConfigs: [
      dc(HOD, 4, '>=', 30, ['HR'],           'Yearly'),
      dc(EHR, 4, '>=', 30, ['Line Manager'], 'Yearly'),
    ],
    type: 'Quantitative', unit: 'Score', weight: 4, targetValue: 30, minValue: -100, maxValue: 100, measurementFrequency: 'Yearly', formula: '(Promoters - Detractors) / Total x 100', description: '', isActive: true,
  },

  // ── MK-08: Leadership & Team Management ────────────────────────────────────
  {
    id: 'sk-08-01', code: 'MK-08-01', name: '360-Degree Feedback Score',
    mainKPIAreaId: 'mk-area-08', mainKPIAreaName: 'Leadership & Team Management', mainKPICode: 'MK-08',
    measurementCriteria: 'Average 360 feedback score for leaders', category: 'Manual', evalType: 'Evaluation',
    designationConfigs: [
      dc(HOD, 5, '>=', 3.5, ['HR'],           'Yearly'),
      dc(EHR, 3, '>=', 3.5, ['Line Manager'], 'Yearly'),
    ],
    type: 'Quantitative', unit: 'Rating', weight: 5, targetValue: 80, minValue: 0, maxValue: 5, measurementFrequency: 'Yearly', formula: 'Sum of ratings / Number rated', description: '', isActive: true,
  },
  {
    id: 'sk-08-02', code: 'MK-08-02', name: 'Leadership Pipeline Strength',
    mainKPIAreaId: 'mk-area-08', mainKPIAreaName: 'Leadership & Team Management', mainKPICode: 'MK-08',
    measurementCriteria: 'Identified leaders ready for promotion', category: 'Manual', evalType: 'Evaluation',
    designationConfigs: [
      dc(HOD, 4, '>=', 70, ['HR'],           'Yearly'),
      dc(EHR, 3, '>=', 70, ['Line Manager'], 'Yearly'),
    ],
    type: 'Quantitative', unit: '%', weight: 4, targetValue: 70, minValue: 0, maxValue: 100, measurementFrequency: 'Yearly', formula: 'Ready leaders / Leadership positions x 100', description: '', isActive: true,
  },

  // ── MK-09: Safety, Security & Risk ─────────────────────────────────────────
  {
    id: 'sk-09-01', code: 'MK-09-01', name: 'Incident Frequency Rate',
    mainKPIAreaId: 'mk-area-09', mainKPIAreaName: 'Safety, Security & Risk Management', mainKPICode: 'MK-09',
    measurementCriteria: 'Work-related incidents per 100 employees', category: 'Manual', evalType: 'Evaluation',
    designationConfigs: [
      dc(HOD,  3, '<=', 2, ['HR'],           'Monthly'),
      dc(EINS, 5, '<=', 2, ['Line Manager'], 'Monthly'),
      dc(EVET, 4, '<=', 2, ['HR'],           'Monthly'),
    ],
    type: 'Quantitative', unit: 'Rate', weight: 5, targetValue: 2, minValue: 0, maxValue: 20, measurementFrequency: 'Monthly', formula: 'Incidents / Headcount x 100', description: '', isActive: true,
  },
  {
    id: 'sk-09-02', code: 'MK-09-02', name: 'Safety Training Completion',
    mainKPIAreaId: 'mk-area-09', mainKPIAreaName: 'Safety, Security & Risk Management', mainKPICode: 'MK-09',
    measurementCriteria: 'Employees completing mandatory safety training', category: 'Manual', evalType: 'Evaluation',
    designationConfigs: [
      dc(HOD,  3, '>=', 100, ['HR'],           'Quarterly'),
      dc(EINS, 4, '>=', 100, ['Line Manager'], 'Quarterly'),
      dc(EVET, 3, '>=', 100, ['HR'],           'Quarterly'),
    ],
    type: 'Quantitative', unit: '%', weight: 4, targetValue: 100, minValue: 0, maxValue: 100, measurementFrequency: 'Quarterly', formula: 'Trained / Total x 100', description: '', isActive: true,
  },
  {
    id: 'sk-09-03', code: 'MK-09-03', name: 'Risk Assessment Coverage',
    mainKPIAreaId: 'mk-area-09', mainKPIAreaName: 'Safety, Security & Risk Management', mainKPICode: 'MK-09',
    measurementCriteria: 'Departments with completed risk assessments', category: 'Manual', evalType: 'Evaluation',
    designationConfigs: [
      dc(HOD,  3, '>=', 90, ['HR'],           'Quarterly'),
      dc(EINS, 4, '>=', 90, ['Line Manager'], 'Quarterly'),
      dc(EVET, 4, '>=', 95, ['HR'],           'Quarterly'),
    ],
    type: 'Quantitative', unit: '%', weight: 4, targetValue: 90, minValue: 0, maxValue: 100, measurementFrequency: 'Quarterly', formula: 'Assessed departments / Total departments x 100', description: '', isActive: true,
  },

  // ── MK-10: HR Administration & HRIS ────────────────────────────────────────
  {
    id: 'sk-10-01', code: 'MK-10-01', name: 'Employee Data Accuracy',
    mainKPIAreaId: 'mk-area-10', mainKPIAreaName: 'HR Administration & HRIS', mainKPICode: 'MK-10',
    measurementCriteria: 'Employee records without data errors', category: 'Manual', evalType: 'Evaluation',
    designationConfigs: [
      dc(HOD,  3, '>=', 99, ['HR'],           'Monthly'),
      dc(EINS, 3, '>=', 99, ['HR'],           'Monthly'),
      dc(EPAY, 4, '>=', 99, ['HR'],           'Monthly'),
    ],
    type: 'Quantitative', unit: '%', weight: 4, targetValue: 99, minValue: 0, maxValue: 100, measurementFrequency: 'Monthly', formula: '(1 - Errors/Records) x 100', description: '', isActive: true,
  },
  {
    id: 'sk-10-02', code: 'MK-10-02', name: 'HRIS Utilization Rate',
    mainKPIAreaId: 'mk-area-10', mainKPIAreaName: 'HR Administration & HRIS', mainKPICode: 'MK-10',
    measurementCriteria: 'Processes using HRIS vs. total HR processes', category: 'Manual', evalType: 'Evaluation',
    designationConfigs: [
      dc(HOD,  3, '>=', 90, ['HR'],           'Quarterly'),
      dc(EINS, 3, '>=', 85, ['HR'],           'Quarterly'),
      dc(EPAY, 4, '>=', 90, ['HR'],           'Quarterly'),
    ],
    type: 'Quantitative', unit: '%', weight: 4, targetValue: 90, minValue: 0, maxValue: 100, measurementFrequency: 'Quarterly', formula: 'HRIS processes / Total processes x 100', description: '', isActive: true,
  },

  // ── MK-11: HR Analytics & Reporting ────────────────────────────────────────
  {
    id: 'sk-11-01', code: 'MK-11-01', name: 'HR Dashboard Accuracy',
    mainKPIAreaId: 'mk-area-11', mainKPIAreaName: 'HR Analytics & Reporting', mainKPICode: 'MK-11',
    measurementCriteria: 'Metrics in HR dashboards with verified accuracy', category: 'Manual', evalType: 'Evaluation',
    designationConfigs: [
      dc(HOD,  3, '>=', 98, ['HR'],           'Monthly'),
      dc(EPAY, 4, '>=', 95, ['HR'],           'Monthly'),
    ],
    type: 'Quantitative', unit: '%', weight: 4, targetValue: 98, minValue: 0, maxValue: 100, measurementFrequency: 'Monthly', formula: 'Accurate metrics / Total metrics x 100', description: '', isActive: true,
  },
  {
    id: 'sk-11-02', code: 'MK-11-02', name: 'Report Delivery Timeliness',
    mainKPIAreaId: 'mk-area-11', mainKPIAreaName: 'HR Analytics & Reporting', mainKPICode: 'MK-11',
    measurementCriteria: 'HR reports delivered on or before due date', category: 'Manual', evalType: 'Evaluation',
    designationConfigs: [
      dc(HOD,  3, '=', 100, ['HR'],           'Monthly'),
      dc(EPAY, 3, '=', 100, ['HR'],           'Monthly'),
    ],
    type: 'Quantitative', unit: '%', weight: 3, targetValue: 100, minValue: 0, maxValue: 100, measurementFrequency: 'Monthly', formula: 'On-time reports / Total reports x 100', description: '', isActive: true,
  },

  // ── MK-12: Attendance & Leave Management ───────────────────────────────────
  {
    id: 'sk-12-01', code: 'MK-12-01', name: 'Attendance Compliance Rate',
    mainKPIAreaId: 'mk-area-12', mainKPIAreaName: 'Attendance & Leave Management', mainKPICode: 'MK-12',
    measurementCriteria: 'Employees meeting minimum attendance requirement', category: 'Attendance', evalType: 'Evaluation',
    designationConfigs: [
      dc(HOD,  3, '>=', 95, ['HR'],           'Monthly'),
      dc(EPAY, 4, '>=', 95, ['HR'],           'Monthly'),
      dc(EVET, 4, '>=', 95, ['HR'],           'Monthly'),
    ],
    type: 'Quantitative', unit: '%', weight: 4, targetValue: 95, minValue: 0, maxValue: 100, measurementFrequency: 'Monthly', formula: 'Compliant employees / Total x 100', description: '', isActive: true,
  },
  {
    id: 'sk-12-02', code: 'MK-12-02', name: 'Leave Utilization Rate',
    mainKPIAreaId: 'mk-area-12', mainKPIAreaName: 'Attendance & Leave Management', mainKPICode: 'MK-12',
    measurementCriteria: 'Leave taken vs. entitled leave balance', category: 'Leave', leaveType: 'All', evalType: 'Evaluation',
    designationConfigs: [
      dc(HOD,  2, '>=', 70, ['HR'],           'Quarterly'),
      dc(EPAY, 3, '>=', 70, ['HR'],           'Quarterly'),
      dc(EVET, 3, '>=', 70, ['HR'],           'Quarterly'),
    ],
    type: 'Quantitative', unit: '%', weight: 3, targetValue: 70, minValue: 0, maxValue: 100, measurementFrequency: 'Quarterly', formula: 'Leaves taken / Entitled leaves x 100', description: '', isActive: true,
  },
  {
    id: 'sk-12-03', code: 'MK-12-03', name: 'Absenteeism Rate',
    mainKPIAreaId: 'mk-area-12', mainKPIAreaName: 'Attendance & Leave Management', mainKPICode: 'MK-12',
    measurementCriteria: 'Unplanned absences per total working days', category: 'Attendance', evalType: 'Evaluation',
    designationConfigs: [
      dc(HOD,  3, '<=', 3, ['HR'],           'Monthly'),
      dc(EPAY, 4, '<=', 3, ['HR'],           'Monthly'),
      dc(EVET, 4, '<=', 3, ['HR'],           'Monthly'),
    ],
    type: 'Quantitative', unit: '%', weight: 4, targetValue: 3, minValue: 0, maxValue: 30, measurementFrequency: 'Monthly', formula: 'Unplanned absence days / Working days x 100', description: '', isActive: true,
  },
];

// ── Employees ─────────────────────────────────────────────────────────────────
export const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'emp-1',  employeeId: 'HR-001', name: 'Ahmed Rahman',   designation: 'HOD',                department: 'Human Resources', section: 'General HR',     avatarColor: '#ef4444' },
  { id: 'emp-2',  employeeId: 'HR-002', name: 'Fatima Islam',   designation: 'HOD',                department: 'Human Resources', section: 'General HR',     avatarColor: 'var(--color-primary)' },
  { id: 'emp-3',  employeeId: 'HR-003', name: 'Nasrin Akter',   designation: 'Executive-HR',       department: 'Human Resources', section: 'Recruitment',    avatarColor: '#7c3aed' },
  { id: 'emp-4',  employeeId: 'HR-004', name: 'Karim Hossain',  designation: 'Executive-HR',       department: 'Human Resources', section: 'Training & Dev', avatarColor: 'var(--color-primary)' },
  { id: 'emp-5',  employeeId: 'HR-005', name: 'Priya Das',      designation: 'Executive-HR',       department: 'Human Resources', section: 'Recruitment',    avatarColor: '#f59e0b' },
  { id: 'emp-6',  employeeId: 'HR-006', name: 'Rahim Uddin',    designation: 'Executive-Insurance', department: 'Finance & Admin', section: 'Insurance',     avatarColor: 'var(--color-primary)' },
  { id: 'emp-7',  employeeId: 'HR-007', name: 'Sultana Begum',  designation: 'Executive-Insurance', department: 'Finance & Admin', section: 'Insurance',     avatarColor: '#7c3aed' },
  { id: 'emp-8',  employeeId: 'HR-008', name: 'Jahangir Alam',  designation: 'Executive-Payroll',   department: 'Finance & Admin', section: 'Payroll',       avatarColor: '#f59e0b' },
  { id: 'emp-9',  employeeId: 'HR-009', name: 'Roksana Khatun', designation: 'Executive-Payroll',   department: 'Finance & Admin', section: 'Payroll',       avatarColor: '#ec4899' },
  { id: 'emp-10', employeeId: 'HR-010', name: 'Minhajul Abedin', designation: 'Executive-Vetting',  department: 'Compliance',      section: 'Vetting & Audit', avatarColor: 'var(--color-primary)' },
  { id: 'emp-11', employeeId: 'HR-011', name: 'Sharmin Jahan',  designation: 'Executive-Vetting',   department: 'Compliance',      section: 'Vetting & Audit', avatarColor: '#0891b2' },
];

export const INITIAL_EMPLOYEE_KPI_RECORDS: EmployeeKPIRecord[] = [
  { id: 'ekpi-1', employeeId: 'EMP001', employeeName: 'Ahmed Rahman',  designation: 'HOD',          department: 'Human Resources', period: 'Q1 2026', kpiAreaName: 'Strategic HR', subKPIName: 'HR Strategic Plan Implementation', targetValue: 90, achievedValue: 92, achievementPct: 102, weightedScore: 5.1, achievementLevel: 'Outstanding', status: 'Finalized' },
  { id: 'ekpi-2', employeeId: 'EMP002', employeeName: 'Fatima Islam',  designation: 'HOD',          department: 'Human Resources', period: 'Q1 2026', kpiAreaName: 'Talent Acquisition', subKPIName: 'Time to Fill', targetValue: 60, achievedValue: 45, achievementPct: 125, weightedScore: 3.75, achievementLevel: 'Outstanding', status: 'Finalized' },
  { id: 'ekpi-3', employeeId: 'EMP003', employeeName: 'Nasrin Akter',  designation: 'Executive-HR', department: 'Human Resources', period: 'Q1 2026', kpiAreaName: 'Training', subKPIName: 'Training Completion Rate', targetValue: 95, achievedValue: 88, achievementPct: 93, weightedScore: 3.7, achievementLevel: 'Meets Expectations', status: 'Reviewed' },
];

export const INITIAL_DESIGNATION_MATRIX: DesignationMatrix[] = [
  { id: 'dm-1', designation: 'HOD',          department: 'Human Resources', kpiAreaId: 'mk-area-01', kpiAreaName: 'Strategic HR & Organizational Development', perspective: 'Internal Process', weight: 40, isActive: true },
  { id: 'dm-2', designation: 'HOD',          department: 'Human Resources', kpiAreaId: 'mk-area-02', kpiAreaName: 'Talent Acquisition & Workforce Management', perspective: 'Customer',         weight: 30, isActive: true },
  { id: 'dm-3', designation: 'Executive-HR', department: 'Human Resources', kpiAreaId: 'mk-area-02', kpiAreaName: 'Talent Acquisition & Workforce Management', perspective: 'Customer',         weight: 50, isActive: true },
  { id: 'dm-4', designation: 'Executive-HR', department: 'Human Resources', kpiAreaId: 'mk-area-04', kpiAreaName: 'Training & Development',                     perspective: 'Learning & Growth', weight: 30, isActive: true },
];

export const INITIAL_ACHIEVEMENT_LEVELS: AchievementLevel[] = [
  { id: 'al-1', code: 'OS', name: 'Outstanding',           minScore: 90, maxScore: 100, color: '#059669', description: 'Consistently surpasses all targets.', rating: 5, isActive: true },
  { id: 'al-2', code: 'EE', name: 'Exceeds Expectations',  minScore: 75, maxScore: 89,  color: '#0284c7', description: 'Regularly meets and often exceeds standards.', rating: 4, isActive: true },
  { id: 'al-3', code: 'ME', name: 'Meets Expectations',    minScore: 60, maxScore: 74,  color: '#d97706', description: 'Consistently meets core requirements.', rating: 3, isActive: true },
  { id: 'al-4', code: 'BE', name: 'Below Expectations',    minScore: 45, maxScore: 59,  color: '#ea580c', description: 'Partially meets expectations.', rating: 2, isActive: true },
  { id: 'al-5', code: 'UN', name: 'Unsatisfactory',        minScore: 0,  maxScore: 44,  color: '#dc2626', description: 'Fails to meet minimum standards.', rating: 1, isActive: true },
];
