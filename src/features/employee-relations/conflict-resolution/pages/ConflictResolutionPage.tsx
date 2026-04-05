import { useState, useMemo, useCallback, memo } from 'react';
import {
  Button, Input, Select, DatePicker, Table, Tooltip, Drawer,
  Form, Switch, Upload, Collapse, Modal, Dropdown, Divider,
  Row, Col, Space,
} from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import {
  SearchOutlined, ReloadOutlined, FilterOutlined,
  EyeOutlined, MessageOutlined, UploadOutlined,
  LockOutlined, UserOutlined, HistoryOutlined,
  ExclamationCircleOutlined, CalendarOutlined, MailOutlined,
  MoreOutlined, CloseCircleOutlined, ArrowRightOutlined,
  FileOutlined, DeleteOutlined, InfoCircleOutlined,
  DownloadOutlined, PaperClipOutlined,
} from '@ant-design/icons';

type DateRange = RangePickerProps['value'];
const { RangePicker } = DatePicker;

const { Panel } = Collapse;

// ── Types ──────────────────────────────────────────────────────────────────────
type TicketStatus     = 'Pending' | 'Ongoing' | 'Closed';
type SecurityLevel    = 'Low' | 'Medium' | 'High';
type NatureOfConflict = 'Policy Related' | 'Tax Related' | 'Interpersonal' | 'Workplace Harassment' | 'Other';
type ResolutionStrategy = 'Negotiation' | 'Mediation' | 'Arbitration' | 'Litigation' | 'Collaborative';
type ConflictType     = 'Interpersonal' | 'Workplace Violence' | 'Harassment' | 'Discrimination' | 'Policy Violation' | 'Performance' | 'Other';

interface Employee { id: string; name: string }

interface TicketAttachment {
  fileId:   string;
  fileName: string;
  fileSize: number;   // bytes
  mimeType: string;
  type:     string;
  url:      string;
}

interface HRResponse {
  date:                  string;
  conflictType:          ConflictType;
  securityLevel:         SecurityLevel;
  assignPersonnel:       string[];
  preferredActions:      string[];
  preferredDateOfMeeting:string;
  resolutionStrategy:    ResolutionStrategy;
  remarks:               string;
  attachments?:          TicketAttachment[];
}

interface ConflictTicket {
  ticketId:             string;
  conflictDescription:  string;
  employeesInvolved:    Employee[];
  natureOfConflict:     NatureOfConflict;
  reportedBy:           Employee;
  securityLevel:        SecurityLevel;
  requestDate:          string;
  ticketStatus:         TicketStatus;
  lastResolutionDate?:  string;
  // Section A — employee-submitted
  name:                 string;
  employeeId:           string;
  phoneNumber:          string;
  department:           string;
  dateOfIncident:       string;
  timeOfIncident:       string;
  location:             string;
  witness:              string;
  descriptionOfIncident:string;
  preferredOutcome:     string;
  attachments?:         TicketAttachment[];
  responses:            HRResponse[];
}

// ── Mock data ──────────────────────────────────────────────────────────────────
const MOCK_TICKETS: ConflictTicket[] = [
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
    ticketStatus: 'Pending',
    name: 'Ashraful Islam', employeeId: 'T881356', phoneNumber: '01712345678',
    department: 'Engineering', dateOfIncident: '28-05-2026', timeOfIncident: '14:30',
    location: 'Conference Room B', witness: 'Md. Rahim',
    descriptionOfIncident: 'A disagreement arose during the sprint planning meeting regarding the deadline for the Q2 feature release. Multiple team members disputed the scope and timeline agreed upon in the previous meeting.',
    preferredOutcome: 'A clear, written agreement on project deadlines and roles.',
    attachments: [
      { fileId: 'f001', fileName: 'sprint-chat-screenshot.png', fileSize: 234000, mimeType: 'image/png', type: 'Evidence (Screenshots/Socials)', url: '#' },
      { fileId: 'f002', fileName: 'q2-project-plan.pdf',        fileSize: 320000, mimeType: 'application/pdf', type: 'Evidence (Documents)', url: '#' },
    ],
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
        attachments: [
          { fileId: 'f003', fileName: 'mediation-schedule.pdf', fileSize: 120000, mimeType: 'application/pdf', type: 'Report', url: '#' },
        ],
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
    ticketStatus: 'Pending',
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
    name: 'Ashraful Islam', employeeId: 'T881356', phoneNumber: '01712345678',
    department: 'Engineering', dateOfIncident: '26-05-2026', timeOfIncident: '11:15',
    location: 'Open Workspace Area', witness: 'Rabiul Karim',
    descriptionOfIncident: 'Ongoing tension and verbal disagreements between two senior engineers, affecting team morale and productivity during critical project phase.',
    preferredOutcome: 'Formal counselling and workload redistribution.',
    attachments: [
      { fileId: 'f007', fileName: 'email-thread-evidence.pdf', fileSize: 85000, mimeType: 'application/pdf', type: 'Evidence (Email)', url: '#' },
    ],
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
        attachments: [
          { fileId: 'f008', fileName: 'escalation-memo.docx',  fileSize: 45000, mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', type: 'Statement', url: '#' },
          { fileId: 'f009', fileName: 'meeting-minutes.pdf',   fileSize: 62000, mimeType: 'application/pdf', type: 'Report', url: '#' },
        ],
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
        attachments: [
          { fileId: 'f010', fileName: 'agreement-draft.pdf', fileSize: 78000, mimeType: 'application/pdf', type: 'Evidence (Documents)', url: '#' },
        ],
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
    name: 'Md. Arifur Islam', employeeId: 'T881357', phoneNumber: '01812345679',
    department: 'Operations', dateOfIncident: '25-05-2026', timeOfIncident: '09:00',
    location: 'Meeting Room A', witness: 'None',
    descriptionOfIncident: 'Employee failed to follow mandatory HR policy during a team decision-making process, leading to a formal complaint by a colleague.',
    preferredOutcome: 'Written acknowledgement and policy compliance training.',
    attachments: [
      { fileId: 'f011', fileName: 'hr-policy-breach-report.pdf', fileSize: 156000, mimeType: 'application/pdf', type: 'Report', url: '#' },
    ],
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
        attachments: [
          { fileId: 'f012', fileName: 'written-warning-letter.pdf', fileSize: 92000,  mimeType: 'application/pdf', type: 'Statement', url: '#' },
          { fileId: 'f013', fileName: 'training-schedule.xlsx',     fileSize: 38000,  mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', type: 'Summary', url: '#' },
        ],
      },
    ],
  },
];

