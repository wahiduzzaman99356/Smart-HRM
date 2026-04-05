import { useState, useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Button, Input, Select, Table, Dropdown, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import {
  ArrowLeftOutlined,
  SearchOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  UserAddOutlined,
  MoreOutlined,
  FileTextOutlined,
  EyeOutlined,
  SwapOutlined,
  MailOutlined,
  CloseCircleOutlined,
  TeamOutlined,
  TrophyOutlined,
  ApartmentOutlined,
  ClockCircleOutlined,
  FilterOutlined,
  ReloadOutlined,
} from '@ant-design/icons';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Candidate {
  id:            string;
  name:          string;
  initials:      string;
  avatarColor:   string;
  company:       string;
  degree:        string;
  matchScore:    number;
  matchedSkills: string[];
  missingSkills: string[];
  currentStage:  string;
  experience:    number;
  appliedAgo:    string;
  hasCV:         boolean;
}

const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    initials: 'SJ',
    avatarColor: '#7c3aed',
    company: 'ex-Spotify',
    degree: 'B.Des',
    matchScore: 95,
    matchedSkills: ['Figma', 'React'],
    missingSkills: [],
    currentStage: 'Initial Screening',
    experience: 6,
    appliedAgo: '2d ago',
    hasCV: true,
  },
  {
    id: '2',
    name: 'Aisha Rahman',
    initials: 'AR',
    avatarColor: '#0891b2',
    company: 'TechCorp',
    degree: 'M.Sc',
    matchScore: 91,
    matchedSkills: ['TypeScript', 'Node.js'],
    missingSkills: ['AWS'],
    currentStage: 'Culture Fit',
    experience: 5,
    appliedAgo: '4d ago',
    hasCV: true,
  },
  {
    id: '3',
    name: 'James Carter',
    initials: 'JC',
    avatarColor: '#4f46e5',
    company: 'StartupX',
    degree: 'B.Sc',
    matchScore: 76,
    matchedSkills: ['Python', 'SQL'],
    missingSkills: ['React'],
    currentStage: 'Code Assessment',
    experience: 3,
    appliedAgo: '6d ago',
    hasCV: false,
  },
  {
    id: '4',
    name: 'Nadia Hossain',
    initials: 'NH',
    avatarColor: '#be185d',
    company: 'DataLab',
    degree: 'PhD',
    matchScore: 88,
    matchedSkills: ['ML', 'TensorFlow'],
    missingSkills: [],
    currentStage: 'Technical Interview',
    experience: 8,
    appliedAgo: '1d ago',
    hasCV: true,
  },
];

const ALL_STAGES = [
  'Initial Screening', 'Culture Fit', 'Code Assessment',
  'Technical Interview', 'Offer Accepted', 'Rejected',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function matchColor(score: number): string {
  if (score >= 85) return '#059669';
  if (score >= 70) return '#d97706';
  if (score >= 50) return '#ea580c';
  return '#dc2626';
}

function matchTrack(score: number): string {
  if (score >= 85) return 'var(--color-status-approved-bg)';
  if (score >= 70) return 'var(--color-status-pending-bg)';
  if (score >= 50) return 'rgba(249, 115, 22, 0.12)';
  return 'var(--color-status-rejected-bg)';
}

const STAGE_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  'Initial Screening':   { bg: 'var(--color-primary-tint)', color: 'var(--color-primary)', border: '#5eead4' },
  'Culture Fit':         { bg: 'var(--color-status-approved-bg)', color: 'var(--color-status-approved)', border: '#86efac' },
  'Code Assessment':     { bg: 'var(--color-status-info-bg)', color: '#7c3aed', border: '#d8b4fe' },
  'Technical Interview': { bg: 'rgba(249, 115, 22, 0.10)', color: '#c2410c', border: '#fdba74' },
  'Offer Accepted':      { bg: 'var(--color-status-approved-bg)', color: '#059669', border: 'var(--color-status-approved-bg)' },
  'Rejected':            { bg: 'var(--color-status-rejected-bg)', color: '#dc2626', border: 'var(--color-status-rejected-bg)' },
};

