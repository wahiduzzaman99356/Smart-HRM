import { useMemo, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  Badge,
  Button,
  Calendar,
  Card,
  Checkbox,
  DatePicker,
  Dropdown,
  Input,
  InputNumber,
  Modal,
  Radio,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { MenuProps, TableColumnsType } from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  DownOutlined,
  EyeOutlined,
  GlobalOutlined,
  PlusOutlined,
  ReloadOutlined,
  SendOutlined,
  SettingOutlined,
  StopOutlined,
} from '@ant-design/icons';
import {
  AIRCRAFT_TYPES,
  ApplicabilityMode,
  DESIGNATIONS,
  FocPolicy,
  FocPolicyConfig,
  FocScope,
  FocStatus,
  GRADE_LEVELS,
  INITIAL_POLICIES,
  INITIAL_SEAT_RULES,
  RouteEligibilityRule,
  SeatAllocationRule,
  STATUS_COLORS,
  TICKET_TYPES,
  WORK_LOCATIONS,
} from '../types/focPolicies.types';

const { Title, Text } = Typography;

type ViewMode = 'dashboard' | 'builder' | 'seat-allocation' | 'blackout' | 'details';
type BuilderMode = 'create' | 'edit';
type BlackoutMode = 'single' | 'multiple';
type DraftAction = 'save-draft' | 'submit';

const quillModules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'blockquote'],
    ['clean'],
  ],
};

const sectionCardStyle = {
  borderRadius: 16,
  border: '1px solid #d8e7e5',
  boxShadow: '0 12px 30px rgba(15, 40, 38, 0.06)',
};

const sectionTitleStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginBottom: 14,
} as const;

const panelDotStyle = {
  width: 8,
  height: 8,
  borderRadius: 999,
  background: '#60a5fa',
};

const CYCLE_TICKET_OPTIONS = [
  { label: 'SUBLO', value: 'Subload' },
  { label: 'Confirm', value: 'Confirm' },
];

const newCycleRule = (index: number) => ({
  id: `CY-${Date.now()}-${index}`,
  yearLabel: `${index} Year`,
  ticketType: index === 1 ? 'Subload' : 'Confirm',
  ticketCount: 1,
});

const newRouteRule = (index: number): RouteEligibilityRule => ({
  id: `RE-${Date.now()}-${index}`,
  operator: 'Less Than',
  fromYear: 5,
  toYear: null,
  routeCode: 'DAC',
});

const baseTerms = '<p>Enter the official policy text, legal disclaimers, and usage guidelines.</p>';

const buildDefaultConfig = (scope: FocScope): FocPolicyConfig => ({
  policyName: '',
  effectiveDate: dayjs().format('YYYY-MM-DD'),
  hasExpiryDate: true,
  expiryDate: dayjs().add(1, 'year').format('YYYY-MM-DD'),
  applicabilityMode: scope === 'International' ? 'Specific Work Location' : 'Job Grade Level',
  gradeLevels: scope === 'Domestic' ? ['G1'] : [],
  designations: scope === 'International' ? ['Captain'] : [],
  workLocations: scope === 'International' ? ['USA'] : [],
  restrictedGradeLevels: [],
  restrictedDesignations: [],
  restrictedWorkLocations: [],
  nationality: 'Bangladeshi',
  yearsAfterConfirmation: scope === 'International' ? 2 : 1,
  eligibilityBasis: 'Confirmation',
  cycleRules: [newCycleRule(1), newCycleRule(2)],
  selfTicketEnabled: true,
  selfTicketCount: 1,
  selfEntitlementEnabled: true,
  carryForwardEnabled: true,
  carryForwardCount: 2,
  allowParents: true,
  allowSpouse: true,
  allowChildren: true,
  allowUnmarriedChildrenOnly: true,
  maxChildren: 2,
  childAgeLimitYears: 18,
  childrenMaritalStatus: 'Unmarried',
  allowAdoptedChildren: true,
  parentEligibilityYears: 5,
  parentTransferTarget: 'Children',
  parentTicketCount: 1,
  parentRuleEnabled: true,
  parentFrequency: 'Lifetime',
  parentYearRange: 5,
  requirePassportValidation: scope === 'International',
  passportValidityMonths: 6,
  termsAndConditions: baseTerms,
  routeEligibilityRules: scope === 'International' ? [newRouteRule(1)] : [],
});

const formatDate = (dateText: string) => dayjs(dateText).format('DD MMM YYYY');

const summarizeRestrictions = (config: FocPolicyConfig): string[] => {
  const items: string[] = [];
  if (config.restrictedGradeLevels.length) items.push(`Restricted grade: ${config.restrictedGradeLevels.join(', ')}`);
  if (config.restrictedDesignations.length) items.push(`Restricted designation: ${config.restrictedDesignations.join(', ')}`);
  if (config.restrictedWorkLocations.length) items.push(`Restricted workplace: ${config.restrictedWorkLocations.join(', ')}`);
  return items;
};

const buildApplicability = (config: FocPolicyConfig): string => {
  const primary = config.applicabilityMode === 'Job Grade Level'
    ? config.gradeLevels.join(', ')
    : config.applicabilityMode === 'Specific Designations'
      ? config.designations.join(', ')
      : config.workLocations.join(', ');
  const restrictions = summarizeRestrictions(config);
  return restrictions.length > 0 ? `${primary} | ${restrictions.join(' | ')}` : primary;
};

const makePolicyFromConfig = (
  config: FocPolicyConfig,
  scope: FocScope,
  status: FocStatus,
  existing?: FocPolicy,
): FocPolicy => {
  const now = new Date().toISOString();
  return {
    id: existing?.id ?? `FOC-${Date.now()}`,
    policyName: config.policyName || `${scope} Policy ${dayjs().format('YYYY')}`,
    scope,
    effectiveDate: config.effectiveDate,
    applicability: buildApplicability(config),
    createdBy: existing?.createdBy ?? 'Policy Admin',
    status,
    updatedAt: now,
    approvedBy: status.startsWith('Approved') ? existing?.approvedBy ?? 'Head of HR' : undefined,
    approvalNote: existing?.approvalNote,
    config,
  };
};

