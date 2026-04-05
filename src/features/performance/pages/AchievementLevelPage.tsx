/**
 * AchievementLevelPage.tsx
 * Performance Management → Achievement Level
 * List + Create/Edit per designation configuration.
 */

import { useState, useMemo } from 'react';
import { Input, Select, Button, Tag, Typography, InputNumber, Space } from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined,
  ReloadOutlined, SaveOutlined, ArrowLeftOutlined, CloseOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import {
  DEPT_SECTION_DESIG_MAP,
  INITIAL_ACHIEVEMENT_LEVEL_CONFIGS,
  type AchievementLevelRow,
  type AchievementLevelConfig,
  type ScoreOperator,
  type IncrementType,
} from '../types/performance.types';

const { Text, Title } = Typography;
const { Option } = Select;

// ── Score operator display helpers ────────────────────────────────────────────
const SCORE_OP_LABELS: Record<ScoreOperator, string> = {
  more_than: 'More than',
  less_than: 'Less than',
  range:     'Range',
};

const INCREMENT_TYPE_LABELS: Record<IncrementType, string> = {
  above:        'Above',
  exact:        'Exact',
  no_increment: 'No Increment',
};

// Level badge colours cycle
const LEVEL_COLORS = ['#059669', '#0284c7', '#f59e0b', '#ea580c', '#dc2626', '#7c3aed', '#0891b2'];

let _idSeq = 1;
function uid() { return `id_${Date.now()}_${_idSeq++}`; }

function blankLevel(): AchievementLevelRow {
  return {
    id: uid(),
    name: '',
    scoreOperator: 'more_than',
    scoreValue: 0,
    scoreFrom: 0,
    scoreTo: 0,
    incrementType: 'above',
    incrementPercent: 0,
  };
}

