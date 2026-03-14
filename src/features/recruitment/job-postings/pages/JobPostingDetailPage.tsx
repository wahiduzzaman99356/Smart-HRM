import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Tag } from 'antd';
import {
  ArrowLeftOutlined,
  ApartmentOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  BankOutlined,
  IdcardOutlined,
  UserOutlined,
  BookOutlined,
  ThunderboltOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  SolutionOutlined,
  FileTextOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons';
import type { JobPosting, JobStatus } from '../types/jobPosting.types';
import { AssignPipelineModal } from '../components/AssignPipelineModal';

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_DOT: Record<JobStatus, string> = {
  Published:  '#059669',
  Draft:      '#6b7280',
  'On-Going': '#0ea5e9',
  Closed:     '#d97706',
  Rejected:   '#dc2626',
};

const STATUS_BG: Record<JobStatus, string> = {
  Published:  '#f0fdf4',
  Draft:      '#f9fafb',
  'On-Going': '#f0f9ff',
  Closed:     '#fffbeb',
  Rejected:   '#fef2f2',
};

const STATUS_LABEL: Record<JobStatus, string> = {
  Published:  'PUBLISHED',
  Draft:      'DRAFT',
  'On-Going': 'ACTIVE',
  Closed:     'CLOSED',
  Rejected:   'REJECTED',
};

// ─── Small helpers ────────────────────────────────────────────────────────────
function MetaItem({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#6b7280' }}>
      <span style={{ color: '#9ca3af', fontSize: 13 }}>{icon}</span>
      {children}
    </span>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '12px 20px', borderBottom: '1px solid #f1f5f9',
        background: '#fafbfc',
      }}>
        {icon && <span style={{ color: '#0f766e', fontSize: 14 }}>{icon}</span>}
        <span style={{ fontWeight: 700, fontSize: 13, color: '#111827', letterSpacing: '0.02em' }}>{title}</span>
      </div>
      <div style={{ padding: '16px 20px' }}>{children}</div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      flex: 1, background: '#ffffff',
      border: '1px solid #e2e8f0', borderRadius: 10,
      padding: '20px 24px', textAlign: 'center',
    }}>
      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
        color: '#9ca3af', textTransform: 'uppercase', marginBottom: 10,
      }}>
        {label}
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color, lineHeight: 1 }}>
        {value}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function JobPostingDetailPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const posting   = location.state?.posting as JobPosting | undefined;

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignedPipeline, setAssignedPipeline] = useState<string | null>(posting?.pipeline ?? null);

  if (!posting) {
    return (
      <div className="page-shell" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#9ca3af' }}>
        <FileTextOutlined style={{ fontSize: 36, color: '#d1d5db' }} />
        <div style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Job posting not found</div>
        <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/recruitment/job-postings')} style={{ color: '#0f766e' }}>
          Back to Job Postings
        </Button>
      </div>
    );
  }

  const expLabel = posting.experienceMode === 'Fresher'
    ? 'Fresher'
    : posting.yearsOfExperience
    ? `${posting.yearsOfExperience}+ years experience`
    : 'Experienced';

  return (
    <div className="page-shell">

      <div style={{ marginBottom: 16 }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ color: '#6b7280', paddingInline: 6, height: 28, fontSize: 13 }}
        >
          Back to list
        </Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── Job overview card ──────────────────────────────────────────────── */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '20px 24px' }}>

          {/* Title row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111827', lineHeight: 1.2 }}>
              {posting.designation}
            </h2>
            {/* Status badge */}
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
              letterSpacing: '0.06em',
              background: STATUS_BG[posting.status],
              color: STATUS_DOT[posting.status],
              border: `1px solid ${STATUS_DOT[posting.status]}33`,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_DOT[posting.status] }} />
              {STATUS_LABEL[posting.status]}
            </span>
            {/* Requisition type */}
            <span style={{
              padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
              background: posting.typeOfRequisition === 'Replacement' ? '#fff7ed' : '#f0fdf4',
              color:      posting.typeOfRequisition === 'Replacement' ? '#c2410c'  : '#15803d',
              border: `1px solid ${posting.typeOfRequisition === 'Replacement' ? '#fed7aa' : '#bbf7d0'}`,
            }}>
              {posting.typeOfRequisition}
            </span>
          </div>

          {/* Meta info row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 20px', alignItems: 'center' }}>
            <MetaItem icon={<BankOutlined />}>{posting.department}</MetaItem>
            <span style={{ color: '#e2e8f0' }}>|</span>
            <MetaItem icon={<IdcardOutlined />}>{posting.employmentType}</MetaItem>
            <span style={{ color: '#e2e8f0' }}>|</span>
            <MetaItem icon={<EnvironmentOutlined />}>{posting.workLocation}</MetaItem>
            <span style={{ color: '#e2e8f0' }}>|</span>
            <MetaItem icon={<SolutionOutlined />}><span style={{ color: '#9ca3af' }}>MRF:</span> {posting.mrfRef}</MetaItem>
            <span style={{ color: '#e2e8f0' }}>|</span>
            <MetaItem icon={<TeamOutlined />}>{posting.vacancyNumber} {posting.vacancyNumber === '1' ? 'vacancy' : 'vacancies'}</MetaItem>
          </div>

          {/* Dates */}
          <div style={{ display: 'flex', gap: 20, marginTop: 12, flexWrap: 'wrap' }}>
            <MetaItem icon={<CalendarOutlined />}>
              <span style={{ color: '#9ca3af' }}>Published:</span> {posting.initiateDate}
            </MetaItem>
            <MetaItem icon={<ClockCircleOutlined />}>
              <span style={{ color: '#9ca3af' }}>Deadline:</span> {posting.etaDate}
            </MetaItem>
          </div>
        </div>

        {/* ── Stats row ──────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 16 }}>
          <StatCard label="Applications" value={posting.applications} color="#111827"  />
          <StatCard label="Matched"      value={posting.matched}      color="#059669"  />
          <StatCard label="Short Listed" value={posting.shortListed}  color="#0f766e"  />
        </div>

        {/* ── Requirements ───────────────────────────────────────────────────── */}
        <SectionCard title="Requirements" icon={<BookOutlined />}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>

            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', color: '#9ca3af', textTransform: 'uppercase', marginBottom: 6 }}>Experience</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151' }}>
                <ThunderboltOutlined style={{ color: '#0f766e' }} /> {expLabel}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', color: '#9ca3af', textTransform: 'uppercase', marginBottom: 6 }}>Education</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151' }}>
                <BookOutlined style={{ color: '#0f766e' }} /> {posting.educationQualification}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', color: '#9ca3af', textTransform: 'uppercase', marginBottom: 6 }}>Gender</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151' }}>
                <UserOutlined style={{ color: '#0f766e' }} /> {posting.gender}
              </div>
            </div>

          </div>

          {/* Skills */}
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', color: '#9ca3af', textTransform: 'uppercase', marginBottom: 8 }}>Skills Required</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {posting.skillsRequired.map(s => (
                <Tag key={s} style={{
                  borderRadius: 6, fontSize: 12, fontWeight: 600,
                  padding: '2px 10px', background: '#f1f5f9',
                  color: '#334155', border: '1px solid #e2e8f0', margin: 0,
                }}>
                  {s}
                </Tag>
              ))}
            </div>
          </div>

          {/* Job Responsibility */}
          {posting.jobResponsibility && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', color: '#9ca3af', textTransform: 'uppercase', marginBottom: 8 }}>Job Responsibility</div>
              <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
                {posting.jobResponsibility}
              </p>
            </div>
          )}
        </SectionCard>

        {/* ── Assigned Pipeline ──────────────────────────────────────────────── */}
        <SectionCard title="Assigned Pipeline" icon={<ApartmentOutlined />}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            {assignedPipeline ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 9,
                  background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <ApartmentOutlined style={{ color: '#ffffff', fontSize: 16 }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{assignedPipeline}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Active pipeline</div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 13, color: '#6b7280' }}>
                No pipeline assigned yet. Assign a pipeline to start tracking candidates.
              </div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <Button
                icon={<UsergroupAddOutlined />}
                onClick={() => navigate(`/recruitment/pipelines/${posting.mrfId}/candidates`, {
                  state: { pipelineName: assignedPipeline ?? undefined, position: posting.designation, candidates: posting.applications },
                })}
              >
                Show Candidates
              </Button>
              {assignedPipeline ? (
                <Button
                  icon={<ApartmentOutlined />}
                  onClick={() => navigate(`/recruitment/pipelines/${posting.mrfId}`, {
                    state: { pipelineName: assignedPipeline, position: posting.designation, candidates: posting.applications },
                  })}
                >
                  View Pipeline
                </Button>
              ) : (
                <Button
                  type="primary"
                  icon={<ApartmentOutlined />}
                  onClick={() => setAssignModalOpen(true)}
                >
                  Assign Pipeline
                </Button>
              )}
            </div>
          </div>
        </SectionCard>

        <AssignPipelineModal
          open={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          onAssign={name => setAssignedPipeline(name)}
          onCreateNew={name => navigate('/recruitment/pipelines/new', {
            state: { pipelineName: name, position: posting.designation, candidates: 0 },
          })}
        />

      </div>
    </div>
  );
}
