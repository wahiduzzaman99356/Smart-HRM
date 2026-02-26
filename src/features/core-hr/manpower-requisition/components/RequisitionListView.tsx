/**
 * RequisitionListView
 * Filter bar + table of all manpower requisition requests.
 * Matches the aesthetic of HeadcountListView.
 */

import { useMemo, useState } from 'react';
import {
  Button, Table, Select, Input, Dropdown, DatePicker, Space, Drawer, Radio,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, DownOutlined, FilterOutlined } from '@ant-design/icons';
import type { RangePickerProps } from 'antd/es/date-picker';
import dayjs from 'dayjs';
import type {
  RequisitionFilters,
  RequisitionRequest,
  RequisitionStatus,
} from '../types/requisition.types';
import { EMPTY_FILTERS } from '../types/requisition.types';

const { RangePicker } = DatePicker;
type DateRange = RangePickerProps['value'];

// ─── Drawer label style ───────────────────────────────────────────────────────
const DL: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, color: '#3b82f6', letterSpacing: '0.06em', marginBottom: 6,
};

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_PROPS: Record<RequisitionStatus, { color: string; bg: string; border: string }> = {
  Draft:    { color: '#6b7280', bg: '#f3f4f6', border: '#d1d5db' },
  Pending:  { color: '#d97706', bg: '#fffbeb', border: '#fcd34d' },
  Approved: { color: '#059669', bg: '#ecfdf5', border: '#6ee7b7' },
  Rejected: { color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
};

function StatusBadge({ status }: { status: RequisitionStatus }) {
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
      whiteSpace: 'nowrap',
    }}>
      {status}
    </span>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  requests:        RequisitionRequest[];
  onAddNew:        () => void;
  onViewRequest:   (request: RequisitionRequest) => void;
  onTakeAction:    (request: RequisitionRequest) => void;
  onSubmitRequest: (id: string) => void;
  onViewWorkflow:  (request: RequisitionRequest) => void;
  onViewHistory:   (request: RequisitionRequest) => void;
  onStatusChange:  (id: string, status: RequisitionStatus) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function RequisitionListView({
  requests,
  onAddNew,
  onViewRequest,
  onTakeAction,
  onSubmitRequest,
  onViewWorkflow,
  onViewHistory,
}: Props) {

  // ── Top filter state ──────────────────────────────────────────────────────────
  const [dateRange,    setDateRange]    = useState<DateRange>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRef,    setFilterRef]    = useState('');

  const [applied, setApplied] = useState<{
    dateRange: DateRange; status: string; ref: string;
  }>({ dateRange: null, status: '', ref: '' });

  const handleApply = () =>
    setApplied({ dateRange, status: filterStatus, ref: filterRef });

  const handleReset = () => {
    setDateRange(null); setFilterStatus(''); setFilterRef('');
    setApplied({ dateRange: null, status: '', ref: '' });
  };

  // ── Advanced drawer filter state ──────────────────────────────────────────────
  const [drawerOpen,     setDrawerOpen]     = useState(false);
  const [drawerFilters,  setDrawerFilters]  = useState<RequisitionFilters>(EMPTY_FILTERS);
  const [appliedDrawer,  setAppliedDrawer]  = useState<RequisitionFilters>(EMPTY_FILTERS);

  const applyDrawer = () => {
    setAppliedDrawer(drawerFilters);
    setDrawerOpen(false);
  };

  const resetDrawer = () => {
    setDrawerFilters(EMPTY_FILTERS);
    setAppliedDrawer(EMPTY_FILTERS);
    setDrawerOpen(false);
  };

  // ── Filtered rows ─────────────────────────────────────────────────────────────
  const data = useMemo(() => {
    return requests.filter(r => {
      if (applied.status && r.status !== applied.status) return false;
      if (applied.ref) {
        const q = applied.ref.toLowerCase();
        if (!r.id.toLowerCase().includes(q) && !r.refNo.toLowerCase().includes(q)) return false;
      }
      if (applied.dateRange && applied.dateRange[0] && applied.dateRange[1]) {
        const d = dayjs(r.initiateDate, 'DD MMM YYYY', true);
        if (!d.isValid() || d.isBefore(applied.dateRange[0], 'day') || d.isAfter(applied.dateRange[1], 'day')) return false;
      }
      if (appliedDrawer.typeOfRequisition && !r.formData.typeOfRequisition.includes(appliedDrawer.typeOfRequisition)) return false;
      if (appliedDrawer.employmentType && r.formData.employmentType !== appliedDrawer.employmentType) return false;
      if (appliedDrawer.department && !r.department.toLowerCase().includes(appliedDrawer.department.toLowerCase())) return false;
      if (appliedDrawer.designation && !r.designation.toLowerCase().includes(appliedDrawer.designation.toLowerCase())) return false;
      if (appliedDrawer.gender && r.formData.gender !== appliedDrawer.gender) return false;
      if (appliedDrawer.workLocation && r.formData.workLocation !== appliedDrawer.workLocation) return false;
      return true;
    });
  }, [requests, applied, appliedDrawer]);

  // ── Columns ───────────────────────────────────────────────────────────────────
  const columns: ColumnsType<RequisitionRequest> = [
    {
      title: <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, letterSpacing: '0.04em' }}>INITIATION DETAILS</span>,
      key: 'details',
      render: (_, r) => (
        <div>
          <div
            onClick={() => onViewRequest(r)}
            style={{ fontWeight: 700, fontSize: 13, color: '#3b82f6', textDecoration: 'underline', textDecorationStyle: 'dotted', cursor: 'pointer', display: 'inline-block' }}
          >
            {r.id}
          </div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
            MRF Initiation &bull; {r.initiateDate}
          </div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>
            Ref: {r.refNo}
          </div>
        </div>
      ),
    },
    {
      title: <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, letterSpacing: '0.04em' }}>DEPT / DESIGNATION</span>,
      key: 'dept',
      render: (_, r) => (
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{r.department}</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{r.designation}</div>
        </div>
      ),
    },
    {
      title: <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, letterSpacing: '0.04em' }}>REQ.</span>,
      key: 'requested',
      align: 'center',
      width: 80,
      render: (_, r) => (
        <span style={{ fontSize: 14, fontWeight: 700, color: '#374151' }}>{r.requested}</span>
      ),
    },
    {
      title: <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, letterSpacing: '0.04em' }}>APPR.</span>,
      key: 'approved',
      align: 'center',
      width: 80,
      render: (_, r) => (
        r.approved > 0
          ? <span style={{ fontSize: 14, fontWeight: 700, color: '#3b82f6' }}>{r.approved}</span>
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
              { key: 'view',     label: 'View Details',    onClick: () => onViewRequest(r) },
              {
                key: 'submit',
                label: 'Submit Request',
                disabled: r.status !== 'Draft',
                onClick: () => onSubmitRequest(r.id),
              },
              { key: 'take-action', label: 'Approve/Reject', onClick: () => onTakeAction(r) },
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
          <h1 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>
            Manpower Requisition
          </h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>
            Manage and track manpower requisition requests
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAddNew}
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

        {/* Status filter */}
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

        {/* MRF / Ref search */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#3b82f6', letterSpacing: '0.06em', marginBottom: 5 }}>
            MRF NO / REF. ID
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
          <Button
            icon={<FilterOutlined />}
            onClick={() => setDrawerOpen(true)}
            style={{ borderRadius: 7 }}
          >
            Filter
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

      {/* ── Advanced Filter Drawer ─────────────────────────────────────────── */}
      <Drawer
        title={<span style={{ fontWeight: 700, fontSize: 13, letterSpacing: '0.04em', color: '#111827' }}>Advanced Filters</span>}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={360}
        styles={{ body: { paddingTop: 10, paddingBottom: 16 } }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Type of Requisition */}
          <div>
            <div style={DL}>TYPE OF REQUISITION</div>
            <Radio.Group
              value={drawerFilters.typeOfRequisition}
              onChange={e => setDrawerFilters(prev => ({ ...prev, typeOfRequisition: e.target.value }))}
            >
              <Space>
                <Radio value="New Recruitment">New Recruitment</Radio>
                <Radio value="Replacement">Replacement</Radio>
              </Space>
            </Radio.Group>
          </div>

          {/* Employment Type */}
          <div>
            <div style={DL}>EMPLOYMENT TYPE</div>
            <Select
              value={drawerFilters.employmentType || undefined}
              onChange={v => setDrawerFilters(prev => ({ ...prev, employmentType: v ?? '' }))}
              placeholder="Select type"
              options={[
                { value: 'Full Time',   label: 'Full Time'   },
                { value: 'Contractual', label: 'Contractual' },
                { value: 'Intern',      label: 'Intern'      },
              ]}
              allowClear
              style={{ width: '100%' }}
            />
          </div>

          {/* Department / Designation */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <div style={DL}>DEPARTMENT</div>
              <Input
                placeholder="Department"
                value={drawerFilters.department}
                onChange={e => setDrawerFilters(prev => ({ ...prev, department: e.target.value }))}
                style={{ borderRadius: 7 }}
              />
            </div>
            <div>
              <div style={DL}>DESIGNATION</div>
              <Input
                placeholder="Designation"
                value={drawerFilters.designation}
                onChange={e => setDrawerFilters(prev => ({ ...prev, designation: e.target.value }))}
                style={{ borderRadius: 7 }}
              />
            </div>
          </div>

          {/* Gender */}
          <div>
            <div style={DL}>GENDER</div>
            <Select
              value={drawerFilters.gender || undefined}
              onChange={v => setDrawerFilters(prev => ({ ...prev, gender: v ?? '' }))}
              placeholder="Select gender"
              allowClear
              options={[
                { value: 'Male',   label: 'Male'   },
                { value: 'Female', label: 'Female' },
                { value: 'Any',    label: 'Any'    },
              ]}
              style={{ width: '100%' }}
            />
          </div>

          {/* Work Location */}
          <div>
            <div style={DL}>WORK LOCATION</div>
            <Select
              value={drawerFilters.workLocation || undefined}
              onChange={v => setDrawerFilters(prev => ({ ...prev, workLocation: v ?? '' }))}
              placeholder="Select location"
              allowClear
              options={[
                { value: 'Head Office',    label: 'Head Office'    },
                { value: 'Airport Office', label: 'Airport Office' },
                { value: 'Field Office',   label: 'Field Office'   },
              ]}
              style={{ width: '100%' }}
            />
          </div>

          {/* Experience */}
          <div>
            <div style={DL}>EXPERIENCE</div>
            <Select
              value={drawerFilters.experience || undefined}
              onChange={v => setDrawerFilters(prev => ({ ...prev, experience: v ?? '' }))}
              placeholder="Select experience"
              allowClear
              options={[
                { value: 'Fresher',     label: 'Fresher'     },
                { value: 'Experienced', label: 'Experienced' },
              ]}
              style={{ width: '100%' }}
            />
          </div>

          {/* Education */}
          <div>
            <div style={DL}>QUALIFICATION TYPE</div>
            <Select
              value={drawerFilters.education || undefined}
              onChange={v => setDrawerFilters(prev => ({ ...prev, education: v ?? '' }))}
              placeholder="Select qualification"
              allowClear
              options={[
                { value: 'SSC',      label: 'SSC'      },
                { value: 'HSC',      label: 'HSC'      },
                { value: 'Diploma',  label: 'Diploma'  },
                { value: 'Bachelor', label: 'Bachelor' },
                { value: 'Masters',  label: 'Masters'  },
                { value: 'PhD',      label: 'PhD'      },
              ]}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
            <Button type="primary" onClick={applyDrawer} style={{ borderRadius: 7, fontWeight: 600 }}>
              Apply
            </Button>
            <Button onClick={resetDrawer} style={{ borderRadius: 7 }}>
              Reset
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