// ── Colour maps ────────────────────────────────────────────────────────────────
const STATUS_CFG: Record<TicketStatus, { bg: string; text: string; dot: string }> = {
  Pending: { bg: 'var(--color-status-pending-bg)', text: '#d97706', dot: '#f59e0b' },
  Ongoing: { bg: 'var(--color-status-info-bg)', text: '#2563eb', dot: '#3b82f6' },
  Closed:  { bg: 'var(--color-bg-subtle)', text: 'var(--color-text-tertiary)', dot: 'var(--color-text-disabled)' },
};

const SEC_CFG: Record<SecurityLevel, { bg: string; text: string; border: string }> = {
  Low:    { bg: 'var(--color-status-approved-bg)', text: '#15803d', border: 'var(--color-status-approved-bg)' },
  Medium: { bg: 'var(--color-status-pending-bg)', text: '#d97706', border: 'rgba(253, 230, 138, 0.4)' },
  High:   { bg: 'var(--color-status-rejected-bg)', text: '#dc2626', border: 'var(--color-status-rejected-bg)' },
};

const NATURE_COLOR: Record<NatureOfConflict, string> = {
  'Policy Related':      '#7c3aed',
  'Tax Related':         '#0369a1',
  'Interpersonal':       'var(--color-primary)',
  'Workplace Harassment':'#dc2626',
  'Other':               'var(--color-text-tertiary)',
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
function HistoryPanel({ responses }: { responses: HRResponse[] }) {
  if (responses.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-disabled)' }}>
        <HistoryOutlined style={{ fontSize: 28, marginBottom: 8 }} />
        <div style={{ fontSize: 12 }}>No response history yet</div>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[...responses].reverse().map((r, i) => (
        <Collapse
          key={i}
          defaultActiveKey={i === 0 ? ['0'] : []}
          style={{ border: '1px solid var(--color-border)', borderRadius: 10, background: 'var(--color-bg-surface)' }}
        >
          <Panel
            key="0"
            header={
              <span style={{ fontWeight: 700, fontSize: 12, color: 'var(--color-primary-dark)' }}>
                <CalendarOutlined style={{ marginRight: 6, color: 'var(--color-primary)' }} />
                Date: {r.date}
              </span>
            }
            style={{ borderRadius: 10 }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'Conflict Type',           value: r.conflictType },
                { label: 'Assign Personnel',         value: r.assignPersonnel.join(', ') },
                { label: 'Preferred Actions',        value: r.preferredActions.join(', ') },
                { label: 'Preferred Date of Meeting',value: r.preferredDateOfMeeting },
                { label: 'Resolution Strategy',      value: r.resolutionStrategy },
                { label: 'Remarks',                  value: r.remarks },
              ].map(f => (
                <div key={f.label} style={{ display: 'flex', gap: 8, fontSize: 12, borderBottom: '1px solid var(--color-border)', paddingBottom: 5 }}>
                  <span style={{ width: 130, flexShrink: 0, color: 'var(--color-text-tertiary)', fontWeight: 600 }}>{f.label}</span>
                  <span style={{ color: 'var(--color-text-primary)' }}>{f.value}</span>
                </div>
              ))}
            </div>
          </Panel>
        </Collapse>
      ))}
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

  // Stable references so memo(FileRow) doesn't re-render when AttachmentUpload re-renders
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

