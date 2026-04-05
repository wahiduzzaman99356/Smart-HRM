import { useState, useMemo, useCallback, useEffect, memo } from 'react';
import {
  Button, Input, Select, DatePicker, Table, Tooltip, Drawer,
  Form, Upload, Collapse, Modal, Dropdown, Divider,
  Row, Col, Space, message,
} from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import {
  PlusOutlined, SearchOutlined, ReloadOutlined, FilterOutlined,
  EyeOutlined, UploadOutlined, LockOutlined, UserOutlined,
  HistoryOutlined, ExclamationCircleOutlined, CalendarOutlined,
  MoreOutlined, FileOutlined, DeleteOutlined, SendOutlined,
  WarningFilled, CloseOutlined, InfoCircleOutlined,
  FilePdfOutlined, CopyOutlined, AuditOutlined,
  MessageOutlined, PaperClipOutlined, UpOutlined, DownOutlined,
} from '@ant-design/icons';

type DateRange = RangePickerProps['value'];
const { RangePicker } = DatePicker;
const { Panel } = Collapse;

// ── Types ──────────────────────────────────────────────────────────────────────
type TabKey        = 'all' | 'Pending' | 'Ongoing' | 'Closed';
type TicketStatus  = 'Pending' | 'Ongoing' | 'Closed';
type SecurityLevel = 'Low' | 'Medium' | 'High' | 'Critical';
type NatureType    =
  | 'Anti-Harassment'
  | 'Fraud / Forgery'
  | 'Workplace Violence'
  | 'Theft / Pilferage'
  | 'Policy Violation'
  | 'Misconduct';

interface Employee { id: string; name: string }

interface InvQALine {
  id: string;
  questionText: string;
  requiresAttachment: boolean;
}

interface InvQASession {
  sentBy: string;
  sentAt: string;
  questions: InvQALine[];
}

interface ShowCauseNotice {
  ref:         string;
  description: string;
  isOverdue:   boolean;
}

interface ComplaintTicket {
  ticketId:             string;
  conflictDescription:  string;
  employeesInvolved:    Employee[];
  nature:               NatureType;
  reportedBy:           Employee & { anonymous?: boolean };
  security:             SecurityLevel;
  requestDate:          string;
  status:               TicketStatus;
  resolutionDate?:      string;
  showCause?:           ShowCauseNotice;
  investigationQA?:     InvQASession;
  // Section A
  submitterName:        string;
  submitterId:          string;
  phoneNumber:          string;
  department:           string;
  dateOfIncident:       string;
  timeOfIncident:       string;
  location:             string;
  witness:              string;
  descriptionOfIncident:string;
  preferredOutcome:     string;
}

