/**
 * MainKPIAreasPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Performance Management → Main KPI Areas
 * List + create flow for Main KPI Areas with sub KPI count and tagged designations.
 */

import { useMemo, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Tag,
  Space, Typography, Card,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined,
} from '@ant-design/icons';
import {
  INITIAL_MAIN_KPI_AREAS,
  INITIAL_SUB_KPIS,
  INITIAL_DESIGNATION_MATRIX,
  type MainKPIArea,
} from '../types/performance.types';

const { Title, Text } = Typography;

interface MainKPIRow {
  id: string;
  code: string;
  name: string;
  subKpiCount: number;
  designations: string[];
}

export default function MainKPIAreasPage() {
  const [areas, setAreas] = useState<MainKPIArea[]>(INITIAL_MAIN_KPI_AREAS);
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const activeSubKpis = useMemo(
    () => INITIAL_SUB_KPIS.filter(sub => sub.isActive),
    [],
  );
  const activeDesignationMatrix = useMemo(
    () => INITIAL_DESIGNATION_MATRIX.filter(item => item.isActive),
    [],
  );

  const tableRows = useMemo<MainKPIRow[]>(
    () => areas
      .map(area => {
        const subKpiCount = activeSubKpis.filter(sub => sub.mainKPIAreaId === area.id).length;
        const designations = Array.from(
          new Set(
            activeDesignationMatrix
              .filter(item => item.kpiAreaId === area.id)
              .map(item => item.designation),
          ),
        );

        return {
          id: area.id,
          code: area.code,
          name: area.name,
          subKpiCount,
          designations,
        };
      })
      .filter(row => {
        if (!query.trim()) return true;
        const needle = query.trim().toLowerCase();
        return row.code.toLowerCase().includes(needle) || row.name.toLowerCase().includes(needle);
      }),
    [activeDesignationMatrix, activeSubKpis, areas, query],
  );

  // ── Handlers ──────────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditingId(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: MainKPIRow) => {
    setEditingId(record.id);
    form.setFieldsValue({ code: record.code, name: record.name });
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setAreas(prev => prev.filter(a => a.id !== id));
  };

  const handleReset = () => {
    setQuery('');
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const code = String(values.code).trim().toUpperCase();
    const name = String(values.name).trim();

    const hasDuplicateCode = areas.some(a => a.code.toLowerCase() === code.toLowerCase() && a.id !== editingId);
    if (hasDuplicateCode) {
      form.setFields([{ name: 'code', errors: ['KPI code already exists.'] }]);
      return;
    }

    if (editingId) {
      setAreas(prev => prev.map(a => (a.id === editingId ? { ...a, code, name } : a)));
    } else {
      const fallbackPerspective = areas[0]?.perspective ?? 'Financial';
      const newArea: MainKPIArea = {
        id: `kpi-area-${Date.now()}`,
        code,
        name,
        perspective: fallbackPerspective,
        weight: 0,
        description: '',
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setAreas(prev => [newArea, ...prev]);
    }

    setModalOpen(false);
    form.resetFields();
  };

  // ── Columns ───────────────────────────────────────────────────────────────
  const columns: ColumnsType<MainKPIRow> = [
    {
      title: 'Code',
      dataIndex: 'code',
      width: 110,
      render: (v: string) => (
        <Tag
          style={{
            fontFamily: 'monospace',
            fontWeight: 700,
            color: 'var(--color-primary)',
            borderColor: '#8dd3c8',
            background: 'var(--color-primary-tint)',
          }}
        >
          {v}
        </Tag>
      ),
    },
    {
      title: 'Main KPI Area',
      dataIndex: 'name',
      render: (name: string) => <Text strong style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>{name}</Text>,
    },
    {
      title: 'Sub KPIs',
      dataIndex: 'subKpiCount',
      width: 130,
      render: (count: number) => (
        <Tag style={{ borderColor: '#9ddfd4', color: 'var(--color-primary)', background: 'var(--color-primary-tint)', fontWeight: 700, fontSize: 12 }}>
          {count} KPI{count === 1 ? '' : 's'}
        </Tag>
      ),
    },
    {
      title: 'Designations',
      dataIndex: 'designations',
      width: 450,
      render: (designationList: string[]) => (
        <Space size={[6, 6]} wrap>
          {designationList.length > 0 ? designationList.map(designation => (
            <Tag
              key={designation}
              style={{
                marginInlineEnd: 0,
                borderColor: '#9ddfd4',
                color: 'var(--color-primary)',
                background: 'var(--color-primary-tint)',
                borderRadius: 999,
                paddingInline: 10,
              }}
            >
              {designation}
            </Tag>
          )) : <Text type="secondary">No designation tagged</Text>}
        </Space>
      ),
    },
    {
      title: 'Actions',
      width: 140,
      render: (_: unknown, record: MainKPIRow) => (
        <Space size={6}>
          <Button
            size="small"
            icon={<EditOutlined style={{ color: '#f97316' }} />}
            onClick={() => openEdit(record)}
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-primary)' }}
          >
            Edit
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            style={{ borderColor: '#f2c4c4', color: '#dc2626', background: 'var(--color-status-rejected-bg)' }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '16px 20px', background: 'var(--color-bg-subtle)', minHeight: '100%' }}>
      <div style={{ marginBottom: 14 }}>
        <Title level={3} style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
          Main KPI Areas
          <Text style={{ marginLeft: 10, color: 'var(--color-primary)', fontSize: 22, fontWeight: 500 }}>Configuration</Text>
        </Title>
      </div>

      <Card bordered={false} style={{ borderRadius: 16, background: 'var(--color-bg-subtle)' }}>
        <div
          style={{
            display: 'flex',
            gap: 10,
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 14,
            flexWrap: 'wrap',
          }}
        >
          <Space size={10} wrap>
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search KPI areas..."
              prefix={<SearchOutlined style={{ color: 'var(--color-text-tertiary)' }} />}
              style={{
                width: 310,
                background: 'var(--color-bg-surface)',
                borderColor: 'var(--color-border)',
                borderRadius: 10,
              }}
            />
            <Button
              type="primary"
              icon={<SearchOutlined />}
              style={{ borderRadius: 10, paddingInline: 16 }}
              onClick={() => undefined}
            >
              Search
            </Button>
            <Button
              icon={<ReloadOutlined />}
              style={{ borderRadius: 10, borderColor: '#c7ddda', color: 'var(--color-text-tertiary)' }}
              onClick={handleReset}
            >
              Reset
            </Button>
          </Space>

          <Button type="primary" icon={<PlusOutlined />} onClick={openAdd} style={{ borderRadius: 12, paddingInline: 18 }}>
            Add Main KPI
          </Button>
        </div>

        <Table
          dataSource={tableRows}
          columns={columns}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 10, showSizeChanger: false, hideOnSinglePage: true }}
          scroll={{ x: 980 }}
        />
      </Card>

      <Modal
        title={
          <Space>
            <PlusOutlined style={{ color: '#7c3aed' }} />
            {editingId ? 'Edit Main KPI Area' : 'Add Main KPI Area'}
          </Space>
        }
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        okText={editingId ? 'Update' : 'Save'}
        cancelText="Cancel"
        width={560}
        destroyOnClose
        okButtonProps={{ style: { borderRadius: 12, paddingInline: 22 } }}
        cancelButtonProps={{ style: { borderRadius: 12, borderColor: 'var(--color-border)', color: 'var(--color-primary)' } }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="code"
            label={<Text style={{ letterSpacing: 1, fontSize: 12, color: 'var(--color-primary)' }}>KPI CODE</Text>}
            rules={[{ required: true, message: 'KPI code is required' }]}
          >
            <Input
              placeholder="e.g. MK-15"
              maxLength={12}
              style={{ borderRadius: 12, borderColor: 'var(--color-border)', textTransform: 'uppercase' }}
            />
          </Form.Item>

          <Form.Item
            name="name"
            label={<Text style={{ letterSpacing: 1, fontSize: 12, color: 'var(--color-primary)' }}>KPI AREA NAME</Text>}
            rules={[{ required: true, message: 'KPI area name is required' }]}
          >
            <Input
              placeholder="e.g. 15. Workforce Analytics"
              maxLength={120}
              style={{ borderRadius: 12, borderColor: 'var(--color-border)' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
