import { useState, useMemo } from 'react';
import {
  Button, Input, Select, DatePicker, Table, Tooltip, Drawer,
  Form, Switch, Upload, Collapse, Modal, Dropdown, Divider,
  Row, Col, Space,
} from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import {
  PlusOutlined, SearchOutlined, ReloadOutlined, FilterOutlined,
  EyeOutlined, MessageOutlined, UploadOutlined,
  LockOutlined, UserOutlined, HistoryOutlined,
  ExclamationCircleOutlined, CalendarOutlined, MailOutlined,
  MoreOutlined, CloseCircleOutlined, ArrowRightOutlined,
  FileOutlined, DeleteOutlined,
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

interface HRResponse {
  date:                  string;
  conflictType:          ConflictType;
  securityLevel:         SecurityLevel;
  assignPersonnel:       string[];
  preferredActions:      string[];
  preferredDateOfMeeting:string;
  resolutionStrategy:    ResolutionStrategy;
  remarks:               string;
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
  Pending: { bg: '#fffbeb', text: '#d97706', dot: '#f59e0b' },
  Ongoing: { bg: '#eff6ff', text: '#2563eb', dot: '#3b82f6' },
  Closed:  { bg: '#f3f4f6', text: '#6b7280', dot: '#9ca3af' },
};

const SEC_CFG: Record<SecurityLevel, { bg: string; text: string; border: string }> = {
  Low:    { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  Medium: { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
  High:   { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
};

const NATURE_COLOR: Record<NatureOfConflict, string> = {
  'Policy Related':      '#7c3aed',
  'Tax Related':         '#0369a1',
  'Interpersonal':       '#0f766e',
  'Workplace Harassment':'#dc2626',
  'Other':               '#6b7280',
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
    <span style={{ fontSize: 12, color: '#374151' }}>
      {shown.map((e, i) => (
        <span key={e.id}>
          {i > 0 && <span style={{ color: '#9ca3af' }}>; </span>}
          <Tooltip title={e.name}><span style={{ cursor: 'default' }}>{e.id} ({e.name})</span></Tooltip>
        </span>
      ))}
      {extra > 0 && (
        <Tooltip title={employees.slice(2).map(e => `${e.id} (${e.name})`).join(', ')}>
          <span style={{ color: '#0f766e', fontWeight: 600, marginLeft: 4, cursor: 'pointer' }}>
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
      padding: '6px 14px', background: color === 'hr' ? '#e0f2fe' : '#eef8f7',
      borderLeft: `3px solid ${color === 'hr' ? '#0ea5e9' : '#0f766e'}`,
      fontWeight: 700, fontSize: 12, color: color === 'hr' ? '#0369a1' : '#115e59',
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
      <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 2, letterSpacing: '0.03em' }}>
        {label.toUpperCase()}
      </div>
      <div style={{
        fontSize: 13, color: value ? '#111827' : '#d1d5db',
        padding: '6px 10px', background: '#f8fafc',
        border: '1px solid #e5e7eb', borderRadius: 8, minHeight: 34,
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
      <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
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
          style={{ border: '1px solid #d8e7e5', borderRadius: 10, background: '#fff' }}
        >
          <Panel
            key="0"
            header={
              <span style={{ fontWeight: 700, fontSize: 12, color: '#115e59' }}>
                <CalendarOutlined style={{ marginRight: 6, color: '#0f766e' }} />
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
                <div key={f.label} style={{ display: 'flex', gap: 8, fontSize: 12, borderBottom: '1px solid #f3f4f6', paddingBottom: 5 }}>
                  <span style={{ width: 130, flexShrink: 0, color: '#6b7280', fontWeight: 600 }}>{f.label}</span>
                  <span style={{ color: '#111827' }}>{f.value}</span>
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

  function handleRemove(uid: string) {
    onChange?.((value ?? []).filter(f => f.uid !== uid));
  }

  function handleView(file: UploadFile) {
    setViewingFile(file);
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
            <div
              key={file.uid}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#f8fafc', border: '1px solid #e5e7eb',
                borderRadius: 7, padding: '5px 10px', fontSize: 12, color: '#374151',
              }}
            >
              <FileOutlined style={{ color: '#0f766e', flexShrink: 0 }} />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {file.name}
              </span>
              <span style={{ fontSize: 11, color: '#9ca3af', flexShrink: 0 }}>
                {file.size ? `${(file.size / 1024).toFixed(1)} KB` : ''}
              </span>
              <Tooltip title="View">
                <Button
                  type="text" size="small" icon={<EyeOutlined />}
                  onClick={() => handleView(file)}
                  style={{ color: '#0f766e', padding: '0 4px', height: 22, flexShrink: 0 }}
                />
              </Tooltip>
              <Tooltip title="Remove">
                <Button
                  type="text" size="small" icon={<DeleteOutlined />}
                  onClick={() => handleRemove(file.uid)}
                  style={{ color: '#ef4444', padding: '0 4px', height: 22, flexShrink: 0 }}
                />
              </Tooltip>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!viewingFile}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileOutlined style={{ color: '#0f766e' }} />
            <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{viewingFile?.name}</span>
          </div>
        }
        footer={null}
        onCancel={() => setViewingFile(null)}
        centered
        width={760}
      >
        {viewingFile && (() => {
          const origin = viewingFile.originFileObj as File | undefined;
          const url    = origin ? URL.createObjectURL(origin) : undefined;
          const isImage = viewingFile.type?.startsWith('image/');
          const isPdf   = viewingFile.type === 'application/pdf';

          if (!url) return <div style={{ textAlign: 'center', color: '#9ca3af', padding: '40px 0' }}>Preview not available.</div>;
          if (isImage) return <img src={url} alt={viewingFile.name} style={{ width: '100%', borderRadius: 8 }} />;
          if (isPdf) return <iframe src={url} title={viewingFile.name} style={{ width: '100%', height: 500, border: 'none', borderRadius: 8 }} />;
          return (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <FileOutlined style={{ fontSize: 48, color: '#0f766e', display: 'block', marginBottom: 12 }} />
              <div style={{ fontSize: 14, color: '#374151', marginBottom: 16 }}>{viewingFile.name}</div>
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
          <MessageOutlined style={{ color: '#0f766e' }} />
          <span style={{ fontWeight: 700, color: '#111827' }}>Response</span>
          <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 400 }}>— {ticket.ticketId}</span>
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
            style={{ borderColor: '#6b7280', color: '#6b7280' }}
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
                <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 4, letterSpacing: '0.03em' }}>ATTACHMENTS</div>
                <div style={{ fontSize: 12, color: '#0f766e', padding: '6px 10px', background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: 8, cursor: 'pointer' }}>
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
                    <span style={{ fontSize: 12, color: '#6b7280' }}>
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
          borderLeft: '1px solid #e5e7eb',
          overflowY: 'auto', padding: 16,
          background: '#f8fafc',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <HistoryOutlined style={{ color: '#0f766e' }} />
            <span style={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>History</span>
            <span style={{
              marginLeft: 'auto', background: '#0f766e', color: '#fff',
              borderRadius: 20, padding: '0 7px', fontSize: 11, fontWeight: 700,
            }}>{ticket.responses.length}</span>
          </div>
          <HistoryPanel responses={ticket.responses} />
        </div>
      </div>
    </Drawer>
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
  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <EyeOutlined style={{ color: '#0f766e' }} />
          <span style={{ fontWeight: 700, color: '#111827' }}>View Details</span>
          <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 400 }}>— {ticket.ticketId}</span>
        </div>
      }
      open={open}
      onClose={onClose}
      width={600}
      styles={{ body: { padding: 24 } }}
    >
      <SectionLabel>Section — A (Employee Section)</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
        <ReadField label="Ticket ID"              value={ticket.ticketId} />
        <ReadField label="Name"                   value={ticket.name} />
        <ReadField label="Employee ID"            value={ticket.employeeId} />
        <ReadField label="Phone Number"           value={ticket.phoneNumber} />
        <ReadField label="Department"             value={ticket.department} />
        <ReadField label="Date of Incident"       value={ticket.dateOfIncident} />
        <ReadField label="Time of Incident"       value={ticket.timeOfIncident} />
        <ReadField label="Location"               value={ticket.location} />
        <ReadField label="Nature of the Conflict" value={ticket.natureOfConflict} />
        <ReadField label="Witness"                value={ticket.witness} />
      </div>
      <ReadField
        label="Employee Involved"
        value={ticket.employeesInvolved.map(e => `${e.id} (${e.name})`).join('; ')}
      />
      <ReadField label="Description of the Incident" value={ticket.descriptionOfIncident} />
      <ReadField label="Preferred Outcome"            value={ticket.preferredOutcome} />
      <ReadField label="Attachments"                  value="No attachments" />

      <Divider style={{ margin: '8px 0 16px' }} />

      <SectionLabel color="hr">Section — B (For HR POC)</SectionLabel>
      {ticket.responses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px', color: '#9ca3af', fontSize: 13 }}>
          No HR responses recorded yet.
        </div>
      ) : (
        <HistoryPanel responses={ticket.responses} />
      )}
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
          <ExclamationCircleOutlined style={{ color: '#0f766e' }} />
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
            prefix={<UserOutlined style={{ color: '#9ca3af' }} />}
            style={{ background: '#f8fafc', color: '#6b7280', cursor: 'default' }}
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
  const [createOpen,    setCreateOpen]   = useState(false);

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
    <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
      {label}
    </span>
  );

  const columns: ColumnsType<ConflictTicket> = [
    {
      title: colHead('TICKET ID'),
      dataIndex: 'ticketId',
      width: 155,
      render: v => (
        <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 12, color: '#0f766e' }}>{v}</span>
      ),
    },
    {
      title: colHead('CONFLICT DESCRIPTION'),
      dataIndex: 'conflictDescription',
      width: 240,
      render: v => (
        <Tooltip title={v}>
          <span style={{ color: '#374151', fontSize: 13 }}>
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
        <span style={{ fontSize: 12, color: '#374151' }}>
          <UserOutlined style={{ marginRight: 4, color: '#9ca3af' }} />
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
      render: v => <span style={{ fontSize: 12, color: '#6b7280' }}>{v}</span>,
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
        ? <span style={{ fontSize: 12, color: '#6b7280' }}>{v}</span>
        : <span style={{ color: '#d1d5db' }}>—</span>,
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
            style={{ color: '#9ca3af', borderRadius: 6, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
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
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
          Create Ticket
        </Button>
      </div>

      {/* ── Filter bar ── */}
      <div className="filter-bar">
        <div>
          <div className="filter-label">SEARCH</div>
          <Input
            prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
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
            style={showFilters ? { borderColor: '#94a3b8', color: '#334155' } : {}}
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
          background: '#f8fafc',
          border: '1px solid #e8edf3',
          borderLeft: '3px solid #cbd5e1',
          borderRadius: '0 0 8px 8px',
          marginTop: -8,
          marginBottom: 16,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <Space size={8} align="center">
              <FilterOutlined style={{ color: '#64748b' }} />
              <span style={{ fontWeight: 700, fontSize: 12, letterSpacing: '0.07em', color: '#374151', textTransform: 'uppercase' }}>
                Advanced Filtering
              </span>
            </Space>
            <Button type="link" size="small" onClick={handleReset} icon={<ReloadOutlined />} style={{ color: '#64748b', padding: 0, fontSize: 12 }}>
              Reset All Filters
            </Button>
          </div>
          <Row gutter={[12, 12]} align="bottom">
            <Col flex="1 1 160px">
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: '#6b7280', marginBottom: 6, textTransform: 'uppercase' }}>Nature of Conflict</div>
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
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: '#6b7280', marginBottom: 6, textTransform: 'uppercase' }}>Resolution Strategy</div>
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
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: '#6b7280', marginBottom: 6, textTransform: 'uppercase' }}>Security Level</div>
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
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: '#6b7280', marginBottom: 6, textTransform: 'uppercase' }}>Request Date Range</div>
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
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
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
                background: isActive ? '#f0fdfa' : '#ffffff',
                color: isActive ? '#0f766e' : '#374151',
                fontWeight: isActive ? 700 : 500,
                fontSize: 13, fontFamily: 'inherit', cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                minWidth: 20, height: 20, borderRadius: 10,
                fontSize: 11, fontWeight: 700, padding: '0 5px',
                background: isActive ? '#0f766e' : '#e5e7eb',
                color: isActive ? '#ffffff' : '#6b7280',
              }}>
                {count}
              </span>
            </button>
          );
        })}
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
      <CreateTicketModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={(t) => setTickets(prev => [t, ...prev])}
      />
    </div>
  );
}
