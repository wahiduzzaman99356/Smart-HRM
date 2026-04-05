import { useMemo, useState } from 'react';
import { Avatar, Button, Checkbox, Col, DatePicker, Input, message, Modal, Row, Select, Space, Tooltip, Upload } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import {
  CheckCircleOutlined,
  CheckCircleFilled,
  CheckSquareOutlined,
  ClearOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  DownloadOutlined,
  DownOutlined,
  EyeOutlined,
  FileDoneOutlined,
  FileOutlined,
  FilePdfOutlined,
  FilterOutlined,
  FlagFilled,
  FlagOutlined,
  InfoCircleOutlined,
  PaperClipOutlined,
  ReloadOutlined,
  RightOutlined,
  SearchOutlined,
  SendOutlined,
  TeamOutlined,
  UploadOutlined,
  UserOutlined,
  WarningOutlined,
} from '@ant-design/icons';

// ─── Types ────────────────────────────────────────────────────────────────────
type ClearanceStatus = 'Pending' | 'Cleared' | 'Flagged';
type DeptStatus      = 'Pending' | 'Submitted' | 'Flagged';

interface Attachment {
  uid: string;
  name: string;
  url: string;
  mimeType: string;
}

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  infoText?: string;
}

interface DeptClearance {
  id: string;
  name: string;
  dept: string;
  role: string;
  status: DeptStatus;
  items: ChecklistItem[];
  remarks: string;
  attachments: Attachment[];
  cleanedOn?: string;
}

interface EmployeeClearance {
  id: string;
  empName: string;
  empId: string;
  department: string;
  depts: DeptClearance[];
  globalRemarks: string;
  globalAttachments: Attachment[];
}

