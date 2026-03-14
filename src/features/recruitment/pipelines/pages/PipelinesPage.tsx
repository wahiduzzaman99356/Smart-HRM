import { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Input } from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  AppstoreOutlined,
  TeamOutlined,
  CalendarOutlined,
  PartitionOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  EllipsisOutlined,
  ArrowLeftOutlined,
  FileTextOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import type { Pipeline, PipelineStatus } from '../types/pipeline.types';

interface LocationState {
  from?:            string;
  jobPostingId?:    string;
  jobPostingTitle?: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_PIPELINES: Pipeline[] = [
  {
    id: 'PL-001',
    name: 'Tech Hiring',
    position: 'Software Engineer',
    stages: [
      { id: 's1', name: 'Applied',          order: 1 },
      { id: 's2', name: 'Screening',        order: 2 },
      { id: 's3', name: 'Technical Test',   order: 3 },
      { id: 's4', name: 'Interview',        order: 4 },
      { id: 's5', name: 'Offer',            order: 5 },
      { id: 's6', name: 'Hired',            order: 6 },
    ],
    candidates: 6,
    createdAt: 'Feb 10, 2026',
    status: 'Draft',
    jobPostingId: 'MRF200126-01',
    jobPostingTitle: 'Senior Software Engineer',
  },
  {
    id: 'PL-002',
    name: 'Data Scientist – Template 01',
    position: 'Data Scientist',
    stages: [
      { id: 's1', name: 'Applied',        order: 1 },
      { id: 's2', name: 'CV Review',      order: 2 },
      { id: 's3', name: 'Case Study',     order: 3 },
      { id: 's4', name: 'Panel Interview',order: 4 },
      { id: 's5', name: 'Offer',          order: 5 },
      { id: 's6', name: 'Hired',          order: 6 },
    ],
    candidates: 3,
    createdAt: 'Feb 10, 2026',
    status: 'Active',
    jobPostingId: 'MRF200126-05',
    jobPostingTitle: 'Data Analyst',
  },
  {
    id: 'PL-003',
    name: 'Executive Search',
    position: 'Senior Management',
    stages: [
      { id: 's1', name: 'Sourcing',       order: 1 },
      { id: 's2', name: 'Outreach',       order: 2 },
      { id: 's3', name: 'Screening',      order: 3 },
      { id: 's4', name: 'Interview',      order: 4 },
      { id: 's5', name: 'Reference Check',order: 5 },
      { id: 's6', name: 'Offer',          order: 6 },
      { id: 's7', name: 'Hired',          order: 7 },
    ],
    candidates: 11,
    createdAt: 'Jan 22, 2026',
    status: 'Active',
  },
  {
    id: 'PL-004',
    name: 'Design Track',
    position: 'Product Designer',
    stages: [
      { id: 's1', name: 'Applied',         order: 1 },
      { id: 's2', name: 'Portfolio Review',order: 2 },
      { id: 's3', name: 'Design Task',     order: 3 },
      { id: 's4', name: 'Interview',       order: 4 },
      { id: 's5', name: 'Offer',           order: 5 },
    ],
    candidates: 8,
    createdAt: 'Jan 30, 2026',
    status: 'Active',
  },
  {
    id: 'PL-005',
    name: 'Sales Fast-Track',
    position: 'Sales Executive',
    stages: [
      { id: 's1', name: 'Applied',   order: 1 },
      { id: 's2', name: 'Screening', order: 2 },
      { id: 's3', name: 'Interview', order: 3 },
      { id: 's4', name: 'Offer',     order: 4 },
    ],
    candidates: 20,
    createdAt: 'Mar 01, 2026',
    status: 'Draft',
  },
  {
    id: 'PL-006',
    name: 'Graduate Programme',
    position: 'Management Trainee',
    stages: [
      { id: 's1', name: 'Applied',         order: 1 },
      { id: 's2', name: 'Online Assessment',order: 2 },
      { id: 's3', name: 'Group Discussion',order: 3 },
      { id: 's4', name: 'HR Interview',    order: 4 },
      { id: 's5', name: 'Offer',           order: 5 },
      { id: 's6', name: 'Hired',           order: 6 },
    ],
    candidates: 45,
    createdAt: 'Feb 25, 2026',
    status: 'Archived',
  },
];

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_STYLE: Record<PipelineStatus, React.CSSProperties> = {
  Active: {
    background: '#0f766e',
    color: '#ffffff',
    border: 'none',
  },
  Draft: {
    background: '#f1f5f9',
    color: '#64748b',
    border: '1px solid #e2e8f0',
  },
  Archived: {
    background: '#fef3c7',
    color: '#92400e',
    border: '1px solid #fde68a',
  },
};

function StatusBadge({ status }: { status: PipelineStatus }) {
  return (
    <span style={{
      ...STATUS_STYLE[status],
      display: 'inline-block',
      padding: '3px 14px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
    }}>
      {status}
    </span>
  );
}

// ─── Pipeline card ────────────────────────────────────────────────────────────
function PipelineCard({ pipeline }: { pipeline: Pipeline }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
        transition: 'box-shadow 0.18s, border-color 0.18s',
        boxShadow: hovered ? '0 6px 20px rgba(15,118,110,0.10)' : '0 1px 3px rgba(15,30,60,0.06)',
        borderColor: hovered ? '#99f6e4' : '#e2e8f0',
      }}
    >
      {/* Top accent bar */}
      <div style={{
        height: 3,
        background: pipeline.status === 'Active'
          ? 'linear-gradient(90deg, #0f766e 0%, #14b8a6 100%)'
          : pipeline.status === 'Draft'
          ? '#cbd5e1'
          : '#fcd34d',
      }} />

      <div style={{ padding: '18px 20px 20px' }}>

        {/* Header row — name + action menu */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#111827', lineHeight: 1.3, marginBottom: 3 }}>
              {pipeline.name}
            </div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>
              {pipeline.position}
            </div>
          </div>
          <button
            onClick={e => e.stopPropagation()}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#9ca3af', padding: '2px 4px', borderRadius: 4,
              display: 'flex', alignItems: 'center',
              transition: 'color 0.15s',
            }}
          >
            <EllipsisOutlined style={{ fontSize: 18 }} />
          </button>
        </div>

        {/* Stage progress dots */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 14, marginTop: 12 }}>
          {pipeline.stages.map((stage, i) => (
            <div
              key={stage.id}
              title={stage.name}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background: i === 0
                  ? '#0f766e'
                  : i === 1
                  ? '#34d399'
                  : '#e2e8f0',
              }}
            />
          ))}
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#6b7280', marginBottom: 16, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <PartitionOutlined style={{ fontSize: 12, color: '#9ca3af' }} />
            {pipeline.stages.length} stages
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <TeamOutlined style={{ fontSize: 12, color: '#9ca3af' }} />
            {pipeline.candidates} candidates
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <CalendarOutlined style={{ fontSize: 12, color: '#9ca3af' }} />
            {pipeline.createdAt}
          </span>
        </div>

        {/* Linked job posting */}
        {pipeline.jobPostingTitle && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: 11, color: '#0f766e', fontWeight: 600,
            background: '#f0fdfa', border: '1px solid #99f6e4',
            borderRadius: 6, padding: '3px 8px', marginBottom: 12,
          }}>
            <LinkOutlined style={{ fontSize: 10 }} />
            {pipeline.jobPostingTitle}
          </div>
        )}

        {/* Footer row — status + actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <StatusBadge status={pipeline.status} />
          <div style={{ display: 'flex', gap: 4, opacity: hovered ? 1 : 0, transition: 'opacity 0.15s' }}>
            {(['edit', 'copy', 'delete'] as const).map(action => {
              const icon = action === 'edit'
                ? <EditOutlined />
                : action === 'copy'
                ? <CopyOutlined />
                : <DeleteOutlined />;
              return (
                <button
                  key={action}
                  onClick={e => e.stopPropagation()}
                  style={{
                    width: 28, height: 28,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'none',
                    border: '1px solid #e2e8f0',
                    borderRadius: 6,
                    cursor: 'pointer',
                    color: action === 'delete' ? '#dc2626' : '#6b7280',
                    fontSize: 13,
                    transition: 'background 0.15s, border-color 0.15s',
                  }}
                >
                  {icon}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab pills ────────────────────────────────────────────────────────────────
type TabKey = 'all' | PipelineStatus;
const TABS: { key: TabKey; label: string }[] = [
  { key: 'all',      label: 'All'      },
  { key: 'Active',   label: 'Active'   },
  { key: 'Draft',    label: 'Draft'    },
  { key: 'Archived', label: 'Archived' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PipelinesPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const navState  = (location.state ?? {}) as LocationState;

  const fromJobPostings   = navState.from === 'job-postings';
  const contextPostingId  = navState.jobPostingId;
  const contextPostingTitle = navState.jobPostingTitle;

  const [search,    setSearch]    = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('all');

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: MOCK_PIPELINES.length };
    for (const p of MOCK_PIPELINES) c[p.status] = (c[p.status] ?? 0) + 1;
    return c;
  }, []);

  const filtered = useMemo(() => {
    let rows = MOCK_PIPELINES;
    if (activeTab !== 'all') rows = rows.filter(p => p.status === activeTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.position.toLowerCase().includes(q),
      );
    }
    return rows;
  }, [activeTab, search]);

  return (
    <div className="page-shell">

      {/* ── Back to Job Postings ─────────────────────────────────────────── */}
      {fromJobPostings && (
        <div style={{ marginBottom: 16 }}>
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/recruitment/job-postings')}
            style={{ padding: 0, fontWeight: 600, color: '#0f766e', fontSize: 13 }}
          >
            Back to Job Postings
          </Button>
        </div>
      )}

      {/* ── Job posting context banner ────────────────────────────────────── */}
      {contextPostingId && contextPostingTitle && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 16px', marginBottom: 20,
          background: '#f0fdfa', border: '1px solid #99f6e4',
          borderLeft: '3px solid #0f766e', borderRadius: 8,
          fontSize: 13,
        }}>
          <FileTextOutlined style={{ color: '#0f766e', fontSize: 15 }} />
          <span style={{ color: '#374151' }}>
            Creating pipeline for job posting:
          </span>
          <span style={{ fontWeight: 700, color: '#0f766e' }}>
            {contextPostingTitle}
          </span>
          <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 4 }}>
            ({contextPostingId})
          </span>
        </div>
      )}

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="page-header-row">
        <div>
          <h1>Pipelines</h1>
          <p>Manage hiring pipelines and stage configurations</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button icon={<AppstoreOutlined />}>Templates</Button>
          <Button type="primary" icon={<PlusOutlined />}>
            {contextPostingTitle ? `New Pipeline for ${contextPostingTitle}` : 'New Pipeline'}
          </Button>
        </div>
      </div>

      {/* ── Search ───────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 16 }}>
        <Input
          prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
          placeholder="Search pipelines by name or position..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          allowClear
          style={{ width: 360, borderRadius: 8 }}
        />
      </div>

      {/* ── Status tabs ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {TABS.map(tab => {
          const count   = counts[tab.key === 'all' ? 'all' : tab.key] ?? 0;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 10,
                border: isActive ? '1.5px solid #0f766e' : '1.5px solid #d8e7e5',
                background: isActive ? '#f0fdfa' : '#ffffff',
                color: isActive ? '#0f766e' : '#374151',
                fontWeight: isActive ? 700 : 500,
                fontSize: 13, fontFamily: 'inherit', cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                minWidth: 20, height: 20, borderRadius: 10,
                fontSize: 11, fontWeight: 700, padding: '0 5px',
                background: isActive ? '#0f766e' : '#e5e7eb',
                color:      isActive ? '#ffffff' : '#6b7280',
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Pipeline cards grid ───────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 10, padding: '60px 0', color: '#9ca3af',
        }}>
          <PartitionOutlined style={{ fontSize: 36, color: '#d1d5db' }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>No pipelines found</div>
          <div style={{ fontSize: 13 }}>Try adjusting your search or create a new pipeline.</div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 16,
        }}>
          {filtered.map(pipeline => (
            <PipelineCard key={pipeline.id} pipeline={pipeline} />
          ))}
        </div>
      )}

    </div>
  );
}
