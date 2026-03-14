import { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Button, Input } from 'antd';
import {
  ArrowLeftOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
  WarningOutlined,
  UserAddOutlined,
  SettingOutlined,
  SaveOutlined,
  PlusOutlined,
  TeamOutlined,
  HolderOutlined,
} from '@ant-design/icons';

// ─── Types ────────────────────────────────────────────────────────────────────
interface StageType {
  id:      string;
  name:    string;
  dot:     string;   // dot color
  border:  string;   // card border color
}

const DEFAULT_STAGES: StageType[] = [
  { id: 'stage-1', name: 'Initial Screening', dot: '#0f766e', border: '#0f766e' },
  { id: 'stage-2', name: 'Offer Accepted',    dot: '#059669', border: '#059669' },
  { id: 'stage-3', name: 'Rejected',          dot: '#dc2626', border: '#dc2626' },
];

// ─── Stage Card ───────────────────────────────────────────────────────────────
function StageCard({
  stage,
  candidates,
  isFirst,
}: {
  stage:      StageType;
  candidates: number;
  isFirst:    boolean;
}) {
  return (
    <div style={{
      width: 220,
      flexShrink: 0,
      background: '#ffffff',
      border: `1.5px solid ${stage.border}`,
      borderRadius: 10,
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <HolderOutlined style={{ color: '#d1d5db', fontSize: 14, cursor: 'grab' }} />
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: stage.dot, flexShrink: 0 }} />
        <span style={{ fontWeight: 700, fontSize: 13, color: '#111827', flex: 1 }}>{stage.name}</span>
      </div>

      {/* No modules */}
      <div style={{ fontSize: 12, color: '#9ca3af' }}>No modules added</div>

      {/* Candidates */}
      {isFirst && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: '#6b7280', letterSpacing: '0.05em' }}>
          <TeamOutlined style={{ fontSize: 12 }} />
          {candidates} CANDIDATES
        </div>
      )}

      {/* Add Modules */}
      <button style={{
        background: 'none', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 5,
        fontSize: 12, fontWeight: 600, color: '#0f766e',
        padding: 0, fontFamily: 'inherit',
      }}>
        <PlusOutlined style={{ fontSize: 11 }} /> Add Modules
      </button>

      {/* Warning */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#d97706' }}>
        <WarningOutlined style={{ fontSize: 11 }} />
        No modules configured
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
interface LocationState {
  pipelineName?:    string;
  pipelineId?:      string;
  position?:        string;
  candidates?:      number;
}

export default function PipelineDetailPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const state     = (location.state ?? {}) as LocationState;

  const pipelineName = state.pipelineName ?? 'New Pipeline';
  const position     = state.position     ?? 'Software Engineer';
  const candidates   = state.candidates   ?? 0;

  const { id } = useParams<{ id: string }>();
  const [stages,     setStages]     = useState<StageType[]>(DEFAULT_STAGES);
  const [addingStage, setAddingStage] = useState(false);
  const [newStageName, setNewStageName] = useState('');

  const stats = {
    total:    candidates,
    active:   Math.max(0, candidates - 1),
    onHold:   candidates > 0 ? 1 : 0,
    hired:    0,
    rejected: 0,
  };

  const missingModules = stages.length > 0;

  function handleAddStage() {
    if (!newStageName.trim()) return;
    const id = `stage-${Date.now()}`;
    setStages(prev => [...prev, { id, name: newStageName.trim(), dot: '#0f766e', border: '#0f766e' }]);
    setNewStageName('');
    setAddingStage(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f8fafc' }}>

      {/* ── Top header bar ─────────────────────────────────────────────────── */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexShrink: 0,
      }}>
        {/* Back + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            style={{ color: '#6b7280', padding: '0 6px', height: 28, flexShrink: 0 }}
          />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#111827', lineHeight: 1.2 }}>
              {pipelineName}
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 1 }}>
              {position} · {stages.length} stages · {candidates} candidates
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {/* List / Pipeline toggle */}
          <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
            <button
              onClick={() => navigate(`/recruitment/pipelines/${id}/candidates`, {
                state: { pipelineName, position, candidates },
              })}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '5px 12px', border: 'none', cursor: 'pointer',
                background: '#ffffff', color: '#6b7280',
                fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              <UnorderedListOutlined /> List
            </button>
            <button
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '5px 12px', border: 'none', cursor: 'default',
                background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
                color: '#ffffff',
                fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
              }}
            >
              <AppstoreOutlined /> Pipeline
            </button>
          </div>

          {/* Missing modules */}
          {missingModules && (
            <button style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '5px 12px', border: '1px solid #fde68a',
              borderRadius: 8, background: '#fffbeb',
              color: '#d97706', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>
              <WarningOutlined /> Missing modules
            </button>
          )}

          <Button icon={<UserAddOutlined />} size="small" style={{ fontSize: 12 }}>Add Candidate</Button>
          <Button icon={<SettingOutlined />} size="small" style={{ fontSize: 12 }}>Settings</Button>
          <Button icon={<SaveOutlined />} size="small" style={{ fontSize: 12 }}>Save as Template</Button>
          <Button type="primary" icon={<SaveOutlined />} size="small" style={{ fontSize: 12 }}>Save</Button>
        </div>
      </div>

      {/* ── Stats bar ──────────────────────────────────────────────────────── */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '8px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        fontSize: 12,
        flexShrink: 0,
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <TeamOutlined style={{ color: '#9ca3af' }} />
          <span style={{ fontWeight: 700, color: '#111827' }}>{stats.total}</span>
          <span style={{ color: '#6b7280' }}>Total</span>
        </span>
        <StatPill label="Active"    value={stats.active}   color="#0f766e" />
        <StatPill label="On Hold"   value={stats.onHold}   color="#d97706" />
        <StatPill label="Hired"     value={stats.hired}    color="#059669" />
        <StatPill label="Rejected"  value={stats.rejected} color="#dc2626" />
      </div>

      {/* ── Kanban board ───────────────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        overflowX: 'auto',
        overflowY: 'auto',
        padding: 20,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 0,
      }}>
        {stages.map((stage, idx) => (
          <div key={stage.id} style={{ display: 'flex', alignItems: 'flex-start' }}>
            <StageCard stage={stage} candidates={candidates} isFirst={idx === 0} />

            {/* "+" between stages */}
            <div style={{ display: 'flex', alignItems: 'flex-start', paddingTop: 14 }}>
              <button
                onClick={() => setAddingStage(true)}
                style={{
                  width: 28, height: 28, margin: '0 6px',
                  border: '1.5px dashed #cbd5e1', borderRadius: '50%',
                  background: '#ffffff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#9ca3af', fontSize: 14, flexShrink: 0,
                  transition: 'border-color 0.15s, color 0.15s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#0f766e';
                  (e.currentTarget as HTMLElement).style.color = '#0f766e';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#cbd5e1';
                  (e.currentTarget as HTMLElement).style.color = '#9ca3af';
                }}
              >
                <PlusOutlined style={{ fontSize: 12 }} />
              </button>
            </div>
          </div>
        ))}

        {/* Add new stage inline input */}
        {addingStage && (
          <div style={{
            width: 200, flexShrink: 0,
            background: '#ffffff', border: '1.5px dashed #0f766e',
            borderRadius: 10, padding: '12px 14px',
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            <Input
              autoFocus
              placeholder="Stage name…"
              value={newStageName}
              onChange={e => setNewStageName(e.target.value)}
              onPressEnter={handleAddStage}
              size="small"
            />
            <div style={{ display: 'flex', gap: 6 }}>
              <Button type="primary" size="small" onClick={handleAddStage} style={{ flex: 1, fontSize: 12 }}>Add</Button>
              <Button size="small" onClick={() => { setAddingStage(false); setNewStageName(''); }} style={{ fontSize: 12 }}>✕</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Stat pill ────────────────────────────────────────────────────────────────
function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ fontWeight: 700, color }}>{value}</span>
      <span style={{ color: '#6b7280' }}>{label}</span>
    </span>
  );
}
