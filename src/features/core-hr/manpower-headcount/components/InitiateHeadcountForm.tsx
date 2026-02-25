/**
 * InitiateHeadcountForm
 * Handles two modes:
 *   'create'  – create a new headcount request (org picker + full editing + submit)
 *   'action'  – approve or reject an existing request (editable req HC + approve/reject flow)
 */

import { useState } from 'react';
import {
  Button, Select, Input, Table, Popconfirm, message, Space, Alert,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  LeftOutlined, DeleteOutlined, ApartmentOutlined,
  CheckCircleOutlined, CloseCircleOutlined,
} from '@ant-design/icons';
import type { HCOrgLevelRow, HCRequest } from '../types/headcount.types';
import { PLAN_YEAR_OPTIONS } from '../types/headcount.types';
import { OrgLevelPickerDrawer } from './OrgLevelPickerDrawer';
import type { OrgLevelSelection } from './OrgLevelPickerDrawer';

// ─── Reject reason options ────────────────────────────────────────────────────
const REJECT_REASONS = [
  { value: 'budget',       label: 'Budget Constraint' },
  { value: 'freeze',       label: 'Headcount Freeze' },
  { value: 'not_aligned',  label: 'Not Aligned with Business Plan' },
  { value: 'pending',      label: 'Pending Further Review' },
  { value: 'others',       label: 'Others' },
];

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  mode?: 'create' | 'action';
  existingRequest?: HCRequest;
  onBack: () => void;
  /** Create mode: called with the full draft */
  onSubmit?: (req: Omit<HCRequest, 'id' | 'approvalWorkflow' | 'actionHistory'>) => void;
  /** Action mode: approve with (optionally) updated rows */
  onApprove?: (id: string, updatedRows: HCOrgLevelRow[]) => void;
  /** Action mode: reject with reason label + optional note */
  onReject?: (id: string, updatedRows: HCOrgLevelRow[], reasonLabel: string, note: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function InitiateHeadcountForm({
  mode = 'create',
  existingRequest,
  onBack,
  onSubmit,
  onApprove,
  onReject,
}: Props) {
  const isAction = mode === 'action';

  // ── Form state ───────────────────────────────────────────────────────────────
  const [planYear,   setPlanYear]   = useState(existingRequest?.planYear ?? 'FY 2026 (Jan - Dec)');
  const [rows,       setRows]       = useState<HCOrgLevelRow[]>(existingRequest?.rows ?? []);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pendingSel, setPendingSel] = useState<OrgLevelSelection | null>(null);

  // ── Reject flow state ────────────────────────────────────────────────────────
  const [rejectPanelOpen, setRejectPanelOpen] = useState(false);
  const [rejectReason,    setRejectReason]    = useState('');
  const [rejectNote,      setRejectNote]      = useState('');

  // ── Row helpers (create mode only) ───────────────────────────────────────────
  const handleAdd = () => {
    if (!pendingSel) { message.warning('Select an organization level first.'); return; }
    if (rows.some(r => r.orgLevelPath === pendingSel.orgLevelPath)) {
      message.warning('This level is already added.');
      return;
    }
    setRows(prev => [...prev, {
      id: `row-${Date.now()}`,
      orgLevelPath:  pendingSel.orgLevelPath,
      department:    pendingSel.department,
      designation:   pendingSel.designation,
      currentHC:     pendingSel.currentHC,
      requiredHC:    '',
      budgetRange:   '',
      justification: '',
    }]);
    setPendingSel(null);
  };

  const updateRow = (id: string, field: keyof HCOrgLevelRow, value: string) =>
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));

  const removeRow = (id: string) => setRows(prev => prev.filter(r => r.id !== id));

  // ── Create mode submit ────────────────────────────────────────────────────────
  const handleCreateAction = (status: HCRequest['status']) => {
    if (rows.length === 0) { message.error('Add at least one organization level.'); return; }
    const totalReqHC = rows.reduce((s, r) => s + (parseInt(r.requiredHC, 10) || 0), 0);
    const today = new Date();
    const initiationDate = today.toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
    onSubmit?.({ planYear, initiationDate, rows, status, totalReqHC, totalApprHC: null });
  };

  const handleReset = () => {
    if (isAction) {
      setRows(existingRequest?.rows ?? []);
    } else {
      setRows([]);
      setPlanYear('FY 2026 (Jan - Dec)');
      setPendingSel(null);
    }
    setRejectPanelOpen(false);
    setRejectReason('');
    setRejectNote('');
  };

  // ── Action mode: approve ──────────────────────────────────────────────────────
  const handleApprove = () => {
    if (!existingRequest) return;
    onApprove?.(existingRequest.id, rows);
  };

  // ── Action mode: reject submit ────────────────────────────────────────────────
  const handleRejectSubmit = () => {
    if (!rejectReason) { message.warning('Please select a rejection reason.'); return; }
    if (rejectReason === 'others' && !rejectNote.trim()) {
      message.warning('Please enter a note for "Others".'); return;
    }
    const reasonLabel = REJECT_REASONS.find(r => r.value === rejectReason)?.label ?? rejectReason;
    const noteText = rejectReason === 'others' ? rejectNote.trim() : '';
    onReject?.(existingRequest!.id, rows, reasonLabel, noteText);
  };

  // ── Table columns ─────────────────────────────────────────────────────────────
  const columns: ColumnsType<HCOrgLevelRow> = [
    {
      title: <span style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.05em' }}>ORGANIZATION LEVEL</span>,
      key: 'level',
      width: '28%',
      render: (_, r) => (
        <span style={{ fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          {r.orgLevelPath}
        </span>
      ),
    },
    {
      title: <span style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.05em' }}>CURRENT HC</span>,
      key: 'currentHC',
      align: 'center',
      width: 100,
      render: (_, r) => (
        <span style={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>{r.currentHC}</span>
      ),
    },
    {
      title: (
        <span style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.05em' }}>
          REQUIRED HC<span style={{ color: '#ef4444' }}>*</span>
        </span>
      ),
      key: 'requiredHC',
      width: 130,
      render: (_, r) => (
        <Input
          value={r.requiredHC}
          onChange={e => updateRow(r.id, 'requiredHC', e.target.value)}
          placeholder="Input here"
          type="number"
          min={0}
          style={{ borderRadius: 7, textAlign: 'center' }}
        />
      ),
    },
    {
      title: <span style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.05em' }}>REQUIRED BUDGET RANGE</span>,
      key: 'budgetRange',
      width: 180,
      render: (_, r) => (
        <Input
          value={r.budgetRange}
          onChange={e => updateRow(r.id, 'budgetRange', e.target.value)}
          placeholder="Budget Range"
          style={{ borderRadius: 7 }}
        />
      ),
    },
    {
      title: <span style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.05em' }}>JUSTIFICATION</span>,
      key: 'justification',
      render: (_, r) => (
        isAction
          ? <span style={{ fontSize: 12, color: '#6b7280' }}>{r.justification || '—'}</span>
          : (
            <Input.TextArea
              value={r.justification}
              onChange={e => updateRow(r.id, 'justification', e.target.value)}
              placeholder="Type here..."
              rows={2}
              style={{ borderRadius: 7, fontSize: 12, resize: 'vertical' }}
            />
          )
      ),
    },
    // Delete column only in create mode
    ...(!isAction ? [{
      title: <span style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.05em' }}>ACTION</span>,
      key: 'action',
      align: 'center' as const,
      width: 68,
      render: (_: unknown, r: HCOrgLevelRow) => (
        <Popconfirm title="Remove this row?" onConfirm={() => removeRow(r.id)} okText="Yes" cancelText="No">
          <Button type="text" size="small" icon={<DeleteOutlined />} style={{ color: '#9ca3af' }} />
        </Popconfirm>
      ),
    }] : []),
  ];

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '24px 32px', height: '100%', overflowY: 'auto', background: '#f9fafb' }}>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 }}>
            {isAction ? `Review Request — ${existingRequest?.id}` : 'Initiate Headcount Request'}
          </h1>
          {isAction && (
            <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>
              Review and modify requested headcount before approving or rejecting.
            </p>
          )}
        </div>
        <Button
          type="link"
          icon={<LeftOutlined style={{ fontSize: 12 }} />}
          onClick={onBack}
          style={{ color: '#3b82f6', fontWeight: 600, padding: 0, fontSize: 13 }}
        >
          Back to List
        </Button>
      </div>

      {/* ── Controls card ────────────────────────────────────────────────── */}
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
        padding: '20px', marginBottom: 16,
        display: 'flex', gap: 24, alignItems: 'flex-end', flexWrap: 'wrap',
      }}>
        {/* Plan Year */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', marginBottom: 6 }}>
            PLAN FOR THE YEAR<span style={{ color: '#ef4444' }}>*</span>
          </div>
          <Select
            value={planYear}
            onChange={v => setPlanYear(v)}
            options={PLAN_YEAR_OPTIONS}
            style={{ width: 220 }}
            disabled={isAction}
          />
        </div>

        {/* Org Level picker — create mode only */}
        {!isAction && (
          <div style={{ flex: 1, minWidth: 320 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', marginBottom: 6 }}>
              SELECT ORGANIZATION LEVEL<span style={{ color: '#ef4444' }}>*</span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Button
                icon={<ApartmentOutlined />}
                onClick={() => setPickerOpen(true)}
                style={{ background: '#eff6ff', borderColor: '#bfdbfe', color: '#1d4ed8', fontWeight: 600, fontSize: 12, borderRadius: 7, flexShrink: 0, height: 32 }}
              >
                SELECT LEVEL
              </Button>
              <div style={{
                flex: 1, border: '1px solid #e5e7eb', borderRadius: 7, padding: '5px 12px',
                fontSize: 13, color: pendingSel ? '#111827' : '#9ca3af', background: '#fafafa',
                minHeight: 32, display: 'flex', alignItems: 'center',
                fontWeight: pendingSel ? 500 : 400,
              }}>
                {pendingSel?.orgLevelPath ?? 'No level selected — click SELECT LEVEL'}
              </div>
              <Button
                onClick={handleAdd}
                style={{ background: '#ecfdf5', borderColor: '#6ee7b7', color: '#065f46', fontWeight: 700, fontSize: 13, borderRadius: 7, flexShrink: 0, height: 32 }}
              >
                + ADD
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Rows table ───────────────────────────────────────────────────── */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden', marginBottom: 20 }}>
        <Table
          dataSource={rows}
          columns={columns}
          rowKey="id"
          pagination={false}
          size="middle"
          locale={{ emptyText: <div style={{ color: '#9ca3af', fontSize: 13, padding: '24px 0' }}>No levels added yet — select a level and click <strong>+ ADD</strong>.</div> }}
        />
      </div>

      {/* ── Rejection reason panel ────────────────────────────────────────── */}
      {isAction && rejectPanelOpen && (
        <div style={{
          background: '#fff', border: '1px solid #fca5a5', borderRadius: 10,
          padding: '20px', marginBottom: 20,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#dc2626', marginBottom: 14 }}>
            Rejection Details
          </div>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div style={{ flex: '0 0 280px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', marginBottom: 6 }}>
                REASON<span style={{ color: '#ef4444' }}>*</span>
              </div>
              <Select
                value={rejectReason || undefined}
                onChange={v => { setRejectReason(v); setRejectNote(''); }}
                placeholder="Select a reason…"
                options={REJECT_REASONS}
                style={{ width: '100%' }}
              />
            </div>

            {rejectReason === 'others' && (
              <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', marginBottom: 6 }}>
                  NOTE<span style={{ color: '#ef4444' }}>*</span>
                </div>
                <Input.TextArea
                  value={rejectNote}
                  onChange={e => setRejectNote(e.target.value)}
                  placeholder="Describe the reason for rejection…"
                  rows={3}
                  style={{ borderRadius: 7 }}
                />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
            <Button onClick={() => { setRejectPanelOpen(false); setRejectReason(''); setRejectNote(''); }} style={{ borderRadius: 7 }}>
              Cancel
            </Button>
            <Button
              onClick={handleRejectSubmit}
              style={{ background: '#ef4444', borderColor: '#ef4444', color: '#fff', fontWeight: 700, borderRadius: 7 }}
            >
              Submit Rejection
            </Button>
          </div>
        </div>
      )}

      {/* ── Action buttons ────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Space size={8}>
          {isAction ? (
            <>
              <Button
                onClick={handleReset}
                style={{ borderRadius: 7, fontWeight: 600 }}
              >
                Reset
              </Button>
              {!rejectPanelOpen && (
                <Button
                  icon={<CloseCircleOutlined />}
                  onClick={() => setRejectPanelOpen(true)}
                  style={{ background: '#ef4444', borderColor: '#ef4444', color: '#fff', fontWeight: 700, borderRadius: 7, minWidth: 100 }}
                >
                  Reject
                </Button>
              )}
              <Button
                icon={<CheckCircleOutlined />}
                onClick={handleApprove}
                style={{ background: '#22c55e', borderColor: '#22c55e', color: '#fff', fontWeight: 700, borderRadius: 7, minWidth: 100 }}
              >
                Approve
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => handleCreateAction('Rejected')}
                style={{ background: '#ef4444', borderColor: '#ef4444', color: '#fff', fontWeight: 700, borderRadius: 7, minWidth: 90 }}
              >
                REJECT
              </Button>
              <Button
                onClick={() => handleCreateAction('Approved')}
                style={{ background: '#22c55e', borderColor: '#22c55e', color: '#fff', fontWeight: 700, borderRadius: 7, minWidth: 90 }}
              >
                APPROVE
              </Button>
              <Button
                onClick={handleReset}
                style={{ background: '#f59e0b', borderColor: '#f59e0b', color: '#fff', fontWeight: 700, borderRadius: 7, minWidth: 90 }}
              >
                RESET
              </Button>
              <Button
                onClick={() => handleCreateAction('Draft')}
                style={{ background: '#3b82f6', borderColor: '#3b82f6', color: '#fff', fontWeight: 700, borderRadius: 7, minWidth: 90 }}
              >
                SUBMIT
              </Button>
            </>
          )}
        </Space>
      </div>

      {/* ── Org Level Picker Drawer ───────────────────────────────────────── */}
      {!isAction && (
        <OrgLevelPickerDrawer
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onSelect={sel => { setPendingSel(sel); setPickerOpen(false); }}
        />
      )}
    </div>
  );
}
