/**
 * ActionHistoryModal
 * Audit log for a requisition request.
 */

import { Modal, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CloseOutlined } from '@ant-design/icons';
import type { RequisitionRequest, ActionHistoryEntry } from '../types/requisition.types';

const ACTION_CONFIG: Record<ActionHistoryEntry['actionType'], { color: string; bg: string }> = {
	Created: { color: '#0f766e', bg: '#eff6ff' },
	Submitted: { color: '#d97706', bg: '#fffbeb' },
	Approved: { color: '#059669', bg: '#f0fdf4' },
	Rejected: { color: '#dc2626', bg: '#fef2f2' },
	Updated: { color: '#7c3aed', bg: '#f5f3ff' },
	'Draft Saved': { color: '#0369a1', bg: '#f0f9ff' },
};

const columns: ColumnsType<ActionHistoryEntry> = [
	{
		title: 'Initiated By',
		dataIndex: 'initiatedBy',
		key: 'initiatedBy',
		render: value => <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{value}</span>,
	},
	{
		title: 'Timestamp',
		dataIndex: 'timestamp',
		key: 'timestamp',
		render: value => <span style={{ fontSize: 12, color: '#9ca3af' }}>{value}</span>,
	},
	{
		title: 'Action',
		dataIndex: 'actionType',
		key: 'actionType',
		align: 'right',
		render: (value: ActionHistoryEntry['actionType']) => {
			const cfg = ACTION_CONFIG[value] ?? { color: '#6b7280', bg: '#f9fafb' };
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
						background: '#f3f4f6',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<CloseOutlined style={{ color: '#6b7280', fontSize: 11 }} />
				</div>
			}
			styles={{
				content: { borderRadius: 14, padding: '28px 30px' },
				header: { borderBottom: 'none', paddingBottom: 0 },
			}}
		>
			<div style={{ marginBottom: 20 }}>
				<div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
					<span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Action History</span>
					<span
						style={{
							background: '#f3f4f6',
							border: '1px solid #e5e7eb',
							borderRadius: 5,
							padding: '1px 8px',
							fontSize: 11,
							fontWeight: 600,
							color: '#6b7280',
							fontFamily: 'monospace',
							letterSpacing: '0.02em',
						}}
					>
						{request.id}
					</span>
				</div>
				<div style={{ fontSize: 12, color: '#9ca3af' }}>
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
