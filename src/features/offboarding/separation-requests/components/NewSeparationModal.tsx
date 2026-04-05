import { useEffect, useState } from 'react';
import {
  Avatar, Button, Checkbox, DatePicker, Input, Modal,
  Select, Upload, message,
} from 'antd';
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { EmpStatus } from '../types/separation.types';

// ─── Mock employees ───────────────────────────────────────────────────────────
interface MockEmployee {
  empId: string;
  name: string;
  designation: string;
  department: string;
  joinedDate: string;
}

const MOCK_EMPLOYEES: MockEmployee[] = [
  { empId: 'EMP-1201', name: 'Priya Sharma',   designation: 'Frontend Developer',  department: 'Engineering', joinedDate: '2022-03-15' },
  { empId: 'EMP-1305', name: 'Marcus Johnson', designation: 'Sales Lead',           department: 'Sales',       joinedDate: '2021-07-01' },
  { empId: 'EMP-0990', name: 'Yuki Tanaka',    designation: 'UI/UX Designer',       department: 'Design',      joinedDate: '2020-11-22' },
  { empId: 'EMP-0812', name: 'Omar Hassan',    designation: 'Sr. Accountant',       department: 'Finance',     joinedDate: '2019-05-10' },
  { empId: 'EMP-1410', name: 'Sofia Martinez', designation: 'Content Strategist',   department: 'Marketing',   joinedDate: '2023-01-18' },
  { empId: 'EMP-0745', name: 'David Okonkwo',  designation: 'Operations Manager',   department: 'Operations',  joinedDate: '2018-09-03' },
];

// ─── Mock approvers ──────────────────────────────────────────────────────────
interface MockApprover {
  key: string;
  name: string;
  designation: string;
  department: string;
}

const MOCK_APPROVERS: MockApprover[] = [
  { key: 'DM', name: 'David Miller',  designation: 'VP Engineering', department: 'Engineering' },
  { key: 'LW', name: 'Lisa Wong',     designation: 'CMO',            department: 'Marketing'   },
  { key: 'RK', name: 'Robert Kim',    designation: 'CFO',            department: 'Finance'     },
  { key: 'NC', name: 'Nancy Clark',   designation: 'VP Sales',       department: 'Sales'       },
  { key: 'TL', name: 'Thomas Lee',    designation: 'CHRO',           department: 'HR'          },
];

// ─── Separation types ─────────────────────────────────────────────────────────
interface SepType {
  key: string;
  label: string;
  description: string;
  noticeDays: number;
}

const SEP_TYPES: SepType[] = [
  { key: 'Dismissal',        label: 'Dismissal',        description: 'Immediate dismissal for serious misconduct',                noticeDays: 0   },
  { key: 'Termination',      label: 'Termination',      description: 'Management-initiated termination of confirmed employee',    noticeDays: 120 },
  { key: 'Resignation',      label: 'Resignation',      description: 'Employee-initiated voluntary departure',                   noticeDays: 60  },
  { key: 'Discharge',        label: 'Discharge',        description: 'Discharge due to physical or mental incapacity',           noticeDays: 0   },
  { key: 'Loss of Lien',     label: 'Loss of Lien',     description: 'Deemed resignation due to unauthorized absence',           noticeDays: 0   },
  { key: 'Retrenchment',     label: 'Retrenchment',     description: 'Service termination on grounds of redundancy',             noticeDays: 30  },
  { key: 'Retirement',       label: 'Retirement',       description: 'Normal retirement at end of service age',                  noticeDays: 90  },
  { key: 'Death',            label: 'Death',            description: 'Separation due to death of employee',                      noticeDays: 0   },
  { key: 'Deputation',       label: 'Deputation',       description: 'Transfer to/from third party on deputation',               noticeDays: 0   },
  { key: 'End of Contract',  label: 'End of Contract',  description: 'Fixed-term contract completion',                           noticeDays: 15  },
  { key: 'Mutual Agreement', label: 'Mutual Agreement', description: 'Consensual separation between employer and employee',       noticeDays: 30  },
  { key: 'Layoff',           label: 'Layoff',           description: 'Position elimination or organizational restructuring',      noticeDays: 30  },
];

