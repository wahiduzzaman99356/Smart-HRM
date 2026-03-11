/**
 * ProvidentFundPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * ESS → Provident Fund module
 *
 * Two tabs:
 *  My Request  – Employee's own PF loan requests (list + create + view)
 *  Approvals   – Manager view to approve/reject requests
 */

import { useState, useMemo } from 'react';
import { message } from 'antd';
import { BankOutlined } from '@ant-design/icons';

import { PFMyRequestListView } from '../components/PFMyRequestListView';
import { PFLoanRequestForm }   from '../components/PFLoanRequestForm';
import { PFApprovalsListView } from '../components/PFApprovalsListView';
import {
  PFLoanRequest,
  INITIAL_PF_REQUESTS,
} from '../types/provident-fund.types';

// ─── Tab Types ─────────────────────────────────────────────────────────────────
type ActiveTab     = 'my-request' | 'approvals';
type MyRequestView = 'list' | 'create' | 'view-only';
type ApprovalView  = 'list' | 'view-approve' | 'view-only';

// ─── Component ─────────────────────────────────────────────────────────────────
export default function ProvidentFundPage() {
  const [activeTab,     setActiveTab]     = useState<ActiveTab>('my-request');
  const [myRequestView, setMyRequestView] = useState<MyRequestView>('list');
  const [approvalView,  setApprovalView]  = useState<ApprovalView>('list');
  const [activeRequest, setActiveRequest] = useState<PFLoanRequest | null>(null);

  // Shared request store
  const [requests, setRequests] = useState<PFLoanRequest[]>(INITIAL_PF_REQUESTS);

  // ── My Request handlers ──────────────────────────────────────────────────────
  const handleCreate = () => { setActiveRequest(null); setMyRequestView('create'); };

  const handleViewMyRequest = (req: PFLoanRequest) => {
    setActiveRequest(req);
    setMyRequestView('view-only');
  };

  const handleCancelRequest = (id: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Cancelled' } : r));
  };

  const handleSubmitRequest = (req: PFLoanRequest) => {
    setRequests(prev => [req, ...prev]);
    setMyRequestView('list');
  };

  // ── Approval handlers ────────────────────────────────────────────────────────
  const handleOpenApproval = (req: PFLoanRequest) => {
    setActiveRequest(req);
    setApprovalView(req.status === 'To Approve' ? 'view-approve' : 'view-only');
  };

  const handleApprove = (id: string, remarks: string) => {
    setRequests(prev => prev.map(r =>
      r.id === id ? { ...r, status: 'Approved', remarks } : r,
    ));
    setApprovalView('list');
  };

  const handleReject = (id: string, remarks: string) => {
    setRequests(prev => prev.map(r =>
      r.id === id ? { ...r, status: 'Rejected', remarks } : r,
    ));
    setApprovalView('list');
  };

  const handleBulkApprove = (ids: string[]) => {
    setRequests(prev => prev.map(r =>
      ids.includes(r.id) && r.status === 'To Approve'
        ? { ...r, status: 'Approved', remarks: 'Bulk approved.' }
        : r,
    ));
    message.success(`${ids.length} request(s) approved.`);
  };

  const handleBulkReject = (ids: string[]) => {
    setRequests(prev => prev.map(r =>
      ids.includes(r.id) && r.status === 'To Approve'
        ? { ...r, status: 'Rejected', remarks: 'Bulk rejected.' }
        : r,
    ));
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

  // ── Is form view active (hide tab bar) ───────────────────────────────────────
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
              <BankOutlined style={{ color: '#fff', fontSize: 16 }} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>Provident Fund</div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>PF Loan Request Management</div>
            </div>
          </div>

          {/* Right: Tab Buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            {(['my-request', 'approvals'] as ActiveTab[]).map(tab => {
              const labels: Record<ActiveTab, string> = { 'my-request': 'My Request', 'approvals': 'Approvals' };
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => switchTab(tab)}
                  style={{
                    padding: '6px 18px',
                    borderRadius: 8,
                    border: `1.5px solid ${isActive ? '#0d9488' : '#d1d5db'}`,
                    background: isActive ? '#e0f2f1' : '#fff',
                    color: isActive ? '#0f766e' : '#374151',
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
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {/* MY REQUEST TAB */}
        {activeTab === 'my-request' && (
          <>
            {myRequestView === 'list' && (
              <PFMyRequestListView
                requests={requests}
                onCreateNew={handleCreate}
                onView={handleViewMyRequest}
                onCancel={handleCancelRequest}
              />
            )}
            {myRequestView === 'create' && (
              <PFLoanRequestForm
                mode="create"
                onBack={() => setMyRequestView('list')}
                onSubmit={handleSubmitRequest}
              />
            )}
            {myRequestView === 'view-only' && activeRequest && (
              <PFLoanRequestForm
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
              <PFApprovalsListView
                requests={requests}
                onApproveReject={handleOpenApproval}
                onBulkApprove={handleBulkApprove}
                onBulkReject={handleBulkReject}
              />
            )}
            {approvalView === 'view-approve' && activeRequest && (
              <PFLoanRequestForm
                mode="view-approve"
                request={activeRequest}
                onBack={() => { setApprovalView('list'); setActiveRequest(null); }}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            )}
            {approvalView === 'view-only' && activeRequest && (
              <PFLoanRequestForm
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
