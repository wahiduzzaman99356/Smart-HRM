import { useState, useMemo, useCallback } from 'react';
import {
  Button, Card, Drawer, Form, Input, InputNumber, Modal, Select,
  Space, Switch, Table, Tag, Tooltip, Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined,
  ApartmentOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { confirm } = Modal;

// ── Types ──────────────────────────────────────────────────────────────────────
type MeasurementUnit = '%' | 'Number' | 'Currency';
type Frequency = 'Monthly' | 'Quarterly' | 'Annually';

interface SubKPI {
  key: string;
  code: string;
  name: string;
  mainKPIArea: string;
  measurementUnit: MeasurementUnit;
  targetValue: number;
  weight: number;
  frequency: Frequency;
  status: 'Active' | 'Inactive';
}

// ── Mock data ──────────────────────────────────────────────────────────────────
const MAIN_KPI_OPTIONS = [
  'Sales Performance', 'Customer Satisfaction', 'Operational Efficiency',
  'Employee Development', 'Financial Compliance', 'Innovation & Growth',
];

const INITIAL_DATA: SubKPI[] = [
  { key: '1',  code: 'SKPI-001', name: 'Revenue Target Achievement',   mainKPIArea: 'Sales Performance',      measurementUnit: '%',        targetValue: 100,  weight: 30, frequency: 'Monthly',    status: 'Active' },
  { key: '2',  code: 'SKPI-002', name: 'New Client Acquisition',       mainKPIArea: 'Sales Performance',      measurementUnit: 'Number',   targetValue: 20,   weight: 20, frequency: 'Monthly',    status: 'Active' },
  { key: '3',  code: 'SKPI-003', name: 'NPS Score',                    mainKPIArea: 'Customer Satisfaction',  measurementUnit: 'Number',   targetValue: 70,   weight: 25, frequency: 'Quarterly',  status: 'Active' },
  { key: '4',  code: 'SKPI-004', name: 'Ticket Resolution Rate',       mainKPIArea: 'Customer Satisfaction',  measurementUnit: '%',        targetValue: 95,   weight: 20, frequency: 'Monthly',    status: 'Active' },
  { key: '5',  code: 'SKPI-005', name: 'Process Cycle Time Reduction', mainKPIArea: 'Operational Efficiency', measurementUnit: '%',        targetValue: 15,   weight: 20, frequency: 'Quarterly',  status: 'Active' },
  { key: '6',  code: 'SKPI-006', name: 'Resource Utilization Rate',    mainKPIArea: 'Operational Efficiency', measurementUnit: '%',        targetValue: 85,   weight: 25, frequency: 'Monthly',    status: 'Active' },
  { key: '7',  code: 'SKPI-007', name: 'Training Hours Completed',     mainKPIArea: 'Employee Development',   measurementUnit: 'Number',   targetValue: 40,   weight: 15, frequency: 'Annually',   status: 'Active' },
  { key: '8',  code: 'SKPI-008', name: 'Budget Variance',              mainKPIArea: 'Financial Compliance',   measurementUnit: '%',        targetValue: 5,    weight: 30, frequency: 'Monthly',    status: 'Active' },
  { key: '9',  code: 'SKPI-009', name: 'Audit Finding Closure Rate',   mainKPIArea: 'Financial Compliance',   measurementUnit: '%',        targetValue: 90,   weight: 25, frequency: 'Quarterly',  status: 'Active' },
  { key: '10', code: 'SKPI-010', name: 'New Product Launches',         mainKPIArea: 'Innovation & Growth',    measurementUnit: 'Number',   targetValue: 3,    weight: 35, frequency: 'Annually',   status: 'Inactive' },
];

const UNIT_COLORS: Record<MeasurementUnit, string> = {
  '%':        'purple',
  'Number':   'blue',
  'Currency': 'gold',
};

const FREQ_COLORS: Record<Frequency, string> = {
  Monthly:    'cyan',
  Quarterly:  'geekblue',
  Annually:   'volcano',
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function SubKPIPage() {
  const [data, setData]               = useState<SubKPI[]>(INITIAL_DATA);
  const [search, setSearch]           = useState('');
  const [filterMainKPI, setFilterMainKPI] = useState<string>('all');
  const [filterStatus, setFilterStatus]   = useState<string>('all');
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [editing, setEditing]         = useState<SubKPI | null>(null);
  const [form]                        = Form.useForm();

  const nextCode = useCallback(() => {
    const max = data.reduce((acc, d) => {
      const n = parseInt(d.code.split('-')[1], 10);
      return n > acc ? n : acc;
    }, 0);
    return `SKPI-${String(max + 1).padStart(3, '0')}`;
  }, [data]);

  const filtered = useMemo(() => data.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.code.toLowerCase().includes(search.toLowerCase());
    const matchMain   = filterMainKPI === 'all' || d.mainKPIArea === filterMainKPI;
    const matchStatus = filterStatus === 'all' || d.status === filterStatus;
    return matchSearch && matchMain && matchStatus;
  }), [data, search, filterMainKPI, filterStatus]);

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ code: nextCode(), status: true });
    setDrawerOpen(true);
  };

  const openEdit = (record: SubKPI) => {
    setEditing(record);
    form.setFieldsValue({ ...record, status: record.status === 'Active' });
    setDrawerOpen(true);
  };

  const handleSave = () => {
    form.validateFields().then(values => {
      const status: 'Active' | 'Inactive' = values.status ? 'Active' : 'Inactive';
      if (editing) {
        setData(prev => prev.map(d => d.key === editing.key ? { ...d, ...values, status } : d));
      } else {
        setData(prev => [...prev, { key: String(Date.now()), ...values, status }]);
      }
      setDrawerOpen(false);
    });
  };

  const handleDelete = (record: SubKPI) => {
    confirm({
      title: 'Delete Sub KPI',
      icon: <ExclamationCircleOutlined style={{ color: '#dc2626' }} />,
      content: <span>Delete <strong>{record.name}</strong>? This cannot be undone.</span>,
      okText: 'Delete', okType: 'danger', cancelText: 'Cancel',
      onOk() { setData(prev => prev.filter(d => d.key !== record.key)); },
    });
  };

  const columns: ColumnsType<SubKPI> = [
    {
      title: 'Sub KPI Code', dataIndex: 'code', key: 'code', width: 120,
      render: (v: string) => <Tag color="cyan" style={{ fontFamily: 'monospace', fontWeight: 600 }}>{v}</Tag>,
    },
    {
      title: 'Sub KPI Name', dataIndex: 'name', key: 'name',
      render: (v: string) => <Text strong style={{ fontSize: 13 }}>{v}</Text>,
    },
    {
      title: 'Main KPI Area', dataIndex: 'mainKPIArea', key: 'mainKPIArea',
      render: (v: string) => <Tag color="teal" style={{ background: '#f0fdf4', color: '#0f766e', border: '1px solid #99f6e4' }}>{v}</Tag>,
    },
    {
      title: 'Unit', dataIndex: 'measurementUnit', key: 'measurementUnit', align: 'center', width: 90,
      render: (v: MeasurementUnit) => <Tag color={UNIT_COLORS[v]}>{v}</Tag>,
    },
    {
      title: 'Target', dataIndex: 'targetValue', key: 'targetValue', align: 'center', width: 80,
      render: (v: number, r: SubKPI) => (
        <Text strong style={{ color: '#0f766e' }}>{v}{r.measurementUnit === '%' ? '%' : ''}</Text>
      ),
    },
    {
      title: 'Weight (%)', dataIndex: 'weight', key: 'weight', align: 'center', width: 100,
      render: (v: number) => <Text strong>{v}%</Text>,
    },
    {
      title: 'Frequency', dataIndex: 'frequency', key: 'frequency', align: 'center', width: 110,
      render: (v: Frequency) => <Tag color={FREQ_COLORS[v]}>{v}</Tag>,
    },
    {
      title: 'Status', dataIndex: 'status', key: 'status', align: 'center', width: 100,
      render: (v: string) => (
        <Tag style={v === 'Active'
          ? { background: '#dcfce7', color: '#059669', border: '1px solid #bbf7d0', fontWeight: 600 }
          : { background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', fontWeight: 600 }}>
          {v}
        </Tag>
      ),
    },
    {
      title: 'Actions', key: 'actions', align: 'center', width: 90,
      render: (_: unknown, record: SubKPI) => (
        <Space>
          <Tooltip title="Edit">
            <Button type="text" size="small" icon={<EditOutlined />} style={{ color: '#0f766e' }} onClick={() => openEdit(record)} />
          </Tooltip>
          <Tooltip title="Delete">
            <Button type="text" size="small" icon={<DeleteOutlined />} style={{ color: '#dc2626' }} onClick={() => handleDelete(record)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#f0faf9', minHeight: '100vh' }}>
      {/* Page Header */}
      <div style={{
        background: 'linear-gradient(135deg, #145a56 0%, #0f766e 100%)',
        borderRadius: 12, padding: '24px 28px', marginBottom: 24,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <Space align="center" style={{ marginBottom: 4 }}>
            <ApartmentOutlined style={{ fontSize: 22, color: '#99f6e4' }} />
            <Title level={3} style={{ margin: 0, color: '#fff' }}>Sub KPI Setup</Title>
          </Space>
          <Text style={{ color: '#99f6e4', fontSize: 14 }}>
            Configure measurable sub-indicators linked to main KPI areas
          </Text>
        </div>
        <Button
          type="primary" icon={<PlusOutlined />}
          onClick={openAdd}
          style={{ background: '#fff', color: '#0f766e', border: 'none', fontWeight: 600 }}
        >
          Add Sub KPI
        </Button>
      </div>

      {/* Filters */}
      <Card style={{ border: '1px solid #d8e7e5', borderRadius: 12, marginBottom: 16 }} bodyStyle={{ padding: '16px 20px' }}>
        <Space wrap>
          <Input
            placeholder="Search by name or code…"
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            style={{ width: 260 }} value={search}
            onChange={e => setSearch(e.target.value)} allowClear
          />
          <Select value={filterMainKPI} onChange={setFilterMainKPI} style={{ width: 220 }}>
            <Option value="all">All Main KPI Areas</Option>
            {MAIN_KPI_OPTIONS.map(o => <Option key={o} value={o}>{o}</Option>)}
          </Select>
          <Select value={filterStatus} onChange={setFilterStatus} style={{ width: 150 }}>
            <Option value="all">All Status</Option>
            <Option value="Active">Active</Option>
            <Option value="Inactive">Inactive</Option>
          </Select>
        </Space>
      </Card>

      {/* Table */}
      <Card style={{ border: '1px solid #d8e7e5', borderRadius: 12 }}>
        <Table
          columns={columns} dataSource={filtered} rowKey="key" size="middle"
          pagination={{ pageSize: 10, showTotal: t => `${t} sub KPIs` }}
          onHeaderRow={() => ({ style: { background: '#eef8f7' } })}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Add / Edit Drawer */}
      <Drawer
        title={
          <Space>
            <ApartmentOutlined style={{ color: '#0f766e' }} />
            <span style={{ color: '#0f766e', fontWeight: 600 }}>
              {editing ? 'Edit Sub KPI' : 'Add Sub KPI'}
            </span>
          </Space>
        }
        open={drawerOpen} onClose={() => setDrawerOpen(false)} width={520}
        footer={
          <Space style={{ justifyContent: 'flex-end', display: 'flex' }}>
            <Button onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button type="primary" onClick={handleSave}
              style={{ background: '#0f766e', borderColor: '#0f766e' }}>
              {editing ? 'Save Changes' : 'Add Sub KPI'}
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item label={<Text strong>Sub KPI Code</Text>} name="code">
            <Input disabled style={{ background: '#f8fafc', fontFamily: 'monospace' }} />
          </Form.Item>
          <Form.Item label={<Text strong>Sub KPI Name</Text>} name="name"
            rules={[{ required: true, message: 'Sub KPI Name is required' }]}>
            <Input placeholder="e.g. Revenue Target Achievement" />
          </Form.Item>
          <Form.Item label={<Text strong>Main KPI Area</Text>} name="mainKPIArea"
            rules={[{ required: true, message: 'Please select a Main KPI Area' }]}>
            <Select placeholder="Select main KPI area">
              {MAIN_KPI_OPTIONS.map(o => <Option key={o} value={o}>{o}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item label={<Text strong>Measurement Unit</Text>} name="measurementUnit"
            rules={[{ required: true, message: 'Please select a unit' }]}>
            <Select placeholder="Select unit">
              <Option value="%">% (Percentage)</Option>
              <Option value="Number">Number</Option>
              <Option value="Currency">Currency</Option>
            </Select>
          </Form.Item>
          <Form.Item label={<Text strong>Target Value</Text>} name="targetValue"
            rules={[{ required: true, message: 'Target value is required' }]}>
            <InputNumber min={0} style={{ width: '100%' }} placeholder="e.g. 100" />
          </Form.Item>
          <Form.Item label={<Text strong>Weight (%)</Text>} name="weight"
            rules={[{ required: true, message: 'Weight is required' }]}>
            <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="e.g. 25" />
          </Form.Item>
          <Form.Item label={<Text strong>Frequency</Text>} name="frequency"
            rules={[{ required: true, message: 'Please select frequency' }]}>
            <Select placeholder="Select frequency">
              <Option value="Monthly">Monthly</Option>
              <Option value="Quarterly">Quarterly</Option>
              <Option value="Annually">Annually</Option>
            </Select>
          </Form.Item>
          <Form.Item label={<Text strong>Description</Text>} name="description">
            <TextArea rows={3} placeholder="Brief description of this sub KPI…" />
          </Form.Item>
          <Form.Item label={<Text strong>Status</Text>} name="status" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
