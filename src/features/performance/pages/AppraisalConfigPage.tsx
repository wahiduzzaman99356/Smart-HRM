/**
 * AppraisalConfigPage.tsx
 * Performance Management → Appraisal Configuration
 *
 * Sections:
 *   1. Confirmation KPI Review  — triggered N days before confirmation
 *   2. Yearly / Periodic Review — triggered on a recurring frequency
 *      └─ Employee Exceptions  — per-employee overrides for frequency / notify / pipeline
 */

import { useState } from 'react';
import {
  Avatar, Button, Divider, Drawer, Input, InputNumber, Popconfirm,
  Select, Space, Switch, Tag, Tooltip, Typography, message,
} from 'antd';
import {
  ArrowDownOutlined, ArrowUpOutlined, CalendarOutlined, CheckCircleOutlined,
  CloseOutlined, DeleteOutlined, ExceptionOutlined, FormOutlined,
  PlusOutlined, ReloadOutlined, SaveOutlined, SearchOutlined, SettingOutlined, UserOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

// ─── Constants ────────────────────────────────────────────────────────────────
const EVALUATOR_ROLES = [
  'Self', 'Line Manager', 'HR', 'Department Head', 'Unit Head',
  'Direct Manager', 'CEO', 'HOD', 'Division Head', 'Country Head',
];

/** "Last Review Date" intentionally excluded */
const COUNT_DATE_OPTIONS = [
  { value: 'joining_date',      label: 'Joining Date'      },
  { value: 'confirmation_date', label: 'Confirmation Date' },
  { value: 'appointment_date',  label: 'Appointment Date'  },
];

const FREQUENCY_OPTIONS = [
  { value: 'daily',       label: 'Daily'       },
  { value: 'weekly',      label: 'Weekly'      },
  { value: 'monthly',     label: 'Monthly'     },
  { value: 'quarterly',   label: 'Quarterly'   },
  { value: 'half_yearly', label: 'Half-Yearly' },
  { value: 'yearly',      label: 'Yearly'      },
];

const MOCK_EMPLOYEES = [
  { id: 'emp-1',  code: 'HR-001', name: 'Ahmed Rahman',    dept: 'Human Resources', designation: 'HOD'            },
  { id: 'emp-2',  code: 'HR-002', name: 'Fatima Islam',    dept: 'Human Resources', designation: 'HOD'            },
  { id: 'emp-3',  code: 'HR-003', name: 'Nasrin Akter',    dept: 'Human Resources', designation: 'Executive-HR'   },
  { id: 'emp-4',  code: 'HR-004', name: 'Karim Hossain',   dept: 'Human Resources', designation: 'Executive-HR'   },
  { id: 'emp-5',  code: 'OPS-01', name: 'Priya Das',       dept: 'Operations',      designation: 'Manager'        },
  { id: 'emp-6',  code: 'OPS-02', name: 'Rahim Uddin',     dept: 'Operations',      designation: 'Senior Officer' },
  { id: 'emp-7',  code: 'FIN-01', name: 'Sultana Begum',   dept: 'Finance',         designation: 'Manager'        },
  { id: 'emp-8',  code: 'FIN-02', name: 'Jahangir Alam',   dept: 'Finance',         designation: 'Senior Officer' },
  { id: 'emp-9',  code: 'IT-001', name: 'Roksana Khatun',  dept: 'IT',              designation: 'Manager'        },
  { id: 'emp-10', code: 'IT-002', name: 'Minhajul Abedin', dept: 'IT',              designation: 'Developer'      },
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface PipelineStep {
  id: string;
  role: string;
  daysToComplete: number;
}

interface ConfirmationConfig {
  enabled: boolean;
  notifyDaysBefore: number;
  countDateFrom: string;
  pipeline: PipelineStep[];
}

interface PeriodicConfig {
  enabled: boolean;
  notifyDaysBefore: number;
  countDateFrom: string;
  reviewFrequency: string;
  pipeline: PipelineStep[];
}

interface EmployeeException {
  id: string;
  employeeId: string;
  notifyDaysBefore: number;
  countDateFrom: string;
  reviewFrequency: string;
  customizePipeline: boolean;
  pipeline: PipelineStep[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
let _seq = 1;
const genId     = () => `id_${Date.now()}_${_seq++}`;
const blankStep = (): PipelineStep => ({ id: genId(), role: 'Line Manager', daysToComplete: 7 });

function initials(name: string) {
  return name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function avatarColor(id: string) {
  const palette = ['#0f766e','#0284c7','#7c3aed','#d97706','#059669','#dc2626','#0891b2'];
  return palette[parseInt(id.replace(/\D/g, '') || '0') % palette.length];
}

function freqLabel(v: string) { return FREQUENCY_OPTIONS.find(f => f.value === v)?.label ?? v; }
function dateLabel(v: string) { return COUNT_DATE_OPTIONS.find(d => d.value === v)?.label ?? v; }

function moveItem<T>(arr: T[], from: number, to: number): T[] {
  const next = [...arr];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────
const INIT_CONFIRMATION: ConfirmationConfig = {
  enabled: true,
  notifyDaysBefore: 30,
  countDateFrom: 'joining_date',
  pipeline: [
    { id: genId(), role: 'Line Manager', daysToComplete: 7 },
    { id: genId(), role: 'HR',           daysToComplete: 3 },
  ],
};

const INIT_PERIODIC: PeriodicConfig = {
  enabled: true,
  notifyDaysBefore: 7,
  countDateFrom: 'joining_date',
  reviewFrequency: 'yearly',
  pipeline: [
    { id: genId(), role: 'Line Manager',    daysToComplete: 7 },
    { id: genId(), role: 'HR',              daysToComplete: 5 },
    { id: genId(), role: 'Department Head', daysToComplete: 3 },
  ],
};

// ─── Shared sub-components ────────────────────────────────────────────────────
function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', marginBottom: 5 }}>
      {children}{required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
    </div>
  );
}

function StepBadge({ n }: { n: number }) {
  return (
    <div style={{
      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
      background: '#0f766e', color: '#fff', fontWeight: 700, fontSize: 13,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {n}
    </div>
  );
}

// ─── Pipeline editor ──────────────────────────────────────────────────────────
interface PipelineEditorProps {
  steps: PipelineStep[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<PipelineStep>) => void;
  onMove: (from: number, to: number) => void;
  compact?: boolean;
}

function PipelineEditor({ steps, onAdd, onRemove, onUpdate, onMove, compact }: PipelineEditorProps) {
  const totalDays = steps.reduce((s, st) => s + (st.daysToComplete || 0), 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <Space size={8}>
          <div style={{ width: 3, height: 14, background: '#0f766e', borderRadius: 2 }} />
          <Text style={{ fontSize: 11, fontWeight: 700, color: '#374151', letterSpacing: '0.05em' }}>
            EVALUATION PIPELINE
          </Text>
          <Text style={{ fontSize: 11, background: '#e6f7f4', color: '#0f766e', border: '1px solid #8dd3c8', borderRadius: 999, padding: '1px 8px', fontWeight: 600 }}>
            {steps.length} step{steps.length !== 1 ? 's' : ''}
          </Text>
        </Space>
        {totalDays > 0 && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            Total: <strong style={{ color: '#0f766e' }}>{totalDays} day{totalDays !== 1 ? 's' : ''}</strong>
          </Text>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {steps.map((step, idx) => (
          <div key={step.id} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: compact ? '8px 12px' : '10px 14px', background: '#fafafa' }}>
            {idx === 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr 160px 90px', gap: 10, marginBottom: 5 }}>
                <div /><FieldLabel>ROLE / EVALUATOR</FieldLabel><FieldLabel>DAYS TO COMPLETE</FieldLabel><div />
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr 160px 90px', gap: 10, alignItems: 'center' }}>
              <StepBadge n={idx + 1} />
              <Select
                value={step.role}
                onChange={v => onUpdate(step.id, { role: v })}
                style={{ width: '100%' }}
                showSearch
                filterOption={(input, option) =>
                  String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                }
              >
                {EVALUATOR_ROLES.map(r => <Option key={r} value={r}>{r}</Option>)}
              </Select>
              <InputNumber
                value={step.daysToComplete}
                onChange={v => onUpdate(step.id, { daysToComplete: v ?? 1 })}
                min={1} max={365} style={{ width: '100%' }}
                addonAfter={<span style={{ fontSize: 11, color: '#9ca3af' }}>days</span>}
              />
              <Space size={2}>
                <Tooltip title="Move Up">
                  <Button type="text" size="small" icon={<ArrowUpOutlined style={{ fontSize: 11 }} />}
                    disabled={idx === 0} onClick={() => onMove(idx, idx - 1)}
                    style={{ color: '#9ca3af', padding: '0 5px', height: 26 }} />
                </Tooltip>
                <Tooltip title="Move Down">
                  <Button type="text" size="small" icon={<ArrowDownOutlined style={{ fontSize: 11 }} />}
                    disabled={idx === steps.length - 1} onClick={() => onMove(idx, idx + 1)}
                    style={{ color: '#9ca3af', padding: '0 5px', height: 26 }} />
                </Tooltip>
                <Tooltip title={steps.length <= 1 ? 'At least one step required' : 'Remove'}>
                  <Button type="text" size="small" icon={<CloseOutlined style={{ fontSize: 11 }} />}
                    disabled={steps.length <= 1} onClick={() => onRemove(step.id)}
                    style={{ color: steps.length <= 1 ? '#d1d5db' : '#ef4444', padding: '0 5px', height: 26 }} />
                </Tooltip>
              </Space>
            </div>
          </div>
        ))}
      </div>

      <Button icon={<PlusOutlined />} onClick={onAdd}
        style={{ marginTop: 10, borderRadius: 8, borderStyle: 'dashed', borderColor: '#0f766e', color: '#0f766e', background: '#eef8f6', fontWeight: 600, fontSize: 13, height: 34 }}>
        + Add Step
      </Button>
    </div>
  );
}

// ─── Section card wrapper ─────────────────────────────────────────────────────
interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  enabled: boolean;
  onToggle: (v: boolean) => void;
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
}

function SectionCard({ icon, title, subtitle, enabled, onToggle, headerExtra, children }: SectionCardProps) {
  return (
    <div style={{
      background: '#fff', border: `1px solid ${enabled ? '#a7e3d9' : '#e5e7eb'}`,
      borderRadius: 14, marginBottom: 16, overflow: 'hidden', transition: 'border-color 0.25s',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: enabled ? '#eef8f6' : '#f9fafb', borderBottom: '1px solid #e5e7eb', gap: 12, flexWrap: 'wrap' }}>
        <Space size={10}>
          <span style={{ fontSize: 20, lineHeight: 1 }}>{icon}</span>
          <div>
            <Text strong style={{ fontSize: 15, color: '#111827', display: 'block' }}>{title}</Text>
            {subtitle && <Text type="secondary" style={{ fontSize: 11 }}>{subtitle}</Text>}
          </div>
        </Space>
        <Space size={10} align="center">
          {headerExtra}
          <Space size={6}>
            <Text style={{ fontSize: 12, color: enabled ? '#0f766e' : '#9ca3af', fontWeight: 600 }}>
              {enabled ? 'Enabled' : 'Disabled'}
            </Text>
            <Switch checked={enabled} onChange={onToggle} size="small"
              style={{ background: enabled ? '#0f766e' : undefined }} />
          </Space>
        </Space>
      </div>
      <div style={{ padding: '20px 24px' }}>
        <div style={{ opacity: enabled ? 1 : 0.55, pointerEvents: enabled ? 'auto' : 'none' }}>
          {children}
        </div>
        {!enabled && (
          <div style={{ marginTop: 8, fontSize: 12, color: '#9ca3af', fontStyle: 'italic' }}>
            This review type is currently disabled. Enable it to configure.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Employee Exception Drawer ────────────────────────────────────────────────
interface ExceptionDrawerProps {
  open: boolean;
  onClose: () => void;
  exceptions: EmployeeException[];
  onChange: (exceptions: EmployeeException[]) => void;
  defaultPeriodic: PeriodicConfig;
}

function ExceptionDrawer({ open, onClose, exceptions, onChange, defaultPeriodic }: ExceptionDrawerProps) {
  const [empSearch, setEmpSearch] = useState('');
  const usedIds = exceptions.map(e => e.employeeId);

  const addExceptionForEmployee = (employeeId: string) => {
    onChange([...exceptions, {
      id: genId(),
      employeeId,
      notifyDaysBefore: defaultPeriodic.notifyDaysBefore,
      countDateFrom: defaultPeriodic.countDateFrom,
      reviewFrequency: defaultPeriodic.reviewFrequency,
      customizePipeline: false,
      pipeline: defaultPeriodic.pipeline.map(s => ({ ...s, id: genId() })),
    }]);
  };

  const searchResults = MOCK_EMPLOYEES.filter(
    e => !usedIds.includes(e.id) &&
    empSearch.trim() !== '' &&
    (
      e.name.toLowerCase().includes(empSearch.toLowerCase()) ||
      e.code.toLowerCase().includes(empSearch.toLowerCase()) ||
      e.dept.toLowerCase().includes(empSearch.toLowerCase()) ||
      e.designation.toLowerCase().includes(empSearch.toLowerCase())
    )
  );

  const removeException = (id: string) => onChange(exceptions.filter(e => e.id !== id));

  const updateException = (id: string, patch: Partial<EmployeeException>) =>
    onChange(exceptions.map(e => e.id === id ? { ...e, ...patch } : e));

  const pipelineOps = (exc: EmployeeException) => ({
    onAdd:    ()                              => updateException(exc.id, { pipeline: [...exc.pipeline, blankStep()] }),
    onRemove: (sid: string)                   => updateException(exc.id, { pipeline: exc.pipeline.filter(s => s.id !== sid) }),
    onUpdate: (sid: string, p: Partial<PipelineStep>) =>
      updateException(exc.id, { pipeline: exc.pipeline.map(s => s.id === sid ? { ...s, ...p } : s) }),
    onMove:   (from: number, to: number)      => updateException(exc.id, { pipeline: moveItem(exc.pipeline, from, to) }),
  });

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={
        <Space size={10}>
          <ExceptionOutlined style={{ color: '#d97706', fontSize: 18 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>Employee Exceptions</div>
            <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 400 }}>
              Override review settings for specific employees
            </div>
          </div>
        </Space>
      }
      width={720}
      styles={{ body: { background: '#f7fbfa', padding: '16px 20px' } }}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {exceptions.length} exception{exceptions.length !== 1 ? 's' : ''} configured
          </Text>
          <Space>
            <Button onClick={onClose} style={{ borderRadius: 8, borderColor: '#a7e3d9', color: '#0f766e' }}>
              Close
            </Button>
            <Button type="primary" onClick={() => { message.success('Exceptions saved.'); onClose(); }}
              style={{ borderRadius: 8 }}>
              Save Exceptions
            </Button>
          </Space>
        </div>
      }
    >
      {/* Info banner */}
      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#92400e' }}>
        <strong>Note:</strong> Exception settings override the default Yearly / Periodic Review configuration for the selected employee only. Leave a field at the default value to inherit from the global config.
      </div>

      {/* Employee search */}
      <div style={{ marginBottom: 16, position: 'relative' }}>
        <Input
          prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
          placeholder="Search employee by name, code or department…"
          value={empSearch}
          onChange={e => setEmpSearch(e.target.value)}
          allowClear
          style={{ borderRadius: 8 }}
          disabled={usedIds.length >= MOCK_EMPLOYEES.length}
        />
        {empSearch.trim() !== '' && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
            border: '1px solid #d1d5db', borderRadius: 8, background: '#fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)', zIndex: 10,
            maxHeight: 220, overflowY: 'auto',
          }}>
            {searchResults.length === 0 ? (
              <div style={{ padding: '12px 14px', color: '#9ca3af', fontSize: 12, textAlign: 'center' }}>
                No available employees match &ldquo;{empSearch}&rdquo;
              </div>
            ) : (
              searchResults.map(emp => (
                <div key={emp.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '9px 12px', borderBottom: '1px solid #f3f4f6',
                }} onMouseEnter={e => (e.currentTarget.style.background = '#f0fdf9')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >
                  <Space size={8}>
                    <Avatar size={30} style={{ background: avatarColor(emp.id), fontWeight: 700, fontSize: 11, flexShrink: 0 }}>
                      {initials(emp.name)}
                    </Avatar>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', lineHeight: 1.3 }}>{emp.name}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{emp.code} · {emp.designation} · {emp.dept}</div>
                    </div>
                  </Space>
                  <Button
                    size="small" type="primary" icon={<PlusOutlined />}
                    onClick={() => { addExceptionForEmployee(emp.id); setEmpSearch(''); }}
                    style={{ borderRadius: 6, flexShrink: 0 }}
                  >
                    Add
                  </Button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Exception cards */}
      {exceptions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>
          <ExceptionOutlined style={{ fontSize: 36, display: 'block', marginBottom: 10 }} />
          <Text type="secondary">No exceptions configured yet.</Text>
          <div style={{ marginTop: 6 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              All employees follow the default Yearly / Periodic Review settings.
            </Text>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {exceptions.map(exc => {
            const emp = MOCK_EMPLOYEES.find(e => e.id === exc.employeeId);
            const availableForThis = MOCK_EMPLOYEES.filter(e => !usedIds.includes(e.id) || e.id === exc.employeeId);

            return (
              <div key={exc.id} style={{ background: '#fff', border: '1px solid #d9ebe8', borderRadius: 12, overflow: 'hidden' }}>
                {/* Exception card header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#eef8f6', borderBottom: '1px solid #d9ebe8' }}>
                  <Space size={10}>
                    <Avatar size={32} style={{ background: avatarColor(exc.employeeId), fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                      {emp ? initials(emp.name) : <UserOutlined />}
                    </Avatar>
                    <Select
                      value={exc.employeeId}
                      onChange={newId => {
                        const newEmp = MOCK_EMPLOYEES.find(e => e.id === newId);
                        if (newEmp) updateException(exc.id, { employeeId: newId });
                      }}
                      style={{ width: 220 }}
                      showSearch
                      optionFilterProp="label"
                      options={availableForThis.map(e => ({
                        value: e.id,
                        label: `${e.name} (${e.code})`,
                      }))}
                    />
                    {emp && (
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {emp.designation} · {emp.dept}
                      </Text>
                    )}
                  </Space>
                  <Popconfirm title="Remove this exception?" onConfirm={() => removeException(exc.id)} okText="Remove" cancelText="Cancel" okButtonProps={{ danger: true }}>
                    <Button type="text" size="small" icon={<DeleteOutlined />} style={{ color: '#ef4444' }} />
                  </Popconfirm>
                </div>

                {/* Override fields */}
                <div style={{ padding: '14px 14px 4px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
                    <div>
                      <FieldLabel required>Notify (Days Before Review)</FieldLabel>
                      <InputNumber
                        value={exc.notifyDaysBefore}
                        onChange={v => updateException(exc.id, { notifyDaysBefore: v ?? 1 })}
                        min={1} max={365} style={{ width: '100%' }}
                        addonAfter={<span style={{ fontSize: 11, color: '#9ca3af' }}>days</span>}
                      />
                    </div>
                    <div>
                      <FieldLabel required>Count Date From</FieldLabel>
                      <Select value={exc.countDateFrom} onChange={v => updateException(exc.id, { countDateFrom: v })} style={{ width: '100%' }}>
                        {COUNT_DATE_OPTIONS.map(o => <Option key={o.value} value={o.value}>{o.label}</Option>)}
                      </Select>
                    </div>
                    <div>
                      <FieldLabel required>Review Frequency</FieldLabel>
                      <Select value={exc.reviewFrequency} onChange={v => updateException(exc.id, { reviewFrequency: v })} style={{ width: '100%' }}>
                        {FREQUENCY_OPTIONS.map(o => <Option key={o.value} value={o.value}>{o.label}</Option>)}
                      </Select>
                    </div>
                  </div>

                  {/* Custom pipeline toggle */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: '1px dashed #e5e7eb', marginBottom: exc.customizePipeline ? 14 : 10 }}>
                    <Space size={8}>
                      <SettingOutlined style={{ color: '#6b7280', fontSize: 13 }} />
                      <Text style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>Custom Evaluation Pipeline</Text>
                      {!exc.customizePipeline && (
                        <Tag style={{ fontSize: 10, borderRadius: 999, color: '#0f766e', borderColor: '#8dd3c8', background: '#e6f7f4' }}>
                          Using default · {defaultPeriodic.pipeline.length} steps
                        </Tag>
                      )}
                    </Space>
                    <Switch
                      checked={exc.customizePipeline}
                      onChange={v => updateException(exc.id, { customizePipeline: v })}
                      size="small"
                      style={{ background: exc.customizePipeline ? '#0f766e' : undefined }}
                    />
                  </div>

                  {exc.customizePipeline && (
                    <div style={{ marginBottom: 14 }}>
                      <PipelineEditor steps={exc.pipeline} compact {...pipelineOps(exc)} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Drawer>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AppraisalConfigPage() {
  const [confirmation,    setConfirmation]    = useState<ConfirmationConfig>(INIT_CONFIRMATION);
  const [periodic,        setPeriodic]        = useState<PeriodicConfig>(INIT_PERIODIC);
  const [exceptions,      setExceptions]      = useState<EmployeeException[]>([]);
  const [exceptionOpen,   setExceptionOpen]   = useState(false);
  const [saved,           setSaved]           = useState(false);

  // ── Confirmation helpers ──────────────────────────────────────────────────
  const setConf = (patch: Partial<ConfirmationConfig>) =>
    setConfirmation(prev => ({ ...prev, ...patch }));

  const confPipelineOps = {
    onAdd:    ()                              => setConf({ pipeline: [...confirmation.pipeline, blankStep()] }),
    onRemove: (id: string)                    => setConf({ pipeline: confirmation.pipeline.filter(s => s.id !== id) }),
    onUpdate: (id: string, p: Partial<PipelineStep>) =>
      setConf({ pipeline: confirmation.pipeline.map(s => s.id === id ? { ...s, ...p } : s) }),
    onMove:   (from: number, to: number)      => setConf({ pipeline: moveItem(confirmation.pipeline, from, to) }),
  };

  // ── Periodic helpers ──────────────────────────────────────────────────────
  const setPeri = (patch: Partial<PeriodicConfig>) =>
    setPeriodic(prev => ({ ...prev, ...patch }));

  const periPipelineOps = {
    onAdd:    ()                              => setPeri({ pipeline: [...periodic.pipeline, blankStep()] }),
    onRemove: (id: string)                    => setPeri({ pipeline: periodic.pipeline.filter(s => s.id !== id) }),
    onUpdate: (id: string, p: Partial<PipelineStep>) =>
      setPeri({ pipeline: periodic.pipeline.map(s => s.id === id ? { ...s, ...p } : s) }),
    onMove:   (from: number, to: number)      => setPeri({ pipeline: moveItem(periodic.pipeline, from, to) }),
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = (): string | null => {
    if (confirmation.enabled) {
      if (confirmation.notifyDaysBefore < 1)
        return 'Confirmation: Notify days must be at least 1.';
      if (confirmation.pipeline.some(s => !s.role || s.daysToComplete < 1))
        return 'Confirmation: all pipeline steps must have a role and valid days.';
    }
    if (periodic.enabled) {
      if (periodic.notifyDaysBefore < 1)
        return 'Periodic Review: Notify days must be at least 1.';
      if (periodic.pipeline.some(s => !s.role || s.daysToComplete < 1))
        return 'Periodic Review: all pipeline steps must have a role and valid days.';
      for (const exc of exceptions) {
        if (exc.customizePipeline && exc.pipeline.some(s => !s.role || s.daysToComplete < 1))
          return `Exception for employee: all custom pipeline steps must have a role and valid days.`;
      }
    }
    return null;
  };

  const handleSave = () => {
    const err = validate();
    if (err) { message.error(err); return; }
    setSaved(true);
    message.success('Appraisal configuration saved successfully.');
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setConfirmation(INIT_CONFIRMATION);
    setPeriodic(INIT_PERIODIC);
    setExceptions([]);
    message.info('Configuration reset to defaults.');
  };

  const confTotal = confirmation.pipeline.reduce((s, st) => s + st.daysToComplete, 0);
  const periTotal = periodic.pipeline.reduce((s, st) => s + st.daysToComplete, 0);

  return (
    <div style={{ padding: '16px 20px', background: '#eef5f4', minHeight: '100%', height: '100%', overflowY: 'auto' }}>

      {/* ── Page header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1f2937' }}>
            Appraisal Configuration
            <Text style={{ marginLeft: 10, color: '#0f766e', fontSize: 20, fontWeight: 500 }}>Setup</Text>
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Configure evaluation pipelines and timelines for confirmation and periodic appraisals.
          </Text>
        </div>
        <Space size={8}>
          <Button icon={<ReloadOutlined />} onClick={handleReset}
            style={{ borderRadius: 10, borderColor: '#c7ddda', color: '#94a3b8' }}>
            Reset Defaults
          </Button>
          <Button type="primary" icon={saved ? <CheckCircleOutlined /> : <SaveOutlined />} onClick={handleSave}
            style={{ borderRadius: 10, paddingInline: 20, background: saved ? '#059669' : undefined, borderColor: saved ? '#059669' : undefined }}>
            {saved ? 'Saved!' : 'Save Configuration'}
          </Button>
        </Space>
      </div>

      {/* ── Summary chips ── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ background: confirmation.enabled ? '#eef8f6' : '#f9fafb', border: `1px solid ${confirmation.enabled ? '#a7e3d9' : '#e5e7eb'}`, borderRadius: 10, padding: '8px 14px', fontSize: 12 }}>
          <Text type="secondary">Confirmation Review </Text>
          <Text strong style={{ color: confirmation.enabled ? '#0f766e' : '#9ca3af' }}>
            {confirmation.enabled
              ? `notify ${confirmation.notifyDaysBefore}d · ${confirmation.pipeline.length} steps · ${confTotal} days pipeline`
              : 'Disabled'}
          </Text>
        </div>
        <div style={{ background: periodic.enabled ? '#eef8f6' : '#f9fafb', border: `1px solid ${periodic.enabled ? '#a7e3d9' : '#e5e7eb'}`, borderRadius: 10, padding: '8px 14px', fontSize: 12 }}>
          <Text type="secondary">Periodic Review </Text>
          <Text strong style={{ color: periodic.enabled ? '#0f766e' : '#9ca3af' }}>
            {periodic.enabled
              ? `${freqLabel(periodic.reviewFrequency)} · notify ${periodic.notifyDaysBefore}d · ${periodic.pipeline.length} steps · ${periTotal} days pipeline`
              : 'Disabled'}
          </Text>
        </div>
        {exceptions.length > 0 && (
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '8px 14px', fontSize: 12, cursor: 'pointer' }}
            onClick={() => setExceptionOpen(true)}>
            <Text style={{ color: '#d97706' }}>⚠ </Text>
            <Text strong style={{ color: '#92400e' }}>
              {exceptions.length} employee exception{exceptions.length !== 1 ? 's' : ''} active
            </Text>
          </div>
        )}
      </div>

      {/* ════════════════ Section 1 — Confirmation KPI Review ════════════════ */}
      <SectionCard
        icon={<FormOutlined style={{ color: '#0f766e' }} />}
        title="Confirmation KPI Review"
        subtitle="Triggered automatically N days before an employee's confirmation date"
        enabled={confirmation.enabled}
        onToggle={v => setConf({ enabled: v })}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <div>
            <FieldLabel required>Notify (Days Before Confirmation)</FieldLabel>
            <InputNumber
              value={confirmation.notifyDaysBefore}
              onChange={v => setConf({ notifyDaysBefore: v ?? 1 })}
              min={1} max={365} style={{ width: '100%' }}
              addonAfter={<span style={{ fontSize: 11, color: '#9ca3af' }}>days</span>}
            />
            <Text type="secondary" style={{ fontSize: 11, marginTop: 4, display: 'block' }}>
              Form generated {confirmation.notifyDaysBefore} day{confirmation.notifyDaysBefore !== 1 ? 's' : ''} before the confirmation date.
            </Text>
          </div>
          <div>
            <FieldLabel required>Count Date From</FieldLabel>
            <Select value={confirmation.countDateFrom} onChange={v => setConf({ countDateFrom: v })} style={{ width: '100%' }}>
              {COUNT_DATE_OPTIONS.map(o => <Option key={o.value} value={o.value}>{o.label}</Option>)}
            </Select>
            <Text type="secondary" style={{ fontSize: 11, marginTop: 4, display: 'block' }}>
              Confirmation date is calculated from {dateLabel(confirmation.countDateFrom)}.
            </Text>
          </div>
        </div>
        <Divider style={{ margin: '0 0 16px' }} />
        <PipelineEditor steps={confirmation.pipeline} {...confPipelineOps} />
      </SectionCard>

      {/* ════════════════ Section 2 — Yearly / Periodic Review ════════════════ */}
      <SectionCard
        icon={<CalendarOutlined style={{ color: '#0f766e' }} />}
        title="Yearly / Periodic Review"
        subtitle="Triggered on a recurring schedule for ongoing performance appraisals"
        enabled={periodic.enabled}
        onToggle={v => setPeri({ enabled: v })}
        headerExtra={
          <Button
            icon={<ExceptionOutlined />}
            onClick={() => setExceptionOpen(true)}
            style={{
              borderRadius: 8, fontSize: 12, height: 30,
              background: exceptions.length > 0 ? '#fffbeb' : '#f9fafb',
              borderColor: exceptions.length > 0 ? '#fde68a' : '#d1d5db',
              color: exceptions.length > 0 ? '#d97706' : '#6b7280',
              fontWeight: 600,
            }}
          >
            Exceptions
            {exceptions.length > 0 && (
              <span style={{ marginLeft: 6, background: '#d97706', color: '#fff', borderRadius: 999, fontSize: 10, padding: '1px 6px', fontWeight: 700 }}>
                {exceptions.length}
              </span>
            )}
          </Button>
        }
      >
        {/* 3-column settings row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 20 }}>
          <div>
            <FieldLabel required>Notify (Days Before Review)</FieldLabel>
            <InputNumber
              value={periodic.notifyDaysBefore}
              onChange={v => setPeri({ notifyDaysBefore: v ?? 1 })}
              min={1} max={365} style={{ width: '100%' }}
              addonAfter={<span style={{ fontSize: 11, color: '#9ca3af' }}>days</span>}
            />
            <Text type="secondary" style={{ fontSize: 11, marginTop: 4, display: 'block' }}>
              Form generated {periodic.notifyDaysBefore} day{periodic.notifyDaysBefore !== 1 ? 's' : ''} before the review date.
            </Text>
          </div>
          <div>
            <FieldLabel required>Count Date From</FieldLabel>
            <Select value={periodic.countDateFrom} onChange={v => setPeri({ countDateFrom: v })} style={{ width: '100%' }}>
              {COUNT_DATE_OPTIONS.map(o => <Option key={o.value} value={o.value}>{o.label}</Option>)}
            </Select>
            <Text type="secondary" style={{ fontSize: 11, marginTop: 4, display: 'block' }}>
              Review cycle counted from {dateLabel(periodic.countDateFrom)}.
            </Text>
          </div>
          <div>
            <FieldLabel required>Review Frequency</FieldLabel>
            <Select value={periodic.reviewFrequency} onChange={v => setPeri({ reviewFrequency: v })} style={{ width: '100%' }}>
              {FREQUENCY_OPTIONS.map(o => <Option key={o.value} value={o.value}>{o.label}</Option>)}
            </Select>
            <Text type="secondary" style={{ fontSize: 11, marginTop: 4, display: 'block' }}>
              Appraisal form is generated on a {freqLabel(periodic.reviewFrequency).toLowerCase()} basis.
            </Text>
          </div>
        </div>
        <Divider style={{ margin: '0 0 16px' }} />
        <PipelineEditor steps={periodic.pipeline} {...periPipelineOps} />
      </SectionCard>

      {/* ── Exception drawer ── */}
      <ExceptionDrawer
        open={exceptionOpen}
        onClose={() => setExceptionOpen(false)}
        exceptions={exceptions}
        onChange={setExceptions}
        defaultPeriodic={periodic}
      />
    </div>
  );
}
