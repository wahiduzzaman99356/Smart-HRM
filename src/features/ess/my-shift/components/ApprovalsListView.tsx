import { useMemo, useState } from 'react';
import { Button, Select, Input, DatePicker, Table, Dropdown, message } from 'antd';
import type { TableColumnsType, MenuProps } from 'antd';
import type { Dayjs } from 'dayjs';
import {
  SearchOutlined,
  DownOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import {
  ShiftChangeRequest,
  ShiftRequestStatus,
  STATUS_STYLE,
  DEPARTMENTS,
  DESIGNATIONS,
  SECTIONS,
} from '../types/shift-change.types';

type DateRangeValue = [Dayjs | null, Dayjs | null] | null;

interface Props {
  requests: ShiftChangeRequest[];
  onApproveReject: (req: ShiftChangeRequest) => void;
  onBulkApprove: (ids: string[]) => void;
  onBulkReject: (ids: string[]) => void;
}

const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Date (Newest)' },
  { value: 'date_asc',  label: 'Date (Oldest)' },
  { value: 'status',    label: 'Status' },
  { value: 'name',      label: 'Employee Name' },
];

export function ApprovalsListView({ requests, onApproveReject, onBulkApprove, onBulkReject }: Props) {
  // Filters
  const [search, setSearch]           = useState('');
  const [department, setDepartment]   = useState('');
  const [designation, setDesignation] = useState('');
  const [section, setSection]         = useState('');
  const [dateRange, setDateRange]     = useState<DateRangeValue>(null);
  const [statusFilter, setStatus]     = useState('');
  const [sortBy, setSortBy]           = useState('date_desc');

  // Applied (committed) filter state
  const [applied, setApplied] = useState({
    search: '', department: '', designation: '', section: '', status: '', dateRange: null as DateRangeValue,
  });

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const handleSearch = () => setApplied({ search, department, designation, section, status: statusFilter, dateRange });
  const handleReset  = () => {
    setSearch(''); setDepartment(''); setDesignation(''); setSection('');
    setDateRange(null); setStatus('');
    setApplied({ search: '', department: '', designation: '', section: '', status: '', dateRange: null });
  };

  const filtered = useMemo(() => {
    let rows = [...requests];
    if (applied.search) {
      const q = applied.search.toLowerCase();
      rows = rows.filter(r => r.employeeName.toLowerCase().includes(q) || r.employeeId.toLowerCase().includes(q));
    }
    if (applied.department)   rows = rows.filter(r => r.department  === applied.department);
    if (applied.designation)  rows = rows.filter(r => r.designation === applied.designation);
    if (applied.section)      rows = rows.filter(r => r.section     === applied.section);
    if (applied.status)       rows = rows.filter(r => r.status      === applied.status);

    rows.sort((a, b) => {
      if (sortBy === 'date_asc') return a.createdAt.localeCompare(b.createdAt);
      if (sortBy === 'status')   return a.status.localeCompare(b.status);
      if (sortBy === 'name')     return a.employeeName.localeCompare(b.employeeName);
      return b.createdAt.localeCompare(a.createdAt);
    });
    return rows;
  }, [requests, applied, sortBy]);

  // Action dropdown for bulk operations
  const actionMenuItems: MenuProps['items'] = [
    {
      key: 'approve',
      icon: <CheckCircleOutlined style={{ color: '#059669' }} />,
      label: 'Approve Selected',
      onClick: () => {
        if (!selectedRowKeys.length) { message.warning('Select at least one record.'); return; }
        onBulkApprove(selectedRowKeys as string[]);
        setSelectedRowKeys([]);
      },
    },
    {
      key: 'reject',
      icon: <CloseCircleOutlined style={{ color: '#dc2626' }} />,
      label: 'Reject Selected',
      onClick: () => {
        if (!selectedRowKeys.length) { message.warning('Select at least one record.'); return; }
        onBulkReject(selectedRowKeys as string[]);
        setSelectedRowKeys([]);
      },
    },
    { type: 'divider' },
    {
      key: 'export',
      icon: <DownloadOutlined />,
      label: 'Export',
      onClick: () => message.info('Export feature coming soon.'),
    },
  ];

  const columns: TableColumnsType<ShiftChangeRequest> = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 110,
      render: v => <span style={{ fontSize: 13, color: '#374151' }}>{v}</span>,
    },
    {
      title: 'Employee Details',
      key: 'employee',
      render: (_, rec) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>{rec.employeeName}</div>
          <div style={{ fontSize: 11, color: '#6b7280' }}>ID: {rec.employeeId}</div>
          <div style={{ fontSize: 11, color: '#6b7280' }}>Department: {rec.department}</div>
          <div style={{ fontSize: 11, color: '#6b7280' }}>Designation: {rec.designation}</div>
        </div>
      ),
    },
    {
      title: 'From Shift',
      dataIndex: 'fromShift',
      key: 'fromShift',
      render: s => (
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
      render: s => (
        <div>
          <div style={{ fontWeight: 500, fontSize: 13, color: '#111827' }}>{s.name}</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>{s.timeRange}</div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (s: ShiftRequestStatus) => {
        const st = STATUS_STYLE[s];
        return (
          <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500, color: st.color, background: st.bg, border: `1px solid ${st.border}` }}>
            {s}
          </span>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 140,
      render: (_, rec) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {rec.status === 'To Approve' ? (
            <button
              onClick={() => onApproveReject(rec)}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 13, color: '#0d9488', fontWeight: 600, textDecoration: 'underline', textAlign: 'left' }}
            >
              Approve/Reject
            </button>
          ) : (
            <button
              onClick={() => onApproveReject(rec)}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 13, color: '#6b7280', fontWeight: 500, textDecoration: 'underline', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <EyeOutlined style={{ fontSize: 12 }} /> View
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px 28px', height: '100%', overflowY: 'auto' }}>
      {/* Filter Bar */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '16px 18px', marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 10 }}>
          <Input
            prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
            placeholder="Search by Employee Name, ID"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 220 }}
          />
          <Select placeholder="Department"  value={department  || undefined} onChange={setDepartment}  style={{ width: 160 }} allowClear options={DEPARTMENTS.map(d => ({ value: d, label: d }))} />
          <Select placeholder="Designation" value={designation || undefined} onChange={setDesignation} style={{ width: 160 }} allowClear options={DESIGNATIONS.map(d => ({ value: d, label: d }))} />
          <Select placeholder="Section"     value={section     || undefined} onChange={setSection}     style={{ width: 140 }} allowClear options={SECTIONS.map(s => ({ value: s, label: s }))} />
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <DatePicker.RangePicker
            value={dateRange}
            onChange={setDateRange}
            style={{ width: 240 }}
            format="DD MMM YYYY"
          />
          <Select placeholder="Status" value={statusFilter || undefined} onChange={setStatus} style={{ width: 140 }} allowClear
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
            <Dropdown menu={{ items: actionMenuItems }} trigger={['click']}>
              <Button icon={<DownOutlined />} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                Action
              </Button>
            </Dropdown>
          </div>
        </div>
      </div>

      {/* Sort + Table */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Sort by</span>
          <Select value={sortBy} onChange={setSortBy} style={{ width: 160 }} options={SORT_OPTIONS} />
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <Table
          rowKey="id"
          dataSource={filtered}
          columns={columns}
          pagination={{ pageSize: 10, showTotal: t => `Total ${t} records`, size: 'small' }}
          rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
          locale={{ emptyText: <div style={{ padding: '40px 0', color: '#9ca3af', fontSize: 13 }}>No approval requests found</div> }}
          size="middle"
        />
      </div>
    </div>
  );
}
