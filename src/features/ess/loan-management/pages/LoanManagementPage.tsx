/**
 * LoanManagementPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * ESS → Loan Management module
 *
 * Two tabs:
 *  My Loan    – Employee's own loan/advance requests (list + create + view)
 *  Approvals  – Manager view to approve/reject requests
 */

import { useState, useMemo } from 'react';
import { DollarOutlined } from '@ant-design/icons';

import { LoanMyListView }       from '../components/LoanMyListView';
import { LoanRequestForm }      from '../components/LoanRequestForm';
import { LoanApprovalsListView }from '../components/LoanApprovalsListView';
import { LoanApproveRejectView }from '../components/LoanApproveRejectView';
import { LoanRequest, INITIAL_LOAN_REQUESTS } from '../types/loan.types';

// ─── Tab Types ─────────────────────────────────────────────────────────────────
type ActiveTab    = 'my-loan' | 'approvals';
type MyLoanView   = 'list' | 'create' | 'view-only';
type ApprovalView = 'list' | 'approve-reject' | 'view-only';

// ─── Component ─────────────────────────────────────────────────────────────────
export default function LoanManagementPage() {
  const [activeTab,    setActiveTab]    = useState<ActiveTab>('my-loan');
  const [myLoanView,   setMyLoanView]   = useState<MyLoanView>('list');
  const [approvalView, setApprovalView] = useState<ApprovalView>('list');
  const [activeRequest,setActiveRequest]= useState<LoanRequest | null>(null);

  const [requests, setRequests] = useState<LoanRequest[]>(INITIAL_LOAN_REQUESTS);

  // ── My Loan handlers ─────────────────────────────────────────────────────────
  const handleCreate = () => { setActiveRequest(null); setActiveTab('my-loan'); setMyLoanView('create'); };

  const handleViewMyRequest = (req: LoanRequest) => {
    setActiveRequest(req);
    setMyLoanView('view-only');
  };

  const handleCancelRequest = (id: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Cancelled' } : r));
  };

  const handleSubmitRequest = (req: LoanRequest) => {
    setRequests(prev => [req, ...prev]);
    setMyLoanView('list');
  };

  // ── Approval handlers ────────────────────────────────────────────────────────
  const handleOpenApproval = (req: LoanRequest) => {
    setActiveRequest(req);
    setApprovalView(req.status === 'To Approve' ? 'approve-reject' : 'view-only');
  };

  const handleApprove = (id: string, remarks: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Approved', remarks } : r));
    setApprovalView('list');
    setActiveRequest(null);
  };

  const handleReject = (id: string, remarks: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Rejected', remarks } : r));
    setApprovalView('list');
    setActiveRequest(null);
  };

  // ── Pending badge count ───────────────────────────────────────────────────────
  const pendingCount = useMemo(() => requests.filter(r => r.status === 'To Approve').length, [requests]);

  // ── Tab switch (reset sub-views) ──────────────────────────────────────────────
  const switchTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMyLoanView('list');
    setApprovalView('list');
    setActiveRequest(null);
  };

  // ── Hide tab bar during form/detail views ─────────────────────────────────────
  const isFormView =
    (activeTab === 'my-loan'   && myLoanView   !== 'list') ||
    (activeTab === 'approvals' && approvalView !== 'list');

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#eef4f5' }}>
      {/* ── Page Header with Tab Switcher ────────────────────────────────────── */}
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
              <DollarOutlined style={{ color: '#fff', fontSize: 16 }} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>Loan Management</div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>Loan & Advance Salary Request</div>
            </div>
          </div>

          {/* Right: Tab Buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            {(['my-loan', 'approvals'] as ActiveTab[]).map(tab => {
              const labels: Record<ActiveTab, string> = { 'my-loan': 'My Loan', 'approvals': 'Approvals' };
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => switchTab(tab)}
                  style={{
                    padding: '6px 20px',
                    borderRadius: 8,
                    border: `1.5px solid ${isActive ? '#0d9488' : '#d1d5db'}`,
                    background: isActive ? '#e0f2f1' : '#fff',
                    color: isActive ? '#0f766e' : '#374151',
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 400,
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'border-color 0.15s, background 0.15s, color 0.15s',
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

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {/* MY LOAN TAB */}
        {activeTab === 'my-loan' && (
          <>
            {myLoanView === 'list' && (
              <LoanMyListView
                requests={requests}
                onCreateNew={handleCreate}
                onView={handleViewMyRequest}
                onCancel={handleCancelRequest}
              />
            )}
            {myLoanView === 'create' && (
              <LoanRequestForm
                mode="create"
                onBack={() => setMyLoanView('list')}
                onSubmit={handleSubmitRequest}
              />
            )}
            {myLoanView === 'view-only' && activeRequest && (
              <LoanRequestForm
                mode="view-only"
                request={activeRequest}
                onBack={() => { setMyLoanView('list'); setActiveRequest(null); }}
              />
            )}
          </>
        )}

        {/* APPROVALS TAB */}
        {activeTab === 'approvals' && (
          <>
            {approvalView === 'list' && (
              <LoanApprovalsListView
                requests={requests}
                onApproveReject={handleOpenApproval}
                onCreateNew={handleCreate}
              />
            )}
            {approvalView === 'approve-reject' && activeRequest && (
              <LoanApproveRejectView
                request={activeRequest}
                onBack={() => { setApprovalView('list'); setActiveRequest(null); }}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            )}
            {approvalView === 'view-only' && activeRequest && (
              <LoanRequestForm
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
