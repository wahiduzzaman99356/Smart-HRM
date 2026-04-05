/**
 * PerformanceDashboardPage.tsx
 * Performance Management → Dashboard
 *
 * Features:
 *   • Employee dropdown search (partial match, all employees selectable)
 *   • Period filter: Yearly / Monthly / Weekly / Daily
 *   • Summary KPI stat cards
 *   • SVG Bar Chart — KPI area scores (Self vs LM vs HR)
 *   • SVG Line/Area Trend Chart — performance over selected period
 *   • Donut distribution chart — achievement levels
 *   • Evaluator comparison mini-bars
 *   • Detailed KPI records table
 */

import { useMemo, useRef, useState } from 'react';
import {
  Avatar, Badge, Col, Collapse, Input, Progress, Row,
  Select, Space, Table, Tag, Tooltip, Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  AimOutlined, ArrowDownOutlined, ArrowUpOutlined,
  CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined,
  DropboxOutlined, RiseOutlined, SearchOutlined,
  StarOutlined, TrophyOutlined, UserOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Panel } = Collapse;

// ─── Design tokens ─────────────────────────────────────────────────────────────
const P  = 'var(--color-primary)';
const PL = 'var(--color-primary-tint)';
const PB = 'var(--color-border)';
const BG = 'var(--color-bg-subtle)';

// ─── Types ────────────────────────────────────────────────────────────────────
type PeriodFilter = 'Yearly' | 'Monthly' | 'Weekly' | 'Daily';

interface DEmployee {
  id: string;
  name: string;
  code: string;
  designation: string;
  department: string;
  section: string;
  avatarColor: string;
  appraisalType: 'Appraisal' | 'Confirmation';
}

interface AreaScore {
  areaId: string;
  areaCode: string;
  areaName: string;
  perspective: 'Financial' | 'Customer' | 'Internal Process' | 'Learning & Growth';
  weight: number;
  selfScore: number;
  lmScore: number;
  hrScore: number;
  target: number;
}

interface PeriodRecord {
  label: string;
  shortLabel: string;
  date: string;
  selfScore: number;
  lmScore: number;
  hrScore: number;
  overallScore: number;
  areas: AreaScore[];
  achievementLevel: string;
  status: 'Completed' | 'In Review' | 'Pending';
}

interface EmployeeData {
  employee: DEmployee;
  records: { yearly: PeriodRecord[]; monthly: PeriodRecord[]; weekly: PeriodRecord[]; daily: PeriodRecord[] };
  kpiDetails: KPIDetailRow[];
}

interface KPIDetailRow {
  id: string;
  areaCode: string;
  areaName: string;
  kpiCode: string;
  kpiName: string;
  weight: number;
  target: number;
  unit: string;
  selfScore: number;
  lmScore: number;
  hrScore: number;
  avgScore: number;
  achievementLevel: string;
  period: string;
  status: 'Completed' | 'In Review' | 'Pending';
}

// ─── Color helpers ────────────────────────────────────────────────────────────
const PERSP_COLORS: Record<string, { bg: string; color: string; bar: string }> = {
  'Financial':         { bg: 'var(--color-status-info-bg)', color: '#1d4ed8', bar: '#3b82f6' },
  'Customer':          { bg: 'var(--color-status-approved-bg)', color: 'var(--color-primary-dark)', bar: '#10b981' },
  'Internal Process':  { bg: 'var(--color-status-pending-bg)', color: '#d97706', bar: '#f59e0b' },
  'Learning & Growth': { bg: 'var(--color-status-info-bg)', color: '#5b21b6', bar: '#8b5cf6' },
};

function scoreColor(s: number) {
  if (s >= 85) return '#059669';
  if (s >= 70) return 'var(--color-primary)';
  if (s >= 55) return '#d97706';
  return '#dc2626';
}

function scoreBadge(s: number): { label: string; color: string; bg: string } {
  if (s >= 85) return { label: 'Outstanding', color: '#059669', bg: 'var(--color-status-approved-bg)' };
  if (s >= 70) return { label: 'Excellent',   color: 'var(--color-primary)', bg: 'var(--color-status-approved-bg)' };
  if (s >= 55) return { label: 'Good',        color: '#0284c7', bg: 'var(--color-status-info-bg)' };
  if (s >= 40) return { label: 'Average',     color: '#d97706', bg: 'var(--color-status-pending-bg)' };
  return              { label: 'Below Avg',   color: '#dc2626', bg: 'var(--color-status-rejected-bg)' };
}

// ─── Mock data generators ─────────────────────────────────────────────────────
const EMPLOYEES: DEmployee[] = [
  { id: 'me',      name: 'Ahmed Rahman',      code: 'EMP-001', designation: 'HR Manager',            department: 'Human Resources', section: 'General HR',     avatarColor: P,        appraisalType: 'Appraisal' },
  { id: 'emp-042', name: 'Rafiq Islam',        code: 'EMP-042', designation: 'HR Officer',             department: 'Human Resources', section: 'General HR',     avatarColor: '#0284c7', appraisalType: 'Appraisal' },
  { id: 'emp-057', name: 'Nadia Chowdhury',    code: 'EMP-057', designation: 'Recruitment Executive',  department: 'Human Resources', section: 'Recruitment',    avatarColor: '#7c3aed', appraisalType: 'Confirmation' },
  { id: 'emp-033', name: 'Kamal Hossain',      code: 'EMP-033', designation: 'Senior HR Officer',      department: 'Human Resources', section: 'General HR',     avatarColor: '#d97706', appraisalType: 'Appraisal' },
  { id: 'emp-071', name: 'Sadia Begum',        code: 'EMP-071', designation: 'HR Analyst',             department: 'Human Resources', section: 'Training & Dev', avatarColor: '#059669', appraisalType: 'Appraisal' },
  { id: 'emp-089', name: 'Tanvir Alam',        code: 'EMP-089', designation: 'HR Executive',           department: 'Human Resources', section: 'Recruitment',    avatarColor: '#dc2626', appraisalType: 'Confirmation' },
  { id: 'emp-104', name: 'Fatima Begum',       code: 'EMP-104', designation: 'Payroll Executive',      department: 'Finance & Admin',  section: 'Payroll',        avatarColor: '#db2777', appraisalType: 'Appraisal' },
  { id: 'emp-118', name: 'Jahangir Alam',      code: 'EMP-118', designation: 'Compliance Executive',   department: 'Compliance',       section: 'Vetting & Audit',avatarColor: '#0891b2', appraisalType: 'Appraisal' },
];

