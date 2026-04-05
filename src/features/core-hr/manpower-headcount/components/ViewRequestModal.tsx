/**
 * ViewRequestModal
 * Read-only detail view of a headcount request.
 * Opens when the user clicks on an Initiation Details row in the list.
 */

import { Modal, Table, Descriptions } from 'antd';
import { PaperClipOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { HCRequest, HCOrgLevelRow, HCStatus } from '../types/headcount.types';

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_PROPS: Record<HCStatus, { color: string; bg: string; border: string }> = {
  Draft:    { color: 'var(--color-text-tertiary)', bg: 'var(--color-bg-subtle)', border: 'var(--color-border)' },
  Pending:  { color: '#d97706', bg: 'var(--color-status-pending-bg)', border: 'rgba(252, 211, 77, 0.45)' },
  Approved: { color: '#059669', bg: 'var(--color-status-approved-bg)', border: 'var(--color-status-approved-bg)' },
  Rejected: { color: '#dc2626', bg: 'var(--color-status-rejected-bg)', border: 'var(--color-status-rejected-bg)' },
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
    title: <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-disabled)', letterSpacing: '0.05em' }}>ORGANIZATION LEVEL</span>,
    dataIndex: 'orgLevelPath',
    key: 'level',
    render: v => <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)' }}>{v}</span>,
  },
  {
    title: <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-disabled)', letterSpacing: '0.05em' }}>CURRENT HC</span>,
    dataIndex: 'currentHC',
    key: 'currentHC',
    align: 'center',
    width: 100,
    render: v => <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-text-primary)' }}>{v}</span>,
  },
  {
    title: <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-disabled)', letterSpacing: '0.05em' }}>REQUIRED HC</span>,
    dataIndex: 'requiredHC',
    key: 'requiredHC',
    align: 'center',
    width: 110,
        render: v => <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-primary)' }}>{v || '—'}</span>,
  },
  {
    title: <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-disabled)', letterSpacing: '0.05em' }}>BUDGET</span>,
    dataIndex: 'budget',
    key: 'budget',
    render: v => <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{v || '—'}</span>,
  },
  {
    title: <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-disabled)', letterSpacing: '0.05em' }}>JUSTIFICATION</span>,
    dataIndex: 'justification',
    key: 'justification',
    render: v => <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>{v || '—'}</span>,
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
          <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--color-text-primary)' }}>
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
        styles={{ label: { fontSize: 11, color: 'var(--color-text-disabled)', fontWeight: 600 }, content: { fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 500 } }}
        items={[
          { key: 'plan',    label: 'PLAN YEAR',       children: request.planYear },
          { key: 'date',    label: 'INITIATED ON',    children: request.initiationDate },
          { key: 'reqHC',   label: 'TOTAL REQ. HC',   children: <strong style={{ color: 'var(--color-text-primary)' }}>{request.totalReqHC}</strong> },
          { key: 'apprHC',  label: 'TOTAL APPR. HC',  children: request.totalApprHC !== null ? <strong style={{ color: 'var(--color-primary)' }}>{request.totalApprHC}</strong> : <span style={{ color: 'var(--color-text-disabled)' }}>—</span> },
        ]}
      />

      {/* Org levels table */}
      <div style={{ border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
        <Table
          dataSource={request.rows}
          columns={columns}
          rowKey="id"
          pagination={false}
          size="small"
          locale={{ emptyText: <span style={{ color: 'var(--color-text-disabled)' }}>No org levels on this request.</span> }}
        />
      </div>

      {/* Attachments */}
      <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '0.06em', marginBottom: 8 }}>
          ATTACHMENTS
        </div>
        {(request.attachments?.length ?? 0) > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {request.attachments!.map(att => (
              <div
                key={att.uid}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)',
                  borderRadius: 7, padding: '6px 12px',
                }}
              >
                <PaperClipOutlined style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13, color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {att.name}
                </span>
                {att.size && (
                  <span style={{ fontSize: 11, color: 'var(--color-text-disabled)', flexShrink: 0 }}>
                    {(att.size / 1024).toFixed(1)} KB
                  </span>
                )}
                {att.objectUrl && (
                  <a
                    href={att.objectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600, flexShrink: 0 }}
                  >
                    View
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <span style={{ fontSize: 13, color: 'var(--color-text-disabled)' }}>No attachments.</span>
        )}
      </div>
    </Modal>
  );
}

