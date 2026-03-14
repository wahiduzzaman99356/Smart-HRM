import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Select, DatePicker, Space, Row, Col, Table, Dropdown, Tag, Tooltip } from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  MoreOutlined,
  EyeOutlined,
  EditOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  CalendarOutlined,
  ApartmentOutlined,
  BarChartOutlined,
  UserSwitchOutlined,
  CheckCircleOutlined,
  SwapOutlined,
  ShareAltOutlined,
  BookOutlined,
  UserOutlined,
  ThunderboltOutlined,
  SolutionOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { JobPosting, JobStatus } from '../types/jobPosting.types';
import { AssignPipelineModal } from '../components/AssignPipelineModal';

type DateRange = RangePickerProps['value'];
const { RangePicker } = DatePicker;

// ─── Mock data (all fields sourced from MRF) ──────────────────────────────────
const MOCK_DATA: JobPosting[] = [
  {
    mrfId: 'MRF200126-01', mrfRef: 'TSL-1042',
    designation: 'Senior Software Engineer', department: 'Engineering',
    employmentType: 'Full Time', workLocation: 'Head Office',
    vacancyNumber: '3', initiateDate: '2026-01-15', etaDate: '2026-03-15',
    typeOfRequisition: 'New Recruitment', gender: 'Any',
    experienceMode: 'Experienced', yearsOfExperience: '5',
    educationQualification: 'Bachelor',
    skillsRequired: ['React', 'Node.js', 'TypeScript', 'AWS'],
    jobResponsibility: 'Lead backend & frontend development, mentor junior developers, architect scalable solutions.',
    pipeline: 'Executive Search', applications: 42, matched: 38, shortListed: 12, status: 'Published',
  },
  {
    mrfId: 'MRF200126-02', mrfRef: 'TSL-1044',
    designation: 'Product Designer', department: 'Design',
    employmentType: 'Full Time', workLocation: 'Head Office',
    vacancyNumber: '2', initiateDate: '2026-01-20', etaDate: '2026-03-01',
    typeOfRequisition: 'New Recruitment', gender: 'Female',
    experienceMode: 'Experienced', yearsOfExperience: '3',
    educationQualification: 'Bachelor',
    skillsRequired: ['Figma', 'UI/UX', 'Prototyping'],
    jobResponsibility: 'Design intuitive user interfaces, conduct user research, and maintain the design system.',
    pipeline: 'Executive Search', applications: 89, matched: 22, shortListed: 8, status: 'Published',
  },
  {
    mrfId: 'MRF200126-03', mrfRef: 'TSL-1047',
    designation: 'DevOps Engineer', department: 'Engineering',
    employmentType: 'Full Time', workLocation: 'Airport Office',
    vacancyNumber: '1', initiateDate: '2026-02-01', etaDate: '2026-04-01',
    typeOfRequisition: 'Replacement', gender: 'Male',
    experienceMode: 'Experienced', yearsOfExperience: '4',
    educationQualification: 'Bachelor',
    skillsRequired: ['Docker', 'Kubernetes', 'CI/CD', 'Terraform'],
    jobResponsibility: 'Manage CI/CD pipelines, cloud infrastructure, and ensure system reliability.',
    pipeline: 'Executive Search', applications: 0, matched: 0, shortListed: 0, status: 'Draft',
  },
  {
    mrfId: 'MRF200126-04', mrfRef: 'TSL-1038',
    designation: 'Marketing Manager', department: 'Marketing',
    employmentType: 'Full Time', workLocation: 'Head Office',
    vacancyNumber: '1', initiateDate: '2025-12-01', etaDate: '2026-02-28',
    typeOfRequisition: 'New Recruitment', gender: 'Any',
    experienceMode: 'Experienced', yearsOfExperience: '6',
    educationQualification: 'Masters',
    skillsRequired: ['Brand Strategy', 'Digital Marketing', 'SEO', 'Analytics'],
    jobResponsibility: 'Plan and execute marketing campaigns, manage brand presence, lead the marketing team.',
    pipeline: null, applications: 56, matched: 15, shortListed: 5, status: 'On-Going',
  },
  {
    mrfId: 'MRF200126-05', mrfRef: 'TSL-1049',
    designation: 'Data Analyst', department: 'Engineering',
    employmentType: 'Contractual', workLocation: 'Field Office',
    vacancyNumber: '2', initiateDate: '2026-01-05', etaDate: '2026-04-01',
    typeOfRequisition: 'New Recruitment', gender: 'Any',
    experienceMode: 'Experienced', yearsOfExperience: '2',
    educationQualification: 'Bachelor',
    skillsRequired: ['Python', 'SQL', 'Power BI', 'Excel'],
    jobResponsibility: 'Analyze datasets, build dashboards, and provide data-driven insights to business stakeholders.',
    pipeline: null, applications: 120, matched: 45, shortListed: 18, status: 'On-Going',
  },
  {
    mrfId: 'MRF200126-06', mrfRef: 'TSL-1031',
    designation: 'Sales Executive', department: 'Sales',
    employmentType: 'Full Time', workLocation: 'Field Office',
    vacancyNumber: '4', initiateDate: '2025-10-15', etaDate: '2025-12-31',
    typeOfRequisition: 'New Recruitment', gender: 'Male',
    experienceMode: 'Fresher', yearsOfExperience: '',
    educationQualification: 'HSC',
    skillsRequired: ['Communication', 'Negotiation', 'CRM'],
    jobResponsibility: 'Drive sales targets, manage client relationships, and identify new business opportunities.',
    pipeline: null, applications: 78, matched: 30, shortListed: 10, status: 'Closed',
  },
  {
    mrfId: 'MRF200126-07', mrfRef: 'TSL-1052',
    designation: 'HR Coordinator', department: 'HR',
    employmentType: 'Part Time', workLocation: 'Airport Office',
    vacancyNumber: '1', initiateDate: '2026-01-10', etaDate: '2026-02-28',
    typeOfRequisition: 'Replacement', gender: 'Female',
    experienceMode: 'Fresher', yearsOfExperience: '',
    educationQualification: 'Bachelor',
    skillsRequired: ['HR Policies', 'MS Office', 'Communication'],
    jobResponsibility: 'Support HR operations, maintain employee records, and assist in recruitment activities.',
    pipeline: null, applications: 34, matched: 8, shortListed: 2, status: 'Rejected',
  },
  {
    mrfId: 'MRF200126-08', mrfRef: 'TSL-1055',
    designation: 'AI Researcher', department: 'Engineering',
    employmentType: 'Full Time', workLocation: 'Head Office',
    vacancyNumber: '1', initiateDate: '2026-01-25', etaDate: '2026-03-31',
    typeOfRequisition: 'New Recruitment', gender: 'Any',
    experienceMode: 'Experienced', yearsOfExperience: '7',
    educationQualification: 'PhD',
    skillsRequired: ['Machine Learning', 'Python', 'NLP', 'Deep Learning'],
    jobResponsibility: 'Conduct cutting-edge AI/ML research, publish findings, and integrate models into products.',
    pipeline: null, applications: 25, matched: 10, shortListed: 3, status: 'Rejected',
  },
];

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_DOT: Record<JobStatus, string> = {
  Published: '#059669',
  Draft:     '#6b7280',
  'On-Going': '#0ea5e9',
  Closed:    '#d97706',
  Rejected:  '#dc2626',
};

