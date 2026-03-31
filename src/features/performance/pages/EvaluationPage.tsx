/**
 * EvaluationPage.tsx
 * Performance Management -> Evaluation
 * Tabs:
 *   • Pending / Marked  — line manager marks employee KPIs
 *   • My Evaluation     — view evaluations received from superior, with "Not Marked" gap detection
 */

import { useMemo, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  Divider,
  Input,
  InputNumber,
  Modal,
  Progress,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  FallOutlined,
  LineChartOutlined,
  MinusOutlined,
  RiseOutlined,
  SearchOutlined,
  TrophyOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  INITIAL_EMPLOYEES,
  INITIAL_MAIN_KPI_AREAS,
  INITIAL_SUB_KPIS,
  type Employee,
} from '../types/performance.types';

const { Title, Text } = Typography;
const { Option } = Select;

// ─── Constants ────────────────────────────────────────────────────────────────
const FORM_MAIN_KPI_LIMIT = 2;
const FORM_SUB_KPI_LIMIT  = 3;

const CARD_BG   = 'linear-gradient(120deg, #ffffff 0%, #f3f9f8 100%)';
const HEADER_BG = 'linear-gradient(120deg, #0f766e 0%, #0b5f58 60%, #0f766e 100%)';

/** Fixed "today" for demo purposes */
const DEMO_TODAY = new Date('2026-03-31');

// ─── Types ────────────────────────────────────────────────────────────────────
type TabKey    = 'pending' | 'marked' | 'myeval';
type ViewMode  = 'list' | 'mark' | 'view';
type PeriodType = 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';

interface EmployeeSubKPIRow {
  subKPIId: string;
  mainKPIAreaId: string;
  mainKPIAreaName: string;
  mainKPICode: string;
  subKPICode: string;
  subKPIName: string;
  measurementCriteria: string;
  weight: number;
  operator: string;
  targetValue: number;
  responsibleTo: string[];
  markOutOf: number;
}

interface EvaluationInputRow {
  subKPIId: string;
  markValue: number;
  remarks: string;
}

interface EmployeeMarkedRecord {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  designation: string;
  department: string;
  section: string;
  submittedAt: string;
  totalMark: number;
  totalOutOf: number;
  achievementPct: number;
  items: Array<EmployeeSubKPIRow & EvaluationInputRow>;
}

interface EmployeeListRow {
  id: string;
  name: string;
  employeeId: string;
  designation: string;
  department: string;
  section: string;
  avatarColor: string;
  subKPI: number;
  mainKPI: number;
  deadlineDate: string;
  deadlineDaysLeft: number;
  isMarked: boolean;
  scoreLabel: string;
}

// ─── My Evaluation Types ──────────────────────────────────────────────────────
interface MyEvalItem {
  subKPICode: string;
  subKPIName: string;
  mainKPICode: string;
  mainKPIAreaName: string;
  measurementCriteria: string;
  markValue: number;
  markOutOf: number;
  weight: number;
  remarks: string;
}

interface AppraisalResult {
  incrementPct: number;       // 0 = no increment
  previousBasic: number;
  newBasic: number;
  previousGross: number;
  newGross: number;
  effectiveDate: string;
  nextAppraisalDate: string;
}

interface MyEvalRecord {
  id: string;
  evaluatedBy: string;
  evaluatorDesignation: string;
  evaluatorCode: string;
  evaluatorAvatarColor: string;
  periodType: PeriodType;
  periodLabel: string;
  periodStart: string;
  periodEnd: string;
  submittedAt: string;
  totalMark: number;
  totalOutOf: number;
  achievementPct: number;
  achievementLevel: string;
  achievementColor: string;
  achievementTagColor: string;
  overallFeedback: string;
  items: MyEvalItem[];
  appraisalResult?: AppraisalResult;
}

interface EvalSlot {
  periodLabel: string;
  periodStart: string;
  periodEnd: string;
}

