import { useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { Form, Select, Button, Divider, Tag, Alert } from 'antd';
import {
  CloseOutlined,
  SaveOutlined,
  ApartmentOutlined,
  UserOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import type {
  NodeFormAnchor,
  NodeFormValues,
  DeptKey,
  AssignMode,
} from '../../types/organogram.types';
import { DEPT_THEME } from '../../types/organogram.types';

interface EditNodeFormProps {
  anchor: NodeFormAnchor;
  departmentOptions: { value: string; label: string }[];
  getDesignationOptions: (dept: string) => { value: string; label: string }[];
  getDesignationEmployees: (dept: string, designation: string) => { value: string; label: string }[];
  allEmployeeOptions: { value: string; label: string; department: string; designation: string; grade?: string }[];
  reportingToOptions: { value: string; label: string }[];
  onSubmit: (values: NodeFormValues) => void;
  onClose: () => void;
}

export function EditNodeForm({
  anchor,
  departmentOptions,
  getDesignationOptions,
  getDesignationEmployees,
  allEmployeeOptions,
  reportingToOptions,
  onSubmit,
  onClose,
}: EditNodeFormProps) {
  const [form] = Form.useForm<NodeFormValues>();

  const assignMode = Form.useWatch('assignMode', form) as AssignMode | undefined;
  const dept       = Form.useWatch('department', form) as DeptKey | undefined;
  const designation = Form.useWatch('designation', form) as string | undefined;
  const employeeId  = Form.useWatch('employeeId', form) as string | undefined;

  const isAdd  = anchor.mode === 'add';
  const isEdit = anchor.mode === 'edit';

  const theme       = dept ? DEPT_THEME[dept] : null;
  const accentColor = theme?.border ?? '#4f46e5';

  const designationOpts  = useMemo(() => getDesignationOptions(dept ?? ''), [dept, getDesignationOptions]);
  const designationEmps  = useMemo(
    () => getDesignationEmployees(dept ?? '', designation ?? ''),
    [dept, designation, getDesignationEmployees],
  );

  // Auto-fill dept/designation when employee is picked in employee mode
  useEffect(() => {
    if (assignMode !== 'employee' || !employeeId) return;
    const emp = allEmployeeOptions.find(e => e.value === employeeId);
    if (emp) {
      form.setFieldsValue({ department: emp.department as DeptKey, designation: emp.designation });
    }
  }, [employeeId, assignMode, allEmployeeOptions, form]);

  // Reset dependent fields on dept change
  useEffect(() => {
    form.setFieldsValue({ designation: undefined, employeeIds: undefined });
  }, [dept, form]);

  // Reset employees on designation change
  useEffect(() => {
    form.setFieldsValue({ employeeIds: undefined });
  }, [designation, form]);

  // Reset employee fields on mode switch
  useEffect(() => {
    form.setFieldsValue({
      department: undefined,
      designation: undefined,
      employeeIds: undefined,
      employeeId: undefined,
    });
  }, [assignMode, form]);

  // Clamp form to viewport
  const vw = typeof window !== 'undefined' ? window.innerWidth  : 1200;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const W  = 340;
  const left = Math.min(Math.max(anchor.viewportX, 8), vw - W - 8);
  const top  = Math.min(Math.max(anchor.viewportY - 20, 8), vh - 500);

  const modeLabel = isAdd ? 'Add Direct Report' : 'Configure Position';

  return (
    <div
      style={{
        position: 'fixed',
        left,
        top,
        width: W,
        background: '#ffffff',
        borderRadius: 16,
        boxShadow: '0 12px 40px rgba(0,0,0,0.16), 0 4px 12px rgba(0,0,0,0.08)',
        border: `1px solid ${accentColor}25`,
        zIndex: 1000,
        overflow: 'hidden',
      }}
    >
      {/* ── Header ────────────────────────────────────────────────────────────────── */}
      <div
        style={{
          background: `linear-gradient(135deg, ${accentColor}15 0%, ${accentColor}06 100%)`,
          borderBottom: `1px solid ${accentColor}18`,
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 2px 8px ${accentColor}40`,
            }}
          >
            <ApartmentOutlined style={{ fontSize: 14, color: '#fff' }} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', lineHeight: 1.3 }}>
              {modeLabel}
            </div>
            {anchor.parentName && (
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
                {isAdd ? 'Reports to' : 'Current parent'}:{' '}
                <span style={{ fontWeight: 600, color: accentColor }}>{anchor.parentName}</span>
              </div>
            )}
            {isEdit && !anchor.parentName && (
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>Root — highest authority</div>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            border: 'none',
            background: 'rgba(0,0,0,0.06)',
            borderRadius: 6,
            width: 26,
            height: 26,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            flexShrink: 0,
          }}
        >
          <CloseOutlined style={{ fontSize: 11 }} />
        </button>
      </div>

      {/* ── Form body ──────────────────────────────────────────────────────── */}
      <div style={{ padding: '12px 14px 14px', maxHeight: 480, overflowY: 'auto' }}>
        <Form
          form={form}
          layout="vertical"
          size="small"
          initialValues={{ assignMode: 'designation' }}
          onFinish={(vals) => onSubmit(vals as NodeFormValues)}
          requiredMark={false}
        >
          {/* ── Mode toggle ──────────────────────────────────────────────── */}
          <Form.Item name="assignMode" style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['designation', 'employee'] as AssignMode[]).map(m => {
                const active = (assignMode ?? 'designation') === m;
                const icon   = m === 'designation' ? <TeamOutlined /> : <UserOutlined />;
                const label  = m === 'designation' ? 'By Designation' : 'Specific Employee';
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => form.setFieldValue('assignMode', m)}
                    style={{
                      flex: 1,
                      padding: '7px 10px',
                      borderRadius: 9,
                      border: `1.5px solid ${active ? accentColor : '#e2e8f0'}`,
                      background: active ? `${accentColor}12` : '#f8fafc',
                      color: active ? accentColor : '#64748b',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: active ? 600 : 400,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 5,
                      transition: 'all 0.15s',
                    }}
                  >
                    {icon} {label}
                  </button>
                );
              })}
            </div>
          </Form.Item>

          <Divider style={{ margin: '0 0 12px' }} />

          {/* ── DESIGNATION MODE ────────────────────────────────────────────── */}
          {(assignMode === 'designation' || !assignMode) && (
            <>
              <Form.Item
                name="department"
                label={<FieldLabel>Department</FieldLabel>}
                rules={[{ required: true, message: 'Select department' }]}
                style={{ marginBottom: 10 }}
              >
                <Select
                  placeholder="Select department…"
                  options={departmentOptions}
                  showSearch
                  filterOption={(inp, opt) =>
                    String(opt?.label ?? '').toLowerCase().includes(inp.toLowerCase())
                  }
                  optionRender={opt => {
                    const t = DEPT_THEME[opt.value as DeptKey];
                    return (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                          style={{
                            width: 9,
                            height: 9,
                            borderRadius: '50%',
                            background: t?.border ?? '#94a3b8',
                            flexShrink: 0,
                          }}
                        />
                        {opt.label}
                      </span>
                    );
                  }}
                />
              </Form.Item>

              <Form.Item
                name="designation"
                label={<FieldLabel>Designation</FieldLabel>}
                rules={[{ required: true, message: 'Select designation' }]}
                style={{ marginBottom: 10 }}
              >
                <Select
                  placeholder={dept ? 'Select designation…' : 'Select department first'}
                  options={designationOpts}
                  disabled={!dept}
                  showSearch
                  filterOption={(inp, opt) =>
                    String(opt?.label ?? '').toLowerCase().includes(inp.toLowerCase())
                  }
                />
              </Form.Item>

              <Form.Item
                name="employeeIds"
                label={
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <FieldLabel>Employees</FieldLabel>
                    {designationEmps.length > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          form.setFieldValue('employeeIds', designationEmps.map(e => e.value))
                        }
                        style={{
                          border: 'none',
                          background: `${accentColor}12`,
                          color: accentColor,
                          fontSize: 10,
                          fontWeight: 600,
                          padding: '2px 7px',
                          borderRadius: 5,
                          cursor: 'pointer',
                        }}
                      >
                        Select all ({designationEmps.length})
                      </button>
                    )}
                  </div>
                }
                style={{ marginBottom: 10 }}
              >
                <Select
                  mode="multiple"
                  placeholder={
                    !dept
                      ? 'Select department first'
                      : !designation
                      ? 'Select designation first'
                      : designationEmps.length === 0
                      ? 'No employees in master data'
                      : 'Select employees…'
                  }
                  options={designationEmps}
                  disabled={!designation}
                  showSearch
                  filterOption={(inp, opt) =>
                    String(opt?.label ?? '').toLowerCase().includes(inp.toLowerCase())
                  }
                  maxTagCount="responsive"
                />
              </Form.Item>

              {designation && designationEmps.length === 0 && (
                <Alert
                  type="info"
                  showIcon
                  message="No employees found for this designation. Position will be saved as vacant (Hire)."
                  style={{ fontSize: 11, marginBottom: 10, padding: '6px 10px', borderRadius: 8 }}
                />
              )}
            </>
          )}

          {/* ── SPECIFIC EMPLOYEE MODE ─────────────────────────────────────── */}
          {assignMode === 'employee' && (
            <>
              <Form.Item
                name="employeeId"
                label={<FieldLabel>Employee</FieldLabel>}
                rules={[{ required: true, message: 'Select an employee' }]}
                style={{ marginBottom: 10 }}
              >
                <Select
                  placeholder="Search by name, ID, designation or department…"
                  options={allEmployeeOptions}
                  showSearch
                  filterOption={(inp, opt) => {
                    const q = inp.toLowerCase();
                    return (
                      String(opt?.label ?? '').toLowerCase().includes(q) ||
                      String(opt?.designation ?? '').toLowerCase().includes(q) ||
                      String(opt?.department ?? '').toLowerCase().includes(q)
                    );
                  }}
                />
              </Form.Item>

              {employeeId && (() => {
                const emp = allEmployeeOptions.find(e => e.value === employeeId);
                const t   = emp ? DEPT_THEME[emp.department as DeptKey] : null;
                return emp ? (
                  <div
                    style={{
                      background: t?.lightBg ?? '#f8fafc',
                      border: `1px solid ${t?.border ?? '#e2e8f0'}30`,
                      borderRadius: 8,
                      padding: '8px 10px',
                      marginBottom: 10,
                      fontSize: 11,
                    }}
                  >
                    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: t?.avatarBg ?? '#94a3b8',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {emp.label.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 12 }}>
                          {emp.label}
                        </div>
                        <div style={{ color: '#64748b', marginTop: 1 }}>{emp.designation}</div>
                        <Tag
                          style={{
                            marginTop: 4,
                            fontSize: 10,
                            background: `${t?.avatarBg}14`,
                            borderColor: `${t?.avatarBg}30`,
                            color: t?.avatarBg ?? '#64748b',
                            borderRadius: 4,
                          }}
                        >
                          {departmentOptions.find(d => d.value === emp.department)?.label ?? emp.department}
                        </Tag>
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}
            </>
          )}

          {/* ── REPORTING TO (add mode only) ──────────────────────────────────── */}
          {isAdd && (
            <>
              <Divider style={{ margin: '10px 0' }} />
              <Form.Item
                name="reportingToNodeId"
                label={<FieldLabel>Reporting To</FieldLabel>}
                initialValue={anchor.nodeId}
                style={{ marginBottom: 10 }}
              >
                <Select
                  placeholder="Select reporting manager…"
                  options={reportingToOptions}
                  showSearch
                  filterOption={(inp, opt) =>
                    String(opt?.label ?? '').toLowerCase().includes(inp.toLowerCase())
                  }
                />
              </Form.Item>
              <div
                style={{
                  fontSize: 11,
                  color: '#94a3b8',
                  marginBottom: 12,
                  lineHeight: 1.5,
                }}
              >
                Default: the node you clicked. Change to any other configured employee in the tree.
              </div>
            </>
          )}

          {/* ── Actions ──────────────────────────────────────────────────────────────── */}
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              onClick={onClose}
              style={{ flex: 1, borderRadius: 9, fontSize: 12, height: 34 }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              style={{
                flex: 2,
                borderRadius: 9,
                fontSize: 12,
                height: 34,
                background: accentColor,
                borderColor: accentColor,
              }}
            >
              {isAdd ? 'Add to Organogram' : 'Save Changes'}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 600, color: '#374151', letterSpacing: 0.2 }}>
      {children}
    </span>
  );
}
