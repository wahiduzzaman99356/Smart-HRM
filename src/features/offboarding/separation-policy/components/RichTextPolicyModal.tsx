import { useState, useEffect } from 'react';
import { Modal, Button } from 'antd';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

// ─── Quill config ─────────────────────────────────────────────────────────────

const TOOLBAR_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'link'],
    [{ indent: '-1' }, { indent: '+1' }],
    ['clean'],
  ],
};

const QUILL_FORMATS = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list',
  'blockquote', 'link',
  'indent',
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface RichTextPolicyModalProps {
  open: boolean;
  title: string;
  subtitle?: string;
  initialValue: string;
  onClose: () => void;
  onSave: (html: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RichTextPolicyModal({
  open,
  title,
  subtitle,
  initialValue,
  onClose,
  onSave,
}: RichTextPolicyModalProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (open) setValue(initialValue);
  }, [open, initialValue]);

  const handleSave = () => {
    onSave(value);
    onClose();
  };

  const handleCancel = () => {
    setValue(initialValue);
    onClose();
  };

  return (
    <>
      {/* Quill theme overrides scoped to this modal */}
      <style>{`
        .policy-quill-wrap .ql-toolbar.ql-snow {
          border: 1.5px solid #e5e7eb;
          border-bottom: none;
          border-radius: 8px 8px 0 0;
          background: #f8fafc;
          padding: 8px 10px;
          font-family: 'Manrope', 'Nunito Sans', 'Segoe UI', sans-serif;
        }
        .policy-quill-wrap .ql-container.ql-snow {
          border: 1.5px solid #e5e7eb;
          border-radius: 0 0 8px 8px;
          font-family: 'Manrope', 'Nunito Sans', 'Segoe UI', sans-serif;
          font-size: 13px;
          color: #374151;
        }
        .policy-quill-wrap .ql-editor {
          min-height: 220px;
          max-height: 340px;
          overflow-y: auto;
          line-height: 1.65;
          color: #374151;
          padding: 14px 16px;
        }
        .policy-quill-wrap .ql-editor p,
        .policy-quill-wrap .ql-editor li {
          font-size: 13px;
          color: #374151;
        }
        .policy-quill-wrap .ql-editor h1 {
          font-size: 18px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 6px;
        }
        .policy-quill-wrap .ql-editor h2 {
          font-size: 15px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 4px;
        }
        .policy-quill-wrap .ql-editor h3 {
          font-size: 13px;
          font-weight: 700;
          color: #374151;
        }
        .policy-quill-wrap .ql-editor blockquote {
          border-left: 3px solid #0f766e;
          color: #4b5563;
          background: #f0fdfa;
          padding: 6px 12px;
          margin: 8px 0;
          border-radius: 0 6px 6px 0;
        }
        .policy-quill-wrap .ql-editor a {
          color: #0f766e;
        }
        .policy-quill-wrap .ql-snow .ql-stroke {
          stroke: #6b7280;
        }
        .policy-quill-wrap .ql-snow .ql-fill {
          fill: #6b7280;
        }
        .policy-quill-wrap .ql-snow.ql-toolbar button:hover .ql-stroke,
        .policy-quill-wrap .ql-snow .ql-toolbar button:hover .ql-stroke {
          stroke: #0f766e;
        }
        .policy-quill-wrap .ql-snow.ql-toolbar button:hover .ql-fill,
        .policy-quill-wrap .ql-snow .ql-toolbar button:hover .ql-fill {
          fill: #0f766e;
        }
        .policy-quill-wrap .ql-snow.ql-toolbar button.ql-active .ql-stroke,
        .policy-quill-wrap .ql-snow .ql-toolbar button.ql-active .ql-stroke {
          stroke: #0f766e;
        }
        .policy-quill-wrap .ql-snow.ql-toolbar button.ql-active .ql-fill,
        .policy-quill-wrap .ql-snow .ql-toolbar button.ql-active .ql-fill {
          fill: #0f766e;
        }
        .policy-quill-wrap .ql-snow .ql-picker {
          color: #6b7280;
          font-size: 12px;
        }
        .policy-quill-wrap .ql-snow .ql-picker:hover .ql-picker-label,
        .policy-quill-wrap .ql-snow .ql-picker.ql-expanded .ql-picker-label {
          color: #0f766e;
        }
        .policy-quill-wrap .ql-snow .ql-picker.ql-expanded .ql-picker-options {
          border-color: #e5e7eb;
          border-radius: 8px;
          box-shadow: 0 6px 18px rgba(15,40,38,0.10);
          z-index: 9999;
        }
        .policy-quill-wrap .ql-snow .ql-picker-options .ql-picker-item:hover {
          color: #0f766e;
        }
        .policy-quill-wrap .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
          font-size: 13px;
        }
      `}</style>

      <Modal
        open={open}
        onCancel={handleCancel}
        width={640}
        centered
        destroyOnClose={false}
        footer={null}
        title={
          <div style={{ paddingBottom: 4 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', lineHeight: 1.3 }}>
              {title}
            </div>
            {subtitle && (
              <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 400, marginTop: 3 }}>
                {subtitle}
              </div>
            )}
          </div>
        }
        styles={{
          header: { borderBottom: '1px solid #e5e7eb', paddingBottom: 14, marginBottom: 0 },
          body: { padding: '20px 24px' },
        }}
      >
        <div className="policy-quill-wrap">
          <ReactQuill
            theme="snow"
            value={value}
            onChange={setValue}
            modules={TOOLBAR_MODULES}
            formats={QUILL_FORMATS}
            placeholder="Write the policy content here…"
          />
        </div>

        {/* ── Footer ────────────────────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 10,
          paddingTop: 20, marginTop: 20,
          borderTop: '1px solid #e5e7eb',
        }}>
          <Button onClick={handleCancel} style={{ minWidth: 80 }}>
            Cancel
          </Button>
          <Button type="primary" onClick={handleSave} style={{ minWidth: 120 }}>
            Save Changes
          </Button>
        </div>
      </Modal>
    </>
  );
}
