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

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_CANDIDATES: Candidate[] = [
  {
    id: '1', name: 'Sarah Jenkins',  initials: 'SJ', avatarColor: '#7c3aed',
    company: 'ex-Spotify', degree: 'B.Des',
    matchScore: 95, matchedSkills: ['Figma', 'SaaS'], missingSkills: [],
    currentStage: 'Initial Screening', experience: 6, appliedAgo: '5d ago',  hasCV: true,
  },
  {
    id: '2', name: 'Emily Watson',   initials: 'EW', avatarColor: '#0284c7',
    company: 'Agency', degree: 'B.Des',
    matchScore: 91, matchedSkills: ['React', 'TypeScript'], missingSkills: [],
    currentStage: 'Culture Fit',      experience: 4, appliedAgo: '8d ago',  hasCV: true,
  },
  {
    id: '3', name: 'Priya Sharma',   initials: 'PS', avatarColor: '#0f766e',
    company: 'Infosys', degree: 'M.Tech',
    matchScore: 88, matchedSkills: ['Java', 'AWS'], missingSkills: ['React'],
    currentStage: 'Culture Fit',      experience: 5, appliedAgo: '7d ago',  hasCV: true,
  },
  {
    id: '4', name: 'Marcus Johnson', initials: 'MJ', avatarColor: '#334155',
    company: 'AWS', degree: 'B.Sc',
    matchScore: 80, matchedSkills: ['Kubernetes', 'Docker'], missingSkills: ['Frontend'],
    currentStage: 'Culture Fit',      experience: 7, appliedAgo: '17d ago', hasCV: false,
  },
  {
    id: '5', name: 'Michael Chen',   initials: 'MC', avatarColor: '#059669',
    company: 'Freelance', degree: 'M.Sc',
    matchScore: 72, matchedSkills: ['UX Research'], missingSkills: ['Leadership'],
    currentStage: 'Code Assessment',  experience: 3, appliedAgo: '4d ago',  hasCV: true,
  },
  {
    id: '6', name: 'David Ross',      initials: 'DR', avatarColor: '#b45309',
    company: 'Graphic Designer', degree: 'B.A.',
    matchScore: 45, matchedSkills: [], missingSkills: ['UX Strategy'],
    currentStage: 'Technical Interview', experience: 2, appliedAgo: '6d ago',  hasCV: true,
  },
  {
    id: '7', name: 'Aisha Rahman',    initials: 'AR', avatarColor: '#0891b2',
    company: 'TechCorp', degree: 'M.Sc',
    matchScore: 93, matchedSkills: ['React', 'AWS', 'Node.js'], missingSkills: [],
    currentStage: 'Initial Screening', experience: 5, appliedAgo: '2d ago',  hasCV: true,
  },
  {
    id: '8', name: 'James Carter',    initials: 'JC', avatarColor: '#4f46e5',
    company: 'StartupX', degree: 'B.Sc',
    matchScore: 76, matchedSkills: ['Python', 'SQL'], missingSkills: ['React'],
    currentStage: 'Code Assessment',   experience: 3, appliedAgo: '10d ago', hasCV: false,
  },
  {
    id: '9', name: 'Nadia Hossain',   initials: 'NH', avatarColor: '#be185d',
    company: 'DataLab', degree: 'PhD',
    matchScore: 89, matchedSkills: ['ML', 'Python', 'TensorFlow'], missingSkills: [],
    currentStage: 'Culture Fit',       experience: 8, appliedAgo: '3d ago',  hasCV: true,
  },
  {
    id: '10', name: 'Kevin Park',     initials: 'KP', avatarColor: '#0f766e',
    company: 'NovaSoft', degree: 'B.Eng',
    matchScore: 63, matchedSkills: ['Docker', 'Linux'], missingSkills: ['Kubernetes', 'AWS'],
    currentStage: 'Initial Screening', experience: 2, appliedAgo: '1d ago',  hasCV: true,
  },
  {
    id: '11', name: 'Sofia Lopes',    initials: 'SL', avatarColor: '#9333ea',
    company: 'CreativeHub', degree: 'B.Des',
    matchScore: 82, matchedSkills: ['Figma', 'CSS', 'React'], missingSkills: ['TypeScript'],
    currentStage: 'Culture Fit',       experience: 4, appliedAgo: '9d ago',  hasCV: true,
  },
  {
    id: '12', name: 'Omar Faruk',     initials: 'OF', avatarColor: '#c2410c',
    company: 'CloudBase', degree: 'M.Tech',
    matchScore: 58, matchedSkills: ['Azure', 'CI/CD'], missingSkills: ['Terraform'],
    currentStage: 'Technical Interview', experience: 3, appliedAgo: '12d ago', hasCV: false,
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
  if (score >= 85) return '#d1fae5';
  if (score >= 70) return '#fef3c7';
  if (score >= 50) return '#ffedd5';
  return '#fee2e2';
}

const STAGE_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  'Initial Screening':   { bg: '#f0fdfa', color: '#0f766e', border: '#5eead4' },
  'Culture Fit':         { bg: '#f0fdf4', color: '#15803d', border: '#86efac' },
  'Code Assessment':     { bg: '#faf5ff', color: '#7c3aed', border: '#d8b4fe' },
  'Technical Interview': { bg: '#fff7ed', color: '#c2410c', border: '#fdba74' },
  'Offer Accepted':      { bg: '#f0fdf4', color: '#059669', border: '#6ee7b7' },
  'Rejected':            { bg: '#fef2f2', color: '#dc2626', border: '#fca5a5' },
};

