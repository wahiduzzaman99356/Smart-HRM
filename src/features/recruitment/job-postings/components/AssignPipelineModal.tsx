import { useState } from 'react';
import { Button, Modal, Select, Input } from 'antd';
import { ApartmentOutlined, PlusCircleOutlined } from '@ant-design/icons';

export const AVAILABLE_PIPELINES = [
  { id: 'PL-001', name: 'Tech Hiring',                  stageCount: 6 },
  { id: 'PL-002', name: 'Data Scientist – Template 01', stageCount: 6 },
  { id: 'PL-003', name: 'Executive Search',             stageCount: 7 },
  { id: 'PL-004', name: 'Design Track',                 stageCount: 5 },
  { id: 'PL-005', name: 'Sales Fast-Track',             stageCount: 4 },
];

interface Props {
  open:        boolean;
  onClose:     () => void;
  onAssign:    (pipelineName: string) => void;
  onCreateNew: (pipelineName: string) => void;
}

type Step = 'choice' | 'existing' | 'create';

// ─── Choice card ──────────────────────────────────────────────────────────────
function ChoiceCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon:        React.ReactNode;
  title:       string;
  description: string;
  onClick:     () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 14,
        padding: '28px 20px 24px',
        border: `1.5px solid ${hovered ? 'var(--color-primary)' : 'var(--color-border)'}`,
        borderRadius: 12,
        background: hovered ? 'var(--color-primary-tint)' : 'var(--color-bg-surface)',
        cursor: 'pointer',
        transition: 'border-color 0.18s, background 0.18s, box-shadow 0.18s',
        boxShadow: hovered ? '0 4px 14px rgba(15,118,110,0.10)' : 'none',
        userSelect: 'none',
      }}
    >
      {/* Icon bubble */}
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: hovered
          ? 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)'
          : '#e2f5f2',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.18s',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 22, color: hovered ? 'var(--color-bg-surface)' : 'var(--color-primary)' }}>
          {icon}
        </span>
      </div>

      <div>
        <div style={{
          fontWeight: 700, fontSize: 14,
          color: hovered ? 'var(--color-primary)' : 'var(--color-text-primary)',
          marginBottom: 5,
          transition: 'color 0.18s',
        }}>
          {title}
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', lineHeight: 1.5 }}>
          {description}
        </div>
      </div>
    </div>
  );
}

// ─── Shared modal title ───────────────────────────────────────────────────────
function ModalTitle({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 34, height: 34, borderRadius: 9,
        background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{ color: 'var(--color-bg-surface)', fontSize: 15 }}>{icon}</span>
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
          {title}
        </div>
        <div style={{ fontWeight: 400, fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 2 }}>
          {subtitle}
        </div>
      </div>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function AssignPipelineModal({ open, onClose, onAssign, onCreateNew }: Props) {
  const [step,       setStep]       = useState<Step>('choice');
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [newName,    setNewName]    = useState('');

  function reset() {
    setStep('choice');
    setSelectedId(undefined);
    setNewName('');
  }

  function handleClose() { reset(); onClose(); }

  function handleAssign() {
    const p = AVAILABLE_PIPELINES.find(x => x.id === selectedId);
    if (p) { onAssign(p.name); reset(); onClose(); }
  }

  function handleCreatePipeline() {
    const name = newName.trim();
    if (!name) return;
    reset();
    onClose();
    onCreateNew(name);
  }

  // ── Step: choice ─────────────────────────────────────────────────────────
  if (step === 'choice') {
    return (
      <Modal
        open={open}
        onCancel={handleClose}
        footer={null}
        centered
        width={440}
        title={
          <ModalTitle
            icon={<ApartmentOutlined />}
            title="Assign Pipeline"
            subtitle="Choose how you want to assign a pipeline to this job."
          />
        }
        styles={{ body: { paddingTop: 12 } }}
      >
        <div style={{ display: 'flex', gap: 12, paddingBottom: 4 }}>
          <ChoiceCard
            icon={<ApartmentOutlined />}
            title="Use Existing"
            description="Assign a previously created pipeline"
            onClick={() => setStep('existing')}
          />
          <ChoiceCard
            icon={<PlusCircleOutlined />}
            title="Create from Scratch"
            description="Build a brand new pipeline"
            onClick={() => setStep('create')}
          />
        </div>
      </Modal>
    );
  }

  // ── Step: existing ───────────────────────────────────────────────────────
  if (step === 'existing') {
    return (
      <Modal
        open={open}
        onCancel={handleClose}
        footer={null}
        centered
        width={440}
        title={
          <ModalTitle
            icon={<ApartmentOutlined />}
            title="Use Existing Pipeline"
            subtitle="Select a pipeline from your saved list."
          />
        }
        styles={{ body: { paddingTop: 12 } }}
      >
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
          color: 'var(--color-text-disabled)', textTransform: 'uppercase', marginBottom: 8,
        }}>
          Existing Pipelines
        </div>

        <Select
          style={{ width: '100%' }}
          placeholder="Select a pipeline…"
          value={selectedId}
          onChange={setSelectedId}
          options={AVAILABLE_PIPELINES.map(p => ({
            value: p.id,
            label: `${p.name} (${p.stageCount} stages)`,
          }))}
          size="large"
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
          <Button onClick={() => setStep('choice')}>Back</Button>
          <Button
            type="primary"
            disabled={!selectedId}
            onClick={handleAssign}
            style={{ fontWeight: 600 }}
          >
            Assign Pipeline
          </Button>
        </div>
      </Modal>
    );
  }

  // ── Step: create ─────────────────────────────────────────────────────────
  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={440}
      title={
        <ModalTitle
          icon={<PlusCircleOutlined />}
          title="Create new Pipeline"
          subtitle="You can also save this pipeline as a template later."
        />
      }
      styles={{ body: { paddingTop: 12 } }}
    >
      <div style={{ marginBottom: 20 }}>
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
          color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: 8,
        }}>
          Pipeline Name
        </div>
        <Input
          autoFocus
          size="large"
          placeholder="e.g. Data Scientist - Evaluation Template 1"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onPressEnter={handleCreatePipeline}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <Button onClick={() => setStep('choice')}>Cancel</Button>
        <Button
          type="primary"
          disabled={!newName.trim()}
          onClick={handleCreatePipeline}
          style={{ fontWeight: 600 }}
        >
          Create Pipeline
        </Button>
      </div>
    </Modal>
  );
}
