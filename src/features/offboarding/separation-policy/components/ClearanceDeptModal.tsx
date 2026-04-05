import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

// ─── Types ────────────────────────────────────────────────────────────────────

export type DeptFormValues = {
  name: string;
  department: string;
  section: string;
  designation: string;
  assignedPerson: string;
  clearanceTypes: string[];
};

interface ClearanceDeptModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: DeptFormValues) => void;
  initialValues?: DeptFormValues;
}

// ─── Options ──────────────────────────────────────────────────────────────────

const DEPT_OPTIONS = [
  'Management', 'Finance', 'Admin', 'IT', 'Security',
  'Revenue', 'HR', 'Operations', 'Legal', 'Compliance',
].map(v => ({ label: v, value: v }));

const SECTION_OPTIONS = [
  'Corporate Affairs', 'Talent Management', 'Payroll Division', 'Treasury',
  'Network Division', 'Application Division', 'Infrastructure', 'Enterprise IT',
  'Compliance & Audit', 'General Administration', 'Accounts Payable',
  'Accounts Receivable', 'Employee Relations',
].map(v => ({ label: v, value: v }));

const DESIGNATION_OPTIONS = [
  'Head of Department', 'Senior Manager', 'Manager', 'Assistant Manager',
  'IT Manager', 'IT Officer', 'HR Officer', 'Finance Officer',
  'Security Officer', 'Supervisor', 'Coordinator', 'Executive', 'Specialist',
].map(v => ({ label: v, value: v }));

const PERSON_OPTIONS = [
  'Robert Kim', 'Sandra Lee', 'David Park', 'Marcus Tan', 'Linda Cruz',
  'Priya Sharma', 'Michael Thompson', 'Elena Vasquez', 'James Rodriguez',
  'Aisha Patel', 'Daniel Okafor', 'Sarah Chen',
].map(v => ({ label: v, value: v }));

const PREDEFINED_TYPES = [
  'Documentation Handover',
  'Financial Clearance',
  'Asset Return',
  'Access Revocation',
  'ID/Pass Return',
  'Data Handover',
  'Password Recovery',
  'Loan Settlement',
  'Inventory Check',
  'Key Return',
  'SIM Card Return',
  'Uniform Return',
  'Others',
];

// ─── Field label helper ───────────────────────────────────────────────────────

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, letterSpacing: '0.07em',
      color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: 6,
    }}>
      {children}
      {required && <span style={{ color: '#dc2626', marginLeft: 2 }}>*</span>}
    </div>
  );
}

// ─── Clearance Type Tag ───────────────────────────────────────────────────────

function TypeTag({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '4px 11px',
        borderRadius: 6,
        fontSize: 12,
        fontWeight: selected ? 600 : 500,
        cursor: 'pointer',
        border: selected ? '1.5px solid #0f766e' : '1.5px solid #e2e8f0',
        background: selected ? 'var(--color-primary-tint)' : 'var(--color-bg-surface)',
        color: selected ? 'var(--color-primary)' : 'var(--color-text-secondary)',
        transition: 'all 0.12s',
        lineHeight: 1.4,
      }}
    >
      {label}
    </button>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

