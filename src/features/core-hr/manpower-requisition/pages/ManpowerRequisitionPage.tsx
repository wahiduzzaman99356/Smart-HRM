import { useEffect, useState } from 'react';
import { message } from 'antd';
import { useSearchParams } from 'react-router-dom';
import type {
  RequisitionFormData,
  RequisitionRequest,
  RequisitionStatus,
} from '../types/requisition.types';
import { INITIAL_REQUISITIONS } from '../types/requisition.types';
import { RequisitionListView }   from '../components/RequisitionListView';
import { RequisitionForm }       from '../components/RequisitionForm';
import { ApprovalWorkflowModal } from '../components/ApprovalWorkflowModal';
import { ActionHistoryModal }    from '../components/ActionHistoryModal';
import { ViewRequisitionModal }  from '../components/ViewRequisitionModal';

type View = 'list' | 'create' | 'action';

let counter = 300;

function makeReqId() {
  counter += 1;
  return `MRF200${counter}xx`;
}

function now() {
  return new Date().toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
  });
}

function dateOnly() {
  return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ManpowerRequisitionPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get('mode');

  const [view,          setView]          = useState<View>(mode === 'create' ? 'create' : 'list');
  const [requests,      setRequests]      = useState<RequisitionRequest[]>(INITIAL_REQUISITIONS);
  const [activeRequest, setActiveRequest] = useState<RequisitionRequest | undefined>(undefined);

  const [workflowReq, setWorkflowReq] = useState<RequisitionRequest | null>(null);
  const [historyReq,  setHistoryReq]  = useState<RequisitionRequest | null>(null);
  const [viewReq,     setViewReq]     = useState<RequisitionRequest | null>(null);

  useEffect(() => {
    if (mode === 'create') {
      setView('create');
      setActiveRequest(undefined);
      return;
    }

    if (mode === 'action' && activeRequest) {
      setView('action');
      return;
    }

    setView('list');
    if (mode !== 'action') {
      setActiveRequest(undefined);
    }
  }, [mode, activeRequest]);

  const openCreate = () => {
    setActiveRequest(undefined);
    setView('create');
    setSearchParams({ mode: 'create' });
  };

  const openAction = (request: RequisitionRequest) => {
    setActiveRequest(request);
    setView('action');
    setSearchParams({ mode: 'action' });
  };

  const goList = () => {
    setView('list');
    setActiveRequest(undefined);
    setSearchParams({});
  };

  const appendHistory = (
    request: RequisitionRequest,
    actionType: RequisitionRequest['actionHistory'][number]['actionType'],
    actor = 'Admin User',
  ): RequisitionRequest => ({
    ...request,
    actionHistory: [...request.actionHistory, { initiatedBy: actor, timestamp: now(), actionType }],
  });

  const createNew = (data: RequisitionFormData, status: RequisitionStatus) => {
    const id = makeReqId();
    const request: RequisitionRequest = {
      id,
      refNo: data.refNo || 'TSLXXXX',
      initiateDate: dateOnly(),
      requested: Number(data.vacancyNumber) || 0,
      approved: status === 'Approved' ? Number(data.vacancyNumber) || 0 : 0,
      status,
      department: 'Operation',
      designation: 'Executive',
      attachments: [],
      formData: data,
      approvalWorkflow: [
        {
          approverName: 'Approver 1',
          action: status === 'Approved' ? 'Approved' : status === 'Rejected' ? 'Rejected' : 'Pending',
          timestamp: status === 'Pending' || status === 'Draft' ? undefined : now(),
        },
        { approverName: 'Approver 2', action: 'Pending' },
      ],
      actionHistory: [{ initiatedBy: 'Admin User', timestamp: now(), actionType: 'Created' }],
    };
    setRequests(prev => [request, ...prev]);
    goList();
    if (status === 'Draft')    message.success(`Draft ${id} saved.`);
    if (status === 'Pending')  message.success(`Request ${id} submitted.`);
    if (status === 'Approved') message.success(`Request ${id} approved.`);
    if (status === 'Rejected') message.success(`Request ${id} rejected.`);
  };

  const updateExisting = (
    targetId: string,
    updater: (prev: RequisitionRequest) => RequisitionRequest,
  ) => setRequests(prev => prev.map(r => r.id === targetId ? updater(r) : r));

  const handleStatusChange = (id: string, status: RequisitionStatus) => {
    updateExisting(id, prev => appendHistory({ ...prev, status }, 'Updated'));
    message.success(`Status updated to ${status}.`);
  };

  const handleSubmitFromList = (id: string) => {
    updateExisting(id, prev => appendHistory({ ...prev, status: 'Pending' }, 'Submitted'));
    message.success(`Request ${id} submitted.`);
  };

  const handleSaveDraft = (data: RequisitionFormData) => {
    if (view === 'create') { createNew(data, 'Draft'); return; }
    if (!activeRequest) return;
    updateExisting(activeRequest.id, prev =>
      appendHistory({ ...prev, formData: data, requested: Number(data.vacancyNumber) || prev.requested }, 'Draft Saved'),
    );
    message.success('Draft changes saved.');
    goList();
  };

  const handleSubmit = (data: RequisitionFormData) => {
    if (view === 'create') { createNew(data, 'Pending'); return; }
    if (!activeRequest) return;
    updateExisting(activeRequest.id, prev =>
      appendHistory({ ...prev, formData: data, requested: Number(data.vacancyNumber) || prev.requested, status: 'Pending' }, 'Submitted'),
    );
    message.success('Request submitted.');
    goList();
  };

  const handleApprove = (data: RequisitionFormData) => {
    if (view === 'create') { createNew(data, 'Approved'); return; }
    if (!activeRequest) return;
    updateExisting(activeRequest.id, prev => appendHistory({
      ...prev,
      formData: data,
      requested: Number(data.vacancyNumber) || prev.requested,
      approved:  Number(data.vacancyNumber) || prev.approved,
      status: 'Approved',
      approvalWorkflow: prev.approvalWorkflow.map((step, i) =>
        i === 0 ? { ...step, action: 'Approved', timestamp: now() } : step,
      ),
    }, 'Approved'));
    message.success('Request approved.');
    goList();
  };

  const handleReject = (data: RequisitionFormData) => {
    if (view === 'create') { createNew(data, 'Rejected'); return; }
    if (!activeRequest) return;
    updateExisting(activeRequest.id, prev => appendHistory({
      ...prev,
      formData: data,
      requested: Number(data.vacancyNumber) || prev.requested,
      status: 'Rejected',
      approvalWorkflow: prev.approvalWorkflow.map((step, i) =>
        i === 0 ? { ...step, action: 'Rejected', timestamp: now(), reason: 'Rejected in action form' } : step,
      ),
    }, 'Rejected'));
    message.success('Request rejected.');
    goList();
  };

  return (
    <>
      {view === 'list' && (
        <RequisitionListView
          requests={requests}
          onAddNew={openCreate}
          onViewRequest={setViewReq}
          onTakeAction={openAction}
          onSubmitRequest={handleSubmitFromList}
          onViewWorkflow={setWorkflowReq}
          onViewHistory={setHistoryReq}
          onStatusChange={handleStatusChange}
        />
      )}

      {(view === 'create' || (view === 'action' && activeRequest)) && (
        <RequisitionForm
          mode={view === 'create' ? 'create' : 'action'}
          request={activeRequest}
          onBack={goList}
          onSaveDraft={handleSaveDraft}
          onSubmitRequest={handleSubmit}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      <ViewRequisitionModal  request={viewReq}     onClose={() => setViewReq(null)} />
      <ApprovalWorkflowModal request={workflowReq} onClose={() => setWorkflowReq(null)} />
      <ActionHistoryModal    request={historyReq}  onClose={() => setHistoryReq(null)} />
    </>
  );
}
