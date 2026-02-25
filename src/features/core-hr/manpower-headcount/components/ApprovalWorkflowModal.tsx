/**
 * ApprovalWorkflowModal
 * Shows a vertical timeline of approval steps for a headcount request.
 */

import { Modal, Timeline, Tooltip } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import type { HCRequest, ApprovalStep } from '../types/headcount.types';

// ─── Step icon ────────────────────────────────────────────────────────────────
function StepIcon({ action }: { action: ApprovalStep['action'] }) {
  if (action === 'Approved') {
    return (
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: '#22c55e',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(34,197,94,0.35)',
      }}>
        <CheckOutlined style={{ color: '#fff', fontSize: 18, fontWeight: 700 }} />
      </div>
    );
  }
  if (action === 'Rejected') {
    return (
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: '#ef4444',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(239,68,68,0.35)',
      }}>
        <CloseOutlined style={{ color: '#fff', fontSize: 18, fontWeight: 700 }} />
      </div>
    );
  }
  // Pending
  return (
    <div style={{
      width: 44, height: 44, borderRadius: 12,
      background: '#e5e7eb',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} />
  );
}

// ─── Step content ─────────────────────────────────────────────────────────────
function StepContent({ step }: { step: ApprovalStep }) {
  const isPending = step.action === 'Pending';

  return (
    <div style={{ paddingBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div>
          <div style={{
            fontSize: 18, fontWeight: 700,
            color: isPending ? '#9ca3af' : '#111827',
            fontStyle: isPending ? 'italic' : 'normal',
          }}>
            {step.action === 'Pending' ? 'Pending Review' : step.action}
          </div>
          <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 2 }}>
            {step.approverName}{step.approverId ? ` (ID: ${step.approverId})` : ''}
          </div>
          {step.timestamp && (
            <div style={{ fontSize: 13, color: '#3b82f6', fontWeight: 600, marginTop: 4 }}>
              {step.timestamp}
            </div>
          )}
          {step.note && (
            <div style={{ fontSize: 12, color: '#ef4444', fontStyle: 'italic', fontWeight: 700, marginTop: 6 }}>
              {step.note}
            </div>
          )}
        </div>

        {/* Reason bubble for rejected steps */}
        {step.reason && (
          <Tooltip title={step.reason}>
            <div style={{
              background: '#f3f4f6',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: 13,
              color: '#374151',
              whiteSpace: 'nowrap',
              cursor: 'default',
              alignSelf: 'center',
            }}>
              Reason: {step.reason}
            </div>
          </Tooltip>
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

  const timelineItems = request.approvalWorkflow.map((step, i) => ({
    key: i,
    dot: <StepIcon action={step.action} />,
    color: step.action === 'Approved' ? 'green' : step.action === 'Rejected' ? 'red' : 'gray',
    children: <StepContent step={step} />,
  }));

  return (
    <Modal
      open
      onCancel={onClose}
      footer={null}
      width={520}
      centered
      closeIcon={
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: '#111827',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CloseOutlined style={{ color: '#fff', fontSize: 14 }} />
        </div>
      }
      styles={{
        content: { borderRadius: 20, padding: '32px 40px' },
        header: { borderBottom: 'none', paddingBottom: 0 },
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0 }}>
          Approval Workflow
        </h2>
      </div>

      <Timeline
        items={timelineItems}
        style={{ paddingLeft: 8 }}
      />
    </Modal>
  );
}