interface EvalSlotEntry {
  slot: EvalSlot;
  record: MyEvalRecord | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function initials(name: string): string {
  return name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function daysLeftFromToday(dateIso: string): number {
  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const target = new Date(`${dateIso}T00:00:00`).getTime();
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}

function getAchievementMeta(pct: number): { level: string; color: string; tagColor: string } {
  if (pct >= 90) return { level: 'Outstanding',       color: '#059669', tagColor: 'success'    };
  if (pct >= 80) return { level: 'Excellent',          color: '#0284c7', tagColor: 'processing' };
  if (pct >= 70) return { level: 'Good',               color: '#0891b2', tagColor: 'cyan'       };
  if (pct >= 60) return { level: 'Satisfactory',       color: '#d97706', tagColor: 'warning'    };
  return            { level: 'Needs Improvement', color: '#dc2626', tagColor: 'error'      };
}

function matchedSubKPIs(employee: Employee): EmployeeSubKPIRow[] {
  const rows: EmployeeSubKPIRow[] = [];
  for (const sub of INITIAL_SUB_KPIS.filter(s => s.isActive)) {
    const cfg = sub.designationConfigs.find(dc => {
      const designationMatch = dc.designation === employee.designation;
      const deptMatch        = !dc.department || dc.department === employee.department;
      const sectionMatch     = !dc.section    || dc.section    === employee.section;
      return designationMatch && deptMatch && sectionMatch;
    });
    if (!cfg) continue;
    rows.push({
      subKPIId: sub.id, mainKPIAreaId: sub.mainKPIAreaId, mainKPIAreaName: sub.mainKPIAreaName,
      mainKPICode: sub.mainKPICode, subKPICode: sub.code, subKPIName: sub.name,
      measurementCriteria: sub.measurementCriteria, weight: cfg.weight, operator: cfg.operator,
      targetValue: cfg.targetValue, responsibleTo: cfg.responsibleTo, markOutOf: sub.markOutOf ?? 100,
    });
  }
  const areaOrder = new Map(INITIAL_MAIN_KPI_AREAS.map((a, idx) => [a.id, idx]));
  return rows.sort((a, b) => {
    const oA = areaOrder.get(a.mainKPIAreaId) ?? 999;
    const oB = areaOrder.get(b.mainKPIAreaId) ?? 999;
    if (oA !== oB) return oA - oB;
    return a.subKPICode.localeCompare(b.subKPICode);
  });
}

/**
 * Generates expected evaluation slots for a given period type and year,
 * up to DEMO_TODAY. Used to surface "Not Marked" gaps.
 */
function generateExpectedSlots(periodType: PeriodType, year: number): EvalSlot[] {
  const slots: EvalSlot[] = [];
  const todayMs = DEMO_TODAY.getTime();
  const MS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const DS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  switch (periodType) {
    case 'Yearly': {
      // One slot per year (2023 → current year)
      const startYear = 2023;
      const endYear   = DEMO_TODAY.getFullYear();
      for (let y = startYear; y <= endYear; y++) {
        if (new Date(`${y}-01-01`).getTime() <= todayMs) {
          slots.push({ periodLabel: `Year ${y}`, periodStart: `${y}-01-01`, periodEnd: `${y}-12-31` });
        }
      }
      break;
    }
    case 'Quarterly': {
      const qs = [
        { label: `Q1 ${year}`, start: `${year}-01-01`, end: `${year}-03-31` },
        { label: `Q2 ${year}`, start: `${year}-04-01`, end: `${year}-06-30` },
        { label: `Q3 ${year}`, start: `${year}-07-01`, end: `${year}-09-30` },
        { label: `Q4 ${year}`, start: `${year}-10-01`, end: `${year}-12-31` },
      ];
      qs.forEach(q => {
        if (new Date(q.start).getTime() <= todayMs)
          slots.push({ periodLabel: q.label, periodStart: q.start, periodEnd: q.end });
      });
      break;
    }
    case 'Monthly': {
      for (let m = 0; m < 12; m++) {
        const startDate = new Date(year, m, 1);
        if (startDate.getTime() > todayMs) break;
        const mm      = String(m + 1).padStart(2, '0');
        const lastDay = new Date(year, m + 1, 0).getDate();
        const dd      = String(lastDay).padStart(2, '0');
        slots.push({ periodLabel: `${MS[m]} ${year}`, periodStart: `${year}-${mm}-01`, periodEnd: `${year}-${mm}-${dd}` });
      }
      break;
    }
    case 'Weekly': {
      // Find Monday of current week (relative to DEMO_TODAY)
      const todayDow      = DEMO_TODAY.getDay();
      const daysToMon     = (todayDow + 6) % 7;       // how many days back to reach Monday
      const currMonday    = new Date(DEMO_TODAY);
      currMonday.setDate(DEMO_TODAY.getDate() - daysToMon);

      // First Monday of the year (used for week-number calculation)
      const firstMonday   = new Date(year, 0, 1);
      while (firstMonday.getDay() !== 1) firstMonday.setDate(firstMonday.getDate() + 1);

      // Show last 6 weeks (oldest → newest; will reverse at end)
      for (let i = 5; i >= 0; i--) {
        const wStart = new Date(currMonday);
        wStart.setDate(currMonday.getDate() - i * 7);
        if (wStart.getFullYear() < year) continue;

        const wEnd = new Date(wStart);
        wEnd.setDate(wStart.getDate() + 6);

        const weekNum = Math.floor((wStart.getTime() - firstMonday.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
        const sm = MS[wStart.getMonth()];
        const em = MS[wEnd.getMonth()];
        const label = `Week ${String(weekNum).padStart(2, '0')} · ${sm} ${wStart.getDate()}–${em} ${wEnd.getDate()}`;
        slots.push({ periodLabel: label, periodStart: toISODate(wStart), periodEnd: toISODate(wEnd) });
      }
      break;
    }
    case 'Daily': {
      // Last 14 days up to DEMO_TODAY, oldest first (then reversed)
      for (let i = 13; i >= 0; i--) {
        const d = new Date(DEMO_TODAY);
        d.setDate(DEMO_TODAY.getDate() - i);
        if (d.getFullYear() !== year) continue;
        const label = `${MS[d.getMonth()]} ${d.getDate()}, ${year} (${DS[d.getDay()]})`;
        slots.push({ periodLabel: label, periodStart: toISODate(d), periodEnd: toISODate(d) });
      }
      break;
    }
  }

  // All cases pushed oldest-first → reverse to most-recent-first
  return slots.reverse();
}

// ─── My Evaluation Mock Data ──────────────────────────────────────────────────
const ME_EVALUATOR = { name: 'Tanvir Ahmed', designation: 'Managing Director', code: 'MD-001', avatarColor: '#7c3aed' };

const MY_EVAL_RECORDS: MyEvalRecord[] = (() => {
  const build = (
    id: string, periodType: PeriodType, periodLabel: string, periodStart: string, periodEnd: string,
    submittedAt: string, totalMark: number, totalOutOf: number, overallFeedback: string, items: MyEvalItem[],
    appraisalResult?: AppraisalResult,
  ): MyEvalRecord => {
    const achievementPct = Math.round((totalMark / totalOutOf) * 100);
    const { level, color, tagColor } = getAchievementMeta(achievementPct);
    return {
      id, evaluatedBy: ME_EVALUATOR.name, evaluatorDesignation: ME_EVALUATOR.designation,
      evaluatorCode: ME_EVALUATOR.code, evaluatorAvatarColor: ME_EVALUATOR.avatarColor,
      periodType, periodLabel, periodStart, periodEnd, submittedAt,
      totalMark, totalOutOf, achievementPct,
      achievementLevel: level, achievementColor: color, achievementTagColor: tagColor,
      overallFeedback, items, appraisalResult,
    };
  };

  const kpiDefs: Omit<MyEvalItem, 'markValue' | 'remarks'>[] = [
    { subKPICode: 'SK-01', subKPIName: 'Strategic HR Planning',    mainKPICode: 'MK-01', mainKPIAreaName: 'Strategic HR & Org Dev',   measurementCriteria: 'HR strategy alignment score ≥ 90%',          markOutOf: 20, weight: 5 },
    { subKPICode: 'SK-05', subKPIName: 'Recruitment Cycle Time',   mainKPICode: 'MK-02', mainKPIAreaName: 'Talent Acquisition',        measurementCriteria: 'Avg days to hire < 30',                      markOutOf: 20, weight: 5 },
    { subKPICode: 'SK-09', subKPIName: 'Training ROI',             mainKPICode: 'MK-04', mainKPIAreaName: 'Training & Development',    measurementCriteria: 'Training effectiveness score > 85%',         markOutOf: 20, weight: 4 },
    { subKPICode: 'SK-14', subKPIName: 'Employee Satisfaction',    mainKPICode: 'MK-07', mainKPIAreaName: 'Employee Engagement',       measurementCriteria: 'Survey score > 80%',                         markOutOf: 20, weight: 5 },
    { subKPICode: 'SK-20', subKPIName: 'HR Analytics Reporting',   mainKPICode: 'MK-11', mainKPIAreaName: 'HR Analytics & Reporting',  measurementCriteria: 'Monthly analytics report delivered on time', markOutOf: 20, weight: 4 },
  ];
  const rmk = [
    ['Well aligned with organizational strategy.',    'Impressive improvement in recruitment timelines.', 'Training metrics improving steadily.',      'Strong engagement scores from latest survey.',         'Analytics dashboards delivered consistently.'     ],
    ['Excellent strategic focus this period.',        'Hire cycle reduced significantly.',                'Training programs showed measurable ROI.',  'Engagement initiative launched successfully.',         'Insightful analytics reports this period.'        ],
    ['Strategy documents updated promptly.',          'Recruitment targets met ahead of schedule.',       'Training calendar well-executed.',          'Employee pulse survey well-managed.',                 'Good data-driven reporting.'                      ],
  ];
  const items = (marks: number[], ri = 0): MyEvalItem[] =>
    kpiDefs.map((d, i) => ({ ...d, markValue: marks[i] ?? Math.round(d.markOutOf * 0.8), remarks: rmk[ri % 3][i] }));

  return [
    // ── Yearly ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
    build('mye-y-2023', 'Yearly', 'Year 2023', '2023-01-01', '2023-12-31', '2024-01-18', 62, 100,
      'Performance met baseline expectations but fell short in several key areas. Recruitment cycle time exceeded targets and training ROI remained below the threshold. Improvement plan initiated for 2024.',
      items([13, 12, 12, 13, 12], 2),
      { incrementPct: 0, previousBasic: 65000, newBasic: 65000, previousGross: 85000, newGross: 85000, effectiveDate: '2024-04-01', nextAppraisalDate: '2025-04-01' }),
    build('mye-y-2024', 'Yearly', 'Year 2024', '2024-01-01', '2024-12-31', '2025-01-15', 82, 100,
      'Ahmed demonstrated strong HR leadership throughout 2024. Recruitment processes improved significantly. Needs to focus on HR analytics utilization and data-driven decision making.',
      items([17, 18, 15, 16, 16], 0),
      { incrementPct: 5, previousBasic: 65000, newBasic: 68250, previousGross: 85000, newGross: 89250, effectiveDate: '2025-04-01', nextAppraisalDate: '2026-04-01' }),
    build('mye-y-2025', 'Yearly', 'Year 2025', '2025-01-01', '2025-12-31', '2026-01-20', 88, 100,
      'Significant improvement across all HR functions. Exceptional leadership in talent acquisition and compliance. Analytics utilization has markedly improved.',
      items([18, 19, 17, 17, 17], 1),
      { incrementPct: 8, previousBasic: 68250, newBasic: 73710, previousGross: 89250, newGross: 96390, effectiveDate: '2026-04-01', nextAppraisalDate: '2027-04-01' }),
    // Year 2026 not yet evaluated — will surface as "Not Marked"

    // ── Quarterly ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
    build('mye-q1-2025', 'Quarterly', 'Q1 2025', '2025-01-01', '2025-03-31', '2025-04-10', 79, 100,
      'Decent start. Strategic planning for the new fiscal year was timely. Some gaps in compliance tracking need to be addressed.',
      items([16, 15, 15, 16, 17], 2)),
    build('mye-q2-2025', 'Quarterly', 'Q2 2025', '2025-04-01', '2025-06-30', '2025-07-12', 84, 100,
      'Good performance across most KPIs. Recruitment targets met ahead of schedule. Training ROI showed notable improvement.',
      items([17, 17, 16, 17, 17], 0)),
    build('mye-q3-2025', 'Quarterly', 'Q3 2025', '2025-07-01', '2025-09-30', '2025-10-08', 91, 100,
      'Outstanding quarter! Excelled in all HR domains. New engagement initiative boosted satisfaction scores. Best performance of the year.',
      items([19, 19, 18, 18, 17], 1)),
    build('mye-q4-2025', 'Quarterly', 'Q4 2025', '2025-10-01', '2025-12-31', '2026-01-05', 88, 100,
      'Strong close to the year. Year-end payroll and compliance audits completed without issues.',
      items([18, 18, 17, 18, 17], 2)),
    build('mye-q1-2026', 'Quarterly', 'Q1 2026', '2026-01-01', '2026-03-31', '2026-03-25', 86, 100,
      'Solid Q1 performance. Onboarding time reduced. Employee satisfaction survey showed improved scores.',
      items([18, 17, 17, 17, 17], 0)),

    // ── Monthly ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
    build('mye-m-jan-2026', 'Monthly', 'Jan 2026', '2026-01-01', '2026-01-31', '2026-02-05', 83, 100,
      'Good start to the year. Recruitment pipeline healthy. Payroll processing completed accurately.',
      items([17, 16, 17, 17, 16], 1)),
    build('mye-m-feb-2026', 'Monthly', 'Feb 2026', '2026-02-01', '2026-02-28', '2026-03-05', 87, 100,
      'February showed improvement in training outcomes and engagement. Strategic reviews were productive.',
      items([18, 17, 17, 18, 17], 2)),
    build('mye-m-mar-2026', 'Monthly', 'Mar 2026', '2026-03-01', '2026-03-31', '2026-03-28', 84, 100,
      'Month-end closings were smooth. Compliance audit preparation well handled.',
      items([17, 17, 17, 17, 16], 0)),

    // ── Weekly (Monday-aligned, last 6 weeks of 2026: W8–W13) ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
    // W8  Feb 23–Mar 1  → not marked (gap)
    // W9  Mar 2–8       → not marked (gap)
    build('mye-w-10-2026', 'Weekly', 'Week 10 · Mar 9–Mar 15',  '2026-03-09', '2026-03-15', '2026-03-16', 88, 100,
      'Excellent. All HR tasks completed on schedule. Three new joiners onboarded successfully.',
      items([18, 18, 17, 18, 17], 1)),
    build('mye-w-11-2026', 'Weekly', 'Week 11 · Mar 16–Mar 22', '2026-03-16', '2026-03-22', '2026-03-23', 85, 100,
      'Good. Recruitment interviews efficient. Payroll adjustments processed without errors.',
      items([17, 17, 17, 17, 17], 2)),
    build('mye-w-12-2026', 'Weekly', 'Week 12 · Mar 23–Mar 29', '2026-03-23', '2026-03-29', '2026-03-30', 90, 100,
      'Outstanding! Compliance filing completed ahead of deadline. Satisfaction quick-survey showed high scores.',
      items([19, 18, 18, 18, 17], 0)),
    // W13 Mar 30–Apr 5  → not marked (current week, not yet submitted)

    // ── Daily (last 14 days: Mar 18–31; Mar 29 intentionally removed to show "Not Marked" gap) ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
    // Mar 18–24 → no records (Not Marked)
    build('mye-d-0325', 'Daily', 'Mar 25, 2026 (Tue)', '2026-03-25', '2026-03-25', '2026-03-25', 88, 100,
      'Strong day. All scheduled HR tasks completed efficiently.',      items([18, 18, 17, 18, 17], 1)),
    build('mye-d-0326', 'Daily', 'Mar 26, 2026 (Wed)', '2026-03-26', '2026-03-26', '2026-03-26', 85, 100,
      'Good. Candidate pipeline updated and shared with department heads.',                     items([17, 17, 17, 17, 17], 2)),
    build('mye-d-0327', 'Daily', 'Mar 27, 2026 (Thu)', '2026-03-27', '2026-03-27', '2026-03-27', 90, 100,
      'Excellent. All review meetings completed. Training session feedback compiled.',           items([19, 18, 18, 18, 17], 0)),
    build('mye-d-0328', 'Daily', 'Mar 28, 2026 (Fri)', '2026-03-28', '2026-03-28', '2026-03-28', 83, 100,
      'Satisfactory. End-of-week payroll review completed on time.',                            items([17, 16, 17, 17, 16], 1)),
    // Mar 29 (Sat) — INTENTIONALLY MISSING → will surface as "Not Marked"
    build('mye-d-0330', 'Daily', 'Mar 30, 2026 (Sun)', '2026-03-30', '2026-03-30', '2026-03-30', 91, 100,
      'Outstanding! Finalized all month-end reports ahead of schedule.',                        items([19, 19, 18, 18, 17], 2)),
    build('mye-d-0331', 'Daily', 'Mar 31, 2026 (Mon)', '2026-03-31', '2026-03-31', '2026-03-31', 84, 100,
      'Good Q1 final day. All compliance documents submitted. Q2 planning kickoff prepared.',   items([17, 17, 17, 17, 16], 0)),
  ];
})();

const AVAILABLE_YEARS = [2023, 2024, 2025, 2026];

// ─── Component ────────────────────────────────────────────────────────────────
export default function EvaluationPage() {

  // ── Marking state ──────────────────────────────────────────────────────────
  const [activeTab,          setActiveTab]          = useState<TabKey>('pending');
  const [viewMode,           setViewMode]           = useState<ViewMode>('list');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [searchQ,            setSearchQ]            = useState('');
  const [filterDept,         setFilterDept]         = useState('all');
  const [filterSection,      setFilterSection]      = useState('all');
  const [filterDesignation,  setFilterDesignation]  = useState('all');
  const [markedMap,          setMarkedMap]          = useState<Record<string, EmployeeMarkedRecord>>({});
  const [lineInputs,         setLineInputs]         = useState<Record<string, EvaluationInputRow>>({});

  // ── My Evaluation state ────────────────────────────────────────────────────
  const [myEvalPeriod,     setMyEvalPeriod]     = useState<PeriodType>('Quarterly');
  const [myEvalYear,       setMyEvalYear]       = useState<number>(2026);
  const [selectedMyEvalId, setSelectedMyEvalId] = useState<string | null>(null);
  const [myEvalModalOpen,  setMyEvalModalOpen]  = useState(false);

  // ── Employee data ──────────────────────────────────────────────────────────
  const employeesWithKPI = useMemo(() =>
    INITIAL_EMPLOYEES.map(emp => ({ emp, rows: matchedSubKPIs(emp) })).filter(e => e.rows.length > 0),
  []);

  const departmentOptions  = useMemo(() => [...new Set(employeesWithKPI.map(e => e.emp.department))],  [employeesWithKPI]);
  const sectionOptions     = useMemo(() => [...new Set(employeesWithKPI.map(e => e.emp.section))],     [employeesWithKPI]);
  const designationOptions = useMemo(() => [...new Set(employeesWithKPI.map(e => e.emp.designation))], [employeesWithKPI]);

  const filteredEmployees = useMemo(() =>
    employeesWithKPI.filter(({ emp }) => {
      const q = searchQ.trim().toLowerCase();
      if (q && !emp.name.toLowerCase().includes(q) && !emp.employeeId.toLowerCase().includes(q)) return false;
      if (filterDept        !== 'all' && emp.department  !== filterDept)        return false;
      if (filterSection     !== 'all' && emp.section     !== filterSection)     return false;
      if (filterDesignation !== 'all' && emp.designation !== filterDesignation) return false;
      return true;
    }),
  [employeesWithKPI, searchQ, filterDept, filterSection, filterDesignation]);

  const pendingEmployees = useMemo(() => filteredEmployees.filter(({ emp }) => !markedMap[emp.id]),  [filteredEmployees, markedMap]);
  const markedEmployees  = useMemo(() => filteredEmployees.filter(({ emp }) => !!markedMap[emp.id]), [filteredEmployees, markedMap]);

  const deadlineByEmployee = useMemo(() => {
    const now = new Date();
    const map: Record<string, string> = {};
    employeesWithKPI.forEach(({ emp }, idx) => {
      const due = new Date(now);
      due.setDate(now.getDate() + 4 + (idx % 14));
      map[emp.id] = toISODate(due);
    });
    return map;
  }, [employeesWithKPI]);

  const listRows = useMemo<EmployeeListRow[]>(() => {
    const source = activeTab === 'pending' ? pendingEmployees : markedEmployees;
    return source.map(({ emp, rows }) => {
      const deadlineDate = deadlineByEmployee[emp.id];
      const marked       = markedMap[emp.id];
      return {
        id: emp.id, name: emp.name, employeeId: emp.employeeId,
        designation: emp.designation, department: emp.department, section: emp.section,
        avatarColor: emp.avatarColor, subKPI: rows.length,
        mainKPI: new Set(rows.map(r => r.mainKPIAreaId)).size,
        deadlineDate, deadlineDaysLeft: daysLeftFromToday(deadlineDate),
        isMarked: !!marked,
        scoreLabel: marked ? `${marked.totalMark}/${marked.totalOutOf} (${marked.achievementPct}%)` : '-',
      };
    });
  }, [activeTab, pendingEmployees, markedEmployees, deadlineByEmployee, markedMap]);

  const stats = useMemo(() => {
    const total   = employeesWithKPI.length;
    const marked  = employeesWithKPI.filter(({ emp }) => !!markedMap[emp.id]).length;
    const pending = total - marked;
    const avg     = marked ? Math.round(Object.values(markedMap).reduce((s, r) => s + r.achievementPct, 0) / marked) : 0;
    return { total, marked, pending, avg };
  }, [employeesWithKPI, markedMap]);

  // ── My Evaluation computed ─────────────────────────────────────────────────
  const filteredMyEvalRecords = useMemo(() =>
    MY_EVAL_RECORDS.filter(r => {
      if (r.periodType !== myEvalPeriod) return false;
      if (myEvalPeriod === 'Yearly') return parseInt(r.periodLabel.replace('Year ', '')) === myEvalYear;
      const sy = new Date(r.periodStart).getFullYear();
      const ey = new Date(r.periodEnd).getFullYear();
      return sy === myEvalYear || ey === myEvalYear;
    }).sort((a, b) => new Date(b.periodStart).getTime() - new Date(a.periodStart).getTime()),
  [myEvalPeriod, myEvalYear]);

  /** Slots + records merged — null record = "Not Marked" gap */
  const mergedSlots = useMemo((): EvalSlotEntry[] => {
    const slots = generateExpectedSlots(myEvalPeriod, myEvalYear);
    return slots.map(slot => ({
      slot,
      record: MY_EVAL_RECORDS.find(r => r.periodType === myEvalPeriod && r.periodStart === slot.periodStart) ?? null,
    }));
  }, [myEvalPeriod, myEvalYear]);

  const myEvalStats = useMemo(() => {
    if (filteredMyEvalRecords.length === 0) return null;
    const latest = filteredMyEvalRecords[0];
    const prev   = filteredMyEvalRecords[1];
    const best   = [...filteredMyEvalRecords].sort((a, b) => b.achievementPct - a.achievementPct)[0];
    const avg    = Math.round(filteredMyEvalRecords.reduce((s, r) => s + r.achievementPct, 0) / filteredMyEvalRecords.length);
    const trend  = prev ? latest.achievementPct - prev.achievementPct : 0;
    const notMarkedCount = mergedSlots.filter(e => e.record === null).length;
    return { latest, prev, best, avg, trend, total: filteredMyEvalRecords.length, notMarkedCount };
  }, [filteredMyEvalRecords, mergedSlots]);

  const selectedMyEvalRecord = useMemo(
    () => MY_EVAL_RECORDS.find(r => r.id === selectedMyEvalId) ?? null,
    [selectedMyEvalId],
  );

  // ── Marking form state ─────────────────────────────────────────────────────
  const selectedBundle = useMemo(
    () => employeesWithKPI.find(e => e.emp.id === selectedEmployeeId) ?? null,
    [employeesWithKPI, selectedEmployeeId],
  );

  const groupedSelectedRows = useMemo(() => {
    if (!selectedBundle) return [] as Array<{ areaId: string; areaName: string; areaCode: string; rows: EmployeeSubKPIRow[] }>;
    const map = new Map<string, { areaId: string; areaName: string; areaCode: string; rows: EmployeeSubKPIRow[] }>();
    for (const row of selectedBundle.rows) {
      if (!map.has(row.mainKPIAreaId))
        map.set(row.mainKPIAreaId, { areaId: row.mainKPIAreaId, areaName: row.mainKPIAreaName, areaCode: row.mainKPICode, rows: [] });
      map.get(row.mainKPIAreaId)?.rows.push(row);
    }
    return [...map.values()];
  }, [selectedBundle]);

  const formGroupedRows = useMemo(
    () => groupedSelectedRows.slice(0, FORM_MAIN_KPI_LIMIT).map(g => ({ ...g, rows: g.rows.slice(0, FORM_SUB_KPI_LIMIT) })),
    [groupedSelectedRows],
  );
  const formRowsFlat = useMemo(() => formGroupedRows.flatMap(g => g.rows), [formGroupedRows]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const startMarking = (employeeId: string) => {
    const bundle = employeesWithKPI.find(e => e.emp.id === employeeId);
    if (!bundle) return;
    const initialInput: Record<string, EvaluationInputRow> = {};
    const visibleRows = matchedSubKPIs(bundle.emp).reduce((acc, row) => {
      const byArea = acc.get(row.mainKPIAreaId) ?? [];
      if (!acc.has(row.mainKPIAreaId)) acc.set(row.mainKPIAreaId, byArea);
      byArea.push(row);
      return acc;
    }, new Map<string, EmployeeSubKPIRow[]>());
    const limitedRows = [...visibleRows.values()].slice(0, FORM_MAIN_KPI_LIMIT).flatMap(r => r.slice(0, FORM_SUB_KPI_LIMIT));
    for (const row of limitedRows) {
      const saved = markedMap[employeeId]?.items.find(i => i.subKPIId === row.subKPIId);
      initialInput[row.subKPIId] = { subKPIId: row.subKPIId, markValue: saved?.markValue ?? 0, remarks: saved?.remarks ?? '' };
    }
    setSelectedEmployeeId(employeeId);
    setLineInputs(initialInput);
    setViewMode(markedMap[employeeId] ? 'view' : 'mark');
  };

  const updateLineInput = (subKPIId: string, patch: Partial<EvaluationInputRow>) => {
    setLineInputs(prev => ({
      ...prev,
      [subKPIId]: { ...prev[subKPIId], subKPIId, markValue: patch.markValue ?? prev[subKPIId]?.markValue ?? 0, remarks: patch.remarks ?? prev[subKPIId]?.remarks ?? '' },
    }));
  };

  const submitEvaluation = () => {
    if (!selectedBundle) return;
    const missing = formRowsFlat.some(row => { const v = lineInputs[row.subKPIId]?.markValue; return typeof v !== 'number' || Number.isNaN(v); });
    if (missing) { message.error('Please provide mark value for each Sub KPI before submit.'); return; }
    const over = formRowsFlat.find(row => (lineInputs[row.subKPIId]?.markValue ?? 0) > row.markOutOf);
    if (over) { message.error(`Mark cannot exceed ${over.markOutOf} for ${over.subKPICode}.`); return; }

    const items = formRowsFlat.map(row => {
      const input = lineInputs[row.subKPIId] ?? { subKPIId: row.subKPIId, markValue: 0, remarks: '' };
      return { ...row, markValue: input.markValue, remarks: input.remarks.trim() };
    });
    const totalMark    = items.reduce((s, i) => s + i.markValue, 0);
    const totalOutOf   = items.reduce((s, i) => s + i.markOutOf, 0);
    const achievementPct = totalOutOf > 0 ? Math.round((totalMark / totalOutOf) * 100) : 0;

    setMarkedMap(prev => ({
      ...prev,
      [selectedBundle.emp.id]: {
        employeeId: selectedBundle.emp.id, employeeName: selectedBundle.emp.name,
        employeeCode: selectedBundle.emp.employeeId, designation: selectedBundle.emp.designation,
        department: selectedBundle.emp.department, section: selectedBundle.emp.section,
        submittedAt: new Date().toLocaleString(), totalMark, totalOutOf, achievementPct, items,
      },
    }));
    setViewMode('list');
    setActiveTab('pending');
    setSelectedEmployeeId(null);
    message.success('KPI marks recorded successfully.');
  };

  const selectedSummary = selectedEmployeeId ? markedMap[selectedEmployeeId] : undefined;

  // ── List columns ───────────────────────────────────────────────────────────
  const listColumns: ColumnsType<EmployeeListRow> = [
    {
      title: 'EMPLOYEE', dataIndex: 'name', width: 260,
      render: (_: string, row) => (
        <Space>
          <Avatar style={{ background: row.avatarColor, fontWeight: 700 }}>{initials(row.name)}</Avatar>
          <div>
            <Text strong>{row.name}</Text>
            <div><Text type="secondary" style={{ fontSize: 12 }}>{row.employeeId}</Text></div>
          </div>
        </Space>
      ),
    },
    {
      title: 'DESIGNATION / ORG', dataIndex: 'designation', width: 260,
      render: (_: string, row) => (
        <div>
          <Text>{row.designation}</Text>
          <div><Text type="secondary" style={{ fontSize: 12 }}>{row.department} · {row.section}</Text></div>
        </div>
      ),
    },
    {
      title: 'KPI LOAD', width: 170,
      render: (_: unknown, row) => (
        <Space size={6}>
          <Tag color="blue">Sub: {row.subKPI}</Tag>
          <Tag color="processing">Main: {row.mainKPI}</Tag>
        </Space>
      ),
    },
    {
      title: 'DEADLINE', dataIndex: 'deadlineDaysLeft', width: 190,
      render: (_: number, row) => {
        const days  = row.deadlineDaysLeft;
        const color = days <= 2 ? 'error' : days <= 5 ? 'warning' : 'success';
        const label = days < 0 ? `${Math.abs(days)} day(s) overdue` : `${days} day(s) left`;
        return (
          <Space direction="vertical" size={2}>
            <Tag color={color}>{label}</Tag>
            <Text type="secondary" style={{ fontSize: 11 }}>Due: {row.deadlineDate}</Text>
          </Space>
        );
      },
    },
    {
      title: 'RESULT', dataIndex: 'scoreLabel', width: 180,
      render: (scoreLabel: string, row) => row.isMarked ? <Tag color="geekblue">{scoreLabel}</Tag> : <Text type="secondary">-</Text>,
    },
    {
      title: 'ACTION', width: 140,
      render: (_: unknown, row) => (
        <Button type="primary" icon={row.isMarked ? <EditOutlined /> : <CheckCircleOutlined />} onClick={() => startMarking(row.id)}>
          {row.isMarked ? 'View Marked' : 'Mark'}
        </Button>
      ),
    },
  ];

  // ─────────────────────────────────────────────────────────────────────────
  // Mark / View form
  // ─────────────────────────────────────────────────────────────────────────
  if (viewMode !== 'list' && selectedBundle) {
    const isReadOnly = viewMode === 'view';
    return (
      <div style={{ padding: '16px 20px', background: '#eef5f4', minHeight: '100%', height: '100%', overflowY: 'auto' }}>
        <div style={{ background: HEADER_BG, borderRadius: 16, padding: '14px 16px', marginBottom: 14, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => { setViewMode('list'); setSelectedEmployeeId(null); }} style={{ borderRadius: 10 }}>Back</Button>
            <div>
              <Title level={4} style={{ margin: 0, color: '#fff' }}>{isReadOnly ? 'View Marked KPI' : 'Mark KPI'}</Title>
              <Text style={{ color: '#dcf5f1', fontSize: 12 }}>{selectedBundle.emp.name} · {selectedBundle.emp.employeeId} · {selectedBundle.emp.designation}</Text>
            </div>
          </Space>
          <Tag style={{ borderRadius: 20, paddingInline: 12, borderColor: '#99f6e4', background: '#0f766e', color: '#d1fae5', fontWeight: 700 }}>
            {formGroupedRows.length} Main KPI Area{formGroupedRows.length > 1 ? 's' : ''}
          </Tag>
        </div>

        {selectedSummary && (
          <Card bordered={false} style={{ marginBottom: 14, borderRadius: 14, background: CARD_BG }}>
            <Space size={14} wrap>
              <Tag color="cyan">Submitted: {selectedSummary.submittedAt}</Tag>
              <Tag color="geekblue">Total: {selectedSummary.totalMark}/{selectedSummary.totalOutOf}</Tag>
              <Tag color={selectedSummary.achievementPct >= 85 ? 'success' : selectedSummary.achievementPct >= 70 ? 'processing' : 'warning'}>
                Score: {selectedSummary.achievementPct}%
              </Tag>
            </Space>
          </Card>
        )}

        {formGroupedRows.map(group => (
          <Card key={group.areaId} bordered={false} style={{ marginBottom: 14, borderRadius: 14, background: '#fff', border: '1px solid #d9ebe8' }}
            title={<Space size={10}><Tag color="blue" style={{ margin: 0, fontFamily: 'monospace' }}>{group.areaCode}</Tag><Text strong>{group.areaName}</Text></Space>}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {group.rows.map(row => {
                const line = lineInputs[row.subKPIId] ?? { subKPIId: row.subKPIId, markValue: 0, remarks: '' };
                return (
                  <div key={row.subKPIId} style={{ border: '1px solid #d8e7e5', borderRadius: 12, padding: '12px 14px', background: '#fcfffe' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                      <div>
                        <Space size={8} wrap>
                          <Tag style={{ fontFamily: 'monospace', margin: 0 }}>{row.subKPICode}</Tag>
                          <Text strong>{row.subKPIName}</Text>
                        </Space>
                        <div><Text type="secondary" style={{ fontSize: 12 }}>{row.measurementCriteria}</Text></div>
                      </div>
                      <Text type="secondary" style={{ fontSize: 12 }}>Mark Out Of: {row.markOutOf}</Text>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 10, alignItems: 'start' }}>
                      <div>
                        <Text style={{ fontSize: 12, color: '#475569', display: 'block', marginBottom: 4 }}>Mark Value</Text>
                        <InputNumber value={line.markValue} min={0} max={row.markOutOf} disabled={isReadOnly}
                          onChange={v => updateLineInput(row.subKPIId, { markValue: v ?? 0 })}
                          style={{ width: '100%' }} addonAfter={`/ ${row.markOutOf}`} />
                      </div>
                      <div>
                        <Text style={{ fontSize: 12, color: '#475569', display: 'block', marginBottom: 4 }}>Remarks</Text>
                        <Input.TextArea value={line.remarks} disabled={isReadOnly}
                          onChange={e => updateLineInput(row.subKPIId, { remarks: e.target.value })}
                          autoSize={{ minRows: 1, maxRows: 3 }} placeholder="Write observation for this Sub KPI" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}

        {!isReadOnly && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Button onClick={() => { setViewMode('list'); setSelectedEmployeeId(null); }}>Cancel</Button>
            <Button type="primary" icon={<CheckCircleOutlined />} onClick={submitEvaluation}>Submit Marking</Button>
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Main list page
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '16px 20px', background: '#eef5f4', minHeight: '100%', height: '100%', overflowY: 'auto' }}>

      {/* ── Page header (teal, always) ── */}
      <div style={{ background: HEADER_BG, borderRadius: 16, padding: '16px 18px', marginBottom: 14, color: '#fff' }}>
        <Title level={3} style={{ margin: 0, color: '#fff' }}>
          {activeTab === 'myeval'
            ? <><UserOutlined style={{ marginRight: 8 }} />My Evaluation</>
            : <><TrophyOutlined style={{ marginRight: 8 }} />Evaluation</>}
        </Title>
        <Text style={{ color: '#d8f6f1' }}>
          {activeTab === 'myeval'
            ? `Evaluations received from your line manager — ${ME_EVALUATOR.name} (${ME_EVALUATOR.designation})`
            : 'Employee-wise KPI value marking with pending and recorded tracking.'}
        </Text>
      </div>

      {/* ── Stats row (hidden on My Evaluation tab) ── */}
      {activeTab !== 'myeval' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(160px, 1fr))', gap: 10, marginBottom: 14 }}>
          <Card bordered={false} style={{ borderRadius: 12, background: CARD_BG }}>
            <Text type="secondary">Employees</Text>
            <Title level={3} style={{ margin: 0, color: '#0f766e' }}>{stats.total}</Title>
          </Card>
          <Card bordered={false} style={{ borderRadius: 12, background: CARD_BG }}>
            <Text type="secondary">Pending KPI</Text>
            <Title level={3} style={{ margin: 0, color: '#d97706' }}>{stats.pending}</Title>
          </Card>
          <Card bordered={false} style={{ borderRadius: 12, background: CARD_BG }}>
            <Text type="secondary">Marked KPI</Text>
            <Title level={3} style={{ margin: 0, color: '#059669' }}>{stats.marked}</Title>
          </Card>
          <Card bordered={false} style={{ borderRadius: 12, background: CARD_BG }}>
            <Text type="secondary">Average Achievement</Text>
            <Title level={3} style={{ margin: 0, color: '#0284c7' }}>{stats.avg}%</Title>
          </Card>
        </div>
      )}

      {/* ── Filters (hidden on My Evaluation tab) ── */}
      {activeTab !== 'myeval' && (
        <Card bordered={false} style={{ borderRadius: 14, marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search employee name or code"
              prefix={<SearchOutlined style={{ color: '#64748b' }} />}
              style={{ width: 240, borderColor: '#a7e3d9', borderRadius: 10 }} />
            <Select value={filterDept} onChange={setFilterDept} style={{ width: 180 }}>
              <Option value="all">All Departments</Option>
              {departmentOptions.map(v => <Option key={v} value={v}>{v}</Option>)}
            </Select>
            <Select value={filterSection} onChange={setFilterSection} style={{ width: 180 }}>
              <Option value="all">All Sections</Option>
              {sectionOptions.map(v => <Option key={v} value={v}>{v}</Option>)}
            </Select>
            <Select value={filterDesignation} onChange={setFilterDesignation} style={{ width: 180 }}>
              <Option value="all">All Designations</Option>
              {designationOptions.map(v => <Option key={v} value={v}>{v}</Option>)}
            </Select>
            <Button onClick={() => { setSearchQ(''); setFilterDept('all'); setFilterSection('all'); setFilterDesignation('all'); }}
              style={{ borderRadius: 10, borderColor: '#c7ddda', color: '#94a3b8' }}>
              Reset
            </Button>
          </div>
        </Card>
      )}

      {/* ── Main card with tabs ── */}
      <Card bordered={false} style={{ borderRadius: 14, background: '#f7fbfa' }}>

        {/* Tab buttons */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button type={activeTab === 'pending' ? 'primary' : 'default'} onClick={() => setActiveTab('pending')} style={{ borderRadius: 999 }}>
            Pending ({pendingEmployees.length})
          </Button>
          <Button type={activeTab === 'marked' ? 'primary' : 'default'} onClick={() => setActiveTab('marked')} style={{ borderRadius: 999 }}>
            Marked ({markedEmployees.length})
          </Button>
          <Button
            type={activeTab === 'myeval' ? 'primary' : 'default'}
            onClick={() => setActiveTab('myeval')}
            icon={<UserOutlined />}
            style={{ borderRadius: 999 }}
          >
            My Evaluation
          </Button>
        </div>

        <Divider style={{ margin: '8px 0 12px' }} />

        {/* ── Pending / Marked table ── */}
        {activeTab !== 'myeval' && (
          <Table
            dataSource={listRows}
            columns={listColumns}
            rowKey="id"
            size="small"
            locale={{ emptyText: `No ${activeTab} employees found for current filters.` }}
            pagination={{ pageSize: 8, showSizeChanger: true, pageSizeOptions: [8, 12, 20] }}
            scroll={{ x: 1180, y: 480 }}
          />
        )}

        {/* ── My Evaluation panel ── */}
        {activeTab === 'myeval' && (
          <MyEvaluationPanel
            mergedSlots={mergedSlots}
            stats={myEvalStats}
            period={myEvalPeriod}
            year={myEvalYear}
            onPeriodChange={setMyEvalPeriod}
            onYearChange={setMyEvalYear}
            onViewDetail={id => { setSelectedMyEvalId(id); setMyEvalModalOpen(true); }}
          />
        )}
      </Card>

      {/* ── Detail modal ── */}
      <Modal
        title={null}
        open={myEvalModalOpen}
        onCancel={() => setMyEvalModalOpen(false)}
        footer={<Button onClick={() => setMyEvalModalOpen(false)} style={{ borderRadius: 10, borderColor: '#a7e3d9', color: '#0f766e' }}>Close</Button>}
        width={820}
        styles={{ body: { padding: 0 } }}
      >
        {selectedMyEvalRecord && <MyEvalDetailModal record={selectedMyEvalRecord} />}
      </Modal>
    </div>
  );
}

// ─── My Evaluation Panel ──────────────────────────────────────────────────────
interface MyEvalPanelProps {
  mergedSlots: EvalSlotEntry[];
  stats: { latest: MyEvalRecord; prev: MyEvalRecord | undefined; best: MyEvalRecord; avg: number; trend: number; total: number; notMarkedCount: number } | null;
  period: PeriodType;
  year: number;
  onPeriodChange: (p: PeriodType) => void;
  onYearChange:   (y: number) => void;
  onViewDetail:   (id: string) => void;
}

function MyEvaluationPanel({ mergedSlots, stats, period, year, onPeriodChange, onYearChange, onViewDetail }: MyEvalPanelProps) {
  const PERIOD_TYPES: PeriodType[] = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'];

  return (
    <div>
      {/* Evaluator info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#eef8f6', borderRadius: 12, padding: '10px 14px', marginBottom: 14, border: '1px solid #a7e3d9' }}>
        <Avatar size={40} style={{ background: ME_EVALUATOR.avatarColor, fontWeight: 700, flexShrink: 0 }}>
          {initials(ME_EVALUATOR.name)}
        </Avatar>
        <div>
          <Text style={{ fontSize: 11, color: '#0f766e', display: 'block' }}>Line Manager (Evaluating You)</Text>
          <Text strong style={{ color: '#1f2937' }}>{ME_EVALUATOR.name}</Text>
          <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>{ME_EVALUATOR.designation} · {ME_EVALUATOR.code}</Text>
        </div>
      </div>

      {/* Period filter row */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
        <CalendarOutlined style={{ color: '#0f766e' }} />
        {PERIOD_TYPES.map(p => (
          <Button key={p} size="small"
            type={period === p ? 'primary' : 'default'}
            onClick={() => onPeriodChange(p)}
            style={{ borderRadius: 999, ...(period === p ? {} : { borderColor: '#a7e3d9', color: '#0f766e' }) }}
          >{p}</Button>
        ))}
        <Divider type="vertical" />
        <Select value={year} onChange={onYearChange} size="small" style={{ width: 88 }}>
          {AVAILABLE_YEARS.map(y => <Option key={y} value={y}>{y}</Option>)}
        </Select>
      </div>

      {/* Stats */}
      {stats ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(140px, 1fr))', gap: 10, marginBottom: 16 }}>

          {/* Latest */}
          <Card bordered={false} style={{ borderRadius: 12, background: '#eef8f6', border: '1px solid #a7e3d9' }}>
            <Text type="secondary" style={{ fontSize: 11 }}>Latest Score</Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <Title level={3} style={{ margin: 0, color: stats.latest.achievementColor }}>{stats.latest.achievementPct}%</Title>
              {stats.trend > 0 && <Tooltip title={`+${stats.trend}% vs previous`}><RiseOutlined style={{ color: '#059669', fontSize: 16 }} /></Tooltip>}
              {stats.trend < 0 && <Tooltip title={`${stats.trend}% vs previous`}><FallOutlined style={{ color: '#dc2626', fontSize: 16 }} /></Tooltip>}
              {stats.trend === 0 && stats.prev && <Tooltip title="No change vs previous"><MinusOutlined style={{ color: '#94a3b8', fontSize: 14 }} /></Tooltip>}
            </div>
            <Tag color={stats.latest.achievementTagColor} style={{ marginTop: 4, fontSize: 10 }}>{stats.latest.achievementLevel}</Tag>
          </Card>

          {/* Average */}
          <Card bordered={false} style={{ borderRadius: 12, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
            <Text type="secondary" style={{ fontSize: 11 }}>Period Average</Text>
            <Title level={3} style={{ margin: 0, color: '#0284c7', marginTop: 2 }}>{stats.avg}%</Title>
            <div style={{ marginTop: 4 }}><Progress percent={stats.avg} size="small" showInfo={false} strokeColor="#0284c7" /></div>
          </Card>

          {/* Best */}
          <Card bordered={false} style={{ borderRadius: 12, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <Text type="secondary" style={{ fontSize: 11 }}>Best Period</Text>
            <Title level={3} style={{ margin: 0, color: '#059669', marginTop: 2 }}>{stats.best.achievementPct}%</Title>
            <Text type="secondary" style={{ fontSize: 11 }}>{stats.best.periodLabel}</Text>
          </Card>

          {/* Gaps */}
          <Card bordered={false} style={{ borderRadius: 12, background: stats.notMarkedCount > 0 ? '#fffbeb' : '#f0fdf4', border: `1px solid ${stats.notMarkedCount > 0 ? '#fde68a' : '#bbf7d0'}` }}>
            <Text type="secondary" style={{ fontSize: 11 }}>Not Marked</Text>
            <Title level={3} style={{ margin: 0, color: stats.notMarkedCount > 0 ? '#d97706' : '#059669', marginTop: 2 }}>{stats.notMarkedCount}</Title>
            <Text type="secondary" style={{ fontSize: 11 }}>gap{stats.notMarkedCount !== 1 ? 's' : ''} detected</Text>
          </Card>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8' }}>
          <LineChartOutlined style={{ fontSize: 32, marginBottom: 8, display: 'block' }} />
          <Text type="secondary">No evaluation records found for {period} · {year}</Text>
        </div>
      )}

      {/* Slot list */}
      {mergedSlots.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <Text type="secondary">No expected periods found for this selection.</Text>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {mergedSlots.map((entry, idx) => {
            const { slot, record } = entry;

            // ── Not Marked slot ──
            if (!record) {
              return (
                <div key={slot.periodStart} style={{ border: '1px solid #fde68a', borderRadius: 12, padding: '12px 16px', background: '#fffbeb', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ minWidth: 160 }}>
                    <Text strong style={{ fontSize: 14, color: '#92400e' }}>{slot.periodLabel}</Text>
                    <div>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {slot.periodStart === slot.periodEnd ? slot.periodStart : `${slot.periodStart} → ${slot.periodEnd}`}
                      </Text>
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <Space size={6} wrap>
                      <ExclamationCircleOutlined style={{ color: '#d97706' }} />
                      <Tag color="warning" style={{ margin: 0 }}>Not Marked</Tag>
                      <Text type="secondary" style={{ fontSize: 12 }}>Evaluation not submitted for this period</Text>
                    </Space>
                  </div>
                  <Text type="secondary" style={{ fontSize: 18 }}>—</Text>
                </div>
              );
            }

            // ── Marked slot ──
            const isLatest   = idx === 0;
            const prevRecord = mergedSlots.slice(idx + 1).find(e => e.record !== null)?.record;
            const diff       = prevRecord ? record.achievementPct - prevRecord.achievementPct : null;

            return (
              <div key={record.id} style={{ border: `1px solid ${isLatest ? '#8dd3c8' : '#d9ebe8'}`, borderRadius: 12, padding: '14px 16px', background: isLatest ? '#eef8f6' : '#fff', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Period info */}
                <div style={{ minWidth: 160 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <Text strong style={{ fontSize: 14 }}>{record.periodLabel}</Text>
                    {isLatest && (
                      <Tag style={{ margin: 0, background: '#e6f7f4', borderColor: '#8dd3c8', color: '#0f766e', fontSize: 10, borderRadius: 999 }}>Latest</Tag>
                    )}
                  </div>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {record.periodStart === record.periodEnd ? record.periodStart : `${record.periodStart} → ${record.periodEnd}`}
                  </Text>
                  <div><Text type="secondary" style={{ fontSize: 11 }}>Submitted: {record.submittedAt}</Text></div>
                </div>

                {/* Progress */}
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, alignItems: 'center' }}>
                    <Tag color={record.achievementTagColor} style={{ margin: 0 }}>{record.achievementLevel}</Tag>
                    <Space size={4}>
                      <Text strong style={{ color: record.achievementColor }}>{record.achievementPct}%</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>({record.totalMark}/{record.totalOutOf})</Text>
                      {diff !== null && diff > 0  && <Tooltip title={`+${diff}% vs previous`}><RiseOutlined style={{ color: '#059669' }} /></Tooltip>}
                      {diff !== null && diff < 0  && <Tooltip title={`${diff}% vs previous`}><FallOutlined style={{ color: '#dc2626' }} /></Tooltip>}
                      {diff !== null && diff === 0 && <Tooltip title="Same as previous"><MinusOutlined style={{ color: '#94a3b8' }} /></Tooltip>}
                    </Space>
                  </div>
                  <Progress percent={record.achievementPct} size="small" strokeColor={record.achievementColor} showInfo={false} />
                </div>

                {/* Action */}
                <Button icon={<EyeOutlined />} onClick={() => onViewDetail(record.id)}
                  style={{ borderRadius: 8, flexShrink: 0, borderColor: '#a7e3d9', color: '#0f766e' }}>
                  View Details
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── My Evaluation Detail Modal ───────────────────────────────────────────────
function MyEvalDetailModal({ record }: { record: MyEvalRecord }) {
  const itemCols: ColumnsType<MyEvalItem> = [
    {
      title: 'Sub KPI', width: 200,
      render: (_: unknown, row) => (
        <div>
          <Tag style={{ fontFamily: 'monospace', fontSize: 11, margin: 0, color: '#0f766e', borderColor: '#8dd3c8', background: '#e6f7f4' }}>{row.subKPICode}</Tag>
          <div><Text strong style={{ fontSize: 13 }}>{row.subKPIName}</Text></div>
          <Text type="secondary" style={{ fontSize: 11 }}>{row.measurementCriteria}</Text>
        </div>
      ),
    },
    {
      title: 'Main Area', dataIndex: 'mainKPIAreaName', width: 160,
      render: (v: string, row) => (
        <div>
          <Tag color="blue" style={{ margin: 0, fontFamily: 'monospace', fontSize: 10 }}>{row.mainKPICode}</Tag>
          <div><Text style={{ fontSize: 12 }}>{v}</Text></div>
        </div>
      ),
    },
    {
      title: 'Mark', width: 120, align: 'center' as const,
      render: (_: unknown, row) => {
        const pct   = Math.round((row.markValue / row.markOutOf) * 100);
        const { color } = getAchievementMeta(pct);
        return (
          <div style={{ textAlign: 'center' }}>
            <Text strong style={{ fontSize: 16, color }}>{row.markValue}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>/{row.markOutOf}</Text>
            <Progress percent={pct} size="small" showInfo={false} strokeColor={color} style={{ marginTop: 2 }} />
          </div>
        );
      },
    },
    {
      title: 'Wt.', dataIndex: 'weight', width: 50, align: 'center' as const,
      render: (v: number) => <Tag style={{ color: '#0f766e', borderColor: '#8dd3c8', background: '#e6f7f4' }}>{v}</Tag>,
    },
    {
      title: 'Remarks', dataIndex: 'remarks',
      render: (v: string) => <Text type="secondary" style={{ fontSize: 12 }}>{v || '—'}</Text>,
    },
  ];

  const ar = record.appraisalResult;
  const hasIncrement = ar && ar.incrementPct > 0;
  const noIncrement  = ar && ar.incrementPct === 0;

  return (
    <div>
      {/* Modal header */}
      <div style={{ background: HEADER_BG, borderRadius: '8px 8px 0 0', padding: '16px 20px', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <Title level={4} style={{ margin: 0, color: '#fff' }}>{record.periodLabel}</Title>
            <Text style={{ color: '#d8f6f1', fontSize: 12 }}>
              {record.periodStart === record.periodEnd ? record.periodStart : `${record.periodStart} → ${record.periodEnd}`} · Submitted: {record.submittedAt}
            </Text>
          </div>
          <Tag style={{ background: record.achievementColor, color: '#fff', borderColor: 'transparent', fontWeight: 700, fontSize: 13, padding: '4px 14px', borderRadius: 20 }}>
            {record.achievementLevel}
          </Tag>
        </div>
      </div>

      <div style={{ padding: '16px 20px' }}>

        {/* ── Congratulations banner (increment case) ── */}
        {hasIncrement && (
          <div style={{ background: 'linear-gradient(120deg, #f0fdf4 0%, #ecfdf5 100%)', border: '1px solid #6ee7b7', borderRadius: 12, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: 36, lineHeight: 1 }}>🎉</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#065f46' }}>Congratulations!</div>
              <div style={{ fontSize: 13, color: '#047857', marginTop: 2 }}>
                Your outstanding performance has earned you a <strong>+{ar!.incrementPct}% salary increment</strong> effective from {ar!.effectiveDate}.
              </div>
            </div>
          </div>
        )}

        {/* ── No increment notice ── */}
        {noIncrement && (
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '12px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: 32, lineHeight: 1 }}>📋</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#92400e' }}>No Increment This Cycle</div>
              <div style={{ fontSize: 13, color: '#b45309', marginTop: 2 }}>
                Based on this appraisal result, no salary increment has been awarded for this review period. Continue improving to unlock future increments.
              </div>
            </div>
          </div>
        )}

        {/* Evaluator + score summary */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#eef8f6', borderRadius: 10, padding: '10px 14px', flex: 1, minWidth: 200, border: '1px solid #a7e3d9' }}>
            <Avatar size={36} style={{ background: record.evaluatorAvatarColor, fontWeight: 700 }}>{initials(record.evaluatedBy)}</Avatar>
            <div>
              <Text style={{ fontSize: 11, color: '#0f766e', display: 'block' }}>Evaluated by</Text>
              <Text strong>{record.evaluatedBy}</Text>
              <Text type="secondary" style={{ fontSize: 11, marginLeft: 6 }}>{record.evaluatorDesignation} · {record.evaluatorCode}</Text>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1, minWidth: 240 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: record.achievementColor, lineHeight: 1 }}>{record.achievementPct}%</div>
              <Text type="secondary" style={{ fontSize: 12 }}>Achievement</Text>
              {ar && (
                <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Text style={{ fontSize: 11, color: '#6b7280' }}>
                    Basic: <strong style={{ color: '#111827' }}>৳{ar.newBasic.toLocaleString()}</strong>
                    {ar.incrementPct > 0 && <Text type="secondary" style={{ fontSize: 10 }}> (was ৳{ar.previousBasic.toLocaleString()})</Text>}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#6b7280' }}>
                    Gross: <strong style={{ color: '#111827' }}>৳{ar.newGross.toLocaleString()}</strong>
                    {ar.incrementPct > 0 && <Text type="secondary" style={{ fontSize: 10 }}> (was ৳{ar.previousGross.toLocaleString()})</Text>}
                  </Text>
                </div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontSize: 12 }}>{record.totalMark} marks</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>out of {record.totalOutOf}</Text>
              </div>
              <Progress percent={record.achievementPct} strokeColor={record.achievementColor} format={() => `${record.achievementPct}%`} />
            </div>
          </div>
        </div>

        {/* ── Salary Increment card (yearly appraisal with result) ── */}
        {ar && (
          <div style={{
            background: hasIncrement ? 'linear-gradient(120deg, #f0fdfa 0%, #ecfdf5 100%)' : '#fafafa',
            border: `1px solid ${hasIncrement ? '#6ee7b7' : '#e5e7eb'}`,
            borderRadius: 12, padding: '14px 18px', marginBottom: 16,
          }}>
            <Text strong style={{ fontSize: 12, color: hasIncrement ? '#059669' : '#6b7280', display: 'block', marginBottom: 10, letterSpacing: '0.04em' }}>
              {hasIncrement ? '✓ SALARY INCREMENT' : 'SALARY REVIEW'}
            </Text>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <div>
                <Text type="secondary" style={{ fontSize: 11 }}>PERCENTAGE INCREASE</Text>
                <div style={{ fontWeight: 800, fontSize: 20, color: hasIncrement ? '#059669' : '#6b7280', marginTop: 2 }}>
                  {hasIncrement ? `+${ar.incrementPct}%` : 'No Increment'}
                </div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 11 }}>EFFECTIVE DATE</Text>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#111827', marginTop: 2 }}>{ar.effectiveDate}</div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 11 }}>NEXT APPRAISAL DATE</Text>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#0f766e', marginTop: 2 }}>{ar.nextAppraisalDate}</div>
              </div>
            </div>
          </div>
        )}

        {/* KPI items */}
        <div style={{ marginBottom: 14 }}>
          <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>
            <TrophyOutlined style={{ marginRight: 6, color: '#0f766e' }} />KPI Breakdown
          </Text>
          <Table
            dataSource={record.items}
            columns={itemCols}
            rowKey="subKPICode"
            size="small"
            pagination={false}
            scroll={{ x: 640 }}
            summary={pageData => {
              const totalMark  = pageData.reduce((s, r) => s + r.markValue, 0);
              const totalOutOf = pageData.reduce((s, r) => s + r.markOutOf, 0);
              const { color }  = getAchievementMeta(Math.round((totalMark / totalOutOf) * 100));
              return (
                <Table.Summary.Row style={{ background: '#f7fbfa' }}>
                  <Table.Summary.Cell index={0} colSpan={2}><Text strong>Total</Text></Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="center">
                    <Text strong style={{ color }}>{totalMark}<Text type="secondary">/{totalOutOf}</Text></Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} /><Table.Summary.Cell index={3} />
                </Table.Summary.Row>
              );
            }}
          />
        </div>

        {/* Overall feedback */}
        <div style={{ background: '#f7fbfa', borderRadius: 10, padding: '12px 14px', border: '1px solid #a7e3d9' }}>
          <Text strong style={{ fontSize: 12, color: '#0f766e', display: 'block', marginBottom: 6 }}>
            Overall Feedback from {record.evaluatedBy}
          </Text>
          <Text style={{ fontSize: 13, color: '#334155', lineHeight: 1.6 }}>{record.overallFeedback}</Text>
        </div>
      </div>
    </div>
  );
}
