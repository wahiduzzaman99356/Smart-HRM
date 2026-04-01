import { useEffect, useMemo, useState } from 'react';
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  FormOutlined,
  RightOutlined,
  SaveOutlined,
  UserOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Button, Input, Modal } from 'antd';
import type { SeparationRequest, SepStatus } from '@/features/offboarding/separation-requests/types/separation.types';
import {
  getSeparationTimeline,
  getWorkflowStage,
  getWorkflowStageIndex,
  SEPARATION_PROGRESS_STEPS,
  shouldShowFinalDecision,
} from '@/features/offboarding/components/separationDetailUtils';

export type SeparationDetailModalMode = 'view' | 'decision';

interface NoticeTimelineUpdate {
  lastWorkingDay: string;
  noticePeriod: number;
}

interface SeparationDetailModalProps {
  mode?: SeparationDetailModalMode;
  onClose: () => void;
  onDecision?: (action: 'Approved' | 'Rejected', remarks: string, updates?: NoticeTimelineUpdate) => void;
  onSaveNoticeTimeline?: (updates: NoticeTimelineUpdate) => void;
  record: SeparationRequest | null;
  title: string;
}

const UI = {
  border: '#d8e7e5',
  danger: '#dc2626',
  dangerBg: '#fef2f2',
  dangerBorder: '#fecaca',
  muted: '#6b7280',
  navy: '#1e3a5f',
  navyDark: '#152d4a',
  primary: '#0f766e',
  primaryBg: '#f0fdfa',
  soft: '#9ca3af',
  success: '#059669',
  successBg: '#f0fdf4',
  successBorder: '#bbf7d0',
  surface: '#ffffff',
  surfaceMuted: '#f8fafc',
  text: '#111827',
  textSecondary: '#374151',
  warning: '#d97706',
  warningBg: '#fffbeb',
  warningBorder: '#fde68a',
};

const STATUS_META: Record<SepStatus, { background: string; color: string; border: string }> = {
  Pending: {
    background: UI.warningBg,
    color: UI.warning,
    border: UI.warningBorder,
  },
  'In Progress': {
    background: '#eff6ff',
    color: '#2563eb',
    border: '#bfdbfe',
  },
  Completed: {
    background: UI.successBg,
    color: UI.success,
    border: UI.successBorder,
  },
  'On Hold': {
    background: '#f9fafb',
    color: UI.textSecondary,
    border: '#d1d5db',
  },
  Cancelled: {
    background: UI.dangerBg,
    color: UI.danger,
    border: UI.dangerBorder,
  },
  Rejected: {
    background: UI.dangerBg,
    color: UI.danger,
    border: UI.dangerBorder,
  },
};

const DEFAULT_ATTACHMENTS = [
  {
    description: 'Track responsibilities, asset return, and stakeholder handover items.',
    icon: <FormOutlined style={{ fontSize: 16 }} />,
    title: 'Handover Form',
  },
  {
    description: 'Capture settlement inputs for payroll and finance processing.',
    icon: <FileDoneOutlined style={{ fontSize: 16 }} />,
    title: 'Final Settlement Form',
  },
];

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
}

function getProgressConfig(record: SeparationRequest) {
  return {
    accent: record.status === 'Rejected' ? UI.danger : record.status === 'Completed' ? UI.success : UI.primary,
    currentStep: getWorkflowStageIndex(record),
    steps: SEPARATION_PROGRESS_STEPS,
  };
}

function getRequestDate(submissionDate: string) {
  return submissionDate.split(';')[0]?.trim() || 'N/A';
}

function shouldShowAttachments(status: SepStatus) {
  return status === 'In Progress' || status === 'On Hold' || status === 'Completed';
}

function AttachmentCard({ description, icon, title }: { description: string; icon: React.ReactNode; title: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 14,
      padding: '16px 18px',
      border: `1px solid ${UI.border}`,
      borderRadius: 12,
      background: UI.surface,
      boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
    }}>
      <div style={{
        width: 42,
        height: 42,
        borderRadius: 12,
        background: UI.primaryBg,
        color: UI.primary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: UI.text }}>{title}</div>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '3px 10px',
            borderRadius: 999,
            background: UI.primaryBg,
            border: '1px solid #99f6e4',
            color: UI.primary,
            fontSize: 11,
            fontWeight: 700,
          }}>
            Next Step
          </span>
        </div>
        <div style={{ fontSize: 12, color: UI.muted, lineHeight: 1.6 }}>{description}</div>
      </div>
    </div>
  );
}

