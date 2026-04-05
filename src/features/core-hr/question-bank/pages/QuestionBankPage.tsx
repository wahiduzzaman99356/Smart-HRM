import { useEffect, useState, useMemo } from 'react';
import {
  Button, Select, Table, Typography, Space, Row, Col,
  Tooltip, Avatar, Tag, DatePicker, Input, Dropdown, Modal, Radio, message, Checkbox, Divider, Upload,
} from 'antd';
import {
  SearchOutlined, FilterOutlined, UploadOutlined, DownloadOutlined, PlusOutlined,
  CopyOutlined, EditOutlined, SwapOutlined, MoreOutlined,
  ThunderboltFilled, InboxOutlined, FileTextOutlined,
  DatabaseFilled, CheckCircleFilled, CodeFilled, DeleteFilled,
  LeftOutlined, RightOutlined, ReloadOutlined, ClockCircleOutlined, CloseOutlined,
  BoldOutlined, ItalicOutlined, UnderlineOutlined, OrderedListOutlined, LinkOutlined, PictureOutlined, SettingOutlined,
} from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import type { Question, QuestionStatus, QuestionType, DifficultyLevel } from '../types/questionBank.types';

const { Text } = Typography;
const { Option } = Select;

const INITIAL_QUESTIONS: Question[] = [
  {
    id: 'Q-1901',
    text: 'What is the difference between == and === in JavaScript?',
    type: 'MCQ',
    topic: 'JavaScript',
    targetRole: 'Junior Developer',
    department: 'Engineering',
    difficulty: 'Easy',
    status: 'active',
    createdBy: { name: 'Jane Anderson', initials: 'J', color: 'var(--color-text-tertiary)' },
    createdAt: '2026-03-10',
    performance: { used: 16, successRate: 78 },
  },
  {
    id: 'Q-1902',
    text: 'Explain optimistic vs pessimistic locking with one practical use case each.',
    type: 'DESCRIPTIVE',
    topic: 'Database',
    targetRole: 'Senior Developer',
    department: 'Engineering',
    difficulty: 'Hard',
    status: 'active',
    createdBy: { name: 'Alex Chen', initials: 'A', color: 'var(--color-text-tertiary)' },
    createdAt: '2026-03-08',
    performance: { used: 7, successRate: 41 },
  },
  {
    id: 'Q-1903',
    text: 'True or False: REST services are stateless by contract.',
    type: 'TRUE_FALSE',
    topic: 'REST APIs',
    targetRole: 'Intern',
    department: 'Engineering',
    difficulty: 'Easy',
    status: 'draft',
    createdBy: { name: 'Sarah Smith', initials: 'S', color: 'var(--color-text-tertiary)' },
    createdAt: '2026-03-14',
    performance: { used: 0, successRate: 0 },
  },
  {
    id: 'Q-1842',
    text: 'Describe two tradeoffs of microservice architecture over monolith.',
    type: 'SHORT_QUESTION',
    topic: 'Architecture',
    targetRole: 'Team Lead',
    department: 'Engineering',
    difficulty: 'Medium',
    status: 'archived',
    createdBy: { name: 'Maria Lopez', initials: 'M', color: 'var(--color-text-tertiary)' },
    createdAt: '2025-12-02',
    performance: { used: 22, successRate: 63 },
  },
];

// ── Style helpers ─────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<QuestionType, { color: string; bg: string }> = {
  MCQ: { color: 'var(--color-text-secondary)', bg: 'var(--color-bg-subtle)' },
  MULTISELECT: { color: 'var(--color-text-secondary)', bg: 'var(--color-bg-subtle)' },
  DESCRIPTIVE: { color: 'var(--color-text-secondary)', bg: 'var(--color-bg-subtle)' },
  TRUE_FALSE: { color: 'var(--color-text-secondary)', bg: 'var(--color-bg-subtle)' },
  SHORT_QUESTION: { color: 'var(--color-text-secondary)', bg: 'var(--color-bg-subtle)' },
  LONG_QUESTION: { color: 'var(--color-text-secondary)', bg: 'var(--color-bg-subtle)' },
  FILE_UPLOAD: { color: 'var(--color-text-secondary)', bg: 'var(--color-bg-subtle)' },
};

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  MCQ: 'Single Choice (MCQ)',
  MULTISELECT: 'Multiple Choice (Checkbox)',
  DESCRIPTIVE: 'Descriptive',
  TRUE_FALSE: 'True-False',
  SHORT_QUESTION: 'Descriptive (Short Question)',
  LONG_QUESTION: 'Descriptive (Long Question)',
  FILE_UPLOAD: 'File Upload',
};

const DIFFICULTY_COLOR: Record<DifficultyLevel, string> = {
  Easy: 'var(--color-status-approved-bg)',
  Medium: 'rgba(252, 211, 77, 0.45)',
  Hard: 'var(--color-status-rejected-bg)',
};

const SUCCESS_COLOR = (rate: number) => rate >= 40 ? '#16a34a' : 'var(--color-text-tertiary)';

const formatOngoingDateTime = (value: Date) => value.toLocaleString('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
});

