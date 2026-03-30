/**
 * SubKPISetupPage.tsx
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 * Performance Management â†’ Sub KPI Setup
 * List + full-page create/edit flow with designation-level configuration.
 */

import { useState, useMemo, useCallback } from 'react';
import {
  Table, Button, Input, Select, Tag, Space, Typography, Card, Radio,
  Divider, Form, InputNumber, Row, Col,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  SearchOutlined, ReloadOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
} from '@ant-design/icons';
import {
  INITIAL_SUB_KPIS,
  INITIAL_MAIN_KPI_AREAS,
  ALL_DESIGNATIONS,
  RESPONSIBLE_TO_OPTIONS,
  type SubKPI,
  type DesignationConfig,
  type ComparisonOperator,
  type KPICategory,
  type KPIEvalType,
  type MeasurementFrequency,
} from '../types/performance.types';

const { Title, Text } = Typography;
const { Option } = Select;

const OPERATORS: ComparisonOperator[] = ['>=', '<=', '>', '<', '='];
const OPERATOR_LABELS: Record<ComparisonOperator, string> = {
  '>=': 'â‰¥ (>=)',
  '<=': 'â‰¤ (<=)',
  '>':  '> (>)',
  '<':  '< (<)',
  '=':  '= (=)',
};
const FREQUENCIES: MeasurementFrequency[] = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Semi-Annual', 'Annual', 'Yearly'];

// â”€â”€ View â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type ViewMode = 'list' | 'create';