function StageBadge({ stage }: { stage: string }) {
  const s = STAGE_STYLE[stage] ?? { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
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
      flex: 1, background: '#ffffff',
      border: '1px solid #e2e8f0',
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
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#94a3b8', textTransform: 'uppercase' }}>
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
    let rows = MOCK_CANDIDATES;
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
    total:      MOCK_CANDIDATES.length,
    topMatch:   MOCK_CANDIDATES.filter(c => c.matchScore >= 90).length,
    inPipeline: MOCK_CANDIDATES.filter(c => c.currentStage !== 'Rejected').length,
    avgExp:     (MOCK_CANDIDATES.reduce((s, c) => s + c.experience, 0) / MOCK_CANDIDATES.length).toFixed(1),
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
      title: <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700, letterSpacing: '0.06em' }}>CANDIDATE NAME</span>,
      key: 'name',
      width: 230,
      render: (_, c) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
            background: c.avatarColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 800, color: '#ffffff', letterSpacing: '0.05em',
            boxShadow: `0 0 0 2px ${c.avatarColor}33`,
          }}>
            {c.initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#111827', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {c.name}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>
              {c.company} · {c.degree}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700, letterSpacing: '0.06em' }}>AI MATCH ANALYSIS</span>,
      key: 'match',
      render: (_, c) => {
        const mc    = matchColor(c.matchScore);
        const track = matchTrack(c.matchScore);
        return (
          <div style={{ paddingRight: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
              <span style={{ fontWeight: 800, fontSize: 13, color: mc }}>{c.matchScore}%</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280' }}>Match</span>
            </div>
            <div style={{ height: 5, borderRadius: 3, background: track, overflow: 'hidden', marginBottom: 6 }}>
              <div style={{ height: '100%', width: `${c.matchScore}%`, background: mc, borderRadius: 3 }} />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'center' }}>
              {c.matchedSkills.map(s => (
                <span key={s} style={{
                  fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 4,
                  background: '#f0fdfa', color: '#0f766e', border: '1px solid #99f6e4',
                }}>
                  {s}
                </span>
              ))}
              {c.missingSkills.length > 0 && (
                <span style={{ fontSize: 10, fontWeight: 700, color: '#dc2626', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <span style={{ color: '#fca5a5' }}>●</span>
                  Missing: {c.missingSkills.join(', ')}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700, letterSpacing: '0.06em' }}>CURRENT STAGE</span>,
      key: 'stage',
      width: 180,
      render: (_, c) => <StageBadge stage={c.currentStage} />,
    },
    {
      title: <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700, letterSpacing: '0.06em' }}>EXPERIENCE</span>,
      key: 'experience',
      width: 110,
      render: (_, c) => (
        <span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>{c.experience}</span>
          <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 3 }}>{c.experience === 1 ? 'yr' : 'yrs'}</span>
        </span>
      ),
    },
    {
      title: <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700, letterSpacing: '0.06em' }}>APPLIED</span>,
      key: 'applied',
      width: 90,
      render: (_, c) => (
        <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>{c.appliedAgo}</span>
      ),
    },
    {
      title: <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700, letterSpacing: '0.06em' }}>CV</span>,
      key: 'cv',
      width: 56,
      render: (_, c) => c.hasCV ? (
        <Tooltip title="Download CV">
          <FileTextOutlined style={{ fontSize: 16, color: '#9ca3af', cursor: 'pointer', transition: 'color 0.15s' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#0f766e')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#9ca3af')}
          />
        </Tooltip>
      ) : (
        <span style={{ color: '#d1d5db', fontSize: 14, fontWeight: 700 }}>—</span>
      ),
    },
    {
      title: <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700, letterSpacing: '0.06em' }}>ACTIONS</span>,
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
              color: '#9ca3af', transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = '#f1f5f9';
              (e.currentTarget as HTMLElement).style.color = '#374151';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.color = '#9ca3af';
            }}
          >
            <MoreOutlined style={{ fontSize: 16 }} />
          </button>
        </Dropdown>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f8fafc' }}>

      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <div style={{
        background: '#ffffff', borderBottom: '1px solid #e2e8f0',
        padding: '0 20px', height: 52,
        display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0,
      }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ color: '#6b7280', padding: '0 6px', height: 28, flexShrink: 0 }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1, marginBottom: 3 }}>
            <span
              onClick={() => navigate('/recruitment/job-postings')}
              style={{ cursor: 'pointer', color: '#6b7280', transition: 'color 0.15s' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#0f766e')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#6b7280')}
            >
              Jobs
            </span>
            <span style={{ margin: '0 5px', color: '#cbd5e1' }}>›</span>
            <span>{position}</span>
          </div>
          <div style={{ fontWeight: 800, fontSize: 15, color: '#111827', lineHeight: 1 }}>
            {pipelineName}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', border: '1.5px solid #d8e7e5', borderRadius: 9, overflow: 'hidden' }}>
            <button style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '5px 13px', border: 'none', cursor: 'default',
              background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
              color: '#ffffff', fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
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
                background: '#ffffff', color: '#6b7280',
                fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
                borderLeft: '1.5px solid #d8e7e5', transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = '#f0fdfa';
                (e.currentTarget as HTMLElement).style.color = '#0f766e';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = '#ffffff';
                (e.currentTarget as HTMLElement).style.color = '#6b7280';
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
          background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10,
          padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
        }}>
          <Input
            prefix={<SearchOutlined style={{ color: '#9ca3af', fontSize: 13 }} />}
            placeholder="Search by name or skills..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            allowClear
            style={{ width: 240, borderRadius: 7 }}
            size="small"
          />
          <div style={{ width: 1, height: 22, background: '#e2e8f0' }} />
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
                fontSize: 11, fontWeight: 600, color: '#94a3b8',
                padding: '0 4px', fontFamily: 'inherit',
              }}
            >
              <ReloadOutlined style={{ fontSize: 11 }} /> Reset
            </button>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, whiteSpace: 'nowrap', letterSpacing: '0.04em' }}>SORT BY</span>
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
            background: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: 8,
            padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#0f766e' }}>
              {selectedKeys.length} candidate{selectedKeys.length > 1 ? 's' : ''} selected
            </span>
            <Button size="small" icon={<SwapOutlined />} style={{ fontSize: 11 }}>Move Stage</Button>
            <Button size="small" danger style={{ fontSize: 11 }}>Reject</Button>
          </div>
        )}

        {/* Table */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10 }}>
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
                <span style={{ fontSize: 12, color: '#6b7280' }}>
                  {range[0]}–{range[1]} of <strong style={{ color: '#374151' }}>{total}</strong> candidates
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
