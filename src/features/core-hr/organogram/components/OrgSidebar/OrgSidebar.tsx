import type { ReactNode } from 'react';
import { Input, Select, Switch, Button, Divider, Badge } from 'antd';
import { SearchOutlined, TeamOutlined, ApartmentOutlined } from '@ant-design/icons';
import type { OrgFilters } from '../../types/organogram.types';
import { DEPT_THEME } from '../../types/organogram.types';

interface OrgSidebarProps {
  employeeCount: number;
  vacantCount:   number;
  filters:       OrgFilters;
  departments:   { value: string; label: string }[];
  onFiltersChange: (p: Partial<OrgFilters>) => void;
  onReset: () => void;
}

export function OrgSidebar({ employeeCount, vacantCount, filters, departments, onFiltersChange, onReset }: OrgSidebarProps) {
  const activeDept    = filters.department;
  const deptTheme     = activeDept && DEPT_THEME[activeDept as keyof typeof DEPT_THEME];
  const highlightColor = deptTheme ? deptTheme.border : '#3b82f6';

  const deptOptions = [{ value: '', label: 'All Departments' }, ...departments];

  return (
    <div style={{ width:260, background:'#ffffff', borderRight:'1px solid #f0f0f0', display:'flex', flexDirection:'column', flexShrink:0, height:'100%', overflowY:'auto' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ padding:'14px 16px 12px', borderBottom:'1px solid #f0f0f0' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <ApartmentOutlined style={{ color:'#fff', fontSize:14 }} />
          </div>
          <span style={{ fontWeight:700, fontSize:14, color:'#111827' }}>Organogram</span>
        </div>

        {/* Stats row */}
        <div style={{ display:'flex', gap:8 }}>
          <StatCard icon={<TeamOutlined style={{ color:'#3b82f6' }} />} value={employeeCount} label="Employees" color="#3b82f6" />
          <StatCard icon={<Badge dot color="orange" />} value={vacantCount} label="Vacant" color="#f59e0b" />
        </div>
      </div>

      <div style={{ padding:'14px 16px', display:'flex', flexDirection:'column', gap:14 }}>

        {/* ── Search ──────────────────────────────────────────────────────── */}
        <div>
          <Label>Find & Highlight</Label>
          <Input
            prefix={<SearchOutlined style={{ color:'#9ca3af' }} />}
            placeholder="Search name or designation…"
            value={filters.search}
            onChange={e => onFiltersChange({ search: e.target.value })}
            allowClear
            style={{ borderRadius:8, marginTop:6 }}
          />
        </div>

        <Divider style={{ margin:'0' }} />

        {/* ── Department filter ────────────────────────────────────────────── */}
        <div>
          <Label>Highlight Department</Label>
          <Select
            style={{ width:'100%', marginTop:6 }}
            options={deptOptions}
            value={filters.department || ''}
            onChange={v => onFiltersChange({ department: v })}
            placeholder="All Departments"
          />
          {activeDept && deptTheme && (
            <div style={{ marginTop:8, padding:'6px 10px', borderRadius:8, background:`${deptTheme.lightBg}`, border:`1px solid ${deptTheme.border}30`, display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:deptTheme.border, flexShrink:0 }} />
              <span style={{ fontSize:11, color:deptTheme.border, fontWeight:500 }}>
                {departments.find(d => d.value === activeDept)?.label} highlighted
              </span>
            </div>
          )}
        </div>

        <Divider style={{ margin:'0' }} />

        {/* ── Visibility toggles ──────────────────────────────────────────── */}
        <div>
          <Label>Visibility</Label>
          <div style={{ display:'flex', flexDirection:'column', gap:10, marginTop:8 }}>
            <ToggleRow label="Dark Mode"        checked={filters.darkMode}       onChange={v => onFiltersChange({ darkMode: v })} />
            <ToggleRow label="Show Grade"       checked={filters.showGrade}      onChange={v => onFiltersChange({ showGrade: v })} accent="#6366f1" />
            <ToggleRow label="Show Open Positions" checked={filters.showVacant}  onChange={v => onFiltersChange({ showVacant: v })} accent="#f59e0b" />
            <ToggleRow label="Show Separation"  checked={filters.showSeparation} onChange={v => onFiltersChange({ showSeparation: v })} accent="#ef4444" />
          </div>
        </div>

        <Divider style={{ margin:'0' }} />

        <Button
          block
          onClick={onReset}
          style={{ borderRadius:8, borderColor:'#e2e8f0', color:'#64748b', fontSize:12 }}
        >
          Reset All Filters
        </Button>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label, color }: { icon: ReactNode; value: number; label: string; color: string }) {
  return (
    <div style={{ flex:1, border:'1px solid #f0f0f0', borderRadius:10, padding:'8px 10px', textAlign:'center' }}>
      <div style={{ fontSize:20, fontWeight:700, color }}>{value}</div>
      <div style={{ fontSize:10, color:'#9ca3af', letterSpacing:0.3, marginTop:1 }}>{label.toUpperCase()}</div>
    </div>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <p style={{ fontSize:10, fontWeight:700, color:'#94a3b8', letterSpacing:0.7, margin:0 }}>{children}</p>;
}

function ToggleRow({ label, checked, onChange, accent = '#3b82f6' }: { label: string; checked: boolean; onChange: (v: boolean) => void; accent?: string }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
        <div style={{ width:6, height:6, borderRadius:'50%', background: checked ? accent : '#d1d5db', flexShrink:0 }} />
        <span style={{ fontSize:12, color:'#374151' }}>{label}</span>
      </div>
      <Switch size="small" checked={checked} onChange={onChange} style={checked ? { background: accent } : {}} />
    </div>
  );
}
