import { useState, useMemo, useCallback } from 'react';
import {
  Button, Card, Drawer, Form, Input, Modal, Select, Space, Switch, Table, Tag, Tooltip, Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined,
  AppstoreOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { confirm } = Modal;

// ── Types ──────────────────────────────────────────────────────────────────────
interface KPIArea {
  key: string;
  code: string;
  name: string;
  description: string;
  totalSubKPIs: number;
  status: 'Active' | 'Inactive';
}

// ── Mock data ──────────────────────────────────────────────────────────────────
const INITIAL_DATA: KPIArea[] = [
  { key: '1', code: 'KPI-001', name: 'Sales Performance',      description: 'Measures revenue generation, deal closure rates, and sales target achievement across all sales channels.', totalSubKPIs: 6, status: 'Active' },
  { key: '2', code: 'KPI-002', name: 'Customer Satisfaction',  description: 'Tracks customer feedback scores, NPS ratings, and resolution times for support tickets.', totalSubKPIs: 4, status: 'Active' },
  { key: '3', code: 'KPI-003', name: 'Operational Efficiency', description: 'Evaluates process turnaround times, resource utilization, and waste reduction metrics.', totalSubKPIs: 5, status: 'Active' },
  { key: '4', code: 'KPI-004', name: 'Employee Development',   description: 'Assesses training completion, skill certifications earned, and internal promotion rates.', totalSubKPIs: 3, status: 'Active' },
  { key: '5', code: 'KPI-005', name: 'Financial Compliance',   description: 'Monitors budget adherence, expense reporting accuracy, and audit findings.', totalSubKPIs: 4, status: 'Active' },
  { key: '6', code: 'KPI-006', name: 'Innovation & Growth',    description: 'Tracks new product launches, R&D investment returns, and ideation pipeline metrics.', totalSubKPIs: 2, status: 'Inactive' },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function MainKPIPage() {
  const [data, setData]           = useState<KPIArea[]>(INITIAL_DATA);
  const [search, setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing]     = useState<KPIArea | null>(null);
  const [form]                    = Form.useForm();

  const nextCode = useCallback(() => {
    const max = data.reduce((acc, d) => {
      const n = parseInt(d.code.split('-')[1], 10);
      return n > acc ? n : acc;
    }, 0);
    return `KPI-${String(max + 1).padStart(3, '0')}`;
  }, [data]);

  const filtered = useMemo(() => {
    return data.filter(d => {
      const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.code.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === 'all' || d.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [data, search, filterStatus]);

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ code: nextCode(), status: true });
    setDrawerOpen(true);
  };

  const openEdit = (record: KPIArea) => {
    setEditing(record);
    form.setFieldsValue({
      code: record.code,
      name: record.name,
      description: record.description,
      status: record.status === 'Active',
    });
    setDrawerOpen(true);
  };

  const handleSave = () => {
    form.validateFields().then(values => {
      const status: 'Active' | 'Inactive' = values.status ? 'Active' : 'Inactive';
      if (editing) {
        setData(prev => prev.map(d => d.key === editing.key ? { ...d, ...values, status } : d));
      } else {
        const newItem: KPIArea = {
          key: String(Date.now()),
          code: values.code,
          name: values.name,
          description: values.description || '',
          totalSubKPIs: 0,
          status,
        };
        setData(prev => [...prev, newItem]);
      }
      setDrawerOpen(false);
    });
  };

  const handleDelete = (record: KPIArea) => {
    confirm({
      title: 'Delete KPI Area',
      icon: <ExclamationCircleOutlined style={{ color: '#dc2626' }} />,
      content: (
        <span>Are you sure you want to delete <strong>{record.name}</strong>? This action cannot be undone.</span>
      ),
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        setData(prev => prev.filter(d => d.key !== record.key));
      },
    });
  };

  const columns: ColumnsType<KPIArea> = [
    {
      title: 'KPI Code',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (v: string) => <Tag color="cyan" style={{ fontFamily: 'monospace', fontWeight: 600 }}>{v}</Tag>,
    },
    {
      title: 'KPI Name',
      dataIndex: 'name',
      key: 'name',
      render: (v: string) => <Text strong>{v}</Text>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (v: string) => <Text type="secondary" style={{ fontSize: 13 }}>{v}</Text>,
    },
    {
      title: 'Total Sub KPIs',
      dataIndex: 'totalSubKPIs',
      key: 'totalSubKPIs',
      align: 'center',
      width: 130,
      render: (v: number) => (
        <Tag color="blue" style={{ fontWeight: 600 }}>{v}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 110,
      render: (v: string) => (
        <Tag style={v === 'Active'
          ? { background: '#dcfce7', color: '#059669', border: '1px solid #bbf7d0', fontWeight: 600 }
          : { background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', fontWeight: 600 }}>
          {v}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      width: 110,
      render: (_: unknown, record: KPIArea) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="text" size="small" icon={<EditOutlined />}
              style={{ color: '#0f766e' }}
              onClick={() => openEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text" size="small" icon={<DeleteOutlined />}
              style={{ color: '#dc2626' }}
              onClick={() => handleDelete(record)}
            />
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
        color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <Space align="center" style={{ marginBottom: 4 }}>
            <AppstoreOutlined style={{ fontSize: 22, color: '#99f6e4' }} />
            <Title level={3} style={{ margin: 0, color: '#fff' }}>Main KPI Areas</Title>
          </Space>
          <Text style={{ color: '#99f6e4', fontSize: 14 }}>
            Define and manage the primary KPI categories used across the organization
          </Text>
        </div>
        <Button
          type="primary" icon={<PlusOutlined />} size="middle"
          onClick={openAdd}
          style={{ background: '#fff', color: '#0f766e', border: 'none', fontWeight: 600 }}
        >
          Add KPI Area
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <Card style={{ border: '1px solid #d8e7e5', borderRadius: 12, marginBottom: 16 }} bodyStyle={{ padding: '16px 20px' }}>
        <Space wrap>
          <Input
            placeholder="Search by name or code…"
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            style={{ width: 280 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
            allowClear
          />
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
          columns={columns}
          dataSource={filtered}
          rowKey="key"
          size="middle"
          pagination={{ pageSize: 10, showSizeChanger: false, showTotal: total => `${total} KPI areas` }}
          onHeaderRow={() => ({ style: { background: '#eef8f7' } })}
        />
      </Card>

      {/* Add / Edit Drawer */}
      <Drawer
        title={
          <Space>
            <AppstoreOutlined style={{ color: '#0f766e' }} />
            <span style={{ color: '#0f766e', fontWeight: 600 }}>
              {editing ? 'Edit KPI Area' : 'Add KPI Area'}
            </span>
          </Space>
        }
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={480}
        footer={
          <Space style={{ justifyContent: 'flex-end', display: 'flex' }}>
            <Button onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button type="primary" onClick={handleSave}
              style={{ background: '#0f766e', borderColor: '#0f766e' }}>
              {editing ? 'Save Changes' : 'Add KPI Area'}
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item label={<Text strong>KPI Code</Text>} name="code">
            <Input disabled style={{ background: '#f8fafc', fontFamily: 'monospace' }} />
          </Form.Item>
          <Form.Item
            label={<Text strong>KPI Name</Text>} name="name"
            rules={[{ required: true, message: 'KPI Name is required' }]}
          >
            <Input placeholder="e.g. Sales Performance" />
          </Form.Item>
          <Form.Item label={<Text strong>Description</Text>} name="description">
            <TextArea rows={4} placeholder="Briefly describe what this KPI area measures…" />
          </Form.Item>
          <Form.Item label={<Text strong>Status</Text>} name="status" valuePropName="checked">
            <Switch
              checkedChildren="Active"
              unCheckedChildren="Inactive"
              style={{ background: form.getFieldValue('status') ? '#0f766e' : undefined }}
            />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