export default function SubKPISetupPage() {
  const [subKPIs, setSubKPIs] = useState<SubKPI[]>(INITIAL_SUB_KPIS);
  const [view, setView] = useState<ViewMode>('list');
  const [editingId, setEditingId] = useState<string | null>(null);

  // â”€â”€ list filters â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [searchQ, setSearchQ] = useState('');
  const [filterMainKPI, setFilterMainKPI] = useState<string>('all');
  const [filterDesig, setFilterDesig] = useState<string>('all');

  // â”€â”€ create/edit form state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [form] = Form.useForm();
  const [formCategory, setFormCategory]   = useState<KPICategory>('Manual');
  const [formEvalType, setFormEvalType]   = useState<KPIEvalType>('Evaluation');
  const [taggedDesigs, setTaggedDesigs]   = useState<string[]>([]);
  const [desigSearch, setDesigSearch]     = useState('');
  const [desigConfigs, setDesigConfigs]   = useState<Record<string, DesignationConfig>>({});

  // â”€â”€ derived list â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const listRows = useMemo(() =>
    subKPIs.filter(k => {
      const q = searchQ.trim().toLowerCase();
      const matchQ = !q || k.name.toLowerCase().includes(q) || k.code.toLowerCase().includes(q);
      const matchMain = filterMainKPI === 'all' || k.mainKPIAreaId === filterMainKPI;
      const matchDesig = filterDesig === 'all' || k.designationConfigs.some(c => c.designation === filterDesig);
      return matchQ && matchMain && matchDesig;
    }), [subKPIs, searchQ, filterMainKPI, filterDesig]);

  // â”€â”€ available designation list for picker â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const filteredDesigOptions = useMemo(() =>
    ALL_DESIGNATIONS.filter(d =>
      d.toLowerCase().includes(desigSearch.toLowerCase()) && !taggedDesigs.includes(d)
    ), [desigSearch, taggedDesigs]);

  // â”€â”€ tag a designation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const tagDesignation = (desig: string) => {
    setTaggedDesigs(prev => {
      if (prev.includes(desig)) return prev;
      return [...prev, desig];
    });
    setDesigConfigs(prev => ({
      ...prev,
      [desig]: prev[desig] ?? {
        designation: desig,
        weight: 0,
        operator: '>=',
        targetValue: 0,
        responsibleTo: 'Line Manager',
        frequency: 'Quarterly',
      },
    }));
    setDesigSearch('');
  };

  const untagDesignation = (desig: string) => {
    setTaggedDesigs(prev => prev.filter(d => d !== desig));
    setDesigConfigs(prev => {
      const copy = { ...prev };
      delete copy[desig];
      return copy;
    });
  };

  const updateDesigConfig = useCallback(<K extends keyof DesignationConfig>(
    desig: string, field: K, value: DesignationConfig[K]
  ) => {
    setDesigConfigs(prev => ({
      ...prev,
      [desig]: { ...prev[desig], [field]: value },
    }));
  }, []);

  // â”€â”€ reset form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const resetForm = () => {
    form.resetFields();
    setFormCategory('Manual');
    setFormEvalType('Evaluation');
    setTaggedDesigs([]);
    setDesigSearch('');
    setDesigConfigs({});
  };

  // â”€â”€ open create â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const openCreate = () => {
    setEditingId(null);
    resetForm();
    setView('create');
  };

  // â”€â”€ open edit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const openEdit = (record: SubKPI) => {
    setEditingId(record.id);
    resetForm();
    form.setFieldsValue({
      code: record.code,
      name: record.name,
      mainKPIAreaId: record.mainKPIAreaId,
      measurementCriteria: record.measurementCriteria,
    });
    setFormCategory(record.category);
    setFormEvalType(record.evalType);
    const desigs = record.designationConfigs.map(c => c.designation);
    setTaggedDesigs(desigs);
    const configMap: Record<string, DesignationConfig> = {};
    record.designationConfigs.forEach(c => { configMap[c.designation] = { ...c }; });
    setDesigConfigs(configMap);
    setView('create');
  };

  // â”€â”€ submit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleSubmit = async () => {
    const vals = await form.validateFields();
    const area = INITIAL_MAIN_KPI_AREAS.find(a => a.id === vals.mainKPIAreaId);
    const configs = taggedDesigs.map(d => desigConfigs[d]).filter(Boolean);

    const payload: SubKPI = {
      id: editingId ?? `skpi-${Date.now()}`,
      code: String(vals.code).trim().toUpperCase(),
      name: String(vals.name).trim(),
      mainKPIAreaId: vals.mainKPIAreaId,
      mainKPIAreaName: area?.name ?? '',
      mainKPICode: area?.code ?? '',
      measurementCriteria: String(vals.measurementCriteria ?? '').trim(),
      category: formCategory,
      evalType: formEvalType,
      designationConfigs: configs,
      type: 'Quantitative',
      unit: '%',
      weight: configs.reduce((s, c) => s + (c.weight ?? 0), 0),
      targetValue: configs[0]?.targetValue ?? 0,
      minValue: 0,
      maxValue: 100,
      measurementFrequency: 'Quarterly',
      formula: '',
      description: '',
      isActive: true,
    };

    if (editingId) {
      setSubKPIs(prev => prev.map(k => k.id === editingId ? payload : k));
    } else {
      setSubKPIs(prev => [payload, ...prev]);
    }

    setView('list');
    resetForm();
  };

  const handleDelete = (id: string) => setSubKPIs(prev => prev.filter(k => k.id !== id));

  // â”€â”€ list columns â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const columns: ColumnsType<SubKPI> = [
    {
      title: <span style={{ fontSize: 11, letterSpacing: 1 }}>SUB KPI</span>,
      dataIndex: 'name',
      width: 220,
      render: (name: string) => <Text strong style={{ fontSize: 13 }}>{name}</Text>,
    },
    {
      title: <span style={{ fontSize: 11, letterSpacing: 1 }}>MAIN KPI</span>,
      dataIndex: 'mainKPICode',
      width: 210,
      render: (code: string, row) => (
        <div>
          <Tag
            style={{
              fontFamily: 'monospace', fontWeight: 700,
              color: '#0f766e', borderColor: '#8dd3c8', background: '#e6f7f4',
              fontSize: 11, marginBottom: 2,
            }}
          >
            {code || row.mainKPICode}
          </Tag>
          <div>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {row.mainKPIAreaName.length > 28 ? `${row.mainKPIAreaName.slice(0, 28)}â€¦` : row.mainKPIAreaName}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: <span style={{ fontSize: 11, letterSpacing: 1 }}>MEASUREMENT CRITERIA</span>,
      dataIndex: 'measurementCriteria',
      width: 230,
      render: (v: string) => <Text style={{ color: '#6b7280', fontSize: 12 }}>{v}</Text>,
    },
    {
      title: <span style={{ fontSize: 11, letterSpacing: 1 }}>DESIGNATIONS & CONFIG</span>,
      dataIndex: 'designationConfigs',
      render: (configs: DesignationConfig[]) => (
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          {configs.map(cfg => (
            <Space key={cfg.designation} size={4} wrap={false} style={{ alignItems: 'center' }}>
              <Tag
                style={{
                  borderRadius: 999, paddingInline: 10, fontSize: 11,
                  borderColor: '#9ddfd4', color: '#0f766e', background: '#eaf9f6',
                  marginInlineEnd: 0, whiteSpace: 'nowrap',
                }}
              >
                {cfg.designation}
              </Tag>
              <Tag
                style={{
                  borderRadius: 4, fontSize: 11, fontWeight: 700,
                  borderColor: '#9ddfd4', color: '#0f766e', background: '#eaf9f6',
                  marginInlineEnd: 0,
                }}
              >
                {cfg.weight}%
              </Tag>
              <Tag
                style={{
                  borderRadius: 4, fontSize: 11,
                  borderColor: '#e5e7eb', color: '#374151', background: '#f9fafb',
                  paddingInline: 6, marginInlineEnd: 0,
                }}
              >
                {cfg.operator}
              </Tag>
              <Text style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap' }}>
                {cfg.operator}{cfg.targetValue}%
              </Text>
            </Space>
          ))}
        </Space>
      ),
    },
    {
      title: <span style={{ fontSize: 11, letterSpacing: 1 }}>ACTIONS</span>,
      width: 130,
      render: (_: unknown, record: SubKPI) => (
        <Space size={6}>
          <Button
            size="small"
            icon={<EditOutlined style={{ color: '#f97316' }} />}
            onClick={() => openEdit(record)}
            style={{ borderColor: '#a7e3d9', color: '#0f766e' }}
          >
            Edit
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            style={{ borderColor: '#f2c4c4', color: '#dc2626', background: '#fff5f5' }}
          />
        </Space>
      ),
    },
  ];

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // LIST VIEW
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  if (view === 'list') {
    return (
      <div style={{ padding: '16px 20px', background: '#eef5f4', minHeight: '100%' }}>
        <div style={{ marginBottom: 14 }}>
          <Title level={3} style={{ margin: 0, color: '#1f2937' }}>
            Sub KPI Setup
            <Text style={{ marginLeft: 10, color: '#0f766e', fontSize: 22, fontWeight: 500 }}>
              Manage &amp; Configure
            </Text>
          </Title>
        </div>

        <Card bordered={false} style={{ borderRadius: 16, background: '#f7fbfa' }}>
          {/* â”€â”€ toolbar â”€â”€ */}
          <div
            style={{
              display: 'flex', gap: 10, alignItems: 'center',
              marginBottom: 14, flexWrap: 'wrap', justifyContent: 'space-between',
            }}
          >
            <Space size={8} wrap>
              <Input
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder="Search sub KPIs..."
                prefix={<SearchOutlined style={{ color: '#64748b' }} />}
                style={{ width: 280, borderRadius: 10, borderColor: '#a7e3d9' }}
              />
              <Select
                value={filterMainKPI}
                onChange={setFilterMainKPI}
                style={{ width: 200, borderRadius: 10 }}
              >
                <Option value="all">All Main KPIs</Option>
                {INITIAL_MAIN_KPI_AREAS.map(a => (
                  <Option key={a.id} value={a.id}>{a.code} â€” {a.name.slice(0, 22)}{a.name.length > 22 ? 'â€¦' : ''}</Option>
                ))}
              </Select>
              <Select
                value={filterDesig}
                onChange={setFilterDesig}
                style={{ width: 180, borderRadius: 10 }}
              >
                <Option value="all">All Designations</Option>
                {ALL_DESIGNATIONS.map(d => <Option key={d} value={d}>{d}</Option>)}
              </Select>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                style={{ borderRadius: 10 }}
                onClick={() => undefined}
              >
                Search
              </Button>
              <Button
                icon={<ReloadOutlined />}
                style={{ borderRadius: 10, borderColor: '#c7ddda', color: '#94a3b8' }}
                onClick={() => { setSearchQ(''); setFilterMainKPI('all'); setFilterDesig('all'); }}
              >
                Reset
              </Button>
            </Space>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreate}
              style={{ borderRadius: 12, paddingInline: 18 }}
            >
              + Create Sub KPI
            </Button>
          </div>

          <Table
            dataSource={listRows}
            columns={columns}
            rowKey="id"
            size="small"
            pagination={{ pageSize: 10, showSizeChanger: false, hideOnSinglePage: true }}
            scroll={{ x: 1100 }}
          />
        </Card>
      </div>
    );
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // CREATE / EDIT VIEW (full page)
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  return (
    <div style={{ padding: '16px 20px', background: '#eef5f4', minHeight: '100%' }}>
      <div style={{ marginBottom: 18 }}>
        <Title level={3} style={{ margin: 0, color: '#1f2937' }}>
          {editingId ? 'Edit Sub KPI' : 'Create Sub KPI'}
        </Title>
      </div>

      <Form form={form} layout="vertical" requiredMark={false}>

        {/* â”€â”€ Section 1: Basic Information â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <Card
          bordered={false}
          style={{ borderRadius: 16, marginBottom: 16, background: '#fff' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 16 }}>ðŸ“‹</span>
            <Text strong style={{ fontSize: 15 }}>Basic Information</Text>
          </div>

          {/* KPI evaluation type (radio) */}
          <Form.Item style={{ marginBottom: 14 }}>
            <Radio.Group
              value={formEvalType}
              onChange={e => setFormEvalType(e.target.value as KPIEvalType)}
              buttonStyle="solid"
            >
              <Radio.Button value="Confirmation KPI">Confirmation KPI</Radio.Button>
              <Radio.Button value="Evaluation">Evaluation</Radio.Button>
            </Radio.Group>
          </Form.Item>

          {/* Sub KPI Name */}
          <Form.Item
            name="name"
            label={<Text style={{ letterSpacing: 1, fontSize: 12, color: '#0f766e' }}>SUB KPI NAME</Text>}
            rules={[{ required: true, message: 'Sub KPI name is required' }]}
            style={{ marginBottom: 14 }}
          >
            <Input
              placeholder="e.g. Recruitment Efficiency Score"
              style={{ borderRadius: 10, borderColor: '#a7e3d9' }}
            />
          </Form.Item>

          <Row gutter={16}>
            {/* KPI Code */}
            <Col span={8}>
              <Form.Item
                name="code"
                label={<Text style={{ letterSpacing: 1, fontSize: 12, color: '#0f766e' }}>KPI CODE</Text>}
                rules={[{ required: true, message: 'KPI code is required' }]}
              >
                <Input
                  placeholder="e.g. MK-01-05"
                  maxLength={20}
                  style={{ borderRadius: 10, borderColor: '#a7e3d9', textTransform: 'uppercase' }}
                />
              </Form.Item>
            </Col>

            {/* Main KPI Area */}
            <Col span={8}>
              <Form.Item
                name="mainKPIAreaId"
                label={<Text style={{ letterSpacing: 1, fontSize: 12, color: '#0f766e' }}>MAIN KPI AREA</Text>}
                rules={[{ required: true, message: 'Main KPI area is required' }]}
              >
                <Select placeholder="MK-01 â€” 1. Strategic HR & Organizational Development" style={{ borderRadius: 10 }}>
                  {INITIAL_MAIN_KPI_AREAS.map(a => (
                    <Option key={a.id} value={a.id}>
                      {a.code} â€” {a.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            {/* Measurement Criteria */}
            <Col span={8}>
              <Form.Item
                name="measurementCriteria"
                label={<Text style={{ letterSpacing: 1, fontSize: 12, color: '#0f766e' }}>MEASUREMENT CRITERIA</Text>}
              >
                <Input
                  placeholder="How this KPI is measured..."
                  style={{ borderRadius: 10, borderColor: '#a7e3d9' }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* â”€â”€ Section 2: Tag Designations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <Card
          bordered={false}
          style={{ borderRadius: 16, marginBottom: 16, background: '#fff' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 16 }}>ðŸ·ï¸</span>
            <Text strong style={{ fontSize: 15 }}>Tag Designations</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>Search and select</Text>
          </div>

          {/* Category radio (before tagging) */}
          <Form.Item style={{ marginBottom: 14 }}>
            <Radio.Group
              value={formCategory}
              onChange={e => setFormCategory(e.target.value as KPICategory)}
            >
              <Radio value="Leave">Leave</Radio>
              <Radio value="Attendance">Attendance</Radio>
              <Radio value="Manual">Manual</Radio>
            </Radio.Group>
          </Form.Item>

          <Row gutter={16} align="middle">
            <Col span={8}>
              <Select
                showSearch
                value={null}
                placeholder="Search designation..."
                filterOption={false}
                onSearch={setDesigSearch}
                onSelect={(val) => { if (val) tagDesignation(val); }}
                style={{ width: '100%', borderRadius: 10 }}
                notFoundContent={<Text type="secondary" style={{ fontSize: 12 }}>No match</Text>}
              >
                {filteredDesigOptions.map(d => (
                  <Option key={d} value={d}>{d}</Option>
                ))}
              </Select>
            </Col>

            <Col span={16}>
              <div>
                <Text type="secondary" style={{ fontSize: 11, marginRight: 8 }}>TAGGED</Text>
                <Space size={6} wrap>
                  {taggedDesigs.map(d => (
                    <Tag
                      key={d}
                      closable
                      onClose={() => untagDesignation(d)}
                      style={{
                        borderRadius: 999, paddingInline: 12,
                        borderColor: '#9ddfd4', color: '#0f766e', background: '#eaf9f6',
                      }}
                    >
                      {d}
                    </Tag>
                  ))}
                  {taggedDesigs.length === 0 && (
                    <Text type="secondary" style={{ fontSize: 12 }}>No designations tagged yet</Text>
                  )}
                </Space>
              </div>
            </Col>
          </Row>
        </Card>

        {/* â”€â”€ Section 3: Per-Designation Configuration â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {taggedDesigs.length > 0 && (
          <Card
            bordered={false}
            style={{ borderRadius: 16, marginBottom: 16, background: '#fff' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 16 }}>âš™ï¸</span>
              <Text strong style={{ fontSize: 15 }}>Per-Designation Configuration</Text>
            </div>

            {/* Table header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '160px 110px 140px 130px 160px 160px',
                gap: 10,
                padding: '8px 10px',
                background: '#eef8f6',
                borderRadius: 8,
                marginBottom: 8,
              }}
            >
              {['DESIGNATION', 'WEIGHT (%)', 'OPERATOR', 'TARGET VALUE', 'RESPONSIBLE TO', 'FREQUENCY'].map(h => (
                <Text key={h} style={{ fontSize: 10, fontWeight: 700, color: '#374151', letterSpacing: 0.8 }}>
                  {h}
                </Text>
              ))}
            </div>

            {taggedDesigs.map(desig => {
              const cfg = desigConfigs[desig] ?? {
                designation: desig, weight: 0, operator: '>=' as ComparisonOperator,
                targetValue: 0, responsibleTo: 'Line Manager', frequency: 'Quarterly' as MeasurementFrequency,
              };
              return (
                <div
                  key={desig}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '160px 110px 140px 130px 160px 160px',
                    gap: 10,
                    alignItems: 'center',
                    padding: '8px 10px',
                    borderBottom: '1px solid #f0f4f3',
                  }}
                >
                  {/* Designation tag */}
                  <Tag
                    style={{
                      borderRadius: 999, paddingInline: 10, fontSize: 11,
                      borderColor: '#9ddfd4', color: '#0f766e', background: '#eaf9f6',
                      margin: 0,
                    }}
                  >
                    {desig}
                  </Tag>

                  {/* Weight */}
                  <InputNumber
                    min={0} max={100} value={cfg.weight}
                    onChange={v => updateDesigConfig(desig, 'weight', v ?? 0)}
                    style={{ width: '100%', borderColor: '#a7e3d9', borderRadius: 8 }}
                    placeholder="5"
                  />

                  {/* Operator */}
                  <Select
                    value={cfg.operator}
                    onChange={v => updateDesigConfig(desig, 'operator', v as ComparisonOperator)}
                    style={{ width: '100%' }}
                  >
                    {OPERATORS.map(op => (
                      <Option key={op} value={op}>{OPERATOR_LABELS[op]}</Option>
                    ))}
                  </Select>

                  {/* Target Value */}
                  <InputNumber
                    min={0} max={10000} value={cfg.targetValue}
                    onChange={v => updateDesigConfig(desig, 'targetValue', v ?? 0)}
                    style={{ width: '100%', borderColor: '#a7e3d9', borderRadius: 8 }}
                    placeholder="90"
                    addonAfter="%"
                  />

                  {/* Responsible To */}
                  <Select
                    showSearch
                    value={cfg.responsibleTo}
                    placeholder="Responsible to..."
                    onChange={v => updateDesigConfig(desig, 'responsibleTo', v)}
                    style={{ width: '100%' }}
                    filterOption={(input, opt) =>
                      String(opt?.children ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {RESPONSIBLE_TO_OPTIONS.map(r => (
                      <Option key={r} value={r}>{r}</Option>
                    ))}
                  </Select>

                  {/* Frequency */}
                  <Select
                    value={cfg.frequency}
                    onChange={v => updateDesigConfig(desig, 'frequency', v as MeasurementFrequency)}
                    style={{ width: '100%' }}
                  >
                    {FREQUENCIES.map(f => <Option key={f} value={f}>{f}</Option>)}
                  </Select>
                </div>
              );
            })}
          </Card>
        )}

        {/* â”€â”€ Footer buttons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <Divider style={{ margin: '8px 0 16px' }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <Button
            onClick={() => { setView('list'); resetForm(); }}
            style={{ borderRadius: 12, borderColor: '#a7e3d9', color: '#0f766e', paddingInline: 22 }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleSubmit}
            style={{ borderRadius: 12, paddingInline: 22 }}
          >
            {editingId ? 'Update Sub KPI' : 'Create Sub KPI'}
          </Button>
        </div>

      </Form>
    </div>
  );
}
