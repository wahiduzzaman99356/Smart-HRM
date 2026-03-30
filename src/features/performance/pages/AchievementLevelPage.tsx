/**
 * AchievementLevelPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Performance Management → Achievement Level Setup
 * Configure grading levels (Outstanding, Exceeds Expectations, etc.)
 * with score ranges, color coding, and star ratings.
 */

import { useState } from 'react';
import {
  Table, Button, Modal, Form, Input, InputNumber, Switch, Tag,
  Space, Typography, Tooltip, Popconfirm, Card, Rate, Row, Col,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, TrophyOutlined,
  CheckCircleOutlined, StopOutlined,
} from '@ant-design/icons';
import {
  INITIAL_ACHIEVEMENT_LEVELS,
  type AchievementLevel,
} from '../types/performance.types';

const { Title, Text } = Typography;
const { TextArea } = Input;

const PRESET_COLORS = [
  '#059669', '#0284c7', '#d97706', '#ea580c', '#dc2626',
  '#7c3aed', '#0891b2', '#65a30d', '#9333ea', '#e11d48',
];

export default function AchievementLevelPage() {
  const [levels, setLevels]       = useState<AchievementLevel[]>(INITIAL_ACHIEVEMENT_LEVELS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState<AchievementLevel | null>(null);
  const [form] = Form.useForm();

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ isActive: true, rating: 3, color: '#0284c7' });
    setModalOpen(true);
  };

  const openEdit = (record: AchievementLevel) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => setLevels(prev => prev.filter(l => l.id !== id));
  const handleToggle = (id: string) => setLevels(prev => prev.map(l => l.id === id ? { ...l, isActive: !l.isActive } : l));

  const handleSubmit = () => {
    form.validateFields().then(values => {
      if (editing) {
        setLevels(prev => prev.map(l => l.id === editing.id ? { ...l, ...values } : l));
      } else {
        setLevels(prev => [
          ...prev,
          { ...values, id: `al-${Date.now()}` },
        ].sort((a, b) => b.minScore - a.minScore));
      }
      setModalOpen(false);
    });
  };

  // ── Validation: check for overlapping score ranges ────────────────────────
  const hasOverlap = (l: AchievementLevel[]) => {
    const sorted = [...l].filter(x => x.isActive).sort((a, b) => a.minScore - b.minScore);
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i].maxScore >= sorted[i + 1].minScore) return true;
    }
    return false;
  };
  const overlap = hasOverlap(levels);

  const sortedLevels = [...levels].sort((a, b) => b.minScore - a.minScore);

  const columns: ColumnsType<AchievementLevel> = [
    {
      title: '#',
      dataIndex: 'rating',
      width: 50,
      align: 'center',
      render: (r: number) => <Text strong style={{ color: '#0f766e' }}>{r}</Text>,
    },
    {
      title: 'Code',
      dataIndex: 'code',
      width: 70,
      render: (v: string, row) => (
        <Tag
          style={{
            background: row.color + '22',
            color: row.color,
            border: `1px solid ${row.color}55`,
            fontWeight: 700,
            fontSize: 12,
          }}
        >
          {v}
        </Tag>
      ),
    },
    {
      title: 'Achievement Level',
      dataIndex: 'name',
      render: (name: string, row) => (
        <Space>
          <span
            style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: row.color }}
          />
          <Text strong style={{ fontSize: 13 }}>{name}</Text>
        </Space>
      ),
    },
    {
      title: 'Score Range',
      width: 160,
      render: (_: unknown, row) => (
        <Space size={4}>
          <Tag color="default" style={{ fontFamily: 'monospace' }}>{row.minScore}%</Tag>
          <Text type="secondary">—</Text>
          <Tag color="default" style={{ fontFamily: 'monospace' }}>{row.maxScore}%</Tag>
        </Space>
      ),
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      width: 140,
      render: (r: number, row) => (
        <Rate disabled defaultValue={r} count={5} style={{ fontSize: 14, color: row.color }} />
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      ellipsis: true,
      render: (d: string) => <Text type="secondary" style={{ fontSize: 12 }}>{d}</Text>,
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
      width: 90,
      render: (_: unknown, record: AchievementLevel) => (
        <Space size={4}>
          <Tooltip title="Edit"><Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} /></Tooltip>
          <Tooltip title={record.isActive ? 'Deactivate' : 'Activate'}>
            <Button size="small" icon={record.isActive ? <StopOutlined /> : <CheckCircleOutlined />} onClick={() => handleToggle(record.id)} />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm title="Delete this achievement level?" onConfirm={() => handleDelete(record.id)} okType="danger">
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '16px 20px', background: '#f0f4f3', minHeight: '100%' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Title level={4} style={{ margin: 0, color: '#0f766e' }}>
            <TrophyOutlined style={{ marginRight: 8 }} />Achievement Level Setup
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Configure performance grading levels with score ranges, ratings, and colour coding
          </Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>Add Level</Button>
      </div>

      {/* ── Validation warning ────────────────────────────────────────────── */}
      {overlap && (
        <div style={{ marginBottom: 12, padding: '8px 14px', background: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca' }}>
          <Text style={{ color: '#991b1b', fontSize: 12 }}>
            ⚠ Some active achievement levels have overlapping score ranges. Please adjust min/max values.
          </Text>
        </div>
      )}

      {/* ── Visual scale ─────────────────────────────────────────────────── */}
      <Card bordered={false} size="small" style={{ borderRadius: 10, marginBottom: 12, overflow: 'hidden' }}>
        <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 8, display: 'block' }}>Score Scale (0–100%)</Text>
        <div style={{ display: 'flex', height: 28, borderRadius: 8, overflow: 'hidden', width: '100%' }}>
          {sortedLevels.filter(l => l.isActive).map(level => {
            const width = level.maxScore - level.minScore + 1;
            return (
              <Tooltip
                key={level.id}
                title={`${level.name}: ${level.minScore}%–${level.maxScore}%`}
              >
                <div
                  style={{
                    flex: width,
                    background: level.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 10,
                    fontWeight: 600,
                    cursor: 'default',
                    borderRight: '1px solid rgba(255,255,255,0.3)',
                  }}
                >
                  {level.code}
                </div>
              </Tooltip>
            );
          })}
        </div>
        <Row style={{ marginTop: 6 }}>
          {[0, 25, 50, 75, 100].map(v => (
            <Col key={v} style={{ flex: v === 100 ? 0 : undefined, marginLeft: v === 100 ? 'auto' : undefined }}>
              <Text type="secondary" style={{ fontSize: 10 }}>{v}%</Text>
            </Col>
          ))}
        </Row>
      </Card>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Table
          dataSource={sortedLevels}
          columns={columns}
          rowKey="id"
          size="small"
          pagination={false}
          scroll={{ x: 900 }}
        />
      </Card>

      {/* ── Add / Edit Modal ─────────────────────────────────────────────── */}
      <Modal
        title={
          <Space>
            <TrophyOutlined style={{ color: '#0f766e' }} />
            {editing ? 'Edit Achievement Level' : 'Add Achievement Level'}
          </Space>
        }
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText={editing ? 'Update' : 'Add'}
        width={540}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Space style={{ width: '100%', gap: 12, display: 'flex' }}>
            <Form.Item name="code" label="Code" rules={[{ required: true }]} style={{ width: 100 }}>
              <Input placeholder="OS" maxLength={4} style={{ textTransform: 'uppercase' }} />
            </Form.Item>
            <Form.Item name="name" label="Level Name" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Input placeholder="e.g. Outstanding" />
            </Form.Item>
            <Form.Item name="rating" label="Rating (1–5)" rules={[{ required: true }]} style={{ width: 120 }}>
              <InputNumber min={1} max={5} style={{ width: '100%' }} />
            </Form.Item>
          </Space>
          <Space style={{ width: '100%', gap: 12, display: 'flex' }}>
            <Form.Item
              name="minScore"
              label="Min Score (%)"
              rules={[{ required: true }, { type: 'number', min: 0, max: 100 }]}
              style={{ flex: 1 }}
            >
              <InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter="%" />
            </Form.Item>
            <Form.Item
              name="maxScore"
              label="Max Score (%)"
              rules={[{ required: true }, { type: 'number', min: 0, max: 100 }]}
              style={{ flex: 1 }}
            >
              <InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter="%" />
            </Form.Item>
          </Space>
          <Form.Item name="color" label="Colour">
            <Space wrap>
              {PRESET_COLORS.map(c => (
                <div
                  key={c}
                  onClick={() => form.setFieldValue('color', c)}
                  style={{
                    width: 24, height: 24, borderRadius: '50%', background: c, cursor: 'pointer',
                    border: form.getFieldValue('color') === c ? '3px solid #111' : '2px solid transparent',
                  }}
                />
              ))}
              <Input
                style={{ width: 90 }}
                value={form.getFieldValue('color')}
                onChange={e => form.setFieldValue('color', e.target.value)}
                placeholder="#hex"
              />
            </Space>
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={2} placeholder="Describe this achievement level…" />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
