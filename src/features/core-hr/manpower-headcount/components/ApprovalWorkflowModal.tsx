/**
 * ApprovalWorkflowModal
 * Shows a vertical step-by-step approval workflow for a headcount request.
 */

import { Modal } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import type { HCRequest, ApprovalStep } from '../types/headcount.types';

// ─── Connector line between steps ─────────────────────────────────────────────
function ConnectorLine({ prevAction }: { prevAction: ApprovalStep['action'] }) {
  const color =
    prevAction === 'Approved' ? '#86efac' :
    prevAction === 'Rejected' ? 'var(--color-status-rejected-bg)' :
    'var(--color-border)';

  return (
    <div style={{ width: 2, flex: 1, minHeight: 20, background: color, margin: '3px 0' }} />
  );
}

// ─── Step indicator circle ─────────────────────────────────────────────────────
function StepIndicator({ action, stepNumber }: { action: ApprovalStep['action']; stepNumber: number }) {
  const base: React.CSSProperties = {
    width: 32, height: 32, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  };

  if (action === 'Approved') {
    return (
      <div style={{ ...base, background: '#059669' }}>
        <CheckOutlined style={{ color: '#fff', fontSize: 12 }} />
      </div>
    );
  }
  if (action === 'Rejected') {
    return (
      <div style={{ ...base, background: '#dc2626' }}>
        <CloseOutlined style={{ color: '#fff', fontSize: 12 }} />
      </div>
    );
  }
  return (
    <div style={{ ...base, background: 'var(--color-bg-subtle)', border: '1.5px dashed #d1d5db' }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-disabled)' }}>{stepNumber}</span>
    </div>
  );
}

// ─── Step row ─────────────────────────────────────────────────────────────────
function StepRow({ step, stepNumber, isLast }: { step: ApprovalStep; stepNumber: number; isLast: boolean }) {
  const isPending = step.action === 'Pending';

  const statusConfig = {
    Approved: { label: 'Approved', color: '#059669', bg: 'var(--color-status-approved-bg)' },
    Rejected: { label: 'Rejected', color: '#dc2626', bg: 'var(--color-status-rejected-bg)' },
    Pending:  { label: 'Awaiting Review', color: 'var(--color-text-disabled)', bg: 'var(--color-bg-subtle)' },
  }[step.action];

  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'stretch' }}>
      {/* Left gutter */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 2 }}>
        <StepIndicator action={step.action} stepNumber={stepNumber} />
        {!isLast && <ConnectorLine prevAction={step.action} />}
      </div>

      {/* Content */}
      <div style={{ flex: 1, paddingBottom: isLast ? 0 : 22 }}>
        {/* Status pill */}
        <div style={{
          display: 'inline-block',
          background: statusConfig.bg,
          color: statusConfig.color,
          fontSize: 11,
          fontWeight: 600,
          borderRadius: 5,
          padding: '2px 9px',
          marginBottom: 5,
          letterSpacing: '0.02em',
        }}>
          {statusConfig.label}
        </div>

        {/* Approver */}
        <div style={{ fontSize: 13, fontWeight: 600, color: isPending ? 'var(--color-text-disabled)' : 'var(--color-text-primary)', lineHeight: 1.4 }}>
          {step.approverName}
          {step.approverId && (
            <span style={{ fontWeight: 400, color: 'var(--color-text-disabled)', marginLeft: 6, fontSize: 12 }}>
              · ID: {step.approverId}
            </span>
          )}
        </div>

        {/* Timestamp */}
        {step.timestamp && (
          <div style={{ fontSize: 12, color: 'var(--color-text-disabled)', marginTop: 2 }}>
            {step.timestamp}
          </div>
        )}

        {/* Reason */}
        {step.reason && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            background: 'var(--color-status-rejected-bg)',
            border: '1px solid #fecaca',
            borderRadius: 6,
            padding: '4px 10px',
            marginTop: 7,
            fontSize: 12,
            color: '#b91c1c',
          }}>
            <span style={{ fontWeight: 600 }}>Reason:</span>&nbsp;{step.reason}
          </div>
        )}

        {/* Note */}
        {step.note && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 5,
            background: 'var(--color-status-pending-bg)',
            border: '1px solid #fde68a',
            borderRadius: 6,
            padding: '5px 10px',
            marginTop: 6,
            fontSize: 12,
            color: '#d97706',
          }}>
            <span style={{ fontWeight: 600, flexShrink: 0 }}>Note:</span>
            <span>{step.note}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
interface Props {
  request: HCRequest | null;
  onClose: () => void;
}

export function ApprovalWorkflowModal({ request, onClose }: Props) {
  if (!request) return null;

  const steps = request.approvalWorkflow;
  const completedCount = steps.filter(s => s.action !== 'Pending').length;

  return (
    <Modal
      open
      onCancel={onClose}
      footer={null}
      width={460}
      centered
      closeIcon={
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'var(--color-bg-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CloseOutlined style={{ color: 'var(--color-text-tertiary)', fontSize: 11 }} />
        </div>
      }
      styles={{
        content: { borderRadius: 14, padding: '28px 30px' },
        header: { borderBottom: 'none', paddingBottom: 0 },
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.3 }}>
          Approval Workflow
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-text-disabled)', marginTop: 2 }}>
          {completedCount} of {steps.length} steps completed
        </div>
      </div>

      {/* Steps */}
      <div>
        {steps.map((step, i) => (
          <StepRow
            key={i}
            step={step}
            stepNumber={i + 1}
            isLast={i === steps.length - 1}
          />
        ))}
      </div>
    </Modal>
  );
}
