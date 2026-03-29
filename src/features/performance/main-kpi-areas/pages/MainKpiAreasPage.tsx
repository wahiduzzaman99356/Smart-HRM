/**
 * MainKpiAreasPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Manage top-level KPI areas for the Performance Management module.
 * Supports Add / Edit and Active / Inactive toggling.
 */

import { useState } from 'react';
import { Button, Input, Modal, Select, Space, Switch, Table, Tag, message } from 'antd';
import type { TableColumnsType } from 'antd';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';

interface KpiArea {
  id: string;
  name: string;
  description: string;
  weight: number;
  subKpiCount: number;
  status: 'active' | 'inactive';
}

interface KpiAreaForm {
  name: string;
  description: string;
  weight: string;
}

const INITIAL_DATA: KpiArea[] = [
  { id: '1', name: 'Financial Performance',    description: 'Revenue, cost efficiency and profitability targets.',        weight: 30, subKpiCount: 5, status: 'active' },
  { id: '2', name: 'Customer Satisfaction',    description: 'Client retention, NPS and service quality metrics.',         weight: 20, subKpiCount: 4, status: 'active' },
  { id: '3', name: 'Operational Efficiency',   description: 'Process quality, cycle time and productivity benchmarks.',   weight: 20, subKpiCount: 6, status: 'active' },
  { id: '4', name: 'Employee Development',     description: 'Learning hours, certifications and skill growth indicators.',weight: 15, subKpiCount: 3, status: 'active' },
  { id: '5', name: 'Innovation & Growth',      description: 'New ideas implemented, R&D output and market expansion.',    weight: 15, subKpiCount: 3, status: 'inactive' },
];

const INITIAL_FORM: KpiAreaForm = { name: '', description: '', weight: '' };

export default function MainKpiAreasPage() {
  const [areas, setAreas]               = useState<KpiArea[]>(INITIAL_DATA);
  const [modalOpen, setModalOpen]       = useState(false);
  const [modalMode, setModalMode]       = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId]       = useState<string | null>(null);
  const [form, setForm]                 = useState<KpiAreaForm>(INITIAL_FORM);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const displayed = areas.filter((a) => filterStatus === 'all' || a.status === filterStatus);

  function openCreate() {
    setModalMode('create');
    setEditingId(null);
    setForm(INITIAL_FORM);
    setModalOpen(true);
  }

  function openEdit(area: KpiArea) {
    setModalMode('edit');
    setEditingId(area.id);
    setForm({ name: area.name, description: area.description, weight: String(area.weight) });
    setModalOpen(true);
  }

  function handleToggle(area: KpiArea) {
    const next: KpiArea['status'] = area.status === 'active' ? 'inactive' : 'active';
    setAreas((prev) => prev.map((a) => (a.id === area.id ? { ...a, status: next } : a)));
    message.success(`"${area.name}" marked as ${next}.`);
  }

  function handleSubmit() {
    const name = form.name.trim();
    const description = form.description.trim();
    const weight = parseFloat(form.weight);

    if (!name) { message.error('KPI Area Name is required.'); return; }
    if (isNaN(weight) || weight < 0 || weight > 100) { message.error('Weight must be between 0 and 100.'); return; }

    if (modalMode === 'edit' && editingId) {
      setAreas((prev) => prev.map((a) => (a.id === editingId ? { ...a, name, description, weight } : a)));
      message.success('KPI area updated.');
    } else {
      const newArea: KpiArea = {
        id: String(Date.now()),
        name,
        description,
        weight,
        subKpiCount: 0,
        status: 'active',
      };
      setAreas((prev) => [...prev, newArea]);
      message.success('KPI area added.');
    }
    setModalOpen(false);
  }

  const columns: TableColumnsType<KpiArea> = [
    { title: '#', key: 'sl', width: 48, render: (_v, _r, i) => i + 1 },
    { title: 'KPI Area Name', dataIndex: 'name', key: 'name', render: (v) => <span style={{ fontWeight: 600 }}>{v}</span> },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    {
      title: 'Weight (%)',
      dataIndex: 'weight',
      key: 'weight',
      width: 110,
      render: (v: number) => <Tag color="blue">{v}%</Tag>,
    },
    { title: 'Sub KPIs', dataIndex: 'subKpiCount', key: 'subKpiCount', width: 90 },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (v: KpiArea['status']) => (
        <Tag color={v === 'active' ? 'green' : 'default'} style={{ textTransform: 'capitalize' }}>{v}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_v, record) => (
        <Space size={8}>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
            style={{ color: '#0f766e' }}
          />
          <Switch
            size="small"
            checked={record.status === 'active'}
            onChange={() => handleToggle(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="page-shell">
      <div className="page-header-row">
        <div>
          <h1>Main KPI Areas</h1>
          <p>Define and manage top-level KPI categories and their weights.</p>
        </div>
        <Space>
          <Select
            value={filterStatus}
            onChange={setFilterStatus}
            style={{ width: 130 }}
            options={[
              { label: 'All Statuses', value: 'all' },
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ]}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add KPI Area</Button>
        </Space>
      </div>

      <div className="list-surface">
        <Table<KpiArea>
          rowKey="id"
          columns={columns}
          dataSource={displayed}
          pagination={false}
          size="small"
          bordered={false}
          locale={{ emptyText: 'No KPI areas found.' }}
        />
      </div>

      <Modal
        open={modalOpen}
        title={modalMode === 'edit' ? 'Edit KPI Area' : 'Add KPI Area'}
        okText={modalMode === 'edit' ? 'Update' : 'Add'}
        cancelText="Cancel"
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 6 }}>
          <div>
            <div style={{ marginBottom: 6, fontSize: 12, fontWeight: 700, color: '#4b5563' }}>* KPI AREA NAME</div>
            <Input
              placeholder="e.g. Financial Performance"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div>
            <div style={{ marginBottom: 6, fontSize: 12, fontWeight: 700, color: '#4b5563' }}>DESCRIPTION</div>
            <Input.TextArea
              rows={3}
              placeholder="Brief description of this KPI area..."
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
          </div>
          <div>
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
        </div>
      </Modal>
    </div>
  );
}
