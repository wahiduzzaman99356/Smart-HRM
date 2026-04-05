/**
 * EmployeeKPIViewPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Employee KPI View with full approval workflow:
 *  • List view: employee cards with KPI stats, Config button, History button
 *  • Configure view: add/remove sub KPIs → submit for approval (not immediate save)
 *  • Approval button (HR): opens KPIApprovalModal to approve/reject requests
 *  • History button (per employee): opens KPIChangeHistoryModal with rejection reasons
 */

import { useState, useMemo, useCallback, useRef } from 'react';
import {
  Input, Select, Button, Tag, Typography, InputNumber, Avatar,
  Tooltip, Space, Divider, Badge, message, notification,
} from 'antd';
import {
  SearchOutlined, ReloadOutlined, SettingOutlined, DeleteOutlined,
  WarningOutlined, ArrowLeftOutlined, PlusOutlined,
  UndoOutlined, CloseOutlined, CheckCircleOutlined,
  HistoryOutlined, SendOutlined, InfoCircleOutlined,
} from '@ant-design/icons';
import {
  INITIAL_EMPLOYEES,
  INITIAL_SUB_KPIS,
  INITIAL_MAIN_KPI_AREAS,
  type Employee,
  type EmployeeSubKPIConfig,
  type ComparisonOperator,
  type KPIChangeRequest,
  type KPIChangeDetail,
} from '../types/performance.types';
import KPIApprovalModal from '../components/KPIApprovalModal';
import KPIChangeHistoryModal from '../components/KPIChangeHistoryModal';

const { Text, Title } = Typography;
const { Option } = Select;

// ── Operators ─────────────────────────────────────────────────────────────────
const OPERATORS: ComparisonOperator[] = ['>=', '<=', '>', '<', '='];

// ── Avatar helpers ────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  '#ef4444', 'var(--color-primary)', '#7c3aed', '#f59e0b', '#ec4899',
  '#0891b2', '#65a30d', '#ea580c', '#6366f1', '#0284c7',
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

function needsConfig(cfg: EmployeeSubKPIConfig) {
  return cfg.source === 'added' && !cfg.isRemoved &&
    (cfg.weight === 0 || cfg.targetValue === 0 || cfg.responsibleTo.length === 0);
}

// ── Diff builder: compare baseline vs proposed ────────────────────────────────
function buildChanges(
  baseline: EmployeeSubKPIConfig[],
  proposed: EmployeeSubKPIConfig[],
): KPIChangeDetail[] {
  const changes: KPIChangeDetail[] = [];

  const baseMap = new Map(baseline.map(c => [c.subKPIId, c]));
  const propMap = new Map(proposed.map(c => [c.subKPIId, c]));

  for (const [id, prop] of propMap) {
    const base = baseMap.get(id);
    const subKPI = INITIAL_SUB_KPIS.find(s => s.id === id);
    if (!subKPI) continue;

    const common = {
      subKPIId: id,
      subKPIName: subKPI.name,
      subKPICode: subKPI.code,
      mainKPIAreaId: subKPI.mainKPIAreaId,
      mainKPIAreaName: subKPI.mainKPIAreaName,
      mainKPICode: subKPI.mainKPICode,
    };

    if (!base) {
      // Brand-new sub KPI added (not in baseline)
      if (!prop.isRemoved) {
        changes.push({ ...common, type: 'added', newWeight: prop.weight, newOperator: prop.operator, newTargetValue: prop.targetValue, newResponsibleTo: prop.responsibleTo });
      }
    } else {
      // Existed in baseline
      const wasRemoved = base.isRemoved;
      const isNowRemoved = prop.isRemoved;

      if (!wasRemoved && isNowRemoved) {
        changes.push({ ...common, type: 'removed' });
      } else if (wasRemoved && !isNowRemoved) {
        changes.push({ ...common, type: 'added', newWeight: prop.weight, newOperator: prop.operator, newTargetValue: prop.targetValue, newResponsibleTo: prop.responsibleTo });
      } else if (!wasRemoved && !isNowRemoved) {
        const weightChanged    = base.weight !== prop.weight;
        const opChanged        = base.operator !== prop.operator;
        const targetChanged    = base.targetValue !== prop.targetValue;
        if (weightChanged || opChanged || targetChanged) {
          changes.push({
            ...common,
            type: 'modified',
            prevWeight: base.weight,     newWeight: prop.weight,
            prevOperator: base.operator, newOperator: prop.operator,
            prevTargetValue: base.targetValue, newTargetValue: prop.targetValue,
            newResponsibleTo: prop.responsibleTo,
          });
        }
      }
    }
  }

  return changes;
}

