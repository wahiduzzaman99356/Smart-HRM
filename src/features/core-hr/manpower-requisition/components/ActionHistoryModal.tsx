/**
 * ActionHistoryModal
 * Audit log for a requisition request.
 */

import { Modal, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CloseOutlined } from '@ant-design/icons';
import type { RequisitionRequest, ActionHistoryEntry } from '../types/requisition.types';

const ACTION_CONFIG: Record<ActionHistoryEntry['actionType'], { color: string; bg: string }> = {
	Created: { color: 'var(--color-primary)', bg: 'var(--color-status-info-bg)' },
	Submitted: { color: '#d97706', bg: 'var(--color-status-pending-bg)' },
	Approved: { color: '#059669', bg: 'var(--color-status-approved-bg)' },
	Rejected: { color: '#dc2626', bg: 'var(--color-status-rejected-bg)' },
	Updated: { color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.09)' },
	'Draft Saved': { color: '#0369a1', bg: 'var(--color-status-info-bg)' },
};

const columns: ColumnsType<ActionHistoryEntry> = [
	{
		title: 'Initiated By',
		dataIndex: 'initiatedBy',
		key: 'initiatedBy',
		render: value => <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{value}</span>,
	},
	{
		title: 'Timestamp',
		dataIndex: 'timestamp',
		key: 'timestamp',
		render: value => <span style={{ fontSize: 12, color: 'var(--color-text-disabled)' }}>{value}</span>,
	},
	{
		title: 'Action',
		dataIndex: 'actionType',
		key: 'actionType',
		align: 'right',
		render: (value: ActionHistoryEntry['actionType']) => {
			const cfg = ACTION_CONFIG[value] ?? { color: 'var(--color-text-tertiary)', bg: 'var(--color-bg-subtle)' };
			return (
				<span
					style={{
						display: 'inline-block',
						background: cfg.bg,
						color: cfg.color,
						fontSize: 11,
						fontWeight: 600,
						borderRadius: 5,
						padding: '2px 9px',
						letterSpacing: '0.02em',
					}}
				>
					{value}
				</span>
			);
		},
	},
];

interface Props {
	request: RequisitionRequest | null;
	onClose: () => void;
}

export function ActionHistoryModal({ request, onClose }: Props) {
	if (!request) return null;

	const count = request.actionHistory.length;

	return (
		<Modal
			open
			onCancel={onClose}
			footer={null}
			width={520}
			centered
			closeIcon={
				<div
					style={{
						width: 28,
						height: 28,
						borderRadius: '50%',
						background: 'var(--color-bg-subtle)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<CloseOutlined style={{ color: 'var(--color-text-tertiary)', fontSize: 11 }} />
				</div>
			}
			styles={{
				content: { borderRadius: 14, padding: '28px 30px' },
				header: { borderBottom: 'none', paddingBottom: 0 },
			}}
		>
			<div style={{ marginBottom: 20 }}>
				<div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
					<span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>Action History</span>
					<span
						style={{
							background: 'var(--color-bg-subtle)',
							border: '1px solid var(--color-border)',
							borderRadius: 5,
							padding: '1px 8px',
							fontSize: 11,
							fontWeight: 600,
							color: 'var(--color-text-tertiary)',
							fontFamily: 'monospace',
							letterSpacing: '0.02em',
						}}
					>
						{request.id}
					</span>
				</div>
				<div style={{ fontSize: 12, color: 'var(--color-text-disabled)' }}>
					{count} event{count !== 1 ? 's' : ''}
				</div>
			</div>

			<Table
				dataSource={request.actionHistory}
				columns={columns}
				rowKey="timestamp"
				pagination={false}
				size="small"
				style={{ borderRadius: 8, overflow: 'hidden' }}
			/>
		</Modal>
	);
}