// ─── Initial Data ─────────────────────────────────────────────────────────────
const INITIAL_DATA: EmployeeClearance[] = [
  {
    id: 'emp-1', empName: 'Sarah Chen', empId: 'EMP-1042', department: 'Engineering',
    globalRemarks: '', globalAttachments: [],
    depts: [
      { id: 'd1-1', name: 'Immediate Supervisor', dept: 'Management', role: 'Tech Lead', status: 'Submitted', cleanedOn: '2026-03-28', remarks: '', attachments: [], items: [{ id: 'i1-1', label: 'Necessary Documentation', checked: true, infoText: 'All required documents must be collected' }, { id: 'i1-2', label: 'Handing-over Responsibility', checked: true, infoText: 'Formal handover to designated person' }, { id: 'i1-3', label: 'Others', checked: true }] },
      { id: 'd1-2', name: 'Finance & Accounts', dept: 'Finance', role: 'Finance Head', status: 'Pending', remarks: '', attachments: [], items: [{ id: 'i2-1', label: 'Advance Adjusted Bill', checked: false }, { id: 'i2-2', label: 'PF Loan Adjusted', checked: true, infoText: 'PF loan balance to be adjusted' }, { id: 'i2-3', label: 'Asset Lost Adjusted', checked: false }, { id: 'i2-4', label: 'Others', checked: false }] },
      { id: 'd1-3', name: 'Administration', dept: 'Admin', role: 'Admin Head', status: 'Submitted', cleanedOn: '2026-03-27', remarks: '', attachments: [], items: [{ id: 'i3-1', label: 'Stationary Items', checked: true, infoText: 'All stationery items returned' }, { id: 'i3-2', label: 'Business Card', checked: true, infoText: 'Business cards collected' }, { id: 'i3-3', label: 'Desk-Key', checked: true, infoText: 'Desk and cabinet keys returned' }, { id: 'i3-4', label: 'Uniform/IT Applicables', checked: true, infoText: 'Uniform and IT accessories returned' }, { id: 'i3-5', label: 'SIM-Card', checked: true, infoText: 'Company SIM card returned' }, { id: 'i3-6', label: 'Others', checked: true }] },
      { id: 'd1-4', name: 'Asset Management (IT)', dept: 'IT', role: 'IT Admin', status: 'Pending', remarks: '', attachments: [], items: [{ id: 'i4-1', label: 'Laptop with Charger', checked: false }, { id: 'i4-2', label: 'Tablet with Charger', checked: true }, { id: 'i4-3', label: 'Internet Modem', checked: false }, { id: 'i4-4', label: 'Pen Drive', checked: true }, { id: 'i4-5', label: 'Other IT Assets', checked: false }] },
      { id: 'd1-5', name: 'IT Department', dept: 'IT', role: 'IT Manager', status: 'Submitted', cleanedOn: '2026-03-29', remarks: '', attachments: [], items: [{ id: 'i5-1', label: 'Email-Password-Received', checked: true }, { id: 'i5-2', label: 'Computer-Password-Received', checked: true }, { id: 'i5-3', label: 'Email-A/D Delete-Request', checked: true }, { id: 'i5-4', label: 'Computer Data Received', checked: true }, { id: 'i5-5', label: 'IT-Device-Condition-Check', checked: true }, { id: 'i5-6', label: 'Zenith-ID-Closing', checked: true }, { id: 'i5-7', label: 'Other IT Passwords/Devices', checked: true }] },
      { id: 'd1-6', name: 'Airline Security', dept: 'Security', role: 'Security Head', status: 'Submitted', cleanedOn: '2026-03-29', remarks: '', attachments: [], items: [{ id: 'i6-1', label: 'Security-Pass', checked: true }, { id: 'i6-2', label: 'Apron-Pass', checked: true }, { id: 'i6-3', label: 'Duty-Pass', checked: true }, { id: 'i6-4', label: 'Others', checked: true }] },
      { id: 'd1-7', name: 'Revenue Department', dept: 'Revenue', role: 'Revenue Manager', status: 'Pending', remarks: '', attachments: [], items: [{ id: 'i7-1', label: 'MCD ID Closing (if applicable)', checked: false }, { id: 'i7-2', label: 'Others', checked: false }] },
      { id: 'd1-8', name: 'Head of Department', dept: 'Management', role: 'Engineering Director', status: 'Pending', remarks: '', attachments: [], items: [{ id: 'i8-1', label: 'Job Related Charges Handover', checked: false }] },
      { id: 'd1-9', name: 'HR Department', dept: 'HR', role: 'HR Manager', status: 'Pending', remarks: '', attachments: [], items: [{ id: 'i9-1', label: 'Leave Application Received', checked: false }, { id: 'i9-2', label: 'ID Card Received', checked: false }, { id: 'i9-3', label: 'Filled out Handover Report', checked: false }] },
    ],
  },
  {
    id: 'emp-2', empName: 'Aisha Patel', empId: 'EMP-1014', department: 'Finance',
    globalRemarks: '', globalAttachments: [],
    depts: [
      { id: 'd2-1', name: 'Immediate Supervisor', dept: 'Management', role: 'Finance Director', status: 'Submitted', cleanedOn: '2026-03-20', remarks: '', attachments: [], items: [{ id: 'a1', label: 'Necessary Documentation', checked: true }, { id: 'a2', label: 'Handing-over Responsibility', checked: true }, { id: 'a3', label: 'Others', checked: true }] },
      { id: 'd2-2', name: 'Finance & Accounts', dept: 'Finance', role: 'Finance Head', status: 'Submitted', cleanedOn: '2026-03-21', remarks: '', attachments: [], items: [{ id: 'a4', label: 'Advance Adjusted Bill', checked: true }, { id: 'a5', label: 'PF Loan Adjusted', checked: true }, { id: 'a6', label: 'Asset Lost Adjusted', checked: true }, { id: 'a7', label: 'Others', checked: true }] },
      { id: 'd2-3', name: 'Administration', dept: 'Admin', role: 'Admin Head', status: 'Submitted', cleanedOn: '2026-03-22', remarks: '', attachments: [], items: [{ id: 'a8', label: 'Stationary Items', checked: true }, { id: 'a9', label: 'Business Card', checked: true }, { id: 'a10', label: 'Desk-Key', checked: true }, { id: 'a11', label: 'Uniform/IT Applicables', checked: true }, { id: 'a12', label: 'SIM-Card', checked: true }, { id: 'a13', label: 'Others', checked: true }] },
      { id: 'd2-4', name: 'Asset Management (IT)', dept: 'IT', role: 'IT Admin', status: 'Submitted', cleanedOn: '2026-03-22', remarks: '', attachments: [], items: [{ id: 'a14', label: 'Laptop with Charger', checked: true }, { id: 'a15', label: 'Tablet with Charger', checked: true }, { id: 'a16', label: 'Internet Modem', checked: true }, { id: 'a17', label: 'Pen Drive', checked: true }, { id: 'a18', label: 'Other IT Assets', checked: true }] },
      { id: 'd2-5', name: 'IT Department', dept: 'IT', role: 'IT Manager', status: 'Submitted', cleanedOn: '2026-03-23', remarks: '', attachments: [], items: [{ id: 'a19', label: 'Email-Password-Received', checked: true }, { id: 'a20', label: 'Computer-Password-Received', checked: true }, { id: 'a21', label: 'Email-A/D Delete-Request', checked: true }, { id: 'a22', label: 'Computer Data Received', checked: true }, { id: 'a23', label: 'IT-Device-Condition-Check', checked: true }, { id: 'a24', label: 'Zenith-ID-Closing', checked: true }, { id: 'a25', label: 'Other IT Passwords/Devices', checked: true }] },
      { id: 'd2-6', name: 'Airline Security', dept: 'Security', role: 'Security Head', status: 'Submitted', cleanedOn: '2026-03-23', remarks: '', attachments: [], items: [{ id: 'a26', label: 'Security-Pass', checked: true }, { id: 'a27', label: 'Apron-Pass', checked: true }, { id: 'a28', label: 'Duty-Pass', checked: true }, { id: 'a29', label: 'Others', checked: true }] },
      { id: 'd2-7', name: 'Revenue Department', dept: 'Revenue', role: 'Revenue Manager', status: 'Submitted', cleanedOn: '2026-03-24', remarks: '', attachments: [], items: [{ id: 'a30', label: 'MCD ID Closing (if applicable)', checked: true }, { id: 'a31', label: 'Others', checked: true }] },
      { id: 'd2-8', name: 'Head of Department', dept: 'Management', role: 'Finance Director', status: 'Submitted', cleanedOn: '2026-03-24', remarks: '', attachments: [], items: [{ id: 'a32', label: 'Job Related Charges Handover', checked: true }] },
      { id: 'd2-9', name: 'HR Department', dept: 'HR', role: 'HR Manager', status: 'Submitted', cleanedOn: '2026-03-25', remarks: '', attachments: [], items: [{ id: 'a33', label: 'Leave Application Received', checked: true }, { id: 'a34', label: 'ID Card Received', checked: true }, { id: 'a35', label: 'Filled out Handover Report', checked: true }] },
    ],
  },
  {
    id: 'emp-3', empName: 'Michael Thompson', empId: 'EMP-1105', department: 'Sales',
    globalRemarks: '', globalAttachments: [],
    depts: [
      { id: 'd3-1', name: 'Immediate Supervisor', dept: 'Management', role: 'Sales Director', status: 'Submitted', cleanedOn: '2026-03-25', remarks: '', attachments: [], items: [{ id: 'm1', label: 'Necessary Documentation', checked: true }, { id: 'm2', label: 'Handing-over Responsibility', checked: true }, { id: 'm3', label: 'Others', checked: true }] },
      { id: 'd3-2', name: 'Finance & Accounts', dept: 'Finance', role: 'Finance Head', status: 'Flagged', remarks: 'Outstanding advance not cleared.', attachments: [], items: [{ id: 'm4', label: 'Advance Adjusted Bill', checked: false }, { id: 'm5', label: 'PF Loan Adjusted', checked: false }, { id: 'm6', label: 'Asset Lost Adjusted', checked: false }, { id: 'm7', label: 'Others', checked: false }] },
      { id: 'd3-3', name: 'Administration', dept: 'Admin', role: 'Admin Head', status: 'Pending', remarks: '', attachments: [], items: [{ id: 'm8', label: 'Stationary Items', checked: false }, { id: 'm9', label: 'Business Card', checked: false }, { id: 'm10', label: 'Desk-Key', checked: true }, { id: 'm11', label: 'Uniform/IT Applicables', checked: false }, { id: 'm12', label: 'SIM-Card', checked: false }, { id: 'm13', label: 'Others', checked: false }] },
      { id: 'd3-4', name: 'Asset Management (IT)', dept: 'IT', role: 'IT Admin', status: 'Pending', remarks: '', attachments: [], items: [{ id: 'm14', label: 'Laptop with Charger', checked: false }, { id: 'm15', label: 'Tablet with Charger', checked: false }, { id: 'm16', label: 'Internet Modem', checked: false }, { id: 'm17', label: 'Pen Drive', checked: false }, { id: 'm18', label: 'Other IT Assets', checked: false }] },
      { id: 'd3-5', name: 'IT Department', dept: 'IT', role: 'IT Manager', status: 'Submitted', cleanedOn: '2026-03-26', remarks: '', attachments: [], items: [{ id: 'm19', label: 'Email-Password-Received', checked: true }, { id: 'm20', label: 'Computer-Password-Received', checked: true }, { id: 'm21', label: 'Email-A/D Delete-Request', checked: true }, { id: 'm22', label: 'Computer Data Received', checked: true }, { id: 'm23', label: 'IT-Device-Condition-Check', checked: true }, { id: 'm24', label: 'Zenith-ID-Closing', checked: true }, { id: 'm25', label: 'Other IT Passwords/Devices', checked: true }] },
      { id: 'd3-6', name: 'Airline Security', dept: 'Security', role: 'Security Head', status: 'Pending', remarks: '', attachments: [], items: [{ id: 'm26', label: 'Security-Pass', checked: false }, { id: 'm27', label: 'Apron-Pass', checked: false }, { id: 'm28', label: 'Duty-Pass', checked: false }, { id: 'm29', label: 'Others', checked: false }] },
      { id: 'd3-7', name: 'Revenue Department', dept: 'Revenue', role: 'Revenue Manager', status: 'Pending', remarks: '', attachments: [], items: [{ id: 'm30', label: 'MCD ID Closing (if applicable)', checked: false }, { id: 'm31', label: 'Others', checked: false }] },
      { id: 'd3-8', name: 'Head of Department', dept: 'Management', role: 'Sales VP', status: 'Pending', remarks: '', attachments: [], items: [{ id: 'm32', label: 'Job Related Charges Handover', checked: false }] },
      { id: 'd3-9', name: 'HR Department', dept: 'HR', role: 'HR Manager', status: 'Pending', remarks: '', attachments: [], items: [{ id: 'm33', label: 'Leave Application Received', checked: false }, { id: 'm34', label: 'ID Card Received', checked: false }, { id: 'm35', label: 'Filled out Handover Report', checked: false }] },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ['var(--color-primary)', '#3b82f6', '#f59e0b', '#8b5cf6', '#10b981', 'var(--color-text-tertiary)', '#ef4444', '#ec4899'];
function avatarColor(n: string) {
  let h = 0; for (const c of n) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
function initials(n: string) { return n.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase(); }

function computeStats(emp: EmployeeClearance) {
  const totalDepts     = emp.depts.length;
  const submittedDepts = emp.depts.filter(d => d.status === 'Submitted').length;
  const flaggedDepts   = emp.depts.filter(d => d.status === 'Flagged').length;
  const pct = totalDepts > 0 ? Math.round((submittedDepts / totalDepts) * 100) : 0;
  return { totalDepts, submittedDepts, flaggedDepts, pct };
}

function deriveStatus(emp: EmployeeClearance): ClearanceStatus {
  const { submittedDepts, totalDepts, flaggedDepts } = computeStats(emp);
  if (submittedDepts === totalDepts) return 'Cleared';
  if (flaggedDepts > 0) return 'Flagged';
  return 'Pending';
}

const isImage = (m: string) => m.startsWith('image/');
const isPdf   = (m: string) => m === 'application/pdf';

// ─── Design tokens (inline) ───────────────────────────────────────────────────
const C = {
  primary:   'var(--color-primary)',
  pDark:     'var(--color-primary-dark)',
  pLight:    'var(--color-primary-tint)',
  pMid:      'var(--color-status-approved-bg)',
  success:   '#059669',
  sBg:       'var(--color-status-approved-bg)',
  sBorder:   'var(--color-status-approved-bg)',
  warning:   '#d97706',
  wBg:       'var(--color-status-pending-bg)',
  wBorder:   'rgba(253, 230, 138, 0.4)',
  danger:    '#dc2626',
  dBg:       'var(--color-status-rejected-bg)',
  dBorder:   'var(--color-status-rejected-bg)',
  border:    'var(--color-border)',
  borderStr: '#bdd6d2',
  bg:        'var(--color-bg-subtle)',
  surface:   'var(--color-bg-surface)',
  t1: 'var(--color-text-primary)',
  t2: 'var(--color-text-secondary)',
  t3: 'var(--color-text-tertiary)',
  t4: 'var(--color-text-disabled)',
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: ClearanceStatus }) {
  const cfg = {
    Pending: { bg: C.wBg,  color: C.warning, dot: '#f59e0b',  label: 'Pending'  },
    Cleared: { bg: C.sBg,  color: C.success, dot: '#22c55e',  label: 'Cleared'  },
    Flagged: { bg: C.dBg,  color: C.danger,  dot: '#ef4444',  label: 'Flagged'  },
  }[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 700, color: cfg.color, background: cfg.bg,
      border: `1px solid ${cfg.bg}`, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, accentColor, icon }: {
  label: string; value: number; accentColor: string; icon: React.ReactNode;
}) {
  const iconBg = accentColor + '18'; // ~10% opacity
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
      padding: '18px 20px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Top accent bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accentColor, borderRadius: '10px 10px 0 0' }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: C.t4, marginBottom: 10, textTransform: 'uppercase' }}>
            {label}
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: accentColor, lineHeight: 1, letterSpacing: '-0.02em' }}>
            {value}
          </div>
        </div>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, fontSize: 18, color: accentColor,
        }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ─── Attachment Preview Modal ─────────────────────────────────────────────────
function AttachmentPreview({ file, onClose }: { file: Attachment | null; onClose: () => void }) {
  if (!file) return null;
  return (
    <Modal
      open={!!file}
      onCancel={onClose}
      footer={
        <Button icon={<DownloadOutlined />} href={file.url} download={file.name}>
          Download
        </Button>
      }
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          {isImage(file.mimeType) ? null : isPdf(file.mimeType)
            ? <FilePdfOutlined style={{ color: C.danger }} />
            : <FileOutlined style={{ color: C.t3 }} />}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 360 }}>
            {file.name}
          </span>
        </div>
      }
      width={isImage(file.mimeType) ? 'auto' : 820}
      centered
      styles={{ body: { padding: isImage(file.mimeType) ? 0 : 16 } }}
    >
      {isImage(file.mimeType) ? (
        <img src={file.url} alt={file.name} style={{ display: 'block', maxWidth: '80vw', maxHeight: '75vh', objectFit: 'contain' }} />
      ) : isPdf(file.mimeType) ? (
        <iframe src={file.url} title={file.name} style={{ width: '100%', height: '70vh', border: 'none' }} />
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <FileOutlined style={{ fontSize: 48, color: C.t4 }} />
          <div style={{ marginTop: 12, fontSize: 13, color: C.t2 }}>{file.name}</div>
          <div style={{ fontSize: 12, marginTop: 4, color: C.t4 }}>Preview not available for this file type.</div>
        </div>
      )}
    </Modal>
  );
}

