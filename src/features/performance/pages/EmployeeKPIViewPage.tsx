/**
 * EmployeeKPIViewPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Employee KPI View — list of employees + per-employee KPI configure page.
 */

import { useState, useMemo, useCallback } from 'react';
import {
  Input, Select, Button, Tag, Typography, InputNumber, Avatar,
  Tooltip, Space, Divider,
} from 'antd';
import {
  SearchOutlined, ReloadOutlined, SettingOutlined, DeleteOutlined,
  WarningOutlined, ArrowLeftOutlined, SaveOutlined, PlusOutlined,
  UndoOutlined, CloseOutlined,
} from '@ant-design/icons';
import {
  INITIAL_EMPLOYEES,
  INITIAL_SUB_KPIS,
  INITIAL_MAIN_KPI_AREAS,
  type Employee,
  type EmployeeSubKPIConfig,
  type ComparisonOperator,
  type MeasurementFrequency,
} from '../types/performance.types';

const { Text, Title } = Typography;
const { Option } = Select;

// ── Operators ─────────────────────────────────────────────────────────────────
const OPERATORS: ComparisonOperator[] = ['>=', '<=', '>', '<', '='];
const OP_LABEL: Record<ComparisonOperator, string> = {
  '>=': '>= (>=)', '<=': '<= (<=)', '>': '> (>)', '<': '< (<)', '=': '= (=)',
};

// ── Avatar helpers ────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  '#ef4444','#0f766e','#7c3aed','#f59e0b','#ec4899',
  '#0891b2','#65a30d','#ea580c','#6366f1','#0284c7',
];
function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}
function avatarColor(emp: Employee) {
  return emp.avatarColor ?? AVATAR_COLORS[0];
}

// ── Derive default employee KPI configs from designation configs ───────────────
function buildDefaultConfigs(employees: Employee[]): Record<string, EmployeeSubKPIConfig[]> {
  const map: Record<string, EmployeeSubKPIConfig[]> = {};
  for (const emp of employees) {
    const configs: EmployeeSubKPIConfig[] = [];
    for (const subKPI of INITIAL_SUB_KPIS) {
      const dc = subKPI.designationConfigs.find(d => d.designation === emp.designation);
      if (dc) {
        configs.push({
          subKPIId: subKPI.id,
          mainKPIAreaId: subKPI.mainKPIAreaId,
          source: 'default',
          weight: dc.weight,
          operator: dc.operator,
          targetValue: dc.targetValue,
          responsibleTo: dc.responsibleTo ?? [],
          isRemoved: false,
        });
      }
    }
    map[emp.id] = configs;
  }
  return map;
}

// ── Check if a config entry needs configuration ───────────────────────────────
function needsConfig(cfg: EmployeeSubKPIConfig) {
  return cfg.source === 'added' && !cfg.isRemoved && (cfg.weight === 0 || cfg.targetValue === 0 || cfg.responsibleTo.length === 0);
}