const PRIMARY_REASONS = [
  'Career Growth', 'Better Compensation', 'Work-Life Balance', 'Relocation',
  'Health Reasons', 'Higher Education', 'Management Issues', 'Performance Issues',
  'Restructuring', 'Contract Expiry', 'Retirement', 'Personal Reasons', 'Other',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  'var(--color-primary)', '#3b82f6', '#f59e0b', '#8b5cf6',
  '#10b981', 'var(--color-text-tertiary)', '#ef4444', '#ec4899',
];
function avatarColor(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}
function calcTenure(joinedDate: string): string {
  const joined = new Date(joinedDate);
  const now    = new Date('2026-03-30');
  let years  = now.getFullYear() - joined.getFullYear();
  let months = now.getMonth()    - joined.getMonth();
  if (months < 0) { years--; months += 12; }
  return `${years}y ${months}m`;
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)',
      letterSpacing: '0.07em', textTransform: 'uppercase',
      marginBottom: 10,
    }}>
      {children}
    </div>
  );
}

// ─── Step progress bar ────────────────────────────────────────────────────────
const STEPS = [
  { label: 'Employee\nSelection',  desc: 'Select the departing employee'    },
  { label: 'Separation\nDetails',  desc: 'Type, reason, and classification' },
  { label: 'Notice &\nTimeline',   desc: 'Notice period and last working day' },
  { label: 'Documents',            desc: 'Attach supporting files'           },
  { label: 'Review &\nSubmit',     desc: 'Confirm and submit request'        },
];

