/**
 * performance.types.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Type definitions and initial mock data for the Performance Management module.
 * Based on Balanced Scorecard (BSC) framework.
 */

// ── Enumerations ──────────────────────────────────────────────────────────────
export type KPIPerspective =
  | 'Financial'
  | 'Customer'
  | 'Internal Process'
  | 'Learning & Growth';

export type KPIType = 'Quantitative' | 'Qualitative';
export type MeasurementFrequency = 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual' | 'Yearly';
export type EvalStatus = 'Pending' | 'Submitted' | 'Reviewed' | 'Finalized';
export type KPICategory = 'Leave' | 'Attendance' | 'Manual';
export type KPIEvalType = 'Confirmation KPI' | 'Evaluation';
export type ComparisonOperator = '>=' | '<=' | '>' | '<' | '=';
export type ResponsibleTo = 'Line Manager' | 'HR' | string; // string allows designation names

// ── Designation-level config for a Sub KPI ────────────────────────────────────
export interface DesignationConfig {
  designation: string;
  weight: number;          // %
  operator: ComparisonOperator;
  targetValue: number;     // %
  responsibleTo: ResponsibleTo;
  frequency: MeasurementFrequency;
}

// ── Main KPI Area ─────────────────────────────────────────────────────────────
export interface MainKPIArea {
  id: string;
  code: string;
  name: string;
  perspective: KPIPerspective;
  weight: number; // 0–100
  description: string;
  isActive: boolean;
  createdAt: string;
}

// ── Sub KPI ───────────────────────────────────────────────────────────────────
export interface SubKPI {
  id: string;
  code: string;
  name: string;
  mainKPIAreaId: string;
  mainKPIAreaName: string;
  mainKPICode: string;
  measurementCriteria: string;
  category: KPICategory;
  evalType: KPIEvalType;
  designationConfigs: DesignationConfig[];
  type: KPIType;
  unit: string;
  weight: number;            // overall weight, kept for backward compat
  targetValue: number;
  minValue: number;
  maxValue: number;
  measurementFrequency: MeasurementFrequency;
  formula: string;
  description: string;
  isActive: boolean;
}

// ── Employee KPI Record ───────────────────────────────────────────────────────
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

// ── Designation Matrix ────────────────────────────────────────────────────────
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

// ── Achievement Level ─────────────────────────────────────────────────────────
export interface AchievementLevel {
  id: string;
  code: string;
  name: string;
  minScore: number;
  maxScore: number;
  color: string;
  description: string;
  rating: number; // 1–5
  isActive: boolean;
}

// ══════════════════════════════════════════════════════════════════════════════
// Mock Data
// ══════════════════════════════════════════════════════════════════════════════

export const INITIAL_MAIN_KPI_AREAS: MainKPIArea[] = [
  {
    id: 'kpi-area-1',
    code: 'FIN',
    name: 'Financial Performance',
    perspective: 'Financial',
    weight: 30,
    description: 'Revenue growth, cost control, profitability, and budget adherence.',
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'kpi-area-2',
    code: 'CST',
    name: 'Customer Satisfaction',
    perspective: 'Customer',
    weight: 25,
    description: 'Customer retention, satisfaction scores, and service delivery quality.',
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'kpi-area-3',
    code: 'IOP',
    name: 'Internal Operations',
    perspective: 'Internal Process',
    weight: 25,
    description: 'Process efficiency, quality standards, compliance, and turnaround time.',
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'kpi-area-4',
    code: 'LGR',
    name: 'Learning & Growth',
    perspective: 'Learning & Growth',
    weight: 20,
    description: 'Employee development, training completion, skill advancement, and innovation.',
    isActive: true,
    createdAt: '2026-01-01',
  },
];

// ── Available designations (shared across modules) ────────────────────────────
export const ALL_DESIGNATIONS = [
  'HOD', 'Executive-HR', 'Executive-Insurance', 'Executive-Payroll',
  'Executive-Vetting', 'Senior Manager', 'CEO / MD', 'HR Executive',
  'Software Engineer', 'Sales Executive', 'Operations Manager',
];

