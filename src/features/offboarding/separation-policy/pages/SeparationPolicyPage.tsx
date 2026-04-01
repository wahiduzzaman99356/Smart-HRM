import { useState } from 'react';
import { Button, Popconfirm, message, Tooltip } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  FileTextOutlined,
  SwapOutlined,
  AlertOutlined,
  TrophyOutlined,
  StopOutlined,
  WarningOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  UsergroupAddOutlined,
  FileDoneOutlined,
  CommentOutlined,
  AuditOutlined,
  ExportOutlined,
  ScissorOutlined,
  HolderOutlined,
} from '@ant-design/icons';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AddModeModal, EditModeModal, type AddModeFormValues, type ModeFormValues } from '../components/AddModeModal';
import { AddDeptModal, EditDeptModal, type DeptFormValues } from '../components/ClearanceDeptModal';
import { RichTextPolicyModal } from '../components/RichTextPolicyModal';

// ─── Types ────────────────────────────────────────────────────────────────────

type SepModeData = {
  id: string;
  name: string;
  description: string;
  noticePeriod: number | 'Immediate';
  employeeType: string | null;
  iconEl: React.ReactNode;
  iconColor: string;
  iconBg: string;
  probationDays: number;
  confirmedDays: number;
  note: string;
  policyRules: string[];
};

type ClearanceDept = {
  id: string;
  order: number;
  name: string;
  category: string;
  items: string[];
  section?: string;
  designation?: string;
  assignedPerson?: string;
};

// ─── Default policy HTML ──────────────────────────────────────────────────────

const DEFAULT_EXIT_INTERVIEW_HTML = `<p>Exit interviews are conducted on a <strong>voluntary basis</strong> before the employee's last working day to improve HR processes and gather value-added suggestions.</p><h3>Topics Covered</h3><ul><li>Departing employee's reasons for leaving, views, and opinions</li><li>Suggestions for improving policies, procedures and overall working environment</li><li>Reminder of continued obligation to maintain confidentiality</li></ul>`;