function StageBadge({ stage }: { stage: string }) {
  const s = STAGE_STYLE[stage] ?? { bg: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)', border: 'var(--color-border)' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '4px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 700, letterSpacing: '0.03em',
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      whiteSpace: 'nowrap',
    }}>
      {stage}
    </span>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, color, accentColor, icon }: {
  label: string; value: React.ReactNode;
  color: string; accentColor: string; icon: React.ReactNode;
}) {
  return (
    <div style={{
      flex: 1, background: 'var(--color-bg-surface)',
      border: '1px solid var(--color-border)',
      borderLeft: `3px solid ${accentColor}`,
      borderRadius: 10, padding: '14px 18px',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{
          width: 26, height: 26, borderRadius: 7, flexShrink: 0,
          background: `${accentColor}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, color: accentColor,
        }}>
          {icon}
        </span>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, color, lineHeight: 1, paddingLeft: 2 }}>
        {value}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
interface LocationState {
  pipelineName?: string;
  position?:     string;
  candidates?:   number;
}

export default function CandidateListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id }   = useParams<{ id: string }>();
  const state    = (location.state ?? {}) as LocationState;

  const pipelineName = state.pipelineName ?? 'Pipeline';
  const position     = state.position     ?? 'Position';

  const [search,        setSearch]        = useState('');
  const [statusFilter,  setStatusFilter]  = useState<string>('');
  const [stageFilter,   setStageFilter]   = useState<string>('');
  const [sortBy,        setSortBy]        = useState<string>('match');
  const [selectedKeys,  setSelectedKeys]  = useState<string[]>([]);

  const filtered = useMemo(() => {
    let rows = INITIAL_CANDIDATES;
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.matchedSkills.some(s => s.toLowerCase().includes(q)),
      );
    }
    if (stageFilter) rows = rows.filter(c => c.currentStage === stageFilter);
    if (sortBy === 'match')      rows = [...rows].sort((a, b) => b.matchScore - a.matchScore);
    if (sortBy === 'experience') rows = [...rows].sort((a, b) => b.experience - a.experience);
    if (sortBy === 'recent')     rows = [...rows].sort((a, b) => parseInt(a.appliedAgo) - parseInt(b.appliedAgo));
    if (sortBy === 'name')       rows = [...rows].sort((a, b) => a.name.localeCompare(b.name));
    return rows;
  }, [search, stageFilter, sortBy]);

  const stats = useMemo(() => ({
    total:      INITIAL_CANDIDATES.length,
    topMatch:   INITIAL_CANDIDATES.filter(c => c.matchScore >= 90).length,
    inPipeline: INITIAL_CANDIDATES.filter(c => c.currentStage !== 'Rejected').length,
    avgExp:     INITIAL_CANDIDATES.length
      ? (INITIAL_CANDIDATES.reduce((s, c) => s + c.experience, 0) / INITIAL_CANDIDATES.length).toFixed(1)
      : '0.0',
  }), []);

  function handleReset() {
    setSearch('');
    setStatusFilter('');
    setStageFilter('');
    setSortBy('match');
    setSelectedKeys([]);
  }

  function navigateToProfile(c: Candidate) {
    navigate(`/recruitment/pipelines/${id}/candidates/${c.id}`, {
      state: { pipelineName, position },
    });
  }

  const rowMenu = (c: Candidate): MenuProps => ({
    style: { borderRadius: 8, minWidth: 160 },
    items: [
      { key: 'profile', icon: <EyeOutlined />,        label: 'View Profile'      },
      { key: 'move',    icon: <SwapOutlined />,        label: 'Move Stage'        },
      { key: 'email',   icon: <MailOutlined />,        label: 'Send Email'        },
      { type: 'divider' },
      { key: 'reject',  icon: <CloseCircleOutlined />, label: 'Reject Candidate', danger: true },
    ],
    onClick: ({ key }) => {
      if (key === 'profile') navigateToProfile(c);
    },
  });

  const isFiltered = !!(search || statusFilter || stageFilter);

  // ─── Columns ────────────────────────────────────────────────────────────────
  const columns: ColumnsType<Candidate> = [
    {
      title: <span style={{ fontSize: 11, color: 'var(--color-text-disabled)', fontWeight: 700, letterSpacing: '0.06em' }}>CANDIDATE NAME</span>,
      key: 'name',
      width: 230,
      render: (_, c) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
            background: c.avatarColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 800, color: 'var(--color-bg-surface)', letterSpacing: '0.05em',
            boxShadow: `0 0 0 2px ${c.avatarColor}33`,
          }}>
            {c.initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text-primary)', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {c.name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 1 }}>
              {c.company} · {c.degree}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: <span style={{ fontSize: 11, color: 'var(--color-text-disabled)', fontWeight: 700, letterSpacing: '0.06em' }}>AI MATCH ANALYSIS</span>,
      key: 'match',
      render: (_, c) => {
        const mc    = matchColor(c.matchScore);
        const track = matchTrack(c.matchScore);
        return (
          <div style={{ paddingRight: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
              <span style={{ fontWeight: 800, fontSize: 13, color: mc }}>{c.matchScore}%</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-tertiary)' }}>Match</span>
            </div>
            <div style={{ height: 5, borderRadius: 3, background: track, overflow: 'hidden', marginBottom: 6 }}>
              <div style={{ height: '100%', width: `${c.matchScore}%`, background: mc, borderRadius: 3 }} />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'center' }}>
              {c.matchedSkills.map(s => (
                <span key={s} style={{
                  fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 4,
                  background: 'var(--color-primary-tint)', color: 'var(--color-primary)', border: '1px solid #99f6e4',
                }}>
                  {s}
                </span>
              ))}
              {c.missingSkills.length > 0 && (
                <span style={{ fontSize: 10, fontWeight: 700, color: '#dc2626', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <span style={{ color: 'var(--color-status-rejected-bg)' }}>●</span>
                  Missing: {c.missingSkills.join(', ')}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: <span style={{ fontSize: 11, color: 'var(--color-text-disabled)', fontWeight: 700, letterSpacing: '0.06em' }}>CURRENT STAGE</span>,
      key: 'stage',
      width: 180,
      render: (_, c) => <StageBadge stage={c.currentStage} />,
    },
    {
      title: <span style={{ fontSize: 11, color: 'var(--color-text-disabled)', fontWeight: 700, letterSpacing: '0.06em' }}>EXPERIENCE</span>,
      key: 'experience',
      width: 110,
      render: (_, c) => (
        <span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-secondary)' }}>{c.experience}</span>
          <span style={{ fontSize: 11, color: 'var(--color-text-disabled)', marginLeft: 3 }}>{c.experience === 1 ? 'yr' : 'yrs'}</span>
        </span>
      ),
    },
    {
      title: <span style={{ fontSize: 11, color: 'var(--color-text-disabled)', fontWeight: 700, letterSpacing: '0.06em' }}>APPLIED</span>,
      key: 'applied',
      width: 90,
      render: (_, c) => (
        <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)', fontWeight: 500 }}>{c.appliedAgo}</span>
      ),
    },
    {
      title: <span style={{ fontSize: 11, color: 'var(--color-text-disabled)', fontWeight: 700, letterSpacing: '0.06em' }}>CV</span>,
      key: 'cv',
      width: 56,
      render: (_, c) => c.hasCV ? (
        <Tooltip title="Download CV">
          <FileTextOutlined style={{ fontSize: 16, color: 'var(--color-text-disabled)', cursor: 'pointer', transition: 'color 0.15s' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--color-primary)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--color-text-disabled)')}
          />
        </Tooltip>
      ) : (
        <span style={{ color: 'var(--color-text-disabled)', fontSize: 14, fontWeight: 700 }}>—</span>
      ),
    },
    {
      title: <span style={{ fontSize: 11, color: 'var(--color-text-disabled)', fontWeight: 700, letterSpacing: '0.06em' }}>ACTIONS</span>,
      key: 'actions',
      width: 64,
      align: 'center',
      render: (_, c) => (
        <Dropdown menu={rowMenu(c)} trigger={['click']} placement="bottomRight">
          <button
            onClick={e => e.stopPropagation()}
            style={{
              width: 28, height: 28, border: 'none', cursor: 'pointer',
              borderRadius: 7, background: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-text-disabled)', transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-subtle)';
              (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.color = 'var(--color-text-disabled)';
            }}
          >
            <MoreOutlined style={{ fontSize: 16 }} />
          </button>
        </Dropdown>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--color-bg-subtle)' }}>

      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <div style={{
        background: 'var(--color-bg-surface)', borderBottom: '1px solid var(--color-border)',
        padding: '0 20px', height: 52,
        display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0,
      }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ color: 'var(--color-text-tertiary)', padding: '0 6px', height: 28, flexShrink: 0 }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', lineHeight: 1, marginBottom: 3 }}>
            <span
              onClick={() => navigate('/recruitment/job-postings')}
              style={{ cursor: 'pointer', color: 'var(--color-text-tertiary)', transition: 'color 0.15s' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--color-primary)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--color-text-tertiary)')}
            >
              Jobs
            </span>
            <span style={{ margin: '0 5px', color: 'var(--color-border)' }}>›</span>
            <span>{position}</span>
          </div>
          <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--color-text-primary)', lineHeight: 1 }}>
            {pipelineName}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', border: '1.5px solid #d8e7e5', borderRadius: 9, overflow: 'hidden' }}>
            <button style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '5px 13px', border: 'none', cursor: 'default',
              background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
              color: 'var(--color-bg-surface)', fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
            }}>
              <UnorderedListOutlined style={{ fontSize: 12 }} /> List
            </button>
            <button
              onClick={() => navigate(`/recruitment/pipelines/${id}`, {
                state: { pipelineName, position, candidates: stats.total },
              })}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '5px 13px', border: 'none', cursor: 'pointer',
                background: 'var(--color-bg-surface)', color: 'var(--color-text-tertiary)',
                fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
                borderLeft: '1.5px solid #d8e7e5', transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'var(--color-primary-tint)';
                (e.currentTarget as HTMLElement).style.color = 'var(--color-primary)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-surface)';
                (e.currentTarget as HTMLElement).style.color = 'var(--color-text-tertiary)';
              }}
            >
              <AppstoreOutlined style={{ fontSize: 12 }} /> Pipeline
            </button>
          </div>

          <Button
            type="primary"
            icon={<UserAddOutlined />}
            size="small"
            style={{ fontSize: 12, height: 30, paddingInline: 14, fontWeight: 600 }}
          >
            Add Candidate
          </Button>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 12 }}>
          <StatCard label="Total Candidates" value={stats.total}      color="#111827" accentColor="#64748b" icon={<TeamOutlined />}       />
          <StatCard label="Top Match (>90%)" value={stats.topMatch}   color="#059669" accentColor="#059669" icon={<TrophyOutlined />}     />
          <StatCard label="In Pipeline"      value={stats.inPipeline} color="#0f766e" accentColor="#0f766e" icon={<ApartmentOutlined />}  />
          <StatCard label="Avg Experience"   value={`${stats.avgExp} yrs`} color="#111827" accentColor="#94a3b8" icon={<ClockCircleOutlined />} />
        </div>

        {/* Filter bar */}
        <div style={{
          background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 10,
          padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
        }}>
          <Input
            prefix={<SearchOutlined style={{ color: 'var(--color-text-disabled)', fontSize: 13 }} />}
            placeholder="Search by name or skills..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            allowClear
            style={{ width: 240, borderRadius: 7 }}
            size="small"
          />
          <div style={{ width: 1, height: 22, background: 'var(--color-border)' }} />
          <Select
            placeholder={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><FilterOutlined style={{ fontSize: 11 }} /> All Status</span>}
            style={{ width: 140 }}
            value={statusFilter || undefined}
            onChange={v => setStatusFilter(v ?? '')}
            allowClear size="small"
            options={[
              { value: 'active',   label: 'Active'   },
              { value: 'on-hold',  label: 'On Hold'  },
              { value: 'hired',    label: 'Hired'    },
              { value: 'rejected', label: 'Rejected' },
            ]}
          />
          <Select
            placeholder="All Stages"
            style={{ width: 178 }}
            value={stageFilter || undefined}
            onChange={v => setStageFilter(v ?? '')}
            allowClear size="small"
            options={ALL_STAGES.map(s => ({ value: s, label: s }))}
          />
          {isFiltered && (
            <button
              onClick={handleReset}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 11, fontWeight: 600, color: 'var(--color-text-tertiary)',
                padding: '0 4px', fontFamily: 'inherit',
              }}
            >
              <ReloadOutlined style={{ fontSize: 11 }} /> Reset
            </button>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 11, color: 'var(--color-text-disabled)', fontWeight: 600, whiteSpace: 'nowrap', letterSpacing: '0.04em' }}>SORT BY</span>
            <Select
              value={sortBy}
              onChange={v => setSortBy(v)}
              style={{ width: 210 }} size="small"
              options={[
                { value: 'match',      label: 'Match Score (High to Low)' },
                { value: 'recent',     label: 'Recently Applied'          },
                { value: 'experience', label: 'Experience'                },
                { value: 'name',       label: 'Name A–Z'                  },
              ]}
            />
          </div>
        </div>

        {/* Bulk action bar */}
        {selectedKeys.length > 0 && (
          <div style={{
            background: 'var(--color-primary-tint)', border: '1px solid #ccfbf1', borderRadius: 8,
            padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)' }}>
              {selectedKeys.length} candidate{selectedKeys.length > 1 ? 's' : ''} selected
            </span>
            <Button size="small" icon={<SwapOutlined />} style={{ fontSize: 11 }}>Move Stage</Button>
            <Button size="small" danger style={{ fontSize: 11 }}>Reject</Button>
          </div>
        )}

        {/* Table */}
        <div style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 10 }}>
          <Table<Candidate>
            rowKey="id"
            dataSource={filtered}
            columns={columns}
            onRow={c => ({ onClick: () => navigateToProfile(c), style: { cursor: 'pointer' } })}
            rowSelection={{
              selectedRowKeys: selectedKeys,
              onChange: keys => setSelectedKeys(keys as string[]),
              columnWidth: 40,
            }}
            pagination={{
              pageSize: 10,
              total: filtered.length,
              showSizeChanger: true,
              pageSizeOptions: [10, 20, 50],
              showQuickJumper: false,
              showTotal: (total, range) => (
                <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                  {range[0]}–{range[1]} of <strong style={{ color: 'var(--color-text-secondary)' }}>{total}</strong> candidates
                </span>
              ),
              position: ['bottomRight'],
            }}
            locale={{ emptyText: 'No candidates match your filters.' }}
            size="middle"
          />
        </div>

      </div>
    </div>
  );
}
