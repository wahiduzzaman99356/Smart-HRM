/**
 * KpiPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Performance Management – KPI module.
 *
 * Two tabs:
 *   • Main KPI  – list of top-level KPIs with code, sub-KPI count, tagged designations
 *   • Sub KPI   – list of configured sub-KPIs linked to main KPIs
 */

import { useMemo, useState } from 'react';
import {
  Button,
  Dropdown,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  message,
} from 'antd';
import type { TableColumnsType } from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  FundOutlined,
  MoreOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type {
  KpiFrequency,
  KpiOperator,
  MainKpi,
  MainKpiForm,
  SubKpi,
  SubKpiForm,
} from '../types/kpi.types';

// ── Constants ─────────────────────────────────────────────────────────────────

const DESIGNATION_OPTIONS = [
  'CEO',
  'Director',
  'Senior Manager',
  'Manager',
  'Team Lead',
  'Senior Executive',
  'Executive',
  'Analyst',
  'Associate',
];

const FREQUENCY_OPTIONS: KpiFrequency[] = ['Monthly', 'Quarterly', 'Bi-Annual', 'Annual'];

const OPERATOR_OPTIONS: { label: string; value: KpiOperator }[] = [
  { label: 'Greater Than ( > )',          value: '>'  },
  { label: 'Less Than ( < )',             value: '<'  },
  { label: 'Equal To ( = )',              value: '='  },
  { label: 'Greater Than or Equal ( ≥ )', value: '>=' },
  { label: 'Less Than or Equal ( ≤ )',    value: '<=' },
];

// ── Seed data ─────────────────────────────────────────────────────────────────

const INITIAL_MAIN_KPIS: MainKpi[] = [
  {
    id: '1',
    name: 'Revenue Growth',
    code: 'RG-001',
    taggedDesignations: ['Director', 'Senior Manager'],
    subKpiCount: 3,
  },
  {
    id: '2',
    name: 'Employee Retention',
    code: 'ER-001',
    taggedDesignations: ['Manager', 'Team Lead'],
    subKpiCount: 2,
  },
  {
    id: '3',
    name: 'Customer Satisfaction',
    code: 'CS-001',
    taggedDesignations: ['Senior Executive', 'Executive'],
    subKpiCount: 4,
  },
];

const INITIAL_SUB_KPIS: SubKpi[] = [
  {
    id: '1',
    name: 'Monthly Revenue Target',
    mainKpiId: '1',
    frequency: 'Monthly',
    operator: '>',
    targetValue: 500000,
    responsibleDesignation: 'Senior Manager',
  },
  {
    id: '2',
    name: 'Quarterly Revenue Milestone',
    mainKpiId: '1',
    frequency: 'Quarterly',
    operator: '>=',
    targetValue: 1500000,
    responsibleDesignation: 'Director',
  },
  {
    id: '3',
    name: 'Annual Headcount Retention',
    mainKpiId: '2',
    frequency: 'Annual',
    operator: '>=',
    targetValue: 90,
    responsibleDesignation: 'Manager',
  },
  {
    id: '4',
    name: 'CSAT Score',
    mainKpiId: '3',
    frequency: 'Monthly',
    operator: '>=',
    targetValue: 85,
    responsibleDesignation: 'Senior Executive',
  },
];

// ── Initial form state ────────────────────────────────────────────────────────

const INITIAL_MAIN_FORM: MainKpiForm = {
  name: '',
  code: '',
  taggedDesignations: [],
};

