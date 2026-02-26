/**
 * RequisitionForm
 * Create / Action form for Manpower Requisition.
 * Matches the aesthetic of InitiateHeadcountForm.
 */

import { useEffect, useRef, useState } from 'react';
import {
  Button, Checkbox, DatePicker, Input, Modal, Popconfirm,
  Radio, Select, Space, Tooltip, Upload, message,
} from 'antd';
import type { UploadFile } from 'antd';
import {
  LeftOutlined,
  PlusOutlined,
  ApartmentOutlined,
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  EyeOutlined,
  DeleteOutlined,
  MinusOutlined,
  UploadOutlined,
  FileOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type {
  EducationRequirement,
  RequisitionFormData,
  RequisitionRequest,
} from '../types/requisition.types';
import { DEFAULT_FORM_DATA } from '../types/requisition.types';
import { OrgLevelPickerDrawer } from '../../manpower-headcount/components/OrgLevelPickerDrawer';
import type { OrgLevelSelection } from '../../manpower-headcount/components/OrgLevelPickerDrawer';

// ─── Style constants ──────────────────────────────────────────────────────────
const LABEL: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, color: '#3b82f6',
  marginBottom: 6, letterSpacing: '0.04em',
};
const SUBLABEL: React.CSSProperties = {
  fontSize: 10, fontWeight: 600, color: '#9ca3af', marginBottom: 4,
};
const SUMMARY_ROW: React.CSSProperties = {
  fontSize: 10, color: '#64748b', fontWeight: 600,
};

// ─── Qualification lookup ─────────────────────────────────────────────────────
const QUAL_MAP: Record<string, { full: string; outOf: string }> = {
  SSC:      { full: 'Secondary School Certificate',        outOf: '5.00' },
  HSC:      { full: 'Higher Secondary School Certificate', outOf: '5.00' },
  Diploma:  { full: 'Diploma Certificate',                 outOf: '4.00' },
  Bachelor: { full: "Bachelor's Degree",                   outOf: '4.00' },
  Masters:  { full: "Master's Degree",                     outOf: '4.00' },
  PhD:      { full: 'Doctor of Philosophy',                outOf: 'N/A'  },
};

const QUAL_TITLE_OPTIONS: Record<string, string[]> = {
  SSC:      ['Secondary School Certificate'],
  HSC:      ['Higher Secondary School Certificate'],
  Diploma:  [
    'Diploma in Engineering', 'Diploma in Business Administration',
    'Diploma in Computer Science', 'Diploma in Architecture',
    'Diploma in Textile Technology',
  ],
  Bachelor: [
    'Bachelor of Science (B.Sc)', 'Bachelor of Arts (B.A)',
    'Bachelor of Commerce (B.Com)', 'Bachelor of Business Administration (BBA)',
    'Bachelor of Engineering (B.Engg)', 'Bachelor of Laws (LL.B)',
    'Bachelor of Medicine & Surgery (MBBS)',
  ],
  Masters: [
    'Master of Science (M.Sc)', 'Master of Arts (M.A)',
    'Master of Commerce (M.Com)', 'Master of Business Administration (MBA)',
    'Master of Engineering (M.Engg)', 'Master of Laws (LL.M)',
    'Master of Public Health (MPH)',
  ],
  PhD: ['Doctor of Philosophy (PhD)'],
};

const QUAL_MAJOR_OPTIONS: Record<string, string[]> = {
  SSC:      ['Science', 'Humanities', 'Commerce', 'Business Studies'],
  HSC:      ['Science', 'Humanities', 'Commerce', 'Business Studies'],
  Diploma:  [
    'Civil Engineering', 'Electrical Engineering', 'Mechanical Engineering',
    'Computer Science', 'Electronics', 'Textile Technology', 'Architecture',
  ],
  Bachelor: [
    'Computer Science & Engineering', 'Electrical & Electronic Engineering',
    'Civil Engineering', 'Business Administration', 'Finance', 'Accounting',
    'Economics', 'Marketing', 'Human Resource Management', 'English', 'Bengali', 'Law',
  ],
  Masters: [
    'Computer Science & Engineering', 'Electrical & Electronic Engineering',
    'Civil Engineering', 'Business Administration', 'Finance', 'Accounting',
    'Economics', 'Marketing', 'Human Resource Management', 'English', 'Bengali',
    'Law', 'Public Health',
  ],
  PhD: [
    'Computer Science', 'Engineering', 'Business Administration',
    'Economics', 'Social Science', 'Natural Science', 'Medical Science',
  ],
};