// ── Response Drawer ────────────────────────────────────────────────────────────
function ResponseDrawer({
  ticket,
  open,
  onClose,
  onSave,
  onCloseTicket,
  onMoveToCompliance,
}: {
  ticket: ConflictTicket | null;
  open: boolean;
  onClose: () => void;
  onSave: (ticketId: string, data: Partial<HRResponse>) => void;
  onCloseTicket: (ticketId: string) => void;
  onMoveToCompliance: (ticketId: string) => void;
}) {
  const [form] = Form.useForm();
  const [emailReminder, setEmailReminder] = useState(false);

  if (!ticket) return null;

  const handleSave = () => {
    form.validateFields().then(vals => {
      onSave(ticket.ticketId, vals);
      form.resetFields();
      onClose();
    });
  };

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <MessageOutlined style={{ color: 'var(--color-primary)' }} />
          <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>Response</span>
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
          <Button onClick={() => form.resetFields()}>Reset</Button>
          <Button type="default" onClick={handleSave}>Save</Button>
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
                onOk: () => { handleSave(); onCloseTicket(ticket.ticketId); },
              });
            }}
          >
            Save &amp; Close Ticket
          </Button>
          <Button
            type="primary"
            onClick={() => { handleSave(); onMoveToCompliance(ticket.ticketId); }}
          >
            Save &amp; Move to Compliance
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* ── Left: form ── */}
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
            <Col span={24}><ReadField label="Description of the Incident"  value={ticket.descriptionOfIncident} /></Col>
            <Col span={24}><ReadField label="Preferred Outcome"     value={ticket.preferredOutcome} /></Col>
            <Col span={24}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-tertiary)', marginBottom: 4, letterSpacing: '0.03em' }}>ATTACHMENTS</div>
                <div style={{ fontSize: 12, color: 'var(--color-primary)', padding: '6px 10px', background: 'var(--color-primary-tint)', border: '1px solid #99f6e4', borderRadius: 8, cursor: 'pointer' }}>
                  No attachments submitted
                </div>
              </div>
            </Col>
          </Row>

          <Divider style={{ margin: '4px 0 16px' }} />

          <SectionLabel color="hr">Section — B (For HR POC)</SectionLabel>
          <Form form={form} layout="vertical" requiredMark={false}>
            <Row gutter={[16, 0]}>
              <Col span={12}>
                <Form.Item label="Conflict Type" name="conflictType" rules={[{ required: true, message: 'Required' }]}>
                  <Select placeholder="Select conflict type" options={[
                    'Interpersonal', 'Workplace Violence', 'Harassment',
                    'Discrimination', 'Policy Violation', 'Performance', 'Other',
                  ].map(v => ({ label: v, value: v }))} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Security Level" name="securityLevel" rules={[{ required: true, message: 'Required' }]}>
                  <Select placeholder="Select security level" options={['Low', 'Medium', 'High'].map(v => ({ label: v, value: v }))} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Assign Personnel" name="assignPersonnel">
                  <Select
                    mode="multiple"
                    placeholder="Search and select personnel"
                    options={['HR Manager', 'Senior HR Manager', 'HR Director', 'Compliance Officer', 'Department Head', 'Team Lead'].map(v => ({ label: v, value: v }))}
                    filterOption={(input, opt) => (opt?.label as string).toLowerCase().includes(input.toLowerCase())}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Preferred Actions" name="preferredActions" rules={[{ required: true, message: 'Required' }]}>
                  <Select
                    mode="multiple"
                    placeholder="Search and select actions"
                    options={['Mediation Session', 'Policy Review', 'Counselling', 'Written Warning', 'Team Reassignment', 'Policy Training', 'Follow-up Meeting'].map(v => ({ label: v, value: v }))}
                    filterOption={(input, opt) => (opt?.label as string).toLowerCase().includes(input.toLowerCase())}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Preferred Date of Meeting" name="preferredDateOfMeeting">
                  <DatePicker showTime style={{ width: '100%' }} format="DD-MM-YYYY; hh:mm A" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Resolution Strategy" name="resolutionStrategy" rules={[{ required: true, message: 'Required' }]}>
                  <Select placeholder="Select strategy" options={['Negotiation', 'Mediation', 'Arbitration', 'Litigation', 'Collaborative'].map(v => ({ label: v, value: v }))} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="Remarks" name="remarks" rules={[{ required: true, message: 'Required' }]}>
                  <Input.TextArea rows={3} placeholder="Enter HR remarks and action notes…" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Reminder (Email)" name="emailReminder">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Switch checked={emailReminder} onChange={setEmailReminder} size="small" />
                    <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                      <MailOutlined style={{ marginRight: 4 }} />
                      Send email reminder to assigned personnel
                    </span>
                  </div>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Attachments"
                  name="attachments"
                  valuePropName="value"
                  getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                >
                  <AttachmentUpload maxCount={5} buttonSize="small" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>

        {/* ── Right: history ── */}
        <div style={{
          width: 300, flexShrink: 0,
          borderLeft: '1px solid var(--color-border)',
          overflowY: 'auto', padding: 16,
          background: 'var(--color-bg-subtle)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <HistoryOutlined style={{ color: 'var(--color-primary)' }} />
            <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text-primary)' }}>History</span>
            <span style={{
              marginLeft: 'auto', background: 'var(--color-primary)', color: '#fff',
              borderRadius: 20, padding: '0 7px', fontSize: 11, fontWeight: 700,
            }}>{ticket.responses.length}</span>
          </div>
          <HistoryPanel responses={ticket.responses} />
        </div>
      </div>
    </Drawer>
  );
}

// ── Attachment type colours ────────────────────────────────────────────────────
const FILE_TYPE_CFG: Record<string, { color: string; bg: string }> = {
  'Evidence (Email)':               { color: '#2563eb', bg: 'var(--color-status-info-bg)' },
  'Evidence (Documents)':           { color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.09)' },
  'Evidence (Screenshots/Socials)': { color: '#db2777', bg: '#fdf2f8' },
  'Statement':                      { color: 'var(--color-primary)', bg: 'var(--color-status-approved-bg)' },
  'Questionaries':                  { color: '#d97706', bg: 'var(--color-status-pending-bg)' },
  'Report':                         { color: '#0891b2', bg: 'rgba(6, 182, 212, 0.10)' },
  'Summary':                        { color: '#4f46e5', bg: 'var(--color-status-info-bg)' },
  'Committee':                      { color: 'var(--color-text-tertiary)', bg: 'var(--color-bg-subtle)' },
};