// ── Mock data ──────────────────────────────────────────────────────────────────
const MOCK_TICKETS: ComplaintTicket[] = [
  {
    ticketId: 'REQ-282682-0006',
    conflictDescription: 'Multiple female employees reported sustained verbal harassment and intimidation by a senior supervisor during shift hours.',
    employeesInvolved: [{ id: 'T995200', name: 'Kamrul Islam' }],
    nature: 'Anti-Harassment',
    reportedBy: { id: 'ANON-001', name: 'Anonymous (via HR)', anonymous: true },
    security: 'High',
    requestDate: '01-02-2026; 06:00 AM',
    status: 'Ongoing',
    investigationQA: {
      sentBy: 'Dr. Anwar Hossain (Committee Head)',
      sentAt: '05-02-2026; 11:00 AM',
      questions: [
        { id: 'iq-1a', questionText: 'Can you describe in detail what occurred during the morning briefing on 31-01-2026?', requiresAttachment: false },
        { id: 'iq-1b', questionText: 'Were there any witnesses present at the time of the alleged incident?', requiresAttachment: false },
        { id: 'iq-1c', questionText: 'Please provide any written records, chat logs, or other evidence supporting your account.', requiresAttachment: true },
      ],
    },
    submitterName: 'Kamrul Islam', submitterId: 'T995200',
    phoneNumber: '01712345678', department: 'Production',
    dateOfIncident: '31-01-2026', timeOfIncident: '08:30 AM',
    location: 'Production Floor A', witness: 'T995201 (Jamal Uddin)',
    descriptionOfIncident: 'The supervisor consistently uses demeaning and derogatory language towards female team members during morning briefings, creating a hostile work environment.',
    preferredOutcome: 'Formal warning issued and anti-harassment training conducted.',
  },
  {
    ticketId: 'REQ-282681-0005',
    conflictDescription: 'Faruk Hossain was found to have been selling company server access credentials to external parties.',
    employeesInvolved: [{ id: 'T990033', name: 'Faruk Hossain' }],
    nature: 'Fraud / Forgery',
    reportedBy: { id: 'T770001', name: 'IT Director' },
    security: 'Critical',
    requestDate: '05-01-2026; 06:00 AM',
    status: 'Closed',
    resolutionDate: '20-01-2026; 10:00 AM',
    submitterName: 'Faruk Hossain', submitterId: 'T990033',
    phoneNumber: '01812345679', department: 'IT Operations',
    dateOfIncident: '03-01-2026', timeOfIncident: '11:00 PM',
    location: 'Server Room', witness: 'None',
    descriptionOfIncident: 'CCTV footage and access logs confirmed the employee accessing and transmitting server credentials via personal email to an external IP address.',
    preferredOutcome: 'Termination and legal referral.',
  },
  {
    ticketId: 'REQ-282682-0004',
    conflictDescription: 'Sumon Das physically assaulted a co-worker during the morning shift on the production floor.',
    employeesInvolved: [{ id: 'T991055', name: 'Sumon Das' }],
    nature: 'Workplace Violence',
    reportedBy: { id: 'T880055', name: 'Line Supervisor' },
    security: 'Critical',
    requestDate: '20-02-2026; 06:00 AM',
    status: 'Ongoing',
    investigationQA: {
      sentBy: 'Rezaul Karim (Committee Member)',
      sentAt: '22-02-2026; 02:00 PM',
      questions: [
        { id: 'iq-2a', questionText: 'Did you initiate the physical altercation with your colleague on 19-02-2026?', requiresAttachment: false },
        { id: 'iq-2b', questionText: 'What was the nature of the task allocation dispute that preceded the incident?', requiresAttachment: false },
        { id: 'iq-2c', questionText: 'Please submit any medical or HR-related documentation relevant to this case.', requiresAttachment: true },
        { id: 'iq-2d', questionText: 'Have you had any prior disciplinary issues with this colleague or others?', requiresAttachment: false },
      ],
    },
    submitterName: 'Sumon Das', submitterId: 'T991055',
    phoneNumber: '01612345680', department: 'Manufacturing',
    dateOfIncident: '19-02-2026', timeOfIncident: '07:45 AM',
    location: 'Assembly Line B', witness: 'T880056 (Rafik Miah)',
    descriptionOfIncident: 'Employee engaged in a physical altercation with a colleague following a dispute over task allocation. The incident was witnessed by the line supervisor.',
    preferredOutcome: 'Suspension and mandatory anger management counselling.',
  },
  {
    ticketId: 'REQ-282683-0003',
    conflictDescription: 'Jahidul Haque and Rahim Uddin were caught on CCTV removing inventory items from the warehouse without authorization.',
    employeesInvolved: [
      { id: 'T994100', name: 'Jahidul Haque' },
      { id: 'T994101', name: 'Rahim Uddin' },
    ],
    nature: 'Theft / Pilferage',
    reportedBy: { id: 'T880100', name: 'Security Officer' },
    security: 'Critical',
    requestDate: '10-03-2026; 06:00 AM',
    status: 'Ongoing',
    showCause: {
      ref: 'SC-2026-0003',
      description: 'Please provide your written explanation regarding the unauthorized removal of inventory items from the warehouse on 08-03-2026.',
      isOverdue: true,
    },
    submitterName: 'Jahidul Haque', submitterId: 'T994100',
    phoneNumber: '01512345681', department: 'Warehouse',
    dateOfIncident: '08-03-2026', timeOfIncident: '10:30 PM',
    location: 'Warehouse Zone C', witness: 'CCTV Footage',
    descriptionOfIncident: 'Two employees were recorded on CCTV removing six cartons of goods from the warehouse storage area without any requisition slip or approval.',
    preferredOutcome: 'Fair investigation and written acknowledgement.',
  },
  {
    ticketId: 'REQ-282683-0002',
    conflictDescription: 'Nasrin Akter repeatedly violated the office attendance policy by clocking in late without prior approval.',
    employeesInvolved: [{ id: 'T993045', name: 'Nasrin Akter' }],
    nature: 'Policy Violation',
    reportedBy: { id: 'T770200', name: 'HR Admin' },
    security: 'Low',
    requestDate: '15-03-2026; 06:00 AM',
    status: 'Ongoing',
    submitterName: 'Nasrin Akter', submitterId: 'T993045',
    phoneNumber: '01712345682', department: 'Administration',
    dateOfIncident: '01-03-2026', timeOfIncident: '09:45 AM',
    location: 'Admin Office', witness: 'Attendance System Log',
    descriptionOfIncident: 'The employee has clocked in late on 14 occasions in February without any pre-approved leave or valid reason submitted to the department head.',
    preferredOutcome: 'Policy reminder and formal counselling session.',
  },
  {
    ticketId: 'REQ-282683-0001',
    conflictDescription: 'Employee Rafiq Ahmed was found engaging in misconduct during office hours involving unauthorized use of company resources.',
    employeesInvolved: [{ id: 'T992001', name: 'Rafiq Ahmed' }],
    nature: 'Misconduct',
    reportedBy: { id: 'T881356', name: 'Ashraful Islam' },
    security: 'Medium',
    requestDate: '20-03-2026; 06:00 AM',
    status: 'Pending',
    submitterName: 'Rafiq Ahmed', submitterId: 'T992001',
    phoneNumber: '01812345683', department: 'Logistics',
    dateOfIncident: '18-03-2026', timeOfIncident: '02:00 PM',
    location: 'Logistics Bay', witness: 'T881357 (Sumaiya)',
    descriptionOfIncident: 'The employee was found using company vehicles and fuel for personal trips during working hours without any authorization or approval from management.',
    preferredOutcome: 'Written warning and deduction from salary.',
  },
];

// ── Colour maps ────────────────────────────────────────────────────────────────
const STATUS_CFG: Record<TicketStatus, { bg: string; text: string; dot: string }> = {
  'Pending': { bg: 'var(--color-status-pending-bg)', text: '#d97706', dot: '#f59e0b' },
  'Ongoing': { bg: 'var(--color-status-info-bg)', text: '#2563eb', dot: '#3b82f6' },
  'Closed':  { bg: 'var(--color-bg-subtle)', text: 'var(--color-text-tertiary)', dot: 'var(--color-text-disabled)' },
};

const SEC_CFG: Record<SecurityLevel, { bg: string; text: string; border: string }> = {
  Low:      { bg: 'var(--color-status-approved-bg)', text: '#15803d', border: 'var(--color-status-approved-bg)' },
  Medium:   { bg: 'var(--color-status-pending-bg)', text: '#d97706', border: 'rgba(253, 230, 138, 0.4)' },
  High:     { bg: 'rgba(249, 115, 22, 0.10)', text: '#c2410c', border: 'rgba(251, 146, 60, 0.22)' },
  Critical: { bg: 'var(--color-status-rejected-bg)', text: '#dc2626', border: 'var(--color-status-rejected-bg)' },
};

