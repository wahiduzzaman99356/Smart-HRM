/**
 * ManpowerHeadcountPage
 * Orchestrates list ↔ create ↔ action views and all modal dialogs.
 */

import { useEffect, useState } from 'react';
import { message } from 'antd';
import { useSearchParams } from 'react-router-dom';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const [view,          setView]          = useState<View>(mode === 'create' ? 'create' : 'list');
  const [requests,      setRequests]      = useState<HCRequest[]>(INITIAL_REQUESTS);
  const [actionRequest, setActionRequest] = useState<HCRequest | null>(null);

  // Modals
  const [workflowReq, setWorkflowReq] = useState<HCRequest | null>(null);
  const [historyReq,  setHistoryReq]  = useState<HCRequest | null>(null);
  const [viewReq,     setViewReq]     = useState<HCRequest | null>(null);

  useEffect(() => {
    if (mode === 'create') {
      setView('create');
      setActionRequest(null);
      return;
    }

    if (mode === 'action' && actionRequest) {
      setView('action');
      return;
    }

    setView('list');
    if (mode !== 'action') {
      setActionRequest(null);
    }
  }, [mode, actionRequest]);

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
    setSearchParams({});
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
    setSearchParams({});
    message.success(`Request ${id} approved.`);
  };

  // ── Reject ──────────────────────────────────────────────────────────────────
  const handleReject = (id: string, updatedRows: HCOrgLevelRow[], reasonLabel: string, note: string) => {
    const totalReqHC = updatedRows.reduce((s, r) => s + (parseInt(r.requiredHC, 10) || 0), 0);
    setRequests(prev => prev.map(r => r.id !== id ? r : {
      ...r,
      status: 'Rejected',
      rows: updatedRows,
      totalReqHC,
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
    setSearchParams({});
    message.success(`Request ${id} rejected.`);
  };

  // ── Open action view ────────────────────────────────────────────────────────
  const openActionView = (req: HCRequest) => {
    setActionRequest(req);
    setView('action');
    setSearchParams({ mode: 'action' });
  };

  const openCreateView = () => {
    setView('create');
    setSearchParams({ mode: 'create' });
  };

  const backToList = () => {
    setView('list');
    setActionRequest(null);
    setSearchParams({});
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      {view === 'list' && (
        <HeadcountListView
          requests={requests}
          onCreate={openCreateView}
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
          onBack={backToList}
          onSubmit={handleCreate}
        />
      )}

      {view === 'action' && actionRequest && (
        <InitiateHeadcountForm
          mode="action"
          existingRequest={actionRequest}
          onBack={backToList}
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
