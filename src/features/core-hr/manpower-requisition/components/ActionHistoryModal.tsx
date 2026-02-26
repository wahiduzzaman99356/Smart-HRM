import { Modal, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CloseOutlined } from '@ant-design/icons';
import type { ActionHistoryEntry, RequisitionRequest } from '../types/requisition.types';

const ACTION_COLORS: Record<ActionHistoryEntry['actionType'], string> = {
  Created: '#2563eb',
  Submitted: '#f59e0b',
  Approved: '#10b981',
  Rejected: '#f43f5e',
  Updated: '#8b5cf6',
  'Draft Saved': '#64748b',
};

const columns: ColumnsType<ActionHistoryEntry> = [
  {
    title: <span style={{ fontSize: 11, color: '#cbd5e1', fontWeight: 700, letterSpacing: '0.08em' }}>INITIATED BY</span>,
    dataIndex: 'initiatedBy',
    key: 'initiatedBy',
    render: v => <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{v}</span>,
  },
  {
    title: <span style={{ fontSize: 11, color: '#cbd5e1', fontWeight: 700, letterSpacing: '0.08em' }}>EVENT TIMESTAMP</span>,
    dataIndex: 'timestamp',
    key: 'timestamp',
    render: v => <span style={{ fontSize: 13, color: '#94a3b8' }}>{v}</span>,
  },
  {
    title: <span style={{ fontSize: 11, color: '#cbd5e1', fontWeight: 700, letterSpacing: '0.08em' }}>ACTION TYPE</span>,
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

interface Props {
  request: RequisitionRequest | null;
  onClose: () => void;
}

export function ActionHistoryModal({ request, onClose }: Props) {
  if (!request) return null;

  return (
    <Modal
      open
      onCancel={onClose}
      footer={null}
      centered
      width={860}
      closeIcon={false}
      styles={{
        content: { borderRadius: 24, padding: 0, overflow: 'hidden' },
        header: { display: 'none' },
      }}
    >
      <div style={{
        background: '#0f172a',
        padding: '20px 26px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}>
        <div style={{
          border: '2px solid #334155',
          borderRadius: 8,
          minWidth: 220,
          height: 44,
          color: '#fff',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          paddingInline: 14,
        }}>
          {request.id}
        </div>

        <span style={{ color: '#fff', fontSize: 18, fontWeight: 800, letterSpacing: '0.06em' }}>
          ACTION HISTORY
        </span>

        <div
          onClick={onClose}
          style={{
            marginLeft: 'auto',
            width: 42,
            height: 42,
            borderRadius: '50%',
            background: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <CloseOutlined style={{ color: '#0f172a', fontSize: 18 }} />
        </div>
      </div>

      <div style={{ padding: '12px 20px 28px', background: '#fff' }}>
        <Table
          dataSource={request.actionHistory}
          columns={columns}
          rowKey="timestamp"
          pagination={false}
          rowClassName={() => 'mr-history-row'}
          style={{ fontSize: 14 }}
        />
      </div>
    </Modal>
  );
}