function DeptModal({ open, onClose, onSubmit, initialValues }: ClearanceDeptModalProps) {
  const isEdit = !!initialValues;
  const [form] = Form.useForm();
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [customTypes, setCustomTypes] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [typeError, setTypeError] = useState(false);

  useEffect(() => {
    if (open && initialValues) {
      form.setFieldsValue({
        name:           initialValues.name,
        department:     initialValues.department,
        section:        initialValues.section || undefined,
        designation:    initialValues.designation || undefined,
        assignedPerson: initialValues.assignedPerson || undefined,
      });
      const predefined = initialValues.clearanceTypes.filter(t => PREDEFINED_TYPES.includes(t));
      const custom = initialValues.clearanceTypes.filter(t => !PREDEFINED_TYPES.includes(t));
      setSelectedTypes(predefined);
      setCustomTypes(custom);
    }
  }, [open, initialValues, form]);

  const toggleType = (type: string) => {
    setTypeError(false);
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleAddCustom = () => {
    const val = customInput.trim();
    if (!val) return;
    if (!customTypes.includes(val) && !PREDEFINED_TYPES.includes(val)) {
      setCustomTypes(prev => [...prev, val]);
      setSelectedTypes(prev => [...prev, val]);
    }
    setCustomInput('');
  };

  const handleSubmit = () => {
    const allSelected = [...selectedTypes, ...customTypes.filter(t => selectedTypes.includes(t))];
    const uniqueSelected = [...new Set(allSelected)];

    form.validateFields().then(values => {
      if (uniqueSelected.length === 0) {
        setTypeError(true);
        return;
      }
      onSubmit({ ...values, clearanceTypes: uniqueSelected });
      handleReset();
    });
  };

  const handleReset = () => {
    form.resetFields();
    setSelectedTypes([]);
    setCustomTypes([]);
    setCustomInput('');
    setTypeError(false);
  };

  const handleCancel = () => {
    handleReset();
    onClose();
  };

  const allTypes = [...PREDEFINED_TYPES, ...customTypes.filter(t => !PREDEFINED_TYPES.includes(t))];

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      width={580}
      centered
      destroyOnClose
      footer={null}
      title={
        <div style={{ paddingBottom: 4 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.3 }}>
            {isEdit ? 'Edit Clearance Department' : 'Add Clearance Department'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', fontWeight: 400, marginTop: 3 }}>
            Configure the department clearance requirements for handover.
          </div>
        </div>
      }
      styles={{
        header: { borderBottom: '1px solid var(--color-border)', paddingBottom: 14, marginBottom: 0 },
        body: { padding: '20px 24px', maxHeight: '72vh', overflowY: 'auto' },
      }}
    >
      <Form form={form} layout="vertical" requiredMark={false}>

        {/* NAME / TITLE */}
        <div style={{ marginBottom: 18 }}>
          <FieldLabel required>Name / Title</FieldLabel>
          <Form.Item
            name="name"
            noStyle
            rules={[{ required: true, message: 'Name is required.' }]}
          >
            <Input placeholder="e.g. IT Asset Management" style={{ borderRadius: 8 }} />
          </Form.Item>
        </div>

        {/* ASSIGNING DEPARTMENT */}
        <div style={{ marginBottom: 18 }}>
          <FieldLabel required>Assigning Department</FieldLabel>
          <Form.Item
            name="department"
            noStyle
            rules={[{ required: true, message: 'Department is required.' }]}
          >
            <Select
              placeholder="Select department"
              options={DEPT_OPTIONS}
              style={{ width: '100%' }}
              allowClear
            />
          </Form.Item>
        </div>

        {/* SECTION + DESIGNATION */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
          <div>
            <FieldLabel>Section</FieldLabel>
            <Form.Item name="section" noStyle>
              <Select
                placeholder="e.g. Network Division"
                options={SECTION_OPTIONS}
                style={{ width: '100%' }}
                showSearch
                allowClear
                filterOption={(input, opt) =>
                  (opt?.label as string).toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </div>
          <div>
            <FieldLabel>Designation</FieldLabel>
            <Form.Item name="designation" noStyle>
              <Select
                placeholder="e.g. IT Manager"
                options={DESIGNATION_OPTIONS}
                style={{ width: '100%' }}
                showSearch
                allowClear
                filterOption={(input, opt) =>
                  (opt?.label as string).toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </div>
        </div>

        {/* ASSIGNED PERSON */}
        <div style={{ marginBottom: 18 }}>
          <FieldLabel>Assigned Person</FieldLabel>
          <Form.Item name="assignedPerson" noStyle>
            <Select
              placeholder="e.g. John Doe"
              options={PERSON_OPTIONS}
              style={{ width: '100%' }}
              showSearch
              allowClear
              filterOption={(input, opt) =>
                (opt?.label as string).toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
        </div>

        {/* DOCUMENT / CLEARANCE TYPES */}
        <div>
          <FieldLabel required>Document / Clearance Types</FieldLabel>
          {typeError && (
            <div style={{ fontSize: 11, color: '#dc2626', marginBottom: 8 }}>
              Please select at least one clearance type.
            </div>
          )}

          {/* Toggleable type tags */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 7,
            padding: '12px 14px',
            border: typeError ? '1.5px solid #fca5a5' : '1.5px solid #e5e7eb',
            borderRadius: 8,
            background: 'var(--color-bg-subtle)',
            marginBottom: 10,
          }}>
            {allTypes.map(type => (
              <TypeTag
                key={type}
                label={type}
                selected={selectedTypes.includes(type)}
                onClick={() => toggleType(type)}
              />
            ))}
          </div>

          {/* Custom type input */}
          <div style={{ display: 'flex', gap: 8 }}>
            <Input
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              onPressEnter={handleAddCustom}
              placeholder="Add custom clearance type..."
              style={{ borderRadius: 8, flex: 1 }}
            />
            <Button
              icon={<PlusOutlined />}
              onClick={handleAddCustom}
              disabled={!customInput.trim()}
              style={{ borderRadius: 8, minWidth: 64 }}
            >
              Add
            </Button>
          </div>
        </div>

      </Form>

      {/* ── Footer ──────────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', justifyContent: 'flex-end', gap: 10,
        paddingTop: 20, marginTop: 20,
        borderTop: '1px solid var(--color-border)',
      }}>
        <Button onClick={handleCancel} style={{ minWidth: 80 }}>
          Cancel
        </Button>
        <Button type="primary" onClick={handleSubmit} style={{ minWidth: 130 }}>
          {isEdit ? 'Save Changes' : 'Add Department'}
        </Button>
      </div>
    </Modal>
  );
}

// Named exports
export function AddDeptModal(props: Omit<ClearanceDeptModalProps, 'initialValues'>) {
  return <DeptModal {...props} />;
}

export function EditDeptModal(props: ClearanceDeptModalProps & { initialValues: DeptFormValues }) {
  return <DeptModal {...props} />;
}
