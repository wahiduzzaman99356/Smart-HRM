import { useState, useMemo, useCallback, memo, useRef, useEffect, type ReactNode } from 'react';
import {
  Button, Input, Select, DatePicker, TimePicker, Table, Tooltip, Drawer,
  Upload, Collapse, Modal, Dropdown, Divider, Switch,
  Row, Col, Space, Steps, Tabs,
} from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import {
  SearchOutlined, ReloadOutlined, FilterOutlined,
  EyeOutlined, MessageOutlined, UploadOutlined,
  LockOutlined, UserOutlined, HistoryOutlined,
  ExclamationCircleOutlined, CalendarOutlined,
  MoreOutlined, CloseCircleOutlined,
  FileOutlined, DeleteOutlined, DownloadOutlined, AuditOutlined,
  ClockCircleOutlined, WarningOutlined, PlusOutlined, CheckCircleFilled,
  EditOutlined, InfoCircleOutlined, BarChartOutlined, CheckSquareOutlined,
  SafetyOutlined, CommentOutlined, SendOutlined,
  BoldOutlined, ItalicOutlined, UnderlineOutlined, StrikethroughOutlined,
  OrderedListOutlined, UnorderedListOutlined,
  AlignLeftOutlined, AlignCenterOutlined, AlignRightOutlined,
  UndoOutlined, RedoOutlined, PrinterOutlined, CheckCircleOutlined,
  PaperClipOutlined, ArrowLeftOutlined, MailOutlined,
} from '@ant-design/icons';

type DateRange = RangePickerProps['value'];
const { RangePicker } = DatePicker;

const { Panel } = Collapse;

// ── Types ──────────────────────────────────────────────────────────────────────
type TicketStatus      = 'Ongoing' | 'Closed' | 'Reopen';
type InvestigationStage =
  | 'Show Cause'
  | 'Explanation Review'
  | 'Committee Formation'
  | 'Investigation'
  | 'Verdict'
  | 'Report'
  | 'Summary'
  | 'Hearing'
  | 'Authority Review'
  | 'Conclusion'
  | 'Re-evaluation';
type SecurityLevel     = 'Low' | 'Medium' | 'High';
type NatureOfConflict  = 'Policy Related' | 'Tax Related' | 'Interpersonal' | 'Workplace Harassment' | 'Other';
type ResolutionStrategy = 'Negotiation' | 'Mediation' | 'Arbitration' | 'Litigation' | 'Collaborative';
type ConflictType      = 'Interpersonal' | 'Workplace Violence' | 'Harassment' | 'Discrimination' | 'Policy Violation' | 'Performance' | 'Other';

interface Employee { id: string; name: string }

interface HRResponse {
  date:                   string;
  conflictType:           ConflictType;
  securityLevel:          SecurityLevel;
  assignPersonnel:        string[];
  preferredActions:       string[];
  preferredDateOfMeeting: string;
  resolutionStrategy:     ResolutionStrategy;
  remarks:                string;
}

interface ComplianceTicket {
  ticketId:              string;
  conflictDescription:   string;
  employeesInvolved:     Employee[];
  natureOfConflict:      NatureOfConflict;
  reportedBy:            Employee;
  securityLevel:         SecurityLevel;
  requestDate:           string;
  ticketStatus:          TicketStatus;
  lastResolutionDate?:   string;
  currentStage:          InvestigationStage;
  deadline:              string;
  // Section A — employee-submitted
  name:                  string;
  employeeId:            string;
  phoneNumber:           string;
  department:            string;
  dateOfIncident:        string;
  timeOfIncident:        string;
  location:              string;
  witness:               string;
  descriptionOfIncident: string;
  preferredOutcome:      string;
  responses:             HRResponse[];
}

// ── Mock data ──────────────────────────────────────────────────────────────────
const MOCK_TICKETS: ComplianceTicket[] = [
  {
    ticketId: 'REQ-2024052908',
    conflictDescription: 'Miscommunication about Project Deadline and scope of deliverables between team members',
    employeesInvolved: [
      { id: 'T881356', name: 'Ashraful Islam' },
      { id: 'T881357', name: 'Md. Arifur Islam' },
      { id: 'T881358', name: 'Annanab Zaman' },
      { id: 'T881359', name: 'Ishraq Ahmed' },
    ],
    natureOfConflict: 'Policy Related',
    reportedBy: { id: 'T881356', name: 'Ashraful Islam' },
    securityLevel: 'Low',
    requestDate: '29-05-2026; 10:25 PM',
    ticketStatus: 'Reopen',
    currentStage: 'Show Cause',
    deadline: '15-06-2026',
    name: 'Ashraful Islam', employeeId: 'T881356', phoneNumber: '01712345678',
    department: 'Engineering', dateOfIncident: '28-05-2026', timeOfIncident: '14:30',
    location: 'Conference Room B', witness: 'Md. Rahim',
    descriptionOfIncident: 'A disagreement arose during the sprint planning meeting regarding the deadline for the Q2 feature release. Multiple team members disputed the scope and timeline agreed upon in the previous meeting.',
    preferredOutcome: 'A clear, written agreement on project deadlines and roles.',
    responses: [
      {
        date: '11-08-2026',
        conflictType: 'Policy Violation',
        securityLevel: 'Low',
        assignPersonnel: ['HR Manager', 'Team Lead'],
        preferredActions: ['Mediation Session', 'Policy Review'],
        preferredDateOfMeeting: '15-08-2026; 10:00 AM',
        resolutionStrategy: 'Negotiation',
        remarks: 'Initial review complete. Scheduling a mediation session with both parties.',
      },
    ],
  },
  {
    ticketId: 'REQ-2024052909',
    conflictDescription: 'Miscommunication about Project Deadline and overtime compensation policy',
    employeesInvolved: [
      { id: 'T881357', name: 'Md. Arifur Islam' },
      { id: 'T881358', name: 'Annanab Zaman' },
    ],
    natureOfConflict: 'Tax Related',
    reportedBy: { id: 'T881357', name: 'Md. Arifur Islam' },
    securityLevel: 'Medium',
    requestDate: '29-05-2026; 10:25 PM',
    ticketStatus: 'Ongoing',
    currentStage: 'Explanation Review',
    deadline: '20-06-2026',
    name: 'Md. Arifur Islam', employeeId: 'T881357', phoneNumber: '01812345679',
    department: 'Finance', dateOfIncident: '27-05-2026', timeOfIncident: '16:00',
    location: 'Finance Department', witness: 'Dept. Head',
    descriptionOfIncident: 'Dispute regarding tax deduction calculations for overtime pay. Employee believes deductions are incorrect for the fiscal quarter.',
    preferredOutcome: 'Correction of tax deductions and issuance of revised payslip.',
    responses: [],
  },
  {
    ticketId: 'REQ-2024052910',
    conflictDescription: 'Miscommunication about Project Deadline resulting in interpersonal tension',
    employeesInvolved: [
      { id: 'T881356', name: 'Ashraful Islam' },
      { id: 'T881357', name: 'Md. Arifur Islam' },
    ],
    natureOfConflict: 'Interpersonal',
    reportedBy: { id: 'T881358', name: 'Annanab Zaman' },
    securityLevel: 'High',
    requestDate: '29-05-2026; 10:25 PM',
    ticketStatus: 'Ongoing',
    currentStage: 'Investigation',
    deadline: '10-06-2026',
    name: 'Ashraful Islam', employeeId: 'T881356', phoneNumber: '01712345678',
    department: 'Engineering', dateOfIncident: '26-05-2026', timeOfIncident: '11:15',
    location: 'Open Workspace Area', witness: 'Rabiul Karim',
    descriptionOfIncident: 'Ongoing tension and verbal disagreements between two senior engineers, affecting team morale and productivity during critical project phase.',
    preferredOutcome: 'Formal counselling and workload redistribution.',
    responses: [
      {
        date: '10-08-2024',
        conflictType: 'Interpersonal',
        securityLevel: 'High',
        assignPersonnel: ['Senior HR Manager', 'Department Head'],
        preferredActions: ['Counselling', 'Team Reassignment'],
        preferredDateOfMeeting: '12-08-2024; 02:00 PM',
        resolutionStrategy: 'Mediation',
        remarks: 'Situation is escalating. Immediate mediation scheduled.',
      },
      {
        date: '11-08-2024',
        conflictType: 'Interpersonal',
        securityLevel: 'Medium',
        assignPersonnel: ['Senior HR Manager'],
        preferredActions: ['Follow-up Meeting'],
        preferredDateOfMeeting: '18-08-2024; 10:00 AM',
        resolutionStrategy: 'Negotiation',
        remarks: 'Post-mediation follow-up. Both parties agreed to terms. Monitor progress.',
      },
    ],
  },
  {
    ticketId: 'REQ-2024052911',
    conflictDescription: 'Miscommunication about Project Deadline and non-compliance with HR policy',
    employeesInvolved: [
      { id: 'T881357', name: 'Md. Arifur Islam' },
      { id: 'T881358', name: 'Annanab Zaman' },
    ],
    natureOfConflict: 'Policy Related',
    reportedBy: { id: 'T881360', name: 'Ishraq Ahmed' },
    securityLevel: 'High',
    requestDate: '29-05-2026; 10:25 PM',
    ticketStatus: 'Closed',
    lastResolutionDate: '30-05-2026; 10:25 PM',
    currentStage: 'Conclusion',
    deadline: '30-05-2026',
    name: 'Md. Arifur Islam', employeeId: 'T881357', phoneNumber: '01812345679',
    department: 'Operations', dateOfIncident: '25-05-2026', timeOfIncident: '09:00',
    location: 'Meeting Room A', witness: 'None',
    descriptionOfIncident: 'Employee failed to follow mandatory HR policy during a team decision-making process, leading to a formal complaint by a colleague.',
    preferredOutcome: 'Written acknowledgement and policy compliance training.',
    responses: [
      {
        date: '30-05-2026',
        conflictType: 'Policy Violation',
        securityLevel: 'High',
        assignPersonnel: ['HR Director', 'Compliance Officer'],
        preferredActions: ['Policy Training', 'Written Warning'],
        preferredDateOfMeeting: '30-05-2026; 09:00 AM',
        resolutionStrategy: 'Arbitration',
        remarks: 'Issue resolved. Written warning issued and compliance training scheduled.',
      },
    ],
  },
];

// ── Colour maps ────────────────────────────────────────────────────────────────
const STATUS_CFG: Record<TicketStatus, { bg: string; text: string; dot: string }> = {
  Ongoing: { bg: 'var(--color-status-info-bg)', text: '#2563eb', dot: '#3b82f6' },
  Closed:  { bg: 'var(--color-bg-subtle)', text: 'var(--color-text-tertiary)', dot: 'var(--color-text-disabled)' },
  Reopen:  { bg: 'rgba(249, 115, 22, 0.10)', text: '#c2410c', dot: '#f97316' },
};

const STAGE_CFG: Record<InvestigationStage, { bg: string; text: string; dot: string }> = {
  'Show Cause':         { bg: 'rgba(249, 115, 22, 0.10)', text: '#c2410c', dot: '#f97316' },
  'Explanation Review': { bg: 'var(--color-status-info-bg)', text: '#1d4ed8', dot: '#3b82f6' },
  'Committee Formation': { bg: 'var(--color-status-info-bg)', text: '#4338ca', dot: '#6366f1' },
  'Investigation':      { bg: 'rgba(6, 182, 212, 0.10)', text: '#0e7490', dot: '#06b6d4' },
  'Verdict':            { bg: 'rgba(124, 58, 237, 0.09)', text: '#6d28d9', dot: '#8b5cf6' },
  'Report':             { bg: 'var(--color-bg-subtle)', text: 'var(--color-text-secondary)', dot: 'var(--color-text-tertiary)' },
  'Summary':            { bg: 'var(--color-status-pending-bg)', text: '#a16207', dot: '#eab308' },
  'Hearing':            { bg: 'var(--color-status-info-bg)', text: '#2952C8', dot: '#3B6EEA' },
  'Authority Review':   { bg: 'var(--color-status-rejected-bg)', text: '#b91c1c', dot: '#ef4444' },
  'Conclusion':         { bg: 'var(--color-status-approved-bg)', text: '#166534', dot: '#22c55e' },
  'Re-evaluation':      { bg: 'rgba(249, 115, 22, 0.10)', text: '#9a3412', dot: '#fb923c' },
};

const SEC_CFG: Record<SecurityLevel, { bg: string; text: string; border: string }> = {
  Low:    { bg: 'var(--color-status-approved-bg)', text: '#15803d', border: 'var(--color-status-approved-bg)' },
  Medium: { bg: 'var(--color-status-pending-bg)', text: '#d97706', border: 'rgba(253, 230, 138, 0.4)' },
  High:   { bg: 'var(--color-status-rejected-bg)', text: '#dc2626', border: 'var(--color-status-rejected-bg)' },
};

const NATURE_COLOR: Record<NatureOfConflict, string> = {
  'Policy Related':       '#7c3aed',
  'Tax Related':          '#0369a1',
  'Interpersonal':        'var(--color-primary)',
  'Workplace Harassment': '#dc2626',
  'Other':                'var(--color-text-tertiary)',
};

// ── Small display components ───────────────────────────────────────────────────
function StatusBadge({ status }: { status: TicketStatus }) {
  const c = STATUS_CFG[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 10px', borderRadius: 20,
      background: c.bg, color: c.text, fontWeight: 700, fontSize: 11, letterSpacing: '0.04em',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {status.toUpperCase()}
    </span>
  );
}

function StageBadge({ stage }: { stage: InvestigationStage }) {
  const c = STAGE_CFG[stage];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 10px', borderRadius: 20,
      background: c.bg, color: c.text, fontWeight: 700, fontSize: 11, letterSpacing: '0.04em',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {stage}
    </span>
  );
}

function SecurityBadge({ level }: { level: SecurityLevel }) {
  const c = SEC_CFG[level];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 6, border: `1px solid ${c.border}`,
      background: c.bg, color: c.text, fontWeight: 600, fontSize: 11,
    }}>
      <LockOutlined style={{ fontSize: 10 }} /> {level}
    </span>
  );
}

function NatureBadge({ nature }: { nature: NatureOfConflict }) {
  const color = NATURE_COLOR[nature];
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 6,
      background: `${color}14`, color, fontWeight: 600, fontSize: 11,
      border: `1px solid ${color}30`,
    }}>
      {nature}
    </span>
  );
}

function EmployeeCell({ employees }: { employees: Employee[] }) {
  const shown = employees.slice(0, 2);
  const extra = employees.length - 2;
  return (
    <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
      {shown.map((e, i) => (
        <span key={e.id}>
          {i > 0 && <span style={{ color: 'var(--color-text-disabled)' }}>; </span>}
          <Tooltip title={e.name}><span style={{ cursor: 'default' }}>{e.id} ({e.name})</span></Tooltip>
        </span>
      ))}
      {extra > 0 && (
        <Tooltip title={employees.slice(2).map(e => `${e.id} (${e.name})`).join(', ')}>
          <span style={{ color: 'var(--color-primary)', fontWeight: 600, marginLeft: 4, cursor: 'pointer' }}>
            &amp; {extra} More
          </span>
        </Tooltip>
      )}
    </span>
  );
}

// ── Section label ──────────────────────────────────────────────────────────────
function SectionLabel({ children, color = '#1e3a5f' }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{
      padding: '6px 14px', background: color === 'hr' ? 'var(--color-status-info-bg)' : 'var(--color-primary-tint)',
      borderLeft: `3px solid ${color === 'hr' ? '#0ea5e9' : 'var(--color-primary)'}`,
      fontWeight: 700, fontSize: 12, color: color === 'hr' ? '#0369a1' : 'var(--color-primary-dark)',
      letterSpacing: '0.02em', borderRadius: '0 6px 6px 0', marginBottom: 14,
    }}>
      {children}
    </div>
  );
}

// ── Read-only field ────────────────────────────────────────────────────────────
function ReadField({ label, value }: { label: string; value?: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-tertiary)', marginBottom: 2, letterSpacing: '0.03em' }}>
        {label.toUpperCase()}
      </div>
      <div style={{
        fontSize: 13, color: value ? 'var(--color-text-primary)' : 'var(--color-border)',
        padding: '6px 10px', background: 'var(--color-bg-subtle)',
        border: '1px solid var(--color-border)', borderRadius: 8, minHeight: 34,
      }}>
        {value || '—'}
      </div>
    </div>
  );
}

// ── History panel ──────────────────────────────────────────────────────────────
// ── Activity Timeline ──────────────────────────────────────────────────────────
type TLEventType = 'complaint' | 'stage' | 'action' | 'document' | 'comment' | 'status' | 'system' | 'decision';

interface TLEvent {
  id: string;
  type: TLEventType;
  title: string;
  description?: string;
  actor: string;
  actorRole?: string;
  timestamp: string;
  tag?: string;
  details?: { label: string; value: string }[];
}

const TL_TYPE_META: Record<TLEventType, { color: string; bg: string; border: string; icon: ReactNode }> = {
  complaint: { color: '#dc2626', bg: 'var(--color-status-rejected-bg)', border: 'var(--color-status-rejected-bg)',  icon: <ExclamationCircleOutlined /> },
  stage:     { color: '#3B6EEA', bg: 'var(--color-status-info-bg)', border: '#c7d7fa',  icon: <AuditOutlined /> },
  action:    { color: '#d97706', bg: 'var(--color-status-pending-bg)', border: 'rgba(253, 230, 138, 0.4)',  icon: <CheckSquareOutlined /> },
  document:  { color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.09)', border: 'rgba(124, 58, 237, 0.22)',  icon: <FileOutlined /> },
  comment:   { color: 'var(--color-text-secondary)', bg: 'var(--color-bg-subtle)', border: 'var(--color-border)',  icon: <CommentOutlined /> },
  status:    { color: '#059669', bg: 'var(--color-status-approved-bg)', border: 'var(--color-status-approved-bg)',  icon: <InfoCircleOutlined /> },
  system:    { color: 'var(--color-text-tertiary)', bg: 'var(--color-bg-subtle)', border: 'var(--color-border)',  icon: <ClockCircleOutlined /> },
  decision:  { color: '#0891b2', bg: 'rgba(6, 182, 212, 0.10)', border: 'rgba(6, 182, 212, 0.22)',  icon: <SafetyOutlined /> },
};

function buildTimeline(ticket: ComplianceTicket): TLEvent[] {
  return [
    {
      id: 't1', type: 'system', timestamp: ticket.requestDate + ' 09:00',
      title: 'Ticket Created', actor: 'System',
      description: `Compliance ticket ${ticket.ticketId} was automatically created upon submission.`,
    },
    {
      id: 't2', type: 'complaint', timestamp: ticket.requestDate + ' 09:02',
      title: 'Complaint Submitted', actor: ticket.name, actorRole: 'Employee',
      tag: ticket.natureOfConflict,
      description: ticket.descriptionOfIncident,
      details: [
        { label: 'Department', value: ticket.department },
        { label: 'Location',   value: ticket.location },
        { label: 'Witness',    value: ticket.witness },
      ],
    },
    {
      id: 't3', type: 'status', timestamp: ticket.requestDate + ' 10:15',
      title: 'Status: Ongoing', actor: 'HR System', actorRole: 'System',
      description: 'Ticket moved to ongoing and assigned to HR POC for initial assessment.',
    },
    ...(ticket.responses.length > 0 ? ticket.responses.map((r, i) => ({
      id: `r${i}`, type: 'action' as TLEventType, timestamp: r.date + ' 11:00',
      title: 'HR Response Recorded', actor: r.assignPersonnel[0] ?? 'HR Personnel', actorRole: 'HR POC',
      tag: r.conflictType,
      details: [
        { label: 'Resolution Strategy',  value: r.resolutionStrategy },
        { label: 'Preferred Actions',     value: r.preferredActions.join(', ') },
        { label: 'Preferred Meeting',     value: r.preferredDateOfMeeting },
        { label: 'Remarks',              value: r.remarks },
      ],
    })) : []),
    {
      id: 't4', type: 'stage', timestamp: ticket.requestDate + ' 14:00',
      title: 'Stage: Show Cause Initiated', actor: 'HR Manager', actorRole: 'HR POC',
      description: 'Show Cause letter drafted and issued to involved employees.',
      tag: 'Show Cause',
    },
    {
      id: 't5', type: 'document', timestamp: ticket.requestDate + ' 14:30',
      title: 'Show Cause Letter Issued', actor: 'HR Manager', actorRole: 'HR POC',
      description: 'Formal Show Cause letter sent to employees. 7-day response window granted.',
    },
    {
      id: 't6', type: 'stage', timestamp: ticket.requestDate + ' 16:00',
      title: 'Stage: Explanation Received', actor: 'HR System', actorRole: 'System',
      description: 'Employee explanation submitted and recorded for review.',
      tag: 'Explanation',
    },
    {
      id: 't7', type: 'action', timestamp: ticket.requestDate + ' 16:45',
      title: 'Explanation Reviewed', actor: 'HR Manager', actorRole: 'HR POC',
      description: 'Explanation reviewed. Decision made to escalate to formal investigation committee.',
    },
    {
      id: 't8', type: 'stage', timestamp: ticket.requestDate + ' 17:00',
      title: 'Stage: Committee Formed', actor: 'HR Director', actorRole: 'HR Director',
      tag: 'Committee',
      details: [
        { label: 'Committee Type', value: 'Formal Investigation' },
        { label: 'Members',        value: '3 appointed' },
        { label: 'Chair',          value: 'Senior HR Officer' },
      ],
    },
    {
      id: 't9', type: 'status', timestamp: ticket.deadline + ' 09:00',
      title: 'Status: Reopen', actor: 'HR System', actorRole: 'System',
      description: 'Case reopened for full investigation. Committee hearings scheduled.',
    },
    {
      id: 't10', type: 'stage', timestamp: ticket.deadline + ' 10:00',
      title: 'Stage: Investigation Active', actor: 'Committee Chair', actorRole: 'Committee',
      tag: 'Investigation',
      description: 'Investigation commenced. Tasks assigned, evidence collection underway.',
    },
    {
      id: 't11', type: 'document', timestamp: ticket.deadline + ' 13:00',
      title: 'Evidence Uploaded', actor: 'Investigator', actorRole: 'Committee Member',
      description: '3 evidence documents submitted to the investigation record.',
    },
    {
      id: 't12', type: 'comment', timestamp: ticket.deadline + ' 15:30',
      title: 'Q&A Session Conducted', actor: 'Committee Chair', actorRole: 'Committee',
      description: 'Witness statements recorded. All parties interviewed.',
    },
    {
      id: 't13', type: 'stage', timestamp: ticket.deadline + ' 16:00',
      title: 'Stage: Verdict Submitted', actor: 'Committee', actorRole: 'Committee',
      tag: 'Verdict',
      description: 'All committee members submitted individual findings and recommendations.',
    },
    {
      id: 't14', type: 'document', timestamp: ticket.deadline + ' 17:00',
      title: 'Investigation Report Filed', actor: 'Committee Chair', actorRole: 'Committee',
      description: 'Final investigation report compiled, reviewed and submitted.',
      tag: 'Report',
    },
    {
      id: 't15', type: 'stage', timestamp: ticket.deadline + ' 17:30',
      title: 'Stage: Summary Prepared', actor: 'HR Manager', actorRole: 'HR POC',
      tag: 'Summary',
      description: 'Executive summary, key findings and suggested actions documented per employee.',
    },
    {
      id: 't16', type: 'decision', timestamp: ticket.deadline + ' 18:00',
      title: 'Authority Review: Approved', actor: 'HR Director', actorRole: 'Authority',
      description: 'Reviewing authority approved findings with no objection. Proceeding to conclusion.',
      tag: 'No Objection',
    },
  ];
}

