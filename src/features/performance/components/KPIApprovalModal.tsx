/**
 * KPIApprovalModal.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * HR-side approval drawer: shows all pending KPI change requests,
 * lets HR user expand each request to view diffs, then Approve or Reject
 * with optional remarks.
 */

import { useState, useMemo } from 'react';
import {
  Drawer, Button, Tag, Typography, Avatar, Space, Badge,
  Tabs, Input, Select, Empty, Tooltip, Divider, Modal, message,
} from 'antd';
import {
  CheckOutlined, CloseOutlined, EyeOutlined, SearchOutlined,
  PlusCircleOutlined, MinusCircleOutlined, EditOutlined,
  ClockCircleOutlined, CheckCircleOutlined, StopOutlined,
  UserOutlined, TeamOutlined, CalendarOutlined, ReloadOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import type {
  KPIChangeRequest, KPIChangeDetail,
} from '../types/performance.types';

const { Text, Title } = Typography;
const { TextArea } = Input;

// ── Helpers ───────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  '#ef4444', 'var(--color-primary)', '#7c3aed', '#f59e0b', '#ec4899',
  '#0891b2', '#65a30d', '#ea580c', '#6366f1', '#0284c7',
];
function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function ChangeTypeTag({ type }: { type: KPIChangeDetail['type'] }) {
  const map = {
    added:    { bg: 'var(--color-status-approved-bg)', border: 'var(--color-status-approved-bg)', color: 'var(--color-status-approved)', icon: <PlusCircleOutlined />,  label: 'Added'    },
    removed:  { bg: 'var(--color-status-rejected-bg)', border: 'var(--color-status-rejected-bg)', color: '#be123c', icon: <MinusCircleOutlined />, label: 'Removed'  },
    modified: { bg: 'var(--color-status-pending-bg)', border: 'rgba(253, 230, 138, 0.4)', color: '#d97706', icon: <EditOutlined />,        label: 'Modified' },
  }[type];
  return (
    <Tag icon={map.icon} style={{ background: map.bg, borderColor: map.border, color: map.color, borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
      {map.label}
    </Tag>
  );
}

function StatusBadge({ status }: { status: KPIChangeRequest['status'] }) {
  const map = {
    Pending:  { bg: 'var(--color-status-pending-bg)', border: 'rgba(253, 230, 138, 0.4)', color: '#d97706', icon: <ClockCircleOutlined />,  label: 'Pending'  },
    Approved: { bg: 'var(--color-status-approved-bg)', border: 'var(--color-status-approved-bg)', color: 'var(--color-status-approved)', icon: <CheckCircleOutlined />,  label: 'Approved' },
    Rejected: { bg: 'var(--color-status-rejected-bg)', border: 'var(--color-status-rejected-bg)', color: '#be123c', icon: <StopOutlined />,          label: 'Rejected' },
  }[status];
  return (
    <Tag icon={map.icon} style={{ background: map.bg, borderColor: map.border, color: map.color, borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
      {map.label}
    </Tag>
  );
}

// ── Change diff row ───────────────────────────────────────────────────────────
function ChangeDiffRow({ change }: { change: KPIChangeDetail }) {
  return (
    <div
      style={{
        padding: '10px 14px',
        borderRadius: 8,
        marginBottom: 6,
        background: change.type === 'added' ? 'var(--color-status-approved-bg)' : change.type === 'removed' ? 'var(--color-status-rejected-bg)' : 'var(--color-status-pending-bg)',
        border: `1px solid ${change.type === 'added' ? 'var(--color-status-approved-bg)' : change.type === 'removed' ? 'var(--color-status-rejected-bg)' : 'rgba(253, 230, 138, 0.4)'}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <ChangeTypeTag type={change.type} />
        <div style={{ flex: 1 }}>
          <Text strong style={{ fontSize: 13, color: 'var(--color-text-primary)', display: 'block' }}>
            {change.subKPICode} — {change.subKPIName}
          </Text>
          <Text style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
            {change.mainKPICode} · {change.mainKPIAreaName}
          </Text>

          {/* Diff details */}
          {change.type !== 'removed' && (
            <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {/* Weight */}
              {change.newWeight !== undefined && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Text style={{ fontSize: 11, color: 'var(--color-text-disabled)' }}>Weight:</Text>
                  {change.type === 'modified' && change.prevWeight !== undefined && (
                    <>
                      <Text style={{ fontSize: 11, color: 'var(--color-text-disabled)', textDecoration: 'line-through' }}>{change.prevWeight}%</Text>
                      <Text style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>→</Text>
                    </>
                  )}
                  <Text style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)' }}>{change.newWeight}%</Text>
                </div>
              )}
              {/* Operator */}
              {change.newOperator !== undefined && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Text style={{ fontSize: 11, color: 'var(--color-text-disabled)' }}>Operator:</Text>
                  {change.type === 'modified' && change.prevOperator !== undefined && (
                    <>
                      <Text style={{ fontSize: 11, color: 'var(--color-text-disabled)', textDecoration: 'line-through' }}>{change.prevOperator}</Text>
                      <Text style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>→</Text>
                    </>
                  )}
                  <Text style={{ fontSize: 12, fontWeight: 700, color: '#0284c7' }}>{change.newOperator}</Text>
                </div>
              )}
              {/* Target */}
              {change.newTargetValue !== undefined && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Text style={{ fontSize: 11, color: 'var(--color-text-disabled)' }}>Target:</Text>
                  {change.type === 'modified' && change.prevTargetValue !== undefined && (
                    <>
                      <Text style={{ fontSize: 11, color: 'var(--color-text-disabled)', textDecoration: 'line-through' }}>{change.prevTargetValue}</Text>
                      <Text style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>→</Text>
                    </>
                  )}
                  <Text style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed' }}>{change.newTargetValue}</Text>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Request card ──────────────────────────────────────────────────────────────
interface RequestCardProps {
  req: KPIChangeRequest;
  onApprove: (id: string) => void;
  onReject: (id: string, remarks: string) => void;
  isReadOnly?: boolean;
}

function RequestCard({ req, onApprove, onReject, isReadOnly }: RequestCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [remarks, setRemarks] = useState('');

  const addedCount    = req.changes.filter(c => c.type === 'added').length;
  const removedCount  = req.changes.filter(c => c.type === 'removed').length;
  const modifiedCount = req.changes.filter(c => c.type === 'modified').length;

  return (
    <>
      <div
        style={{
          background: 'var(--color-bg-surface)',
          border: `1.5px solid ${req.status === 'Pending' ? 'rgba(253, 230, 138, 0.4)' : req.status === 'Approved' ? 'var(--color-status-approved-bg)' : 'var(--color-status-rejected-bg)'}`,
          borderRadius: 12,
          marginBottom: 12,
          overflow: 'hidden',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}
      >
        {/* Card header */}
        <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar
            size={42}
            style={{
              background: req.employeeAvatarColor ?? AVATAR_COLORS[0],
              fontSize: 13, fontWeight: 700, borderRadius: 10, flexShrink: 0,
            }}
          >
            {initials(req.employeeName)}
          </Avatar>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Text strong style={{ fontSize: 14, color: 'var(--color-text-primary)' }}>{req.employeeName}</Text>
              <StatusBadge status={req.status} />
            </div>
            <Text style={{ fontSize: 11, color: 'var(--color-text-disabled)' }}>
              {req.employeeDesignation} · {req.employeeDepartment} · {req.employeeSection}
            </Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <UserOutlined style={{ fontSize: 10 }} /> {req.requestedBy}
              </span>
              <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <CalendarOutlined style={{ fontSize: 10 }} /> {new Date(req.requestedAt).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Change summary badges */}
          <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
            {addedCount > 0 && (
              <Tooltip title={`${addedCount} Sub KPI(s) added`}>
                <Tag style={{ background: 'var(--color-status-approved-bg)', borderColor: 'var(--color-status-approved-bg)', color: 'var(--color-status-approved)', borderRadius: 6, fontWeight: 700, fontSize: 11, cursor: 'default' }}>
                  +{addedCount}
                </Tag>
              </Tooltip>
            )}
            {removedCount > 0 && (
              <Tooltip title={`${removedCount} Sub KPI(s) removed`}>
                <Tag style={{ background: 'var(--color-status-rejected-bg)', borderColor: 'var(--color-status-rejected-bg)', color: '#be123c', borderRadius: 6, fontWeight: 700, fontSize: 11, cursor: 'default' }}>
                  -{removedCount}
                </Tag>
              </Tooltip>
            )}
            {modifiedCount > 0 && (
              <Tooltip title={`${modifiedCount} Sub KPI(s) modified`}>
                <Tag style={{ background: 'var(--color-status-pending-bg)', borderColor: 'rgba(253, 230, 138, 0.4)', color: '#d97706', borderRadius: 6, fontWeight: 700, fontSize: 11, cursor: 'default' }}>
                  ~{modifiedCount}
                </Tag>
              </Tooltip>
            )}
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setExpanded(e => !e)}
              style={{ borderRadius: 7, fontSize: 11, color: 'var(--color-primary)', borderColor: 'var(--color-border)', background: 'var(--color-primary-tint)' }}
            >
              {expanded ? 'Hide' : 'View'} Details
            </Button>
          </div>
        </div>

        {/* Expanded diff */}
        {expanded && (
          <div style={{ padding: '0 16px 14px', borderTop: '1px solid var(--color-border)' }}>
            <Text style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)', letterSpacing: 0.8, display: 'block', margin: '12px 0 8px' }}>
              CHANGES ({req.changes.length})
            </Text>
            {req.changes.map((change, idx) => (
              <ChangeDiffRow key={idx} change={change} />
            ))}

            {/* Reviewer info for non-pending */}
            {req.status !== 'Pending' && (req.reviewedBy || req.remarks) && (
              <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--color-bg-subtle)', borderRadius: 8, border: '1px solid var(--color-border)' }}>
                {req.reviewedBy && (
                  <Text style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'block' }}>
                    <TeamOutlined style={{ marginRight: 6 }} />
                    <strong>Reviewed by:</strong> {req.reviewedBy} · {req.reviewedAt ? new Date(req.reviewedAt).toLocaleString() : ''}
                  </Text>
                )}
                {req.remarks && (
                  <Text style={{ fontSize: 12, color: req.status === 'Rejected' ? '#be123c' : 'var(--color-text-secondary)', display: 'block', marginTop: 4 }}>
                    <strong>Remarks:</strong> {req.remarks}
                  </Text>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action footer — only for pending */}
        {!isReadOnly && req.status === 'Pending' && (
          <div
            style={{
              padding: '10px 16px',
              borderTop: '1px solid var(--color-border)',
              background: 'var(--color-bg-subtle)',
              display: 'flex', justifyContent: 'flex-end', gap: 8,
            }}
          >
            <Button
              size="small"
              icon={<CloseOutlined />}
              onClick={() => setRejectModal(true)}
              style={{
                borderRadius: 8, borderColor: 'var(--color-status-rejected-bg)', color: '#dc2626',
                background: 'var(--color-status-rejected-bg)', fontWeight: 600,
              }}
            >
              Reject
            </Button>
            <Button
              size="small"
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => onApprove(req.id)}
              style={{ borderRadius: 8, background: 'var(--color-primary)', borderColor: 'var(--color-primary)', fontWeight: 600 }}
            >
              Approve
            </Button>
          </div>
        )}
      </div>

      {/* Reject confirm modal */}
      <Modal
        open={rejectModal}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <StopOutlined style={{ color: '#dc2626' }} />
            <span>Reject KPI Change Request</span>
          </div>
        }
        onCancel={() => { setRejectModal(false); setRemarks(''); }}
        footer={[
          <Button key="cancel" onClick={() => { setRejectModal(false); setRemarks(''); }}>
            Cancel
          </Button>,
          <Button
            key="reject"
            danger
            type="primary"
            icon={<CloseOutlined />}
            disabled={!remarks.trim()}
            onClick={() => {
              onReject(req.id, remarks.trim());
              setRejectModal(false);
              setRemarks('');
            }}
          >
            Confirm Reject
          </Button>,
        ]}
        width={480}
        styles={{ body: { paddingTop: 8 } }}
      >
        <div style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            You are rejecting the KPI change request for&nbsp;
            <strong>{req.employeeName}</strong> ({req.employeeDesignation}).
          </Text>
        </div>
        <div>
          <Text style={{ fontSize: 12, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: 6 }}>
            Rejection remarks <span style={{ color: '#dc2626' }}>*</span>
          </Text>
          <TextArea
            rows={3}
            placeholder="Please provide a reason for rejection..."
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            style={{ borderRadius: 8 }}
          />
        </div>
      </Modal>
    </>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
interface KPIApprovalModalProps {
  open: boolean;
  onClose: () => void;
  requests: KPIChangeRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string, remarks: string) => void;
}

export default function KPIApprovalModal({
  open, onClose, requests, onApprove, onReject,
}: KPIApprovalModalProps) {
  const [activeTab, setActiveTab] = useState<'Pending' | 'Approved' | 'Rejected' | 'All'>('Pending');

  // ── Filter draft state (not applied until Search is clicked) ──────────────
  const [draftEmployees,   setDraftEmployees]   = useState<string[]>([]);
  const [draftDesigs,      setDraftDesigs]      = useState<string[]>([]);
  const [draftDepts,       setDraftDepts]       = useState<string[]>([]);
  const [draftSections,    setDraftSections]    = useState<string[]>([]);

  // ── Applied filter state ──────────────────────────────────────────────────
  const [appliedEmployees,  setAppliedEmployees]  = useState<string[]>([]);
  const [appliedDesigs,     setAppliedDesigs]     = useState<string[]>([]);
  const [appliedDepts,      setAppliedDepts]      = useState<string[]>([]);
  const [appliedSections,   setAppliedSections]   = useState<string[]>([]);

  // ── Dropdown option lists derived from all requests ───────────────────────
  const employeeOptions = useMemo(() => {
    const seen = new Set<string>();
    return requests
      .filter(r => { if (seen.has(r.employeeId)) return false; seen.add(r.employeeId); return true; })
      .map(r => ({ value: r.employeeId, label: r.employeeName, desig: r.employeeDesignation, dept: r.employeeDepartment, avatarColor: r.employeeAvatarColor }));
  }, [requests]);

  const desigOptions = useMemo(() =>
    [...new Set(requests.map(r => r.employeeDesignation))].sort(), [requests]);

  const deptOptions = useMemo(() =>
    [...new Set(requests.map(r => r.employeeDepartment))].sort(), [requests]);

  const sectionOptions = useMemo(() =>
    [...new Set(requests.map(r => r.employeeSection))].sort(), [requests]);

  // ── Apply / Reset handlers ────────────────────────────────────────────────
  const handleSearch = () => {
    setAppliedEmployees([...draftEmployees]);
    setAppliedDesigs([...draftDesigs]);
    setAppliedDepts([...draftDepts]);
    setAppliedSections([...draftSections]);
  };

  const handleReset = () => {
    setDraftEmployees([]); setDraftDesigs([]); setDraftDepts([]); setDraftSections([]);
    setAppliedEmployees([]); setAppliedDesigs([]); setAppliedDepts([]); setAppliedSections([]);
  };

  const hasActiveFilters = appliedEmployees.length > 0 || appliedDesigs.length > 0 ||
    appliedDepts.length > 0 || appliedSections.length > 0;

  const filtered = useMemo(() => {
    return requests.filter(r => {
      const matchStatus = activeTab === 'All' || r.status === activeTab;
      const matchEmp    = appliedEmployees.length  === 0 || appliedEmployees.includes(r.employeeId);
      const matchDesig  = appliedDesigs.length     === 0 || appliedDesigs.includes(r.employeeDesignation);
      const matchDept   = appliedDepts.length      === 0 || appliedDepts.includes(r.employeeDepartment);
      const matchSec    = appliedSections.length   === 0 || appliedSections.includes(r.employeeSection);
      return matchStatus && matchEmp && matchDesig && matchDept && matchSec;
    });
  }, [requests, activeTab, appliedEmployees, appliedDesigs, appliedDepts, appliedSections]);

  const pendingCount  = requests.filter(r => r.status === 'Pending').length;
  const approvedCount = requests.filter(r => r.status === 'Approved').length;
  const rejectedCount = requests.filter(r => r.status === 'Rejected').length;

  const handleApprove = (id: string) => {
    onApprove(id);
    message.success('KPI change request approved successfully.');
  };

  const handleReject = (id: string, remarks: string) => {
    onReject(id, remarks);
    message.warning('KPI change request rejected.');
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 34, height: 34, borderRadius: 9,
              background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <CheckCircleOutlined style={{ color: '#fff', fontSize: 16 }} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
              KPI Change Approvals
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 400 }}>
              Review and action employee KPI change requests
            </div>
          </div>
          {pendingCount > 0 && (
            <Badge count={pendingCount} style={{ background: '#f59e0b' }} />
          )}
        </div>
      }
      width={720}
      styles={{
        header: { borderBottom: '1px solid var(--color-border)', padding: '14px 20px' },
        body: { padding: 0, background: 'var(--color-bg-subtle)' },
      }}
      closeIcon={<CloseOutlined style={{ fontSize: 14 }} />}
    >
      {/* Search / Filter bar */}
      <div
        style={{
          padding: '14px 20px 16px',
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fcfb 100%)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        {/* Label row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <FilterOutlined style={{ color: 'var(--color-primary)', fontSize: 13 }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Filter Requests
          </span>
          {hasActiveFilters && (
            <Tag style={{ background: 'var(--color-primary-tint)', borderColor: 'var(--color-border)', color: 'var(--color-primary)', borderRadius: 99, fontSize: 10, fontWeight: 700, padding: '0 8px', marginLeft: 4 }}>
              Filtered
            </Tag>
          )}
        </div>

        {/* Row 1: Employee multi-select (full width) */}
        <Select
          mode="multiple"
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder={
            <span style={{ color: 'var(--color-text-disabled)' }}>
              <SearchOutlined style={{ marginRight: 6 }} />
              Select employee(s)…
            </span>
          }
          value={draftEmployees}
          onChange={setDraftEmployees}
          style={{ width: '100%', marginBottom: 8 }}
          maxTagCount={3}
          maxTagPlaceholder={omitted => `+${omitted.length} more`}
          optionLabelProp="label"
          filterOption={(input, opt) =>
            (opt?.label as string ?? '').toLowerCase().includes(input.toLowerCase()) ||
            (opt?.desig as string ?? '').toLowerCase().includes(input.toLowerCase())
          }
        >
          {employeeOptions.map(opt => (
            <Select.Option key={opt.value} value={opt.value} label={opt.label} desig={opt.desig}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar
                  size={22}
                  style={{
                    background: opt.avatarColor ?? 'var(--color-primary)',
                    fontSize: 9, fontWeight: 700, borderRadius: 6, flexShrink: 0,
                  }}
                >
                  {opt.label.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                </Avatar>
                <div style={{ lineHeight: 1.3 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)' }}>{opt.label}</div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-disabled)' }}>{opt.desig} · {opt.dept}</div>
                </div>
              </div>
            </Select.Option>
          ))}
        </Select>

        {/* Row 2: Designation / Department / Section */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <Select
            mode="multiple"
            allowClear
            placeholder="All Designations"
            value={draftDesigs}
            onChange={setDraftDesigs}
            style={{ flex: 1 }}
            maxTagCount={1}
            maxTagPlaceholder={o => `+${o.length}`}
            options={desigOptions.map(d => ({ value: d, label: d }))}
            showSearch
            optionFilterProp="label"
          />
          <Select
            mode="multiple"
            allowClear
            placeholder="All Departments"
            value={draftDepts}
            onChange={setDraftDepts}
            style={{ flex: 1 }}
            maxTagCount={1}
            maxTagPlaceholder={o => `+${o.length}`}
            options={deptOptions.map(d => ({ value: d, label: d }))}
            showSearch
            optionFilterProp="label"
          />
          <Select
            mode="multiple"
            allowClear
            placeholder="All Sections"
            value={draftSections}
            onChange={setDraftSections}
            style={{ flex: 1 }}
            maxTagCount={1}
            maxTagPlaceholder={o => `+${o.length}`}
            options={sectionOptions.map(s => ({ value: s, label: s }))}
            showSearch
            optionFilterProp="label"
          />
        </div>

        {/* Row 3: Action buttons */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleReset}
            style={{
              borderRadius: 8,
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-tertiary)',
              background: 'var(--color-bg-surface)',
              fontWeight: 600,
              fontSize: 12,
            }}
          >
            Reset
          </Button>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
            style={{
              borderRadius: 8,
              background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
              borderColor: 'var(--color-primary)',
              fontWeight: 600,
              fontSize: 12,
              boxShadow: '0 2px 6px rgba(15,118,110,0.25)',
            }}
          >
            Search
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: 'var(--color-bg-surface)', borderBottom: '1px solid var(--color-border)', paddingInline: 20 }}>
        <Tabs
          activeKey={activeTab}
          onChange={k => setActiveTab(k as typeof activeTab)}
          size="small"
          items={[
            {
              key: 'Pending',
              label: (
                <Space size={6}>
                  <ClockCircleOutlined style={{ color: '#f59e0b' }} />
                  Pending
                  {pendingCount > 0 && (
                    <span style={{ background: 'var(--color-status-pending-bg)', color: '#d97706', borderRadius: 99, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>
                      {pendingCount}
                    </span>
                  )}
                </Space>
              ),
            },
            {
              key: 'Approved',
              label: (
                <Space size={6}>
                  <CheckCircleOutlined style={{ color: '#16a34a' }} />
                  Approved
                  {approvedCount > 0 && (
                    <span style={{ background: 'var(--color-status-approved-bg)', color: '#166534', borderRadius: 99, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>
                      {approvedCount}
                    </span>
                  )}
                </Space>
              ),
            },
            {
              key: 'Rejected',
              label: (
                <Space size={6}>
                  <StopOutlined style={{ color: '#dc2626' }} />
                  Rejected
                  {rejectedCount > 0 && (
                    <span style={{ background: 'var(--color-status-rejected-bg)', color: '#991b1b', borderRadius: 99, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>
                      {rejectedCount}
                    </span>
                  )}
                </Space>
              ),
            },
            {
              key: 'All',
              label: (
                <Space size={6}>
                  All Requests
                  <span style={{ background: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)', borderRadius: 99, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>
                    {requests.length}
                  </span>
                </Space>
              ),
            },
          ]}
        />
      </div>

      {/* Requests list */}
      <div style={{ padding: 20, overflowY: 'auto', maxHeight: 'calc(100vh - 220px)' }}>
        {filtered.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Text style={{ color: 'var(--color-text-disabled)' }}>
                {activeTab === 'Pending' ? 'No pending requests' : `No ${activeTab.toLowerCase()} requests`}
              </Text>
            }
          />
        ) : (
          filtered.map(req => (
            <RequestCard
              key={req.id}
              req={req}
              onApprove={handleApprove}
              onReject={handleReject}
              isReadOnly={req.status !== 'Pending'}
            />
          ))
        )}
      </div>

      {/* Footer summary */}
      <div
        style={{
          padding: '10px 20px',
          background: 'linear-gradient(180deg, #f8fcfb 0%, #fff 100%)',
          borderTop: '1px solid var(--color-border)',
          display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap',
        }}
      >
        <Text style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
          Total: <strong>{requests.length}</strong>
        </Text>
        <Divider type="vertical" />
        <Text style={{ fontSize: 12, color: '#d97706' }}>
          Pending: <strong>{pendingCount}</strong>
        </Text>
        <Divider type="vertical" />
        <Text style={{ fontSize: 12, color: 'var(--color-status-approved)' }}>
          Approved: <strong>{approvedCount}</strong>
        </Text>
        <Divider type="vertical" />
        <Text style={{ fontSize: 12, color: '#be123c' }}>
          Rejected: <strong>{rejectedCount}</strong>
        </Text>
        {hasActiveFilters && (
          <>
            <Divider type="vertical" />
            <Text style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600 }}>
              Showing: <strong>{filtered.length}</strong> matched
            </Text>
          </>
        )}
      </div>
    </Drawer>
  );
}
