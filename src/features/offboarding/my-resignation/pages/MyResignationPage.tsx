import { useEffect, useMemo, useState } from 'react';
import {
  BankOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  FormOutlined,
  HistoryOutlined,
  PlusOutlined,
  RightOutlined,
  SendOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Button, DatePicker, Input, Modal, Select, Space, Tag, message } from 'antd';
import type { Dayjs } from 'dayjs';
import type { SepStatus } from '@/features/offboarding/separation-requests/types/separation.types';
import { useSeparationStore } from '@/features/offboarding/separation-requests/store/separationStore';
import { SeparationDetailModal } from '@/features/offboarding/components/SeparationDetailModal';
import { getWorkflowStage, SEPARATION_PROGRESS_STEPS } from '@/features/offboarding/components/separationDetailUtils';

// ─── Constants ────────────────────────────────────────────────────────────────

const CURRENT_EMPLOYEE = {
  id: 'EMP-042',
  name: 'John Doe',
  department: 'Engineering',
  designation: 'Senior Developer',
  dateOfJoining: '2022-06-15',
  noticePeriodDays: 60,
};

const RESIGNATION_REASONS = [
  'Better Opportunity',
  'Personal Reasons',
  'Higher Education',
  'Relocation',
  'Health Issues',
  'Work-Life Balance',
  'Salary Dissatisfaction',
  'Career Change',
  'Family Obligations',
  'Other',
];

const NOTICE_DURATION_OPTIONS = [
  { label: 'Serve Full Notice', value: 'Serve Full Notice' },
  { label: 'Early Release (Notice Buyout)', value: 'Early Release (Notice Buyout)' },
];

const RESIGNATION_POLICY_RULES = [
  'Employee shall serve 60 days notice in writing/email.',
  'May pay gross salary for the notice period in lieu of notice.',
  'Must hand over charge, return books, papers, documents & other properties.',
  'Management may waive notice period fully or partially at discretion.',
  'May adjust notice period with Annual Leave upon employee request.',
  'No resignation accepted if disciplinary proceedings are pending.',
  'For Flight Crew: notice period as per agreement/contract applies.',
];

// ─── Colors ───────────────────────────────────────────────────────────────────

const C = {
  primary: '#0f766e',
  primaryDark: '#115e59',
  primaryLight: '#f0fdfa',
  navy: '#1e3a5f',
  navyDark: '#152d4a',
  border: '#d8e7e5',
  surface: '#ffffff',
  surfaceMuted: '#f8fafc',
  text: '#111827',
  textSecondary: '#374151',
  textMuted: '#6b7280',
  textSoft: '#9ca3af',
  warning: '#d97706',
  warningBg: '#fffbeb',
  warningBorder: '#fde68a',
  success: '#059669',
  successBg: '#f0fdf4',
  successBorder: '#bbf7d0',
  danger: '#dc2626',
  dangerBg: '#fef2f2',
  dangerBorder: '#fecaca',
  info: '#0284c7',
  infoBg: '#f0f9ff',
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface HistoryEntry {
  refId: string;
  status: SepStatus;
  submittedOn: string;
  reason: string;
  rejectionRemarks: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getPrimaryReason(record: { reason?: string; remarks?: string } | null | undefined) {
  return record?.reason ?? record?.remarks ?? 'N/A';
}

function getAdditionalNotes(record: { reason?: string; remarks?: string } | null | undefined) {
  const primaryReason = getPrimaryReason(record);
  return record?.remarks && record.remarks !== primaryReason ? record.remarks : '';
}

function getSubmissionDateLabel(submissionDate: string) {
  const rawDate = submissionDate.split(';')[0]?.trim();
  if (!rawDate) {
    return 'N/A';
  }

  const [day, month, year] = rawDate.split('-');
  const parsed = new Date(Number(year), Number(month) - 1, Number(day));
  if (Number.isNaN(parsed.getTime())) {
    return rawDate;
  }

  return parsed.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getStatusPresentation(status: SepStatus) {
  if (status === 'Completed') {
    return {
      badgeLabel: 'Separation Completed',
      badgeStyle: {
        background: C.successBg,
        border: `1px solid ${C.successBorder}`,
        color: C.success,
      },
      iconBackground: C.successBg,
      iconColor: C.success,
      tagColor: 'success' as const,
    };
  }

  if (status === 'In Progress' || status === 'On Hold') {
    return {
      badgeLabel: 'Resignation In Progress',
      badgeStyle: {
        background: C.infoBg,
        border: '1px solid #bae6fd',
        color: C.info,
      },
      iconBackground: C.infoBg,
      iconColor: C.info,
      tagColor: 'processing' as const,
    };
  }

  if (status === 'Rejected') {
    return {
      badgeLabel: 'Rejected',
      badgeStyle: {
        background: C.dangerBg,
        border: `1px solid ${C.dangerBorder}`,
        color: C.danger,
      },
      iconBackground: C.dangerBg,
      iconColor: C.danger,
      tagColor: 'error' as const,
    };
  }

  return {
    badgeLabel: 'Resignation Submitted',
    badgeStyle: {
      background: C.warningBg,
      border: `1px solid ${C.warningBorder}`,
      color: C.warning,
    },
    iconBackground: C.warningBg,
    iconColor: C.warning,
    tagColor: 'warning' as const,
  };
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, color: C.textSoft, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
      {children}
    </div>
  );
}

function InfoGrid({ items }: { items: Array<{ label: string; value: string }> }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden', marginBottom: 20 }}>
      {items.map((item, idx) => (
        <div key={item.label} style={{
          padding: '14px 18px',
          borderBottom: idx < items.length - 2 ? `1px solid ${C.border}` : 'none',
          borderRight: idx % 2 === 0 ? `1px solid ${C.border}` : 'none',
        }}>
          <SectionLabel>{item.label}</SectionLabel>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginTop: 2 }}>{item.value}</div>
        </div>
      ))}
    </div>
  );
}