function fmtSize(bytes: number) {
  return bytes >= 1_048_576
    ? `${(bytes / 1_048_576).toFixed(1)} MB`
    : `${(bytes / 1024).toFixed(0)} KB`;
}

function AttachmentList({ attachments }: { attachments?: TicketAttachment[] }) {
  if (!attachments || attachments.length === 0) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {attachments.map(f => {
        const cfg = FILE_TYPE_CFG[f.type] ?? { color: 'var(--color-text-tertiary)', bg: 'var(--color-bg-subtle)' };
        return (
          <div key={f.fileId} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)',
            borderRadius: 8, padding: '7px 10px',
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8, flexShrink: 0,
              background: cfg.bg, border: `1px solid ${cfg.color}25`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FileOutlined style={{ color: cfg.color, fontSize: 15 }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{f.fileName}</div>
              <div style={{ fontSize: 10, color: 'var(--color-text-disabled)', marginTop: 1 }}>{fmtSize(f.fileSize)}</div>
            </div>
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, flexShrink: 0,
              whiteSpace: 'nowrap', background: cfg.bg, color: cfg.color,
              border: `1px solid ${cfg.color}25`,
            }}>{f.type}</span>
            <Tooltip title="Download">
              <Button
                type="text" size="small" icon={<DownloadOutlined />}
                style={{ color: 'var(--color-text-tertiary)', padding: '0 4px', height: 24, flexShrink: 0 }}
              />
            </Tooltip>
          </div>
        );
      })}
    </div>
  );
}

