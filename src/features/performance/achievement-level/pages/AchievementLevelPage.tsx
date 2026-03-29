/**
 * AchievementLevelPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Configure achievement bands / levels for KPI scoring in Performance Management.
 * Supports Add / Edit and Delete operations with color-coded level badges.
 */

import { useState } from 'react';
import { Button, Input, Modal, Popconfirm, Select, Space, Table, Tag, message } from 'antd';
import type { TableColumnsType } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';

type LevelColor = 'green' | 'blue' | 'orange' | 'red' | 'default';

interface AchievementLevel {
  id: string;
  name: string;
  minScore: number;
  maxScore: number;
  color: LevelColor;
  description: string;
}

interface LevelForm {
  name: string;
  minScore: string;
  maxScore: string;
  color: LevelColor;
  description: string;
}

const COLOR_OPTIONS: { label: string; value: LevelColor; hex: string }[] = [
  { label: 'Green',   value: 'green',   hex: '#059669' },
  { label: 'Blue',    value: 'blue',    hex: '#0284c7' },
  { label: 'Orange',  value: 'orange',  hex: '#d97706' },
  { label: 'Red',     value: 'red',     hex: '#dc2626' },
  { label: 'Default', value: 'default', hex: '#6b7280' },
];

const INITIAL_LEVELS: AchievementLevel[] = [
  { id: '1', name: 'Outstanding',            minScore: 90, maxScore: 100, color: 'green',   description: 'Significantly exceeds all expectations. Exemplary performance.' },
  { id: '2', name: 'Exceeds Expectations',   minScore: 75, maxScore: 89,  color: 'blue',    description: 'Consistently exceeds defined targets and goals.' },
  { id: '3', name: 'Meets Expectations',     minScore: 60, maxScore: 74,  color: 'orange',  description: 'Meets the required performance targets satisfactorily.' },
  { id: '4', name: 'Needs Improvement',      minScore: 40, maxScore: 59,  color: 'red',     description: 'Does not consistently meet required standards. Improvement needed.' },
  { id: '5', name: 'Unsatisfactory',         minScore: 0,  maxScore: 39,  color: 'default', description: 'Fails to meet minimum performance requirements.' },
];

const INITIAL_FORM: LevelForm = {
  name: '',
  minScore: '',
  maxScore: '',
  color: 'green',
  description: '',
};