export default function EmployeeKPIViewPage() {
  // ── Persisted state across views ──────────────────────────────────────────
  const [empKPIMap, setEmpKPIMap] = useState<Record<string, EmployeeSubKPIConfig[]>>(
    () => buildDefaultConfigs(INITIAL_EMPLOYEES)
  );

  // ── View state ────────────────────────────────────────────────────────────
  const [view, setView] = useState<'list' | 'configure'>('list');
  const [configEmpId, setConfigEmpId] = useState<string | null>(null);

  // ── List filters ──────────────────────────────────────────────────────────
  const [searchQ, setSearchQ]     = useState('');
  const [fDesig, setFDesig]       = useState('all');
  const [fDept, setFDept]         = useState('all');
  const [fSection, setFSection]   = useState('all');
  const [fMainKPI, setFMainKPI]   = useState('all');
  const [fSubKPI, setFSubKPI]     = useState('all');

  // ── Derived filter options ────────────────────────────────────────────────
  const designations = useMemo(() => [...new Set(INITIAL_EMPLOYEES.map(e => e.designation))], []);
  const departments  = useMemo(() => [...new Set(INITIAL_EMPLOYEES.map(e => e.department))], []);
  const sections     = useMemo(() => [...new Set(INITIAL_EMPLOYEES.map(e => e.section))], []);

  // ── Filtered employee list ────────────────────────────────────────────────
  const filteredEmps = useMemo(() => {
    return INITIAL_EMPLOYEES.filter(emp => {
      const q = searchQ.trim().toLowerCase();
      if (q && !emp.name.toLowerCase().includes(q) && !emp.employeeId.toLowerCase().includes(q)) return false;
      if (fDesig !== 'all' && emp.designation !== fDesig) return false;
      if (fDept  !== 'all' && emp.department !== fDept)   return false;
      if (fSection !== 'all' && emp.section !== fSection)   return false;
      if (fMainKPI !== 'all') {
        const hasArea = (empKPIMap[emp.id] ?? []).some(c => c.mainKPIAreaId === fMainKPI && !c.isRemoved);
        if (!hasArea) return false;
      }
      if (fSubKPI !== 'all') {
        const hasSub = (empKPIMap[emp.id] ?? []).some(c => c.subKPIId === fSubKPI && !c.isRemoved);
        if (!hasSub) return false;
      }
      return true;
    });
  }, [searchQ, fDesig, fDept, fSection, fMainKPI, fSubKPI, empKPIMap]);

  const resetFilters = () => {
    setSearchQ(''); setFDesig('all'); setFDept('all');
    setFSection('all'); setFMainKPI('all'); setFSubKPI('all');
  };

  // ── KPI summary helpers ───────────────────────────────────────────────────
  const getEmpStats = useCallback((empId: string) => {
    const cfgs = empKPIMap[empId] ?? [];
    const active  = cfgs.filter(c => !c.isRemoved);
    const added   = active.filter(c => c.source === 'added');
    const removed = cfgs.filter(c => c.isRemoved && c.source === 'default');
    return { total: active.length, added: added.length, removed: removed.length };
  }, [empKPIMap]);

  // ── Open configure ────────────────────────────────────────────────────────
  const openConfigure = (empId: string) => {
    setConfigEmpId(empId);
    setView('configure');
  };

  // ── Delete employee ───────────────────────────────────────────────────────
  const [deletedEmpIds, setDeletedEmpIds] = useState<string[]>([]);
  const handleDeleteEmp = (empId: string) => setDeletedEmpIds(prev => [...prev, empId]);
  const visibleEmps = filteredEmps.filter(e => !deletedEmpIds.includes(e.id));

  // ══════════════════════════════════════════════════════════════════════════
  // LIST VIEW
  // ══════════════════════════════════════════════════════════════════════════
  if (view === 'list') {
    return (
      <div style={{ padding: '16px 20px', background: '#f0faf8', minHeight: '100%' }}>
        {/* Header */}
        <div style={{ marginBottom: 16 }}>
          <Title level={3} style={{ margin: 0, color: '#0f766e', fontWeight: 700 }}>
            Employee KPI View
          </Title>
          <Text style={{ color: '#6b7280', fontSize: 13, fontStyle: 'italic' }}>Individual Assessment</Text>
        </div>

        {/* Filter bar */}
        <div
          style={{
            display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center',
            padding: '12px 16px', background: '#fff', borderRadius: 12,
            marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
          }}
        >
          <Input
            value={searchQ} onChange={e => setSearchQ(e.target.value)}
            placeholder="Search by name or ID..."
            prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
            style={{ width: 200, borderRadius: 8 }}
          />
          <Select value={fDesig} onChange={setFDesig} style={{ width: 160 }} placeholder="All Designations">
            <Option value="all">All Designations</Option>
            {designations.map(d => <Option key={d} value={d}>{d}</Option>)}
          </Select>
          <Select value={fDept} onChange={setFDept} style={{ width: 160 }} placeholder="All Departments">
            <Option value="all">All Departments</Option>
            {departments.map(d => <Option key={d} value={d}>{d}</Option>)}
          </Select>
          <Select value={fSection} onChange={setFSection} style={{ width: 150 }} placeholder="All Sections">
            <Option value="all">All Sections</Option>
            {sections.map(s => <Option key={s} value={s}>{s}</Option>)}
          </Select>
          <Select value={fMainKPI} onChange={setFMainKPI} style={{ width: 160 }} placeholder="All Main KPIs">
            <Option value="all">All Main KPIs</Option>
            {INITIAL_MAIN_KPI_AREAS.map(a => <Option key={a.id} value={a.id}>{a.code} - {a.name.slice(0, 20)}</Option>)}
          </Select>
          <Select value={fSubKPI} onChange={setFSubKPI} style={{ width: 160 }} placeholder="All Sub KPIs">
            <Option value="all">All Sub KPIs</Option>
            {INITIAL_SUB_KPIS.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
          </Select>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            style={{ borderRadius: 8, background: '#0f766e', borderColor: '#0f766e' }}
          >
            Search
          </Button>
          <Button icon={<ReloadOutlined />} onClick={resetFilters} style={{ borderRadius: 8 }}>
            Reset
          </Button>
        </div>

        {/* Employee cards grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
          }}
        >
          {visibleEmps.map(emp => {
            const stats = getEmpStats(emp.id);
            return (
              <div
                key={emp.id}
                style={{
                  background: '#fff', borderRadius: 14,
                  border: '1.5px solid #e5e7eb',
                  padding: '18px 20px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                  transition: 'box-shadow 0.2s',
                }}
              >
                {/* Employee header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <Avatar
                    size={44}
                    style={{
                      background: avatarColor(emp), fontSize: 14, fontWeight: 700,
                      flexShrink: 0, borderRadius: 12,
                    }}
                  >
                    {initials(emp.name)}
                  </Avatar>
                  <div>
                    <Text strong style={{ fontSize: 15, color: '#111827' }}>{emp.name}</Text>
                    <div>
                      <Text style={{ fontSize: 12, color: '#9ca3af' }}>{emp.employeeId}</Text>
                    </div>
                  </div>
                </div>

                {/* Designation + dept·section */}
                <div style={{ marginBottom: 10 }}>
                  <Text style={{ fontSize: 12, color: '#374151' }}>{emp.designation}</Text>
                  <div>
                    <Text style={{ fontSize: 11, color: '#9ca3af' }}>
                      {emp.department} · {emp.section}
                    </Text>
                  </div>
                </div>

                {/* KPI count badges */}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
                  <Tag
                    style={{
                      background: '#e6f7f4', borderColor: '#a7e3d9', color: '#0f766e',
                      borderRadius: 6, fontWeight: 600, fontSize: 12,
                    }}
                  >
                    {stats.total} KPIs
                  </Tag>
                  {stats.added > 0 && (
                    <Tag
                      style={{
                        background: '#fef3c7', borderColor: '#fbbf24', color: '#92400e',
                        borderRadius: 6, fontSize: 11, fontWeight: 600,
                      }}
                    >
                      {stats.added} custom
                    </Tag>
                  )}
                  {stats.removed > 0 && (
                    <Tag
                      style={{
                        background: '#fff1f2', borderColor: '#fecdd3', color: '#be123c',
                        borderRadius: 6, fontSize: 11,
                      }}
                    >
                      -{stats.removed} removed
                    </Tag>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button
                    size="small"
                    icon={<SettingOutlined />}
                    onClick={() => openConfigure(emp.id)}
                    style={{
                      borderRadius: 8, borderColor: '#a7e3d9', color: '#0f766e',
                      background: '#f0fdf9', fontSize: 12,
                    }}
                  >
                    Configure
                  </Button>
                  <Button
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteEmp(emp.id)}
                    style={{
                      borderRadius: 8, borderColor: '#fecaca', color: '#ef4444',
                      background: '#fff5f5',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // CONFIGURE VIEW
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <ConfigureView
      empId={configEmpId!}
      empKPIMap={empKPIMap}
      onSave={(empId, configs) => {
        setEmpKPIMap(prev => ({ ...prev, [empId]: configs }));
        setView('list');
      }}
      onBack={() => setView('list')}
    />
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CONFIGURE VIEW COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
interface ConfigureViewProps {
  empId: string;
  empKPIMap: Record<string, EmployeeSubKPIConfig[]>;
  onSave: (empId: string, configs: EmployeeSubKPIConfig[]) => void;
  onBack: () => void;
}

function ConfigureView({ empId, empKPIMap, onSave, onBack }: ConfigureViewProps) {
  const emp = INITIAL_EMPLOYEES.find(e => e.id === empId)!;

  // Local working copy — user edits here, saved on "Save All Changes"
  const [configs, setConfigs] = useState<EmployeeSubKPIConfig[]>(
    () => JSON.parse(JSON.stringify(empKPIMap[empId] ?? []))
  );

  // Sidebar state
  const [selectedAreaId, setSelectedAreaId] = useState<string>(
    () => {
      const firstAreaWithKPI = INITIAL_MAIN_KPI_AREAS.find(a =>
        (empKPIMap[empId] ?? []).some(c => c.mainKPIAreaId === a.id)
      );
      return firstAreaWithKPI?.id ?? INITIAL_MAIN_KPI_AREAS[0].id;
    }
  );
  const [areaSearch, setAreaSearch] = useState('');

  // "Tag additional sub KPI" state
  const [addSearch, setAddSearch] = useState('');
  const [selectedAddId, setSelectedAddId] = useState<string | null>(null);

  // ── Derived: area stats for sidebar ──────────────────────────────────────
  const areaStats = useMemo(() => {
    const stats: Record<string, { active: number; needsCfg: boolean }> = {};
    for (const area of INITIAL_MAIN_KPI_AREAS) {
      const areaConfigs = configs.filter(c => c.mainKPIAreaId === area.id);
      const active = areaConfigs.filter(c => !c.isRemoved).length;
      const nc = areaConfigs.some(c => needsConfig(c));
      stats[area.id] = { active, needsCfg: nc };
    }
    return stats;
  }, [configs]);

  // Visible areas in sidebar: areas that have at least 1 config OR are in default
  const sidebarAreas = useMemo(() => {
    return INITIAL_MAIN_KPI_AREAS.filter(area => {
      const hasConfig = configs.some(c => c.mainKPIAreaId === area.id);
      const matchSearch = !areaSearch.trim() ||
        area.name.toLowerCase().includes(areaSearch.toLowerCase()) ||
        area.code.toLowerCase().includes(areaSearch.toLowerCase());
      return hasConfig && matchSearch;
    });
  }, [configs, areaSearch]);

  // ── Derived: sub KPIs for selected area ──────────────────────────────────
  // Sort: added (non-removed) first, then default, removed last
  const areaConfigs = useMemo(() => {
    const raw = configs.filter(c => c.mainKPIAreaId === selectedAreaId);
    const addedActive  = raw.filter(c => c.source === 'added'   && !c.isRemoved);
    const defaultActive = raw.filter(c => c.source === 'default' && !c.isRemoved);
    const removed      = raw.filter(c => c.isRemoved);
    return [...addedActive, ...defaultActive, ...removed];
  }, [configs, selectedAreaId]);

  // ALL sub KPIs not yet tagged for this employee (across all areas)
  const addableSubKPIs = useMemo(() => {
    const alreadyTagged = new Set(configs.map(c => c.subKPIId));
    return INITIAL_SUB_KPIS.filter(s =>
      !alreadyTagged.has(s.id) &&
      (!addSearch.trim() ||
        s.name.toLowerCase().includes(addSearch.toLowerCase()) ||
        s.mainKPICode.toLowerCase().includes(addSearch.toLowerCase()) ||
        s.mainKPIAreaName.toLowerCase().includes(addSearch.toLowerCase()))
    );
  }, [configs, addSearch]);

  // ── Config mutators ────────────────────────────────────────────────────────
  const updateConfig = useCallback((subKPIId: string, field: keyof EmployeeSubKPIConfig, value: unknown) => {
    setConfigs(prev => prev.map(c =>
      c.subKPIId === subKPIId ? { ...c, [field]: value } : c
    ));
  }, []);

  const removeConfig  = (subKPIId: string) => updateConfig(subKPIId, 'isRemoved', true);
  const restoreConfig = (subKPIId: string) => updateConfig(subKPIId, 'isRemoved', false);

  const tagSubKPI = () => {
    if (!selectedAddId) return;
    const subKPI = INITIAL_SUB_KPIS.find(s => s.id === selectedAddId);
    if (!subKPI) return;
    const newCfg: EmployeeSubKPIConfig = {
      subKPIId: subKPI.id,
      mainKPIAreaId: subKPI.mainKPIAreaId,
      source: 'added',
      weight: 0,
      operator: '>=',
      targetValue: 0,
      responsibleTo: ['Line Manager'],
      isRemoved: false,
    };
    // Prepend so it shows at top of its area
    setConfigs(prev => [newCfg, ...prev]);
    // Auto-navigate to the area of the newly tagged sub KPI
    setSelectedAreaId(subKPI.mainKPIAreaId);
    setSelectedAddId(null);
    setAddSearch('');
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f0faf8' }}>
      {/* Header */}
      <div style={{ padding: '14px 24px', background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
        <Title level={4} style={{ margin: 0, color: '#111827' }}>
          Configure KPIs — <span style={{ color: '#0f766e' }}>{emp.name}</span>
        </Title>
      </div>

      {/* Body: sidebar + main */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Left Sidebar ─────────────────────────────────────────────────── */}
        <div
          style={{
            width: 230, flexShrink: 0,
            background: '#fff', borderRight: '1px solid #e5e7eb',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}
        >
          {/* Employee info card */}
          <div style={{ padding: '16px 14px 12px', borderBottom: '1px solid #f3f4f6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar
                size={40}
                style={{ background: avatarColor(emp), fontSize: 13, fontWeight: 700, borderRadius: 10, flexShrink: 0 }}
              >
                {initials(emp.name)}
              </Avatar>
              <div style={{ overflow: 'hidden' }}>
                <Text strong style={{ fontSize: 13, color: '#111827', display: 'block' }}>{emp.name}</Text>
                <Text style={{ fontSize: 11, color: '#9ca3af' }}>{emp.employeeId} · {emp.designation}</Text>
              </div>
            </div>
          </div>

          {/* Area search */}
          <div style={{ padding: '10px 12px', borderBottom: '1px solid #f3f4f6' }}>
            <Text style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', letterSpacing: 0.8, display: 'block', marginBottom: 6 }}>
              MAIN KPI AREAS
            </Text>
            <Input
              size="small"
              value={areaSearch}
              onChange={e => setAreaSearch(e.target.value)}
              placeholder="Search main KPI..."
              prefix={<SearchOutlined style={{ color: '#d1d5db', fontSize: 11 }} />}
              style={{ borderRadius: 7, fontSize: 12 }}
            />
          </div>

          {/* Area list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '6px 8px' }}>
            {sidebarAreas.map(area => {
              const stats = areaStats[area.id] ?? { active: 0, needsCfg: false };
              const isSelected = area.id === selectedAreaId;
              return (
                <div
                  key={area.id}
                  onClick={() => setSelectedAreaId(area.id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '7px 10px', borderRadius: 8, cursor: 'pointer', marginBottom: 2,
                    background: isSelected ? '#e6f7f4' : 'transparent',
                    border: isSelected ? '1px solid #a7e3d9' : '1px solid transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  <div style={{ overflow: 'hidden', flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 11, fontWeight: 600,
                        color: isSelected ? '#0f766e' : '#374151',
                        display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}
                    >
                      {area.code}
                    </Text>
                    <Text style={{ fontSize: 10, color: '#6b7280', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {area.name.length > 22 ? area.name.slice(0, 22) + '...' : area.name}
                    </Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    {stats.needsCfg && (
                      <Tooltip title="Needs configuration">
                        <WarningOutlined style={{ color: '#f59e0b', fontSize: 12 }} />
                      </Tooltip>
                    )}
                    <span
                      style={{
                        fontSize: 10, fontWeight: 700,
                        background: isSelected ? '#0f766e' : '#e5e7eb',
                        color: isSelected ? '#fff' : '#374151',
                        borderRadius: 99, padding: '1px 6px', minWidth: 20, textAlign: 'center',
                      }}
                    >
                      {stats.active}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Main Content ──────────────────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 100px' }}>
          {(() => {
            const area = INITIAL_MAIN_KPI_AREAS.find(a => a.id === selectedAreaId);
            if (!area) return null;
            const stats = areaStats[selectedAreaId] ?? { active: 0 };
            const configsInArea = configs.filter(c => c.mainKPIAreaId === selectedAreaId);

            return (
              <>
                {/* Area header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <span style={{ fontSize: 18 }}>🎯</span>
                  <Text strong style={{ fontSize: 16, color: '#111827' }}>
                    {area.code}. {area.name}
                  </Text>
                  <Tag style={{ background: '#e6f7f4', borderColor: '#a7e3d9', color: '#0f766e', borderRadius: 6, fontWeight: 600 }}>
                    {stats.active} KPIs
                  </Tag>
                </div>

                {/* Table header */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 80px 90px 100px 90px 140px 110px',
                    gap: 8, padding: '8px 12px',
                    background: '#f9fafb', borderRadius: 8, marginBottom: 6,
                    border: '1px solid #f3f4f6',
                  }}
                >
                  {['SUB KPI', 'SOURCE', 'WEIGHT %', 'OPERATOR', 'TARGET %', 'RESPONSIBLE TO', ''].map(h => (
                    <Text key={h} style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', letterSpacing: 0.8 }}>{h}</Text>
                  ))}
                </div>

                {/* Sub KPI rows */}
                {configsInArea.length === 0 ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                    No KPIs configured for this area yet.
                  </div>
                ) : (
                  configsInArea.map(cfg => {
                    const subKPI = INITIAL_SUB_KPIS.find(s => s.id === cfg.subKPIId);
                    if (!subKPI) return null;
                    const isRemoved = cfg.isRemoved;
                    const nc = needsConfig(cfg);

                    return (
                      <div key={cfg.subKPIId}>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 80px 90px 100px 90px 140px 110px',
                            gap: 8, padding: '10px 12px',
                            borderBottom: '1px solid #f3f4f6',
                            opacity: isRemoved ? 0.45 : 1,
                            alignItems: 'center',
                          }}
                        >
                          {/* Sub KPI name + description */}
                          <div>
                            <Text strong style={{ fontSize: 13, color: isRemoved ? '#9ca3af' : '#111827' }}>
                              {subKPI.name}
                            </Text>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                              <span style={{ fontSize: 11 }}>
                                {subKPI.category === 'Manual' ? '🔥' : subKPI.category === 'Leave' ? '🏖️' : subKPI.category === 'Attendance' ? '📅' : '⚠️'}
                              </span>
                              <Text style={{ fontSize: 11, color: '#6b7280' }}>
                                {subKPI.category} · {subKPI.measurementCriteria.slice(0, 40)}{subKPI.measurementCriteria.length > 40 ? '...' : ''}
                              </Text>
                            </div>
                          </div>

                          {/* Source badge */}
                          <div>
                            <Tag
                              style={{
                                borderRadius: 6, fontSize: 11, fontWeight: 600,
                                ...(cfg.source === 'default'
                                  ? { background: '#f0f9ff', borderColor: '#bae6fd', color: '#0369a1' }
                                  : { background: '#f0fdf4', borderColor: '#bbf7d0', color: '#15803d' }),
                              }}
                            >
                              {cfg.source === 'default' ? 'Default' : 'Added'}
                            </Tag>
                          </div>

                          {/* Weight */}
                          {isRemoved ? (
                            <Text style={{ color: '#d1d5db', fontSize: 13 }}>—</Text>
                          ) : (
                            <InputNumber
                              size="small"
                              min={0} max={100}
                              value={cfg.weight}
                              onChange={v => updateConfig(cfg.subKPIId, 'weight', v ?? 0)}
                              style={{
                                width: '100%', borderRadius: 6,
                                borderColor: nc && cfg.weight === 0 ? '#f97316' : undefined,
                              }}
                              addonAfter="%"
                            />
                          )}

                          {/* Operator */}
                          {isRemoved ? (
                            <Text style={{ color: '#d1d5db', fontSize: 13 }}>—</Text>
                          ) : (
                            <Select
                              size="small"
                              value={cfg.operator}
                              onChange={v => updateConfig(cfg.subKPIId, 'operator', v as ComparisonOperator)}
                              style={{ width: '100%' }}
                            >
                              {OPERATORS.map(op => <Option key={op} value={op}>{op}</Option>)}
                            </Select>
                          )}

                          {/* Target */}
                          {isRemoved ? (
                            <Text style={{ color: '#d1d5db', fontSize: 13 }}>—</Text>
                          ) : (
                            <InputNumber
                              size="small"
                              min={0} max={10000}
                              value={cfg.targetValue}
                              onChange={v => updateConfig(cfg.subKPIId, 'targetValue', v ?? 0)}
                              style={{
                                width: '100%', borderRadius: 6,
                                borderColor: nc && cfg.targetValue === 0 ? '#f97316' : undefined,
                              }}
                            />
                          )}

                          {/* Responsible To */}
                          {isRemoved ? (
                            <Text style={{ color: '#d1d5db', fontSize: 13 }}>—</Text>
                          ) : (
                            <Select
                              size="small"
                              mode="multiple"
                              value={cfg.responsibleTo}
                              onChange={v => updateConfig(cfg.subKPIId, 'responsibleTo', v)}
                              style={{ width: '100%' }}
                              maxTagCount={1}
                              placeholder="Select..."
                              dropdownStyle={{ minWidth: 200 }}
                            >
                              <Option value="Line Manager">Line Manager</Option>
                              <Option value="HR">HR</Option>
                            </Select>
                          )}

                          {/* Action */}
                          {isRemoved ? (
                            <Button
                              size="small"
                              icon={<UndoOutlined />}
                              onClick={() => restoreConfig(cfg.subKPIId)}
                              style={{
                                borderRadius: 6, borderColor: '#fed7aa', color: '#ea580c',
                                background: '#fff7ed', fontSize: 11,
                              }}
                            >
                              Restore
                            </Button>
                          ) : (
                            <Button
                              size="small"
                              icon={<CloseOutlined />}
                              onClick={() => removeConfig(cfg.subKPIId)}
                              style={{
                                borderRadius: 6, borderColor: '#fecaca', color: '#dc2626',
                                background: '#fff5f5', fontSize: 11,
                              }}
                            >
                              Remove
                            </Button>
                          )}
                        </div>

                        {/* Warning row for unconfigured added KPIs */}
                        {nc && (
                          <div style={{ padding: '4px 12px 6px', borderBottom: '1px solid #f3f4f6' }}>
                            <Text style={{ fontSize: 11, color: '#f97316' }}>
                              <WarningOutlined style={{ marginRight: 4 }} />
                              Please configure weight and target
                            </Text>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}

                {/* Tag Additional Sub KPI */}
                <div
                  style={{
                    marginTop: 28, padding: '18px 20px',
                    background: '#f9fafb', borderRadius: 12,
                    border: '1.5px dashed #d1d5db',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <PlusOutlined style={{ color: '#0f766e', fontSize: 14 }} />
                    <Text strong style={{ fontSize: 14, color: '#111827' }}>Tag Additional Sub KPI</Text>
                  </div>
                  <Text style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 12 }}>
                    Search and add any Sub KPI not tagged with this employee's designation.
                    The sub KPI's Main KPI area will be highlighted in the sidebar for configuration.
                  </Text>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Select
                      showSearch
                      value={selectedAddId}
                      placeholder="Search sub KPI to add..."
                      filterOption={false}
                      onSearch={setAddSearch}
                      onChange={v => setSelectedAddId(v)}
                      style={{ flex: 1 }}
                      notFoundContent={
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {addableSubKPIs.length === 0 ? 'All sub KPIs already tagged' : 'No match'}
                        </Text>
                      }
                      optionLabelProp="label"
                    >
                      {addableSubKPIs.map(s => (
                        <Option key={s.id} value={s.id} label={s.name}>
                          <div>
                            <Text strong style={{ fontSize: 12 }}>{s.name}</Text>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 1 }}>
                              <Tag style={{ fontSize: 10, margin: 0, borderRadius: 4, padding: '0 5px', background: '#e6f7f4', borderColor: '#a7e3d9', color: '#0f766e' }}>
                                {s.mainKPICode}
                              </Tag>
                              <Text type="secondary" style={{ fontSize: 11 }}>
                                {s.mainKPIAreaName.slice(0, 30)}{s.mainKPIAreaName.length > 30 ? '...' : ''}
                              </Text>
                            </div>
                          </div>
                        </Option>
                      ))}
                    </Select>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      disabled={!selectedAddId}
                      onClick={tagSubKPI}
                      style={{ borderRadius: 8, background: '#0f766e', borderColor: '#0f766e' }}
                    >
                      + Tag Sub KPI
                    </Button>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* ── Fixed footer bar ──────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 24px',
          background: '#fff', borderTop: '1px solid #e5e7eb',
          boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          style={{ borderRadius: 10, borderColor: '#a7e3d9', color: '#0f766e', paddingInline: 20 }}
        >
          Back to Employees
        </Button>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={() => onSave(empId, configs)}
          style={{ borderRadius: 10, background: '#0f766e', borderColor: '#0f766e', paddingInline: 24 }}
        >
          Save All Changes
        </Button>
      </div>
    </div>
  );
}
