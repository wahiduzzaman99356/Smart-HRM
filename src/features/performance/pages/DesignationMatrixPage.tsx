/**
 * DesignationMatrixPage.tsx
 * Performance Management -> Designation Matrix
 * View-only designation-wise KPI coverage by eval type.
 */

import { useMemo, useState } from 'react';
import { Button, Card, Select, Space, Table, Tabs, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EditOutlined, PlusOutlined, ReconciliationOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import {
  DEPT_SECTION_DESIG_MAP,
  INITIAL_EMPLOYEES,
  INITIAL_SUB_KPIS,
  type KPIEvalType,
} from '../types/performance.types';

const { Title, Text } = Typography;
const { Option } = Select;

type EvalTab = KPIEvalType;

type MatrixRow = {
  key: string;
  subKPIId: string;
  mainKPIAreaId: string;
  designation: string;
  subKPIName: string;
  category: string;
  evalType: KPIEvalType;
  measurementCriteria: string;
  weight: number;
  operator: string;
  target: number;
  responsible: string;
};

type MatrixItem = {
  areaId: string;
  areaCode: string;
  areaName: string;
  row: MatrixRow;
};

type MatrixGroup = {
  areaId: string;
  areaCode: string;
  areaName: string;
  areaWeight: number;
  rows: MatrixRow[];
};

const EXAMPLE_ITEMS: Record<'Appraisal' | 'Confirmation KPI', Omit<MatrixItem, 'row'> & {
  subKPIName: string;
  category: string;
  measurementCriteria: string;
  weight: number;
  operator: string;
  target: number;
}> = {
  Appraisal: {
    areaId: 'mk-area-05',
    areaCode: 'MK-05',
    areaName: 'Performance Management',
    subKPIName: 'Appraisal Documentation Quality',
    category: 'Manual',
    measurementCriteria: 'Completeness and quality of submitted appraisal forms',
    weight: 20,
    operator: '>=',
    target: 90,
  },
  'Confirmation KPI': {
    areaId: 'mk-area-02',
    areaCode: 'MK-02',
    areaName: 'Talent Acquisition & Workforce Management',
    subKPIName: 'Probation Confirmation Readiness',
    category: 'Manual',
    measurementCriteria: 'Employees meeting confirmation checklist and target criteria',
    weight: 25,
    operator: '>=',
    target: 85,
  },
};

function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

export default function DesignationMatrixPage() {
  const [activeTab, setActiveTab] = useState<EvalTab>('Evaluation');

  // Draft filters (no auto apply)
  const [draftDept, setDraftDept] = useState<string>('all');
  const [draftSection, setDraftSection] = useState<string>('all');
  const [draftDesignation, setDraftDesignation] = useState<string>('all');

  // Applied filters (table uses these)
  const [filterDept, setFilterDept] = useState<string>('all');
  const [filterSection, setFilterSection] = useState<string>('all');
  const [filterDesignation, setFilterDesignation] = useState<string>('all');

  const departments = useMemo(
    () => unique(DEPT_SECTION_DESIG_MAP.map(m => m.department)),
    [],
  );

  const draftSections = useMemo(() => {
    const source = draftDept === 'all'
      ? DEPT_SECTION_DESIG_MAP
      : DEPT_SECTION_DESIG_MAP.filter(m => m.department === draftDept);
    return unique(source.map(m => m.section));
  }, [draftDept]);

  const draftDesignations = useMemo(() => {
    const source = DEPT_SECTION_DESIG_MAP.filter(m => {
      const deptOk = draftDept === 'all' || m.department === draftDept;
      const sectionOk = draftSection === 'all' || m.section === draftSection;
      return deptOk && sectionOk;
    });
    return unique(source.flatMap(m => m.designations));
  }, [draftDept, draftSection]);

  const selectedDesignations = useMemo(() => {
    const source = DEPT_SECTION_DESIG_MAP.filter(m => {
      const deptOk = filterDept === 'all' || m.department === filterDept;
      const sectionOk = filterSection === 'all' || m.section === filterSection;
      return deptOk && sectionOk;
    });
    const possible = unique(source.flatMap(m => m.designations));
    if (filterDesignation === 'all') return possible;
    return possible.includes(filterDesignation) ? [filterDesignation] : [];
  }, [filterDept, filterSection, filterDesignation]);

  const realItems = useMemo<MatrixItem[]>(() => {
    if (selectedDesignations.length === 0) return [];

    const items: MatrixItem[] = [];
    for (const designation of selectedDesignations) {
      for (const kpi of INITIAL_SUB_KPIS.filter(s => s.isActive && s.evalType === activeTab)) {
        const cfg = kpi.designationConfigs.find(dc => {
          const designationOk = dc.designation === designation;
          const deptOk = filterDept === 'all' || !dc.department || dc.department === filterDept;
          const sectionOk = filterSection === 'all' || !dc.section || dc.section === filterSection;
          return designationOk && deptOk && sectionOk;
        });

        if (!cfg) continue;

        items.push({
          areaId: kpi.mainKPIAreaId,
          areaCode: kpi.mainKPICode,
          areaName: kpi.mainKPIAreaName,
          row: {
            key: `${kpi.id}-${designation}`,
            subKPIId: kpi.id,
            mainKPIAreaId: kpi.mainKPIAreaId,
            designation,
            subKPIName: kpi.name,
            category: kpi.category,
            evalType: kpi.evalType,
            measurementCriteria: kpi.measurementCriteria,
            weight: cfg.weight,
            operator: cfg.operator,
            target: cfg.targetValue,
            responsible: cfg.responsibleTo[0] ?? 'N/A',
          },
        });
      }
    }

    return items;
  }, [selectedDesignations, activeTab, filterDept, filterSection]);

  const withExamples = useMemo<MatrixItem[]>(() => {
    if (realItems.length > 0 || activeTab === 'Evaluation') return realItems;

    const template = EXAMPLE_ITEMS[activeTab as 'Appraisal' | 'Confirmation KPI'];
    const sourceDesignations = selectedDesignations.length > 0 ? selectedDesignations : ['HOD'];

    return sourceDesignations.map((designation, idx) => ({
      areaId: template.areaId,
      areaCode: template.areaCode,
      areaName: template.areaName,
      row: {
        key: `example-${activeTab}-${designation}-${idx}`,
        subKPIId: '',
        mainKPIAreaId: template.areaId,
        designation,
        subKPIName: template.subKPIName,
        category: template.category,
        evalType: activeTab,
        measurementCriteria: template.measurementCriteria,
        weight: template.weight,
        operator: template.operator,
        target: template.target,
        responsible: 'Line Manager',
      },
    }));
  }, [realItems, activeTab, selectedDesignations]);

  const weightedItems = useMemo<MatrixItem[]>(() => {
    const sorted = [...withExamples].sort((a, b) => {
      if (a.areaCode !== b.areaCode) return a.areaCode.localeCompare(b.areaCode);
      return a.row.subKPIName.localeCompare(b.row.subKPIName);
    });

    let running = 0;
    const accepted: MatrixItem[] = [];
    for (const item of sorted) {
      if (running + item.row.weight > 100) continue;
      accepted.push(item);
      running += item.row.weight;
    }
    return accepted;
  }, [withExamples]);

  const grouped = useMemo<MatrixGroup[]>(() => {
    const map = new Map<string, MatrixGroup>();

    for (const item of weightedItems) {
      if (!map.has(item.areaId)) {
        map.set(item.areaId, {
          areaId: item.areaId,
          areaCode: item.areaCode,
          areaName: item.areaName,
          areaWeight: 0,
          rows: [],
        });
      }
      const group = map.get(item.areaId)!;
      group.rows.push(item.row);
      group.areaWeight += item.row.weight;
    }

    return [...map.values()];
  }, [weightedItems]);

  const totalWeight = useMemo(
    () => grouped.reduce((sum, g) => sum + g.areaWeight, 0),
    [grouped],
  );

  const employeeCount = useMemo(() => {
    if (selectedDesignations.length === 0) return 0;
    return INITIAL_EMPLOYEES.filter(e => {
      const desigOk = selectedDesignations.includes(e.designation);
      const deptOk = filterDept === 'all' || e.department === filterDept;
      const sectionOk = filterSection === 'all' || e.section === filterSection;
      return desigOk && deptOk && sectionOk;
    }).length;
  }, [selectedDesignations, filterDept, filterSection]);

  const applyFilters = () => {
    setFilterDept(draftDept);
    setFilterSection(draftSection);
    setFilterDesignation(draftDesignation);
  };

  const resetFilters = () => {
    setDraftDept('all');
    setDraftSection('all');
    setDraftDesignation('all');
    setFilterDept('all');
    setFilterSection('all');
    setFilterDesignation('all');
  };

  const openSubKpiSetupInNewTab = (group: MatrixGroup) => {
    const designation = filterDesignation !== 'all' ? filterDesignation : '';
    const params = new URLSearchParams();
    params.set('openFrom', 'designation-matrix');
    params.set('mode', 'create');
    params.set('mainKPIAreaId', group.areaId);
    params.set('evalType', activeTab);
    if (designation) params.set('designation', designation);
    if (filterDept !== 'all') params.set('department', filterDept);
    if (filterSection !== 'all') params.set('section', filterSection);

    const target = `/performance/sub-kpi-setup?${params.toString()}`;
    window.open(target, '_blank', 'noopener,noreferrer');
  };

  const openSubKpiEditInNewTab = (row: MatrixRow) => {
    const params = new URLSearchParams();
    params.set('openFrom', 'designation-matrix');
    params.set('mode', 'edit');
    params.set('evalType', row.evalType);
    params.set('mainKPIAreaId', row.mainKPIAreaId);
    params.set('designation', row.designation);
    params.set('subKPIName', row.subKPIName);
    params.set('category', row.category);
    params.set('measurementCriteria', row.measurementCriteria);
    params.set('weight', String(row.weight));
    params.set('operator', row.operator);
    params.set('target', String(row.target));
    params.set('responsible', row.responsible);
    if (row.subKPIId) params.set('subKPIId', row.subKPIId);
    if (filterDept !== 'all') params.set('department', filterDept);
    if (filterSection !== 'all') params.set('section', filterSection);

    const target = `/performance/sub-kpi-setup?${params.toString()}`;
    window.open(target, '_blank', 'noopener,noreferrer');
  };

  const columns: ColumnsType<MatrixRow> = [
    {
      title: 'SUB KPI',
      dataIndex: 'subKPIName',
      render: (v: string) => <Text strong style={{ fontSize: 13 }}>{v}</Text>,
    },
    {
      title: 'DESIGNATION',
      dataIndex: 'designation',
      width: 140,
      render: (v: string) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: 'CATEGORY',
      dataIndex: 'category',
      width: 130,
      render: (v: string) => <Tag>{v}</Tag>,
    },
    {
      title: 'KPI TYPE',
      dataIndex: 'evalType',
      width: 150,
      render: (v: KPIEvalType) => <Tag color={v === 'Evaluation' ? 'cyan' : v === 'Appraisal' ? 'purple' : 'geekblue'}>{v}</Tag>,
    },
    {
      title: 'MEASUREMENT CRITERIA',
      dataIndex: 'measurementCriteria',
      width: 300,
      render: (v: string) => <Text type="secondary">{v}</Text>,
    },
    {
      title: 'WEIGHT %',
      dataIndex: 'weight',
      width: 110,
      align: 'center',
      render: (v: number) => <Tag color="processing">{v}%</Tag>,
    },
    {
      title: 'OPERATOR',
      dataIndex: 'operator',
      width: 95,
      align: 'center',
    },
    {
      title: 'TARGET',
      dataIndex: 'target',
      width: 95,
      align: 'center',
      render: (v: number) => <Text strong>{v}</Text>,
    },
    {
      title: 'RESPONSIBLE',
      dataIndex: 'responsible',
      width: 140,
      render: (v: string) => <Tag color="green">{v}</Tag>,
    },
    {
      title: 'ACTIONS',
      width: 100,
      align: 'center',
      render: (_: unknown, row) => (
        <Button size="small" icon={<EditOutlined />} onClick={() => openSubKpiEditInNewTab(row)}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '16px 20px', background: 'var(--color-primary-tint)', minHeight: '100%', height: '100%', overflowY: 'auto' }}>
      <div style={{ marginBottom: 12 }}>
        <Title level={3} style={{ margin: 0, color: '#0f2f35' }}>
          <ReconciliationOutlined style={{ marginRight: 8, color: 'var(--color-primary)' }} />Designation Matrix
          <Text style={{ marginLeft: 10, color: '#67a8a0', fontSize: 16, fontWeight: 600 }}>Coverage Overview</Text>
        </Title>
      </div>

      <Card bordered={false} style={{ borderRadius: 14, marginBottom: 12 }}>
        <Space size={10} wrap>
          <Select value={draftDept} onChange={v => { setDraftDept(v); setDraftSection('all'); setDraftDesignation('all'); }} style={{ width: 200 }}>
            <Option value="all">All Departments</Option>
            {departments.map(d => <Option key={d} value={d}>{d}</Option>)}
          </Select>

          <Select value={draftSection} onChange={v => { setDraftSection(v); setDraftDesignation('all'); }} style={{ width: 200 }}>
            <Option value="all">All Sections</Option>
            {draftSections.map(s => <Option key={s} value={s}>{s}</Option>)}
          </Select>

          <Select value={draftDesignation} onChange={setDraftDesignation} style={{ width: 220 }}>
            <Option value="all">All Designations</Option>
            {draftDesignations.map(d => <Option key={d} value={d}>{d}</Option>)}
          </Select>

          <Button type="primary" icon={<SearchOutlined />} onClick={applyFilters}>Search</Button>
          <Button icon={<ReloadOutlined />} onClick={resetFilters}>Reset</Button>

          <Tag color="processing">{weightedItems.length} Sub KPIs</Tag>
          <Tag color="geekblue">{employeeCount} employees</Tag>
        </Space>
      </Card>

      <Card bordered={false} style={{ borderRadius: 14, marginBottom: 12 }}>
        <Tabs
          activeKey={activeTab}
          onChange={key => setActiveTab(key as EvalTab)}
          items={[
            { key: 'Evaluation', label: 'Evaluation' },
            { key: 'Appraisal', label: 'Appraisal' },
            { key: 'Confirmation KPI', label: 'Confirmation KPI' },
          ]}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12, marginBottom: 12 }}>
          <Card bordered={false} style={{ borderRadius: 12, background: '#f8fffd', border: '1px solid #caeee8' }}>
            <Text type="secondary" style={{ fontSize: 11, letterSpacing: 1 }}>TOTAL SUB KPIs</Text>
            <Title level={2} style={{ margin: '2px 0 0', color: 'var(--color-primary)' }}>{weightedItems.length}</Title>
            <Text type="secondary">{employeeCount} employees in selected scope</Text>
          </Card>
          <Card bordered={false} style={{ borderRadius: 12, background: '#fffbf2', border: '1px solid #f5d28f' }}>
            <Text type="secondary" style={{ fontSize: 11, letterSpacing: 1 }}>TOTAL WEIGHT</Text>
            <Title level={2} style={{ margin: '2px 0 0', color: '#059669' }}>{totalWeight.toFixed(1)}%</Title>
            <Text type="secondary">Total weight cannot exceed 100%</Text>
          </Card>
        </div>

        {grouped.map((group, idx) => (
          <Card
            key={group.areaId}
            bordered={false}
            style={{ borderRadius: 14, marginBottom: 12, background: 'var(--color-bg-surface)', border: '1px solid #d7e9e5' }}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <Space size={8} wrap>
                  <Tag color="blue" style={{ margin: 0, fontFamily: 'monospace' }}>{group.areaCode}</Tag>
                  <Text strong>{idx + 1}. {group.areaName}</Text>
                  <Tag color="cyan">{group.rows.length} Sub KPIs</Tag>
                </Space>
                <Space>
                  <Text strong style={{ color: 'var(--color-primary)' }}>Weight: {group.areaWeight.toFixed(1)}%</Text>
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => openSubKpiSetupInNewTab(group)}>
                    Add Sub KPI
                  </Button>
                </Space>
              </div>
            }
          >
            <Table
              dataSource={group.rows}
              columns={columns}
              rowKey="key"
              size="small"
              pagination={{ pageSize: 5, showSizeChanger: false }}
              scroll={{ x: 1300 }}
            />
          </Card>
        ))}

        {grouped.length === 0 && (
          <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
            No designation-wise KPI coverage found for selected filters and tab.
          </div>
        )}
      </Card>

    </div>
  );
}
