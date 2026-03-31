import { useMemo, useState } from 'react';
import {
  Avatar, Button, Col, Dropdown, Input,
  Row, Select, Space, Table, Tooltip, message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  DownloadOutlined,
  EyeOutlined,
  FilterOutlined,
  MoreOutlined,
  PauseCircleOutlined,
  PlusOutlined,
  PrinterOutlined,
  ReloadOutlined,
  SearchOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import type { SeparationRequest, SepStatus, EmpStatus, SepMode } from '../types/separation.types';
import { NewSeparationModal } from '../components/NewSeparationModal';
import { useSeparationStore } from '../store/separationStore';
import { SeparationDetailModal, type SeparationDetailModalMode } from '@/features/offboarding/components/SeparationDetailModal';
import { getSeparationTimeline } from '@/features/offboarding/components/separationDetailUtils';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function colHead(label: string) {
  return (
    <span style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.05em' }}>
      {label}
    </span>
  );
}

const AVATAR_COLORS = [
  '#0d9488', '#3b82f6', '#f59e0b', '#8b5cf6',
  '#10b981', '#64748b', '#ef4444', '#ec4899',
];
function avatarColor(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_CFG: Record<SepStatus, { bg: string; text: string; dot: string }> = {
  'Pending':     { bg: '#fffbeb', text: '#d97706', dot: '#f59e0b' },
  'In Progress': { bg: '#eff6ff', text: '#2563eb', dot: '#3b82f6' },
  'Completed':   { bg: '#f0fdf4', text: '#059669', dot: '#22c55e' },
  'On Hold':     { bg: '#f9fafb', text: '#6b7280', dot: '#9ca3af' },
  'Cancelled':   { bg: '#fef2f2', text: '#dc2626', dot: '#ef4444' },
  'Rejected':    { bg: '#fef2f2', text: '#b91c1c', dot: '#ef4444' },
};

function StatusBadge({ status }: { status: SepStatus }) {
  const c = STATUS_CFG[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 10px', borderRadius: 20,
      fontSize: 12, fontWeight: 600,
      color: c.text, background: c.bg, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

// ─── Employment status badge ──────────────────────────────────────────────────
const EMP_CFG: Record<EmpStatus, { bg: string; text: string; dot: string }> = {
  Permanent:    { bg: '#f0fdf4', text: '#059669', dot: '#22c55e' },
  Contractual:  { bg: '#eff6ff', text: '#2563eb', dot: '#3b82f6' },
  Probationary: { bg: '#fffbeb', text: '#d97706', dot: '#f59e0b' },
  Intern:       { bg: '#faf5ff', text: '#7c3aed', dot: '#a78bfa' },
};

function EmpStatusBadge({ status }: { status: EmpStatus }) {
  const c = EMP_CFG[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 10px', borderRadius: 20,
      fontSize: 12, fontWeight: 600,
      color: c.text, background: c.bg, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

// ─── Mode tag ─────────────────────────────────────────────────────────────────
function ModeTag({ mode }: { mode: SepMode }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px', borderRadius: 6,
      fontSize: 12, fontWeight: 500,
      color: '#374151', background: '#f9fafb',
      border: '1px solid #e5e7eb', whiteSpace: 'nowrap',
    }}>
      {mode}
    </span>
  );
}

// ─── Status tab config ────────────────────────────────────────────────────────
const STATUS_TABS: { key: SepStatus | 'all'; label: string }[] = [
  { key: 'all',         label: 'All'         },
  { key: 'Pending',     label: 'Pending'     },
  { key: 'In Progress', label: 'In Progress' },
  { key: 'Completed',   label: 'Completed'   },
  { key: 'On Hold',     label: 'On Hold'     },
  { key: 'Cancelled',   label: 'Cancelled'   },
  { key: 'Rejected',    label: 'Rejected'    },
];

function formatTimelineTimestamp() {
  return new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function applyNoticeTimelineUpdate(record: SeparationRequest, noticeUpdate?: { noticePeriod: number; lastWorkingDay: string }) {
  const effectiveNoticePeriod = record.noticePeriodOverride ?? record.noticePeriod;
  const effectiveLastWorkingDay = record.dateOfSeparationOverride ?? record.dateOfSeparation;

  if (!noticeUpdate) {
    return {
      activityTimeline: [...getSeparationTimeline(record)],
      dateOfSeparationOverride: record.dateOfSeparationOverride,
      noticePeriodOverride: record.noticePeriodOverride,
      wasChanged: false,
    };
  }

  const noticeChanged = noticeUpdate.noticePeriod !== effectiveNoticePeriod;
  const timelineChanged = noticeUpdate.lastWorkingDay !== effectiveLastWorkingDay;

  if (!noticeChanged && !timelineChanged) {
    return {
      activityTimeline: [...getSeparationTimeline(record)],
      dateOfSeparationOverride: record.dateOfSeparationOverride,
      noticePeriodOverride: record.noticePeriodOverride,
      wasChanged: false,
    };
  }

  return {
    activityTimeline: [
      ...getSeparationTimeline(record),
      { action: 'Notice period / timeline updated', date: formatTimelineTimestamp(), by: 'HR Admin' },
    ],
    dateOfSeparationOverride: noticeUpdate.lastWorkingDay !== record.dateOfSeparation ? noticeUpdate.lastWorkingDay : undefined,
    noticePeriodOverride: noticeUpdate.noticePeriod !== record.noticePeriod ? noticeUpdate.noticePeriod : undefined,
    wasChanged: true,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
type Filters = { search: string; dept: string; emp: string; mode: string };
const EMPTY_FILTERS: Filters = { search: '', dept: '', emp: '', mode: '' };

export default function SeparationRequestsPage() {
  const requests = useSeparationStore((s) => s.requests);
  const updateRequest = useSeparationStore((s) => s.updateRequest);

  const [draft,   setDraft]   = useState<Filters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);
  const [activeTab, setActiveTab] = useState<SepStatus | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [detailState, setDetailState] = useState<{ id: string; mode: SeparationDetailModalMode } | null>(null);
  const [newModalOpen, setNewModalOpen] = useState(false);

  const detailRecord = detailState ? requests.find((request) => request.id === detailState.id) ?? null : null;

  const handleApply = () => setApplied(draft);

  const handleReset = () => {
    setDraft(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setActiveTab('all');
  };

  // ── Status counts (across applied filters, not tab) ─────────────────────────
  const counts = useMemo(() => {
    const base = requests.filter(r => {
      if (applied.search) {
        const q = applied.search.toLowerCase();
        if (!r.empName.toLowerCase().includes(q) && !r.empId.toLowerCase().includes(q)) return false;
      }
      if (applied.dept && r.department       !== applied.dept) return false;
      if (applied.emp  && r.employmentStatus !== applied.emp)  return false;
      if (applied.mode && r.modeOfSeparation !== applied.mode) return false;
      return true;
    });
    const map: Record<string, number> = { all: base.length };
    for (const r of base) map[r.status] = (map[r.status] ?? 0) + 1;
    return map;
  }, [requests, applied]);

  // ── Filtered rows ───────────────────────────────────────────────────────────
  const data = useMemo(() => {
    return requests.filter(r => {
      if (activeTab !== 'all' && r.status !== activeTab) return false;
      if (applied.search) {
        const q = applied.search.toLowerCase();
        if (!r.empName.toLowerCase().includes(q) && !r.empId.toLowerCase().includes(q)) return false;
      }
      if (applied.dept && r.department       !== applied.dept) return false;
      if (applied.emp  && r.employmentStatus !== applied.emp)  return false;
      if (applied.mode && r.modeOfSeparation !== applied.mode) return false;
      return true;
    });
  }, [requests, activeTab, applied]);

  // ── Approve / Reject confirm ────────────────────────────────────────────────
  const handleSaveNoticeTimeline = (record: SeparationRequest, noticeUpdate: { noticePeriod: number; lastWorkingDay: string }) => {
    const updates = applyNoticeTimelineUpdate(record, noticeUpdate);
    if (!updates.wasChanged) {
      return;
    }

    updateRequest(record.id, {
      activityTimeline: updates.activityTimeline,
      dateOfSeparationOverride: updates.dateOfSeparationOverride,
      noticePeriodOverride: updates.noticePeriodOverride,
    });
    message.success('Notice period and last working day updated.');
  };

  const handleActionConfirm = (
    record: SeparationRequest,
    action: 'Approved' | 'Rejected',
    remarks: string,
    noticeUpdate?: { noticePeriod: number; lastWorkingDay: string },
  ) => {
    const updates = applyNoticeTimelineUpdate(record, noticeUpdate);
    const decisionTimeline = action === 'Approved'
      ? [
          ...updates.activityTimeline,
          { action: 'Request approved for offboarding workflow', date: formatTimelineTimestamp(), by: 'HR Admin' },
          { action: 'Handover and final settlement forms shared', date: formatTimelineTimestamp(), by: 'HR Admin' },
        ]
      : [
          ...updates.activityTimeline,
          { action: 'Request rejected', date: formatTimelineTimestamp(), by: 'HR Admin' },
        ];

    updateRequest(record.id, {
      activityTimeline: decisionTimeline,
      dateOfSeparationOverride: updates.dateOfSeparationOverride,
      noticePeriodOverride: updates.noticePeriodOverride,
      workflowStage: action === 'Approved' ? 'Under Review' : record.workflowStage,
      rejectionRemarks: action === 'Rejected' ? remarks : undefined,
      status: action === 'Approved' ? 'In Progress' : 'Rejected',
    });
    setDetailState({ id: record.id, mode: 'view' });
    if (action === 'Approved') message.success('Request approved and moved to offboarding workflow.');
    else message.error('Request rejected.');
  };

  const handleHold = (r: SeparationRequest) => {
    updateRequest(r.id, {
      activityTimeline: [
        ...getSeparationTimeline(r),
        { action: 'Request placed on hold', date: formatTimelineTimestamp(), by: 'HR Admin' },
      ],
      status: 'On Hold',
    });
    message.warning(`${r.empName}'s request placed on hold.`);
  };

  const openDetail = (record: SeparationRequest, mode: SeparationDetailModalMode = 'view') => {
    setDetailState({ id: record.id, mode });
  };

  // ── Columns ─────────────────────────────────────────────────────────────────
  const columns: ColumnsType<SeparationRequest> = [
    {
      title: colHead('EMPLOYEE'),
      key: 'employee',
      fixed: 'left',
      width: 210,
      render: (_, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar size={34} style={{ background: avatarColor(r.empName), fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
            {initials(r.empName)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>{r.empName}</div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{r.empId}</div>
          </div>
        </div>
      ),
    },
    {
      title: colHead('DEPARTMENT'),
      dataIndex: 'department',
      key: 'department',
      width: 120,
      render: v => <span style={{ fontSize: 13, color: '#374151' }}>{v}</span>,
    },
    {
      title: colHead('SECTION'),
      dataIndex: 'section',
      key: 'section',
      width: 150,
      render: v => <span style={{ fontSize: 13, color: '#374151' }}>{v}</span>,
    },
    {
      title: colHead('DESIGNATION'),
      dataIndex: 'designation',
      key: 'designation',
      width: 170,
      render: v => <span style={{ fontSize: 13, color: '#374151' }}>{v}</span>,
    },
    {
      title: colHead('DATE OF JOINING'),
      dataIndex: 'dateOfJoining',
      key: 'dateOfJoining',
      width: 130,
      sorter: (a, b) => a.dateOfJoining.localeCompare(b.dateOfJoining),
      render: v => <span style={{ fontSize: 13, color: '#4b5563' }}>{v}</span>,
    },
    {
      title: colHead('RESIGNATION SUBMISSION DATE'),
      dataIndex: 'resignationSubmissionDate',
      key: 'resignationSubmissionDate',
      width: 200,
      render: (v: string) => {
        const [date, time] = v.split('; ');
        return (
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{date}</div>
            {time && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{time}</div>}
          </div>
        );
      },
    },
    {
      title: colHead('DATE OF SEPARATION (EFFECTIVE DATE)'),
      dataIndex: 'dateOfSeparation',
      key: 'dateOfSeparation',
      width: 210,
      render: v => <span style={{ fontSize: 13, color: '#4b5563' }}>{v}</span>,
    },
    {
      title: colHead('NOTICE PERIOD'),
      dataIndex: 'noticePeriod',
      key: 'noticePeriod',
      width: 110,
      align: 'center',
      render: v => <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{v}d</span>,
    },
    {
      title: colHead('EMPLOYMENT STATUS'),
      dataIndex: 'employmentStatus',
      key: 'employmentStatus',
      width: 160,
      render: v => <EmpStatusBadge status={v} />,
    },
    {
      title: colHead('MODE OF SEPARATION'),
      dataIndex: 'modeOfSeparation',
      key: 'modeOfSeparation',
      width: 170,
      render: v => <ModeTag mode={v} />,
    },
    {
      title: colHead('STATUS'),
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: v => <StatusBadge status={v} />,
    },
    {
      title: colHead('LINE MANAGER'),
      dataIndex: 'lineManager',
      key: 'lineManager',
      width: 160,
      render: (v: { name: string; id: string }) => (
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{v.name}</div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{v.id}</div>
        </div>
      ),
    },
    {
      title: colHead('REMARKS'),
      dataIndex: 'remarks',
      key: 'remarks',
      width: 200,
      render: v =>
        v ? (
          <Tooltip title={v}>
            <span style={{
              fontSize: 12, color: '#6b7280',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {v}
            </span>
          </Tooltip>
        ) : (
          <span style={{ fontSize: 12, color: '#d1d5db' }}>—</span>
        ),
    },
    {
      title: colHead('ACTION'),
      key: 'action',
      fixed: 'right',
      width: 60,
      align: 'center',
      render: (_, r) => {
        const isTerminal = r.status === 'Completed' || r.status === 'Rejected' || r.status === 'Cancelled';
        return (
          <Dropdown
            trigger={['click']}
            placement="bottomRight"
            menu={{
              style: { borderRadius: 8, minWidth: 210 },
              items: [
                {
                  key: 'view',
                  icon: <EyeOutlined />,
                  label: 'View Details',
                  onClick: () => openDetail(r, 'view'),
                },
                { type: 'divider' },
                {
                  key: 'approve-reject',
                  icon: <SwapOutlined style={{ color: '#0f766e' }} />,
                  label: <span style={{ color: '#0f766e', fontWeight: 600 }}>Approve / Reject</span>,
                  disabled: r.status !== 'Pending',
                  onClick: () => openDetail(r, 'decision'),
                },
                {
                  key: 'hold',
                  icon: <PauseCircleOutlined style={{ color: '#d97706' }} />,
                  label: <span style={{ color: '#d97706' }}>Hold</span>,
                  disabled: r.status === 'On Hold' || isTerminal,
                  onClick: () => handleHold(r),
                },
                { type: 'divider' },
                {
                  key: 'print-handover',
                  icon: <PrinterOutlined />,
                  label: 'View — Handover Form',
                  onClick: () => openDetail(r, 'view'),
                },
                {
                  key: 'print-settlement',
                  icon: <PrinterOutlined />,
                  label: 'View — Final Settlement',
                  onClick: () => openDetail(r, 'view'),
                },
              ],
            }}
          >
            <Button
              type="text"
              size="small"
              icon={<MoreOutlined style={{ fontSize: 18 }} />}
              style={{
                color: '#9ca3af', borderRadius: 6,
                width: 32, height: 32,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 0,
              }}
            />
          </Dropdown>
        );
      },
    },
  ];

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="page-shell">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="page-header-row">
        <div>
          <h1>Separation Requests</h1>
          <p>Manage and track all employee separation cases &middot; {requests.length} total</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setNewModalOpen(true)}
        >
          New Request
        </Button>
      </div>

      {/* ── Filter bar ───────────────────────────────────────────────────── */}
      <div className="filter-bar">
        <div>
          <div className="filter-label">SEARCH</div>
          <Input
            prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
            placeholder="Search by Employee Name, ID..."
            value={draft.search}
            onChange={e => setDraft(p => ({ ...p, search: e.target.value }))}
            style={{ width: 300 }}
            allowClear
          />
        </div>
        <Space style={{ paddingTop: 20 }}>
          <Button type="primary" icon={<SearchOutlined />} onClick={handleApply}>Apply</Button>
          <Button
            icon={<FilterOutlined />}
            onClick={() => setShowFilters(v => !v)}
            style={showFilters ? { borderColor: '#94a3b8', color: '#334155' } : {}}
          >
            Filters
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>Reset</Button>
        </Space>
      </div>

      {/* ── Advanced filter panel ─────────────────────────────────────────── */}
      {showFilters && (
        <div style={{
          padding: '16px 20px',
          background: '#f8fafc',
          border: '1px solid #e8edf3',
          borderLeft: '3px solid #cbd5e1',
          borderRadius: '0 0 8px 8px',
          marginTop: -8,
          marginBottom: 16,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <Space size={8} align="center">
              <FilterOutlined style={{ color: '#64748b' }} />
              <span style={{ fontWeight: 700, fontSize: 12, letterSpacing: '0.07em', color: '#374151', textTransform: 'uppercase' }}>
                Advanced Filtering
              </span>
            </Space>
            <Button type="link" size="small" onClick={handleReset} icon={<ReloadOutlined />} style={{ color: '#64748b', padding: 0, fontSize: 12 }}>
              Reset All Filters
            </Button>
          </div>
          <Row gutter={[12, 12]} align="bottom">
            <Col flex="1 1 160px">
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: '#6b7280', marginBottom: 6, textTransform: 'uppercase' }}>Department</div>
              <Select
                placeholder="All Departments"
                style={{ width: '100%' }}
                value={draft.dept || undefined}
                onChange={v => setDraft(p => ({ ...p, dept: v ?? '' }))}
                allowClear
                options={['Engineering', 'Marketing', 'Finance', 'Sales', 'HR', 'Operations'].map(v => ({ label: v, value: v }))}
              />
            </Col>
            <Col flex="1 1 150px">
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: '#6b7280', marginBottom: 6, textTransform: 'uppercase' }}>Employment Status</div>
              <Select
                placeholder="All"
                style={{ width: '100%' }}
                value={draft.emp || undefined}
                onChange={v => setDraft(p => ({ ...p, emp: v ?? '' }))}
                allowClear
                options={(['Permanent', 'Contractual', 'Probationary', 'Intern'] as EmpStatus[]).map(v => ({ label: v, value: v }))}
              />
            </Col>
            <Col flex="1 1 180px">
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: '#6b7280', marginBottom: 6, textTransform: 'uppercase' }}>Mode of Separation</div>
              <Select
                placeholder="All Modes"
                style={{ width: '100%' }}
                value={draft.mode || undefined}
                onChange={v => setDraft(p => ({ ...p, mode: v ?? '' }))}
                allowClear
                options={(['Resignation', 'Mutual Agreement', 'End of Contract', 'Termination', 'Retirement', 'Retrenchment'] as SepMode[]).map(v => ({ label: v, value: v }))}
              />
            </Col>
            <Col flex="0 0 auto">
              <Space>
                <Button type="primary" onClick={handleApply} style={{ height: 34, fontWeight: 600 }}>Apply</Button>
                <Button onClick={() => setShowFilters(false)} style={{ height: 34 }}>Close Panel</Button>
                <Button icon={<DownloadOutlined />} onClick={() => message.info('Export coming soon.')} style={{ height: 34 }}>Export</Button>
              </Space>
            </Col>
          </Row>
        </div>
      )}

      {/* ── Status tabs ───────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {STATUS_TABS.map(tab => {
          const count = counts[tab.key === 'all' ? 'all' : tab.key] ?? 0;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 10,
                border: isActive ? '1.5px solid #0f766e' : '1.5px solid #E5E7EB',
                background: isActive ? '#f0fdfa' : '#ffffff',
                color: isActive ? '#0f766e' : '#374151',
                fontWeight: isActive ? 700 : 500,
                fontSize: 13, fontFamily: 'inherit', cursor: 'pointer',
                transition: 'border-color 0.15s, background 0.15s, color 0.15s',
              }}
            >
              {tab.label}
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                minWidth: 20, height: 20, borderRadius: 10,
                fontSize: 11, fontWeight: 700, padding: '0 5px',
                background: isActive ? '#0f766e' : '#e5e7eb',
                color: isActive ? '#ffffff' : '#6b7280',
              }}>
                {count}
              </span>
            </button>
          );
        })}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#9ca3af' }}>
          {data.length} result{data.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="list-surface">
        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          rowSelection={{
            selectedRowKeys: selectedKeys,
            onChange: keys => setSelectedKeys(keys as string[]),
          }}
          pagination={false}
          size="middle"
          scroll={{ x: 2100 }}
          style={{ fontSize: 13 }}
        />
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '10px 16px', borderTop: '1px solid #f3f4f6',
          fontSize: 12, color: '#6b7280',
        }}>
          <span>Showing {data.length} of {requests.length} requests</span>
          <span>{selectedKeys.length} selected</span>
        </div>
      </div>

      <SeparationDetailModal
        record={detailRecord}
        mode={detailState?.mode ?? 'view'}
        title="Separation request details"
        onClose={() => setDetailState(null)}
        onDecision={detailRecord ? (action, remarks, noticeUpdate) => handleActionConfirm(detailRecord, action, remarks, noticeUpdate) : undefined}
        onSaveNoticeTimeline={detailRecord ? (noticeUpdate) => handleSaveNoticeTimeline(detailRecord, noticeUpdate) : undefined}
      />

      {/* ── New Separation Request modal ──────────────────────────────────── */}
      <NewSeparationModal
        open={newModalOpen}
        onClose={() => setNewModalOpen(false)}
        onSubmit={() => setNewModalOpen(false)}
      />
    </div>
  );
}
