/**
 * SubKPISetupPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Performance Management -> Sub KPI Setup
 * List + full-page create/edit flow with designation-level configuration.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Table, Button, Input, Select, Tag, Space, Typography, Card, Radio,
  Divider, Form, InputNumber, Row, Col,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  SearchOutlined, ReloadOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
  FileTextOutlined, TagsOutlined, SettingOutlined,
} from '@ant-design/icons';
import {
  INITIAL_SUB_KPIS,
  INITIAL_MAIN_KPI_AREAS,
  MOCK_EMPLOYEES,
  DEPT_SECTION_DESIG_MAP,
  type SubKPI,
  type DesignationConfig,
  type ComparisonOperator,
  type KPICategory,
  type KPIEvalType,
  type MeasurementFrequency,
  type LeaveType,
  type DisciplinaryType,
} from '../types/performance.types';

const { Title, Text } = Typography;
const { Option } = Select;

const OPERATORS: ComparisonOperator[] = ['>=', '<=', '>', '<', '='];
const OPERATOR_LABELS: Record<ComparisonOperator, string> = {
  '>=': '>= (>=)',
  '<=': '<= (<=)',
  '>':  '> (>)',
  '<':  '< (<)',
  '=':  '= (=)',
};
const FREQUENCIES: MeasurementFrequency[] = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'];
const LEAVE_TYPES: LeaveType[] = ['All', 'Sick Leave', 'Casual Leave', 'Earned Leave'];
const DISCIPLINARY_TYPES: DisciplinaryType[] = ['Show Cause', 'Warning'];

// Fixed "Responsible To" options + searchable employees
const MOCK_EMPLOYEES_LIST = MOCK_EMPLOYEES;

// Categories where "Responsible To" is hidden
const HIDE_RESPONSIBLE_TO: KPICategory[] = ['Leave', 'Attendance', 'Disciplinary Ground'];
// Categories where target value unit is "Count" instead of "%"
const COUNT_UNIT_CATEGORIES: KPICategory[] = ['Disciplinary Ground'];

type ViewMode = 'list' | 'create';

export default function SubKPISetupPage() {
  const location = useLocation();
  const [subKPIs, setSubKPIs] = useState<SubKPI[]>(INITIAL_SUB_KPIS);
  const [view, setView] = useState<ViewMode>('list');
  const [editingId, setEditingId] = useState<string | null>(null);

  // ── list filters ──────────────────────────────────────────────────────────────
  const [searchQ, setSearchQ] = useState('');
  const [filterMainKPI, setFilterMainKPI] = useState<string>('all');
  const [filterDesig, setFilterDesig] = useState<string>('all');

  // ── create/edit form state ────────────────────────────────────────────────────
  const [form] = Form.useForm();
  const [formCategory, setFormCategory]         = useState<KPICategory>('Manual');
  const [formEvalType, setFormEvalType]         = useState<KPIEvalType>('Evaluation');
  const [formLeaveType, setFormLeaveType]       = useState<LeaveType>('All');
  const [formDisciplinaryType, setFormDisciplinaryType] = useState<DisciplinaryType>('Show Cause');

  // Tagged designations stored as composite keys "dept||section||desig"
  const [taggedKeys, setTaggedKeys]   = useState<string[]>([]);
  const [desigConfigs, setDesigConfigs] = useState<Record<string, DesignationConfig>>({});

  // Cascading designation picker state
  const [pickDept,    setPickDept]    = useState('');
  const [pickSection, setPickSection] = useState('');
  const [pickDesig,   setPickDesig]   = useState('');

  // Derived flags
  const showResponsibleTo = !HIDE_RESPONSIBLE_TO.includes(formCategory);
  const useCountUnit = COUNT_UNIT_CATEGORIES.includes(formCategory);
  const showFrequency = formEvalType === 'Evaluation';
  const singleResponsibleForEval = formEvalType === 'Evaluation';

  // ── Cascading picker options ──────────────────────────────────────────────────
  const allDepts = useMemo(
    () => [...new Set(DEPT_SECTION_DESIG_MAP.map(m => m.department))],
    []
  );
  const sectionsForDept = useMemo(
    () => DEPT_SECTION_DESIG_MAP.filter(m => m.department === pickDept).map(m => m.section),
    [pickDept]
  );
  const desigsForSection = useMemo(() => {
    const entry = DEPT_SECTION_DESIG_MAP.find(m => m.department === pickDept && m.section === pickSection);
    const alreadyTagged = new Set(taggedKeys.map(k => k.split('||')[2]));
    return (entry?.designations ?? []).filter(d => !alreadyTagged.has(d));
  }, [pickDept, pickSection, taggedKeys]);

  // ── derived list ──────────────────────────────────────────────────────────────
  const listRows = useMemo(() =>
    subKPIs.filter(k => {
      const q = searchQ.trim().toLowerCase();
      const matchQ = !q || k.name.toLowerCase().includes(q) || k.code.toLowerCase().includes(q);
      const matchMain = filterMainKPI === 'all' || k.mainKPIAreaId === filterMainKPI;
      const matchDesig = filterDesig === 'all' || k.designationConfigs.some(c => c.designation === filterDesig);
      return matchQ && matchMain && matchDesig;
    }), [subKPIs, searchQ, filterMainKPI, filterDesig]);

  // ── tag / untag a designation ─────────────────────────────────────────────────
  const tagDesignation = () => {
    if (!pickDesig) return;
    const key = `${pickDept}||${pickSection}||${pickDesig}`;
    if (taggedKeys.includes(key)) return;
    setTaggedKeys(prev => [...prev, key]);
    setDesigConfigs(prev => ({
      ...prev,
      [key]: {
        designation: pickDesig,
        department: pickDept,
        section: pickSection,
        weight: 0,
        operator: '>=',
        targetValue: 0,
        responsibleTo: ['Line Manager'],
        frequency: 'Quarterly',
      },
    }));
    // reset picker
    setPickDept(''); setPickSection(''); setPickDesig('');
  };

  const untagDesignation = (key: string) => {
    setTaggedKeys(prev => prev.filter(k => k !== key));
    setDesigConfigs(prev => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const updateDesigConfig = useCallback(<K extends keyof DesignationConfig>(
    key: string, field: K, value: DesignationConfig[K]
  ) => {
    setDesigConfigs(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  }, []);

  // ── reset form ────────────────────────────────────────────────────────────────
  const resetForm = () => {
    form.resetFields();
    setFormCategory('Manual');
    setFormEvalType('Evaluation');
    setFormLeaveType('All');
    setFormDisciplinaryType('Show Cause');
    setTaggedKeys([]);
    setDesigConfigs({});
    setPickDept(''); setPickSection(''); setPickDesig('');
  };

  const openCreate = () => { setEditingId(null); resetForm(); setView('create'); };

  const openEdit = (record: SubKPI) => {
    setEditingId(record.id);
    resetForm();
    form.setFieldsValue({
      code: record.code,
      name: record.name,
      mainKPIAreaId: record.mainKPIAreaId,
      measurementCriteria: record.measurementCriteria,
      markOutOf: record.markOutOf,
    });
    setFormCategory(record.category);
    setFormEvalType(record.evalType);
    if (record.leaveType) setFormLeaveType(record.leaveType);
    if (record.disciplinaryType) setFormDisciplinaryType(record.disciplinaryType);
    // Rebuild keyed configs from saved designation configs
    const keys: string[] = [];
    const configMap: Record<string, DesignationConfig> = {};
    record.designationConfigs.forEach(c => {
      const key = `${c.department ?? ''}||${c.section ?? ''}||${c.designation}`;
      keys.push(key);
      configMap[key] = { ...c };
    });
    setTaggedKeys(keys);
    setDesigConfigs(configMap);
    setView('create');
  };

  const handleSubmit = async () => {
    const vals = await form.validateFields();
    const area = INITIAL_MAIN_KPI_AREAS.find(a => a.id === vals.mainKPIAreaId);
    const configs = taggedKeys.map(k => desigConfigs[k]).filter(Boolean);

    const payload: SubKPI = {
      id: editingId ?? `skpi-${Date.now()}`,
      code: String(vals.code).trim().toUpperCase(),
      name: String(vals.name).trim(),
      mainKPIAreaId: vals.mainKPIAreaId,
      mainKPIAreaName: area?.name ?? '',
      mainKPICode: area?.code ?? '',
      measurementCriteria: String(vals.measurementCriteria ?? '').trim(),
      markOutOf: vals.markOutOf ?? undefined,
      category: formCategory,
      leaveType: formCategory === 'Leave' ? formLeaveType : undefined,
      disciplinaryType: formCategory === 'Disciplinary Ground' ? formDisciplinaryType : undefined,
      evalType: formEvalType,
      designationConfigs: configs,
      type: 'Quantitative',
      unit: useCountUnit ? 'Count' : '%',
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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('openFrom') !== 'designation-matrix') return;
    const mode = params.get('mode');
    if (mode !== 'create' && mode !== 'edit') return;

    if (mode === 'edit') {
      const subKPIId = params.get('subKPIId');
      if (subKPIId) {
        const existing = subKPIs.find(k => k.id === subKPIId);
        if (existing) {
          openEdit(existing);
          return;
        }
      }
    }

    resetForm();
    setEditingId(null);
    setView('create');

    const evalTypeRaw = params.get('evalType') as KPIEvalType | null;
    const evalType = evalTypeRaw === 'Evaluation' || evalTypeRaw === 'Appraisal' || evalTypeRaw === 'Confirmation KPI'
      ? evalTypeRaw
      : 'Evaluation';
    setFormEvalType(evalType);

    const mainKPIAreaId = params.get('mainKPIAreaId');
    const name = params.get('subKPIName');
    const measurementCriteria = params.get('measurementCriteria');
    const category = params.get('category') as KPICategory | null;
    const operatorRaw = params.get('operator') as ComparisonOperator | null;
    const targetRaw = params.get('target');
    const weightRaw = params.get('weight');
    const responsible = params.get('responsible');

    form.setFieldsValue({
      name: name ?? undefined,
      measurementCriteria: measurementCriteria ?? undefined,
    });

    if (mainKPIAreaId) {
      form.setFieldValue('mainKPIAreaId', mainKPIAreaId);
    }

    if (category === 'Leave' || category === 'Attendance' || category === 'Manual' || category === 'Disciplinary Ground') {
      setFormCategory(category);
    }

    const department = params.get('department');
    const section = params.get('section');
    const designation = params.get('designation');

    if (department && section && designation) {
      const parsedTarget = targetRaw ? Number(targetRaw) : 0;
      const parsedWeight = weightRaw ? Number(weightRaw) : 0;
      const parsedOperator = operatorRaw && ['>=', '<=', '>', '<', '='].includes(operatorRaw) ? operatorRaw : '>=';
      const key = `${department}||${section}||${designation}`;
      setTaggedKeys([key]);
      setDesigConfigs({
        [key]: {
          designation,
          department,
          section,
          weight: Number.isFinite(parsedWeight) ? parsedWeight : 0,
          operator: parsedOperator,
          targetValue: Number.isFinite(parsedTarget) ? parsedTarget : 0,
          responsibleTo: [responsible || 'Line Manager'],
          frequency: 'Quarterly',
        },
      });
    }
  }, [location.search]);

  // ── list columns ──────────────────────────────────────────────────────────────
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
          <Tag style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-primary)', borderColor: '#8dd3c8', background: 'var(--color-primary-tint)', fontSize: 11, marginBottom: 2 }}>
            {code || row.mainKPICode}
          </Tag>
          <div>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {row.mainKPIAreaName.length > 28 ? `${row.mainKPIAreaName.slice(0, 28)}...` : row.mainKPIAreaName}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: <span style={{ fontSize: 11, letterSpacing: 1 }}>CATEGORY</span>,
      dataIndex: 'category',
      width: 160,
      render: (cat: KPICategory, row) => (
        <div>
          <Tag color={cat === 'Leave' ? 'blue' : cat === 'Attendance' ? 'green' : cat === 'Disciplinary Ground' ? 'red' : 'orange'} style={{ fontSize: 11 }}>
            {cat}
          </Tag>
          {row.leaveType && <div><Text type="secondary" style={{ fontSize: 11 }}>{row.leaveType}</Text></div>}
          {row.disciplinaryType && <div><Text type="secondary" style={{ fontSize: 11 }}>{row.disciplinaryType}</Text></div>}
        </div>
      ),
    },
    {
      title: <span style={{ fontSize: 11, letterSpacing: 1 }}>DESIGNATIONS & CONFIG</span>,
      dataIndex: 'designationConfigs',
      render: (configs: DesignationConfig[]) => (
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          {configs.map(cfg => (
            <Space key={cfg.designation} size={4} wrap={false} style={{ alignItems: 'center' }}>
              <Tag style={{ borderRadius: 999, paddingInline: 10, fontSize: 11, borderColor: '#9ddfd4', color: 'var(--color-primary)', background: 'var(--color-primary-tint)', marginInlineEnd: 0, whiteSpace: 'nowrap' }}>
                {cfg.designation}
              </Tag>
              <Tag style={{ borderRadius: 4, fontSize: 11, fontWeight: 700, borderColor: '#9ddfd4', color: 'var(--color-primary)', background: 'var(--color-primary-tint)', marginInlineEnd: 0 }}>
                {cfg.weight}%
              </Tag>
              <Tag style={{ borderRadius: 4, fontSize: 11, borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)', background: 'var(--color-bg-subtle)', paddingInline: 6, marginInlineEnd: 0 }}>
                {cfg.operator}
              </Tag>
              <Text style={{ fontSize: 11, color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>
                {cfg.operator}{cfg.targetValue}
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
          <Button size="small" icon={<EditOutlined style={{ color: '#f97316' }} />} onClick={() => openEdit(record)} style={{ borderColor: 'var(--color-border)', color: 'var(--color-primary)' }}>Edit</Button>
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} style={{ borderColor: '#f2c4c4', color: '#dc2626', background: 'var(--color-status-rejected-bg)' }} />
        </Space>
      ),
    },
  ];

  // ══════════════════════════════════════════════════════════════════════════════
  // LIST VIEW
  // ══════════════════════════════════════════════════════════════════════════════
  if (view === 'list') {
    return (
      <div style={{ padding: '16px 20px', background: 'var(--color-bg-subtle)', minHeight: '100%', height: '100%', overflowY: 'auto' }}>
        <div style={{ marginBottom: 14 }}>
          <Title level={3} style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
            Sub KPI Setup
            <Text style={{ marginLeft: 10, color: 'var(--color-primary)', fontSize: 22, fontWeight: 500 }}>Manage &amp; Configure</Text>
          </Title>
        </div>
        <Card bordered={false} style={{ borderRadius: 16, background: 'var(--color-bg-subtle)' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <Space size={8} wrap>
              <Input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search sub KPIs..." prefix={<SearchOutlined style={{ color: 'var(--color-text-tertiary)' }} />} style={{ width: 280, borderRadius: 10, borderColor: 'var(--color-border)' }} />
              <Select value={filterMainKPI} onChange={setFilterMainKPI} style={{ width: 200 }}>
                <Option value="all">All Main KPIs</Option>
                {INITIAL_MAIN_KPI_AREAS.map(a => (
                  <Option key={a.id} value={a.id}>{a.code} - {a.name.slice(0, 22)}{a.name.length > 22 ? '...' : ''}</Option>
                ))}
              </Select>
              <Select value={filterDesig} onChange={setFilterDesig} style={{ width: 180 }}>
                <Option value="all">All Designations</Option>
                {[...new Set(DEPT_SECTION_DESIG_MAP.flatMap(m => m.designations))].map(d => <Option key={d} value={d}>{d}</Option>)}
              </Select>
              <Button type="primary" icon={<SearchOutlined />} style={{ borderRadius: 10 }} onClick={() => undefined}>Search</Button>
              <Button icon={<ReloadOutlined />} style={{ borderRadius: 10, borderColor: '#c7ddda', color: 'var(--color-text-tertiary)' }} onClick={() => { setSearchQ(''); setFilterMainKPI('all'); setFilterDesig('all'); }}>Reset</Button>
            </Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{ borderRadius: 12, paddingInline: 18 }}>+ Create Sub KPI</Button>
          </div>
          <Table
            dataSource={listRows}
            columns={columns}
            rowKey="id"
            size="small"
            pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: [10, 20, 30], hideOnSinglePage: true }}
            scroll={{ x: 1100, y: 500 }}
          />
        </Card>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // CREATE / EDIT VIEW
  // ══════════════════════════════════════════════════════════════════════════════

  // Grid columns adjust based on whether Responsible To and Frequency are visible
  const computedGridCols = (() => {
    const cols = ['200px', '110px', '130px'];
    if (showResponsibleTo) { cols.push('130px'); cols.push('220px'); } else { cols.push('200px'); }
    if (showFrequency) cols.push('150px');
    return cols.join(' ');
  })();
  const computedGridHeaders = [
    'DESIGNATION', 'WEIGHT (%)', 'OPERATOR', 'TARGET VALUE',
    ...(showResponsibleTo ? ['RESPONSIBLE TO'] : []),
    ...(showFrequency ? ['FREQUENCY'] : []),
  ];

  return (
    <div style={{ padding: '16px 20px', background: 'var(--color-bg-subtle)', minHeight: '100%', height: '100%', overflowY: 'auto' }}>
      <div style={{ marginBottom: 18 }}>
        <Title level={3} style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
          {editingId ? 'Edit Sub KPI' : 'Create Sub KPI'}
        </Title>
      </div>

      <Form form={form} layout="vertical" requiredMark={false}>

        {/* ── Section 1: Basic Information ───────────────────────────────────── */}
        <Card bordered={false} style={{ borderRadius: 16, marginBottom: 16, background: 'var(--color-bg-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <FileTextOutlined style={{ fontSize: 16, color: 'var(--color-primary)' }} />
            <Text strong style={{ fontSize: 15 }}>Basic Information</Text>
          </div>

          <Form.Item style={{ marginBottom: 14 }}>
            <Radio.Group value={formEvalType} onChange={e => setFormEvalType(e.target.value as KPIEvalType)} buttonStyle="solid">
              <Radio.Button value="Confirmation KPI">Confirmation KPI</Radio.Button>
              <Radio.Button value="Evaluation">Evaluation</Radio.Button>
              <Radio.Button value="Appraisal">Appraisal</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="name"
            label={<Text style={{ letterSpacing: 1, fontSize: 12, color: 'var(--color-primary)' }}>SUB KPI NAME</Text>}
            rules={[{ required: true, message: 'Sub KPI name is required' }]}
            style={{ marginBottom: 14 }}
          >
            <Input placeholder="e.g. Recruitment Efficiency Score" style={{ borderRadius: 10, borderColor: 'var(--color-border)' }} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="code" label={<Text style={{ letterSpacing: 1, fontSize: 12, color: 'var(--color-primary)' }}>KPI CODE</Text>} rules={[{ required: true, message: 'KPI code is required' }]}>
                <Input placeholder="e.g. MK-01-05" maxLength={20} style={{ borderRadius: 10, borderColor: 'var(--color-border)', textTransform: 'uppercase' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="mainKPIAreaId" label={<Text style={{ letterSpacing: 1, fontSize: 12, color: 'var(--color-primary)' }}>MAIN KPI AREA</Text>} rules={[{ required: true, message: 'Main KPI area is required' }]}>
                <Select placeholder="Select Main KPI Area">
                  {INITIAL_MAIN_KPI_AREAS.map(a => (
                    <Option key={a.id} value={a.id}>{a.code} - {a.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="measurementCriteria" label={<Text style={{ letterSpacing: 1, fontSize: 12, color: 'var(--color-primary)' }}>MEASUREMENT CRITERIA</Text>}>
                <Input placeholder="How this KPI is measured..." style={{ borderRadius: 10, borderColor: 'var(--color-border)' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="markOutOf" label={<Text style={{ letterSpacing: 1, fontSize: 12, color: 'var(--color-primary)' }}>MARK OUT OF</Text>}>
                <InputNumber min={0} placeholder="e.g. 100" style={{ width: '100%', borderRadius: 10, borderColor: 'var(--color-border)' }} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* ── Section 2: Tag Designations ────────────────────────────────────── */}
        <Card bordered={false} style={{ borderRadius: 16, marginBottom: 16, background: 'var(--color-bg-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <TagsOutlined style={{ fontSize: 16, color: 'var(--color-primary)' }} />
            <Text strong style={{ fontSize: 15 }}>Tag Designations</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>Search and select</Text>
          </div>

          {/* Category radio */}
          <Form.Item style={{ marginBottom: 10 }}>
            <Radio.Group
              value={formCategory}
              onChange={e => setFormCategory(e.target.value as KPICategory)}
            >
              <Radio value="Leave">Leave</Radio>
              <Radio value="Attendance">Attendance</Radio>
              <Radio value="Manual">Manual</Radio>
              <Radio value="Disciplinary Ground">Disciplinary Ground</Radio>
            </Radio.Group>
          </Form.Item>

          {/* Sub-option: Leave type */}
          {formCategory === 'Leave' && (
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 14px', background: 'var(--color-status-info-bg)',
                borderRadius: 8, marginBottom: 12, border: '1px solid #bfdbfe',
              }}
            >
              <Text style={{ fontSize: 12, color: '#1d4ed8', whiteSpace: 'nowrap' }}>Leave Type:</Text>
              <Radio.Group
                value={formLeaveType}
                onChange={e => setFormLeaveType(e.target.value as LeaveType)}
                size="small"
              >
                {LEAVE_TYPES.map(lt => <Radio key={lt} value={lt}>{lt}</Radio>)}
              </Radio.Group>
            </div>
          )}

          {/* Sub-option: Disciplinary type */}
          {formCategory === 'Disciplinary Ground' && (
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 14px', background: 'var(--color-status-rejected-bg)',
                borderRadius: 8, marginBottom: 12, border: '1px solid #fecdd3',
              }}
            >
              <Text style={{ fontSize: 12, color: '#be123c', whiteSpace: 'nowrap' }}>Action Type:</Text>
              <Radio.Group
                value={formDisciplinaryType}
                onChange={e => setFormDisciplinaryType(e.target.value as DisciplinaryType)}
                size="small"
              >
                {DISCIPLINARY_TYPES.map(dt => <Radio key={dt} value={dt}>{dt}</Radio>)}
              </Radio.Group>
            </div>
          )}

          {/* Cascading Dept → Section → Designation picker */}
          <div
            style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto',
              gap: 10, alignItems: 'flex-end', marginBottom: 14,
            }}
          >
            {/* Department */}
            <div>
              <Text style={{ fontSize: 11, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: 4, fontWeight: 600, letterSpacing: 0.6 }}>DEPARTMENT</Text>
              <Select
                showSearch
                value={pickDept || undefined}
                placeholder="Select department..."
                style={{ width: '100%' }}
                filterOption={(input, opt) => String(opt?.children ?? '').toLowerCase().includes(input.toLowerCase())}
                onChange={v => { setPickDept(v); setPickSection(''); setPickDesig(''); }}
                allowClear
              >
                {allDepts.map(d => <Option key={d} value={d}>{d}</Option>)}
              </Select>
            </div>

            {/* Section */}
            <div>
              <Text style={{ fontSize: 11, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: 4, fontWeight: 600, letterSpacing: 0.6 }}>SECTION</Text>
              <Select
                showSearch
                value={pickSection || undefined}
                placeholder="Select section..."
                style={{ width: '100%' }}
                disabled={!pickDept}
                filterOption={(input, opt) => String(opt?.children ?? '').toLowerCase().includes(input.toLowerCase())}
                onChange={v => { setPickSection(v); setPickDesig(''); }}
                allowClear
              >
                {sectionsForDept.map(s => <Option key={s} value={s}>{s}</Option>)}
              </Select>
            </div>

            {/* Designation */}
            <div>
              <Text style={{ fontSize: 11, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: 4, fontWeight: 600, letterSpacing: 0.6 }}>DESIGNATION</Text>
              <Select
                showSearch
                value={pickDesig || undefined}
                placeholder="Select designation..."
                style={{ width: '100%' }}
                disabled={!pickSection}
                filterOption={(input, opt) => String(opt?.children ?? '').toLowerCase().includes(input.toLowerCase())}
                onChange={v => setPickDesig(v)}
                notFoundContent={<Text type="secondary" style={{ fontSize: 12 }}>All tagged</Text>}
                allowClear
              >
                {desigsForSection.map(d => <Option key={d} value={d}>{d}</Option>)}
              </Select>
            </div>

            {/* Tag button */}
            <Button
              type="primary"
              icon={<PlusOutlined />}
              disabled={!pickDesig}
              onClick={tagDesignation}
              style={{ borderRadius: 8, background: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
            >
              + Tag
            </Button>
          </div>

          {/* Tagged pills */}
          <div>
            <Text type="secondary" style={{ fontSize: 11, marginRight: 8 }}>TAGGED</Text>
            <Space size={6} wrap>
              {taggedKeys.map(key => {
                const [dept, section, desig] = key.split('||');
                return (
                  <Tag
                    key={key} closable onClose={() => untagDesignation(key)}
                    style={{ borderRadius: 8, paddingInline: 10, borderColor: '#9ddfd4', color: 'var(--color-primary)', background: 'var(--color-primary-tint)' }}
                  >
                    <span style={{ fontWeight: 600 }}>{desig}</span>
                    <span style={{ color: 'var(--color-text-disabled)', fontSize: 10, marginLeft: 4 }}>{dept} · {section}</span>
                  </Tag>
                );
              })}
              {taggedKeys.length === 0 && (
                <Text type="secondary" style={{ fontSize: 12 }}>No designations tagged yet</Text>
              )}
            </Space>
          </div>
        </Card>

        {/* ── Section 3: Per-Designation Configuration ───────────────────────── */}
        {taggedKeys.length > 0 && (
          <Card bordered={false} style={{ borderRadius: 16, marginBottom: 16, background: 'var(--color-bg-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <SettingOutlined style={{ fontSize: 16, color: 'var(--color-primary)' }} />
              <Text strong style={{ fontSize: 15 }}>Per-Designation Configuration</Text>
            </div>

            {/* Table header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: computedGridCols,
                gap: 10, padding: '8px 10px',
                background: 'var(--color-primary-tint)', borderRadius: 8, marginBottom: 8,
              }}
            >
              {computedGridHeaders.map(h => (
                <Text key={h} style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-secondary)', letterSpacing: 0.8 }}>{h}</Text>
              ))}
            </div>

            {taggedKeys.map(key => {
              const [dept, section] = key.split('||');
              const cfg = desigConfigs[key] ?? {
                designation: key.split('||')[2],
                department: dept,
                section,
                weight: 0,
                operator: '>=' as ComparisonOperator,
                targetValue: 0,
                responsibleTo: ['Line Manager'],
                frequency: 'Quarterly' as MeasurementFrequency,
              };
              return (
                <div
                  key={key}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: computedGridCols,
                    gap: 10, alignItems: 'center',
                    padding: '8px 10px', borderBottom: '1px solid #f0f4f3',
                  }}
                >
                  {/* Designation with dept/section context */}
                  <div>
                    <Tag style={{ borderRadius: 6, paddingInline: 10, fontSize: 11, borderColor: '#9ddfd4', color: 'var(--color-primary)', background: 'var(--color-primary-tint)', margin: 0, marginBottom: 2 }}>
                      {cfg.designation}
                    </Tag>
                    <div>
                      <Text style={{ fontSize: 10, color: 'var(--color-text-disabled)' }}>{dept} · {section}</Text>
                    </div>
                  </div>

                  {/* Weight */}
                  <InputNumber
                    min={0} max={100} value={cfg.weight}
                    onChange={v => updateDesigConfig(key, 'weight', v ?? 0)}
                    style={{ width: '100%', borderColor: 'var(--color-border)', borderRadius: 8 }}
                    placeholder="5"
                  />

                  {/* Operator */}
                  <Select
                    value={cfg.operator}
                    onChange={v => updateDesigConfig(key, 'operator', v as ComparisonOperator)}
                    style={{ width: '100%' }}
                  >
                    {OPERATORS.map(op => <Option key={op} value={op}>{OPERATOR_LABELS[op]}</Option>)}
                  </Select>

                  {/* Target Value */}
                  <InputNumber
                    min={0} max={10000} value={cfg.targetValue}
                    onChange={v => updateDesigConfig(key, 'targetValue', v ?? 0)}
                    style={{ width: '100%', borderColor: 'var(--color-border)', borderRadius: 8 }}
                    placeholder="0"
                    addonAfter={useCountUnit ? 'Count' : '%'}
                  />

                  {/* Responsible To — only shown for Manual */}
                  {showResponsibleTo && (
                    <Select
                      mode={singleResponsibleForEval ? undefined : 'multiple'}
                      value={singleResponsibleForEval ? (cfg.responsibleTo[0] ?? undefined) : cfg.responsibleTo}
                      placeholder="Select responsible..."
                      onChange={v => updateDesigConfig(
                        key,
                        'responsibleTo',
                        singleResponsibleForEval
                          ? (v ? [String(v)] : [])
                          : (v as string[])
                      )}
                      style={{ width: '100%' }}
                      showSearch
                      filterOption={(input, opt) =>
                        String(opt?.children ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      maxTagCount={singleResponsibleForEval ? undefined : 2}
                      maxTagPlaceholder={singleResponsibleForEval ? undefined : (omitted => `+${omitted.length} more`)}
                    >
                      <Option value="Line Manager">Line Manager</Option>
                      <Option value="HR">HR</Option>
                      <Select.OptGroup label="Employees">
                        {MOCK_EMPLOYEES.map(e => <Option key={e} value={e}>{e}</Option>)}
                      </Select.OptGroup>
                    </Select>
                  )}

                  {/* Frequency — only shown for Evaluation */}
                  {showFrequency && (
                    <Select
                      value={cfg.frequency}
                      onChange={v => updateDesigConfig(key, 'frequency', v as MeasurementFrequency)}
                      style={{ width: '100%' }}
                    >
                      {FREQUENCIES.map(f => <Option key={f} value={f}>{f}</Option>)}
                    </Select>
                  )}
                </div>
              );
            })}
          </Card>
        )}

        {/* ── Footer ────────────────────────────────────────────────────────────── */}
        <Divider style={{ margin: '8px 0 16px' }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <Button
            onClick={() => { setView('list'); resetForm(); }}
            style={{ borderRadius: 12, borderColor: 'var(--color-border)', color: 'var(--color-primary)', paddingInline: 22 }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleSubmit}
            style={{ borderRadius: 12, paddingInline: 22 }}
          >
            {editingId ? 'Update Sub KPI' : '+ Create Sub KPI'}
          </Button>
        </div>
      </Form>
    </div>
  );
}