const DEFAULT_EXPERIENCE_CERT_HTML = `<p>Separated employees are entitled to an <strong>Experience Certificate</strong> from the Human Resources Department, issued by the Head of Human Resources describing the length of service and the reason of separation.</p>`;

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MODES: SepModeData[] = [
  {
    id: 'dismissal',
    name: 'Dismissal',
    description: 'Immediate dismissal for serious misconduct',
    noticePeriod: 'Immediate',
    employeeType: 'All Employees',
    iconEl: <StopOutlined />,
    iconColor: '#dc2626',
    iconBg: '#fef2f2',
    probationDays: 0,
    confirmedDays: 0,
    note: 'Immediate — no notice required',
    policyRules: [
      'May dismiss any employee for serious misconduct.',
      'Employees dismissed with cause may lose all or part of their benefits.',
      'Employment will be dismissed immediately with or without pay depending on the type of misconduct.',
    ],
  },
  {
    id: 'termination',
    name: 'Termination',
    description: 'Management-initiated termination of confirmed employee',
    noticePeriod: 120,
    employeeType: null,
    iconEl: <WarningOutlined />,
    iconColor: '#d97706',
    iconBg: '#fffbeb',
    probationDays: 60,
    confirmedDays: 120,
    note: 'Requires written notice and supporting documentation.',
    policyRules: [
      'Management may terminate an employee upon serving the required notice period.',
      'Notice period must be served or compensated in lieu.',
    ],
  },
  {
    id: 'resignation',
    name: 'Resignation',
    description: 'Employee-initiated voluntary departure',
    noticePeriod: 60,
    employeeType: 'All Employees',
    iconEl: <ExportOutlined />,
    iconColor: '#ea580c',
    iconBg: '#fff7ed',
    probationDays: 30,
    confirmedDays: 60,
    note: 'Employee must submit a formal written resignation.',
    policyRules: [
      'Employee must provide written notice as per employment contract.',
      'Notice period can be waived by mutual agreement with management.',
    ],
  },
  {
    id: 'discharge',
    name: 'Discharge',
    description: 'Discharge due to physical or mental incapacity',
    noticePeriod: 'Immediate',
    employeeType: null,
    iconEl: <MedicineBoxOutlined />,
    iconColor: '#7c3aed',
    iconBg: '#f5f3ff',
    probationDays: 0,
    confirmedDays: 0,
    note: 'Medical certification from an approved practitioner required.',
    policyRules: [
      'Must be supported by certified medical documentation.',
      'Employee is entitled to applicable medical and disability benefits.',
    ],
  },
  {
    id: 'loss-of-lien',
    name: 'Loss of Lien',
    description: 'Deemed resignation due to unauthorized absence',
    noticePeriod: 'Immediate',
    employeeType: 'All Employees',
    iconEl: <AlertOutlined />,
    iconColor: '#dc2626',
    iconBg: '#fef2f2',
    probationDays: 0,
    confirmedDays: 0,
    note: 'Triggered after continuous unauthorized absence beyond the threshold.',
    policyRules: [
      'Applies after unauthorized absence exceeds the defined threshold period.',
      'Employee is notified via registered mail before the process is finalized.',
    ],
  },
  {
    id: 'retrenchment',
    name: 'Retrenchment',
    description: 'Service termination on grounds of redundancy',
    noticePeriod: 30,
    employeeType: null,
    iconEl: <ScissorOutlined />,
    iconColor: '#6b7280',
    iconBg: '#f9fafb',
    probationDays: 15,
    confirmedDays: 30,
    note: 'Statutory retrenchment benefits and dues apply.',
    policyRules: [
      'Retrenchment must be justified by genuine business necessity.',
      'Retrenched employees are entitled to statutory severance benefits.',
    ],
  },
  {
    id: 'retirement',
    name: 'Retirement',
    description: 'Normal retirement at end of service age',
    noticePeriod: 90,
    employeeType: 'All Employees',
    iconEl: <TrophyOutlined />,
    iconColor: '#d97706',
    iconBg: '#fffbeb',
    probationDays: 90,
    confirmedDays: 90,
    note: 'Retirement benefits, gratuity, and provident fund apply.',
    policyRules: [
      'Retirement age is governed by company policy and local statutory regulations.',
      'Retiring employees are entitled to full retirement and gratuity benefits.',
    ],
  },
  {
    id: 'death',
    name: 'Death',
    description: 'Separation due to death of employee',
    noticePeriod: 'Immediate',
    employeeType: 'All Employees',
    iconEl: <HeartOutlined />,
    iconColor: '#6b7280',
    iconBg: '#f9fafb',
    probationDays: 0,
    confirmedDays: 0,
    note: 'All dues and settlement to be made to legal heirs.',
    policyRules: [
      'Official death certificate must be submitted by the employee\'s family.',
      'All dues and entitled benefits are settled to the next of kin or legal heir.',
    ],
  },
  {
    id: 'deputation',
    name: 'Deputation',
    description: 'Transfer to/from third party on deputation',
    noticePeriod: 'Immediate',
    employeeType: null,
    iconEl: <SwapOutlined />,
    iconColor: '#2563eb',
    iconBg: '#eff6ff',
    probationDays: 0,
    confirmedDays: 0,
    note: 'Employee status is restored on completion of the deputation period.',
    policyRules: [
      'Employee is temporarily seconded to a third-party organization.',
      'All service benefits and continuity are maintained during the deputation.',
    ],
  },
  {
    id: 'end-of-contract',
    name: 'End of Contract',
    description: 'Fixed-term contract completion',
    noticePeriod: 15,
    employeeType: 'All Employees',
    iconEl: <FileTextOutlined />,
    iconColor: '#6b7280',
    iconBg: '#f9fafb',
    probationDays: 0,
    confirmedDays: 15,
    note: 'Contract naturally expires on the stipulated end date.',
    policyRules: [
      'No further notice is required when the contract end date is reached.',
      'Employee may be offered a contract renewal at management\'s discretion.',
    ],
  },
  {
    id: 'mutual-agreement',
    name: 'Mutual Agreement',
    description: 'Consensual separation between employer and employee',
    noticePeriod: 30,
    employeeType: 'All Employees',
    iconEl: <UsergroupAddOutlined />,
    iconColor: '#d97706',
    iconBg: '#fffbeb',
    probationDays: 0,
    confirmedDays: 30,
    note: 'Requires signed agreement from both parties prior to processing.',
    policyRules: [
      'Both parties must formally agree to the separation terms in writing.',
      'Settlement terms are negotiated on a case-by-case basis.',
    ],
  },
  {
    id: 'layoff',
    name: 'Layoff',
    description: 'Position elimination or organizational restructuring',
    noticePeriod: 30,
    employeeType: null,
    iconEl: <TeamOutlined />,
    iconColor: '#2563eb',
    iconBg: '#eff6ff',
    probationDays: 15,
    confirmedDays: 30,
    note: 'Severance pay is applicable as per company policy.',
    policyRules: [
      'Layoffs must be approved by senior management and documented.',
      'Affected employees receive severance compensation based on length of service.',
    ],
  },
];

