/**
 * DesignationMatrixPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Performance Management → Designation Matrix
 * Maps designations to KPI areas with weighted allocations.
 */

import { useState, useMemo } from 'react';
import {
  Table, Button, Modal, Form, Input, InputNumber, Select, Switch, Tag,
  Space, Typography, Tooltip, Popconfirm, Card, Tabs, Progress,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  ReconciliationOutlined, CheckCircleOutlined, StopOutlined, AppstoreOutlined,
} from '@ant-design/icons';
import {
  INITIAL_DESIGNATION_MATRIX,
  INITIAL_MAIN_KPI_AREAS,
  type DesignationMatrix,
  type KPIPerspective,
} from '../types/performance.types';

const { Title, Text } = Typography;
const { Option } = Select;

const PERSPECTIVE_COLORS: Record<KPIPerspective, string> = {
  'Financial':         '#0284c7',
  'Customer':          '#059669',
  'Internal Process':  '#d97706',
  'Learning & Growth': '#7c3aed',
};

const DEPARTMENTS = ['Executive', 'Finance', 'Human Resources', 'IT', 'Sales', 'Operations', 'Marketing'];

export default function DesignationMatrixPage() {
  const [matrix, setMatrix]     = useState<DesignationMatrix[]>(INITIAL_DESIGNATION_MATRIX);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]   = useState<DesignationMatrix | null>(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState<'list' | 'matrix'>('list');

  // ── Unique designations ───────────────────────────────────────────────────
  const designations = useMemo(() =>
    Array.from(new Set(matrix.map(m => m.designation))), [matrix]);

  // ── Matrix view: rows = designations, columns = KPI areas ─────────────────
  const matrixData = useMemo(() =>
    designations.map(desig => {
      const row: Record<string, unknown> = { designation: desig };
      const deptRow = matrix.find(m => m.designation === desig);
      row.department = deptRow?.department ?? '';
      INITIAL_MAIN_KPI_AREAS.forEach(area => {
        const entry = matrix.find(m => m.designation === desig && m.kpiAreaId === area.id && m.isActive);
        row[area.id] = entry?.weight ?? null;
      });
      const totalW = matrix
        .filter(m => m.designation === desig && m.isActive)
        .reduce((s, m) => s + m.weight, 0);
      row.totalWeight = totalW;
      return row;
    }), [matrix, designations]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ isActive: true });
    setModalOpen(true);
  };

  const openEdit = (record: DesignationMatrix) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => setMatrix(prev => prev.filter(m => m.id !== id));
  const handleToggle = (id: string) => setMatrix(prev => prev.map(m => m.id === id ? { ...m, isActive: !m.isActive } : m));

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const area = INITIAL_MAIN_KPI_AREAS.find(a => a.id === values.kpiAreaId);
      if (editing) {
        setMatrix(prev => prev.map(m => m.id === editing.id
          ? { ...m, ...values, kpiAreaName: area?.name ?? '', perspective: area?.perspective ?? m.perspective }
          : m));
      } else {
        setMatrix(prev => [...prev, {
          ...values,
          id: `dm-${Date.now()}`,
          kpiAreaName: area?.name ?? '',
          perspective: area?.perspective ?? 'Financial',
        }]);
      }
      setModalOpen(false);
    });
  };

  // ── List columns ──────────────────────────────────────────────────────────
  const listColumns: ColumnsType<DesignationMatrix> = [
    {
      title: 'Designation',
      dataIndex: 'designation',
      render: (v: string) => <Text strong style={{ fontSize: 12 }}>{v}</Text>,
    },
    {
      title: 'Department',
      dataIndex: 'department',
      width: 160,
      render: (v: string) => <Tag>{v}</Tag>,
    },
    {
      title: 'KPI Area',
      dataIndex: 'kpiAreaName',
      width: 200,
      render: (name: string, row) => (
        <Tag color={PERSPECTIVE_COLORS[row.perspective]} style={{ fontSize: 11 }}>{name}</Tag>
      ),
    },
    {
      title: 'Perspective',
      dataIndex: 'perspective',
      width: 160,
      render: (p: KPIPerspective) => (
        <Text type="secondary" style={{ fontSize: 11 }}>{p}</Text>
      ),
    },
    {
      title: 'Weight (%)',
      dataIndex: 'weight',
      width: 120,
      align: 'center',
      render: (w: number, row) => (
        <Space direction="vertical" size={2} style={{ width: 100 }}>
          <Text strong style={{ color: '#0f766e' }}>{w}%</Text>
          <Progress percent={w} size="small" showInfo={false} strokeColor={PERSPECTIVE_COLORS[row.perspective]} />
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      width: 80,
      render: (a: boolean) => (
        <Tag color={a ? 'success' : 'default'} icon={a ? <CheckCircleOutlined /> : <StopOutlined />} style={{ fontSize: 10 }}>
          {a ? 'Active' : 'Off'}
        </Tag>
      ),
    },
    {
      title: '',
      width: 100,
      render: (_: unknown, record: DesignationMatrix) => (
        <Space size={4}>
          <Tooltip title="Edit"><Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} /></Tooltip>
          <Tooltip title={record.isActive ? 'Deactivate' : 'Activate'}>
            <Button size="small" icon={record.isActive ? <StopOutlined /> : <CheckCircleOutlined />} onClick={() => handleToggle(record.id)} />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm title="Delete this mapping?" onConfirm={() => handleDelete(record.id)} okType="danger">
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // ── Matrix view columns ──────────────────────────────────────────────────
  const matrixColumns: ColumnsType<Record<string, unknown>> = [
    {
      title: 'Designation',
      dataIndex: 'designation',
      fixed: 'left',
      width: 180,
      render: (v: string) => <Text strong style={{ fontSize: 12 }}>{v}</Text>,
    },
    {
      title: 'Department',
      dataIndex: 'department',
      width: 130,
      render: (v: string) => <Tag style={{ fontSize: 10 }}>{v}</Tag>,
    },
    ...INITIAL_MAIN_KPI_AREAS.map(area => ({
      title: (
        <Space direction="vertical" size={0}>
          <Tag color={PERSPECTIVE_COLORS[area.perspective]} style={{ fontSize: 10, margin: 0 }}>{area.code}</Tag>
          <Text style={{ fontSize: 10 }}>{area.name.split(' ')[0]}</Text>
        </Space>
      ),
      dataIndex: area.id,
      width: 110,
      align: 'center' as const,
      render: (w: number | null) => w !== null
        ? <Tag color="#0f766e" style={{ fontSize: 12, fontWeight: 600 }}>{w}%</Tag>
        : <Text type="secondary" style={{ fontSize: 12 }}>—</Text>,
    })),
    {
      title: 'Total',
      dataIndex: 'totalWeight',
      width: 80,
      align: 'center',
      render: (w: number) => (
        <Tag color={w === 100 ? 'success' : 'warning'} style={{ fontWeight: 700 }}>{w}%</Tag>
      ),
    },
  ];

  return (
    <div style={{ padding: '16px 20px', background: '#f0f4f3', minHeight: '100%' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Title level={4} style={{ margin: 0, color: '#0f766e' }}>
            <ReconciliationOutlined style={{ marginRight: 8 }} />Designation Matrix
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Map designations to KPI areas with performance weight allocations
          </Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>Add Mapping</Button>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Tabs
          activeKey={activeTab}
          onChange={k => setActiveTab(k as 'list' | 'matrix')}
          items={[
            {
              key: 'list',
              label: <Space><EditOutlined />List View</Space>,
              children: (
                <Table
                  dataSource={matrix}
                  columns={listColumns}
                  rowKey="id"
                  size="small"
                  pagination={{ pageSize: 10, showSizeChanger: false }}
                  scroll={{ x: 800 }}
                />
              ),
            },
            {
              key: 'matrix',
              label: <Space><AppstoreOutlined />Matrix View</Space>,
              children: (
                <>
                  <div style={{ marginBottom: 10, padding: '8px 12px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
                    <Text style={{ fontSize: 12, color: '#065f46' }}>
                      Matrix shows KPI area weights (%) per designation. Green total = correctly sums to 100%.
                    </Text>
                  </div>
                  <Table
                    dataSource={matrixData}
                    columns={matrixColumns}
                    rowKey="designation"
                    size="small"
                    pagination={false}
                    scroll={{ x: 900 }}
                    bordered
                  />
                </>
              ),
            },
          ]}
        />
      </Card>

      {/* ── Add / Edit Modal ─────────────────────────────────────────────── */}
      <Modal
        title={
          <Space>
            <ReconciliationOutlined style={{ color: '#0f766e' }} />
            {editing ? 'Edit Designation Mapping' : 'Add Designation Mapping'}
          </Space>
        }
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText={editing ? 'Update' : 'Add'}
        width={520}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="designation" label="Designation" rules={[{ required: true, message: 'Required' }]}>
            <Input placeholder="e.g. Senior Manager" />
          </Form.Item>
          <Form.Item name="department" label="Department" rules={[{ required: true }]}>
            <Select placeholder="Select department">
              {DEPARTMENTS.map(d => <Option key={d} value={d}>{d}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="kpiAreaId" label="KPI Area" rules={[{ required: true }]}>
            <Select
              placeholder="Select KPI Area"
              onChange={(val) => {
                const area = INITIAL_MAIN_KPI_AREAS.find(a => a.id === val);
                if (area) form.setFieldValue('perspective', area.perspective);
              }}
            >
              {INITIAL_MAIN_KPI_AREAS.map(a => (
                <Option key={a.id} value={a.id}>
                  <Tag color={PERSPECTIVE_COLORS[a.perspective]} style={{ fontSize: 11 }}>{a.name}</Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="weight"
            label="Weight (%)"
            rules={[{ required: true }, { type: 'number', min: 1, max: 100 }]}
          >
            <InputNumber min={1} max={100} style={{ width: '100%' }} addonAfter="%" />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