// ── Stat Card ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  accent: string;
  tint: string;
  value: number | string;
  label: string;
}
function StatCard({ icon, iconBg, accent, tint, value, label }: StatCardProps) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${tint} 0%, var(--color-bg-surface) 36%)`,
      borderRadius: 12,
      border: '1px solid var(--color-border)',
      padding: '20px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: 18,
      boxShadow: '0 1px 4px rgba(15,30,60,0.05)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: accent,
      }} />
      <div style={{
        width: 52,
        height: 52,
        borderRadius: 14,
        background: iconBg,
        color: accent,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 22,
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.1, color: 'var(--color-text-primary)' }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', color: accent, marginTop: 2, textTransform: 'uppercase' }}>
          {label}
        </div>
      </div>
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────
interface PageNavProps {
  current: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
}
function PageNav({ current, total, pageSize, onChange }: PageNavProps) {
  const totalPages = Math.ceil(total / pageSize);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const btnStyle = (active: boolean): React.CSSProperties => ({
    minWidth: 32,
    height: 32,
    padding: '0 10px',
    border: active ? 'none' : '1px solid var(--color-border)',
    borderRadius: 8,
    background: active ? 'var(--color-text-secondary)' : 'var(--color-bg-surface)',
    color: active ? '#fff' : 'var(--color-text-secondary)',
    fontWeight: active ? 700 : 400,
    cursor: active ? 'default' : 'pointer',
    fontSize: 13,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <button style={btnStyle(false)} onClick={() => onChange(Math.max(1, current - 1))} disabled={current === 1}>
        <LeftOutlined style={{ fontSize: 10 }} /> Previous
      </button>
      {pages.map(p => (
        <button key={p} style={btnStyle(p === current)} onClick={() => p !== current && onChange(p)}>
          {p}
        </button>
      ))}
      <button style={btnStyle(false)} onClick={() => onChange(Math.min(totalPages, current + 1))} disabled={current === totalPages}>
        Next <RightOutlined style={{ fontSize: 10 }} />
      </button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
const PAGE_SIZE = 4;

const SUBJECTS = ['Web Protocols', 'Database', 'JavaScript', 'HTTP', 'System Design', 'REST APIs', 'Algorithms', 'Software Design', 'Architecture', 'React', 'SDLC'];
const TOPICS = ['Algorithms', 'Web Protocols', 'API Design', 'Data Structures', 'System Design'];
const DEPARTMENTS = ['Engineering', 'Management', 'HR', 'Operations'];
const TARGET_ROLES = ['Intern', 'Junior Developer', 'Mid-level Developer', 'Senior Developer', 'Tech Lead', 'Architect', 'Project Manager'];

type AdvancedQuestionType = QuestionType | 'SHORT_QUESTION' | 'LONG_QUESTION' | 'FILE_UPLOAD';

interface CreateQuestionForm {
  questionType: AdvancedQuestionType;
  questionInputMode: 'TEXT' | 'IMAGE' | 'BOTH';
  questionText: string;
  questionImageName: string;
  questionImageDataUrl: string;
  options: string[];
  optionAttachments: string[];
  answerIndex: number;
  answerIndexes: number[];
  trueFalseAnswer: 'True' | 'False' | null;
  descriptiveAnswer: string;
  answerInputLimit: number | null;
  subject: string;
  topic: string;
  targetDepartment: string;
  section: string;
  targetDesignation: string;
  skillsTags: string[];
  answerTime: string;
  answerTimeCustom: string;
  points: number;
  difficulty: DifficultyLevel;
}

const SECTIONS = ['Frontend', 'Backend', 'DevOps', 'QA', 'Design', 'Product'];
const TIMER_OPTIONS = ['60s', '90s', '120s', '180s', '300s', 'Custom'];

interface QuestionBankConfiguration {
  maxRepeatCount: number;
  cooldownValue: number;
  cooldownUnit: 'days' | 'months';
}

const INITIAL_CONFIGURATION: QuestionBankConfiguration = {
  maxRepeatCount: 3,
  cooldownValue: 30,
  cooldownUnit: 'days',
};

const INITIAL_CREATE_FORM: CreateQuestionForm = {
  questionType: 'MCQ',
  questionInputMode: 'TEXT',
  questionText: '',
  questionImageName: '',
  questionImageDataUrl: '',
  options: ['', '', '', ''],
  optionAttachments: ['', '', '', ''],
  answerIndex: 0,
  answerIndexes: [],
  trueFalseAnswer: null,
  descriptiveAnswer: '',
  answerInputLimit: null,
  subject: 'Engineering',
  topic: 'Algorithms',
  targetDepartment: 'Engineering',
  section: 'Backend',
  targetDesignation: 'Senior Developer',
  skillsTags: [],
  answerTime: '120s',
  answerTimeCustom: '',
  points: 10,
  difficulty: 'Medium',
};

function mapQuestionToForm(question: Question): CreateQuestionForm {
  const questionType = question.type as AdvancedQuestionType;
  const options = questionType === 'TRUE_FALSE' ? ['True', 'False'] : ['', '', '', ''];

  return {
    ...INITIAL_CREATE_FORM,
    questionType,
    questionInputMode: 'TEXT',
    questionText: question.text,
    options,
    optionAttachments: options.map(() => ''),
    subject: SUBJECTS.includes(question.topic) ? question.topic : SUBJECTS[0],
    topic: TOPICS.includes(question.topic) ? question.topic : TOPICS[0],
    targetDepartment: DEPARTMENTS.includes(question.department) ? question.department : DEPARTMENTS[0],
    targetDesignation: TARGET_ROLES.includes(question.targetRole) ? question.targetRole : TARGET_ROLES[0],
    difficulty: question.difficulty,
  };
}

export default function QuestionBankPage() {
  const [activeTab, setActiveTab] = useState<QuestionStatus>('active');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [configurationOpen, setConfigurationOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<CreateQuestionForm>(INITIAL_CREATE_FORM);
  const [configuration, setConfiguration] = useState<QuestionBankConfiguration>(INITIAL_CONFIGURATION);
  const [tagInputValue, setTagInputValue] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState(() => new Date());
  const [statusModal, setStatusModal] = useState<{ open: boolean; question: Question | null; pending: QuestionStatus }>({
    open: false, question: null, pending: 'active',
  });

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const stats = useMemo(() => ({
    total: 1248,
    active: 856,
    drafts: 142,
    archived: 392,
  }), []);

  const filteredData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return INITIAL_QUESTIONS.filter(item => {
      if (item.status !== activeTab) return false;
      if (filterSubject && item.topic !== filterSubject) return false;
      if (filterType && item.type !== filterType) return false;
      if (filterDifficulty && item.difficulty !== filterDifficulty) return false;
      if (q && ![item.text, item.topic, item.targetRole, item.id].some(f => f.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [activeTab, searchQuery, filterSubject, filterType, filterDifficulty]);

  const pagedData = filteredData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleTabChange(tab: QuestionStatus) {
    setActiveTab(tab);
    setCurrentPage(1);
    setSelectedRowKeys([]);
  }

  function handleResetFilters() {
    setSearchQuery('');
    setFilterSubject('');
    setFilterType('');
    setFilterDifficulty('');
    setCurrentPage(1);
  }

  function resetCreateForm() {
    setCreateForm(INITIAL_CREATE_FORM);
    setTagInputValue('');
  }

  function setQuestionImage(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      setCreateForm(prev => ({
        ...prev,
        questionImageName: file.name,
        questionImageDataUrl: typeof reader.result === 'string' ? reader.result : '',
      }));
    };
    reader.readAsDataURL(file);
  }

  function clearQuestionImage() {
    setCreateForm(prev => ({
      ...prev,
      questionImageName: '',
      questionImageDataUrl: '',
    }));
  }

  function updateOption(index: number, value: string) {
    setCreateForm(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => (i === index ? value : opt)),
    }));
  }

  function updateOptionAttachment(index: number, fileName: string) {
    setCreateForm(prev => ({
      ...prev,
      optionAttachments: prev.optionAttachments.map((name, i) => (i === index ? fileName : name)),
    }));
  }

  function addOption() {
    setCreateForm(prev => ({
      ...prev,
      options: [...prev.options, ''],
      optionAttachments: [...prev.optionAttachments, ''],
    }));
  }

  function handleQuestionTypeChange(value: AdvancedQuestionType) {
    setCreateForm(prev => {
      const nextOptions = value === 'TRUE_FALSE'
        ? ['True', 'False']
        : prev.options.length >= 2 ? prev.options : ['', '', '', ''];

      return {
        ...prev,
        questionType: value,
        answerIndex: 0,
        answerIndexes: [],
        trueFalseAnswer: null,
        descriptiveAnswer: '',
        options: nextOptions,
        optionAttachments: nextOptions.map((_, i) => (value === 'TRUE_FALSE' ? '' : prev.optionAttachments[i] ?? '')),
      };
    });
  }

  function addTag(tag: string) {
    if (tag && !createForm.skillsTags.includes(tag)) {
      setCreateForm(prev => ({
        ...prev,
        skillsTags: [...prev.skillsTags, tag],
      }));
    }
  }

  function removeTag(tag: string) {
    setCreateForm(prev => ({
      ...prev,
      skillsTags: prev.skillsTags.filter(t => t !== tag),
    }));
  }

  function openCreateModal() {
    setModalMode('create');
    setEditingQuestionId(null);
    resetCreateForm();
    setCreateOpen(true);
  }

  function openEditModal(question: Question) {
    setModalMode('edit');
    setEditingQuestionId(question.id);
    setCreateForm(mapQuestionToForm(question));
    setTagInputValue('');
    setCreateOpen(true);
  }

  function publishQuestion() {
    if (createForm.questionInputMode === 'TEXT' && !createForm.questionText.trim()) {
      message.error('Please provide question text.');
      return;
    }

    if (createForm.questionInputMode === 'IMAGE' && !createForm.questionImageDataUrl) {
      message.error('Please upload a question image.');
      return;
    }

    if (createForm.questionInputMode === 'BOTH' && (!createForm.questionText.trim() || !createForm.questionImageDataUrl)) {
      message.error('Please provide both question text and image.');
      return;
    }

    message.success(modalMode === 'edit' ? 'Question updated successfully.' : 'Question published successfully.');
    setCreateOpen(false);
    setModalMode('create');
    setEditingQuestionId(null);
    resetCreateForm();
  }

  function saveDraft() {
    message.success(modalMode === 'edit' ? 'Question draft updated successfully.' : 'Question saved as draft.');
  }

  function saveConfiguration() {
    if (configuration.maxRepeatCount < 1) {
      message.error('Repeat count must be at least 1.');
      return;
    }

    if (configuration.cooldownValue < 1) {
      message.error('Cooldown value must be at least 1.');
      return;
    }

    message.success('Question Bank configuration saved successfully.');
    setConfigurationOpen(false);
  }

  const columns: TableColumnsType<Question> = [
    {
      title: <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--color-text-tertiary)' }}>QUESTION DETAIL</span>,
      dataIndex: 'text',
      key: 'text',
      width: 310,
      render: (text: string, record: Question) => (
        <Tooltip
          title={
            <div style={{ maxWidth: 280 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Full Question:</div>
              <div>{text}</div>
            </div>
          }
          placement="bottomLeft"
          color="#1e293b"
        >
          <div style={{ cursor: 'pointer' }}>
            <div style={{ color: '#1e40af', fontWeight: 500, fontSize: 13, lineHeight: 1.4, opacity: 0.85 }}>
              {text.length > 44 ? text.slice(0, 44) + '...' : text}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 2 }}>{record.id}</div>
          </div>
        </Tooltip>
      ),
    },
    {
      title: <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--color-text-tertiary)' }}>TYPE / TOPIC</span>,
      key: 'type',
      width: 150,
      render: (_: unknown, record: Question) => (
        <div>
          <Tag
            style={{
              background: TYPE_CONFIG[record.type].bg,
              color: TYPE_CONFIG[record.type].color,
              border: 'none',
              borderRadius: 4,
              fontWeight: 700,
              fontSize: 10,
              letterSpacing: '0.05em',
              padding: '1px 7px',
              marginBottom: 4,
              display: 'inline-block',
            }}
          >
            {QUESTION_TYPE_LABELS[record.type]}
          </Tag>
          <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>{record.topic}</div>
        </div>
      ),
    },
    {
      title: <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--color-text-tertiary)' }}>TARGET ROLE</span>,
      key: 'role',
      width: 150,
      render: (_: unknown, record: Question) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text-primary)' }}>{record.targetRole}</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>{record.department}</div>
        </div>
      ),
    },
    {
      title: <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--color-text-tertiary)' }}>DIFFICULTY</span>,
      key: 'difficulty',
      width: 110,
      render: (_: unknown, record: Question) => (
        <Space size={7} align="center">
          <span style={{
            width: 9, height: 9, borderRadius: '50%',
            background: DIFFICULTY_COLOR[record.difficulty],
            display: 'inline-block', flexShrink: 0,
          }} />
          <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{record.difficulty}</span>
        </Space>
      ),
    },
    {
      title: <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--color-text-tertiary)' }}>CREATED</span>,
      key: 'created',
      width: 170,
      render: (_: unknown, record: Question) => (
        <Space size={10} align="center">
          <Avatar
            size={28}
            style={{ background: record.createdBy.color, fontSize: 11, fontWeight: 700, flexShrink: 0 }}
          >
            {record.createdBy.initials}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--color-text-primary)' }}>{record.createdBy.name}</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{record.createdAt}</div>
          </div>
        </Space>
      ),
    },
    {
      title: <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--color-text-tertiary)' }}>PERFORMANCE</span>,
      key: 'performance',
      width: 130,
      render: (_: unknown, record: Question) => (
        <div style={{ lineHeight: 1.6 }}>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Used: <strong>{record.performance.used}</strong></div>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
            Success: <span style={{ color: SUCCESS_COLOR(record.performance.successRate), fontWeight: 700 }}>
              {record.performance.successRate}%
            </span>
          </div>
        </div>
      ),
    },
    {
      title: <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--color-text-tertiary)' }}>ACTIONS</span>,
      key: 'actions',
      width: 60,
      render: (_: unknown, record: Question) => (
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
                key: 'duplicate',
                icon: <CopyOutlined />,
                label: 'Duplicate',
                onClick: () => message.success(`Duplicated ${record.id}`),
              },
              {
                key: 'status',
                icon: <SwapOutlined />,
                label: 'Change Status',
                onClick: () => setStatusModal({ open: true, question: record, pending: record.status }),
              },
            ],
          }}
        >
          <Button
            type="text"
            size="small"
            icon={<MoreOutlined style={{ fontSize: 16, color: 'var(--color-text-tertiary)' }} />}
          />
        </Dropdown>
      ),
    },
  ];

  const tabItems: { key: QuestionStatus; icon: React.ReactNode; label: string }[] = [
    { key: 'active', icon: <ThunderboltFilled style={{ fontSize: 13 }} />, label: 'Active' },
    { key: 'archived', icon: <InboxOutlined style={{ fontSize: 13 }} />, label: 'Archived' },
    { key: 'draft', icon: <FileTextOutlined style={{ fontSize: 13 }} />, label: 'Drafts' },
  ];

  return (
    <div style={{ padding: 24, background: 'var(--color-bg-base)', minHeight: '100%' }}>

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="page-header-row">
        <div>
          <h1>Question Bank Management</h1>
          <p>Manage assessment questions by topic, type, and difficulty</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
          Add Question
        </Button>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────────────── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            icon={<DatabaseFilled />}
            iconBg="#ecfeff"
            accent="#0f766e"
            tint="rgba(15, 118, 110, 0.06)"
            value={stats.total}
            label="Total Questions"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            icon={<CheckCircleFilled />}
            iconBg="#ecfdf5"
            accent="#059669"
            tint="rgba(5, 150, 105, 0.06)"
            value={stats.active}
            label="Active"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            icon={<CodeFilled />}
            iconBg="#fffbeb"
            accent="#d97706"
            tint="rgba(217, 119, 6, 0.06)"
            value={stats.drafts}
            label="Drafts"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            icon={<DeleteFilled />}
            iconBg="#f1f5f9"
            accent="#64748b"
            tint="rgba(100, 116, 139, 0.06)"
            value={stats.archived}
            label="Archived"
          />
        </Col>
      </Row>

      {/* ── Main panel ─────────────────────────────────────────────────────── */}
      <div style={{
        background: 'var(--color-bg-surface)',
        borderRadius: 14,
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        boxShadow: '0 1px 6px rgba(15,30,60,0.06)',
      }}>

        {/* Tabs + Actions bar */}
        <div style={{
          padding: '14px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          borderBottom: '1px solid var(--color-border)',
        }}>
          {/* Tab buttons */}
          <Space size={4}>
            {tabItems.map(({ key, icon, label }) => (
              <button
                key={key}
                onClick={() => handleTabChange(key)}
                style={{
                  padding: '6px 16px',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: activeTab === key ? 700 : 500,
                  background: activeTab === key ? 'var(--color-bg-subtle)' : 'transparent',
                  color: activeTab === key ? 'var(--color-text-secondary)' : 'var(--color-text-tertiary)',
                  fontSize: 13,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                {icon}
                {label}
              </button>
            ))}
          </Space>

          {/* Action buttons */}
          <Space size={8}>
            <Input
              prefix={<SearchOutlined style={{ color: 'var(--color-text-tertiary)' }} />}
              placeholder="Search by keyword, subject, ID, or role..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              allowClear
              style={{ width: 320 }}
            />
            <Button
              icon={<FilterOutlined />}
              onClick={() => setShowFilters(v => !v)}
              style={showFilters ? { borderColor: 'var(--color-text-tertiary)', color: 'var(--color-text-secondary)' } : {}}
            >
              Filters
            </Button>
            <Button icon={<SettingOutlined />} onClick={() => setConfigurationOpen(true)}>
              Configuration
            </Button>
            <Button icon={<UploadOutlined style={{ color: '#22c55e' }} />}>Import</Button>
            <Button icon={<DownloadOutlined style={{ color: '#22c55e' }} />}>Export</Button>
          </Space>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div style={{
            padding: '16px 20px',
            background: 'var(--color-bg-subtle)',
            borderBottom: '1px solid var(--color-border)',
            borderLeft: '3px solid var(--color-border-strong)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <Space size={8} align="center">
                <FilterOutlined style={{ color: 'var(--color-text-tertiary)' }} />
                <span style={{ fontWeight: 700, fontSize: 12, letterSpacing: '0.07em', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                  Advanced Filtering
                </span>
              </Space>
              <Button type="link" size="small" onClick={handleResetFilters} icon={<ReloadOutlined />} style={{ color: 'var(--color-text-tertiary)', padding: 0, fontSize: 12 }}>
                Reset All Filters
              </Button>
            </div>

            <Row gutter={[12, 12]} align="bottom">
              <Col flex="1 1 160px">
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--color-text-tertiary)', marginBottom: 6, textTransform: 'uppercase' }}>Subject</div>
                <Select
                  placeholder="All Subjects"
                  style={{ width: '100%' }}
                  value={filterSubject || undefined}
                  onChange={v => { setFilterSubject(v || ''); setCurrentPage(1); }}
                  allowClear
                >
                  {SUBJECTS.map(s => <Option key={s} value={s}>{s}</Option>)}
                </Select>
              </Col>
              <Col flex="1 1 160px">
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--color-text-tertiary)', marginBottom: 6, textTransform: 'uppercase' }}>Question Type</div>
                <Select
                  placeholder="All Types"
                  style={{ width: '100%' }}
                  value={filterType || undefined}
                  onChange={v => { setFilterType(v || ''); setCurrentPage(1); }}
                  allowClear
                >
                  {(['MCQ', 'MULTISELECT', 'DESCRIPTIVE', 'TRUE_FALSE'] as const).map(t => (
                    <Option key={t} value={t}>{t}</Option>
                  ))}
                </Select>
              </Col>
              <Col flex="1 1 160px">
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--color-text-tertiary)', marginBottom: 6, textTransform: 'uppercase' }}>Difficulty</div>
                <Select
                  placeholder="All Levels"
                  style={{ width: '100%' }}
                  value={filterDifficulty || undefined}
                  onChange={v => { setFilterDifficulty(v || ''); setCurrentPage(1); }}
                  allowClear
                >
                  {(['Easy', 'Medium', 'Hard'] as DifficultyLevel[]).map(d => (
                    <Option key={d} value={d}>{d}</Option>
                  ))}
                </Select>
              </Col>
              <Col flex="2 1 260px">
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--color-text-tertiary)', marginBottom: 6, textTransform: 'uppercase' }}>Date Range</div>
                <DatePicker.RangePicker
                  style={{ width: '100%', height: 34 }}
                  placeholder={['Start date', 'End date']}
                />
              </Col>
              <Col flex="0 0 auto">
                <Button onClick={() => setShowFilters(false)} style={{ height: 34 }}>Close Panel</Button>
              </Col>
            </Row>
          </div>
        )}

        {/* Table */}
        <Table
          className="question-bank-table"
          rowKey="id"
          columns={columns}
          dataSource={pagedData}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          pagination={false}
          size="middle"
          style={{ minHeight: 240 }}
          locale={{ emptyText: <div style={{ padding: '32px 0', color: 'var(--color-text-disabled)' }}>No questions found for this filter.</div> }}
        />

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid var(--color-border)',
        }}>
          <Text style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
            Showing {pagedData.length} {pagedData.length !== filteredData.length ? `of ${filteredData.length} ` : ''}entries
          </Text>
          {filteredData.length > PAGE_SIZE && (
            <PageNav
              current={currentPage}
              total={filteredData.length}
              pageSize={PAGE_SIZE}
              onChange={setCurrentPage}
            />
          )}
        </div>
      </div>

      {/* ── Create Question Modal ───────────────────────────────────────────── */}
      <Modal
        open={createOpen}
        onCancel={() => {
          setCreateOpen(false);
          setModalMode('create');
          setEditingQuestionId(null);
        }}
        footer={null}
        width={1200}
        centered
        destroyOnClose
        closable={false}
        styles={{ body: { padding: 0, height: '78vh', overflow: 'hidden' } }}
        title={(
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 0 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
                {modalMode === 'edit' ? 'Edit Question' : 'Create New Question'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-disabled)', marginTop: 2 }}>
                {modalMode === 'edit'
                  ? `Update question details, answers, and metadata${editingQuestionId ? ` (${editingQuestionId})` : ''}.`
                  : 'Configure question details, answers, and metadata.'}
              </div>
            </div>
            <Space size={8} style={{ marginLeft: 'auto' }}>
              <Button type="primary" size="small" onClick={saveDraft} style={{ backgroundColor: 'var(--color-text-tertiary)', borderColor: 'var(--color-text-tertiary)' }}>
                Save as Draft
              </Button>
              <Button
                type="text"
                size="small"
                icon={<CloseOutlined style={{ color: 'var(--color-text-tertiary)' }} />}
                onClick={() => {
                  setCreateOpen(false);
                  setModalMode('create');
                  setEditingQuestionId(null);
                }}
              />
            </Space>
          </div>
        )}
      >
        <div style={{ borderTop: '1px solid var(--color-border)' }}>
          <Row gutter={0}>
            <Col xs={24} lg={16}>
              <div style={{ padding: '20px 24px', height: '78vh', overflowY: 'auto' }}>
                <div style={{ border: '1px solid var(--color-border)', borderRadius: 10, overflow: 'hidden', marginBottom: 18 }}>
                  <div style={{ height: 40, display: 'flex', alignItems: 'center', gap: 12, padding: '0 12px', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-tertiary)' }}>
                    <BoldOutlined style={{ cursor: 'pointer' }} />
                    <ItalicOutlined style={{ cursor: 'pointer' }} />
                    <UnderlineOutlined style={{ cursor: 'pointer' }} />
                    <OrderedListOutlined style={{ cursor: 'pointer' }} />
                    <LinkOutlined style={{ cursor: 'pointer' }} />
                    <Upload
                      beforeUpload={file => {
                        setQuestionImage(file);
                        return false;
                      }}
                      accept="image/*"
                      showUploadList={false}
                    >
                      <PictureOutlined style={{ cursor: 'pointer' }} />
                    </Upload>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                      {([
                        { key: 'TEXT', label: 'Text' },
                        { key: 'IMAGE', label: 'Image' },
                        { key: 'BOTH', label: 'Both' },
                      ] as const).map(item => {
                        const active = createForm.questionInputMode === item.key;
                        return (
                          <button
                            key={item.key}
                            onClick={() => setCreateForm(s => ({ ...s, questionInputMode: item.key }))}
                            style={{
                              border: active ? '1px solid #6366f1' : '1px solid var(--color-border)',
                              background: active ? 'var(--color-status-info-bg)' : 'var(--color-bg-surface)',
                              color: active ? '#3730a3' : 'var(--color-text-secondary)',
                              borderRadius: 6,
                              padding: '2px 8px',
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {(createForm.questionInputMode === 'TEXT' || createForm.questionInputMode === 'BOTH') && (
                    <Input.TextArea
                      bordered={false}
                      value={createForm.questionText}
                      onChange={e => setCreateForm(s => ({ ...s, questionText: e.target.value }))}
                      placeholder="Type your question statement here..."
                      autoSize={{ minRows: 6, maxRows: 9 }}
                      style={{ padding: '14px 12px', fontSize: 14, fontStyle: 'italic', color: 'var(--color-text-tertiary)' }}
                    />
                  )}

                  {(createForm.questionInputMode === 'IMAGE' || createForm.questionInputMode === 'BOTH') && (
                    <div style={{ padding: '12px', borderTop: (createForm.questionInputMode === 'BOTH' ? '1px solid #f1f5f9' : 'none') }}>
                      <Upload
                        beforeUpload={file => {
                          setQuestionImage(file);
                          return false;
                        }}
                        accept="image/*"
                        showUploadList={false}
                      >
                        <Button icon={<UploadOutlined />} size="small">Upload Question Image</Button>
                      </Upload>

                      {createForm.questionImageName && (
                        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <Tag closable onClose={clearQuestionImage} style={{ margin: 0 }}>
                            {createForm.questionImageName}
                          </Tag>
                        </div>
                      )}

                      {createForm.questionImageDataUrl && (
                        <div style={{ marginTop: 10, border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden', maxWidth: 440 }}>
                          <img
                            src={createForm.questionImageDataUrl}
                            alt="Question"
                            style={{ width: '100%', display: 'block', objectFit: 'contain', maxHeight: 240, background: 'var(--color-bg-subtle)' }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {(createForm.questionType === 'MCQ' || createForm.questionType === 'MULTISELECT') && (
                  <>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: 10 }}>
                      {createForm.questionType === 'MCQ' ? 'Single Choice Options' : 'Multi Select Options (Choose All Correct)'}
                    </div>

                    <Space direction="vertical" size={10} style={{ width: '100%', marginBottom: 12 }}>
                      {createForm.options.map((option, index) => (
                        <div key={`option-${index}`} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {createForm.questionType === 'MCQ' ? (
                              <Radio
                                checked={createForm.answerIndex === index}
                                onChange={() => setCreateForm(s => ({ ...s, answerIndex: index }))}
                              />
                            ) : (
                              <Checkbox
                                checked={createForm.answerIndexes.includes(index)}
                                onChange={e => {
                                  setCreateForm(prev => ({
                                    ...prev,
                                    answerIndexes: e.target.checked
                                      ? [...prev.answerIndexes, index]
                                      : prev.answerIndexes.filter(v => v !== index),
                                  }));
                                }}
                              />
                            )}
                            <Input
                              value={option}
                              placeholder={`Option ${index + 1}`}
                              onChange={e => updateOption(index, e.target.value)}
                            />
                            <Upload
                              beforeUpload={file => {
                                updateOptionAttachment(index, file.name);
                                return false;
                              }}
                              maxCount={1}
                              showUploadList={false}
                            >
                              <Button size="small" icon={<UploadOutlined />}>
                                Attach
                              </Button>
                            </Upload>
                          </div>
                          {createForm.optionAttachments[index] && (
                            <div style={{ marginLeft: 34 }}>
                              <Tag closable onClose={() => updateOptionAttachment(index, '')} style={{ margin: 0 }}>
                                {createForm.optionAttachments[index]}
                              </Tag>
                            </div>
                          )}
                        </div>
                      ))}
                    </Space>

                    <button
                      onClick={addOption}
                      style={{
                        marginBottom: 18,
                        width: '100%',
                        border: '1px dashed #cbd5e1',
                        borderRadius: 8,
                        background: 'var(--color-bg-surface)',
                        color: '#4f46e5',
                        fontWeight: 600,
                        padding: '10px 12px',
                        cursor: 'pointer',
                        fontSize: 13,
                      }}
                    >
                      + Add Another Option
                    </button>
                  </>
                )}

                {createForm.questionType === 'TRUE_FALSE' && (
                  <>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: 10 }}>
                      Select Correct Answer
                    </div>
                    <Row gutter={12} style={{ marginBottom: 18 }}>
                      {(['True', 'False'] as const).map(v => {
                        const selected = createForm.trueFalseAnswer === v;
                        return (
                          <Col span={12} key={v}>
                            <button
                              onClick={() => setCreateForm(s => ({ ...s, trueFalseAnswer: v }))}
                              style={{
                                width: '100%',
                                border: selected ? '1px solid #6366f1' : '1px solid var(--color-border)',
                                background: selected ? 'var(--color-status-info-bg)' : 'var(--color-bg-surface)',
                                borderRadius: 10,
                                padding: '16px 12px',
                                cursor: 'pointer',
                                fontWeight: selected ? 700 : 500,
                                color: 'var(--color-text-secondary)',
                              }}
                            >
                              {v}
                            </button>
                          </Col>
                        );
                      })}
                    </Row>
                  </>
                )}

                {(createForm.questionType === 'DESCRIPTIVE' || createForm.questionType === 'SHORT_QUESTION' || createForm.questionType === 'LONG_QUESTION') && (
                  <>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: 10 }}>
                      Sample Answer Guide
                    </div>
                    <Input.TextArea
                      value={createForm.descriptiveAnswer}
                      onChange={e => setCreateForm(s => ({ ...s, descriptiveAnswer: e.target.value }))}
                      autoSize={{ minRows: 4, maxRows: 6 }}
                      placeholder="Add evaluation criteria and accepted answer patterns..."
                      style={{ marginBottom: 10 }}
                    />
                    {(createForm.questionType === 'SHORT_QUESTION' || createForm.questionType === 'LONG_QUESTION') && createForm.answerInputLimit && (
                      <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', background: 'var(--color-bg-subtle)', padding: '8px 12px', borderRadius: 6, marginBottom: 18 }}>
                        Candidates will have a limit of <strong>{createForm.answerInputLimit}</strong> {createForm.questionType === 'SHORT_QUESTION' ? 'characters' : 'words'} for their answer
                      </div>
                    )}
                    {(createForm.questionType === 'SHORT_QUESTION' || createForm.questionType === 'LONG_QUESTION') && !createForm.answerInputLimit && (
                      <div style={{ marginBottom: 18 }} />
                    )}
                  </>
                )}

                {createForm.questionType === 'FILE_UPLOAD' && (
                  <>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: 10 }}>
                      Upload Guidelines
                    </div>
                    <Input.TextArea
                      value={createForm.descriptiveAnswer}
                      onChange={e => setCreateForm(s => ({ ...s, descriptiveAnswer: e.target.value }))}
                      autoSize={{ minRows: 3, maxRows: 5 }}
                      placeholder="Candidates will upload their answer. Specify accepted file types, size limits, and quality expectations..."
                      style={{ marginBottom: 18 }}
                    />
                  </>
                )}

                <Divider style={{ margin: '16px 0 18px' }} />

                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: 12 }}>
                  Difficulty Level
                </div>
                <Row gutter={10}>
                  {([
                    { level: 'Easy', sub: 'Beginner Friendly' },
                    { level: 'Medium', sub: 'Intermediate' },
                    { level: 'Hard', sub: 'Expert Level' },
                  ] as Array<{ level: DifficultyLevel; sub: string }>).map(item => {
                    const active = createForm.difficulty === item.level;
                    return (
                      <Col span={8} key={item.level}>
                        <button
                          onClick={() => setCreateForm(s => ({ ...s, difficulty: item.level }))}
                          style={{
                            width: '100%',
                            border: active ? '2px solid #eab308' : '1px solid var(--color-border)',
                            background: active ? 'var(--color-status-pending-bg)' : 'var(--color-bg-surface)',
                            borderRadius: 10,
                            padding: '12px 8px',
                            cursor: 'pointer',
                            color: 'var(--color-text-secondary)',
                          }}
                        >
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: DIFFICULTY_COLOR[item.level], margin: '0 auto 5px' }} />
                          <div style={{ fontWeight: 700, fontSize: 12 }}>{item.level}</div>
                          <div style={{ fontSize: 9, color: 'var(--color-text-tertiary)', marginTop: 2 }}>{item.sub}</div>
                        </button>
                      </Col>
                    );
                  })}
                </Row>
              </div>
            </Col>

            <Col xs={24} lg={8}>
              <div style={{ borderLeft: '1px solid var(--color-border)', padding: '20px 24px', height: '78vh', display: 'flex', flexDirection: 'column' }}>
                <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14, paddingRight: 2 }}>
                  <div style={{ border: '1px solid var(--color-border)', borderRadius: 10, padding: '14px' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: 8 }}>
                    Question Type
                  </div>
                  <Select
                    value={createForm.questionType}
                    onChange={handleQuestionTypeChange}
                    style={{ width: '100%' }}
                    options={[
                      { value: 'MCQ', label: QUESTION_TYPE_LABELS.MCQ },
                      { value: 'MULTISELECT', label: QUESTION_TYPE_LABELS.MULTISELECT },
                      { value: 'TRUE_FALSE', label: QUESTION_TYPE_LABELS.TRUE_FALSE },
                      { value: 'SHORT_QUESTION', label: QUESTION_TYPE_LABELS.SHORT_QUESTION },
                      { value: 'LONG_QUESTION', label: QUESTION_TYPE_LABELS.LONG_QUESTION },
                      { value: 'FILE_UPLOAD', label: QUESTION_TYPE_LABELS.FILE_UPLOAD },
                    ]}
                  />
                </div>

                  <div style={{ border: '1px solid var(--color-border)', borderRadius: 10, padding: '14px' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: 10 }}>
                    Categorization
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: 4 }}>Subject</div>
                      <Select
                        value={createForm.subject}
                        onChange={v => setCreateForm(s => ({ ...s, subject: v }))}
                        options={SUBJECTS.map(v => ({ value: v, label: v }))}
                        size="small"
                      />
                    </div>
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: 4 }}>Topic</div>
                      <Select
                        value={createForm.topic}
                        onChange={v => setCreateForm(s => ({ ...s, topic: v }))}
                        options={TOPICS.map(v => ({ value: v, label: v }))}
                        size="small"
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: 4 }}>Target Department</div>
                      <Select
                        value={createForm.targetDepartment}
                        onChange={v => setCreateForm(s => ({ ...s, targetDepartment: v }))}
                        options={DEPARTMENTS.map(v => ({ value: v, label: v }))}
                        size="small"
                      />
                    </div>
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: 4 }}>Target Section</div>
                      <Select
                        value={createForm.section}
                        onChange={v => setCreateForm(s => ({ ...s, section: v }))}
                        options={SECTIONS.map(v => ({ value: v, label: v }))}
                        size="small"
                      />
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: 4 }}>Target Designation</div>
                    <Select
                      value={createForm.targetDesignation}
                      onChange={v => setCreateForm(s => ({ ...s, targetDesignation: v }))}
                      options={TARGET_ROLES.map(v => ({ value: v, label: v }))}
                      size="small"
                    />
                  </div>
                </div>

                  <div style={{ border: '1px solid var(--color-border)', borderRadius: 10, padding: '14px' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: 8 }}>
                    Skills / Tags
                  </div>
                  <div style={{ border: '1px solid var(--color-border)', borderRadius: 8, padding: '10px 8px', background: 'var(--color-bg-subtle)', minHeight: 40 }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: createForm.skillsTags.length > 0 ? 6 : 0 }}>
                      {createForm.skillsTags.map(tag => (
                        <Tag
                          key={tag}
                          closable
                          onClose={() => removeTag(tag)}
                          color="blue"
                          style={{ margin: 0, borderRadius: 4, fontWeight: 500 }}
                        >
                          {tag}
                        </Tag>
                      ))}
                    </div>
                    <Input
                      bordered={false}
                      value={tagInputValue}
                      onChange={e => setTagInputValue(e.target.value)}
                      placeholder="Type tag and press Enter"
                      onPressEnter={() => {
                        const tag = tagInputValue.trim();
                        if (tag) {
                          addTag(tag);
                          setTagInputValue('');
                        }
                      }}
                      style={{ background: 'transparent', padding: 4, fontSize: 12 }}
                    />
                  </div>
                </div>

                  <div style={{ border: '1px solid var(--color-border)', borderRadius: 10, padding: '14px' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: 8 }}>
                    Answer Timer
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Select
                      value={createForm.answerTime}
                      onChange={v => setCreateForm(s => ({ ...s, answerTime: v, answerTimeCustom: '' }))}
                      options={TIMER_OPTIONS.map(v => ({ value: v, label: v }))}
                      size="small"
                      style={{ flex: 1 }}
                    />
                    {createForm.answerTime === 'Custom' && (
                      <Input
                        placeholder="e.g., 150s"
                        value={createForm.answerTimeCustom}
                        onChange={e => setCreateForm(s => ({ ...s, answerTimeCustom: e.target.value }))}
                        size="small"
                        style={{ flex: 1 }}
                      />
                    )}
                  </div>
                </div>

                  {(createForm.questionType === 'SHORT_QUESTION' || createForm.questionType === 'LONG_QUESTION') && (
                    <div style={{ border: '1px solid var(--color-border)', borderRadius: 10, padding: '14px' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: 8 }}>
                      Character Limit
                    </div>
                    <Input
                      type="number"
                      placeholder={createForm.questionType === 'SHORT_QUESTION' ? 'Max characters (e.g., 500)' : 'Max words (e.g., 200)'}
                      value={createForm.answerInputLimit || ''}
                      onChange={e => setCreateForm(s => ({ ...s, answerInputLimit: e.target.value ? parseInt(e.target.value) : null }))}
                      size="small"
                    />
                    </div>
                  )}
                </div>

                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 14, marginTop: 12, background: 'var(--color-bg-surface)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 6, fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 10 }}>
                    <span>Created By:</span><strong style={{ color: 'var(--color-text-secondary)' }}>Admin User</strong>
                    <span>Date:</span><strong style={{ color: 'var(--color-text-secondary)' }}>{formatOngoingDateTime(currentDateTime)} (Ongoing)</strong>
                    <span>Version:</span><strong style={{ color: 'var(--color-text-secondary)' }}>v1.0</strong>
                  </div>
                  <Button type="primary" block onClick={publishQuestion} style={{ height: 42, borderRadius: 8, fontWeight: 600 }}>
                    {modalMode === 'edit' ? 'Update Question' : 'Publish Question'}
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </Modal>

      <Modal
        open={configurationOpen}
        title="Question Bank Configuration"
        okText="Save Configuration"
        cancelText="Cancel"
        onOk={saveConfiguration}
        onCancel={() => setConfigurationOpen(false)}
        width={680}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, paddingTop: 8 }}>
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 12, padding: 16, background: 'var(--color-bg-subtle)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: 8 }}>
              Repeat Rule
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
              Control how many times a question can be reused. Once the maximum repeat count is reached, the question moves to archived status automatically.
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: 6 }}>
                Max Repeat Count
              </div>
              <Input
                type="number"
                min={1}
                value={configuration.maxRepeatCount}
                onChange={e => setConfiguration(prev => ({
                  ...prev,
                  maxRepeatCount: e.target.value ? parseInt(e.target.value, 10) : 1,
                }))}
                placeholder="Enter maximum repeat count"
              />
            </div>
          </div>

          <div style={{ border: '1px solid var(--color-border)', borderRadius: 12, padding: 16, background: 'var(--color-bg-subtle)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: 8 }}>
              Cooldown Rule
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
              After the cooldown period ends, the archived question will resurface and become active again automatically.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Cooldown Duration
                </div>
                <Input
                  type="number"
                  min={1}
                  value={configuration.cooldownValue}
                  onChange={e => setConfiguration(prev => ({
                    ...prev,
                    cooldownValue: e.target.value ? parseInt(e.target.value, 10) : 1,
                  }))}
                  placeholder="Enter value"
                />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Unit
                </div>
                <Select
                  value={configuration.cooldownUnit}
                  onChange={value => setConfiguration(prev => ({ ...prev, cooldownUnit: value }))}
                  options={[
                    { value: 'days', label: 'Days' },
                    { value: 'months', label: 'Months' },
                  ]}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>

          <div style={{ borderRadius: 12, padding: 16, background: 'var(--color-status-info-bg)', border: '1px solid #bfdbfe' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8', marginBottom: 6 }}>
              Current Behavior Summary
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              A question can repeat up to <strong>{configuration.maxRepeatCount}</strong> time{configuration.maxRepeatCount > 1 ? 's' : ''}. After that it will move to <strong>Archived</strong>. It will return to <strong>Active</strong> after <strong>{configuration.cooldownValue}</strong> {configuration.cooldownUnit}.
            </div>
          </div>
        </div>
      </Modal>

      {/* ── Change Status Modal ─────────────────────────────────────────────── */}
      <Modal
        open={statusModal.open}
        title="Change Question Status"
        okText="Confirm"
        cancelText="Cancel"
        onOk={() => {
          message.success(`${statusModal.question?.id} marked as ${statusModal.pending}`);
          setStatusModal({ open: false, question: null, pending: 'active' });
        }}
        onCancel={() => setStatusModal({ open: false, question: null, pending: 'active' })}
      >
        {statusModal.question && (
          <div>
            <p style={{ marginBottom: 16, color: 'var(--color-text-secondary)', fontSize: 13 }}>
              <strong>{statusModal.question.id}</strong> - {statusModal.question.text.length > 60
                ? statusModal.question.text.slice(0, 60) + '...'
                : statusModal.question.text}
            </p>
            <div style={{ marginBottom: 8, fontSize: 12, fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Set status to
            </div>
            <Radio.Group
              value={statusModal.pending}
              onChange={e => setStatusModal(s => ({ ...s, pending: e.target.value }))}
              style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
            >
              <Radio value="active" style={{ fontSize: 13 }}>Active</Radio>
              <Radio value="archived" style={{ fontSize: 13 }}>Archived</Radio>
            </Radio.Group>
          </div>
        )}
      </Modal>
    </div>
  );
}
