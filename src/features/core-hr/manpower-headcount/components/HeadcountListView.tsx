/**
 * HeadcountListView
 * Filter bar + table of all headcount requests.
 */

import { useState, useMemo } from 'react';
import {
  Button, Table, Select, Input, Dropdown, DatePicker, Space,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined,
  MoreOutlined,
  EyeOutlined,
  SendOutlined,
  CheckCircleOutlined,
  ApartmentOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import type { RangePickerProps } from 'antd/es/date-picker';
import type { HCRequest, HCStatus } from '../types/headcount.types';
import { PLAN_YEAR_OPTIONS } from '../types/headcount.types';

const { RangePicker } = DatePicker;
type DateRange = RangePickerProps['value'];

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
      display: 'inline-block',
      padding: '3px 12px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
      color: p.color,
      background: p.bg,
      border: `1px solid ${p.border}`,
    }}>
      {status}
    </span>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  requests:       HCRequest[];
  onCreate:       () => void;
  onViewRequest:  (req: HCRequest) => void;
  onTakeAction:   (req: HCRequest) => void;
  onViewWorkflow: (req: HCRequest) => void;
  onViewHistory:  (req: HCRequest) => void;
  onSubmit:       (id: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function HeadcountListView({ requests, onCreate, onViewRequest, onTakeAction, onViewWorkflow, onViewHistory, onSubmit }: Props) {

  // ── Filter state ─────────────────────────────────────────────────────────────
  const [dateRange,    setDateRange]    = useState<DateRange>(null);
  const [filterPlan,   setFilterPlan]   = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRef,    setFilterRef]    = useState('');

  const [applied, setApplied] = useState<{
    dateRange: DateRange; plan: string; status: string; ref: string;
  }>({ dateRange: null, plan: '', status: '', ref: '' });

  const handleApply = () =>
    setApplied({ dateRange, plan: filterPlan, status: filterStatus, ref: filterRef });

  const handleReset = () => {
    setDateRange(null); setFilterPlan(''); setFilterStatus(''); setFilterRef('');
    setApplied({ dateRange: null, plan: '', status: '', ref: '' });
  };

  // ── Filtered rows ─────────────────────────────────────────────────────────────
  const data = useMemo(() => {
    return requests.filter(r => {
      if (applied.plan && r.planYear !== applied.plan) return false;
      if (applied.status && r.status !== applied.status) return false;
      if (applied.ref && !r.id.toLowerCase().includes(applied.ref.toLowerCase())) return false;
      return true;
    });
  }, [requests, applied]);

  // ── Columns ───────────────────────────────────────────────────────────────────
  const columns: ColumnsType<HCRequest> = [
    {
      title: <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, letterSpacing: '0.04em' }}>INITIATION DETAILS</span>,
      key: 'details',
      render: (_, r) => (
        <div
          onClick={() => onViewRequest(r)}
          style={{ cursor: 'pointer' }}
        >
          <div style={{ fontWeight: 700, fontSize: 13, color: '#0f766e', textDecoration: 'underline', textDecorationStyle: 'dotted' }}>{r.id}</div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
            HC Initiation &bull; {r.initiationDate}
          </div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>
            Plan Year: {r.planYear.replace('FY ', '').replace(' (Jan - Dec)', ' Jan-Dec')}
          </div>
        </div>
      ),
    },
    {
      title: <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, letterSpacing: '0.04em' }}>REQ. HC</span>,
      key: 'reqHC',
      align: 'center',
      width: 90,
      render: (_, r) => (
        <span style={{ fontSize: 14, fontWeight: 700, color: '#374151' }}>{r.totalReqHC}</span>
      ),
    },
    {
      title: <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, letterSpacing: '0.04em' }}>APPR. HC</span>,
      key: 'apprHC',
      align: 'center',
      width: 90,
      render: (_, r) => (
        r.totalApprHC !== null
          ? <span style={{ fontSize: 14, fontWeight: 700, color: '#0f766e' }}>{r.totalApprHC}</span>
          : <span style={{ color: '#d1d5db', fontWeight: 600 }}>--</span>
      ),
    },
    {
      title: <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, letterSpacing: '0.04em' }}>REQUEST STATUS</span>,
      key: 'status',
      align: 'center',
      width: 140,
      render: (_, r) => <StatusBadge status={r.status} />,
    },
    {
      title: <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, letterSpacing: '0.04em' }}>ACTION</span>,
      key: 'actions',
      align: 'center',
      width: 48,
      render: (_, r) => (
        <Dropdown
          trigger={['click']}
          menu={{
            style: { borderRadius: 8, minWidth: 168 },
            items: [
              { key: 'view', icon: <EyeOutlined />, label: 'View Details', onClick: () => onViewRequest(r) },
              {
                key: 'submit',
                icon: <SendOutlined />,
                label: 'Submit Request',
                disabled: r.status !== 'Draft',
                onClick: () => onSubmit(r.id),
              },
              { key: 'take-action', icon: <CheckCircleOutlined />, label: 'Approve / Reject', onClick: () => onTakeAction(r) },
              { key: 'workflow', icon: <ApartmentOutlined />, label: 'Approval Workflow', onClick: () => onViewWorkflow(r) },
              { key: 'history', icon: <HistoryOutlined />, label: 'Action History', onClick: () => onViewHistory(r) },
            ],
          }}
          placement="bottomRight"
        >
          <Button
            type="text"
            size="small"
            icon={<MoreOutlined style={{ fontSize: 18 }} />}
            style={{
              color: '#9ca3af',
              borderRadius: 6,
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
          />
        </Dropdown>
      ),
    },
  ];

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="page-shell">

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="page-header-row">
        <div>
          <h1>Headcount Management</h1>
          <p>Strategic workforce planning &amp; organogram approvals</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
          Create New Request
        </Button>
      </div>

      {/* ── Filter bar ────────────────────────────────────────────────────── */}
      <div className="filter-bar">
        {/* Date range */}
        <div>
          <div className="filter-label">DATE RANGE
          </div>
          <RangePicker
            value={dateRange}
            onChange={v => setDateRange(v)}
            format="DD MMM YYYY"
            style={{ borderRadius: 7 }}
            placeholder={['Start date', 'End date']}
          />
        </div>

        {/* Plan year */}
        <div>
          <div className="filter-label">PLAN YEAR
          </div>
          <Select
            value={filterPlan || undefined}
            onChange={v => setFilterPlan(v ?? '')}
            placeholder="FY 2026 (Jan - Dec)"
            options={PLAN_YEAR_OPTIONS}
            style={{ width: 190 }}
            allowClear
          />
        </div>

        {/* Status */}
        <div>
          <div className="filter-label">STATUS FILTER
          </div>
          <Select
            value={filterStatus || undefined}
            onChange={v => setFilterStatus(v ?? '')}
            placeholder="All Statuses"
            options={[
              { value: 'Draft',    label: 'Draft'    },
              { value: 'Pending',  label: 'Pending'  },
              { value: 'Approved', label: 'Approved' },
              { value: 'Rejected', label: 'Rejected' },
            ]}
            style={{ width: 150 }}
            allowClear
          />
        </div>

        {/* Ref search */}
        <div>
          <div className="filter-label">REF. NO / ID
          </div>
          <Input
            value={filterRef}
            onChange={e => setFilterRef(e.target.value)}
            placeholder="Search..."
            style={{ width: 160, borderRadius: 7 }}
          />
        </div>

        <Space>
          <Button type="primary" onClick={handleApply}>Apply</Button>
          <Button onClick={handleReset}>Reset</Button>
        </Space>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="list-surface">
        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          pagination={false}
          size="middle"
          style={{ fontSize: 13 }}
        />
      </div>
    </div>
  );
}