export const RESPONSIBLE_TO_OPTIONS: ResponsibleTo[] = ['Line Manager', 'HR', ...ALL_DESIGNATIONS];

export const INITIAL_SUB_KPIS: SubKPI[] = [
  // ── MK-01 Sub KPIs ──────────────────────────────────────────────────────────
  {
    id: 'skpi-1', code: 'MK-01-01', name: 'HR Strategic Plan Implementation',
    mainKPIAreaId: 'kpi-area-1', mainKPIAreaName: 'Strategic HR & Organizational Development', mainKPICode: 'MK-01',
    measurementCriteria: 'Approved HR Plan vs. Achieved Milestones',
    category: 'Manual', evalType: 'Evaluation',
    designationConfigs: [
      { designation: 'HOD', weight: 5, operator: '>=', targetValue: 90, responsibleTo: 'Line Manager', frequency: 'Quarterly' },
    ],
    type: 'Quantitative', unit: '%', weight: 5, targetValue: 90, minValue: 0, maxValue: 100,
    measurementFrequency: 'Quarterly', formula: 'Milestones achieved / Total milestones × 100',
    description: 'Measures HR strategic plan execution against approved milestones.', isActive: true,
  },
  {
    id: 'skpi-2', code: 'MK-01-02', name: 'Manpower Planning Accuracy',
    mainKPIAreaId: 'kpi-area-1', mainKPIAreaName: 'Strategic HR & Organizational Development', mainKPICode: 'MK-01',
    measurementCriteria: 'Variance between approved manpower budget & actual headcount',
    category: 'Manual', evalType: 'Evaluation',
    designationConfigs: [
      { designation: 'HOD', weight: 3, operator: '>=', targetValue: 5, responsibleTo: 'HR', frequency: 'Monthly' },
    ],
    type: 'Quantitative', unit: '%', weight: 3, targetValue: 5, minValue: 0, maxValue: 20,
    measurementFrequency: 'Monthly', formula: '|Actual - Budget| / Budget × 100',
    description: 'Tracks variance between budgeted and actual headcount.', isActive: true,
  },
  {
    id: 'skpi-3', code: 'MK-01-03', name: 'Succession Planning',
    mainKPIAreaId: 'kpi-area-1', mainKPIAreaName: 'Strategic HR & Organizational Development', mainKPICode: 'MK-01',
    measurementCriteria: 'Identified successors for key positions',
    category: 'Manual', evalType: 'Evaluation',
    designationConfigs: [
      { designation: 'HOD', weight: 2, operator: '>=', targetValue: 80, responsibleTo: 'HR', frequency: 'Quarterly' },
    ],
    type: 'Quantitative', unit: '%', weight: 2, targetValue: 80, minValue: 0, maxValue: 100,
    measurementFrequency: 'Quarterly', formula: 'Positions with successor / Total key positions × 100',
    description: 'Percentage of key roles with an identified successor.', isActive: true,
  },
  {
    id: 'skpi-4', code: 'MK-01-04', name: 'Development of new policies aligned with strategic goals',
    mainKPIAreaId: 'kpi-area-1', mainKPIAreaName: 'Strategic HR & Organizational Development', mainKPICode: 'MK-01',
    measurementCriteria: 'Policy development & revision',
    category: 'Manual', evalType: 'Evaluation',
    designationConfigs: [
      { designation: 'HOD',                weight: 5, operator: '>=', targetValue: 100, responsibleTo: 'HR',           frequency: 'Quarterly' },
      { designation: 'Executive-Insurance', weight: 4, operator: '>=', targetValue: 100, responsibleTo: 'Line Manager', frequency: 'Quarterly' },
      { designation: 'Executive-Payroll',   weight: 4, operator: '>=', targetValue: 100, responsibleTo: 'HR',           frequency: 'Quarterly' },
    ],
    type: 'Quantitative', unit: '%', weight: 5, targetValue: 100, minValue: 0, maxValue: 100,
    measurementFrequency: 'Quarterly', formula: 'Policies developed & approved / Target count × 100',
    description: 'Development and revision of HR policies per strategic plan.', isActive: true,
  },
  // ── MK-02 Sub KPIs ──────────────────────────────────────────────────────────
  {
    id: 'skpi-5', code: 'MK-02-01', name: 'Time to Fill',
    mainKPIAreaId: 'kpi-area-2', mainKPIAreaName: 'Talent Acquisition & Workforce Management', mainKPICode: 'MK-02',
    measurementCriteria: 'Average days from requisition to joining',
    category: 'Manual', evalType: 'Evaluation',
    designationConfigs: [
      { designation: 'HOD',                weight: 3, operator: '<=', targetValue: 60, responsibleTo: 'HR',           frequency: 'Monthly' },
      { designation: 'Executive-HR',       weight: 5, operator: '<=', targetValue: 60, responsibleTo: 'Line Manager', frequency: 'Monthly' },
      { designation: 'Executive-Insurance', weight: 2, operator: '<=', targetValue: 60, responsibleTo: 'HR',           frequency: 'Monthly' },
    ],
    type: 'Quantitative', unit: 'Days', weight: 5, targetValue: 30, minValue: 0, maxValue: 90,
    measurementFrequency: 'Monthly', formula: 'Sum(Days to fill) / Filled positions',
    description: 'Average time from approved requisition to employee joining.', isActive: true,
  },
  {
    id: 'skpi-6', code: 'MK-02-02', name: 'Quality of Hire',
    mainKPIAreaId: 'kpi-area-2', mainKPIAreaName: 'Talent Acquisition & Workforce Management', mainKPICode: 'MK-02',
    measurementCriteria: '6-month performance review rating of new hires',
    category: 'Manual', evalType: 'Evaluation',
    designationConfigs: [
      { designation: 'HOD',                weight: 3, operator: '>=', targetValue: 80, responsibleTo: 'HR',           frequency: 'Quarterly' },
      { designation: 'Executive-HR',       weight: 5, operator: '>=', targetValue: 80, responsibleTo: 'Line Manager', frequency: 'Quarterly' },
      { designation: 'Executive-Insurance', weight: 2, operator: '>=', targetValue: 80, responsibleTo: 'HR',           frequency: 'Quarterly' },
    ],
    type: 'Quantitative', unit: '%', weight: 5, targetValue: 80, minValue: 0, maxValue: 100,
    measurementFrequency: 'Quarterly', formula: '(New hire 6-month rating / Max rating) × 100',
    description: 'Performance rating of new hires after 6 months.', isActive: true,
  },
  {
    id: 'skpi-7', code: 'MK-02-03', name: 'Hiring Compliance',
    mainKPIAreaId: 'kpi-area-2', mainKPIAreaName: 'Talent Acquisition & Workforce Management', mainKPICode: 'MK-02',
    measurementCriteria: 'Recruitment per policy, aviation regulatory and BLA requirements',
    category: 'Manual', evalType: 'Evaluation',
    designationConfigs: [
      { designation: 'HOD',                weight: 3, operator: '>=', targetValue: 100, responsibleTo: 'HR',           frequency: 'Quarterly' },
      { designation: 'Executive-HR',       weight: 5, operator: '>=', targetValue: 100, responsibleTo: 'Line Manager', frequency: 'Quarterly' },
      { designation: 'Executive-Insurance', weight: 2, operator: '>=', targetValue: 95,  responsibleTo: 'HR',           frequency: 'Quarterly' },
    ],
    type: 'Quantitative', unit: '%', weight: 5, targetValue: 100, minValue: 0, maxValue: 100,
    measurementFrequency: 'Quarterly', formula: 'Compliant hires / Total hires × 100',
    description: 'Percentage of hires fully compliant with regulatory and policy requirements.', isActive: true,
  },
];

