/**
 * KPIChangeHistoryModal.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Shows per-employee KPI change request history (submitted, approved, rejected)
 * with full diff detail, review outcomes, and rejection remarks.
 *
 * Uses Ant Design v5 Timeline `items` prop (Timeline.Item is deprecated in v5).
 */

import { useState, useMemo } from 'react';
import {
  Modal, Tag, Typography, Avatar, Timeline, Empty, Select, Divider, Tooltip,
} from 'antd';
import {
  ClockCircleOutlined, CheckCircleOutlined, StopOutlined,
  PlusCircleOutlined, MinusCircleOutlined, EditOutlined,
  UserOutlined, CalendarOutlined, DownOutlined, UpOutlined,
  AimOutlined, SwapRightOutlined,
} from '@ant-design/icons';
import type { KPIChangeRequest, KPIChangeDetail } from '../types/performance.types';

const { Text } = Typography;

const AVATAR_COLORS = [
  '#ef4444', 'var(--color-primary)', '#7c3aed', '#f59e0b', '#ec4899',
  '#0891b2', '#65a30d', '#ea580c', '#6366f1', '#0284c7',
];

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

// ── Status configs ─────────────────────────────────────────────────────────────
const STATUS_CFG = {
  Pending:  { dot: <ClockCircleOutlined style={{ fontSize: 16, color: '#f59e0b' }} />, border: 'rgba(253, 230, 138, 0.4)', tagBg: 'var(--color-status-pending-bg)', tagBorder: 'rgba(253, 230, 138, 0.4)', tagColor: '#92400e',  reviewBg: 'var(--color-status-pending-bg)', reviewBorder: 'rgba(253, 230, 138, 0.4)'  },
  Approved: { dot: <CheckCircleOutlined style={{ fontSize: 16, color: '#16a34a' }} />, border: '#86efac', tagBg: 'var(--color-status-approved-bg)', tagBorder: '#86efac', tagColor: '#15803d',  reviewBg: 'var(--color-status-approved-bg)', reviewBorder: 'var(--color-status-approved-bg)' },
  Rejected: { dot: <StopOutlined        style={{ fontSize: 16, color: '#dc2626' }} />, border: 'var(--color-status-rejected-bg)', tagBg: 'var(--color-status-rejected-bg)', tagBorder: 'var(--color-status-rejected-bg)', tagColor: '#be123c',  reviewBg: 'var(--color-status-rejected-bg)', reviewBorder: 'var(--color-status-rejected-bg)' },
};

const CHANGE_CFG = {
  added:    { icon: <PlusCircleOutlined  />, bg: 'var(--color-status-approved-bg)', border: 'var(--color-status-approved-bg)', color: 'var(--color-status-approved)', label: 'Added'    },
  removed:  { icon: <MinusCircleOutlined />, bg: 'var(--color-status-rejected-bg)', border: 'var(--color-status-rejected-bg)', color: '#be123c', label: 'Removed'  },
  modified: { icon: <EditOutlined        />, bg: 'var(--color-status-pending-bg)', border: 'rgba(253, 230, 138, 0.4)', color: '#d97706', label: 'Modified' },
};