const AREA_DEFS: Omit<AreaScore, 'selfScore' | 'lmScore' | 'hrScore'>[] = [
  { areaId: 'mk-01', areaCode: 'MK-01', areaName: 'Strategic HR & Org. Development', perspective: 'Internal Process', weight: 10, target: 90 },
  { areaId: 'mk-02', areaCode: 'MK-02', areaName: 'Talent Acquisition & Workforce',  perspective: 'Customer',         weight: 10, target: 85 },
  { areaId: 'mk-03', areaCode: 'MK-03', areaName: 'Regulatory & Compliance',          perspective: 'Internal Process', weight: 8,  target: 95 },
  { areaId: 'mk-04', areaCode: 'MK-04', areaName: 'Training & Development',           perspective: 'Learning & Growth',weight: 9,  target: 90 },
  { areaId: 'mk-05', areaCode: 'MK-05', areaName: 'Performance Management',           perspective: 'Internal Process', weight: 9,  target: 90 },
  { areaId: 'mk-07', areaCode: 'MK-07', areaName: 'Employee Engagement & Culture',    perspective: 'Customer',         weight: 8,  target: 80 },
];

const KPI_ITEMS = [
  { areaIdx: 0, code: 'MK-01-01', name: 'HR Strategic Plan Implementation', unit: '%',    target: 90 },
  { areaIdx: 0, code: 'MK-01-02', name: 'Manpower Planning Accuracy',       unit: '%',    target: 95 },
  { areaIdx: 1, code: 'MK-02-01', name: 'Time to Fill',                     unit: 'Days', target: 60 },
  { areaIdx: 1, code: 'MK-02-02', name: 'Quality of Hire',                  unit: '%',    target: 80 },
  { areaIdx: 2, code: 'MK-03-01', name: 'BLA Compliance Rate',              unit: '%',    target: 100 },
  { areaIdx: 2, code: 'MK-03-02', name: 'Regulatory Audit Score',           unit: '%',    target: 85 },
  { areaIdx: 3, code: 'MK-04-01', name: 'Training Completion Rate',         unit: '%',    target: 95 },
  { areaIdx: 3, code: 'MK-04-02', name: 'Training Effectiveness Score',     unit: '%',    target: 75 },
  { areaIdx: 4, code: 'MK-05-01', name: 'Appraisal Cycle Completion Rate',  unit: '%',    target: 95 },
  { areaIdx: 4, code: 'MK-05-02', name: 'Goal-Setting Adherence',           unit: '%',    target: 90 },
  { areaIdx: 5, code: 'MK-07-01', name: 'Employee Satisfaction Score',      unit: '%',    target: 75 },
];