function FieldLabel({ children, required }: { children: string; required?: boolean }) {
  return (
    <div style={{ fontSize: 13, fontWeight: 600, color: C.textSecondary, marginBottom: 8 }}>
      {children}{required && <span style={{ color: '#dc2626', marginLeft: 2 }}>*</span>}
    </div>
  );
}

// ─── Progress tracker ─────────────────────────────────────────────────────────

function ProgressTracker({ stage, status }: { stage: string; status: string }) {
  const isRejected  = status === 'Rejected';
  const currentStep = Math.max(0, SEPARATION_PROGRESS_STEPS.indexOf(stage as typeof SEPARATION_PROGRESS_STEPS[number]));
  const accent      = isRejected ? C.danger : C.navy;

  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '20px 0 8px' }}>
      {SEPARATION_PROGRESS_STEPS.map((step, idx) => {
        const isDone    = idx < currentStep;
        const isCurrent = idx === currentStep;
        const isActive  = isDone || isCurrent;
        return (
          <div key={step} style={{ display: 'flex', alignItems: 'center', flex: idx < SEPARATION_PROGRESS_STEPS.length - 1 ? '1 1 0' : '0 0 auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: isCurrent ? 40 : 32, height: isCurrent ? 40 : 32,
                borderRadius: '50%', background: isActive ? accent : '#e5e7eb',
                color: isActive ? '#fff' : C.textSoft,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: isCurrent ? 15 : 12, fontWeight: 700,
                border: isCurrent ? `3px solid ${accent}` : 'none',
                boxShadow: isCurrent ? `0 0 0 3px ${accent}22` : 'none',
              }}>
                {isDone ? <CheckOutlined style={{ fontSize: 13 }} /> : (isRejected && isCurrent ? <CloseCircleOutlined style={{ fontSize: 13 }} /> : idx + 1)}
              </div>
              <div style={{ fontSize: 11, fontWeight: isCurrent ? 700 : 500, color: isActive ? C.text : C.textSoft, whiteSpace: 'nowrap' }}>
                {step}
              </div>
            </div>
            {idx < SEPARATION_PROGRESS_STEPS.length - 1 && (
              <div style={{ flex: 1, height: 2, background: isDone ? accent : '#e5e7eb', marginBottom: 30 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Download form card ───────────────────────────────────────────────────────

function DownloadCard({ icon, title, description, filename }: {
  icon: React.ReactNode; title: string; description: string; filename: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: '14px 18px', border: `1px solid ${C.border}`, borderRadius: 10, background: C.surface }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: C.primaryLight, color: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{title}</div>
          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{description}</div>
        </div>
      </div>
      <Button icon={<DownloadOutlined />} size="small" onClick={() => message.info(`Downloading ${filename}…`)}>
        Download
      </Button>
    </div>
  );
}

// ─── Resignation application form ─────────────────────────────────────────────

function ResignationForm({ onSubmit }: {
  onSubmit: (data: { reason: string; duration: string; lastWorkingDay: string; lastWorkingDayRaw: string; details: string }) => void;
}) {
  const [reason, setReason]               = useState('');
  const [duration, setDuration]           = useState('');
  const [lastWorkingDay, setLastWorkingDay] = useState<Dayjs | null>(null);
  const [details, setDetails]             = useState('');
  const [submitting, setSubmitting]       = useState(false);
  const [confirmOpen, setConfirmOpen]     = useState(false);

  const isValid = reason && duration && lastWorkingDay && details.trim().length > 0;

  const handleConfirm = () => {
    setConfirmOpen(false);
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onSubmit({
        reason,
        duration,
        lastWorkingDay: lastWorkingDay!.format('MMM D, YYYY'),
        lastWorkingDayRaw: lastWorkingDay!.format('YYYY-MM-DD'),
        details,
      });
    }, 600);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>
      {/* Left — form card */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '28px 28px 24px', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <SendOutlined style={{ fontSize: 16, color: C.navy, transform: 'rotate(-30deg)' }} />
          <span style={{ fontSize: 16, fontWeight: 800, color: C.text }}>Resignation Application</span>
        </div>
        <p style={{ fontSize: 12, color: C.textMuted, marginBottom: 24, marginLeft: 26 }}>
          Fill in the details below to submit your resignation. Your request will be reviewed by HR.
        </p>

        <InfoGrid items={[
          { label: 'Employee ID',  value: CURRENT_EMPLOYEE.id },
          { label: 'Name',         value: CURRENT_EMPLOYEE.name },
          { label: 'Department',   value: CURRENT_EMPLOYEE.department },
          { label: 'Designation',  value: CURRENT_EMPLOYEE.designation },
        ]} />

        <div style={{ marginBottom: 18 }}>
          <FieldLabel required>Reason for Resignation</FieldLabel>
          <Select style={{ width: '100%' }} placeholder="Select a reason" value={reason || undefined} onChange={setReason} size="large"
            options={RESIGNATION_REASONS.map(r => ({ label: r, value: r }))} />
        </div>

        <div style={{ marginBottom: 18 }}>
          <FieldLabel required>Duration</FieldLabel>
          <Select style={{ width: '100%' }} placeholder="Select notice duration type" value={duration || undefined} onChange={setDuration} size="large"
            options={NOTICE_DURATION_OPTIONS} />
        </div>

        <div style={{ marginBottom: 18 }}>
          <FieldLabel required>Requested Last Working Day</FieldLabel>
          <DatePicker style={{ width: '100%' }} size="large" value={lastWorkingDay} onChange={setLastWorkingDay}
            format="MM/DD/YYYY" placeholder="mm/dd/yyyy" disabledDate={d => d.isBefore(new Date(), 'day')} />
        </div>

        <div style={{ marginBottom: 24 }}>
          <FieldLabel required>Additional Details</FieldLabel>
          <Input.TextArea rows={4} placeholder="Please provide any additional details about your resignation…"
            value={details} onChange={e => setDetails(e.target.value)} style={{ resize: 'vertical' }} />
        </div>

        <Button type="primary" block size="large" icon={<SendOutlined />} loading={submitting}
          disabled={!isValid} onClick={() => setConfirmOpen(true)}
          style={{ background: C.navy, borderColor: C.navyDark, height: 46, fontSize: 14, fontWeight: 700 }}>
          Submit Resignation
        </Button>
      </div>

      {/* Right sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Resignation Policy */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '20px 22px', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <FileTextOutlined style={{ color: C.navy, fontSize: 15 }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Resignation Policy</span>
          </div>
          <p style={{ fontSize: 11, color: C.textMuted, marginBottom: 14 }}>Employee-initiated voluntary departure</p>

          {/* Probation / Confirmed notice boxes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
            {[{ label: 'PROBATION', days: 30 }, { label: 'CONFIRMED', days: 60 }].map(item => (
              <div key={item.label} style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px' }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: C.textSoft, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: C.text }}>{item.days} <span style={{ fontSize: 13, fontWeight: 500 }}>days</span></div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 11, color: C.textMuted, marginBottom: 14 }}>60 days notice or gross salary in lieu</p>

          <div style={{ fontSize: 9, fontWeight: 700, color: C.textSoft, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Policy Rules</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {RESIGNATION_POLICY_RULES.map(rule => (
              <div key={rule} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <RightOutlined style={{ fontSize: 9, color: C.textMuted, flexShrink: 0, marginTop: 3 }} />
                <span style={{ fontSize: 11, color: C.textSecondary, lineHeight: 1.5 }}>{rule}</span>
              </div>
            ))}
          </div>
        </div>

        {/* What Happens Next */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '20px 22px', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <BankOutlined style={{ color: C.navy, fontSize: 15 }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: C.textSecondary }}>What Happens Next?</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['HR reviews your request', 'Manager acknowledgment', 'Exit interview scheduled', 'Clearance process begins', 'Final settlement processed'].map(step => (
              <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <RightOutlined style={{ fontSize: 10, color: C.primary, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: C.textSecondary }}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation modal */}
      <Modal open={confirmOpen} onCancel={() => setConfirmOpen(false)} footer={null} width={480} centered
        styles={{ body: { padding: '28px 28px 24px' } }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 6, marginBottom: 24 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fef3c7', border: '2px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
            <ExclamationCircleOutlined style={{ fontSize: 24, color: C.warning }} />
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>Confirm Resignation</div>
          <div style={{ fontSize: 12, color: C.textMuted, maxWidth: 340, lineHeight: 1.6 }}>
            You are about to submit your resignation. This action will notify HR and your line manager. Please review the details below before confirming.
          </div>
        </div>

        <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden', marginBottom: 20 }}>
          {[
            { label: 'Employee',         value: `${CURRENT_EMPLOYEE.name} (${CURRENT_EMPLOYEE.id})` },
            { label: 'Department',       value: `${CURRENT_EMPLOYEE.department} · ${CURRENT_EMPLOYEE.designation}` },
            { label: 'Reason',           value: reason },
            { label: 'Duration',         value: duration },
            { label: 'Last Working Day', value: lastWorkingDay?.format('MMM D, YYYY') ?? '' },
            { label: 'Notice Period',    value: `${CURRENT_EMPLOYEE.noticePeriodDays} days` },
          ].map((item, idx, arr) => (
            <div key={item.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12,
              padding: '11px 16px', background: idx % 2 === 0 ? C.surface : C.surfaceMuted,
              borderBottom: idx < arr.length - 1 ? `1px solid ${C.border}` : 'none',
            }}>
              <span style={{ fontSize: 12, color: C.textMuted, flexShrink: 0 }}>{item.label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.text, textAlign: 'right' }}>{item.value}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button onClick={() => setConfirmOpen(false)}>Go Back</Button>
          <Button type="primary" icon={<SendOutlined />} onClick={handleConfirm}
            style={{ background: C.navy, borderColor: C.navyDark }}>
            Yes, Submit Resignation
          </Button>
        </div>
      </Modal>
    </div>
  );
}

// ─── Status view ──────────────────────────────────────────────────────────────

function ResignationStatus({
  refId,
  submittedOn,
  onApplyNew,
  onViewDetails,
}: {
  refId: string;
  submittedOn: string;
  onApplyNew: () => void;
  onViewDetails: () => void;
}) {
  const record = useSeparationStore((s) => s.requests.find(r => r.id === refId));

  if (!record) return null;

  const isRejected   = record.status === 'Rejected';
  const isCompleted  = record.status === 'Completed';
  const effectiveNotice = record.noticePeriodOverride ?? record.noticePeriod;
  const effectiveLWD    = record.dateOfSeparationOverride ?? record.dateOfSeparation;
  const primaryReason = getPrimaryReason(record);
  const additionalNotes = getAdditionalNotes(record);
  const workflowStage = getWorkflowStage(record);

  const displayStatus = isRejected ? 'Rejected' : record.status === 'Completed' ? 'Completed' : record.status === 'In Progress' ? 'Under Review' : 'Pending Review';

  const timeline = record.activityTimeline?.length
    ? record.activityTimeline
    : [{ action: 'Resignation submitted', date: submittedOn }];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Rejection banner */}
      {isRejected && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 14,
          padding: '16px 20px', background: C.dangerBg,
          border: `1px solid ${C.dangerBorder}`, borderRadius: 12,
          boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
        }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#fee2e2', color: C.danger, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CloseCircleOutlined style={{ fontSize: 16 }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.danger, marginBottom: 4 }}>Resignation Rejected by HR</div>
            {record.rejectionRemarks && (
              <div style={{ fontSize: 13, color: C.textSecondary, background: '#fff', border: `1px solid ${C.dangerBorder}`, borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: C.danger, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 4 }}>HR Remarks</span>
                {record.rejectionRemarks}
              </div>
            )}
            <Button type="primary" icon={<PlusOutlined />} onClick={onApplyNew}
              style={{ background: C.navy, borderColor: C.navyDark }}>
              Apply for New Resignation
            </Button>
          </div>
        </div>
      )}

      {/* Main request card */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
        {/* Header */}
        <div style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.border}`, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: C.surfaceMuted, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileTextOutlined style={{ color: C.textMuted, fontSize: 15 }} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>Resignation Request — {record.id}</div>
              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>Submitted on {submittedOn}</div>
            </div>
          </div>
          <Space>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999,
              fontSize: 12, fontWeight: 700,
              background: isRejected ? C.dangerBg : isCompleted ? C.successBg : C.warningBg,
              border: `1px solid ${isRejected ? C.dangerBorder : isCompleted ? C.successBorder : C.warningBorder}`,
              color: isRejected ? C.danger : isCompleted ? C.success : C.warning,
            }}>
              <ClockCircleOutlined style={{ fontSize: 11 }} />
              {displayStatus}
            </span>
            <Button size="small" icon={<EyeOutlined />} onClick={onViewDetails}>
              View Details
            </Button>
          </Space>
        </div>

        {/* HR-edited notice warning */}
        {(record.noticePeriodOverride || record.dateOfSeparationOverride) && (
          <div style={{ padding: '10px 24px', background: '#fffbeb', borderBottom: `1px solid ${C.warningBorder}`, display: 'flex', alignItems: 'center', gap: 8 }}>
            <WarningOutlined style={{ color: C.warning, fontSize: 13 }} />
            <span style={{ fontSize: 12, color: C.warning, fontWeight: 600 }}>
              HR has updated your notice period or last working day. Please review below.
            </span>
          </div>
        )}

        {/* Progress */}
        <div style={{ padding: '8px 32px 4px' }}>
          <ProgressTracker stage={workflowStage} status={record.status} />
        </div>

        <div style={{ borderTop: `1px solid ${C.border}` }} />

        {/* Info grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 0 }}>
          {[
            { label: 'Employee',         value: CURRENT_EMPLOYEE.name },
            { label: 'Department',       value: record.department },
            { label: 'Last Working Day', value: effectiveLWD, accent: record.dateOfSeparationOverride ? C.warning : undefined },
            { label: 'Notice Period',    value: `${effectiveNotice} days`, accent: record.noticePeriodOverride ? C.warning : undefined },
          ].map((item, idx, arr) => (
            <div key={item.label} style={{ padding: '16px 24px', borderRight: idx < arr.length - 1 ? `1px solid ${C.border}` : 'none' }}>
              <SectionLabel>{item.label}</SectionLabel>
              <div style={{ fontSize: 13, fontWeight: 700, color: item.accent ?? C.text, marginTop: 4 }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* Reason */}
        <div style={{ borderTop: `1px solid ${C.border}`, padding: '14px 24px 18px' }}>
          <SectionLabel>Reason</SectionLabel>
          <div style={{ fontSize: 13, color: C.textSecondary, background: C.surfaceMuted, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', marginTop: 6 }}>
            {primaryReason}
          </div>
          {additionalNotes && (
            <div style={{ marginTop: 12 }}>
              <SectionLabel>Additional Notes</SectionLabel>
              <div style={{ fontSize: 13, color: C.textSecondary, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', marginTop: 6 }}>
                {additionalNotes}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Download forms */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 20px', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>Download Forms</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <DownloadCard icon={<FormOutlined style={{ fontSize: 15 }} />} title="Handover Form"
            description="Document your responsibilities and pending tasks for handover" filename="Handover_Form.pdf" />
          <DownloadCard icon={<FileDoneOutlined style={{ fontSize: 15 }} />} title="Final Settlement Form"
            description="Final & full settlement computation form for HR processing" filename="Final_Settlement_Form.pdf" />
        </div>
      </div>

      {/* Activity timeline */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '20px 24px', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>Activity Timeline</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {timeline.map((event, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, paddingBottom: idx < timeline.length - 1 ? 18 : 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: isRejected && idx === timeline.length - 1 ? C.danger : C.primary, marginTop: 3 }} />
                {idx < timeline.length - 1 && <div style={{ width: 2, flex: 1, background: `${C.primary}30`, minHeight: 28, marginTop: 4 }} />}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{event.action}</div>
                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>
                  {event.date}{event.by ? ` · ${event.by}` : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── History entry card ───────────────────────────────────────────────────────

function HistoryCard({ entry, onView }: { entry: HistoryEntry; onView: () => void }) {
  const statusPresentation = getStatusPresentation(entry.status);

  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
      padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: 14,
    }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: statusPresentation.iconBackground, color: statusPresentation.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {entry.status === 'Completed' ? <CheckOutlined style={{ fontSize: 14 }} /> : <CloseCircleOutlined style={{ fontSize: 14 }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{entry.refId}</span>
          <Tag color={statusPresentation.tagColor} style={{ margin: 0, fontWeight: 600 }}>{entry.status}</Tag>
          <span style={{ fontSize: 11, color: C.textMuted, marginLeft: 'auto' }}>Submitted {entry.submittedOn}</span>
        </div>
        <div style={{ fontSize: 12, color: C.textSecondary }}>{entry.reason}</div>
        {entry.rejectionRemarks && (
          <div style={{ fontSize: 12, color: C.danger, marginTop: 6, background: C.dangerBg, borderRadius: 6, padding: '6px 10px', border: `1px solid ${C.dangerBorder}`, display: 'flex', alignItems: 'center', gap: 6 }}>
            <WarningOutlined style={{ fontSize: 11, flexShrink: 0 }} />
            {entry.rejectionRemarks}
          </div>
        )}
      </div>
      <Button size="small" icon={<EyeOutlined />} onClick={onView} style={{ flexShrink: 0 }}>
        View
      </Button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MyResignationPage() {
  const addRequest = useSeparationStore((s) => s.addRequest);
  const requests   = useSeparationStore((s) => s.requests);

  const [isPreparingNewRequest, setIsPreparingNewRequest] = useState(false);
  const [viewingRefId, setViewingRefId] = useState<string | null>(null);

  const employeeRequests = useMemo(() => {
    return requests
      .filter((request) => request.empId === CURRENT_EMPLOYEE.id && request.modeOfSeparation === 'Resignation')
      .sort((left, right) => Number(right.id.replace(/\D/g, '')) - Number(left.id.replace(/\D/g, '')));
  }, [requests]);

  const latestRequest = employeeRequests[0] ?? null;
  const showApplicationForm = !latestRequest || (latestRequest.status === 'Rejected' && isPreparingNewRequest);
  const currentRecord = showApplicationForm ? null : latestRequest;
  const currentStatusPresentation = currentRecord ? getStatusPresentation(currentRecord.status) : null;
  const submittedOn = currentRecord ? getSubmissionDateLabel(currentRecord.resignationSubmissionDate) : '';
  const historyEntries: HistoryEntry[] = (showApplicationForm ? employeeRequests : employeeRequests.slice(1)).map((request) => ({
    refId: request.id,
    status: request.status,
    rejectionRemarks: request.rejectionRemarks ?? '',
    reason: getPrimaryReason(request),
    submittedOn: getSubmissionDateLabel(request.resignationSubmissionDate),
  }));

  const viewingRecord = viewingRefId ? employeeRequests.find(r => r.id === viewingRefId) ?? null : null;
  const isRejected    = currentRecord?.status === 'Rejected';
  const hasActive     = !!currentRecord && !isRejected;

  useEffect(() => {
    if (!latestRequest || latestRequest.status !== 'Rejected') {
      setIsPreparingNewRequest(false);
    }
  }, [latestRequest]);

  const handleSubmit = ({ reason, duration, lastWorkingDay: _lastWorkingDay, lastWorkingDayRaw, details }: {
    reason: string; duration: string; lastWorkingDay: string; lastWorkingDayRaw: string; details: string;
  }) => {
    const today     = new Date();
    const formatted = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const nextNum   = String(requests.length + 1).padStart(4, '0');
    const refId     = `SEP-${nextNum}`;
    const ddMmYyyy  = today.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    const timeStr   = today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    addRequest({
      id: refId,
      empId: CURRENT_EMPLOYEE.id,
      empName: CURRENT_EMPLOYEE.name,
      department: CURRENT_EMPLOYEE.department,
      section: CURRENT_EMPLOYEE.department,
      designation: CURRENT_EMPLOYEE.designation,
      dateOfJoining: CURRENT_EMPLOYEE.dateOfJoining,
      resignationSubmissionDate: `${ddMmYyyy}; ${timeStr}`,
      dateOfSeparation: lastWorkingDayRaw,
      noticePeriod: CURRENT_EMPLOYEE.noticePeriodDays,
      duration,
      employmentStatus: 'Permanent',
      modeOfSeparation: 'Resignation',
      status: 'Pending',
      workflowStage: 'Submitted',
      lineManager: { name: 'HR Admin', id: 'EMP-0001' },
      reason,
      remarks: details,
      activityTimeline: [{ action: 'Resignation submitted', date: formatted, by: CURRENT_EMPLOYEE.name }],
    });

    setIsPreparingNewRequest(false);
    message.success('Resignation submitted successfully. HR will review your request shortly.');
  };

  const handleApplyNew = () => {
    setIsPreparingNewRequest(true);
  };

  return (
    <div className="page-shell">
      <div className="page-header-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="module-icon-box">
            <FormOutlined style={{ color: '#fff', fontSize: 15 }} />
          </div>
          <div>
            <h1>My Resignation</h1>
            <p>
              {hasActive
                ? 'Track the progress of your resignation request'
                : isRejected
                ? 'Your resignation was rejected — you may re-apply'
                : 'Submit your resignation request'}
            </p>
          </div>
        </div>

        {hasActive && (
          <Space>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, ...currentStatusPresentation?.badgeStyle }}>
              <CheckOutlined style={{ fontSize: 11 }} />
              {currentStatusPresentation?.badgeLabel}
            </div>
          </Space>
        )}
      </div>

      {/* Active / rejected status view */}
      {currentRecord && (
        <ResignationStatus
          refId={currentRecord.id}
          submittedOn={submittedOn}
          onApplyNew={handleApplyNew}
          onViewDetails={() => setViewingRefId(currentRecord.id)}
        />
      )}

      {/* New application form (only when no active request) */}
      {showApplicationForm && (
        <ResignationForm onSubmit={handleSubmit} />
      )}

      {/* Previous Resignation Requests — always visible */}
      <div style={{ marginTop: 24, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '20px 22px', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <HistoryOutlined style={{ color: C.textMuted, fontSize: 15 }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Previous Resignation Requests</span>
        </div>
        <p style={{ fontSize: 12, color: C.textMuted, marginBottom: 16 }}>History of your past resignation requests</p>
        {historyEntries.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {historyEntries.map(entry => (
              <HistoryCard
                key={entry.refId}
                entry={entry}
                onView={() => setViewingRefId(entry.refId)}
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0', color: C.textSoft, fontSize: 13 }}>
            No previous resignation requests found.
          </div>
        )}
      </div>

      <SeparationDetailModal
        record={viewingRecord}
        title="My resignation details"
        onClose={() => setViewingRefId(null)}
      />
    </div>
  );
}