const STATUS_LABEL: Record<JobStatus, string> = {
  Published:  'PUBLISHED',
  Draft:      'DRAFT',
  'On-Going': 'ACTIVE',
  Closed:     'CLOSED',
  Rejected:   'REJECTED',
};

function StatusBadge({ status }: { status: JobStatus }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 12, color: STATUS_DOT[status], letterSpacing: '0.04em' }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: STATUS_DOT[status], flexShrink: 0 }} />
      {STATUS_LABEL[status]}
    </span>
  );
}

// ─── Tab pills ────────────────────────────────────────────────────────────────
type TabKey = 'all' | JobStatus;

const ALL_TABS: { key: TabKey; label: string }[] = [
  { key: 'all',       label: 'All'      },
  { key: 'Draft',     label: 'Draft'    },
  { key: 'Published', label: 'Published'},
  { key: 'On-Going',  label: 'On-Going' },
  { key: 'Closed',    label: 'Closed'   },
  { key: 'Rejected',  label: 'Rejected' },
];

// ─── Component ────────────────────────────────────────────────────────────────
interface Filters {
  search:         string;
  department:     string;
  employmentType: string;
  workLocation:   string;
  pipeline:       string;
  dateRange:      DateRange;
}

const EMPTY_FILTERS: Filters = {
  search: '', department: '', employmentType: '', workLocation: '', pipeline: '', dateRange: null,
};