// ── Single change diff row ────────────────────────────────────────────────────
function ChangeDiffRow({ c }: { c: KPIChangeDetail }) {
  const cfg = CHANGE_CFG[c.type];
  return (
    <div
      style={{
        padding: '9px 12px',
        borderRadius: 8,
        marginBottom: 6,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
      }}
    >
      {/* Name row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
        <Tag
          icon={cfg.icon}
          style={{
            background: cfg.bg, borderColor: cfg.border, color: cfg.color,
            borderRadius: 5, fontSize: 10, fontWeight: 700, margin: 0, padding: '0 6px',
          }}
        >
          {cfg.label}
        </Tag>
        <Text strong style={{ fontSize: 12, color: 'var(--color-text-primary)' }}>
          {c.subKPICode} — {c.subKPIName}
        </Text>
      </div>

      {/* Area */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: c.type !== 'removed' ? 6 : 0 }}>
        <AimOutlined style={{ color: 'var(--color-text-disabled)', fontSize: 10 }} />
        <Text style={{ fontSize: 11, color: 'var(--color-text-disabled)' }}>
          {c.mainKPICode} · {c.mainKPIAreaName}
        </Text>
      </div>

      {/* Value diffs */}
      {c.type !== 'removed' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
          {c.newWeight !== undefined && (
            <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: 'var(--color-text-disabled)' }}>Weight:</span>
              {c.type === 'modified' && c.prevWeight !== undefined && (
                <>
                  <span style={{ textDecoration: 'line-through', color: 'var(--color-text-disabled)' }}>{c.prevWeight}%</span>
                  <SwapRightOutlined style={{ color: 'var(--color-text-disabled)', fontSize: 10 }} />
                </>
              )}
              <strong style={{ color: 'var(--color-primary)' }}>{c.newWeight}%</strong>
            </span>
          )}
          {c.newOperator !== undefined && (
            <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: 'var(--color-text-disabled)' }}>Operator:</span>
              {c.type === 'modified' && c.prevOperator !== undefined && (
                <>
                  <span style={{ textDecoration: 'line-through', color: 'var(--color-text-disabled)' }}>{c.prevOperator}</span>
                  <SwapRightOutlined style={{ color: 'var(--color-text-disabled)', fontSize: 10 }} />
                </>
              )}
              <strong style={{ color: '#0284c7' }}>{c.newOperator}</strong>
            </span>
          )}
          {c.newTargetValue !== undefined && (
            <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: 'var(--color-text-disabled)' }}>Target:</span>
              {c.type === 'modified' && c.prevTargetValue !== undefined && (
                <>
                  <span style={{ textDecoration: 'line-through', color: 'var(--color-text-disabled)' }}>{c.prevTargetValue}</span>
                  <SwapRightOutlined style={{ color: 'var(--color-text-disabled)', fontSize: 10 }} />
                </>
              )}
              <strong style={{ color: '#7c3aed' }}>{c.newTargetValue}</strong>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ── History entry card ────────────────────────────────────────────────────────
