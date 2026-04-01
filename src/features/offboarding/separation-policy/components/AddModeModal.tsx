import { useState, useEffect } from 'react';
import { Modal, Form, Input, Switch, InputNumber, Button } from 'antd';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ModeFormValues = {
  name: string;
  description: string;
  availableForAll: boolean;
  probationDays: number;
  confirmedDays: number;
  noticeNote: string;
  policyRules: string[];
};

/** Pass `initialValues` to switch the modal into edit mode. */
interface ModeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ModeFormValues) => void;
  initialValues?: ModeFormValues;
}

// Keep old type alias so the page import still compiles without changes
export type AddModeFormValues = ModeFormValues;

// ─── Field label helper ───────────────────────────────────────────────────────

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, letterSpacing: '0.07em',
      color: '#6b7280', textTransform: 'uppercase',
      marginBottom: 6,
    }}>
      {children}
      {required && <span style={{ color: '#dc2626', marginLeft: 2 }}>*</span>}
    </div>
  );
}

// ─── Shared modal (add + edit) ────────────────────────────────────────────────

function ModeModal({ open, onClose, onSubmit, initialValues }: ModeModalProps) {
  const isEdit = !!initialValues;
  const [form] = Form.useForm<Omit<ModeFormValues, 'availableForAll' | 'policyRules'>>();
  const [rules, setRules] = useState<string[]>(['']);
  const [availableForAll, setAvailableForAll] = useState(true);

  // Populate form when editing
  useEffect(() => {
    if (open && initialValues) {
      form.setFieldsValue({
        name:          initialValues.name,
        description:   initialValues.description,
        probationDays: initialValues.probationDays,
        confirmedDays: initialValues.confirmedDays,
        noticeNote:    initialValues.noticeNote,
      });
      setAvailableForAll(initialValues.availableForAll);
      setRules(initialValues.policyRules.length ? initialValues.policyRules : ['']);
    }
  }, [open, initialValues, form]);

  const handleAddRule = () => setRules(prev => [...prev, '']);

  const handleRemoveRule = (i: number) =>
    setRules(prev => prev.filter((_, idx) => idx !== i));

  const handleRuleChange = (i: number, value: string) =>
    setRules(prev => prev.map((r, idx) => (idx === i ? value : r)));

  const handleSubmit = () => {
    form.validateFields().then(values => {
      onSubmit({
        ...values,
        availableForAll,
        policyRules: rules.map(r => r.trim()).filter(Boolean),
      });
      handleReset();
    });
  };

  const handleReset = () => {
    form.resetFields();
    setRules(['']);
    setAvailableForAll(true);
  };

  const handleCancel = () => {
    handleReset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      width={560}
      centered
      destroyOnClose
      footer={null}
      title={
        <div style={{ paddingBottom: 4 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', lineHeight: 1.3 }}>
            {isEdit ? 'Edit Mode of Separation' : 'Add Mode of Separation'}
          </div>
          <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 400, marginTop: 3 }}>
            Configure separation type, notice period and policy rules.
          </div>
        </div>
      }
      styles={{
        header: { borderBottom: '1px solid #e5e7eb', paddingBottom: 14, marginBottom: 0 },
        body: { padding: '20px 24px', maxHeight: '72vh', overflowY: 'auto' },
      }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ probationDays: 0, confirmedDays: 0 }}
        requiredMark={false}
      >

        {/* MODE NAME */}
        <div style={{ marginBottom: 18 }}>
          <FieldLabel required>Mode Name</FieldLabel>
          <Form.Item
            name="name"
            noStyle
            rules={[{ required: true, message: 'Mode name is required.' }]}
          >
            <Input
              placeholder="e.g. Voluntary Resignation"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>
        </div>

        {/* DESCRIPTION */}
        <div style={{ marginBottom: 18 }}>
          <FieldLabel>Description</FieldLabel>
          <Form.Item name="description" noStyle>
            <Input.TextArea
              placeholder="Brief description..."
              rows={3}
              style={{ borderRadius: 8, resize: 'none' }}
            />
          </Form.Item>
        </div>

        {/* AVAILABLE FOR ALL EMPLOYEES */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 14px', borderRadius: 8,
          background: '#f8fafc', border: '1px solid #e5e7eb',
          marginBottom: 18,
        }}>
          <div>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.07em',
              color: '#374151', textTransform: 'uppercase',
            }}>
              Available for All Employees
            </div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
              When enabled, this mode is available to all employee types
            </div>
          </div>
          <Switch
            checked={availableForAll}
            onChange={setAvailableForAll}
          />
        </div>

        {/* NOTICE PERIOD BY EMPLOYEE TYPE */}
        <div style={{ marginBottom: 18 }}>
          <FieldLabel>Notice Period by Employee Type</FieldLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 5, fontWeight: 500 }}>
                Probation (Days)
              </div>
              <Form.Item name="probationDays" noStyle>
                <InputNumber min={0} style={{ width: '100%', borderRadius: 8 }} controls />
              </Form.Item>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 5, fontWeight: 500 }}>
                Confirmed (Days)
              </div>
              <Form.Item name="confirmedDays" noStyle>
                <InputNumber min={0} style={{ width: '100%', borderRadius: 8 }} controls />
              </Form.Item>
            </div>
          </div>
        </div>

        {/* NOTICE NOTE */}
        <div style={{ marginBottom: 18 }}>
          <FieldLabel>Notice Note</FieldLabel>
          <Form.Item name="noticeNote" noStyle>
            <Input
              placeholder="e.g. 60 days or salary in lieu"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>
        </div>

        {/* POLICY RULES */}
        <div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 10,
          }}>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.07em',
              color: '#6b7280', textTransform: 'uppercase',
            }}>
              Policy Rules
            </div>
            <button
              type="button"
              onClick={handleAddRule}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 12, fontWeight: 600, color: '#0f766e',
                padding: '2px 0',
              }}
            >
              <PlusOutlined style={{ fontSize: 11 }} />
              Add Rule
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rules.map((rule, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Input
                  value={rule}
                  onChange={e => handleRuleChange(i, e.target.value)}
                  placeholder={`Rule ${i + 1}`}
                  style={{ borderRadius: 8, flex: 1 }}
                />
                {rules.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveRule(i)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#9ca3af', padding: 4, borderRadius: 5,
                      display: 'flex', alignItems: 'center', flexShrink: 0,
                      transition: 'color 0.12s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#dc2626')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}
                  >
                    <CloseOutlined style={{ fontSize: 12 }} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

      </Form>

      {/* ── Footer ──────────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', justifyContent: 'flex-end', gap: 10,
        paddingTop: 20, marginTop: 20,
        borderTop: '1px solid #e5e7eb',
      }}>
        <Button onClick={handleCancel} style={{ minWidth: 80 }}>
          Cancel
        </Button>
        <Button type="primary" onClick={handleSubmit} style={{ minWidth: 110 }}>
          {isEdit ? 'Save Changes' : 'Create Mode'}
        </Button>
      </div>
    </Modal>
  );
}

// Named exports used by the page
export function AddModeModal(props: Omit<ModeModalProps, 'initialValues'>) {
  return <ModeModal {...props} />;
}

export function EditModeModal(props: ModeModalProps & { initialValues: ModeFormValues }) {
  return <ModeModal {...props} />;
}