const NATURE_COLOR: Record<NatureType, string> = {
  'Anti-Harassment':   '#7c3aed',
  'Fraud / Forgery':   '#dc2626',
  'Workplace Violence':'#c2410c',
  'Theft / Pilferage': '#b45309',
  'Policy Violation':  '#0369a1',
  'Misconduct':        'var(--color-text-secondary)',
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

function NatureBadge({ nature }: { nature: NatureType }) {
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
          <Tooltip title={e.name}>
            <span style={{ cursor: 'default' }}>{e.id} ({e.name})</span>
          </Tooltip>
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
function SectionLabel({ children, color = 'employee' }: { children: React.ReactNode; color?: 'employee' | 'hr' }) {
  const isHr = color === 'hr';
  return (
    <div style={{
      padding: '6px 14px',
      background: isHr ? 'rgba(249, 115, 22, 0.10)' : 'var(--color-primary-tint)',
      borderLeft: `3px solid ${isHr ? '#f97316' : 'var(--color-primary)'}`,
      fontWeight: 700, fontSize: 12,
      color: isHr ? '#c2410c' : 'var(--color-primary-dark)',
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

// ── Attachment Upload ──────────────────────────────────────────────────────────
const ATTACHMENT_TYPE_OPTIONS = [
  'Evidence (Email)', 'Evidence (Documents)', 'Evidence (Screenshots/Socials)',
  'Statement', 'Report', 'Summary', 'Other',
];

const FileRow = memo(function FileRow({
  file, onRemove, onView,
}: {
  file: UploadFile;
  onRemove: (uid: string) => void;
  onView: (file: UploadFile) => void;
}) {
  const [attachType, setAttachType] = useState<string>('');
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)',
      borderRadius: 7, padding: '5px 10px', fontSize: 12, color: 'var(--color-text-secondary)',
    }}>
      <FileOutlined style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
        {file.name}
      </span>
      <span style={{ fontSize: 11, color: 'var(--color-text-disabled)', flexShrink: 0 }}>
        {file.size ? `${(file.size / 1024).toFixed(1)} KB` : ''}
      </span>
      <select
        value={attachType}
        onChange={e => setAttachType(e.target.value)}
        style={{
          width: 190, flexShrink: 0, height: 24, fontSize: 11,
          border: '1px solid #d9d9d9', borderRadius: 6, padding: '0 6px',
          background: 'var(--color-bg-surface)', color: attachType ? 'var(--color-text-secondary)' : 'var(--color-text-disabled)',
          cursor: 'pointer', outline: 'none',
        }}
      >
        <option value="" disabled>Type</option>
        {ATTACHMENT_TYPE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <Tooltip title="View">
        <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => onView(file)}
          style={{ color: 'var(--color-primary)', padding: '0 4px', height: 22, flexShrink: 0 }} />
      </Tooltip>
      <Tooltip title="Remove">
        <Button type="text" size="small" icon={<DeleteOutlined />} onClick={() => onRemove(file.uid)}
          style={{ color: '#ef4444', padding: '0 4px', height: 22, flexShrink: 0 }} />
      </Tooltip>
    </div>
  );
});

function AttachmentUpload({
  value, onChange, maxCount = 10, buttonSize,
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
      uid: `${file.name}-${Date.now()}`, name: file.name, status: 'done',
      size: file.size, type: file.type, originFileObj: file as UploadFile['originFileObj'],
    };
    onChange?.([...(value ?? []), newFile]);
    return false;
  }

  const files = value ?? [];
  return (
    <>
      <Upload beforeUpload={handleBeforeUpload} showUploadList={false} multiple={maxCount > 1}>
        <Button icon={<UploadOutlined />} size={buttonSize} disabled={files.length >= maxCount}>
          Attach Files
        </Button>
      </Upload>
      {files.length > 0 && (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {files.map(f => (
            <FileRow key={f.uid} file={f} onRemove={handleRemove} onView={handleView} />
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
          const isImg  = viewingFile.type?.startsWith('image/');
          const isPdf  = viewingFile.type === 'application/pdf';
          if (!url) return <div style={{ textAlign: 'center', color: 'var(--color-text-disabled)', padding: '40px 0' }}>Preview not available.</div>;
          if (isImg) return <img src={url} alt={viewingFile.name} style={{ width: '100%', borderRadius: 8 }} />;
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

// ── Respond to Show Cause Drawer ───────────────────────────────────────────────
function RespondDrawer({
  ticket, open, onClose, onSubmit,
}: {
  ticket: ComplaintTicket | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (ticketId: string) => void;
}) {
  const [form] = Form.useForm();

  if (!ticket) return null;

  const handleSubmit = () => {
    form.validateFields().then(() => {
      onSubmit(ticket.ticketId);
      form.resetFields();
      onClose();
    });
  };

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <SendOutlined style={{ color: 'var(--color-primary)' }} />
          <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>Respond to Show Cause</span>
          <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)', fontWeight: 400 }}>— {ticket.ticketId}</span>
          <StatusBadge status={ticket.status} />
        </div>
      }
      open={open}
      onClose={onClose}
      width="82%"
      styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column', height: '100%' } }}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '10px 0' }}>
          <Button onClick={() => form.resetFields()}>Reset</Button>
          <Button type="primary" icon={<SendOutlined />} onClick={handleSubmit}>
            Submit Response
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* ── Left: response form ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <SectionLabel>Section — A (Complaint Details)</SectionLabel>
          <Row gutter={[16, 0]}>
            <Col span={8}><ReadField label="Ticket ID"              value={ticket.ticketId} /></Col>
            <Col span={8}><ReadField label="Name"                   value={ticket.submitterName} /></Col>
            <Col span={8}><ReadField label="Employee ID"            value={ticket.submitterId} /></Col>
            <Col span={8}><ReadField label="Phone Number"           value={ticket.phoneNumber} /></Col>
            <Col span={8}><ReadField label="Department"             value={ticket.department} /></Col>
            <Col span={8}><ReadField label="Date of Incident"       value={ticket.dateOfIncident} /></Col>
            <Col span={8}><ReadField label="Time of Incident"       value={ticket.timeOfIncident} /></Col>
            <Col span={8}><ReadField label="Location"               value={ticket.location} /></Col>
            <Col span={8}><ReadField label="Nature of Complaint"    value={ticket.nature} /></Col>
            <Col span={12}>
              <ReadField
                label="Employee Involved"
                value={ticket.employeesInvolved.map(e => `${e.id} (${e.name})`).join('; ')}
              />
            </Col>
            <Col span={12}><ReadField label="Witness"               value={ticket.witness} /></Col>
            <Col span={24}><ReadField label="Description of Incident" value={ticket.descriptionOfIncident} /></Col>
            <Col span={24}><ReadField label="Preferred Outcome"     value={ticket.preferredOutcome} /></Col>
          </Row>

          <Divider style={{ margin: '4px 0 16px' }} />

          <SectionLabel color="hr">Section — B (Your Response)</SectionLabel>

          {ticket.showCause && (
            <div style={{
              marginBottom: 16, padding: '10px 14px',
              background: 'rgba(249, 115, 22, 0.10)', border: '1px solid #fed7aa', borderRadius: 8,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#c2410c', marginBottom: 4 }}>
                Show Cause Notice — {ticket.showCause.ref}
                {ticket.showCause.isOverdue && (
                  <span style={{
                    marginLeft: 8, padding: '1px 7px', borderRadius: 4,
                    fontSize: 10, fontWeight: 700, color: '#fff', background: '#dc2626',
                  }}>
                    OVERDUE
                  </span>
                )}
              </div>
              <div style={{ fontSize: 13, color: '#d97706' }}>{ticket.showCause.description}</div>
            </div>
          )}

          <Form form={form} layout="vertical" requiredMark>
            <Form.Item
              label="Written Explanation"
              name="explanation"
              rules={[
                { required: true, message: 'Please provide your explanation.' },
                { min: 50, message: 'Explanation must be at least 50 characters.' },
              ]}
            >
              <Input.TextArea
                rows={6}
                placeholder="Provide a detailed, honest explanation of the circumstances surrounding the incident…"
              />
            </Form.Item>
            <Form.Item
              label="Attachments"
              name="attachments"
              valuePropName="value"
              getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
            >
              <AttachmentUpload maxCount={5} buttonSize="small" />
            </Form.Item>
          </Form>
        </div>

        {/* ── Right: ticket history panel ── */}
        <div style={{
          width: 280, flexShrink: 0,
          borderLeft: '1px solid var(--color-border)',
          overflowY: 'auto', padding: 16,
          background: 'var(--color-bg-subtle)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <HistoryOutlined style={{ color: 'var(--color-primary)' }} />
            <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text-primary)' }}>Ticket Info</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Ticket ID',    value: ticket.ticketId },
              { label: 'Status',       value: ticket.status },
              { label: 'Security',     value: ticket.security },
              { label: 'Nature',       value: ticket.nature },
              { label: 'Request Date', value: ticket.requestDate },
              { label: 'Reported By',  value: `${ticket.reportedBy.id} (${ticket.reportedBy.name})` },
            ].map(f => (
              <div key={f.label} style={{ fontSize: 12, borderBottom: '1px solid #f0f0f0', paddingBottom: 8 }}>
                <div style={{ color: 'var(--color-text-disabled)', fontWeight: 600, marginBottom: 2 }}>{f.label}</div>
                <div style={{ color: 'var(--color-text-primary)' }}>{f.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  );
}

// ── View Details Drawer ────────────────────────────────────────────────────────
function ViewDetailsDrawer({
  ticket, open, onClose,
}: {
  ticket: ComplaintTicket | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!ticket) return null;
  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <EyeOutlined style={{ color: 'var(--color-primary)' }} />
          <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>View Details</span>
          <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)', fontWeight: 400 }}>— {ticket.ticketId}</span>
        </div>
      }
      open={open}
      onClose={onClose}
      width={600}
      styles={{ body: { padding: 24 } }}
    >
      <SectionLabel>Section — A (Complaint Details)</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
        <ReadField label="Ticket ID"              value={ticket.ticketId} />
        <ReadField label="Name"                   value={ticket.submitterName} />
        <ReadField label="Employee ID"            value={ticket.submitterId} />
        <ReadField label="Phone Number"           value={ticket.phoneNumber} />
        <ReadField label="Department"             value={ticket.department} />
        <ReadField label="Date of Incident"       value={ticket.dateOfIncident} />
        <ReadField label="Time of Incident"       value={ticket.timeOfIncident} />
        <ReadField label="Location"               value={ticket.location} />
        <ReadField label="Nature of Complaint"    value={ticket.nature} />
        <ReadField label="Witness"                value={ticket.witness} />
      </div>
      <ReadField
        label="Employee Involved"
        value={ticket.employeesInvolved.map(e => `${e.id} (${e.name})`).join('; ')}
      />
      <ReadField label="Description of Incident" value={ticket.descriptionOfIncident} />
      <ReadField label="Preferred Outcome"        value={ticket.preferredOutcome} />
      <ReadField label="Attachments"              value="No attachments submitted" />

      {ticket.showCause && (
        <>
          <Divider style={{ margin: '8px 0 16px' }} />
          <SectionLabel color="hr">Show Cause — {ticket.showCause.ref}</SectionLabel>
          <div style={{ padding: '10px 14px', background: 'rgba(249, 115, 22, 0.10)', border: '1px solid #fed7aa', borderRadius: 8, fontSize: 13, color: '#d97706' }}>
            {ticket.showCause.description}
          </div>
        </>
      )}
    </Drawer>
  );
}

// ── Investigation Respond Drawer ───────────────────────────────────────────────
interface InvAnswerState {
  text: string;
  files: UploadFile[];
}

function InvestigationRespondDrawer({
  ticket, open, onClose, onSubmit,
}: {
  ticket: ComplaintTicket | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (ticketId: string) => void;
}) {
  const [answers, setAnswers] = useState<Record<string, InvAnswerState>>({});

  // Reset answers each time the drawer opens for a (potentially different) ticket
  useEffect(() => {
    if (!open || !ticket?.investigationQA) return;
    const init: Record<string, InvAnswerState> = {};
    ticket.investigationQA.questions.forEach(q => { init[q.id] = { text: '', files: [] }; });
    setAnswers(init);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, ticket?.ticketId]);

  if (!ticket || !ticket.investigationQA) return null;

  const qa = ticket.investigationQA;
  const allAnswered = qa.questions.every(q => (answers[q.id]?.text ?? '').trim().length > 0);

  const setAnswer = (id: string, patch: Partial<InvAnswerState>) =>
    setAnswers(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const handleSubmit = () => {
    if (!allAnswered) { message.warning('Please answer all questions before submitting.'); return; }
    onSubmit(ticket.ticketId);
    onClose();
    message.success('Your responses have been submitted to the investigation committee.');
  };

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <MessageOutlined style={{ color: 'var(--color-primary)' }} />
          <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>Investigation Respond</span>
          <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)', fontWeight: 400 }}>— {ticket.ticketId}</span>
          <StatusBadge status={ticket.status} />
        </div>
      }
      open={open}
      onClose={onClose}
      width="82%"
      styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column', height: '100%' } }}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '10px 0' }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSubmit}
            disabled={!allAnswered}
          >
            Submit Responses
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── Left: Q&A response form ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>

          {/* Session info banner */}
          <div style={{
            marginBottom: 20, padding: '10px 14px',
            background: 'rgba(6, 182, 212, 0.10)', border: '1px solid #a5f3fc', borderRadius: 8,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#0e7490', marginBottom: 2 }}>
              <MessageOutlined style={{ marginRight: 6 }} />
              Q&amp;A Session — sent by {qa.sentBy}
            </div>
            <div style={{ fontSize: 12, color: '#164e63' }}>
              Received on {qa.sentAt} · Please answer all questions thoroughly and honestly.
            </div>
          </div>

          {/* Questions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {qa.questions.map((q, idx) => {
              const ans = answers[q.id] ?? { text: '', files: [] };
              return (
                <div key={q.id} style={{
                  border: '1px solid var(--color-border)', borderRadius: 10, overflow: 'hidden',
                }}>
                  {/* Question header */}
                  <div style={{ padding: '10px 16px', background: 'var(--color-bg-subtle)', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%', background: 'var(--color-status-info-bg)',
                        color: '#3B6EEA', fontSize: 12, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        {idx + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.6 }}>
                          {q.questionText}
                        </div>
                        {q.requiresAttachment && (
                          <div style={{ fontSize: 11, color: '#d97706', marginTop: 4 }}>
                            <PaperClipOutlined style={{ marginRight: 4 }} />
                            Attachment required — please upload a supporting document
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Answer area */}
                  <div style={{ padding: '12px 16px' }}>
                    <Input.TextArea
                      placeholder="Type your answer here…"
                      value={ans.text}
                      onChange={e => setAnswer(q.id, { text: e.target.value })}
                      rows={3}
                      style={{ fontSize: 13, resize: 'vertical', marginBottom: q.requiresAttachment ? 10 : 0 }}
                    />
                    {q.requiresAttachment && (
                      <AttachmentUpload
                        value={ans.files}
                        onChange={files => setAnswer(q.id, { files })}
                        maxCount={3}
                        buttonSize="small"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right: ticket info panel ── */}
        <div style={{
          width: 280, flexShrink: 0,
          borderLeft: '1px solid var(--color-border)',
          overflowY: 'auto', padding: 16,
          background: 'var(--color-bg-subtle)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <HistoryOutlined style={{ color: 'var(--color-primary)' }} />
            <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text-primary)' }}>Ticket Info</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {[
              { label: 'Ticket ID',    value: ticket.ticketId },
              { label: 'Status',       value: ticket.status },
              { label: 'Security',     value: ticket.security },
              { label: 'Nature',       value: ticket.nature },
              { label: 'Request Date', value: ticket.requestDate },
              { label: 'Department',   value: ticket.department },
            ].map(f => (
              <div key={f.label} style={{ fontSize: 12, borderBottom: '1px solid #f0f0f0', paddingBottom: 8 }}>
                <div style={{ color: 'var(--color-text-disabled)', fontWeight: 600, marginBottom: 2 }}>{f.label}</div>
                <div style={{ color: 'var(--color-text-primary)' }}>{f.value}</div>
              </div>
            ))}
          </div>

          <Divider style={{ margin: '0 0 12px' }} />
          <div style={{ fontSize: 12, fontWeight: 700, color: '#0e7490', marginBottom: 6 }}>
            Session Summary
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
            <span style={{ color: 'var(--color-text-tertiary)' }}>Sent by:</span> {qa.sentBy}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
            <span style={{ color: 'var(--color-text-tertiary)' }}>Sent at:</span> {qa.sentAt}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
            <span style={{ color: 'var(--color-text-tertiary)' }}>Questions:</span> {qa.questions.length}
          </div>
        </div>
      </div>
    </Drawer>
  );
}

// ── Create Complaint Modal ─────────────────────────────────────────────────────
const SESSION_EMPLOYEE = { id: 'T881356', name: 'Ashraful Islam' };

const EMPLOYEE_OPTIONS = [
  { label: 'T881356 — Ashraful Islam',    value: 'T881356|Ashraful Islam' },
  { label: 'T881357 — Md. Arifur Islam',  value: 'T881357|Md. Arifur Islam' },
  { label: 'T881358 — Annanab Zaman',     value: 'T881358|Annanab Zaman' },
  { label: 'T881359 — Ishraq Ahmed',      value: 'T881359|Ishraq Ahmed' },
  { label: 'T881360 — Rabiul Karim',      value: 'T881360|Rabiul Karim' },
  { label: 'T881361 — Fatema Khatun',     value: 'T881361|Fatema Khatun' },
  { label: 'T992001 — Rafiq Ahmed',       value: 'T992001|Rafiq Ahmed' },
  { label: 'T993045 — Nasrin Akter',      value: 'T993045|Nasrin Akter' },
];

function CreateComplaintModal({
  open, onClose, onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (ticket: ComplaintTicket) => void;
}) {
  const [form] = Form.useForm();

  const handleCreate = () => {
    form.validateFields().then(vals => {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const ticketId = `REQ-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
      const involvedEmployees: Employee[] = (vals.employeesInvolved ?? []).map((v: string) => {
        const [id, name] = v.split('|');
        return { id, name };
      });
      const newTicket: ComplaintTicket = {
        ticketId,
        conflictDescription:   vals.descriptionOfIncident,
        employeesInvolved:     involvedEmployees,
        nature:                vals.nature,
        reportedBy:            SESSION_EMPLOYEE,
        security:              'Low',
        requestDate:           `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}; ${pad(now.getHours())}:${pad(now.getMinutes())} ${now.getHours() < 12 ? 'AM' : 'PM'}`,
        status:                'Pending',
        submitterName:         SESSION_EMPLOYEE.name,
        submitterId:           SESSION_EMPLOYEE.id,
        phoneNumber:           '',
        department:            '',
        dateOfIncident:        vals.dateOfIncident ? vals.dateOfIncident.format('DD-MM-YYYY') : '',
        timeOfIncident:        vals.dateOfIncident ? vals.dateOfIncident.format('hh:mm A') : '',
        location:              vals.location ?? '',
        witness:               (vals.witness ?? []).join(', '),
        descriptionOfIncident: vals.descriptionOfIncident,
        preferredOutcome:      vals.preferredOutcome ?? '',
      };
      onCreate(newTicket);
      form.resetFields();
      onClose();
      message.success('Complaint filed successfully. Ticket ID assigned.');
    });
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ExclamationCircleOutlined style={{ color: 'var(--color-primary)' }} />
          <span style={{ fontWeight: 700 }}>File a New Complaint</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      width={640}
      styles={{ body: { maxHeight: 'calc(100vh - 220px)', overflowY: 'auto', paddingRight: 4 } }}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button onClick={() => form.resetFields()}>Reset</Button>
          <Button type="primary" onClick={handleCreate}>Submit Complaint</Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" requiredMark style={{ marginTop: 16 }}>
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
              <Input placeholder="e.g. Production Floor B" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Nature of Complaint"
          name="nature"
          rules={[{ required: true, message: 'Required' }]}
        >
          <Select
            placeholder="Select complaint type"
            options={([
              'Anti-Harassment', 'Fraud / Forgery', 'Workplace Violence',
              'Theft / Pilferage', 'Policy Violation', 'Misconduct',
            ] as NatureType[]).map(v => ({ label: v, value: v }))}
          />
        </Form.Item>

        <Form.Item
          label="Employee(s) Involved"
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

        <Form.Item label="Witness" name="witness">
          <Select
            mode="multiple"
            placeholder="Search by ID or name (optional)"
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
          <Input.TextArea rows={4} placeholder="Describe the incident in detail…" />
        </Form.Item>

        <Form.Item label="Preferred Outcome" name="preferredOutcome">
          <Input.TextArea rows={2} placeholder="What resolution are you seeking?" />
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
const STATUS_TABS: { key: TabKey; label: string }[] = [
  { key: 'all',     label: 'All'     },
  { key: 'Pending', label: 'Pending' },
  { key: 'Ongoing', label: 'Ongoing' },
  { key: 'Closed',  label: 'Closed'  },
];

interface Filters {
  search:    string;
  nature:    string;
  security:  string;
  dateRange: DateRange;
}
const EMPTY_FILTERS: Filters = { search: '', nature: '', security: '', dateRange: null };

// ── Main page ──────────────────────────────────────────────────────────────────
export default function MyComplaintsPage() {
  const [tickets,        setTickets]        = useState<ComplaintTicket[]>(MOCK_TICKETS);
  const [draft,          setDraft]          = useState<Filters>(EMPTY_FILTERS);
  const [applied,        setApplied]        = useState<Filters>(EMPTY_FILTERS);
  const [activeTab,      setActiveTab]      = useState<TabKey>('all');
  const [actionRequiredExpanded, setActionRequiredExpanded] = useState(true);
  const [showFilters,    setShowFilters]    = useState(false);
  const [showInfo,       setShowInfo]       = useState(true);
  const [respondTicket,  setRespondTicket]  = useState<ComplaintTicket | null>(null);
  const [viewTicket,     setViewTicket]     = useState<ComplaintTicket | null>(null);
  const [invRespondTicket, setInvRespondTicket] = useState<ComplaintTicket | null>(null);
  const [createOpen,     setCreateOpen]     = useState(false);

  const handleApply = () => setApplied(draft);

  const handleReset = () => {
    setDraft(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setActiveTab('all');
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: tickets.length };
    for (const t of tickets) {
      const tab: TabKey =
        t.status === 'Pending' ? 'Pending' :
        t.status === 'Closed'  ? 'Closed'  : 'Ongoing';
      c[tab] = (c[tab] ?? 0) + 1;
    }
    return c;
  }, [tickets]);

  const filtered = useMemo(() => {
    let rows = tickets;
    if (activeTab === 'Pending') rows = rows.filter(t => t.status === 'Pending');
    if (activeTab === 'Ongoing') rows = rows.filter(t => t.status === 'Ongoing');
    if (activeTab === 'Closed')  rows = rows.filter(t => t.status === 'Closed');
    if (applied.search) {
      const q = applied.search.toLowerCase();
      rows = rows.filter(t =>
        t.ticketId.toLowerCase().includes(q) ||
        t.submitterId.toLowerCase().includes(q) ||
        t.submitterName.toLowerCase().includes(q) ||
        t.employeesInvolved.some(e => e.id.toLowerCase().includes(q) || e.name.toLowerCase().includes(q)),
      );
    }
    if (applied.nature)   rows = rows.filter(t => t.nature === applied.nature);
    if (applied.security) rows = rows.filter(t => t.security === applied.security);
    return rows;
  }, [tickets, activeTab, applied]);

  const showCauseItems = useMemo(() => tickets.filter(t => t.showCause), [tickets]);
  const qaItems        = useMemo(() => tickets.filter(t => t.investigationQA), [tickets]);
  const showCauseCount = showCauseItems.length;
  const qaCount = qaItems.length;
  const actionRequired = useMemo(() => showCauseItems.length + qaItems.length, [showCauseItems, qaItems]);

  const handleSubmitResponse = (ticketId: string) => {
    setTickets(prev => prev.map(t =>
      t.ticketId === ticketId ? { ...t, status: 'Ongoing', showCause: undefined } : t,
    ));
    message.success('Response submitted successfully.');
  };

  const handleSubmitInvResponse = (ticketId: string) => {
    setTickets(prev => prev.map(t =>
      t.ticketId === ticketId ? { ...t, investigationQA: undefined } : t,
    ));
  };

  const colHead = (label: string) => (
    <span style={{ fontSize: 11, color: 'var(--color-text-disabled)', fontWeight: 700, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
      {label}
    </span>
  );

  const columns: ColumnsType<ComplaintTicket> = [
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
      dataIndex: 'nature',
      width: 145,
      render: (v: NatureType) => <NatureBadge nature={v} />,
    },
    {
      title: colHead('REPORTED BY'),
      dataIndex: 'reportedBy',
      width: 170,
      render: (v: ComplaintTicket['reportedBy']) => (
        <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
          <UserOutlined style={{ marginRight: 4, color: 'var(--color-text-disabled)' }} />
          {v.anonymous ? v.name : `${v.id} (${v.name})`}
        </span>
      ),
    },
    {
      title: colHead('SECURITY'),
      dataIndex: 'security',
      width: 105,
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
      dataIndex: 'status',
      width: 160,
      render: (v: TicketStatus, r: ComplaintTicket) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <StatusBadge status={v} />
          {r.showCause && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700,
              color: '#dc2626', background: 'var(--color-status-rejected-bg)', border: '1px solid #fecaca',
              letterSpacing: '0.04em', width: 'fit-content',
            }}>
              RESPOND REQUIRED
            </span>
          )}
          {r.investigationQA && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700,
              color: '#0e7490', background: 'rgba(6, 182, 212, 0.10)', border: '1px solid #a5f3fc',
              letterSpacing: '0.04em', width: 'fit-content',
            }}>
              <MessageOutlined style={{ fontSize: 9 }} /> Q&amp;A PENDING
            </span>
          )}
        </div>
      ),
    },
    {
      title: colHead('RESOLUTION DATE'),
      dataIndex: 'resolutionDate',
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
              if (key === 'respond')    setRespondTicket(record);
              if (key === 'inv-respond') setInvRespondTicket(record);
              if (key === 'view')       setViewTicket(record);
              if (key === 'copy')    { navigator.clipboard.writeText(record.ticketId); message.success('Case number copied.'); }
              if (key === 'appeal') {
                Modal.confirm({
                  title: 'File an Appeal',
                  icon: <AuditOutlined style={{ color: '#d97706' }} />,
                  content: `Are you sure you want to file an appeal for ticket ${record.ticketId}? This will be reviewed by HR leadership.`,
                  okText: 'File Appeal',
                  cancelText: 'Cancel',
                  onOk: () => message.info('Appeal submitted. HR will review and respond within 5 business days.'),
                });
              }
            },
            items: [
              { key: 'respond',     icon: <SendOutlined />,     label: 'Respond',              disabled: !record.showCause },
              { key: 'inv-respond', icon: <MessageOutlined />,  label: 'Investigation Respond', disabled: !record.investigationQA },
              { key: 'view',        icon: <EyeOutlined />,      label: 'View Details' },
              { type: 'divider' as const },
              { key: 'pdf',      icon: <FilePdfOutlined />,  label: 'Export as PDF' },
              { key: 'copy',     icon: <CopyOutlined />,     label: 'Copy Case No.' },
              { type: 'divider' as const },
              { key: 'appeal',   icon: <AuditOutlined />,    label: 'Appeal',        disabled: record.status !== 'Closed' },
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

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="page-header-row">
        <div>
          <h1>My Complaints</h1>
          <p>File, track, and respond to your complaints</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
          New Complaint
        </Button>
      </div>

      {/* ── Info banner ───────────────────────────────────────────────────── */}
      {showInfo && (
        <div style={{
          background: 'var(--color-status-info-bg)', border: '1px solid #bae6fd',
          borderRadius: 10, padding: '12px 16px', marginBottom: 20, position: 'relative',
        }}>
          <button
            onClick={() => setShowInfo(false)}
            style={{
              position: 'absolute', top: 10, right: 12,
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--color-text-tertiary)', padding: 0, lineHeight: 1,
            }}
          >
            <CloseOutlined style={{ fontSize: 13 }} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <InfoCircleOutlined style={{ color: '#0284c7', fontSize: 14 }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#0369a1', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
              Your Complaint Portal
            </span>
          </div>
          <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--color-text-secondary)' }}>
            Track your filed complaints, respond to HR requests, submit explanations for show cause letters, and file appeals if needed.
          </p>
          <ol style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {[
              'File a complaint with details about the incident',
              'HR reviews and classifies your complaint',
              'Respond to any show cause letters or requests from the investigation team',
              'Track progress and file an appeal if unsatisfied with the outcome',
            ].map((step, i) => (
              <li key={i} style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{step}</li>
            ))}
          </ol>
        </div>
      )}

      {/* ── Filter bar ────────────────────────────────────────────────────── */}
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

      {/* ── Advanced filter panel ──────────────────────────────────────────── */}
      {showFilters && (
        <div style={{
          padding: '16px 20px',
          background: 'var(--color-bg-subtle)',
          border: '1px solid #e8edf3',
          borderLeft: '3px solid #cbd5e1',
          borderRadius: '0 0 8px 8px',
          marginTop: -20,
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
                options={([
                  'Anti-Harassment', 'Fraud / Forgery', 'Workplace Violence',
                  'Theft / Pilferage', 'Policy Violation', 'Misconduct',
                ] as NatureType[]).map(v => ({ label: v, value: v }))}
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
                options={(['Low', 'Medium', 'High', 'Critical'] as SecurityLevel[]).map(v => ({ label: v, value: v }))}
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

      {/* ── Status tabs ───────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {STATUS_TABS.map(tab => {
          const count   = counts[tab.key === 'all' ? 'all' : tab.key] ?? 0;
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
      </div>

      {/* ── Action required banner ────────────────────────────────────────── */}
      {actionRequired > 0 && (activeTab === 'all' || activeTab === 'Ongoing') && (
        <div style={{ border: '1px solid #fed7aa', borderRadius: 10, overflow: 'hidden', marginBottom: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
          <button
            onClick={() => setActionRequiredExpanded((prev) => !prev)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%',
              padding: '10px 16px', background: 'rgba(249, 115, 22, 0.10)', borderBottom: actionRequiredExpanded ? '1px solid #fed7aa' : 'none',
              border: 'none',
              cursor: 'pointer',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <WarningFilled style={{ color: '#ea580c', fontSize: 14 }} />
              <span style={{ fontWeight: 700, fontSize: 13, color: '#d97706' }}>
                ACTION REQUIRED ({actionRequired})
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#991b1b',
                background: 'var(--color-status-rejected-bg)',
                border: '1px solid #fecaca',
                borderRadius: 999,
                padding: '2px 8px',
                letterSpacing: '0.03em',
              }}>
                {showCauseCount} Show Cause
              </span>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#0e7490',
                background: 'rgba(6, 182, 212, 0.10)',
                border: '1px solid #a5f3fc',
                borderRadius: 999,
                padding: '2px 8px',
                letterSpacing: '0.03em',
              }}>
                {qaCount} Q&A
              </span>
              <span style={{ fontSize: 12, color: '#b45309' }}>Respond before deadline</span>
              {actionRequiredExpanded ? <UpOutlined style={{ color: '#b45309', fontSize: 12 }} /> : <DownOutlined style={{ color: '#b45309', fontSize: 12 }} />}
            </div>
          </button>

          {actionRequiredExpanded && (
            <>
          {showCauseCount > 0 && (
            <div style={{
              padding: '7px 16px',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.05em',
              color: '#991b1b',
              background: 'var(--color-status-rejected-bg)',
              borderBottom: '1px solid #fecdd3',
            }}>
              SHOW CAUSE RESPONSES
            </div>
          )}
          {/* Show Cause items */}
          {showCauseItems.map(item => (
            <div key={`sc-${item.ticketId}`} style={{ padding: '12px 16px', background: 'var(--color-bg-surface)', borderBottom: '1px solid #fef3c7' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 10, flex: 1 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#dc2626', display: 'inline-block', marginTop: 4, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      Submit explanation for Show Cause ({item.showCause!.ref})
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 2 }}>
                      {item.showCause!.description}
                    </div>
                    <Button
                      size="small"
                      icon={<SendOutlined />}
                      style={{ marginTop: 8, fontWeight: 600, fontSize: 12 }}
                      onClick={() => setRespondTicket(item)}
                    >
                      Respond
                    </Button>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 16 }}>
                  <span style={{ fontSize: 12, color: 'var(--color-text-disabled)', fontFamily: 'monospace' }}>#{item.ticketId}</span>
                  {item.showCause!.isOverdue && (
                    <span style={{
                      padding: '2px 8px', borderRadius: 4,
                      fontSize: 11, fontWeight: 700, color: '#fff',
                      background: '#dc2626', letterSpacing: '0.04em',
                    }}>
                      Overdue
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {qaCount > 0 && (
            <div style={{
              padding: '7px 16px',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.05em',
              color: '#0e7490',
              background: 'rgba(6, 182, 212, 0.10)',
              borderBottom: '1px solid #bae6fd',
            }}>
              INVESTIGATION Q&A
            </div>
          )}
          {/* Q&A Session items */}
          {qaItems.map(item => (
            <div key={`qa-${item.ticketId}`} style={{ padding: '12px 16px', background: 'rgba(6, 182, 212, 0.10)', borderBottom: '1px solid #cffafe' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 10, flex: 1 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0891b2', display: 'inline-block', marginTop: 4, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      Answer investigation questions — {item.investigationQA!.questions.length} question{item.investigationQA!.questions.length !== 1 ? 's' : ''} pending
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 2 }}>
                      Sent by {item.investigationQA!.sentBy} on {item.investigationQA!.sentAt}
                    </div>
                    <Button
                      size="small"
                      icon={<MessageOutlined />}
                      style={{ marginTop: 8, fontWeight: 600, fontSize: 12, borderColor: '#06b6d4', color: '#0e7490' }}
                      onClick={() => setInvRespondTicket(item)}
                    >
                      Investigation Respond
                    </Button>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 16 }}>
                  <span style={{ fontSize: 12, color: 'var(--color-text-disabled)', fontFamily: 'monospace' }}>#{item.ticketId}</span>
                  <span style={{
                    padding: '2px 8px', borderRadius: 4,
                    fontSize: 11, fontWeight: 700, color: '#0e7490',
                    background: 'rgba(6, 182, 212, 0.10)', border: '1px solid #a5f3fc', letterSpacing: '0.04em',
                  }}>
                    Q&amp;A
                  </span>
                </div>
              </div>
            </div>
          ))}
            </>
          )}
        </div>
      )}

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="list-surface">
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="ticketId"
          scroll={{ x: 1400 }}
          pagination={false}
          size="middle"
          style={{ fontSize: 13 }}
        />
      </div>

      {/* ── Drawers & Modals ──────────────────────────────────────────────── */}
      <RespondDrawer
        ticket={respondTicket}
        open={!!respondTicket}
        onClose={() => setRespondTicket(null)}
        onSubmit={handleSubmitResponse}
      />
      <ViewDetailsDrawer
        ticket={viewTicket}
        open={!!viewTicket}
        onClose={() => setViewTicket(null)}
      />
      <InvestigationRespondDrawer
        ticket={invRespondTicket}
        open={!!invRespondTicket}
        onClose={() => setInvRespondTicket(null)}
        onSubmit={handleSubmitInvResponse}
      />
      <CreateComplaintModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={(t) => setTickets(prev => [t, ...prev])}
      />
    </div>
  );
}
