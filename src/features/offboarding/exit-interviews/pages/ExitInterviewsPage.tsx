import { useState, useMemo } from 'react';
import { Rate, Popconfirm, message } from 'antd';
import {
  PlusOutlined,
  FileTextOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import type { ExitInterview, InterviewStatus, InterviewResponses } from '../types/exitInterview.types';
import { ScheduleInterviewModal } from '../components/ScheduleInterviewModal';
import { ConductInterviewModal } from '../components/ConductInterviewModal';
import { ViewResponsesModal } from '../components/ViewResponsesModal';

// ─── Mock data ────────────────────────────────────────────────────────────────

const INITIAL_INTERVIEWS: ExitInterview[] = [
  {
    id: '1',
    employeeName: 'Sarah Chen',
    initials: 'SC',
    employeeId: 'EMP-1042',
    department: 'Engineering',
    date: '2026-04-10',
    interviewer: 'HR Manager',
    reason: 'Career growth',
    status: 'Scheduled',
  },
  {
    id: '2',
    employeeName: 'Aisha Patel',
    initials: 'AP',
    employeeId: 'EMP-0654',
    department: 'Finance',
    date: '2026-03-25',
    interviewer: 'HR Director',
    reason: 'Contract end',
    status: 'Completed',
    recommend: true,
    rating: 4,
    quote: 'Great experience overall. Would consider returning.',
    responses: {
      reasons: 'My contract has ended and I have decided to pursue other opportunities in the financial sector.',
      policyImprovement: 'The leave policy could be more flexible. Remote work options would significantly improve work-life balance.',
      orgImprovement: 'Consider implementing structured mentorship programs for new employees.',
      additionalComments: 'The team culture was excellent. I learned a lot during my time here.',
      separationRequests: 'Please ensure my final settlement is processed within the standard 30-day period.',
      overallExperienceRating: 4,
      wouldRecommend: true,
      workLifeRating: 3,
      compensationRating: 4,
      managementRating: 5,
      overallRatingFinal: 4,
      wouldRecommendFinal: true,
      hrNotes: 'Employee was cooperative and professional throughout the exit process. Flagged for rehire eligibility.',
    },
  },
  {
    id: '3',
    employeeName: 'James Rodriguez',
    initials: 'JR',
    employeeId: 'EMP-0871',
    department: 'Marketing',
    date: '2026-04-15',
    interviewer: 'HR Manager',
    reason: 'Relocation',
    status: 'Pending',
  },
  {
    id: '4',
    employeeName: 'Elena Vasquez',
    initials: 'EV',
    employeeId: 'EMP-0322',
    department: 'HR',
    date: '2026-06-25',
    interviewer: 'CEO',
    reason: 'Retirement',
    status: 'Scheduled',
  },
];

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<InterviewStatus, { bg: string; border: string; color: string }> = {
  Scheduled: { bg: 'var(--color-status-info-bg)', border: '#93c5fd', color: '#2563eb' },
  Pending:   { bg: 'var(--color-status-pending-bg)', border: 'rgba(252, 211, 77, 0.45)', color: '#d97706' },
  Completed: { bg: 'var(--color-status-approved-bg)', border: 'var(--color-status-approved-bg)', color: '#059669' },
  Cancelled: { bg: 'var(--color-status-rejected-bg)', border: 'var(--color-status-rejected-bg)', color: '#dc2626' },
};

function StatusBadge({ status }: { status: InterviewStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 600,
      background: s.bg,
      border: `1.5px solid ${s.border}`,
      color: s.color,
      letterSpacing: '0.02em',
    }}>
      {status}
    </span>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ initials }: { initials: string }) {
  return (
    <div style={{
      width: 40, height: 40, borderRadius: '50%',
      background: 'var(--color-bg-subtle)', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontSize: 13, fontWeight: 700, color: 'var(--color-text-secondary)',
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

// ─── Info cell ────────────────────────────────────────────────────────────────

function InfoCell({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--color-text-disabled)', textTransform: 'uppercase', marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 500 }}>{value}</div>
    </div>
  );
}

// ─── Interview Card ───────────────────────────────────────────────────────────

function InterviewCard({
  interview,
  onConduct,
  onCancel,
  onViewResponses,
}: {
  interview: ExitInterview;
  onConduct: () => void;
  onCancel: () => void;
  onViewResponses: () => void;
}) {
  const isActive = interview.status === 'Scheduled' || interview.status === 'Pending';
  const isCompleted = interview.status === 'Completed';

  return (
    <div style={{
      background: 'var(--color-bg-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 12,
      padding: '16px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar initials={interview.initials} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {interview.employeeName}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-disabled)', marginTop: 1 }}>
              {interview.department} · {interview.employeeId}
            </div>
          </div>
        </div>
        <StatusBadge status={interview.status} />
      </div>

      {/* Info Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px' }}>
        <InfoCell label="Date" value={interview.date} />
        <InfoCell label="Interviewer" value={interview.interviewer} />
        <InfoCell label="Reason" value={interview.reason} />
        <InfoCell
          label="Recommend"
          value={
            interview.recommend === true
              ? <span style={{ color: '#059669', fontWeight: 600 }}>✓ Yes</span>
              : interview.recommend === false
              ? <span style={{ color: '#dc2626', fontWeight: 600 }}>✗ No</span>
              : <span style={{ color: 'var(--color-text-disabled)' }}>—</span>
          }
        />
      </div>

      {/* Completed extras */}
      {isCompleted && interview.rating != null && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: interview.quote ? 8 : 0 }}>
            <Rate disabled value={interview.rating} style={{ color: '#f59e0b', fontSize: 14 }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              {interview.rating}/5
            </span>
          </div>
          {interview.quote && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 7,
              fontSize: 12, color: 'var(--color-text-tertiary)', fontStyle: 'italic',
              lineHeight: 1.5,
            }}>
              <MessageOutlined style={{ fontSize: 13, color: 'var(--color-text-disabled)', marginTop: 1, flexShrink: 0 }} />
              <span>"{interview.quote}"</span>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {isActive && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={onConduct}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 7, padding: '8px 0',
              background: 'var(--color-primary)', color: '#fff',
              border: 'none', borderRadius: 8,
              fontSize: 12, fontWeight: 600,
              cursor: 'pointer', transition: 'background 0.12s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#0d6560')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
          >
            <FileTextOutlined style={{ fontSize: 13 }} />
            Conduct Interview
          </button>
          <Popconfirm
            title="Cancel this interview?"
            description="This action cannot be undone."
            onConfirm={onCancel}
            okText="Yes, Cancel"
            cancelText="Keep"
            okButtonProps={{ danger: true }}
          >
            <button
              type="button"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 6, padding: '8px 14px',
                background: 'var(--color-status-rejected-bg)', color: '#dc2626',
                border: '1.5px solid #fca5a5', borderRadius: 8,
                fontSize: 12, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-status-rejected-bg)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-status-rejected-bg)'; }}
            >
              Cancel
            </button>
          </Popconfirm>
        </div>
      )}

      {isCompleted && (
        <button
          type="button"
          onClick={onViewResponses}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 7, padding: '8px 0',
            background: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border)', borderRadius: 8,
            fontSize: 12, fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.12s',
            width: '100%',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-primary-tint)'; e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-bg-subtle)'; e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
        >
          <FileTextOutlined style={{ fontSize: 13 }} />
          View Responses
        </button>
      )}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  valueColor,
  suffix,
}: {
  label: string;
  value: React.ReactNode;
  valueColor?: string;
  suffix?: React.ReactNode;
}) {
  return (
    <div style={{
      background: 'var(--color-bg-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 12,
      padding: '16px 20px',
    }}>
      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
        color: 'var(--color-text-disabled)', textTransform: 'uppercase', marginBottom: 8,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 28, fontWeight: 700,
        color: valueColor ?? 'var(--color-text-primary)',
        display: 'flex', alignItems: 'center', gap: 6,
        lineHeight: 1,
      }}>
        {value}
        {suffix}
      </div>
    </div>
  );
}

