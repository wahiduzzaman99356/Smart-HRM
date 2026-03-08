/**
 * ShiftChangeForm
 * ─────────────────────────────────────────────────────────────────────────────
 * Used in two modes:
 *  "create"       – Employee creates a new shift change / exchange request
 *  "view-approve" – Approver reviews and approves / rejects a request
 *  "view-only"    – Employee views their own submitted request (read-only)
 */

import { useState, useEffect } from 'react';
import { Button, Select, Input, Radio, DatePicker, Table, message } from 'antd';
import type { TableColumnsType } from 'antd';
import {
  LeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import {
  ShiftChangeRequest,
  ShiftChangeType,
  Shift,
  ExchangeableEmployee,
  AVAILABLE_SHIFTS,
  CURRENT_EMPLOYEE_SHIFT,
  EXCHANGEABLE_EMPLOYEES,
  STATUS_STYLE,
  nextRequestId,
  nowTs,
} from '../types/shift-change.types';

// ─── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  mode: 'create' | 'view-approve' | 'view-only';
  request?: ShiftChangeRequest;          // pre-filled for view modes
  onBack: () => void;
  onSubmit?: (req: ShiftChangeRequest) => void;  // create mode
  onApprove?: (id: string, remarks: string, exchangeWith?: ExchangeableEmployee, assignedEmployee?: ExchangeableEmployee) => void;
  onReject?: (id: string, remarks: string) => void;
}

