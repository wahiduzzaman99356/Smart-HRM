import { useState, useEffect } from 'react';
import { Modal, Input, Rate, Button } from 'antd';
import { WarningOutlined } from '@ant-design/icons';
import type { ExitInterview, InterviewResponses } from '../types/exitInterview.types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  interview: ExitInterview | null;
  onClose: () => void;
  onComplete: (id: string, responses: InterviewResponses) => void;
}

// ─── Yes/No Toggle ────────────────────────────────────────────────────────────

function YesNoToggle({
  value,
  onChange,
}: {
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button
        type="button"
        onClick={() => onChange(true)}
        style={{
          padding: '5px 18px',
          borderRadius: 7,
          fontSize: 12,
          fontWeight: 600,
          border: value === true ? '1.5px solid #0f766e' : '1.5px solid #e2e8f0',
          background: value === true ? '#f0fdfa' : '#fff',
          color: value === true ? '#0f766e' : '#6b7280',
          cursor: 'pointer',
          transition: 'all 0.12s',
        }}
      >
        ✓ Yes
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        style={{
          padding: '5px 18px',
          borderRadius: 7,
          fontSize: 12,
          fontWeight: 600,
          border: value === false ? '1.5px solid #dc2626' : '1.5px solid #e2e8f0',
          background: value === false ? '#fef2f2' : '#fff',
          color: value === false ? '#dc2626' : '#6b7280',
          cursor: 'pointer',
          transition: 'all 0.12s',
        }}
      >
        ✗ No
      </button>
    </div>
  );
}

// ─── Section Label ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
      color: '#6b7280', textTransform: 'uppercase',
      marginBottom: 14, marginTop: 4,
    }}>
      {children}
    </div>
  );
}

// ─── Question Row ─────────────────────────────────────────────────────────────

function QuestionRow({
  number,
  text,
  required,
  children,
}: {
  number: number;
  text: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 7 }}>
        <span style={{
          width: 20, height: 20, borderRadius: '50%',
          background: '#f3f4f6', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 11, fontWeight: 700,
          color: '#6b7280', flexShrink: 0, marginTop: 1,
        }}>
          {number}
        </span>
        <span style={{ fontSize: 13, color: '#374151', fontWeight: 500, lineHeight: 1.4 }}>
          {text}
          {required && <span style={{ color: '#dc2626', marginLeft: 3 }}>*</span>}
        </span>
      </div>
      <div style={{ paddingLeft: 28 }}>{children}</div>
    </div>
  );
}

// ─── Default responses ────────────────────────────────────────────────────────

const defaultResponses = (): InterviewResponses => ({
  reasons: '',
  policyImprovement: '',
  orgImprovement: '',
  additionalComments: '',
  separationRequests: '',
  overallExperienceRating: 0,
  wouldRecommend: null,
  workLifeRating: 0,
  compensationRating: 0,
  managementRating: 0,
  overallRatingFinal: 0,
  wouldRecommendFinal: null,
  hrNotes: '',
});

// ─── Component ────────────────────────────────────────────────────────────────