const QUALIFICATION_OPTIONS = Object.keys(QUAL_MAP).map(v => ({ value: v, label: v }));

const SKILL_OPTIONS = [
  'Team Collaboration', 'Leadership', 'Communication', 'Problem Solving',
  'Microsoft Office', 'Project Management', 'Data Analysis', 'SQL',
  'Python', 'Java', 'JavaScript', 'TypeScript', 'React', 'Node.js',
  'Adobe Photoshop', 'Customer Service', 'Negotiation', 'Presentation',
  'Financial Analysis', 'HR Management', 'Recruitment', 'Training & Development',
  'SAP', 'ERP Systems', 'Supply Chain Management', 'Logistics',
  'Quality Assurance', 'Risk Management', 'Business Development',
  'English Proficiency', 'Bengali Proficiency', 'Email Communication',
  'Report Writing', 'Budgeting', 'Sales', 'Marketing', 'Digital Marketing',
].map(s => ({ value: s, label: s }));

const EMP_TYPE_OPTIONS  = ['Full Time', 'Contractual', 'Intern'];
const WORK_LOC_OPTIONS  = ['Head Office', 'Airport Office', 'Field Office'];
const GENDER_OPTIONS    = ['Male', 'Female', 'Any'];
const EMPLOYEE_OPTIONS  = ['Shanto Karmokar', 'Wahiduzzaman', 'Farjana Alim'];
const EMPTY_EDU_REQ: EducationRequirement = { qualification: '', title: '', major: '', cgpa: '' };

function normalizeFormData(formData?: RequisitionFormData): RequisitionFormData {
  const source = formData ?? DEFAULT_FORM_DATA;
  const normalizedReqs = source.educationRequirements?.length
    ? source.educationRequirements.map(req => ({ ...EMPTY_EDU_REQ, ...req }))
    : [{
        qualification: source.educationQualification ?? '',
        title: source.educationField ?? '',
        major: source.educationCourse ?? '',
        cgpa: source.educationNote ?? '',
      }];

  return {
    ...source,
    educationRequirements: normalizedReqs.length ? normalizedReqs : [{ ...EMPTY_EDU_REQ }],
  };
}