const CLEARANCE_DEPTS: ClearanceDept[] = [
  {
    id: 'c1', order: 1, name: 'Immediate Supervisor', category: 'Management',
    items: ['Necessary Documentation', 'Handing over Responsibility', 'Others'],
  },
  {
    id: 'c2', order: 2, name: 'Finance & Accounts', category: 'Finance',
    items: ['Advance Adjusted Bill', 'PF Loan Adjusted', 'Asset Lost Adjusted', 'Others'],
  },
  {
    id: 'c3', order: 3, name: 'Administration', category: 'Admin',
    items: ['Stationary Items', 'Business Card', 'Desk Key', 'Uniform (if Applicable)', 'SIM Card', 'Others'],
  },
  {
    id: 'c4', order: 4, name: 'Asset Management (IT)', category: 'IT',
    items: ['Laptop with Charger', 'Tablet with Charger', 'Internet Modem', 'Pen Drive', 'Other IT Assets'],
  },
  {
    id: 'c5', order: 5, name: 'IT Department', category: 'IT',
    items: ['Email Password Received', 'Computer Password Received', 'Email A/C Delete Request', 'Computer Data Received', 'IT Device Condition Check', 'Zenith ID Closing', 'Other IT Passwords/Devices'],
  },
  {
    id: 'c6', order: 6, name: 'Airline Security', category: 'Security',
    items: ['Security Pass', 'Apron Pass', 'Duty Pass', 'Others'],
  },
  {
    id: 'c7', order: 7, name: 'Revenue Department', category: 'Revenue',
    items: ['MCD ID Closing (if applicable)', 'Others'],
  },
  {
    id: 'c8', order: 8, name: 'Head of Department', category: 'Management',
    items: ['Job Related Charges Handover'],
  },
  {
    id: 'c9', order: 9, name: 'HR Department', category: 'HR',
    items: ['Leave Application Received', 'ID Card Received', 'Filled out Handover Report'],
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

// ─── Sortable department card ─────────────────────────────────────────────────

function SortableDeptCard({
  dept,
  onEdit,
  onDelete,
}: {
  dept: ClearanceDept;
  onEdit: (d: ClearanceDept) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: dept.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.45 : 1,
        zIndex: isDragging ? 10 : 'auto',
        background: '#ffffff',
        border: isDragging ? '1.5px solid #0f766e' : '1.5px solid #e5e7eb',
        borderRadius: 12,
        padding: '14px 16px',
        boxShadow: isDragging
          ? '0 8px 24px rgba(15,118,110,0.15)'
          : '0 1px 3px rgba(17,24,39,0.04)',
        cursor: 'default',
      }}
    >
      {/* Card header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 10 }}>

        {/* Drag handle */}
        <Tooltip title="Drag to reorder" mouseEnterDelay={0.6}>
          <span
            {...attributes}
            {...listeners}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 20, height: 24, marginRight: 6, flexShrink: 0,
              color: '#d1d5db', cursor: 'grab', touchAction: 'none',
              transition: 'color 0.12s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#9ca3af')}
            onMouseLeave={e => (e.currentTarget.style.color = '#d1d5db')}
          >
            <HolderOutlined style={{ fontSize: 14 }} />
          </span>
        </Tooltip>

        {/* Order badge */}
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 24, height: 24, borderRadius: '50%',
          background: '#f1f5f9', color: '#475569',
          fontSize: 11, fontWeight: 700, flexShrink: 0, marginRight: 10, marginTop: 1,
        }}>
          {dept.order}
        </span>

        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>{dept.name}</div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{dept.category}</div>
        </div>

        <div style={{ display: 'flex', gap: 2 }}>
          <button
            onClick={() => onEdit(dept)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#9ca3af', padding: '3px 5px', borderRadius: 5,
              display: 'flex', alignItems: 'center', lineHeight: 1,
              transition: 'color 0.12s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#374151')}
            onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}
          >
            <EditOutlined style={{ fontSize: 12 }} />
          </button>
          <Popconfirm
            title={`Remove "${dept.name}"?`}
            onConfirm={() => onDelete(dept.id)}
            okText="Remove"
            cancelText="Cancel"
            okButtonProps={{ danger: true, size: 'small' }}
            cancelButtonProps={{ size: 'small' }}
          >
            <button
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#9ca3af', padding: '3px 5px', borderRadius: 5,
                display: 'flex', alignItems: 'center', lineHeight: 1,
                transition: 'color 0.12s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#dc2626')}
              onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}
            >
              <DeleteOutlined style={{ fontSize: 12 }} />
            </button>
          </Popconfirm>
        </div>
      </div>

      {/* Checklist items */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {dept.items.map((item, i) => (
          <span
            key={i}
            style={{
              padding: '2px 8px', borderRadius: 4,
              background: '#f1f5f9', color: '#475569',
              fontSize: 11, fontWeight: 500,
              border: '1px solid #e2e8f0',
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  count,
  addLabel,
  onAdd,
}: {
  icon: React.ReactNode;
  title: string;
  count?: number;
  addLabel?: string;
  onAdd?: () => void;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      paddingBottom: 14, marginBottom: 20,
      borderBottom: '1.5px solid #e5e7eb',
    }}>
      <span style={{ color: '#6b7280', fontSize: 14, display: 'flex', alignItems: 'center' }}>{icon}</span>
      <span style={{
        fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
        color: '#374151', textTransform: 'uppercase',
      }}>
        {title}
      </span>
      {count !== undefined && (
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          minWidth: 22, height: 18, borderRadius: 9,
          background: '#e5e7eb', color: '#6b7280',
          fontSize: 11, fontWeight: 700, padding: '0 6px',
        }}>
          {count}
        </span>
      )}
      {onAdd && addLabel && (
        <Button
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          onClick={onAdd}
          style={{ marginLeft: 'auto' }}
        >
          {addLabel}
        </Button>
      )}
    </div>
  );
}

