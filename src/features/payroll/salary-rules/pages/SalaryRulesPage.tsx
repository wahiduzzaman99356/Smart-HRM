import { useMemo, useState } from 'react';
import { Button, Dropdown, Input, Modal, Radio, Space, Table, message } from 'antd';
import type { TableColumnsType } from 'antd';
import {
  EditOutlined,
  InboxOutlined,
  MoreOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  SwapOutlined,
  ThunderboltFilled,
} from '@ant-design/icons';
import type { SalaryRuleForm, SalaryRuleStatus, SalaryRuleType } from '../types/salaryRules.types';

const INITIAL_RULES: SalaryRuleType[] = [
  {
    id: '1',
    name: 'Gross',
    code: 'GROSS',
    description: '-',
    status: 'active',
  },
  {
    id: '2',
    name: 'Basic Salary',
    code: 'BS',
    description: 'Fixed monthly basic salary component.',
    status: 'active',
  },
  {
    id: '3',
    name: 'House Rent Allowance',
    code: 'HRA',
    description: 'Allowance for accommodation support.',
    status: 'inactive',
  },
];

const INITIAL_FORM: SalaryRuleForm = {
  name: '',
  code: '',
  description: '',
};

export default function SalaryRulesPage() {
  const [rules, setRules] = useState<SalaryRuleType[]>(INITIAL_RULES);
  const [activeTab, setActiveTab] = useState<SalaryRuleStatus>('active');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SalaryRuleForm>(INITIAL_FORM);
  const [statusModal, setStatusModal] = useState<{ open: boolean; rule: SalaryRuleType | null; pending: SalaryRuleStatus }>({
    open: false,
    rule: null,
    pending: 'active',
  });

  const filteredRules = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return rules.filter((rule) => {
      if (rule.status !== activeTab) return false;
      if (!q) return true;

      return [rule.name, rule.code, rule.description].some((field) => field.toLowerCase().includes(q));
    });
  }, [activeTab, rules, searchQuery]);

  const statusLabel: Record<SalaryRuleStatus, string> = {
    active: 'Active',
    inactive: 'Archieve',
  };

  function openCreateModal() {
    setModalMode('create');
    setEditingId(null);
    setForm(INITIAL_FORM);
    setModalOpen(true);
  }

  function openEditModal(rule: SalaryRuleType) {
    setModalMode('edit');
    setEditingId(rule.id);
    setForm({
      name: rule.name,
      code: rule.code,
      description: rule.description === '-' ? '' : rule.description,
    });
    setModalOpen(true);
  }

  function resetModal() {
    setModalOpen(false);
    setModalMode('create');
    setEditingId(null);
    setForm(INITIAL_FORM);
  }

  function handleSubmit() {
    const name = form.name.trim();
    const code = form.code.trim().toUpperCase();
    const description = form.description.trim();

    if (!name) {
      message.error('Salary Rules Type is required.');
      return;
    }

    if (!code) {
      message.error('Code is required.');
      return;
    }

    const duplicateCode = rules.some((rule) => rule.code.toLowerCase() === code.toLowerCase() && rule.id !== editingId);
    if (duplicateCode) {
      message.error('Code already exists. Please use a unique code.');
      return;
    }

    if (modalMode === 'edit' && editingId) {
      setRules((prev) => prev.map((rule) => (
        rule.id === editingId
          ? { ...rule, name, code, description: description || '-' }
          : rule
      )));
      message.success('Salary rule type updated successfully.');
      resetModal();
      return;
    }

    setRules((prev) => {
      const nextId = String(prev.length + 1);
      return [
        ...prev,
        {
          id: nextId,
          name,
          code,
          description: description || '-',
          status: 'active',
        },
      ];
    });

    message.success('Salary rule type created successfully.');
    resetModal();
  }

  function handleSearch() {
    setSearchQuery(searchInput);
  }

  function handleReset() {
    setSearchInput('');
    setSearchQuery('');
  }

  function confirmStatusChange() {
    if (!statusModal.rule) return;

    setRules((prev) => prev.map((rule) => (
      rule.id === statusModal.rule?.id
        ? { ...rule, status: statusModal.pending }
        : rule
    )));

    message.success(`${statusModal.rule.name} marked as ${statusLabel[statusModal.pending]}.`);
    setStatusModal({ open: false, rule: null, pending: 'active' });
  }

  const columns: TableColumnsType<SalaryRuleType> = [
    {
      title: 'SL No',
      key: 'slNo',
      width: 90,
      render: (_value, _record, index) => index + 1,
    },
    {
      title: 'Salary Rules Type',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: 180,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Action',
      key: 'action',
      width: 90,
      render: (_value, record) => (
        <Dropdown
          trigger={['click']}
          menu={{
            items: [
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Edit',
                onClick: () => openEditModal(record),
              },
              {
                key: 'status',
                icon: <SwapOutlined />,
                label: 'Change Status',
                onClick: () => setStatusModal({ open: true, rule: record, pending: record.status }),
              },
            ],
          }}
        >
          <Button
            type="text"
            size="small"
            icon={<MoreOutlined style={{ fontSize: 16, color: '#94a3b8' }} />}
          />
        </Dropdown>
      ),
    },
  ];

  const tabButtonStyle = (status: SalaryRuleStatus): React.CSSProperties => ({
    minWidth: 104,
    height: 32,
    border: 'none',
    borderRadius: 8,
    background: activeTab === status ? '#e2e8f0' : 'transparent',
    color: activeTab === status ? '#0f172a' : '#475569',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '0 12px',
  });

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: 24, background: 'var(--color-bg-base)' }}>
      <div className="page-header-row">
        <div>
          <h1>Salary Rules Type</h1>
          <p>Manage payroll salary rule types and status.</p>
        </div>
      </div>

      <div
        className="surface"
        style={{
          padding: 0,
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '16px 18px 10px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
            <Space size={8} wrap>
              <Input
                placeholder="Search Salary Rule..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={{ width: 260 }}
                onPressEnter={handleSearch}
              />
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>Search</Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>Reset</Button>
            </Space>

            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>Create New</Button>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              background: '#f1f5f9',
              border: '1px solid var(--color-border)',
              borderRadius: 10,
              padding: 4,
            }}
          >
            <button type="button" style={tabButtonStyle('active')} onClick={() => setActiveTab('active')}>
              <ThunderboltFilled style={{ fontSize: 12 }} />
              Active
            </button>
            <button type="button" style={tabButtonStyle('inactive')} onClick={() => setActiveTab('inactive')}>
              <InboxOutlined style={{ fontSize: 12 }} />
              Archieve
            </button>
          </div>
        </div>

        <Table<SalaryRuleType>
          rowKey="id"
          columns={columns}
          dataSource={filteredRules}
          pagination={false}
          bordered={false}
          locale={{ emptyText: 'No salary rules found.' }}
        />
      </div>

      <Modal
        open={modalOpen}
        title={modalMode === 'edit' ? 'Edit Salary Rules Type' : 'Create Salary Rules Type'}
        okText={modalMode === 'edit' ? 'Update' : 'Submit'}
        cancelText="Cancel"
        onOk={handleSubmit}
        onCancel={resetModal}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 6 }}>
          <div>
            <div style={{ marginBottom: 6, fontSize: 12, fontWeight: 700, color: '#4b5563' }}>* SALARY RULES TYPE</div>
            <Input
              placeholder="e.g. Basic Salary"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div>
            <div style={{ marginBottom: 6, fontSize: 12, fontWeight: 700, color: '#4b5563' }}>* CODE</div>
            <Input
              placeholder="e.g. BS"
              value={form.code}
              onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
            />
          </div>

          <div>
            <div style={{ marginBottom: 6, fontSize: 12, fontWeight: 700, color: '#4b5563' }}>DESCRIPTION (OPTIONAL)</div>
            <Input.TextArea
              rows={4}
              placeholder="Brief details about the payroll rule..."
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={statusModal.open}
        title="Change Salary Rule Status"
        okText="Confirm"
        cancelText="Cancel"
        onOk={confirmStatusChange}
        onCancel={() => setStatusModal({ open: false, rule: null, pending: 'active' })}
      >
        {statusModal.rule && (
          <div>
            <p style={{ marginBottom: 16, color: '#374151', fontSize: 13 }}>
              <strong>{statusModal.rule.name}</strong> ({statusModal.rule.code})
            </p>
            <div style={{ marginBottom: 8, fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Set status to
            </div>
            <Radio.Group
              value={statusModal.pending}
              onChange={(e) => setStatusModal((prev) => ({ ...prev, pending: e.target.value }))}
              style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
            >
              <Radio value="active" style={{ fontSize: 13 }}>Active</Radio>
              <Radio value="inactive" style={{ fontSize: 13 }}>Archieve</Radio>
            </Radio.Group>
          </div>
        )}
      </Modal>
    </div>
  );
}