// ── HR Responses Accordion (View Details) ─────────────────────────────────────
function HRResponsesCard({ responses }: { responses: HRResponse[] }) {
  const lastIdx = responses.length - 1;
  const [openSet, setOpenSet] = useState<Set<number>>(new Set(lastIdx >= 0 ? [lastIdx] : []));

  const toggle = (i: number) =>
    setOpenSet(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });

  if (responses.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--color-text-disabled)' }}>
        <HistoryOutlined style={{ fontSize: 28, display: 'block', margin: '0 auto 8px' }} />
        <div style={{ fontSize: 13 }}>No HR responses recorded yet.</div>
      </div>
    );
  }

  const reversed = [...responses].map((r, i) => ({ r, origIdx: i })).reverse();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {reversed.map(({ r, origIdx }) => {
        const isOpen   = openSet.has(origIdx);
        const isLatest = origIdx === lastIdx;
        return (
          <div key={origIdx} style={{
            border: `1px solid ${isLatest ? 'var(--color-status-approved-bg)' : 'var(--color-border)'}`,
            borderRadius: 10, background: 'var(--color-bg-surface)', overflow: 'hidden',
          }}>
            <button
              onClick={() => toggle(origIdx)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '11px 14px', background: 'transparent', border: 'none',
                cursor: 'pointer', textAlign: 'left',
              }}
            >
              <div style={{
                width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                background: isLatest ? 'var(--color-status-approved-bg)' : 'var(--color-bg-subtle)',
                border: `2px solid ${isLatest ? 'var(--color-primary)' : 'var(--color-border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: isLatest ? 'var(--color-primary-dark)' : 'var(--color-text-tertiary)',
              }}>
                {origIdx + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--color-text-primary)' }}>
                  {r.date}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 1 }}>
                  {r.conflictType} · {r.resolutionStrategy}
                </div>
              </div>
              {(r.attachments?.length ?? 0) > 0 && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 3,
                  background: 'var(--color-status-approved-bg)', color: 'var(--color-primary)', border: '1px solid #bbf7d0',
                  fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 20, flexShrink: 0,
                }}>
                  <PaperClipOutlined style={{ fontSize: 9 }} />
                  {r.attachments!.length}
                </span>
              )}
              {isLatest && (
                <span style={{
                  background: 'var(--color-status-approved-bg)', color: 'var(--color-primary-dark)', fontSize: 10,
                  fontWeight: 700, padding: '1px 7px', borderRadius: 20, flexShrink: 0,
                }}>LATEST</span>
              )}
              <span style={{ color: 'var(--color-text-disabled)', fontSize: 10, flexShrink: 0 }}>
                {isOpen ? '▲' : '▼'}
              </span>
            </button>
            {isOpen && (
              <div style={{ borderTop: '1px solid var(--color-border)' }}>
                {/* Response fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0, padding: '12px 14px' }}>
                  {[
                    { label: 'Conflict Type',             value: r.conflictType },
                    { label: 'Security Level',            value: r.securityLevel },
                    { label: 'Assign Personnel',          value: r.assignPersonnel.join(', ') },
                    { label: 'Preferred Actions',         value: r.preferredActions.join(', ') },
                    { label: 'Preferred Date of Meeting', value: r.preferredDateOfMeeting },
                    { label: 'Resolution Strategy',       value: r.resolutionStrategy },
                  ].map(f => (
                    <div key={f.label} style={{
                      display: 'flex', gap: 8, fontSize: 12,
                      borderBottom: '1px solid #f9fafb', padding: '5px 0',
                    }}>
                      <span style={{ width: 155, flexShrink: 0, color: 'var(--color-text-tertiary)', fontWeight: 600, fontSize: 11 }}>
                        {f.label}
                      </span>
                      <span style={{ color: 'var(--color-text-primary)' }}>{f.value || '—'}</span>
                    </div>
                  ))}
                  {r.remarks && (
                    <div style={{ paddingTop: 8 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>REMARKS</div>
                      <div style={{
                        fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.6,
                        background: 'var(--color-bg-subtle)', borderRadius: 7, padding: '8px 10px',
                        borderLeft: '3px solid #0f766e',
                      }}>
                        {r.remarks}
                      </div>
                    </div>
                  )}
                </div>
                {/* Attachments */}
                {(r.attachments?.length ?? 0) > 0 && (
                  <div style={{
                    padding: '10px 14px 14px',
                    borderTop: '1px solid var(--color-border)',
                    background: 'var(--color-bg-subtle)',
                  }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8,
                    }}>
                      <PaperClipOutlined style={{ color: 'var(--color-primary)', fontSize: 12 }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                        Attachments
                      </span>
                      <span style={{
                        background: 'var(--color-primary)', color: '#fff',
                        fontSize: 10, fontWeight: 700, padding: '0 6px', borderRadius: 20,
                      }}>{r.attachments!.length}</span>
                    </div>
                    <AttachmentList attachments={r.attachments} />
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── View Details Drawer ────────────────────────────────────────────────────────
function ViewDetailsDrawer({
  ticket,
  open,
  onClose,
}: {
  ticket: ConflictTicket | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!ticket) return null;
  const initials = ticket.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <EyeOutlined style={{ color: 'var(--color-primary)' }} />
          <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>View Details</span>
          <span style={{
            background: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)', fontSize: 12,
            fontWeight: 600, padding: '1px 8px', borderRadius: 6,
          }}>{ticket.ticketId}</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            <StatusBadge status={ticket.ticketStatus} />
            <SecurityBadge level={ticket.securityLevel} />
          </div>
        </div>
      }
      open={open}
      onClose={onClose}
      width="78%"
      styles={{ body: { padding: 0, display: 'flex', height: '100%', overflow: 'hidden' } }}
    >
      {/* ── Left: main content ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        {/* Metric strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
          {([
            { label: 'Status',        icon: <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_CFG[ticket.ticketStatus].dot, display: 'inline-block', marginRight: 4 }} />, node: <StatusBadge status={ticket.ticketStatus} /> },
            { label: 'Security',      icon: <LockOutlined style={{ color: 'var(--color-text-tertiary)', fontSize: 11, marginRight: 4 }} />,                                                                               node: <SecurityBadge level={ticket.securityLevel} /> },
            { label: 'Nature',        icon: <ExclamationCircleOutlined style={{ color: 'var(--color-text-tertiary)', fontSize: 11, marginRight: 4 }} />,                                                                  node: <NatureBadge nature={ticket.natureOfConflict} /> },
            { label: 'Request Date',  icon: <CalendarOutlined style={{ color: 'var(--color-text-tertiary)', fontSize: 11, marginRight: 4 }} />,                                                                           node: <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 600 }}>{ticket.requestDate}</span> },
          ] as const).map(m => (
            <div key={m.label} style={{
              background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)',
              borderRadius: 10, padding: '11px 13px',
            }}>
              <div style={{ fontSize: 10, color: 'var(--color-text-disabled)', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 7, textTransform: 'uppercase', display: 'flex', alignItems: 'center' }}>
                {m.icon}{m.label}
              </div>
              {m.node}
            </div>
          ))}
        </div>

        {/* Section A */}
        <div style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 12, marginBottom: 16, overflow: 'hidden' }}>
          <SectionLabel>Section — A (Employee Section)</SectionLabel>
          <div style={{ padding: '0 16px 16px' }}>
            {/* Submitter hero */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14,
              background: 'var(--color-status-approved-bg)', border: '1px solid #bbf7d0',
              borderRadius: 10, padding: '12px 16px', marginBottom: 16,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'var(--color-primary)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 16, flexShrink: 0,
              }}>{initials}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text-primary)' }}>{ticket.name}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                  ID: {ticket.employeeId}  ·  {ticket.department}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{ticket.phoneNumber || '—'}</span>
                <span style={{
                  background: 'var(--color-status-approved-bg)', color: 'var(--color-status-approved)',
                  fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
                }}>Submitter</span>
              </div>
            </div>

            {/* Fields grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px', marginBottom: 12 }}>
              <ReadField label="Date of Incident"       value={ticket.dateOfIncident} />
              <ReadField label="Time of Incident"       value={ticket.timeOfIncident} />
              <ReadField label="Location"               value={ticket.location} />
              <ReadField label="Witness"                value={ticket.witness} />
              <ReadField label="Nature of Conflict"     value={ticket.natureOfConflict} />
              <ReadField label="Last Resolution Date"   value={ticket.lastResolutionDate || '—'} />
            </div>

            {/* Employees Involved */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)', letterSpacing: '0.04em', marginBottom: 8, textTransform: 'uppercase' }}>
                Employees Involved
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {ticket.employeesInvolved.map(e => {
                  const ei = e.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
                  return (
                    <div key={e.id} style={{
                      display: 'flex', alignItems: 'center', gap: 7,
                      background: 'var(--color-status-info-bg)', border: '1px solid #bfdbfe',
                      borderRadius: 8, padding: '5px 10px',
                    }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: '50%',
                        background: '#3b82f6', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 10, flexShrink: 0,
                      }}>{ei}</div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#1e40af' }}>{e.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)' }}>{e.id}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)', letterSpacing: '0.04em', marginBottom: 6, textTransform: 'uppercase' }}>
                Description of Incident
              </div>
              <div style={{
                background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)', borderRadius: 8,
                padding: '10px 12px', fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6,
              }}>
                {ticket.descriptionOfIncident || '—'}
              </div>
            </div>

            {/* Preferred Outcome */}
            <div style={{ marginBottom: (ticket.attachments?.length ?? 0) > 0 ? 14 : 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)', letterSpacing: '0.04em', marginBottom: 6, textTransform: 'uppercase' }}>
                Preferred Outcome
              </div>
              <div style={{
                background: 'var(--color-status-pending-bg)', border: '1px solid #fde68a', borderRadius: 8,
                padding: '10px 12px', fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6,
              }}>
                {ticket.preferredOutcome || '—'}
              </div>
            </div>

            {/* Section A Attachments */}
            {(ticket.attachments?.length ?? 0) > 0 && (
              <div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8,
                  paddingTop: 4, borderTop: '1px solid var(--color-border)',
                }}>
                  <PaperClipOutlined style={{ color: '#3b6eea', fontSize: 13 }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Attachments
                  </span>
                  <span style={{
                    background: '#3b6eea', color: '#fff',
                    fontSize: 10, fontWeight: 700, padding: '0 6px', borderRadius: 20,
                  }}>{ticket.attachments!.length}</span>
                </div>
                <AttachmentList attachments={ticket.attachments} />
              </div>
            )}
          </div>
        </div>

        {/* Section B */}
        <div style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{
            padding: '8px 14px',
            background: 'var(--color-status-info-bg)',
            borderLeft: '3px solid #0ea5e9',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 0,
          }}>
            <span style={{ fontWeight: 700, fontSize: 12, color: '#0369a1', letterSpacing: '0.02em' }}>
              Section — B (For HR POC)
            </span>
            <span style={{
              background: '#0ea5e9', color: '#fff',
              fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 20,
            }}>
              {ticket.responses.length} Response{ticket.responses.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div style={{ padding: '14px 14px 14px' }}>
            <HRResponsesCard responses={ticket.responses} />
          </div>
        </div>
      </div>

      {/* ── Right: case overview + timeline ── */}
      <div style={{
        width: 300, flexShrink: 0,
        borderLeft: '1px solid var(--color-border)',
        overflowY: 'auto',
        background: 'var(--color-bg-subtle)',
      }}>
        {/* Case summary */}
        <div style={{ padding: 16, borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <InfoCircleOutlined style={{ color: 'var(--color-primary)', fontSize: 14 }} />
            <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text-primary)' }}>Case Overview</span>
          </div>
          {([
            { label: 'Ticket ID',    value: ticket.ticketId },
            { label: 'Reported By',  value: `${ticket.reportedBy.name} (${ticket.reportedBy.id})` },
            { label: 'Request Date', value: ticket.requestDate },
            { label: 'Status',       value: ticket.ticketStatus },
            { label: 'Security',     value: ticket.securityLevel },
            { label: 'Nature',       value: ticket.natureOfConflict },
            ...(ticket.lastResolutionDate ? [{ label: 'Resolved On', value: ticket.lastResolutionDate }] : []),
          ] as { label: string; value: string }[]).map(row => (
            <div key={row.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              padding: '5px 0', borderBottom: '1px solid #f0f0f0', gap: 8,
            }}>
              <span style={{ fontSize: 11, color: 'var(--color-text-disabled)', fontWeight: 600, flexShrink: 0, width: 90 }}>
                {row.label}
              </span>
              <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', textAlign: 'right', fontWeight: 500 }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Response timeline */}
        <div style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <HistoryOutlined style={{ color: 'var(--color-primary)', fontSize: 14 }} />
            <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text-primary)' }}>Response History</span>
            <span style={{
              marginLeft: 'auto', background: 'var(--color-primary)', color: '#fff',
              borderRadius: 20, padding: '0 7px', fontSize: 11, fontWeight: 700,
            }}>{ticket.responses.length}</span>
          </div>
          {ticket.responses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--color-text-disabled)', fontSize: 12 }}>
              No responses yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[...ticket.responses].reverse().map((r, i) => {
                const attachCount = r.attachments?.length ?? 0;
                return (
                  <div key={i} style={{ display: 'flex', gap: 10 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: i === 0 ? 'var(--color-status-approved-bg)' : 'var(--color-bg-subtle)',
                        border: `2px solid ${i === 0 ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700, color: i === 0 ? 'var(--color-primary-dark)' : 'var(--color-text-tertiary)',
                      }}>
                        {ticket.responses.length - i}
                      </div>
                      {i < ticket.responses.length - 1 && (
                        <div style={{ width: 2, flex: 1, background: 'var(--color-bg-subtle)', minHeight: 20, marginTop: 4 }} />
                      )}
                    </div>
                    <div style={{
                      flex: 1, background: 'var(--color-bg-surface)',
                      border: `1px solid ${i === 0 ? 'var(--color-status-approved-bg)' : 'var(--color-border)'}`,
                      borderRadius: 8, padding: '8px 10px', fontSize: 12, marginBottom: 2,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{ fontWeight: 700, color: 'var(--color-text-secondary)', flex: 1 }}>{r.date}</span>
                        {attachCount > 0 && (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 3,
                            background: 'var(--color-status-approved-bg)', color: 'var(--color-primary)', border: '1px solid #bbf7d0',
                            fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 20,
                          }}>
                            <PaperClipOutlined style={{ fontSize: 9 }} />{attachCount}
                          </span>
                        )}
                      </div>
                      <div style={{ color: 'var(--color-text-tertiary)', fontSize: 11, marginBottom: r.remarks ? 6 : 0 }}>
                        {r.conflictType} · {r.resolutionStrategy}
                      </div>
                      {r.remarks && (
                        <div style={{
                          fontSize: 11, color: 'var(--color-text-secondary)',
                          background: 'var(--color-bg-subtle)', borderRadius: 6, padding: '5px 8px',
                          borderLeft: '2px solid #0f766e',
                        }}>
                          {r.remarks}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}

// ── Create Ticket Modal ────────────────────────────────────────────────────────
// Simulated session employee (auto-filled, read-only)
const SESSION_EMPLOYEE = { id: 'T881356', name: 'Ashraful Islam' };

const EMPLOYEE_OPTIONS = [
  { label: 'T881356 — Ashraful Islam',    value: 'T881356|Ashraful Islam' },
  { label: 'T881357 — Md. Arifur Islam',  value: 'T881357|Md. Arifur Islam' },
  { label: 'T881358 — Annanab Zaman',     value: 'T881358|Annanab Zaman' },
  { label: 'T881359 — Ishraq Ahmed',      value: 'T881359|Ishraq Ahmed' },
  { label: 'T881360 — Rabiul Karim',      value: 'T881360|Rabiul Karim' },
  { label: 'T881361 — Fatema Khatun',     value: 'T881361|Fatema Khatun' },
];

function CreateTicketModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (ticket: ConflictTicket) => void;
}) {
  const [form] = Form.useForm();

  const handleCreate = () => {
    form.validateFields().then(vals => {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const ticketId = `REQ-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}`;
      const involvedEmployees: Employee[] = (vals.employeesInvolved ?? []).map((v: string) => {
        const [id, name] = v.split('|');
        return { id, name };
      });
      const newTicket: ConflictTicket = {
        ticketId,
        conflictDescription:   vals.descriptionOfIncident,
        employeesInvolved:     involvedEmployees,
        natureOfConflict:      vals.natureOfConflict,
        reportedBy:            SESSION_EMPLOYEE,
        securityLevel:         'Low',
        requestDate:           `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}; ${pad(now.getHours())}:${pad(now.getMinutes())} ${now.getHours() < 12 ? 'AM' : 'PM'}`,
        ticketStatus:          'Pending',
        name:                  SESSION_EMPLOYEE.name,
        employeeId:            SESSION_EMPLOYEE.id,
        phoneNumber:           '',
        department:            '',
        dateOfIncident:        vals.dateOfIncident ? vals.dateOfIncident.format('DD-MM-YYYY') : '',
        timeOfIncident:        vals.dateOfIncident ? vals.dateOfIncident.format('hh:mm A') : '',
        location:              vals.location ?? '',
        witness:               (vals.witness ?? []).join(', '),
        descriptionOfIncident: vals.descriptionOfIncident,
        preferredOutcome:      vals.preferredOutcome ?? '',
        responses:             [],
      };
      onCreate(newTicket);
      form.resetFields();
      onClose();
    });
  };

  const handleReset = () => form.resetFields();

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ExclamationCircleOutlined style={{ color: 'var(--color-primary)' }} />
          <span style={{ fontWeight: 700 }}>Ticket Creation</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      width={640}
      styles={{ body: { maxHeight: 'calc(100vh - 220px)', overflowY: 'auto', paddingRight: 4 } }}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button onClick={handleReset}>Reset</Button>
          <Button type="primary" onClick={handleCreate}>Create</Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" requiredMark style={{ marginTop: 16 }}>
        {/* Employee ID — read-only, auto-filled from session */}
        <Form.Item label="Employee ID">
          <Input
            value={`${SESSION_EMPLOYEE.id} — ${SESSION_EMPLOYEE.name}`}
            readOnly
            prefix={<UserOutlined style={{ color: 'var(--color-text-disabled)' }} />}
            style={{ background: 'var(--color-bg-subtle)', color: 'var(--color-text-tertiary)', cursor: 'default' }}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Date of Incident"
              name="dateOfIncident"
              rules={[{ required: true, message: 'Required' }]}
            >
              <DatePicker showTime style={{ width: '100%' }} format="DD-MM-YYYY; hh:mm A" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Location"
              name="location"
              rules={[{ required: true, message: 'Required' }]}
            >
              <Input placeholder="e.g. Conference Room B" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Nature of the Conflict"
          name="natureOfConflict"
          rules={[{ required: true, message: 'Required' }]}
        >
          <Select
            placeholder="Select conflict type"
            options={['Policy Related', 'Tax Related', 'Interpersonal', 'Workplace Harassment', 'Other'].map(v => ({ label: v, value: v }))}
          />
        </Form.Item>

        <Form.Item
          label="Employee Involved"
          name="employeesInvolved"
          rules={[{ required: true, message: 'Select at least one employee' }]}
        >
          <Select
            mode="multiple"
            placeholder="Search by ID or name"
            options={EMPLOYEE_OPTIONS}
            filterOption={(input, opt) => (opt?.label as string).toLowerCase().includes(input.toLowerCase())}
            showSearch
          />
        </Form.Item>

        <Form.Item
          label="Witness"
          name="witness"
          rules={[{ required: true, message: 'Required' }]}
        >
          <Select
            mode="multiple"
            placeholder="Search by ID or name"
            options={EMPLOYEE_OPTIONS}
            filterOption={(input, opt) => (opt?.label as string).toLowerCase().includes(input.toLowerCase())}
            showSearch
          />
        </Form.Item>

        <Form.Item
          label="Description of the Incident"
          name="descriptionOfIncident"
          rules={[{ required: true, message: 'Required' }]}
        >
          <Input.TextArea rows={3} placeholder="Describe the conflict in detail…" />
        </Form.Item>

        <Form.Item label="Preferred Outcome" name="preferredOutcome">
          <Input.TextArea rows={2} placeholder="What resolution does the employee expect?" />
        </Form.Item>

        <Form.Item
          label="Attachments"
          name="attachments"
          valuePropName="value"
          getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
        >
          <AttachmentUpload />
        </Form.Item>
      </Form>
    </Modal>
  );
}

// ── Status tab config ──────────────────────────────────────────────────────────
const STATUS_TABS: { key: TicketStatus | 'all'; label: string }[] = [
  { key: 'all',     label: 'All'     },
  { key: 'Pending', label: 'Pending' },
  { key: 'Ongoing', label: 'Ongoing' },
  { key: 'Closed',  label: 'Closed'  },
];

interface Filters {
  search:    string;
  nature:    string;
  strategy:  string;
  security:  string;
  dateRange: DateRange;
}
const EMPTY_FILTERS: Filters = { search: '', nature: '', strategy: '', security: '', dateRange: null };

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ConflictResolutionPage() {
  const [tickets,       setTickets]      = useState<ConflictTicket[]>(MOCK_TICKETS);
  const [draft,         setDraft]        = useState<Filters>(EMPTY_FILTERS);
  const [applied,       setApplied]      = useState<Filters>(EMPTY_FILTERS);
  const [activeTab,     setActiveTab]    = useState<TicketStatus | 'all'>('all');
  const [showFilters,   setShowFilters]  = useState(false);
  const [responseTicket, setResponseTicket] = useState<ConflictTicket | null>(null);
  const [viewTicket,    setViewTicket]   = useState<ConflictTicket | null>(null);

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
    if (applied.strategy) rows = rows.filter(t => t.responses.some(r => r.resolutionStrategy === applied.strategy));
    return rows;
  }, [tickets, activeTab, applied]);

  const handleSaveResponse = (ticketId: string, data: Partial<HRResponse>) => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const today = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}`;
    const newResponse: HRResponse = {
      date:                   today,
      conflictType:           (data.conflictType as ConflictType) ?? 'Other',
      securityLevel:          (data.securityLevel as SecurityLevel) ?? 'Low',
      assignPersonnel:        (data.assignPersonnel as string[]) ?? [],
      preferredActions:       (data.preferredActions as string[]) ?? [],
      preferredDateOfMeeting: data.preferredDateOfMeeting ?? '',
      resolutionStrategy:     (data.resolutionStrategy as ResolutionStrategy) ?? 'Negotiation',
      remarks:                data.remarks ?? '',
    };
    setTickets(prev => prev.map(t => t.ticketId === ticketId ? { ...t, responses: [...t.responses, newResponse] } : t));
  };

  const closeTicket = (ticketId: string) => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const today = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}; ${pad(now.getHours())}:${pad(now.getMinutes())} ${now.getHours() < 12 ? 'AM' : 'PM'}`;
    setTickets(prev => prev.map(t => t.ticketId === ticketId ? { ...t, ticketStatus: 'Closed', lastResolutionDate: today } : t));
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

  const handleMoveToCompliance = (ticketId: string) => {
    setTickets(prev => prev.map(t => t.ticketId === ticketId ? { ...t, ticketStatus: 'Ongoing' } : t));
  };

  const colHead = (label: string) => (
    <span style={{ fontSize: 11, color: 'var(--color-text-disabled)', fontWeight: 700, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
      {label}
    </span>
  );

  const columns: ColumnsType<ConflictTicket> = [
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
              if (key === 'compliance') handleMoveToCompliance(record.ticketId);
            },
            items: [
              { key: 'response',   icon: <MessageOutlined />,     label: 'Response',           disabled: record.ticketStatus === 'Closed' },
              { key: 'view',       icon: <EyeOutlined />,         label: 'View Details' },
              { type: 'divider' as const },
              { key: 'compliance', icon: <ArrowRightOutlined />,  label: 'Move to Compliance', disabled: record.ticketStatus === 'Closed' },
              { key: 'close',      icon: <CloseCircleOutlined />, label: 'Close Ticket',        disabled: record.ticketStatus === 'Closed', danger: true },
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
          <h1>Conflict Resolution Tracker</h1>
          <p>Track, respond to and resolve workplace conflict tickets</p>
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
                border: isActive ? '1.5px solid #0f766e' : '1.5px solid #d8e7e5',
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
          scroll={{ x: 1380 }}
          pagination={false}
          size="middle"
          style={{ fontSize: 13 }}
        />
      </div>

      {/* ── Drawers & Modals ── */}
      <ResponseDrawer
        ticket={responseTicket}
        open={!!responseTicket}
        onClose={() => setResponseTicket(null)}
        onSave={handleSaveResponse}
        onCloseTicket={(id) => { closeTicket(id); setResponseTicket(null); }}
        onMoveToCompliance={(id) => { handleMoveToCompliance(id); setResponseTicket(null); }}
      />
      <ViewDetailsDrawer
        ticket={viewTicket}
        open={!!viewTicket}
        onClose={() => setViewTicket(null)}
      />
    </div>
  );
}
