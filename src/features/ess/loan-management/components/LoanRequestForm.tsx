import { useState } from 'react';
import { Button, Input, Select, Upload, message } from 'antd';
import { ArrowLeftOutlined, UploadOutlined, PaperClipOutlined, EyeOutlined, CheckOutlined } from '@ant-design/icons';
import {
  LoanRequest,
  LoanStatus,
  LoanType,
  STATUS_STYLE,
  GUARANTOR_EMPLOYEES,
  LOAN_POLICY_NOTES,
  INSTALLMENT_OPTIONS,
  EMPLOYEE_MONTHLY_SALARY,
  LOAN_INTEREST_RATE,
  LOAN_MIN_AMOUNT,
  LOAN_MAX_AMOUNT,
  nextLoanRequestId,
  nowTs,
  todayLabel,
} from '../types/loan.types';

export type LoanFormMode = 'create' | 'view-only';

interface Props {
  mode:       LoanFormMode;
  request?:   LoanRequest;
  onBack:     () => void;
  onSubmit?:  (req: LoanRequest) => void;
}

// ─── Type Selector Card ────────────────────────────────────────────────────────
function TypeCard({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: 160,
        padding: '18px 16px',
        border: `1.5px solid ${selected ? '#0d9488' : '#d1d5db'}`,
        borderRadius: 12,
        background: '#f9fafb',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 10,
        position: 'relative',
        transition: 'border-color 0.15s',
      }}
    >
      {/* Checkbox */}
      <div style={{
        width: 18, height: 18, borderRadius: 4,
        border: `1.5px solid ${selected ? '#0d9488' : '#9ca3af'}`,
        background: selected ? '#0d9488' : '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {selected && <CheckOutlined style={{ color: '#fff', fontSize: 11 }} />}
      </div>
      <span style={{ fontSize: 15, color: '#374151', fontWeight: selected ? 600 : 400 }}>{label}</span>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function LoanRequestForm({ mode, request, onBack, onSubmit }: Props) {
  const isReadOnly = mode === 'view-only';

  // Type selection
  const [selectedType, setSelectedType] = useState<LoanType>(request?.type ?? 'Loan');

  // Loan fields
  const [loanAmount,   setLoanAmount]   = useState<string>(request?.loanAmount ? String(request.loanAmount) : '');

  // Advance Salary fields
  const [advMonths, setAdvMonths] = useState<number>(request?.selectedMonth ?? 1);

  // Common fields
  const [installments, setInstallments] = useState<number>(request?.installmentNumber ?? 2);
  const [guarantorId,  setGuarantorId]  = useState<string>(request?.guarantorEmployeeId ?? '');
  const [reason,       setReason]       = useState<string>(request?.reason ?? '');
  const [attachName,   setAttachName]   = useState<string>(request?.attachmentName ?? '');

  // ── Computed values ──────────────────────────────────────────────────────────
  const loanAmountNum     = Number(loanAmount) || 0;
  const interest          = selectedType === 'Loan' ? Math.round(loanAmountNum * (LOAN_INTEREST_RATE / 100)) : 0;
  const totalWithInterest = selectedType === 'Loan' ? loanAmountNum + interest : 0;
  const advTotalAmount    = selectedType === 'Advance Salary' ? advMonths * EMPLOYEE_MONTHLY_SALARY : 0;

  // ── Status badge ─────────────────────────────────────────────────────────────
  const statusBadge = (s: LoanStatus) => {
    const st = STATUS_STYLE[s];
    return (
      <span style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, color: st.color, background: st.bg, border: `1.5px solid ${st.border}` }}>
        {s}
      </span>
    );
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleApply = () => {
    if (selectedType === 'Loan') {
      const n = Number(loanAmount);
      if (!loanAmount || isNaN(n) || n < LOAN_MIN_AMOUNT || n > LOAN_MAX_AMOUNT) {
        message.error(`Loan amount must be between ${LOAN_MIN_AMOUNT.toLocaleString()} and ${LOAN_MAX_AMOUNT.toLocaleString()} BDT.`);
        return;
      }
    }
    if (!guarantorId) { message.error('Please select a guarantor employee.'); return; }
    if (!reason.trim()) { message.error('Please enter a reason.'); return; }

    const guarantor = GUARANTOR_EMPLOYEES.find(e => e.employeeId === guarantorId)!;

    const finalAmount = selectedType === 'Loan' ? totalWithInterest : advTotalAmount;

    const newReq: LoanRequest = {
      id:                    nextLoanRequestId(),
      initiateDate:          todayLabel(),
      type:                  selectedType,
      amount:                finalAmount,
      principalAmount:       selectedType === 'Loan' ? loanAmountNum : advTotalAmount,
      interestRate:          selectedType === 'Loan' ? LOAN_INTEREST_RATE : 0,
      installmentNumber:     installments,
      loanAmount:            selectedType === 'Loan' ? loanAmountNum : undefined,
      selectedMonth:         selectedType === 'Advance Salary' ? advMonths : undefined,
      monthlySalary:         selectedType === 'Advance Salary' ? EMPLOYEE_MONTHLY_SALARY : undefined,
      guarantorEmployeeId:   guarantorId,
      guarantorEmployeeName: guarantor.name,
      reason,
      attachmentName:        attachName || undefined,
      status:                'To Approve',
      employeeId:            'TN-99318',
      employeeName:          'Shanto Karmoker',
      designation:           'Business Analyst',
      department:            'Business Analysis',
      section:               'Analytics',
      createdAt:             nowTs(),
    };
    onSubmit?.(newReq);
    message.success('Loan request submitted successfully.');
  };

  const handleReset = () => {
    setSelectedType('Loan');
    setLoanAmount('');
    setAdvMonths(1);
    setInstallments(2);
    setGuarantorId('');
    setReason('');
    setAttachName('');
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#eef4f5' }}>
      <div style={{ padding: '24px 28px' }}>
        {/* Back + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button
            onClick={onBack}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0d9488', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 500 }}
          >
            <ArrowLeftOutlined /> Back
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>
            {isReadOnly ? 'Loan Request Detail' : 'New Loan / Advance Request'}
          </h1>
          {isReadOnly && request && <span style={{ marginLeft: 8 }}>{statusBadge(request.status)}</span>}
        </div>

        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          {/* ── Left Panel ─────────────────────────────────────────────────── */}
          <div style={{ flex: 1 }}>

            {/* Type Selector */}
            {!isReadOnly ? (
              <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
                <TypeCard label="Loan"           selected={selectedType === 'Loan'}           onClick={() => setSelectedType('Loan')} />
                <TypeCard label="Advance Salary" selected={selectedType === 'Advance Salary'} onClick={() => setSelectedType('Advance Salary')} />
              </div>
            ) : (
              <div style={{ marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#6b7280' }}>Type:</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{request?.type}</span>
              </div>
            )}

            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '24px 24px 28px' }}>
              {/* ── LOAN fields ── */}
              {(selectedType === 'Loan' || (isReadOnly && request?.type === 'Loan')) && (
                <>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 20 }}>
                    {/* Loan Amount */}
                    <div style={{ flex: '0 0 200px' }}>
                      <label style={{ fontSize: 13, color: '#374151', fontWeight: 500, display: 'block', marginBottom: 6 }}>
                        Loan Amount<span style={{ color: '#dc2626' }}> *</span>
                      </label>
                      {isReadOnly ? (
                        <div style={{ padding: '6px 12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: '#374151' }}>
                          {(request?.loanAmount ?? 0).toLocaleString()} BDT
                        </div>
                      ) : (
                        <Input
                          type="number"
                          placeholder="10,000"
                          value={loanAmount}
                          onChange={e => setLoanAmount(e.target.value)}
                          style={{ borderRadius: 8 }}
                        />
                      )}
                    </div>

                    {/* Interest */}
                    <div style={{ flex: '0 0 160px', background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: 8, padding: '10px 16px', textAlign: 'center' }}>
                      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 2 }}>Interest</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#0f766e' }}>{LOAN_INTEREST_RATE}%</div>
                    </div>

                    {/* Total with Interest */}
                    <div style={{ flex: 1, background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: 8, padding: '10px 16px' }}>
                      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 2 }}>Total Loan Amount with interest</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#0f766e' }}>
                        {(isReadOnly ? (request?.amount ?? 0) : totalWithInterest).toLocaleString()}
                        <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 2 }}>BDT</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ── ADVANCE SALARY fields ── */}
              {(selectedType === 'Advance Salary' || (isReadOnly && request?.type === 'Advance Salary')) && (
                <>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 20 }}>
                    {/* Select Month */}
                    <div style={{ flex: '0 0 160px' }}>
                      <label style={{ fontSize: 13, color: '#374151', fontWeight: 500, display: 'block', marginBottom: 6 }}>
                        Select Month<span style={{ color: '#dc2626' }}> *</span>
                      </label>
                      {isReadOnly ? (
                        <div style={{ padding: '6px 12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: '#374151' }}>
                          {request?.selectedMonth} month(s)
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
                          <span style={{ flex: 1, padding: '6px 12px', fontSize: 14, color: '#111827', fontWeight: 500 }}>{advMonths}</span>
                          <div style={{ display: 'flex', flexDirection: 'column', borderLeft: '1px solid #e5e7eb' }}>
                            <button
                              onClick={() => setAdvMonths(m => Math.min(m + 1, 6))}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 8px', lineHeight: 1, color: '#374151', fontSize: 12 }}
                            >▲</button>
                            <button
                              onClick={() => setAdvMonths(m => Math.max(m - 1, 1))}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 8px', lineHeight: 1, color: '#374151', fontSize: 12 }}
                            >▼</button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Total Advance Amount */}
                    <div style={{ flex: 1, background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: 8, padding: '10px 16px', textAlign: 'center' }}>
                      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 2 }}>Total Advance</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#0f766e' }}>
                        {(isReadOnly ? (request?.amount ?? 0) : advTotalAmount).toLocaleString()}
                        <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 2 }}>BDT</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ── Select Installment number (common) ── */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, color: '#374151', fontWeight: 500, display: 'block', marginBottom: 6 }}>
                  Select Installment number<span style={{ color: '#dc2626' }}> *</span>
                </label>
                {isReadOnly ? (
                  <div style={{ padding: '6px 12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: '#374151', display: 'inline-block' }}>
                    {request?.installmentNumber}
                  </div>
                ) : (
                  <Select
                    value={installments}
                    onChange={setInstallments}
                    style={{ width: 160 }}
                    options={INSTALLMENT_OPTIONS}
                  />
                )}
              </div>

              {/* ── Guarantor Employee ── */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, color: '#dc2626', fontWeight: 500, display: 'block', marginBottom: 6 }}>
                  Guarantor Employee <span style={{ color: '#dc2626' }}>*</span>
                </label>
                {isReadOnly ? (
                  <div style={{ padding: '6px 12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: '#374151', display: 'inline-block', minWidth: 240 }}>
                    {request?.guarantorEmployeeName}
                  </div>
                ) : (
                  <Select
                    placeholder="Guarantor Employee"
                    value={guarantorId || undefined}
                    onChange={setGuarantorId}
                    style={{ width: 300 }}
                    options={GUARANTOR_EMPLOYEES.map(e => ({ value: e.employeeId, label: `${e.name} (${e.employeeId})` }))}
                  />
                )}
              </div>

              {/* ── Reason + Attachment side by side ── */}
              <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', marginBottom: 28 }}>
                {/* Reason */}
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 13, color: '#374151', fontWeight: 500, display: 'block', marginBottom: 6 }}>
                    Reason<span style={{ color: '#dc2626' }}> *</span>
                  </label>
                  {isReadOnly ? (
                    <div style={{ padding: '10px 12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: '#374151', minHeight: 80 }}>
                      {request?.reason}
                    </div>
                  ) : (
                    <Input.TextArea
                      placeholder="Enter reason for loan request"
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                      rows={4}
                      style={{ borderRadius: 8, resize: 'none' }}
                    />
                  )}
                </div>

                {/* Attachment */}
                <div style={{ flex: '0 0 160px' }}>
                  <label style={{ fontSize: 13, color: '#374151', fontWeight: 500, display: 'block', marginBottom: 6 }}>
                    Attachment <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 400 }}>(Optional)</span>
                  </label>
                  {isReadOnly ? (
                    <>
                      {request?.attachmentName ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#f9fafb', fontSize: 12, color: '#374151' }}>
                            <PaperClipOutlined style={{ color: '#0d9488' }} />
                            {request.attachmentName}
                          </div>
                          <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#0d9488', fontWeight: 500, textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
                            <EyeOutlined /> View
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: 13, color: '#9ca3af' }}>No attachment</span>
                      )}
                    </>
                  ) : (
                    <Upload
                      beforeUpload={file => { setAttachName(file.name); return false; }}
                      onRemove={() => setAttachName('')}
                      maxCount={1}
                      fileList={attachName ? [{ uid: '-1', name: attachName, status: 'done' }] : []}
                    >
                      <Button
                        style={{ width: 80, height: 80, borderRadius: 8, borderStyle: 'dashed', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                      >
                        <UploadOutlined style={{ fontSize: 22, color: '#0d9488' }} />
                      </Button>
                    </Upload>
                  )}
                </div>
              </div>

              {/* Approver Remarks (view-only, if decision was made) */}
              {isReadOnly && request?.remarks && (
                <div style={{ marginBottom: 20, padding: '12px 16px', background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: '#0f766e', fontWeight: 600, marginBottom: 4 }}>Approver Remarks</div>
                  <div style={{ fontSize: 13, color: '#374151' }}>{request.remarks}</div>
                </div>
              )}

              {/* Action Buttons */}
              {!isReadOnly && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, paddingTop: 4 }}>
                  <Button onClick={handleReset} style={{ borderRadius: 8, minWidth: 100 }}>reset</Button>
                  <Button
                    type="primary"
                    onClick={handleApply}
                    style={{ background: '#0d9488', borderColor: '#0d9488', borderRadius: 8, minWidth: 100 }}
                  >
                    Apply
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* ── Right Panel: Note ───────────────────────────────────────────── */}
          <div style={{ width: 320, flexShrink: 0 }}>
            <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 16, padding: '24px 22px' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', textAlign: 'center', marginBottom: 16 }}>Note</h3>
              <ul style={{ paddingLeft: 0, margin: 0, listStyle: 'none' }}>
                {LOAN_POLICY_NOTES.map((note, i) => (
                  <li key={i} style={{ fontSize: 13, color: '#374151', marginBottom: 10, lineHeight: 1.55, paddingLeft: 0 }}>
                    -{note}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
