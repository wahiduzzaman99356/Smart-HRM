import { useMemo, useState } from 'react';
import { Button, Input, Select, DatePicker, Table } from 'antd';
import type { TableColumnsType } from 'antd';
import type { Dayjs } from 'dayjs';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import {
  LoanRequest,
  LoanStatus,
  LoanType,
  STATUS_STYLE,
  DEPARTMENTS,
  DESIGNATIONS,
  SECTIONS,
  GUARANTOR_EMPLOYEES,
} from '../types/loan.types';

type DateRangeValue = [Dayjs | null, Dayjs | null] | null;

interface Props {
  requests:        LoanRequest[];
  onApproveReject: (req: LoanRequest) => void;
  onCreateNew:     () => void;
}

const TYPE_OPTIONS: { value: LoanType; label: string }[] = [
  { value: 'Loan',           label: 'Loan' },
  { value: 'Advance Salary', label: 'Advance Salary' },
];

const STATUS_OPTIONS: { value: LoanStatus; label: string }[] = [
  { value: 'To Approve', label: 'To Approve' },
  { value: 'Approved',   label: 'Approved' },
  { value: 'Rejected',   label: 'Rejected' },
  { value: 'Cancelled',  label: 'Cancelled' },
];

export function LoanApprovalsListView({ requests, onApproveReject, onCreateNew }: Props) {
  const [search,       setSearch]       = useState('');
  const [department,   setDepartment]   = useState('');
  const [designation,  setDesignation]  = useState('');
  const [section,      setSection]      = useState('');
  const [guarantorId,  setGuarantorId]  = useState('');
  const [dateRange,    setDateRange]    = useState<DateRangeValue>(null);
  const [typeFilter,   setTypeFilter]   = useState<LoanType | ''>('');
  const [statusFilter, setStatusFilter] = useState<LoanStatus | ''>('');

  const [applied, setApplied] = useState({
    search: '', department: '', designation: '', section: '', guarantorId: '',
    type: '' as LoanType | '', status: '' as LoanStatus | '', dateRange: null as DateRangeValue,
  });

  const handleSearch = () =>
    setApplied({ search, department, designation, section, guarantorId, type: typeFilter, status: statusFilter, dateRange });

  const handleReset = () => {
    setSearch(''); setDepartment(''); setDesignation(''); setSection('');
    setGuarantorId(''); setTypeFilter(''); setStatusFilter(''); setDateRange(null);
    setApplied({ search: '', department: '', designation: '', section: '', guarantorId: '', type: '', status: '', dateRange: null });
  };

  const filtered = useMemo(() => {
    let rows = [...requests];
    if (applied.search) {
      const q = applied.search.toLowerCase();
      rows = rows.filter(r => r.employeeName.toLowerCase().includes(q) || r.employeeId.toLowerCase().includes(q));
    }
    if (applied.department)  rows = rows.filter(r => r.department  === applied.department);
    if (applied.designation) rows = rows.filter(r => r.designation === applied.designation);
    if (applied.section)     rows = rows.filter(r => r.section     === applied.section);
    if (applied.guarantorId) rows = rows.filter(r => r.guarantorEmployeeId === applied.guarantorId);
    if (applied.type)        rows = rows.filter(r => r.type        === applied.type);
    if (applied.status)      rows = rows.filter(r => r.status      === applied.status);
    if (applied.dateRange?.[0] && applied.dateRange?.[1]) {
      const from = applied.dateRange[0].startOf('day').valueOf();
      const to   = applied.dateRange[1].endOf('day').valueOf();
      rows = rows.filter(r => {
        const ts = new Date(r.createdAt).valueOf();
        return ts >= from && ts <= to;
      });
    }
    return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [requests, applied]);

  const columns: TableColumnsType<LoanRequest> = [
    {
      title: 'Initiate Date',
      dataIndex: 'initiateDate',
      key: 'initiateDate',
      width: 130,
      render: v => <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{v}</span>,
    },
    {
      title: 'Employee Details',
      key: 'employee',
      render: (_, rec) => (
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text-primary)' }}>{rec.employeeName}</div>
          <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>ID: {rec.employeeId}</div>
          <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>Department: {rec.department}</div>
          <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>Designation: {rec.designation}</div>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 130,
      render: (v: LoanType) => <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{v}</span>,
    },
    {
      title: 'Amount',
      key: 'amount',
      width: 140,
      render: (_, rec) => (
        <span style={{ fontSize: 13, color: 'var(--color-text-primary)', fontWeight: 500 }}>
          {rec.amount.toLocaleString()}<span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginLeft: 2 }}>BDT</span>
        </span>
      ),
    },
    {
      title: 'Total installment number',
      dataIndex: 'installmentNumber',
      key: 'installmentNumber',
      width: 170,
      render: v => <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{v}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (s: LoanStatus) => {
        const st = STATUS_STYLE[s];
        return (
          <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, color: st.color, background: st.bg, border: `1px solid ${st.border}` }}>
            {s}
          </span>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 150,
      render: (_, rec) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <button
            onClick={() => onApproveReject(rec)}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 13, color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'underline', textAlign: 'left' }}
          >
            View
          </button>
          {rec.status === 'To Approve' && (
            <button
              onClick={() => onApproveReject(rec)}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 13, color: 'var(--color-primary)', fontWeight: 500, textDecoration: 'underline', textAlign: 'left' }}
            >
              Approve/Reject
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px 28px', height: '100%', overflowY: 'auto' }}>
      {/* Filter Bar */}
      <div style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '16px 18px', marginBottom: 18 }}>
        {/* Row 1 */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 10 }}>
          <Input
            prefix={<SearchOutlined style={{ color: 'var(--color-text-disabled)' }} />}
            placeholder="Search by Employee Name, ID"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 240, borderRadius: 8 }}
          />
          <Select
            placeholder="Department"
            value={department || undefined}
            onChange={setDepartment}
            style={{ width: 160 }}
            allowClear
            options={DEPARTMENTS.map(d => ({ value: d, label: d }))}
          />
          <Select
            placeholder="Designation"
            value={designation || undefined}
            onChange={setDesignation}
            style={{ width: 160 }}
            allowClear
            options={DESIGNATIONS.map(d => ({ value: d, label: d }))}
          />
          <Select
            placeholder="Section"
            value={section || undefined}
            onChange={setSection}
            style={{ width: 140 }}
            allowClear
            options={SECTIONS.map(s => ({ value: s, label: s }))}
          />
          <Select
            placeholder="Guarantor name"
            value={guarantorId || undefined}
            onChange={setGuarantorId}
            style={{ width: 200 }}
            allowClear
            options={GUARANTOR_EMPLOYEES.map(e => ({ value: e.employeeId, label: e.name }))}
          />
        </div>

        {/* Row 2 */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <DatePicker.RangePicker
            value={dateRange}
            onChange={setDateRange}
            format="DD MMM YYYY"
            style={{ borderRadius: 8 }}
          />
          <Select
            placeholder="Type"
            value={typeFilter || undefined}
            onChange={v => setTypeFilter(v)}
            style={{ width: 160 }}
            allowClear
            options={TYPE_OPTIONS}
          />
          <Select
            placeholder="Status"
            value={statusFilter || undefined}
            onChange={v => setStatusFilter(v)}
            style={{ width: 160 }}
            allowClear
            options={STATUS_OPTIONS}
          />
          <Button type="primary" onClick={handleSearch} style={{ background: 'var(--color-primary)', borderColor: 'var(--color-primary)', borderRadius: 8 }}>Search</Button>
          <Button onClick={handleReset} style={{ borderRadius: 8 }}>Reset</Button>
          <div style={{ marginLeft: 'auto' }}>
            <Button icon={<PlusOutlined />} onClick={onCreateNew} style={{ borderRadius: 8, fontWeight: 500 }}>Create</Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--color-bg-surface)', borderRadius: 10, border: '1px solid var(--color-border)', overflow: 'hidden' }}>
        <Table
          rowKey="id"
          dataSource={filtered}
          columns={columns}
          pagination={{ pageSize: 10, showTotal: t => `Total ${t} records`, size: 'small' }}
          locale={{ emptyText: <div style={{ padding: '40px 0', color: 'var(--color-text-disabled)', fontSize: 13 }}>No approval requests found</div> }}
          size="middle"
        />
      </div>
    </div>
  );
}