export default function AchievementLevelPage() {
  const [levels, setLevels]         = useState<AchievementLevel[]>(INITIAL_LEVELS);
  const [modalOpen, setModalOpen]   = useState(false);
  const [modalMode, setModalMode]   = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [form, setForm]             = useState<LevelForm>(INITIAL_FORM);

  function openCreate() {
    setModalMode('create');
    setEditingId(null);
    setForm(INITIAL_FORM);
    setModalOpen(true);
  }

  function openEdit(level: AchievementLevel) {
    setModalMode('edit');
    setEditingId(level.id);
    setForm({
      name: level.name,
      minScore: String(level.minScore),
      maxScore: String(level.maxScore),
      color: level.color,
      description: level.description,
    });
    setModalOpen(true);
  }

  function handleDelete(id: string) {
    setLevels((prev) => prev.filter((l) => l.id !== id));
    message.success('Achievement level deleted.');
  }

  function handleSubmit() {
    const name = form.name.trim();
    const min = parseInt(form.minScore, 10);
    const max = parseInt(form.maxScore, 10);
    const description = form.description.trim();

    if (!name) { message.error('Level Name is required.'); return; }
    if (isNaN(min) || min < 0 || min > 100) { message.error('Min Score must be 0–100.'); return; }
    if (isNaN(max) || max < 0 || max > 100) { message.error('Max Score must be 0–100.'); return; }
    if (min > max) { message.error('Min Score cannot be greater than Max Score.'); return; }

    if (modalMode === 'edit' && editingId) {
      setLevels((prev) =>
        prev.map((l) =>
          l.id === editingId
            ? { ...l, name, minScore: min, maxScore: max, color: form.color, description }
            : l,
        ),
      );
      message.success('Achievement level updated.');
    } else {
      setLevels((prev) => [
        ...prev,
        { id: String(Date.now()), name, minScore: min, maxScore: max, color: form.color, description },
      ]);
      message.success('Achievement level added.');
    }
    setModalOpen(false);
  }

  const sortedLevels = [...levels].sort((a, b) => b.minScore - a.minScore);

  const columns: TableColumnsType<AchievementLevel> = [
    { title: '#', key: 'sl', width: 48, render: (_v, _r, i) => i + 1 },
    {
      title: 'Level Name',
      dataIndex: 'name',
      key: 'name',
      render: (v: string, record) => (
        <Tag
          color={record.color}
          style={{ fontSize: 13, fontWeight: 700, padding: '3px 10px', marginInlineEnd: 0 }}
        >
          {v}
        </Tag>
      ),
    },
    {
      title: 'Min Score (%)',
      dataIndex: 'minScore',
      key: 'minScore',
      width: 120,
      render: (v: number) => <span style={{ fontWeight: 600 }}>{v}%</span>,
    },
    {
      title: 'Max Score (%)',
      dataIndex: 'maxScore',
      key: 'maxScore',
      width: 120,
      render: (v: number) => <span style={{ fontWeight: 600 }}>{v}%</span>,
    },
    {
      title: 'Score Range',
      key: 'range',
      width: 130,
      render: (_v, record) => (
        <span style={{ color: '#6b7280', fontSize: 12 }}>
          {record.minScore}% – {record.maxScore}%
        </span>
      ),
    },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_v, record) => (
        <Space size={8}>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            style={{ color: '#0f766e' }}
            onClick={() => openEdit(record)}
          />
          <Popconfirm
            title="Delete this achievement level?"
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

  return (
    <div className="page-shell">
      <div className="page-header-row">
        <div>
          <h1>Achievement Level Setup</h1>
          <p>Define KPI performance bands and their score thresholds.</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add Level</Button>
      </div>

      <div className="list-surface">
        <Table<AchievementLevel>
          rowKey="id"
          columns={columns}
          dataSource={sortedLevels}
          pagination={false}
          size="small"
          bordered={false}
          locale={{ emptyText: 'No achievement levels defined.' }}
        />
      </div>

      <Modal
        open={modalOpen}
        title={modalMode === 'edit' ? 'Edit Achievement Level' : 'Add Achievement Level'}
        okText={modalMode === 'edit' ? 'Update' : 'Add'}
        cancelText="Cancel"
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={480}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 6 }}>
          <div>
            <div style={{ marginBottom: 6, fontSize: 12, fontWeight: 700, color: '#4b5563' }}>* LEVEL NAME</div>
            <Input
              placeholder="e.g. Outstanding"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 6, fontSize: 12, fontWeight: 700, color: '#4b5563' }}>* MIN SCORE (%)</div>
              <Input
                type="number"
                min={0}
                max={100}
                placeholder="0"
                value={form.minScore}
                onChange={(e) => setForm((p) => ({ ...p, minScore: e.target.value }))}
                suffix="%"
              />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 6, fontSize: 12, fontWeight: 700, color: '#4b5563' }}>* MAX SCORE (%)</div>
              <Input
                type="number"
                min={0}
                max={100}
                placeholder="100"
                value={form.maxScore}
                onChange={(e) => setForm((p) => ({ ...p, maxScore: e.target.value }))}
                suffix="%"
              />
            </div>
          </div>
          <div>
            <div style={{ marginBottom: 6, fontSize: 12, fontWeight: 700, color: '#4b5563' }}>* BADGE COLOR</div>
            <Select
              value={form.color}
              onChange={(v) => setForm((p) => ({ ...p, color: v }))}
              style={{ width: '100%' }}
              options={COLOR_OPTIONS.map((c) => ({
                label: (
                  <Space size={6}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: 12,
                        height: 12,
                        borderRadius: 3,
                        background: c.hex,
                      }}
                    />
                    {c.label}
                  </Space>
                ),
                value: c.value,
              }))}
            />
          </div>
          <div>
            <div style={{ marginBottom: 6, fontSize: 12, fontWeight: 700, color: '#4b5563' }}>DESCRIPTION</div>
            <Input.TextArea
              rows={3}
              placeholder="Brief description of this achievement level..."
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
