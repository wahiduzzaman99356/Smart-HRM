import { Modal, Form, Select, Button, DatePicker } from 'antd';
import dayjs from 'dayjs';

// ─── Options ──────────────────────────────────────────────────────────────────

const EMPLOYEE_OPTIONS = [
  { label: 'David Kim — IT · EMP-0234', value: 'EMP-0234' },
  { label: 'Maria Santos — Operations · EMP-0445', value: 'EMP-0445' },
  { label: 'Ahmed Hassan — Finance · EMP-0512', value: 'EMP-0512' },
  { label: 'Priya Nair — Marketing · EMP-0678', value: 'EMP-0678' },
  { label: 'Thomas Lee — Engineering · EMP-0789', value: 'EMP-0789' },
];

const INTERVIEWER_OPTIONS = [
  { label: 'HR Manager', value: 'HR Manager' },
  { label: 'HR Director', value: 'HR Director' },
  { label: 'CEO', value: 'CEO' },
  { label: 'Department Head', value: 'Department Head' },
  { label: 'Senior HR Officer', value: 'Senior HR Officer' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

export type ScheduleFormValues = {
  employeeId: string;
  date: string;
  interviewer: string;
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ScheduleFormValues) => void;
}

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

// ─── Component ────────────────────────────────────────────────────────────────

export function ScheduleInterviewModal({ open, onClose, onSubmit }: Props) {
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then(values => {
      onSubmit({
        employeeId: values.employee,
        date: values.date ? dayjs(values.date).format('YYYY-MM-DD') : '',
        interviewer: values.interviewer,
      });
      form.resetFields();
      onClose();
    });
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      width={480}
      centered
      destroyOnClose
      footer={null}
      title={
        <div style={{ paddingBottom: 4 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.3 }}>
            Schedule Exit Interview
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', fontWeight: 400, marginTop: 3 }}>
            Select an employee with an active separation request
          </div>
        </div>
      }
      styles={{
        header: { borderBottom: '1px solid var(--color-border)', paddingBottom: 14, marginBottom: 0 },
        body: { padding: '20px 24px' },
      }}
    >
      <Form form={form} layout="vertical" requiredMark={false}>

        {/* EMPLOYEE */}
        <div style={{ marginBottom: 18 }}>
          <FieldLabel required>Employee</FieldLabel>
          <Form.Item
            name="employee"
            noStyle
            rules={[{ required: true, message: 'Please select an employee.' }]}
          >
            <Select
              placeholder="Select employee..."
              options={EMPLOYEE_OPTIONS}
              style={{ width: '100%' }}
              showSearch
              filterOption={(input, opt) =>
                (opt?.label as string).toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
        </div>

        {/* INTERVIEW DATE */}
        <div style={{ marginBottom: 18 }}>
          <FieldLabel required>Interview Date</FieldLabel>
          <Form.Item
            name="date"
            noStyle
            rules={[{ required: true, message: 'Please select a date.' }]}
          >
            <DatePicker
              style={{ width: '100%', borderRadius: 8 }}
              format="YYYY-MM-DD"
              disabledDate={current => current && current < dayjs().startOf('day')}
            />
          </Form.Item>
        </div>

        {/* CONDUCTED BY */}
        <div style={{ marginBottom: 4 }}>
          <FieldLabel required>Conducted By</FieldLabel>
          <Form.Item
            name="interviewer"
            noStyle
            rules={[{ required: true, message: 'Please select an interviewer.' }]}
          >
            <Select
              placeholder="Select interviewer..."
              options={INTERVIEWER_OPTIONS}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </div>

      </Form>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', justifyContent: 'flex-end', gap: 10,
        paddingTop: 20, marginTop: 20,
        borderTop: '1px solid var(--color-border)',
      }}>
        <Button onClick={handleCancel} style={{ minWidth: 80 }}>
          Cancel
        </Button>
        <Button type="primary" onClick={handleSubmit} style={{ minWidth: 150 }}>
          Schedule Interview
        </Button>
      </div>
    </Modal>
  );
}
