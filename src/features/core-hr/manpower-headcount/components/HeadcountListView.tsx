/**
 * HeadcountListView
 * Filter bar + table of all headcount requests.
 */

import { useState, useMemo } from 'react';
import {
  Button, Table, Select, Input, Dropdown, DatePicker, Space,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, DownOutlined } from '@ant-design/icons';
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
          <div style={{ fontWeight: 700, fontSize: 13, color: '#3b82f6', textDecoration: 'underline', textDecorationStyle: 'dotted' }}>{r.id}</div>
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
          ? <span style={{ fontSize: 14, fontWeight: 700, color: '#3b82f6' }}>{r.totalApprHC}</span>
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
      title: <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, letterSpacing: '0.04em' }}>ACTIONS</span>,
      key: 'actions',
      align: 'right',
      width: 110,
      render: (_, r) => (
        <Dropdown
          trigger={['click']}
          menu={{
            style: { borderRadius: 8, minWidth: 160 },
            items: [
              {
                key: 'submit',
                label: 'Submit Request',
                disabled: r.status !== 'Draft',
                onClick: () => onSubmit(r.id),
              },
              { key: 'take-action', label: 'Approve / Reject', onClick: () => onTakeAction(r) },
              { type: 'divider' },
              { key: 'workflow', label: 'Approval Workflow', onClick: () => onViewWorkflow(r) },
              { key: 'history',  label: 'Action History',   onClick: () => onViewHistory(r) },
            ],
          }}
        >
          <Button
            size="small"
            style={{
              background: '#1e293b',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 12,
              height: 30,
              padding: '0 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            ACTION <DownOutlined style={{ fontSize: 10 }} />
          </Button>
        </Dropdown>
      ),
    },
  ];

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '24px 28px', height: '100%', overflowY: 'auto', background: '#f9fafb' }}>

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 }}>
            Headcount Management
          </h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>
            Strategic workforce planning &amp; organogram approvals
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onCreate}
          style={{ height: 36, borderRadius: 8, fontWeight: 600, fontSize: 13, paddingInline: 16 }}
        >
          Create New Request
        </Button>
      </div>

      {/* ── Filter bar ────────────────────────────────────────────────────── */}
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 10,
        padding: '16px 20px',
        marginBottom: 20,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 16,
        alignItems: 'flex-end',
      }}>
        {/* Date range */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#3b82f6', letterSpacing: '0.06em', marginBottom: 5 }}>
            DATE RANGE
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
          <div style={{ fontSize: 10, fontWeight: 700, color: '#3b82f6', letterSpacing: '0.06em', marginBottom: 5 }}>
            PLAN YEAR
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
          <div style={{ fontSize: 10, fontWeight: 700, color: '#3b82f6', letterSpacing: '0.06em', marginBottom: 5 }}>
            STATUS FILTER
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
          <div style={{ fontSize: 10, fontWeight: 700, color: '#3b82f6', letterSpacing: '0.06em', marginBottom: 5 }}>
            REF. NO / ID
          </div>
          <Input
            value={filterRef}
            onChange={e => setFilterRef(e.target.value)}
            placeholder="Search..."
            style={{ width: 160, borderRadius: 7 }}
          />
        </div>

        <Space>
          <Button
            type="primary"
            onClick={handleApply}
            style={{ borderRadius: 7, fontWeight: 600 }}
          >
            Apply
          </Button>
          <Button onClick={handleReset} style={{ borderRadius: 7 }}>
            Reset
          </Button>
        </Space>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div style={{
        background: '#fff',
        borderRadius: 10,
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
      }}>
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
