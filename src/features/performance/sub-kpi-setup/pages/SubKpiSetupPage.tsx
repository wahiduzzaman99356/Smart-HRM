/**
 * SubKpiSetupPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Configure sub-KPIs linked to each Main KPI Area.
 * Supports filtering by area, Add / Edit and Delete operations.
 */

import { useState } from 'react';
import { Button, Input, Modal, Popconfirm, Select, Space, Table, Tag, message } from 'antd';
import type { TableColumnsType } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';

interface SubKpi {
  id: string;
  name: string;
  mainArea: string;
  weight: number;
  targetValue: string;
  unit: string;
  status: 'active' | 'inactive';
}

interface SubKpiForm {
  name: string;
  mainArea: string;
  weight: string;
  targetValue: string;
  unit: string;
  status: SubKpi['status'];
}

const MAIN_AREAS = [
  'Financial Performance',
  'Customer Satisfaction',
  'Operational Efficiency',
  'Employee Development',
  'Innovation & Growth',
];

const INITIAL_DATA: SubKpi[] = [
  { id: '1', name: 'Revenue Growth',          mainArea: 'Financial Performance',  weight: 40, targetValue: '15',  unit: '%',       status: 'active' },
  { id: '2', name: 'Cost Reduction',           mainArea: 'Financial Performance',  weight: 30, targetValue: '10',  unit: '%',       status: 'active' },
  { id: '3', name: 'Profit Margin',            mainArea: 'Financial Performance',  weight: 30, targetValue: '20',  unit: '%',       status: 'active' },
  { id: '4', name: 'NPS Score',                mainArea: 'Customer Satisfaction',  weight: 50, targetValue: '70',  unit: 'Score',   status: 'active' },
  { id: '5', name: 'Customer Retention Rate',  mainArea: 'Customer Satisfaction',  weight: 50, targetValue: '90',  unit: '%',       status: 'active' },
  { id: '6', name: 'Process Cycle Time',       mainArea: 'Operational Efficiency', weight: 50, targetValue: '5',   unit: 'Days',    status: 'active' },
  { id: '7', name: 'Training Hours Completed', mainArea: 'Employee Development',   weight: 60, targetValue: '40',  unit: 'Hours',   status: 'active' },
  { id: '8', name: 'Ideas Implemented',        mainArea: 'Innovation & Growth',    weight: 60, targetValue: '12',  unit: 'Ideas',   status: 'inactive' },
];

const INITIAL_FORM: SubKpiForm = {
  name: '',
  mainArea: MAIN_AREAS[0],
  weight: '',
  targetValue: '',
  unit: '',
  status: 'active',
};