function StepProgress({ current }: { current: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 24 }}>
      {STEPS.map((step, i) => {
        const num      = i + 1;
        const isActive = current === num;
        const isDone   = current > num;

        return (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Circle */}
              <div style={{
                width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                background: isDone ? '#059669' : isActive ? 'var(--color-primary)' : 'var(--color-bg-subtle)',
                border: isDone || isActive ? 'none' : '1.5px solid #cbd5e1',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700,
                color: isDone || isActive ? 'var(--color-bg-surface)' : 'var(--color-text-tertiary)',
              }}>
                {isDone ? <CheckOutlined style={{ fontSize: 12 }} /> : num}
              </div>
              {/* Label */}
              <div style={{ marginTop: 6, textAlign: 'center', paddingInline: 2 }}>
                {step.label.split('\n').map((line, li) => (
                  <div key={li} style={{
                    fontSize: 11, fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'var(--color-text-primary)' : isDone ? 'var(--color-text-secondary)' : 'var(--color-text-tertiary)',
                    whiteSpace: 'nowrap', lineHeight: 1.3,
                  }}>
                    {line}
                  </div>
                ))}
                {isActive && (
                  <div style={{ fontSize: 10, color: 'var(--color-text-disabled)', marginTop: 2, whiteSpace: 'nowrap' }}>
                    {step.desc}
                  </div>
                )}
              </div>
            </div>

            {/* Connector */}
            {i < STEPS.length - 1 && (
              <div style={{
                flex: 1, height: 2, marginTop: 14, marginInline: 6,
                background: isDone ? '#059669' : 'var(--color-border)',
                borderRadius: 1,
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Form data ────────────────────────────────────────────────────────────────
const NOTICE_DURATION_OPTIONS = [
  { label: 'Serve Full Notice',              value: 'Serve Full Notice'              },
  { label: 'Early Release (Notice Buyout)',   value: 'Early Release (Notice Buyout)'  },
];

interface FormData {
  // Step 1
  employee: MockEmployee | null;
  // Step 2
  separationType:    string;
  noticeDays:        number;
  primaryReason:     string;
  confidential:      boolean;
  eligibleForRehire: boolean;
  additionalDetails: string;
  // Step 3
  duration:          string;
  dateOfSeparation:  string;   // last working day (YYYY-MM-DD)
  earlyRelease:      boolean;
  earlyReleaseReason: string;
  // Step 4
  documents: File[];
  // Step 5
  approver:       string;
  additionalNotes: string;
}

const EMPTY_FORM: FormData = {
  employee: null,
  separationType: '', noticeDays: 0, primaryReason: '',
  confidential: false, eligibleForRehire: true, additionalDetails: '',
  duration: '', dateOfSeparation: '', earlyRelease: false, earlyReleaseReason: '',
  documents: [],
  approver: '', additionalNotes: '',
};

// ─── Step 1 — Employee Selection ──────────────────────────────────────────────
function Step1({
  form, setForm,
}: { form: FormData; setForm: React.Dispatch<React.SetStateAction<FormData>> }) {
  const [search, setSearch] = useState('');

  const filtered = MOCK_EMPLOYEES.filter(e => {
    const q = search.toLowerCase();
    return (
      e.name.toLowerCase().includes(q) ||
      e.empId.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Input
        prefix={<UserOutlined style={{ color: 'var(--color-text-disabled)' }} />}
        placeholder="Search employee by name, ID, or department..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        allowClear
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {filtered.map(emp => {
          const isSelected = form.employee?.empId === emp.empId;
          return (
            <div
              key={emp.empId}
              onClick={() => setForm(p => ({ ...p, employee: emp }))}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                border: isSelected ? '1.5px solid #0f766e' : '1.5px solid #e5e7eb',
                background: isSelected ? 'var(--color-primary-tint)' : 'var(--color-bg-surface)',
                position: 'relative',
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              <Avatar size={38} style={{ background: avatarColor(emp.name), fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                {initials(emp.name)}
              </Avatar>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text-primary)' }}>{emp.name}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 1 }}>
                  {emp.designation} &middot; {emp.department}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-disabled)', marginTop: 1 }}>{emp.empId}</div>
              </div>
              {isSelected && (
                <div style={{
                  position: 'absolute', top: 8, right: 10,
                  width: 18, height: 18, borderRadius: '50%',
                  background: 'var(--color-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <CheckOutlined style={{ fontSize: 10, color: '#fff' }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {form.employee && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 16px', borderRadius: 8,
          background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', background: 'var(--color-bg-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <UserOutlined style={{ color: 'var(--color-text-tertiary)', fontSize: 16 }} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text-primary)' }}>{form.employee.name}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 1 }}>
              {form.employee.designation} &middot; {form.employee.department}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-disabled)' }}>Joined {form.employee.joinedDate}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginTop: 2 }}>
              Tenure: {calcTenure(form.employee.joinedDate)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step 2 — Separation Details ──────────────────────────────────────────────
function Step2({
  form, setForm,
}: { form: FormData; setForm: React.Dispatch<React.SetStateAction<FormData>> }) {

  const selectType = (t: SepType) =>
    setForm(p => ({ ...p, separationType: t.key, noticeDays: t.noticeDays }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Separation type grid ── */}
      <div>
        <SectionHead>Separation Type</SectionHead>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {SEP_TYPES.map(t => {
            const isSelected = form.separationType === t.key;
            return (
              <div
                key={t.key}
                onClick={() => selectType(t)}
                style={{
                  padding: '12px 14px', borderRadius: 8, cursor: 'pointer',
                  border: isSelected ? '1.5px solid #0f766e' : '1px solid var(--color-border)',
                  background: isSelected ? 'var(--color-primary-tint)' : 'var(--color-bg-surface)',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text-primary)' }}>{t.label}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 3, lineHeight: 1.4 }}>
                  {t.description}
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-primary)', marginTop: 6 }}>
                  {t.noticeDays} {t.noticeDays === 1 ? 'day' : 'days'} notice
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Primary reason ── */}
      <div>
        <SectionHead>Primary Reason</SectionHead>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Select
            placeholder="Select reason..."
            style={{ flex: 1 }}
            value={form.primaryReason || undefined}
            onChange={v => setForm(p => ({ ...p, primaryReason: v ?? '' }))}
            allowClear
            options={PRIMARY_REASONS.map(v => ({ label: v, value: v }))}
          />
          <div style={{ display: 'flex', gap: 16, flexShrink: 0 }}>
            <Checkbox
              checked={form.confidential}
              onChange={e => setForm(p => ({ ...p, confidential: e.target.checked }))}
            >
              <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Confidential</span>
            </Checkbox>
            <Checkbox
              checked={form.eligibleForRehire}
              onChange={e => setForm(p => ({ ...p, eligibleForRehire: e.target.checked }))}
            >
              <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Eligible for Rehire</span>
            </Checkbox>
          </div>
        </div>
      </div>

      {/* ── Additional details ── */}
      <div>
        <SectionHead>Additional Details</SectionHead>
        <Input.TextArea
          rows={3}
          placeholder="Provide additional context..."
          value={form.additionalDetails}
          onChange={e => setForm(p => ({ ...p, additionalDetails: e.target.value }))}
          style={{ resize: 'none' }}
        />
      </div>
    </div>
  );
}

// ─── Step 3 — Notice & Timeline ───────────────────────────────────────────────
const TODAY_STR = '2026-03-30';
const TODAY_DAY = dayjs(TODAY_STR);

function calcLWD(noticeDays: number): string {
  return TODAY_DAY.add(noticeDays, 'day').format('YYYY-MM-DD');
}

function Step3({
  form, setForm,
}: { form: FormData; setForm: React.Dispatch<React.SetStateAction<FormData>> }) {

  const standardDays = SEP_TYPES.find(t => t.key === form.separationType)?.noticeDays ?? 0;

  const handleNoticeDaysChange = (val: number) => {
    const lwd = calcLWD(val);
    setForm(p => ({ ...p, noticeDays: val, dateOfSeparation: lwd }));
  };

  // Initialize LWD if empty (first time landing on this step)
  const lwdValue = form.dateOfSeparation
    ? dayjs(form.dateOfSeparation)
    : undefined;

  const autoCalcDisplay = calcLWD(form.noticeDays);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Duration ── */}
      <div>
        <SectionHead>Duration</SectionHead>
        <Select
          style={{ width: '100%' }}
          placeholder="Select notice duration type"
          value={form.duration || undefined}
          onChange={v => setForm(p => ({
            ...p,
            duration: v ?? '',
            earlyRelease: v === 'Early Release (Notice Buyout)',
          }))}
          options={NOTICE_DURATION_OPTIONS}
        />
      </div>

      {/* ── Two-column inputs ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Notice Period */}
        <div>
          <SectionHead>Notice Period (Days)</SectionHead>
          <Input
            type="number"
            min={0}
            value={form.noticeDays}
            onChange={e => handleNoticeDaysChange(Math.max(0, Number(e.target.value)))}
            style={{ width: '100%' }}
          />
          <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 5 }}>
            Standard for {form.separationType || '—'}: {standardDays} days
          </div>
        </div>

        {/* Last Working Day */}
        <div>
          <SectionHead>Last Working Day</SectionHead>
          <DatePicker
            style={{ width: '100%' }}
            format="MM/DD/YYYY"
            placeholder="MM/DD/YYYY"
            value={lwdValue}
            onChange={(date) =>
              setForm(p => ({ ...p, dateOfSeparation: date ? date.format('YYYY-MM-DD') : '' }))
            }
          />
          <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 5 }}>
            Auto-calculated: {autoCalcDisplay}
          </div>
        </div>
      </div>

      {/* ── Separation Timeline ── */}
      <div style={{
        padding: '16px 20px', borderRadius: 8,
        background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)',
      }}>
        <SectionHead>Separation Timeline</SectionHead>
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          {/* Today node */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
            <div style={{
              width: 14, height: 14, borderRadius: '50%',
              background: '#1e3a5f',
            }} />
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 6, fontWeight: 500 }}>Today</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', marginTop: 1 }}>{TODAY_STR}</div>
          </div>

          {/* Connector line + badge */}
          <div style={{ flex: 1, position: 'relative', marginTop: 6, marginInline: 0 }}>
            <div style={{ height: 2, background: 'var(--color-border)', borderRadius: 1 }} />
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)',
              borderRadius: 20, padding: '2px 10px',
              fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)',
              whiteSpace: 'nowrap',
            }}>
              {form.noticeDays} days
            </div>
          </div>

          {/* LWD node */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
            <div style={{
              width: 14, height: 14, borderRadius: '50%',
              background: '#f59e0b',
            }} />
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 6, fontWeight: 500 }}>LWD</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', marginTop: 1 }}>
              {form.dateOfSeparation || autoCalcDisplay}
            </div>
          </div>
        </div>
      </div>

      {/* ── Early release checkbox ── */}
      <Checkbox
        checked={form.earlyRelease}
        onChange={e => setForm(p => ({ ...p, earlyRelease: e.target.checked }))}
      >
        <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 500 }}>
          Request early release from notice period
        </span>
      </Checkbox>

      {/* ── Early release reason (conditional) ── */}
      {form.earlyRelease && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SectionHead>Early Release Reason</SectionHead>
          <Input.TextArea
            rows={3}
            placeholder="Explain reason for early release..."
            value={form.earlyReleaseReason}
            onChange={e => setForm(p => ({ ...p, earlyReleaseReason: e.target.value }))}
            style={{ resize: 'none' }}
          />
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12, color: '#d97706' }}>
            <InfoCircleOutlined style={{ marginTop: 1, flexShrink: 0 }} />
            <span>Early release requires additional approval from department head and HR.</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step 4 — Documents ───────────────────────────────────────────────────────
function getFileExt(name: string) {
  return name.split('.').pop()?.toLowerCase() ?? '';
}
function getExtColor(ext: string) {
  if (ext === 'pdf')                    return '#ef4444';
  if (ext === 'doc' || ext === 'docx')  return '#3b82f6';
  if (ext === 'xls' || ext === 'xlsx')  return '#22c55e';
  return 'var(--color-text-tertiary)';
}
function formatFileSize(bytes: number) {
  if (bytes < 1024)             return `${bytes} B`;
  if (bytes < 1024 * 1024)      return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function Step4({
  form, setForm,
}: { form: FormData; setForm: React.Dispatch<React.SetStateAction<FormData>> }) {

  const handlePreview = (file: File) => {
    const url = URL.createObjectURL(file);
    window.open(url, '_blank');
  };

  const handleDownload = (file: File) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRemove = (fileName: string) => {
    setForm(p => ({ ...p, documents: p.documents.filter(f => f.name !== fileName) }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Upload zone */}
      <Upload.Dragger
        multiple
        accept=".pdf,.doc,.docx,.xls,.xlsx"
        showUploadList={false}
        beforeUpload={file => {
          setForm(p => ({ ...p, documents: [...p.documents, file] }));
          return false;
        }}
        style={{ borderRadius: 8 }}
      >
        <div style={{ padding: '28px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>Click to upload documents</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>PDF, DOC, DOCX, XLS, XLSX up to 10MB</div>
        </div>
      </Upload.Dragger>

      {/* Uploaded file list */}
      {form.documents.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {form.documents.map((file, idx) => {
            const ext   = getFileExt(file.name);
            const color = getExtColor(ext);
            return (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 8,
                border: '1px solid var(--color-border)', background: 'var(--color-bg-subtle)',
              }}>
                {/* Extension badge */}
                <div style={{
                  width: 36, height: 36, borderRadius: 6, flexShrink: 0,
                  background: color + '18',
                  border: `1px solid ${color}35`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, fontWeight: 800, color,
                  textTransform: 'uppercase', letterSpacing: '0.03em',
                }}>
                  {ext || 'FILE'}
                </div>

                {/* Name + size */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {file.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-disabled)', marginTop: 1 }}>
                    {formatFileSize(file.size)}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                  <Button
                    size="small" type="text"
                    icon={<EyeOutlined style={{ fontSize: 13 }} />}
                    title="Preview"
                    style={{ color: 'var(--color-text-tertiary)' }}
                    onClick={() => handlePreview(file)}
                  />
                  <Button
                    size="small" type="text"
                    icon={<DownloadOutlined style={{ fontSize: 13 }} />}
                    title="Download"
                    style={{ color: 'var(--color-text-tertiary)' }}
                    onClick={() => handleDownload(file)}
                  />
                  <Button
                    size="small" type="text" danger
                    icon={<DeleteOutlined style={{ fontSize: 13 }} />}
                    title="Remove"
                    onClick={() => handleRemove(file.name)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recommended documents info box */}
      <div style={{
        display: 'flex', gap: 10,
        padding: '12px 14px', borderRadius: 8,
        background: 'var(--color-status-info-bg)', border: '1px solid #bfdbfe',
      }}>
        <InfoCircleOutlined style={{ color: '#3b82f6', fontSize: 15, marginTop: 1, flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1e40af', marginBottom: 6 }}>
            Recommended Documents:
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {[
              'Resignation / Termination letter',
              'Exit clearance form',
              'NDA / Non-compete acknowledgment',
              'Knowledge transfer / handover notes',
            ].map(item => (
              <li key={item} style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

    </div>
  );
}

// ─── Step 5 — Review & Submit ─────────────────────────────────────────────────
function SummaryCell({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ padding: '14px 18px', borderRight: '1px solid var(--color-border)' }}>
      <div style={{
        fontSize: 10, fontWeight: 700, color: 'var(--color-text-disabled)',
        letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 5,
      }}>
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{value || '—'}</div>
    </div>
  );
}

function Step5({
  form, setForm,
}: { form: FormData; setForm: React.Dispatch<React.SetStateAction<FormData>> }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* ── Assign Approver ── */}
      <div>
        <SectionHead>POC</SectionHead>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {MOCK_APPROVERS.map(ap => {
            const isSelected = form.approver === ap.key;
            return (
              <div
                key={ap.key}
                onClick={() => setForm(p => ({ ...p, approver: ap.key }))}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                  border: isSelected ? '1.5px solid #0f766e' : '1.5px solid #e5e7eb',
                  background: isSelected ? 'var(--color-primary-tint)' : 'var(--color-bg-surface)',
                  transition: 'border-color 0.15s, background 0.15s',
                  position: 'relative',
                }}
              >
                <Avatar size={34} style={{ background: avatarColor(ap.name), fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                  {initials(ap.name)}
                </Avatar>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{ap.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 1 }}>
                    {ap.designation} &middot; {ap.department}
                  </div>
                </div>
                {isSelected && (
                  <CheckOutlined style={{
                    position: 'absolute', right: 12,
                    fontSize: 13, color: 'var(--color-primary)', fontWeight: 700,
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Request Summary ── */}
      <div>
        <SectionHead>Request Summary</SectionHead>
        <div style={{ border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}>
          {/* Row 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid var(--color-border)' }}>
            <SummaryCell label="Employee"       value={form.employee?.name} />
            <SummaryCell label="Employee ID"    value={form.employee?.empId} />
          </div>
          {/* Row 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid var(--color-border)' }}>
            <SummaryCell label="Separation Type" value={form.separationType} />
            <SummaryCell label="Reason"          value={form.primaryReason} />
          </div>
          {/* Row 3 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid var(--color-border)' }}>
            <SummaryCell label="Notice Period"   value={`${form.noticeDays} days`} />
            <SummaryCell label="Duration"        value={form.duration} />
          </div>
          {/* Row 3b */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid var(--color-border)' }}>
            <SummaryCell label="Last Working Day" value={form.dateOfSeparation} />
            <SummaryCell label="Documents"        value={form.documents.length ? `${form.documents.length} attached` : '0 attached'} />
          </div>
          {/* Row 4 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <SummaryCell label="Eligible for Rehire" value={form.eligibleForRehire ? 'Yes' : 'No'} />
            <SummaryCell label="" value="" />
          </div>
        </div>
      </div>

      {/* ── Additional Notes ── */}
      <div>
        <SectionHead>Additional Notes</SectionHead>
        <Input.TextArea
          rows={3}
          placeholder="Any additional notes for the approver..."
          value={form.additionalNotes}
          onChange={e => setForm(p => ({ ...p, additionalNotes: e.target.value }))}
          style={{ resize: 'none' }}
        />
      </div>

    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (form: FormData) => void;
  initialEmployee?: {
    empId: string;
    name: string;
    designation: string;
    department: string;
    joinedDate?: string;
  };
  initialSeparationType?: string;
}

export function NewSeparationModal({ open, onClose, onSubmit, initialEmployee, initialSeparationType }: Props) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);

  useEffect(() => {
    if (!open) return;
    const initEmp = initialEmployee
      ? {
          empId: initialEmployee.empId,
          name: initialEmployee.name,
          designation: initialEmployee.designation,
          department: initialEmployee.department,
          joinedDate: initialEmployee.joinedDate || '2021-01-01',
        }
      : null;

    const initType = initialSeparationType || '';
    const notice = SEP_TYPES.find(t => t.key === initType)?.noticeDays ?? 0;

    setStep(1);
    setForm({
      ...EMPTY_FORM,
      employee: initEmp,
      separationType: initType,
      noticeDays: notice,
    });
  }, [open, initialEmployee, initialSeparationType]);

  const canNext = () => {
    if (step === 1) return !!form.employee;
    if (step === 2) return !!form.separationType;
    if (step === 3) return !!form.dateOfSeparation;
    if (step === 5) return !!form.approver;
    return true;
  };

  // Auto-populate LWD when advancing from step 2 → step 3
  const handleNext = () => {
    if (step === 2 && !form.dateOfSeparation) {
      setForm(p => ({ ...p, dateOfSeparation: calcLWD(p.noticeDays) }));
    }
    if (step < 5) { setStep(s => s + 1); return; }
    onSubmit(form);
    handleClose();
    message.success('Separation request submitted successfully.');
  };

  const handleClose = () => {
    setStep(1);
    setForm(EMPTY_FORM);
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={780}
      centered
      destroyOnClose
      title={
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>New Separation Request</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-tertiary)', fontWeight: 400, marginTop: 2 }}>
            Complete all steps to submit a separation request
          </div>
        </div>
      }
    >
      <div style={{ padding: '16px 0 0' }}>
        <StepProgress current={step} />

        {/* Step content */}
        <div style={{ minHeight: 320, maxHeight: 440, overflowY: 'auto', paddingRight: 4 }}>
          {step === 1 && <Step1 form={form} setForm={setForm} />}
          {step === 2 && <Step2 form={form} setForm={setForm} />}
          {step === 3 && <Step3 form={form} setForm={setForm} />}
          {step === 4 && <Step4 form={form} setForm={setForm} />}
          {step === 5 && <Step5 form={form} setForm={setForm} />}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 20, paddingTop: 16,
          borderTop: '1px solid var(--color-border)',
        }}>
          <Button
            icon={<ArrowLeftOutlined />}
            disabled={step === 1}
            onClick={() => setStep(s => s - 1)}
          >
            Previous
          </Button>

          <span style={{ fontSize: 12, color: 'var(--color-text-disabled)', fontWeight: 500 }}>
            Step {step} of {STEPS.length}
          </span>

          <Button
            type="primary"
            icon={step === 5 ? <CheckOutlined /> : undefined}
            iconPosition={step === 5 ? 'start' : 'end'}
            {...(step !== 5 && { icon: <ArrowRightOutlined /> })}
            disabled={!canNext()}
            onClick={handleNext}
          >
            {step === 5 ? 'Submit Request' : 'Next'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
