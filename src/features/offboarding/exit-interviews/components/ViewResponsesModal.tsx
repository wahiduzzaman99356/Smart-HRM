import { Modal, Rate, Button } from 'antd';
import type { ExitInterview } from '../types/exitInterview.types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  interview: ExitInterview | null;
  onClose: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ResponseRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '0.07em',
        color: '#9ca3af', textTransform: 'uppercase', marginBottom: 5,
      }}>
        {label}
      </div>
      <div>{children}</div>
    </div>
  );
}

function TextResponse({ value }: { value: string }) {
  return (
    <div style={{
      fontSize: 13, color: value ? '#374151' : '#9ca3af',
      fontStyle: value ? 'normal' : 'italic',
      background: '#f8fafc', border: '1px solid #e5e7eb',
      borderRadius: 7, padding: '8px 12px', lineHeight: 1.55,
    }}>
      {value || 'No response provided'}
    </div>
  );
}

function YesNoBadge({ value }: { value: boolean | null | undefined }) {
  if (value === null || value === undefined) {
    return <span style={{ fontSize: 13, color: '#9ca3af', fontStyle: 'italic' }}>No response</span>;
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600,
      border: value ? '1.5px solid #0f766e' : '1.5px solid #dc2626',
      background: value ? '#f0fdfa' : '#fef2f2',
      color: value ? '#0f766e' : '#dc2626',
    }}>
      {value ? '✓ Yes' : '✗ No'}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ViewResponsesModal({ open, interview, onClose }: Props) {
  if (!interview) return null;
  const r = interview.responses;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={640}
      centered
      footer={null}
      title={
        <div style={{ paddingBottom: 4 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', lineHeight: 1.3 }}>
            Interview Responses — {interview.employeeName}
          </div>
          <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 400, marginTop: 3 }}>
            {interview.department} · {interview.employeeId} · {interview.date}
          </div>
        </div>
      }
      styles={{
        header: { borderBottom: '1px solid #e5e7eb', paddingBottom: 14, marginBottom: 0 },
        body: { padding: '20px 24px', maxHeight: '72vh', overflowY: 'auto' },
      }}
    >
      {/* ── Summary Banner ─────────────────────────────────────────────────── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 10, padding: '12px 14px',
        background: '#f0fdfa', border: '1px solid #ccfbf1',
        borderRadius: 8, marginBottom: 22,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.07em', color: '#6b7280', textTransform: 'uppercase', marginBottom: 4 }}>
            Rating
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <Rate
              disabled
              value={interview.rating ?? r?.overallRatingFinal ?? 0}
              style={{ color: '#f59e0b', fontSize: 13 }}
            />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>
              {(interview.rating ?? r?.overallRatingFinal ?? 0)}/5
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.07em', color: '#6b7280', textTransform: 'uppercase', marginBottom: 4 }}>
            Recommend
          </div>
          <YesNoBadge value={interview.recommend ?? r?.wouldRecommendFinal ?? null} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.07em', color: '#6b7280', textTransform: 'uppercase', marginBottom: 4 }}>
            Interviewed By
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>{interview.interviewer}</div>
        </div>
      </div>

      {r ? (
        <>
          {/* ── Text Responses ──────────────────────────────────────────────── */}
          <ResponseRow label="Reasons for leaving">
            <TextResponse value={r.reasons} />
          </ResponseRow>
          <ResponseRow label="Suggestions for improving policies & procedures">
            <TextResponse value={r.policyImprovement} />
          </ResponseRow>
          <ResponseRow label="Suggestions for improving the organization">
            <TextResponse value={r.orgImprovement} />
          </ResponseRow>
          <ResponseRow label="Additional comments or concerns">
            <TextResponse value={r.additionalComments} />
          </ResponseRow>
          <ResponseRow label="Separation process requests">
            <TextResponse value={r.separationRequests} />
          </ResponseRow>

          {/* ── Ratings ────────────────────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'Overall Experience', value: r.overallExperienceRating },
              { label: 'Work-Life Balance', value: r.workLifeRating },
              { label: 'Compensation Fairness', value: r.compensationRating },
              { label: 'Relationship with Management', value: r.managementRating },
            ].map(({ label, value }) => (
              <div key={label} style={{
                background: '#f8fafc', border: '1px solid #e5e7eb',
                borderRadius: 8, padding: '10px 12px',
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', color: '#6b7280', textTransform: 'uppercase', marginBottom: 6 }}>
                  {label}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Rate disabled value={value} style={{ color: '#f59e0b', fontSize: 14 }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>
                    {value > 0 ? `${value}/5` : '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <ResponseRow label="Would recommend this organization">
            <YesNoBadge value={r.wouldRecommendFinal} />
          </ResponseRow>

          {r.hrNotes && (
            <ResponseRow label="HR Notes & Observations">
              <TextResponse value={r.hrNotes} />
            </ResponseRow>
          )}
        </>
      ) : interview.quote ? (
        <div style={{
          background: '#f8fafc', border: '1px solid #e5e7eb',
          borderRadius: 8, padding: '14px 16px',
          fontSize: 13, color: '#374151', fontStyle: 'italic', lineHeight: 1.6,
        }}>
          "{interview.quote}"
        </div>
      ) : (
        <div style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
          No detailed responses recorded.
        </div>
      )}

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', justifyContent: 'flex-end',
        paddingTop: 16, marginTop: 16,
        borderTop: '1px solid #e5e7eb',
      }}>
        <Button onClick={onClose} style={{ minWidth: 80 }}>
          Close
        </Button>
      </div>
    </Modal>
  );
}