export const INITIAL_EMPLOYEE_KPI_RECORDS: EmployeeKPIRecord[] = [
  { id: 'ekpi-1', employeeId: 'EMP001', employeeName: 'Rashidul Islam', designation: 'Senior Manager', department: 'Finance', period: 'Q1 2026', kpiAreaName: 'Financial Performance', subKPIName: 'Revenue Target Achievement', targetValue: 100, achievedValue: 112, achievementPct: 112, weightedScore: 33.6, achievementLevel: 'Outstanding', status: 'Finalized' },
  { id: 'ekpi-2', employeeId: 'EMP001', employeeName: 'Rashidul Islam', designation: 'Senior Manager', department: 'Finance', period: 'Q1 2026', kpiAreaName: 'Learning & Growth', subKPIName: 'Training Completion Rate', targetValue: 90, achievedValue: 85, achievementPct: 94.4, weightedScore: 7.6, achievementLevel: 'Meets Expectations', status: 'Finalized' },
  { id: 'ekpi-3', employeeId: 'EMP002', employeeName: 'Nusrat Jahan', designation: 'HR Executive', department: 'Human Resources', period: 'Q1 2026', kpiAreaName: 'Internal Operations', subKPIName: 'Process Cycle Time', targetValue: 3, achievedValue: 2.5, achievementPct: 120, weightedScore: 28.8, achievementLevel: 'Outstanding', status: 'Reviewed' },
  { id: 'ekpi-4', employeeId: 'EMP002', employeeName: 'Nusrat Jahan', designation: 'HR Executive', department: 'Human Resources', period: 'Q1 2026', kpiAreaName: 'Customer Satisfaction', subKPIName: 'Customer Satisfaction Score (CSAT)', targetValue: 4.5, achievedValue: 4.2, achievementPct: 93.3, weightedScore: 18.6, achievementLevel: 'Exceeds Expectations', status: 'Reviewed' },
  { id: 'ekpi-5', employeeId: 'EMP003', employeeName: 'Tanvir Ahmed', designation: 'Software Engineer', department: 'IT', period: 'Q1 2026', kpiAreaName: 'Internal Operations', subKPIName: 'Compliance Rate', targetValue: 100, achievedValue: 98, achievementPct: 98, weightedScore: 24.5, achievementLevel: 'Exceeds Expectations', status: 'Submitted' },
  { id: 'ekpi-6', employeeId: 'EMP003', employeeName: 'Tanvir Ahmed', designation: 'Software Engineer', department: 'IT', period: 'Q1 2026', kpiAreaName: 'Learning & Growth', subKPIName: 'Skill Development Score', targetValue: 8, achievedValue: 9, achievementPct: 112.5, weightedScore: 15.75, achievementLevel: 'Outstanding', status: 'Submitted' },
  { id: 'ekpi-7', employeeId: 'EMP004', employeeName: 'Sabrina Akter', designation: 'Sales Executive', department: 'Sales', period: 'Q1 2026', kpiAreaName: 'Financial Performance', subKPIName: 'Revenue Target Achievement', targetValue: 100, achievedValue: 72, achievementPct: 72, weightedScore: 21.6, achievementLevel: 'Below Expectations', status: 'Finalized' },
  { id: 'ekpi-8', employeeId: 'EMP005', employeeName: 'Mahbubur Rahman', designation: 'Operations Manager', department: 'Operations', period: 'Q1 2026', kpiAreaName: 'Customer Satisfaction', subKPIName: 'Service Response Time', targetValue: 4, achievedValue: 3.2, achievementPct: 125, weightedScore: 18.75, achievementLevel: 'Outstanding', status: 'Reviewed' },
];

