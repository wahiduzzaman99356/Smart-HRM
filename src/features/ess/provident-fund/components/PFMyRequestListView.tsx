import { useMemo, useState } from 'react';
import { Button, Select, Table, Popconfirm, message } from 'antd';
import type { TableColumnsType } from 'antd';
import { PlusOutlined, EyeOutlined, StopOutlined } from '@ant-design/icons';
import {
  PFLoanRequest,
  PFLoanStatus,
  STATUS_STYLE,
  CURRENT_EMPLOYEE_PF_BALANCE,
} from '../types/provident-fund.types';

interface Props {
  requests: PFLoanRequest[];
  onCreateNew: () => void;
  onView: (req: PFLoanRequest) => void;
  onCancel: (id: string) => void;
}

const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Date (Newest)' },
  { value: 'date_asc',  label: 'Date (Oldest)' },
  { value: 'status',    label: 'Status' },
];

export function PFMyRequestListView({ requests, onCreateNew, onView, onCancel }: Props) {
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy]             = useState('date_desc');
  const [applied, setApplied]           = useState({ status: '' });

  const filtered = useMemo(() => {
    let rows = [...requests];
    if (applied.status) rows = rows.filter(r => r.status === applied.status);
    rows.sort((a, b) => {
      if (sortBy === 'date_asc') return a.createdAt.localeCompare(b.createdAt);
      if (sortBy === 'status')   return a.status.localeCompare(b.status);
      return b.createdAt.localeCompare(a.createdAt);
    });
    return rows;
  }, [requests, applied, sortBy]);

  const handleSearch = () => setApplied({ status: statusFilter });
  const handleReset  = () => { setStatusFilter(''); setApplied({ status: '' }); };

  const bal = CURRENT_EMPLOYEE_PF_BALANCE;

  const columns: TableColumnsType<PFLoanRequest> = [
    {
      title: 'Initiate Date',
      dataIndex: 'initiateDate',
      key: 'initiateDate',
      width: 140,
      render: v => <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{v}</span>,
    },
    {
      title: 'Loan Amount',
      dataIndex: 'loanAmount',
      key: 'loanAmount',
      width: 150,
      render: v => <span style={{ fontSize: 13, color: 'var(--color-text-primary)', fontWeight: 500 }}>{v.toLocaleString()} BDT</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (s: PFLoanStatus) => {
        const st = STATUS_STYLE[s];
        return (
          <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, color: st.color, background: st.bg, border: `1px solid ${st.border}` }}>
            {s}
          </span>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 180,
      render: (_, rec) => (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button className="action-link" onClick={() => onView(rec)}>
            <EyeOutlined style={{ fontSize: 13 }} /> View
          </button>
          {rec.status === 'To Approve' && (
            <Popconfirm
              title="Cancel this request?"
              description="This action cannot be undone."
              okText="Yes, Cancel"
              cancelText="No"
              okButtonProps={{ danger: true }}
              onConfirm={() => { onCancel(rec.id); message.success('Request cancelled.'); }}
            >
              <button className="action-link danger">
                <StopOutlined style={{ fontSize: 12 }} /> Cancel Request
              </button>
            </Popconfirm>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="page-shell">
      {/* Page Header */}
      <div className="page-header-row">
        <h1 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Provident Fund</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={onCreateNew}>
          Loan Request
        </Button>
      </div>

      {/* Balance Card */}
      <div className="card-surface" style={{ display: 'flex', alignItems: 'center', gap: 32, padding: '20px 28px', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>Current Balance</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1 }}>
            {bal.currentBalance.toLocaleString()}
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-tertiary)', marginLeft: 4 }}>BDT</span>
          </div>
        </div>
        <div style={{ border: '1.5px solid #d1d5db', borderRadius: 8, padding: '10px 18px', minWidth: 260 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6, paddingBottom: 6, borderBottom: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>Employee Contribution</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {bal.employeeContribution.toLocaleString()}
              <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginLeft: 3 }}>BDT</span>
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>Employer Contribution</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {bal.employerContribution.toLocaleString()}
              <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginLeft: 3 }}>BDT</span>
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar" style={{ padding: '14px 18px' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <Select
            placeholder="Status"
            value={statusFilter || undefined}
            onChange={setStatusFilter}
            style={{ width: 160 }}
            allowClear
            options={[
              { value: 'To Approve', label: 'To Approve' },
              { value: 'Approved',   label: 'Approved' },
              { value: 'Rejected',   label: 'Rejected' },
              { value: 'Cancelled',  label: 'Cancelled' },
            ]}
          />
          <Button type="primary" onClick={handleSearch}>Search</Button>
          <Button onClick={handleReset}>Reset</Button>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>Sort by</span>
            <Select value={sortBy} onChange={setSortBy} style={{ width: 150 }} options={SORT_OPTIONS} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="list-surface">
        <Table
          rowKey="id"
          dataSource={filtered}
          columns={columns}
          pagination={{ pageSize: 10, showTotal: t => `Total ${t} records`, size: 'small' }}
          locale={{ emptyText: <div style={{ padding: '40px 0', color: 'var(--color-text-disabled)', fontSize: 13 }}>No loan requests found</div> }}
          size="middle"
        />
      </div>
    </div>
  );
}