// ─── Rich Text Editor ─────────────────────────────────────────────────────────
function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);

  // Initialize content on mount (component is remounted via React key on reset)
  useEffect(() => {
    if (ref.current) ref.current.innerHTML = value;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const exec = (cmd: string) => {
    ref.current?.focus();
    document.execCommand(cmd, false, undefined);
  };

  const TOOLS: { icon: React.ReactNode; cmd: string; title: string }[] = [
    { icon: <BoldOutlined />,          cmd: 'bold',                title: 'Bold'          },
    { icon: <ItalicOutlined />,        cmd: 'italic',              title: 'Italic'        },
    { icon: <UnderlineOutlined />,     cmd: 'underline',           title: 'Underline'     },
    { icon: <UnorderedListOutlined />, cmd: 'insertUnorderedList', title: 'Bullet List'   },
    { icon: <OrderedListOutlined />,   cmd: 'insertOrderedList',   title: 'Numbered List' },
    { icon: <AlignLeftOutlined />,     cmd: 'justifyLeft',         title: 'Align Left'    },
    { icon: <AlignCenterOutlined />,   cmd: 'justifyCenter',       title: 'Align Center'  },
  ];

  return (
    <div
      style={{
        border: `1px solid ${focused ? '#3b82f6' : '#d9d9d9'}`,
        borderRadius: 8,
        overflow: 'hidden',
        transition: 'border-color 0.2s',
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <div style={{
        display: 'flex', gap: 2, padding: '5px 8px',
        borderBottom: '1px solid #f0f0f0', background: '#fafafa', flexWrap: 'wrap',
      }}>
        {TOOLS.map((t, i) => (
          <Tooltip key={i} title={t.title} placement="top">
            <Button
              type="text"
              size="small"
              icon={t.icon}
              onMouseDown={e => { e.preventDefault(); exec(t.cmd); }}
              style={{
                width: 26, height: 26, padding: 0, color: '#6b7280',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            />
          </Tooltip>
        ))}
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(ref.current?.innerHTML ?? '')}
        data-placeholder={placeholder}
        style={{
          minHeight: 96, padding: '8px 12px',
          outline: 'none', fontSize: 13, color: '#374151', lineHeight: 1.7,
        }}
      />
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  mode: 'create' | 'action';
  request?: RequisitionRequest;
  onBack: () => void;
  onSaveDraft: (data: RequisitionFormData) => void;
  onSubmitRequest: (data: RequisitionFormData) => void;
  onApprove: (data: RequisitionFormData) => void;
  onReject: (data: RequisitionFormData) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function RequisitionForm({
  mode,
  request,
  onBack,
  onSaveDraft,
  onSubmitRequest,
  onApprove,
  onReject,
}: Props) {
  const isAction = mode === 'action';

  const [data,        setData]       = useState<RequisitionFormData>(normalizeFormData(request?.formData));
  const [formKey,     setFormKey]    = useState(0);   // bumped on reset → remounts rich-text editors
  const [pickerOpen,  setPickerOpen] = useState(false);
  const [fileList,    setFileList]   = useState<UploadFile[]>([]);
  const [viewingFile, setViewingFile] = useState<UploadFile | null>(null);

  const requiredVacancy = (() => {
    const v = Number(data.vacancyNumber);
    return Number.isFinite(v) ? v || 0 : 0;
  })();

  const update = <K extends keyof RequisitionFormData>(key: K, val: RequisitionFormData[K]) =>
    setData(prev => ({ ...prev, [key]: val }));

  const setEducationRequirements = (nextRows: EducationRequirement[]) => {
    const normalized = nextRows.length ? nextRows : [{ ...EMPTY_EDU_REQ }];
    const first = normalized[0] ?? EMPTY_EDU_REQ;
    setData(prev => ({
      ...prev,
      educationRequirements: normalized,
      educationQualification: first.qualification,
      educationField: first.title,
      educationCourse: first.major,
      educationNote: first.cgpa,
    }));
  };

  const addEducationRequirement = () =>
    setEducationRequirements([...data.educationRequirements, { ...EMPTY_EDU_REQ }]);

  const removeEducationRequirement = (idx: number) =>
    setEducationRequirements(data.educationRequirements.filter((_, i) => i !== idx));

  const updateEducationRequirement = (idx: number, patch: Partial<EducationRequirement>) =>
    setEducationRequirements(data.educationRequirements.map((row, i) =>
      i === idx ? { ...row, ...patch } : row,
    ));

  const resetForm = () => {
    setData(normalizeFormData(request?.formData));
    setFileList([]);
    setFormKey(k => k + 1);
  };

  const validateCore = (): string => {
    if (!data.refNo.trim())         return 'Ref No is required.';
    if (!data.vacancyNumber.trim()) return 'Vacancy Number is required.';
    if (!data.employmentType)       return 'Employment Type is required.';
    if (!data.workLocation)         return 'Work Location is required.';
    if (!data.etaDate)              return 'ETA Date is required.';
    return '';
  };

  const handleSubmitRequest = () => {
    const err = validateCore();
    if (err) { message.error(err); return; }
    onSubmitRequest(data);
  };

  // ── Org Level ──────────────────────────────────────────────────────────────
  const handleOrgSelect = (sel: OrgLevelSelection) => {
    update('selectedLevel', sel.orgLevelPath);
    setPickerOpen(false);
  };

  // ── Type of Requisition (checkbox) ─────────────────────────────────────────
  const toggleReqType = (val: string, checked: boolean) => {
    update(
      'typeOfRequisition',
      checked
        ? [...data.typeOfRequisition, val]
        : data.typeOfRequisition.filter(t => t !== val),
    );
  };

  // ── Qualification type change ───────────────────────────────────────────────
  const handleQualTypeChange = (idx: number, value: string) => {
    updateEducationRequirement(idx, {
      qualification: value ?? '',
      title: '',
      major: '',
    });
  };

  // ── Attachments ────────────────────────────────────────────────────────────
  const handleBeforeUpload = (file: File) => {
    const uid = `${file.name}-${Date.now()}`;
    setFileList(prev => [...prev, {
      uid,
      name:          file.name,
      status:        'done',
      size:          file.size,
      type:          file.type,
      originFileObj: file,
    } as UploadFile]);
    message.success(`${file.name} attached.`);
    return false;
  };

  const handleRemoveFile = (uid: string) =>
    setFileList(prev => prev.filter(f => f.uid !== uid));

  const handleViewFile = (file: UploadFile) => {
    setViewingFile(file);
  };

  // ── Education preview ──────────────────────────────────────────────────────
  const eduPreviewParts = data.educationRequirements
    .map(row => {
      const qualInfo = row.qualification ? QUAL_MAP[row.qualification] : null;
      const parts = [
        row.qualification,
        row.title || qualInfo?.full,
        row.major,
        row.cgpa ? `GPA ${row.cgpa}` : '',
        qualInfo ? `Out of ${qualInfo.outOf}` : '',
      ].filter(Boolean);
      return parts.join(' › ');
    })
    .filter(Boolean);

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '24px 28px', height: '100%', overflowY: 'auto', background: '#f9fafb' }}>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>
            {isAction ? `Review Requisition — ${request?.id}` : 'Manpower Requisition Form'}
          </h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>
            {isAction
              ? 'Review and action the manpower requisition request.'
              : 'Fill in details to create a new manpower requisition.'}
          </p>
        </div>
        <Button
          type="link"
          icon={<LeftOutlined style={{ fontSize: 12 }} />}
          onClick={onBack}
          style={{ color: '#3b82f6', fontWeight: 600, padding: 0, fontSize: 13 }}
        >
          Back to List
        </Button>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '20px 24px' }}>

        {/* ── 1. Date / Org Level / Ref No ──────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr 1fr', gap: 12, marginBottom: 14 }}>
          <div>
            <div style={LABEL}>DATE & TIME*</div>
            <DatePicker
              showTime
              value={data.dateTime ? dayjs(data.dateTime, 'DD MMM YYYY, hh:mm A') : null}
              onChange={v => update('dateTime', v ? v.format('DD MMM YYYY, hh:mm A') : '')}
              style={{ width: '100%', height: 36 }}
              format="MM/DD/YYYY hh:mm A"
            />
          </div>

          <div>
            <div style={LABEL}>SELECT ORGANIZATION LEVEL*</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Button
                icon={<ApartmentOutlined />}
                onClick={() => setPickerOpen(true)}
                style={{
                  height: 36, borderRadius: 7, fontWeight: 600,
                  color: '#1d4ed8', borderColor: '#bfdbfe', background: '#eff6ff',
                  fontSize: 12, flexShrink: 0,
                }}
              >
                SELECT LEVEL
              </Button>
              <div style={{
                flex: 1, border: '1px solid #e5e7eb', borderRadius: 7,
                padding: '0 12px', fontSize: 13, height: 36,
                display: 'flex', alignItems: 'center',
                color: data.selectedLevel ? '#111827' : '#9ca3af',
                background: '#fafafa', fontWeight: data.selectedLevel ? 500 : 400,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {data.selectedLevel || 'No level selected — click SELECT LEVEL'}
              </div>
            </div>
          </div>

          <div>
            <div style={LABEL}>REF NO*</div>
            <Input
              value={data.refNo}
              onChange={e => update('refNo', e.target.value)}
              placeholder="Enter Ref No."
              style={{ height: 36, borderRadius: 7 }}
            />
          </div>
        </div>

        {/* ── 2. Requisition Type (Checkboxes — both selectable) ─────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, marginBottom: 14 }}>

          <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <Checkbox
                checked={data.typeOfRequisition.includes('New Recruitment')}
                onChange={e => toggleReqType('New Recruitment', e.target.checked)}
                style={{ fontWeight: 700 }}
              >
                New Recruitment
              </Checkbox>
              <div>
                <div style={SUBLABEL}>VACANCY NUMBER*</div>
                <Input
                  value={data.vacancyNumber}
                  onChange={e => update('vacancyNumber', e.target.value)}
                  placeholder="Input Vacancy..."
                  style={{ height: 36, borderRadius: 7 }}
                />
              </div>
            </Space>
          </div>

          <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Checkbox
                  checked={data.typeOfRequisition.includes('Replacement')}
                  onChange={e => toggleReqType('Replacement', e.target.checked)}
                  style={{ fontWeight: 700 }}
                >
                  Replacement
                </Checkbox>
                <span style={{ fontSize: 11, color: '#6b7280' }}>Vacancy: {requiredVacancy}</span>
              </div>
              <div>
                <div style={SUBLABEL}>SELECT EMPLOYEE*</div>
                <Select
                  mode="multiple"
                  value={data.employee}
                  onChange={v => update('employee', v)}
                  placeholder="Select Employee"
                  options={EMPLOYEE_OPTIONS.map(v => ({ value: v, label: v }))}
                  style={{ width: '100%' }}
                />
              </div>
            </Space>
          </div>

          {/* Summary panel */}
          <div style={{
            minWidth: 184, display: 'flex', flexDirection: 'column',
            justifyContent: 'center', gap: 5,
            background: '#f8fafc', border: '1px solid #e5e7eb',
            borderRadius: 8, padding: '12px 14px',
          }}>
            <div style={SUMMARY_ROW}>Total in Dept: <strong style={{ color: '#111827' }}>34</strong></div>
            <div style={SUMMARY_ROW}>In This Position: <strong style={{ color: '#111827' }}>5</strong></div>
            <div style={{ ...SUMMARY_ROW, color: '#059669' }}>Remaining HC: <strong>7</strong></div>
            <div style={{ ...SUMMARY_ROW, color: '#059669' }}>Separation: <strong>8</strong></div>
            <div style={{ fontSize: 14, color: '#2563eb', fontWeight: 800, marginTop: 3 }}>
              Required: {requiredVacancy}
            </div>
          </div>
        </div>

        {/* ── 3. Employment Details ──────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 160px' }}>
            <div style={LABEL}>EMPLOYMENT TYPE*</div>
            <Select
              value={data.employmentType || undefined}
              onChange={v => update('employmentType', v ?? '')}
              options={EMP_TYPE_OPTIONS.map(v => ({ value: v, label: v }))}
              style={{ width: '100%' }}
            />
          </div>

          {/* INPUT IN DAYS — only visible for Contractual */}
          {data.employmentType === 'Contractual' && (
            <div style={{ flex: '1 1 140px' }}>
              <div style={LABEL}>INPUT IN DAYS*</div>
              <Input
                value={data.inputInDays}
                onChange={e => update('inputInDays', e.target.value)}
                placeholder="No. of days"
                type="number"
                min={1}
                style={{ height: 36, borderRadius: 7 }}
              />
            </div>
          )}

          <div style={{ flex: '1 1 160px' }}>
            <div style={LABEL}>WORK LOCATION*</div>
            <Select
              value={data.workLocation || undefined}
              onChange={v => update('workLocation', v ?? '')}
              options={WORK_LOC_OPTIONS.map(v => ({ value: v, label: v }))}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ flex: '1 1 140px' }}>
            <div style={LABEL}>GENDER*</div>
            <Select
              value={data.gender || undefined}
              onChange={v => update('gender', v ?? '')}
              options={GENDER_OPTIONS.map(v => ({ value: v, label: v }))}
              placeholder="Select"
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ flex: '1 1 160px' }}>
            <div style={LABEL}>ETA DATE*</div>
            <DatePicker
              value={data.etaDate ? dayjs(data.etaDate, 'DD MMM YYYY') : null}
              onChange={v => update('etaDate', v ? v.format('DD MMM YYYY') : '')}
              format="MM/DD/YYYY"
              style={{ width: '100%', height: 36 }}
            />
          </div>
        </div>

        {/* ── 4. Experience & Age ────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>

          {/* Experience */}
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
            <div style={LABEL}>EXPERIENCE*</div>
            <Radio.Group
              value={data.experienceMode}
              onChange={e => update('experienceMode', e.target.value)}
              style={{ marginBottom: 10 }}
            >
              <Space>
                <Radio value="Fresher">Fresher</Radio>
                <Radio value="Experienced">Experienced</Radio>
              </Space>
            </Radio.Group>

            {/* Show extra fields only for Experienced */}
            {data.experienceMode === 'Experienced' && (
              <Space direction="vertical" size={8} style={{ width: '100%' }}>
                <Input
                  value={data.yearsOfExperience}
                  onChange={e => update('yearsOfExperience', e.target.value)}
                  placeholder="Required years of experience"
                  style={{ borderRadius: 7 }}
                />
                <Input.TextArea
                  value={data.preferableDesired}
                  onChange={e => update('preferableDesired', e.target.value)}
                  rows={2}
                  placeholder="Preferable / Desired experience"
                  style={{ borderRadius: 7, fontSize: 13 }}
                />
              </Space>
            )}
          </div>

          {/* Age */}
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
            <div style={LABEL}>AGE</div>
            <Space direction="vertical" size={10} style={{ width: '100%' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8, alignItems: 'center' }}>
                <Radio checked={data.ageMode === 'Minimum'} onChange={() => update('ageMode', 'Minimum')}>
                  MINIMUM
                </Radio>
                <Input
                  value={data.ageMinimum}
                  onChange={e => update('ageMinimum', e.target.value)}
                  placeholder="Min age"
                  disabled={data.ageMode !== 'Minimum'}
                  style={{ borderRadius: 7 }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8, alignItems: 'center' }}>
                <Radio checked={data.ageMode === 'Maximum'} onChange={() => update('ageMode', 'Maximum')}>
                  MAXIMUM
                </Radio>
                <Input
                  value={data.ageMaximum}
                  onChange={e => update('ageMaximum', e.target.value)}
                  placeholder="Max age"
                  disabled={data.ageMode !== 'Maximum'}
                  style={{ borderRadius: 7 }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8, alignItems: 'center' }}>
                <Radio checked={data.ageMode === 'Range'} onChange={() => update('ageMode', 'Range')}>
                  RANGE
                </Radio>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <Input
                    value={data.ageFrom}
                    onChange={e => update('ageFrom', e.target.value)}
                    placeholder="From"
                    disabled={data.ageMode !== 'Range'}
                    style={{ borderRadius: 7 }}
                  />
                  <Input
                    value={data.ageTo}
                    onChange={e => update('ageTo', e.target.value)}
                    placeholder="To"
                    disabled={data.ageMode !== 'Range'}
                    style={{ borderRadius: 7 }}
                  />
                </div>
              </div>
            </Space>
          </div>
        </div>

        {/* ── 5. Educational Requirements ────────────────────────────────── */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, marginBottom: 14 }}>
          <div style={LABEL}>EDUCATIONAL REQUIREMENTS*</div>

          {data.educationRequirements.map((row, idx) => {
            const rowQualInfo = row.qualification ? QUAL_MAP[row.qualification] : null;
            const titleOptions = row.qualification
              ? (QUAL_TITLE_OPTIONS[row.qualification] ?? []).map(v => ({ value: v, label: v }))
              : [];
            const majorOptions = row.qualification
              ? (QUAL_MAJOR_OPTIONS[row.qualification] ?? []).map(v => ({ value: v, label: v }))
              : [];

            return (
              <div
                key={`edu-row-${idx}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1.2fr 1fr 1fr auto',
                  gap: 8,
                  alignItems: 'end',
                  marginBottom: idx === data.educationRequirements.length - 1 ? 10 : 8,
                }}
              >
                <div>
                  <div style={SUBLABEL}>Qualification Type</div>
                  <Select
                    value={row.qualification || undefined}
                    onChange={v => handleQualTypeChange(idx, v)}
                    placeholder="Qualification Type"
                    options={QUALIFICATION_OPTIONS}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <div style={SUBLABEL}>Qualification Title</div>
                  <Select
                    value={row.title || undefined}
                    onChange={v => updateEducationRequirement(idx, { title: v ?? '' })}
                    placeholder="Qualification Title"
                    options={titleOptions}
                    disabled={!row.qualification}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <div style={SUBLABEL}>Major / Group</div>
                  <Select
                    value={row.major || undefined}
                    onChange={v => updateEducationRequirement(idx, { major: v ?? '' })}
                    placeholder="Major / Group"
                    options={majorOptions}
                    disabled={!row.qualification}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <div style={SUBLABEL}>
                    Input CGPA / GPA
                    {rowQualInfo && (
                      <span style={{ color: '#6b7280', fontWeight: 500, marginLeft: 6 }}>
                        out of {rowQualInfo.outOf}
                      </span>
                    )}
                  </div>
                  <Input
                    value={row.cgpa}
                    onChange={e => updateEducationRequirement(idx, { cgpa: e.target.value })}
                    placeholder="Input CGPA / GPA"
                    style={{ borderRadius: 7 }}
                  />
                </div>

                <Space size={6}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={addEducationRequirement}
                    style={{ borderRadius: 6, height: 32, width: 32 }}
                  />
                  {data.educationRequirements.length > 1 && (
                    <Button
                      icon={<MinusOutlined />}
                      onClick={() => removeEducationRequirement(idx)}
                      style={{ borderRadius: 6, height: 32, width: 32 }}
                    />
                  )}
                </Space>
              </div>
            );
          })}

          {/* Readable education preview */}
          {eduPreviewParts.length > 0 && (
            <div style={{
              background: '#f0f9ff', border: '1px solid #bae6fd',
              borderRadius: 6, padding: '6px 12px',
              fontSize: 12, color: '#0369a1', fontWeight: 500,
            }}>
              {eduPreviewParts.map((line, idx) => (
                <div key={`edu-preview-${idx}`}>{line}</div>
              ))}
            </div>
          )}
        </div>

        {/* ── 6. Skills Required ─────────────────────────────────────────── */}
        <div style={{ marginBottom: 14 }}>
          <div style={LABEL}>SKILLS REQUIRED*</div>
          <Select
            mode="multiple"
            showSearch
            allowClear
            value={data.skillsRequired}
            onChange={v => update('skillsRequired', v)}
            placeholder="Search and select required skills..."
            options={SKILL_OPTIONS}
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            style={{ width: '100%' }}
            maxTagCount="responsive"
          />
        </div>

        {/* ── 7. Rich Text Editors ───────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div>
            <div style={LABEL}>JOB RESPONSIBILITY*</div>
            <RichTextEditor
              key={`jr-${formKey}`}
              value={data.jobResponsibility}
              onChange={v => update('jobResponsibility', v)}
              placeholder="Enter job responsibilities..."
            />
          </div>
          <div>
            <div style={LABEL}>TRAINING & SPECIALIZATION</div>
            <RichTextEditor
              key={`ts-${formKey}`}
              value={data.trainingSpecialization}
              onChange={v => update('trainingSpecialization', v)}
              placeholder="Enter training & specialization details..."
            />
          </div>
          <div>
            <div style={LABEL}>OTHER REQUIREMENTS</div>
            <RichTextEditor
              key={`or-${formKey}`}
              value={data.otherRequirements}
              onChange={v => update('otherRequirements', v)}
              placeholder="Any other requirements..."
            />
          </div>
        </div>

        {/* ── 8. Justification ──────────────────────────────────────────── */}
        <div style={{ marginBottom: 14 }}>
          <div style={LABEL}>JUSTIFICATION</div>
          <Input.TextArea
            rows={3}
            value={data.justification}
            onChange={e => update('justification', e.target.value)}
            placeholder="Provide justification for this requisition..."
            style={{ borderRadius: 7, fontSize: 13 }}
          />
        </div>

        {/* ── 9. Attachments ────────────────────────────────────────────── */}
        <div style={{ marginBottom: 18 }}>
          <div style={LABEL}>ATTACHMENTS (OPTIONAL)</div>
          <Upload multiple beforeUpload={handleBeforeUpload} showUploadList={false}>
            <Button
              icon={<UploadOutlined />}
              style={{
                borderRadius: 7, background: '#eff6ff',
                borderColor: '#bfdbfe', color: '#2563eb', fontWeight: 600, height: 34,
              }}
            >
              Click to Attach Files
            </Button>
          </Upload>

          {fileList.length > 0 && (
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {fileList.map(file => (
                <div
                  key={file.uid}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: '#f8fafc', border: '1px solid #e2e8f0',
                    borderRadius: 7, padding: '6px 12px', fontSize: 13, color: '#374151',
                  }}
                >
                  <UploadOutlined style={{ color: '#3b82f6', fontSize: 14, flexShrink: 0 }} />
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {file.name}
                  </span>
                  <span style={{ fontSize: 11, color: '#9ca3af', flexShrink: 0 }}>
                    {file.size ? `${(file.size / 1024).toFixed(1)} KB` : ''}
                  </span>
                  <Tooltip title="View file">
                    <Button
                      type="text" size="small" icon={<EyeOutlined />}
                      onClick={() => handleViewFile(file)}
                      style={{ color: '#3b82f6', padding: '0 4px', height: 24, flexShrink: 0 }}
                    />
                  </Tooltip>
                  <Popconfirm
                    title="Remove attachment"
                    description="Are you sure you want to remove this file?"
                    onConfirm={() => handleRemoveFile(file.uid)}
                    okText="Remove"
                    cancelText="Cancel"
                    okButtonProps={{ danger: true }}
                  >
                    <Tooltip title="Remove">
                      <Button
                        type="text" size="small" icon={<DeleteOutlined />}
                        style={{ color: '#ef4444', padding: '0 4px', height: 24, flexShrink: 0 }}
                      />
                    </Tooltip>
                  </Popconfirm>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── 10. Action Buttons ────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Space wrap size={8}>
            {/* Approve / Reject only in action mode */}
            {isAction && (
              <>
                <Button
                  onClick={() => onReject(data)}
                  style={{
                    background: '#ef4444', borderColor: '#ef4444',
                    color: '#fff', borderRadius: 7, fontWeight: 700, height: 34, minWidth: 90,
                  }}
                >
                  Reject
                </Button>
                <Button
                  onClick={() => onApprove(data)}
                  style={{
                    background: '#22c55e', borderColor: '#22c55e',
                    color: '#fff', borderRadius: 7, fontWeight: 700, height: 34, minWidth: 90,
                  }}
                >
                  Approve
                </Button>
              </>
            )}
            <Button onClick={resetForm} style={{ borderRadius: 7, fontWeight: 600, height: 34, minWidth: 80 }}>
              Reset
            </Button>
            <Button
              onClick={() => onSaveDraft(data)}
              style={{
                background: '#f59e0b', borderColor: '#f59e0b',
                color: '#fff', borderRadius: 7, fontWeight: 700, height: 34, minWidth: 110,
              }}
            >
              Save Draft
            </Button>
            <Button
              type="primary"
              onClick={handleSubmitRequest}
              style={{ borderRadius: 7, fontWeight: 700, height: 34, minWidth: 130 }}
            >
              Submit Request
            </Button>
          </Space>
        </div>
      </div>

      {/* ── Org Level Picker (same as Headcount) ───────────────────────────── */}
      <OrgLevelPickerDrawer
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleOrgSelect}
      />

      {/* ── File Viewer Modal ───────────────────────────────────────────────── */}
      <Modal
        open={!!viewingFile}
        onCancel={() => setViewingFile(null)}
        footer={null}
        centered
        width={760}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileOutlined style={{ color: '#3b82f6' }} />
            <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>
              {viewingFile?.name}
            </span>
          </div>
        }
        closeIcon={<CloseOutlined />}
      >
        {viewingFile && (() => {
          const origin = viewingFile.originFileObj as File | undefined;
          const url = origin ? URL.createObjectURL(origin) : undefined;
          const isImage = viewingFile.type?.startsWith('image/');
          const isPdf   = viewingFile.type === 'application/pdf';

          if (!url) {
            return (
              <div style={{ textAlign: 'center', color: '#9ca3af', padding: '40px 0' }}>
                Preview not available.
              </div>
            );
          }
          if (isImage) {
            return (
              <img
                src={url}
                alt={viewingFile.name}
                style={{ width: '100%', borderRadius: 8, display: 'block' }}
              />
            );
          }
          if (isPdf) {
            return (
              <iframe
                src={url}
                title={viewingFile.name}
                style={{ width: '100%', height: 500, border: 'none', borderRadius: 8 }}
              />
            );
          }
          return (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <FileOutlined style={{ fontSize: 48, color: '#3b82f6', marginBottom: 12 }} />
              <div style={{ fontSize: 14, color: '#374151', marginBottom: 16 }}>{viewingFile.name}</div>
              <Button type="primary" href={url} target="_blank" rel="noopener noreferrer">
                Open File
              </Button>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