const INITIAL_SUB_FORM: SubKpiForm = {
  name: '',
  mainKpiId: '',
  frequency: '',
  operator: '',
  targetValue: '',
  responsibleDesignation: '',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

type ActiveTab = 'main' | 'sub';

// ── Component ─────────────────────────────────────────────────────────────────

export default function KpiPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('main');

  // ── Main KPI state ────────────────────────────────────────────────────────
  const [mainKpis, setMainKpis]   = useState<MainKpi[]>(INITIAL_MAIN_KPIS);
  const [mainSearch, setMainSearch] = useState('');
  const [mainQuery, setMainQuery]   = useState('');
  const [mainModalOpen, setMainModalOpen] = useState(false);
  const [mainModalMode, setMainModalMode] = useState<'create' | 'edit'>('create');
  const [editingMainId, setEditingMainId] = useState<string | null>(null);
  const [mainForm, setMainForm]     = useState<MainKpiForm>(INITIAL_MAIN_FORM);

  // ── Sub KPI state ─────────────────────────────────────────────────────────
  const [subKpis, setSubKpis]     = useState<SubKpi[]>(INITIAL_SUB_KPIS);
  const [subSearch, setSubSearch]   = useState('');
  const [subQuery, setSubQuery]     = useState('');
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [subModalMode, setSubModalMode] = useState<'create' | 'edit'>('create');
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [subForm, setSubForm]       = useState<SubKpiForm>(INITIAL_SUB_FORM);

  // ── Derived lists ─────────────────────────────────────────────────────────

  const filteredMainKpis = useMemo(() => {
    const q = mainQuery.trim().toLowerCase();
    if (!q) return mainKpis;
    return mainKpis.filter(
      (k) =>
        k.name.toLowerCase().includes(q) ||
        k.code.toLowerCase().includes(q) ||
        k.taggedDesignations.some((d) => d.toLowerCase().includes(q)),
    );
  }, [mainKpis, mainQuery]);

  const filteredSubKpis = useMemo(() => {
    const q = subQuery.trim().toLowerCase();
    if (!q) return subKpis;
    return subKpis.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.responsibleDesignation.toLowerCase().includes(q),
    );
  }, [subKpis, subQuery]);

  // ── Main KPI actions ──────────────────────────────────────────────────────

  function openCreateMain() {
    setMainModalMode('create');
    setEditingMainId(null);
    setMainForm(INITIAL_MAIN_FORM);
    setMainModalOpen(true);
  }

  function openEditMain(record: MainKpi) {
    setMainModalMode('edit');
    setEditingMainId(record.id);
    setMainForm({
      name: record.name,
      code: record.code,
      taggedDesignations: record.taggedDesignations,
    });
    setMainModalOpen(true);
  }

  function resetMainModal() {
    setMainModalOpen(false);
    setEditingMainId(null);
    setMainForm(INITIAL_MAIN_FORM);
  }

  function handleMainSubmit() {
    const name  = mainForm.name.trim();
    const code  = mainForm.code.trim().toUpperCase();
    const desig = mainForm.taggedDesignations;

    if (!name) { message.error('KPI Name is required.'); return; }
    if (!code) { message.error('KPI Code is required.'); return; }
    if (!desig.length) { message.error('At least one Tagged Designation is required.'); return; }

    const duplicate = mainKpis.some(
      (k) => k.code.toLowerCase() === code.toLowerCase() && k.id !== editingMainId,
    );
    if (duplicate) { message.error('KPI Code already exists. Please use a unique code.'); return; }

    if (mainModalMode === 'edit' && editingMainId) {
      setMainKpis((prev) =>
        prev.map((k) =>
          k.id === editingMainId ? { ...k, name, code, taggedDesignations: desig } : k,
        ),
      );
      message.success('Main KPI updated successfully.');
    } else {
      const newKpi: MainKpi = {
        id: String(Date.now()),
        name,
        code,
        taggedDesignations: desig,
        subKpiCount: 0,
      };
      setMainKpis((prev) => [...prev, newKpi]);
      message.success('Main KPI created successfully.');
    }
    resetMainModal();
  }

  function deleteMain(record: MainKpi) {
    Modal.confirm({
      title: 'Delete Main KPI?',
      content: `"${record.name}" and all its sub-KPIs will be permanently removed.`,
      okText: 'Delete',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk() {
        setMainKpis((prev) => prev.filter((k) => k.id !== record.id));
        setSubKpis((prev) => prev.filter((s) => s.mainKpiId !== record.id));
        message.success('Main KPI deleted.');
      },
    });
  }

  // ── Sub KPI actions ───────────────────────────────────────────────────────

  function openCreateSub() {
    setSubModalMode('create');
    setEditingSubId(null);
    setSubForm(INITIAL_SUB_FORM);
    setSubModalOpen(true);
  }

  function openEditSub(record: SubKpi) {
    setSubModalMode('edit');
    setEditingSubId(record.id);
    setSubForm({
      name: record.name,
      mainKpiId: record.mainKpiId,
      frequency: record.frequency,
      operator: record.operator,
      targetValue: String(record.targetValue),
      responsibleDesignation: record.responsibleDesignation,
    });
    setSubModalOpen(true);
  }

  function resetSubModal() {
    setSubModalOpen(false);
    setEditingSubId(null);
    setSubForm(INITIAL_SUB_FORM);
  }

  function handleSubSubmit() {
    const name   = subForm.name.trim();
    const mainId = subForm.mainKpiId;
    const freq   = subForm.frequency as KpiFrequency | '';
    const op     = subForm.operator as KpiOperator | '';
    const target = subForm.targetValue.trim();
    const desg   = subForm.responsibleDesignation;

    if (!name)   { message.error('Sub KPI Name is required.'); return; }
    if (!mainId) { message.error('Main KPI is required.'); return; }
    if (!freq)   { message.error('Frequency is required.'); return; }
    if (!op)     { message.error('Operator is required.'); return; }
    if (!target || isNaN(Number(target))) { message.error('A valid Target Value is required.'); return; }
    if (!desg)   { message.error('Responsible Designation is required.'); return; }

    if (subModalMode === 'edit' && editingSubId) {
      setSubKpis((prev) =>
        prev.map((s) =>
          s.id === editingSubId
            ? { ...s, name, mainKpiId: mainId, frequency: freq as KpiFrequency, operator: op as KpiOperator, targetValue: Number(target), responsibleDesignation: desg }
            : s,
        ),
      );
      message.success('Sub KPI updated successfully.');
    } else {
      const newSub: SubKpi = {
        id: String(Date.now()),
        name,
        mainKpiId: mainId,
        frequency: freq as KpiFrequency,
        operator: op as KpiOperator,
        targetValue: Number(target),
        responsibleDesignation: desg,
      };
      setSubKpis((prev) => [...prev, newSub]);
      // increment sub-KPI count on the parent
      setMainKpis((prev) =>
        prev.map((k) =>
          k.id === mainId ? { ...k, subKpiCount: k.subKpiCount + 1 } : k,
        ),
      );
      message.success('Sub KPI created successfully.');
    }
    resetSubModal();
  }

  function deleteSub(record: SubKpi) {
    Modal.confirm({
      title: 'Delete Sub KPI?',
      content: `"${record.name}" will be permanently removed.`,
      okText: 'Delete',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk() {
        setSubKpis((prev) => prev.filter((s) => s.id !== record.id));
        setMainKpis((prev) =>
          prev.map((k) =>
            k.id === record.mainKpiId
              ? { ...k, subKpiCount: Math.max(0, k.subKpiCount - 1) }
              : k,
          ),
        );
        message.success('Sub KPI deleted.');
      },
    });
  }

  // ── Main KPI table columns ─────────────────────────────────────────────────

  const mainColumns: TableColumnsType<MainKpi> = [
    {
      title: 'SL No',
      key: 'slNo',
      width: 72,
      render: (_v, _r, index) => index + 1,
    },
    {
      title: 'KPI Name',
      key: 'name',
      render: (_v, record) => (
        <div>
          <div style={{ fontWeight: 600, color: '#111827' }}>{record.name}</div>
          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
            Code: <span style={{ fontWeight: 600, color: '#0f766e' }}>{record.code}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Sub KPI Count',
      dataIndex: 'subKpiCount',
      key: 'subKpiCount',
      width: 130,
      render: (count: number) => (
        <Tag color="blue" style={{ fontWeight: 600 }}>
          {count}
        </Tag>
      ),
    },
    {
      title: 'Tagged Designation',
      dataIndex: 'taggedDesignations',
      key: 'taggedDesignations',
      render: (designations: string[]) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {designations.map((d) => (
            <Tag key={d} color="geekblue" style={{ margin: 0 }}>
              {d}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      render: (_v, record) => (
        <Dropdown
          trigger={['click']}
          menu={{
            items: [
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Edit',
                onClick: () => openEditMain(record),
              },
              {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: 'Delete',
                danger: true,
                onClick: () => deleteMain(record),
              },
            ],
          }}
        >
          <Button
            type="text"
            size="small"
            icon={<MoreOutlined style={{ fontSize: 16, color: '#94a3b8' }} />}
          />
        </Dropdown>
      ),
    },
  ];

  // ── Sub KPI table columns ─────────────────────────────────────────────────

  const subColumns: TableColumnsType<SubKpi> = [
    {
      title: 'SL No',
      key: 'slNo',
      width: 72,
      render: (_v, _r, index) => index + 1,
    },
    {
      title: 'Sub KPI Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <span style={{ fontWeight: 600 }}>{name}</span>,
    },
    {
      title: 'Main KPI',
      key: 'mainKpi',
      render: (_v, record) => {
        const parent = mainKpis.find((k) => k.id === record.mainKpiId);
        return parent ? (
          <div>
            <div style={{ fontWeight: 500 }}>{parent.name}</div>
            <div style={{ fontSize: 11, color: '#0f766e' }}>{parent.code}</div>
          </div>
        ) : (
          '—'
        );
      },
    },
    {
      title: 'Frequency',
      dataIndex: 'frequency',
      key: 'frequency',
      width: 120,
      render: (freq: KpiFrequency) => (
        <Tag color="cyan">{freq}</Tag>
      ),
    },
    {
      title: 'Operator',
      dataIndex: 'operator',
      key: 'operator',
      width: 110,
      render: (op: KpiOperator) => (
        <Tag color="purple" style={{ fontFamily: 'monospace', fontWeight: 600 }}>
          {op}
        </Tag>
      ),
    },
    {
      title: 'Target Value',
      dataIndex: 'targetValue',
      key: 'targetValue',
      width: 120,
      render: (val: number) => val.toLocaleString(),
    },
    {
      title: 'Responsible Designation',
      dataIndex: 'responsibleDesignation',
      key: 'responsibleDesignation',
      render: (d: string) => (
        <Tag color="gold">{d}</Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      render: (_v, record) => (
        <Dropdown
          trigger={['click']}
          menu={{
            items: [
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Edit',
                onClick: () => openEditSub(record),
              },
              {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: 'Delete',
                danger: true,
                onClick: () => deleteSub(record),
              },
            ],
          }}
        >
          <Button
            type="text"
            size="small"
            icon={<MoreOutlined style={{ fontSize: 16, color: '#94a3b8' }} />}
          />
        </Dropdown>
      ),
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="page-shell">
      {/* ── Page header ──────────────────────────────────────────── */}
      <div className="page-header-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="module-icon-box">
            <FundOutlined style={{ color: '#ffffff', fontSize: 16 }} />
          </div>
          <div>
            <h1>KPI Management</h1>
            <p>Configure main KPIs and sub-KPIs for performance tracking.</p>
          </div>
        </div>
        {activeTab === 'main' ? (
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateMain}>
            Add Main KPI
          </Button>
        ) : (
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateSub}>
            Create Sub KPI
          </Button>
        )}
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────── */}
      <div className="tab-pill-group" style={{ marginBottom: 20 }}>
        <button
          type="button"
          className={`tab-pill${activeTab === 'main' ? ' active' : ''}`}
          onClick={() => setActiveTab('main')}
        >
          Main KPI
        </button>
        <button
          type="button"
          className={`tab-pill${activeTab === 'sub' ? ' active' : ''}`}
          onClick={() => setActiveTab('sub')}
        >
          Sub KPI
        </button>
      </div>

      {/* ── Main KPI tab ─────────────────────────────────────────── */}
      {activeTab === 'main' && (
        <>
          <div className="filter-bar" style={{ marginBottom: 14 }}>
            <div>
              <div className="filter-label">SEARCH</div>
              <Space size={8} wrap>
                <Input
                  placeholder="Search by name, code or designation…"
                  value={mainSearch}
                  onChange={(e) => setMainSearch(e.target.value)}
                  onPressEnter={() => setMainQuery(mainSearch)}
                  style={{ width: 300 }}
                />
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={() => setMainQuery(mainSearch)}
                >
                  Search
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => { setMainSearch(''); setMainQuery(''); }}
                >
                  Reset
                </Button>
              </Space>
            </div>
          </div>

          <div className="list-surface">
            <Table<MainKpi>
              rowKey="id"
              columns={mainColumns}
              dataSource={filteredMainKpis}
              pagination={false}
              bordered={false}
              locale={{ emptyText: 'No main KPIs found.' }}
            />
          </div>
        </>
      )}

      {/* ── Sub KPI tab ──────────────────────────────────────────── */}
      {activeTab === 'sub' && (
        <>
          <div className="filter-bar" style={{ marginBottom: 14 }}>
            <div>
              <div className="filter-label">SEARCH</div>
              <Space size={8} wrap>
                <Input
                  placeholder="Search by name or designation…"
                  value={subSearch}
                  onChange={(e) => setSubSearch(e.target.value)}
                  onPressEnter={() => setSubQuery(subSearch)}
                  style={{ width: 300 }}
                />
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={() => setSubQuery(subSearch)}
                >
                  Search
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => { setSubSearch(''); setSubQuery(''); }}
                >
                  Reset
                </Button>
              </Space>
            </div>
          </div>

          <div className="list-surface">
            <Table<SubKpi>
              rowKey="id"
              columns={subColumns}
              dataSource={filteredSubKpis}
              pagination={false}
              bordered={false}
              locale={{ emptyText: 'No sub-KPIs found.' }}
            />
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════
          Modal – Add / Edit Main KPI
      ══════════════════════════════════════════════════════════════ */}
      <Modal
        open={mainModalOpen}
        title={mainModalMode === 'edit' ? 'Edit Main KPI' : 'Add Main KPI'}
        okText={mainModalMode === 'edit' ? 'Update' : 'Create'}
        cancelText="Cancel"
        onOk={handleMainSubmit}
        onCancel={resetMainModal}
        width={480}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 6 }}>
          <div>
            <div style={{ marginBottom: 6, fontSize: 12, fontWeight: 700, color: '#4b5563' }}>
              * KPI NAME
            </div>
            <Input
              placeholder="e.g. Revenue Growth"
              value={mainForm.name}
              onChange={(e) => setMainForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div>
            <div style={{ marginBottom: 6, fontSize: 12, fontWeight: 700, color: '#4b5563' }}>
              * KPI CODE
            </div>
            <Input
              placeholder="e.g. RG-001"
              value={mainForm.code}
              onChange={(e) => setMainForm((prev) => ({ ...prev, code: e.target.value }))}
            />
          </div>

          <div>
            <div style={{ marginBottom: 6, fontSize: 12, fontWeight: 700, color: '#4b5563' }}>
              * TAGGED DESIGNATION
            </div>
            <Select
              mode="multiple"
              placeholder="Select one or more designations"
              value={mainForm.taggedDesignations}
              onChange={(val) => setMainForm((prev) => ({ ...prev, taggedDesignations: val }))}
              options={DESIGNATION_OPTIONS.map((d) => ({ label: d, value: d }))}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </Modal>

      {/* ═══════════════════════════════════════════════════════════
          Modal – Create / Edit Sub KPI
      ══════════════════════════════════════════════════════════════ */}
      <Modal
        open={subModalOpen}
        title={subModalMode === 'edit' ? 'Edit Sub KPI' : 'Create Sub KPI'}
        okText={subModalMode === 'edit' ? 'Update' : 'Create'}
        cancelText="Cancel"
        onOk={handleSubSubmit}
        onCancel={resetSubModal}
        width={520}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 6 }}>
          <div>
            <div style={{ marginBottom: 6, fontSize: 12, fontWeight: 700, color: '#4b5563' }}>
              * SUB KPI NAME
            </div>
            <Input
              placeholder="e.g. Monthly Revenue Target"
              value={subForm.name}
              onChange={(e) => setSubForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div>
            <div style={{ marginBottom: 6, fontSize: 12, fontWeight: 700, color: '#4b5563' }}>
              * MAIN KPI
            </div>
            <Select
              placeholder="Select main KPI"
              value={subForm.mainKpiId || undefined}
              onChange={(val) => setSubForm((prev) => ({ ...prev, mainKpiId: val }))}
              options={mainKpis.map((k) => ({
                label: `${k.name} (${k.code})`,
                value: k.id,
              }))}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ marginBottom: 6, fontSize: 12, fontWeight: 700, color: '#4b5563' }}>
                * FREQUENCY
              </div>
              <Select
                placeholder="Select frequency"
                value={subForm.frequency || undefined}
                onChange={(val) => setSubForm((prev) => ({ ...prev, frequency: val }))}
                options={FREQUENCY_OPTIONS.map((f) => ({ label: f, value: f }))}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <div style={{ marginBottom: 6, fontSize: 12, fontWeight: 700, color: '#4b5563' }}>
                * OPERATOR
              </div>
              <Select
                placeholder="Select operator"
                value={subForm.operator || undefined}
                onChange={(val) => setSubForm((prev) => ({ ...prev, operator: val }))}
                options={OPERATOR_OPTIONS}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div>
            <div style={{ marginBottom: 6, fontSize: 12, fontWeight: 700, color: '#4b5563' }}>
              * TARGET VALUE
            </div>
            <InputNumber
              placeholder="e.g. 90"
              value={subForm.targetValue ? Number(subForm.targetValue) : undefined}
              onChange={(val) =>
                setSubForm((prev) => ({ ...prev, targetValue: val != null ? String(val) : '' }))
              }
              style={{ width: '100%' }}
              min={0}
            />
          </div>

          <div>
            <div style={{ marginBottom: 6, fontSize: 12, fontWeight: 700, color: '#4b5563' }}>
              * RESPONSIBLE DESIGNATION
            </div>
            <Select
              placeholder="Select responsible designation"
              value={subForm.responsibleDesignation || undefined}
              onChange={(val) => setSubForm((prev) => ({ ...prev, responsibleDesignation: val }))}
              options={DESIGNATION_OPTIONS.map((d) => ({ label: d, value: d }))}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
