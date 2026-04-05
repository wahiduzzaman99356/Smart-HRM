/**
 * MyAppraisalPage.tsx
 * Performance Management → My Appraisal
 *
 * Features:
 *   • Appraisal list — "Confirmation" / "Appraisal" type tags, deadline
 *     countdown, pipeline progress pills
 *   • Self-Mark Drawer — grouped by Main KPI, score + remarks per Sub KPI,
 *     live weighted progress, save-draft / submit
 *   • Review Drawer — tabbed by evaluator role (Self / Line Manager / HR / HOD),
 *     read-only scores + remarks, per-tab weighted summary
 */

import { useMemo, useState } from 'react';
import {
  Badge, Button, Col, Collapse, Drawer, Input,
  InputNumber, Modal, Progress, Row, Select, Space, Tabs, Tag,
  Tooltip, Typography, Avatar, message,
} from 'antd';
import {
  AimOutlined,
  ArrowLeftOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
  FormOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  SendOutlined,
  StarOutlined,
  TrophyOutlined,
  UserOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { NewSeparationModal } from '@/features/offboarding/separation-requests/components/NewSeparationModal';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;

// ─── Design tokens (matches global theme) ────────────────────────────────────
const CLR_PRIMARY   = 'var(--color-primary)';
const CLR_PRIMARY_L = 'var(--color-primary-tint)';
const CLR_BORDER    = 'var(--color-border)';
const CLR_BG        = 'var(--color-bg-subtle)';
const CLR_CARD      = 'var(--color-bg-surface)';

// ─── Types ────────────────────────────────────────────────────────────────────
type AppraisalType = 'Confirmation' | 'Appraisal';
type StepStatus    = 'Pending' | 'Submitted' | 'Skipped';
type AppraisalStatus = 'Pending Self' | 'Self Submitted' | 'In Review' | 'Completed';

interface PipelineStep {
  role: string;
  status: StepStatus;
  submittedAt?: string;
}

interface IncrementData {
  isApplied: boolean;
  percentageIncrease?: number;
  effectiveDate?: string;
  nextAppraisalDate?: string;
  previousBasic?: number;
  newBasic?: number;
  previousGross?: number;
  newGross?: number;
  previousDesignation?: string;
  newDesignation?: string;
}

interface ConfirmationData {
  status: 'Pending' | 'Extended' | 'Completed';
  incrementPercentage?: number;
  incrementBasis?: 'Basic' | 'Gross';
  effectiveFrom?: string;
  extensionMonths?: number;
  extensionEndDate?: string;
  extensionReason?: string;
  previousDesignation?: string;
  newDesignation?: string;
}

interface SubKPIItem {
  id: string;
  code: string;
  name: string;
  mainKPIAreaId: string;
  mainKPIAreaName: string;
  mainKPICode: string;
  measurementCriteria: string;
  targetValue: number;
  unit: string;
  weight: number;
  markOutOf: number;
}

interface SubKPIMarking {
  subKPIId: string;
  score: number | null;
  remarks: string;
}

type EvalMarkings = Record<string, SubKPIMarking[]>; // role → markings

interface AppraisalRecord {
  id: string;
  type: AppraisalType;
  periodLabel: string;
  periodFrom: string;
  periodTo: string;
  selfDeadline: string;
  status: AppraisalStatus;
  pipeline: PipelineStep[];
  subKPIs: SubKPIItem[];
  evalMarkings: EvalMarkings; // pre-filled evaluator markings
  increment?: IncrementData;
  confirmation?: ConfirmationData;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const MY_SUB_KPIS: SubKPIItem[] = [
  // MK-01
  { id: 'sk-01-01', code: 'MK-01-01', name: 'HR Strategic Plan Implementation', mainKPIAreaId: 'mk-01', mainKPIAreaName: 'Strategic HR & Organizational Development', mainKPICode: 'MK-01', measurementCriteria: 'Milestones achieved vs. total plan milestones', targetValue: 90, unit: '%', weight: 15, markOutOf: 10 },
  { id: 'sk-01-02', code: 'MK-01-02', name: 'Policy Development & Revision',    mainKPIAreaId: 'mk-01', mainKPIAreaName: 'Strategic HR & Organizational Development', mainKPICode: 'MK-01', measurementCriteria: 'Policies developed and approved per plan', targetValue: 100, unit: '%', weight: 10, markOutOf: 10 },
  // MK-02
  { id: 'sk-02-01', code: 'MK-02-01', name: 'Time to Fill',                     mainKPIAreaId: 'mk-02', mainKPIAreaName: 'Talent Acquisition & Workforce Management', mainKPICode: 'MK-02', measurementCriteria: 'Avg days from requisition to joining ≤ 60 days', targetValue: 60, unit: 'Days', weight: 12, markOutOf: 10 },
  { id: 'sk-02-02', code: 'MK-02-02', name: 'Quality of Hire',                  mainKPIAreaId: 'mk-02', mainKPIAreaName: 'Talent Acquisition & Workforce Management', mainKPICode: 'MK-02', measurementCriteria: '6-month performance rating of new hires ≥ 80%', targetValue: 80, unit: '%', weight: 13, markOutOf: 10 },
  // MK-03
  { id: 'sk-03-01', code: 'MK-03-01', name: 'BLA Compliance Rate',              mainKPIAreaId: 'mk-03', mainKPIAreaName: 'Regulatory & Labor Law Compliance',         mainKPICode: 'MK-03', measurementCriteria: 'Adherence to Bangladesh Labor Act requirements', targetValue: 100, unit: '%', weight: 15, markOutOf: 10 },
  { id: 'sk-03-02', code: 'MK-03-02', name: 'Regulatory Audit Score',           mainKPIAreaId: 'mk-03', mainKPIAreaName: 'Regulatory & Labor Law Compliance',         mainKPICode: 'MK-03', measurementCriteria: 'Score from external regulatory audit ≥ 85%', targetValue: 85, unit: '%', weight: 10, markOutOf: 10 },
  // MK-05
  { id: 'sk-05-01', code: 'MK-05-01', name: 'Appraisal Cycle Completion Rate',  mainKPIAreaId: 'mk-05', mainKPIAreaName: 'Performance Management',                    mainKPICode: 'MK-05', measurementCriteria: '% of employees assessed on time', targetValue: 95, unit: '%', weight: 10, markOutOf: 10 },
  { id: 'sk-05-02', code: 'MK-05-02', name: 'Goal-Setting Adherence',           mainKPIAreaId: 'mk-05', mainKPIAreaName: 'Performance Management',                    mainKPICode: 'MK-05', measurementCriteria: 'Employees with approved goals within deadline', targetValue: 90, unit: '%', weight: 10, markOutOf: 10 },
  // MK-07
  { id: 'sk-07-01', code: 'MK-07-01', name: 'Employee Satisfaction Score',      mainKPIAreaId: 'mk-07', mainKPIAreaName: 'Employee Engagement & Culture',             mainKPICode: 'MK-07', measurementCriteria: 'Annual engagement survey score ≥ 75%', targetValue: 75, unit: '%', weight: 15, markOutOf: 10 },
];

function blankMarkings(subKPIs: SubKPIItem[]): SubKPIMarking[] {
  return subKPIs.map(s => ({ subKPIId: s.id, score: null, remarks: '' }));
}

const MOCK_LM_MARKINGS: SubKPIMarking[] = [
  { subKPIId: 'sk-01-01', score: 8,  remarks: 'Strong execution on strategic milestones this cycle.' },
  { subKPIId: 'sk-01-02', score: 9,  remarks: 'Excellent policy revision completion.' },
  { subKPIId: 'sk-02-01', score: 7,  remarks: 'Good but some open positions took longer than target.' },
  { subKPIId: 'sk-02-02', score: 8,  remarks: 'Quality of recent hires is commendable.' },
  { subKPIId: 'sk-03-01', score: 10, remarks: 'Full BLA compliance maintained throughout.' },
  { subKPIId: 'sk-03-02', score: 8,  remarks: 'Regulatory audit score exceeded expectations.' },
  { subKPIId: 'sk-05-01', score: 8,  remarks: 'Appraisal cycles completed mostly on time.' },
  { subKPIId: 'sk-05-02', score: 7,  remarks: 'A few late goal approvals but overall on track.' },
  { subKPIId: 'sk-07-01', score: 9,  remarks: 'Engagement initiative was well received.' },
];

const MOCK_HR_MARKINGS: SubKPIMarking[] = [
  { subKPIId: 'sk-01-01', score: 7,  remarks: 'Plan implementation is on track with minor gaps.' },
  { subKPIId: 'sk-01-02', score: 8,  remarks: '' },
  { subKPIId: 'sk-02-01', score: 7,  remarks: 'TTF within acceptable range.' },
  { subKPIId: 'sk-02-02', score: 8,  remarks: '' },
  { subKPIId: 'sk-03-01', score: 9,  remarks: '' },
  { subKPIId: 'sk-03-02', score: 7,  remarks: '' },
  { subKPIId: 'sk-05-01', score: 8,  remarks: '' },
  { subKPIId: 'sk-05-02', score: 8,  remarks: '' },
  { subKPIId: 'sk-07-01', score: 8,  remarks: '' },
];

const MOCK_SELF_ARCHIVE: SubKPIMarking[] = [
  { subKPIId: 'sk-01-01', score: 9,  remarks: 'Completed all planned milestones and initiated 2 additional programs.' },
  { subKPIId: 'sk-01-02', score: 10, remarks: 'All policy revisions were approved ahead of schedule.' },
  { subKPIId: 'sk-02-01', score: 8,  remarks: 'Average time to fill was 52 days, within target.' },
  { subKPIId: 'sk-02-02', score: 8,  remarks: 'New hire average 6-month rating was 84%.' },
  { subKPIId: 'sk-03-01', score: 10, remarks: 'Zero BLA non-compliance cases this period.' },
  { subKPIId: 'sk-03-02', score: 9,  remarks: 'External audit scored 91%.' },
  { subKPIId: 'sk-05-01', score: 9,  remarks: '97% appraisal cycle completion achieved.' },
  { subKPIId: 'sk-05-02', score: 8,  remarks: '92% of goals formally approved within deadline.' },
  { subKPIId: 'sk-07-01', score: 9,  remarks: 'Engagement score reached 82% this year.' },
];

const RECORDS: AppraisalRecord[] = [
  {
    id: 'apr-2026-conf',
    type: 'Confirmation',
    periodLabel: 'Confirmation Review · Q1 2026',
    periodFrom: '2026-01-01',
    periodTo: '2026-03-31',
    selfDeadline: '2026-04-15',
    status: 'Pending Self',
    pipeline: [
      { role: 'Self',         status: 'Pending' },
      { role: 'Line Manager', status: 'Pending' },
      { role: 'HR',           status: 'Pending' },
    ],
    subKPIs: MY_SUB_KPIS.slice(0, 6),
    evalMarkings: {},
    confirmation: {
      status: 'Pending',
    },
  },
  {
    id: 'apr-2025-yearly',
    type: 'Appraisal',
    periodLabel: 'Yearly Appraisal · FY 2025',
    periodFrom: '2025-01-01',
    periodTo: '2025-12-31',
    selfDeadline: '2026-04-05',
    status: 'In Review',
    pipeline: [
      { role: 'Self',         status: 'Submitted', submittedAt: '2026-03-25' },
      { role: 'Line Manager', status: 'Submitted', submittedAt: '2026-03-28' },
      { role: 'HR',           status: 'Pending' },
      { role: 'HOD',          status: 'Pending' },
    ],
    subKPIs: MY_SUB_KPIS,
    evalMarkings: {
      Self:           MOCK_SELF_ARCHIVE,
      'Line Manager': MOCK_LM_MARKINGS,
    },
    increment: {
      isApplied: false,
    },
  },
  {
    id: 'apr-2024-yearly',
    type: 'Appraisal',
    periodLabel: 'Yearly Appraisal · FY 2024',
    periodFrom: '2024-01-01',
    periodTo: '2024-12-31',
    selfDeadline: '2025-02-10',
    status: 'Completed',
    pipeline: [
      { role: 'Self',         status: 'Submitted', submittedAt: '2025-01-28' },
      { role: 'Line Manager', status: 'Submitted', submittedAt: '2025-02-02' },
      { role: 'HR',           status: 'Submitted', submittedAt: '2025-02-06' },
      { role: 'HOD',          status: 'Submitted', submittedAt: '2025-02-09' },
    ],
    subKPIs: MY_SUB_KPIS,
    evalMarkings: {
      Self:           MOCK_SELF_ARCHIVE.map(m => ({ ...m, score: (m.score ?? 0) - 1 })),
      'Line Manager': MOCK_LM_MARKINGS.map(m => ({ ...m, score: (m.score ?? 0) - 1 })),
      HR:             MOCK_HR_MARKINGS,
      HOD:            MOCK_HR_MARKINGS.map(m => ({ ...m, score: Math.min(10, (m.score ?? 0) + 1) })),
    },
    increment: {
      isApplied: true,
      percentageIncrease: 8,
      effectiveDate: '2025-04-01',
      nextAppraisalDate: '2026-04-01',
      previousBasic: 68250,
      newBasic: 73710,
      previousGross: 89250,
      newGross: 96390,
      previousDesignation: 'Senior HR Officer',
      newDesignation: 'Assistant Manager – HR',
    },
  },
  {
    id: 'apr-2025-conf',
    type: 'Confirmation',
    periodLabel: 'Confirmation Review · Q3 2025',
    periodFrom: '2025-07-01',
    periodTo: '2025-09-30',
    selfDeadline: '2026-10-31',
    status: 'Completed',
    pipeline: [
      { role: 'Self',         status: 'Submitted', submittedAt: '2025-09-28' },
      { role: 'Line Manager', status: 'Submitted', submittedAt: '2025-09-29' },
      { role: 'HR',           status: 'Submitted', submittedAt: '2025-10-02' },
      { role: 'HOD',          status: 'Submitted', submittedAt: '2025-10-05' },
    ],
    subKPIs: MY_SUB_KPIS.slice(0, 6),
    evalMarkings: {
      Self:           MOCK_SELF_ARCHIVE.slice(0, 6),
      'Line Manager': MOCK_LM_MARKINGS.slice(0, 6),
      HR:             MOCK_HR_MARKINGS.slice(0, 6),
      HOD:            MOCK_LM_MARKINGS.slice(0, 6).map(m => ({ ...m, score: Math.min(10, (m.score ?? 0) + 1) })),
    },
    confirmation: {
      status: 'Completed',
      incrementPercentage: 9,
      incrementBasis: 'Gross',
      effectiveFrom: '2025-10-01',
      previousDesignation: 'HR Executive',
      newDesignation: 'Senior HR Officer',
    },
  },
  {
    id: 'apr-2024-conf',
    type: 'Confirmation',
    periodLabel: 'Confirmation Review · Q1 2024',
    periodFrom: '2024-01-01',
    periodTo: '2024-03-31',
    selfDeadline: '2024-04-15',
    status: 'Completed',
    pipeline: [
      { role: 'Self',         status: 'Submitted', submittedAt: '2024-03-28' },
      { role: 'Line Manager', status: 'Submitted', submittedAt: '2024-03-29' },
      { role: 'HR',           status: 'Submitted', submittedAt: '2024-04-02' },
      { role: 'HOD',          status: 'Submitted', submittedAt: '2024-04-05' },
    ],
    subKPIs: MY_SUB_KPIS.slice(0, 6),
    evalMarkings: {
      Self:           MOCK_SELF_ARCHIVE.slice(0, 6),
      'Line Manager': MOCK_LM_MARKINGS.slice(0, 6),
      HR:             MOCK_HR_MARKINGS.slice(0, 6),
      HOD:            MOCK_HR_MARKINGS.slice(0, 6).map(m => ({ ...m, score: Math.min(10, (m.score ?? 0) + 1) })),
    },
    confirmation: {
      status: 'Extended',
      incrementPercentage: 0,
      extensionMonths: 3,
      extensionEndDate: '2024-06-30',
      extensionReason: 'Performance improvement period — employee requires additional time to develop core competencies in project management and cross-functional collaboration.',
    },
  },
  {
    id: 'apr-2023-yearly',
    type: 'Appraisal',
    periodLabel: 'Yearly Appraisal · FY 2023',
    periodFrom: '2023-01-01',
    periodTo: '2023-12-31',
    selfDeadline: '2024-02-10',
    status: 'Completed',
    pipeline: [
      { role: 'Self',         status: 'Submitted', submittedAt: '2024-01-25' },
      { role: 'Line Manager', status: 'Submitted', submittedAt: '2024-01-30' },
      { role: 'HR',           status: 'Submitted', submittedAt: '2024-02-03' },
      { role: 'HOD',          status: 'Submitted', submittedAt: '2024-02-08' },
    ],
    subKPIs: MY_SUB_KPIS,
    evalMarkings: {
      Self:           MOCK_SELF_ARCHIVE.map(m => ({ ...m, score: Math.max(1, (m.score ?? 0) - 3) })),
      'Line Manager': MOCK_LM_MARKINGS.map(m => ({ ...m, score: Math.max(1, (m.score ?? 0) - 3) })),
      HR:             MOCK_HR_MARKINGS.map(m => ({ ...m, score: Math.max(1, (m.score ?? 0) - 2) })),
      HOD:            MOCK_HR_MARKINGS.map(m => ({ ...m, score: Math.max(1, (m.score ?? 0) - 2) })),
    },
    increment: {
      isApplied: false,
    },
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const today  = new Date('2026-03-31');
  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000);
}

function groupByMainKPI(subKPIs: SubKPIItem[]) {
  const map = new Map<string, { id: string; name: string; code: string; items: SubKPIItem[] }>();
  for (const s of subKPIs) {
    if (!map.has(s.mainKPIAreaId)) {
      map.set(s.mainKPIAreaId, { id: s.mainKPIAreaId, name: s.mainKPIAreaName, code: s.mainKPICode, items: [] });
    }
    map.get(s.mainKPIAreaId)!.items.push(s);
  }
  return [...map.values()];
}

function calcWeightedScore(subKPIs: SubKPIItem[], markings: SubKPIMarking[]): number {
  const totalWeight = subKPIs.reduce((s, k) => s + k.weight, 0);
  if (!totalWeight) return 0;
  let earned = 0;
  for (const kpi of subKPIs) {
    const m = markings.find(x => x.subKPIId === kpi.id);
    if (m && m.score !== null) {
      earned += (m.score / kpi.markOutOf) * kpi.weight;
    }
  }
  return Math.round((earned / totalWeight) * 100);
}

function scoreColor(pct: number) {
  if (pct >= 85) return '#059669';
  if (pct >= 70) return 'var(--color-primary)';
  if (pct >= 50) return '#d97706';
  return '#dc2626';
}

function scoreBadge(pct: number) {
  if (pct >= 85) return { label: 'Outstanding', color: '#059669', bg: 'var(--color-status-approved-bg)' };
  if (pct >= 70) return { label: 'Excellent',   color: 'var(--color-primary)', bg: 'var(--color-status-approved-bg)' };
  if (pct >= 55) return { label: 'Good',        color: '#0284c7', bg: 'var(--color-status-info-bg)' };
  if (pct >= 40) return { label: 'Average',     color: '#d97706', bg: 'var(--color-status-pending-bg)' };
  return              { label: 'Below Avg',    color: '#dc2626', bg: 'var(--color-status-rejected-bg)' };
}

// ─── Shared: FieldLabel ───────────────────────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-disabled)', letterSpacing: '0.06em', marginBottom: 4 }}>
      {children}
    </div>
  );
}