// ─── Attachment List ──────────────────────────────────────────────────────────
function AttachmentList({ attachments, readonly, onRemove, onPreview }: {
  attachments: Attachment[]; readonly: boolean;
  onRemove: (uid: string) => void; onPreview: (a: Attachment) => void;
}) {
  if (attachments.length === 0) return (
    <p style={{ fontSize: 11, color: C.t4, fontStyle: 'italic', margin: '4px 0 0' }}>No attachments yet.</p>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
      {attachments.map(att => (
        <div key={att.uid} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '5px 8px', borderRadius: 6,
          background: 'var(--color-bg-subtle)', border: `1px solid ${C.border}`,
        }}>
          <div
            style={{ width: 26, height: 26, borderRadius: 4, overflow: 'hidden', flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-subtle)' }}
            onClick={() => onPreview(att)}
          >
            {isImage(att.mimeType)
              ? <img src={att.url} alt={att.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : isPdf(att.mimeType) ? <FilePdfOutlined style={{ fontSize: 13, color: C.danger }} />
              : <FileOutlined style={{ fontSize: 13, color: C.t3 }} />
            }
          </div>
          <span style={{ fontSize: 11, color: C.t2, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {att.name}
          </span>
          <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => onPreview(att)}
            style={{ color: C.primary, padding: '0 4px', height: 20, minWidth: 0, fontSize: 12 }} />
          {!readonly && (
            <Button type="text" size="small" icon={<DeleteOutlined />} onClick={() => onRemove(att.uid)}
              style={{ color: C.danger, padding: '0 4px', height: 20, minWidth: 0, fontSize: 12 }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Dept Card ────────────────────────────────────────────────────────────────
interface DeptCardProps {
  empId: string; dept: DeptClearance; isCollapsed: boolean;
  onToggleCollapse: () => void; onToggleItem: (id: string) => void;
  onMarkAll: () => void; onSubmit: () => void; onFlag: () => void; onReopen: () => void;
  onUpdateRemarks: (v: string) => void;
  onAddAttachment: (a: Attachment) => void; onRemoveAttachment: (uid: string) => void;
}

function DeptCard({
  dept, isCollapsed, onToggleCollapse, onToggleItem,
  onMarkAll, onSubmit, onFlag, onReopen, onUpdateRemarks,
  onAddAttachment, onRemoveAttachment,
}: DeptCardProps) {
  const [flagError,    setFlagError]    = useState(false);
  const [previewFile,  setPreviewFile]  = useState<Attachment | null>(null);

  const checked = dept.items.filter(i => i.checked).length;
  const total   = dept.items.length;
  const pct     = total > 0 ? Math.round((checked / total) * 100) : 0;

  const isSubmitted = dept.status === 'Submitted';
  const isFlagged   = dept.status === 'Flagged';
  const isLocked    = isSubmitted || isFlagged;

  // Visual tokens per status
  const topBar    = isSubmitted ? C.success : isFlagged ? C.danger  : C.borderStr;
  const headerBg  = isSubmitted ? C.sBg     : isFlagged ? C.dBg     : C.surface;
  const borderClr = isSubmitted ? C.sBorder : isFlagged ? C.dBorder : C.border;
  const barColor  = isSubmitted ? '#22c55e' : isFlagged ? '#ef4444' : C.primary;
  const cntBg     = isSubmitted ? 'var(--color-status-approved-bg)' : isFlagged ? 'var(--color-status-rejected-bg)' : 'var(--color-bg-subtle)';
  const cntClr    = isSubmitted ? C.success : isFlagged ? C.danger  : C.t3;

  const handleFlag = () => {
    if (!dept.remarks.trim()) { setFlagError(true); return; }
    setFlagError(false);
    onFlag();
  };

  const handleFileUpload = (file: File) => {
    onAddAttachment({
      uid: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: file.name, url: URL.createObjectURL(file),
      mimeType: file.type || 'application/octet-stream',
    });
    return false;
  };

  return (
    <>
      <div style={{ border: `1px solid ${borderClr}`, borderRadius: 10, overflow: 'hidden', background: C.surface, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>

        {/* ── Header ── */}
        <div
          style={{
            padding: '10px 14px', background: headerBg, cursor: 'pointer',
            display: 'flex', alignItems: 'flex-start', gap: 10,
            borderBottom: isCollapsed ? 'none' : `1px solid ${borderClr}`,
          }}
          onClick={onToggleCollapse}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 12, color: C.t1, lineHeight: 1.3 }}>{dept.name}</div>
            <div style={{ fontSize: 11, color: C.t3, marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
              <UserOutlined style={{ fontSize: 9, opacity: 0.7 }} />
              <span>{dept.dept}</span>
              <span style={{ color: C.border }}>·</span>
              <span>{dept.role}</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0, marginTop: 1 }}>
            {isSubmitted && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'var(--color-status-approved-bg)', color: C.success }}>
                Submitted
              </span>
            )}
            {isFlagged && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'var(--color-status-rejected-bg)', color: C.danger }}>
                Flagged
              </span>
            )}
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: cntBg, color: cntClr }}>
              {checked}/{total}
            </span>
            <span style={{ color: C.t4, fontSize: 10 }}>
              {isCollapsed ? <RightOutlined /> : <DownOutlined />}
            </span>
          </div>
        </div>

        {/* ── Progress bar ── */}
        <div style={{ height: 4, background: 'var(--color-bg-subtle)' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: barColor, transition: 'width 0.35s ease' }} />
        </div>

        {/* ── Body ── */}
        {!isCollapsed && (
          <div style={{ padding: '14px 14px 12px' }}>

            {/* Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 14 }}>
              {dept.items.map(item => (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 10px', borderRadius: 6,
                  background: item.checked ? 'var(--color-status-approved-bg)' : 'var(--color-bg-subtle)',
                  transition: 'background 0.15s',
                }}>
                  <Checkbox
                    checked={item.checked}
                    onChange={() => { if (!isLocked) onToggleItem(item.id); }}
                  />
                  <span style={{ fontSize: 12, color: item.checked ? C.t2 : C.t3, flex: 1, lineHeight: 1.4 }}>
                    {item.label}
                  </span>
                  {item.infoText && (
                    <Tooltip title={item.infoText} placement="right">
                      <InfoCircleOutlined style={{ color: C.t4, fontSize: 11, cursor: 'help', flexShrink: 0 }} />
                    </Tooltip>
                  )}
                  {item.checked && (
                    <CheckCircleFilled style={{ color: '#22c55e', fontSize: 13, flexShrink: 0 }} />
                  )}
                </div>
              ))}
            </div>

            {/* Remarks */}
            <div style={{ marginBottom: 12 }}>
              <div style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.07em',
                color: C.t4, textTransform: 'uppercase', marginBottom: 5,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                Remarks / Notes
                {!isLocked && <span style={{ color: C.danger, letterSpacing: 0, textTransform: 'none', fontSize: 10 }}>· required to flag</span>}
              </div>
              <Input.TextArea
                rows={2}
                placeholder={isLocked && !dept.remarks.trim() ? 'No remarks added.' : `Add remarks for ${dept.name}…`}
                value={dept.remarks}
                onChange={e => { if (!isLocked) { onUpdateRemarks(e.target.value); if (e.target.value.trim()) setFlagError(false); } }}
                readOnly={isLocked}
                status={flagError && !dept.remarks.trim() ? 'error' : undefined}
                style={{ resize: 'none', fontSize: 12, background: isLocked ? 'var(--color-bg-subtle)' : C.surface, color: C.t2 }}
              />
              {flagError && !dept.remarks.trim() && (
                <div style={{ fontSize: 11, color: C.danger, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <WarningOutlined style={{ fontSize: 11 }} />
                  Remarks are required before flagging a department.
                </div>
              )}
            </div>

            {/* Attachments */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', color: C.t4, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <PaperClipOutlined />
                  Attachments
                  {dept.attachments.length > 0 && (
                    <span style={{ background: C.primary + '18', color: C.primary, borderRadius: 20, padding: '0 6px', height: 16, display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 700 }}>
                      {dept.attachments.length}
                    </span>
                  )}
                </div>
                {!isLocked && (
                  <Upload multiple showUploadList={false} beforeUpload={handleFileUpload}>
                    <Button size="small" icon={<UploadOutlined />} style={{ fontSize: 11, height: 26 }}>Upload</Button>
                  </Upload>
                )}
              </div>
              <AttachmentList
                attachments={dept.attachments} readonly={isLocked}
                onRemove={onRemoveAttachment} onPreview={setPreviewFile}
              />
            </div>

            {/* ── Footer actions ── */}
            {isLocked ? (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                paddingTop: 10, borderTop: `1px solid ${borderClr}`,
              }}>
                <Button
                  size="small" icon={<ReloadOutlined />} onClick={onReopen}
                  style={{ fontSize: 11, height: 28, color: C.warning, borderColor: C.wBorder, background: C.wBg }}
                >
                  Reopen
                </Button>
                {dept.cleanedOn && (
                  <span style={{ fontSize: 11, color: C.t3, display: 'flex', alignItems: 'center', gap: 5 }}>
                    {isSubmitted
                      ? <CheckCircleFilled style={{ color: '#22c55e', fontSize: 12 }} />
                      : <FlagFilled style={{ color: C.danger, fontSize: 11 }} />
                    }
                    <span style={{ color: isSubmitted ? C.success : C.danger, fontWeight: 600 }}>
                      {isSubmitted ? 'Cleaned' : 'Flagged'}
                    </span>
                    on {dept.cleanedOn}
                  </span>
                )}
              </div>
            ) : (
              <div style={{
                display: 'flex', gap: 6,
                paddingTop: 10, borderTop: `1px solid #f1f5f9`,
              }}>
                <Button
                  size="small" icon={<CheckSquareOutlined />} onClick={onMarkAll}
                  style={{ fontSize: 11, height: 28 }}
                >
                  Mark All
                </Button>
                <Button
                  size="small" type="primary" icon={<CheckCircleOutlined />} onClick={onSubmit}
                  style={{ fontSize: 11, height: 28, flex: 1 }}
                >
                  Confirm & Submit
                </Button>
                <Button
                  size="small" danger icon={<FlagOutlined />} onClick={handleFlag}
                  style={{ fontSize: 11, height: 28 }}
                >
                  Flag
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <AttachmentPreview file={previewFile} onClose={() => setPreviewFile(null)} />
    </>
  );
}

// ─── Employee Card ────────────────────────────────────────────────────────────
interface EmployeeCardProps {
  emp: EmployeeClearance; expanded: boolean; collapsedDepts: Set<string>;
  onToggleExpand: () => void; onToggleDept: (id: string) => void;
  onToggleItem: (deptId: string, itemId: string) => void;
  onMarkAll: (deptId: string) => void; onSubmitDept: (deptId: string) => void;
  onFlagDept: (deptId: string) => void; onReopenDept: (deptId: string) => void;
  onUpdateRemarks: (deptId: string, v: string) => void;
  onAddAttachment: (deptId: string, a: Attachment) => void;
  onRemoveAttachment: (deptId: string, uid: string) => void;
  onAddGlobalAttachment: (a: Attachment) => void;
  onRemoveGlobalAttachment: (uid: string) => void;
  onUpdateGlobalRemarks: (v: string) => void;
}

function EmployeeCard({
  emp, expanded, collapsedDepts,
  onToggleExpand, onToggleDept, onToggleItem,
  onMarkAll, onSubmitDept, onFlagDept, onReopenDept,
  onUpdateRemarks, onAddAttachment, onRemoveAttachment,
  onAddGlobalAttachment, onRemoveGlobalAttachment, onUpdateGlobalRemarks,
}: EmployeeCardProps) {
  const [globalPreview, setGlobalPreview] = useState<Attachment | null>(null);
  const status  = deriveStatus(emp);
  const stats   = computeStats(emp);
  const allDone = emp.depts.every(d => d.status === 'Submitted');

  const leftBorderColor = status === 'Cleared' ? C.success : status === 'Flagged' ? C.danger : C.warning;
  const progressColor   = stats.pct === 100 ? '#22c55e' : status === 'Flagged' ? '#ef4444' : C.primary;

  const handleGlobalUpload = (file: File) => {
    onAddGlobalAttachment({
      uid: `global-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: file.name, url: URL.createObjectURL(file),
      mimeType: file.type || 'application/octet-stream',
    });
    return false;
  };

  return (
    <>
      <div style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        transition: 'box-shadow 0.2s',
      }}>

        {/* ── Header ── */}
        <div
          style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}
          onClick={onToggleExpand}
        >
          <Avatar size={42} style={{ background: avatarColor(emp.empName), fontWeight: 800, fontSize: 15, flexShrink: 0, letterSpacing: '-0.5px' }}>
            {initials(emp.empName)}
          </Avatar>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.t1, lineHeight: 1.2 }}>{emp.empName}</div>
            <div style={{ fontSize: 12, color: C.t3, marginTop: 3 }}>
              {emp.department}
              <span style={{ margin: '0 6px', color: C.border }}>·</span>
              {emp.empId}
            </div>
          </div>

          {/* Right stats block */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            {/* Percentage + dept count */}
            <div style={{ textAlign: 'right', lineHeight: 1 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.t1, letterSpacing: '-0.03em' }}>
                {stats.pct}<span style={{ fontSize: 13, fontWeight: 600, color: C.t3 }}>%</span>
              </div>
              <div style={{ fontSize: 11, color: C.t4, marginTop: 3 }}>
                {stats.submittedDepts}/{stats.totalDepts} depts
              </div>
            </div>

            <div style={{ width: 1, height: 32, background: C.border }} />

            <StatusBadge status={status} />

            <Button
              size="small"
              icon={<DownloadOutlined />}
              onClick={e => { e.stopPropagation(); message.info('Exporting PDF…'); }}
              style={{ fontSize: 11, height: 28, color: C.t3, borderColor: C.border }}
            >
              Export PDF
            </Button>

            <span style={{ color: C.t4, fontSize: 11, transition: 'transform 0.2s', display: 'block', transform: expanded ? 'rotate(90deg)' : 'none' }}>
              <RightOutlined />
            </span>
          </div>
        </div>

        {/* ── Progress bar ── */}
        <div style={{ height: 5, background: 'var(--color-bg-subtle)' }}>
          <div style={{ height: '100%', width: `${stats.pct}%`, background: progressColor, transition: 'width 0.5s ease' }} />
        </div>

        {/* ── Content ── */}
        {expanded ? (
          <div style={{ padding: '20px 20px 16px' }}>

            {/* All-cleared call-to-action */}
            {allDone && (
              <div style={{
                background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
                border: `1px solid ${C.sBorder}`,
                borderLeft: `4px solid ${C.success}`,
                borderRadius: 10,
                padding: '14px 18px',
                marginBottom: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                flexWrap: 'wrap',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--color-status-approved-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CheckCircleFilled style={{ color: C.success, fontSize: 20 }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-primary-dark)' }}>
                      All {emp.depts.length} departments have confirmed clearance
                    </div>
                    <div style={{ fontSize: 12, color: C.success, marginTop: 2 }}>
                      Ready to proceed to Final Settlement.
                    </div>
                  </div>
                </div>
                <Button
                  type="primary"
                  icon={<FileDoneOutlined />}
                  size="middle"
                  onClick={() => message.success(`Proceeding to Final Settlement for ${emp.empName}…`)}
                  style={{ background: C.success, borderColor: C.success, fontWeight: 700, flexShrink: 0 }}
                >
                  Confirm &amp; Proceed to Final Settlement
                </Button>
              </div>
            )}

            {/* Department grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 20 }}>
              {emp.depts.map(dept => (
                <DeptCard
                  key={dept.id}
                  empId={emp.id}
                  dept={dept}
                  isCollapsed={collapsedDepts.has(dept.id)}
                  onToggleCollapse={() => onToggleDept(dept.id)}
                  onToggleItem={itemId => onToggleItem(dept.id, itemId)}
                  onMarkAll={() => onMarkAll(dept.id)}
                  onSubmit={() => onSubmitDept(dept.id)}
                  onFlag={() => onFlagDept(dept.id)}
                  onReopen={() => onReopenDept(dept.id)}
                  onUpdateRemarks={v => onUpdateRemarks(dept.id, v)}
                  onAddAttachment={a => onAddAttachment(dept.id, a)}
                  onRemoveAttachment={uid => onRemoveAttachment(dept.id, uid)}
                />
              ))}
            </div>

            {/* Global remarks & attachments */}
            <div style={{
              background: 'var(--color-bg-subtle)',
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: '16px 18px',
              marginBottom: 14,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', color: C.t3, textTransform: 'uppercase', marginBottom: 12 }}>
                Overall Remarks &amp; Attachments
              </div>
              <Input.TextArea
                rows={2}
                placeholder="Add overall remarks for this employee's clearance…"
                value={emp.globalRemarks}
                onChange={e => onUpdateGlobalRemarks(e.target.value)}
                style={{ resize: 'none', fontSize: 12, marginBottom: 10 }}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', color: C.t4, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <PaperClipOutlined />
                  Attachments
                  {emp.globalAttachments.length > 0 && (
                    <span style={{ background: C.primary + '18', color: C.primary, borderRadius: 20, padding: '0 6px', height: 16, display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 700 }}>
                      {emp.globalAttachments.length}
                    </span>
                  )}
                </div>
                <Upload multiple showUploadList={false} beforeUpload={handleGlobalUpload}>
                  <Button size="small" icon={<UploadOutlined />} style={{ fontSize: 11, height: 26 }}>Upload</Button>
                </Upload>
              </div>
              <AttachmentList
                attachments={emp.globalAttachments} readonly={false}
                onRemove={onRemoveGlobalAttachment} onPreview={setGlobalPreview}
              />
            </div>

            {/* Send reminders */}
            {!allDone && (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  icon={<SendOutlined />}
                  onClick={() => {
                    const n = emp.depts.filter(d => d.status !== 'Submitted').length;
                    message.success(`Reminders sent to ${n} pending department${n > 1 ? 's' : ''}.`);
                  }}
                  style={{ color: C.primary, borderColor: C.primary, fontWeight: 600 }}
                >
                  Send Reminders to Pending Departments
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* Collapsed — dept pills */
          <div style={{ padding: '10px 18px 14px', display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {emp.depts.map(dept => {
              const dotClr = dept.status === 'Submitted' ? '#22c55e' : dept.status === 'Flagged' ? '#ef4444' : '#f59e0b';
              const pillBg = dept.status === 'Submitted' ? 'var(--color-status-approved-bg)' : dept.status === 'Flagged' ? 'var(--color-status-rejected-bg)' : 'var(--color-status-pending-bg)';
              const pillBdr = dept.status === 'Submitted' ? C.sBorder : dept.status === 'Flagged' ? C.dBorder : C.wBorder;
              return (
                <span key={dept.id} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '3px 10px', borderRadius: 20,
                  background: pillBg, border: `1px solid ${pillBdr}`,
                  fontSize: 11, fontWeight: 500, color: C.t2,
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: dotClr, flexShrink: 0 }} />
                  {dept.name}
                </span>
              );
            })}
          </div>
        )}
      </div>

      <AttachmentPreview file={globalPreview} onClose={() => setGlobalPreview(null)} />
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
type FilterKey = 'All' | ClearanceStatus;

const FILTER_TABS: { key: FilterKey; label: string }[] = [
  { key: 'All',     label: 'All'     },
  { key: 'Pending', label: 'Pending' },
  { key: 'Cleared', label: 'Cleared' },
  { key: 'Flagged', label: 'Flagged' },
];

// ─── Filter types ─────────────────────────────────────────────────────────────
type DateRange = [Dayjs, Dayjs] | null;

interface Filters {
  search:    string;
  dept:      string;
  dateRange: DateRange;
}

const EMPTY_FILTERS: Filters = { search: '', dept: '', dateRange: null };

const ALL_DEPARTMENTS = Array.from(new Set(INITIAL_DATA.map(e => e.department))).sort();

export default function ClearanceManagementPage() {
  const [employees, setEmployees]           = useState(INITIAL_DATA);
  const [expandedEmps, setExpandedEmps]     = useState<Set<string>>(new Set(['emp-1']));
  const [collapsedDepts, setCollapsedDepts] = useState<Set<string>>(new Set());
  const [filter, setFilter]                 = useState<FilterKey>('All');

  const [draft,       setDraft]       = useState<Filters>(EMPTY_FILTERS);
  const [applied,     setApplied]     = useState<Filters>(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  const handleApply = () => setApplied(draft);
  const handleReset = () => {
    setDraft(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setFilter('All');
  };

  const summary = useMemo(() => {
    let cleared = 0, pending = 0, flagged = 0;
    for (const emp of employees) {
      const s = deriveStatus(emp);
      if (s === 'Cleared') cleared++; else if (s === 'Flagged') flagged++; else pending++;
    }
    return { total: employees.length, cleared, pending, flagged };
  }, [employees]);

  const counts: Record<FilterKey, number> = {
    All: summary.total, Pending: summary.pending, Cleared: summary.cleared, Flagged: summary.flagged,
  };

  const filtered = useMemo(() => {
    const q = applied.search.trim().toLowerCase();
    return employees.filter(e => {
      if (filter !== 'All' && deriveStatus(e) !== filter) return false;
      if (applied.dept && e.department !== applied.dept) return false;
      if (q && !e.empName.toLowerCase().includes(q) && !e.empId.toLowerCase().includes(q)) return false;
      if (applied.dateRange) {
        const [from, to] = applied.dateRange;
        const hasDeptInRange = e.depts.some(d => {
          if (!d.cleanedOn) return false;
          const dt = dayjs(d.cleanedOn);
          return !dt.isBefore(from.startOf('day')) && !dt.isAfter(to.endOf('day'));
        });
        if (!hasDeptInRange) return false;
      }
      return true;
    });
  }, [employees, filter, applied]);

  // ── Mutations ──
  const updateEmp  = (id: string, fn: (e: EmployeeClearance) => EmployeeClearance) =>
    setEmployees(p => p.map(e => e.id === id ? fn(e) : e));
  const updateDept = (eId: string, dId: string, fn: (d: DeptClearance) => DeptClearance) =>
    updateEmp(eId, e => ({ ...e, depts: e.depts.map(d => d.id === dId ? fn(d) : d) }));

  const toggleItem = (eId: string, dId: string, iId: string) =>
    updateDept(eId, dId, d => ({ ...d, items: d.items.map(i => i.id === iId ? { ...i, checked: !i.checked } : i) }));
  const markAll    = (eId: string, dId: string) =>
    updateDept(eId, dId, d => ({ ...d, items: d.items.map(i => ({ ...i, checked: true })) }));
  const submitDept = (eId: string, dId: string) => {
    updateDept(eId, dId, d => ({ ...d, status: 'Submitted', items: d.items.map(i => ({ ...i, checked: true })), cleanedOn: new Date().toISOString().split('T')[0] }));
    message.success('Department clearance submitted.');
  };
  const flagDept = (eId: string, dId: string) => {
    updateDept(eId, dId, d => ({ ...d, status: 'Flagged', cleanedOn: new Date().toISOString().split('T')[0] }));
    message.warning('Department flagged for review.');
  };
  const reopenDept = (eId: string, dId: string) => {
    updateDept(eId, dId, d => ({ ...d, status: 'Pending', cleanedOn: undefined }));
    message.info('Department clearance reopened.');
  };
  const addAtt    = (eId: string, dId: string, a: Attachment) =>
    updateDept(eId, dId, d => ({ ...d, attachments: [...d.attachments, a] }));
  const removeAtt = (eId: string, dId: string, uid: string) =>
    updateDept(eId, dId, d => ({ ...d, attachments: d.attachments.filter(a => a.uid !== uid) }));
  const addGlobal    = (eId: string, a: Attachment) =>
    updateEmp(eId, e => ({ ...e, globalAttachments: [...e.globalAttachments, a] }));
  const removeGlobal = (eId: string, uid: string) =>
    updateEmp(eId, e => ({ ...e, globalAttachments: e.globalAttachments.filter(a => a.uid !== uid) }));
  const toggleEmp  = (id: string) =>
    setExpandedEmps(p => { const s = new Set(p); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const toggleDept = (id: string) =>
    setCollapsedDepts(p => { const s = new Set(p); s.has(id) ? s.delete(id) : s.add(id); return s; });

  // ── Render ──
  return (
    <div className="page-shell">

      {/* ── Page header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <div className="module-icon-box">
          <ClearOutlined style={{ color: '#fff', fontSize: 15 }} />
        </div>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: C.t1, margin: 0, lineHeight: 1.2 }}>
            Clearance Management
          </h1>
          <p style={{ fontSize: 12, color: C.t3, margin: '3px 0 0' }}>
            Track and manage department-wise clearance for separating employees
          </p>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
        <StatCard label="Total Records"  value={summary.total}   accentColor={C.t1}      icon={<TeamOutlined />} />
        <StatCard label="Fully Cleared"  value={summary.cleared} accentColor={C.success}  icon={<CheckCircleFilled />} />
        <StatCard label="Pending"        value={summary.pending} accentColor={C.warning}  icon={<ClockCircleOutlined />} />
        <StatCard label="Flagged"        value={summary.flagged} accentColor={C.danger}   icon={<FlagFilled />} />
      </div>

      {/* ── Filter bar ── */}
      <div className="filter-bar">
        <div>
          <div className="filter-label">SEARCH</div>
          <Input
            allowClear
            prefix={<SearchOutlined style={{ color: 'var(--color-text-disabled)' }} />}
            placeholder="Search by employee name or ID…"
            value={draft.search}
            onChange={e => setDraft(p => ({ ...p, search: e.target.value }))}
            style={{ width: 300 }}
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
            <Col flex="1 1 180px">
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--color-text-tertiary)', marginBottom: 6, textTransform: 'uppercase' }}>Department</div>
              <Select
                allowClear
                placeholder="All Departments"
                style={{ width: '100%' }}
                value={draft.dept || undefined}
                onChange={v => setDraft(p => ({ ...p, dept: v ?? '' }))}
                options={ALL_DEPARTMENTS.map(d => ({ label: d, value: d }))}
              />
            </Col>
            <Col flex="2 1 260px">
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--color-text-tertiary)', marginBottom: 6, textTransform: 'uppercase' }}>Clearance Date Range</div>
              <DatePicker.RangePicker
                value={draft.dateRange}
                onChange={v => setDraft(p => ({ ...p, dateRange: (v && v[0] && v[1]) ? [v[0], v[1]] : null }))}
                format="DD MMM YYYY"
                placeholder={['Cleared from', 'Cleared to']}
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

      {/* ── Filter tabs ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {FILTER_TABS.map(tab => {
          const isActive = filter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`tab-pill${isActive ? ' active' : ''}`}
            >
              {tab.label}
              <span style={{
                marginLeft: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                minWidth: 18, height: 18, borderRadius: 9, padding: '0 4px',
                fontSize: 10, fontWeight: 700,
                background: isActive ? C.primary : 'var(--color-border)',
                color:      isActive ? '#fff'     : C.t3,
                verticalAlign: 'middle',
              }}>
                {counts[tab.key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Employee list ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(emp => (
          <EmployeeCard
            key={emp.id}
            emp={emp}
            expanded={expandedEmps.has(emp.id)}
            collapsedDepts={collapsedDepts}
            onToggleExpand={() => toggleEmp(emp.id)}
            onToggleDept={toggleDept}
            onToggleItem={(dId, iId) => toggleItem(emp.id, dId, iId)}
            onMarkAll={dId => markAll(emp.id, dId)}
            onSubmitDept={dId => submitDept(emp.id, dId)}
            onFlagDept={dId => flagDept(emp.id, dId)}
            onReopenDept={dId => reopenDept(emp.id, dId)}
            onUpdateRemarks={(dId, v) => updateDept(emp.id, dId, d => ({ ...d, remarks: v }))}
            onAddAttachment={(dId, a) => addAtt(emp.id, dId, a)}
            onRemoveAttachment={(dId, uid) => removeAtt(emp.id, dId, uid)}
            onAddGlobalAttachment={a => addGlobal(emp.id, a)}
            onRemoveGlobalAttachment={uid => removeGlobal(emp.id, uid)}
            onUpdateGlobalRemarks={v => updateEmp(emp.id, e => ({ ...e, globalRemarks: v }))}
          />
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px 0', color: C.t4, fontSize: 14 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
            No employees found for this filter.
          </div>
        )}
      </div>
    </div>
  );
}