function scoreLabel(l: AchievementLevelRow): string {
  if (l.scoreOperator === 'range') return `${l.scoreFrom} – ${l.scoreTo}`;
  if (l.scoreOperator === 'more_than') return `> ${l.scoreValue}`;
  return `< ${l.scoreValue}`;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function AchievementLevelPage() {
  const [configs, setConfigs] = useState<AchievementLevelConfig[]>(
    INITIAL_ACHIEVEMENT_LEVEL_CONFIGS
  );
  const [view, setView]       = useState<'list' | 'form'>('list');
  const [editId, setEditId]   = useState<string | null>(null);

  // ── Form fields ──────────────────────────────────────────────────────────
  const [formDept,    setFormDept]    = useState('');
  const [formSection, setFormSection] = useState('');
  const [formDesig,   setFormDesig]   = useState('');
  const [formLevels,  setFormLevels]  = useState<AchievementLevelRow[]>([blankLevel()]);

  // ── List filters ──────────────────────────────────────────────────────────
  const [fDept,    setFDept]    = useState('all');
  const [fSection, setFSection] = useState('all');
  const [fDesig,   setFDesig]   = useState('all');
  const [searchQ,  setSearchQ]  = useState('');

  // ── Cascading form dropdown options ───────────────────────────────────────
  const allDepts = useMemo(
    () => [...new Set(DEPT_SECTION_DESIG_MAP.map(m => m.department))],
    []
  );
  const sectionsForDept = useMemo(
    () => DEPT_SECTION_DESIG_MAP.filter(m => m.department === formDept).map(m => m.section),
    [formDept]
  );
  const desigsForSection = useMemo(() => {
    const entry = DEPT_SECTION_DESIG_MAP.find(
      m => m.department === formDept && m.section === formSection
    );
    return entry?.designations ?? [];
  }, [formDept, formSection]);

  // ── Navigation helpers ────────────────────────────────────────────────────
  const openCreate = () => {
    setEditId(null);
    setFormDept(''); setFormSection(''); setFormDesig('');
    setFormLevels([blankLevel()]);
    setView('form');
  };

  const openEdit = (cfg: AchievementLevelConfig) => {
    setEditId(cfg.id);
    setFormDept(cfg.department);
    setFormSection(cfg.section);
    setFormDesig(cfg.designation);
    setFormLevels(cfg.levels.map(l => ({ ...l })));
    setView('form');
  };

  const handleDeleteConfig = (id: string) =>
    setConfigs(prev => prev.filter(c => c.id !== id));

  const handleSave = () => {
    if (!formDept || !formSection || !formDesig || formLevels.length === 0) return;
    const cfg: AchievementLevelConfig = {
      id: editId ?? uid(),
      department: formDept,
      section:    formSection,
      designation: formDesig,
      levels: formLevels,
    };
    setConfigs(prev =>
      editId ? prev.map(c => c.id === editId ? cfg : c) : [...prev, cfg]
    );
    setView('list');
  };

  // ── Level row mutators ────────────────────────────────────────────────────
  const updateLevel = (id: string, field: keyof AchievementLevelRow, value: unknown) =>
    setFormLevels(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));

  const addLevel    = () => setFormLevels(prev => [...prev, blankLevel()]);
  const removeLevel = (id: string) => setFormLevels(prev => prev.filter(l => l.id !== id));

  // ── Filtered list ────────────────────────────────────────────────────────
  const filteredConfigs = useMemo(() => {
    return configs.filter(cfg => {
      if (fDept    !== 'all' && cfg.department  !== fDept)    return false;
      if (fSection !== 'all' && cfg.section     !== fSection) return false;
      if (fDesig   !== 'all' && cfg.designation !== fDesig)   return false;
      const q = searchQ.trim().toLowerCase();
      if (q && ![cfg.department, cfg.section, cfg.designation].some(s => s.toLowerCase().includes(q)))
        return false;
      return true;
    });
  }, [configs, fDept, fSection, fDesig, searchQ]);

  const allDeptList  = [...new Set(configs.map(c => c.department))];
  const allSecList   = [...new Set(configs.map(c => c.section))];
  const allDesigList = [...new Set(configs.map(c => c.designation))];

  const canSave =
    !!formDept && !!formSection && !!formDesig &&
    formLevels.length > 0 &&
    formLevels.every(l => l.name.trim() !== '');

  // ══════════════════════════════════════════════════════════════════════════
  // LIST VIEW
  // ══════════════════════════════════════════════════════════════════════════
  if (view === 'list') {
    return (
      <div style={{ padding: '16px 20px', background: 'var(--color-primary-tint)', minHeight: '100%' }}>

        {/* Header */}
        <div style={{ marginBottom: 16 }}>
          <Title level={3} style={{ margin: 0, color: 'var(--color-primary)', fontWeight: 700 }}>
            <TrophyOutlined style={{ marginRight: 8 }} />Achievement Level
          </Title>
          <Text style={{ color: 'var(--color-text-tertiary)', fontSize: 13, fontStyle: 'italic' }}>
            Configure score-based achievement levels and increment percentages per designation
          </Text>
        </div>

        {/* Filter + Create bar */}
        <div
          style={{
            display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center',
            justifyContent: 'space-between', padding: '12px 16px',
            background: 'var(--color-bg-surface)', borderRadius: 12, marginBottom: 16,
            boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
          }}
        >
          <Space wrap>
            <Input
              value={searchQ} onChange={e => setSearchQ(e.target.value)}
              placeholder="Search..."
              prefix={<SearchOutlined style={{ color: 'var(--color-text-disabled)' }} />}
              style={{ width: 200, borderRadius: 8 }}
            />
            <Select
              showSearch value={fDept} onChange={setFDept}
              style={{ width: 180 }}
              optionFilterProp="children"
            >
              <Option value="all">All Departments</Option>
              {allDeptList.map(d => <Option key={d} value={d}>{d}</Option>)}
            </Select>
            <Select
              showSearch value={fSection} onChange={setFSection}
              style={{ width: 160 }}
              optionFilterProp="children"
            >
              <Option value="all">All Sections</Option>
              {allSecList.map(s => <Option key={s} value={s}>{s}</Option>)}
            </Select>
            <Select
              showSearch value={fDesig} onChange={setFDesig}
              style={{ width: 160 }}
              optionFilterProp="children"
            >
              <Option value="all">All Designations</Option>
              {allDesigList.map(d => <Option key={d} value={d}>{d}</Option>)}
            </Select>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => { setFDept('all'); setFSection('all'); setFDesig('all'); setSearchQ(''); }}
              style={{ borderRadius: 8 }}
            >
              Reset
            </Button>
          </Space>
          <Button
            type="primary" icon={<PlusOutlined />} onClick={openCreate}
            style={{ borderRadius: 10, background: 'var(--color-primary)', borderColor: 'var(--color-primary)', paddingInline: 18 }}
          >
            + Create
          </Button>
        </div>

        {/* Config cards */}
        {filteredConfigs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-disabled)', fontSize: 14 }}>
            No achievement level configurations found.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredConfigs.map(cfg => (
              <div
                key={cfg.id}
                style={{
                  background: 'var(--color-bg-surface)', borderRadius: 12, padding: '16px 20px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                  border: '1.5px solid #e5e7eb',
                }}
              >
                {/* Card header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                      <Tag style={{ borderRadius: 6, background: 'var(--color-primary-tint)', borderColor: 'var(--color-border)', color: 'var(--color-primary)', fontWeight: 700, fontSize: 12 }}>
                        {cfg.designation}
                      </Tag>
                      <Text style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                        {cfg.department} · {cfg.section}
                      </Text>
                    </div>
                    <Text style={{ fontSize: 11, color: 'var(--color-text-disabled)' }}>
                      {cfg.levels.length} level{cfg.levels.length !== 1 ? 's' : ''} configured
                    </Text>
                  </div>
                  <Space>
                    <Button
                      size="small" icon={<EditOutlined />} onClick={() => openEdit(cfg)}
                      style={{ borderRadius: 8, borderColor: 'var(--color-border)', color: 'var(--color-primary)', background: 'var(--color-primary-tint)' }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small" icon={<DeleteOutlined />} onClick={() => handleDeleteConfig(cfg.id)}
                      style={{ borderRadius: 8, borderColor: 'var(--color-status-rejected-bg)', color: '#ef4444', background: 'var(--color-status-rejected-bg)' }}
                    />
                  </Space>
                </div>

                {/* Level pills row */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${cfg.levels.length}, 1fr)`,
                    gap: 8,
                  }}
                >
                  {cfg.levels.map((lv, idx) => {
                    const color = LEVEL_COLORS[idx % LEVEL_COLORS.length];
                    return (
                      <div
                        key={lv.id}
                        style={{
                          background: color + '12',
                          border: `1.5px solid ${color}44`,
                          borderRadius: 10, padding: '10px 12px',
                        }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: 700, color, display: 'block', marginBottom: 6 }}>
                          {lv.name}
                        </Text>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                            <Text style={{ fontSize: 10, color: 'var(--color-text-disabled)' }}>Score:</Text>
                            <Tag style={{ fontSize: 10, borderRadius: 4, margin: 0, padding: '0 5px', background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                              {SCORE_OP_LABELS[lv.scoreOperator]}
                            </Tag>
                            <Text style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                              {scoreLabel(lv)}
                            </Text>
                          </div>
                          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                            <Text style={{ fontSize: 10, color: 'var(--color-text-disabled)' }}>Increment:</Text>
                            <Tag
                              style={{
                                fontSize: 10, borderRadius: 4, margin: 0, padding: '0 5px',
                                ...(lv.incrementType === 'no_increment'
                                  ? { background: 'var(--color-status-rejected-bg)', borderColor: 'var(--color-status-rejected-bg)', color: '#be123c' }
                                  : { background: 'var(--color-status-approved-bg)', borderColor: 'var(--color-status-approved-bg)', color: 'var(--color-status-approved)' }),
                              }}
                            >
                              {INCREMENT_TYPE_LABELS[lv.incrementType]}
                            </Tag>
                            {lv.incrementType !== 'no_increment' && (
                              <Text style={{ fontSize: 11, fontWeight: 700, color: '#059669' }}>
                                {lv.incrementPercent}%
                              </Text>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // FORM VIEW
  // ══════════════════════════════════════════════════════════════════════════
  const GRID = '160px 150px 200px 150px 110px 36px';

  return (
    <div style={{ padding: '16px 20px', background: 'var(--color-primary-tint)', minHeight: '100%' }}>

      {/* Form header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => setView('list')}
          style={{ borderRadius: 8, borderColor: 'var(--color-border)', color: 'var(--color-primary)' }}
        />
        <div>
          <Title level={4} style={{ margin: 0, color: 'var(--color-text-primary)' }}>
            {editId ? 'Edit' : 'Create'} Achievement Level
          </Title>
          <Text style={{ color: 'var(--color-text-tertiary)', fontSize: 12 }}>
            Select a designation, then configure score-based levels and increment percentages
          </Text>
        </div>
      </div>

      {/* ── Section 1: Target Designation ─────────────────────────────────── */}
      <div
        style={{
          background: 'var(--color-bg-surface)', borderRadius: 12, padding: '20px 24px',
          marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
        }}
      >
        <Text style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 14 }}>
          Target Designation
        </Text>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>

          {/* Department */}
          <div>
            <Text style={{ fontSize: 11, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: 5 }}>
              Department <span style={{ color: '#dc2626' }}>*</span>
            </Text>
            <Select
              showSearch
              value={formDept || undefined}
              placeholder="Select department..."
              style={{ width: '100%' }}
              onChange={v => { setFormDept(v); setFormSection(''); setFormDesig(''); }}
              optionFilterProp="children"
            >
              {allDepts.map(d => <Option key={d} value={d}>{d}</Option>)}
            </Select>
          </div>

          {/* Section */}
          <div>
            <Text style={{ fontSize: 11, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: 5 }}>
              Section <span style={{ color: '#dc2626' }}>*</span>
            </Text>
            <Select
              showSearch
              value={formSection || undefined}
              placeholder="Select section..."
              style={{ width: '100%' }}
              disabled={!formDept}
              onChange={v => { setFormSection(v); setFormDesig(''); }}
              optionFilterProp="children"
            >
              {sectionsForDept.map(s => <Option key={s} value={s}>{s}</Option>)}
            </Select>
          </div>

          {/* Designation */}
          <div>
            <Text style={{ fontSize: 11, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: 5 }}>
              Designation <span style={{ color: '#dc2626' }}>*</span>
            </Text>
            <Select
              showSearch
              value={formDesig || undefined}
              placeholder="Select designation..."
              style={{ width: '100%' }}
              disabled={!formSection}
              onChange={setFormDesig}
              optionFilterProp="children"
            >
              {desigsForSection.map(d => <Option key={d} value={d}>{d}</Option>)}
            </Select>
          </div>
        </div>
      </div>

      {/* ── Section 2: Achievement Levels ──────────────────────────────────── */}
      <div
        style={{
          background: 'var(--color-bg-surface)', borderRadius: 12, padding: '20px 24px',
          marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-secondary)' }}>Achievement Levels</Text>
          <Button
            size="small" icon={<PlusOutlined />} onClick={addLevel}
            style={{ borderRadius: 8, borderColor: 'var(--color-border)', color: 'var(--color-primary)', background: 'var(--color-primary-tint)' }}
          >
            Add Level
          </Button>
        </div>

        {/* Table header */}
        <div
          style={{
            display: 'grid', gridTemplateColumns: GRID,
            gap: 8, padding: '8px 12px',
            background: 'var(--color-bg-subtle)', borderRadius: 8, marginBottom: 6,
            border: '1px solid var(--color-border)',
          }}
        >
          {['LEVEL NAME', 'SCORE OPERATOR', 'SCORE', 'INCREMENT TYPE', 'INCREMENT %', ''].map(h => (
            <Text key={h} style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-tertiary)', letterSpacing: 0.8 }}>
              {h}
            </Text>
          ))}
        </div>

        {/* Level rows */}
        {formLevels.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--color-text-disabled)', fontSize: 13 }}>
            No levels added yet. Click "Add Level" to start.
          </div>
        ) : (
          formLevels.map((level, idx) => (
            <div
              key={level.id}
              style={{
                display: 'grid', gridTemplateColumns: GRID,
                gap: 8, padding: '9px 12px',
                borderBottom: idx < formLevels.length - 1 ? '1px solid var(--color-border)' : 'none',
                alignItems: 'center',
              }}
            >
              {/* Level Name */}
              <Input
                size="small"
                value={level.name}
                onChange={e => updateLevel(level.id, 'name', e.target.value)}
                placeholder="e.g. Excellent"
                style={{ borderRadius: 6 }}
              />

              {/* Score Operator */}
              <Select
                size="small"
                value={level.scoreOperator}
                onChange={v => updateLevel(level.id, 'scoreOperator', v as ScoreOperator)}
                style={{ width: '100%' }}
              >
                <Option value="more_than">More than</Option>
                <Option value="less_than">Less than</Option>
                <Option value="range">Range</Option>
              </Select>

              {/* Score value(s) */}
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                {level.scoreOperator === 'range' ? (
                  <>
                    <InputNumber
                      size="small" min={0} max={100}
                      value={level.scoreFrom}
                      onChange={v => updateLevel(level.id, 'scoreFrom', v ?? 0)}
                      style={{ width: '46%', borderRadius: 6 }}
                      placeholder="From"
                    />
                    <Text style={{ fontSize: 12, color: 'var(--color-text-disabled)', flexShrink: 0 }}>–</Text>
                    <InputNumber
                      size="small" min={0} max={100}
                      value={level.scoreTo}
                      onChange={v => updateLevel(level.id, 'scoreTo', v ?? 0)}
                      style={{ width: '46%', borderRadius: 6 }}
                      placeholder="To"
                    />
                  </>
                ) : (
                  <InputNumber
                    size="small" min={0} max={100}
                    value={level.scoreValue}
                    onChange={v => updateLevel(level.id, 'scoreValue', v ?? 0)}
                    style={{ width: '100%', borderRadius: 6 }}
                    addonAfter="%"
                  />
                )}
              </div>

              {/* Increment Type */}
              <Select
                size="small"
                value={level.incrementType}
                onChange={v => {
                  updateLevel(level.id, 'incrementType', v as IncrementType);
                  if (v === 'no_increment') updateLevel(level.id, 'incrementPercent', 0);
                }}
                style={{ width: '100%' }}
              >
                <Option value="above">Above</Option>
                <Option value="exact">Exact</Option>
                <Option value="no_increment">No Increment</Option>
              </Select>

              {/* Increment % */}
              <InputNumber
                size="small" min={0} max={100}
                value={level.incrementPercent}
                onChange={v => updateLevel(level.id, 'incrementPercent', v ?? 0)}
                disabled={level.incrementType === 'no_increment'}
                style={{ width: '100%', borderRadius: 6 }}
                addonAfter="%"
              />

              {/* Remove */}
              <Button
                size="small" icon={<CloseOutlined />}
                onClick={() => removeLevel(level.id)}
                style={{
                  borderRadius: 6, borderColor: 'var(--color-status-rejected-bg)', color: '#dc2626',
                  background: 'var(--color-status-rejected-bg)', padding: '0 6px',
                }}
              />
            </div>
          ))
        )}
      </div>

      {/* Footer actions */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <Button
          onClick={() => setView('list')}
          style={{ borderRadius: 10, borderColor: 'var(--color-border)', color: 'var(--color-primary)', paddingInline: 20 }}
        >
          Cancel
        </Button>
        <Button
          type="primary" icon={<SaveOutlined />}
          disabled={!canSave}
          onClick={handleSave}
          style={{ borderRadius: 10, background: 'var(--color-primary)', borderColor: 'var(--color-primary)', paddingInline: 24 }}
        >
          Save Configuration
        </Button>
      </div>
    </div>
  );
}