export const INITIAL_DESIGNATION_MATRIX: DesignationMatrix[] = [
  { id: 'dm-1',  designation: 'CEO / MD',           department: 'Executive',        kpiAreaId: 'kpi-area-1', kpiAreaName: 'Financial Performance', perspective: 'Financial',         weight: 40, isActive: true },
  { id: 'dm-2',  designation: 'CEO / MD',           department: 'Executive',        kpiAreaId: 'kpi-area-2', kpiAreaName: 'Customer Satisfaction', perspective: 'Customer',          weight: 30, isActive: true },
  { id: 'dm-3',  designation: 'CEO / MD',           department: 'Executive',        kpiAreaId: 'kpi-area-3', kpiAreaName: 'Internal Operations',   perspective: 'Internal Process',  weight: 20, isActive: true },
  { id: 'dm-4',  designation: 'CEO / MD',           department: 'Executive',        kpiAreaId: 'kpi-area-4', kpiAreaName: 'Learning & Growth',     perspective: 'Learning & Growth', weight: 10, isActive: true },
  { id: 'dm-5',  designation: 'Senior Manager',     department: 'Finance',          kpiAreaId: 'kpi-area-1', kpiAreaName: 'Financial Performance', perspective: 'Financial',         weight: 35, isActive: true },
  { id: 'dm-6',  designation: 'Senior Manager',     department: 'Finance',          kpiAreaId: 'kpi-area-3', kpiAreaName: 'Internal Operations',   perspective: 'Internal Process',  weight: 35, isActive: true },
  { id: 'dm-7',  designation: 'Senior Manager',     department: 'Finance',          kpiAreaId: 'kpi-area-4', kpiAreaName: 'Learning & Growth',     perspective: 'Learning & Growth', weight: 30, isActive: true },
  { id: 'dm-8',  designation: 'HR Executive',       department: 'Human Resources',  kpiAreaId: 'kpi-area-2', kpiAreaName: 'Customer Satisfaction', perspective: 'Customer',          weight: 30, isActive: true },
  { id: 'dm-9',  designation: 'HR Executive',       department: 'Human Resources',  kpiAreaId: 'kpi-area-3', kpiAreaName: 'Internal Operations',   perspective: 'Internal Process',  weight: 40, isActive: true },
  { id: 'dm-10', designation: 'HR Executive',       department: 'Human Resources',  kpiAreaId: 'kpi-area-4', kpiAreaName: 'Learning & Growth',     perspective: 'Learning & Growth', weight: 30, isActive: true },
  { id: 'dm-11', designation: 'Software Engineer',  department: 'IT',               kpiAreaId: 'kpi-area-3', kpiAreaName: 'Internal Operations',   perspective: 'Internal Process',  weight: 40, isActive: true },
  { id: 'dm-12', designation: 'Software Engineer',  department: 'IT',               kpiAreaId: 'kpi-area-4', kpiAreaName: 'Learning & Growth',     perspective: 'Learning & Growth', weight: 40, isActive: true },
  { id: 'dm-13', designation: 'Software Engineer',  department: 'IT',               kpiAreaId: 'kpi-area-2', kpiAreaName: 'Customer Satisfaction', perspective: 'Customer',          weight: 20, isActive: true },
  { id: 'dm-14', designation: 'Sales Executive',    department: 'Sales',            kpiAreaId: 'kpi-area-1', kpiAreaName: 'Financial Performance', perspective: 'Financial',         weight: 50, isActive: true },
  { id: 'dm-15', designation: 'Sales Executive',    department: 'Sales',            kpiAreaId: 'kpi-area-2', kpiAreaName: 'Customer Satisfaction', perspective: 'Customer',          weight: 30, isActive: true },
  { id: 'dm-16', designation: 'Sales Executive',    department: 'Sales',            kpiAreaId: 'kpi-area-4', kpiAreaName: 'Learning & Growth',     perspective: 'Learning & Growth', weight: 20, isActive: true },
];