export function ConductInterviewModal({ open, interview, onClose, onComplete }: Props) {
  const [answers, setAnswers] = useState<InterviewResponses>(defaultResponses());
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) setAnswers(defaultResponses());
    setErrors({});
  }, [open]);

  const set = <K extends keyof InterviewResponses>(key: K, val: InterviewResponses[K]) => {
    setAnswers(prev => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: false }));
  };

  const handleComplete = () => {
    const newErrors: Record<string, boolean> = {};
    if (!answers.reasons.trim()) newErrors.reasons = true;
    if (!answers.policyImprovement.trim()) newErrors.policyImprovement = true;
    if (answers.overallExperienceRating === 0) newErrors.overallExperienceRating = true;
    if (answers.wouldRecommend === null) newErrors.wouldRecommend = true;
    if (answers.overallRatingFinal === 0) newErrors.overallRatingFinal = true;
    if (answers.wouldRecommendFinal === null) newErrors.wouldRecommendFinal = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (interview) {
      onComplete(interview.id, answers);
    }
    onClose();
  };

  if (!interview) return null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={680}
      centered
      destroyOnClose
      footer={null}
      title={
        <div style={{ paddingBottom: 4 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', lineHeight: 1.3 }}>
            Conduct Exit Interview — {interview.employeeName}
          </div>
          <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 400, marginTop: 3 }}>
            {interview.department} · {interview.employeeId} · Conducted by {interview.interviewer}
          </div>
        </div>
      }
      styles={{
        header: { borderBottom: '1px solid #e5e7eb', paddingBottom: 14, marginBottom: 0 },
        body: { padding: '20px 24px', maxHeight: '72vh', overflowY: 'auto' },
      }}
    >
      {/* ── Interview Info ─────────────────────────────────────────────────── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12, padding: '12px 14px',
        background: '#f8fafc', border: '1px solid #e5e7eb',
        borderRadius: 8, marginBottom: 20,
      }}>
        {[
          { label: 'Staff ID', value: interview.employeeId },
          { label: 'Department', value: interview.department },
          { label: 'Interview Date', value: interview.date },
          { label: 'Primary Reason', value: interview.reason },
        ].map(({ label, value }) => (
          <div key={label}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: '#9ca3af', textTransform: 'uppercase', marginBottom: 4 }}>
              {label}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* ── Questionnaire ──────────────────────────────────────────────────── */}
      <SectionLabel>Interview Questionnaire</SectionLabel>

      <QuestionRow number={1} text="What are your reasons for leaving at this time? (Be specific)" required>
        <Input.TextArea
          value={answers.reasons}
          onChange={e => set('reasons', e.target.value)}
          placeholder="Employee's response..."
          rows={3}
          style={{ borderRadius: 8, resize: 'none', borderColor: errors.reasons ? '#fca5a5' : undefined }}
        />
        {errors.reasons && <div style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>This field is required.</div>}
      </QuestionRow>

      <QuestionRow number={2} text="What are your suggestions for improving policies, procedures and the overall working environment?" required>
        <Input.TextArea
          value={answers.policyImprovement}
          onChange={e => set('policyImprovement', e.target.value)}
          placeholder="Employee's response..."
          rows={3}
          style={{ borderRadius: 8, resize: 'none', borderColor: errors.policyImprovement ? '#fca5a5' : undefined }}
        />
        {errors.policyImprovement && <div style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>This field is required.</div>}
      </QuestionRow>

      <QuestionRow number={3} text="What are your suggestions for improving the organization?">
        <Input.TextArea
          value={answers.orgImprovement}
          onChange={e => set('orgImprovement', e.target.value)}
          placeholder="Employee's response..."
          rows={3}
          style={{ borderRadius: 8, resize: 'none' }}
        />
      </QuestionRow>

      <QuestionRow number={4} text="Do you have any additional comments or concerns?">
        <Input.TextArea
          value={answers.additionalComments}
          onChange={e => set('additionalComments', e.target.value)}
          placeholder="Employee's response..."
          rows={3}
          style={{ borderRadius: 8, resize: 'none' }}
        />
      </QuestionRow>

      <QuestionRow number={5} text="Do you have any requests or instructions regarding your separation process?">
        <Input.TextArea
          value={answers.separationRequests}
          onChange={e => set('separationRequests', e.target.value)}
          placeholder="Employee's response..."
          rows={2}
          style={{ borderRadius: 8, resize: 'none' }}
        />
      </QuestionRow>

      <QuestionRow number={6} text="How would you rate your overall experience?" required>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Rate
            value={answers.overallExperienceRating}
            onChange={v => set('overallExperienceRating', v)}
            style={{ color: '#f59e0b', fontSize: 20 }}
          />
          {errors.overallExperienceRating && (
            <span style={{ fontSize: 11, color: '#dc2626' }}>Required</span>
          )}
        </div>
      </QuestionRow>

      <QuestionRow number={7} text="Would you recommend this organization to others?" required>
        <YesNoToggle
          value={answers.wouldRecommend}
          onChange={v => set('wouldRecommend', v)}
        />
        {errors.wouldRecommend && <div style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>Required</div>}
      </QuestionRow>

      <QuestionRow number={8} text="How would you rate the work-life balance?">
        <Rate
          value={answers.workLifeRating}
          onChange={v => set('workLifeRating', v)}
          style={{ color: '#f59e0b', fontSize: 20 }}
        />
      </QuestionRow>

      <QuestionRow number={9} text="Was compensation fair for your role and experience?">
        <Rate
          value={answers.compensationRating}
          onChange={v => set('compensationRating', v)}
          style={{ color: '#f59e0b', fontSize: 20 }}
        />
      </QuestionRow>

      <QuestionRow number={10} text="How would you rate your relationship with management?">
        <Rate
          value={answers.managementRating}
          onChange={v => set('managementRating', v)}
          style={{ color: '#f59e0b', fontSize: 20 }}
        />
      </QuestionRow>

      {/* ── Overall Section ────────────────────────────────────────────────── */}
      <div style={{
        background: '#f8fafc', border: errors.overallRatingFinal || errors.wouldRecommendFinal ? '1.5px solid #fca5a5' : '1px solid #e5e7eb',
        borderRadius: 8, padding: '14px 16px', marginTop: 8, marginBottom: 16,
      }}>
        <div style={{ marginBottom: 14 }}>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
            color: '#374151', textTransform: 'uppercase', marginBottom: 8,
          }}>
            Overall Experience Rating <span style={{ color: '#dc2626' }}>*</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Rate
              value={answers.overallRatingFinal}
              onChange={v => set('overallRatingFinal', v)}
              style={{ color: '#f59e0b', fontSize: 22 }}
            />
            {errors.overallRatingFinal && (
              <span style={{ fontSize: 11, color: '#dc2626' }}>Required</span>
            )}
          </div>
        </div>

        <div>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
            color: '#374151', textTransform: 'uppercase', marginBottom: 8,
          }}>
            Would you recommend this organization? <span style={{ color: '#dc2626' }}>*</span>
          </div>
          <YesNoToggle
            value={answers.wouldRecommendFinal}
            onChange={v => set('wouldRecommendFinal', v)}
          />
          {errors.wouldRecommendFinal && (
            <div style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>Required</div>
          )}
        </div>
      </div>

      {/* ── HR Notes ──────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 16 }}>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
          color: '#6b7280', textTransform: 'uppercase', marginBottom: 8,
        }}>
          HR Notes &amp; Observations
        </div>
        <Input.TextArea
          value={answers.hrNotes}
          onChange={e => set('hrNotes', e.target.value)}
          placeholder="Any additional observations or notes from the interviewer..."
          rows={3}
          style={{ borderRadius: 8, resize: 'none' }}
        />
      </div>

      {/* ── Confidentiality Banner ─────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '10px 14px', borderRadius: 8,
        background: '#fffbeb', border: '1px solid #fde68a',
        marginBottom: 4,
      }}>
        <WarningOutlined style={{ color: '#d97706', fontSize: 14, marginTop: 1, flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: '#92400e', lineHeight: 1.5 }}>
          Please be reminded of your obligation to maintain confidentiality concerning intellectual property and personal information of the organization.
        </span>
      </div>

      {/* ── Required note ──────────────────────────────────────────────────── */}
      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 10, marginBottom: 4 }}>
        Fields marked with <span style={{ color: '#dc2626' }}>*</span> are required
      </div>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', justifyContent: 'flex-end', gap: 10,
        paddingTop: 16, marginTop: 8,
        borderTop: '1px solid #e5e7eb',
      }}>
        <Button onClick={onClose} style={{ minWidth: 80 }}>
          Cancel
        </Button>
        <Button type="primary" onClick={handleComplete} style={{ minWidth: 150 }}>
          Complete Interview
        </Button>
      </div>
    </Modal>
  );
}
