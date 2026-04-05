import { useState } from 'react';
import { Button, Select, Input, message, Upload } from 'antd';
import { ArrowLeftOutlined, UploadOutlined, PaperClipOutlined, EyeOutlined } from '@ant-design/icons';
import {
  PFLoanRequest,
  PFLoanStatus,
  STATUS_STYLE,
  GUARANTOR_EMPLOYEES,
  CURRENT_EMPLOYEE_PF_BALANCE,
  PF_POLICY_NOTES,
  nextPFRequestId,
  nowTs,
  todayLabel,
} from '../types/provident-fund.types';

export type PFFormMode = 'create' | 'view-approve' | 'view-only';

interface Props {
  mode: PFFormMode;
  request?: PFLoanRequest;
  onBack: () => void;
  onSubmit?: (req: PFLoanRequest) => void;
  onApprove?: (id: string, remarks: string) => void;
  onReject?: (id: string, remarks: string) => void;
}

export function PFLoanRequestForm({ mode, request, onBack, onSubmit, onApprove, onReject }: Props) {
  // Form state (create / view-approve fills from request)
  const [loanAmount,   setLoanAmount]   = useState<string>(request ? String(request.loanAmount) : '');
  const [reason,       setReason]       = useState(request?.reason ?? '');
  const [guarantorId,  setGuarantorId]  = useState(request?.guarantorEmployeeId ?? '');
  const [attachName,   setAttachName]   = useState(request?.attachmentName ?? '');
  const [remarks,      setRemarks]      = useState('');

  const bal = CURRENT_EMPLOYEE_PF_BALANCE;
  const isReadOnly = mode === 'view-only';

  // ── Submit (create) ──────────────────────────────────────────────────────────
  const handleApply = () => {
    if (!loanAmount || isNaN(Number(loanAmount)) || Number(loanAmount) <= 0) {
      message.error('Please enter a valid loan amount.'); return;
    }
    if (!reason.trim()) { message.error('Please enter a reason.'); return; }
    if (!guarantorId)   { message.error('Please select a guarantor employee.'); return; }

    const guarantor = GUARANTOR_EMPLOYEES.find(e => e.employeeId === guarantorId)!;
    const newReq: PFLoanRequest = {
      id:                   nextPFRequestId(),
      initiateDate:         todayLabel(),
      loanAmount:           Number(loanAmount),
      reason,
      guarantorEmployeeId:  guarantorId,
      guarantorEmployeeName: guarantor.name,
      attachmentName:       attachName || undefined,
      status:               'To Approve',
      employeeId:           'TN-99318',
      employeeName:         'Shanto Karmoker',
      designation:          'Business Analyst',
      department:           'Business Analysis',
      section:              'Analytics',
      createdAt:            nowTs(),
    };
    onSubmit?.(newReq);
    message.success('Loan request submitted successfully.');
  };

  const handleReset = () => {
    setLoanAmount(''); setReason(''); setGuarantorId(''); setAttachName('');
  };

  // ── Approve ──────────────────────────────────────────────────────────────────
  const handleApprove = () => {
    onApprove?.(request!.id, remarks.trim() || 'Approved.');
    message.success('Request approved.');
  };

  // ── Reject ───────────────────────────────────────────────────────────────────
  const handleReject = () => {
    if (!remarks.trim()) { message.error('Please provide remarks before rejecting.'); return; }
    onReject?.(request!.id, remarks.trim());
    message.success('Request rejected.');
  };

  // ── Status badge (view modes) ────────────────────────────────────────────────
  const statusBadge = (s: PFLoanStatus) => {
    const st = STATUS_STYLE[s];
    return (
      <span style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, color: st.color, background: st.bg, border: `1.5px solid ${st.border}` }}>
        {s}
      </span>
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--color-bg-base)' }}>
      <div style={{ padding: '24px 28px' }}>
        {/* Back + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button
            onClick={onBack}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 500 }}
          >
            <ArrowLeftOutlined /> Back
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
            Provident Fund Loan Request
          </h1>
          {(mode === 'view-only' || mode === 'view-approve') && request && (
            <span style={{ marginLeft: 12 }}>{statusBadge(request.status)}</span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 24 }}>
          {/* ── Left Panel ─────────────────────────────────────────────────── */}
          <div style={{ flex: 1 }}>
            {/* Balance Card */}
            <div style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '18px 22px', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 2 }}>Current Balance</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1 }}>
                    {bal.currentBalance.toLocaleString()}
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-tertiary)', marginLeft: 4 }}>BDT</span>
                  </div>
                </div>
                <div style={{ border: '1.5px solid #d1d5db', borderRadius: 8, padding: '8px 16px', minWidth: 240 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4, paddingBottom: 4, borderBottom: '1px solid var(--color-border)' }}>
                    <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>Employee Contribution</span>
                    <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      {bal.employeeContribution.toLocaleString()}
                      <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginLeft: 3 }}>BDT</span>
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>Employer Contribution</span>
                    <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      {bal.employerContribution.toLocaleString()}
                      <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginLeft: 3 }}>BDT</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '22px 24px' }}>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 18 }}>
                {/* Loan Amount */}
                <div style={{ flex: '0 0 220px' }}>
                  <label style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 500, display: 'block', marginBottom: 6 }}>
                    Loan Amount<span style={{ color: '#dc2626' }}> *</span>
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={loanAmount}
                    onChange={e => setLoanAmount(e.target.value)}
                    readOnly={isReadOnly}
                    suffix={<span style={{ fontSize: 12, color: 'var(--color-text-disabled)' }}>BDT</span>}
                    style={{ borderRadius: 8 }}
                  />
                </div>

                {/* Guarantor Employee */}
                <div style={{ flex: '0 0 260px' }}>
                  <label style={{ fontSize: 13, color: '#dc2626', fontWeight: 500, display: 'block', marginBottom: 6 }}>
                    Guarantor Employee <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  {isReadOnly ? (
                    <div style={{ padding: '6px 12px', background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 13, color: 'var(--color-text-secondary)' }}>
                      {request?.guarantorEmployeeName}
                    </div>
                  ) : (
                    <Select
                      placeholder="Guarantor Employee"
                      value={guarantorId || undefined}
                      onChange={setGuarantorId}
                      style={{ width: '100%', borderRadius: 8 }}
                      options={GUARANTOR_EMPLOYEES.map(e => ({ value: e.employeeId, label: `${e.name} (${e.employeeId})` }))}
                    />
                  )}
                </div>
              </div>

              {/* Reason */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 500, display: 'block', marginBottom: 6 }}>
                  Reason<span style={{ color: '#dc2626' }}> *</span>
                </label>
                <Input.TextArea
                  placeholder="Enter reason for loan request"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  readOnly={isReadOnly}
                  rows={4}
                  style={{ borderRadius: 8, resize: 'none' }}
                />
              </div>

              {/* Attachment */}
              <div style={{ marginBottom: mode === 'create' ? 24 : 18 }}>
                <label style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 500, display: 'block', marginBottom: 6 }}>
                  Attachment <span style={{ fontSize: 12, color: 'var(--color-text-disabled)', fontWeight: 400 }}>(Optional)</span>
                </label>
                {isReadOnly ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {request?.attachmentName ? (
                      <>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', border: '1px solid var(--color-border)', borderRadius: 8, background: 'var(--color-bg-subtle)', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                          <PaperClipOutlined style={{ color: 'var(--color-primary)' }} />
                          {request.attachmentName}
                        </div>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--color-primary)', fontWeight: 500, textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <EyeOutlined /> View
                        </button>
                      </>
                    ) : (
                      <span style={{ fontSize: 13, color: 'var(--color-text-disabled)' }}>No attachment</span>
                    )}
                  </div>
                ) : (
                  <div>
                    <Upload
                      beforeUpload={file => { setAttachName(file.name); return false; }}
                      onRemove={() => setAttachName('')}
                      maxCount={1}
                      fileList={attachName ? [{ uid: '-1', name: attachName, status: 'done' }] : []}
                    >
                      <Button icon={<UploadOutlined />} style={{ borderRadius: 8, padding: '20px 28px', borderStyle: 'dashed', display: 'flex', alignItems: 'center', gap: 8, height: 'auto' }}>
                        <UploadOutlined style={{ fontSize: 20, color: 'var(--color-primary)' }} />
                      </Button>
                    </Upload>
                  </div>
                )}
              </div>

              {/* Approver Remarks (view-approve) */}
              {mode === 'view-approve' && (
                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 500, display: 'block', marginBottom: 6 }}>
                    Remarks
                  </label>
                  <Input.TextArea
                    placeholder="Enter remarks (required for rejection)"
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                    rows={3}
                    style={{ borderRadius: 8, resize: 'none' }}
                  />
                </div>
              )}

              {/* Previous Remarks (view-only after decision) */}
              {mode === 'view-only' && request?.remarks && (
                <div style={{ marginBottom: 18, padding: '12px 16px', background: 'var(--color-primary-tint)', border: '1px solid #99f6e4', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600, marginBottom: 4 }}>Approver Remarks</div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{request.remarks}</div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, paddingTop: 8 }}>
                {mode === 'create' && (
                  <>
                    <Button onClick={handleReset} style={{ borderRadius: 8, padding: '6px 28px', height: 'auto' }}>Reset</Button>
                    <Button type="primary" onClick={handleApply} style={{ background: 'var(--color-primary)', borderColor: 'var(--color-primary)', borderRadius: 8, padding: '6px 28px', height: 'auto' }}>Apply</Button>
                  </>
                )}
                {mode === 'view-approve' && (
                  <>
                    <Button danger onClick={handleReject} style={{ borderRadius: 8, padding: '6px 28px', height: 'auto' }}>Reject</Button>
                    <Button type="primary" onClick={handleApprove} style={{ background: 'var(--color-primary)', borderColor: 'var(--color-primary)', borderRadius: 8, padding: '6px 28px', height: 'auto' }}>Approve</Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── Right Panel: Note ───────────────────────────────────────────── */}
          <div style={{ width: 320, flexShrink: 0 }}>
            <div style={{ background: 'var(--color-bg-surface)', border: '1.5px solid #e5e7eb', borderRadius: 16, padding: '24px 22px' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', textAlign: 'center', marginBottom: 16 }}>Note</h3>
              <ul style={{ paddingLeft: 18, margin: 0 }}>
                {PF_POLICY_NOTES.map((note, i) => (
                  <li key={i} style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 8, lineHeight: 1.5 }}>{note}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