function HistoryEntryCard({ req }: { req: KPIChangeRequest }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CFG[req.status];

  const addedCount    = req.changes.filter(c => c.type === 'added').length;
  const removedCount  = req.changes.filter(c => c.type === 'removed').length;
  const modifiedCount = req.changes.filter(c => c.type === 'modified').length;

  return (
    <div
      style={{
        background: 'var(--color-bg-surface)',
        border: `1.5px solid ${cfg.border}`,
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 2,
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      {/* ── Card header ─────────────────────────────────────────────────── */}
      <div style={{ padding: '12px 14px' }}>

        {/* Status + submitted date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
          <Tag
            style={{
              borderRadius: 6, fontWeight: 700, fontSize: 11, margin: 0,
              background: cfg.tagBg, borderColor: cfg.tagBorder, color: cfg.tagColor,
            }}
          >
            {req.status === 'Pending' && <ClockCircleOutlined style={{ marginRight: 4 }} />}
            {req.status === 'Approved' && <CheckCircleOutlined style={{ marginRight: 4 }} />}
            {req.status === 'Rejected' && <StopOutlined style={{ marginRight: 4 }} />}
            {req.status}
          </Tag>
          <Text style={{ fontSize: 11, color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <CalendarOutlined style={{ fontSize: 10 }} />
            Submitted: {new Date(req.requestedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </Text>
          <Text style={{ fontSize: 11, color: 'var(--color-text-disabled)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <UserOutlined style={{ fontSize: 10 }} />
            By: {req.requestedBy}
          </Text>
        </div>

        {/* Change summary chips */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          {addedCount > 0 && (
            <Tooltip title={`${addedCount} sub KPI(s) added`}>
              <Tag
                icon={<PlusCircleOutlined />}
                style={{ background: 'var(--color-status-approved-bg)', borderColor: 'var(--color-status-approved-bg)', color: 'var(--color-status-approved)', borderRadius: 6, fontSize: 11, fontWeight: 600, margin: 0 }}
              >
                {addedCount} Added
              </Tag>
            </Tooltip>
          )}
          {removedCount > 0 && (
            <Tooltip title={`${removedCount} sub KPI(s) removed`}>
              <Tag
                icon={<MinusCircleOutlined />}
                style={{ background: 'var(--color-status-rejected-bg)', borderColor: 'var(--color-status-rejected-bg)', color: '#be123c', borderRadius: 6, fontSize: 11, fontWeight: 600, margin: 0 }}
              >
                {removedCount} Removed
              </Tag>
            </Tooltip>
          )}
          {modifiedCount > 0 && (
            <Tooltip title={`${modifiedCount} sub KPI(s) modified`}>
              <Tag
                icon={<EditOutlined />}
                style={{ background: 'var(--color-status-pending-bg)', borderColor: 'rgba(253, 230, 138, 0.4)', color: '#d97706', borderRadius: 6, fontSize: 11, fontWeight: 600, margin: 0 }}
              >
                {modifiedCount} Modified
              </Tag>
            </Tooltip>
          )}
          <Text style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--color-text-disabled)' }}>
            {req.changes.length} change{req.changes.length !== 1 ? 's' : ''} total
          </Text>
        </div>

        {/* Toggle */}
        <div
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: 12, color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600,
            padding: '3px 8px', borderRadius: 6,
            background: expanded ? 'var(--color-primary-tint)' : 'transparent',
            border: `1px solid ${expanded ? 'var(--color-border)' : 'transparent'}`,
            transition: 'all 0.15s',
          }}
          onClick={() => setExpanded(e => !e)}
        >
          {expanded ? <UpOutlined style={{ fontSize: 10 }} /> : <DownOutlined style={{ fontSize: 10 }} />}
          {expanded ? 'Hide details' : 'View change details'}
        </div>
      </div>

      {/* ── Expanded diff ────────────────────────────────────────────────── */}
      {expanded && (
        <div style={{ padding: '0 14px 14px', borderTop: '1px solid var(--color-border)' }}>
          <Text
            style={{
              fontSize: 10, fontWeight: 700, color: 'var(--color-text-tertiary)',
              letterSpacing: '0.07em', textTransform: 'uppercase',
              display: 'block', margin: '12px 0 8px',
            }}
          >
            Changed Sub KPIs ({req.changes.length})
          </Text>

          {req.changes.map((change, idx) => (
            <ChangeDiffRow key={idx} c={change} />
          ))}

          {/* ── Review outcome (non-pending) ─────────────────────────── */}
          {req.status !== 'Pending' && (
            <div
              style={{
                marginTop: 10, padding: '10px 14px',
                background: cfg.reviewBg,
                border: `1px solid ${cfg.reviewBorder}`,
                borderRadius: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <div
                  style={{
                    width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                    background: req.status === 'Approved'
                      ? 'linear-gradient(135deg, #16a34a 0%, #059669 100%)'
                      : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {req.status === 'Approved'
                    ? <CheckCircleOutlined style={{ color: '#fff', fontSize: 13 }} />
                    : <StopOutlined style={{ color: '#fff', fontSize: 13 }} />
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'block', fontWeight: 600 }}>
                    {req.status === 'Approved' ? 'Approved' : 'Rejected'} by {req.reviewedBy ?? 'HR Manager'}
                  </Text>
                  {req.reviewedAt && (
                    <Text style={{ fontSize: 11, color: 'var(--color-text-disabled)', display: 'block' }}>
                      <CalendarOutlined style={{ marginRight: 4 }} />
                      {new Date(req.reviewedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  )}
                  {req.remarks && (
                    <div
                      style={{
                        marginTop: 6, padding: '6px 10px',
                        background: req.status === 'Rejected' ? 'var(--color-status-rejected-bg)' : 'var(--color-status-approved-bg)',
                        borderLeft: `3px solid ${req.status === 'Rejected' ? '#dc2626' : '#16a34a'}`,
                        borderRadius: '0 6px 6px 0',
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 2 }}>
                        Remarks:
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: req.status === 'Rejected' ? '#be123c' : '#15803d',
                          fontStyle: 'italic',
                        }}
                      >
                        "{req.remarks}"
                      </Text>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
interface KPIChangeHistoryModalProps {
  open: boolean;
  onClose: () => void;
  employeeId: string | null;
  requests: KPIChangeRequest[];
}

export default function KPIChangeHistoryModal({
  open, onClose, employeeId, requests,
}: KPIChangeHistoryModalProps) {
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');

  const allEmpRequests = useMemo(() =>
    requests
      .filter(r => r.employeeId === employeeId)
      .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()),
    [requests, employeeId],
  );

  const empRequests = useMemo(() =>
    allEmpRequests.filter(r => filterStatus === 'All' || r.status === filterStatus),
    [allEmpRequests, filterStatus],
  );

  const emp = allEmpRequests[0];

  const pendingCount  = allEmpRequests.filter(r => r.status === 'Pending').length;
  const approvedCount = allEmpRequests.filter(r => r.status === 'Approved').length;
  const rejectedCount = allEmpRequests.filter(r => r.status === 'Rejected').length;

  // ── Build Timeline items (v5 API) ─────────────────────────────────────────
  const timelineItems = empRequests.map(req => ({
    dot: STATUS_CFG[req.status].dot,
    children: <HistoryEntryCard req={req} />,
  }));

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {emp ? (
            <Avatar
              size={38}
              style={{
                background: emp.employeeAvatarColor ?? AVATAR_COLORS[0],
                fontSize: 13, fontWeight: 700, borderRadius: 10, flexShrink: 0,
              }}
            >
              {initials(emp.employeeName)}
            </Avatar>
          ) : (
            <div
              style={{
                width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <UserOutlined style={{ color: '#fff', fontSize: 16 }} />
            </div>
          )}
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
              KPI Change History
            </div>
            {emp && (
              <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 400, marginTop: 1 }}>
                {emp.employeeName} · {emp.employeeDesignation} · {emp.employeeDepartment}
              </div>
            )}
          </div>
        </div>
      }
      footer={null}
      width={660}
      styles={{
        header: {
          background: 'linear-gradient(180deg, #f8fcfc 0%, #f2fbfa 100%)',
          borderBottom: '1px solid var(--color-border)',
          padding: '14px 20px',
        },
        body: { padding: '0', maxHeight: 580, overflowY: 'auto' },
      }}
    >
      {/* ── Summary stats bar ────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex', gap: 0, borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-bg-surface)',
        }}
      >
        {[
          { label: 'Total',    count: allEmpRequests.length, color: 'var(--color-text-secondary)', bg: 'var(--color-bg-subtle)' },
          { label: 'Pending',  count: pendingCount,          color: '#d97706', bg: 'var(--color-status-pending-bg)' },
          { label: 'Approved', count: approvedCount,         color: 'var(--color-status-approved)', bg: 'var(--color-status-approved-bg)' },
          { label: 'Rejected', count: rejectedCount,         color: '#be123c', bg: 'var(--color-status-rejected-bg)' },
        ].map((s, i) => (
          <div
            key={s.label}
            style={{
              flex: 1, padding: '10px 0', textAlign: 'center',
              background: s.bg,
              borderRight: i < 3 ? '1px solid var(--color-border)' : undefined,
              cursor: s.label !== 'Total' ? 'pointer' : undefined,
            }}
            onClick={() => s.label !== 'Total' && setFilterStatus(s.label as typeof filterStatus)}
          >
            <div style={{ fontSize: 18, fontWeight: 800, color: s.color, lineHeight: 1.1 }}>{s.count}</div>
            <div style={{ fontSize: 10, color: 'var(--color-text-disabled)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: 2 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter bar ───────────────────────────────────────────────────── */}
      <div
        style={{
          padding: '10px 20px',
          background: 'var(--color-bg-subtle)',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 12, color: 'var(--color-text-tertiary)', fontWeight: 600 }}>Filter:</Text>
          <Select
            value={filterStatus}
            onChange={v => setFilterStatus(v)}
            size="small"
            style={{ width: 130 }}
            options={[
              { value: 'All',      label: 'All Statuses' },
              { value: 'Pending',  label: 'Pending' },
              { value: 'Approved', label: 'Approved' },
              { value: 'Rejected', label: 'Rejected' },
            ]}
          />
        </div>
        <Text style={{ fontSize: 11, color: 'var(--color-text-disabled)' }}>
          {empRequests.length} record{empRequests.length !== 1 ? 's' : ''}
          {filterStatus !== 'All' ? ` · filtered by "${filterStatus}"` : ''}
        </Text>
      </div>

      {/* ── Timeline / Empty ─────────────────────────────────────────────── */}
      <div style={{ padding: '20px 20px 16px 16px' }}>
        {empRequests.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ padding: '24px 0' }}
            description={
              <Text style={{ color: 'var(--color-text-disabled)', fontSize: 13 }}>
                {filterStatus === 'All'
                  ? 'No KPI change history found for this employee.'
                  : `No ${filterStatus.toLowerCase()} requests found.`}
              </Text>
            }
          />
        ) : (
          <Timeline items={timelineItems} />
        )}
      </div>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      {allEmpRequests.length > 0 && (
        <div
          style={{
            padding: '10px 20px',
            borderTop: '1px solid var(--color-border)',
            background: 'linear-gradient(180deg, #f8fcfc 0%, #fff 100%)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}
        >
          <Text style={{ fontSize: 11, color: 'var(--color-text-disabled)' }}>
            Last activity:&nbsp;
            <strong style={{ color: 'var(--color-text-secondary)' }}>
              {new Date(allEmpRequests[0].requestedAt).toLocaleString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </strong>
          </Text>
          <Divider type="vertical" />
          <Text style={{ fontSize: 11, color: 'var(--color-text-disabled)' }}>
            All times in local timezone
          </Text>
        </div>
      )}
    </Modal>
  );
}
