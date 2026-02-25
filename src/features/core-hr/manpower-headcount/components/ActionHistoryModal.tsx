/**
 * ActionHistoryModal
 * Audit log table for a headcount request.
 */

import { Modal, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CloseOutlined } from '@ant-design/icons';
import type { HCRequest, ActionHistoryEntry } from '../types/headcount.types';

const ACTION_COLORS: Record<ActionHistoryEntry['actionType'], string> = {
  Created:   '#3b82f6',
  Submitted: '#f59e0b',
  Approved:  '#22c55e',
  Rejected:  '#ef4444',
  Updated:   '#8b5cf6',
};

const columns: ColumnsType<ActionHistoryEntry> = [
  {
    title: <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, letterSpacing: '0.06em' }}>INITIATED BY</span>,
    dataIndex: 'initiatedBy',
    key: 'initiatedBy',
    render: v => <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{v}</span>,
  },
  {
    title: <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, letterSpacing: '0.06em' }}>EVENT TIMESTAMP</span>,
    dataIndex: 'timestamp',
    key: 'timestamp',
    render: v => <span style={{ fontSize: 13, color: '#9ca3af' }}>{v}</span>,
  },
  {
    title: <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, letterSpacing: '0.06em' }}>ACTION TYPE</span>,
    dataIndex: 'actionType',
    key: 'actionType',
    align: 'right',
    render: (v: ActionHistoryEntry['actionType']) => (
      <span style={{
        fontSize: 14,
        fontWeight: 700,
        color: ACTION_COLORS[v],
        textDecoration: 'underline',
        textDecorationColor: ACTION_COLORS[v],
      }}>
        {v}
      </span>
    ),
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
interface Props {
  request: HCRequest | null;
  onClose: () => void;
}

export function ActionHistoryModal({ request, onClose }: Props) {
  if (!request) return null;

  return (
    <Modal
      open
      onCancel={onClose}
      footer={null}
      width={680}
      centered
      closeIcon={false}
      styles={{
        content: { borderRadius: 16, padding: 0, overflow: 'hidden' },
        header: { display: 'none' },
      }}
    >
      {/* Dark header bar */}
      <div style={{
        background: '#0f172a',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <div style={{
          border: '2px solid #374151',
          borderRadius: 6,
          padding: '4px 12px',
          color: '#fff',
          fontSize: 13,
          fontWeight: 700,
        }}>
          {request.id}
        </div>
        <span style={{ color: '#fff', fontSize: 16, fontWeight: 800, letterSpacing: '0.05em' }}>
          ACTION HISTORY
        </span>
        {/* close btn */}
        <div
          onClick={onClose}
          style={{
            marginLeft: 'auto',
            width: 28, height: 28, borderRadius: '50%',
            background: '#374151',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <CloseOutlined style={{ color: '#9ca3af', fontSize: 12 }} />
        </div>
      </div>

      {/* Table */}
      <div style={{ padding: '8px 0 24px' }}>
        <Table
          dataSource={request.actionHistory}
          columns={columns}
          rowKey="timestamp"
          pagination={false}
          showHeader
          style={{ borderRadius: 0 }}
          rowClassName={() => 'hc-history-row'}
        />
      </div>
    </Modal>
  );
}
