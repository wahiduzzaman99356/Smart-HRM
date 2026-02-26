import { Modal, Timeline, Tooltip } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import type { ApprovalStep, RequisitionRequest } from '../types/requisition.types';

function StepIcon({ action }: { action: ApprovalStep['action'] }) {
  if (action === 'Approved') {
    return (
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        background: '#22c55e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(34,197,94,0.35)',
      }}>
        <CheckOutlined style={{ color: '#fff', fontSize: 18, fontWeight: 700 }} />
      </div>
    );
  }

  if (action === 'Rejected') {
    return (
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        background: '#f43f5e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(244,63,94,0.35)',
      }}>
        <CloseOutlined style={{ color: '#fff', fontSize: 18, fontWeight: 700 }} />
      </div>
    );
  }

  return (
    <div style={{
      width: 44,
      height: 44,
      borderRadius: 12,
      background: '#e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }} />
  );
}

function StepContent({ step }: { step: ApprovalStep }) {
  const isPending = step.action === 'Pending';

  return (
    <div style={{ paddingBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div>
          <div style={{
            fontSize: 18,
            fontWeight: 700,
            color: isPending ? '#9ca3af' : '#111827',
            fontStyle: isPending ? 'italic' : 'normal',
          }}>
            {isPending ? 'Pending Review' : step.action}
          </div>

          <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>
            {step.approverName}{step.approverId ? ` (ID: ${step.approverId})` : ''}
          </div>

          {step.timestamp && (
            <div style={{ fontSize: 13, color: '#2563eb', fontWeight: 700, marginTop: 4 }}>
              {step.timestamp}
            </div>
          )}

          {step.note && (
            <div style={{ fontSize: 12, color: '#ef4444', fontStyle: 'italic', marginTop: 6 }}>
              {step.note}
            </div>
          )}
        </div>

        {step.reason && (
          <Tooltip title={step.reason}>
            <div style={{
              background: '#f3f4f6',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: 13,
              color: '#111827',
              whiteSpace: 'nowrap',
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

interface Props {
  request: RequisitionRequest | null;
  onClose: () => void;
}

export function ApprovalWorkflowModal({ request, onClose }: Props) {
  if (!request) return null;

  return (
    <Modal
      open
      onCancel={onClose}
      footer={null}
      centered
      width={540}
      closeIcon={
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: '#0f172a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <CloseOutlined style={{ color: '#fff', fontSize: 14 }} />
        </div>
      }
      styles={{
        content: { borderRadius: 20, padding: '28px 34px' },
        header: { borderBottom: 'none', paddingBottom: 0 },
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 26 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Approval Workflow</h2>
      </div>

      <Timeline
        items={request.approvalWorkflow.map((step, index) => ({
          key: `${step.approverName}-${index}`,
          dot: <StepIcon action={step.action} />,
          color: step.action === 'Approved' ? 'green' : step.action === 'Rejected' ? 'red' : 'gray',
          children: <StepContent step={step} />,
        }))}
      />
    </Modal>
  );
}