// ── Unique ID generator ───────────────────────────────────────────────────────
let _reqSeq = 1;
function genReqId() { return `req-${Date.now()}-${_reqSeq++}`; }

// ══════════════════════════════════════════════════════════════════════════════
// LIST VIEW
// ══════════════════════════════════════════════════════════════════════════════
interface ListViewProps {
  empKPIMap: Record<string, EmployeeSubKPIConfig[]>;
  changeRequests: KPIChangeRequest[];
  onConfigure: (empId: string) => void;
  onOpenHistory: (empId: string) => void;
  onOpenApproval: () => void;
}

function ListView({ empKPIMap, changeRequests, onConfigure, onOpenHistory, onOpenApproval }: ListViewProps) {
  const [searchQ, setSearchQ]   = useState('');
  const [fDesig, setFDesig]     = useState('all');
  const [fDept, setFDept]       = useState('all');
  const [fSection, setFSection] = useState('all');
  const [fMainKPI, setFMainKPI] = useState('all');
  const [fSubKPI, setFSubKPI]   = useState('all');
  const [deletedIds, setDeletedIds] = useState<string[]>([]);

  const designations = useMemo(() => [...new Set(INITIAL_EMPLOYEES.map(e => e.designation))], []);
  const departments  = useMemo(() => [...new Set(INITIAL_EMPLOYEES.map(e => e.department))], []);
  const sections     = useMemo(() => [...new Set(INITIAL_EMPLOYEES.map(e => e.section))], []);

  const pendingCount = changeRequests.filter(r => r.status === 'Pending').length;

  const filteredEmps = useMemo(() => {
    return INITIAL_EMPLOYEES.filter(emp => {
      if (deletedIds.includes(emp.id)) return false;
      const q = searchQ.trim().toLowerCase();
      if (q && !emp.name.toLowerCase().includes(q) && !emp.employeeId.toLowerCase().includes(q)) return false;
      if (fDesig !== 'all'   && emp.designation !== fDesig)   return false;
      if (fDept  !== 'all'   && emp.department  !== fDept)    return false;
      if (fSection !== 'all' && emp.section     !== fSection)  return false;
      if (fMainKPI !== 'all') {
        const has = (empKPIMap[emp.id] ?? []).some(c => c.mainKPIAreaId === fMainKPI && !c.isRemoved);
        if (!has) return false;
      }
      if (fSubKPI !== 'all') {
        const has = (empKPIMap[emp.id] ?? []).some(c => c.subKPIId === fSubKPI && !c.isRemoved);
        if (!has) return false;
      }
      return true;
    });
  }, [searchQ, fDesig, fDept, fSection, fMainKPI, fSubKPI, empKPIMap, deletedIds]);

  const resetFilters = () => {
    setSearchQ(''); setFDesig('all'); setFDept('all');
    setFSection('all'); setFMainKPI('all'); setFSubKPI('all');
  };

  const getEmpStats = useCallback((empId: string) => {
    const cfgs    = empKPIMap[empId] ?? [];
    const active  = cfgs.filter(c => !c.isRemoved);
    const added   = active.filter(c => c.source === 'added');
    const removed = cfgs.filter(c => c.isRemoved && c.source === 'default');
    return { total: active.length, added: added.length, removed: removed.length };
  }, [empKPIMap]);

  const getEmpPending = (empId: string) =>
    changeRequests.filter(r => r.employeeId === empId && r.status === 'Pending').length;

  const getEmpHistory = (empId: string) =>
    changeRequests.filter(r => r.employeeId === empId).length;

  return (
    <div style={{ padding: '16px 20px', background: 'var(--color-primary-tint)', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: 'var(--color-primary)', fontWeight: 700 }}>
            Employee KPI View
          </Title>
          <Text style={{ color: 'var(--color-text-tertiary)', fontSize: 13, fontStyle: 'italic' }}>
            Individual Assessment — configure, submit &amp; track KPI changes
          </Text>
        </div>

        {/* HR Approval button */}
        <Badge count={pendingCount} offset={[-4, 4]}>
          <Button
            icon={<CheckCircleOutlined />}
            onClick={onOpenApproval}
            style={{
              borderRadius: 10, borderColor: 'var(--color-border)', color: 'var(--color-primary)',
              background: pendingCount > 0 ? 'var(--color-primary-tint)' : 'var(--color-bg-surface)',
              fontWeight: 600, paddingInline: 16, height: 38,
              boxShadow: pendingCount > 0 ? '0 0 0 2px rgba(15,118,110,0.15)' : undefined,
            }}
          >
            KPI Approvals
          </Button>
        </Badge>
      </div>

      {/* Pending notice banner */}
      {pendingCount > 0 && (
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 16px', borderRadius: 10, marginBottom: 16,
            background: 'var(--color-status-pending-bg)', border: '1px solid #fde68a',
          }}
        >
          <InfoCircleOutlined style={{ color: '#f59e0b', fontSize: 16 }} />
          <Text style={{ fontSize: 13, color: '#d97706' }}>
            <strong>{pendingCount}</strong> KPI change request{pendingCount !== 1 ? 's are' : ' is'} pending HR approval.
          </Text>
          <Button size="small" type="link" onClick={onOpenApproval} style={{ color: 'var(--color-primary)', padding: 0, fontWeight: 600 }}>
            Review now →
          </Button>
        </div>
      )}

      {/* Filter bar */}
      <div
        style={{
          display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center',
          padding: '12px 16px', background: 'var(--color-bg-surface)', borderRadius: 12,
          marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
        }}
      >
        <Input
          value={searchQ} onChange={e => setSearchQ(e.target.value)}
          placeholder="Search by name or ID..."
          prefix={<SearchOutlined style={{ color: 'var(--color-text-disabled)' }} />}
          style={{ width: 200, borderRadius: 8 }}
          allowClear
        />
        <Select value={fDesig} onChange={setFDesig} style={{ width: 160 }}>
          <Option value="all">All Designations</Option>
          {designations.map(d => <Option key={d} value={d}>{d}</Option>)}
        </Select>
        <Select value={fDept} onChange={setFDept} style={{ width: 160 }}>
          <Option value="all">All Departments</Option>
          {departments.map(d => <Option key={d} value={d}>{d}</Option>)}
        </Select>
        <Select value={fSection} onChange={setFSection} style={{ width: 150 }}>
          <Option value="all">All Sections</Option>
          {sections.map(s => <Option key={s} value={s}>{s}</Option>)}
        </Select>
        <Select value={fMainKPI} onChange={setFMainKPI} style={{ width: 160 }}>
          <Option value="all">All Main KPIs</Option>
          {INITIAL_MAIN_KPI_AREAS.map(a => <Option key={a.id} value={a.id}>{a.code} - {a.name.slice(0, 18)}</Option>)}
        </Select>
        <Select value={fSubKPI} onChange={setFSubKPI} style={{ width: 160 }}>
          <Option value="all">All Sub KPIs</Option>
          {INITIAL_SUB_KPIS.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
        </Select>
        <Button
          type="primary"
          icon={<SearchOutlined />}
          style={{ borderRadius: 8, background: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
        >
          Search
        </Button>
        <Button icon={<ReloadOutlined />} onClick={resetFilters} style={{ borderRadius: 8 }}>
          Reset
        </Button>
        <Text style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--color-text-disabled)' }}>
          {filteredEmps.length} employee{filteredEmps.length !== 1 ? 's' : ''}
        </Text>
      </div>

      {/* Employee cards grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
          gap: 16,
        }}
      >
        {filteredEmps.map(emp => {
          const stats   = getEmpStats(emp.id);
          const pending = getEmpPending(emp.id);
          const history = getEmpHistory(emp.id);
          return (
            <div
              key={emp.id}
              style={{
                background: 'var(--color-bg-surface)', borderRadius: 14,
                border: `1.5px solid ${pending > 0 ? 'rgba(253, 230, 138, 0.4)' : 'var(--color-border)'}`,
                padding: '18px 20px',
                boxShadow: pending > 0 ? '0 2px 8px rgba(245,158,11,0.10)' : '0 1px 4px rgba(0,0,0,0.05)',
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
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <Text strong style={{ fontSize: 15, color: 'var(--color-text-primary)' }}>{emp.name}</Text>
                  <div>
                    <Text style={{ fontSize: 12, color: 'var(--color-text-disabled)' }}>{emp.employeeId}</Text>
                  </div>
                </div>
                {pending > 0 && (
                  <Tooltip title={`${pending} change request pending approval`}>
                    <Tag style={{ background: 'var(--color-status-pending-bg)', borderColor: 'rgba(253, 230, 138, 0.4)', color: '#d97706', borderRadius: 6, fontWeight: 700, fontSize: 11 }}>
                      {pending} Pending
                    </Tag>
                  </Tooltip>
                )}
              </div>

              {/* Designation + dept·section */}
              <div style={{ marginBottom: 10 }}>
                <Text style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{emp.designation}</Text>
                <div>
                  <Text style={{ fontSize: 11, color: 'var(--color-text-disabled)' }}>
                    {emp.department} · {emp.section}
                  </Text>
                </div>
              </div>

              {/* KPI count badges */}
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
                <Tag style={{ background: 'var(--color-primary-tint)', borderColor: 'var(--color-border)', color: 'var(--color-primary)', borderRadius: 6, fontWeight: 600, fontSize: 12 }}>
                  {stats.total} KPIs
                </Tag>
                {stats.added > 0 && (
                  <Tag style={{ background: 'var(--color-status-pending-bg)', borderColor: '#fbbf24', color: '#d97706', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                    {stats.added} custom
                  </Tag>
                )}
                {stats.removed > 0 && (
                  <Tag style={{ background: 'var(--color-status-rejected-bg)', borderColor: 'var(--color-status-rejected-bg)', color: '#be123c', borderRadius: 6, fontSize: 11 }}>
                    -{stats.removed} removed
                  </Tag>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Button
                  size="small"
                  icon={<SettingOutlined />}
                  onClick={() => onConfigure(emp.id)}
                  style={{
                    borderRadius: 8, borderColor: 'var(--color-border)', color: 'var(--color-primary)',
                    background: 'var(--color-primary-tint)', fontSize: 12, fontWeight: 600,
                  }}
                >
                  Configure
                </Button>
                {history > 0 && (
                  <Button
                    size="small"
                    icon={<HistoryOutlined />}
                    onClick={() => onOpenHistory(emp.id)}
                    style={{
                      borderRadius: 8, borderColor: 'rgba(124, 58, 237, 0.22)', color: '#7c3aed',
                      background: 'rgba(124, 58, 237, 0.09)', fontSize: 12,
                    }}
                  >
                    History ({history})
                  </Button>
                )}
                <Button
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => setDeletedIds(p => [...p, emp.id])}
                  style={{
                    borderRadius: 8, borderColor: 'var(--color-status-rejected-bg)', color: '#ef4444',
                    background: 'var(--color-status-rejected-bg)',
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

// ══════════════════════════════════════════════════════════════════════════════
// CONFIGURE VIEW
// ══════════════════════════════════════════════════════════════════════════════
interface ConfigureViewProps {
  empId: string;
  empKPIMap: Record<string, EmployeeSubKPIConfig[]>;
  onSubmit: (empId: string, proposed: EmployeeSubKPIConfig[], changes: KPIChangeDetail[]) => void;
  onBack: () => void;
}

function ConfigureView({ empId, empKPIMap, onSubmit, onBack }: ConfigureViewProps) {
  const emp = INITIAL_EMPLOYEES.find(e => e.id === empId)!;

  // Local working copy
  const [configs, setConfigs] = useState<EmployeeSubKPIConfig[]>(
    () => JSON.parse(JSON.stringify(empKPIMap[empId] ?? []))
  );

  // Sidebar state
  const [selectedAreaId, setSelectedAreaId] = useState<string>(
    () => {
      const first = INITIAL_MAIN_KPI_AREAS.find(a =>
        (empKPIMap[empId] ?? []).some(c => c.mainKPIAreaId === a.id)
      );
      return first?.id ?? INITIAL_MAIN_KPI_AREAS[0].id;
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
      stats[area.id] = {
        active: areaConfigs.filter(c => !c.isRemoved).length,
        needsCfg: areaConfigs.some(c => needsConfig(c)),
      };
    }
    return stats;
  }, [configs]);

  const sidebarAreas = useMemo(() => {
    return INITIAL_MAIN_KPI_AREAS.filter(area => {
      const hasConfig = configs.some(c => c.mainKPIAreaId === area.id);
      const matchSearch = !areaSearch.trim() ||
        area.name.toLowerCase().includes(areaSearch.toLowerCase()) ||
        area.code.toLowerCase().includes(areaSearch.toLowerCase());
      return hasConfig && matchSearch;
    });
  }, [configs, areaSearch]);

  const areaConfigs = useMemo(() => {
    const raw = configs.filter(c => c.mainKPIAreaId === selectedAreaId);
    const addedActive   = raw.filter(c => c.source === 'added'   && !c.isRemoved);
    const defaultActive = raw.filter(c => c.source === 'default' && !c.isRemoved);
    const removed       = raw.filter(c => c.isRemoved);
    return [...addedActive, ...defaultActive, ...removed];
  }, [configs, selectedAreaId]);

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
    setConfigs(prev => prev.map(c => c.subKPIId === subKPIId ? { ...c, [field]: value } : c));
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
      weight: 0, operator: '>=', targetValue: 0,
      responsibleTo: ['Line Manager'], isRemoved: false,
    };
    setConfigs(prev => [newCfg, ...prev]);
    setSelectedAreaId(subKPI.mainKPIAreaId);
    setSelectedAddId(null);
    setAddSearch('');
  };

  // ── Submit for approval ─────────────────────────────────────────────────────
  const handleSubmit = () => {
    const baseline = empKPIMap[empId] ?? [];
    const changes  = buildChanges(baseline, configs);

    if (changes.length === 0) {
      message.info('No changes detected to submit for approval.');
      return;
    }

    const unconfigured = configs.some(c => needsConfig(c));
    if (unconfigured) {
      message.warning('Please complete configuration for all newly added sub KPIs before submitting.');
      return;
    }

    onSubmit(empId, configs, changes);
  };

  // ── Change indicator: has unsaved changes vs baseline ──────────────────────
  const changesCount = useMemo(() => {
    const baseline = empKPIMap[empId] ?? [];
    return buildChanges(baseline, configs).length;
  }, [configs, empKPIMap, empId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--color-primary-tint)' }}>
      {/* Header */}
      <div style={{ padding: '14px 24px', background: 'var(--color-bg-surface)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <Title level={4} style={{ margin: 0, color: 'var(--color-text-primary)' }}>
            Configure KPIs — <span style={{ color: 'var(--color-primary)' }}>{emp.name}</span>
          </Title>
          <Text style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
            Changes will be submitted for HR approval before taking effect.
          </Text>
        </div>
        {changesCount > 0 && (
          <Tag style={{ background: 'var(--color-status-pending-bg)', borderColor: 'rgba(253, 230, 138, 0.4)', color: '#d97706', borderRadius: 6, fontWeight: 700, fontSize: 12 }}>
            {changesCount} pending change{changesCount !== 1 ? 's' : ''}
          </Tag>
        )}
      </div>

      {/* Body: sidebar + main */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Left Sidebar ─────────────────────────────────────────────────── */}
        <div
          style={{
            width: 230, flexShrink: 0,
            background: 'var(--color-bg-surface)', borderRight: '1px solid var(--color-border)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}
        >
          {/* Employee info */}
          <div style={{ padding: '16px 14px 12px', borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar
                size={40}
                style={{ background: avatarColor(emp), fontSize: 13, fontWeight: 700, borderRadius: 10, flexShrink: 0 }}
              >
                {initials(emp.name)}
              </Avatar>
              <div style={{ overflow: 'hidden' }}>
                <Text strong style={{ fontSize: 13, color: 'var(--color-text-primary)', display: 'block' }}>{emp.name}</Text>
                <Text style={{ fontSize: 11, color: 'var(--color-text-disabled)' }}>{emp.employeeId} · {emp.designation}</Text>
              </div>
            </div>
          </div>

          {/* Area search */}
          <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--color-border)' }}>
            <Text style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-tertiary)', letterSpacing: 0.8, display: 'block', marginBottom: 6 }}>
              MAIN KPI AREAS
            </Text>
            <Input
              size="small"
              value={areaSearch}
              onChange={e => setAreaSearch(e.target.value)}
              placeholder="Search main KPI..."
              prefix={<SearchOutlined style={{ color: 'var(--color-text-disabled)', fontSize: 11 }} />}
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
                    background: isSelected ? 'var(--color-primary-tint)' : 'transparent',
                    border: isSelected ? '1px solid var(--color-border)' : '1px solid transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  <div style={{ overflow: 'hidden', flex: 1 }}>
                    <Text style={{ fontSize: 11, fontWeight: 600, color: isSelected ? 'var(--color-primary)' : 'var(--color-text-secondary)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {area.code}
                    </Text>
                    <Text style={{ fontSize: 10, color: 'var(--color-text-tertiary)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {area.name.length > 22 ? area.name.slice(0, 22) + '...' : area.name}
                    </Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    {stats.needsCfg && (
                      <Tooltip title="Needs configuration">
                        <WarningOutlined style={{ color: '#f59e0b', fontSize: 12 }} />
                      </Tooltip>
                    )}
                    <span style={{ fontSize: 10, fontWeight: 700, background: isSelected ? 'var(--color-primary)' : 'var(--color-border)', color: isSelected ? '#fff' : 'var(--color-text-secondary)', borderRadius: 99, padding: '1px 6px', minWidth: 20, textAlign: 'center' }}>
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

            return (
              <>
                {/* Area header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <span style={{ fontSize: 18 }}>🎯</span>
                  <Text strong style={{ fontSize: 16, color: 'var(--color-text-primary)' }}>
                    {area.code}. {area.name}
                  </Text>
                  <Tag style={{ background: 'var(--color-primary-tint)', borderColor: 'var(--color-border)', color: 'var(--color-primary)', borderRadius: 6, fontWeight: 600 }}>
                    {stats.active} KPIs
                  </Tag>
                </div>

                {/* Column header */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 80px 90px 100px 90px 140px 110px',
                    gap: 8, padding: '8px 12px',
                    background: 'var(--color-bg-subtle)', borderRadius: 8, marginBottom: 6,
                    border: '1px solid var(--color-border)',
                  }}
                >
                  {['SUB KPI', 'SOURCE', 'WEIGHT %', 'OPERATOR', 'TARGET', 'RESPONSIBLE TO', ''].map(h => (
                    <Text key={h} style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-tertiary)', letterSpacing: 0.8 }}>{h}</Text>
                  ))}
                </div>

                {/* Sub KPI rows */}
                {areaConfigs.length === 0 ? (
                  <div style={{ padding: 30, textAlign: 'center', color: 'var(--color-text-disabled)', fontSize: 13 }}>
                    No KPIs configured for this area yet.
                  </div>
                ) : (
                  areaConfigs.map(cfg => {
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
                            borderBottom: '1px solid var(--color-border)',
                            opacity: isRemoved ? 0.45 : 1,
                            alignItems: 'center',
                          }}
                        >
                          {/* Sub KPI name */}
                          <div>
                            <Text strong style={{ fontSize: 13, color: isRemoved ? 'var(--color-text-disabled)' : 'var(--color-text-primary)' }}>
                              {subKPI.name}
                            </Text>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                              <span style={{ fontSize: 11 }}>
                                {subKPI.category === 'Manual' ? '🔥' : subKPI.category === 'Leave' ? '🏖️' : subKPI.category === 'Attendance' ? '📅' : '⚠️'}
                              </span>
                              <Text style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                                {subKPI.category} · {subKPI.measurementCriteria.slice(0, 40)}{subKPI.measurementCriteria.length > 40 ? '...' : ''}
                              </Text>
                            </div>
                          </div>

                          {/* Source */}
                          <div>
                            <Tag style={{ borderRadius: 6, fontSize: 11, fontWeight: 600, ...(cfg.source === 'default' ? { background: 'var(--color-status-info-bg)', borderColor: '#bae6fd', color: '#0369a1' } : { background: 'var(--color-status-approved-bg)', borderColor: 'var(--color-status-approved-bg)', color: 'var(--color-status-approved)' }) }}>
                              {cfg.source === 'default' ? 'Default' : 'Added'}
                            </Tag>
                          </div>

                          {/* Weight */}
                          {isRemoved ? <Text style={{ color: 'var(--color-text-disabled)', fontSize: 13 }}>—</Text> : (
                            <InputNumber
                              size="small" min={0} max={100}
                              value={cfg.weight}
                              onChange={v => updateConfig(cfg.subKPIId, 'weight', v ?? 0)}
                              style={{ width: '100%', borderRadius: 6, borderColor: nc && cfg.weight === 0 ? '#f97316' : undefined }}
                              addonAfter="%"
                            />
                          )}

                          {/* Operator */}
                          {isRemoved ? <Text style={{ color: 'var(--color-text-disabled)', fontSize: 13 }}>—</Text> : (
                            <Select size="small" value={cfg.operator} onChange={v => updateConfig(cfg.subKPIId, 'operator', v as ComparisonOperator)} style={{ width: '100%' }}>
                              {OPERATORS.map(op => <Option key={op} value={op}>{op}</Option>)}
                            </Select>
                          )}

                          {/* Target */}
                          {isRemoved ? <Text style={{ color: 'var(--color-text-disabled)', fontSize: 13 }}>—</Text> : (
                            <InputNumber
                              size="small" min={0} max={10000}
                              value={cfg.targetValue}
                              onChange={v => updateConfig(cfg.subKPIId, 'targetValue', v ?? 0)}
                              style={{ width: '100%', borderRadius: 6, borderColor: nc && cfg.targetValue === 0 ? '#f97316' : undefined }}
                            />
                          )}

                          {/* Responsible To */}
                          {isRemoved ? <Text style={{ color: 'var(--color-text-disabled)', fontSize: 13 }}>—</Text> : (
                            <Select
                              size="small" mode="multiple"
                              value={cfg.responsibleTo}
                              onChange={v => updateConfig(cfg.subKPIId, 'responsibleTo', v)}
                              style={{ width: '100%' }} maxTagCount={1}
                              placeholder="Select..."
                              dropdownStyle={{ minWidth: 200 }}
                            >
                              <Option value="Line Manager">Line Manager</Option>
                              <Option value="HR">HR</Option>
                            </Select>
                          )}

                          {/* Action */}
                          {isRemoved ? (
                            <Button size="small" icon={<UndoOutlined />} onClick={() => restoreConfig(cfg.subKPIId)}
                              style={{ borderRadius: 6, borderColor: 'rgba(251, 146, 60, 0.22)', color: '#ea580c', background: 'rgba(249, 115, 22, 0.10)', fontSize: 11 }}>
                              Restore
                            </Button>
                          ) : (
                            <Button size="small" icon={<CloseOutlined />} onClick={() => removeConfig(cfg.subKPIId)}
                              style={{ borderRadius: 6, borderColor: 'var(--color-status-rejected-bg)', color: '#dc2626', background: 'var(--color-status-rejected-bg)', fontSize: 11 }}>
                              Remove
                            </Button>
                          )}
                        </div>

                        {nc && (
                          <div style={{ padding: '4px 12px 6px', borderBottom: '1px solid var(--color-border)' }}>
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
                    background: 'var(--color-bg-subtle)', borderRadius: 12,
                    border: '1.5px dashed #d1d5db',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <PlusOutlined style={{ color: 'var(--color-primary)', fontSize: 14 }} />
                    <Text strong style={{ fontSize: 14, color: 'var(--color-text-primary)' }}>Tag Additional Sub KPI</Text>
                  </div>
                  <Text style={{ fontSize: 12, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: 12 }}>
                    Search and add any Sub KPI not tagged with this employee's designation.
                    Changes will be sent for HR approval.
                  </Text>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Select
                      showSearch value={selectedAddId}
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
                              <Tag style={{ fontSize: 10, margin: 0, borderRadius: 4, padding: '0 5px', background: 'var(--color-primary-tint)', borderColor: 'var(--color-border)', color: 'var(--color-primary)' }}>
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
                      type="primary" icon={<PlusOutlined />}
                      disabled={!selectedAddId}
                      onClick={tagSubKPI}
                      style={{ borderRadius: 8, background: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
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
          background: 'var(--color-bg-surface)', borderTop: '1px solid var(--color-border)',
          boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          style={{ borderRadius: 10, borderColor: 'var(--color-border)', color: 'var(--color-primary)', paddingInline: 20 }}
        >
          Back to Employees
        </Button>
        <Space size={10}>
          {changesCount > 0 && (
            <Text style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
              {changesCount} change{changesCount !== 1 ? 's' : ''} ready to submit
            </Text>
          )}
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSubmit}
            disabled={changesCount === 0}
            style={{
              borderRadius: 10,
              background: changesCount > 0 ? 'var(--color-primary)' : undefined,
              borderColor: changesCount > 0 ? 'var(--color-primary)' : undefined,
              paddingInline: 24,
            }}
          >
            Submit for Approval
          </Button>
        </Space>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ROOT PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function EmployeeKPIViewPage() {
  // ── Persisted KPI map (updated only on approval) ──────────────────────────
  const [empKPIMap, setEmpKPIMap] = useState<Record<string, EmployeeSubKPIConfig[]>>(
    () => buildDefaultConfigs(INITIAL_EMPLOYEES)
  );

  // ── Change requests ───────────────────────────────────────────────────────
  const [changeRequests, setChangeRequests] = useState<KPIChangeRequest[]>([]);

  // ── View state ────────────────────────────────────────────────────────────
  const [view, setView] = useState<'list' | 'configure'>('list');
  const [configEmpId, setConfigEmpId] = useState<string | null>(null);

  // ── Modal state ───────────────────────────────────────────────────────────
  const [approvalOpen, setApprovalOpen]  = useState(false);
  const [historyOpen, setHistoryOpen]    = useState(false);
  const [historyEmpId, setHistoryEmpId]  = useState<string | null>(null);

  // ── Submit for approval ───────────────────────────────────────────────────
  const handleSubmit = (empId: string, proposedConfigs: EmployeeSubKPIConfig[], changes: KPIChangeDetail[]) => {
    const emp = INITIAL_EMPLOYEES.find(e => e.id === empId)!;
    const req: KPIChangeRequest = {
      id: genReqId(),
      employeeId: empId,
      employeeName: emp.name,
      employeeDesignation: emp.designation,
      employeeDepartment: emp.department,
      employeeSection: emp.section,
      employeeAvatarColor: avatarColor(emp),
      requestedBy: 'Current User',
      requestedAt: new Date().toISOString(),
      status: 'Pending',
      changes,
      proposedConfigs,
    };
    setChangeRequests(prev => [req, ...prev]);
    setView('list');
    notification.success({
      message: 'KPI Change Submitted',
      description: `${changes.length} change(s) for ${emp.name} submitted for HR approval.`,
      placement: 'topRight',
      duration: 4,
    });
  };

  // ── HR Approve ────────────────────────────────────────────────────────────
  const handleApprove = (reqId: string) => {
    setChangeRequests(prev => prev.map(r => {
      if (r.id !== reqId) return r;
      // Apply proposed configs to empKPIMap
      setEmpKPIMap(m => ({ ...m, [r.employeeId]: r.proposedConfigs }));
      return {
        ...r,
        status: 'Approved',
        reviewedBy: 'HR Manager',
        reviewedAt: new Date().toISOString(),
      };
    }));
  };

  // ── HR Reject ─────────────────────────────────────────────────────────────
  const handleReject = (reqId: string, remarks: string) => {
    setChangeRequests(prev => prev.map(r =>
      r.id !== reqId ? r : {
        ...r,
        status: 'Rejected',
        reviewedBy: 'HR Manager',
        reviewedAt: new Date().toISOString(),
        remarks,
      }
    ));
  };

  // ── Open configure ────────────────────────────────────────────────────────
  const openConfigure = (empId: string) => {
    setConfigEmpId(empId);
    setView('configure');
  };

  const openHistory = (empId: string) => {
    setHistoryEmpId(empId);
    setHistoryOpen(true);
  };

  return (
    <>
      {view === 'list' ? (
        <ListView
          empKPIMap={empKPIMap}
          changeRequests={changeRequests}
          onConfigure={openConfigure}
          onOpenHistory={openHistory}
          onOpenApproval={() => setApprovalOpen(true)}
        />
      ) : (
        <ConfigureView
          empId={configEmpId!}
          empKPIMap={empKPIMap}
          onSubmit={handleSubmit}
          onBack={() => setView('list')}
        />
      )}

      {/* Approval drawer */}
      <KPIApprovalModal
        open={approvalOpen}
        onClose={() => setApprovalOpen(false)}
        requests={changeRequests}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      {/* History modal */}
      <KPIChangeHistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        employeeId={historyEmpId}
        requests={changeRequests}
      />
    </>
  );
}