// ─── Policy Note ───────────────────────────────────────────────────────────────
function PolicyNote() {
  return (
    <div
      style={{
        border: '1px solid rgba(13, 148, 136, 0.25)',
        borderRadius: 12,
        padding: '18px 20px',
        background: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(2px)',
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 14, color: '#111827', marginBottom: 14, textAlign: 'center' }}>
        Note
      </div>
      <ul style={{ listStyle: 'disc', paddingLeft: 20, margin: 0 }}>
        {[
          'You cannot request a shift change more than 3 times within a month',
          'A shift change request cannot be applied for more than 1 day at a time.',
          'The request must be submitted at least 3 working days before the desired shift change date.',
        ].map((note, i) => (
          <li key={i} style={{ fontSize: 13, color: '#374151', marginBottom: 10, lineHeight: 1.6 }}>
            {note}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Exchangeable Employee Table ───────────────────────────────────────────────
function ExchangeableEmployeeTable({
  employees,
  selected,
  onSelect,
  readOnly,
  title,
}: {
  employees: ExchangeableEmployee[];
  selected?: ExchangeableEmployee;
  onSelect?: (emp: ExchangeableEmployee) => void;
  readOnly?: boolean;
  title?: string;
}) {
  const cols: TableColumnsType<ExchangeableEmployee> = [
    {
      title: 'Employee ID',
      dataIndex: 'employeeId',
      key: 'id',
      width: '22%',
      ellipsis: { showTitle: true },
      render: v => <span style={{ fontSize: 12, color: '#374151', whiteSpace: 'nowrap' }}>{v}</span>,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '28%',
      ellipsis: { showTitle: true },
      render: v => <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{v}</span>,
    },
    {
      title: 'Designation',
      dataIndex: 'designation',
      key: 'des',
      width: '26%',
      ellipsis: { showTitle: true },
      render: v => <span style={{ fontSize: 12, color: '#6b7280' }}>{v}</span>,
    },
    {
      title: 'Shift',
      dataIndex: 'shift',
      key: 'shift',
      width: '24%',
      ellipsis: { showTitle: true },
      render: v => <span style={{ fontSize: 12, color: '#0d9488', whiteSpace: 'nowrap' }}>{v}</span>,
    },
  ];

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10, textAlign: 'center' }}>
        {title ?? 'List of Shift Exchangeable Employee'}
      </div>
      <Table
        rowKey="employeeId"
        dataSource={employees}
        columns={cols}
        pagination={false}
        size="small"
        rowSelection={readOnly ? undefined : {
          type: 'radio',
          selectedRowKeys: selected ? [selected.employeeId] : [],
          onChange: (_, rows) => onSelect?.(rows[0]),
        }}
        style={{ border: '1px solid #cce8e5', borderRadius: 8, overflow: 'hidden', background: 'rgba(255,255,255,0.85)' }}
        tableLayout="fixed"
      />
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function ShiftChangeForm({ mode, request, onBack, onSubmit, onApprove, onReject }: Props) {
  const isCreate       = mode === 'create';
  const isViewApprove  = mode === 'view-approve';
  const isViewOnly     = mode === 'view-only';
  const isReadOnly     = isViewApprove || isViewOnly;
  // In view-approve mode the approver must select the exchange employee — only truly locked in view-only
  const isExchangeFieldReadOnly = isViewOnly;

  // Form state (pre-fill from request in view modes)
  const [requestType, setRequestType]       = useState<ShiftChangeType>(request?.requestType ?? 'Change');
  const [selectedDate, setSelectedDate]     = useState<Dayjs | null>(null);
  const [toShiftId, setToShiftId]           = useState<string>(request?.toShift.id ?? '');
  const [exchangeWith, setExchangeWith]         = useState<ExchangeableEmployee | undefined>(request?.exchangeWith);
  const [assignedEmployee, setAssignedEmployee] = useState<ExchangeableEmployee | undefined>(request?.assignedEmployee);
  const [reason, setReason]                     = useState(request?.reason ?? '');
  const [remarks, setRemarks]               = useState('');
  const [rejectError, setRejectError]       = useState(false);
  const [submitting, setSubmitting]         = useState(false);

  // Sync from request when component mounts in view mode
  useEffect(() => {
    if (request) {
      setRequestType(request.requestType);
      setToShiftId(request.toShift.id);
      setExchangeWith(request.exchangeWith);
      setAssignedEmployee(request.assignedEmployee);
      setReason(request.reason);
    }
  }, [request]);

  const toShift: Shift | undefined = AVAILABLE_SHIFTS.find(s => s.id === toShiftId);
  const showExchangePanel = requestType === 'Exchange' && !!toShiftId;

  // Derive exchangeable list (exclude same shift as selected To Shift)
  const exchangeableList = EXCHANGEABLE_EMPLOYEES.filter(e =>
    toShift ? e.shift === toShift.timeRange : true,
  );

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!selectedDate || !toShiftId || (requestType === 'Exchange' && !exchangeWith) || !reason.trim()) {
      message.warning('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    const newReq: ShiftChangeRequest = {
      id: nextRequestId(),
      date: selectedDate.format('DD MMM YYYY'),
      requestType,
      fromShift: CURRENT_EMPLOYEE_SHIFT,
      toShift: toShift!,
      exchangeWith: requestType === 'Exchange' ? exchangeWith : undefined,
      reason: reason.trim(),
      status: 'To Approve',
      employeeId: 'TN-99318',
      employeeName: 'Shanto Karmoker',
      designation: 'Business Analyst',
      department: 'Business Analysis',
      section: 'Analytics',
      createdAt: nowTs(),
    };
    setTimeout(() => {
      setSubmitting(false);
      onSubmit?.(newReq);
      message.success(`Request ${newReq.id} submitted successfully.`);
    }, 400);
  };

  const [exchangeError, setExchangeError] = useState(false);

  const handleApprove = () => {
    if (requestType === 'Exchange' && !exchangeWith) {
      setExchangeError(true);
      message.warning('Please select the employee to exchange shift with.');
      return;
    }
    setExchangeError(false);
    onApprove?.(request!.id, remarks, exchangeWith, assignedEmployee);
    message.success('Request approved.');
  };

  const handleReject = () => {
    if (!remarks.trim()) { setRejectError(true); return; }
    setRejectError(false);
    onReject?.(request!.id, remarks.trim());
    message.success('Request rejected.');
  };

  const handleReset = () => {
    setRequestType('Change');
    setSelectedDate(null);
    setToShiftId('');
    setExchangeWith(undefined);
    setReason('');
  };

  // ─── Left Column (Form) ───────────────────────────────────────────────────────
  const leftPanel = (
    <div style={{ flex: 1, minWidth: 0, paddingRight: 28 }}>
      {/* Current Shift Info */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: '#374151', marginBottom: 2 }}>
          <strong>Current Shift Name:</strong>{' '}
          {isCreate ? CURRENT_EMPLOYEE_SHIFT.name : request?.fromShift.name}
        </div>
        <div style={{ fontSize: 13, color: '#374151' }}>
          <strong>Time:</strong>{' '}
          {isCreate ? CURRENT_EMPLOYEE_SHIFT.timeRange : request?.fromShift.timeRange}
        </div>
      </div>

      {/* Status badge (view modes) */}
      {isReadOnly && request && (
        <div style={{ marginBottom: 16 }}>
          {(() => {
            const st = STATUS_STYLE[request.status];
            return (
              <span style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, color: st.color, background: st.bg, border: `1px solid ${st.border}` }}>
                {request.status}
              </span>
            );
          })()}
        </div>
      )}

      {/* Type selector */}
      <div style={{ marginBottom: 18 }}>
        <Radio.Group
          value={requestType}
          onChange={e => { if (!isReadOnly) setRequestType(e.target.value); }}
          disabled={isReadOnly}
        >
          <Radio value="Change"><span style={{ fontWeight: 500, fontSize: 14 }}>Change</span></Radio>
          <Radio value="Exchange"><span style={{ fontWeight: 500, fontSize: 14 }}>Exchange</span></Radio>
        </Radio.Group>
      </div>

      {/* Date + To Shift */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: '#374151', marginBottom: 6, fontWeight: 500 }}>
            Select Date <span style={{ color: '#dc2626' }}>*</span>
          </div>
          {isReadOnly ? (
            <div style={{ fontSize: 13, color: '#111827', padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: 6, background: '#f9fafb' }}>
              {request?.date ?? '—'}
            </div>
          ) : (
            <DatePicker value={selectedDate} onChange={setSelectedDate} style={{ width: '100%' }} format="DD MMM YYYY" />
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: '#374151', marginBottom: 6, fontWeight: 500 }}>
            To Shift <span style={{ color: '#dc2626' }}>*</span>
          </div>
          {isReadOnly ? (
            <div style={{ fontSize: 13, color: '#111827', padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: 6, background: '#f9fafb' }}>
              {request?.toShift.name ?? '—'}
            </div>
          ) : (
            <Select
              value={toShiftId || undefined}
              onChange={v => { setToShiftId(v); setExchangeWith(undefined); }}
              placeholder="Select"
              style={{ width: '100%' }}
              options={AVAILABLE_SHIFTS.filter(s => s.id !== CURRENT_EMPLOYEE_SHIFT.id).map(s => ({ value: s.id, label: s.name }))}
            />
          )}
        </div>
      </div>

      {/* Shift Info Box */}
      {toShift && (
        <div style={{ border: '1px solid #d1d5db', borderRadius: 8, padding: '12px 14px', marginBottom: 16, background: '#f9fafb', fontSize: 13, color: '#374151', lineHeight: 1.7 }}>
          <div><strong>Shift Name:</strong> {toShift.name}</div>
          <div><strong>Time:</strong> {toShift.timeRange}</div>
          {toShift.policy && <div><strong>Policy:</strong> {toShift.policy}</div>}
        </div>
      )}

      {/* Assign to Employee — Change type, view-approve only */}
      {requestType === 'Change' && (isViewApprove || (isViewOnly && request?.assignedEmployee)) && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: '#374151', marginBottom: 6, fontWeight: 500 }}>
            Assign to Employee
            <span style={{ color: '#9ca3af', fontWeight: 400 }}> (optional)</span>
          </div>
          {isViewOnly ? (
            <div style={{ fontSize: 13, color: '#111827', padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: 6, background: '#f9fafb' }}>
              {assignedEmployee ? `${assignedEmployee.name} (${assignedEmployee.employeeId}) — ${assignedEmployee.designation}` : '—'}
            </div>
          ) : (
            <Select
              showSearch
              allowClear
              style={{ width: '100%' }}
              placeholder="Search by name or ID…"
              value={assignedEmployee?.employeeId ?? undefined}
              filterOption={(input, opt) =>
                (opt?.label as string ?? '').toLowerCase().includes(input.toLowerCase())
              }
              onChange={id => {
                const emp = id ? exchangeableList.find(e => e.employeeId === id) : undefined;
                setAssignedEmployee(emp);
              }}
              options={exchangeableList.map(e => ({
                value: e.employeeId,
                label: `${e.name} (${e.employeeId}) — ${e.designation}`,
              }))}
            />
          )}
        </div>
      )}

      {/* Exchange With (only for Exchange type) */}
      {requestType === 'Exchange' && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: '#374151', marginBottom: 6, fontWeight: 500 }}>
            Exchange with <span style={{ color: '#dc2626' }}>*</span>
          </div>
          {isExchangeFieldReadOnly ? (
            <div style={{ fontSize: 13, color: '#111827', padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: 6, background: '#f9fafb' }}>
              {exchangeWith ? `${exchangeWith.name} (${exchangeWith.employeeId}) — ${exchangeWith.designation}` : '—'}
            </div>
          ) : (
            <>
              <Select
                showSearch
                allowClear
                style={{ width: '100%' }}
                placeholder="Search by name or ID…"
                status={exchangeError ? 'error' : ''}
                value={exchangeWith?.employeeId ?? undefined}
                filterOption={(input, opt) =>
                  (opt?.label as string ?? '').toLowerCase().includes(input.toLowerCase())
                }
                onChange={id => {
                  const emp = id ? exchangeableList.find(e => e.employeeId === id) : undefined;
                  setExchangeWith(emp);
                  if (emp) setExchangeError(false);
                }}
                options={exchangeableList.map(e => ({
                  value: e.employeeId,
                  label: `${e.name} (${e.employeeId}) — ${e.designation}`,
                }))}
              />
              {exchangeError && (
                <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>
                  Please select an employee to exchange shift with.
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Reason */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, color: '#374151', marginBottom: 6, fontWeight: 500 }}>
          Reason <span style={{ color: '#dc2626' }}>*</span>
        </div>
        <Input.TextArea
          value={reason}
          onChange={e => { if (!isReadOnly) setReason(e.target.value); }}
          rows={3}
          placeholder="Briefly describe your reason for the shift change..."
          readOnly={isReadOnly}
          style={{ background: isReadOnly ? '#f9fafb' : '#fff', resize: 'none' }}
        />
      </div>

      {/* Approver remarks (view-approve mode) */}
      {isViewApprove && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: '#374151', marginBottom: 6, fontWeight: 500 }}>
            Remarks{' '}
            <span style={{ color: '#dc2626' }}>*</span>
            <span style={{ color: '#9ca3af', fontWeight: 400 }}> (mandatory for rejection)</span>
          </div>
          <Input.TextArea
            value={remarks}
            onChange={e => { setRemarks(e.target.value); if (e.target.value.trim()) setRejectError(false); }}
            rows={3}
            placeholder="Enter your remarks..."
            status={rejectError ? 'error' : ''}
            style={{ resize: 'none' }}
          />
          {rejectError && (
            <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>
              Remarks are mandatory when rejecting a request.
            </div>
          )}
        </div>
      )}

      {/* Previous remarks (view-only after decision) */}
      {isViewOnly && request?.remarks && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: '#374151', marginBottom: 6, fontWeight: 500 }}>Approver Remarks</div>
          <div style={{ fontSize: 13, color: '#374151', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6, background: '#f9fafb' }}>
            {request.remarks}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {isCreate && (
        <div style={{ display: 'flex', gap: 12 }}>
          <Button onClick={handleReset}>Reset</Button>
          <Button type="primary" loading={submitting} onClick={handleSubmit} style={{ background: '#0d9488', borderColor: '#0d9488' }}>
            Apply
          </Button>
        </div>
      )}

      {isViewApprove && (
        <div style={{ display: 'flex', gap: 12 }}>
          <Button
            danger
            icon={<CloseCircleOutlined />}
            onClick={handleReject}
          >
            Reject
          </Button>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={handleApprove}
            style={{ background: '#0d9488', borderColor: '#0d9488' }}
          >
            Approve
          </Button>
        </div>
      )}
    </div>
  );

  // ─── Right Column (Note + Exchange Table) ─────────────────────────────────────
  const rightPanel = (
    <div
      style={{
        flex: '0 0 50%',
        width: '50%',
        marginLeft: 28,
        borderRadius: 14,
        padding: '20px 20px 24px',
        // Teal dot-grid texture
        backgroundColor: '#f0fdfa',
        backgroundImage: 'radial-gradient(rgba(13, 148, 136, 0.18) 1.5px, transparent 1.5px)',
        backgroundSize: '18px 18px',
        border: '1px solid #ccfbf1',
        boxSizing: 'border-box',
      }}
    >
      <PolicyNote />

      {/* Exchange type — peer employee table */}
      {(showExchangePanel || (isReadOnly && requestType === 'Exchange')) && (
        <ExchangeableEmployeeTable
          title="List of Shift Exchangeable Employee"
          employees={
            isViewOnly
              ? (exchangeWith ? [exchangeWith] : EXCHANGEABLE_EMPLOYEES)
              : exchangeableList
          }
          selected={exchangeWith}
          onSelect={isExchangeFieldReadOnly ? undefined : emp => { setExchangeWith(emp); setExchangeError(false); }}
          readOnly={isExchangeFieldReadOnly}
        />
      )}

      {/* Change type — employee assignment table (approver only) */}
      {requestType === 'Change' && isViewApprove && !!toShiftId && (
        <ExchangeableEmployeeTable
          title="Employees on Target Shift"
          employees={exchangeableList}
          selected={assignedEmployee}
          onSelect={setAssignedEmployee}
          readOnly={false}
        />
      )}

      {/* Change type — view-only: show the assigned employee */}
      {requestType === 'Change' && isViewOnly && !!assignedEmployee && (
        <ExchangeableEmployeeTable
          title="Assigned Employee"
          employees={[assignedEmployee]}
          selected={assignedEmployee}
          readOnly={true}
        />
      )}
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#fff' }}>
      {/* Page Header */}
      <div
        style={{
          padding: '14px 28px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: '#fff',
          position: 'sticky',
          top: 0,
          zIndex: 5,
        }}
      >
        <Button
          type="text"
          icon={<LeftOutlined />}
          onClick={onBack}
          style={{ color: '#6b7280' }}
        >
          Back
        </Button>
        <div style={{ width: 1, height: 20, background: '#e5e7eb' }} />
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>
            Shift Change / Exchange
            {request && <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 400, marginLeft: 8 }}>#{request.id}</span>}
          </div>
          {isCreate && (
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 1 }}>
              Current Shift Name: {CURRENT_EMPLOYEE_SHIFT.name} &nbsp;|&nbsp; Time: {CURRENT_EMPLOYEE_SHIFT.timeRange}
            </div>
          )}
          {isReadOnly && request && (
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 1 }}>
              {request.employeeName} &nbsp;·&nbsp; {request.designation} &nbsp;·&nbsp; {request.department}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', padding: '24px 28px', gap: 0, alignItems: 'flex-start', minWidth: 0 }}>
        {leftPanel}
        {rightPanel}
      </div>
    </div>
  );
}
