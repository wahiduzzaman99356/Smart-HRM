import { useMemo, useState } from 'react';
import { Button, Select, Table, Popconfirm, message } from 'antd';
import type { TableColumnsType } from 'antd';
import { PlusOutlined, EyeOutlined, StopOutlined } from '@ant-design/icons';
import {
  ShiftChangeRequest,
  ShiftRequestStatus,
  STATUS_STYLE,
  AVAILABLE_SHIFTS,
} from '../types/shift-change.types';

interface Props {
  requests: ShiftChangeRequest[];
  onCreateNew: () => void;
  onView: (req: ShiftChangeRequest) => void;
  onCancel: (id: string) => void;
}

const SORT_OPTIONS = [
  { value: 'date_desc',   label: 'Date (Newest)' },
  { value: 'date_asc',    label: 'Date (Oldest)' },
  { value: 'status',      label: 'Status' },
];

export function ShiftChangeListView({ requests, onCreateNew, onView, onCancel }: Props) {
  const [fromShift, setFromShift]  = useState('');
  const [toShift, setToShift]      = useState('');
  const [status, setStatus]        = useState('');
  const [sortBy, setSortBy]        = useState('date_desc');
  const [applied, setApplied]      = useState({ fromShift: '', toShift: '', status: '' });
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const filtered = useMemo(() => {
    let rows = [...requests];
    if (applied.fromShift) rows = rows.filter(r => r.fromShift.id === applied.fromShift);
    if (applied.toShift)   rows = rows.filter(r => r.toShift.id   === applied.toShift);
    if (applied.status)    rows = rows.filter(r => r.status        === applied.status);

    rows.sort((a, b) => {
      if (sortBy === 'date_asc')  return a.createdAt.localeCompare(b.createdAt);
      if (sortBy === 'status')    return a.status.localeCompare(b.status);
      return b.createdAt.localeCompare(a.createdAt);
    });
    return rows;
  }, [requests, applied, sortBy]);

  const handleSearch = () => setApplied({ fromShift, toShift, status });
  const handleReset  = () => {
    setFromShift(''); setToShift(''); setStatus('');
    setApplied({ fromShift: '', toShift: '', status: '' });
  };

  const columns: TableColumnsType<ShiftChangeRequest> = [
    { title: 'Date', dataIndex: 'date', key: 'date', width: 130, render: v => <span style={{ fontSize: 13, color: '#374151' }}>{v}</span> },
    {
      title: 'From Shift',
      dataIndex: 'fromShift',
      key: 'fromShift',
      render: (s) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: 13, color: '#111827' }}>{s.name}</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>{s.timeRange}</div>
        </div>
      ),
    },
    {
      title: 'To Shift',
      dataIndex: 'toShift',
      key: 'toShift',
      render: (s) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: 13, color: '#111827' }}>{s.name}</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>{s.timeRange}</div>
        </div>
      ),
    },
    { title: 'Type', dataIndex: 'requestType', key: 'requestType', width: 90, render: v => <span style={{ fontSize: 12, color: '#6b7280' }}>{v}</span> },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (s: ShiftRequestStatus) => {
        const st = STATUS_STYLE[s];
        return (
          <span
            style={{
              display: 'inline-block',
              padding: '3px 10px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 500,
              color: st.color,
              background: st.bg,
              border: `1px solid ${st.border}`,
            }}
          >
            {s}
          </span>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 160,
      render: (_, rec) => (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            onClick={() => onView(rec)}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 13, color: '#0d9488', fontWeight: 500, textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: 4 }}
          >
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
              <button
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 13, color: '#dc2626', fontWeight: 500, textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <StopOutlined style={{ fontSize: 12 }} /> Cancel Request
              </button>
            </Popconfirm>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px 28px', height: '100%', overflowY: 'auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>Request List</h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>
            View and manage your shift change / exchange requests
          </p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={onCreateNew}
          style={{ background: '#0d9488', borderColor: '#0d9488' }}>
          Create
        </Button>
      </div>

      {/* Filter Bar */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 18px', marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <Select
            placeholder="From Shift"
            value={fromShift || undefined}
            onChange={setFromShift}
            style={{ width: 160 }}
            allowClear
            options={AVAILABLE_SHIFTS.map(s => ({ value: s.id, label: s.name }))}
          />
          <Select
            placeholder="To Shift"
            value={toShift || undefined}
            onChange={setToShift}
            style={{ width: 160 }}
            allowClear
            options={AVAILABLE_SHIFTS.map(s => ({ value: s.id, label: s.name }))}
          />
          <Select
            placeholder="Status"
            value={status || undefined}
            onChange={setStatus}
            style={{ width: 140 }}
            allowClear
            options={[
              { value: 'To Approve', label: 'To Approve' },
              { value: 'Approved',   label: 'Approved' },
              { value: 'Rejected',   label: 'Rejected' },
              { value: 'Cancelled',  label: 'Cancelled' },
            ]}
          />
          <Button type="primary" onClick={handleSearch} style={{ background: '#0d9488', borderColor: '#0d9488' }}>Search</Button>
          <Button onClick={handleReset}>Reset</Button>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#6b7280' }}>Sort by</span>
            <Select value={sortBy} onChange={setSortBy} style={{ width: 150 }} options={SORT_OPTIONS} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <Table
          rowKey="id"
          dataSource={filtered}
          columns={columns}
          pagination={{ pageSize: 10, showTotal: (t) => `Total ${t} records`, size: 'small' }}
          rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
          locale={{ emptyText: <div style={{ padding: '40px 0', color: '#9ca3af', fontSize: 13 }}>No requests found</div> }}
          size="middle"
        />
      </div>
    </div>
  );
}
