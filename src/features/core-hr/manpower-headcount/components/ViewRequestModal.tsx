/**
 * ViewRequestModal
 * Read-only detail view of a headcount request.
 * Opens when the user clicks on an Initiation Details row in the list.
 */

import { Modal, Table, Descriptions } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { HCRequest, HCOrgLevelRow, HCStatus } from '../types/headcount.types';

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_PROPS: Record<HCStatus, { color: string; bg: string; border: string }> = {
  Draft:    { color: '#6b7280', bg: '#f3f4f6', border: '#d1d5db' },
  Pending:  { color: '#d97706', bg: '#fffbeb', border: '#fcd34d' },
  Approved: { color: '#059669', bg: '#ecfdf5', border: '#6ee7b7' },
  Rejected: { color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
};

function StatusBadge({ status }: { status: HCStatus }) {
  const p = STATUS_PROPS[status];
  return (
    <span style={{
      display: 'inline-block', padding: '3px 12px', borderRadius: 20,
      fontSize: 12, fontWeight: 600, color: p.color, background: p.bg,
      border: `1px solid ${p.border}`,
    }}>
      {status}
    </span>
  );
}

// ─── Table columns (read-only) ────────────────────────────────────────────────
const columns: ColumnsType<HCOrgLevelRow> = [
  {
    title: <span style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.05em' }}>ORGANIZATION LEVEL</span>,
    dataIndex: 'orgLevelPath',
    key: 'level',
    render: v => <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{v}</span>,
  },
  {
    title: <span style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.05em' }}>CURRENT HC</span>,
    dataIndex: 'currentHC',
    key: 'currentHC',
    align: 'center',
    width: 100,
    render: v => <span style={{ fontSize: 14, fontWeight: 800, color: '#111827' }}>{v}</span>,
  },
  {
    title: <span style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.05em' }}>REQUIRED HC</span>,
    dataIndex: 'requiredHC',
    key: 'requiredHC',
    align: 'center',
    width: 110,
    render: v => <span style={{ fontSize: 14, fontWeight: 700, color: '#3b82f6' }}>{v || '—'}</span>,
  },
  {
    title: <span style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.05em' }}>BUDGET RANGE</span>,
    dataIndex: 'budgetRange',
    key: 'budgetRange',
    render: v => <span style={{ fontSize: 13, color: '#374151' }}>{v || '—'}</span>,
  },
  {
    title: <span style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.05em' }}>JUSTIFICATION</span>,
    dataIndex: 'justification',
    key: 'justification',
    render: v => <span style={{ fontSize: 12, color: '#6b7280' }}>{v || '—'}</span>,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
interface Props {
  request: HCRequest | null;
  onClose: () => void;
}

export function ViewRequestModal({ request, onClose }: Props) {
  if (!request) return null;

  return (
    <Modal
      open
      onCancel={onClose}
      footer={null}
      width={820}
      centered
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: 800, fontSize: 16, color: '#111827' }}>
            {request.id}
          </span>
          <StatusBadge status={request.status} />
        </div>
      }
      styles={{ header: { borderBottom: '1px solid #f0f0f0', paddingBottom: 14 } }}
    >
      {/* Summary info */}
      <Descriptions
        size="small"
        column={3}
        style={{ marginBottom: 20, marginTop: 4 }}
        styles={{ label: { fontSize: 11, color: '#9ca3af', fontWeight: 600 }, content: { fontSize: 13, color: '#374151', fontWeight: 500 } }}
        items={[
          { key: 'plan',    label: 'PLAN YEAR',       children: request.planYear },
          { key: 'date',    label: 'INITIATED ON',    children: request.initiationDate },
          { key: 'reqHC',   label: 'TOTAL REQ. HC',   children: <strong style={{ color: '#111827' }}>{request.totalReqHC}</strong> },
          { key: 'apprHC',  label: 'TOTAL APPR. HC',  children: request.totalApprHC !== null ? <strong style={{ color: '#3b82f6' }}>{request.totalApprHC}</strong> : <span style={{ color: '#d1d5db' }}>—</span> },
        ]}
      />

      {/* Org levels table */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
        <Table
          dataSource={request.rows}
          columns={columns}
          rowKey="id"
          pagination={false}
          size="small"
          locale={{ emptyText: <span style={{ color: '#9ca3af' }}>No org levels on this request.</span> }}
        />
      </div>
    </Modal>
  );
}