export const INITIAL_ACHIEVEMENT_LEVELS: AchievementLevel[] = [
  { id: 'al-1', code: 'OS', name: 'Outstanding',           minScore: 90,  maxScore: 100, color: '#059669', description: 'Consistently surpasses all targets and significantly exceeds expectations.',        rating: 5, isActive: true },
  { id: 'al-2', code: 'EE', name: 'Exceeds Expectations',  minScore: 75,  maxScore: 89,  color: '#0284c7', description: 'Regularly meets and often exceeds the expected performance standards.',             rating: 4, isActive: true },
  { id: 'al-3', code: 'ME', name: 'Meets Expectations',    minScore: 60,  maxScore: 74,  color: '#d97706', description: 'Consistently meets the core requirements and expected performance levels.',          rating: 3, isActive: true },
  { id: 'al-4', code: 'BE', name: 'Below Expectations',    minScore: 45,  maxScore: 59,  color: '#ea580c', description: 'Partially meets expectations; requires improvement in key performance areas.',      rating: 2, isActive: true },
  { id: 'al-5', code: 'UN', name: 'Unsatisfactory',        minScore: 0,   maxScore: 44,  color: '#dc2626', description: 'Fails to meet minimum performance standards; immediate improvement plan required.', rating: 1, isActive: true },
];
