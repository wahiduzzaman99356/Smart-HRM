/**
 * ManpowerHeadcountPage
 * Orchestrates list ↔ create ↔ action views and all modal dialogs.
 */

import { useState } from 'react';
import { message } from 'antd';
import type { HCRequest, HCOrgLevelRow } from '../types/headcount.types';
import { INITIAL_REQUESTS } from '../types/headcount.types';
import { HeadcountListView }    from '../components/HeadcountListView';
import { InitiateHeadcountForm } from '../components/InitiateHeadcountForm';
import { ApprovalWorkflowModal } from '../components/ApprovalWorkflowModal';
import { ActionHistoryModal }    from '../components/ActionHistoryModal';
import { ViewRequestModal }      from '../components/ViewRequestModal';

type View = 'list' | 'create' | 'action';

// ─── Ref generator ────────────────────────────────────────────────────────────
let refCounter = 144;
function nextRef(): string {
  return `TSL-2026-00${refCounter++}`;
}

function nowTs(): string {
  return new Date().toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
  });
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ManpowerHeadcountPage() {
  const [view,          setView]          = useState<View>('list');
  const [requests,      setRequests]      = useState<HCRequest[]>(INITIAL_REQUESTS);
  const [actionRequest, setActionRequest] = useState<HCRequest | null>(null);

  // Modals
  const [workflowReq, setWorkflowReq] = useState<HCRequest | null>(null);
  const [historyReq,  setHistoryReq]  = useState<HCRequest | null>(null);
  const [viewReq,     setViewReq]     = useState<HCRequest | null>(null);

  // ── Create ──────────────────────────────────────────────────────────────────
  const handleCreate = (
    draft: Omit<HCRequest, 'id' | 'approvalWorkflow' | 'actionHistory'>,
  ) => {
    const newReq: HCRequest = {
      ...draft,
      id: nextRef(),
      approvalWorkflow: [
        { approverName: 'Approver 1', approverId: '', action: 'Pending' },
        { approverName: 'Approver 2', approverId: '', action: 'Pending' },
      ],
      actionHistory: [{ initiatedBy: 'Admin User', timestamp: nowTs(), actionType: 'Created' }],
    };
    setRequests(prev => [newReq, ...prev]);
    setView('list');
    message.success(`Request ${newReq.id} created successfully.`);
  };

  // ── Submit Draft → Pending ──────────────────────────────────────────────────
  const handleSubmit = (id: string) => {
    setRequests(prev => prev.map(r => r.id !== id ? r : {
      ...r,
      status: 'Pending',
      actionHistory: [...r.actionHistory, { initiatedBy: 'Admin User', timestamp: nowTs(), actionType: 'Submitted' }],
    }));
    message.success(`Request ${id} submitted for approval.`);
  };

  // ── Approve ─────────────────────────────────────────────────────────────────
  const handleApprove = (id: string, updatedRows: HCOrgLevelRow[]) => {
    const totalReqHC = updatedRows.reduce((s, r) => s + (parseInt(r.requiredHC, 10) || 0), 0);
    setRequests(prev => prev.map(r => r.id !== id ? r : {
      ...r,
      status: 'Approved',
      rows: updatedRows,
      totalReqHC,
      approvalWorkflow: r.approvalWorkflow.map((step, i) =>
        i === r.approvalWorkflow.findIndex(s => s.action === 'Pending')
          ? { ...step, action: 'Approved', timestamp: nowTs() }
          : step,
      ),
      actionHistory: [...r.actionHistory, { initiatedBy: 'Admin User', timestamp: nowTs(), actionType: 'Approved' }],
    }));
    setView('list');
    setActionRequest(null);
    message.success(`Request ${id} approved.`);
  };

  // ── Reject ──────────────────────────────────────────────────────────────────
  const handleReject = (id: string, reasonLabel: string, note: string) => {
    setRequests(prev => prev.map(r => r.id !== id ? r : {
      ...r,
      status: 'Rejected',
      approvalWorkflow: r.approvalWorkflow.map((step, i) =>
        i === r.approvalWorkflow.findIndex(s => s.action === 'Pending')
          ? {
              ...step,
              action: 'Rejected',
              timestamp: nowTs(),
              reason: reasonLabel,
              note: note || undefined,
            }
          : step,
      ),
      actionHistory: [...r.actionHistory, { initiatedBy: 'Admin User', timestamp: nowTs(), actionType: 'Rejected' }],
    }));
    setView('list');
    setActionRequest(null);
    message.success(`Request ${id} rejected.`);
  };

  // ── Open action view ────────────────────────────────────────────────────────
  const openActionView = (req: HCRequest) => {
    setActionRequest(req);
    setView('action');
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      {view === 'list' && (
        <HeadcountListView
          requests={requests}
          onCreate={() => setView('create')}
          onViewRequest={setViewReq}
          onTakeAction={openActionView}
          onViewWorkflow={setWorkflowReq}
          onViewHistory={setHistoryReq}
          onSubmit={handleSubmit}
        />
      )}

      {view === 'create' && (
        <InitiateHeadcountForm
          mode="create"
          onBack={() => setView('list')}
          onSubmit={handleCreate}
        />
      )}

      {view === 'action' && actionRequest && (
        <InitiateHeadcountForm
          mode="action"
          existingRequest={actionRequest}
          onBack={() => { setView('list'); setActionRequest(null); }}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      <ViewRequestModal      request={viewReq}     onClose={() => setViewReq(null)} />
      <ApprovalWorkflowModal request={workflowReq} onClose={() => setWorkflowReq(null)} />
      <ActionHistoryModal    request={historyReq}  onClose={() => setHistoryReq(null)} />
    </>
  );
}