export function SeparationDetailModal({
  mode = 'view',
  onClose,
  onDecision,
  onSaveNoticeTimeline,
  record,
  title,
}: SeparationDetailModalProps) {
  const [decisionRemarks, setDecisionRemarks] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [lastWorkingDayInput, setLastWorkingDayInput] = useState('');
  const [noticeError, setNoticeError] = useState(false);
  const [noticePeriodInput, setNoticePeriodInput] = useState('');
  const [remarksError, setRemarksError] = useState(false);
  const [timelineError, setTimelineError] = useState(false);

  const effectiveLastWorkingDay = record?.dateOfSeparationOverride ?? record?.dateOfSeparation ?? '';
  const effectiveNoticePeriod = record?.noticePeriodOverride ?? record?.noticePeriod ?? 0;

  useEffect(() => {
    setDecisionRemarks('');
    setIsRejecting(false);
    setLastWorkingDayInput(effectiveLastWorkingDay);
    setNoticeError(false);
    setNoticePeriodInput(String(effectiveNoticePeriod || ''));
    setRemarksError(false);
    setTimelineError(false);
  }, [effectiveLastWorkingDay, effectiveNoticePeriod, mode, record?.id]);

  const showDecisionActions = mode === 'decision' && record?.status === 'Pending' && !!onDecision;
  const showEditableNoticeTimeline = mode === 'decision' && record?.status === 'Pending';

  const timeline = useMemo(() => (record ? getSeparationTimeline(record) : []), [record]);

  if (!record) {
    return null;
  }

  const primaryReason = record.reason ?? record.remarks ?? record.modeOfSeparation;
  const notes = record.remarks && record.remarks !== primaryReason ? record.remarks : '';
  const requestDate = getRequestDate(record.resignationSubmissionDate);
  const daysLeft = effectiveLastWorkingDay ? daysUntil(effectiveLastWorkingDay) : null;
  const daysLeftLabel = daysLeft === null
    ? null
    : daysLeft > 0
    ? `${daysLeft} days remaining`
    : daysLeft === 0
    ? 'Last day today'
    : 'Completed';
  const progress = getProgressConfig(record);
  const statusMeta = STATUS_META[record.status];
  const showAttachments = shouldShowAttachments(record.status);
  const workflowStage = getWorkflowStage(record);
  const showFinalDecision = shouldShowFinalDecision(record);

  const parsedNoticePeriod = Number(noticePeriodInput);
  const hasNoticeTimelineChanges = showEditableNoticeTimeline && (
    parsedNoticePeriod !== effectiveNoticePeriod || lastWorkingDayInput !== effectiveLastWorkingDay
  );

  const getNoticeTimelineUpdate = (): NoticeTimelineUpdate | undefined => {
    if (!showEditableNoticeTimeline || !hasNoticeTimelineChanges) {
      return undefined;
    }

    return {
      lastWorkingDay: lastWorkingDayInput,
      noticePeriod: parsedNoticePeriod,
    };
  };

  const validateNoticeTimeline = () => {
    if (!showEditableNoticeTimeline) {
      return true;
    }

    const isNoticeValid = Number.isFinite(parsedNoticePeriod) && parsedNoticePeriod > 0;
    const isTimelineValid = Boolean(lastWorkingDayInput);

    setNoticeError(!isNoticeValid);
    setTimelineError(!isTimelineValid);

    return isNoticeValid && isTimelineValid;
  };

  const handleSaveNoticeTimeline = () => {
    if (!validateNoticeTimeline()) {
      return;
    }

    const updates = getNoticeTimelineUpdate();
    if (!updates) {
      return;
    }

    onSaveNoticeTimeline?.(updates);
  };

  const handleApprove = () => {
    if (!validateNoticeTimeline()) {
      return;
    }

    onDecision?.('Approved', '', getNoticeTimelineUpdate());
  };

  const handleStartReject = () => {
    if (!validateNoticeTimeline()) {
      return;
    }

    setIsRejecting(true);
  };

  const handleCancelReject = () => {
    setDecisionRemarks('');
    setIsRejecting(false);
    setRemarksError(false);
  };

  const handleRejectConfirm = () => {
    if (!validateNoticeTimeline()) {
      return;
    }

    if (!decisionRemarks.trim()) {
      setRemarksError(true);
      return;
    }

    onDecision?.('Rejected', decisionRemarks.trim(), getNoticeTimelineUpdate());
  };

  return (
    <Modal
      open={!!record}
      onCancel={onClose}
      footer={null}
      width={760}
      centered
      title={null}
      destroyOnClose={false}
      styles={{ body: { padding: 0 } }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '82vh' }}>
        <div style={{ padding: '24px 28px 18px', borderBottom: `1px solid ${UI.border}` }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: UI.text }}>{record.id} - {record.empName}</div>
              <div style={{ fontSize: 12, color: UI.muted, marginTop: 4 }}>{title} - {record.designation} - {record.department}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
              background: statusMeta.background,
              color: statusMeta.color,
              border: `1px solid ${statusMeta.border}`,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusMeta.color }} />
              {record.status}
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '4px 12px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
              background: '#f1f5f9',
              color: UI.textSecondary,
              border: '1px solid #e2e8f0',
            }}>
              {record.modeOfSeparation}
            </span>
            {daysLeftLabel && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 12px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                background: '#f1f5f9',
                color: UI.muted,
                border: '1px solid #e2e8f0',
              }}>
                <ClockCircleOutlined style={{ fontSize: 11 }} />
                {daysLeftLabel}
              </span>
            )}
          </div>
        </div>

        <div style={{ padding: '20px 28px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: `1px solid ${UI.border}`, borderRadius: 12, overflow: 'hidden' }}>
            {[
              { icon: <UserOutlined />, label: 'Employee ID', value: record.empId },
              { icon: <FileTextOutlined />, label: 'Department', value: record.department },
              { icon: <CalendarOutlined />, label: 'Request Date', value: requestDate },
              { icon: <CalendarOutlined />, label: 'Date of Joining', value: record.dateOfJoining },
              { icon: <FileTextOutlined />, label: 'Reason', value: primaryReason },
              { icon: <UserOutlined />, label: 'Line Manager', value: record.lineManager.name },
            ].map((item, index, items) => (
              <div
                key={item.label}
                style={{
                  padding: '14px 16px',
                  borderBottom: index < items.length - 2 ? `1px solid ${UI.border}` : 'none',
                  borderRight: index % 2 === 0 ? `1px solid ${UI.border}` : 'none',
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ color: UI.soft, fontSize: 13, marginTop: 14, flexShrink: 0 }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: UI.soft, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: UI.text }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: UI.surfaceMuted, border: `1px solid ${UI.border}`, borderRadius: 12, padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: UI.soft, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Notice and timeline</div>
              {showEditableNoticeTimeline && (
                <Button
                  size="small"
                  icon={<SaveOutlined />}
                  onClick={handleSaveNoticeTimeline}
                  disabled={!hasNoticeTimelineChanges}
                  style={{ color: UI.navy, borderColor: UI.border }}
                >
                  Save
                </Button>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: UI.muted, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ClockCircleOutlined style={{ fontSize: 11 }} /> NOTICE PERIOD (DAYS)
                </div>
                {showEditableNoticeTimeline ? (
                  <Input
                    type="number"
                    min={1}
                    value={noticePeriodInput}
                    onChange={(event) => {
                      setNoticePeriodInput(event.target.value);
                      if (event.target.value) {
                        setNoticeError(false);
                      }
                    }}
                    status={noticeError ? 'error' : undefined}
                  />
                ) : (
                  <div style={{ fontSize: 20, fontWeight: 800, color: UI.navy }}>
                    {effectiveNoticePeriod} <span style={{ fontSize: 13, fontWeight: 600 }}>days</span>
                    {record.noticePeriodOverride && <span style={{ fontSize: 11, color: UI.warning, fontWeight: 700, marginLeft: 8 }}>(edited)</span>}
                  </div>
                )}
              </div>
              <div>
                <div style={{ fontSize: 11, color: UI.muted, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CalendarOutlined style={{ fontSize: 11 }} /> LAST WORKING DAY
                </div>
                {showEditableNoticeTimeline ? (
                  <Input
                    type="date"
                    suffix={<CalendarOutlined style={{ color: UI.muted }} />}
                    value={lastWorkingDayInput}
                    onChange={(event) => {
                      setLastWorkingDayInput(event.target.value);
                      if (event.target.value) {
                        setTimelineError(false);
                      }
                    }}
                    status={timelineError ? 'error' : undefined}
                  />
                ) : (
                  <div style={{ fontSize: 20, fontWeight: 800, color: UI.navy }}>
                    {effectiveLastWorkingDay || 'N/A'}
                    {record.dateOfSeparationOverride && <span style={{ fontSize: 11, color: UI.warning, fontWeight: 700, marginLeft: 8 }}>(edited)</span>}
                  </div>
                )}
              </div>
            </div>
            {record.duration && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${UI.border}` }}>
                <div style={{ fontSize: 11, color: UI.muted, marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Duration
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: UI.text }}>{record.duration}</div>
              </div>
            )}
            {showEditableNoticeTimeline && (noticeError || timelineError) && (
              <div style={{ fontSize: 12, color: UI.danger, marginTop: 8 }}>
                Enter a valid notice period and last working day before saving or taking a decision.
              </div>
            )}
          </div>

          {record.status === 'On Hold' && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '14px 16px', background: UI.warningBg, border: `1px solid ${UI.warningBorder}`, borderRadius: 12 }}>
              <WarningOutlined style={{ color: UI.warning, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: UI.warning }}>This request is currently on hold</div>
                <div style={{ fontSize: 12, color: UI.textSecondary, marginTop: 4 }}>Follow the timeline below for the next approval or clearance update.</div>
              </div>
            </div>
          )}

          {record.status === 'Rejected' && record.rejectionRemarks && (
            <div style={{ background: UI.dangerBg, border: `1px solid ${UI.dangerBorder}`, borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: UI.danger, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Rejection remarks</div>
              <div style={{ fontSize: 13, color: UI.textSecondary }}>{record.rejectionRemarks}</div>
            </div>
          )}

          {notes && (
            <div style={{ background: UI.surface, border: `1px solid ${UI.border}`, borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: UI.soft, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Notes</div>
              <div style={{ fontSize: 13, color: UI.textSecondary, lineHeight: 1.6 }}>{notes}</div>
            </div>
          )}

          <div style={{ background: UI.surfaceMuted, border: `1px solid ${UI.border}`, borderRadius: 12, padding: '16px 18px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: UI.soft, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Separation progress</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {progress.steps.map((step, index) => {
                const isDone = index < progress.currentStep;
                const isCurrent = index === progress.currentStep;
                const background = isCurrent ? `${progress.accent}12` : 'transparent';
                const circleBackground = isCurrent ? progress.accent : isDone ? `${progress.accent}20` : '#e5e7eb';
                const circleColor = isCurrent ? '#ffffff' : isDone ? progress.accent : UI.muted;

                return (
                  <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 10, background }}>
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: circleBackground,
                      color: circleColor,
                      fontSize: 12,
                      fontWeight: 700,
                    }}>
                      {isDone || isCurrent ? <CheckOutlined style={{ fontSize: 11 }} /> : index + 1}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                      <span style={{ fontSize: 13, fontWeight: isCurrent ? 700 : 500, color: isCurrent ? UI.text : UI.muted }}>{step}</span>
                      {isCurrent && <RightOutlined style={{ fontSize: 10, color: progress.accent }} />}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: 12, color: UI.muted, marginTop: 12 }}>
              Current stage: <span style={{ fontWeight: 700, color: UI.text }}>{workflowStage}</span>
            </div>
          </div>

          {showFinalDecision && (
            <div style={{ background: UI.surface, border: `1px solid ${UI.border}`, borderRadius: 12, padding: '16px 18px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: UI.soft, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Final decision</div>
              {record.finalDecision ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 12px',
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 700,
                      background: record.finalDecision.outcome === 'End Separation Process' ? UI.successBg : UI.warningBg,
                      color: record.finalDecision.outcome === 'End Separation Process' ? UI.success : UI.warning,
                      border: `1px solid ${record.finalDecision.outcome === 'End Separation Process' ? UI.successBorder : UI.warningBorder}`,
                    }}>
                      {record.finalDecision.outcome}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: UI.muted }}>
                    {record.finalDecision.by} - {record.finalDecision.date}
                  </div>
                  {record.finalDecision.notes && (
                    <div style={{ fontSize: 13, color: UI.textSecondary, lineHeight: 1.6 }}>
                      {record.finalDecision.notes}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '14px 16px', background: UI.surfaceMuted, border: `1px dashed ${UI.border}`, borderRadius: 12 }}>
                  <ClockCircleOutlined style={{ color: UI.muted, marginTop: 2 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: UI.text }}>Awaiting final decision</div>
                    <div style={{ fontSize: 12, color: UI.muted, lineHeight: 1.6, marginTop: 4 }}>
                      Settlement is complete. The final decision to end the separation process has not been recorded yet.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{ background: UI.surface, border: `1px solid ${UI.border}`, borderRadius: 12, padding: '16px 18px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: UI.soft, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Activity timeline</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {timeline.map((event, index) => (
                <div key={`${event.action}-${event.date}-${index}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, paddingBottom: index < timeline.length - 1 ? 18 : 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: record.status === 'Rejected' && index === timeline.length - 1 ? UI.danger : UI.navy,
                      marginTop: 3,
                    }} />
                    {index < timeline.length - 1 && <div style={{ width: 2, flex: 1, background: `${UI.navy}25`, minHeight: 28, marginTop: 4 }} />}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: UI.text }}>{event.action}</div>
                    <div style={{ fontSize: 11, color: UI.muted, marginTop: 2 }}>
                      {event.by ? `${event.by} - ` : ''}
                      {event.date}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: UI.surface, border: `1px solid ${UI.border}`, borderRadius: 12, padding: '16px 18px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: UI.soft, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Attachments</div>
            {showAttachments ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {DEFAULT_ATTACHMENTS.map((attachment) => (
                  <AttachmentCard
                    key={attachment.title}
                    description={attachment.description}
                    icon={attachment.icon}
                    title={attachment.title}
                  />
                ))}
              </div>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '14px 16px',
                background: UI.surfaceMuted,
                border: `1px dashed ${UI.border}`,
                borderRadius: 12,
              }}>
                <ClockCircleOutlined style={{ color: UI.muted, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: UI.text }}>Forms will appear after approval</div>
                  <div style={{ fontSize: 12, color: UI.muted, lineHeight: 1.6, marginTop: 4 }}>
                    Handover Form and Final Settlement Form become visible once the request moves into the next offboarding step.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {showDecisionActions && (
          <div style={{ borderTop: `1px solid ${UI.border}`, padding: '18px 28px 22px', background: UI.surface }}>
            {!isRejecting ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: UI.text, marginBottom: 4 }}>Take decision</div>
                  <div style={{ fontSize: 12, color: UI.muted, lineHeight: 1.6 }}>
                    Review the details, update notice and timeline if needed, then approve or reject the request.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <Button danger icon={<CloseCircleOutlined />} onClick={handleStartReject}>
                    Reject
                  </Button>
                  <Button type="primary" icon={<CheckCircleOutlined />} onClick={handleApprove} style={{ background: UI.navy, borderColor: UI.navyDark }}>
                    Approve
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ background: UI.dangerBg, border: `1px solid ${UI.dangerBorder}`, borderRadius: 12, padding: '16px 18px' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: UI.text, marginBottom: 6 }}>Rejection Remarks</div>
                <div style={{ fontSize: 12, color: UI.muted, lineHeight: 1.6, marginBottom: 12 }}>
                  Please provide a reason for rejection. This will be visible to the employee in My Resignation.
                </div>
                <Input.TextArea
                  rows={3}
                  value={decisionRemarks}
                  onChange={(event) => {
                    setDecisionRemarks(event.target.value);
                    if (event.target.value.trim()) {
                      setRemarksError(false);
                    }
                  }}
                  placeholder="Enter rejection remarks..."
                  status={remarksError ? 'error' : undefined}
                  style={{ resize: 'none', background: '#ffffff' }}
                />
                {remarksError && (
                  <div style={{ fontSize: 12, color: UI.danger, marginTop: 6 }}>
                    Rejection remarks are required before rejecting this request.
                  </div>
                )}
                <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                  <Button danger type="primary" icon={<CloseCircleOutlined />} onClick={handleRejectConfirm}>
                    Confirm Rejection
                  </Button>
                  <Button onClick={handleCancelReject}>Cancel</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}