// ─── Type tag ─────────────────────────────────────────────────────────────────
function TypeTag({ type }: { type: AppraisalType }) {
  const isConf = type === 'Confirmation';
  return (
    <Tag style={{
      borderRadius: 999, fontSize: 11, fontWeight: 700, paddingInline: 10, border: 'none',
      background: isConf ? 'var(--color-status-info-bg)' : 'rgba(124, 58, 237, 0.13)',
      color:      isConf ? '#0369a1' : '#6d28d9',
    }}>
      {isConf ? '✦ Confirmation' : '⬟ Appraisal'}
    </Tag>
  );
}

// ─── Status tag ───────────────────────────────────────────────────────────────
function StatusTag({ status }: { status: AppraisalStatus }) {
  const map: Record<AppraisalStatus, { bg: string; color: string; icon: React.ReactNode }> = {
    'Pending Self':    { bg: 'var(--color-status-pending-bg)', color: '#d97706', icon: <ClockCircleOutlined /> },
    'Self Submitted':  { bg: 'var(--color-status-info-bg)', color: '#1e40af', icon: <SendOutlined /> },
    'In Review':       { bg: '#f3e8ff', color: '#6d28d9', icon: <EyeOutlined /> },
    'Completed':       { bg: 'var(--color-status-approved-bg)', color: 'var(--color-primary-dark)', icon: <CheckCircleOutlined /> },
  };
  const s = map[status];
  return (
    <Tag icon={s.icon} style={{ borderRadius: 999, fontSize: 11, fontWeight: 700, paddingInline: 10, border: 'none', background: s.bg, color: s.color }}>
      {status}
    </Tag>
  );
}

// ─── Pipeline pills ───────────────────────────────────────────────────────────
function PipelinePills({ steps }: { steps: PipelineStep[] }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
      {steps.map((step, idx) => {
        const done    = step.status === 'Submitted';
        const skipped = step.status === 'Skipped';
        const active  = !done && !skipped && steps.slice(0, idx).every(s => s.status === 'Submitted');
        return (
          <div key={step.role} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {idx > 0 && <div style={{ width: 14, height: 1, background: done ? CLR_PRIMARY : 'var(--color-border)' }} />}
            <Tooltip title={step.submittedAt ? `Submitted ${step.submittedAt}` : step.status}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: done ? CLR_PRIMARY_L : skipped ? 'var(--color-bg-subtle)' : active ? 'var(--color-status-pending-bg)' : 'var(--color-bg-subtle)',
                border: `1px solid ${done ? CLR_BORDER : skipped ? 'var(--color-border)' : active ? 'rgba(253, 230, 138, 0.4)' : 'var(--color-border)'}`,
                borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 600,
                color: done ? CLR_PRIMARY : skipped ? 'var(--color-text-disabled)' : active ? '#92400e' : 'var(--color-text-tertiary)',
              }}>
                {done   && <CheckCircleOutlined style={{ fontSize: 11 }} />}
                {active && <ClockCircleOutlined style={{ fontSize: 11 }} />}
                {!done && !active && !skipped && <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-border)' }} />}
                {step.role}
              </div>
            </Tooltip>
          </div>
        );
      })}
    </div>
  );
}

// ─── Deadline badge ───────────────────────────────────────────────────────────
function DeadlineBadge({ dateStr, status }: { dateStr: string; status: AppraisalStatus }) {
  const days = daysUntil(dateStr);
  if (status === 'Completed') {
    return (
      <Space size={4}>
        <LockOutlined style={{ color: 'var(--color-text-disabled)', fontSize: 12 }} />
        <Text type="secondary" style={{ fontSize: 12 }}>Cycle closed</Text>
      </Space>
    );
  }
  const urgent = days <= 5;
  const past   = days < 0;
  return (
    <Space size={4}>
      <CalendarOutlined style={{ fontSize: 12, color: past ? '#dc2626' : urgent ? '#d97706' : 'var(--color-text-tertiary)' }} />
      <Text style={{ fontSize: 12, fontWeight: 600, color: past ? '#dc2626' : urgent ? '#d97706' : 'var(--color-text-secondary)' }}>
        {past
          ? `Overdue by ${Math.abs(days)}d`
          : days === 0
          ? 'Due today'
          : `${days}d left · ${dateStr}`}
      </Text>
      {urgent && !past && <WarningOutlined style={{ fontSize: 11, color: '#d97706' }} />}
    </Space>
  );
}

// ─── Self-Mark Drawer ─────────────────────────────────────────────────────────
interface SelfMarkDrawerProps {
  record: AppraisalRecord | null;
  onClose: () => void;
  onSubmit: (id: string, markings: SubKPIMarking[]) => void;
}

