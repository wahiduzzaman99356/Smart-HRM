/**
 * MyShiftPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * ESS → My Shift module
 *
 * Three tabs:
 *  My Shift   – Current shift overview
 *  My Request – Employee's own shift change/exchange requests (list + create + view)
 *  Approvals  – Manager view to approve/reject requests
 */

import { useState, useMemo } from 'react';
import { message } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';

import { MyShiftTab }          from '../components/MyShiftTab';
import { ShiftChangeListView } from '../components/ShiftChangeListView';
import { ShiftChangeForm }     from '../components/ShiftChangeForm';
import { ApprovalsListView }   from '../components/ApprovalsListView';
import {
  ShiftChangeRequest,
  ExchangeableEmployee,
  INITIAL_SHIFT_REQUESTS,
} from '../types/shift-change.types';

// ─── Tab Types ─────────────────────────────────────────────────────────────────
type ActiveTab        = 'my-shift' | 'my-request' | 'approvals';
type MyRequestView    = 'list' | 'create' | 'view-only';
type ApprovalView     = 'list' | 'view-approve' | 'view-only';

// ─── Component ─────────────────────────────────────────────────────────────────
export default function MyShiftPage() {
  const [activeTab,       setActiveTab]       = useState<ActiveTab>('my-shift');
  const [myRequestView,   setMyRequestView]   = useState<MyRequestView>('list');
  const [approvalView,    setApprovalView]    = useState<ApprovalView>('list');
  const [activeRequest,   setActiveRequest]   = useState<ShiftChangeRequest | null>(null);

  // Shared request store (in a real app this would be API-backed)
  const [requests, setRequests] = useState<ShiftChangeRequest[]>(INITIAL_SHIFT_REQUESTS);

  // ── My Request handlers ──────────────────────────────────────────────────────
  const handleCreate = () => { setActiveRequest(null); setMyRequestView('create'); };
  const handleViewMyRequest = (req: ShiftChangeRequest) => { setActiveRequest(req); setMyRequestView('view-only'); };
  const handleCancelRequest = (id: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Cancelled' } : r));
  };
  const handleSubmitRequest = (req: ShiftChangeRequest) => {
    setRequests(prev => [req, ...prev]);
    setMyRequestView('list');
  };

  // ── Approval handlers ────────────────────────────────────────────────────────
  const handleOpenApproval = (req: ShiftChangeRequest) => { setActiveRequest(req); setApprovalView(req.status === 'To Approve' ? 'view-approve' : 'view-only'); };
  const handleApprove = (id: string, remarks: string, exchangeWith?: ExchangeableEmployee, assignedEmployee?: ExchangeableEmployee) => {
    setRequests(prev => prev.map(r =>
      r.id === id
        ? {
            ...r,
            status: 'Approved',
            remarks,
            ...(exchangeWith     ? { exchangeWith }     : {}),
            ...(assignedEmployee ? { assignedEmployee } : {}),
          }
        : r,
    ));
    setApprovalView('list');
  };
  const handleReject = (id: string, remarks: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Rejected', remarks } : r));
    setApprovalView('list');
  };
  const handleBulkApprove = (ids: string[]) => {
    setRequests(prev => prev.map(r => ids.includes(r.id) && r.status === 'To Approve' ? { ...r, status: 'Approved', remarks: 'Bulk approved.' } : r));
    message.success(`${ids.length} request(s) approved.`);
  };
  const handleBulkReject = (ids: string[]) => {
    setRequests(prev => prev.map(r => ids.includes(r.id) && r.status === 'To Approve' ? { ...r, status: 'Rejected', remarks: 'Bulk rejected.' } : r));
    message.success(`${ids.length} request(s) rejected.`);
  };

  // ── Pending count badge ──────────────────────────────────────────────────────
  const pendingCount = useMemo(() => requests.filter(r => r.status === 'To Approve').length, [requests]);

  // ── Tab Switch (resets sub-views) ────────────────────────────────────────────
  const switchTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMyRequestView('list');
    setApprovalView('list');
    setActiveRequest(null);
  };

  // ── Determine if sub-view is active (full-page form) ─────────────────────────
  const isFormView =
    (activeTab === 'my-request' && myRequestView !== 'list') ||
    (activeTab === 'approvals'  && approvalView  !== 'list');

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#eef4f5' }}>
      {/* ── Page Header with Tab Switcher ──────────────────────────────────── */}
      {!isFormView && (
        <div
          style={{
            background: '#fff',
            borderBottom: '1px solid #e5e7eb',
            padding: '14px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          {/* Left: Module Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ClockCircleOutlined style={{ color: '#fff', fontSize: 16 }} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>My Shift</div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>Shift Change &amp; Exchange Management</div>
            </div>
          </div>

          {/* Right: Tab Buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            {([ 'my-shift', 'my-request', 'approvals' ] as ActiveTab[]).map(tab => {
              const labels: Record<ActiveTab, string> = { 'my-shift': 'My Shift', 'my-request': 'My Request', 'approvals': 'Approvals' };
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => switchTab(tab)}
                  style={{
                    padding: '6px 18px',
                    borderRadius: 8,
                    border: `1.5px solid ${isActive ? '#0d9488' : '#d1d5db'}`,
                    background: isActive ? '#0d9488' : '#fff',
                    color: isActive ? '#fff' : '#374151',
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 400,
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.15s',
                  }}
                >
                  {labels[tab]}
                  {tab === 'approvals' && pendingCount > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: -6,
                        right: -6,
                        minWidth: 18,
                        height: 18,
                        borderRadius: 9,
                        background: '#dc2626',
                        color: '#fff',
                        fontSize: 10,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 4px',
                      }}
                    >
                      {pendingCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflow: 'hidden', background: activeTab === 'my-shift' ? '#eef4f5' : '#eef4f5' }}>
        {/* MY SHIFT TAB */}
        {activeTab === 'my-shift' && <MyShiftTab />}

        {/* MY REQUEST TAB */}
        {activeTab === 'my-request' && (
          <>
            {myRequestView === 'list' && (
              <ShiftChangeListView
                requests={requests}
                onCreateNew={handleCreate}
                onView={handleViewMyRequest}
                onCancel={handleCancelRequest}
              />
            )}
            {myRequestView === 'create' && (
              <ShiftChangeForm
                mode="create"
                onBack={() => setMyRequestView('list')}
                onSubmit={handleSubmitRequest}
              />
            )}
            {myRequestView === 'view-only' && activeRequest && (
              <ShiftChangeForm
                mode="view-only"
                request={activeRequest}
                onBack={() => { setMyRequestView('list'); setActiveRequest(null); }}
              />
            )}
          </>
        )}

        {/* APPROVALS TAB */}
        {activeTab === 'approvals' && (
          <>
            {approvalView === 'list' && (
              <ApprovalsListView
                requests={requests}
                onApproveReject={handleOpenApproval}
                onBulkApprove={handleBulkApprove}
                onBulkReject={handleBulkReject}
              />
            )}
            {approvalView === 'view-approve' && activeRequest && (
              <ShiftChangeForm
                mode="view-approve"
                request={activeRequest}
                onBack={() => { setApprovalView('list'); setActiveRequest(null); }}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            )}
            {approvalView === 'view-only' && activeRequest && (
              <ShiftChangeForm
                mode="view-only"
                request={activeRequest}
                onBack={() => { setApprovalView('list'); setActiveRequest(null); }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