function ActivityTimeline({ ticket }: { ticket: ComplianceTicket }) {
  const [filter, setFilter]       = useState<TLEventType | 'all'>('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['t2']));

  const allEvents = useMemo(() => buildTimeline(ticket), [ticket]);
  const events    = filter === 'all' ? allEvents : allEvents.filter(e => e.type === filter);

  const toggleExpand = (id: string) =>
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const filterTypes: { key: TLEventType | 'all'; label: string }[] = [
    { key: 'all',      label: 'All' },
    { key: 'stage',    label: 'Stages' },
    { key: 'action',   label: 'Actions' },
    { key: 'document', label: 'Docs' },
    { key: 'comment',  label: 'Comments' },
    { key: 'decision', label: 'Decisions' },
  ];

  return (
    <div>
      {/* Filter pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 16 }}>
        {filterTypes.map(f => (
          <div
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              fontSize: 11, fontWeight: 600, padding: '3px 10px',
              borderRadius: 20, cursor: 'pointer', transition: 'all 0.15s',
              border: `1px solid ${filter === f.key ? '#3B6EEA' : 'var(--color-border)'}`,
              background: filter === f.key ? 'var(--color-status-info-bg)' : 'var(--color-bg-surface)',
              color: filter === f.key ? '#2952C8' : 'var(--color-text-tertiary)',
            }}
          >
            {f.label}
          </div>
        ))}
      </div>

      {/* Count */}
      <div style={{ fontSize: 11, color: 'var(--color-text-disabled)', marginBottom: 14, fontWeight: 500 }}>
        {events.length} event{events.length !== 1 ? 's' : ''}
      </div>

      {/* Timeline */}
      <div style={{ position: 'relative', paddingLeft: 28 }}>
        {/* Vertical line */}
        <div style={{
          position: 'absolute', left: 10, top: 0, bottom: 0,
          width: 2, background: 'var(--color-bg-subtle)', borderRadius: 2,
        }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {events.map((event, idx) => {
            const meta     = TL_TYPE_META[event.type];
            const expanded = expandedIds.has(event.id);
            const isLast   = idx === events.length - 1;
            const hasExtra = !!(event.description || event.details?.length);

            return (
              <div key={event.id} style={{ position: 'relative', paddingBottom: isLast ? 0 : 18 }}>
                {/* Dot */}
                <div style={{
                  position: 'absolute', left: -28, top: 0,
                  width: 22, height: 22, borderRadius: '50%',
                  background: meta.bg, border: `2px solid ${meta.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: meta.color, fontSize: 10, zIndex: 1,
                }}>
                  {meta.icon}
                </div>

                {/* Card */}
                <div style={{
                  background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)',
                  borderRadius: 9, overflow: 'hidden',
                  transition: 'box-shadow 0.15s',
                }}>
                  {/* Header row */}
                  <div
                    onClick={() => hasExtra && toggleExpand(event.id)}
                    style={{
                      padding: '9px 11px',
                      cursor: hasExtra ? 'pointer' : 'default',
                      display: 'flex', flexDirection: 'column', gap: 3,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.3, flex: 1 }}>
                        {event.title}
                      </span>
                      {hasExtra && (
                        <span style={{
                          fontSize: 9, color: 'var(--color-text-disabled)',
                          transform: expanded ? 'rotate(180deg)' : 'rotate(0)',
                          transition: 'transform 0.2s', flexShrink: 0,
                        }}>▼</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      {/* Actor badge */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{
                          width: 16, height: 16, borderRadius: '50%',
                          background: meta.bg, border: `1px solid ${meta.border}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 8, fontWeight: 800, color: meta.color, flexShrink: 0,
                        }}>
                          {event.actor.charAt(0)}
                        </div>
                        <span style={{ fontSize: 10, color: 'var(--color-text-tertiary)', fontWeight: 500 }}>{event.actor}</span>
                      </div>

                      {event.actorRole && (
                        <span style={{ fontSize: 10, color: 'var(--color-text-disabled)' }}>· {event.actorRole}</span>
                      )}

                      {/* Tag */}
                      {event.tag && (
                        <span style={{
                          fontSize: 10, fontWeight: 600,
                          color: meta.color, background: meta.bg,
                          border: `1px solid ${meta.border}`,
                          borderRadius: 20, padding: '0 6px',
                        }}>
                          {event.tag}
                        </span>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div style={{ fontSize: 10, color: 'var(--color-text-disabled)', marginTop: 1 }}>
                      <ClockCircleOutlined style={{ marginRight: 3, fontSize: 9 }} />
                      {event.timestamp}
                    </div>
                  </div>

                  {/* Expanded body */}
                  {expanded && hasExtra && (
                    <div style={{
                      borderTop: '1px solid var(--color-border)',
                      padding: '10px 11px',
                      background: 'var(--color-bg-subtle)',
                    }}>
                      {event.description && (
                        <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: '0 0 8px' }}>
                          {event.description}
                        </p>
                      )}
                      {event.details && event.details.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                          {event.details.map(d => (
                            <div key={d.label} style={{ display: 'flex', gap: 6, fontSize: 11 }}>
                              <span style={{ color: 'var(--color-text-disabled)', fontWeight: 600, minWidth: 90, flexShrink: 0 }}>{d.label}</span>
                              <span style={{ color: 'var(--color-text-secondary)' }}>{d.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Attachment Upload with preview ────────────────────────────────────────────
const ATTACHMENT_TYPE_OPTIONS = [
  { value: 'Evidence (Email)',               label: 'Evidence (Email)'               },
  { value: 'Evidence (Documents)',           label: 'Evidence (Documents)'           },
  { value: 'Evidence (Screenshots/Socials)', label: 'Evidence (Screenshots/Socials)' },
  { value: 'Statement',                      label: 'Statement'                      },
  { value: 'Questionaries',                  label: 'Questionaries'                  },
  { value: 'Report',                         label: 'Report'                         },
  { value: 'Summary',                        label: 'Summary'                        },
  { value: 'Committee',                      label: 'Committee'                      },
];

const FileRow = memo(function FileRow({
  file,
  onRemove,
  onView,
}: {
  file: UploadFile;
  onRemove: (uid: string) => void;
  onView: (file: UploadFile) => void;
}) {
  const [attachmentType, setAttachmentType] = useState<string | undefined>();
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)',
        borderRadius: 7, padding: '5px 10px', fontSize: 12, color: 'var(--color-text-secondary)',
      }}
    >
      <FileOutlined style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
        {file.name}
      </span>
      <span style={{ fontSize: 11, color: 'var(--color-text-disabled)', flexShrink: 0 }}>
        {file.size ? `${(file.size / 1024).toFixed(1)} KB` : ''}
      </span>
      <select
        value={attachmentType ?? ''}
        onChange={e => setAttachmentType(e.target.value || undefined)}
        style={{
          width: 190, flexShrink: 0,
          height: 24, fontSize: 11,
          border: '1px solid #d9d9d9', borderRadius: 6,
          padding: '0 6px', background: 'var(--color-bg-surface)',
          color: attachmentType ? 'var(--color-text-secondary)' : 'var(--color-text-disabled)',
          cursor: 'pointer', outline: 'none',
        }}
      >
        <option value="" disabled>Type</option>
        {ATTACHMENT_TYPE_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <Tooltip title="View">
        <Button
          type="text" size="small" icon={<EyeOutlined />}
          onClick={() => onView(file)}
          style={{ color: 'var(--color-primary)', padding: '0 4px', height: 22, flexShrink: 0 }}
        />
      </Tooltip>
      <Tooltip title="Remove">
        <Button
          type="text" size="small" icon={<DeleteOutlined />}
          onClick={() => onRemove(file.uid)}
          style={{ color: '#ef4444', padding: '0 4px', height: 22, flexShrink: 0 }}
        />
      </Tooltip>
    </div>
  );
});

function AttachmentUpload({
  value,
  onChange,
  maxCount = 10,
  buttonSize,
}: {
  value?: UploadFile[];
  onChange?: (files: UploadFile[]) => void;
  maxCount?: number;
  buttonSize?: 'small' | 'middle' | 'large';
}) {
  const [viewingFile, setViewingFile] = useState<UploadFile | null>(null);

  const handleRemove = useCallback(
    (uid: string) => onChange?.((value ?? []).filter(f => f.uid !== uid)),
    [value, onChange],
  );
  const handleView = useCallback((file: UploadFile) => setViewingFile(file), []);

  function handleBeforeUpload(file: File) {
    const newFile: UploadFile = {
      uid:           `${file.name}-${Date.now()}`,
      name:          file.name,
      status:        'done',
      size:          file.size,
      type:          file.type,
      originFileObj: file as UploadFile['originFileObj'],
    };
    onChange?.([...(value ?? []), newFile]);
    return false;
  }

  const files = value ?? [];
  const canAdd = files.length < maxCount;

  return (
    <>
      <Upload beforeUpload={handleBeforeUpload} showUploadList={false} multiple={maxCount > 1}>
        <Button icon={<UploadOutlined />} size={buttonSize} disabled={!canAdd}>
          Attach Files
        </Button>
      </Upload>

      {files.length > 0 && (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {files.map(file => (
            <FileRow
              key={file.uid}
              file={file}
              onRemove={handleRemove}
              onView={handleView}
            />
          ))}
        </div>
      )}

      <Modal
        open={!!viewingFile}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileOutlined style={{ color: 'var(--color-primary)' }} />
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text-primary)' }}>{viewingFile?.name}</span>
          </div>
        }
        footer={null}
        onCancel={() => setViewingFile(null)}
        centered
        width={760}
      >
        {viewingFile && (() => {
          const origin = viewingFile.originFileObj;
          const safeFile = origin instanceof File ? origin : undefined;
          const url    = safeFile ? URL.createObjectURL(safeFile) : undefined;
          const isImage = viewingFile.type?.startsWith('image/');
          const isPdf   = viewingFile.type === 'application/pdf';

          if (!url) return <div style={{ textAlign: 'center', color: 'var(--color-text-disabled)', padding: '40px 0' }}>Preview not available.</div>;
          if (isImage) return <img src={url} alt={viewingFile.name} style={{ width: '100%', borderRadius: 8 }} />;
          if (isPdf) return <iframe src={url} title={viewingFile.name} style={{ width: '100%', height: 500, border: 'none', borderRadius: 8 }} />;
          return (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <FileOutlined style={{ fontSize: 48, color: 'var(--color-primary)', display: 'block', marginBottom: 12 }} />
              <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 16 }}>{viewingFile.name}</div>
              <Button type="primary" href={url} target="_blank" rel="noopener noreferrer">Open File</Button>
            </div>
          );
        })()}
      </Modal>
    </>
  );
}

// ── Investigate Drawer ─────────────────────────────────────────────────────────
const INVESTIGATE_STAGES = [
  { key: 'show-cause',    label: 'Show Cause',          shortLabel: 'Show Cause' },
  { key: 'explanation',   label: 'Explanation Review',  shortLabel: 'Explanation' },
  { key: 'committee',     label: 'Committee Formation', shortLabel: 'Committee' },
  { key: 'investigation', label: 'Investigation',       shortLabel: 'Investigation' },
  { key: 'verdict',       label: 'Verdict',             shortLabel: 'Verdict' },
  { key: 'report',        label: 'Report',              shortLabel: 'Report' },
  { key: 'summary',       label: 'Summary',             shortLabel: 'Summary' },
  { key: 'hearing',       label: 'Hearing',             shortLabel: 'Hearing' },
  { key: 'authority',     label: 'Authority Review',    shortLabel: 'Authority Review' },
  { key: 'conclusion',    label: 'Conclusion',          shortLabel: 'Conclusion' },
  { key: 're-evaluation', label: 'Re-evaluation',       shortLabel: 'Re-evaluation' },
];

interface SentLetter { id: string; type: string; sentDate: string; deadline: string }

function ShowCausePanel({ ticket }: { ticket: ComplianceTicket }) {
  const defaultLetter =
    `Dear ${ticket.name},\n\nThis is to inform you that a formal complaint (${ticket.ticketId}) has been filed against you regarding "${ticket.conflictDescription}".\n\nYou are hereby directed to submit your written explanation within 7 days of receiving this letter.\n\nRegards,\nHR Department`;

  const [letterContent, setLetterContent] = useState(defaultLetter);
  const [deadline, setDeadline] = useState<Parameters<typeof DatePicker>[0]['value']>(null);
  const [selectedPerson, setSelectedPerson] = useState<string | undefined>(undefined);
  const [sentLetters] = useState<SentLetter[]>([
    { id: '1', type: 'Letter Sent', sentDate: 'Feb 2, 2026', deadline: 'Feb 9, 2026' },
  ]);

  return (
    <div>
      <div style={{ border: '1px solid var(--color-border)', borderRadius: 10, padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text-primary)' }}>Show Cause Letter</span>
          <Select
            placeholder="Select Person"
            style={{ width: 220 }}
            value={selectedPerson}
            onChange={setSelectedPerson}
            options={ticket.employeesInvolved.map(e => ({ label: `${e.name} (${e.id})`, value: e.id }))}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-tertiary)', marginBottom: 6, letterSpacing: '0.03em' }}>LETTER CONTENT</div>
          <Input.TextArea
            rows={8}
            value={letterContent}
            onChange={e => setLetterContent(e.target.value)}
            style={{ fontSize: 13, resize: 'vertical' }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-tertiary)', marginBottom: 6, letterSpacing: '0.03em' }}>RESPONSE DEADLINE</div>
          <DatePicker style={{ width: 200 }} value={deadline} onChange={setDeadline} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Button size="small">Save Draft</Button>
            <Button size="small" icon={<EyeOutlined />}>Preview</Button>
            <Button size="small" icon={<DownloadOutlined />}>Download PDF</Button>
          </Space>
          <Space>
            <Button size="small">Generate Show Cause Letter</Button>
            <Button size="small" type="primary">Generate &amp; Send</Button>
          </Space>
        </div>
      </div>

      <div>
        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text-primary)', marginBottom: 10 }}>Letter History</div>
        {sentLetters.map(letter => (
          <div key={letter.id} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 8,
            background: 'var(--color-bg-subtle)', marginBottom: 8,
          }}>
            <div>
              <div style={{ marginBottom: 4 }}>
                <span style={{ background: '#15803d', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>
                  {letter.type}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>Sent on {letter.sentDate}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>Deadline: {letter.deadline}</div>
            </div>
            <Button type="primary" size="small">View</Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExplanationPanel({ ticket }: { ticket: ComplianceTicket }) {
  type RoundStatus = 'awaiting' | 'received' | 'rejected' | 'satisfactory';
  interface ExplanationRound {
    id: number;
    sentDate: string;
    deadline: string;
    letterContent: string;
    rejectionReason?: string;
    submission?: { submittedDate: string; content: string };
    status: RoundStatus;
  }

  const mkLetter = (empName: string, roundNum: number) =>
    `Dear ${empName},\n\nThis is to inform you that a formal complaint (${ticket.ticketId}) has been filed against you regarding "${ticket.conflictDescription}".\n\n${roundNum > 1 ? `Your previous explanation (Round ${roundNum - 1}) was found insufficient. You are hereby requested to provide a more detailed written explanation addressing the specific points raised.\n\n` : ''}You are directed to submit your written explanation within 7 days of receiving this letter. Your response should address the allegations and provide any supporting evidence.\n\nFailure to respond within the deadline will result in the matter being decided based on available information.\n\nRegards,\nHR Department`;

  const ROUND_STATUS_CFG: Record<RoundStatus, { label: string; bg: string; color: string; border: string }> = {
    awaiting:     { label: 'Awaiting',     bg: 'var(--color-status-pending-bg)', color: '#d97706', border: 'rgba(253, 230, 138, 0.4)' },
    received:     { label: 'Received',     bg: 'var(--color-status-info-bg)', color: '#1d4ed8', border: 'rgba(59, 130, 246, 0.22)' },
    rejected:     { label: 'Rejected',     bg: 'rgba(249, 115, 22, 0.10)', color: '#c2410c', border: 'rgba(251, 146, 60, 0.22)' },
    satisfactory: { label: 'Satisfactory', bg: 'var(--color-status-approved-bg)', color: 'var(--color-status-approved)', border: 'var(--color-status-approved-bg)' },
  };

  /* ── initial mock data — one entry per employee ── */
  const buildInitialRounds = (): Record<string, ExplanationRound[]> => {
    const map: Record<string, ExplanationRound[]> = {};
    ticket.employeesInvolved.forEach((e, idx) => {
      if (idx === 0) {
        map[e.id] = [
          {
            id: 1, sentDate: 'Feb 2, 2026', deadline: 'Feb 9, 2026',
            letterContent: mkLetter(e.name, 1),
            rejectionReason: 'The explanation lacks specific details about the incident timeline and the employee\'s direct role in the miscommunication.',
            submission: {
              submittedDate: 'Feb 7, 2026',
              content: `I acknowledge the complaint filed regarding ${ticket.ticketId}. The situation arose due to unclear project scope and conflicting directives from multiple managers.\n\nI take responsibility for not escalating the ambiguity sooner and acknowledge that this contributed to the issue.`,
            },
            status: 'rejected',
          },
          {
            id: 2, sentDate: 'Feb 10, 2026', deadline: 'Feb 17, 2026',
            letterContent: mkLetter(e.name, 2),
            submission: {
              submittedDate: 'Feb 14, 2026',
              content: `Following the review of my initial response, I would like to provide additional context.\n\nOn the specific day in question, I received two contradictory instructions — one from my direct supervisor and another from the project lead. Rather than escalating this immediately, I attempted to resolve it independently, which led to the miscommunication reported.\n\nI have since implemented a practice of documenting all directives in writing and confirming before acting. I am fully committed to compliance and request a formal meeting to resolve this matter.`,
            },
            status: 'received',
          },
        ];
      } else if (idx === 1) {
        map[e.id] = [
          {
            id: 1, sentDate: 'Feb 2, 2026', deadline: 'Feb 9, 2026',
            letterContent: mkLetter(e.name, 1),
            submission: {
              submittedDate: 'Feb 6, 2026',
              content: `I fully acknowledge my role in the incident and take complete responsibility for the miscommunication. I understand the gravity of the complaint and have already taken corrective steps within my team.\n\nI hereby commit to stricter adherence to all communication protocols going forward and welcome any structured resolution process initiated by HR.`,
            },
            status: 'satisfactory',
          },
        ];
      } else {
        map[e.id] = [
          {
            id: 1, sentDate: 'Feb 2, 2026', deadline: 'Feb 9, 2026',
            letterContent: mkLetter(e.name, 1),
            status: 'awaiting',
          },
        ];
      }
    });
    return map;
  };

  const [activeEmpId,   setActiveEmpId]   = useState(ticket.employeesInvolved[0]?.id ?? '');
  const [empRounds,     setEmpRounds]     = useState<Record<string, ExplanationRound[]>>(buildInitialRounds);
  const [openLetters,   setOpenLetters]   = useState<Record<string, Set<number>>>({});
  const [resendEmpId,   setResendEmpId]   = useState<string | null>(null);
  const [resendContent, setResendContent] = useState('');
  const [resendDeadline,setResendDeadline]= useState<Parameters<typeof DatePicker>[0]['value']>(null);
  const [resendReason,  setResendReason]  = useState('');

  const activeRounds   = empRounds[activeEmpId] ?? [];
  const latestRound    = activeRounds[activeRounds.length - 1];
  const activeEmp      = ticket.employeesInvolved.find(e => e.id === activeEmpId);

  const toggleLetter = (empId: string, roundId: number) =>
    setOpenLetters(prev => {
      const s = new Set(prev[empId] ?? []);
      s.has(roundId) ? s.delete(roundId) : s.add(roundId);
      return { ...prev, [empId]: s };
    });

  const isLetterOpen = (empId: string, roundId: number) => openLetters[empId]?.has(roundId) ?? false;

  const openResendForm = () => {
    setResendContent(mkLetter(activeEmp?.name ?? '', activeRounds.length + 1));
    setResendReason('');
    setResendDeadline(null);
    setResendEmpId(activeEmpId);
  };

  const handleSendResend = () => {
    const newRound: ExplanationRound = {
      id: activeRounds.length + 1,
      sentDate: 'Today',
      deadline: resendDeadline ? (resendDeadline as any).format('MMM D, YYYY') : '—',
      letterContent: resendContent,
      status: 'awaiting',
    };
    setEmpRounds(prev => ({
      ...prev,
      [activeEmpId]: [
        ...prev[activeEmpId].map(r =>
          r.id === latestRound.id
            ? { ...r, status: 'rejected' as RoundStatus, rejectionReason: resendReason || 'Explanation was insufficient.' }
            : r,
        ),
        newRound,
      ],
    }));
    setResendEmpId(null);
  };

  const handleMarkSatisfactory = () =>
    setEmpRounds(prev => ({
      ...prev,
      [activeEmpId]: prev[activeEmpId].map(r =>
        r.id === latestRound.id ? { ...r, status: 'satisfactory' as RoundStatus } : r,
      ),
    }));

  const empOverallStatus = (empId: string): RoundStatus => {
    const rounds = empRounds[empId] ?? [];
    return rounds[rounds.length - 1]?.status ?? 'awaiting';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── Employee selector tabs ── */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {ticket.employeesInvolved.map(e => {
          const status   = empOverallStatus(e.id);
          const cfg      = ROUND_STATUS_CFG[status];
          const isActive = e.id === activeEmpId;
          const rounds   = empRounds[e.id] ?? [];
          const initials = e.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
          return (
            <button
              key={e.id}
              onClick={() => { setActiveEmpId(e.id); setResendEmpId(null); }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '8px 14px', borderRadius: 10, cursor: 'pointer',
                border: isActive ? '1.5px solid #3B6EEA' : '1.5px solid #e5e7eb',
                background: isActive ? 'var(--color-status-info-bg)' : 'var(--color-bg-surface)',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: isActive ? '#3B6EEA' : 'var(--color-bg-subtle)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 800, color: isActive ? '#fff' : 'var(--color-text-tertiary)',
              }}>
                {initials}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: isActive ? '#2952C8' : 'var(--color-text-secondary)', lineHeight: 1.2 }}>{e.name}</div>
                <div style={{ fontSize: 10, color: 'var(--color-text-disabled)' }}>{e.id}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 20, padding: '0 7px', whiteSpace: 'nowrap' }}>
                  {cfg.label}
                </span>
                <span style={{ fontSize: 10, color: 'var(--color-text-disabled)' }}>{rounds.length} round{rounds.length !== 1 ? 's' : ''}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Rounds for selected employee ── */}
      {activeRounds.map((round, idx) => {
        const isLast   = idx === activeRounds.length - 1;
        const cfg      = ROUND_STATUS_CFG[round.status];
        const letOpen  = isLetterOpen(activeEmpId, round.id);

        return (
          <div key={round.id}>
            {/* Round heading */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#3B6EEA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                {round.id}
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)' }}>Round {round.id}</span>
              <span style={{ fontSize: 11, color: 'var(--color-text-disabled)' }}>Sent {round.sentDate} · Deadline {round.deadline}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 20, padding: '1px 8px', marginLeft: 'auto' }}>
                {cfg.label}
              </span>
            </div>

            {/* Indented content */}
            <div style={{ marginLeft: 11, paddingLeft: 20, borderLeft: `2px solid ${isLast ? 'var(--color-border)' : '#3B6EEA30'}` }}>

              {/* Show Cause Letter — collapsible */}
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 10, overflow: 'hidden', marginBottom: 10 }}>
                <div
                  onClick={() => toggleLetter(activeEmpId, round.id)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', background: 'var(--color-bg-subtle)', cursor: 'pointer', borderBottom: letOpen ? '1px solid var(--color-border)' : 'none' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileOutlined style={{ color: '#3B6EEA', fontSize: 13 }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)' }}>Show Cause Letter</span>
                    <span style={{ fontSize: 11, color: 'var(--color-text-disabled)' }}>{round.sentDate}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Button size="small" icon={<DownloadOutlined />} style={{ fontSize: 10 }} onClick={e => e.stopPropagation()}>PDF</Button>
                    <span style={{ fontSize: 10, color: 'var(--color-text-disabled)', transform: letOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>▼</span>
                  </div>
                </div>
                {letOpen && (
                  <div style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', gap: 20, marginBottom: 10, flexWrap: 'wrap' }}>
                      {[
                        { l: 'To',       v: `${activeEmp?.name} (${activeEmp?.id})` },
                        { l: 'Sent',     v: round.sentDate },
                        { l: 'Deadline', v: round.deadline },
                      ].map(f => (
                        <div key={f.l} style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-disabled)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{f.l}</span>
                          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{f.v}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '11px 13px', fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.75, whiteSpace: 'pre-line' }}>
                      {round.letterContent}
                    </div>
                  </div>
                )}
              </div>

              {/* Rejection reason banner */}
              {round.rejectionReason && (
                <div style={{ display: 'flex', gap: 8, background: 'rgba(249, 115, 22, 0.10)', border: '1px solid #fed7aa', borderRadius: 8, padding: '8px 12px', marginBottom: 10 }}>
                  <ExclamationCircleOutlined style={{ color: '#d97706', fontSize: 13, marginTop: 1, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#c2410c', marginBottom: 2 }}>Explanation Rejected</div>
                    <div style={{ fontSize: 12, color: '#d97706', lineHeight: 1.5 }}>{round.rejectionReason}</div>
                  </div>
                </div>
              )}

              {/* Submission — received or awaiting */}
              {round.submission ? (
                <div style={{ border: `1px solid ${round.status === 'satisfactory' ? 'var(--color-status-approved-bg)' : 'var(--color-border)'}`, borderRadius: 10, overflow: 'hidden', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', background: round.status === 'satisfactory' ? 'var(--color-status-approved-bg)' : 'var(--color-bg-subtle)', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <EditOutlined style={{ color: round.status === 'satisfactory' ? '#059669' : 'var(--color-text-tertiary)', fontSize: 13 }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)' }}>Employee Explanation</span>
                      <span style={{ fontSize: 11, color: 'var(--color-text-disabled)' }}>Submitted {round.submission.submittedDate}</span>
                    </div>
                    {round.status === 'satisfactory' && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#059669', background: 'var(--color-status-approved-bg)', border: '1px solid #bbf7d0', borderRadius: 20, padding: '1px 8px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircleOutlined style={{ fontSize: 10 }} /> Satisfactory
                      </span>
                    )}
                    {round.status === 'rejected' && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#c2410c', background: 'rgba(249, 115, 22, 0.10)', border: '1px solid #fed7aa', borderRadius: 20, padding: '1px 8px' }}>
                        Rejected
                      </span>
                    )}
                  </div>
                  <div style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--color-status-info-bg)', border: '1.5px solid #c7d7fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#3B6EEA', flexShrink: 0 }}>
                        {activeEmp?.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)' }}>{activeEmp?.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--color-text-disabled)' }}>{activeEmp?.id}</div>
                      </div>
                    </div>
                    <div style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '11px 13px', fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.75, whiteSpace: 'pre-line' }}>
                      {round.submission.content}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: '1px dashed #e5e7eb', borderRadius: 10, marginBottom: 10, background: 'var(--color-bg-subtle)' }}>
                  <ClockCircleOutlined style={{ color: '#d97706', fontSize: 16, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-tertiary)' }}>Awaiting employee explanation</div>
                    <div style={{ fontSize: 11, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <WarningOutlined style={{ fontSize: 10 }} /> Overdue · Deadline was {round.deadline}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions — only on latest round if actionable */}
              {isLast && (round.status === 'received' || round.status === 'awaiting') && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 2, marginBottom: 10 }}>
                  <Button
                    icon={<SendOutlined />}
                    onClick={openResendForm}
                    style={{ borderColor: resendEmpId === activeEmpId ? '#f97316' : 'rgba(251, 146, 60, 0.22)', color: '#d97706', background: resendEmpId === activeEmpId ? 'rgba(249, 115, 22, 0.10)' : 'var(--color-bg-surface)', fontWeight: 600 }}
                  >
                    Reject &amp; Resend
                  </Button>
                  {round.status === 'received' && (
                    <Space>
                      <Button onClick={() => Modal.confirm({
                        title: 'Form Investigation Committee',
                        icon: <ExclamationCircleOutlined style={{ color: '#d97706' }} />,
                        content: 'Escalate this case to an investigation committee?',
                        okText: 'Proceed', cancelText: 'Cancel',
                      })}>
                        Form Investigation Committee
                      </Button>
                      <Button type="primary" onClick={() => Modal.confirm({
                        title: 'Mark as Satisfactory',
                        icon: <CheckCircleOutlined style={{ color: '#059669' }} />,
                        content: `Mark ${activeEmp?.name}'s explanation as satisfactory?`,
                        okText: 'Confirm',
                        okButtonProps: { style: { background: '#059669', borderColor: '#059669' } },
                        cancelText: 'Cancel',
                        onOk: handleMarkSatisfactory,
                      })}>
                        Mark as Satisfactory
                      </Button>
                    </Space>
                  )}
                </div>
              )}
            </div>

            {/* Connector to next round */}
            {!isLast && <div style={{ marginLeft: 20, height: 14, width: 2, background: '#3B6EEA30', marginBottom: 2 }} />}
          </div>
        );
      })}

      {/* ── Reject & Resend Form ── */}
      {resendEmpId === activeEmpId && (
        <div style={{ border: '1.5px solid #fed7aa', borderRadius: 10, overflow: 'hidden', background: '#fffbf7' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', background: 'rgba(249, 115, 22, 0.10)', borderBottom: '1px solid #fed7aa' }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: 'rgba(251, 146, 60, 0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c2410c', fontSize: 12 }}>
              <SendOutlined />
            </div>
            <span style={{ fontWeight: 700, fontSize: 13, color: '#c2410c' }}>Reject &amp; Resend — Round {activeRounds.length + 1}</span>
            <span style={{ fontSize: 11, color: 'var(--color-text-disabled)', marginLeft: 4 }}>Sending to {activeEmp?.name}</span>
          </div>
          <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>Reason for Rejection</div>
              <Input.TextArea rows={2} placeholder="Briefly explain why the explanation is insufficient…" value={resendReason} onChange={e => setResendReason(e.target.value)} style={{ fontSize: 13, resize: 'none' }} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>Revised Show Cause Letter</div>
              <Input.TextArea rows={6} value={resendContent} onChange={e => setResendContent(e.target.value)} style={{ fontSize: 13, resize: 'vertical' }} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>New Response Deadline</div>
              <DatePicker value={resendDeadline} onChange={setResendDeadline} style={{ width: 200 }} placeholder="Select deadline" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 4 }}>
              <Button onClick={() => setResendEmpId(null)}>Cancel</Button>
              <Button type="primary" icon={<SendOutlined />} onClick={handleSendResend} style={{ background: '#d97706', borderColor: '#d97706' }}>
                Send to Employee
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Avatar helper ──────────────────────────────────────────────────────────────
const AVATAR_COLORS = ['#f59e0b', '#8b5cf6', '#10b981', '#ec4899', '#06b6d4', '#3b82f6', '#f97316'];
function MemberAvatar({ name, index }: { name: string; index: number }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div style={{
      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
      background: AVATAR_COLORS[index % AVATAR_COLORS.length],
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700, fontSize: 12,
    }}>{initials}</div>
  );
}

// ── Committee Panel ────────────────────────────────────────────────────────────
interface CommitteeMember {
  id: string; name: string; department: string; gender: string; designation: string;
  role: string;
}

const COMMITTEE_ROLES = ['Member', 'Member Secretary', 'Head of Committee', 'Chairperson'];

function CommitteePanel() {
  const [selectedType, setSelectedType] = useState<'investigation' | 'anti-harassment'>('investigation');
  const [members, setMembers] = useState<CommitteeMember[]>([
    { id: 'AD', name: 'Aarti Das',    department: 'Product',      gender: 'Female', designation: 'Associate', role: 'Member Secretary'   },
    { id: 'DN', name: 'Deepak Nair',  department: 'Operations',   gender: 'Male',   designation: 'Manager',   role: 'Member'             },
    { id: 'RG', name: 'Rohan Gupta',  department: 'Engineering',  gender: 'Male',   designation: 'Associate', role: 'Member'             },
    { id: 'SG', name: 'Sneha Gupta',  department: 'Operations',   gender: 'Female', designation: 'Director',  role: 'Head of Committee'  },
    { id: 'ND', name: 'Neha Das',     department: 'Operations',   gender: 'Female', designation: 'Manager',   role: 'Member'             },
  ]);

  const committeeTypes = [
    { key: 'investigation',    label: 'Investigation Committee',  sub: 'Min 3, Max 6 members' },
    { key: 'anti-harassment',  label: 'Anti-Harassment Committee', sub: 'Min 5 members, female-led' },
  ] as const;

  const updateRole = (id: string, role: string) =>
    setMembers(prev => prev.map(m => m.id === id ? { ...m, role } : m));

  const removeMember = (id: string) =>
    setMembers(prev => prev.filter(m => m.id !== id));

  return (
    <div>
      {/* Committee Type */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text-primary)', marginBottom: 12 }}>Committee Type</div>
        <div style={{ display: 'flex', gap: 12 }}>
          {committeeTypes.map((ct, i) => {
            const active = selectedType === ct.key;
            return (
              <div
                key={ct.key}
                onClick={() => setSelectedType(ct.key)}
                style={{
                  flex: 1, padding: '14px 16px', border: `1.5px solid ${active ? '#3B6EEA' : 'var(--color-border)'}`,
                  borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', background: active ? 'rgba(59, 130, 246, 0.08)' : 'var(--color-bg-surface)',
                  transition: 'all 0.15s',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text-primary)', marginBottom: 2 }}>{ct.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{ct.sub}</div>
                </div>
                {active && <CheckCircleFilled style={{ fontSize: 22, color: '#3B6EEA' }} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Committee Members */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text-primary)', marginBottom: 12 }}>
          Committee Members ({members.length})
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {members.map((m, i) => (
            <div key={m.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 8, background: 'var(--color-bg-surface)',
            }}>
              <MemberAvatar name={m.name} index={i} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text-primary)' }}>{m.name}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-disabled)' }}>
                  {m.department} • {m.gender} • {m.designation}
                </div>
              </div>
              <Select
                size="small"
                value={m.role}
                onChange={val => updateRole(m.id, val)}
                style={{ width: 170 }}
                options={COMMITTEE_ROLES.map(r => ({ label: r, value: r }))}
              />
              <div
                onClick={() => removeMember(m.id)}
                style={{ cursor: 'pointer', color: 'var(--color-text-disabled)', fontSize: 16, lineHeight: 1, padding: '0 2px' }}
              >
                ×
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Button icon={<PlusOutlined />} onClick={() => {}}>Add committee member...</Button>
        <Space>
          <Button type="primary">Assign and Save</Button>
          <Button danger>Form a new Committee</Button>
        </Space>
      </div>

      {/* Committee History */}
      <div>
        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text-primary)', marginBottom: 10 }}>Committee History</div>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px', border: '1px solid var(--color-border)', borderRadius: 8, background: 'var(--color-bg-subtle)',
        }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text-primary)', marginBottom: 2 }}>Committee 1:</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>Head: Deepak Nair</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>Created on: 26th May, 2026</div>
          </div>
          <Button type="primary" size="small">View</Button>
        </div>
      </div>
    </div>
  );
}

// ── Investigation Panel ────────────────────────────────────────────────────────
const INVESTIGATION_TABS = [
  { key: 'overview',     label: 'Overview',     icon: <BarChartOutlined />,    count: null },
  { key: 'tasks',        label: 'Tasks',        icon: <CheckSquareOutlined />, count: 4    },
  { key: 'evidence',     label: 'Evidence',     icon: <SafetyOutlined />,      count: 0    },
  { key: 'qa-sessions',  label: 'Q&A Sessions', icon: <CommentOutlined />,     count: 0    },
];

function InvestigationOverview() {
  const [suspendAccused, setSuspendAccused] = useState(false);

  const stats = [
    { label: 'Total',       value: 0, bg: 'var(--color-status-info-bg)', numColor: '#2563eb' },
    { label: 'Completed',   value: 0, bg: 'var(--color-status-approved-bg)', numColor: '#16a34a' },
    { label: 'In Progress', value: 0, bg: 'var(--color-status-pending-bg)', numColor: '#d97706' },
    { label: 'Overdue',     value: 0, bg: 'var(--color-status-rejected-bg)', numColor: '#dc2626' },
  ];

  return (
    <div>
      {/* Task Summary */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text-primary)', marginBottom: 12 }}>Task Summary</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {stats.map(s => (
            <div key={s.label} style={{
              background: s.bg, borderRadius: 10, padding: '16px 20px',
            }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.numColor, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Committee Members */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text-primary)', marginBottom: 10 }}>Committee Members</div>
        <div style={{
          padding: '20px', border: '1px solid var(--color-border)', borderRadius: 8,
          color: 'var(--color-text-disabled)', fontSize: 12, textAlign: 'center',
        }}>
          No committee members assigned yet.
        </div>
      </div>

      {/* Suspension Management */}
      <div style={{ border: '1px solid var(--color-border)', borderRadius: 10, padding: 16 }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: suspendAccused ? 16 : 10 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text-primary)' }}>Suspension Management</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>Suspend Accused</span>
            <div
              onClick={() => setSuspendAccused(v => !v)}
              style={{
                width: 40, height: 22, borderRadius: 11, cursor: 'pointer', position: 'relative',
                background: suspendAccused ? '#3B6EEA' : 'var(--color-border)', transition: 'background 0.2s',
              }}
            >
              <div style={{
                position: 'absolute', top: 3, left: suspendAccused ? 21 : 3,
                width: 16, height: 16, borderRadius: '50%', background: 'var(--color-bg-surface)',
                transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </div>
          </div>
        </div>

        {/* OFF state */}
        {!suspendAccused && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 6,
            padding: '8px 12px', background: 'var(--color-bg-subtle)', borderRadius: 6, border: '1px solid var(--color-border)',
          }}>
            <InfoCircleOutlined style={{ color: 'var(--color-text-tertiary)', fontSize: 13, marginTop: 1, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
              Suspension is not mandatory. The investigation committee will decide based on the incident.
            </span>
          </div>
        )}

        {/* ON state */}
        {suspendAccused && (
          <div>
            {/* Date row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Start Date</div>
                <input
                  type="date"
                  defaultValue="2026-02-14"
                  style={{
                    width: '100%', padding: '8px 10px', fontSize: 13,
                    border: '1px solid var(--color-border)', borderRadius: 6, color: 'var(--color-text-primary)',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>End Date</div>
                <input
                  type="date"
                  defaultValue="2026-04-15"
                  style={{
                    width: '100%', padding: '8px 10px', fontSize: 13,
                    border: '1px solid var(--color-border)', borderRadius: 6, color: 'var(--color-text-primary)',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Progress box */}
            <div style={{
              padding: '10px 14px', background: 'var(--color-status-pending-bg)',
              border: '1px solid #fde68a', borderRadius: 8, marginBottom: 14,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#d97706', marginBottom: 8 }}>
                Maximum suspension period: 60 days
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#d97706', marginBottom: 4 }}>
                <span>Days elapsed</span>
                <span>39 / 60</span>
              </div>
              <div style={{ height: 8, background: 'rgba(253, 230, 138, 0.4)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(39 / 60) * 100}%`, background: '#f59e0b', borderRadius: 4 }} />
              </div>
            </div>

            {/* Reason */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Reason for Suspension</div>
              <Input.TextArea
                rows={3}
                defaultValue="Severity of allegations requires immediate suspension pending investigation"
                style={{ fontSize: 13, resize: 'vertical' }}
              />
            </div>

            {/* Action */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button danger type="primary">Confirm and Send formal Email</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Investigation Tasks Panel ──────────────────────────────────────────────────
type TaskStatus = 'completed' | 'in_progress' | 'pending';
interface InvTask {
  id: string; title: string; assignee: string; due: string;
  status: TaskStatus; note?: string;
}

const TASK_STATUS_CFG: Record<TaskStatus, { bg: string; color: string; label: string }> = {
  completed:   { bg: 'var(--color-status-approved-bg)', color: 'var(--color-status-approved)', label: 'completed'   },
  in_progress: { bg: 'var(--color-status-info-bg)', color: '#2563eb', label: 'in_progress' },
  pending:     { bg: 'var(--color-status-pending-bg)', color: '#b45309', label: 'pending'     },
};

const TASK_TYPES = ['Ask Question', 'Collect Evidence', 'Interview', 'Review Document', 'Site Visit'];
const COMMITTEE_MEMBERS = ['Rezaul Karim (member)', 'Saima Khatun (member)', 'Deepak Nair (head)', 'Aarti Das (secretary)'];

function InvestigationTasksPanel() {
  const [title, setTitle]         = useState('');
  const [desc, setDesc]           = useState('');
  const [taskType, setTaskType]   = useState<string | undefined>(undefined);
  const [assignee, setAssignee]   = useState<string | undefined>(undefined);
  const [dueDate, setDueDate]     = useState('');
  const [sendToEmp, setSendToEmp] = useState(false);
  const [expandedId, setExpandedId]       = useState<string | null>(null);
  const [submitDesc, setSubmitDesc]       = useState('');
  const [submittedAt, setSubmittedAt]     = useState<string | null>(null);

  const [tasks, setTasks] = useState<InvTask[]>([
    { id: '1', title: 'Collect witness statements from Line 3 workers', assignee: 'Saima Khatun', due: '10 Mar', status: 'completed',   note: 'Collected 3 witness statements. All confirm physical altercation.' },
    { id: '2', title: 'Review CCTV footage from Production Floor',       assignee: 'Rezaul Karim', due: '12 Mar', status: 'completed',   note: 'CCTV confirms the assault at 08:17 AM. Footage secured.' },
    { id: '3', title: 'Interview the accused — Sumon Das',               assignee: 'Saima Khatun', due: '15 Mar', status: 'in_progress', note: undefined },
    { id: '4', title: 'Take Statement from the Victim',                  assignee: 'Rezaul Karim', due: '01 Apr', status: 'pending',     note: undefined },
  ]);

  const handleAssign = () => {
    if (!title.trim()) return;
    setTasks(prev => [...prev, {
      id: String(Date.now()), title: title.trim(),
      assignee: assignee?.split(' (')[0] ?? 'Unassigned',
      due: dueDate || '—', status: 'pending', note: desc || undefined,
    }]);
    setTitle(''); setDesc(''); setTaskType(undefined); setAssignee(undefined);
    setDueDate(''); setSendToEmp(false);
  };

  const handleMarkDone = (taskId: string) => {
    const now = new Date();
    const ts = now.toLocaleString('en-US', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    setSubmittedAt(ts);
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'completed', note: submitDesc || t.note } : t));
    setExpandedId(null);
    setSubmitDesc('');
  };

  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text-primary)', marginBottom: 14 }}>Investigation Tasks</div>

      {/* Assign form */}
      <div style={{ border: '1px solid var(--color-border)', borderRadius: 10, padding: 16, marginBottom: 20, background: 'var(--color-bg-subtle)' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-disabled)', letterSpacing: '0.06em', marginBottom: 10 }}>
          ASSIGN TASK TO COMMITTEE MEMBER
        </div>
        <Input
          placeholder="Task title *"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{ marginBottom: 8, fontSize: 13 }}
        />
        <Input.TextArea
          placeholder="Description..."
          value={desc}
          onChange={e => setDesc(e.target.value)}
          rows={3}
          style={{ marginBottom: 8, fontSize: 13, resize: 'vertical' }}
        />
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <Select
            placeholder="Ask Question"
            value={taskType}
            onChange={setTaskType}
            style={{ flex: 1 }}
            options={TASK_TYPES.map(t => ({ label: t, value: t }))}
          />
          <Select
            placeholder="Rezaul Karim (member)"
            value={assignee}
            onChange={setAssignee}
            style={{ flex: 1 }}
            options={COMMITTEE_MEMBERS.map(m => ({ label: m, value: m }))}
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            style={{
              padding: '6px 10px', fontSize: 13, border: '1px solid var(--color-border)',
              borderRadius: 6, color: dueDate ? 'var(--color-text-primary)' : 'var(--color-text-disabled)',
            }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <input type="checkbox" id="sendToEmp" checked={sendToEmp} onChange={e => setSendToEmp(e.target.checked)} style={{ cursor: 'pointer' }} />
          <label htmlFor="sendToEmp" style={{ fontSize: 12, color: 'var(--color-text-tertiary)', cursor: 'pointer' }}>
            Also send request to employee (appears in My Complaints)
          </label>
        </div>
        <Button type="link" icon={<PlusOutlined />} onClick={handleAssign} style={{ padding: 0, fontWeight: 600, fontSize: 13 }}>
          Assign Task
        </Button>
      </div>

      {/* Task list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {tasks.map(task => {
          const cfg = TASK_STATUS_CFG[task.status];
          const isExpanded = expandedId === task.id;

          return (
            <div key={task.id} style={{ border: `1px solid ${isExpanded ? '#3B6EEA' : 'var(--color-border)'}`, borderRadius: 8, background: 'var(--color-bg-surface)', overflow: 'hidden' }}>
              {/* Collapsed row */}
              <div style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  {/* Left: title + deadline (when expanded) */}
                  <div style={{ flex: 1, marginRight: 10 }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text-primary)' }}>{task.title}</span>
                    {isExpanded && (
                      <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginLeft: 12 }}>
                        Deadline: Wed Mar 25 2026
                      </span>
                    )}
                  </div>
                  {/* Right: badge + Submit button */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <span style={{
                      background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 700,
                      padding: '2px 8px', borderRadius: 4,
                    }}>{cfg.label}</span>
                    {task.status === 'in_progress' && (
                      <Button
                        size="small"
                        type="primary"
                        onClick={() => setExpandedId(isExpanded ? null : task.id)}
                      >
                        Submit
                      </Button>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-disabled)', marginBottom: task.note ? 6 : 0 }}>
                  {task.assignee} · Due {task.due}
                </div>
                {task.note && !isExpanded && (
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{task.note}</div>
                )}
              </div>

              {/* Expanded submission form */}
              {isExpanded && (
                <div style={{ borderTop: '1px solid var(--color-border)', padding: '14px 14px 16px', background: 'var(--color-bg-subtle)' }}>
                  <Input.TextArea
                    placeholder="Description"
                    value={submitDesc}
                    onChange={e => setSubmitDesc(e.target.value)}
                    rows={3}
                    style={{ marginBottom: 12, fontSize: 13, resize: 'vertical', background: 'var(--color-bg-surface)' }}
                  />
                  {/* Upload area */}
                  <div style={{
                    border: '1.5px dashed #d1d5db', borderRadius: 8, padding: '20px 16px',
                    textAlign: 'center', color: 'var(--color-text-disabled)', marginBottom: 14, cursor: 'pointer',
                    background: 'var(--color-bg-surface)',
                  }}>
                    <UploadOutlined style={{ fontSize: 22, marginBottom: 6, display: 'block' }} />
                    <div style={{ fontSize: 12 }}>Click to upload or drag and drop.</div>
                    <div style={{ fontSize: 11, color: '#bdbdbd', marginTop: 2 }}>PDF, JPG, PNG, PPT, MP 3 (Max 20mb)</div>
                  </div>
                  <div style={{ textAlign: 'center', marginBottom: 10 }}>
                    <Button type="primary" onClick={() => handleMarkDone(task.id)}>Mark as Done</Button>
                  </div>
                  {submittedAt && (
                    <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', textAlign: 'center' }}>
                      Submission Time: {submittedAt}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Q&A Sessions Panel ─────────────────────────────────────────────────────────
interface QALine {
  id: string;
  questionText: string;
  requiresAttachment: boolean;
}

interface QAAnswer {
  questionId: string;
  answerText: string;
  attachments: UploadFile[];
}

interface QASession {
  id: string;
  sentBy: string;
  sentTo: string;
  sentAt: string;
  questions: QALine[];
  status: 'pending' | 'answered';
  answers?: QAAnswer[];
  answeredAt?: string;
}

const QA_PERSONS = ['Dr. Anwar Hossain', 'Saima Khatun', 'Rezaul Karim', 'Sumon Das', 'Babul Mia'];

const INIT_QA_SESSIONS: QASession[] = [
  {
    id: 'qs-1',
    sentBy: 'Dr. Anwar Hossain',
    sentTo: 'Sumon Das',
    sentAt: '29-05-2026; 10:25 PM',
    questions: [
      { id: 'q1a', questionText: 'Did you initiate the physical contact with Babul Mia?', requiresAttachment: false },
      { id: 'q1b', questionText: 'Can you provide any evidence supporting your account of the incident?', requiresAttachment: true },
    ],
    status: 'answered',
    answers: [
      { questionId: 'q1a', answerText: 'Yes, but I was provoked repeatedly.', attachments: [] },
      { questionId: 'q1b', answerText: 'I have attached a screenshot of the conversation.', attachments: [{ uid: '-1', name: 'chat_screenshot.png', status: 'done' } as UploadFile] },
    ],
    answeredAt: '30-05-2026; 09:10 AM',
  },
  {
    id: 'qs-2',
    sentBy: 'Rezaul Karim',
    sentTo: 'Babul Mia',
    sentAt: '30-05-2026; 02:00 PM',
    questions: [
      { id: 'q2a', questionText: 'Were you present during the incident on 26-05-2026?', requiresAttachment: false },
      { id: 'q2b', questionText: 'Please submit your written statement with supporting documents.', requiresAttachment: true },
      { id: 'q2c', questionText: 'Do you have any witnesses who can corroborate your account?', requiresAttachment: false },
    ],
    status: 'pending',
  },
];

function nowTs() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}; ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')} ${d.getHours()<12?'AM':'PM'}`;
}

function QAStatusBadge({ status }: { status: 'pending' | 'answered' }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, letterSpacing: '0.03em',
      background: status === 'answered' ? 'var(--color-status-approved-bg)' : 'var(--color-status-pending-bg)',
      color:      status === 'answered' ? '#15803d'  : '#d97706',
      border:     `1px solid ${status === 'answered' ? 'var(--color-status-approved-bg)' : 'rgba(253, 230, 138, 0.4)'}`,
    }}>
      {status === 'answered' ? 'Answered' : 'Pending'}
    </span>
  );
}

function QASessionsPanel() {
  const [sessions, setSessions] = useState<QASession[]>(INIT_QA_SESSIONS);
  const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
  const [viewingSession, setViewingSession] = useState<QASession | null>(null);

  // Create form state
  const [sentBy, setSentBy]   = useState<string | undefined>(undefined);
  const [sentTo, setSentTo]   = useState<string | undefined>(undefined);
  const [lines, setLines]     = useState<QALine[]>([{ id: 'new-1', questionText: '', requiresAttachment: false }]);

  const addLine = () =>
    setLines(prev => [...prev, { id: `nl-${Date.now()}`, questionText: '', requiresAttachment: false }]);

  const updateLine = (id: string, patch: Partial<QALine>) =>
    setLines(prev => prev.map(l => l.id === id ? { ...l, ...patch } : l));

  const removeLine = (id: string) =>
    setLines(prev => prev.filter(l => l.id !== id));

  const handleSend = () => {
    if (!sentBy || !sentTo) return;
    const validLines = lines.filter(l => l.questionText.trim());
    if (!validLines.length) return;
    const session: QASession = {
      id: `qs-${Date.now()}`, sentBy, sentTo, sentAt: nowTs(),
      questions: validLines, status: 'pending',
    };
    setSessions(prev => [session, ...prev]);
    setSentBy(undefined); setSentTo(undefined);
    setLines([{ id: 'new-1', questionText: '', requiresAttachment: false }]);
    setView('list');
  };

  const resetCreate = () => {
    setSentBy(undefined); setSentTo(undefined);
    setLines([{ id: 'new-1', questionText: '', requiresAttachment: false }]);
    setView('list');
  };

  /* ── Create view ── */
  if (view === 'create') {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={resetCreate} style={{ padding: '0 4px', color: 'var(--color-text-tertiary)' }} />
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text-primary)' }}>Create Q&amp;A Session</div>
        </div>

        <div style={{ border: '1px solid var(--color-border)', borderRadius: 10, padding: 16, background: 'var(--color-bg-subtle)' }}>
          {/* Who / To */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <Select
              placeholder="Asked By *"
              value={sentBy}
              onChange={setSentBy}
              options={QA_PERSONS.map(p => ({ label: p, value: p }))}
              style={{ width: '100%' }}
            />
            <Select
              placeholder="Send To (Employee) *"
              value={sentTo}
              onChange={setSentTo}
              options={QA_PERSONS.map(p => ({ label: p, value: p }))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Question lines */}
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-tertiary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Questions
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 10 }}>
            {lines.map((line, idx) => (
              <div key={line.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                {/* number bubble */}
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', background: 'var(--color-status-info-bg)',
                  color: '#3B6EEA', fontSize: 11, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, marginTop: 5,
                }}>
                  {idx + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <Input.TextArea
                    placeholder={`Question ${idx + 1}...`}
                    value={line.questionText}
                    onChange={e => updateLine(line.id, { questionText: e.target.value })}
                    rows={2}
                    style={{ fontSize: 13, resize: 'vertical' }}
                  />
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={line.requiresAttachment}
                      onChange={e => updateLine(line.id, { requiresAttachment: e.target.checked })}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                      <PaperClipOutlined style={{ marginRight: 3 }} />
                      Requires attachment as answer
                    </span>
                  </label>
                </div>
                {lines.length > 1 && (
                  <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() => removeLine(line.id)}
                    size="small"
                    style={{ color: '#ef4444', marginTop: 4, flexShrink: 0 }}
                  />
                )}
              </div>
            ))}
          </div>

          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={addLine}
            size="small"
            style={{ fontSize: 12, marginBottom: 16 }}
          >
            Add a Line
          </Button>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
            <Button onClick={resetCreate} size="small">Cancel</Button>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              disabled={!sentBy || !sentTo || !lines.some(l => l.questionText.trim())}
              size="small"
            >
              Send Questions
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Detail view ── */
  if (view === 'detail' && viewingSession) {
    const s = viewingSession;
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => setView('list')} style={{ padding: '0 4px', color: 'var(--color-text-tertiary)' }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text-primary)' }}>Q&amp;A Session Detail</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-disabled)', marginTop: 1 }}>
              {s.sentBy} → {s.sentTo} · {s.sentAt}
            </div>
          </div>
          <QAStatusBadge status={s.status} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {s.questions.map((q, idx) => {
            const ans = s.answers?.find(a => a.questionId === q.id);
            return (
              <div key={q.id} style={{ border: '1px solid var(--color-border)', borderRadius: 8, background: 'var(--color-bg-surface)', overflow: 'hidden' }}>
                {/* Question */}
                <div style={{ padding: '10px 14px', background: 'var(--color-bg-subtle)', borderBottom: ans ? '1px solid var(--color-border)' : undefined }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', background: 'var(--color-status-info-bg)',
                      color: '#3B6EEA', fontSize: 10, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
                    }}>
                      {idx + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.5 }}>{q.questionText}</div>
                      {q.requiresAttachment && (
                        <div style={{ fontSize: 11, color: '#d97706', marginTop: 3 }}>
                          <PaperClipOutlined style={{ marginRight: 3 }} />Attachment required
                        </div>
                      )}
                    </div>
                    {ans
                      ? <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: 'var(--color-status-approved-bg)', color: 'var(--color-status-approved)', border: '1px solid #bbf7d0', flexShrink: 0 }}>Answered</span>
                      : <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: 'var(--color-status-pending-bg)', color: '#d97706', border: '1px solid #fde68a', flexShrink: 0 }}>Pending</span>
                    }
                  </div>
                </div>
                {/* Answer */}
                {ans && (
                  <div style={{ padding: '10px 14px' }}>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{ans.answerText}</div>
                    {ans.attachments.length > 0 && (
                      <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {ans.attachments.map(f => (
                          <div key={f.uid} style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            padding: '3px 8px', border: '1px solid var(--color-border)',
                            borderRadius: 4, fontSize: 11, color: '#3B6EEA', background: 'var(--color-bg-subtle)',
                          }}>
                            <PaperClipOutlined style={{ fontSize: 10 }} />
                            {f.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {s.answeredAt && (
          <div style={{ marginTop: 10, fontSize: 11, color: 'var(--color-text-disabled)', textAlign: 'right' }}>
            Answered at: {s.answeredAt}
          </div>
        )}
      </div>
    );
  }

  /* ── List view ── */
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text-primary)' }}>Q&amp;A Sessions</div>
        <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setView('create')}>
          Create Session
        </Button>
      </div>

      {sessions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-text-disabled)', fontSize: 13 }}>
          No Q&amp;A sessions yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sessions.map(s => (
            <div key={s.id} style={{
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
              padding: '12px 14px', border: '1px solid var(--color-border)',
              borderRadius: 8, background: 'var(--color-bg-surface)', gap: 12,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text-primary)' }}>{s.sentTo}</div>
                  <QAStatusBadge status={s.status} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                  Asked by <strong style={{ color: 'var(--color-text-secondary)' }}>{s.sentBy}</strong> · {s.sentAt}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-disabled)', marginTop: 2 }}>
                  {s.questions.length} question{s.questions.length !== 1 ? 's' : ''}
                  {s.status === 'answered' && s.answeredAt && ` · Answered ${s.answeredAt}`}
                </div>
              </div>
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() => { setViewingSession(s); setView('detail'); }}
              >
                View
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InvestigationPanel() {
  const [activeTab, setActiveTab] = useState('overview');
  const [editingDeadline, setEditingDeadline] = useState(false);
  const [deadlineVal, setDeadlineVal] = useState('60 days');

  return (
    <div>
      {/* Meta bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 24, padding: '10px 14px',
        background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)', borderRadius: 8, marginBottom: 14,
        fontSize: 12,
      }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-disabled)', letterSpacing: '0.05em', marginBottom: 2 }}>COMMITTEE TYPE</div>
          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', textTransform: 'capitalize' }}>Investigation</div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-disabled)', letterSpacing: '0.05em', marginBottom: 2 }}>MEMBERS</div>
          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>0</div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-disabled)', letterSpacing: '0.05em', marginBottom: 2 }}>DEADLINE</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {editingDeadline ? (
              <Input
                size="small"
                value={deadlineVal}
                onChange={e => setDeadlineVal(e.target.value)}
                onBlur={() => setEditingDeadline(false)}
                onPressEnter={() => setEditingDeadline(false)}
                style={{ width: 80, fontSize: 12 }}
                autoFocus
              />
            ) : (
              <>
                <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{deadlineVal}</span>
                <EditOutlined
                  style={{ color: '#3B6EEA', cursor: 'pointer', fontSize: 12 }}
                  onClick={() => setEditingDeadline(true)}
                />
              </>
            )}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-disabled)', letterSpacing: '0.05em', marginBottom: 2 }}>DUE DATE</div>
          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>22-08-2026</div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--color-border)', marginBottom: 16 }}>
        {INVESTIGATION_TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: activeTab === t.key ? 600 : 400,
              color: activeTab === t.key ? '#3B6EEA' : 'var(--color-text-tertiary)',
              borderBottom: activeTab === t.key ? '2px solid #3B6EEA' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {t.icon}
            {t.label}
            {t.count !== null && (
              <span style={{
                background: 'var(--color-bg-subtle)', borderRadius: 10, padding: '0 6px',
                fontSize: 11, fontWeight: 600, color: 'var(--color-text-tertiary)',
              }}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && <InvestigationOverview />}
      {activeTab === 'tasks' && <InvestigationTasksPanel />}
      {activeTab === 'evidence' && (
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text-primary)', marginBottom: 14 }}>Evidence Repository</div>
          <div style={{
            border: '1.5px dashed #d1d5db', borderRadius: 10,
            padding: '60px 24px', textAlign: 'center',
            cursor: 'pointer', background: 'var(--color-bg-surface)',
          }}
            onDragOver={e => e.preventDefault()}
          >
            <UploadOutlined style={{ fontSize: 28, color: 'var(--color-text-disabled)', display: 'block', margin: '0 auto 10px' }} />
            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 500 }}>Click to upload or drag and drop</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-disabled)', marginTop: 4 }}>PDF, JPG, PNG, MP4, MP3, DOCX (Max 25MB)</div>
          </div>
        </div>
      )}
      {activeTab === 'qa-sessions' && <QASessionsPanel />}
    </div>
  );
}

// ── Verdict Panel ──────────────────────────────────────────────────────────────
interface VerdictMember { id: string; name: string; dept: string; role: string }
interface MemberFinding { finding: string; recommendation: string; notes: string; punishment: string; submitted: boolean }

const VERDICT_MEMBERS: VerdictMember[] = [
  { id: 'D', name: 'Dr. Anwar Hossain', dept: 'HR',         role: 'Head'      },
  { id: 'S', name: 'Salma Khatun',      dept: 'Admin',      role: 'Secretary' },
  { id: 'R', name: 'Rezaul Karim',      dept: 'Production', role: 'Member'    },
];

const emptyFinding = (): MemberFinding => ({ finding: '', recommendation: '', notes: '', punishment: '', submitted: false });

function VerdictPanel({ ticket }: { ticket: ComplianceTicket }) {
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);
  const [findings, setFindings] = useState<Record<string, MemberFinding>>(
    Object.fromEntries(VERDICT_MEMBERS.map(m => [m.id, emptyFinding()]))
  );

  const activeMember = VERDICT_MEMBERS.find(m => m.id === activeMemberId) ?? null;
  const f = activeMemberId ? findings[activeMemberId] : null;

  const updateField = (field: keyof MemberFinding, val: string) => {
    if (!activeMemberId) return;
    setFindings(prev => ({ ...prev, [activeMemberId]: { ...prev[activeMemberId], [field]: val } }));
  };

  const handleSubmit = () => {
    if (!activeMemberId) return;
    setFindings(prev => ({ ...prev, [activeMemberId]: { ...prev[activeMemberId], submitted: true } }));
    setActiveMemberId(null);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: activeMember ? '1fr 1fr' : '1fr', gap: 16 }}>

      {/* ── Left: member list ── */}
      <div>
        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text-primary)', marginBottom: 4 }}>Committee Member Findings</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-disabled)', letterSpacing: '0.06em', marginBottom: 14 }}>
          INVESTIGATION COMMITTEE ({VERDICT_MEMBERS.length} MEMBERS)
        </div>

        {/* Member rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {VERDICT_MEMBERS.map((m, i) => {
            const mf = findings[m.id];
            const isActive = activeMemberId === m.id;
            return (
              <div key={m.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px',
                border: `1.5px solid ${isActive ? '#3B6EEA' : 'var(--color-border)'}`,
                borderRadius: 8, background: isActive ? 'rgba(59, 130, 246, 0.08)' : 'var(--color-bg-surface)',
                transition: 'all 0.15s',
              }}>
                <MemberAvatar name={m.name} index={i} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text-primary)' }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-disabled)' }}>{m.dept} · {m.role}</div>
                </div>
                {mf.submitted ? (
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-status-approved)', background: 'var(--color-status-approved-bg)', padding: '2px 8px', borderRadius: 4 }}>
                    Submitted
                  </span>
                ) : (
                  <Button
                    type={i === 0 ? 'primary' : 'default'}
                    size="small"
                    onClick={() => setActiveMemberId(isActive ? null : m.id)}
                  >
                    {isActive ? 'Close' : 'Initiate Final Verdict'}
                  </Button>
                )}
                <Button size="small">View</Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Right: findings form (inline, only when a member is selected) ── */}
      {activeMember && f && (
        <div style={{ border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden', alignSelf: 'start' }}>
          {/* Dark header */}
          <div style={{ background: '#0f1e3c', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 15, color: '#fff', letterSpacing: '0.04em' }}>
                #{ticket.ticketId}
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 2 }}>
                {activeMember.name} · {activeMember.dept}
              </div>
            </div>
            <span style={{ background: '#6366f1', color: '#fff', fontWeight: 700, fontSize: 11, padding: '4px 12px', borderRadius: 20 }}>
              Verdict Initiated
            </span>
          </div>

          {/* Form body */}
          <div style={{ padding: '16px 20px 20px' }}>
            {/* Info banner */}
            <div style={{ background: 'var(--color-status-info-bg)', border: '1px solid #bfdbfe', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 11, color: '#2563eb', letterSpacing: '0.04em', marginBottom: 2 }}>
                INDIVIDUAL FINDINGS &amp; OBSERVATIONS
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>Each committee member submits their findings.</div>
            </div>

            {/* Member chip */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 12px', background: 'var(--color-bg-subtle)', borderRadius: 20,
              fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 14,
            }}>
              <MemberAvatar name={activeMember.name} index={VERDICT_MEMBERS.findIndex(m => m.id === activeMemberId)} />
              {activeMember.name}
              <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 400 }}>({activeMember.role})</span>
            </div>

            {/* Fields */}
            {[
              { key: 'finding' as const,        label: 'Allegation Finding',  placeholder: 'Allegation finding...' },
              { key: 'recommendation' as const, label: 'Recommendation',      placeholder: 'Recommendation...' },
              { key: 'notes' as const,          label: 'Notes (optional)',     placeholder: 'Notes (optional)...' },
              { key: 'punishment' as const,     label: 'Proposed Punishment', placeholder: 'Proposed punishment...' },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-tertiary)', marginBottom: 4, letterSpacing: '0.03em' }}>
                  {field.label.toUpperCase()}
                </div>
                <Input.TextArea
                  value={f[field.key] as string}
                  onChange={e => updateField(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  rows={3}
                  style={{ fontSize: 13, resize: 'vertical', background: 'var(--color-bg-subtle)' }}
                />
              </div>
            ))}

            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSubmit}
              style={{ marginTop: 4 }}
            >
              Submit Finding
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Report Panel ───────────────────────────────────────────────────────────────
const INITIAL_REPORT_HTML = [
  '<h2>Case Summary</h2><p><br></p>',
  '<h2>Investigation Process &amp; Methodology</h2><p><br></p>',
  '<h2>Evidence Summary</h2><p><br></p>',
  '<h2>Witness Testimonies Summary</h2><p><br></p>',
  '<h2>Findings &amp; Analysis</h2><p><br></p>',
  '<h2>Conclusion</h2><p><br></p>',
  '<h2>Recommendations</h2><p><br></p>',
].join('');

const MOCK_SUBMISSIONS = [
  { member: 'Dr. Anwar Hossain (Head)',  finding: 'Allegation confirmed.',        recommendation: 'Formal warning + mandatory training.', punishment: 'Written warning.'            },
  { member: 'Salma Khatun (Secretary)', finding: 'Evidence supports accusation.', recommendation: 'HR counselling session.',             punishment: 'Suspension — 3 days.'         },
  { member: 'Rezaul Karim (Member)',    finding: 'Partially confirmed.',           recommendation: 'Mediation advised.',                  punishment: 'No punishment recommended.'   },
];

function ReportToolbarBtn({ icon, title, onClick }: { icon: React.ReactNode; title: string; onClick: () => void }) {
  return (
    <Tooltip title={title} mouseEnterDelay={0.5}>
      <button
        onMouseDown={e => { e.preventDefault(); onClick(); }}
        style={{
          width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: 'none', borderRadius: 4, background: 'transparent', cursor: 'pointer',
          color: 'var(--color-text-secondary)', fontSize: 14, transition: 'background 0.1s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-border)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        {icon}
      </button>
    </Tooltip>
  );
}

const TOOLBAR_DIVIDER = <div style={{ width: 1, height: 20, background: 'var(--color-border)', margin: '0 3px' }} />;

function ReportPanel() {
  const editorRef                         = useRef<HTMLDivElement>(null);
  const saveTimer                         = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mode, setMode]                   = useState<'edit' | 'preview'>('edit');
  const [content, setContent]             = useState(INITIAL_REPORT_HTML);
  const [autoSaved, setAutoSaved]         = useState(true);
  const [submitted, setSubmitted]         = useState(false);
  const [submissionsOpen, setSubmissionsOpen] = useState(false);

  // Set initial HTML on mount
  useEffect(() => {
    if (editorRef.current) editorRef.current.innerHTML = INITIAL_REPORT_HTML;
  }, []);

  // Restore editor content when switching back from preview
  useEffect(() => {
    if (mode === 'edit' && editorRef.current) {
      editorRef.current.innerHTML = content;
      editorRef.current.focus();
    }
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const syncContent = useCallback(() => {
    if (!editorRef.current) return;
    setContent(editorRef.current.innerHTML);
    setAutoSaved(false);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => setAutoSaved(true), 1500);
  }, []);

  const exec = useCallback((cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
    syncContent();
  }, [syncContent]);

  const printReport = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Investigation Report</title><style>
      body{font-family:'Segoe UI',Arial,sans-serif;max-width:800px;margin:60px auto;padding:0 60px;color:#1a1a1a}
      h1{font-size:22px;font-weight:800;color:#0f1e3c;border-bottom:2px solid #3B6EEA;padding-bottom:10px;margin-bottom:24px}
      h2{font-size:17px;font-weight:700;color:#1e3a5f;margin-top:28px;margin-bottom:8px}
      h3{font-size:14px;font-weight:600;color:#374151}
      p{line-height:1.8;font-size:14px;color:#374151;margin:6px 0}
      ul,ol{padding-left:24px;line-height:1.9;font-size:14px}
      @media print{body{margin:0;padding:40px}}
    </style></head><body>
      <h1>Investigation Report &mdash; ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</h1>
      ${content}
    </body></html>`);
    win.document.close(); win.focus(); win.print(); win.close();
  };

  const downloadReport = () => {
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Investigation Report</title><style>
      body{font-family:'Segoe UI',Arial,sans-serif;max-width:800px;margin:60px auto;padding:0 60px;color:#1a1a1a}
      h1{font-size:22px;font-weight:800;color:#0f1e3c;border-bottom:2px solid #3B6EEA;padding-bottom:10px;margin-bottom:24px}
      h2{font-size:17px;font-weight:700;color:#1e3a5f;margin-top:28px;margin-bottom:8px}
      p{line-height:1.8;font-size:14px;color:#374151;margin:6px 0}
      ul,ol{padding-left:24px;line-height:1.9;font-size:14px}
    </style></head><body>
      <h1>Investigation Report &mdash; ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</h1>
      ${content}
    </body></html>`;
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([html], { type: 'text/html' })),
      download: 'investigation-report.html',
    });
    a.click(); URL.revokeObjectURL(a.href);
  };

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <CheckCircleOutlined style={{ fontSize: 52, color: 'var(--color-status-approved)', marginBottom: 16 }} />
        <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-text-primary)', marginBottom: 8 }}>Report Submitted Successfully</div>
        <div style={{ fontSize: 13, color: 'var(--color-text-tertiary)', marginBottom: 28 }}>
          The investigation report has been submitted for Authority Review.
        </div>
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => { setSubmitted(false); setMode('preview'); }}>Preview Report</Button>
          <Button icon={<PrinterOutlined />} onClick={printReport}>Print</Button>
          <Button icon={<DownloadOutlined />} onClick={downloadReport}>Download</Button>
        </Space>
      </div>
    );
  }

  return (
    <div>
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text-primary)' }}>Prepare Investigation Report</div>
        <Space>
          <Button size="small" icon={<EyeOutlined />}
            type={mode === 'preview' ? 'primary' : 'default'}
            onClick={() => setMode(m => m === 'edit' ? 'preview' : 'edit')}
          >
            {mode === 'preview' ? 'Back to Edit' : 'Preview'}
          </Button>
          <Button size="small" icon={<PrinterOutlined />} onClick={printReport}>Print</Button>
          <Button size="small" icon={<DownloadOutlined />} onClick={downloadReport}>Download</Button>
        </Space>
      </div>

      {/* Info banner */}
      <div style={{ background: 'var(--color-status-info-bg)', border: '1px solid #bfdbfe', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#1e40af' }}>
        All committee member findings have been received. As Head of Committee, prepare the final investigation report.
      </div>

      {/* Member submissions toggle */}
      <div style={{ marginBottom: 14 }}>
        <button
          onClick={() => setSubmissionsOpen(v => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#3B6EEA', fontWeight: 600, padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <span style={{ fontSize: 11 }}>{submissionsOpen ? '▼' : '▶'}</span>
          View Member Submissions —
        </button>
        {submissionsOpen && (
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {MOCK_SUBMISSIONS.map((s, i) => (
              <div key={i} style={{ padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 8, background: 'var(--color-bg-subtle)' }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text-primary)', marginBottom: 6 }}>{s.member}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 2 }}><span style={{ fontWeight: 600, color: 'var(--color-text-tertiary)' }}>Finding: </span>{s.finding}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 2 }}><span style={{ fontWeight: 600, color: 'var(--color-text-tertiary)' }}>Recommendation: </span>{s.recommendation}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}><span style={{ fontWeight: 600, color: 'var(--color-text-tertiary)' }}>Punishment: </span>{s.punishment}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Editor ── */}
      {mode === 'edit' && (
        <div style={{ border: '1px solid var(--color-border)', borderRadius: 10, overflow: 'hidden', marginBottom: 14 }}>
          {/* Toolbar */}
          <div style={{
            background: 'var(--color-bg-subtle)', borderBottom: '1px solid var(--color-border)',
            padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap',
          }}>
            <Select
              size="small" defaultValue="p" style={{ width: 108, marginRight: 2 }}
              onChange={val => exec('formatBlock', val)}
              options={[
                { value: 'p',  label: 'Paragraph' },
                { value: 'h1', label: 'Heading 1'  },
                { value: 'h2', label: 'Heading 2'  },
                { value: 'h3', label: 'Heading 3'  },
              ]}
            />
            {TOOLBAR_DIVIDER}
            <ReportToolbarBtn icon={<BoldOutlined />}          title="Bold (Ctrl+B)"          onClick={() => exec('bold')} />
            <ReportToolbarBtn icon={<ItalicOutlined />}        title="Italic (Ctrl+I)"        onClick={() => exec('italic')} />
            <ReportToolbarBtn icon={<UnderlineOutlined />}     title="Underline (Ctrl+U)"     onClick={() => exec('underline')} />
            <ReportToolbarBtn icon={<StrikethroughOutlined />} title="Strikethrough"          onClick={() => exec('strikethrough')} />
            {TOOLBAR_DIVIDER}
            <ReportToolbarBtn icon={<AlignLeftOutlined />}     title="Align Left"             onClick={() => exec('justifyLeft')} />
            <ReportToolbarBtn icon={<AlignCenterOutlined />}   title="Align Center"           onClick={() => exec('justifyCenter')} />
            <ReportToolbarBtn icon={<AlignRightOutlined />}    title="Align Right"            onClick={() => exec('justifyRight')} />
            {TOOLBAR_DIVIDER}
            <ReportToolbarBtn icon={<UnorderedListOutlined />} title="Bullet List"            onClick={() => exec('insertUnorderedList')} />
            <ReportToolbarBtn icon={<OrderedListOutlined />}   title="Numbered List"          onClick={() => exec('insertOrderedList')} />
            <ReportToolbarBtn icon={<span style={{ fontWeight: 800, fontSize: 13, letterSpacing: -1 }}>›»</span>} title="Indent" onClick={() => exec('indent')} />
            <ReportToolbarBtn icon={<span style={{ fontWeight: 800, fontSize: 13, letterSpacing: -1 }}>«‹</span>} title="Outdent" onClick={() => exec('outdent')} />
            {TOOLBAR_DIVIDER}
            <ReportToolbarBtn icon={<UndoOutlined />}          title="Undo (Ctrl+Z)"          onClick={() => exec('undo')} />
            <ReportToolbarBtn icon={<RedoOutlined />}          title="Redo (Ctrl+Y)"          onClick={() => exec('redo')} />
          </div>

          {/* Page canvas */}
          <div style={{ background: '#e8eaed', padding: '24px 20px', minHeight: 480 }}>
            <div style={{
              background: 'var(--color-bg-surface)', maxWidth: 780, margin: '0 auto',
              boxShadow: '0 2px 12px rgba(0,0,0,0.12)', borderRadius: 2,
            }}>
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={syncContent}
                style={{
                  padding: '48px 56px', minHeight: 480, outline: 'none',
                  fontSize: 14, lineHeight: 1.85, color: '#1a1a1a',
                  fontFamily: "'Segoe UI', Georgia, serif",
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Preview ── */}
      {mode === 'preview' && (
        <div style={{ border: '1px solid var(--color-border)', borderRadius: 10, overflow: 'hidden', marginBottom: 14 }}>
          <div style={{ background: 'var(--color-bg-subtle)', borderBottom: '1px solid var(--color-border)', padding: '8px 14px', fontSize: 11, fontWeight: 700, color: 'var(--color-text-disabled)', letterSpacing: '0.06em' }}>
            PREVIEW — READ ONLY
          </div>
          <div style={{ background: '#e8eaed', padding: '24px 20px' }}>
            <div style={{ background: 'var(--color-bg-surface)', maxWidth: 780, margin: '0 auto', boxShadow: '0 2px 12px rgba(0,0,0,0.12)', borderRadius: 2, padding: '48px 56px' }}>
              <div style={{ borderBottom: '2px solid #3B6EEA', paddingBottom: 14, marginBottom: 28 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#0f1e3c', letterSpacing: '-0.01em' }}>Investigation Report</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-disabled)', marginTop: 5 }}>
                  {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
              <div
                dangerouslySetInnerHTML={{ __html: content }}
                style={{ fontSize: 14, lineHeight: 1.85, color: '#1a1a1a', fontFamily: "'Segoe UI', Georgia, serif" }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: autoSaved ? '#15803d' : 'var(--color-text-disabled)' }}>
          {autoSaved
            ? <><CheckCircleOutlined style={{ fontSize: 14 }} /> Auto Saved</>
            : <><span style={{ fontSize: 12 }}>⋯</span> Saving...</>
          }
        </div>
        <Space>
          <Button onClick={() => setAutoSaved(true)}>Save Draft</Button>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={() => Modal.confirm({
              title: 'Submit Investigation Report',
              content: 'Are you sure you want to submit this report? It will be forwarded for Authority Review.',
              okText: 'Submit Report',
              cancelText: 'Cancel',
              onOk: () => setSubmitted(true),
            })}
          >
            Submit Report
          </Button>
        </Space>
      </div>
    </div>
  );
}

// ── Summary Panel ──────────────────────────────────────────────────────────────
const ACTION_TYPES = [
  'Termination', 'Suspension', 'Demotion', 'Written Warning',
  'Final Warning', 'Fine/Penalty', 'Transfer', 'Mandatory Training',
  'Counseling', 'No Action', 'Other',
];

interface SuggestedAction {
  id: string;
  employeeId: string;
  actionType: string | undefined;
  duration: string;
  justification: string;
}

function SummaryPanel({ ticket: _ticket }: { ticket: ComplianceTicket }) {
  const [execSummary, setExecSummary] = useState('');
  const [findings, setFindings]       = useState(['', '']);

  /* findings helpers */
  const addFinding    = () => setFindings(prev => [...prev, '']);
  const updateFinding = (idx: number, val: string) =>
    setFindings(prev => prev.map((f, i) => (i === idx ? val : f)));
  const removeFinding = (idx: number) =>
    setFindings(prev => prev.filter((_, i) => i !== idx));

  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text-primary)', marginBottom: 20 }}>
        Detailed Summary
      </div>

      {/* Executive Summary */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
          Executive Summary <span style={{ color: '#ef4444' }}>*</span>
        </div>
        <Input.TextArea
          placeholder="Concise summary of the investigation and findings..."
          value={execSummary}
          onChange={e => setExecSummary(e.target.value)}
          rows={5}
          style={{ fontSize: 13, resize: 'vertical' }}
        />
      </div>

      {/* Key Findings */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 10 }}>Key Findings</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {findings.map((f, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--color-text-tertiary)', minWidth: 20, textAlign: 'right' }}>{idx + 1}.</span>
              <Input
                placeholder={`Finding ${idx + 1}`}
                value={f}
                onChange={e => updateFinding(idx, e.target.value)}
                style={{ fontSize: 13, flex: 1 }}
              />
              {findings.length > 1 && (
                <div
                  onClick={() => removeFinding(idx)}
                  style={{ color: 'var(--color-text-disabled)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '0 2px', userSelect: 'none' }}
                >×</div>
              )}
            </div>
          ))}
        </div>
        <Button
          type="link"
          icon={<PlusOutlined />}
          onClick={addFinding}
          style={{ padding: '8px 0 0', fontWeight: 600, fontSize: 13 }}
        >
          Add Finding
        </Button>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" onClick={() => {}}>Save Summary</Button>
      </div>
    </div>
  );
}

const OBJECTION_REASONS = [
  'Insufficient Evidence',
  'Procedural Irregularity',
  'Bias in Investigation',
  'Missing Witness Statements',
  'Incomplete Committee Review',
  'Other',
];

const CONFIRM_ACTIONS = [
  'Confirm Suggested Action',
  'Modify Action',
];

// ── Hearing Panel ──────────────────────────────────────────────────────────────
const HEARING_VENUES = [
  'Board Room, Floor 3',
  'Conference Room A',
  'Conference Room B',
  'HR Meeting Room',
  'Director\'s Office',
  'Training Hall',
  'Virtual (Online)',
  'Other',
];

function AttachmentField({
  label,
  required,
  value,
  onChange,
  files,
  onFiles,
  rows = 3,
  placeholder,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  files: UploadFile[];
  onFiles: (list: UploadFile[]) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
        {label}{required && <span style={{ color: '#ef4444' }}> *</span>}
      </div>
      <Input.TextArea
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ fontSize: 13, resize: 'vertical', marginBottom: 8 }}
      />
      <Upload
        fileList={files}
        beforeUpload={() => false}
        onChange={({ fileList }) => onFiles(fileList)}
        multiple
      >
        <Button size="small" icon={<PaperClipOutlined />} style={{ fontSize: 12 }}>
          Attach File
        </Button>
      </Upload>
      {files.length > 0 && (
        <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {files.map(f => (
            <div
              key={f.uid}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: 'var(--color-status-info-bg)', border: '1px solid #c7d7fa',
                borderRadius: 6, padding: '2px 8px', fontSize: 11, color: '#3B6EEA',
              }}
            >
              <FileOutlined style={{ fontSize: 11 }} />
              {f.name}
              <span
                onClick={() => onFiles(files.filter(x => x.uid !== f.uid))}
                style={{ cursor: 'pointer', color: 'var(--color-text-disabled)', fontSize: 13, lineHeight: 1 }}
              >×</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HearingPanel({ ticket }: { ticket: ComplianceTicket }) {
  const employeeOptions = ticket.employeesInvolved.map(e => ({ label: `${e.name} (${e.id})`, value: e.id }));

  // 0 = Schedule active, 1 = Record active, 2 = Actions active, 3 = all done
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);

  // Schedule fields
  const [hearingDate, setHearingDate]     = useState<Parameters<typeof DatePicker>[0]['value']>(null);
  const [hearingTime, setHearingTime]     = useState<Parameters<typeof TimePicker>[0]['value']>(null);
  const [selectedEmps, setSelectedEmps]   = useState<string[]>([]);
  const [venue, setVenue]                 = useState<string | undefined>();
  const [hearingDetails, setHearingDetails] = useState('');
  const [sendEmail, setSendEmail]         = useState(false);

  // Record fields
  const [attendees, setAttendees]         = useState('');
  const [attendeeFiles, setAttendeeFiles] = useState<UploadFile[]>([]);
  const [minutes, setMinutes]             = useState('');
  const [minuteFiles, setMinuteFiles]     = useState<UploadFile[]>([]);

  // Suggested Actions
  const [actions, setActions] = useState<SuggestedAction[]>([
    { id: '1', employeeId: '', actionType: undefined, duration: '', justification: '' },
  ]);
  const addAction = () =>
    setActions(prev => [...prev, { id: Date.now().toString(), employeeId: '', actionType: undefined, duration: '', justification: '' }]);
  const removeAction = (id: string) =>
    setActions(prev => prev.filter(a => a.id !== id));
  const updateAction = (id: string, field: keyof Omit<SuggestedAction, 'id'>, value: string | undefined) =>
    setActions(prev => prev.map(a => (a.id === id ? { ...a, [field]: value } : a)));

  const canSaveSchedule = !!hearingDate && !!hearingTime && selectedEmps.length > 0 && !!venue;
  const canSaveRecord   = attendees.trim().length > 0 && minutes.trim().length > 0;

  // Shared section wrapper
  const sectionStyle = (active: boolean, done: boolean): React.CSSProperties => ({
    background: 'var(--color-bg-surface)',
    border: `1px solid ${done ? 'var(--color-status-approved-bg)' : active ? '#c7d7fa' : 'var(--color-border)'}`,
    borderRadius: 10,
    overflow: 'hidden',
    opacity: active || done ? 1 : 0.5,
    pointerEvents: active || done ? 'auto' : 'none',
  });

  const sectionHeader = (num: number, title: string, done: boolean, active: boolean) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 18px',
      background: done ? 'var(--color-status-approved-bg)' : active ? 'var(--color-status-info-bg)' : 'var(--color-bg-subtle)',
      borderBottom: active ? '1px solid var(--color-border)' : 'none',
    }}>
      <div style={{
        width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 700,
        background: done ? '#22c55e' : active ? '#3B6EEA' : 'var(--color-border)',
        color: '#fff',
      }}>
        {done ? <CheckCircleOutlined /> : num}
      </div>
      <div style={{ fontWeight: 700, fontSize: 13, color: done ? '#166534' : active ? '#2952C8' : 'var(--color-text-tertiary)' }}>
        {title}
      </div>
      {done && (
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#16a34a', fontWeight: 600 }}>Completed</span>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── 1. Hearing Schedule ── */}
      <div style={sectionStyle(step === 0, step > 0)}>
        {sectionHeader(1, 'Hearing Schedule', step > 0, step === 0)}
        {step === 0 && (
          <div style={{ padding: '16px 18px' }}>
            <Row gutter={[12, 14]}>
              <Col span={12}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                  Date <span style={{ color: '#ef4444' }}>*</span>
                </div>
                <DatePicker style={{ width: '100%' }} value={hearingDate} onChange={setHearingDate} />
              </Col>
              <Col span={12}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                  Time <span style={{ color: '#ef4444' }}>*</span>
                </div>
                <TimePicker style={{ width: '100%' }} use12Hours format="h:mm A" value={hearingTime} onChange={setHearingTime} />
              </Col>
              <Col span={24}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                  Employees <span style={{ color: '#ef4444' }}>*</span>
                </div>
                <Select
                  mode="multiple"
                  placeholder="Select employees to invite"
                  value={selectedEmps}
                  onChange={setSelectedEmps}
                  style={{ width: '100%' }}
                  options={employeeOptions}
                  showSearch
                  filterOption={(input, opt) =>
                    (opt?.label as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Col>
              <Col span={24}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                  Venue <span style={{ color: '#ef4444' }}>*</span>
                </div>
                <Select
                  placeholder="Select venue"
                  value={venue}
                  onChange={setVenue}
                  style={{ width: '100%' }}
                  options={HEARING_VENUES.map(v => ({ label: v, value: v }))}
                />
              </Col>
              <Col span={24}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                  Hearing Details
                </div>
                <Input.TextArea
                  rows={3}
                  placeholder="Describe the purpose, agenda, or any specific details for this hearing..."
                  value={hearingDetails}
                  onChange={e => setHearingDetails(e.target.value)}
                  style={{ fontSize: 13, resize: 'vertical' }}
                />
              </Col>
              <Col span={24}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 2 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                      <MailOutlined style={{ marginRight: 6, color: 'var(--color-text-tertiary)' }} />
                      Send Email Invitation
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-disabled)', marginTop: 2 }}>
                      Notify selected employees via email with hearing details
                    </div>
                  </div>
                  <Switch checked={sendEmail} onChange={setSendEmail} />
                </div>
              </Col>
            </Row>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <Button
                type="primary"
                disabled={!canSaveSchedule}
                onClick={() => setStep(1)}
              >
                Save &amp; Continue
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── 2. Hearing Record ── */}
      <div style={sectionStyle(step === 1, step > 1)}>
        {sectionHeader(2, 'Hearing Record', step > 1, step === 1)}
        {step === 1 && (
          <div style={{ padding: '16px 18px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <AttachmentField
                label="Attendees"
                required
                value={attendees}
                onChange={setAttendees}
                files={attendeeFiles}
                onFiles={setAttendeeFiles}
                rows={2}
                placeholder="List names / roles of those present at the hearing..."
              />
              <AttachmentField
                label="Minutes of Hearing"
                required
                value={minutes}
                onChange={setMinutes}
                files={minuteFiles}
                onFiles={setMinuteFiles}
                rows={4}
                placeholder="Summarise what was discussed, statements made, and agreements reached..."
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
              <Button onClick={() => setStep(0)}>Back</Button>
              <Button
                type="primary"
                disabled={!canSaveRecord}
                onClick={() => setStep(2)}
              >
                Save &amp; Continue
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── 3. Suggested Actions ── */}
      <div style={sectionStyle(step === 2, step > 2)}>
        {sectionHeader(3, 'Suggested Actions', step > 2, step === 2)}
        {step === 2 && (
          <div style={{ padding: '16px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
              <Button type="dashed" icon={<PlusOutlined />} size="small" onClick={addAction} style={{ fontSize: 12 }}>
                Add Action
              </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {actions.map((action, idx) => (
                <div
                  key={action.id}
                  style={{ border: '1px solid var(--color-border)', borderRadius: 10, padding: 16, background: 'var(--color-bg-subtle)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#3B6EEA', background: 'var(--color-status-info-bg)', padding: '2px 10px', borderRadius: 20 }}>
                      Action {idx + 1}
                    </div>
                    {actions.length > 1 && (
                      <Button type="text" icon={<DeleteOutlined />} size="small" onClick={() => removeAction(action.id)} style={{ color: 'var(--color-text-disabled)', padding: '0 4px' }} />
                    )}
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                      Employee <span style={{ color: '#ef4444' }}>*</span>
                    </div>
                    <Select
                      placeholder="Select employee"
                      value={action.employeeId || undefined}
                      onChange={val => updateAction(action.id, 'employeeId', val)}
                      style={{ width: '100%' }}
                      options={employeeOptions}
                      showSearch
                      filterOption={(input, opt) =>
                        (opt?.label as string)?.toLowerCase().includes(input.toLowerCase())
                      }
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Action Type</div>
                      <Select
                        placeholder="Select action type"
                        value={action.actionType}
                        onChange={val => updateAction(action.id, 'actionType', val)}
                        style={{ width: '100%' }}
                        options={ACTION_TYPES.map(t => ({ label: t, value: t }))}
                      />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Duration / Details</div>
                      <Input
                        placeholder="e.g., 6-month probation"
                        value={action.duration}
                        onChange={e => updateAction(action.id, 'duration', e.target.value)}
                        style={{ fontSize: 13 }}
                      />
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Justification</div>
                    <Input.TextArea
                      placeholder="Why is this action appropriate for this employee..."
                      value={action.justification}
                      onChange={e => updateAction(action.id, 'justification', e.target.value)}
                      rows={3}
                      style={{ fontSize: 13, resize: 'vertical' }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
              <Button onClick={() => setStep(1)}>Back</Button>
              <Button
                type="primary"
                icon={<CheckCircleFilled />}
                onClick={() => Modal.confirm({
                  title: 'Submit Hearing',
                  content: 'This will finalise the hearing record and suggested actions. Continue?',
                  okText: 'Confirm',
                  cancelText: 'Cancel',
                  onOk: () => setStep(3),
                })}
              >
                Submit Hearing
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── All done ── */}
      {step === 3 && (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <CheckCircleFilled style={{ fontSize: 40, color: '#22c55e', marginBottom: 10 }} />
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text-primary)', marginBottom: 4 }}>Hearing Recorded</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>The hearing details and suggested actions have been saved.</div>
        </div>
      )}
    </div>
  );
}

const OBJECTION_ACTIONS = [
  'Re-investigation',
  'Re-evaluation',
  'Additional Evidence Required',
  'Committee Reconvening',
];

function AuthorityReviewPanel({ ticket }: { ticket: ComplianceTicket }) {
  const [response, setResponse] = useState<'no-objection' | 'objection' | null>(null);
  const [openSections, setOpenSections] = useState<string[]>([]);

  /* No-objection form */
  const [confirmAction, setConfirmAction]           = useState<string | undefined>(undefined);
  const [decisionStatement, setDecisionStatement]   = useState('');

  /* Objection form */
  const [objectionReason, setObjectionReason]       = useState<string | undefined>(undefined);
  const [objectionStatement, setObjectionStatement] = useState('');
  const [objectionAction, setObjectionAction]       = useState<string | undefined>(undefined);

  const toggleSection = (key: string) =>
    setOpenSections(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key],
    );

  const handleConfirm = () => {
    Modal.confirm({
      title: 'Confirm & Conclude Case',
      content: 'This will finalize the case with the selected action. This cannot be undone.',
      okText: 'Confirm & Conclude',
      okButtonProps: { style: { background: '#059669', borderColor: '#059669' } },
      cancelText: 'Cancel',
      onOk: () => {},
    });
  };

  const handleSubmitObjection = () => {
    Modal.confirm({
      title: 'Submit Objection',
      content: 'This will send the case back for re-evaluation or re-investigation.',
      okText: 'Submit Objection',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk: () => {},
    });
  };

  /* Read-only field */
  const RF = ({ label, value }: { label: string; value: string }) => (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-disabled)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 13, color: 'var(--color-text-primary)', lineHeight: 1.5 }}>{value || '—'}</div>
    </div>
  );

  /* Accordion section */
  const AccordionSection = ({
    sectionKey, icon, title, badge, children,
  }: {
    sectionKey: string;
    icon: ReactNode;
    title: string;
    badge?: string;
    children: ReactNode;
  }) => {
    const open = openSections.includes(sectionKey);
    return (
      <div style={{ border: '1px solid var(--color-border)', borderRadius: 10, background: 'var(--color-bg-surface)', overflow: 'hidden', marginBottom: 10 }}>
        <div
          onClick={() => toggleSection(sectionKey)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '13px 16px', cursor: 'pointer',
            background: open ? 'var(--color-bg-subtle)' : 'var(--color-bg-surface)',
            borderBottom: open ? '1px solid var(--color-border)' : 'none',
            transition: 'background 0.15s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'var(--color-status-info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#3B6EEA', fontSize: 14, flexShrink: 0,
            }}>
              {icon}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{title}</span>
            {badge && (
              <span style={{
                fontSize: 11, fontWeight: 600, color: '#059669',
                background: 'var(--color-status-approved-bg)', border: '1px solid #bbf7d0',
                borderRadius: 20, padding: '1px 8px',
              }}>
                {badge}
              </span>
            )}
          </div>
          <div style={{
            fontSize: 10, color: 'var(--color-text-disabled)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}>
            ▼
          </div>
        </div>
        {open && (
          <div style={{ padding: '16px 18px 18px' }}>
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* ── Summary accordion sections ── */}
      <AccordionSection sectionKey="complaint" icon={<FileOutlined />} title="Original Complaint" badge="Submitted">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px 24px' }}>
          <RF label="Ticket ID"          value={ticket.ticketId} />
          <RF label="Name"               value={ticket.name} />
          <RF label="Employee ID"        value={ticket.employeeId} />
          <RF label="Phone Number"       value={ticket.phoneNumber} />
          <RF label="Department"         value={ticket.department} />
          <RF label="Date of Incident"   value={ticket.dateOfIncident} />
          <RF label="Time of Incident"   value={ticket.timeOfIncident} />
          <RF label="Location"           value={ticket.location} />
          <RF label="Nature of Conflict" value={ticket.natureOfConflict} />
          <div style={{ gridColumn: '1 / -1' }}>
            <RF label="Employees Involved" value={ticket.employeesInvolved.map(e => `${e.id} (${e.name})`).join('; ')} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <RF label="Witness" value={ticket.witness} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <RF label="Description of the Incident" value={ticket.descriptionOfIncident} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <RF label="Preferred Outcome" value={ticket.preferredOutcome} />
          </div>
        </div>
      </AccordionSection>

      <AccordionSection sectionKey="show-cause" icon={<AuditOutlined />} title="Show Cause Letter & Response" badge="Completed">
        <div style={{ color: 'var(--color-text-tertiary)', fontSize: 13, lineHeight: 1.6 }}>
          Show Cause letter was issued to the employee(s). Employee response has been recorded and reviewed.
          See the <strong style={{ color: '#3B6EEA' }}>Show Cause</strong> tab for the full letter and response history.
        </div>
      </AccordionSection>

      <AccordionSection sectionKey="committee" icon={<UserOutlined />} title="Committee Details" badge="Completed">
        <div style={{ color: 'var(--color-text-tertiary)', fontSize: 13, lineHeight: 1.6 }}>
          An investigation committee was formed and hearings were conducted. All member findings have been submitted.
          See the <strong style={{ color: '#3B6EEA' }}>Committee</strong> and <strong style={{ color: '#3B6EEA' }}>Verdict</strong> tabs for full details.
        </div>
      </AccordionSection>

      <AccordionSection sectionKey="report" icon={<EditOutlined />} title="Investigation Report" badge="Submitted">
        <div style={{ color: 'var(--color-text-tertiary)', fontSize: 13, lineHeight: 1.6 }}>
          The investigation report has been drafted, reviewed, and submitted.
          See the <strong style={{ color: '#3B6EEA' }}>Report</strong> tab to view the full document.
        </div>
      </AccordionSection>

      {/* ── Your Response ── */}
      <div style={{ border: '1px solid var(--color-border)', borderRadius: 10, background: 'var(--color-bg-surface)', overflow: 'hidden', marginTop: 20 }}>
        {/* Header */}
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-bg-subtle)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'var(--color-status-info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#3B6EEA', fontSize: 14, flexShrink: 0,
          }}>
            <SafetyOutlined />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>Your Response</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 1 }}>Select your decision as the reviewing authority</div>
          </div>
        </div>

        <div style={{ padding: 18 }}>
          {/* Toggle cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: response ? 20 : 0 }}>
            {/* No Objection */}
            <div
              onClick={() => setResponse('no-objection')}
              style={{
                border: `2px solid ${response === 'no-objection' ? '#059669' : 'var(--color-border)'}`,
                borderRadius: 10,
                padding: '14px 16px',
                cursor: 'pointer',
                background: response === 'no-objection' ? 'var(--color-status-approved-bg)' : 'var(--color-bg-subtle)',
                transition: 'all 0.15s',
                display: 'flex', alignItems: 'flex-start', gap: 12,
              }}
            >
              {/* Radio indicator */}
              <div style={{
                width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                border: `2px solid ${response === 'no-objection' ? '#059669' : 'var(--color-border)'}`,
                background: 'var(--color-bg-surface)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {response === 'no-objection' && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#059669' }} />
                )}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: response === 'no-objection' ? '#059669' : 'var(--color-text-secondary)', marginBottom: 3 }}>
                  No Objection
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', lineHeight: 1.4 }}>Approve findings and proceed to conclusion</div>
              </div>
            </div>

            {/* Objection */}
            <div
              onClick={() => setResponse('objection')}
              style={{
                border: `2px solid ${response === 'objection' ? '#ef4444' : 'var(--color-border)'}`,
                borderRadius: 10,
                padding: '14px 16px',
                cursor: 'pointer',
                background: response === 'objection' ? 'var(--color-status-rejected-bg)' : 'var(--color-bg-subtle)',
                transition: 'all 0.15s',
                display: 'flex', alignItems: 'flex-start', gap: 12,
              }}
            >
              {/* Radio indicator */}
              <div style={{
                width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                border: `2px solid ${response === 'objection' ? '#ef4444' : 'var(--color-border)'}`,
                background: 'var(--color-bg-surface)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {response === 'objection' && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
                )}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: response === 'objection' ? '#ef4444' : 'var(--color-text-secondary)', marginBottom: 3 }}>
                  Objection
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', lineHeight: 1.4 }}>Send for re-evaluation or re-investigation</div>
              </div>
            </div>
          </div>

          {/* No Objection form */}
          {response === 'no-objection' && (
            <div style={{
              background: 'var(--color-status-approved-bg)', border: '1px solid #bbf7d0',
              borderRadius: 10, padding: 18,
            }}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                  Confirm Action <span style={{ color: '#ef4444' }}>*</span>
                </div>
                <Select
                  placeholder="Select..."
                  value={confirmAction}
                  onChange={setConfirmAction}
                  style={{ width: '100%' }}
                  options={CONFIRM_ACTIONS.map(a => ({ label: a, value: a }))}
                />
              </div>
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Decision Statement</div>
                <Input.TextArea
                  placeholder="Your statement on the decision..."
                  value={decisionStatement}
                  onChange={e => setDecisionStatement(e.target.value)}
                  rows={4}
                  style={{ fontSize: 13, resize: 'vertical' }}
                />
              </div>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleConfirm}
                style={{ background: '#059669', borderColor: '#059669' }}
              >
                Confirm &amp; Conclude Case
              </Button>
            </div>
          )}

          {/* Objection form */}
          {response === 'objection' && (
            <div style={{
              background: 'var(--color-status-rejected-bg)', border: '1px solid #fecaca',
              borderRadius: 10, padding: 18,
            }}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                  Objection Reason <span style={{ color: '#ef4444' }}>*</span>
                </div>
                <Select
                  placeholder="Select reason"
                  value={objectionReason}
                  onChange={setObjectionReason}
                  style={{ width: '100%' }}
                  options={OBJECTION_REASONS.map(r => ({ label: r, value: r }))}
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                  Objection Statement <span style={{ color: '#ef4444' }}>*</span>
                </div>
                <Input.TextArea
                  placeholder="Detail your objections..."
                  value={objectionStatement}
                  onChange={e => setObjectionStatement(e.target.value)}
                  rows={4}
                  style={{ fontSize: 13, resize: 'vertical' }}
                />
              </div>
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                  Action <span style={{ color: '#ef4444' }}>*</span>
                </div>
                <Select
                  placeholder="Select action"
                  value={objectionAction}
                  onChange={setObjectionAction}
                  style={{ width: '100%' }}
                  options={OBJECTION_ACTIONS.map(a => ({ label: a, value: a }))}
                />
              </div>
              <Button
                danger
                type="primary"
                icon={<ExclamationCircleOutlined />}
                onClick={handleSubmitObjection}
              >
                Submit Objection
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const FINAL_ACTION_STATUSES = ['Pending Issuance', 'Notice Issued', 'Acknowledged', 'Implemented'] as const;
type FinalActionStatus = typeof FINAL_ACTION_STATUSES[number];

interface FinalActionEntry {
  employeeId: string;
  employeeName: string;
  actionType: string;
  effectiveDate: string;
  status: FinalActionStatus;
  noticeIssued: boolean;
}

function ConclusionPanel({ ticket }: { ticket: ComplianceTicket }) {
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [finalActions, setFinalActions] = useState<FinalActionEntry[]>(
    ticket.employeesInvolved.map(e => ({
      employeeId: e.id,
      employeeName: e.name,
      actionType: '',
      effectiveDate: '',
      status: 'Pending Issuance',
      noticeIssued: false,
    }))
  );
  const [closureStatement, setClosureStatement] = useState('');
  const [closureDate, setClosureDate] = useState('');

  const toggleSection = (key: string) =>
    setOpenSections(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key],
    );

  const updateAction = (idx: number, field: keyof FinalActionEntry, value: string | boolean) =>
    setFinalActions(prev => prev.map((a, i) => i === idx ? { ...a, [field]: value } : a));

  const handleIssueNotice = (idx: number) => {
    Modal.confirm({
      title: 'Issue Decision Notice',
      content: `Issue a formal decision notice to ${finalActions[idx].employeeName}? This will be recorded and sent to the employee.`,
      okText: 'Issue Notice',
      cancelText: 'Cancel',
      onOk: () => updateAction(idx, 'noticeIssued', true),
    });
  };

  const handleCloseCase = () => {
    Modal.confirm({
      title: 'Close Case',
      icon: <ExclamationCircleOutlined style={{ color: '#d97706' }} />,
      content: 'This will formally close the case. All actions and notices will be finalized. This cannot be undone.',
      okText: 'Close Case',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk: () => {},
    });
  };

  /* Read-only field */
  const RF = ({ label, value }: { label: string; value: string }) => (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-disabled)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 13, color: 'var(--color-text-primary)', lineHeight: 1.5 }}>{value || '—'}</div>
    </div>
  );

  /* Accordion section */
  const AccordionSection = ({
    sectionKey, icon, title, badge, children,
  }: {
    sectionKey: string; icon: ReactNode; title: string; badge?: string; children: ReactNode;
  }) => {
    const open = openSections.includes(sectionKey);
    return (
      <div style={{ border: '1px solid var(--color-border)', borderRadius: 10, background: 'var(--color-bg-surface)', overflow: 'hidden', marginBottom: 10 }}>
        <div
          onClick={() => toggleSection(sectionKey)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '13px 16px', cursor: 'pointer',
            background: open ? 'var(--color-bg-subtle)' : 'var(--color-bg-surface)',
            borderBottom: open ? '1px solid var(--color-border)' : 'none',
            transition: 'background 0.15s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'var(--color-status-info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#3B6EEA', fontSize: 14, flexShrink: 0,
            }}>
              {icon}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{title}</span>
            {badge && (
              <span style={{
                fontSize: 11, fontWeight: 600, color: '#059669',
                background: 'var(--color-status-approved-bg)', border: '1px solid #bbf7d0',
                borderRadius: 20, padding: '1px 8px',
              }}>
                {badge}
              </span>
            )}
          </div>
          <div style={{
            fontSize: 10, color: 'var(--color-text-disabled)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}>▼</div>
        </div>
        {open && <div style={{ padding: '16px 18px 18px' }}>{children}</div>}
      </div>
    );
  };

  const statusColor: Record<FinalActionStatus, { color: string; bg: string; border: string }> = {
    'Pending Issuance': { color: '#d97706', bg: 'var(--color-status-pending-bg)', border: 'rgba(253, 230, 138, 0.4)' },
    'Notice Issued':    { color: '#2563eb', bg: 'var(--color-status-info-bg)', border: 'rgba(59, 130, 246, 0.22)' },
    'Acknowledged':     { color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.09)', border: 'rgba(124, 58, 237, 0.22)' },
    'Implemented':      { color: '#059669', bg: 'var(--color-status-approved-bg)', border: 'var(--color-status-approved-bg)' },
  };

  const allNoticesIssued = finalActions.every(a => a.noticeIssued);

  return (
    <div>
      {/* ── Case review accordion ── */}
      <AccordionSection sectionKey="complaint" icon={<FileOutlined />} title="Original Complaint" badge="Submitted">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px 24px' }}>
          <RF label="Ticket ID"          value={ticket.ticketId} />
          <RF label="Name"               value={ticket.name} />
          <RF label="Employee ID"        value={ticket.employeeId} />
          <RF label="Department"         value={ticket.department} />
          <RF label="Date of Incident"   value={ticket.dateOfIncident} />
          <RF label="Nature of Conflict" value={ticket.natureOfConflict} />
          <div style={{ gridColumn: '1 / -1' }}>
            <RF label="Description" value={ticket.descriptionOfIncident} />
          </div>
        </div>
      </AccordionSection>

      <AccordionSection sectionKey="verdict" icon={<AuditOutlined />} title="Verdict Summary" badge="Completed">
        <div style={{ color: 'var(--color-text-tertiary)', fontSize: 13, lineHeight: 1.6 }}>
          Committee findings and individual verdicts have been recorded.
          See the <strong style={{ color: '#3B6EEA' }}>Verdict</strong> tab for the full committee member findings.
        </div>
      </AccordionSection>

      <AccordionSection sectionKey="summary" icon={<BarChartOutlined />} title="Summary & Suggested Actions" badge="Completed">
        <div style={{ color: 'var(--color-text-tertiary)', fontSize: 13, lineHeight: 1.6 }}>
          Executive summary and suggested disciplinary actions per employee have been recorded.
          See the <strong style={{ color: '#3B6EEA' }}>Summary</strong> tab for the full details.
        </div>
      </AccordionSection>

      <AccordionSection sectionKey="authority" icon={<SafetyOutlined />} title="Authority Decision" badge="Approved">
        <div style={{ color: 'var(--color-text-tertiary)', fontSize: 13, lineHeight: 1.6 }}>
          The reviewing authority has approved the findings with no objection.
          See the <strong style={{ color: '#3B6EEA' }}>Authority Review</strong> tab for the decision statement.
        </div>
      </AccordionSection>

      {/* ── Final Actions per Employee ── */}
      <div style={{ border: '1px solid var(--color-border)', borderRadius: 10, background: 'var(--color-bg-surface)', overflow: 'hidden', marginTop: 20, marginBottom: 16 }}>
        <div style={{
          padding: '14px 18px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-subtle)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, background: 'var(--color-status-info-bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#3B6EEA', fontSize: 14, flexShrink: 0,
          }}>
            <CheckSquareOutlined />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>Final Actions</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 1 }}>
              Issue formal decision notices to each employee involved
            </div>
          </div>
        </div>

        <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {finalActions.map((action, idx) => {
            const sc = statusColor[action.status];
            return (
              <div
                key={action.employeeId}
                style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: 10,
                  overflow: 'hidden',
                  background: action.noticeIssued ? 'var(--color-bg-subtle)' : 'var(--color-bg-surface)',
                }}
              >
                {/* Employee header */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--color-border)',
                  background: 'var(--color-bg-subtle)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%',
                      background: 'var(--color-status-info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, color: '#3B6EEA', flexShrink: 0,
                    }}>
                      {action.employeeName.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{action.employeeName}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{action.employeeId}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600,
                      color: sc.color, background: sc.bg, border: `1px solid ${sc.border}`,
                      borderRadius: 20, padding: '2px 10px',
                    }}>
                      {action.status}
                    </span>
                    {action.noticeIssued && (
                      <CheckCircleFilled style={{ color: '#059669', fontSize: 16 }} />
                    )}
                  </div>
                </div>

                {/* Action fields */}
                <div style={{ padding: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                        Action Type <span style={{ color: '#ef4444' }}>*</span>
                      </div>
                      <Select
                        placeholder="Select action"
                        value={action.actionType || undefined}
                        onChange={val => updateAction(idx, 'actionType', val)}
                        style={{ width: '100%' }}
                        disabled={action.noticeIssued}
                        options={ACTION_TYPES.map(t => ({ label: t, value: t }))}
                      />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Effective Date</div>
                      <Input
                        type="date"
                        value={action.effectiveDate}
                        onChange={e => updateAction(idx, 'effectiveDate', e.target.value)}
                        disabled={action.noticeIssued}
                        style={{ fontSize: 13 }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Status</div>
                      <Select
                        value={action.status}
                        onChange={val => updateAction(idx, 'status', val)}
                        style={{ width: 180 }}
                        disabled={action.noticeIssued}
                        options={FINAL_ACTION_STATUSES.map(s => ({ label: s, value: s }))}
                      />
                    </div>
                    {!action.noticeIssued ? (
                      <Button
                        type="primary"
                        icon={<SendOutlined />}
                        onClick={() => handleIssueNotice(idx)}
                        disabled={!action.actionType}
                        style={{ marginTop: 22 }}
                      >
                        Issue Notice
                      </Button>
                    ) : (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        fontSize: 12, color: '#059669', fontWeight: 600, marginTop: 22,
                      }}>
                        <CheckCircleFilled />
                        Notice Issued
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Case Closure ── */}
      <div style={{ border: '1px solid var(--color-border)', borderRadius: 10, background: 'var(--color-bg-surface)', overflow: 'hidden' }}>
        <div style={{
          padding: '14px 18px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-subtle)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, background: 'var(--color-status-info-bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#3B6EEA', fontSize: 14, flexShrink: 0,
          }}>
            <LockOutlined />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>Case Closure</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 1 }}>Formally close and archive this compliance case</div>
          </div>
        </div>

        <div style={{ padding: 18 }}>
          {!allNoticesIssued && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'var(--color-status-pending-bg)', border: '1px solid #fde68a',
              borderRadius: 8, padding: '10px 14px', marginBottom: 16,
            }}>
              <WarningOutlined style={{ color: '#d97706', fontSize: 14, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: '#d97706' }}>
                All decision notices must be issued before closing the case.
              </span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Closure Date</div>
              <Input
                type="date"
                value={closureDate}
                onChange={e => setClosureDate(e.target.value)}
                style={{ fontSize: 13 }}
                disabled={!allNoticesIssued}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <div style={{
                fontSize: 12, color: 'var(--color-text-tertiary)', lineHeight: 1.5,
                background: 'var(--color-bg-subtle)', borderRadius: 8, padding: '8px 12px', width: '100%',
              }}>
                Case ID: <strong style={{ color: 'var(--color-text-primary)' }}>{ticket.ticketId}</strong><br />
                Employees involved: <strong style={{ color: 'var(--color-text-primary)' }}>{ticket.employeesInvolved.length}</strong>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Closure Statement</div>
            <Input.TextArea
              placeholder="Provide a formal closure statement summarizing the outcome and actions taken..."
              value={closureStatement}
              onChange={e => setClosureStatement(e.target.value)}
              rows={4}
              style={{ fontSize: 13, resize: 'vertical' }}
              disabled={!allNoticesIssued}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="primary"
              danger
              icon={<LockOutlined />}
              onClick={handleCloseCase}
              disabled={!allNoticesIssued || !closureStatement.trim()}
            >
              Close Case
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

const REEVAL_SCOPE_OPTIONS = [
  'Full Re-investigation',
  'Evidence Review Only',
  'Committee Re-hearing',
  'Witness Re-examination',
  'Verdict Re-assessment',
  'Procedural Review',
];

const REEVAL_DISMISS_REASONS = [
  'Objection Withdrawn',
  'Insufficient Grounds for Re-evaluation',
  'Original Findings Upheld on Review',
  'Mutual Agreement Reached',
  'Other',
];

function ReEvaluationPanel({ ticket }: { ticket: ComplianceTicket }) {
  const [decision, setDecision]         = useState<'start' | 'dismiss' | null>(null);
  const [scope, setScope]               = useState<string | undefined>(undefined);
  const [assignedTo, setAssignedTo]     = useState('');
  const [deadline, setDeadline]         = useState('');
  const [instructions, setInstructions] = useState('');
  const [dismissReason, setDismissReason]       = useState<string | undefined>(undefined);
  const [dismissStatement, setDismissStatement] = useState('');

  const handleConfirmStart = () => {
    Modal.confirm({
      title: 'Start Re-evaluation',
      icon: <ExclamationCircleOutlined style={{ color: '#d97706' }} />,
      content: 'This will reopen the case and initiate a re-evaluation. The assigned team will be notified.',
      okText: 'Confirm & Start',
      cancelText: 'Cancel',
      onOk: () => {},
    });
  };

  const handleConfirmDismiss = () => {
    Modal.confirm({
      title: 'Close Without Re-evaluation',
      content: 'The case will be closed with the original findings. This cannot be undone.',
      okText: 'Confirm & Close',
      okButtonProps: { style: { background: 'var(--color-text-secondary)', borderColor: 'var(--color-text-secondary)' } },
      cancelText: 'Cancel',
      onOk: () => {},
    });
  };

  const InfoRow = ({ icon, label, value, accent }: { icon: ReactNode; label: string; value: string; accent?: string }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <div style={{
        width: 28, height: 28, borderRadius: 7, flexShrink: 0,
        background: accent ? `${accent}18` : 'var(--color-status-info-bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: accent ?? '#3B6EEA', fontSize: 13,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-disabled)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 13, color: 'var(--color-text-primary)', lineHeight: 1.5 }}>{value || '—'}</div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Context banner */}
      <div style={{
        background: 'var(--color-status-pending-bg)', border: '1px solid #fde68a',
        borderRadius: 10, padding: '14px 18px', marginBottom: 20,
        display: 'flex', alignItems: 'flex-start', gap: 12,
      }}>
        <WarningOutlined style={{ color: '#d97706', fontSize: 16, flexShrink: 0, marginTop: 1 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#d97706', marginBottom: 3 }}>Re-evaluation Requested</div>
          <div style={{ fontSize: 12, color: '#78350f', lineHeight: 1.6 }}>
            The reviewing authority raised an objection during Authority Review.
            Decide whether to initiate a formal re-evaluation or close the case with the original findings.
          </div>
        </div>
      </div>

      {/* Case snapshot */}
      <div style={{ border: '1px solid var(--color-border)', borderRadius: 10, background: 'var(--color-bg-surface)', overflow: 'hidden', marginBottom: 20 }}>
        <div style={{
          padding: '13px 18px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-subtle)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, background: 'var(--color-status-info-bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#3B6EEA', fontSize: 14, flexShrink: 0,
          }}>
            <FileOutlined />
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>Case Snapshot</div>
          <span style={{
            marginLeft: 'auto', fontSize: 11, fontWeight: 600,
            color: '#d97706', background: 'var(--color-status-pending-bg)', border: '1px solid #fde68a',
            borderRadius: 20, padding: '2px 10px',
          }}>
            Pending Re-evaluation
          </span>
        </div>
        <div style={{ padding: '16px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px 24px' }}>
          <InfoRow icon={<AuditOutlined />}        label="Ticket ID"           value={ticket.ticketId} />
          <InfoRow icon={<UserOutlined />}          label="Reported By"         value={`${ticket.reportedBy.name} (${ticket.reportedBy.id})`} />
          <InfoRow icon={<CalendarOutlined />}      label="Date of Incident"    value={ticket.dateOfIncident} />
          <InfoRow icon={<WarningOutlined />}       label="Nature of Conflict"  value={ticket.natureOfConflict} accent="#d97706" />
          <InfoRow icon={<ClockCircleOutlined />}   label="Deadline"            value={ticket.deadline} accent="#ef4444" />
          <InfoRow icon={<InfoCircleOutlined />}    label="Current Stage"       value={ticket.currentStage} />
          <div style={{ gridColumn: '1 / -1' }}>
            <InfoRow icon={<UserOutlined />} label="Employees Involved"
              value={ticket.employeesInvolved.map(e => `${e.name} (${e.id})`).join(' · ')} />
          </div>
        </div>
      </div>

      {/* Decision card */}
      <div style={{ border: '1px solid var(--color-border)', borderRadius: 10, background: 'var(--color-bg-surface)', overflow: 'hidden' }}>
        <div style={{
          padding: '14px 18px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-subtle)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, background: 'var(--color-status-info-bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#3B6EEA', fontSize: 14, flexShrink: 0,
          }}>
            <SafetyOutlined />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>Re-evaluation Decision</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 1 }}>Confirm whether re-evaluation should proceed</div>
          </div>
        </div>

        <div style={{ padding: 18 }}>
          {/* Toggle cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: decision ? 20 : 0 }}>
            {/* Start */}
            <div
              onClick={() => setDecision('start')}
              style={{
                border: `2px solid ${decision === 'start' ? '#3B6EEA' : 'var(--color-border)'}`,
                borderRadius: 10, padding: '16px 18px', cursor: 'pointer',
                background: decision === 'start' ? 'var(--color-status-info-bg)' : 'var(--color-bg-subtle)',
                transition: 'all 0.15s',
                display: 'flex', alignItems: 'flex-start', gap: 12,
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                border: `2px solid ${decision === 'start' ? '#3B6EEA' : 'var(--color-border)'}`,
                background: 'var(--color-bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {decision === 'start' && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3B6EEA' }} />}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: decision === 'start' ? '#2952C8' : 'var(--color-text-secondary)', marginBottom: 4 }}>
                  Start Re-evaluation
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', lineHeight: 1.5 }}>
                  Reopen the case and assign a team to conduct a formal re-evaluation
                </div>
              </div>
            </div>

            {/* Dismiss */}
            <div
              onClick={() => setDecision('dismiss')}
              style={{
                border: `2px solid ${decision === 'dismiss' ? 'var(--color-text-tertiary)' : 'var(--color-border)'}`,
                borderRadius: 10, padding: '16px 18px', cursor: 'pointer',
                background: decision === 'dismiss' ? 'var(--color-bg-subtle)' : 'var(--color-bg-subtle)',
                transition: 'all 0.15s',
                display: 'flex', alignItems: 'flex-start', gap: 12,
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                border: `2px solid ${decision === 'dismiss' ? 'var(--color-text-tertiary)' : 'var(--color-border)'}`,
                background: 'var(--color-bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {decision === 'dismiss' && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-text-tertiary)' }} />}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                  Close Without Re-evaluation
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', lineHeight: 1.5 }}>
                  Dismiss the objection and close the case with the original findings
                </div>
              </div>
            </div>
          </div>

          {/* Start Re-evaluation form */}
          {decision === 'start' && (
            <div style={{ background: 'var(--color-status-info-bg)', border: '1px solid #c7d7fa', borderRadius: 10, padding: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#2952C8', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                <ReloadOutlined style={{ fontSize: 13 }} /> Re-evaluation Setup
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                  Scope of Re-evaluation <span style={{ color: '#ef4444' }}>*</span>
                </div>
                <Select
                  placeholder="Select scope"
                  value={scope}
                  onChange={setScope}
                  style={{ width: '100%' }}
                  options={REEVAL_SCOPE_OPTIONS.map(s => ({ label: s, value: s }))}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                    Assigned To <span style={{ color: '#ef4444' }}>*</span>
                  </div>
                  <Input
                    placeholder="Name or team responsible"
                    value={assignedTo}
                    onChange={e => setAssignedTo(e.target.value)}
                    style={{ fontSize: 13 }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                    Deadline <span style={{ color: '#ef4444' }}>*</span>
                  </div>
                  <Input
                    type="date"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    style={{ fontSize: 13 }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Instructions / Notes</div>
                <Input.TextArea
                  placeholder="Provide specific instructions for the re-evaluation team..."
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  rows={4}
                  style={{ fontSize: 13, resize: 'vertical' }}
                />
              </div>

              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={handleConfirmStart}
                disabled={!scope || !assignedTo || !deadline}
              >
                Confirm &amp; Start Re-evaluation
              </Button>
            </div>
          )}

          {/* Dismiss form */}
          {decision === 'dismiss' && (
            <div style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)', borderRadius: 10, padding: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CloseCircleOutlined style={{ fontSize: 13 }} /> Dismissal Details
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                  Reason for Dismissal <span style={{ color: '#ef4444' }}>*</span>
                </div>
                <Select
                  placeholder="Select reason"
                  value={dismissReason}
                  onChange={setDismissReason}
                  style={{ width: '100%' }}
                  options={REEVAL_DISMISS_REASONS.map(r => ({ label: r, value: r }))}
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                  Dismissal Statement <span style={{ color: '#ef4444' }}>*</span>
                </div>
                <Input.TextArea
                  placeholder="Explain why re-evaluation is not required..."
                  value={dismissStatement}
                  onChange={e => setDismissStatement(e.target.value)}
                  rows={4}
                  style={{ fontSize: 13, resize: 'vertical' }}
                />
              </div>

              <Button
                icon={<CloseCircleOutlined />}
                onClick={handleConfirmDismiss}
                disabled={!dismissReason || !dismissStatement.trim()}
                style={{ background: 'var(--color-text-secondary)', borderColor: 'var(--color-text-secondary)', color: '#fff' }}
              >
                Confirm &amp; Close Without Re-evaluation
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StageComingSoon({ label }: { label: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-disabled)' }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-tertiary)', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 12 }}>This stage will be available soon.</div>
    </div>
  );
}

function InvestigateDrawer({
  ticket, open, onClose, onCloseTicket,
}: {
  ticket: ComplianceTicket | null;
  open: boolean;
  onClose: () => void;
  onCloseTicket: (ticketId: string) => void;
}) {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    if (!ticket) return;
    const idx = INVESTIGATE_STAGES.findIndex(stage => stage.label === ticket.currentStage);
    setCurrentStage(idx >= 0 ? idx : 0);
  }, [ticket]);

  if (!ticket) return null;

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <AuditOutlined style={{ color: '#3B6EEA' }} />
          <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>Investigate</span>
          <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)', fontWeight: 400 }}>— {ticket.ticketId}</span>
          <StatusBadge status={ticket.ticketStatus} />
        </div>
      }
      open={open}
      onClose={onClose}
      width="82%"
      styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column', height: '100%' } }}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '10px 0' }}>
          <Button>Reset</Button>
          <Button type="default">Save</Button>
          <Button
            type="default"
            style={{ borderColor: 'var(--color-text-tertiary)', color: 'var(--color-text-tertiary)' }}
            onClick={() => {
              Modal.confirm({
                title: 'Close Ticket',
                icon: <ExclamationCircleOutlined style={{ color: '#d97706' }} />,
                content: 'Are you sure you want to close this ticket? This action cannot be undone.',
                okText: 'Yes, Close Ticket',
                okButtonProps: { danger: true },
                cancelText: 'Cancel',
                onOk: () => onCloseTicket(ticket.ticketId),
              });
            }}
          >
            Save &amp; Close Ticket
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* ── Left: main content ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <SectionLabel>Section — A (Employee Section)</SectionLabel>
          <Row gutter={[16, 0]}>
            <Col span={8}><ReadField label="Ticket ID"              value={ticket.ticketId} /></Col>
            <Col span={8}><ReadField label="Name"                   value={ticket.name} /></Col>
            <Col span={8}><ReadField label="Employee ID"            value={ticket.employeeId} /></Col>
            <Col span={8}><ReadField label="Phone Number"           value={ticket.phoneNumber} /></Col>
            <Col span={8}><ReadField label="Department"             value={ticket.department} /></Col>
            <Col span={8}><ReadField label="Date of Incident"       value={ticket.dateOfIncident} /></Col>
            <Col span={8}><ReadField label="Time of Incident"       value={ticket.timeOfIncident} /></Col>
            <Col span={8}><ReadField label="Location"               value={ticket.location} /></Col>
            <Col span={8}><ReadField label="Nature of the Conflict" value={ticket.natureOfConflict} /></Col>
            <Col span={12}><ReadField label="Employee Involved"     value={ticket.employeesInvolved.map(e => `${e.id} (${e.name})`).join('; ')} /></Col>
            <Col span={12}><ReadField label="Witness"               value={ticket.witness} /></Col>
            <Col span={24}><ReadField label="Description of the Incident" value={ticket.descriptionOfIncident} /></Col>
            <Col span={24}><ReadField label="Preferred Outcome"     value={ticket.preferredOutcome} /></Col>
            <Col span={24}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-tertiary)', marginBottom: 4, letterSpacing: '0.03em' }}>ATTACHMENTS</div>
                <div style={{ fontSize: 12, color: 'var(--color-primary)', padding: '6px 10px', background: 'var(--color-primary-tint)', border: '1px solid #99f6e4', borderRadius: 8 }}>
                  No attachments submitted
                </div>
              </div>
            </Col>
          </Row>

          <Divider style={{ margin: '4px 0 16px' }} />

          <SectionLabel color="hr">Section — B (For HR POC)</SectionLabel>

          {/* Steps progress bar */}
          <div style={{ padding: '16px 12px 12px', background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderBottom: 'none', borderRadius: '10px 10px 0 0' }}>
            <Steps
              current={currentStage}
              size="small"
              onChange={setCurrentStage}
              items={INVESTIGATE_STAGES.map(s => ({ title: s.label }))}
            />
          </div>

          {/* Stage tabs */}
          <Tabs
            activeKey={INVESTIGATE_STAGES[currentStage].key}
            onChange={key => setCurrentStage(INVESTIGATE_STAGES.findIndex(s => s.key === key))}
            style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderTop: 'none', borderRadius: '0 0 10px 10px' }}
            tabBarStyle={{ paddingLeft: 12, paddingRight: 12, marginBottom: 0 }}
            destroyInactiveTabPane
            items={INVESTIGATE_STAGES.map((s, i) => ({
              key: s.key,
              label: s.shortLabel,
              children: (
                <div style={{ padding: '16px 16px 20px' }}>
                  {i === 0 ? <ShowCausePanel ticket={ticket} />
                    : i === 1 ? <ExplanationPanel ticket={ticket} />
                    : i === 2 ? <CommitteePanel />
                    : i === 3 ? <InvestigationPanel />
                    : i === 4 ? <VerdictPanel ticket={ticket} />
                    : i === 5 ? <ReportPanel />
                    : i === 6 ? <SummaryPanel ticket={ticket} />
                    : i === 7 ? <HearingPanel ticket={ticket} />
                    : i === 8 ? <AuthorityReviewPanel ticket={ticket} />
                    : i === 9 ? <ConclusionPanel ticket={ticket} />
                    : i === 10 ? <ReEvaluationPanel ticket={ticket} />
                    : <StageComingSoon label={s.label} />
                  }
                </div>
              ),
            }))}
          />
        </div>

        {/* ── Right: activity timeline ── */}
        <div style={{ width: 320, flexShrink: 0, borderLeft: '1px solid var(--color-border)', overflowY: 'auto', padding: '16px 14px', background: 'var(--color-bg-subtle)' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7, background: 'var(--color-status-info-bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#3B6EEA', fontSize: 13, flexShrink: 0,
            }}>
              <HistoryOutlined />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>Activity Timeline</div>
              <div style={{ fontSize: 10, color: 'var(--color-text-disabled)', marginTop: 1 }}>Full case history</div>
            </div>
            <span style={{
              marginLeft: 'auto', background: '#3B6EEA', color: '#fff',
              borderRadius: 20, padding: '1px 8px', fontSize: 11, fontWeight: 700,
            }}>
              Live
            </span>
          </div>
          <ActivityTimeline ticket={ticket} />
        </div>
      </div>
    </Drawer>
  );
}


// ── View Details Drawer ────────────────────────────────────────────────────────
function HRResponsesCard({
  responses,
  VF,
}: {
  responses: HRResponse[];
  VF: (props: { label: string; value: string; full?: boolean }) => ReactNode;
}) {
  const lastIdx = responses.length - 1;
  const [openIdx, setOpenIdx] = useState<Set<number>>(
    () => new Set(lastIdx >= 0 ? [lastIdx] : []),
  );

  const toggle = (idx: number) =>
    setOpenIdx(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });

  return (
    <div style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
      {/* Card header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', background: 'var(--color-bg-subtle)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: '#05996918', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', fontSize: 12, flexShrink: 0 }}>
          <AuditOutlined />
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>
          Section B — HR POC Responses
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: '#059669', background: 'var(--color-status-approved-bg)', border: '1px solid #bbf7d0', borderRadius: 20, padding: '1px 9px' }}>
          {responses.length}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px' }}>
        {responses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--color-text-disabled)' }}>
            <HistoryOutlined style={{ fontSize: 26, marginBottom: 8, display: 'block' }} />
            <div style={{ fontSize: 13 }}>No HR responses recorded yet.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...responses].reverse().map((r, reversedIdx) => {
              const originalIdx = responses.length - 1 - reversedIdx;
              const isLatest    = originalIdx === lastIdx;
              const isOpen      = openIdx.has(originalIdx);

              return (
                <div
                  key={originalIdx}
                  style={{
                    border: `1px solid ${isOpen ? 'var(--color-status-approved-bg)' : 'var(--color-border)'}`,
                    borderRadius: 10,
                    overflow: 'hidden',
                    transition: 'border-color 0.15s',
                  }}
                >
                  {/* Accordion header — always visible */}
                  <div
                    onClick={() => toggle(originalIdx)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px', cursor: 'pointer',
                      background: isOpen ? 'var(--color-status-approved-bg)' : 'var(--color-bg-subtle)',
                      borderBottom: isOpen ? '1px solid #dcfce7' : 'none',
                      transition: 'background 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%',
                        background: isOpen ? 'var(--color-status-approved-bg)' : 'var(--color-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 800,
                        color: isOpen ? '#059669' : 'var(--color-text-tertiary)',
                        flexShrink: 0, transition: 'all 0.15s',
                      }}>
                        {r.assignPersonnel[0]?.charAt(0) ?? 'H'}
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: isOpen ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)' }}>
                          {r.assignPersonnel.join(', ')}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-disabled)' }}>
                          {r.resolutionStrategy} · {r.conflictType}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {isLatest && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#3B6EEA', background: 'var(--color-status-info-bg)', border: '1px solid #c7d7fa', borderRadius: 20, padding: '1px 7px' }}>
                          Latest
                        </span>
                      )}
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#059669', background: 'var(--color-status-approved-bg)', border: '1px solid #bbf7d0', borderRadius: 20, padding: '1px 8px' }}>
                        #{originalIdx + 1}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--color-text-disabled)' }}>
                        <CalendarOutlined style={{ marginRight: 3, fontSize: 10 }} />{r.date}
                      </span>
                      <span style={{
                        fontSize: 9, color: 'var(--color-text-disabled)',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                        transition: 'transform 0.2s',
                        marginLeft: 2,
                      }}>▼</span>
                    </div>
                  </div>

                  {/* Accordion body */}
                  {isOpen && (
                    <div style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px 16px', marginBottom: 10 }}>
                        <VF label="Security Level"      value={r.securityLevel} />
                        <VF label="Preferred Meeting"   value={r.preferredDateOfMeeting} />
                        <VF label="Resolution Strategy" value={r.resolutionStrategy} />
                        <VF label="Preferred Actions"   value={r.preferredActions.join(' · ')} full />
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-disabled)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Remarks</div>
                      <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6, background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)', borderRadius: 7, padding: '8px 11px' }}>
                        {r.remarks}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ViewDetailsDrawer({
  ticket, open, onClose,
}: {
  ticket: ComplianceTicket | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!ticket) return null;

  const { label: currentStageLabel, step: currentStep } = (() => {
    const stageIndex = INVESTIGATE_STAGES.findIndex(s => s.label === ticket.currentStage);
    if (stageIndex >= 0) return { label: ticket.currentStage, step: stageIndex };
    return { label: 'Show Cause', step: 0 };
  })();

  /* ── helpers ── */
  const VF = ({ label, value, full }: { label: string; value: string; full?: boolean }) => (
    <div style={{ gridColumn: full ? '1 / -1' : undefined }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-disabled)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13, color: value ? 'var(--color-text-primary)' : 'var(--color-border)', lineHeight: 1.5 }}>{value || '—'}</div>
    </div>
  );

  const Card = ({ title, icon, accent = '#3B6EEA', children, noPad }: { title: string; icon: ReactNode; accent?: string; children: ReactNode; noPad?: boolean }) => (
    <div style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', background: 'var(--color-bg-subtle)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent, fontSize: 12, flexShrink: 0 }}>
          {icon}
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>{title}</span>
      </div>
      <div style={noPad ? undefined : { padding: '14px 16px' }}>{children}</div>
    </div>
  );

  /* security level color */
  const secColor = ticket.securityLevel === 'High' ? '#dc2626' : ticket.securityLevel === 'Medium' ? '#d97706' : '#059669';

  /* deadline diff */
  const deadlineDiff = (() => {
    if (!ticket.deadline) return null;
    const [d, m, y] = ticket.deadline.split('-').map(Number);
    return Math.ceil((new Date(y, m - 1, d).getTime() - Date.now()) / 86_400_000);
  })();

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--color-status-info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B6EEA', fontSize: 15, flexShrink: 0 }}>
            <EyeOutlined />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--color-text-primary)', lineHeight: 1.2, fontFamily: 'monospace' }}>{ticket.ticketId}</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 400, marginTop: 1 }}>
              {ticket.department} · {ticket.dateOfIncident}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <StatusBadge status={ticket.ticketStatus} />
            <StageBadge stage={ticket.currentStage} />
            <NatureBadge nature={ticket.natureOfConflict} />
          </div>
        </div>
      }
      open={open}
      onClose={onClose}
      width="78%"
      styles={{ body: { padding: 0, display: 'flex', height: '100%', overflow: 'hidden', background: 'var(--color-bg-subtle)' } }}
    >
      {/* ════ LEFT COLUMN ════ */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px' }}>

        {/* ── Key metrics strip ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 }}>
          {[
            {
              label: 'Security Level', icon: <LockOutlined />,
              value: ticket.securityLevel,
              valueStyle: { fontWeight: 700, color: secColor },
              bg: `${secColor}10`, border: `${secColor}30`,
            },
            {
              label: 'Deadline', icon: <ClockCircleOutlined />,
              value: ticket.deadline,
              sub: deadlineDiff === null ? '' : deadlineDiff < 0 ? `Overdue ${Math.abs(deadlineDiff)}d` : deadlineDiff === 0 ? 'Due today' : `${deadlineDiff}d left`,
              subColor: deadlineDiff !== null && deadlineDiff < 0 ? '#dc2626' : deadlineDiff === 0 ? '#d97706' : '#059669',
              bg: 'var(--color-bg-subtle)', border: 'var(--color-border)',
            },
            {
              label: 'Request Date', icon: <CalendarOutlined />,
              value: ticket.requestDate,
              bg: 'var(--color-bg-subtle)', border: 'var(--color-border)',
            },
            {
              label: ticket.ticketStatus === 'Closed' ? 'Resolved On' : 'HR Responses',
              icon: <CheckCircleOutlined />,
              value: ticket.ticketStatus === 'Closed' ? (ticket.lastResolutionDate ?? '—') : `${ticket.responses.length} response${ticket.responses.length !== 1 ? 's' : ''}`,
              bg: 'var(--color-bg-subtle)', border: 'var(--color-border)',
            },
          ].map((m, i) => (
            <div key={i} style={{ background: m.bg, border: `1px solid ${m.border}`, borderRadius: 10, padding: '10px 13px' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-disabled)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                {m.icon} {m.label}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.3, ...(m as any).valueStyle }}>{m.value}</div>
              {(m as any).sub && <div style={{ fontSize: 11, fontWeight: 600, color: (m as any).subColor, marginTop: 2 }}>{(m as any).sub}</div>}
            </div>
          ))}
        </div>

        {/* ── Section A ── */}
        <Card title="Section A — Employee Submission" icon={<UserOutlined />} accent="#3B6EEA">

          {/* Submitter info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 0 14px', marginBottom: 14, borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--color-status-info-bg)', border: '2px solid #c7d7fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#3B6EEA', flexShrink: 0 }}>
              {ticket.name.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>{ticket.name}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>{ticket.employeeId} · {ticket.department} · {ticket.phoneNumber}</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <SecurityBadge level={ticket.securityLevel} />
            </div>
          </div>

          {/* Incident fields grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px 20px', marginBottom: 14 }}>
            <VF label="Date of Incident"   value={ticket.dateOfIncident} />
            <VF label="Time of Incident"   value={ticket.timeOfIncident} />
            <VF label="Location"           value={ticket.location} />
            <VF label="Nature of Conflict" value={ticket.natureOfConflict} />
            <VF label="Witness"            value={ticket.witness} />
          </div>

          {/* Employees involved */}
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-disabled)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Employees Involved</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ticket.employeesInvolved.map((e, i) => {
                const colors = [
                  { bg: 'var(--color-status-info-bg)', border: '#c7d7fa', color: '#3B6EEA' },
                  { bg: 'var(--color-status-approved-bg)', border: 'var(--color-status-approved-bg)', color: '#059669' },
                  { bg: 'rgba(249, 115, 22, 0.10)', border: 'rgba(251, 146, 60, 0.22)', color: '#d97706' },
                  { bg: '#fdf4ff', border: '#f0abfc', color: '#a21caf' },
                ];
                const c = colors[i % 4];
                return (
                  <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '7px 12px' }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: c.bg, border: `1.5px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: c.color, flexShrink: 0 }}>
                      {e.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)' }}>{e.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-disabled)' }}>{e.id}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-disabled)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Description of Incident</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.7, background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '10px 13px' }}>
              {ticket.descriptionOfIncident}
            </div>
          </div>

          {/* Preferred outcome */}
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-disabled)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Preferred Outcome</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.7, background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '10px 13px' }}>
              {ticket.preferredOutcome}
            </div>
          </div>
        </Card>

        {/* ── Section B — HR Responses ── */}
        <HRResponsesCard responses={ticket.responses} VF={VF} />
      </div>

      {/* ════ RIGHT COLUMN ════ */}
      <div style={{ width: 320, flexShrink: 0, borderLeft: '1px solid var(--color-border)', overflowY: 'auto', background: 'var(--color-bg-subtle)', display: 'flex', flexDirection: 'column' }}>

        {/* ── Investigation Stage Progress ── */}
        <div style={{ padding: '16px 16px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--color-status-info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B6EEA', fontSize: 12 }}>
              <AuditOutlined />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>Investigation Progress</div>
              <div style={{ fontSize: 10, color: 'var(--color-text-disabled)', marginTop: 1 }}>
                Current: <strong style={{ color: '#3B6EEA' }}>{currentStageLabel}</strong>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '14px 14px', marginBottom: 14 }}>
            {INVESTIGATE_STAGES.map((stage, i) => {
              const isDone    = i < currentStep;
              const isActive  = i === currentStep;
              const isPending = i > currentStep;
              return (
                <div key={stage.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, paddingBottom: i < INVESTIGATE_STAGES.length - 1 ? 10 : 0, position: 'relative' }}>
                  {/* Connector line */}
                  {i < INVESTIGATE_STAGES.length - 1 && (
                    <div style={{ position: 'absolute', left: 10, top: 22, bottom: 0, width: 2, background: isDone ? '#3B6EEA' : 'var(--color-border)', zIndex: 0 }} />
                  )}
                  {/* Dot */}
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0, zIndex: 1,
                    background: isDone ? '#3B6EEA' : isActive ? 'var(--color-status-info-bg)' : 'var(--color-bg-subtle)',
                    border: `2px solid ${isDone ? '#3B6EEA' : isActive ? '#3B6EEA' : 'var(--color-border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, fontWeight: 800,
                    color: isDone ? '#fff' : isActive ? '#3B6EEA' : 'var(--color-text-disabled)',
                  }}>
                    {isDone ? '✓' : i + 1}
                  </div>
                  {/* Label */}
                  <div style={{ paddingTop: 2 }}>
                    <div style={{
                      fontSize: 12, fontWeight: isActive ? 700 : 500,
                      color: isDone ? 'var(--color-text-secondary)' : isActive ? '#2952C8' : 'var(--color-text-disabled)',
                      lineHeight: 1.3,
                    }}>
                      {stage.label}
                    </div>
                    {isActive && (
                      <div style={{ fontSize: 10, color: '#3B6EEA', fontWeight: 600, marginTop: 2 }}>← Current Stage</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Activity Timeline ── */}
        <div style={{ padding: '0 16px 16px', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--color-status-info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B6EEA', fontSize: 12 }}>
              <HistoryOutlined />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>Activity Timeline</div>
              <div style={{ fontSize: 10, color: 'var(--color-text-disabled)', marginTop: 1 }}>Full case history</div>
            </div>
          </div>
          <ActivityTimeline ticket={ticket} />
        </div>
      </div>
    </Drawer>
  );
}

// ── Status tab config ──────────────────────────────────────────────────────────
const STATUS_TABS: { key: TicketStatus | 'all'; label: string }[] = [
  { key: 'all',     label: 'All'     },
  { key: 'Ongoing', label: 'Ongoing' },
  { key: 'Closed',  label: 'Closed'  },
  { key: 'Reopen',  label: 'Reopen'  },
];

interface Filters {
  search:    string;
  nature:    string;
  strategy:  string;
  security:  string;
  stage:     string;
  dateRange: DateRange;
}
const EMPTY_FILTERS: Filters = { search: '', nature: '', strategy: '', security: '', stage: '', dateRange: null };

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function CompliancePage() {
  const [tickets,        setTickets]       = useState<ComplianceTicket[]>(MOCK_TICKETS);
  const [draft,          setDraft]         = useState<Filters>(EMPTY_FILTERS);
  const [applied,        setApplied]       = useState<Filters>(EMPTY_FILTERS);
  const [activeTab,      setActiveTab]     = useState<TicketStatus | 'all'>('all');
  const [showFilters,    setShowFilters]   = useState(false);
  const [responseTicket, setResponseTicket] = useState<ComplianceTicket | null>(null);
  const [viewTicket,     setViewTicket]    = useState<ComplianceTicket | null>(null);

  const handleApply = () => setApplied(draft);

  const handleReset = () => {
    setDraft(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setActiveTab('all');
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: tickets.length };
    for (const t of tickets) c[t.ticketStatus] = (c[t.ticketStatus] ?? 0) + 1;
    return c;
  }, [tickets]);

  const filtered = useMemo(() => {
    let rows = tickets;
    if (activeTab !== 'all') rows = rows.filter(t => t.ticketStatus === activeTab);
    if (applied.search) {
      const q = applied.search.toLowerCase();
      rows = rows.filter(t =>
        t.ticketId.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.employeesInvolved.some(e => e.id.toLowerCase().includes(q) || e.name.toLowerCase().includes(q)),
      );
    }
    if (applied.nature)   rows = rows.filter(t => t.natureOfConflict === applied.nature);
    if (applied.security) rows = rows.filter(t => t.securityLevel    === applied.security);
    if (applied.stage)    rows = rows.filter(t => t.currentStage     === applied.stage);
    if (applied.strategy) rows = rows.filter(t => t.responses.some(r => r.resolutionStrategy === applied.strategy));
    return rows;
  }, [tickets, activeTab, applied]);

  const closeTicket = (ticketId: string) => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const today = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}; ${pad(now.getHours())}:${pad(now.getMinutes())} ${now.getHours() < 12 ? 'AM' : 'PM'}`;
    setTickets(prev => prev.map(t => t.ticketId === ticketId
      ? { ...t, ticketStatus: 'Closed', currentStage: 'Conclusion', lastResolutionDate: today }
      : t));
  };

  const handleCloseTicket = (ticketId: string) => {
    Modal.confirm({
      title: 'Close Ticket',
      icon: <ExclamationCircleOutlined style={{ color: '#d97706' }} />,
      content: 'Are you sure you want to close this ticket? This action cannot be undone.',
      okText: 'Yes, Close Ticket',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk: () => closeTicket(ticketId),
    });
  };

  const colHead = (label: string) => (
    <span style={{ fontSize: 11, color: 'var(--color-text-disabled)', fontWeight: 700, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
      {label}
    </span>
  );

  const columns: ColumnsType<ComplianceTicket> = [
    {
      title: colHead('TICKET ID'),
      dataIndex: 'ticketId',
      width: 155,
      render: v => (
        <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 12, color: 'var(--color-primary)' }}>{v}</span>
      ),
    },
    {
      title: colHead('CONFLICT DESCRIPTION'),
      dataIndex: 'conflictDescription',
      width: 240,
      render: v => (
        <Tooltip title={v}>
          <span style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>
            {v.length > 60 ? `${v.slice(0, 60)}…` : v}
          </span>
        </Tooltip>
      ),
    },
    {
      title: colHead('EMPLOYEE INVOLVED'),
      dataIndex: 'employeesInvolved',
      width: 210,
      render: (emps: Employee[]) => <EmployeeCell employees={emps} />,
    },
    {
      title: colHead('NATURE'),
      dataIndex: 'natureOfConflict',
      width: 145,
      render: (v: NatureOfConflict) => <NatureBadge nature={v} />,
    },
    {
      title: colHead('REPORTED BY'),
      dataIndex: 'reportedBy',
      width: 170,
      render: (v: Employee) => (
        <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
          <UserOutlined style={{ marginRight: 4, color: 'var(--color-text-disabled)' }} />
          {v.id} ({v.name})
        </span>
      ),
    },
    {
      title: colHead('SECURITY'),
      dataIndex: 'securityLevel',
      width: 100,
      render: (v: SecurityLevel) => <SecurityBadge level={v} />,
    },
    {
      title: colHead('REQUEST DATE'),
      dataIndex: 'requestDate',
      width: 145,
      render: v => <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>{v}</span>,
    },
    {
      title: colHead('STATUS'),
      dataIndex: 'ticketStatus',
      width: 110,
      render: (v: TicketStatus) => <StatusBadge status={v} />,
    },
    {
      title: colHead('CURRENT STAGE'),
      dataIndex: 'currentStage',
      width: 145,
      render: (v: InvestigationStage) => <StageBadge stage={v} />,
    },
    {
      title: colHead('REMAINING DAYS'),
      dataIndex: 'deadline',
      width: 160,
      render: (v: string, record: ComplianceTicket) => {
        if (!v) return <span style={{ color: 'var(--color-text-disabled)' }}>—</span>;
        const [d, m, y] = v.split('-').map(Number);
        const deadlineMs = new Date(y, m - 1, d).getTime();
        const diff = Math.ceil((deadlineMs - Date.now()) / 86_400_000);
        // Derive start date from requestDate (format: "DD-MM-YYYY; HH:MM AM/PM")
        const datePart = record.requestDate.split(';')[0].trim();
        const [sd, sm, sy] = datePart.split('-').map(Number);
        const startMs = new Date(sy, sm - 1, sd).getTime();
        const totalDays = Math.max(1, Math.ceil((deadlineMs - startMs) / 86_400_000));
        const pct = diff <= 0 ? 100 : Math.min(100, Math.round((diff / totalDays) * 100));
        const barColor = diff < 0 ? '#ef4444' : diff === 0 ? '#f59e0b' : diff <= 3 ? '#f97316' : diff <= 7 ? '#3b82f6' : '#22c55e';
        const label = diff < 0
          ? `Overdue ${Math.abs(diff)}d`
          : diff === 0 ? 'Due Today'
          : `${diff} / ${totalDays} days`;
        const labelColor = diff < 0 ? '#dc2626' : diff === 0 ? '#d97706' : diff <= 3 ? '#ea580c' : diff <= 7 ? '#2563eb' : '#15803d';
        return (
          <div style={{ minWidth: 120 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: labelColor, display: 'block', marginBottom: 4 }}>
              {label}
            </span>
            <div style={{ height: 5, borderRadius: 99, background: 'var(--color-bg-subtle)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 99,
                width: `${pct}%`,
                background: barColor,
                transition: 'width 0.15s ease',
              }} />
            </div>
          </div>
        );
      },
    },
    {
      title: colHead('RESOLUTION DATE'),
      dataIndex: 'lastResolutionDate',
      width: 145,
      render: v => v
        ? <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>{v}</span>
        : <span style={{ color: 'var(--color-text-disabled)' }}>—</span>,
    },
    {
      title: colHead('ACTIONS'),
      key: 'actions',
      align: 'center' as const,
      width: 72,
      fixed: 'right' as const,
      render: (_, record) => (
        <Dropdown
          trigger={['click']}
          placement="bottomRight"
          menu={{
            style: { borderRadius: 8, minWidth: 168 },
            onClick: ({ key }) => {
              if (key === 'response') setResponseTicket(record);
              if (key === 'view')     setViewTicket(record);
              if (key === 'close')    handleCloseTicket(record.ticketId);
            },
            items: [
              { key: 'response', icon: <MessageOutlined />,     label: 'Investigate',    disabled: record.ticketStatus === 'Closed' },
              { key: 'view',     icon: <EyeOutlined />,         label: 'View Details' },
              { type: 'divider' as const },
              { key: 'close',    icon: <CloseCircleOutlined />, label: 'Close Ticket', disabled: record.ticketStatus === 'Closed', danger: true },
            ],
          }}
        >
          <Button
            type="text"
            size="small"
            icon={<MoreOutlined style={{ fontSize: 18 }} />}
            style={{ color: 'var(--color-text-disabled)', borderRadius: 6, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="page-shell">

      {/* ── Page header ── */}
      <div className="page-header-row">
        <div>
          <h1>Compliance Tracker</h1>
          <p>Monitor and manage compliance cases escalated from conflict resolution</p>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="filter-bar">
        <div>
          <div className="filter-label">SEARCH</div>
          <Input
            prefix={<SearchOutlined style={{ color: 'var(--color-text-disabled)' }} />}
            placeholder="Ticket ID, employee ID or name…"
            value={draft.search}
            onChange={e => setDraft(p => ({ ...p, search: e.target.value }))}
            style={{ width: 300, borderRadius: 7 }}
            allowClear
          />
        </div>
        <Space style={{ paddingTop: 20 }}>
          <Button type="primary" icon={<SearchOutlined />} onClick={handleApply}>Apply</Button>
          <Button
            icon={<FilterOutlined />}
            onClick={() => setShowFilters(v => !v)}
            style={showFilters ? { borderColor: 'var(--color-text-tertiary)', color: 'var(--color-text-secondary)' } : {}}
          >
            Filters
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>Reset</Button>
        </Space>
      </div>

      {/* ── Advanced filter panel ── */}
      {showFilters && (
        <div style={{
          padding: '16px 20px',
          background: 'var(--color-bg-subtle)',
          border: '1px solid #e8edf3',
          borderLeft: '3px solid #cbd5e1',
          borderRadius: '0 0 8px 8px',
          marginTop: -8,
          marginBottom: 16,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <Space size={8} align="center">
              <FilterOutlined style={{ color: 'var(--color-text-tertiary)' }} />
              <span style={{ fontWeight: 700, fontSize: 12, letterSpacing: '0.07em', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                Advanced Filtering
              </span>
            </Space>
            <Button type="link" size="small" onClick={handleReset} icon={<ReloadOutlined />} style={{ color: 'var(--color-text-tertiary)', padding: 0, fontSize: 12 }}>
              Reset All Filters
            </Button>
          </div>
          <Row gutter={[12, 12]} align="bottom">
            <Col flex="1 1 160px">
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--color-text-tertiary)', marginBottom: 6, textTransform: 'uppercase' }}>Nature of Conflict</div>
              <Select
                placeholder="All"
                style={{ width: '100%' }}
                value={draft.nature || undefined}
                onChange={v => setDraft(p => ({ ...p, nature: v ?? '' }))}
                allowClear
                options={['Policy Related', 'Tax Related', 'Interpersonal', 'Workplace Harassment', 'Other'].map(v => ({ label: v, value: v }))}
              />
            </Col>
            <Col flex="1 1 160px">
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--color-text-tertiary)', marginBottom: 6, textTransform: 'uppercase' }}>Resolution Strategy</div>
              <Select
                placeholder="All"
                style={{ width: '100%' }}
                value={draft.strategy || undefined}
                onChange={v => setDraft(p => ({ ...p, strategy: v ?? '' }))}
                allowClear
                options={['Negotiation', 'Mediation', 'Arbitration', 'Litigation', 'Collaborative'].map(v => ({ label: v, value: v }))}
              />
            </Col>
            <Col flex="1 1 140px">
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--color-text-tertiary)', marginBottom: 6, textTransform: 'uppercase' }}>Security Level</div>
              <Select
                placeholder="All"
                style={{ width: '100%' }}
                value={draft.security || undefined}
                onChange={v => setDraft(p => ({ ...p, security: v ?? '' }))}
                allowClear
                options={['Low', 'Medium', 'High'].map(v => ({ label: v, value: v }))}
              />
            </Col>
            <Col flex="1 1 180px">
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--color-text-tertiary)', marginBottom: 6, textTransform: 'uppercase' }}>Investigation Stage</div>
              <Select
                placeholder="All"
                style={{ width: '100%' }}
                value={draft.stage || undefined}
                onChange={v => setDraft(p => ({ ...p, stage: v ?? '' }))}
                allowClear
                options={([
                  'Show Cause', 'Explanation Review', 'Committee Formation',
                  'Investigation', 'Verdict', 'Report', 'Summary', 'Hearing',
                  'Authority Review', 'Conclusion', 'Re-evaluation',
                ] as InvestigationStage[]).map(v => ({ label: v, value: v }))}
              />
            </Col>
            <Col flex="2 1 240px">
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--color-text-tertiary)', marginBottom: 6, textTransform: 'uppercase' }}>Request Date Range</div>
              <RangePicker
                value={draft.dateRange}
                onChange={v => setDraft(p => ({ ...p, dateRange: v }))}
                format="DD MMM YYYY"
                placeholder={['Start date', 'End date']}
                style={{ width: '100%', height: 34 }}
              />
            </Col>
            <Col flex="0 0 auto">
              <Space>
                <Button type="primary" onClick={handleApply} style={{ height: 34, fontWeight: 600 }}>Apply</Button>
                <Button onClick={() => setShowFilters(false)} style={{ height: 34 }}>Close Panel</Button>
              </Space>
            </Col>
          </Row>
        </div>
      )}

      {/* ── Status tabs ── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {STATUS_TABS.map(tab => {
          const count = counts[tab.key === 'all' ? 'all' : tab.key] ?? 0;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 10,
                border: isActive ? '1.5px solid #0f766e' : '1.5px solid #E5E7EB',
                background: isActive ? 'var(--color-primary-tint)' : 'var(--color-bg-surface)',
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: 13, fontFamily: 'inherit', cursor: 'pointer',
                transition: 'border-color 0.15s, background 0.15s, color 0.15s',
              }}
            >
              {tab.label}
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                minWidth: 20, height: 20, borderRadius: 10,
                fontSize: 11, fontWeight: 700, padding: '0 5px',
                background: isActive ? 'var(--color-primary)' : 'var(--color-border)',
                color: isActive ? 'var(--color-bg-surface)' : 'var(--color-text-tertiary)',
              }}>
                {count}
              </span>
            </button>
          );
        })}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--color-text-disabled)' }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Table ── */}
      <div className="list-surface">
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="ticketId"
          scroll={{ x: 1600 }}
          pagination={false}
          size="middle"
          style={{ fontSize: 13 }}
        />
      </div>

      {/* ── Drawers & Modals ── */}
      <InvestigateDrawer
        ticket={responseTicket}
        open={!!responseTicket}
        onClose={() => setResponseTicket(null)}
        onCloseTicket={(id) => { closeTicket(id); setResponseTicket(null); }}
      />
      <ViewDetailsDrawer
        ticket={viewTicket}
        open={!!viewTicket}
        onClose={() => setViewTicket(null)}
      />
    </div>
  );
}