export default function SubKpiSetupPage() {
  const [subKpis, setSubKpis]         = useState<SubKpi[]>(INITIAL_DATA);
  const [filterArea, setFilterArea]   = useState<string>('all');
  const [modalOpen, setModalOpen]     = useState(false);
  const [modalMode, setModalMode]     = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId]     = useState<string | null>(null);
  const [form, setForm]               = useState<SubKpiForm>(INITIAL_FORM);

  const displayed = subKpis.filter((s) => filterArea === 'all' || s.mainArea === filterArea);

  function openCreate() {
    setModalMode('create');
    setEditingId(null);
    setForm(INITIAL_FORM);
    setModalOpen(true);
  }

  function openEdit(record: SubKpi) {
    setModalMode('edit');
    setEditingId(record.id);
    setForm({
      name: record.name,
      mainArea: record.mainArea,
      weight: String(record.weight),
      targetValue: record.targetValue,
      unit: record.unit,
      status: record.status,
    });
    setModalOpen(true);
  }

  function handleDelete(id: string) {
    setSubKpis((prev) => prev.filter((s) => s.id !== id));
    message.success('Sub KPI deleted.');
  }

  function handleSubmit() {
    const name = form.name.trim();
    const weight = parseFloat(form.weight);
    const targetValue = form.targetValue.trim();
    const unit = form.unit.trim();

    if (!name) { message.error('Sub KPI Name is required.'); return; }
    if (isNaN(weight) || weight < 0 || weight > 100) { message.error('Weight must be 0–100.'); return; }
    if (!targetValue) { message.error('Target Value is required.'); return; }

    if (modalMode === 'edit' && editingId) {
      setSubKpis((prev) =>
        prev.map((s) =>
          s.id === editingId
            ? { ...s, name, mainArea: form.mainArea, weight, targetValue, unit, status: form.status }
            : s,
        ),
      );
      message.success('Sub KPI updated.');
    } else {
      setSubKpis((prev) => [
        ...prev,
        { id: String(Date.now()), name, mainArea: form.mainArea, weight, targetValue, unit, status: form.status },
      ]);
      message.success('Sub KPI added.');
    }
    setModalOpen(false);
  }

  const columns: TableColumnsType<SubKpi> = [
    { title: '#', key: 'sl', width: 48, render: (_v, _r, i) => i + 1 },
    { title: 'Sub KPI Name', dataIndex: 'name', key: 'name', render: (v) => <span style={{ fontWeight: 600 }}>{v}</span> },
    { title: 'Main KPI Area', dataIndex: 'mainArea', key: 'mainArea' },
    { title: 'Weight (%)', dataIndex: 'weight', key: 'weight', width: 100, render: (v: number) => <Tag color="blue">{v}%</Tag> },
    { title: 'Target Value', dataIndex: 'targetValue', key: 'targetValue', width: 110 },
    { title: 'Unit', dataIndex: 'unit', key: 'unit', width: 90 },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (v: SubKpi['status']) => (
        <Tag color={v === 'active' ? 'green' : 'default'} style={{ textTransform: 'capitalize' }}>{v}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_v, record) => (
        <Space size={8}>
          <Button type="text" size="small" icon={<EditOutlined />} style={{ color: '#0f766e' }} onClick={() => openEdit(record)} />
          <Popconfirm
            title="Delete this sub KPI?"
            onConfirm={() => handleDelete(record.id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" size="small" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const areaOptions = [
    { label: 'All Areas', value: 'all' },
    ...MAIN_AREAS.map((a) => ({ label: a, value: a })),
  ];

  return (
    <div className="page-shell">
      <div className="page-header-row">
        <div>
          <h1>Sub KPI Setup</h1>
          <p>Configure sub-KPIs linked to each main KPI area.</p>
        </div>
        <Space>
          <Select
            value={filterArea}
            onChange={setFilterArea}
            options={areaOptions}
            style={{ width: 200 }}
            placeholder="Filter by Main KPI Area"
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add Sub KPI</Button>
        </Space>
      </div>

      <div className="list-surface">
        <Table<SubKpi>
          rowKey="id"
          columns={columns}
          dataSource={displayed}
          pagination={false}
          size="small"
          bordered={false}
          locale={{ emptyText: 'No sub KPIs found.' }}
        />
      </div>

      <Modal
        open={modalOpen}
        title={modalMode === 'edit' ? 'Edit Sub KPI' : 'Add Sub KPI'}
        okText={modalMode === 'edit' ? 'Update' : 'Add'}
        cancelText="Cancel"
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={520}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 6 }}>
          <div>
            <div style={{ marginBottom: 6, fontSize: 12, fontWeight: 700, color: '#4b5563' }}>* SUB KPI NAME</div>
            <Input
              placeholder="e.g. Revenue Growth"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div>
            <div style={{ marginBottom: 6, fontSize: 12, fontWeight: 700, color: '#4b5563' }}>* MAIN KPI AREA</div>
            <Select
              value={form.mainArea}
              onChange={(v) => setForm((p) => ({ ...p, mainArea: v }))}
              style={{ width: '100%' }}
              options={MAIN_AREAS.map((a) => ({ label: a, value: a }))}
            />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 6, fontSize: 12, fontWeight: 700, color: '#4b5563' }}>* WEIGHT (%)</div>
              <Input
                type="number"
                min={0}
                max={100}
                placeholder="e.g. 30"
                value={form.weight}
                onChange={(e) => setForm((p) => ({ ...p, weight: e.target.value }))}
                suffix="%"
              />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 6, fontSize: 12, fontWeight: 700, color: '#4b5563' }}>* TARGET VALUE</div>
              <Input
                placeholder="e.g. 15"
                value={form.targetValue}
                onChange={(e) => setForm((p) => ({ ...p, targetValue: e.target.value }))}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 6, fontSize: 12, fontWeight: 700, color: '#4b5563' }}>UNIT</div>
              <Input
                placeholder="e.g. %, Hours, Score"
                value={form.unit}
                onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 6, fontSize: 12, fontWeight: 700, color: '#4b5563' }}>STATUS</div>
              <Select
                value={form.status}
                onChange={(v) => setForm((p) => ({ ...p, status: v }))}
                style={{ width: '100%' }}
                options={[
                  { label: 'Active', value: 'active' },
                  { label: 'Inactive', value: 'inactive' },
                ]}
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
