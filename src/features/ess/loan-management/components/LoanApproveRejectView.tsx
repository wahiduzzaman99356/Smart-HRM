import { useState } from 'react';
import { Button, Input, message } from 'antd';
import { ArrowLeftOutlined, PaperClipOutlined, EyeOutlined } from '@ant-design/icons';
import { LoanRequest, LoanStatus, STATUS_STYLE } from '../types/loan.types';

interface Props {
  request:   LoanRequest;
  onBack:    () => void;
  onApprove: (id: string, remarks: string) => void;
  onReject:  (id: string, remarks: string) => void;
}

function StatusBadge({ status }: { status: LoanStatus }) {
  const st = STATUS_STYLE[status];
  return (
    <span style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, color: st.color, background: st.bg, border: `1.5px solid ${st.border}` }}>
      {status}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
      <span style={{ fontSize: 13, color: '#6b7280', minWidth: 200, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>{value}</span>
    </div>
  );
}

export function LoanApproveRejectView({ request, onBack, onApprove, onReject }: Props) {
  const [remarks, setRemarks] = useState('');

  const handleApprove = () => {
    onApprove(request.id, remarks.trim() || 'Approved.');
    message.success('Request approved.');
  };

  const handleReject = () => {
    if (!remarks.trim()) {
      message.error('Remarks are required for rejection.');
      return;
    }
    onReject(request.id, remarks.trim());
    message.success('Request rejected.');
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#eef4f5' }}>
      <div style={{ padding: '24px 28px', maxWidth: 900 }}>
        {/* Back + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button
            onClick={onBack}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0d9488', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 500 }}
          >
            <ArrowLeftOutlined /> Back
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Loan Request Review</h1>
          <StatusBadge status={request.status} />
        </div>

        {/* ── Employee Info Card ─────────────────────────────────────────────── */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '20px 24px', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Employee Information</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
            <InfoRow label="Employee Name"  value={request.employeeName} />
            <InfoRow label="Employee ID"    value={request.employeeId} />
            <InfoRow label="Department"     value={request.department} />
            <InfoRow label="Designation"    value={request.designation} />
            <InfoRow label="Section"        value={request.section} />
            <InfoRow label="Initiate Date"  value={request.initiateDate} />
          </div>
        </div>

        {/* ── Loan Details Card ──────────────────────────────────────────────── */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '20px 24px', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Loan Details</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
            <InfoRow label="Type"                     value={request.type} />
            <InfoRow label="Installment Number"       value={request.installmentNumber} />
            {request.type === 'Loan' && (
              <>
                <InfoRow label="Loan Amount"          value={`${(request.loanAmount ?? 0).toLocaleString()} BDT`} />
                <InfoRow label="Interest Rate"        value={`${request.interestRate}%`} />
                <InfoRow label="Total with Interest"  value={`${request.amount.toLocaleString()} BDT`} />
              </>
            )}
            {request.type === 'Advance Salary' && (
              <>
                <InfoRow label="Months Selected"      value={`${request.selectedMonth} month(s)`} />
                <InfoRow label="Monthly Salary"       value={`${(request.monthlySalary ?? 0).toLocaleString()} BDT`} />
                <InfoRow label="Total Advance"        value={`${request.amount.toLocaleString()} BDT`} />
              </>
            )}
            <InfoRow label="Guarantor Employee"       value={request.guarantorEmployeeName} />
          </div>

          {/* Reason */}
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>Reason</div>
            <div style={{ fontSize: 13, color: '#111827', padding: '10px 14px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8 }}>
              {request.reason}
            </div>
          </div>

          {/* Attachment */}
          {request.attachmentName && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>Attachment</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#f9fafb', fontSize: 13, color: '#374151' }}>
                  <PaperClipOutlined style={{ color: '#0d9488' }} />
                  {request.attachmentName}
                </div>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#0d9488', fontWeight: 500, textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <EyeOutlined /> View
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Remarks + Actions ──────────────────────────────────────────────── */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '20px 24px' }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, color: '#374151', fontWeight: 500, display: 'block', marginBottom: 6 }}>
              Remarks <span style={{ fontSize: 12, color: '#dc2626', fontWeight: 400 }}>(required for rejection)</span>
            </label>
            <Input.TextArea
              placeholder="Enter your remarks here..."
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              rows={4}
              style={{ borderRadius: 8, resize: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Button onClick={onBack} style={{ borderRadius: 8, minWidth: 100 }}>Cancel</Button>
            <Button danger onClick={handleReject} style={{ borderRadius: 8, minWidth: 100 }}>Reject</Button>
            <Button
              type="primary"
              onClick={handleApprove}
              style={{ background: '#0d9488', borderColor: '#0d9488', borderRadius: 8, minWidth: 100 }}
            >
              Approve
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
