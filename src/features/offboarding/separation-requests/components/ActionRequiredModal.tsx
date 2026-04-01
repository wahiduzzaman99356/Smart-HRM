import { useState, useMemo } from 'react';
import {
  Button, Col, Row, Empty, Space, Table, Tag, Tooltip, message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CheckOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  ArrowRightOutlined,
  DownOutlined,
  UpOutlined,
  WarningFilled,
} from '@ant-design/icons';
import type { ActionRequiredItem, ActionRequiredStatus } from '../types/separation.types';

// ─── Design tokens ────────────────────────────────────────────────────────────
const CLR_PRIMARY = '#0f766e';
const CLR_BORDER = '#a7e3d9';
const CLR_BG = '#eef5f4';

// ─── Helpers ──────────────────────────────────────────────────────────────────
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
const STATUS_CFG: Record<ActionRequiredStatus, { bg: string; text: string; dot: string }> = {
  'Pending':   { bg: '#fef3c7', text: '#d97706', dot: '#f59e0b' },
  'Processed': { bg: '#f0fdf4', text: '#059669', dot: '#22c55e' },
  'Cancelled': { bg: '#fef2f2', text: '#b91c1c', dot: '#ef4444' },
};

function StatusBadge({ status }: { status: ActionRequiredStatus }) {
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

// ─── Props ────────────────────────────────────────────────────────────────────
interface ActionRequiredSectionProps {
  items: ActionRequiredItem[];
  onTakeAction: (item: ActionRequiredItem) => void;
  onProcessed: (actionId: string) => void;
}

function colHead(label: string) {
  return (
    <span style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.05em' }}>
      {label}
    </span>
  );
}

// ─── Main Action Required Section ────────────────────────────────────────────
export function ActionRequiredSection({ 
  items, 
  onTakeAction, 
  onProcessed 
}: ActionRequiredSectionProps) {
  const [expanded, setExpanded] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ActionRequiredItem | null>(null);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);

  const pendingItems = useMemo(() => items.filter(i => i.status === 'Pending'), [items]);
  const processedItems = useMemo(() => items.filter(i => i.status === 'Processed'), [items]);
  const pendingCount = pendingItems.length;
  const processedCount = processedItems.length;
  const total = useMemo(() => pendingItems.length + processedItems.length, [pendingItems, processedItems]);

  const handleTakeAction = (item: ActionRequiredItem) => {
    onTakeAction(item);
  };

  if (total === 0) return null;

  return (
    <>
      <div style={{ border: '1px solid #fed7aa', borderRadius: 10, overflow: 'hidden', marginBottom: 20, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
        {/* ── Banner Header ─────────────────────────────────────────────────── */}
        <button
          onClick={() => setExpanded((prev) => !prev)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            width: '100%',
            padding: '12px 16px', background: '#fff7ed', borderBottom: expanded ? '1px solid #fed7aa' : 'none',
            border: 'none',
            cursor: 'pointer',
            transition: 'background 0.2s ease',
          }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <WarningFilled style={{ color: '#ea580c', fontSize: 14 }} />
            <span style={{ fontWeight: 700, fontSize: 13, color: '#92400e' }}>
              ACTION REQUIRED ({total})
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#b45309',
              background: '#ffedd5',
              border: '1px solid #fdba74',
              borderRadius: 999,
              padding: '2px 8px',
              letterSpacing: '0.03em',
            }}>
              {pendingCount} Pending
            </span>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#047857',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: 999,
              padding: '2px 8px',
              letterSpacing: '0.03em',
            }}>
              {processedCount} Processed
            </span>
            <span style={{ fontSize: 12, color: '#b45309' }}>
              From performance appraisal decisions
            </span>
            {expanded ? <UpOutlined style={{ color: '#b45309', fontSize: 12 }} /> : <DownOutlined style={{ color: '#b45309', fontSize: 12 }} />}
          </div>
        </button>

        {expanded && (
          <>
        {/* ── Pending Items ─────────────────────────────────────────────────── */}
        {pendingItems.map((item) => (
          <div key={`pending-${item.id}`} style={{ padding: '12px 16px', background: '#fffbf5', borderBottom: '1px solid #fef3c7' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 10, flex: 1 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', display: 'inline-block', marginTop: 4, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 6,
                      background: avatarColor(item.empName), display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700, fontSize: 11, flexShrink: 0,
                    }}>
                      {initials(item.empName)}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{item.empName}</div>
                      <div style={{ fontSize: 11, color: '#6b7280' }}>
                        {item.designation} • {item.department}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4, marginLeft: 40 }}>
                    <strong>Appraisal Period:</strong> {item.appraisalPeriodLabel} | <strong>Decision:</strong> {item.decisionDetails.decision}
                  </div>
                  {item.decisionDetails.remarks && (
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4, marginLeft: 40 }}>
                      <strong>Remarks:</strong> {item.decisionDetails.remarks}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, marginLeft: 40 }}>
                    <Button
                      size="small"
                      type="primary"
                      icon={<ArrowRightOutlined />}
                      style={{ fontWeight: 600, fontSize: 12, borderRadius: 6 }}
                      onClick={() => handleTakeAction(item)}
                    >
                      Take Action
                    </Button>
                    <Button
                      size="small"
                      icon={<EyeOutlined />}
                      style={{ fontWeight: 600, fontSize: 12, borderRadius: 6 }}
                      onClick={() => {
                        setSelectedItem(item);
                        setShowDetailDrawer(true);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 16 }}>
                <span style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'monospace' }}>#{item.empId}</span>
              </div>
            </div>
          </div>
        ))}

        {/* ── Processed Items ───────────────────────────────────────────────── */}
        {processedItems.length > 0 && (
          <>
            {pendingItems.length > 0 && (
              <div style={{
                padding: '8px 16px', background: '#f0fdfc', textAlign: 'center',
                fontSize: 11, fontWeight: 700, color: '#115e59', letterSpacing: '0.05em',
                borderBottom: '1px solid #a7e3d9',
              }}>
                PROCESSED ACTIONS ({processedItems.length})
              </div>
            )}
            {processedItems.map((item) => (
              <div key={`processed-${item.id}`} style={{ padding: '12px 16px', background: '#f0fdfc', borderBottom: '1px solid #cffafe' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', opacity: 0.7 }}>
                  <div style={{ display: 'flex', gap: 10, flex: 1 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', marginTop: 4, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 6,
                          background: avatarColor(item.empName), display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontWeight: 700, fontSize: 11, flexShrink: 0,
                        }}>
                          {initials(item.empName)}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{item.empName}</div>
                          <div style={{ fontSize: 11, color: '#6b7280' }}>
                            {item.designation} • {item.department}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4, marginLeft: 40 }}>
                        <strong>Appraisal Period:</strong> {item.appraisalPeriodLabel}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 16 }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '2px 8px', borderRadius: 4,
                      fontSize: 11, fontWeight: 700, color: '#059669',
                      background: '#f0fdf4', border: '1px solid #bbf7d0', letterSpacing: '0.04em',
                    }}>
                      <CheckOutlined style={{ fontSize: 10 }} /> Done
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
          </>
        )}
      </div>

      {selectedItem && (
        <ActionDetailDrawer
          item={selectedItem}
          onClose={() => {
            setShowDetailDrawer(false);
            setSelectedItem(null);
          }}
          onTakeAction={(item) => {
            handleTakeAction(item);
            setShowDetailDrawer(false);
            setSelectedItem(null);
          }}
        />
      )}
    </>
  );
}