function seededRand(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function genScore(base: number, seed: number, jitter = 12): number {
  return Math.min(100, Math.max(20, Math.round(base + (seededRand(seed) - 0.5) * jitter * 2)));
}

function buildAreas(empIdx: number, periodSeed: number): AreaScore[] {
  const bases = [82, 79, 91, 75, 85, 77];
  const adjustments = [3, -2, 1, -5, 4, -1, 2, -3];
  const adj = adjustments[empIdx % adjustments.length];
  return AREA_DEFS.map((def, i) => ({
    ...def,
    selfScore: genScore(bases[i] + adj + 3,  periodSeed * 7 + i * 13),
    lmScore:   genScore(bases[i] + adj,       periodSeed * 11 + i * 17),
    hrScore:   genScore(bases[i] + adj - 2,   periodSeed * 13 + i * 19),
  }));
}

function avgAreas(areas: AreaScore[], role: 'self' | 'lm' | 'hr') {
  const scores = areas.map(a => role === 'self' ? a.selfScore : role === 'lm' ? a.lmScore : a.hrScore);
  return Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
}

function levelOf(s: number) { return scoreBadge(s).label; }

function buildYearlyRecords(empIdx: number): PeriodRecord[] {
  return [2022, 2023, 2024, 2025].map((year, i) => {
    const areas = buildAreas(empIdx, year + empIdx * 37);
    const self = avgAreas(areas, 'self');
    const lm   = avgAreas(areas, 'lm');
    const hr   = avgAreas(areas, 'hr');
    const overall = Math.round((self + lm + hr) / 3);
    return {
      label: `FY ${year}`, shortLabel: `${year}`,
      date: `${year}-12-31`,
      selfScore: self, lmScore: lm, hrScore: hr, overallScore: overall,
      areas, achievementLevel: levelOf(overall),
      status: year < 2025 ? 'Completed' : year === 2025 ? 'In Review' : 'Pending',
    };
  });
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function buildMonthlyRecords(empIdx: number): PeriodRecord[] {
  return MONTHS.map((m, i) => {
    const seed = empIdx * 100 + i;
    const areas = buildAreas(empIdx, seed);
    const self = avgAreas(areas, 'self');
    const lm   = avgAreas(areas, 'lm');
    const hr   = i < 9 ? avgAreas(areas, 'hr') : 0;
    const overall = hr > 0 ? Math.round((self + lm + hr) / 3) : Math.round((self + lm) / 2);
    return {
      label: `${m} 2025`, shortLabel: m,
      date: `2025-${String(i + 1).padStart(2, '0')}-01`,
      selfScore: self, lmScore: lm, hrScore: hr, overallScore: overall,
      areas, achievementLevel: levelOf(overall),
      status: i < 9 ? 'Completed' : i === 9 ? 'In Review' : 'Pending',
    };
  });
}

function buildWeeklyRecords(empIdx: number): PeriodRecord[] {
  return Array.from({ length: 12 }, (_, i) => {
    const seed = empIdx * 200 + i;
    const areas = buildAreas(empIdx, seed);
    const self = avgAreas(areas, 'self');
    const lm   = avgAreas(areas, 'lm');
    const hr   = i < 8 ? avgAreas(areas, 'hr') : 0;
    const overall = hr > 0 ? Math.round((self + lm + hr) / 3) : Math.round((self + lm) / 2);
    const weekNum = 40 + i;
    return {
      label: `Week ${weekNum}, 2025`, shortLabel: `W${weekNum}`,
      date: `2025-W${weekNum}`,
      selfScore: self, lmScore: lm, hrScore: hr, overallScore: overall,
      areas, achievementLevel: levelOf(overall),
      status: i < 8 ? 'Completed' : i === 8 ? 'In Review' : 'Pending',
    };
  });
}

function buildDailyRecords(empIdx: number): PeriodRecord[] {
  return Array.from({ length: 30 }, (_, i) => {
    const seed = empIdx * 300 + i;
    const areas = buildAreas(empIdx, seed);
    const self = avgAreas(areas, 'self');
    const lm   = avgAreas(areas, 'lm');
    const hr   = i < 20 ? avgAreas(areas, 'hr') : 0;
    const overall = hr > 0 ? Math.round((self + lm + hr) / 3) : Math.round((self + lm) / 2);
    const day = new Date('2025-10-01');
    day.setDate(day.getDate() + i);
    const label = `${day.getDate()} ${MONTHS[day.getMonth()]}`;
    return {
      label: `${label} 2025`, shortLabel: label,
      date: day.toISOString().slice(0, 10),
      selfScore: self, lmScore: lm, hrScore: hr, overallScore: overall,
      areas, achievementLevel: levelOf(overall),
      status: i < 20 ? 'Completed' : i === 20 ? 'In Review' : 'Pending',
    };
  });
}

function buildKPIDetails(empIdx: number, period: string): KPIDetailRow[] {
  const seed = empIdx * 17 + period.charCodeAt(0);
  return KPI_ITEMS.map((item, i) => {
    const self = genScore(78 + (empIdx % 4) * 3, seed * 7 + i * 11);
    const lm   = genScore(75 + (empIdx % 4) * 3, seed * 11 + i * 13);
    const hr   = genScore(73 + (empIdx % 4) * 3, seed * 13 + i * 17);
    const avg  = Math.round((self + lm + hr) / 3);
    const area = AREA_DEFS[item.areaIdx];
    return {
      id: `${area.areaId}-${item.code}-${empIdx}`,
      areaCode: area.areaCode, areaName: area.areaName,
      kpiCode: item.code, kpiName: item.name,
      weight: Math.round(area.weight / 2),
      target: item.target, unit: item.unit,
      selfScore: self, lmScore: lm, hrScore: hr, avgScore: avg,
      achievementLevel: levelOf(avg),
      period, status: avg >= 70 ? 'Completed' : avg >= 55 ? 'In Review' : 'Pending',
    };
  });
}

const ALL_EMPLOYEE_DATA: EmployeeData[] = EMPLOYEES.map((emp, i) => ({
  employee: emp,
  records: {
    yearly:  buildYearlyRecords(i),
    monthly: buildMonthlyRecords(i),
    weekly:  buildWeeklyRecords(i),
    daily:   buildDailyRecords(i),
  },
  kpiDetails: buildKPIDetails(i, 'FY 2025'),
}));

// ─── SVG Bar Chart ────────────────────────────────────────────────────────────
interface BarDataPoint {
  label: string;
  selfScore: number;
  lmScore: number;
  hrScore: number;
  overallScore: number;
}

function SvgBarChart({ data, showEvaluators = false }: { data: BarDataPoint[]; showEvaluators?: boolean }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const W = 680, H = 240;
  const ml = 44, mr = 20, mt = 18, mb = 48;
  const chartW = W - ml - mr;
  const chartH = H - mt - mb;
  const maxVal = 100;
  const gridLines = [0, 25, 50, 75, 100];

  const barCount = data.length;
  const groupW = chartW / barCount;
  const seriesCount = showEvaluators ? 3 : 1;
  const barW = Math.min(28, (groupW * 0.72) / seriesCount);
  const groupPad = (groupW - barW * seriesCount - (seriesCount - 1) * 4) / 2;

  const SERIES = [
    { key: 'selfScore' as const,    color: 'var(--color-primary)', label: 'Self' },
    { key: 'lmScore' as const,      color: '#0284c7', label: 'LM' },
    { key: 'hrScore' as const,      color: '#7c3aed', label: 'HR' },
  ];

  const activeSeries = showEvaluators ? SERIES : [{ key: 'overallScore' as const, color: P, label: 'Overall' }];

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', minWidth: 340, height: 'auto' }}>
        {/* Grid lines */}
        {gridLines.map(g => {
          const y = mt + chartH - (g / maxVal) * chartH;
          return (
            <g key={g}>
              <line x1={ml} y1={y} x2={W - mr} y2={y} stroke="#e5e7eb" strokeWidth={g === 0 ? 1.5 : 1} />
              <text x={ml - 6} y={y + 4} fontSize={9} fill="#9ca3af" textAnchor="end">{g}</text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, gi) => {
          const gx = ml + gi * groupW;
          return (
            <g key={gi}
              onMouseEnter={() => setHovered(gi)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Hover bg */}
              {hovered === gi && (
                <rect x={gx} y={mt} width={groupW} height={chartH} fill="#f0fdf4" opacity={0.6} rx={2} />
              )}
              {(activeSeries as { key: 'overallScore' | 'selfScore' | 'lmScore' | 'hrScore'; color: string; label: string }[]).map((s, si) => {
                const val = d[s.key] ?? 0;
                const bh = (val / maxVal) * chartH;
                const bx = gx + groupPad + si * (barW + 4);
                const by = mt + chartH - bh;
                return (
                  <g key={si}>
                    <rect x={bx} y={by} width={barW} height={bh} rx={3} fill={s.color} opacity={hovered === gi ? 1 : 0.85}>
                      <title>{s.label}: {val}%</title>
                    </rect>
                    {hovered === gi && (
                      <text x={bx + barW / 2} y={by - 4} fontSize={9} fill={s.color} textAnchor="middle" fontWeight="700">{val}</text>
                    )}
                  </g>
                );
              })}
              {/* X label */}
              <text x={gx + groupW / 2} y={H - mb + 14} fontSize={9} fill="#6b7280" textAnchor="middle">
                {d.label.length > 6 ? d.label.slice(0, 6) : d.label}
              </text>
            </g>
          );
        })}
      </svg>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 4 }}>
        {(activeSeries as { key: string; color: string; label: string }[]).map(s => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color }} />
            <Text style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{s.label}</Text>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SVG Line/Area Trend Chart ────────────────────────────────────────────────
interface TrendPoint { label: string; overall: number; self: number; lm: number }

function SvgLineChart({ data }: { data: TrendPoint[] }) {
  const W = 680, H = 180;
  const ml = 44, mr = 20, mt = 18, mb = 40;
  const cW = W - ml - mr;
  const cH = H - mt - mb;
  const maxVal = 100;
  const N = data.length;

  const px = (i: number) => ml + (i / (N - 1)) * cW;
  const py = (v: number) => mt + cH - (v / maxVal) * cH;

  const LINES = [
    { key: 'overall' as const, color: P,        label: 'Overall', width: 2.5 },
    { key: 'self'    as const, color: '#0284c7', label: 'Self',    width: 1.5 },
    { key: 'lm'      as const, color: '#d97706', label: 'LM',      width: 1.5 },
  ];

  const makeD = (key: 'overall' | 'self' | 'lm') =>
    data.map((d, i) => `${i === 0 ? 'M' : 'L'}${px(i).toFixed(1)},${py(d[key]).toFixed(1)}`).join(' ');

  const areaD = (key: 'overall' | 'self' | 'lm') =>
    `${makeD(key)} L${px(N - 1).toFixed(1)},${(mt + cH).toFixed(1)} L${ml.toFixed(1)},${(mt + cH).toFixed(1)} Z`;

  const [hov, setHov] = useState<number | null>(null);
  const gridLines = [0, 25, 50, 75, 100];

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', minWidth: 300, height: 'auto' }}>
        <defs>
          <linearGradient id="gradLine" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={P} stopOpacity={0.18} />
            <stop offset="100%" stopColor={P} stopOpacity={0.01} />
          </linearGradient>
        </defs>

        {/* Grid */}
        {gridLines.map(g => {
          const y = mt + cH - (g / maxVal) * cH;
          return (
            <g key={g}>
              <line x1={ml} y1={y} x2={W - mr} y2={y} stroke="#e5e7eb" strokeWidth={g === 0 ? 1.5 : 0.8} />
              <text x={ml - 6} y={y + 4} fontSize={9} fill="#9ca3af" textAnchor="end">{g}</text>
            </g>
          );
        })}

        {/* Area fill for overall */}
        <path d={areaD('overall')} fill="url(#gradLine)" />

        {/* Lines */}
        {LINES.map(l => (
          <path key={l.key} d={makeD(l.key)} fill="none" stroke={l.color} strokeWidth={l.width} strokeLinejoin="round" strokeLinecap="round" />
        ))}

        {/* Dots + hover */}
        {data.map((d, i) => (
          <g key={i}>
            <rect
              x={px(i) - 16} y={mt} width={32} height={cH}
              fill="transparent"
              onMouseEnter={() => setHov(i)}
              onMouseLeave={() => setHov(null)}
            />
            <circle cx={px(i)} cy={py(d.overall)} r={hov === i ? 5 : 3} fill={P} stroke="#fff" strokeWidth={1.5} />
            {hov === i && (
              <g>
                <line x1={px(i)} y1={mt} x2={px(i)} y2={mt + cH} stroke="#e5e7eb" strokeDasharray="3 2" />
                <rect x={px(i) - 34} y={py(d.overall) - 30} width={68} height={26} rx={5} fill="rgba(15,118,110,0.9)" />
                <text x={px(i)} y={py(d.overall) - 20} fontSize={10} fill="#fff" textAnchor="middle" fontWeight="700">{d.overall}%</text>
                <text x={px(i)} y={py(d.overall) - 9} fontSize={8} fill="rgba(255,255,255,0.8)" textAnchor="middle">{d.label}</text>
              </g>
            )}
            {/* X label every N/6 */}
            {(i % Math.max(1, Math.floor(N / 6)) === 0 || i === N - 1) && (
              <text x={px(i)} y={H - mb + 14} fontSize={8.5} fill="#9ca3af" textAnchor="middle">
                {d.label.length > 5 ? d.label.slice(0, 5) : d.label}
              </text>
            )}
          </g>
        ))}
      </svg>

      <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 2 }}>
        {LINES.map(l => (
          <div key={l.key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 16, height: 2, background: l.color, borderRadius: 1 }} />
            <Text style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{l.label}</Text>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────
interface DonutSlice { label: string; value: number; color: string; bg: string }

function DonutChart({ slices, total }: { slices: DonutSlice[]; total: number }) {
  const R = 52, CX = 70, CY = 70;
  const circ = 2 * Math.PI * R;
  let offset = 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
      <svg width={140} height={140} viewBox="0 0 140 140">
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#f3f4f6" strokeWidth={16} />
        {slices.filter(s => s.value > 0).map((s, i) => {
          const dash = (s.value / total) * circ;
          const gap  = circ - dash;
          const el = (
            <circle
              key={i}
              cx={CX} cy={CY} r={R}
              fill="none"
              stroke={s.color}
              strokeWidth={16}
              strokeDasharray={`${dash.toFixed(2)} ${gap.toFixed(2)}`}
              strokeDashoffset={(-offset).toFixed(2)}
              strokeLinecap="butt"
              transform={`rotate(-90 ${CX} ${CY})`}
            >
              <title>{s.label}: {s.value}</title>
            </circle>
          );
          offset += dash;
          return el;
        })}
        <text x={CX} y={CY - 6} textAnchor="middle" fontSize={18} fontWeight="800" fill="#111827">{total}</text>
        <text x={CX} y={CY + 10} textAnchor="middle" fontSize={9} fill="#9ca3af">Total</text>
      </svg>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 120 }}>
        {slices.map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color, flexShrink: 0 }} />
            <Text style={{ fontSize: 12, flex: 1 }}>{s.label}</Text>
            <div style={{ minWidth: 28 }}>
              <Text strong style={{ fontSize: 12, color: s.color }}>{s.value}</Text>
            </div>
            <Text type="secondary" style={{ fontSize: 10, minWidth: 30 }}>
              {total > 0 ? `${Math.round((s.value / total) * 100)}%` : '0%'}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Evaluator Comparison Bars ────────────────────────────────────────────────
function EvalCompBar({ label, self, lm, hr, color }: { label: string; self: number; lm: number; hr: number; color: string }) {
  const avg = Math.round((self + lm + hr) / 3);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <Text style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)' }}>{label}</Text>
        <Space size={6}>
          <Tag style={{ borderRadius: 999, fontSize: 10, border: 'none', background: scoreBadge(avg).bg, color: scoreBadge(avg).color, fontWeight: 700, margin: 0 }}>{avg}%</Tag>
        </Space>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {[
          { role: 'Self',  val: self,  c: 'var(--color-primary)' },
          { role: 'LM',    val: lm,    c: '#0284c7' },
          { role: 'HR',    val: hr,    c: '#7c3aed' },
        ].map(({ role, val, c }) => (
          <div key={role} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 10, color: 'var(--color-text-disabled)', minWidth: 24 }}>{role}</Text>
            <div style={{ flex: 1, height: 6, background: 'var(--color-bg-subtle)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${val}%`, height: '100%', background: c, borderRadius: 3, transition: 'width 0.4s ease' }} />
            </div>
            <Text style={{ fontSize: 10, color: c, fontWeight: 700, minWidth: 28, textAlign: 'right' }}>{val}%</Text>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color, bg, border, trend }:
  { icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string; bg: string; border: string; trend?: { delta: number; up: boolean } }) {
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--color-bg-surface)', border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, fontSize: 18, flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-disabled)', letterSpacing: '0.05em', marginBottom: 2 }}>{label}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color, lineHeight: 1.1 }}>{value}</div>
          {trend && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 11, fontWeight: 700, color: trend.up ? '#059669' : '#dc2626' }}>
              {trend.up ? <ArrowUpOutlined style={{ fontSize: 10 }} /> : <ArrowDownOutlined style={{ fontSize: 10 }} />}
              {Math.abs(trend.delta)}%
            </div>
          )}
        </div>
        {sub && <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ─── Sub KPI Bar Chart (grouped by Main KPI area) ────────────────────────────
interface SubKPIBarProps {
  kpiDetails: KPIDetailRow[];
}

function SubKPIBarChart({ kpiDetails }: SubKPIBarProps) {
  const [activeArea, setActiveArea] = useState<string | null>(null);

  // Group by area
  const grouped = useMemo(() => {
    const map = new Map<string, { code: string; name: string; perspective: string; items: KPIDetailRow[] }>();
    kpiDetails.forEach(k => {
      if (!map.has(k.areaCode)) {
        const area = AREA_DEFS.find(a => a.areaCode === k.areaCode);
        map.set(k.areaCode, { code: k.areaCode, name: k.areaName, perspective: area?.perspective ?? 'Internal Process', items: [] });
      }
      map.get(k.areaCode)!.items.push(k);
    });
    return [...map.values()];
  }, [kpiDetails]);

  const displayGroups = activeArea ? grouped.filter(g => g.code === activeArea) : grouped;

  return (
    <div>
      {/* Area filter tabs */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
        <button
          onClick={() => setActiveArea(null)}
          style={{
            border: 'none', cursor: 'pointer', borderRadius: 999, padding: '4px 12px',
            fontSize: 11, fontWeight: 700,
            background: activeArea === null ? P : 'var(--color-bg-subtle)',
            color: activeArea === null ? '#fff' : 'var(--color-text-tertiary)',
          }}
        >All Areas</button>
        {grouped.map(g => {
          const pc = PERSP_COLORS[g.perspective];
          const isActive = activeArea === g.code;
          return (
            <button key={g.code}
              onClick={() => setActiveArea(isActive ? null : g.code)}
              style={{
                border: 'none', cursor: 'pointer', borderRadius: 999, padding: '4px 12px',
                fontSize: 11, fontWeight: 700,
                background: isActive ? pc.bar : pc.bg,
                color: isActive ? '#fff' : pc.color,
              }}
            >
              {g.code}
            </button>
          );
        })}
      </div>

      {/* Charts per area */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {displayGroups.map(group => {
          const pc = PERSP_COLORS[group.perspective];
          const items = group.items;
          const N = items.length;
          const W = 620, H = 200;
          const ml = 0, mr = 8, mt = 16, mb = 64;
          const cW = W - ml - mr;
          const cH = H - mt - mb;
          const groupW = cW / N;
          const barCount = 4; // self, lm, hr, avg
          const barW = Math.min(18, (groupW * 0.8) / barCount);
          const groupPad = (groupW - barW * barCount - 3 * 2) / 2;
          const SERIES = [
            { key: 'selfScore' as const, color: 'var(--color-primary)', label: 'Self' },
            { key: 'lmScore'  as const, color: '#0284c7', label: 'LM' },
            { key: 'hrScore'  as const, color: '#7c3aed', label: 'HR' },
            { key: 'avgScore' as const, color: '#d97706', label: 'Avg' },
          ];

          return (
            <div key={group.code} style={{ background: pc.bg, border: `1px solid ${pc.color}22`, borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Tag style={{ borderRadius: 999, fontSize: 10, fontWeight: 700, border: 'none', background: pc.bar, color: '#fff', margin: 0 }}>
                  {group.code}
                </Tag>
                <Text style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)' }}>{group.name}</Text>
                <Tag style={{ borderRadius: 999, fontSize: 9, fontWeight: 600, border: 'none', background: 'var(--color-bg-surface)', color: pc.color, margin: 0, marginLeft: 'auto' }}>
                  {group.perspective}
                </Tag>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', minWidth: 320, height: 'auto' }}>
                  {/* Grid lines */}
                  {[0, 25, 50, 75, 100].map(g => {
                    const y = mt + cH - (g / 100) * cH;
                    return (
                      <g key={g}>
                        <line x1={0} y1={y} x2={W} y2={y} stroke={g === 0 ? 'var(--color-border)' : 'var(--color-border)'} strokeWidth={g === 0 ? 1.5 : 0.8} />
                        <text x={W - mr + 2} y={y + 3} fontSize={8} fill="#9ca3af" textAnchor="start">{g}</text>
                      </g>
                    );
                  })}

                  {/* Bars per Sub KPI */}
                  {items.map((item, gi) => {
                    const gx = ml + gi * groupW;
                    return (
                      <g key={item.id}>
                        {SERIES.map((s, si) => {
                          const val = item[s.key];
                          const bh = (val / 100) * cH;
                          const bx = gx + groupPad + si * (barW + 2);
                          const by = mt + cH - bh;
                          return (
                            <g key={si}>
                              <rect x={bx} y={by} width={barW} height={bh} rx={2} fill={s.color} opacity={0.88}>
                                <title>{s.label}: {val}%</title>
                              </rect>
                            </g>
                          );
                        })}
                        {/* Target line */}
                        {(() => {
                          const ty = mt + cH - (item.target / 100) * cH;
                          const lx = gx + groupPad - 2;
                          const lx2 = gx + groupW - groupPad + 2;
                          return <line x1={lx} y1={ty} x2={lx2} y2={ty} stroke="#dc2626" strokeWidth={1} strokeDasharray="3 2" opacity={0.6}><title>Target: {item.target}{item.unit}</title></line>;
                        })()}
                        {/* Avg score label */}
                        <text x={gx + groupW / 2} y={mt + cH + 12} fontSize={9} fill={scoreColor(item.avgScore)} textAnchor="middle" fontWeight="700">
                          {item.avgScore}%
                        </text>
                        {/* Sub KPI name — rotated */}
                        <text
                          x={gx + groupW / 2} y={mt + cH + 24}
                          fontSize={8} fill="#6b7280" textAnchor="end"
                          transform={`rotate(-38, ${gx + groupW / 2}, ${mt + cH + 24})`}
                        >
                          {item.kpiName.length > 20 ? item.kpiName.slice(0, 20) + '…' : item.kpiName}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Legend + target note */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginTop: 6 }}>
                {SERIES.map(s => (
                  <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 9, height: 9, borderRadius: 2, background: s.color }} />
                    <Text style={{ fontSize: 10, color: 'var(--color-text-tertiary)' }}>{s.label}</Text>
                  </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 14, height: 1, background: '#dc2626', borderTop: '1px dashed #dc2626' }} />
                  <Text style={{ fontSize: 10, color: '#dc2626' }}>Target</Text>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PerformanceDashboardPage() {
  const [selectedEmpId, setSelectedEmpId] = useState<string>('me');
  const [periodFilter, setPeriodFilter]   = useState<PeriodFilter>('Monthly');
  const [empSearch, setEmpSearch]         = useState('');

  // Employee data
  const empData = useMemo(
    () => ALL_EMPLOYEE_DATA.find(d => d.employee.id === selectedEmpId) ?? ALL_EMPLOYEE_DATA[0],
    [selectedEmpId],
  );

  // Period records
  const periodRecords = useMemo(() => {
    const map: Record<PeriodFilter, PeriodRecord[]> = {
      Yearly:  empData.records.yearly,
      Monthly: empData.records.monthly,
      Weekly:  empData.records.weekly,
      Daily:   empData.records.daily,
    };
    return map[periodFilter];
  }, [empData, periodFilter]);

  // Latest record
  const latestRecord = useMemo(
    () => [...periodRecords].reverse().find(r => r.status !== 'Pending') ?? periodRecords[periodRecords.length - 1],
    [periodRecords],
  );

  // Trend delta (latest vs prev-latest)
  const prevRecord = useMemo(() => {
    const done = periodRecords.filter(r => r.status !== 'Pending');
    return done.length >= 2 ? done[done.length - 2] : null;
  }, [periodRecords]);
  const trendDelta = prevRecord ? latestRecord.overallScore - prevRecord.overallScore : 0;

  // Achievement distribution across all period records
  const achieveDist = useMemo(() => {
    const counts: Record<string, number> = {};
    periodRecords.forEach(r => {
      counts[r.achievementLevel] = (counts[r.achievementLevel] ?? 0) + 1;
    });
    const levels = ['Outstanding', 'Excellent', 'Good', 'Average', 'Below Avg'];
    const colors  = ['#059669', 'var(--color-primary)', '#0284c7', '#d97706', '#dc2626'];
    const bgs     = ['var(--color-status-approved-bg)', 'var(--color-status-approved-bg)', 'var(--color-status-info-bg)', 'var(--color-status-pending-bg)', 'var(--color-status-rejected-bg)'];
    return levels.map((l, i) => ({ label: l, value: counts[l] ?? 0, color: colors[i], bg: bgs[i] }));
  }, [periodRecords]);

  // Stats
  const completedRecords = periodRecords.filter(r => r.status === 'Completed');
  const avgOverall = completedRecords.length
    ? Math.round(completedRecords.reduce((s, r) => s + r.overallScore, 0) / completedRecords.length)
    : latestRecord.overallScore;
  const bestAreaScore = useMemo(() => {
    const scores = latestRecord.areas.map(a => ({ name: a.areaName, score: Math.round((a.selfScore + a.lmScore + (a.hrScore || a.lmScore)) / (a.hrScore ? 3 : 2)) }));
    return scores.reduce((a, b) => a.score > b.score ? a : b, scores[0]);
  }, [latestRecord]);

  const pendingCount = periodRecords.filter(r => r.status === 'Pending' || r.status === 'In Review').length;

  // Bar chart data — latest N records (up to 12)
  const barData: BarDataPoint[] = useMemo(() => {
    const slice = periodRecords.slice(-12);
    return slice.map(r => ({
      label: r.shortLabel,
      selfScore: r.selfScore,
      lmScore: r.lmScore,
      hrScore: r.hrScore || r.lmScore,
      overallScore: r.overallScore,
    }));
  }, [periodRecords]);

  // Line chart data
  const lineData: TrendPoint[] = useMemo(() =>
    periodRecords.slice(-12).map(r => ({
      label: r.shortLabel,
      overall: r.overallScore,
      self: r.selfScore,
      lm: r.lmScore,
    })),
    [periodRecords],
  );

  // KPI details table
  const kpiTableData: KPIDetailRow[] = useMemo(() => empData.kpiDetails, [empData]);

  // Filtered employee list for dropdown
  const filteredEmps = useMemo(() => {
    const q = empSearch.trim().toLowerCase();
    return EMPLOYEES.filter(e =>
      !q ||
      e.name.toLowerCase().includes(q) ||
      e.code.toLowerCase().includes(q) ||
      e.designation.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q),
    );
  }, [empSearch]);

  const emp = empData.employee;

  // KPI table columns
  const kpiColumns: ColumnsType<KPIDetailRow> = [
    {
      title: 'KPI',
      width: 220,
      render: (_, row) => (
        <div>
          <div style={{ fontSize: 11, color: 'var(--color-text-disabled)', fontWeight: 700 }}>{row.kpiCode}</div>
          <Text style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)' }}>{row.kpiName}</Text>
        </div>
      ),
    },
    {
      title: 'KPI Area',
      width: 160,
      render: (_, row) => {
        const area = AREA_DEFS.find(a => a.areaCode === row.areaCode);
        const c = PERSP_COLORS[area?.perspective ?? 'Internal Process'];
        return (
          <Tag style={{ borderRadius: 999, fontSize: 10, fontWeight: 700, border: 'none', background: c.bg, color: c.color, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {row.areaName}
          </Tag>
        );
      },
    },
    {
      title: 'Target',
      width: 80,
      render: (_, row) => <Text style={{ fontSize: 12 }}>{row.target} {row.unit}</Text>,
    },
    {
      title: 'Wt.',
      dataIndex: 'weight',
      width: 50,
      render: (v: number) => <Text style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>{v}%</Text>,
    },
    {
      title: 'Self',
      dataIndex: 'selfScore',
      width: 70,
      align: 'center',
      render: (v: number) => <Text style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-primary)' }}>{v}%</Text>,
    },
    {
      title: 'LM',
      dataIndex: 'lmScore',
      width: 70,
      align: 'center',
      render: (v: number) => <Text style={{ fontSize: 13, fontWeight: 800, color: '#0284c7' }}>{v}%</Text>,
    },
    {
      title: 'HR',
      dataIndex: 'hrScore',
      width: 70,
      align: 'center',
      render: (v: number) => <Text style={{ fontSize: 13, fontWeight: 800, color: '#7c3aed' }}>{v}%</Text>,
    },
    {
      title: 'Average',
      dataIndex: 'avgScore',
      width: 100,
      align: 'center',
      render: (v: number) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
          <Progress percent={v} size="small" showInfo={false} strokeColor={scoreColor(v)} trailColor="#e5e7eb" style={{ width: 50 }} />
          <Text style={{ fontSize: 12, fontWeight: 800, color: scoreColor(v) }}>{v}%</Text>
        </div>
      ),
    },
    {
      title: 'Level',
      dataIndex: 'achievementLevel',
      width: 110,
      render: (l: string) => {
        const b = scoreBadge(l === 'Outstanding' ? 90 : l === 'Excellent' ? 75 : l === 'Good' ? 60 : l === 'Average' ? 45 : 30);
        return <Tag style={{ borderRadius: 999, fontSize: 10, border: 'none', background: b.bg, color: b.color, fontWeight: 700 }}>{l}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 100,
      render: (s: string) => {
        const cfg = {
          Completed: { color: 'var(--color-primary-dark)', bg: 'var(--color-status-approved-bg)', icon: <CheckCircleOutlined /> },
          'In Review': { color: '#5b21b6', bg: 'rgba(124, 58, 237, 0.13)', icon: <ClockCircleOutlined /> },
          Pending: { color: '#d97706', bg: 'var(--color-status-pending-bg)', icon: <ClockCircleOutlined /> },
        }[s] ?? { color: 'var(--color-text-tertiary)', bg: 'var(--color-bg-subtle)', icon: <ClockCircleOutlined /> };
        return <Tag icon={cfg.icon} style={{ borderRadius: 999, fontSize: 10, fontWeight: 700, border: 'none', background: cfg.bg, color: cfg.color }}>{s}</Tag>;
      },
    },
  ];

  return (
    <div style={{ padding: '16px 20px', background: BG, height: '100%', overflowY: 'auto', boxSizing: 'border-box' }}>

      {/* ── Page Header + Toolbar ── */}
      <div style={{ background: 'var(--color-bg-surface)', border: `1px solid ${PB}`, borderRadius: 14, padding: '16px 20px', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: PL, border: `1px solid ${PB}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RiseOutlined style={{ color: P, fontSize: 19 }} />
            </div>
            <div>
              <Title level={4} style={{ margin: 0, color: 'var(--color-text-primary)' }}>Performance Dashboard</Title>
              <Text type="secondary" style={{ fontSize: 12 }}>KPI achievement tracking · appraisal overview · trend analysis</Text>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', width: '100%', justifyContent: 'flex-start' }}>
            {/* Employee Search */}
            <Select
              showSearch
              value={selectedEmpId}
              onSearch={setEmpSearch}
              onChange={v => { setSelectedEmpId(v); setEmpSearch(''); }}
              onBlur={() => setEmpSearch('')}
              filterOption={false}
              style={{ width: '100%', maxWidth: 280 }}
              suffixIcon={<SearchOutlined style={{ color: 'var(--color-text-disabled)' }} />}
              placeholder="Search employee…"
              optionLabelProp="label"
              popupMatchSelectWidth={280}
            >
              {filteredEmps.map(e => (
                <Select.Option key={e.id} value={e.id} label={e.name}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 0' }}>
                    <Avatar size={24} style={{ background: e.avatarColor, fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                      {e.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </Avatar>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--color-text-disabled)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.designation} · {e.code}</div>
                    </div>
                  </div>
                </Select.Option>
              ))}
            </Select>

            {/* Period Filter */}
            <div style={{ display: 'flex', background: 'var(--color-bg-subtle)', borderRadius: 10, padding: 3, gap: 2, flexWrap: 'wrap' }}>
              {(['Daily', 'Weekly', 'Monthly', 'Yearly'] as PeriodFilter[]).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriodFilter(p)}
                  style={{
                    border: 'none', cursor: 'pointer', borderRadius: 8, padding: '5px 14px',
                    fontSize: 12, fontWeight: 700,
                    background: periodFilter === p ? P : 'transparent',
                    color: periodFilter === p ? '#fff' : 'var(--color-text-tertiary)',
                    transition: 'all 0.15s',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Employee Profile Strip ── */}
      <div style={{ background: `linear-gradient(135deg, ${P} 0%, #0d9488 100%)`, borderRadius: 14, padding: '16px 22px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <Space size={14}>
          <Avatar size={52} style={{ background: emp.avatarColor, fontSize: 18, fontWeight: 800, border: '2px solid rgba(255,255,255,0.4)' }}>
            {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </Avatar>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>{emp.name}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>
              {emp.designation} · {emp.department} · {emp.code}
            </div>
            <Space size={6} style={{ marginTop: 4 }}>
              <Tag style={{ borderRadius: 999, fontSize: 10, fontWeight: 700, border: 'none', background: emp.appraisalType === 'Confirmation' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.2)', color: '#fff', margin: 0 }}>
                {emp.appraisalType === 'Confirmation' ? '✦ Confirmation' : '⬟ Appraisal'}
              </Tag>
              <Tag style={{ borderRadius: 999, fontSize: 10, fontWeight: 700, border: 'none', background: 'rgba(255,255,255,0.2)', color: '#fff', margin: 0 }}>
                {emp.section}
              </Tag>
            </Space>
          </div>
        </Space>

        <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
          <div style={{ textAlign: 'center', minWidth: 100 }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 700, letterSpacing: '0.06em' }}>CURRENT SCORE</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', lineHeight: 1.1 }}>{latestRecord.overallScore}%</div>
            <Tag style={{ borderRadius: 999, fontSize: 11, fontWeight: 700, border: 'none', background: 'rgba(255,255,255,0.2)', color: '#fff', margin: 0 }}>
              {latestRecord.achievementLevel}
            </Tag>
          </div>
          <div style={{ textAlign: 'center', minWidth: 100 }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 700, letterSpacing: '0.06em' }}>TREND</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', marginTop: 4 }}>
              {trendDelta >= 0
                ? <ArrowUpOutlined style={{ color: 'var(--color-status-approved-bg)', fontSize: 18 }} />
                : <ArrowDownOutlined style={{ color: 'var(--color-status-rejected-bg)', fontSize: 18 }} />}
              <div style={{ fontSize: 22, fontWeight: 800, color: trendDelta >= 0 ? 'var(--color-status-approved-bg)' : 'var(--color-status-rejected-bg)' }}>
                {trendDelta >= 0 ? '+' : ''}{trendDelta}%
              </div>
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>vs prev period</div>
          </div>
          <div style={{ textAlign: 'center', minWidth: 100 }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 700, letterSpacing: '0.06em' }}>VIEW PERIOD</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginTop: 4 }}>{periodFilter}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>{periodRecords.length} records</div>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <StatCard
            icon={<TrophyOutlined />}
            label="OVERALL ACHIEVEMENT"
            value={`${avgOverall}%`}
            sub={scoreBadge(avgOverall).label}
            color={scoreColor(avgOverall)}
            bg={scoreBadge(avgOverall).bg}
            border={avgOverall >= 70 ? PB : 'rgba(253, 230, 138, 0.4)'}
            trend={{ delta: Math.abs(trendDelta), up: trendDelta >= 0 }}
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard
            icon={<StarOutlined />}
            label="BEST KPI AREA"
            value={bestAreaScore?.score ?? 0}
            sub={bestAreaScore?.name?.slice(0, 28) ?? '—'}
            color="#059669"
            bg="#f0fdf4"
            border="#bbf7d0"
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard
            icon={<AimOutlined />}
            label="TOTAL KPI ITEMS"
            value={kpiTableData.length}
            sub="Assigned this cycle"
            color={P}
            bg={PL}
            border={PB}
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard
            icon={<ClockCircleOutlined />}
            label="PENDING REVIEWS"
            value={pendingCount}
            sub={`${completedRecords.length} completed`}
            color="#d97706"
            bg="#fffbeb"
            border="#fde68a"
          />
        </Col>
      </Row>

      {/* ── Charts Row 1: Bar + Donut ── */}
      <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
        {/* Evaluator Bar Chart */}
        <Col xs={24} lg={15}>
          <div style={{ background: 'var(--color-bg-surface)', border: `1px solid ${PB}`, borderRadius: 14, padding: '16px 18px', height: '100%', overflowX: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Space size={8}>
                <div style={{ width: 3, height: 14, background: P, borderRadius: 2 }} />
                <Text style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>Score Over Time</Text>
                <Tag style={{ borderRadius: 999, fontSize: 10, border: `1px solid ${PB}`, background: PL, color: P, fontWeight: 600 }}>{periodFilter}</Tag>
              </Space>
              <Text type="secondary" style={{ fontSize: 11 }}>Last {barData.length} {periodFilter.toLowerCase()} periods</Text>
            </div>
            <SvgBarChart data={barData} showEvaluators />
          </div>
        </Col>

        {/* Achievement Distribution Donut */}
        <Col xs={24} lg={9}>
          <div style={{ background: 'var(--color-bg-surface)', border: `1px solid ${PB}`, borderRadius: 14, padding: '16px 18px', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ width: 3, height: 14, background: '#059669', borderRadius: 2 }} />
              <Text style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>Achievement Distribution</Text>
            </div>
            <DonutChart slices={achieveDist} total={periodRecords.length} />

            <div style={{ marginTop: 14, padding: '10px 12px', background: PL, borderRadius: 10, border: `1px solid ${PB}` }}>
              <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', fontWeight: 700, marginBottom: 4 }}>BEST PERFORMANCE</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <TrophyOutlined style={{ color: '#d97706', fontSize: 14 }} />
                <Text style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {achieveDist[0].value + achieveDist[1].value} Outstanding/Excellent records
                </Text>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* ── Charts Row 2: Trend + KPI Area Breakdown ── */}
      <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
        {/* Line Trend Chart */}
        <Col xs={24} lg={14}>
          <div style={{ background: 'var(--color-bg-surface)', border: `1px solid ${PB}`, borderRadius: 14, padding: '16px 18px', overflowX: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Space size={8}>
                <div style={{ width: 3, height: 14, background: '#0284c7', borderRadius: 2 }} />
                <Text style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>Performance Trend</Text>
              </Space>
              <Space size={8}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {trendDelta >= 0
                    ? <ArrowUpOutlined style={{ color: '#059669', fontSize: 12 }} />
                    : <ArrowDownOutlined style={{ color: '#dc2626', fontSize: 12 }} />}
                  <Text style={{ fontSize: 12, fontWeight: 700, color: trendDelta >= 0 ? '#059669' : '#dc2626' }}>
                    {trendDelta >= 0 ? '+' : ''}{trendDelta}% vs prev
                  </Text>
                </div>
              </Space>
            </div>
            <SvgLineChart data={lineData} />
          </div>
        </Col>

        {/* KPI Area Breakdown */}
        <Col xs={24} lg={10}>
          <div style={{ background: 'var(--color-bg-surface)', border: `1px solid ${PB}`, borderRadius: 14, padding: '16px 18px', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ width: 3, height: 14, background: '#d97706', borderRadius: 2 }} />
              <Text style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>KPI Area Breakdown</Text>
              <Text type="secondary" style={{ fontSize: 11, marginLeft: 'auto' }}>Latest Period</Text>
            </div>
            {latestRecord.areas.map(area => {
              const pc = PERSP_COLORS[area.perspective];
              const avg = Math.round((area.selfScore + area.lmScore + (area.hrScore || area.lmScore)) / (area.hrScore ? 3 : 2));
              return (
                <div key={area.areaId} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Space size={6} style={{ flex: 1, overflow: 'hidden' }}>
                      <Tag style={{ borderRadius: 999, fontSize: 9, fontWeight: 700, border: 'none', background: pc.bg, color: pc.color, margin: 0, padding: '0 6px', flexShrink: 0 }}>
                        {area.areaCode}
                      </Tag>
                      <div style={{ maxWidth: 'calc(100% - 60px)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <Text style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontWeight: 600 }}>{area.areaName}</Text>
                      </div>
                    </Space>
                    <Text style={{ fontSize: 13, fontWeight: 800, color: scoreColor(avg), minWidth: 38, textAlign: 'right' }}>{avg}%</Text>
                  </div>
                  <div style={{ height: 6, background: 'var(--color-bg-subtle)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${avg}%`, height: '100%', background: pc.bar, borderRadius: 3, transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Col>
      </Row>

      {/* ── Evaluator Comparison ── */}
      <div style={{ background: 'var(--color-bg-surface)', border: `1px solid ${PB}`, borderRadius: 14, padding: '16px 18px', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <div style={{ width: 3, height: 14, background: '#7c3aed', borderRadius: 2 }} />
          <Text style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>Evaluator Comparison — By KPI Area</Text>
          <Text type="secondary" style={{ fontSize: 11, marginLeft: 'auto' }}>(Self · Line Manager · HR)</Text>
        </div>
        <Row gutter={[16, 8]}>
          {latestRecord.areas.map(area => {
            const pc = PERSP_COLORS[area.perspective];
            return (
              <Col xs={24} sm={12} lg={8} key={area.areaId}>
                <EvalCompBar
                  label={area.areaName.length > 32 ? area.areaName.slice(0, 32) + '…' : area.areaName}
                  self={area.selfScore}
                  lm={area.lmScore}
                  hr={area.hrScore || area.lmScore}
                  color={pc.bar}
                />
              </Col>
            );
          })}
        </Row>
      </div>

      {/* ── Sub KPI Bar Chart ── */}
      <div style={{ background: 'var(--color-bg-surface)', border: `1px solid ${PB}`, borderRadius: 14, padding: '16px 18px', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 3, height: 14, background: '#d97706', borderRadius: 2 }} />
          <Text style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>Sub KPI Performance — by Main KPI Area</Text>
          <Text type="secondary" style={{ fontSize: 11, marginLeft: 'auto' }}>Self · LM · HR · Avg vs Target</Text>
        </div>
        <Text type="secondary" style={{ fontSize: 11, marginBottom: 12, display: 'block' }}>
          Click an area code to filter. Dashed red line = target value.
        </Text>
        <SubKPIBarChart kpiDetails={kpiTableData} />
      </div>

      {/* ── KPI Records Table ── */}
      <div style={{ background: 'var(--color-bg-surface)', border: `1px solid ${PB}`, borderRadius: 14, padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <Space size={8}>
            <div style={{ width: 3, height: 14, background: P, borderRadius: 2 }} />
            <Text style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>KPI Performance Records</Text>
            <Tag style={{ borderRadius: 999, fontSize: 10, border: `1px solid ${PB}`, background: PL, color: P, fontWeight: 700 }}>
              {kpiTableData.length} items
            </Tag>
          </Space>
          <Space size={8} wrap>
            {[
              { label: 'Self', color: 'var(--color-primary)', bg: PL },
              { label: 'Line Manager', color: '#0284c7', bg: 'var(--color-status-info-bg)' },
              { label: 'HR', color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.13)' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: r.color }} />
                <Text style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{r.label}</Text>
              </div>
            ))}
          </Space>
        </div>

        <Collapse ghost defaultActiveKey={['table']}>
          <Panel key="table" header={null} showArrow={false} forceRender>
            <Table
              dataSource={kpiTableData}
              columns={kpiColumns}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 8, showSizeChanger: true, pageSizeOptions: ['8', '15', '30'], showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}` }}
              scroll={{ x: 900 }}
              rowClassName={(_, idx) => idx % 2 === 0 ? '' : ''}
              style={{ borderRadius: 10, overflow: 'hidden' }}
            />
          </Panel>
        </Collapse>
      </div>

    </div>
  );
}
