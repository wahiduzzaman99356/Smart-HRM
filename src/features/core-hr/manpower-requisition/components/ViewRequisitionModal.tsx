/**
 * ViewRequisitionModal
 * Read-only detail view of a manpower requisition request.
 */

import { Modal, Descriptions, Tag } from 'antd';
import { PaperClipOutlined } from '@ant-design/icons';
import type { RequisitionRequest, RequisitionStatus } from '../types/requisition.types';

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_PROPS: Record<RequisitionStatus, { color: string; bg: string; border: string }> = {
  Draft:    { color: '#6b7280', bg: '#f3f4f6', border: '#d1d5db' },
  Pending:  { color: '#d97706', bg: '#fffbeb', border: '#fcd34d' },
  Approved: { color: '#059669', bg: '#ecfdf5', border: '#6ee7b7' },
  Rejected: { color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
};

function StatusBadge({ status }: { status: RequisitionStatus }) {
  const p = STATUS_PROPS[status];
  return (
    <span style={{
      display: 'inline-block', padding: '3px 12px', borderRadius: 20,
      fontSize: 12, fontWeight: 600, color: p.color, background: p.bg,
      border: `1px solid ${p.border}`,
    }}>
      {status}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
interface Props {
  request: RequisitionRequest | null;
  onClose: () => void;
}

const DLABEL: React.CSSProperties = { fontSize: 11, color: '#9ca3af', fontWeight: 600 };
const DCONTENT: React.CSSProperties = { fontSize: 13, color: '#374151', fontWeight: 500 };

export function ViewRequisitionModal({ request, onClose }: Props) {
  if (!request) return null;

  const fd = request.formData;
  const hasAttachments = (request.attachments?.length ?? 0) > 0;

  const ageDisplay = () => {
    if (fd.ageMode === 'Minimum') return fd.ageMinimum ? `Min ${fd.ageMinimum}` : '—';
    if (fd.ageMode === 'Maximum') return fd.ageMaximum ? `Max ${fd.ageMaximum}` : '—';
    if (fd.ageMode === 'Range')   return (fd.ageFrom && fd.ageTo) ? `${fd.ageFrom} – ${fd.ageTo}` : '—';
    return '—';
  };

  const eduDisplay = () => {
    const rows = (fd.educationRequirements?.length
      ? fd.educationRequirements
      : [{
          qualification: fd.educationQualification,
          title: fd.educationField,
          major: fd.educationCourse,
          cgpa: fd.educationNote,
        }])
      .map(row => {
        const parts = [row.qualification, row.title, row.major].filter(Boolean);
        if (row.cgpa) parts.push(`GPA ${row.cgpa}`);
        return parts.join(' › ');
      })
      .filter(Boolean);

    return rows.length ? rows : ['—'];
  };

  return (
    <Modal
      open
      onCancel={onClose}
      footer={null}
      width={860}
      centered
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: 800, fontSize: 16, color: '#111827' }}>{request.id}</span>
          <StatusBadge status={request.status} />
          <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 4 }}>Ref: {request.refNo}</span>
        </div>
      }
      styles={{ header: { borderBottom: '1px solid #f0f0f0', paddingBottom: 14 } }}
    >
      {/* ── Summary ─────────────────────────────────────────────────────── */}
      <Descriptions
        size="small"
        column={4}
        style={{ marginBottom: 16, marginTop: 4 }}
        styles={{ label: DLABEL, content: DCONTENT }}
        items={[
          { key: 'date',  label: 'INITIATED ON',    children: request.initiateDate },
          { key: 'req',   label: 'REQUESTED',        children: <strong style={{ color: '#111827' }}>{request.requested}</strong> },
          { key: 'appr',  label: 'APPROVED',         children: request.approved > 0 ? <strong style={{ color: '#3b82f6' }}>{request.approved}</strong> : <span style={{ color: '#d1d5db' }}>—</span> },
          { key: 'dept',  label: 'DEPARTMENT',       children: request.department },
          { key: 'desig', label: 'DESIGNATION',      children: request.designation },
          { key: 'level', label: 'ORG LEVEL',        children: <span style={{ fontSize: 12 }}>{fd.selectedLevel || '—'}</span> },
          { key: 'type',  label: 'REQUISITION TYPE', children: fd.typeOfRequisition.length > 0 ? fd.typeOfRequisition.join(', ') : '—' },
          { key: 'emp',   label: 'EMPLOYMENT TYPE',  children: fd.employmentType || '—' },
        ]}
      />

      <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: '14px 16px', marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6', letterSpacing: '0.06em', marginBottom: 10 }}>
          CANDIDATE REQUIREMENTS
        </div>
        <Descriptions
          size="small"
          column={3}
          styles={{ label: DLABEL, content: DCONTENT }}
          items={[
            { key: 'loc',   label: 'WORK LOCATION', children: fd.workLocation || '—' },
            { key: 'gender',label: 'GENDER',         children: fd.gender || '—' },
            { key: 'eta',   label: 'ETA DATE',       children: fd.etaDate || '—' },
            { key: 'exp',   label: 'EXPERIENCE',     children: fd.experienceMode === 'Fresher' ? 'Fresher' : `${fd.yearsOfExperience || '?'} yr(s)` },
            { key: 'age',   label: 'AGE',            children: ageDisplay() },
            {
              key: 'edu',
              label: 'EDUCATION',
              children: (
                <span style={{ fontSize: 12 }}>
                  {eduDisplay().map((line, idx) => (
                    <div key={`edu-line-${idx}`}>{line}</div>
                  ))}
                </span>
              ),
            },
          ]}
        />

        {fd.skillsRequired.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <div style={{ ...DLABEL, marginBottom: 6 }}>SKILLS REQUIRED</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {fd.skillsRequired.map(s => (
                <Tag key={s} style={{ borderRadius: 20, fontSize: 12, margin: 0 }}>{s}</Tag>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Rich text fields ──────────────────────────────────────────────── */}
      {(fd.jobResponsibility || fd.trainingSpecialization || fd.otherRequirements) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
          {[
            { label: 'JOB RESPONSIBILITY',      html: fd.jobResponsibility },
            { label: 'TRAINING & SPEC.',         html: fd.trainingSpecialization },
            { label: 'OTHER REQUIREMENTS',       html: fd.otherRequirements },
          ].map(({ label, html }) => html ? (
            <div key={label} style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6', letterSpacing: '0.06em', marginBottom: 6 }}>
                {label}
              </div>
              <div
                style={{ fontSize: 12, color: '#374151', lineHeight: 1.7 }}
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          ) : null)}
        </div>
      )}

      {fd.justification && (
        <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 10, marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6', letterSpacing: '0.06em', marginBottom: 6 }}>
            JUSTIFICATION
          </div>
          <div style={{ fontSize: 13, color: '#374151' }}>{fd.justification}</div>
        </div>
      )}

      {/* ── Attachments ───────────────────────────────────────────────────── */}
      <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6', letterSpacing: '0.06em', marginBottom: 8 }}>
          ATTACHMENTS
        </div>
        {hasAttachments ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {request.attachments!.map(att => (
              <div
                key={att.uid}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: '#f8fafc', border: '1px solid #e2e8f0',
                  borderRadius: 7, padding: '6px 12px',
                }}
              >
                <PaperClipOutlined style={{ color: '#3b82f6', flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {att.name}
                </span>
                {att.size && (
                  <span style={{ fontSize: 11, color: '#9ca3af', flexShrink: 0 }}>
                    {(att.size / 1024).toFixed(1)} KB
                  </span>
                )}
                {att.objectUrl && (
                  <a
                    href={att.objectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 12, color: '#3b82f6', fontWeight: 600, flexShrink: 0 }}
                  >
                    View
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <span style={{ fontSize: 13, color: '#9ca3af' }}>No attachments.</span>
        )}
      </div>
    </Modal>
  );
}