// ─── Action Detail Drawer ─────────────────────────────────────────────────────
interface ActionDetailDrawerProps {
  item: ActionRequiredItem | null;
  onClose: () => void;
  onTakeAction: (item: ActionRequiredItem) => void;
}

function ActionDetailDrawer({ item, onClose, onTakeAction }: ActionDetailDrawerProps) {
  if (!item) return null;

  const color = avatarColor(item.empName);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.45)',
      zIndex: 999,
      display: 'flex',
      justifyContent: 'flex-end',
    }}
      onClick={onClose}
    >
      <div
        style={{
          width: '90%',
          maxWidth: 600,
          height: '100%',
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: CLR_BG, border: `1px solid ${CLR_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ExclamationCircleOutlined style={{ color: CLR_PRIMARY, fontSize: 17 }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>Action Required</div>
              <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 400 }}>{item.empName}</div>
            </div>
          </div>
          <Button type="text" onClick={onClose}>✕</Button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {/* Employee card */}
          <div style={{ background: '#fff', border: `1px solid ${CLR_BORDER}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 8,
                background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: 16,
              }}>
                {initials(item.empName)}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{item.empName}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{item.empCode}</div>
              </div>
            </div>

            <Row gutter={[12, 12]}>
              <Col xs={24} sm={12}>
                <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, marginBottom: 4 }}>DESIGNATION</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{item.designation}</div>
              </Col>
              <Col xs={24} sm={12}>
                <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, marginBottom: 4 }}>DEPARTMENT</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{item.department}</div>
              </Col>
              <Col xs={24} sm={12}>
                <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, marginBottom: 4 }}>DATE OF JOINING</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{item.dateOfJoining}</div>
              </Col>
              <Col xs={24} sm={12}>
                <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, marginBottom: 4 }}>EMPLOYMENT STATUS</div>
                <Tag style={{ borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{item.employmentStatus}</Tag>
              </Col>
            </Row>
          </div>

          {/* Decision Info */}
          <div style={{ background: '#fff', border: `1px solid #fde68a`, borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ background: '#fffbeb', padding: '12px 16px', borderBottom: '1px solid #fde68a' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#d97706', display: 'flex', alignItems: 'center', gap: 6 }}>
                <ExclamationCircleOutlined /> Appraisal Decision
              </div>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, marginBottom: 4 }}>APPRAISAL PERIOD</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{item.appraisalPeriodLabel}</div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, marginBottom: 4 }}>DECISION TYPE</div>
                <Tag style={{ background: '#fed7aa', color: '#d97706', fontWeight: 700, borderRadius: 6, border: 'none' }}>
                  {item.decisionDetails.decision}
                </Tag>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, marginBottom: 4 }}>EFFECTIVE DATE</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{item.decisionDetails.effectiveDate}</div>
              </div>
              {item.decisionDetails.remarks && (
                <div>
                  <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, marginBottom: 4 }}>REMARKS</div>
                  <div style={{ fontSize: 12, color: '#374151', background: '#f9fafb', padding: '8px 10px', borderRadius: 6, borderLeft: '2px solid #fde68a' }}>
                    {item.decisionDetails.remarks}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div style={{ background: '#fff', border: `1px solid ${CLR_BORDER}`, borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, marginBottom: 8, letterSpacing: '0.05em' }}>ACTION CREATED</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>
                <span style={{ color: '#6b7280', fontWeight: 700 }}>✓</span>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>Action triggered by Performance Appraisal</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{item.createdAt}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button onClick={onClose} style={{ borderRadius: 8 }}>Cancel</Button>
          <Button
            type="primary"
            icon={<ArrowRightOutlined />}
            onClick={() => {
              onTakeAction(item);
              onClose();
            }}
            style={{ borderRadius: 8 }}
          >
            Take Action
          </Button>
        </div>
      </div>
    </div>
  );
}