// ─── Filter Tab ───────────────────────────────────────────────────────────────

const FILTER_OPTIONS: Array<InterviewStatus | 'All'> = ['All', 'Scheduled', 'Pending', 'Completed', 'Cancelled'];

function FilterTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '5px 14px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: active ? 700 : 500,
        border: active ? '1.5px solid #0f766e' : '1.5px solid #e5e7eb',
        background: active ? 'var(--color-primary)' : 'var(--color-bg-surface)',
        color: active ? '#fff' : 'var(--color-text-tertiary)',
        cursor: 'pointer',
        transition: 'all 0.12s',
      }}
    >
      {label}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ExitInterviewsPage() {
  const [interviews, setInterviews] = useState<ExitInterview[]>(INITIAL_INTERVIEWS);
  const [filter, setFilter] = useState<InterviewStatus | 'All'>('All');
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [conductTarget, setConductTarget] = useState<ExitInterview | null>(null);
  const [viewTarget, setViewTarget] = useState<ExitInterview | null>(null);

  // ── Derived stats ──────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total = interviews.length;
    const completed = interviews.filter(i => i.status === 'Completed');
    const ratings = completed.filter(i => i.rating != null).map(i => i.rating as number);
    const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    const recommenders = completed.filter(i => i.recommend === true).length;
    const recommendPct = completed.length ? Math.round((recommenders / completed.length) * 100) : 0;
    return { total, completed: completed.length, avgRating, recommendPct };
  }, [interviews]);

  // ── Filtered list ──────────────────────────────────────────────────────────

  const filtered = useMemo(
    () => filter === 'All' ? interviews : interviews.filter(i => i.status === filter),
    [interviews, filter],
  );

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSchedule = (values: { employeeId: string; date: string; interviewer: string }) => {
    const empLabels: Record<string, { name: string; initials: string; dept: string }> = {
      'EMP-0234': { name: 'David Kim', initials: 'DK', dept: 'IT' },
      'EMP-0445': { name: 'Maria Santos', initials: 'MS', dept: 'Operations' },
      'EMP-0512': { name: 'Ahmed Hassan', initials: 'AH', dept: 'Finance' },
      'EMP-0678': { name: 'Priya Nair', initials: 'PN', dept: 'Marketing' },
      'EMP-0789': { name: 'Thomas Lee', initials: 'TL', dept: 'Engineering' },
    };
    const emp = empLabels[values.employeeId] ?? { name: values.employeeId, initials: '??', dept: 'Unknown' };
    const newInterview: ExitInterview = {
      id: Date.now().toString(),
      employeeName: emp.name,
      initials: emp.initials,
      employeeId: values.employeeId,
      department: emp.dept,
      date: values.date,
      interviewer: values.interviewer,
      reason: 'Pending review',
      status: 'Scheduled',
    };
    setInterviews(prev => [newInterview, ...prev]);
    message.success('Exit interview scheduled successfully.');
  };

  const handleComplete = (id: string, responses: InterviewResponses) => {
    setInterviews(prev => prev.map(i => {
      if (i.id !== id) return i;
      return {
        ...i,
        status: 'Completed',
        rating: responses.overallRatingFinal,
        recommend: responses.wouldRecommendFinal ?? undefined,
        quote: responses.reasons.slice(0, 80) + (responses.reasons.length > 80 ? '...' : ''),
        responses,
      };
    }));
    message.success('Interview completed and recorded.');
  };

  const handleCancel = (id: string) => {
    setInterviews(prev => prev.map(i =>
      i.id === id ? { ...i, status: 'Cancelled' } : i,
    ));
    message.success('Interview cancelled.');
  };

  return (
    <div style={{ padding: '24px 28px', minHeight: '100%' }}>

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', marginBottom: 24,
      }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text-primary)', margin: 0, lineHeight: 1.2 }}>
            Exit Interviews
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)', margin: '4px 0 0' }}>
            Schedule, conduct, and track exit interview sessions
          </p>
        </div>
        <button
          type="button"
          onClick={() => setScheduleOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '9px 18px',
            background: 'var(--color-primary)', color: '#fff',
            border: 'none', borderRadius: 10,
            fontSize: 13, fontWeight: 700,
            cursor: 'pointer', transition: 'background 0.12s',
            flexShrink: 0,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#0d6560')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
        >
          <PlusOutlined style={{ fontSize: 13 }} />
          Schedule Interview
        </button>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────────────── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16, marginBottom: 24,
      }}>
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Completed" value={stats.completed} valueColor="#059669" />
        <StatCard
          label="Avg Rating"
          value={stats.avgRating.toFixed(1)}
          suffix={<span style={{ fontSize: 20, color: '#f59e0b' }}>★</span>}
        />
        <StatCard label="Would Recommend" value={`${stats.recommendPct}%`} />
      </div>

      {/* ── Filter tabs ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <span style={{ color: 'var(--color-text-disabled)', fontSize: 14, marginRight: 2 }}>⊟</span>
        {FILTER_OPTIONS.map(f => (
          <FilterTab
            key={f}
            label={f}
            active={filter === f}
            onClick={() => setFilter(f)}
          />
        ))}
      </div>

      {/* ── Cards grid ──────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '48px 0',
          color: 'var(--color-text-disabled)', fontSize: 13,
        }}>
          No {filter !== 'All' ? filter.toLowerCase() : ''} interviews found.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 16,
        }}>
          {filtered.map(interview => (
            <InterviewCard
              key={interview.id}
              interview={interview}
              onConduct={() => setConductTarget(interview)}
              onCancel={() => handleCancel(interview.id)}
              onViewResponses={() => setViewTarget(interview)}
            />
          ))}
        </div>
      )}

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      <ScheduleInterviewModal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        onSubmit={handleSchedule}
      />

      <ConductInterviewModal
        open={conductTarget !== null}
        interview={conductTarget}
        onClose={() => setConductTarget(null)}
        onComplete={handleComplete}
      />

      <ViewResponsesModal
        open={viewTarget !== null}
        interview={viewTarget}
        onClose={() => setViewTarget(null)}
      />
    </div>
  );
}