export default function JobPostingsPage() {
  const navigate = useNavigate();
  const [draft,           setDraft]           = useState<Filters>(EMPTY_FILTERS);
  const [applied,         setApplied]         = useState<Filters>(EMPTY_FILTERS);
  const [activeTab,       setActiveTab]       = useState<TabKey>('all');
  const [showFilters,     setShowFilters]     = useState(false);
  const [assignTarget,    setAssignTarget]    = useState<string | null>(null);   // mrfId of the row being assigned
  const [pipelineMap,     setPipelineMap]     = useState<Record<string, string>>({}); // mrfId → pipeline name overrides

  const handleApply = () => setApplied(draft);

  const handleReset = () => {
    setDraft(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setActiveTab('all');
  };

  // Count per tab (on unfiltered data)
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: MOCK_DATA.length };
    for (const job of MOCK_DATA) {
      c[job.status] = (c[job.status] ?? 0) + 1;
    }
    return c;
  }, []);

  const filtered = useMemo(() => {
    let rows = MOCK_DATA;
    if (activeTab !== 'all')        rows = rows.filter(r => r.status === activeTab);
    if (applied.search) {
      const q = applied.search.toLowerCase();
      rows = rows.filter(r =>
        r.designation.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q) ||
        r.mrfRef.toLowerCase().includes(q),
      );
    }
    if (applied.department)     rows = rows.filter(r => r.department === applied.department);
    if (applied.employmentType) rows = rows.filter(r => r.employmentType === applied.employmentType);
    if (applied.workLocation)   rows = rows.filter(r => r.workLocation === applied.workLocation);
    if (applied.pipeline === '__assigned')   rows = rows.filter(r => r.pipeline !== null);
    if (applied.pipeline === '__unassigned') rows = rows.filter(r => r.pipeline === null);
    if (applied.dateRange?.[0] && applied.dateRange?.[1]) {
      rows = rows.filter(r => {
        const d = dayjs(r.initiateDate);
        return !d.isBefore(applied.dateRange![0]!, 'day') && !d.isAfter(applied.dateRange![1]!, 'day');
      });
    }
    return rows;
  }, [activeTab, applied]);

  const columns: ColumnsType<JobPosting> = [
    {
      title: <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700, letterSpacing: '0.04em' }}>JOB DETAILS</span>,
      key: 'details',
      width: 420,
      render: (_, r) => {
        const expLabel = r.experienceMode === 'Fresher'
          ? 'Fresher'
          : r.yearsOfExperience ? `${r.yearsOfExperience}+ yrs exp` : 'Experienced';

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>

            {/* Row 1 — Title + Requisition type badge */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <span
                onClick={() => navigate(`/recruitment/job-postings/${r.mrfId}`, { state: { posting: r } })}
                style={{ fontWeight: 700, fontSize: 14, color: '#0f766e', lineHeight: 1.3, cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: 3 }}
              >
                {r.designation}
              </span>
              <span style={{
                flexShrink: 0,
                fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
                padding: '2px 8px', borderRadius: 20,
                background: r.typeOfRequisition === 'Replacement' ? '#fff7ed' : '#f0fdf4',
                color:      r.typeOfRequisition === 'Replacement' ? '#c2410c'  : '#15803d',
                border: `1px solid ${r.typeOfRequisition === 'Replacement' ? '#fed7aa' : '#bbf7d0'}`,
                marginTop: 2,
              }}>
                {r.typeOfRequisition.toUpperCase()}
              </span>
            </div>

            {/* Row 2 — Dept · Employment · MRF ref */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#6b7280', flexWrap: 'wrap' }}>
              <SolutionOutlined style={{ fontSize: 11, color: '#9ca3af' }} />
              <span>{r.department}</span>
              <span style={{ color: '#d1d5db' }}>·</span>
              <span>{r.employmentType}</span>
              <span style={{ color: '#d1d5db' }}>·</span>
              <span style={{ color: '#9ca3af', fontSize: 11 }}>MRF: {r.mrfRef}</span>
            </div>

            {/* Row 3 — Location · Vacancies · Gender */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#6b7280', flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <EnvironmentOutlined style={{ fontSize: 11, color: '#9ca3af' }} />
                {r.workLocation}
              </span>
              <span style={{ color: '#d1d5db' }}>·</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <TeamOutlined style={{ fontSize: 11, color: '#9ca3af' }} />
                {r.vacancyNumber} {r.vacancyNumber === '1' ? 'vacancy' : 'vacancies'}
              </span>
              <span style={{ color: '#d1d5db' }}>·</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <UserOutlined style={{ fontSize: 11, color: '#9ca3af' }} />
                {r.gender}
              </span>
            </div>

            {/* Row 4 — Experience · Education */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#6b7280', flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <ThunderboltOutlined style={{ fontSize: 11, color: '#9ca3af' }} />
                {expLabel}
              </span>
              <span style={{ color: '#d1d5db' }}>·</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <BookOutlined style={{ fontSize: 11, color: '#9ca3af' }} />
                {r.educationQualification}
              </span>
            </div>

            {/* Row 5 — Skills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {r.skillsRequired.slice(0, 4).map(s => (
                <span key={s} style={{
                  fontSize: 11, fontWeight: 600,
                  padding: '1px 8px', borderRadius: 4,
                  background: '#f1f5f9', color: '#475569',
                  border: '1px solid #e2e8f0',
                }}>
                  {s}
                </span>
              ))}
              {r.skillsRequired.length > 4 && (
                <Tooltip title={r.skillsRequired.slice(4).join(', ')}>
                  <span style={{
                    fontSize: 11, fontWeight: 600,
                    padding: '1px 8px', borderRadius: 4,
                    background: '#f1f5f9', color: '#94a3b8',
                    border: '1px solid #e2e8f0', cursor: 'default',
                  }}>
                    +{r.skillsRequired.length - 4}
                  </span>
                </Tooltip>
              )}
            </div>

            {/* Row 6 — Dates */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: '#9ca3af', flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <CalendarOutlined style={{ fontSize: 10 }} />
                Published: {r.initiateDate}
              </span>
              <span style={{ color: '#d1d5db' }}>·</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <ClockCircleOutlined style={{ fontSize: 10 }} />
                Deadline: {r.etaDate}
              </span>
            </div>

          </div>
        );
      },
    },
    {
      title: <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700, letterSpacing: '0.04em' }}>PIPELINE</span>,
      key: 'pipeline',
      width: 160,
      render: (_, r) => {
        const pipeline = pipelineMap[r.mrfId] ?? r.pipeline;
        return pipeline ? (
          <Tag
            onClick={() => navigate(`/recruitment/pipelines/${r.mrfId}`, {
              state: { pipelineName: pipeline, position: r.designation, candidates: r.applications },
            })}
            style={{
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              padding: '3px 10px',
              color: '#0f766e',
              background: '#f0fdfa',
              borderColor: '#99f6e4',
              cursor: 'pointer',
            }}
          >
            {pipeline}
          </Tag>
        ) : (
          <button
            onClick={() => setAssignTarget(r.mrfId)}
            style={{
              background: 'none',
              border: '1.5px dashed #bdd6d2',
              borderRadius: 6,
              padding: '4px 10px',
              fontSize: 12,
              fontWeight: 600,
              color: '#0f766e',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Assign Pipeline
          </button>
        );
      },
    },
    {
      title: <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700, letterSpacing: '0.04em' }}>APPLICATIONS</span>,
      key: 'applications',
      align: 'center',
      width: 120,
      render: (_, r) => (
        <span style={{ fontSize: 15, fontWeight: 700, color: r.applications > 0 ? '#111827' : '#d1d5db' }}>
          {r.applications || '—'}
        </span>
      ),
    },
    {
      title: <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700, letterSpacing: '0.04em' }}>MATCHED</span>,
      key: 'matched',
      align: 'center',
      width: 90,
      render: (_, r) => (
        <span style={{ fontSize: 15, fontWeight: 700, color: r.matched > 0 ? '#111827' : '#d1d5db' }}>
          {r.matched || '—'}
        </span>
      ),
    },
    {
      title: <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700, letterSpacing: '0.04em' }}>SHORT LISTED</span>,
      key: 'shortListed',
      align: 'center',
      width: 110,
      render: (_, r) => (
        <span style={{ fontSize: 15, fontWeight: 700, color: r.shortListed > 0 ? '#0f766e' : '#d1d5db' }}>
          {r.shortListed || '—'}
        </span>
      ),
    },
    {
      title: <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700, letterSpacing: '0.04em' }}>STATUS</span>,
      key: 'status',
      width: 120,
      render: (_, r) => <StatusBadge status={r.status} />,
    },
    {
      title: <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700, letterSpacing: '0.04em' }}>ACTIONS</span>,
      key: 'actions',
      align: 'center',
      width: 64,
      render: (_, r) => (
        <Dropdown
          trigger={['click']}
          menu={{
            style: { borderRadius: 8, minWidth: 168 },
            onClick: ({ key }) => {
              if (key === 'view')     navigate(`/recruitment/job-postings/${r.mrfId}`, { state: { posting: r } });
              if (key === 'pipeline') {
                const pipeline = pipelineMap[r.mrfId] ?? r.pipeline;
                if (pipeline) {
                  navigate(`/recruitment/pipelines/${r.mrfId}`, {
                    state: { pipelineName: pipeline, position: r.designation, candidates: r.applications },
                  });
                } else {
                  setAssignTarget(r.mrfId);
                }
              }
            },
            items: [
              { key: 'analytics',      icon: <BarChartOutlined />,    label: 'Analytics' },
              { key: 'edit',           icon: <EditOutlined />,        label: 'Edit Details' },
              { key: 'view',           icon: <EyeOutlined />,         label: 'View Details' },
              { key: 'approve-reject', icon: <CheckCircleOutlined />, label: 'Approve / Reject' },
              {
                key: 'pipeline',
                icon: <ApartmentOutlined />,
                label: (pipelineMap[r.mrfId] ?? r.pipeline) ? 'View Pipeline' : 'Assign Pipeline',
              },
              { key: 'user-access',    icon: <UserSwitchOutlined />,  label: 'User Access' },
              { key: 'share',          icon: <ShareAltOutlined />,    label: 'Share Job Post' },
              { key: 'change-status',  icon: <SwapOutlined />,        label: 'Change Status' },
            ],
          }}
          placement="bottomRight"
        >
          <Button
            type="text"
            size="small"
            icon={<MoreOutlined style={{ fontSize: 18 }} />}
            style={{
              color: '#9ca3af',
              borderRadius: 6,
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="page-shell">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="page-header-row">
        <div>
          <h1>Job Postings</h1>
          <p>Manage your active listings and hiring pipelines</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            icon={<ApartmentOutlined />}
            onClick={() => navigate('/recruitment/pipelines', { state: { from: 'job-postings' } })}
          >
            Pipelines
          </Button>
          <Button type="primary" icon={<PlusOutlined />}>
            Create New Job Post
          </Button>
        </div>
      </div>

      {/* ── Filter bar ───────────────────────────────────────────────────── */}
      <div className="filter-bar">
        <div>
          <div className="filter-label">SEARCH</div>
          <Input
            prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
            placeholder="Job title, department, MRF ref..."
            value={draft.search}
            onChange={e => setDraft(p => ({ ...p, search: e.target.value }))}
            style={{ width: 280, borderRadius: 7 }}
            allowClear
          />
        </div>
        <Space style={{ paddingTop: 20 }}>
          <Button type="primary" icon={<SearchOutlined />} onClick={handleApply}>
            Apply
          </Button>
          <Button
            icon={<FilterOutlined />}
            onClick={() => setShowFilters(v => !v)}
            style={showFilters ? { borderColor: '#94a3b8', color: '#334155' } : {}}
          >
            Filters
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            Reset
          </Button>
        </Space>
      </div>

      {/* ── Advanced Filter Panel (inline, Question Bank style) ───────────── */}
      {showFilters && (
        <div style={{
          padding: '16px 20px',
          background: '#f8fafc',
          border: '1px solid #e8edf3',
          borderLeft: '3px solid #cbd5e1',
          borderRadius: '0 0 8px 8px',
          marginTop: -8,
          marginBottom: 16,
        }}>
          {/* Panel header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <Space size={8} align="center">
              <FilterOutlined style={{ color: '#64748b' }} />
              <span style={{ fontWeight: 700, fontSize: 12, letterSpacing: '0.07em', color: '#374151', textTransform: 'uppercase' }}>
                Advanced Filtering
              </span>
            </Space>
            <Button type="link" size="small" onClick={handleReset} icon={<ReloadOutlined />} style={{ color: '#64748b', padding: 0, fontSize: 12 }}>
              Reset All Filters
            </Button>
          </div>

          <Row gutter={[12, 12]} align="bottom">
            {/* Department */}
            <Col flex="1 1 160px">
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: '#6b7280', marginBottom: 6, textTransform: 'uppercase' }}>Department</div>
              <Select
                placeholder="All Departments"
                style={{ width: '100%' }}
                value={draft.department || undefined}
                onChange={v => setDraft(p => ({ ...p, department: v ?? '' }))}
                allowClear
                options={[
                  { value: 'Engineering', label: 'Engineering' },
                  { value: 'Design',      label: 'Design'      },
                  { value: 'Marketing',   label: 'Marketing'   },
                  { value: 'Sales',       label: 'Sales'       },
                  { value: 'HR',          label: 'HR'          },
                ]}
              />
            </Col>

            {/* Employment Type */}
            <Col flex="1 1 160px">
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: '#6b7280', marginBottom: 6, textTransform: 'uppercase' }}>Employment Type</div>
              <Select
                placeholder="All Types"
                style={{ width: '100%' }}
                value={draft.employmentType || undefined}
                onChange={v => setDraft(p => ({ ...p, employmentType: v ?? '' }))}
                allowClear
                options={[
                  { value: 'Full Time',   label: 'Full Time'   },
                  { value: 'Part Time',   label: 'Part Time'   },
                  { value: 'Contractual', label: 'Contractual' },
                  { value: 'Intern',      label: 'Intern'      },
                ]}
              />
            </Col>

            {/* Work Location */}
            <Col flex="1 1 160px">
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: '#6b7280', marginBottom: 6, textTransform: 'uppercase' }}>Work Location</div>
              <Select
                placeholder="All Locations"
                style={{ width: '100%' }}
                value={draft.workLocation || undefined}
                onChange={v => setDraft(p => ({ ...p, workLocation: v ?? '' }))}
                allowClear
                options={[
                  { value: 'Head Office',    label: 'Head Office'    },
                  { value: 'Airport Office', label: 'Airport Office' },
                  { value: 'Field Office',   label: 'Field Office'   },
                ]}
              />
            </Col>

            {/* Pipeline */}
            <Col flex="1 1 140px">
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: '#6b7280', marginBottom: 6, textTransform: 'uppercase' }}>Pipeline</div>
              <Select
                placeholder="All"
                style={{ width: '100%' }}
                value={draft.pipeline || undefined}
                onChange={v => setDraft(p => ({ ...p, pipeline: v ?? '' }))}
                allowClear
                options={[
                  { value: '__assigned',   label: 'Assigned'   },
                  { value: '__unassigned', label: 'Unassigned' },
                ]}
              />
            </Col>

            {/* Published Date Range */}
            <Col flex="2 1 240px">
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: '#6b7280', marginBottom: 6, textTransform: 'uppercase' }}>Published Date</div>
              <RangePicker
                value={draft.dateRange}
                onChange={v => setDraft(p => ({ ...p, dateRange: v }))}
                format="DD MMM YYYY"
                placeholder={['Start date', 'End date']}
                style={{ width: '100%', height: 34 }}
              />
            </Col>

            {/* Actions */}
            <Col flex="0 0 auto">
              <Space>
                <Button type="primary" onClick={handleApply} style={{ height: 34, fontWeight: 600 }}>
                  Apply
                </Button>
                <Button onClick={() => setShowFilters(false)} style={{ height: 34 }}>
                  Close Panel
                </Button>
              </Space>
            </Col>
          </Row>
        </div>
      )}


      {/* ── Status tabs ───────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {ALL_TABS.map(tab => {
          const count = counts[tab.key === 'all' ? 'all' : tab.key] ?? 0;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 10,
                border: isActive ? '1.5px solid #0f766e' : '1.5px solid #d8e7e5',
                background: isActive ? '#f0fdfa' : '#ffffff',
                color: isActive ? '#0f766e' : '#374151',
                fontWeight: isActive ? 700 : 500,
                fontSize: 13,
                fontFamily: 'inherit',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 20,
                  height: 20,
                  borderRadius: 10,
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '0 5px',
                  background: isActive ? '#0f766e' : '#e5e7eb',
                  color: isActive ? '#ffffff' : '#6b7280',
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="list-surface">
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="mrfId"
          pagination={false}
          size="middle"
          style={{ fontSize: 13 }}
        />
      </div>

      <AssignPipelineModal
        open={assignTarget !== null}
        onClose={() => setAssignTarget(null)}
        onAssign={name => {
          if (assignTarget) setPipelineMap(prev => ({ ...prev, [assignTarget]: name }));
          setAssignTarget(null);
        }}
        onCreateNew={name => {
          const job = MOCK_DATA.find(r => r.mrfId === assignTarget);
          setAssignTarget(null);
          navigate('/recruitment/pipelines/new', {
            state: { pipelineName: name, position: job?.designation ?? '', candidates: 0 },
          });
        }}
      />
    </div>
  );
}
