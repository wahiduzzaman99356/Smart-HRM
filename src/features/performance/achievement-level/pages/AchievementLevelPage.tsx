import { useState, useMemo } from 'react';
import {
  Button, Card, Drawer, Form, Input, InputNumber, Modal, Rate,
  Space, Table, Tag, Tooltip, Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, TrophyOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { confirm } = Modal;

// ── Types ──────────────────────────────────────────────────────────────────────
interface AchievementLevel {
  key: string;
  code: string;
  levelName: string;
  minScore: number;
  maxScore: number;
  color: string;
  colorLabel: string;
  stars: number;
  description: string;
}

// ── Mock data ──────────────────────────────────────────────────────────────────
const INITIAL_DATA: AchievementLevel[] = [
  {
    key: '1', code: 'LVL-001', levelName: 'Exceptional',
    minScore: 90, maxScore: 100,
    color: '#f59e0b', colorLabel: 'Gold',
    stars: 5,
    description: 'Outstanding performance that significantly exceeds all expectations. Consistently delivers results far beyond defined targets.',
  },
  {
    key: '2', code: 'LVL-002', levelName: 'Exceeds Expectations',
    minScore: 75, maxScore: 89,
    color: '#059669', colorLabel: 'Green',
    stars: 4,
    description: 'Performance consistently surpasses defined expectations across most KPI areas with demonstrably strong results.',
  },
  {
    key: '3', code: 'LVL-003', levelName: 'Meets Expectations',
    minScore: 60, maxScore: 74,
    color: '#2563eb', colorLabel: 'Blue',
    stars: 3,
    description: 'Performance meets all key requirements and expectations. Goals are achieved at the expected standard.',
  },
  {
    key: '4', code: 'LVL-004', levelName: 'Needs Improvement',
    minScore: 40, maxScore: 59,
    color: '#ea580c', colorLabel: 'Orange',
    stars: 2,
    description: 'Performance falls below expectations in some key areas. Improvement plan is recommended with supervisor support.',
  },
  {
    key: '5', code: 'LVL-005', levelName: 'Unsatisfactory',
    minScore: 0, maxScore: 39,
    color: '#dc2626', colorLabel: 'Red',
    stars: 1,
    description: 'Performance is significantly below the required standard. Immediate corrective action and a formal performance improvement plan are required.',
  },
];

const COLOR_OPTIONS = [
  { label: 'Gold',   value: '#f59e0b' },
  { label: 'Green',  value: '#059669' },
  { label: 'Blue',   value: '#2563eb' },
  { label: 'Orange', value: '#ea580c' },
  { label: 'Red',    value: '#dc2626' },
  { label: 'Purple', value: '#7c3aed' },
  { label: 'Teal',   value: '#0f766e' },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function AchievementLevelPage() {
  const [data, setData]           = useState<AchievementLevel[]>(INITIAL_DATA);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing]     = useState<AchievementLevel | null>(null);
  const [selectedColor, setSelectedColor] = useState('#f59e0b');
  const [form]                    = Form.useForm();

  const sortedData = useMemo(() =>
    [...data].sort((a, b) => b.minScore - a.minScore),
    [data]
  );

  const nextCode = () => {
    const max = data.reduce((acc, d) => {
      const n = parseInt(d.code.split('-')[1], 10);
      return n > acc ? n : acc;
    }, 0);
    return `LVL-${String(max + 1).padStart(3, '0')}`;
  };

  const openAdd = () => {
    setEditing(null);
    setSelectedColor('#0f766e');
    form.resetFields();
    form.setFieldsValue({ code: nextCode(), stars: 3 });
    setDrawerOpen(true);
  };

  const openEdit = (record: AchievementLevel) => {
    setEditing(record);
    setSelectedColor(record.color);
    form.setFieldsValue({ ...record });
    setDrawerOpen(true);
  };

  const handleSave = () => {
    form.validateFields().then(values => {
      const colorLabel = COLOR_OPTIONS.find(c => c.value === selectedColor)?.label ?? 'Custom';
      if (editing) {
        setData(prev => prev.map(d =>
          d.key === editing.key ? { ...d, ...values, color: selectedColor, colorLabel } : d
        ));
      } else {
        setData(prev => [...prev, {
          key: String(Date.now()),
          ...values,
          color: selectedColor,
          colorLabel,
        }]);
      }
      setDrawerOpen(false);
    });
  };

  const handleDelete = (record: AchievementLevel) => {
    confirm({
      title: 'Delete Achievement Level',
      icon: <ExclamationCircleOutlined style={{ color: '#dc2626' }} />,
      content: <span>Delete level <strong>{record.levelName}</strong>? This cannot be undone.</span>,
      okText: 'Delete', okType: 'danger', cancelText: 'Cancel',
      onOk() { setData(prev => prev.filter(d => d.key !== record.key)); },
    });
  };

  const columns: ColumnsType<AchievementLevel> = [
    {
      title: 'Level Code', dataIndex: 'code', key: 'code', width: 120,
      render: (v: string) => <Tag color="cyan" style={{ fontFamily: 'monospace', fontWeight: 600 }}>{v}</Tag>,
    },
    {
      title: 'Level Name', dataIndex: 'levelName', key: 'levelName',
      render: (v: string, r: AchievementLevel) => (
        <Space>
          <div style={{
            width: 12, height: 12, borderRadius: '50%',
            background: r.color, flexShrink: 0,
          }} />
          <Text strong style={{ fontSize: 14 }}>{v}</Text>
        </Space>
      ),
    },
    {
      title: 'Score Range', key: 'range', align: 'center', width: 150,
      render: (_: unknown, r: AchievementLevel) => (
        <Tag style={{
          background: r.color + '18', color: r.color,
          border: `1px solid ${r.color}44`, fontWeight: 700, fontSize: 13,
        }}>
          {r.minScore}% – {r.maxScore}%
        </Tag>
      ),
    },
    {
      title: 'Color', key: 'color', align: 'center', width: 110,
      render: (_: unknown, r: AchievementLevel) => (
        <Space>
          <div style={{
            width: 20, height: 20, borderRadius: 4,
            background: r.color, border: '2px solid #e2e8f0',
          }} />
          <Text style={{ fontSize: 13 }}>{r.colorLabel}</Text>
        </Space>
      ),
    },
    {
      title: 'Rating', dataIndex: 'stars', key: 'stars', align: 'center', width: 140,
      render: (v: number) => <Rate disabled defaultValue={v} style={{ fontSize: 15 }} />,
    },
    {
      title: 'Description', dataIndex: 'description', key: 'description',
      ellipsis: true,
      render: (v: string) => <Text type="secondary" style={{ fontSize: 13 }}>{v}</Text>,
    },
    {
      title: 'Actions', key: 'actions', align: 'center', width: 100,
      render: (_: unknown, record: AchievementLevel) => (
        <Space>
          <Tooltip title="Edit">
            <Button type="text" size="small" icon={<EditOutlined />}
              style={{ color: '#0f766e' }} onClick={() => openEdit(record)} />
          </Tooltip>
          <Tooltip title="Delete">
            <Button type="text" size="small" icon={<DeleteOutlined />}
              style={{ color: '#dc2626' }} onClick={() => handleDelete(record)} />
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
            <TrophyOutlined style={{ fontSize: 22, color: '#99f6e4' }} />
            <Title level={3} style={{ margin: 0, color: '#fff' }}>Achievement Level Setup</Title>
          </Space>
          <Text style={{ color: '#99f6e4', fontSize: 14 }}>
            Define performance achievement bands used to classify employee KPI scores
          </Text>
        </div>
        <Button
          type="primary" icon={<PlusOutlined />}
          onClick={openAdd}
          style={{ background: '#fff', color: '#0f766e', border: 'none', fontWeight: 600 }}
        >
          Add Level
        </Button>
      </div>

      {/* Legend cards */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {sortedData.map(level => (
          <div key={level.key} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', borderRadius: 8,
            background: level.color + '12',
            border: `1px solid ${level.color}44`,
            flex: '1 1 160px',
          }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: level.color }} />
            <div>
              <Text strong style={{ fontSize: 12, color: level.color, display: 'block' }}>{level.levelName}</Text>
              <Text style={{ fontSize: 11, color: '#64748b' }}>{level.minScore}–{level.maxScore}%</Text>
            </div>
            <Rate disabled defaultValue={level.stars} style={{ fontSize: 11, marginLeft: 'auto' }} />
          </div>
        ))}
      </div>

      {/* Table */}
      <Card style={{ border: '1px solid #d8e7e5', borderRadius: 12 }}>
        <Table
          columns={columns} dataSource={sortedData} rowKey="key" size="middle"
          pagination={false}
          onHeaderRow={() => ({ style: { background: '#eef8f7' } })}
        />
      </Card>

      {/* Add / Edit Drawer */}
      <Drawer
        title={
          <Space>
            <TrophyOutlined style={{ color: '#0f766e' }} />
            <span style={{ color: '#0f766e', fontWeight: 600 }}>
              {editing ? 'Edit Achievement Level' : 'Add Achievement Level'}
            </span>
          </Space>
        }
        open={drawerOpen} onClose={() => setDrawerOpen(false)} width={480}
        footer={
          <Space style={{ justifyContent: 'flex-end', display: 'flex' }}>
            <Button onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button type="primary" onClick={handleSave}
              style={{ background: '#0f766e', borderColor: '#0f766e' }}>
              {editing ? 'Save Changes' : 'Add Level'}
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item label={<Text strong>Level Code</Text>} name="code">
            <Input disabled style={{ background: '#f8fafc', fontFamily: 'monospace' }} />
          </Form.Item>
          <Form.Item label={<Text strong>Level Name</Text>} name="levelName"
            rules={[{ required: true, message: 'Level name is required' }]}>
            <Input placeholder="e.g. Exceptional" />
          </Form.Item>
          <div style={{ display: 'flex', gap: 12 }}>
            <Form.Item label={<Text strong>Min Score (%)</Text>} name="minScore"
              rules={[{ required: true, message: 'Required' }]} style={{ flex: 1 }}>
              <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="e.g. 90" />
            </Form.Item>
            <Form.Item label={<Text strong>Max Score (%)</Text>} name="maxScore"
              rules={[{ required: true, message: 'Required' }]} style={{ flex: 1 }}>
              <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="e.g. 100" />
            </Form.Item>
          </div>
          <Form.Item label={<Text strong>Color</Text>}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {COLOR_OPTIONS.map(c => (
                <Tooltip key={c.value} title={c.label}>
                  <div
                    onClick={() => setSelectedColor(c.value)}
                    style={{
                      width: 28, height: 28, borderRadius: 6, background: c.value,
                      cursor: 'pointer',
                      border: selectedColor === c.value ? '3px solid #334155' : '2px solid #e2e8f0',
                      transform: selectedColor === c.value ? 'scale(1.15)' : 'scale(1)',
                      transition: 'all 0.15s',
                    }}
                  />
                </Tooltip>
              ))}
            </div>
          </Form.Item>
          <Form.Item label={<Text strong>Rating Stars</Text>} name="stars">
            <Rate style={{ fontSize: 22 }} />
          </Form.Item>
          <Form.Item label={<Text strong>Description</Text>} name="description">
            <TextArea rows={4} placeholder="Describe what this achievement level means…" />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