function SelfMarkDrawer({ record, onClose, onSubmit }: SelfMarkDrawerProps) {
  const [markings, setMarkings]   = useState<SubKPIMarking[]>([]);
  const [expanded, setExpanded]   = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Reset markings whenever the drawer opens a new record
  const open = !!record;
  const prevId = useMemo(() => record?.id, [record]);
  useMemo(() => {
    if (!record) return;
    setMarkings(blankMarkings(record.subKPIs));
    setExpanded(groupByMainKPI(record.subKPIs).map(g => g.id));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prevId]);

  if (!record) return null;

  const groups     = groupByMainKPI(record.subKPIs);
  const totalKPIs  = record.subKPIs.length;
  const filledKPIs = markings.filter(m => m.score !== null).length;
  const pct        = totalKPIs ? Math.round((filledKPIs / totalKPIs) * 100) : 0;
  const weightedScore = calcWeightedScore(record.subKPIs, markings);

  const updateMarking = (subKPIId: string, patch: Partial<SubKPIMarking>) =>
    setMarkings(prev => prev.map(m => m.subKPIId === subKPIId ? { ...m, ...patch } : m));

  const handleSubmit = () => {
    const incomplete = markings.filter(m => m.score === null);
    if (incomplete.length > 0) {
      message.warning(`Please score all ${incomplete.length} remaining KPI(s) before submitting.`);
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onSubmit(record.id, markings);
    }, 800);
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={820}
      title={
        <Space size={10}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: CLR_PRIMARY_L, border: `1px solid ${CLR_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FormOutlined style={{ color: CLR_PRIMARY, fontSize: 17 }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text-primary)' }}>Self Assessment</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-disabled)', fontWeight: 400 }}>{record.periodLabel}</div>
          </div>
        </Space>
      }
      styles={{ body: { background: CLR_BG, padding: '16px 20px' }, header: { background: 'var(--color-bg-surface)', borderBottom: '1px solid var(--color-border)' } }}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <Space size={6}>
            <Text style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>{filledKPIs} / {totalKPIs} scored</Text>
            {filledKPIs > 0 && (
              <Text style={{ fontSize: 12, fontWeight: 700, color: scoreColor(weightedScore) }}>
                · Weighted: {weightedScore}%
              </Text>
            )}
          </Space>
          <Space>
            <Button onClick={onClose} style={{ borderRadius: 8 }}>Cancel</Button>
            <Button onClick={() => message.success('Draft saved.')} style={{ borderRadius: 8, borderColor: CLR_BORDER, color: CLR_PRIMARY }}>
              Save Draft
            </Button>
            <Button type="primary" icon={<SendOutlined />} loading={submitting} onClick={handleSubmit}
              style={{ borderRadius: 8 }}>
              Submit Self Assessment
            </Button>
          </Space>
        </div>
      }
    >
      {/* Progress bar */}
      <div style={{ background: 'var(--color-bg-surface)', border: `1px solid ${CLR_BORDER}`, borderRadius: 12, padding: '14px 18px', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)' }}>Completion Progress</Text>
          <Text style={{ fontSize: 12, color: pct === 100 ? '#059669' : 'var(--color-text-tertiary)', fontWeight: 600 }}>
            {pct === 100 ? '✓ All scored' : `${filledKPIs} of ${totalKPIs} KPIs scored`}
          </Text>
        </div>
        <Progress percent={pct} strokeColor={pct === 100 ? '#059669' : CLR_PRIMARY} trailColor="#e5e7eb" size="small" showInfo={false} />
        {filledKPIs > 0 && (
          <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-disabled)' }}>Running weighted score:</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: scoreColor(weightedScore) }}>
              {weightedScore}% — {scoreBadge(weightedScore).label}
            </div>
          </div>
        )}
      </div>

      {/* KPI groups */}
      <Collapse
        activeKey={expanded}
        onChange={keys => setExpanded(keys as string[])}
        ghost
        style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
      >
        {groups.map(group => {
          const groupMarkings = markings.filter(m => group.items.some(i => i.id === m.subKPIId));
          const filledInGroup = groupMarkings.filter(m => m.score !== null).length;
          return (
            <Panel
              key={group.id}
              style={{ background: 'var(--color-bg-surface)', border: `1px solid ${CLR_BORDER}`, borderRadius: 12, overflow: 'hidden', marginBottom: 0 }}
              header={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <Space size={8}>
                    <div style={{ width: 3, height: 14, background: CLR_PRIMARY, borderRadius: 2 }} />
                    <Text style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)' }}>{group.name}</Text>
                    <Tag style={{ borderRadius: 999, fontSize: 10, border: `1px solid ${CLR_BORDER}`, background: CLR_PRIMARY_L, color: CLR_PRIMARY, fontWeight: 600 }}>
                      {group.code}
                    </Tag>
                  </Space>
                  <Tag style={{
                    borderRadius: 999, fontSize: 10, fontWeight: 700, border: 'none',
                    background: filledInGroup === group.items.length ? 'var(--color-status-approved-bg)' : 'var(--color-bg-subtle)',
                    color: filledInGroup === group.items.length ? 'var(--color-primary-dark)' : 'var(--color-text-tertiary)',
                  }}>
                    {filledInGroup}/{group.items.length}
                  </Tag>
                </div>
              }
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {group.items.map((kpi, idx) => {
                  const marking = markings.find(m => m.subKPIId === kpi.id);
                  const scored  = marking?.score !== null && marking?.score !== undefined;
                  return (
                    <div key={kpi.id} style={{
                      border: `1px solid ${scored ? CLR_BORDER : 'var(--color-border)'}`,
                      borderLeft: `3px solid ${scored ? CLR_PRIMARY : 'var(--color-border)'}`,
                      borderRadius: 10, padding: '12px 14px',
                      background: scored ? CLR_PRIMARY_L : 'var(--color-bg-subtle)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div>
                          <Space size={6}>
                            <div style={{ fontSize: 10, background: 'var(--color-bg-subtle)', color: 'var(--color-text-tertiary)', borderRadius: 4, padding: '1px 6px', fontWeight: 700 }}>
                              {idx + 1}
                            </div>
                            <Text style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>{kpi.name}</Text>
                          </Space>
                          <div style={{ fontSize: 11, color: 'var(--color-text-disabled)', marginTop: 3, marginLeft: 20 }}>
                            {kpi.measurementCriteria}
                          </div>
                        </div>
                        <Space size={6}>
                          <Tag style={{ borderRadius: 999, fontSize: 10, border: 'none', background: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                            Wt: {kpi.weight}%
                          </Tag>
                          <Tag style={{ borderRadius: 999, fontSize: 10, border: 'none', background: 'rgba(124, 58, 237, 0.13)', color: '#6d28d9', fontWeight: 600 }}>
                            Target: {kpi.targetValue}{kpi.unit}
                          </Tag>
                        </Space>
                      </div>
                      <Row gutter={12}>
                        <Col span={6}>
                          <FieldLabel>Score (out of {kpi.markOutOf})</FieldLabel>
                          <InputNumber
                            value={marking?.score ?? undefined}
                            onChange={v => updateMarking(kpi.id, { score: v ?? null })}
                            min={0} max={kpi.markOutOf} step={0.5}
                            style={{ width: '100%' }}
                            placeholder="0 – 10"
                            status={scored ? undefined : 'warning'}
                          />
                          {scored && marking && (
                            <div style={{ fontSize: 11, marginTop: 3, color: scoreColor(Math.round((marking.score! / kpi.markOutOf) * 100)) }}>
                              {Math.round((marking.score! / kpi.markOutOf) * 100)}% of target
                            </div>
                          )}
                        </Col>
                        <Col span={18}>
                          <FieldLabel>Remarks / Justification</FieldLabel>
                          <TextArea
                            value={marking?.remarks ?? ''}
                            onChange={e => updateMarking(kpi.id, { remarks: e.target.value })}
                            rows={2}
                            placeholder="Describe your achievement, evidence, or reasoning…"
                            style={{ borderRadius: 8, fontSize: 12, resize: 'none' }}
                            maxLength={500}
                            showCount
                          />
                        </Col>
                      </Row>
                    </div>
                  );
                })}
              </div>
            </Panel>
          );
        })}
      </Collapse>
    </Drawer>
  );
}

// ─── Review Drawer ────────────────────────────────────────────────────────────
interface ReviewDrawerProps {
  record: AppraisalRecord | null;
  onClose: () => void;
}

const ROLE_COLORS: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  Self:           { icon: <UserOutlined />,    color: 'var(--color-primary)', bg: 'var(--color-primary-tint)' },
  'Line Manager': { icon: <StarOutlined />,    color: '#0284c7', bg: 'var(--color-status-info-bg)' },
  HR:             { icon: <FileTextOutlined />,color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.13)' },
  HOD:            { icon: <TrophyOutlined />,  color: '#d97706', bg: 'var(--color-status-pending-bg)' },
};

function FullPageAppraisalReview({ record, onClose }: ReviewDrawerProps) {
  if (!record) return null;

  const submittedRoles = record.pipeline
    .filter(s => s.status === 'Submitted')
    .map(s => s.role);

  const pendingRoles = record.pipeline
    .filter(s => s.status !== 'Submitted')
    .map(s => s.role);

  const groups = groupByMainKPI(record.subKPIs);

  // Calculate overall/combined score (average of all evaluator scores)
  const evaluatorRoles = ['Self', 'Line Manager', 'HR', 'HOD'];
  const allScores = evaluatorRoles
    .map(role => {
      const markings = record.evalMarkings[role] ?? [];
      return calcWeightedScore(record.subKPIs, markings);
    })
    .filter(s => s > 0); // Only count non-zero scores

  const overallScore = allScores.length > 0 
    ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) 
    : 0;

  const renderRoleTab = (role: string) => {
    const markings = record.evalMarkings[role] ?? [];
    const weightedScore = calcWeightedScore(record.subKPIs, markings);
    const badge = scoreBadge(weightedScore);

    if (pendingRoles.includes(role)) {
      return (
        <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--color-text-disabled)' }}>
          <ClockCircleOutlined style={{ fontSize: 32, display: 'block', marginBottom: 10 }} />
          <Text type="secondary" style={{ fontSize: 13 }}>
            {role === 'Self' ? 'Self assessment not yet submitted.' : `Awaiting ${role} review.`}
          </Text>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Summary bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16, background: 'var(--color-bg-surface)',
          border: `1px solid ${CLR_BORDER}`, borderRadius: 12, padding: '12px 18px', flexWrap: 'wrap',
        }}>
          <div>
            <FieldLabel>Weighted Score</FieldLabel>
            <div style={{ fontSize: 22, fontWeight: 800, color: scoreColor(weightedScore) }}>
              {weightedScore}%
            </div>
          </div>
          <div style={{ width: 1, height: 36, background: 'var(--color-bg-subtle)' }} />
          <div>
            <FieldLabel>Achievement Level</FieldLabel>
            <Tag style={{ borderRadius: 999, fontWeight: 700, fontSize: 12, border: 'none', background: badge.bg, color: badge.color }}>
              {badge.label}
            </Tag>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <Progress percent={weightedScore} strokeColor={scoreColor(weightedScore)} trailColor="#e5e7eb" size="small" />
          </div>
        </div>

        {/* KPI groups */}
        {groups.map(group => (
          <div key={group.id} style={{ background: 'var(--color-bg-surface)', border: `1px solid #e5e7eb`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ background: CLR_PRIMARY_L, padding: '10px 16px', borderBottom: `1px solid ${CLR_BORDER}` }}>
              <Space size={8}>
                <div style={{ width: 3, height: 13, background: CLR_PRIMARY, borderRadius: 2 }} />
                <Text style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)' }}>{group.name}</Text>
                <Tag style={{ borderRadius: 999, fontSize: 10, border: `1px solid ${CLR_BORDER}`, background: 'var(--color-bg-surface)', color: CLR_PRIMARY, fontWeight: 600 }}>{group.code}</Tag>
              </Space>
            </div>
            <div style={{ padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {group.items.map((kpi, idx) => {
                const m = markings.find(x => x.subKPIId === kpi.id);
                const pctScore = m && m.score !== null ? Math.round((m.score / kpi.markOutOf) * 100) : null;
                return (
                  <div key={kpi.id} style={{ border: '1px solid #f0f0f0', borderLeft: `3px solid ${pctScore !== null ? scoreColor(pctScore) : 'var(--color-border)'}`, borderRadius: 8, padding: '10px 12px', background: pctScore !== null ? '#fafefe' : 'var(--color-bg-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <Space size={6}>
                        <div style={{ fontSize: 10, background: 'var(--color-bg-subtle)', color: 'var(--color-text-tertiary)', borderRadius: 4, padding: '1px 6px', fontWeight: 700 }}>
                          {idx + 1}
                        </div>
                        <Text style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>{kpi.name}</Text>
                      </Space>
                      <Space size={6}>
                        {pctScore !== null ? (
                          <>
                            <div style={{ fontSize: 16, fontWeight: 800, color: scoreColor(pctScore) }}>
                              {m!.score} <span style={{ fontSize: 11, color: 'var(--color-text-disabled)', fontWeight: 400 }}>/ {kpi.markOutOf}</span>
                            </div>
                            <Tag style={{ borderRadius: 999, fontSize: 10, border: 'none', background: scoreBadge(pctScore).bg, color: scoreBadge(pctScore).color, fontWeight: 700 }}>
                              {pctScore}%
                            </Tag>
                          </>
                        ) : (
                          <Tag style={{ borderRadius: 999, fontSize: 10, border: 'none', background: 'var(--color-bg-subtle)', color: 'var(--color-text-disabled)' }}>Not scored</Tag>
                        )}
                      </Space>
                    </div>
                    {m?.remarks && (
                      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', background: 'var(--color-bg-subtle)', borderRadius: 6, padding: '6px 10px', borderLeft: '2px solid var(--color-border)', marginTop: 4 }}>
                        "{m.remarks}"
                      </div>
                    )}
                    {!m?.remarks && (
                      <div style={{ fontSize: 11, color: 'var(--color-text-disabled)', fontStyle: 'italic' }}>No remarks provided.</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render Overall tab
  const renderOverallTab = () => {
    const selfReady = submittedRoles.includes('Self');
    const selfMarkings = record.evalMarkings['Self'] ?? [];
    const selfScore = calcWeightedScore(record.subKPIs, selfMarkings);
    const selfBadge = scoreBadge(selfScore);

    const overallBadge = scoreBadge(overallScore);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Main score cards */}
        <Row gutter={[12, 12]}>
          {/* Self Score */}
          <Col xs={24} sm={12}>
            <div style={{
              background: 'var(--color-bg-surface)',
              border: `2px solid ${selfReady ? CLR_BORDER : 'var(--color-border)'}`,
              borderRadius: 12,
              padding: 16,
            }}>
              <div style={{ marginBottom: 12 }}>
                <FieldLabel>Your Self Assessment</FieldLabel>
                <div style={{ fontSize: 28, fontWeight: 800, color: scoreColor(selfScore), marginBottom: 8 }}>
                  {selfScore}%
                </div>
                <Tag style={{
                  borderRadius: 999, fontWeight: 700, fontSize: 12, border: 'none',
                  background: selfBadge.bg, color: selfBadge.color
                }}>
                  {selfBadge.label}
                </Tag>
              </div>
              <Progress percent={selfScore} strokeColor={scoreColor(selfScore)} trailColor="#e5e7eb" size="small" />
            </div>
          </Col>

          {/* Overall Combined Score */}
          <Col xs={24} sm={12}>
            <div style={{
              background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
              border: `2px solid #86efac`,
              borderRadius: 12,
              padding: 16,
            }}>
              <div style={{ marginBottom: 12 }}>
                <FieldLabel>OVERALL APPRAISAL SCORE</FieldLabel>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#059669', marginBottom: 8 }}>
                  {overallScore}%
                </div>
                <Tag style={{
                  borderRadius: 999, fontWeight: 700, fontSize: 12, border: 'none',
                  background: overallBadge.bg, color: overallBadge.color
                }}>
                  {overallBadge.label}
                </Tag>
              </div>
              <Progress percent={overallScore} strokeColor="#059669" trailColor="#e5e7eb" size="small" />
            </div>
          </Col>
        </Row>

        {/* Evaluator Scores breakdown */}
        {submittedRoles.length > 0 && (
          <div style={{
            background: 'var(--color-bg-surface)',
            border: `1px solid ${CLR_BORDER}`,
            borderRadius: 12,
            padding: 16,
          }}>
            <div style={{ marginBottom: 12 }}>
              <FieldLabel>Scores from Evaluators</FieldLabel>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {evaluatorRoles.map(role => {
                if (!submittedRoles.includes(role)) return null;
                const markings = record.evalMarkings[role] ?? [];
                const score = calcWeightedScore(record.subKPIs, markings);
                const rcColor = ROLE_COLORS[role] ?? { color: 'var(--color-text-tertiary)', bg: 'var(--color-bg-subtle)' };
                return (
                  <div key={role} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 12px',
                    background: rcColor.bg,
                    borderRadius: 8,
                  }}>
                    <Text style={{ fontSize: 12, fontWeight: 700, color: rcColor.color }}>{role}</Text>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: scoreColor(score) }}>
                        {score}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Increment Details */}
        {record.increment && record.increment.isApplied && (
          <div style={{ background: 'linear-gradient(120deg, #f0fdf4 0%, #ecfdf5 100%)', border: '1px solid #6ee7b7', borderRadius: 12, padding: 16 }}>
            {/* Congratulations banner */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <span style={{ fontSize: 32, lineHeight: 1 }}>🎉</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-primary-dark)' }}>Congratulations!</div>
                <div style={{ fontSize: 12, color: '#047857', marginTop: 2 }}>
                  Your outstanding performance has earned you a <strong>+{record.increment.percentageIncrease}% salary increment</strong> effective from {record.increment.effectiveDate}.
                </div>
              </div>
            </div>
            <Row gutter={[12, 12]}>
              <Col xs={24} sm={8}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 700, marginBottom: 4 }}>PERCENTAGE INCREASE</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#059669' }}>
                      +{record.increment.percentageIncrease}%
                    </div>
                    <Tag style={{ borderRadius: 999, fontSize: 11, fontWeight: 600, border: 'none', background: 'var(--color-status-approved-bg)', color: 'var(--color-primary-dark)', margin: 0 }}>
                      Based on Basic/Gross
                    </Tag>
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 700, marginBottom: 4 }}>EFFECTIVE DATE</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    {record.increment.effectiveDate}
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 700, marginBottom: 4 }}>NEXT APPRAISAL DATE</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-primary)' }}>
                    {record.increment.nextAppraisalDate || 'N/A'}
                  </div>
                </div>
              </Col>
            </Row>
            {record.increment.newDesignation && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 16 }}>🏅</span>
                <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 700 }}>DESIGNATION CHANGE</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <Tag style={{ borderRadius: 999, fontSize: 11, fontWeight: 600, background: 'var(--color-bg-subtle)', color: 'var(--color-text-tertiary)', border: '1px solid var(--color-border)', margin: 0 }}>
                    {record.increment.previousDesignation}
                  </Tag>
                  <span style={{ color: '#059669', fontWeight: 800, fontSize: 14 }}>→</span>
                  <Tag style={{ borderRadius: 999, fontSize: 11, fontWeight: 700, background: 'var(--color-status-approved-bg)', color: 'var(--color-primary-dark)', border: '1px solid #6ee7b7', margin: 0 }}>
                    {record.increment.newDesignation}
                  </Tag>
                </div>
              </div>
            )}
          </div>
        )}

        {/* No Increment Info */}
        {record.increment && !record.increment.isApplied && (
          <div style={{
            background: 'var(--color-status-pending-bg)',
            border: `1px solid #fde68a`,
            borderRadius: 12,
            padding: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <WarningOutlined style={{ fontSize: 18, color: '#d97706' }} />
              <div>
                <FieldLabel>No Salary Increment</FieldLabel>
              </div>
            </div>
            <Text style={{ fontSize: 12, color: '#d97706' }}>
              No increment has been approved for this appraisal period.
            </Text>
          </div>
        )}

        {/* Confirmation Details */}
        {record.confirmation && (
          <div style={{
            background: record.confirmation.status === 'Extended' ? 'var(--color-status-info-bg)' : 'var(--color-status-approved-bg)',
            border: `2px solid ${record.confirmation.status === 'Extended' ? '#bae6fd' : '#86efac'}`,
            borderRadius: 14,
            overflow: 'hidden',
          }}>
            {/* Header strip */}
            <div style={{
              background: record.confirmation.status === 'Extended' ? '#0284c7' : '#059669',
              padding: '12px 20px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              {record.confirmation.status === 'Extended'
                ? <WarningOutlined style={{ fontSize: 16, color: '#fff' }} />
                : <CheckCircleOutlined style={{ fontSize: 16, color: '#fff' }} />}
              <Text style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                {record.confirmation.status === 'Extended' ? 'Confirmation Period Extended' : 'Confirmation Completed'}
              </Text>
              <Tag style={{ marginLeft: 'auto', borderRadius: 999, fontWeight: 700, fontSize: 11, border: 'none',
                background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                {record.confirmation.status}
              </Tag>
            </div>

            <div style={{ padding: 20 }}>
              {/* Confirmed with increment */}
              {record.confirmation.status === 'Completed' && (record.confirmation.incrementPercentage ?? 0) > 0 && (
                <>
                  {/* Congratulations Banner */}
                  <div style={{
                    background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                    border: '1px solid #6ee7b7', borderRadius: 10,
                    padding: '14px 18px', marginBottom: 16,
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <span style={{ fontSize: 28 }}>🎉</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-primary-dark)' }}>Congratulations!</div>
                      <div style={{ fontSize: 12, color: '#047857', marginTop: 2 }}>
                        Your confirmation has been approved with a salary increment.
                      </div>
                    </div>
                  </div>

                  {/* Increment details */}
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8}>
                      <div style={{ textAlign: 'center', background: 'var(--color-bg-surface)', border: '1px solid #d1fae5', borderRadius: 10, padding: '14px 10px' }}>
                        <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 700, marginBottom: 6 }}>INCREMENT</div>
                        <div style={{ fontSize: 32, fontWeight: 900, color: '#059669', lineHeight: 1 }}>
                          +{record.confirmation.incrementPercentage}%
                        </div>
                        {record.confirmation.incrementBasis && (
                          <Tag style={{ marginTop: 8, borderRadius: 999, fontWeight: 700, fontSize: 11, border: 'none',
                            background: 'var(--color-status-approved-bg)', color: 'var(--color-primary-dark)' }}>
                            On {record.confirmation.incrementBasis}
                          </Tag>
                        )}
                      </div>
                    </Col>
                    <Col xs={24} sm={8}>
                      <div style={{ textAlign: 'center', background: 'var(--color-bg-surface)', border: '1px solid #d1fae5', borderRadius: 10, padding: '14px 10px' }}>
                        <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 700, marginBottom: 6 }}>EFFECTIVE FROM</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-primary)' }}>
                          {record.confirmation.effectiveFrom ?? '—'}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--color-text-disabled)', marginTop: 4 }}>Start date of new salary</div>
                      </div>
                    </Col>
                    <Col xs={24} sm={8}>
                      <div style={{ textAlign: 'center', background: 'var(--color-bg-surface)', border: '1px solid #d1fae5', borderRadius: 10, padding: '14px 10px' }}>
                        <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 700, marginBottom: 6 }}>CONFIRMED ON</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-primary)' }}>
                          {record.pipeline.find(s => s.role === 'HOD' || s.role === 'HR')?.submittedAt ?? '—'}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--color-text-disabled)', marginTop: 4 }}>Final approval date</div>
                      </div>
                    </Col>
                  </Row>
                  {record.confirmation.newDesignation && (
                    <div style={{ marginTop: 12, background: 'var(--color-bg-surface)', border: '1px solid #d1fae5', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 16 }}>🏅</span>
                      <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 700 }}>DESIGNATION CHANGE</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <Tag style={{ borderRadius: 999, fontSize: 11, fontWeight: 600, background: 'var(--color-bg-subtle)', color: 'var(--color-text-tertiary)', border: '1px solid var(--color-border)', margin: 0 }}>
                          {record.confirmation.previousDesignation}
                        </Tag>
                        <span style={{ color: '#059669', fontWeight: 800, fontSize: 14 }}>→</span>
                        <Tag style={{ borderRadius: 999, fontSize: 11, fontWeight: 700, background: 'var(--color-status-approved-bg)', color: 'var(--color-primary-dark)', border: '1px solid #6ee7b7', margin: 0 }}>
                          {record.confirmation.newDesignation}
                        </Tag>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Confirmed with no increment */}
              {record.confirmation.status === 'Completed' && (record.confirmation.incrementPercentage ?? 0) === 0 && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: 'var(--color-bg-surface)', border: '1px solid #d1fae5', borderRadius: 10, padding: '14px 18px',
                }}>
                  <span style={{ fontSize: 24 }}>✅</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary-dark)' }}>Confirmation Approved</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 2 }}>Confirmed without a salary increment for this cycle.</div>
                  </div>
                </div>
              )}

              {/* Extension block */}
              {record.confirmation.status === 'Extended' && (
                <>
                  <Row gutter={[16, 16]} style={{ marginBottom: 14 }}>
                    <Col xs={24} sm={8}>
                      <div style={{ background: 'var(--color-bg-surface)', border: '1px solid #bae6fd', borderRadius: 10, padding: '12px 14px' }}>
                        <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 700, marginBottom: 4 }}>EXTENSION PERIOD</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: '#0284c7' }}>{record.confirmation.extensionMonths} Months</div>
                      </div>
                    </Col>
                    <Col xs={24} sm={8}>
                      <div style={{ background: 'var(--color-bg-surface)', border: '1px solid #bae6fd', borderRadius: 10, padding: '12px 14px' }}>
                        <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 700, marginBottom: 4 }}>EXTENSION UNTIL</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-primary)' }}>{record.confirmation.extensionEndDate}</div>
                      </div>
                    </Col>
                    <Col xs={24} sm={8}>
                      <div style={{ background: 'var(--color-bg-surface)', border: '1px solid #bae6fd', borderRadius: 10, padding: '12px 14px' }}>
                        <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 700, marginBottom: 4 }}>INCREMENT</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-disabled)' }}>Not Applied</div>
                      </div>
                    </Col>
                  </Row>
                  {record.confirmation.extensionReason && (
                    <div style={{ background: 'var(--color-bg-surface)', border: '1px solid #bae6fd', borderRadius: 10, padding: '14px 16px' }}>
                      <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: 8 }}>REASON FOR EXTENSION</div>
                      <div style={{ fontSize: 13, color: 'var(--color-text-primary)', lineHeight: 1.7 }}>
                        {record.confirmation.extensionReason}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const tabItems = [
    {
      key: 'overall',
      label: (
        <Space size={5}>
          <TrophyOutlined style={{ fontSize: 16, color: '#059669' }} />
          <span style={{ fontWeight: 700, color: '#059669' }}>Overall</span>
        </Space>
      ),
      children: (
        <div style={{ paddingTop: 12 }}>
          {renderOverallTab()}
        </div>
      ),
    },
    ...record.pipeline.map(step => {
      const rc = ROLE_COLORS[step.role] ?? { icon: <UserOutlined />, color: 'var(--color-text-tertiary)', bg: 'var(--color-bg-subtle)' };
      const submitted = step.status === 'Submitted';
      return {
        key: step.role,
        label: (
          <Space size={5}>
            <span style={{ color: submitted ? rc.color : 'var(--color-text-disabled)' }}>{rc.icon}</span>
            <span style={{ fontWeight: 600, color: submitted ? rc.color : 'var(--color-text-disabled)' }}>{step.role}</span>
            {submitted
              ? <Badge dot style={{ background: '#059669' }} />
              : <Badge dot style={{ background: 'var(--color-border)' }} />}
          </Space>
        ),
        children: (
          <div style={{ paddingTop: 12 }}>
            {renderRoleTab(step.role)}
          </div>
        ),
      };
    }),
  ];

  return (
    <>
      {/* Full-page modal overlay */}
      {record && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
          background: CLR_BG,
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Header */}
          <div style={{
            background: 'var(--color-bg-surface)',
            borderBottom: '1px solid var(--color-border)',
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}>
            <Space size={10}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: CLR_PRIMARY_L, border: `1px solid ${CLR_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <EyeOutlined style={{ color: CLR_PRIMARY, fontSize: 17 }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-text-primary)' }}>Appraisal Review</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-disabled)', fontWeight: 400 }}>{record.periodLabel}</div>
              </div>
            </Space>
            <Button
              type="text"
              size="large"
              onClick={onClose}
              style={{ borderRadius: 8, fontSize: 16 }}
            >
              ✕
            </Button>
          </div>

          {/* Main Content */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
          }}>
            <div style={{ maxWidth: 1400, margin: '0 auto' }}>
              {/* Pipeline timeline */}
              <div style={{ background: 'var(--color-bg-surface)', border: `1px solid ${CLR_BORDER}`, borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
                <Text style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-disabled)', letterSpacing: '0.05em' }}>PIPELINE PROGRESS</Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                  {record.pipeline.map((step, idx) => {
                    const done = step.status === 'Submitted';
                    const rc   = ROLE_COLORS[step.role] ?? { color: 'var(--color-text-tertiary)', bg: 'var(--color-bg-subtle)', icon: <UserOutlined /> };
                    return (
                      <div key={step.role} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {idx > 0 && <div style={{ width: 20, height: 1, background: done ? CLR_PRIMARY : 'var(--color-border)' }} />}
                        <div style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                        }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: '50%',
                            background: done ? rc.bg : 'var(--color-bg-subtle)',
                            border: `2px solid ${done ? rc.color : 'var(--color-border)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: done ? rc.color : 'var(--color-border)', fontSize: 15,
                          }}>
                            {done ? <CheckCircleOutlined /> : rc.icon}
                          </div>
                          <Text style={{ fontSize: 10, fontWeight: 700, color: done ? rc.color : 'var(--color-text-disabled)' }}>{step.role}</Text>
                          {step.submittedAt && <Text style={{ fontSize: 9, color: 'var(--color-text-disabled)' }}>{step.submittedAt}</Text>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Evaluator tabs */}
              <Tabs
                items={tabItems}
                type="card"
                style={{ background: 'transparent' }}
                tabBarStyle={{ marginBottom: 0 }}
              />
            </div>
          </div>

          {/* Footer */}
          <div style={{
            background: 'var(--color-bg-surface)',
            borderTop: '1px solid var(--color-border)',
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 -1px 3px rgba(0,0,0,0.05)',
          }}>
            <Space size={8} wrap>
              {record.pipeline.map(step => (
                <Space key={step.role} size={4}>
                  {step.status === 'Submitted'
                    ? <CheckCircleOutlined style={{ color: '#059669', fontSize: 12 }} />
                    : <ClockCircleOutlined style={{ color: 'var(--color-text-disabled)', fontSize: 12 }} />}
                  <Text style={{ fontSize: 11, color: step.status === 'Submitted' ? 'var(--color-text-secondary)' : 'var(--color-text-disabled)', fontWeight: 600 }}>
                    {step.role}
                  </Text>
                </Space>
              ))}
            </Space>
            <Button onClick={onClose} style={{ borderRadius: 8 }}>Close</Button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Approvals: types + mock data ────────────────────────────────────────────
interface ApprovalEmployee {
  id: string;
  name: string;
  employeeCode: string;
  designation: string;
  department: string;
  avatarColor: string;
  appraisalType: AppraisalType;
  periodLabel: string;
  periodFrom: string;
  periodTo: string;
  lmDeadline: string;
  lmStatus: 'Pending' | 'Submitted';
  hrStatus: 'Pending' | 'Submitted';
  subKPIs: SubKPIItem[];
  selfMarkings: SubKPIMarking[];
  lmMarkings: SubKPIMarking[];
  hrMarkings: SubKPIMarking[];
  lmOverallRemarks?: string;
  hrOverallRemarks?: string;
  hrDecision?: HRDecision;
  decisionApprovalStatus: 'Not Requested' | 'Pending' | 'Approved' | 'Rejected';
  decisionApprovalRemarks?: string;
  decisionApprovalReviewedBy?: string;
  decisionApprovalReviewedAt?: string;
  decisionMailSent?: boolean;
  separationInitiated?: boolean;
}

interface SeparationInitEmployee {
  empId: string;
  name: string;
  designation: string;
  department: string;
  joinedDate?: string;
}

type HRConfirmationAction = 'Confirmation' | 'Extend' | 'Separation';
type HRAppraisalAction = 'Appraisal' | 'Separation';
type HRIncrementType = 'Basic' | 'Gross' | 'No Increment';

interface HRDecision {
  submittedAt: string;
  remarks: string;
  designation?: string;
  jobGrade?: string;
  payScale?: string;
  incrementType?: HRIncrementType;
  incrementPercent?: number;
  effectiveDate?: string;
  nextAppraisalDate?: string;
  confirmationAction?: HRConfirmationAction;
  appraisalAction?: HRAppraisalAction;
  extensionDays?: number;
}

interface DecisionMailPayload {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
}

const DESIGNATION_OPTIONS = [
  'HR Executive',
  'HR Officer',
  'Senior HR Officer',
  'Assistant Manager - HR',
  'Manager - HR',
  'Senior Manager - HR',
  'Head of HR',
];

const JOB_GRADE_OPTIONS = ['JG-01', 'JG-02', 'JG-03', 'JG-04', 'JG-05', 'JG-06', 'JG-07'];
const PAY_SCALE_OPTIONS = ['Entry level', 'Junior', 'Mid', 'Expart'];
const PAY_SCALE_RANGES: Record<string, string> = {
  'Entry level': '23,000 to 24,000',
  Junior: '25,000 to 35,000',
  Mid: '36,000 to 55,000',
  Expart: '56,000 to 85,000',
};

function recommendedIncrementByScore(score: number): number {
  if (score >= 85) return 10;
  if (score >= 70) return 7;
  if (score >= 55) return 5;
  if (score >= 40) return 3;
  return 0;
}

const PENDING_APPROVALS: ApprovalEmployee[] = [
  {
    id: 'appr-001', name: 'Rafiq Islam', employeeCode: 'EMP-042',
    designation: 'HR Officer', department: 'Human Resources',
    avatarColor: '#0284c7', appraisalType: 'Appraisal',
    periodLabel: 'Yearly Appraisal · FY 2025', periodFrom: '2025-01-01', periodTo: '2025-12-31',
    lmDeadline: '2026-04-05', lmStatus: 'Pending', hrStatus: 'Pending',
    subKPIs: MY_SUB_KPIS.slice(0, 6),
    selfMarkings: [
      { subKPIId: 'sk-01-01', score: 8,  remarks: 'Completed all milestones per plan.' },
      { subKPIId: 'sk-01-02', score: 7,  remarks: 'Policy revisions done on time.' },
      { subKPIId: 'sk-02-01', score: 8,  remarks: 'Average TTF was 48 days.' },
      { subKPIId: 'sk-02-02', score: 7,  remarks: 'New hire 6-month rating was 81%.' },
      { subKPIId: 'sk-03-01', score: 9,  remarks: 'Full BLA compliance maintained.' },
      { subKPIId: 'sk-03-02', score: 8,  remarks: 'Audit score was 88%.' },
    ],
    lmMarkings: [],
    hrMarkings: [],
    decisionApprovalStatus: 'Not Requested',
  },
  {
    id: 'appr-002', name: 'Nadia Chowdhury', employeeCode: 'EMP-057',
    designation: 'Recruitment Executive', department: 'Human Resources',
    avatarColor: '#7c3aed', appraisalType: 'Confirmation',
    periodLabel: 'Confirmation Review · Q1 2026', periodFrom: '2026-01-01', periodTo: '2026-03-31',
    lmDeadline: '2026-04-10', lmStatus: 'Pending', hrStatus: 'Pending',
    subKPIs: MY_SUB_KPIS.slice(2, 6),
    selfMarkings: [
      { subKPIId: 'sk-02-01', score: 7,  remarks: 'Managed 12 open positions this quarter.' },
      { subKPIId: 'sk-02-02', score: 8,  remarks: 'Quality of hire score was 83%.' },
      { subKPIId: 'sk-03-01', score: 9,  remarks: 'Zero compliance violations.' },
      { subKPIId: 'sk-03-02', score: 7,  remarks: 'Audit score 85%.' },
    ],
    lmMarkings: [],
    hrMarkings: [],
    decisionApprovalStatus: 'Not Requested',
  },
  {
    id: 'appr-003', name: 'Kamal Hossain', employeeCode: 'EMP-033',
    designation: 'Senior HR Officer', department: 'Human Resources',
    avatarColor: '#d97706', appraisalType: 'Appraisal',
    periodLabel: 'Yearly Appraisal · FY 2025', periodFrom: '2025-01-01', periodTo: '2025-12-31',
    lmDeadline: '2026-04-05', lmStatus: 'Submitted', hrStatus: 'Submitted',
    subKPIs: MY_SUB_KPIS.slice(0, 7),
    selfMarkings: [
      { subKPIId: 'sk-01-01', score: 9,  remarks: 'All strategic milestones met.' },
      { subKPIId: 'sk-01-02', score: 9,  remarks: '100% policy revision completion.' },
      { subKPIId: 'sk-02-01', score: 8,  remarks: 'TTF averaged 45 days.' },
      { subKPIId: 'sk-02-02', score: 8,  remarks: '6-month hire rating 85%.' },
      { subKPIId: 'sk-03-01', score: 10, remarks: 'Full BLA compliance.' },
      { subKPIId: 'sk-03-02', score: 8,  remarks: 'Audit 90%.' },
      { subKPIId: 'sk-05-01', score: 9,  remarks: '96% cycle completion.' },
    ],
    lmMarkings: [
      { subKPIId: 'sk-01-01', score: 8,  remarks: 'Strong execution on strategic milestones.' },
      { subKPIId: 'sk-01-02', score: 8,  remarks: 'Policy revisions well managed.' },
      { subKPIId: 'sk-02-01', score: 7,  remarks: 'TTF within target.' },
      { subKPIId: 'sk-02-02', score: 8,  remarks: 'Quality of recent hires is solid.' },
      { subKPIId: 'sk-03-01', score: 10, remarks: 'Excellent compliance record.' },
      { subKPIId: 'sk-03-02', score: 8,  remarks: 'Audit exceeded expectation.' },
      { subKPIId: 'sk-05-01', score: 8,  remarks: 'Appraisal cycles well managed.' },
    ],
    hrMarkings: [
      { subKPIId: 'sk-01-01', score: 8,  remarks: 'Employee performance matches department expectation.' },
      { subKPIId: 'sk-01-02', score: 8,  remarks: 'Policy ownership has improved this cycle.' },
      { subKPIId: 'sk-02-01', score: 7,  remarks: 'Hiring closure timeline is acceptable.' },
      { subKPIId: 'sk-02-02', score: 8,  remarks: 'Strong quality indicators from new hires.' },
      { subKPIId: 'sk-03-01', score: 10, remarks: 'Excellent compliance maintenance.' },
      { subKPIId: 'sk-03-02', score: 8,  remarks: 'Audit trend is consistently positive.' },
      { subKPIId: 'sk-05-01', score: 8,  remarks: 'Delivery consistency is good.' },
    ],
    lmOverallRemarks: 'Kamal has demonstrated consistent performance across all KPIs this year. His compliance track record is exemplary and his appraisal cycle management is commendable. Recommend for increment consideration.',
    hrOverallRemarks: 'HR review confirms stable and high performance across operational and compliance KPIs.',
    hrDecision: {
      submittedAt: '2026-03-31',
      remarks: 'Approved for increment and role elevation based on sustained KPI delivery.',
      designation: 'Assistant Manager - HR',
      incrementType: 'Gross',
      incrementPercent: 10,
      effectiveDate: '2026-04-01',
      nextAppraisalDate: '2027-04-01',
    },
    decisionApprovalStatus: 'Approved',
    decisionApprovalReviewedBy: 'Head of HR',
    decisionApprovalReviewedAt: '2026-03-31',
  },
  {
    id: 'appr-004', name: 'Sadia Begum', employeeCode: 'EMP-071',
    designation: 'HR Analyst', department: 'Human Resources',
    avatarColor: '#059669', appraisalType: 'Appraisal',
    periodLabel: 'Yearly Appraisal · FY 2025', periodFrom: '2025-01-01', periodTo: '2025-12-31',
    lmDeadline: '2026-04-05', lmStatus: 'Pending', hrStatus: 'Pending',
    subKPIs: MY_SUB_KPIS.slice(4, 9),
    selfMarkings: [
      { subKPIId: 'sk-03-01', score: 8,  remarks: 'Maintained full compliance.' },
      { subKPIId: 'sk-03-02', score: 7,  remarks: 'Audit score was 86%.' },
      { subKPIId: 'sk-05-01', score: 8,  remarks: '94% cycle completion.' },
      { subKPIId: 'sk-05-02', score: 7,  remarks: '89% goal-setting adherence.' },
      { subKPIId: 'sk-07-01', score: 9,  remarks: 'Engagement survey score 80%.' },
    ],
    lmMarkings: [],
    hrMarkings: [],
    decisionApprovalStatus: 'Not Requested',
  },
  {
    id: 'appr-005', name: 'Tanvir Alam', employeeCode: 'EMP-089',
    designation: 'HR Executive', department: 'Human Resources',
    avatarColor: '#dc2626', appraisalType: 'Confirmation',
    periodLabel: 'Confirmation Review · Q1 2026', periodFrom: '2026-01-01', periodTo: '2026-03-31',
    lmDeadline: '2026-04-10', lmStatus: 'Pending', hrStatus: 'Pending',
    subKPIs: MY_SUB_KPIS.slice(0, 5),
    selfMarkings: [
      { subKPIId: 'sk-01-01', score: 7,  remarks: 'Supported strategic HR planning activities.' },
      { subKPIId: 'sk-01-02', score: 6,  remarks: 'Assisted in 3 policy revision cycles.' },
      { subKPIId: 'sk-02-01', score: 7,  remarks: 'Supported sourcing for 8 positions.' },
      { subKPIId: 'sk-02-02', score: 7,  remarks: 'New hire satisfaction was positive.' },
      { subKPIId: 'sk-03-01', score: 8,  remarks: 'No compliance violations on my part.' },
    ],
    lmMarkings: [],
    hrMarkings: [],
    decisionApprovalStatus: 'Not Requested',
  },
];

// ─── LM Mark Drawer ───────────────────────────────────────────────────────────
interface LMMarkDrawerProps {
  employee: ApprovalEmployee | null;
  onClose: () => void;
  onSubmit: (id: string, markings: SubKPIMarking[], overallRemarks: string) => void;
}

function LMMarkDrawer({ employee, onClose, onSubmit }: LMMarkDrawerProps) {
  const [markings, setMarkings]           = useState<SubKPIMarking[]>([]);
  const [overallRemarks, setOverallRemarks] = useState('');
  const [expanded, setExpanded]           = useState<string[]>([]);
  const [submitting, setSubmitting]       = useState(false);

  const prevId = useMemo(() => employee?.id, [employee]);
  useMemo(() => {
    if (!employee) return;
    const init = employee.lmMarkings.length > 0 ? employee.lmMarkings : blankMarkings(employee.subKPIs);
    setMarkings(init);
    setOverallRemarks(employee.lmOverallRemarks ?? '');
    setExpanded(groupByMainKPI(employee.subKPIs).map(g => g.id));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prevId]);

  if (!employee) return null;

  const groups        = groupByMainKPI(employee.subKPIs);
  const totalKPIs     = employee.subKPIs.length;
  const filledKPIs    = markings.filter(m => m.score !== null).length;
  const pct           = totalKPIs ? Math.round((filledKPIs / totalKPIs) * 100) : 0;
  const weightedScore = calcWeightedScore(employee.subKPIs, markings);
  const isReadOnly    = employee.lmStatus === 'Submitted';

  const updateMarking = (subKPIId: string, patch: Partial<SubKPIMarking>) =>
    setMarkings(prev => prev.map(m => m.subKPIId === subKPIId ? { ...m, ...patch } : m));

  const handleSubmit = () => {
    const incomplete = markings.filter(m => m.score === null);
    if (incomplete.length > 0) { message.warning(`Please score all ${incomplete.length} remaining KPI(s).`); return; }
    if (!overallRemarks.trim()) { message.warning('Please provide overall remarks before submitting.'); return; }
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); onSubmit(employee.id, markings, overallRemarks.trim()); }, 700);
  };

  const selfTotal  = calcWeightedScore(employee.subKPIs, employee.selfMarkings);
  const lmTotal    = calcWeightedScore(employee.subKPIs, isReadOnly ? employee.lmMarkings : markings);

  return (
    <Drawer
      open={!!employee}
      onClose={onClose}
      width={960}
      title={
        <Space size={10}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: CLR_PRIMARY_L, border: `1px solid ${CLR_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <StarOutlined style={{ color: CLR_PRIMARY, fontSize: 17 }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text-primary)' }}>
              {isReadOnly ? 'View LM Review' : 'Line Manager Review'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-disabled)' }}>{employee.name} · {employee.employeeCode} · {employee.periodLabel}</div>
          </div>
        </Space>
      }
      styles={{ body: { background: CLR_BG, padding: '16px 20px' }, header: { background: 'var(--color-bg-surface)', borderBottom: '1px solid var(--color-border)' } }}
      footer={
        !isReadOnly ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <Space size={6}>
              <Text style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>{filledKPIs} / {totalKPIs} scored</Text>
              {filledKPIs > 0 && <Text style={{ fontSize: 12, fontWeight: 700, color: scoreColor(weightedScore) }}>· Weighted: {weightedScore}%</Text>}
            </Space>
            <Space>
              <Button onClick={onClose} style={{ borderRadius: 8 }}>Cancel</Button>
              <Button type="primary" icon={<SendOutlined />} loading={submitting} onClick={handleSubmit} style={{ borderRadius: 8 }}>Submit Review</Button>
            </Space>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={onClose} style={{ borderRadius: 8 }}>Close</Button>
          </div>
        )
      }
    >
      {/* Employee summary */}
      <div style={{ background: 'var(--color-bg-surface)', border: `1px solid ${CLR_BORDER}`, borderRadius: 12, padding: '14px 18px', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <Space size={10}>
            <Avatar size={40} style={{ background: employee.avatarColor, fontWeight: 700, fontSize: 14 }}>
              {employee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </Avatar>
            <div>
              <Text strong style={{ fontSize: 14 }}>{employee.name}</Text>
              <div><Text type="secondary" style={{ fontSize: 11 }}>{employee.designation} · {employee.department} · {employee.employeeCode}</Text></div>
            </div>
          </Space>
          <Space size={8}>
            <Tag style={{ borderRadius: 999, fontSize: 11, fontWeight: 700, paddingInline: 10, border: 'none', background: employee.appraisalType === 'Confirmation' ? 'var(--color-status-info-bg)' : 'rgba(124, 58, 237, 0.13)', color: employee.appraisalType === 'Confirmation' ? '#0369a1' : '#6d28d9' }}>
              {employee.appraisalType === 'Confirmation' ? '✦ Confirmation' : '⬟ Appraisal'}
            </Tag>
            {isReadOnly && <Tag style={{ borderRadius: 999, fontWeight: 700, border: 'none', background: 'var(--color-status-approved-bg)', color: 'var(--color-primary-dark)' }}><CheckCircleOutlined /> Review Submitted</Tag>}
          </Space>
        </div>

        {/* Evaluation score cards */}
        {(() => {
          const lmHasScore = isReadOnly || filledKPIs > 0;
          const avgTotal   = lmHasScore ? Math.round((selfTotal + lmTotal) / 2) : null;
          const avgBadge   = avgTotal !== null ? scoreBadge(avgTotal) : null;
          return (
            <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {/* Self evaluation card */}
              <div style={{ flex: 1, minWidth: 120, background: 'var(--color-status-approved-bg)', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 14px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-tertiary)', letterSpacing: '0.05em', marginBottom: 4 }}>SELF SCORE</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: scoreColor(selfTotal), lineHeight: 1.1 }}>{selfTotal}%</div>
                <Tag style={{ marginTop: 5, borderRadius: 999, fontSize: 10, border: 'none', background: scoreBadge(selfTotal).bg, color: scoreBadge(selfTotal).color, fontWeight: 700, padding: '0 8px' }}>
                  {scoreBadge(selfTotal).label}
                </Tag>
                <Progress percent={selfTotal} strokeColor={scoreColor(selfTotal)} trailColor="#e5e7eb" size="small" showInfo={false} style={{ marginTop: 8 }} />
              </div>

              {/* LM evaluation card */}
              <div style={{ flex: 1, minWidth: 120, background: lmHasScore ? 'var(--color-status-info-bg)' : 'var(--color-bg-subtle)', border: `1px solid ${lmHasScore ? 'rgba(59, 130, 246, 0.22)' : 'var(--color-border)'}`, borderRadius: 10, padding: '10px 14px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-tertiary)', letterSpacing: '0.05em', marginBottom: 4 }}>LM SCORE</div>
                {lmHasScore ? (
                  <>
                    <div style={{ fontSize: 22, fontWeight: 900, color: scoreColor(lmTotal), lineHeight: 1.1 }}>{lmTotal}%</div>
                    <Tag style={{ marginTop: 5, borderRadius: 999, fontSize: 10, border: 'none', background: scoreBadge(lmTotal).bg, color: scoreBadge(lmTotal).color, fontWeight: 700, padding: '0 8px' }}>
                      {scoreBadge(lmTotal).label}
                    </Tag>
                    <Progress percent={lmTotal} strokeColor={scoreColor(lmTotal)} trailColor="#e5e7eb" size="small" showInfo={false} style={{ marginTop: 8 }} />
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-disabled)', marginTop: 4 }}>Not scored yet</div>
                    {!isReadOnly && (
                      <div style={{ fontSize: 10, color: 'var(--color-text-disabled)', marginTop: 4 }}>Score KPIs below to see LM score</div>
                    )}
                  </>
                )}
              </div>

              {/* Average card */}
              <div style={{ flex: 1, minWidth: 120, background: avgTotal !== null ? 'linear-gradient(135deg, #fef3c7 0%, #fef9ee 100%)' : 'var(--color-bg-subtle)', border: `1px solid ${avgTotal !== null ? 'rgba(253, 230, 138, 0.4)' : 'var(--color-border)'}`, borderRadius: 10, padding: '10px 14px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-tertiary)', letterSpacing: '0.05em', marginBottom: 4 }}>EVAL. AVG</div>
                {avgTotal !== null && avgBadge ? (
                  <>
                    <div style={{ fontSize: 22, fontWeight: 900, color: scoreColor(avgTotal), lineHeight: 1.1 }}>{avgTotal}%</div>
                    <Tag style={{ marginTop: 5, borderRadius: 999, fontSize: 10, border: 'none', background: avgBadge.bg, color: avgBadge.color, fontWeight: 700, padding: '0 8px' }}>
                      {avgBadge.label}
                    </Tag>
                    <Progress percent={avgTotal} strokeColor={scoreColor(avgTotal)} trailColor="#e5e7eb" size="small" showInfo={false} style={{ marginTop: 8 }} />
                  </>
                ) : (
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-disabled)', marginTop: 4 }}>Pending scores</div>
                )}
              </div>

              {/* Completion card — only in edit mode */}
              {!isReadOnly && (
                <div style={{ flex: 1, minWidth: 120, background: pct === 100 ? 'var(--color-status-approved-bg)' : 'var(--color-bg-subtle)', border: `1px solid ${pct === 100 ? 'var(--color-status-approved-bg)' : 'var(--color-border)'}`, borderRadius: 10, padding: '10px 14px' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-tertiary)', letterSpacing: '0.05em', marginBottom: 4 }}>COMPLETION</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: pct === 100 ? '#059669' : CLR_PRIMARY, lineHeight: 1.1 }}>{pct}%</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 4 }}>{filledKPIs} / {totalKPIs} KPIs scored</div>
                  <Progress percent={pct} strokeColor={pct === 100 ? '#059669' : CLR_PRIMARY} trailColor="#e5e7eb" size="small" showInfo={false} style={{ marginTop: 8 }} />
                </div>
              )}

              {/* LM Evaluation % card — always visible */}
              <div style={{ flex: 1.5, minWidth: 160, background: lmHasScore ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' : 'var(--color-bg-subtle)', border: `1px solid ${lmHasScore ? '#93c5fd' : 'var(--color-border)'}`, borderRadius: 10, padding: '10px 14px', position: 'relative', overflow: 'hidden' }}>
                {lmHasScore && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #3b82f6, #0f766e)' }} />}
                <div style={{ fontSize: 10, fontWeight: 700, color: '#1d4ed8', letterSpacing: '0.05em', marginBottom: 2 }}>LM EVALUATION %</div>
                <div style={{ fontSize: 10, color: '#93c5fd', marginBottom: 6 }}>Weighted KPI score</div>
                {lmHasScore ? (
                  <>
                    <div style={{ fontSize: 26, fontWeight: 900, color: scoreColor(lmTotal), lineHeight: 1.1 }}>{lmTotal}%</div>
                    <Tag style={{ marginTop: 5, borderRadius: 999, fontSize: 10, border: 'none', background: scoreBadge(lmTotal).bg, color: scoreBadge(lmTotal).color, fontWeight: 700, padding: '0 8px' }}>
                      {scoreBadge(lmTotal).label}
                    </Tag>
                    <Progress percent={lmTotal} strokeColor={scoreColor(lmTotal)} trailColor="#dbeafe" size="small" showInfo={false} style={{ marginTop: 8 }} />
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-disabled)', marginTop: 4 }}>Not yet evaluated</div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-disabled)', marginTop: 4 }}>Score KPIs below to calculate</div>
                  </>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* KPI groups */}
      <Collapse activeKey={expanded} onChange={keys => setExpanded(keys as string[])} ghost style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {groups.map(group => (
          <Panel
            key={group.id}
            style={{ background: 'var(--color-bg-surface)', border: `1px solid ${CLR_BORDER}`, borderRadius: 12, overflow: 'hidden', marginBottom: 0 }}
            header={
              <Space size={8}>
                <div style={{ width: 3, height: 14, background: CLR_PRIMARY, borderRadius: 2 }} />
                <Text style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)' }}>{group.name}</Text>
                <Tag style={{ borderRadius: 999, fontSize: 10, border: `1px solid ${CLR_BORDER}`, background: CLR_PRIMARY_L, color: CLR_PRIMARY, fontWeight: 600 }}>{group.code}</Tag>
              </Space>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {group.items.map((kpi, idx) => {
                const lmMark   = markings.find(m => m.subKPIId === kpi.id);
                const selfMark = employee.selfMarkings.find(m => m.subKPIId === kpi.id);
                const scored   = lmMark?.score !== null && lmMark?.score !== undefined;
                const selfPct  = selfMark?.score != null ? Math.round((selfMark.score / kpi.markOutOf) * 100) : null;
                return (
                  <div key={kpi.id} style={{ border: `1px solid ${scored ? CLR_BORDER : 'var(--color-border)'}`, borderLeft: `3px solid ${scored ? CLR_PRIMARY : 'var(--color-border)'}`, borderRadius: 10, padding: '12px 14px', background: scored ? CLR_PRIMARY_L : 'var(--color-bg-subtle)' }}>
                    {/* KPI title row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div>
                        <Space size={6}>
                          <div style={{ fontSize: 10, background: 'var(--color-bg-subtle)', color: 'var(--color-text-tertiary)', borderRadius: 4, padding: '1px 6px', fontWeight: 700 }}>{idx + 1}</div>
                          <Text style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>{kpi.name}</Text>
                        </Space>
                        <div style={{ fontSize: 11, color: 'var(--color-text-disabled)', marginTop: 3, marginLeft: 20 }}>{kpi.measurementCriteria}</div>
                      </div>
                      <Tag style={{ borderRadius: 999, fontSize: 10, border: 'none', background: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Wt: {kpi.weight}%</Tag>
                    </div>

                    {/* Employee self input — prominent read-only panel */}
                    <div style={{ background: 'var(--color-status-info-bg)', border: '1px solid #bae6fd', borderRadius: 8, padding: '10px 12px', marginBottom: 10 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#0369a1', letterSpacing: '0.05em', marginBottom: 6 }}>EMPLOYEE SELF-ASSESSMENT</div>
                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                        <div style={{ minWidth: 80 }}>
                          <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', fontWeight: 600, marginBottom: 2 }}>Score</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Text style={{ fontSize: 18, fontWeight: 800, color: selfPct !== null ? scoreColor(selfPct) : 'var(--color-text-disabled)' }}>
                              {selfMark?.score ?? '—'}<Text type="secondary" style={{ fontSize: 11, fontWeight: 400 }}>/{kpi.markOutOf}</Text>
                            </Text>
                            {selfPct !== null && (
                              <Tag style={{ borderRadius: 999, fontSize: 10, border: 'none', background: scoreBadge(selfPct).bg, color: scoreBadge(selfPct).color, fontWeight: 700, margin: 0 }}>{selfPct}%</Tag>
                            )}
                          </div>
                        </div>
                        {selfMark?.remarks && (
                          <div style={{ flex: 1, minWidth: 160 }}>
                            <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', fontWeight: 600, marginBottom: 2 }}>Remarks</div>
                            <div style={{ fontSize: 12, color: '#1e40af', fontStyle: 'italic', lineHeight: 1.5 }}>"{selfMark.remarks}"</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* LM scoring row */}
                    <Row gutter={12}>
                      <Col span={6}>
                        <FieldLabel>LM Score (out of {kpi.markOutOf})</FieldLabel>
                        <InputNumber
                          value={lmMark?.score ?? undefined}
                          onChange={v => !isReadOnly && updateMarking(kpi.id, { score: v ?? null })}
                          min={0} max={kpi.markOutOf} step={0.5}
                          disabled={isReadOnly}
                          style={{ width: '100%' }}
                          placeholder="0 – 10"
                          status={!isReadOnly && !scored ? 'warning' : undefined}
                        />
                        {scored && lmMark && (
                          <div style={{ fontSize: 11, marginTop: 3, color: scoreColor(Math.round((lmMark.score! / kpi.markOutOf) * 100)) }}>
                            {Math.round((lmMark.score! / kpi.markOutOf) * 100)}%
                          </div>
                        )}
                      </Col>
                      <Col span={18}>
                        <FieldLabel>LM Remarks</FieldLabel>
                        <Input.TextArea
                          value={lmMark?.remarks ?? ''}
                          onChange={e => !isReadOnly && updateMarking(kpi.id, { remarks: e.target.value })}
                          rows={2} disabled={isReadOnly}
                          placeholder="Your evaluation remarks for this KPI…"
                          style={{ borderRadius: 8, fontSize: 12, resize: 'none' }}
                        />
                      </Col>
                    </Row>
                  </div>
                );
              })}
            </div>
          </Panel>
        ))}
      </Collapse>

      {/* Overall Remarks */}
      <div style={{ background: 'var(--color-bg-surface)', border: `1px solid ${isReadOnly ? CLR_BORDER : 'rgba(253, 230, 138, 0.4)'}`, borderRadius: 12, padding: '16px 18px', marginTop: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
          Overall Remarks <span style={{ color: '#dc2626', fontSize: 11 }}>{!isReadOnly ? '*' : ''}</span>
        </div>
        <Input.TextArea
          value={overallRemarks}
          onChange={e => !isReadOnly && setOverallRemarks(e.target.value)}
          disabled={isReadOnly}
          rows={4}
          maxLength={1000}
          showCount={!isReadOnly}
          placeholder="Provide your overall evaluation summary for this employee — key strengths, areas of improvement, and general observations…"
          style={{ borderRadius: 8, fontSize: 13, resize: 'none' }}
          status={!isReadOnly && !overallRemarks.trim() ? 'warning' : undefined}
        />
        {!isReadOnly && (
          <div style={{ fontSize: 11, color: 'var(--color-text-disabled)', marginTop: 6 }}>Required before submitting review.</div>
        )}
      </div>
    </Drawer>
  );
}

interface HRMarkDrawerProps {
  employee: ApprovalEmployee | null;
  onClose: () => void;
  onSubmit: (id: string, markings: SubKPIMarking[], overallRemarks: string) => void;
}

function HRMarkDrawer({ employee, onClose, onSubmit }: HRMarkDrawerProps) {
  const [markings, setMarkings]             = useState<SubKPIMarking[]>([]);
  const [overallRemarks, setOverallRemarks] = useState('');
  const [expanded, setExpanded]             = useState<string[]>([]);
  const [submitting, setSubmitting]         = useState(false);

  const prevId = useMemo(() => employee?.id, [employee]);
  useMemo(() => {
    if (!employee) return;
    const init = employee.hrMarkings.length > 0 ? employee.hrMarkings : blankMarkings(employee.subKPIs);
    setMarkings(init);
    setOverallRemarks(employee.hrOverallRemarks ?? '');
    setExpanded(groupByMainKPI(employee.subKPIs).map(g => g.id));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prevId]);

  if (!employee) return null;

  const groups        = groupByMainKPI(employee.subKPIs);
  const totalKPIs     = employee.subKPIs.length;
  const filledKPIs    = markings.filter(m => m.score !== null).length;
  const pct           = totalKPIs ? Math.round((filledKPIs / totalKPIs) * 100) : 0;
  const weightedScore = calcWeightedScore(employee.subKPIs, markings);
  const isReadOnly    = employee.hrStatus === 'Submitted';
  const selfTotal     = calcWeightedScore(employee.subKPIs, employee.selfMarkings);
  const lmTotal       = calcWeightedScore(employee.subKPIs, employee.lmMarkings);
  const hrTotal       = calcWeightedScore(employee.subKPIs, isReadOnly ? employee.hrMarkings : markings);
  const hrHasScore    = isReadOnly || filledKPIs > 0;
  const avgTotal      = hrHasScore ? Math.round((selfTotal + lmTotal + hrTotal) / 3) : null;

  const updateMarking = (subKPIId: string, patch: Partial<SubKPIMarking>) =>
    setMarkings(prev => prev.map(m => m.subKPIId === subKPIId ? { ...m, ...patch } : m));

  const handleSubmit = () => {
    const incomplete = markings.filter(m => m.score === null);
    if (incomplete.length > 0) { message.warning(`Please score all ${incomplete.length} remaining KPI(s).`); return; }
    if (!overallRemarks.trim()) { message.warning('Please provide HR overall remarks before submitting.'); return; }
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); onSubmit(employee.id, markings, overallRemarks.trim()); }, 700);
  };

  return (
    <Drawer
      open={!!employee}
      onClose={onClose}
      width={960}
      title={
        <Space size={10}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(124, 58, 237, 0.13)', border: '1px solid #c4b5fd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileTextOutlined style={{ color: '#6d28d9', fontSize: 17 }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text-primary)' }}>
              {isReadOnly ? 'View HR Review' : 'HR Review'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-disabled)' }}>{employee.name} · {employee.employeeCode} · {employee.periodLabel}</div>
          </div>
        </Space>
      }
      styles={{ body: { background: CLR_BG, padding: '16px 20px' }, header: { background: 'var(--color-bg-surface)', borderBottom: '1px solid var(--color-border)' } }}
      footer={
        !isReadOnly ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <Space size={6}>
              <Text style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>{filledKPIs} / {totalKPIs} scored</Text>
              {filledKPIs > 0 && <Text style={{ fontSize: 12, fontWeight: 700, color: scoreColor(weightedScore) }}>· Weighted: {weightedScore}%</Text>}
            </Space>
            <Space>
              <Button onClick={onClose} style={{ borderRadius: 8 }}>Cancel</Button>
              <Button type="primary" icon={<SendOutlined />} loading={submitting} onClick={handleSubmit} style={{ borderRadius: 8 }}>Submit HR Review</Button>
            </Space>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={onClose} style={{ borderRadius: 8 }}>Close</Button>
          </div>
        )
      }
    >
      <div style={{ background: 'var(--color-bg-surface)', border: `1px solid ${CLR_BORDER}`, borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 700, marginBottom: 8, letterSpacing: '0.04em' }}>EVALUATION OVERVIEW</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 120, background: 'var(--color-status-approved-bg)', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 12px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>SELF %</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: scoreColor(selfTotal), lineHeight: 1.1 }}>{selfTotal}%</div>
            <Tag style={{ marginTop: 5, borderRadius: 999, fontSize: 10, border: 'none', background: scoreBadge(selfTotal).bg, color: scoreBadge(selfTotal).color, fontWeight: 700, padding: '0 8px' }}>
              {scoreBadge(selfTotal).label}
            </Tag>
          </div>

          <div style={{ flex: 1, minWidth: 120, background: 'var(--color-status-info-bg)', border: '1px solid #bfdbfe', borderRadius: 10, padding: '10px 12px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>LM %</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: scoreColor(lmTotal), lineHeight: 1.1 }}>{lmTotal}%</div>
            <Tag style={{ marginTop: 5, borderRadius: 999, fontSize: 10, border: 'none', background: scoreBadge(lmTotal).bg, color: scoreBadge(lmTotal).color, fontWeight: 700, padding: '0 8px' }}>
              {scoreBadge(lmTotal).label}
            </Tag>
          </div>

          <div style={{ flex: 1, minWidth: 120, background: hrHasScore ? 'var(--color-status-info-bg)' : 'var(--color-bg-subtle)', border: `1px solid ${hrHasScore ? 'rgba(124, 58, 237, 0.22)' : 'var(--color-border)'}`, borderRadius: 10, padding: '10px 12px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>HR %</div>
            {hrHasScore ? (
              <>
                <div style={{ fontSize: 22, fontWeight: 900, color: scoreColor(hrTotal), lineHeight: 1.1 }}>{hrTotal}%</div>
                <Tag style={{ marginTop: 5, borderRadius: 999, fontSize: 10, border: 'none', background: scoreBadge(hrTotal).bg, color: scoreBadge(hrTotal).color, fontWeight: 700, padding: '0 8px' }}>
                  {scoreBadge(hrTotal).label}
                </Tag>
              </>
            ) : (
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-disabled)', marginTop: 6 }}>Not scored yet</div>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 120, background: avgTotal !== null ? 'linear-gradient(135deg, #fef3c7 0%, #fef9ee 100%)' : 'var(--color-bg-subtle)', border: `1px solid ${avgTotal !== null ? 'rgba(253, 230, 138, 0.4)' : 'var(--color-border)'}`, borderRadius: 10, padding: '10px 12px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>EVAL. AVG %</div>
            {avgTotal !== null ? (
              <>
                <div style={{ fontSize: 22, fontWeight: 900, color: scoreColor(avgTotal), lineHeight: 1.1 }}>{avgTotal}%</div>
                <Tag style={{ marginTop: 5, borderRadius: 999, fontSize: 10, border: 'none', background: scoreBadge(avgTotal).bg, color: scoreBadge(avgTotal).color, fontWeight: 700, padding: '0 8px' }}>
                  {scoreBadge(avgTotal).label}
                </Tag>
              </>
            ) : (
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-disabled)', marginTop: 6 }}>Pending HR score</div>
            )}
          </div>
        </div>
      </div>

      <Collapse activeKey={expanded} onChange={keys => setExpanded(keys as string[])} ghost style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {groups.map(group => (
          <Panel
            key={group.id}
            style={{ background: 'var(--color-bg-surface)', border: `1px solid ${CLR_BORDER}`, borderRadius: 12, overflow: 'hidden', marginBottom: 0 }}
            header={
              <Space size={8}>
                <div style={{ width: 3, height: 14, background: '#6d28d9', borderRadius: 2 }} />
                <Text style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)' }}>{group.name}</Text>
                <Tag style={{ borderRadius: 999, fontSize: 10, border: '1px solid #ddd6fe', background: 'rgba(124, 58, 237, 0.09)', color: '#6d28d9', fontWeight: 600 }}>{group.code}</Tag>
              </Space>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {group.items.map((kpi, idx) => {
                const hrMark   = markings.find(m => m.subKPIId === kpi.id);
                const selfMark = employee.selfMarkings.find(m => m.subKPIId === kpi.id);
                const lmMark   = employee.lmMarkings.find(m => m.subKPIId === kpi.id);
                const scored   = hrMark?.score !== null && hrMark?.score !== undefined;
                return (
                  <div key={kpi.id} style={{ border: `1px solid ${scored ? 'rgba(124, 58, 237, 0.22)' : 'var(--color-border)'}`, borderLeft: `3px solid ${scored ? '#6d28d9' : 'var(--color-border)'}`, borderRadius: 10, padding: '12px 14px', background: scored ? 'var(--color-status-info-bg)' : 'var(--color-bg-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div>
                        <Space size={6}>
                          <div style={{ fontSize: 10, background: 'var(--color-bg-subtle)', color: 'var(--color-text-tertiary)', borderRadius: 4, padding: '1px 6px', fontWeight: 700 }}>{idx + 1}</div>
                          <Text style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>{kpi.name}</Text>
                        </Space>
                        <div style={{ fontSize: 11, color: 'var(--color-text-disabled)', marginTop: 3, marginLeft: 20 }}>{kpi.measurementCriteria}</div>
                      </div>
                      <Tag style={{ borderRadius: 999, fontSize: 10, border: 'none', background: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Wt: {kpi.weight}%</Tag>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                      <div style={{ background: 'var(--color-status-info-bg)', border: '1px solid #bae6fd', borderRadius: 8, padding: '9px 10px' }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#0369a1', marginBottom: 2 }}>EMPLOYEE MARK</div>
                        <div style={{ fontSize: 12, color: '#1e40af' }}>
                          Score: <strong>{selfMark?.score ?? '—'}/{kpi.markOutOf}</strong>
                        </div>
                        <div style={{ fontSize: 11, color: '#1e3a8a', marginTop: 3 }}>{selfMark?.remarks || 'No remarks'}</div>
                      </div>
                      <div style={{ background: 'var(--color-status-info-bg)', border: '1px solid #bfdbfe', borderRadius: 8, padding: '9px 10px' }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#1d4ed8', marginBottom: 2 }}>LINE MANAGER MARK</div>
                        <div style={{ fontSize: 12, color: '#1e40af' }}>
                          Score: <strong>{lmMark?.score ?? '—'}/{kpi.markOutOf}</strong>
                        </div>
                        <div style={{ fontSize: 11, color: '#1e3a8a', marginTop: 3 }}>{lmMark?.remarks || 'No remarks yet'}</div>
                      </div>
                    </div>

                    <Row gutter={12}>
                      <Col span={6}>
                        <FieldLabel>HR Score (out of {kpi.markOutOf})</FieldLabel>
                        <InputNumber
                          value={hrMark?.score ?? undefined}
                          onChange={v => !isReadOnly && updateMarking(kpi.id, { score: v ?? null })}
                          min={0} max={kpi.markOutOf} step={0.5}
                          disabled={isReadOnly}
                          style={{ width: '100%' }}
                          placeholder="0 – 10"
                          status={!isReadOnly && !scored ? 'warning' : undefined}
                        />
                      </Col>
                      <Col span={18}>
                        <FieldLabel>HR Remarks</FieldLabel>
                        <Input.TextArea
                          value={hrMark?.remarks ?? ''}
                          onChange={e => !isReadOnly && updateMarking(kpi.id, { remarks: e.target.value })}
                          rows={2} disabled={isReadOnly}
                          placeholder="Your HR remarks for this KPI..."
                          style={{ borderRadius: 8, fontSize: 12, resize: 'none' }}
                        />
                      </Col>
                    </Row>
                  </div>
                );
              })}
            </div>
          </Panel>
        ))}
      </Collapse>

      <div style={{ background: 'var(--color-bg-surface)', border: `1px solid ${isReadOnly ? CLR_BORDER : 'rgba(124, 58, 237, 0.22)'}`, borderRadius: 12, padding: '16px 18px', marginTop: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
          HR Overall Remarks <span style={{ color: '#dc2626', fontSize: 11 }}>{!isReadOnly ? '*' : ''}</span>
        </div>
        <Input.TextArea
          value={overallRemarks}
          onChange={e => !isReadOnly && setOverallRemarks(e.target.value)}
          disabled={isReadOnly}
          rows={4}
          maxLength={1000}
          showCount={!isReadOnly}
          placeholder="Provide HR summary and recommendation..."
          style={{ borderRadius: 8, fontSize: 13, resize: 'none' }}
          status={!isReadOnly && !overallRemarks.trim() ? 'warning' : undefined}
        />
        {!isReadOnly && (
          <div style={{ fontSize: 11, color: 'var(--color-text-disabled)', marginTop: 6 }}>Required before submitting HR review.</div>
        )}
      </div>

      <div style={{ marginTop: 10, fontSize: 11, color: pct === 100 ? '#059669' : 'var(--color-text-tertiary)', fontWeight: 600 }}>
        Completion: {filledKPIs}/{totalKPIs} KPI scored ({pct}%)
      </div>
    </Drawer>
  );
}

interface HRDecisionModalProps {
  employee: ApprovalEmployee | null;
  open: boolean;
  onClose: () => void;
  onSendForApproval: (id: string, decision: HRDecision) => void;
  mode: 'hr' | 'approval';
  onApproveRequest: (id: string, remarks: string) => void;
  onRejectRequest: (id: string, remarks: string) => void;
}

function HRDecisionModal({ employee, open, onClose, onSendForApproval, mode, onApproveRequest, onRejectRequest }: HRDecisionModalProps) {
  const [decision, setDecision] = useState<HRDecision>({ submittedAt: '2026-03-31', remarks: '' });
  const [approvalRemarks, setApprovalRemarks] = useState('');
  const prevId = useMemo(() => employee?.id, [employee]);

  const setPatch = (patch: Partial<HRDecision>) => setDecision(prev => ({ ...prev, ...patch }));

  useMemo(() => {
    if (!employee) return;
    const self = calcWeightedScore(employee.subKPIs, employee.selfMarkings);
    const lm = calcWeightedScore(employee.subKPIs, employee.lmMarkings);
    const hr = calcWeightedScore(employee.subKPIs, employee.hrMarkings);
    const recPct = recommendedIncrementByScore(Math.round((self + lm + hr) / 3));

    const defaultNextAppraisalDate = (() => {
      const d = new Date(employee.periodTo ?? '2025-12-31');
      d.setFullYear(d.getFullYear() + 1);
      return d.toISOString().slice(0, 10);
    })();
    setDecision(
      employee.hrDecision ?? {
        submittedAt: '2026-03-31',
        remarks: '',
        designation: employee.designation,
        jobGrade: 'JG-05',
        payScale: 'Entry level',
        incrementType: employee.appraisalType === 'Appraisal' ? 'No Increment' : undefined,
        incrementPercent: employee.appraisalType === 'Appraisal' ? undefined : recPct,
        confirmationAction: employee.appraisalType === 'Confirmation' ? 'Confirmation' : undefined,
        appraisalAction: employee.appraisalType === 'Appraisal' ? 'Appraisal' : undefined,
        nextAppraisalDate: employee.appraisalType === 'Appraisal' ? defaultNextAppraisalDate : undefined,
      },
    );

    setApprovalRemarks('');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prevId]);

  if (!employee) return null;

  const selfTotal = calcWeightedScore(employee.subKPIs, employee.selfMarkings);
  const lmTotal   = calcWeightedScore(employee.subKPIs, employee.lmMarkings);
  const hrTotal   = calcWeightedScore(employee.subKPIs, employee.hrMarkings);
  const overall   = Math.round((selfTotal + lmTotal + hrTotal) / 3);
  const recommendedIncrementPct = recommendedIncrementByScore(overall);

  const validateDecision = () => {
    if (!decision.remarks?.trim()) {
      message.warning('Decision remarks are required.');
      return false;
    }
    if (employee.appraisalType === 'Appraisal') {
      if (decision.appraisalAction === 'Separation') {
        // effective date is optional for separation
      } else {
        if (decision.incrementType !== 'No Increment' && !decision.incrementPercent) {
          message.warning('Provide increment percentage.');
          return false;
        }
        if (decision.incrementType !== 'No Increment' && !decision.effectiveDate) {
          message.warning('Provide effective date.');
          return false;
        }
        if (!decision.nextAppraisalDate) {
          message.warning('Set next appraisal date.');
          return false;
        }
      }
    } else {
      if (decision.confirmationAction === 'Extend' && !decision.extensionDays) {
        message.warning('Provide extension period in days.');
        return false;
      }
      if (decision.confirmationAction !== 'Separation' && !decision.effectiveDate) {
        message.warning('Provide effective date.');
        return false;
      }
      if (decision.confirmationAction === 'Confirmation' && decision.incrementType !== 'No Increment' && !decision.incrementPercent) {
        message.warning('Provide confirmation increment percentage.');
        return false;
      }
    }
    return true;
  };

  const submitDecisionForApproval = () => {
    onSendForApproval(employee.id, { ...decision, submittedAt: '2026-03-31' });
  };

  const handleSendForApproval = () => {
    if (!validateDecision()) return;
    submitDecisionForApproval();
    onClose();
    message.success('Decision request sent for approval.');
  };

  const handleApproveInApprovalMode = () => {
    onApproveRequest(employee.id, approvalRemarks.trim() || 'Approved from decision approval tab.');
    onClose();
    message.success('Decision approved.');
  };

  const handleRejectInApprovalMode = () => {
    if (!approvalRemarks.trim()) { message.warning('Please provide rejection remarks.'); return; }
    onRejectRequest(employee.id, approvalRemarks.trim());
    onClose();
    message.success('Decision rejected.');
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={980}
      title={`HR Decision · ${employee.name} (${employee.employeeCode})`}
      footer={[
        <Button key="cancel" onClick={onClose}>Cancel</Button>,
        ...(mode === 'hr'
          ? [
              <Button key="save" type="primary" onClick={handleSendForApproval}>
                {employee.decisionApprovalStatus === 'Rejected' ? 'Send for approval again' : 'Send for approval'}
              </Button>,
            ]
          : employee.decisionApprovalStatus === 'Pending'
          ? [
              <Button key="reject" danger onClick={handleRejectInApprovalMode}>Reject</Button>,
              <Button key="approve" type="primary" onClick={handleApproveInApprovalMode}>Approve</Button>,
            ]
          : []),
      ]}
    >
      <div style={{ marginBottom: 10 }}>
        {employee.decisionApprovalStatus === 'Pending' && (
          <Tag style={{ border: 'none', borderRadius: 999, background: 'var(--color-status-pending-bg)', color: '#d97706', fontWeight: 700 }}>Decision Approval: Pending</Tag>
        )}
        {employee.decisionApprovalStatus === 'Approved' && (
          <Tag style={{ border: 'none', borderRadius: 999, background: 'var(--color-status-approved-bg)', color: 'var(--color-primary-dark)', fontWeight: 700 }}>Decision Approval: Approved</Tag>
        )}
        {employee.decisionApprovalStatus === 'Rejected' && (
          <Tag style={{ border: 'none', borderRadius: 999, background: 'var(--color-status-rejected-bg)', color: '#991b1b', fontWeight: 700 }}>Decision Approval: Rejected</Tag>
        )}
      </div>
      {mode === 'hr' && employee.decisionApprovalStatus === 'Rejected' && employee.decisionApprovalRemarks && (
        <div style={{ marginBottom: 10, background: 'var(--color-status-rejected-bg)', border: '1px solid #fecdd3', borderRadius: 8, padding: '8px 10px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#991b1b', marginBottom: 2 }}>Reject Reason</div>
          <div style={{ fontSize: 12, color: '#be123c' }}>{employee.decisionApprovalRemarks}</div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(120px,1fr))', gap: 10, marginBottom: 14 }}>
        {[
          { label: 'Self', score: selfTotal, bg: 'var(--color-status-approved-bg)' },
          { label: 'Line Manager', score: lmTotal, bg: 'var(--color-status-info-bg)' },
          { label: 'HR', score: hrTotal, bg: 'var(--color-status-info-bg)' },
          { label: 'Achievement Level', score: overall, bg: 'var(--color-status-pending-bg)' },
        ].map(card => (
          <div key={card.label} style={{ background: card.bg, border: '1px solid var(--color-border)', borderRadius: 8, padding: '10px 12px' }}>
            <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', fontWeight: 700 }}>{card.label.toUpperCase()}</div>
            <div style={{ marginTop: 3, fontSize: 20, fontWeight: 900, color: scoreColor(card.score) }}>{card.score}%</div>
            <Tag style={{ marginTop: 4, borderRadius: 999, border: 'none', background: scoreBadge(card.score).bg, color: scoreBadge(card.score).color, fontSize: 10, fontWeight: 700 }}>{scoreBadge(card.score).label}</Tag>
          </div>
        ))}
      </div>

      <div style={{ maxHeight: 220, overflowY: 'auto', marginBottom: 14, border: '1px solid var(--color-border)', borderRadius: 10, padding: 10 }}>
        {employee.subKPIs.map((kpi, idx) => {
          const selfMark = employee.selfMarkings.find(m => m.subKPIId === kpi.id);
          const lmMark = employee.lmMarkings.find(m => m.subKPIId === kpi.id);
          const hrMark = employee.hrMarkings.find(m => m.subKPIId === kpi.id);
          return (
            <div key={kpi.id} style={{ padding: '8px 6px', borderBottom: idx < employee.subKPIs.length - 1 ? '1px solid var(--color-border)' : undefined }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--color-text-primary)' }}>{kpi.name}</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 2 }}>
                Emp: {selfMark?.score ?? '—'}/{kpi.markOutOf} | LM: {lmMark?.score ?? '—'}/{kpi.markOutOf} | HR: {hrMark?.score ?? '—'}/{kpi.markOutOf}
              </div>
            </div>
          );
        })}
      </div>

      {employee.appraisalType === 'Confirmation' ? (
        <div style={{ border: '1px solid var(--color-border)', borderRadius: 10, padding: 12 }}>
          <FieldLabel>Decision Type</FieldLabel>
          <Space wrap style={{ marginBottom: 10 }}>
            {(['Confirmation', 'Extend', 'Separation'] as HRConfirmationAction[]).map(v => (
              <Button key={v} type={decision.confirmationAction === v ? 'primary' : 'default'} onClick={() => setPatch({ confirmationAction: v })}>
                {v}
              </Button>
            ))}
          </Space>

          {decision.confirmationAction === 'Confirmation' && (
            <Row gutter={12}>
              <Col span={10}>
                <FieldLabel>Designation</FieldLabel>
                <Select
                  showSearch
                  value={decision.designation}
                  onChange={v => setPatch({ designation: v })}
                  placeholder="Updated designation"
                  options={DESIGNATION_OPTIONS.map(v => ({ value: v, label: v }))}
                  filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                />
              </Col>
              <Col span={7}>
                <FieldLabel>Job Grade</FieldLabel>
                <Select value={decision.jobGrade} onChange={v => setPatch({ jobGrade: v })} options={JOB_GRADE_OPTIONS.map(v => ({ value: v, label: v }))} />
              </Col>
              <Col span={7}>
                <FieldLabel>Pay Scale</FieldLabel>
                <Select value={decision.payScale} onChange={v => setPatch({ payScale: v })} options={PAY_SCALE_OPTIONS.map(v => ({ value: v, label: v }))} />
                {decision.payScale && (
                  <div style={{ marginTop: 4, fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                    Range: {PAY_SCALE_RANGES[decision.payScale]}
                  </div>
                )}
              </Col>
            </Row>
          )}

          {decision.confirmationAction === 'Confirmation' && (
            <Row gutter={12} style={{ marginTop: 10 }}>
              <Col span={8}>
                <FieldLabel>Increment Type</FieldLabel>
                <Space wrap>
                  {(['Basic', 'Gross', 'No Increment'] as HRIncrementType[]).map(v => (
                    <Button
                      key={v}
                      size="small"
                      type={decision.incrementType === v ? 'primary' : 'default'}
                      onClick={() => setPatch({ incrementType: v, incrementPercent: v === 'No Increment' ? undefined : (decision.incrementPercent ?? recommendedIncrementPct) })}
                    >
                      {v}
                    </Button>
                  ))}
                </Space>
              </Col>
              {decision.incrementType !== 'No Increment' && (
                <Col span={8}>
                  <FieldLabel>Increment %</FieldLabel>
                  <InputNumber value={decision.incrementPercent} onChange={v => setPatch({ incrementPercent: Number(v) || undefined })} min={0} max={100} style={{ width: '100%' }} />
                  <div style={{ marginTop: 4, fontSize: 11, color: 'var(--color-text-tertiary)' }}>Recommended: {recommendedIncrementPct}%</div>
                </Col>
              )}
              <Col span={8}>
                <FieldLabel>Effective Date</FieldLabel>
                <Input type="date" value={decision.effectiveDate} onChange={e => setPatch({ effectiveDate: e.target.value || undefined })} />
              </Col>
            </Row>
          )}

          {decision.confirmationAction === 'Extend' && (
            <Row gutter={12}>
              <Col span={8}>
                <FieldLabel>Extension Days</FieldLabel>
                <InputNumber value={decision.extensionDays} onChange={v => setPatch({ extensionDays: Number(v) || undefined })} min={1} style={{ width: '100%' }} />
              </Col>
              <Col span={10}>
                <FieldLabel>Designation (Optional)</FieldLabel>
                <Select
                  showSearch
                  value={decision.designation}
                  onChange={v => setPatch({ designation: v })}
                  placeholder="Designation after extension"
                  options={DESIGNATION_OPTIONS.map(v => ({ value: v, label: v }))}
                  filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                />
              </Col>
              <Col span={6}>
                <FieldLabel>Effective Date</FieldLabel>
                <Input type="date" value={decision.effectiveDate} onChange={e => setPatch({ effectiveDate: e.target.value || undefined })} />
              </Col>
            </Row>
          )}

          {decision.confirmationAction === 'Separation' && (
            <Row gutter={12}>
              <Col span={24}>
                <FieldLabel>Effective Date <span style={{ fontSize: 10, color: 'var(--color-text-disabled)', fontWeight: 400 }}>(Optional)</span></FieldLabel>
                <Input type="date" value={decision.effectiveDate ?? ''} onChange={e => setPatch({ effectiveDate: e.target.value || undefined })} style={{ maxWidth: 220 }} />
              </Col>
            </Row>
          )}
        </div>
      ) : (
        <div style={{ border: '1px solid var(--color-border)', borderRadius: 10, padding: 12 }}>
          <FieldLabel>Decision Type</FieldLabel>
          <Space wrap style={{ marginBottom: 10 }}>
            {(['Appraisal', 'Separation'] as HRAppraisalAction[]).map(v => (
              <Button key={v} type={decision.appraisalAction === v ? 'primary' : 'default'} onClick={() => setPatch({ appraisalAction: v })}>
                {v}
              </Button>
            ))}
          </Space>

          {decision.appraisalAction !== 'Separation' && (
            <>
              <Row gutter={12}>
                <Col span={10}>
                  <FieldLabel>Updated Designation</FieldLabel>
                  <Select
                    showSearch
                    value={decision.designation}
                    onChange={v => setPatch({ designation: v })}
                    placeholder="Updated designation"
                    options={DESIGNATION_OPTIONS.map(v => ({ value: v, label: v }))}
                    filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                  />
                </Col>
                <Col span={7}>
                  <FieldLabel>Job Grade</FieldLabel>
                  <Select value={decision.jobGrade} onChange={v => setPatch({ jobGrade: v })} options={JOB_GRADE_OPTIONS.map(v => ({ value: v, label: v }))} />
                </Col>
                <Col span={7}>
                  <FieldLabel>Pay Scale</FieldLabel>
                  <Select value={decision.payScale} onChange={v => setPatch({ payScale: v })} options={PAY_SCALE_OPTIONS.map(v => ({ value: v, label: v }))} />
                  {decision.payScale && (
                    <div style={{ marginTop: 4, fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                      Range: {PAY_SCALE_RANGES[decision.payScale]}
                    </div>
                  )}
                </Col>
              </Row>
              <Row gutter={12} style={{ marginTop: 10 }}>
                <Col span={8}>
                  <FieldLabel>Increment Option</FieldLabel>
                  <Space wrap>
                    {(['Basic', 'Gross', 'No Increment'] as HRIncrementType[]).map(v => (
                      <Button
                        key={v}
                        size="small"
                        type={decision.incrementType === v ? 'primary' : 'default'}
                        onClick={() => setPatch({ incrementType: v, incrementPercent: v === 'No Increment' ? undefined : (decision.incrementPercent ?? recommendedIncrementPct) })}
                      >
                        {v}
                      </Button>
                    ))}
                  </Space>
                </Col>
                {decision.incrementType !== 'No Increment' && (
                  <Col span={8}>
                    <FieldLabel>Increment %</FieldLabel>
                    <InputNumber value={decision.incrementPercent} onChange={v => setPatch({ incrementPercent: Number(v) || undefined })} min={0} max={100} style={{ width: '100%' }} />
                    <div style={{ marginTop: 4, fontSize: 11, color: 'var(--color-text-tertiary)' }}>Recommended: {recommendedIncrementPct}%</div>
                  </Col>
                )}
              </Row>
              <Row gutter={12} style={{ marginTop: 10 }}>
                <Col span={12}>
                  <FieldLabel>Effective Date</FieldLabel>
                  <Input type="date" value={decision.effectiveDate ?? ''} onChange={e => setPatch({ effectiveDate: e.target.value || undefined })} disabled={decision.incrementType === 'No Increment'} />
                </Col>
                <Col span={12}>
                  <FieldLabel>
                    Next Appraisal Date
                    <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 400, color: '#059669', background: 'var(--color-status-approved-bg)', borderRadius: 999, padding: '1px 7px' }}>Auto-set</span>
                  </FieldLabel>
                  <Input
                    type="date"
                    value={decision.nextAppraisalDate ?? ''}
                    readOnly
                    style={{ background: 'var(--color-status-approved-bg)', borderColor: '#a7f3d0', color: 'var(--color-primary-dark)', cursor: 'default' }}
                  />
                  <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', marginTop: 3 }}>Auto-calculated: 1 year from period end</div>
                </Col>
              </Row>
            </>
          )}

          {decision.appraisalAction === 'Separation' && (
            <Row gutter={12}>
              <Col span={24}>
                <FieldLabel>Effective Date <span style={{ fontSize: 10, color: 'var(--color-text-disabled)', fontWeight: 400 }}>(Optional)</span></FieldLabel>
                <Input type="date" value={decision.effectiveDate ?? ''} onChange={e => setPatch({ effectiveDate: e.target.value || undefined })} style={{ maxWidth: 220 }} />
              </Col>
            </Row>
          )}
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <FieldLabel>Remarks</FieldLabel>
        <Input.TextArea
          rows={3}
          value={decision.remarks}
          onChange={e => setPatch({ remarks: e.target.value })}
          placeholder="Final decision remarks"
        />
      </div>
      {mode === 'approval' && employee.decisionApprovalStatus === 'Pending' && (
        <div style={{ marginTop: 12 }}>
          <FieldLabel>Approval Remarks</FieldLabel>
          <Input.TextArea rows={3} value={approvalRemarks} onChange={e => setApprovalRemarks(e.target.value)} placeholder="Write approval or rejection remarks" />
        </div>
      )}
    </Modal>
  );
}

interface DecisionMailModalProps {
  employee: ApprovalEmployee | null;
  open: boolean;
  onClose: () => void;
  onSend: (id: string, payload: DecisionMailPayload) => void;
}

function DecisionMailModal({ employee, open, onClose, onSend }: DecisionMailModalProps) {
  const [draft, setDraft] = useState({ to: '', cc: '', bcc: '', subject: '', body: '' });
  const prevId = useMemo(() => employee?.id, [employee]);

  useMemo(() => {
    if (!employee) return;
    setDraft({
      to: `${employee.employeeCode.toLowerCase()}@smart-hrm.local`,
      cc: '',
      bcc: '',
      subject: `HR Decision - ${employee.periodLabel}`,
      body: `Dear ${employee.name},\n\nYour ${employee.appraisalType.toLowerCase()} decision has been approved.\nPlease review the details in the HR system.\n\nRegards,\nHR Team`,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prevId]);

  if (!employee) return null;

  const handleSend = () => {
    if (employee.decisionMailSent) {
      message.info('Email already sent for this approved decision.');
      onClose();
      return;
    }
    if (!draft.to.trim()) { message.warning('To email is required.'); return; }
    if (!draft.subject.trim()) { message.warning('Email subject is required.'); return; }
    onSend(employee.id, draft);
    onClose();
    message.success('Email sent successfully.');
  };

  return (
    <Modal open={open} onCancel={onClose} onOk={handleSend} okText="Send mail" width={760} title={`Send mail to ${employee.name}`}>
      <Row gutter={10}>
        <Col span={24}>
          <FieldLabel>To</FieldLabel>
          <Input value={draft.to} onChange={e => setDraft(prev => ({ ...prev, to: e.target.value }))} placeholder="employee@company.com" />
        </Col>
      </Row>
      <Row gutter={10} style={{ marginTop: 10 }}>
        <Col span={12}>
          <FieldLabel>CC</FieldLabel>
          <Input value={draft.cc} onChange={e => setDraft(prev => ({ ...prev, cc: e.target.value }))} placeholder="Optional" />
        </Col>
        <Col span={12}>
          <FieldLabel>Bcc</FieldLabel>
          <Input value={draft.bcc} onChange={e => setDraft(prev => ({ ...prev, bcc: e.target.value }))} placeholder="Optional" />
        </Col>
      </Row>
      <div style={{ marginTop: 10 }}>
        <FieldLabel>Subject</FieldLabel>
        <Input value={draft.subject} onChange={e => setDraft(prev => ({ ...prev, subject: e.target.value }))} placeholder="Mail subject" />
      </div>
      <div style={{ marginTop: 10 }}>
        <FieldLabel>Body</FieldLabel>
        <Input.TextArea rows={7} value={draft.body} onChange={e => setDraft(prev => ({ ...prev, body: e.target.value }))} placeholder="Write mail body" />
      </div>
    </Modal>
  );
}

// ─── Approvals Full Page ──────────────────────────────────────────────────────
interface ApprovalsPageProps {
  open: boolean;
  approvals: ApprovalEmployee[];
  onClose: () => void;
  onLMSubmit: (id: string, markings: SubKPIMarking[], overallRemarks: string) => void;
  onHRSubmit: (id: string, markings: SubKPIMarking[], overallRemarks: string) => void;
  onHRDecisionSubmit: (id: string, decision: HRDecision) => void;
  onDecisionApprove: (id: string, remarks: string) => void;
  onDecisionReject: (id: string, remarks: string) => void;
  onDecisionMailSend: (id: string, payload: DecisionMailPayload) => void;
  onSeparationInitiated: (id: string) => void;
}

function ApprovalsPage({ open, approvals, onClose, onLMSubmit, onHRSubmit, onHRDecisionSubmit, onDecisionApprove, onDecisionReject, onDecisionMailSend, onSeparationInitiated }: ApprovalsPageProps) {
  const [activeTab,      setActiveTab]      = useState<'lm' | 'hr' | 'decision-approval'>('lm');
  const [filterStatus,   setFilterStatus]   = useState<'All' | 'Pending' | 'Submitted' | 'Rejected'>('All');
  const [filterType,     setFilterType]     = useState<'All' | 'Appraisal' | 'Confirmation'>('All');
  const [searchQ,        setSearchQ]        = useState('');
  const [lmMarkTarget,   setLMMarkTarget]   = useState<ApprovalEmployee | null>(null);
  const [hrMarkTarget,   setHRMarkTarget]   = useState<ApprovalEmployee | null>(null);
  const [decisionTarget, setDecisionTarget] = useState<ApprovalEmployee | null>(null);
  const [decisionModalMode, setDecisionModalMode] = useState<'hr' | 'approval'>('hr');
  const [mailTarget, setMailTarget] = useState<ApprovalEmployee | null>(null);
  const [separationTarget, setSeparationTarget] = useState<ApprovalEmployee | null>(null);
  const [decisionFilter, setDecisionFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');

  if (!open) return null;

  const resetFilters = () => { setFilterStatus('All'); setFilterType('All'); setSearchQ(''); setDecisionFilter('All'); };

  const statusOf = (emp: ApprovalEmployee) => (activeTab === 'lm' ? emp.lmStatus : emp.hrStatus);
  const decisionPending = approvals.filter(a => a.decisionApprovalStatus === 'Pending').length;
  const decisionDone = approvals.filter(a => a.decisionApprovalStatus === 'Approved' || a.decisionApprovalStatus === 'Rejected').length;

  const pending   = approvals.filter(a => statusOf(a) === 'Pending');
  const submitted = approvals.filter(a => statusOf(a) === 'Submitted');

  const decisionRows = approvals.filter(emp => {
    if (!emp.hrDecision) return false;
    if (filterType !== 'All' && emp.appraisalType !== filterType) return false;
    const q = searchQ.trim().toLowerCase();
    if (q && !emp.name.toLowerCase().includes(q) && !emp.employeeCode.toLowerCase().includes(q) && !emp.designation.toLowerCase().includes(q)) return false;
    if (decisionFilter === 'All') return true;
    return emp.decisionApprovalStatus === decisionFilter;
  });

  const displayed = approvals.filter(emp => {
    if (activeTab === 'hr' && filterStatus === 'Rejected') {
      if (emp.decisionApprovalStatus !== 'Rejected') return false;
    } else if (filterStatus !== 'All' && statusOf(emp) !== filterStatus) {
      return false;
    }
    if (filterType   !== 'All' && emp.appraisalType !== filterType) return false;
    const q = searchQ.trim().toLowerCase();
    if (q && !emp.name.toLowerCase().includes(q) && !emp.employeeCode.toLowerCase().includes(q) && !emp.designation.toLowerCase().includes(q)) return false;
    return true;
  });

  const syncedLMTarget = lmMarkTarget ? (approvals.find(a => a.id === lmMarkTarget.id) ?? null) : null;
  const syncedHRTarget = hrMarkTarget ? (approvals.find(a => a.id === hrMarkTarget.id) ?? null) : null;
  const syncedDecisionTarget = decisionTarget ? (approvals.find(a => a.id === decisionTarget.id) ?? null) : null;

  return (
    <div style={{ padding: '16px 20px', background: CLR_BG, minHeight: '100%', height: '100%', overflowY: 'auto' }}>
      {/* Page header */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button icon={<ArrowLeftOutlined />} onClick={onClose} style={{ borderRadius: 8 }}>Back</Button>
            <div>
              <Title level={3} style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
                Approvals
                <Text style={{ marginLeft: 10, color: CLR_PRIMARY, fontSize: 16, fontWeight: 500 }}>
                  {activeTab === 'lm' ? 'Line Manager Review' : activeTab === 'hr' ? 'HR Review & Decision' : 'Decision Approval'}
                </Text>
              </Title>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {activeTab === 'lm'
                  ? 'Employee appraisal and confirmation reviews pending your line manager evaluation'
                  : activeTab === 'hr'
                  ? 'Review employee, line manager and HR marks, then record final HR decision'
                  : 'View all decision requests and approve or reject'}
              </Text>
            </div>
          </div>
          <Space size={8}>
            <div style={{ background: 'var(--color-status-pending-bg)', border: '1px solid #fde68a', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 700, color: '#d97706' }}>
              {activeTab === 'decision-approval' ? `${decisionPending} Pending` : `${pending.length} Pending`}
            </div>
            <div style={{ background: 'var(--color-status-approved-bg)', border: '1px solid #6ee7b7', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 700, color: 'var(--color-primary-dark)' }}>
              {activeTab === 'decision-approval' ? `${decisionDone} Processed` : `${submitted.length} Submitted`}
            </div>
          </Space>
        </div>
      </div>

      <div style={{ background: 'var(--color-bg-surface)', border: `1px solid ${CLR_BORDER}`, borderRadius: 12, padding: '10px 12px', marginBottom: 12 }}>
        <Tabs
          activeKey={activeTab}
          onChange={k => {
            setActiveTab(k as 'lm' | 'hr' | 'decision-approval');
            setFilterStatus('All');
            setDecisionFilter('All');
          }}
          items={[
            {
              key: 'lm',
              label: (
                <Space size={6}>
                  <StarOutlined />
                  Line manager
                  <span style={{ background: 'var(--color-bg-subtle)', borderRadius: 999, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>
                    {approvals.filter(a => a.lmStatus === 'Pending').length}
                  </span>
                </Space>
              ),
            },
            {
              key: 'hr',
              label: (
                <Space size={6}>
                  <FileTextOutlined />
                  HR
                  <span style={{ background: 'var(--color-bg-subtle)', borderRadius: 999, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>
                    {approvals.filter(a => a.hrStatus === 'Pending').length}
                  </span>
                </Space>
              ),
            },
            {
              key: 'decision-approval',
              label: (
                <Space size={6}>
                  <SafetyCertificateOutlined />
                  Decision approval
                  <span style={{ background: 'var(--color-bg-subtle)', borderRadius: 999, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>
                    {decisionPending}
                  </span>
                </Space>
              ),
            },
          ]}
        />
      </div>

      {/* Search + filters toolbar */}
      <div style={{ background: 'var(--color-bg-surface)', border: `1px solid ${CLR_BORDER}`, borderRadius: 12, padding: '12px 16px', marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <Input
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            placeholder="Search by name, code or designation"
            prefix={<UserOutlined style={{ color: 'var(--color-text-disabled)' }} />}
            allowClear
            style={{ width: 260, borderRadius: 8, borderColor: CLR_BORDER }}
          />
          <div style={{ display: 'flex', gap: 6 }}>
            {(activeTab === 'decision-approval'
              ? (['All', 'Pending', 'Approved', 'Rejected'] as const)
              : (activeTab === 'hr' ? (['All', 'Pending', 'Submitted', 'Rejected'] as const) : (['All', 'Pending', 'Submitted'] as const))
            ).map(f => (
              <Button
                key={f}
                size="small"
                type={(activeTab === 'decision-approval' ? decisionFilter : filterStatus) === f ? 'primary' : 'default'}
                onClick={() => {
                  if (activeTab === 'decision-approval') {
                    setDecisionFilter(f as 'All' | 'Pending' | 'Approved' | 'Rejected');
                  } else {
                    setFilterStatus(f as 'All' | 'Pending' | 'Submitted' | 'Rejected');
                  }
                }}
                style={{ borderRadius: 999, ...(activeTab !== 'decision-approval' && filterStatus !== f ? { borderColor: CLR_BORDER, color: CLR_PRIMARY } : {}) }}
              >
                {f}
              </Button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['All', 'Appraisal', 'Confirmation'] as const).map(t => (
              <Button key={t} size="small" type={filterType === t ? 'primary' : 'default'}
                onClick={() => setFilterType(t)}
                style={{ borderRadius: 999, ...(filterType !== t ? { borderColor: CLR_BORDER, color: 'var(--color-text-tertiary)' } : {}) }}>
                {t === 'All' ? 'All Types' : t === 'Appraisal' ? '⬟ Appraisal' : '✦ Confirmation'}
              </Button>
            ))}
          </div>
          {(searchQ || filterStatus !== 'All' || filterType !== 'All' || decisionFilter !== 'All') && (
            <Button size="small" onClick={resetFilters} style={{ borderRadius: 999, borderColor: 'var(--color-status-rejected-bg)', color: '#dc2626' }}>
              Reset
            </Button>
          )}
          <Text type="secondary" style={{ fontSize: 12, marginLeft: 'auto' }}>
            {activeTab === 'decision-approval' ? decisionRows.length : displayed.length} result{(activeTab === 'decision-approval' ? decisionRows.length : displayed.length) !== 1 ? 's' : ''}
          </Text>
        </div>
      </div>

      {activeTab === 'decision-approval' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {decisionRows.map(emp => (
            <div key={emp.id} style={{ background: 'var(--color-bg-surface)', border: `1px solid ${CLR_BORDER}`, borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <Text strong>{emp.name} ({emp.employeeCode})</Text>
                  <div><Text type="secondary" style={{ fontSize: 12 }}>{emp.designation} · {emp.appraisalType} · {emp.periodLabel}</Text></div>
                </div>
                <Space>
                  <Button size="small" icon={<EyeOutlined />} onClick={() => { setDecisionModalMode('approval'); setDecisionTarget(emp); }}>View</Button>
                </Space>
              </div>
              <div style={{ marginTop: 8 }}>
                {emp.decisionApprovalStatus === 'Pending' && <Tag style={{ border: 'none', borderRadius: 999, background: 'var(--color-status-pending-bg)', color: '#d97706' }}>Pending Approval</Tag>}
                {emp.decisionApprovalStatus === 'Approved' && <Tag style={{ border: 'none', borderRadius: 999, background: 'var(--color-status-approved-bg)', color: 'var(--color-primary-dark)' }}>Approved</Tag>}
                {emp.decisionApprovalStatus === 'Rejected' && <Tag style={{ border: 'none', borderRadius: 999, background: 'var(--color-status-rejected-bg)', color: '#991b1b' }}>Rejected</Tag>}
              </div>
            </div>
          ))}

          {decisionRows.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-disabled)' }}>
              <Text type="secondary" style={{ fontSize: 14 }}>No decision requests found.</Text>
            </div>
          )}
        </div>
      )}

      {activeTab !== 'decision-approval' && (
      <>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {displayed.map(emp => {
          const selfScore = calcWeightedScore(emp.subKPIs, emp.selfMarkings);
          const lmScore   = calcWeightedScore(emp.subKPIs, emp.lmMarkings);
          const hrScore   = calcWeightedScore(emp.subKPIs, emp.hrMarkings);
          const daysLeft  = daysUntil(emp.lmDeadline);
          const isPending = statusOf(emp) === 'Pending';
          const isUrgent  = daysLeft <= 3 && isPending;
          const isConf    = emp.appraisalType === 'Confirmation';
          const hrCanMark = emp.lmStatus === 'Submitted' || emp.hrStatus === 'Submitted';

          return (
            <div key={emp.id} style={{ background: 'var(--color-bg-surface)', border: `1px solid ${isPending ? (isUrgent ? 'var(--color-status-rejected-bg)' : 'rgba(253, 230, 138, 0.4)') : CLR_BORDER}`, borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              {/* Header row */}
              <div style={{ background: isPending ? (isUrgent ? 'var(--color-status-rejected-bg)' : 'var(--color-status-pending-bg)') : 'linear-gradient(90deg,#d1fae5,#ecfdf5)', borderBottom: `1px solid ${isPending ? (isUrgent ? 'var(--color-status-rejected-bg)' : 'rgba(253, 230, 138, 0.4)') : '#a7f3d0'}`, padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <Space size={12}>
                  <Avatar size={38} style={{ background: emp.avatarColor, fontWeight: 700, fontSize: 13 }}>
                    {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </Avatar>
                  <div>
                    <Space size={8} style={{ marginBottom: 2 }}>
                      <Text strong style={{ fontSize: 14, color: 'var(--color-text-primary)' }}>{emp.name}</Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>{emp.employeeCode}</Text>
                      <Tag style={{ borderRadius: 999, fontSize: 10, fontWeight: 700, paddingInline: 8, border: 'none', background: isConf ? 'var(--color-status-info-bg)' : 'rgba(124, 58, 237, 0.13)', color: isConf ? '#0369a1' : '#6d28d9' }}>
                        {isConf ? '✦ Confirmation' : '⬟ Appraisal'}
                      </Tag>
                    </Space>
                    <div><Text type="secondary" style={{ fontSize: 11 }}>{emp.designation} · {emp.department}</Text></div>
                  </div>
                </Space>
                <Space size={8}>
                  {activeTab === 'lm' ? (
                    isPending ? (
                      <Button type="primary" icon={<EditOutlined />} onClick={() => setLMMarkTarget(emp)} style={{ borderRadius: 10, fontWeight: 700 }}>
                        Mark Review
                      </Button>
                    ) : (
                      <Button icon={<EyeOutlined />} onClick={() => setLMMarkTarget(emp)} style={{ borderRadius: 10, borderColor: CLR_BORDER, color: CLR_PRIMARY, fontWeight: 600 }}>
                        View Review
                      </Button>
                    )
                  ) : (
                    <>
                      {isPending ? (
                        <Button
                          type="primary"
                          icon={<EditOutlined />}
                          disabled={!hrCanMark}
                          onClick={() => setHRMarkTarget(emp)}
                          style={{ borderRadius: 10, fontWeight: 700 }}
                        >
                          {hrCanMark ? 'Mark HR Review' : 'Waiting LM'}
                        </Button>
                      ) : (
                        <Button icon={<EyeOutlined />} onClick={() => setHRMarkTarget(emp)} style={{ borderRadius: 10, borderColor: '#c4b5fd', color: '#6d28d9', fontWeight: 600 }}>
                          View HR Review
                        </Button>
                      )}
                      {emp.hrStatus === 'Submitted' && (
                        emp.decisionApprovalStatus === 'Approved' ? (
                          <>
                            <Button
                              icon={<SendOutlined />}
                              onClick={() => !emp.decisionMailSent && setMailTarget(emp)}
                              disabled={!!emp.decisionMailSent}
                              style={{ borderRadius: 10, fontWeight: 600 }}
                            >
                              {emp.decisionMailSent ? 'Mail sent' : 'Send mail'}
                            </Button>
                            {emp.appraisalType === 'Confirmation' && emp.hrDecision?.confirmationAction === 'Separation' && (
                              <Button
                                icon={<SafetyCertificateOutlined />}
                                disabled={!!emp.separationInitiated}
                                onClick={() => !emp.separationInitiated && setSeparationTarget(emp)}
                                style={{ borderRadius: 10, fontWeight: 600 }}
                              >
                                {emp.separationInitiated ? 'Separation initiated' : 'Initiate separation'}
                              </Button>
                            )}
                            {emp.appraisalType === 'Appraisal' && emp.hrDecision?.appraisalAction === 'Separation' && (
                              <Button
                                icon={<SafetyCertificateOutlined />}
                                disabled={!!emp.separationInitiated}
                                onClick={() => !emp.separationInitiated && setSeparationTarget(emp)}
                                style={{ borderRadius: 10, fontWeight: 600 }}
                              >
                                {emp.separationInitiated ? 'Separation initiated' : 'Initiate separation'}
                              </Button>
                            )}
                          </>
                        ) : (
                          <Button icon={<FileTextOutlined />} onClick={() => { setDecisionModalMode('hr'); setDecisionTarget(emp); }} style={{ borderRadius: 10, fontWeight: 600 }}>
                            {emp.decisionApprovalStatus === 'Rejected' ? 'Revise Decision' : 'Decision'}
                          </Button>
                        )
                      )}
                    </>
                  )}
                </Space>
              </div>

              {/* Body row */}
              <div style={{ padding: '12px 18px', display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ minWidth: 200 }}>
                  <Text style={{ fontSize: 10, color: 'var(--color-text-disabled)', fontWeight: 700 }}>PERIOD</Text>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>{emp.periodLabel}</div>
                  <Text type="secondary" style={{ fontSize: 11 }}>{emp.periodFrom} → {emp.periodTo}</Text>
                </div>
                <div>
                  <Text style={{ fontSize: 10, color: 'var(--color-text-disabled)', fontWeight: 700 }}>LM DEADLINE</Text>
                  <div style={{ marginTop: 2 }}>
                    <Space size={4}>
                      <CalendarOutlined style={{ fontSize: 11, color: daysLeft < 0 ? '#dc2626' : isUrgent ? '#d97706' : 'var(--color-text-tertiary)' }} />
                      <Text style={{ fontSize: 12, fontWeight: 700, color: daysLeft < 0 ? '#dc2626' : isUrgent ? '#d97706' : 'var(--color-text-secondary)' }}>
                        {daysLeft < 0 ? `Overdue ${Math.abs(daysLeft)}d` : daysLeft === 0 ? 'Due today' : `${daysLeft}d left · ${emp.lmDeadline}`}
                      </Text>
                      {isUrgent && <WarningOutlined style={{ fontSize: 10, color: '#d97706' }} />}
                    </Space>
                  </div>
                </div>
                <div>
                  <Text style={{ fontSize: 10, color: 'var(--color-text-disabled)', fontWeight: 700 }}>KPIs</Text>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-secondary)', marginTop: 2 }}>{emp.subKPIs.length} assigned</div>
                </div>
                <div>
                  <Text style={{ fontSize: 10, color: 'var(--color-text-disabled)', fontWeight: 700 }}>SELF SCORE</Text>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <Text style={{ fontSize: 16, fontWeight: 800, color: scoreColor(selfScore) }}>{selfScore}%</Text>
                    <Tag style={{ borderRadius: 999, fontSize: 10, border: 'none', background: scoreBadge(selfScore).bg, color: scoreBadge(selfScore).color, fontWeight: 600, margin: 0 }}>{scoreBadge(selfScore).label}</Tag>
                  </div>
                </div>
                {!isPending && (
                  <div>
                    <Text style={{ fontSize: 10, color: 'var(--color-text-disabled)', fontWeight: 700 }}>{activeTab === 'lm' ? 'LM SCORE' : 'HR SCORE'}</Text>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <Text style={{ fontSize: 16, fontWeight: 800, color: scoreColor(activeTab === 'lm' ? lmScore : hrScore) }}>{activeTab === 'lm' ? lmScore : hrScore}%</Text>
                      <Tag style={{ borderRadius: 999, fontSize: 10, border: 'none', background: scoreBadge(activeTab === 'lm' ? lmScore : hrScore).bg, color: scoreBadge(activeTab === 'lm' ? lmScore : hrScore).color, fontWeight: 600, margin: 0 }}>{scoreBadge(activeTab === 'lm' ? lmScore : hrScore).label}</Tag>
                    </div>
                  </div>
                )}
                {activeTab === 'hr' && emp.lmStatus === 'Submitted' && (
                  <div>
                    <Text style={{ fontSize: 10, color: 'var(--color-text-disabled)', fontWeight: 700 }}>LM SCORE</Text>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <Text style={{ fontSize: 16, fontWeight: 800, color: scoreColor(lmScore) }}>{lmScore}%</Text>
                      <Tag style={{ borderRadius: 999, fontSize: 10, border: 'none', background: scoreBadge(lmScore).bg, color: scoreBadge(lmScore).color, fontWeight: 600, margin: 0 }}>{scoreBadge(lmScore).label}</Tag>
                    </div>
                  </div>
                )}
                <div style={{ marginLeft: 'auto' }}>
                  {isPending ? (
                    <Tag icon={<ClockCircleOutlined />} style={{ borderRadius: 999, fontSize: 11, fontWeight: 700, paddingInline: 10, border: 'none', background: 'var(--color-status-pending-bg)', color: '#d97706' }}>
                      {activeTab === 'lm' ? 'Pending Review' : 'Pending HR Review'}
                    </Tag>
                  ) : (
                    <Tag icon={<CheckCircleOutlined />} style={{ borderRadius: 999, fontSize: 11, fontWeight: 700, paddingInline: 10, border: 'none', background: 'var(--color-status-approved-bg)', color: 'var(--color-primary-dark)' }}>
                      {activeTab === 'lm' ? 'Review Submitted' : 'HR Review Submitted'}
                    </Tag>
                  )}
                  {activeTab === 'hr' && emp.hrStatus === 'Submitted' && emp.decisionApprovalStatus === 'Pending' && (
                    <Tag style={{ marginLeft: 6, border: 'none', borderRadius: 999, background: 'var(--color-status-pending-bg)', color: '#d97706', fontWeight: 700 }}>
                      Decision Pending Approval
                    </Tag>
                  )}
                  {activeTab === 'hr' && emp.hrStatus === 'Submitted' && emp.decisionApprovalStatus === 'Approved' && (
                    <Tag style={{ marginLeft: 6, border: 'none', borderRadius: 999, background: 'var(--color-status-approved-bg)', color: 'var(--color-primary-dark)', fontWeight: 700 }}>
                      Decision Approved{emp.decisionMailSent ? ' · Email Sent' : ''}
                    </Tag>
                  )}
                  {activeTab === 'hr' && emp.hrStatus === 'Submitted' && emp.decisionApprovalStatus === 'Rejected' && (
                    <Tag style={{ marginLeft: 6, border: 'none', borderRadius: 999, background: 'var(--color-status-rejected-bg)', color: '#991b1b', fontWeight: 700 }}>
                      Decision Rejected
                    </Tag>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {displayed.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-disabled)' }}>
          <CheckCircleOutlined style={{ fontSize: 40, display: 'block', marginBottom: 12 }} />
          <Text type="secondary" style={{ fontSize: 14 }}>No results for the current filters.</Text>
        </div>
      )}
      </>
      )}

      {/* LM Mark Drawer */}
      <LMMarkDrawer
        employee={syncedLMTarget}
        onClose={() => setLMMarkTarget(null)}
        onSubmit={(id, markings, overallRemarks) => {
          onLMSubmit(id, markings, overallRemarks);
          setLMMarkTarget(null);
          message.success('Line manager review submitted successfully!');
        }}
      />

      <HRMarkDrawer
        employee={syncedHRTarget}
        onClose={() => setHRMarkTarget(null)}
        onSubmit={(id, markings, overallRemarks) => {
          onHRSubmit(id, markings, overallRemarks);
          setHRMarkTarget(null);
          message.success('HR review submitted successfully! You can now click Decision.');
        }}
      />

      <HRDecisionModal
        employee={syncedDecisionTarget}
        open={!!syncedDecisionTarget}
        onClose={() => setDecisionTarget(null)}
        mode={decisionModalMode}
        onSendForApproval={onHRDecisionSubmit}
        onApproveRequest={onDecisionApprove}
        onRejectRequest={onDecisionReject}
      />

      <DecisionMailModal
        employee={mailTarget ? (approvals.find(a => a.id === mailTarget.id) ?? null) : null}
        open={!!mailTarget}
        onClose={() => setMailTarget(null)}
        onSend={onDecisionMailSend}
      />

      <NewSeparationModal
        open={!!separationTarget}
        onClose={() => setSeparationTarget(null)}
        onSubmit={() => {
          if (separationTarget) {
            onSeparationInitiated(separationTarget.id);
          }
          setSeparationTarget(null);
        }}
        initialEmployee={separationTarget ? {
          empId: separationTarget.employeeCode,
          name: separationTarget.name,
          designation: separationTarget.designation,
          department: separationTarget.department,
        } : undefined}
        initialSeparationType="Termination"
      />
    </div>
  );
}

// ─── Appraisal Card ───────────────────────────────────────────────────────────
interface AppraisalCardProps {
  record: AppraisalRecord;
  onMark: (r: AppraisalRecord) => void;
  onView: (r: AppraisalRecord) => void;
}

function AppraisalCard({ record, onMark, onView }: AppraisalCardProps) {
  const canMark    = record.status === 'Pending Self';
  const canView    = record.status !== 'Pending Self';
  const doneSteps  = record.pipeline.filter(s => s.status === 'Submitted').length;
  const totalSteps = record.pipeline.length;
  const progress   = Math.round((doneSteps / totalSteps) * 100);

  return (
    <div style={{
      background: CLR_CARD, border: `1px solid ${canMark ? 'rgba(253, 230, 138, 0.4)' : CLR_BORDER}`,
      borderRadius: 14, overflow: 'hidden',
      boxShadow: '0 1px 6px rgba(0,0,0,0.04)', transition: 'box-shadow 0.2s',
    }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 18px rgba(15,118,110,0.10)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.04)')}
    >
      {/* Card header */}
      <div style={{
        background: canMark
          ? 'linear-gradient(90deg, #fffbeb 0%, #fef9f0 100%)'
          : record.status === 'Completed'
          ? 'linear-gradient(90deg, #d1fae5 0%, #ecfdf5 100%)'
          : CLR_PRIMARY_L,
        borderBottom: `1px solid ${canMark ? 'rgba(253, 230, 138, 0.4)' : CLR_BORDER}`,
        padding: '14px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10,
      }}>
        <div>
          <Space size={8} style={{ marginBottom: 6 }}>
            <TypeTag type={record.type} />
            <StatusTag status={record.status} />
          </Space>
          <div>
            <Text style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text-primary)', display: 'block' }}>
              {record.periodLabel}
            </Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {record.periodFrom} → {record.periodTo}
            </Text>
          </div>
        </div>
        <Space size={8}>
          {canMark && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => onMark(record)}
              style={{ borderRadius: 10, fontWeight: 700 }}
            >
              Mark Myself
            </Button>
          )}
          {canView && (
            <Button
              icon={<EyeOutlined />}
              onClick={() => onView(record)}
              style={{ borderRadius: 10, borderColor: CLR_BORDER, color: CLR_PRIMARY, fontWeight: 600 }}
            >
              View Appraisal
            </Button>
          )}
        </Space>
      </div>

      {/* Card body */}
      <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Deadline row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <Space size={6}>
            <ClockCircleOutlined style={{ color: 'var(--color-text-disabled)', fontSize: 12 }} />
            <Text style={{ fontSize: 12, color: 'var(--color-text-tertiary)', fontWeight: 600 }}>Self-marking deadline:</Text>
            <DeadlineBadge dateStr={record.selfDeadline} status={record.status} />
          </Space>
          <Space size={4}>
            <AimOutlined style={{ fontSize: 12, color: 'var(--color-text-disabled)' }} />
            <Text type="secondary" style={{ fontSize: 12 }}>{record.subKPIs.length} KPIs assigned</Text>
          </Space>
        </div>

        {/* Pipeline */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-disabled)', letterSpacing: '0.05em', marginBottom: 6 }}>
            EVALUATION PIPELINE
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <PipelinePills steps={record.pipeline} />
            <Space size={6}>
              <Text style={{ fontSize: 11, color: 'var(--color-text-disabled)' }}>{doneSteps}/{totalSteps} done</Text>
              <Progress
                type="circle"
                percent={progress}
                size={28}
                strokeColor={progress === 100 ? '#059669' : CLR_PRIMARY}
                trailColor="#e5e7eb"
                format={() => null}
              />
            </Space>
          </div>
        </div>

        {/* Score summary if completed / in review */}
        {record.status !== 'Pending Self' && (
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 10, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {record.pipeline
              .filter(s => s.status === 'Submitted')
              .map(step => {
                const markings = record.evalMarkings[step.role] ?? [];
                const ws = calcWeightedScore(record.subKPIs, markings);
                const rc = ROLE_COLORS[step.role] ?? { color: 'var(--color-text-tertiary)', bg: 'var(--color-bg-subtle)' };
                return (
                  <div key={step.role} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: rc.bg, borderRadius: 8, padding: '4px 10px',
                  }}>
                    <Text style={{ fontSize: 11, fontWeight: 700, color: rc.color }}>{step.role}</Text>
                    <div style={{ width: 1, height: 12, background: rc.color, opacity: 0.3 }} />
                    <Text style={{ fontSize: 13, fontWeight: 800, color: scoreColor(ws) }}>{ws}%</Text>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MyAppraisalPage() {
  const [records, setRecords]         = useState<AppraisalRecord[]>(RECORDS);
  const [markTarget, setMarkTarget]   = useState<AppraisalRecord | null>(null);
  const [viewTarget, setViewTarget]   = useState<AppraisalRecord | null>(null);
  const [approvalsOpen, setApprovalsOpen] = useState(false);
  const [approvals, setApprovals]     = useState<ApprovalEmployee[]>(PENDING_APPROVALS);

  const pending   = records.filter(r => r.status === 'Pending Self' || r.status === 'Self Submitted');
  const inReview  = records.filter(r => r.status === 'In Review');
  const completed = records.filter(r => r.status === 'Completed');

  const handleSubmit = (id: string, markings: SubKPIMarking[]) => {
    setRecords(prev => prev.map(r => {
      if (r.id !== id) return r;
      return {
        ...r,
        status: 'In Review' as AppraisalStatus,
        pipeline: r.pipeline.map(s =>
          s.role === 'Self' ? { ...s, status: 'Submitted' as StepStatus, submittedAt: '2026-03-31' } : s
        ),
        evalMarkings: { ...r.evalMarkings, Self: markings },
      };
    }));
    setMarkTarget(null);
    message.success('Self assessment submitted successfully!');
  };

  const handleLMSubmit = (id: string, markings: SubKPIMarking[], overallRemarks: string) => {
    setApprovals(prev => prev.map(a =>
      a.id !== id ? a : { ...a, lmStatus: 'Submitted' as const, lmMarkings: markings, lmOverallRemarks: overallRemarks }
    ));
  };

  const handleHRSubmit = (id: string, markings: SubKPIMarking[], overallRemarks: string) => {
    setApprovals(prev => prev.map(a =>
      a.id !== id ? a : {
        ...a,
        hrStatus: 'Submitted' as const,
        hrMarkings: markings,
        hrOverallRemarks: overallRemarks,
        decisionApprovalStatus: 'Not Requested' as const,
        decisionMailSent: false,
        separationInitiated: false,
      }
    ));
  };

  const handleHRDecisionSubmit = (id: string, decision: HRDecision) => {
    setApprovals(prev => prev.map(a =>
      a.id !== id ? a : {
        ...a,
        hrDecision: decision,
        decisionApprovalStatus: 'Pending' as const,
        decisionApprovalRemarks: undefined,
        decisionApprovalReviewedBy: undefined,
        decisionApprovalReviewedAt: undefined,
        decisionMailSent: false,
        separationInitiated: false,
      }
    ));
  };

  const handleDecisionApprove = (id: string, remarks: string) => {
    setApprovals(prev => prev.map(a =>
      a.id !== id ? a : {
        ...a,
        decisionApprovalStatus: 'Approved' as const,
        decisionApprovalRemarks: remarks,
        decisionApprovalReviewedBy: 'Approver',
        decisionApprovalReviewedAt: '2026-04-01',
      }
    ));
  };

  const handleDecisionReject = (id: string, remarks: string) => {
    setApprovals(prev => prev.map(a =>
      a.id !== id ? a : {
        ...a,
        decisionApprovalStatus: 'Rejected' as const,
        decisionApprovalRemarks: remarks,
        decisionApprovalReviewedBy: 'Approver',
        decisionApprovalReviewedAt: '2026-04-01',
      }
    ));
  };

  const handleDecisionMailSend = (id: string, _payload: DecisionMailPayload) => {
    setApprovals(prev => prev.map(a =>
      a.id !== id ? a : { ...a, decisionMailSent: true }
    ));
  };

  const handleSeparationInitiated = (id: string) => {
    setApprovals(prev => prev.map(a =>
      a.id !== id ? a : { ...a, separationInitiated: true }
    ));
  };

  const approvalAttentionCount = approvals.filter(a =>
    a.lmStatus === 'Pending' || (a.lmStatus === 'Submitted' && a.hrStatus === 'Pending')
  ).length;

  // Sync viewTarget when records change (so it reflects updated state)
  const syncedViewTarget = viewTarget ? (records.find(r => r.id === viewTarget.id) ?? null) : null;

  const statCards = [
    { label: 'Pending Self',  value: pending.length,   color: '#d97706', bg: 'var(--color-status-pending-bg)', border: 'rgba(253, 230, 138, 0.4)', icon: <ClockCircleOutlined /> },
    { label: 'In Review',     value: inReview.length,  color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.09)', border: 'rgba(124, 58, 237, 0.22)', icon: <EyeOutlined /> },
    { label: 'Completed',     value: completed.length, color: '#059669', bg: 'var(--color-status-approved-bg)', border: 'var(--color-status-approved-bg)', icon: <CheckCircleOutlined /> },
    { label: 'Total KPIs',    value: records.reduce((s, r) => s + r.subKPIs.length, 0), color: CLR_PRIMARY, bg: CLR_PRIMARY_L, border: CLR_BORDER, icon: <AimOutlined /> },
  ];

  if (approvalsOpen) {
    return (
      <ApprovalsPage
        open={approvalsOpen}
        approvals={approvals}
        onClose={() => setApprovalsOpen(false)}
        onLMSubmit={handleLMSubmit}
        onHRSubmit={handleHRSubmit}
        onHRDecisionSubmit={handleHRDecisionSubmit}
        onDecisionApprove={handleDecisionApprove}
        onDecisionReject={handleDecisionReject}
        onDecisionMailSend={handleDecisionMailSend}
        onSeparationInitiated={handleSeparationInitiated}
      />
    );
  }

  return (
    <div style={{ padding: '16px 20px', background: CLR_BG, minHeight: '100%', height: '100%', overflowY: 'auto' }}>

      {/* ── Page header ── */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <Title level={3} style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
              My Appraisal
              <Text style={{ marginLeft: 10, color: CLR_PRIMARY, fontSize: 18, fontWeight: 500 }}>Overview</Text>
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              View and complete your KPI self-assessments for active appraisal cycles.
            </Text>
          </div>
          <Button
            icon={<SafetyCertificateOutlined />}
            onClick={() => setApprovalsOpen(true)}
            style={{ borderRadius: 10, borderColor: CLR_BORDER, color: CLR_PRIMARY, fontWeight: 700, height: 38 }}
          >
            Approvals
            {approvalAttentionCount > 0 && (
              <Tag style={{ marginLeft: 6, borderRadius: 999, fontSize: 10, fontWeight: 700, border: 'none', background: 'var(--color-status-pending-bg)', color: '#d97706', padding: '0 6px' }}>
                {approvalAttentionCount}
              </Tag>
            )}
          </Button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <Row gutter={[12, 12]} style={{ marginBottom: 18 }}>
        {statCards.map(s => (
          <Col key={s.label} xs={12} sm={6}>
            <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--color-bg-surface)', border: `1px solid ${s.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, fontSize: 17 }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.color, lineHeight: 1.1 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 600 }}>{s.label}</div>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* ── Appraisal list ── */}
      {pending.length > 0 && (
        <section style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 3, height: 14, background: '#d97706', borderRadius: 2 }} />
            <Text style={{ fontSize: 13, fontWeight: 700, color: '#d97706' }}>ACTION REQUIRED</Text>
            <Tag style={{ borderRadius: 999, fontSize: 10, border: 'none', background: 'var(--color-status-pending-bg)', color: '#d97706', fontWeight: 700 }}>
              {pending.length}
            </Tag>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pending.map(r => (
              <AppraisalCard key={r.id} record={r}
                onMark={setMarkTarget}
                onView={r2 => { setViewTarget(r2); }}
              />
            ))}
          </div>
        </section>
      )}

      {inReview.length > 0 && (
        <section style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 3, height: 14, background: '#7c3aed', borderRadius: 2 }} />
            <Text style={{ fontSize: 13, fontWeight: 700, color: '#5b21b6' }}>IN REVIEW</Text>
            <Tag style={{ borderRadius: 999, fontSize: 10, border: 'none', background: 'rgba(124, 58, 237, 0.13)', color: '#5b21b6', fontWeight: 700 }}>
              {inReview.length}
            </Tag>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {inReview.map(r => (
              <AppraisalCard key={r.id} record={r}
                onMark={setMarkTarget}
                onView={setViewTarget}
              />
            ))}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 3, height: 14, background: '#059669', borderRadius: 2 }} />
            <Text style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary-dark)' }}>COMPLETED</Text>
            <Tag style={{ borderRadius: 999, fontSize: 10, border: 'none', background: 'var(--color-status-approved-bg)', color: 'var(--color-primary-dark)', fontWeight: 700 }}>
              {completed.length}
            </Tag>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {completed.map(r => (
              <AppraisalCard key={r.id} record={r}
                onMark={setMarkTarget}
                onView={setViewTarget}
              />
            ))}
          </div>
        </section>
      )}

      {records.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-disabled)' }}>
          <TrophyOutlined style={{ fontSize: 40, display: 'block', marginBottom: 12 }} />
          <Text type="secondary" style={{ fontSize: 15 }}>No appraisal cycles assigned yet.</Text>
        </div>
      )}

      {/* ── Modals ── */}
      <SelfMarkDrawer
        record={markTarget}
        onClose={() => setMarkTarget(null)}
        onSubmit={handleSubmit}
      />
      <FullPageAppraisalReview
        record={syncedViewTarget}
        onClose={() => setViewTarget(null)}
      />

    </div>
  );
}