function ModeIconBadge({ mode }: { mode: SepModeData }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 40, height: 40, borderRadius: 10,
      background: mode.iconBg, color: mode.iconColor,
      fontSize: 18, flexShrink: 0,
    }}>
      {mode.iconEl}
    </span>
  );
}

function NoticeBadge({ period }: { period: number | 'Immediate' }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 11, color: '#6b7280', fontWeight: 500,
    }}>
      <ClockCircleOutlined style={{ fontSize: 11 }} />
      {period === 'Immediate' ? 'Immediate' : `${period} days`}
    </span>
  );
}

function EmpTypeBadge({ type }: { type: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 4,
      background: '#f1f5f9', color: '#475569',
      fontSize: 10, fontWeight: 600, letterSpacing: '0.03em',
    }}>
      {type}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SeparationPolicyPage() {
  const [modes, setModes] = useState<SepModeData[]>(MODES);
  const [depts, setDepts] = useState<ClearanceDept[]>(CLEARANCE_DEPTS);
  const [selectedModeId, setSelectedModeId] = useState<string | null>('dismissal');
  const [addModeOpen, setAddModeOpen] = useState(false);
  const [editModeTarget, setEditModeTarget] = useState<SepModeData | null>(null);
  const [addDeptOpen, setAddDeptOpen] = useState(false);
  const [editDeptTarget, setEditDeptTarget] = useState<ClearanceDept | null>(null);
  const [exitInterviewHtml, setExitInterviewHtml] = useState(DEFAULT_EXIT_INTERVIEW_HTML);
  const [experienceCertHtml, setExperienceCertHtml] = useState(DEFAULT_EXPERIENCE_CERT_HTML);
  const [editExitInterviewOpen, setEditExitInterviewOpen] = useState(false);
  const [editExperienceCertOpen, setEditExperienceCertOpen] = useState(false);

  const selectedMode = modes.find(m => m.id === selectedModeId) ?? null;

  const openEditMode = (mode: SepModeData) => setEditModeTarget(mode);

  const handleUpdateMode = (values: ModeFormValues) => {
    if (!editModeTarget) return;
    setModes(prev => prev.map(m =>
      m.id !== editModeTarget.id ? m : {
        ...m,
        name: values.name,
        description: values.description,
        employeeType: values.availableForAll ? 'All Employees' : null,
        probationDays: values.probationDays,
        confirmedDays: values.confirmedDays,
        noticePeriod: values.confirmedDays === 0 ? 'Immediate' : values.confirmedDays,
        note: values.noticeNote,
        policyRules: values.policyRules,
      }
    ));
    message.success(`"${values.name}" updated.`);
    setEditModeTarget(null);
  };

  const handleAddMode = (values: AddModeFormValues) => {
    const newMode: SepModeData = {
      id: `mode-${Date.now()}`,
      name: values.name,
      description: values.description,
      noticePeriod: values.confirmedDays === 0 ? 'Immediate' : values.confirmedDays,
      employeeType: values.availableForAll ? 'All Employees' : null,
      iconEl: <FileTextOutlined />,
      iconColor: '#6b7280',
      iconBg: '#f9fafb',
      probationDays: values.probationDays,
      confirmedDays: values.confirmedDays,
      note: values.noticeNote,
      policyRules: values.policyRules,
    };
    setModes(prev => [...prev, newMode]);
    setAddModeOpen(false);
    message.success(`"${values.name}" mode added.`);
  };

  const handleDeleteMode = (id: string) => {
    setModes(prev => prev.filter(m => m.id !== id));
    if (selectedModeId === id) setSelectedModeId(null);
    message.success('Separation mode removed.');
  };

  const handleDeleteDept = (id: string) => {
    setDepts(prev => {
      const next = prev.filter(d => d.id !== id);
      return next.map((d, i) => ({ ...d, order: i + 1 }));
    });
    message.success('Clearance department removed.');
  };

  const deptSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setDepts(prev => {
      const oldIndex = prev.findIndex(d => d.id === active.id);
      const newIndex = prev.findIndex(d => d.id === over.id);
      const reordered = arrayMove(prev, oldIndex, newIndex);
      return reordered.map((d, i) => ({ ...d, order: i + 1 }));
    });
  };

  const handleAddDept = (values: DeptFormValues) => {
    const newDept: ClearanceDept = {
      id: `dept-${Date.now()}`,
      order: depts.length + 1,
      name: values.name,
      category: values.department,
      items: values.clearanceTypes,
      section: values.section,
      designation: values.designation,
      assignedPerson: values.assignedPerson,
    };
    setDepts(prev => [...prev, newDept]);
    setAddDeptOpen(false);
    message.success(`"${values.name}" added to clearance departments.`);
  };

  const handleUpdateDept = (values: DeptFormValues) => {
    if (!editDeptTarget) return;
    setDepts(prev => prev.map(d =>
      d.id !== editDeptTarget.id ? d : {
        ...d,
        name: values.name,
        category: values.department,
        items: values.clearanceTypes,
        section: values.section,
        designation: values.designation,
        assignedPerson: values.assignedPerson,
      }
    ));
    message.success(`"${values.name}" updated.`);
    setEditDeptTarget(null);
  };

  return (
    <div className="page-shell">

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="page-header-row">
        <div>
          <h1>Separation Policy</h1>
          <p>Configure separation modes, notice periods, clearance flow &amp; policy rules</p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 1 — MODES OF SEPARATION
      ═══════════════════════════════════════════════════════════════════════ */}
      <div style={{ marginBottom: 40 }}>
        <SectionHeader
          icon={<AuditOutlined />}
          title="Modes of Separation"
          count={modes.length}
          addLabel="Add Mode"
          onAdd={() => setAddModeOpen(true)}
        />

        {/* Modes grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 12,
          marginBottom: selectedMode ? 16 : 0,
        }}>
          {modes.map(mode => {
            const isSelected = selectedModeId === mode.id;
            return (
              <div
                key={mode.id}
                onClick={() => setSelectedModeId(isSelected ? null : mode.id)}
                style={{
                  position: 'relative',
                  background: '#ffffff',
                  border: isSelected ? `2px solid #0f766e` : '1.5px solid #e5e7eb',
                  borderRadius: 12,
                  padding: '14px 14px 12px',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                  boxShadow: isSelected ? '0 0 0 3px rgba(15,118,110,0.10)' : '0 1px 3px rgba(17,24,39,0.05)',
                }}
              >
                {/* Edit / Delete actions */}
                <div
                  style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 2 }}
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    onClick={() => openEditMode(mode)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#9ca3af', padding: '3px 5px', borderRadius: 5,
                      display: 'flex', alignItems: 'center', lineHeight: 1,
                      transition: 'color 0.12s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#374151')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}
                  >
                    <EditOutlined style={{ fontSize: 12 }} />
                  </button>
                  <Popconfirm
                    title={`Remove "${mode.name}"?`}
                    onConfirm={() => handleDeleteMode(mode.id)}
                    okText="Remove"
                    cancelText="Cancel"
                    okButtonProps={{ danger: true, size: 'small' }}
                    cancelButtonProps={{ size: 'small' }}
                  >
                    <button
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#9ca3af', padding: '3px 5px', borderRadius: 5,
                        display: 'flex', alignItems: 'center', lineHeight: 1,
                        transition: 'color 0.12s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#dc2626')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}
                    >
                      <DeleteOutlined style={{ fontSize: 12 }} />
                    </button>
                  </Popconfirm>
                </div>

                {/* Icon */}
                <ModeIconBadge mode={mode} />

                {/* Content */}
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#111827', marginBottom: 3, paddingRight: 36 }}>
                    {mode.name}
                  </div>
                  <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.4, marginBottom: 10 }}>
                    {mode.description}
                  </div>
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <NoticeBadge period={mode.noticePeriod} />
                  {mode.employeeType && <EmpTypeBadge type={mode.employeeType} />}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Selected mode detail panel ─────────────────────────────────────── */}
        {selectedMode && (
          <div style={{
            background: '#ffffff',
            border: '1.5px solid #e5e7eb',
            borderRadius: 12,
            padding: '20px 24px',
            boxShadow: '0 2px 8px rgba(17,24,39,0.06)',
          }}>
            {/* Detail header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
              <ModeIconBadge mode={selectedMode} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{selectedMode.name}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{selectedMode.description}</div>
                {selectedMode.employeeType && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center',
                    marginTop: 8, padding: '3px 10px', borderRadius: 20,
                    background: '#1e293b', color: '#ffffff',
                    fontSize: 11, fontWeight: 600, letterSpacing: '0.03em',
                  }}>
                    Available for {selectedMode.employeeType}
                  </span>
                )}
              </div>
              <Button
                icon={<EditOutlined />}
                size="small"
                onClick={() => openEditMode(selectedMode)}
              >
                Edit
              </Button>
            </div>

            {/* Notice period boxes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 12, marginBottom: 20 }}>
              <div style={{
                background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8,
                padding: '10px 14px',
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', color: '#9ca3af', textTransform: 'uppercase', marginBottom: 4 }}>
                  Probation
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ClockCircleOutlined style={{ fontSize: 13, color: '#9ca3af' }} />
                  {selectedMode.probationDays === 0 ? '0 days' : `${selectedMode.probationDays} days`}
                </div>
              </div>
              <div style={{
                background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8,
                padding: '10px 14px',
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', color: '#9ca3af', textTransform: 'uppercase', marginBottom: 4 }}>
                  Confirmed
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ClockCircleOutlined style={{ fontSize: 13, color: '#9ca3af' }} />
                  {selectedMode.confirmedDays === 0 ? '0 days' : `${selectedMode.confirmedDays} days`}
                </div>
              </div>
              <div style={{
                background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8,
                padding: '10px 14px',
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', color: '#9ca3af', textTransform: 'uppercase', marginBottom: 4 }}>
                  Note
                </div>
                <div style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{selectedMode.note}</div>
              </div>
            </div>

            {/* Policy Rules */}
            <div>
              <div style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                color: '#9ca3af', textTransform: 'uppercase', marginBottom: 10,
              }}>
                Policy Rules
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {selectedMode.policyRules.map((rule, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <CheckCircleOutlined style={{ fontSize: 13, color: '#0f766e', marginTop: 1, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 2 — CLEARANCE DEPARTMENTS (HANDOVER REPORT)
      ═══════════════════════════════════════════════════════════════════════ */}
      <div style={{ marginBottom: 40 }}>
        <SectionHeader
          icon={<FileDoneOutlined />}
          title="Clearance Departments (Handover Report)"
          count={depts.length}
          addLabel="Add Department"
          onAdd={() => setAddDeptOpen(true)}
        />
        <p style={{ fontSize: 12, color: '#6b7280', marginTop: -12, marginBottom: 16 }}>
          Employees must obtain clearance from the following departments through the Handover Report prior to release:
        </p>

        <DndContext
          sensors={deptSensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={depts.map(d => d.id)}
            strategy={rectSortingStrategy}
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 12,
            }}>
              {depts.map(dept => (
                <SortableDeptCard
                  key={dept.id}
                  dept={dept}
                  onEdit={setEditDeptTarget}
                  onDelete={handleDeleteDept}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 3 — EXIT INTERVIEW POLICY
      ═══════════════════════════════════════════════════════════════════════ */}
      <div style={{ marginBottom: 40 }}>
        <SectionHeader
          icon={<CommentOutlined />}
          title="Exit Interview Policy"
        />

        <div style={{
          background: '#ffffff',
          border: '1.5px solid #e5e7eb',
          borderRadius: 12,
          padding: '20px 24px',
          position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', gap: 2 }}>
            <button
              onClick={() => setEditExitInterviewOpen(true)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#9ca3af', padding: '4px 6px', borderRadius: 5,
                display: 'flex', alignItems: 'center', transition: 'color 0.12s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#374151')}
              onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}
            >
              <EditOutlined style={{ fontSize: 13 }} />
            </button>
            <button
              onClick={() => {
                setExitInterviewHtml(DEFAULT_EXIT_INTERVIEW_HTML);
                message.success('Exit Interview Policy reset to default.');
              }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#9ca3af', padding: '4px 6px', borderRadius: 5,
                display: 'flex', alignItems: 'center', transition: 'color 0.12s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#dc2626')}
              onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}
            >
              <DeleteOutlined style={{ fontSize: 13 }} />
            </button>
          </div>

          <div
            className="policy-content-preview"
            style={{ paddingRight: 52, fontSize: 13, color: '#374151', lineHeight: 1.65 }}
            dangerouslySetInnerHTML={{ __html: exitInterviewHtml }}
          />
        </div>
      </div>

      {/* ── Add Mode Modal ───────────────────────────────────────────────────── */}
      <AddModeModal
        open={addModeOpen}
        onClose={() => setAddModeOpen(false)}
        onSubmit={handleAddMode}
      />

      {/* ── Add Department Modal ─────────────────────────────────────────────── */}
      <AddDeptModal
        open={addDeptOpen}
        onClose={() => setAddDeptOpen(false)}
        onSubmit={handleAddDept}
      />

      {/* ── Edit Department Modal ────────────────────────────────────────────── */}
      {editDeptTarget && (
        <EditDeptModal
          open={!!editDeptTarget}
          onClose={() => setEditDeptTarget(null)}
          onSubmit={handleUpdateDept}
          initialValues={{
            name:           editDeptTarget.name,
            department:     editDeptTarget.category,
            section:        editDeptTarget.section ?? '',
            designation:    editDeptTarget.designation ?? '',
            assignedPerson: editDeptTarget.assignedPerson ?? '',
            clearanceTypes: editDeptTarget.items,
          }}
        />
      )}

      {/* ── Edit Mode Modal ──────────────────────────────────────────────────── */}
      {editModeTarget && (
        <EditModeModal
          open={!!editModeTarget}
          onClose={() => setEditModeTarget(null)}
          onSubmit={handleUpdateMode}
          initialValues={{
            name:           editModeTarget.name,
            description:    editModeTarget.description,
            availableForAll: editModeTarget.employeeType === 'All Employees',
            probationDays:  editModeTarget.probationDays,
            confirmedDays:  editModeTarget.confirmedDays,
            noticeNote:     editModeTarget.note,
            policyRules:    editModeTarget.policyRules,
          }}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 4 — EXPERIENCE CERTIFICATE
      ═══════════════════════════════════════════════════════════════════════ */}
      <div style={{ marginBottom: 40 }}>
        <SectionHeader
          icon={<FileDoneOutlined />}
          title="Experience Certificate"
        />

        <div style={{
          background: '#ffffff',
          border: '1.5px solid #e5e7eb',
          borderRadius: 12,
          padding: '20px 24px',
          position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', gap: 2 }}>
            <button
              onClick={() => setEditExperienceCertOpen(true)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#9ca3af', padding: '4px 6px', borderRadius: 5,
                display: 'flex', alignItems: 'center', transition: 'color 0.12s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#374151')}
              onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}
            >
              <EditOutlined style={{ fontSize: 13 }} />
            </button>
            <button
              onClick={() => {
                setExperienceCertHtml(DEFAULT_EXPERIENCE_CERT_HTML);
                message.success('Experience Certificate policy reset to default.');
              }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#9ca3af', padding: '4px 6px', borderRadius: 5,
                display: 'flex', alignItems: 'center', transition: 'color 0.12s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#dc2626')}
              onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}
            >
              <DeleteOutlined style={{ fontSize: 13 }} />
            </button>
          </div>

          <div
            className="policy-content-preview"
            style={{ paddingRight: 52, fontSize: 13, color: '#374151', lineHeight: 1.65 }}
            dangerouslySetInnerHTML={{ __html: experienceCertHtml }}
          />
        </div>
      </div>

      {/* ── Rich Text Modals ─────────────────────────────────────────────────── */}
      <RichTextPolicyModal
        open={editExitInterviewOpen}
        title="Edit Exit Interview Policy"
        subtitle="Write the policy content using the rich text editor below."
        initialValue={exitInterviewHtml}
        onClose={() => setEditExitInterviewOpen(false)}
        onSave={html => { setExitInterviewHtml(html); message.success('Exit Interview Policy saved.'); }}
      />

      <RichTextPolicyModal
        open={editExperienceCertOpen}
        title="Edit Experience Certificate"
        subtitle="Write the certificate policy content using the rich text editor below."
        initialValue={experienceCertHtml}
        onClose={() => setEditExperienceCertOpen(false)}
        onSave={html => { setExperienceCertHtml(html); message.success('Experience Certificate policy saved.'); }}
      />

    </div>
  );
}