export default function FocPoliciesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [builderMode, setBuilderMode] = useState<BuilderMode>('create');
  const [policies, setPolicies] = useState<FocPolicy[]>(INITIAL_POLICIES);
  const [seatRules, setSeatRules] = useState<SeatAllocationRule[]>(INITIAL_SEAT_RULES);
  const [blackoutDates, setBlackoutDates] = useState<string[]>(['2026-03-10', '2026-03-15']);
  const [blackoutMode, setBlackoutMode] = useState<BlackoutMode>('single');
  const [blackoutRangeAnchor, setBlackoutRangeAnchor] = useState<string | null>(null);
  const [scopeModalOpen, setScopeModalOpen] = useState(false);
  const [activeScope, setActiveScope] = useState<FocScope>('Domestic');
  const [activePolicyId, setActivePolicyId] = useState<string | null>(null);
  const [approvalNote, setApprovalNote] = useState('');
  const [searchText, setSearchText] = useState('');
  const [scopeFilter, setScopeFilter] = useState<FocScope | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<FocStatus | 'All'>('All');
  const [formData, setFormData] = useState<FocPolicyConfig>(buildDefaultConfig('Domestic'));

  const activePolicy = useMemo(
    () => policies.find(policy => policy.id === activePolicyId) ?? null,
    [policies, activePolicyId],
  );

  const statusCounts = useMemo(() => {
    const pending = policies.filter(policy => policy.status === 'Pending Approval').length;
    const active = policies.filter(policy => policy.status === 'Approved & Active').length;
    return { pending, active, total: policies.length };
  }, [policies]);

  const filteredPolicies = useMemo(() => {
    return policies.filter(policy => {
      const keyword = searchText.trim().toLowerCase();
      const textBlob = `${policy.policyName} ${policy.applicability} ${policy.id}`.toLowerCase();
      if (keyword && !textBlob.includes(keyword)) return false;
      if (scopeFilter !== 'All' && policy.scope !== scopeFilter) return false;
      if (statusFilter !== 'All' && policy.status !== statusFilter) return false;
      return true;
    });
  }, [policies, searchText, scopeFilter, statusFilter]);

  const resetBuilder = (scope: FocScope) => {
    setActiveScope(scope);
    setFormData(buildDefaultConfig(scope));
    setActivePolicyId(null);
    setBuilderMode('create');
    setApprovalNote('');
  };

  const openCreateScopeModal = () => setScopeModalOpen(true);

  const startCreateForScope = (scope: FocScope) => {
    resetBuilder(scope);
    setScopeModalOpen(false);
    setViewMode('builder');
  };

  const openDetails = (policy: FocPolicy) => {
    setActivePolicyId(policy.id);
    setApprovalNote(policy.approvalNote ?? '');
    setViewMode('details');
  };

  const openEdit = (policy: FocPolicy) => {
    setActivePolicyId(policy.id);
    setBuilderMode('edit');
    setActiveScope(policy.scope);
    setFormData({
      ...policy.config,
      cycleRules: policy.config.cycleRules.map(rule => ({ ...rule })),
      routeEligibilityRules: policy.config.routeEligibilityRules.map(rule => ({ ...rule })),
    });
    setViewMode('builder');
  };

  const updateForm = <K extends keyof FocPolicyConfig>(key: K, value: FocPolicyConfig[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleCarryForwardToggle = (enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      carryForwardEnabled: enabled,
      carryForwardCount: enabled ? (prev.carryForwardCount || 1) : 0,
    }));
  };

  const toIsoDateRange = (fromIso: string, toIso: string): string[] => {
    const start = dayjs(fromIso);
    const end = dayjs(toIso);
    const [rangeStart, rangeEnd] = start.isBefore(end) ? [start, end] : [end, start];

    const out: string[] = [];
    let cursor = rangeStart;
    while (cursor.isBefore(rangeEnd) || cursor.isSame(rangeEnd, 'day')) {
      out.push(cursor.format('YYYY-MM-DD'));
      cursor = cursor.add(1, 'day');
    }
    return out;
  };

  const handleChildrenToggle = (enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      allowChildren: enabled,
      maxChildren: enabled ? Math.max(prev.maxChildren, 1) : 0,
      allowAdoptedChildren: enabled ? prev.allowAdoptedChildren : false,
    }));
  };

  const handleParentsToggle = (enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      allowParents: enabled,
      parentTicketCount: enabled ? Math.max(prev.parentTicketCount, 1) : 0,
      parentRuleEnabled: enabled ? prev.parentRuleEnabled : false,
    }));
  };

  const handleParentRuleToggle = (enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      parentRuleEnabled: enabled,
      parentTicketCount: enabled ? Math.max(prev.parentTicketCount, 1) : 0,
      parentYearRange: enabled ? Math.max(prev.parentYearRange, 1) : 0,
    }));
  };

  const updateCycleRule = (ruleId: string, patch: Partial<FocPolicyConfig['cycleRules'][number]>) => {
    setFormData(prev => ({
      ...prev,
      cycleRules: prev.cycleRules.map(rule => (rule.id === ruleId ? { ...rule, ...patch } : rule)),
    }));
  };

  const addCycleRule = () => {
    setFormData(prev => ({
      ...prev,
      cycleRules: [...prev.cycleRules, newCycleRule(prev.cycleRules.length + 1)],
    }));
  };

  const removeCycleRule = (ruleId: string) => {
    setFormData(prev => ({
      ...prev,
      cycleRules: prev.cycleRules.filter(rule => rule.id !== ruleId),
    }));
  };

  const updateRouteRule = (ruleId: string, patch: Partial<RouteEligibilityRule>) => {
    setFormData(prev => ({
      ...prev,
      routeEligibilityRules: prev.routeEligibilityRules.map(rule => (rule.id === ruleId ? { ...rule, ...patch } : rule)),
    }));
  };

  const addRouteRule = () => {
    setFormData(prev => ({
      ...prev,
      routeEligibilityRules: [...prev.routeEligibilityRules, newRouteRule(prev.routeEligibilityRules.length + 1)],
    }));
  };

  const removeRouteRule = (ruleId: string) => {
    setFormData(prev => ({
      ...prev,
      routeEligibilityRules: prev.routeEligibilityRules.filter(rule => rule.id !== ruleId),
    }));
  };

  const validateBuilder = (): string | null => {
    if (!formData.policyName.trim()) return 'Policy name is required.';
    if (!formData.effectiveDate) return 'Effective date is required.';
    if (formData.hasExpiryDate && !formData.expiryDate) return 'Expiry date is required.';
    if (formData.cycleRules.length === 0) return 'At least one cycle matrix rule is required.';
    if (formData.applicabilityMode === 'Job Grade Level' && formData.gradeLevels.length === 0) return 'Select at least one job grade.';
    if (formData.applicabilityMode === 'Specific Designations' && formData.designations.length === 0) return 'Select at least one designation.';
    if (formData.applicabilityMode === 'Specific Work Location' && formData.workLocations.length === 0) return 'Select at least one work location.';
    if (activeScope === 'International' && formData.routeEligibilityRules.length === 0) return 'International policies require route eligibility rules.';
    if (formData.carryForwardEnabled && formData.carryForwardCount <= 0) return 'Validity in month must be greater than 0 when carry forward is enabled.';
    if (formData.allowChildren && formData.maxChildren <= 0) return 'Maximum children must be greater than 0 when Children is enabled.';
    if (formData.allowParents && formData.parentRuleEnabled && formData.parentTicketCount <= 0) return 'Parents ticket count must be greater than 0 when parent rule is enabled.';
    if (formData.allowParents && formData.parentRuleEnabled && formData.parentFrequency === 'Year Range' && formData.parentYearRange <= 0) {
      return 'Set a valid year when parent ticket frequency is Year Range.';
    }
    return null;
  };

  const upsertPolicyFromBuilder = (action: DraftAction) => {
    const errorText = validateBuilder();
    if (errorText) {
      message.error(errorText);
      return;
    }

    const existing = activePolicyId ? policies.find(policy => policy.id === activePolicyId) : undefined;
    const nextStatus: FocStatus = action === 'save-draft' ? 'Draft' : 'Pending Approval';
    const normalizedConfig = {
      ...formData,
      expiryDate: formData.hasExpiryDate ? formData.expiryDate : '',
    };
    const nextPolicy = makePolicyFromConfig(normalizedConfig, activeScope, nextStatus, existing);

    setPolicies(prev => existing
      ? prev.map(policy => (policy.id === existing.id ? nextPolicy : policy))
      : [nextPolicy, ...prev]);

    message.success(action === 'save-draft' ? 'Policy saved as draft.' : 'Policy submitted for approval successfully.');
    setViewMode('dashboard');
    setActivePolicyId(null);
  };

  const updatePolicyStatus = (policyId: string, status: FocStatus, note?: string) => {
    setPolicies(prev => prev.map(policy => {
      if (policy.id !== policyId) return policy;
      return {
        ...policy,
        status,
        updatedAt: new Date().toISOString(),
        approvedBy: status.startsWith('Approved') ? 'Head of HR' : policy.approvedBy,
        approvalNote: note ?? policy.approvalNote,
      };
    }));
  };

  const sendForApproval = (policy: FocPolicy) => {
    updatePolicyStatus(policy.id, 'Pending Approval');
    message.success('Policy sent for approval.');
  };

  const approvePolicy = (policy: FocPolicy) => {
    updatePolicyStatus(policy.id, 'Approved & Active', approvalNote || 'Approved by approver.');
    message.success('Policy approved and activated.');
    if (viewMode === 'details') setViewMode('dashboard');
  };

  const rejectPolicy = (policy: FocPolicy) => {
    updatePolicyStatus(policy.id, 'Rejected', approvalNote || 'Rejected by approver.');
    message.warning('Policy rejected.');
    if (viewMode === 'details') setViewMode('dashboard');
  };

  const toggleActiveState = (policy: FocPolicy) => {
    if (policy.status === 'Approved & Active') {
      updatePolicyStatus(policy.id, 'Approved & Inactive');
      message.success('Policy marked as inactive.');
      return;
    }
    if (policy.status === 'Approved & Inactive') {
      updatePolicyStatus(policy.id, 'Approved & Active');
      message.success('Policy activated.');
    }
  };

  const updateSeatRule = (ruleId: string, patch: Partial<SeatAllocationRule>) => {
    setSeatRules(prev => prev.map(rule => (rule.id === ruleId ? { ...rule, ...patch } : rule)));
  };

  const addSeatRule = () => {
    setSeatRules(prev => [...prev, {
      id: `SR-${Date.now()}`,
      aircraft: AIRCRAFT_TYPES[0],
      ticketType: TICKET_TYPES[0],
      maxSeats: 1,
    }]);
  };

  const removeSeatRule = (ruleId: string) => {
    setSeatRules(prev => prev.filter(rule => rule.id !== ruleId));
  };

  const resetSeatRules = () => {
    setSeatRules(INITIAL_SEAT_RULES);
    message.info('Seat allocation reset to default sample rules.');
  };

  const handleSeatSave = () => {
    if (seatRules.some(rule => rule.maxSeats <= 0)) {
      message.error('Max seats must be greater than 0 for all rows.');
      return;
    }
    message.success('Seat allocation saved.');
    setViewMode('dashboard');
  };

  const toggleBlackoutDate = (date: Dayjs) => {
    const iso = date.format('YYYY-MM-DD');
    if (blackoutMode === 'single') {
      setBlackoutRangeAnchor(null);
      setBlackoutDates([iso]);
      return;
    }

    if (!blackoutRangeAnchor) {
      setBlackoutRangeAnchor(iso);
      setBlackoutDates(prev => (prev.includes(iso) ? prev : [...prev, iso]));
      return;
    }

    const range = toIsoDateRange(blackoutRangeAnchor, iso);
    setBlackoutDates(prev => Array.from(new Set([...prev, ...range])));
    setBlackoutRangeAnchor(null);
  };

  const clearBlackout = () => setBlackoutDates([]);

  const applyBlackout = () => {
    if (blackoutDates.length === 0) {
      message.warning('Select at least one blackout date.');
      return;
    }
    message.success(`Applied ${blackoutDates.length} blackout date(s).`);
    setViewMode('dashboard');
  };

  const renderStatusTag = (status: FocStatus) => {
    const tone = STATUS_COLORS[status];
    return (
      <span
        style={{
          background: tone.bg,
          color: tone.fg,
          border: `1px solid ${tone.border}`,
          padding: '2px 10px',
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 600,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {status === 'Pending Approval' && <ClockCircleOutlined />}
        {status.startsWith('Approved') && <CheckCircleOutlined />}
        {status === 'Rejected' && <StopOutlined />}
        {status}
      </span>
    );
  };

  const getActionItems = (policy: FocPolicy): MenuProps['items'] => {
    const canApprove = policy.status === 'Pending Approval';
    const canToggle = policy.status === 'Approved & Active' || policy.status === 'Approved & Inactive';
    return [
      { key: 'view', label: 'View', icon: <EyeOutlined /> },
      { key: 'edit', label: 'Edit', icon: <SettingOutlined />, disabled: policy.status === 'Pending Approval' },
      {
        key: 'toggle-active',
        label: policy.status === 'Approved & Inactive' ? 'Make Active' : 'Make Inactive',
        icon: <CheckCircleOutlined />,
        disabled: !canToggle,
      },
      { key: 'approve', label: 'Approve', icon: <CheckCircleOutlined />, disabled: !canApprove },
      { key: 'reject', label: 'Reject', icon: <StopOutlined />, disabled: !canApprove },
      { key: 'send-for-approval', label: 'Send for Approval', icon: <SendOutlined />, disabled: policy.status !== 'Draft' },
    ];
  };

  const handleActionClick = (action: string, policy: FocPolicy) => {
    if (action === 'view') return openDetails(policy);
    if (action === 'edit') return openEdit(policy);
    if (action === 'toggle-active') return toggleActiveState(policy);
    if (action === 'send-for-approval') return sendForApproval(policy);
    if (action === 'approve') {
      setApprovalNote('Approved from list action.');
      return approvePolicy(policy);
    }
    if (action === 'reject') {
      setApprovalNote('Rejected from list action.');
      rejectPolicy(policy);
    }
  };

  const renderPrimaryTargetField = () => {
    if (formData.applicabilityMode === 'Job Grade Level') {
      return (
        <div>
          <Text strong>Select Job Grades</Text>
          <Select
            mode="multiple"
            value={formData.gradeLevels}
            onChange={value => updateForm('gradeLevels', value)}
            options={GRADE_LEVELS.map(level => ({ label: level, value: level }))}
            style={{ width: '100%', marginTop: 6 }}
            placeholder="Select job grades"
          />
        </div>
      );
    }
    if (formData.applicabilityMode === 'Specific Designations') {
      return (
        <div>
          <Text strong>Select Designations</Text>
          <Select
            mode="multiple"
            value={formData.designations}
            onChange={value => updateForm('designations', value)}
            options={DESIGNATIONS.map(item => ({ label: item, value: item }))}
            style={{ width: '100%', marginTop: 6 }}
            placeholder="Select designations"
          />
        </div>
      );
    }
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 1fr) minmax(220px, 1fr)', gap: 10 }}>
        <div>
          <Text strong>Select Work Locations</Text>
          <Select
            mode="multiple"
            value={formData.workLocations}
            onChange={value => updateForm('workLocations', value)}
            options={WORK_LOCATIONS.map(item => ({ label: item, value: item }))}
            style={{ width: '100%', marginTop: 6 }}
            placeholder="Select work locations"
          />
        </div>
        <div>
          <Text strong>Nationality</Text>
          <Select
            value={formData.nationality}
            onChange={value => updateForm('nationality', value)}
            options={[{ label: 'Bangladeshi', value: 'Bangladeshi' }, { label: 'Any', value: 'Any' }]}
            style={{ width: '100%', marginTop: 6 }}
          />
        </div>
      </div>
    );
  };

  const renderRestrictionFields = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, marginTop: 12 }}>
      {formData.applicabilityMode !== 'Specific Designations' && (
        <div>
          <Text strong>Restrict Specific Designations</Text>
          <Select
            mode="multiple"
            value={formData.restrictedDesignations}
            onChange={value => updateForm('restrictedDesignations', value)}
            options={DESIGNATIONS.map(item => ({ label: item, value: item }))}
            style={{ width: '100%', marginTop: 6 }}
            placeholder="Optional restriction"
          />
        </div>
      )}
      {formData.applicabilityMode !== 'Job Grade Level' && (
        <div>
          <Text strong>Restrict Job Grades</Text>
          <Select
            mode="multiple"
            value={formData.restrictedGradeLevels}
            onChange={value => updateForm('restrictedGradeLevels', value)}
            options={GRADE_LEVELS.map(item => ({ label: item, value: item }))}
            style={{ width: '100%', marginTop: 6 }}
            placeholder="Optional restriction"
          />
        </div>
      )}
      {formData.applicabilityMode !== 'Specific Work Location' && (
        <div>
          <Text strong>Restrict Work Locations</Text>
          <Select
            mode="multiple"
            value={formData.restrictedWorkLocations}
            onChange={value => updateForm('restrictedWorkLocations', value)}
            options={WORK_LOCATIONS.map(item => ({ label: item, value: item }))}
            style={{ width: '100%', marginTop: 6 }}
            placeholder="Optional restriction"
          />
        </div>
      )}
    </div>
  );

  const policyColumns: TableColumnsType<FocPolicy> = [
    {
      title: 'Policy Name',
      key: 'policyName',
      render: (_, policy) => (
        <div>
          <div style={{ fontWeight: 700, color: '#111827' }}>{policy.policyName}</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>Effective: {policy.effectiveDate}</div>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'scope',
      key: 'scope',
      width: 160,
      render: (scope: FocScope) => (
        <Tag color={scope === 'Domestic' ? 'blue' : 'green'} style={{ borderRadius: 14, paddingInline: 10 }}>
          {scope.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Applicability',
      dataIndex: 'applicability',
      key: 'applicability',
      width: 300,
    },
    {
      title: 'Approval Status',
      dataIndex: 'status',
      key: 'status',
      width: 220,
      render: (status: FocStatus) => renderStatusTag(status),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, policy) => (
        <Dropdown
          menu={{ items: getActionItems(policy), onClick: ({ key }) => handleActionClick(String(key), policy) }}
          trigger={['click']}
        >
          <Button>
            Action <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },
  ];

  const DashboardView = (
    <div style={{ padding: 22 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, marginBottom: 14, flexWrap: 'wrap' }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>FOC Policies</Title>
          <Text style={{ color: '#64748b' }}>Manage domestic and international free ticket policy rules.</Text>
          <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Badge color="#059669" text={`${statusCounts.active} active`} />
            <Badge color="#d97706" text={`${statusCounts.pending} pending`} />
            <Badge color="#64748b" text={`${statusCounts.total} total`} />
          </div>
        </div>
        <Space size={10} wrap>
          <Button icon={<SettingOutlined />} onClick={() => setViewMode('seat-allocation')}>Seat Allocation</Button>
          <Button icon={<ClockCircleOutlined />} onClick={() => setViewMode('blackout')} style={{ borderColor: '#10b981', color: '#10b981' }}>Set Black-Out Periods</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateScopeModal}>Create Policy</Button>
        </Space>
      </div>

      <Card bodyStyle={{ padding: 16 }} style={{ borderRadius: 12 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
          <Input.Search placeholder="Search policies..." value={searchText} onChange={event => setSearchText(event.target.value)} style={{ maxWidth: 320 }} allowClear />
          <Select style={{ width: 170 }} value={scopeFilter} onChange={value => setScopeFilter(value)} options={[{ label: 'All Types', value: 'All' }, { label: 'Domestic', value: 'Domestic' }, { label: 'International', value: 'International' }]} />
          <Select style={{ width: 200 }} value={statusFilter} onChange={value => setStatusFilter(value)} options={[{ label: 'All Statuses', value: 'All' }, { label: 'Draft', value: 'Draft' }, { label: 'Pending Approval', value: 'Pending Approval' }, { label: 'Approved & Active', value: 'Approved & Active' }, { label: 'Approved & Inactive', value: 'Approved & Inactive' }, { label: 'Rejected', value: 'Rejected' }]} />
          <Button icon={<ReloadOutlined />} onClick={() => { setSearchText(''); setScopeFilter('All'); setStatusFilter('All'); }}>Reset</Button>
        </div>
        <Table rowKey="id" columns={policyColumns} dataSource={filteredPolicies} pagination={{ pageSize: 8, showSizeChanger: false }} />
      </Card>
    </div>
  );

  const BuilderView = (
    <div style={{ padding: 22, overflowY: 'auto', height: '100%' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <div>
            <Text style={{ color: '#94a3b8', fontSize: 11, letterSpacing: 0.7 }}>POLICY CONFIGURATION / {activeScope.toUpperCase()}</Text>
            <Title level={4} style={{ margin: '2px 0 0' }}>FOC Rules Builder</Title>
          </div>
          <Space>
            <Button onClick={() => upsertPolicyFromBuilder('save-draft')}>Draft Mode</Button>
            <Button type="primary" onClick={() => upsertPolicyFromBuilder('submit')}>Save Policy</Button>
          </Space>
        </div>

        <Card style={{ ...sectionCardStyle, marginBottom: 14 }} bodyStyle={{ padding: 20 }}>
          <div style={sectionTitleStyle}><span style={panelDotStyle} /><Text strong>General Information</Text></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 2fr) repeat(3, minmax(170px, 1fr))', gap: 12, alignItems: 'end' }}>
            <div>
              <Text strong>Policy Name</Text>
              <Input value={formData.policyName} onChange={event => updateForm('policyName', event.target.value)} placeholder="e.g., Annual Staff Tickets 2026" style={{ marginTop: 6 }} />
            </div>
            <div>
              <Text strong>Effective Date</Text>
              <DatePicker value={dayjs(formData.effectiveDate)} onChange={value => updateForm('effectiveDate', value ? value.format('YYYY-MM-DD') : '')} style={{ width: '100%', marginTop: 6 }} />
            </div>
            <div>
              <Checkbox checked={formData.hasExpiryDate} onChange={event => updateForm('hasExpiryDate', event.target.checked)}>Expiry Date</Checkbox>
              <DatePicker value={formData.expiryDate ? dayjs(formData.expiryDate) : null} onChange={value => updateForm('expiryDate', value ? value.format('YYYY-MM-DD') : '')} disabled={!formData.hasExpiryDate} style={{ width: '100%', marginTop: 6 }} />
            </div>
            <div>
              <Text strong>Scope</Text>
              <div style={{ marginTop: 8 }}>
                <Tag color={activeScope === 'Domestic' ? 'blue' : 'green'}>{activeScope.toUpperCase()}</Tag>
                <Text type="secondary" style={{ display: 'block', marginTop: 6 }}>{builderMode === 'create' ? 'New policy configuration' : 'Editing existing policy'}</Text>
              </div>
            </div>
          </div>
        </Card>

        <Card style={{ ...sectionCardStyle, marginBottom: 14 }} bodyStyle={{ padding: 20 }}>
          <div style={sectionTitleStyle}><span style={panelDotStyle} /><Text strong>Policy Applicability Target</Text></div>
          <Radio.Group value={formData.applicabilityMode} onChange={event => updateForm('applicabilityMode', event.target.value as ApplicabilityMode)}>
            <Space wrap>
              <Radio value="Job Grade Level">Job Grade Level</Radio>
              <Radio value="Specific Designations">Specific Designations</Radio>
              <Radio value="Specific Work Location">Specific Work Location</Radio>
            </Space>
          </Radio.Group>
          <div style={{ marginTop: 14 }}>{renderPrimaryTargetField()}</div>
          {renderRestrictionFields()}
        </Card>

        <Card style={{ ...sectionCardStyle, marginBottom: 14 }} bodyStyle={{ padding: 20 }}>
          <div style={sectionTitleStyle}><span style={panelDotStyle} /><Text strong>Eligibility & Cycle Matrix</Text></div>
          <div style={{ display: 'grid', gridTemplateColumns: '220px 120px 180px', gap: 10, marginBottom: 14 }}>
            <div>
              <Text strong>Eligible on completion of</Text>
              <InputNumber min={0} value={formData.yearsAfterConfirmation} onChange={value => updateForm('yearsAfterConfirmation', Number(value) || 0)} style={{ width: '100%', marginTop: 6 }} />
            </div>
            <div style={{ alignSelf: 'end', paddingBottom: 6 }}><Text>Year after</Text></div>
            <div>
              <Text strong>Eligibility Basis</Text>
              <Select
                value={formData.eligibilityBasis}
                onChange={value => updateForm('eligibilityBasis', value)}
                style={{ width: '100%', marginTop: 6 }}
                options={[
                  { label: 'Confirmation', value: 'Confirmation' },
                  { label: 'Joining', value: 'Joining' },
                ]}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 1fr) minmax(160px, 220px)', gap: 12, marginBottom: 12 }}>
            <div>
              <Text strong>Self Ticket Configuration</Text>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                <Switch checked={formData.selfTicketEnabled} onChange={checked => updateForm('selfTicketEnabled', checked)} />
                <Text type="secondary">Configure tickets before employee is eligible for FOC</Text>
              </div>
            </div>
            <div>
              <Text strong>Self Ticket Count</Text>
              <InputNumber min={0} value={formData.selfTicketCount} onChange={value => updateForm('selfTicketCount', Number(value) || 0)} style={{ width: '100%', marginTop: 6 }} disabled={!formData.selfTicketEnabled} />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Text strong>Cycle Matrix</Text>
              <Tag color="green">Add Year</Tag>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '160px minmax(160px, 1fr) 120px 44px', gap: 8, marginBottom: 8, padding: '0 4px' }}>
              <Text strong>Year</Text>
              <Text strong>Ticket Type</Text>
              <Text strong>Ticket Count</Text>
              <span />
            </div>
            {formData.cycleRules.map((rule, index) => (
              <div key={rule.id} style={{ display: 'grid', gridTemplateColumns: '160px minmax(160px, 1fr) 120px 44px', gap: 8, marginBottom: 8, padding: 10, borderRadius: 10, background: '#f8fafc', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', height: 32, padding: '0 10px', border: '1px solid #d1d5db', borderRadius: 8, background: '#f1f5f9', color: '#475569', fontWeight: 600 }}>
                  {index === 0 ? '1st Year' : index === 1 ? '2nd Year' : rule.yearLabel}
                </div>
                <Select value={rule.ticketType} onChange={value => updateCycleRule(rule.id, { ticketType: value })} options={CYCLE_TICKET_OPTIONS} disabled={index < 2} />
                <InputNumber min={0} value={rule.ticketCount} onChange={value => updateCycleRule(rule.id, { ticketCount: Number(value) || 0 })} style={{ width: '100%' }} />
                <Button danger type="text" icon={<DeleteOutlined />} onClick={() => removeCycleRule(rule.id)} disabled={index < 2} />
              </div>
            ))}
            <Button type="dashed" icon={<PlusOutlined />} onClick={addCycleRule}>Add Year</Button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 170px', gap: 12, borderTop: '1px solid #e5e7eb', paddingTop: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Text strong style={{ margin: 0 }}>FOC Balance Carry Forward</Text>
                <Switch checked={formData.carryForwardEnabled} onChange={handleCarryForwardToggle} />
              </div>
              <Text type="secondary">Allow unused FOC balance to carry forward to the next cycle</Text>
            </div>
            <div>
              <Text strong>Validity in Month*</Text>
              <InputNumber min={0} value={formData.carryForwardCount} disabled={!formData.carryForwardEnabled} onChange={value => updateForm('carryForwardCount', Number(value) || 0)} style={{ width: 100, marginTop: 6 }} />
            </div>
          </div>
        </Card>

        <Card style={{ ...sectionCardStyle, marginBottom: 14 }} bodyStyle={{ padding: 20 }}>
          <div style={sectionTitleStyle}><span style={panelDotStyle} /><Text strong>Passenger Entitlements</Text></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 14 }}>
            {[
              { key: 'selfEntitlementEnabled', title: 'Self', subtitle: 'Primary employee' },
              { key: 'allowSpouse', title: 'Spouse', subtitle: 'Legally married' },
              { key: 'allowChildren', title: 'Children', subtitle: 'Dependents' },
              { key: 'allowParents', title: 'Parents', subtitle: 'Mother & father' },
            ].map(item => (
              <div key={item.key} style={{ border: '1px solid #7aa7ff', borderRadius: 12, padding: 14, textAlign: 'center', background: '#fbfdff' }}>
                <div style={{ fontWeight: 700, color: '#1f2937' }}>{item.title}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 10 }}>{item.subtitle}</div>
                <Switch
                  checked={Boolean(formData[item.key as keyof FocPolicyConfig])}
                  onChange={(checked) => {
                    if (item.key === 'allowChildren') {
                      handleChildrenToggle(checked);
                      return;
                    }
                    if (item.key === 'allowParents') {
                      handleParentsToggle(checked);
                      return;
                    }
                    updateForm(item.key as keyof FocPolicyConfig, checked as never);
                  }}
                />
              </div>
            ))}
          </div>
          {formData.allowParents && (
            <div style={{ marginBottom: 10 }}><Text style={{ color: '#10b981', fontWeight: 600 }}>If unmarried, can apply for Parents</Text></div>
          )}

          {formData.allowChildren && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 14 }}>
              <div>
                <Text strong>Maximum Children</Text>
                <InputNumber min={0} value={formData.maxChildren} onChange={value => updateForm('maxChildren', Number(value) || 0)} style={{ width: '100%', marginTop: 6 }} />
              </div>
              <div>
                <Text strong>Age Limit (Years)</Text>
                <InputNumber min={0} value={formData.childAgeLimitYears} onChange={value => updateForm('childAgeLimitYears', Number(value) || 0)} style={{ width: '100%', marginTop: 6 }} />
              </div>
              <div>
                <Text strong>Marital Status</Text>
                <Select value={formData.childrenMaritalStatus} onChange={value => updateForm('childrenMaritalStatus', value)} options={[{ label: 'Any', value: 'Any' }, { label: 'Unmarried', value: 'Unmarried' }, { label: 'Married', value: 'Married' }]} style={{ width: '100%', marginTop: 6 }} />
              </div>
              <div style={{ alignSelf: 'end' }}>
                <Checkbox checked={formData.allowAdoptedChildren} onChange={event => updateForm('allowAdoptedChildren', event.target.checked)}>Adopted Allowed</Checkbox>
              </div>
            </div>
          )}

          {formData.allowParents && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Text strong>Parents Rule</Text>
                <Switch checked={formData.parentRuleEnabled} onChange={handleParentRuleToggle} />
              </div>
            </div>
          )}

          {formData.allowParents && formData.parentRuleEnabled && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
              <div>
                <Text strong>Parents Rule: Eligible after</Text>
                <InputNumber min={0} value={formData.parentEligibilityYears} onChange={value => updateForm('parentEligibilityYears', Number(value) || 0)} style={{ width: '100%', marginTop: 6 }} />
              </div>
              <div>
                <Text strong>May transfer entitlement to</Text>
                <Select value={formData.parentTransferTarget} onChange={value => updateForm('parentTransferTarget', value)} options={[{ label: 'Children', value: 'Children' }, { label: 'Spouse', value: 'Spouse' }, { label: 'Family', value: 'Family' }]} style={{ width: '100%', marginTop: 6 }} />
              </div>
              <div>
                <Text strong>Ticket Count</Text>
                <InputNumber min={0} value={formData.parentTicketCount} onChange={value => updateForm('parentTicketCount', Number(value) || 0)} style={{ width: '100%', marginTop: 6 }} />
              </div>
              <div>
                <Text strong>Ticket Frequency</Text>
                <Select value={formData.parentFrequency} onChange={value => updateForm('parentFrequency', value)} options={[{ label: 'Lifetime', value: 'Lifetime' }, { label: 'Year Range', value: 'Year Range' }, { label: 'Annual', value: 'Annual' }]} style={{ width: '100%', marginTop: 6 }} />
              </div>
              {formData.parentFrequency === 'Year Range' && (
                <div>
                  <Text strong>Set Year</Text>
                  <InputNumber min={1} value={formData.parentYearRange} onChange={value => updateForm('parentYearRange', Number(value) || 1)} style={{ width: '100%', marginTop: 6 }} />
                </div>
              )}
            </div>
          )}
        </Card>

        {activeScope === 'International' && (
          <Card style={{ ...sectionCardStyle, marginBottom: 14 }} bodyStyle={{ padding: 20 }}>
            <div style={sectionTitleStyle}><span style={panelDotStyle} /><Text strong>International Route Eligibility</Text><Text type="secondary">(Service Based)</Text></div>
            {formData.routeEligibilityRules.map(rule => (
              <div key={rule.id} style={{ display: 'grid', gridTemplateColumns: '170px 100px 100px minmax(180px, 1fr) 44px', gap: 8, marginBottom: 8, padding: 10, borderRadius: 10, border: '1px solid #e5e7eb', background: '#fafcff' }}>
                <Select value={rule.operator} onChange={value => updateRouteRule(rule.id, { operator: value })} options={[{ label: 'LESS THAN', value: 'Less Than' }, { label: 'MORE THAN', value: 'More Than' }, { label: 'RANGE', value: 'Range' }]} />
                <InputNumber min={0} value={rule.fromYear} onChange={value => updateRouteRule(rule.id, { fromYear: Number(value) || 0 })} style={{ width: '100%' }} />
                <InputNumber min={0} value={rule.toYear ?? undefined} disabled={rule.operator !== 'Range'} onChange={value => updateRouteRule(rule.id, { toYear: Number(value) || 0 })} style={{ width: '100%' }} />
                <Select value={rule.routeCode} onChange={value => updateRouteRule(rule.id, { routeCode: value })} options={WORK_LOCATIONS.map(route => ({ label: route, value: route }))} />
                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeRouteRule(rule.id)} />
              </div>
            ))}
            <Button type="dashed" icon={<PlusOutlined />} onClick={addRouteRule}>Add Route Rule</Button>
          </Card>
        )}

        {activeScope === 'International' && (
          <Card style={{ ...sectionCardStyle, marginBottom: 14 }} bodyStyle={{ padding: 20 }}>
            <div style={sectionTitleStyle}><span style={panelDotStyle} /><Text strong>System Validations</Text></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(180px, 220px)', gap: 12, alignItems: 'end' }}>
              <div>
                <Text strong>Passport Expiry Check</Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                  <Switch checked={formData.requirePassportValidation} onChange={checked => updateForm('requirePassportValidation', checked)} />
                  <Text type="secondary">Applied to international only</Text>
                </div>
              </div>
              <div>
                <Text strong>Minimum Validity (Months)</Text>
                <InputNumber min={0} value={formData.passportValidityMonths} disabled={!formData.requirePassportValidation} onChange={value => updateForm('passportValidityMonths', Number(value) || 0)} style={{ width: '100%', marginTop: 6 }} />
              </div>
            </div>
          </Card>
        )}

        <Card style={{ ...sectionCardStyle, marginBottom: 14 }} bodyStyle={{ padding: 20 }}>
          <div style={sectionTitleStyle}><span style={panelDotStyle} /><Text strong>Terms and Conditions</Text></div>
          <div style={{ border: '1px solid #d8e7e5', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
            <ReactQuill theme="snow" value={formData.termsAndConditions} onChange={value => updateForm('termsAndConditions', value)} modules={quillModules} />
          </div>
        </Card>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 20 }}>
          <Button onClick={() => setViewMode('dashboard')}>Cancel</Button>
          <Button onClick={() => upsertPolicyFromBuilder('save-draft')}>Save Draft</Button>
          <Button type="primary" onClick={() => upsertPolicyFromBuilder('submit')}>Save Policy</Button>
        </div>
      </div>
    </div>
  );

  const SeatAllocationView = (
    <div style={{ padding: 22, overflowY: 'auto', height: '100%' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => setViewMode('dashboard')}>Back to Policies</Button>
            <Title level={4} style={{ margin: 0 }}>Seat Allocation configuration</Title>
          </div>
        </div>
        <Space wrap style={{ marginBottom: 12 }}>
          <Tag color="blue">{seatRules.length} Aircraft configured</Tag>
          <Tag color="green">{seatRules.filter(rule => rule.maxSeats > 0).length} Rules active</Tag>
          <Tag color="orange">Max seats applies per booking</Tag>
        </Space>
        <Card title="Aircraft-wise Maximum Seat Rules" style={sectionCardStyle} bodyStyle={{ padding: 18 }}>
          {seatRules.map(rule => (
            <div key={rule.id} style={{ display: 'grid', gridTemplateColumns: '220px 220px 150px 44px', gap: 10, marginBottom: 10, padding: 12, border: '1px solid #cfe0ff', borderRadius: 12, background: '#f5f9ff' }}>
              <Select value={rule.aircraft} onChange={value => updateSeatRule(rule.id, { aircraft: value })} options={AIRCRAFT_TYPES.map(item => ({ label: item, value: item }))} />
              <Select value={rule.ticketType} onChange={value => updateSeatRule(rule.id, { ticketType: value })} options={TICKET_TYPES.map(item => ({ label: item, value: item }))} />
              <InputNumber min={1} value={rule.maxSeats} onChange={value => updateSeatRule(rule.id, { maxSeats: Number(value) || 1 })} style={{ width: '100%' }} />
              <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeSeatRule(rule.id)} />
            </div>
          ))}
          <Button type="dashed" icon={<PlusOutlined />} onClick={addSeatRule} style={{ width: '100%', marginBottom: 14 }}>Add another rule</Button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <Text style={{ color: '#64748b' }}>{seatRules.length} rule(s) configured.</Text>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={resetSeatRules}>Reset All</Button>
              <Button onClick={() => setViewMode('dashboard')}>Cancel</Button>
              <Button type="primary" onClick={handleSeatSave}>Save & Apply</Button>
            </Space>
          </div>
        </Card>
      </div>
    </div>
  );

  const BlackoutView = (
    <div style={{ padding: 22, overflowY: 'auto', height: '100%' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
          <div>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => setViewMode('dashboard')}>Back to Policies</Button>
            <Title level={4} style={{ margin: 0 }}>Black-Out Periods</Title>
            <Text style={{ color: '#64748b' }}>Select dates when FOC travel is restricted.</Text>
          </div>
        </div>
        <Card style={sectionCardStyle} bodyStyle={{ padding: 20 }}>
          <Radio.Group value={blackoutMode} onChange={event => { setBlackoutMode(event.target.value as BlackoutMode); setBlackoutRangeAnchor(null); }} style={{ marginBottom: 10 }}>
            <Space>
              <Radio value="single">Specific</Radio>
              <Radio value="multiple">Date Range / Multiple</Radio>
            </Space>
          </Radio.Group>
          {blackoutMode === 'multiple' && (
            <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
              Click first date, then last date to auto-select the full date range.
            </Text>
          )}
          <Calendar
            fullscreen={false}
            onSelect={toggleBlackoutDate}
            fullCellRender={(date) => {
              const iso = date.format('YYYY-MM-DD');
              const selected = blackoutDates.includes(iso);
              return (
                <div style={{ height: 42, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', border: selected ? '1px solid #0f766e' : '1px solid transparent', background: selected ? '#d1fae5' : undefined, color: selected ? '#0f766e' : undefined, fontWeight: selected ? 700 : 400 }}>
                  {date.date()}
                </div>
              );
            }}
          />
          <div style={{ marginTop: 12 }}>
            <Text style={{ color: '#64748b' }}>Selected dates:</Text>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
              {blackoutDates.length === 0 && <Text type="secondary">No date selected</Text>}
              {blackoutDates.slice().sort().map(date => (
                <Tag key={date} closable onClose={() => setBlackoutDates(prev => prev.filter(item => item !== date))}>{formatDate(date)}</Tag>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, gap: 8 }}>
            <Button icon={<ReloadOutlined />} onClick={clearBlackout}>Reset</Button>
            <Button type="primary" onClick={applyBlackout}>Apply</Button>
          </div>
        </Card>
      </div>
    </div>
  );

  const DetailView = (
    <div style={{ padding: 22, overflowY: 'auto', height: '100%' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => setViewMode('dashboard')}>Back to Policies</Button>
        {activePolicy && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <Title level={4} style={{ marginBottom: 4 }}>{activePolicy.policyName}</Title>
                <Space wrap>
                  <Tag color={activePolicy.scope === 'Domestic' ? 'blue' : 'green'}>{activePolicy.scope}</Tag>
                  {renderStatusTag(activePolicy.status)}
                </Space>
              </div>
              {activePolicy.status === 'Pending Approval' && (
                <Space>
                  <Button danger onClick={() => { setApprovalNote('Rejected from details view.'); rejectPolicy(activePolicy); }}>Reject</Button>
                  <Button type="primary" onClick={() => { setApprovalNote('Approved from details view.'); approvePolicy(activePolicy); }}>Approve</Button>
                </Space>
              )}
            </div>

            <Card title="Policy Summary" style={{ ...sectionCardStyle, marginTop: 12 }} bodyStyle={{ padding: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                <div><Text type="secondary">Policy ID</Text><div style={{ fontWeight: 600 }}>{activePolicy.id}</div></div>
                <div><Text type="secondary">Effective Date</Text><div style={{ fontWeight: 600 }}>{formatDate(activePolicy.effectiveDate)}</div></div>
                <div><Text type="secondary">Expiry Date</Text><div style={{ fontWeight: 600 }}>{activePolicy.config.hasExpiryDate && activePolicy.config.expiryDate ? formatDate(activePolicy.config.expiryDate) : 'No expiry'}</div></div>
                <div><Text type="secondary">Applicability</Text><div style={{ fontWeight: 600 }}>{activePolicy.applicability}</div></div>
                <div><Text type="secondary">Created By</Text><div style={{ fontWeight: 600 }}>{activePolicy.createdBy}</div></div>
                <div><Text type="secondary">Approved By</Text><div style={{ fontWeight: 600 }}>{activePolicy.approvedBy ?? 'Pending'}</div></div>
              </div>
            </Card>

            <Card title="Configuration Details" style={{ ...sectionCardStyle, marginTop: 12 }} bodyStyle={{ padding: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                <div><Text type="secondary">Eligibility after {activePolicy.config.eligibilityBasis.toLowerCase()}</Text><div>{activePolicy.config.yearsAfterConfirmation} year(s)</div></div>
                <div><Text type="secondary">Carry Forward</Text><div>{activePolicy.config.carryForwardEnabled ? `Yes (${activePolicy.config.carryForwardCount} ${activePolicy.config.carryForwardCount === 1 ? 'month' : 'months'})` : 'No'}</div></div>
                <div><Text type="secondary">Passenger Entitlements</Text><div>Self: {activePolicy.config.selfEntitlementEnabled ? 'Yes' : 'No'} | Spouse: {activePolicy.config.allowSpouse ? 'Yes' : 'No'} | Children: {activePolicy.config.allowChildren ? 'Yes' : 'No'} | Parents: {activePolicy.config.allowParents ? 'Yes' : 'No'}</div></div>
                <div><Text type="secondary">Restrictions</Text><div>{summarizeRestrictions(activePolicy.config).join(' | ') || 'No restrictions'}</div></div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <Text type="secondary">Terms</Text>
                  <div style={{ marginTop: 6, padding: 12, borderRadius: 10, background: '#f8fafc', border: '1px solid #e5e7eb' }} dangerouslySetInnerHTML={{ __html: activePolicy.config.termsAndConditions }} />
                </div>
              </div>
            </Card>

            <Card title="Approver Note" style={{ ...sectionCardStyle, marginTop: 12 }} bodyStyle={{ padding: 18 }}>
              <Input.TextArea rows={3} value={approvalNote} onChange={event => setApprovalNote(event.target.value)} placeholder="Approver can add remarks before approval/rejection" />
            </Card>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ height: '100%', background: '#eef4f5' }}>
      {viewMode === 'dashboard' && DashboardView}
      {viewMode === 'builder' && BuilderView}
      {viewMode === 'seat-allocation' && SeatAllocationView}
      {viewMode === 'blackout' && BlackoutView}
      {viewMode === 'details' && DetailView}

      <Modal open={scopeModalOpen} footer={null} onCancel={() => setScopeModalOpen(false)} title={null} centered width={420}>
        <div style={{ paddingTop: 6 }}>
          <Title level={4} style={{ marginBottom: 6 }}>New Policy Scope</Title>
          <Text style={{ color: '#64748b' }}>Select the operational network scope for the new flight ticket policy.</Text>
          <Card hoverable style={{ marginTop: 12 }} onClick={() => startCreateForScope('Domestic')} bodyStyle={{ padding: 14 }}>
            <Space align="start">
              <GlobalOutlined style={{ fontSize: 20, color: '#2563eb' }} />
              <div>
                <div style={{ fontWeight: 700 }}>Domestic Network</div>
                <Text style={{ color: '#64748b' }}>Flights strictly within Bangladesh borders.</Text>
              </div>
            </Space>
          </Card>
          <Card hoverable style={{ marginTop: 10 }} onClick={() => startCreateForScope('International')} bodyStyle={{ padding: 14 }}>
            <Space align="start">
              <GlobalOutlined style={{ fontSize: 20, color: '#059669' }} />
              <div>
                <div style={{ fontWeight: 700 }}>International Network</div>
                <Text style={{ color: '#64748b' }}>Cross-border global flights and SAARC routes.</Text>
              </div>
            </Space>
          </Card>
        </div>
      </Modal>
    </div>
  );
}
