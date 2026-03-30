/**
 * EvaluationPage.tsx
 * Performance Management -> Evaluation
 * Employee-wise KPI marking workflow with Pending/Marked tabs.
 */

import { useMemo, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  Divider,
  Input,
  InputNumber,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  EditOutlined,
  SearchOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import {
  INITIAL_EMPLOYEES,
  INITIAL_MAIN_KPI_AREAS,
  INITIAL_SUB_KPIS,
  type Employee,
} from '../types/performance.types';

const { Title, Text } = Typography;
const { Option } = Select;

const FORM_MAIN_KPI_LIMIT = 2;
const FORM_SUB_KPI_LIMIT = 3;

type TabKey = 'pending' | 'marked';
type ViewMode = 'list' | 'mark' | 'view';

interface EmployeeSubKPIRow {
  subKPIId: string;
  mainKPIAreaId: string;
  mainKPIAreaName: string;
  mainKPICode: string;
  subKPICode: string;
  subKPIName: string;
  measurementCriteria: string;
  weight: number;
  operator: string;
  targetValue: number;
  responsibleTo: string[];
  markOutOf: number;
}

interface EvaluationInputRow {
  subKPIId: string;
  markValue: number;
  remarks: string;
}

interface EmployeeMarkedRecord {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  designation: string;
  department: string;
  section: string;
  submittedAt: string;
  totalMark: number;
  totalOutOf: number;
  achievementPct: number;
  items: Array<EmployeeSubKPIRow & EvaluationInputRow>;
}

interface EmployeeListRow {
  id: string;
  name: string;
  employeeId: string;
  designation: string;
  department: string;
  section: string;
  avatarColor: string;
  subKPI: number;
  mainKPI: number;
  deadlineDate: string;
  deadlineDaysLeft: number;
  isMarked: boolean;
  scoreLabel: string;
}

const CARD_BG = 'linear-gradient(120deg, #ffffff 0%, #f3f9f8 100%)';
const HEADER_BG = 'linear-gradient(120deg, #0f766e 0%, #0b5f58 60%, #0f766e 100%)';

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function daysLeftFromToday(dateIso: string): number {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const target = new Date(`${dateIso}T00:00:00`).getTime();
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}

function matchedSubKPIs(employee: Employee): EmployeeSubKPIRow[] {
  const rows: EmployeeSubKPIRow[] = [];

  for (const sub of INITIAL_SUB_KPIS.filter(s => s.isActive)) {
    const cfg = sub.designationConfigs.find(dc => {
      const designationMatch = dc.designation === employee.designation;
      const deptMatch = !dc.department || dc.department === employee.department;
      const sectionMatch = !dc.section || dc.section === employee.section;
      return designationMatch && deptMatch && sectionMatch;
    });

    if (!cfg) continue;

    rows.push({
      subKPIId: sub.id,
      mainKPIAreaId: sub.mainKPIAreaId,
      mainKPIAreaName: sub.mainKPIAreaName,
      mainKPICode: sub.mainKPICode,
      subKPICode: sub.code,
      subKPIName: sub.name,
      measurementCriteria: sub.measurementCriteria,
      weight: cfg.weight,
      operator: cfg.operator,
      targetValue: cfg.targetValue,
      responsibleTo: cfg.responsibleTo,
      markOutOf: sub.markOutOf ?? 100,
    });
  }

  const areaOrder = new Map(INITIAL_MAIN_KPI_AREAS.map((a, idx) => [a.id, idx]));
  return rows.sort((a, b) => {
    const orderA = areaOrder.get(a.mainKPIAreaId) ?? 999;
    const orderB = areaOrder.get(b.mainKPIAreaId) ?? 999;
    if (orderA !== orderB) return orderA - orderB;
    return a.subKPICode.localeCompare(b.subKPICode);
  });
}

export default function EvaluationPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('pending');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const [searchQ, setSearchQ] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [filterSection, setFilterSection] = useState('all');
  const [filterDesignation, setFilterDesignation] = useState('all');

  const [markedMap, setMarkedMap] = useState<Record<string, EmployeeMarkedRecord>>({});
  const [lineInputs, setLineInputs] = useState<Record<string, EvaluationInputRow>>({});

  const employeesWithKPI = useMemo(() => {
    return INITIAL_EMPLOYEES
      .map(emp => ({ emp, rows: matchedSubKPIs(emp) }))
      .filter(entry => entry.rows.length > 0);
  }, []);

  const departmentOptions = useMemo(
    () => [...new Set(employeesWithKPI.map(e => e.emp.department))],
    [employeesWithKPI],
  );
  const sectionOptions = useMemo(
    () => [...new Set(employeesWithKPI.map(e => e.emp.section))],
    [employeesWithKPI],
  );
  const designationOptions = useMemo(
    () => [...new Set(employeesWithKPI.map(e => e.emp.designation))],
    [employeesWithKPI],
  );

  const filteredEmployees = useMemo(() => {
    return employeesWithKPI.filter(({ emp }) => {
      const q = searchQ.trim().toLowerCase();
      if (q && !emp.name.toLowerCase().includes(q) && !emp.employeeId.toLowerCase().includes(q)) return false;
      if (filterDept !== 'all' && emp.department !== filterDept) return false;
      if (filterSection !== 'all' && emp.section !== filterSection) return false;
      if (filterDesignation !== 'all' && emp.designation !== filterDesignation) return false;
      return true;
    });
  }, [employeesWithKPI, searchQ, filterDept, filterSection, filterDesignation]);

  const pendingEmployees = useMemo(
    () => filteredEmployees.filter(({ emp }) => !markedMap[emp.id]),
    [filteredEmployees, markedMap],
  );

  const markedEmployees = useMemo(
    () => filteredEmployees.filter(({ emp }) => !!markedMap[emp.id]),
    [filteredEmployees, markedMap],
  );

  const deadlineByEmployee = useMemo(() => {
    const now = new Date();
    const map: Record<string, string> = {};
    employeesWithKPI.forEach(({ emp }, idx) => {
      const due = new Date(now);
      due.setDate(now.getDate() + 4 + (idx % 14));
      map[emp.id] = toISODate(due);
    });
    return map;
  }, [employeesWithKPI]);

  const listRows = useMemo<EmployeeListRow[]>(() => {
    const source = activeTab === 'pending' ? pendingEmployees : markedEmployees;
    return source.map(({ emp, rows }) => {
      const deadlineDate = deadlineByEmployee[emp.id];
      const marked = markedMap[emp.id];
      return {
        id: emp.id,
        name: emp.name,
        employeeId: emp.employeeId,
        designation: emp.designation,
        department: emp.department,
        section: emp.section,
        avatarColor: emp.avatarColor,
        subKPI: rows.length,
        mainKPI: new Set(rows.map(r => r.mainKPIAreaId)).size,
        deadlineDate,
        deadlineDaysLeft: daysLeftFromToday(deadlineDate),
        isMarked: !!marked,
        scoreLabel: marked ? `${marked.totalMark}/${marked.totalOutOf} (${marked.achievementPct}%)` : '-',
      };
    });
  }, [activeTab, pendingEmployees, markedEmployees, deadlineByEmployee, markedMap]);

  const listColumns: ColumnsType<EmployeeListRow> = [
    {
      title: 'EMPLOYEE',
      dataIndex: 'name',
      width: 260,
      render: (_: string, row) => (
        <Space>
          <Avatar style={{ background: row.avatarColor, fontWeight: 700 }}>{initials(row.name)}</Avatar>
          <div>
            <Text strong>{row.name}</Text>
            <div><Text type="secondary" style={{ fontSize: 12 }}>{row.employeeId}</Text></div>
          </div>
        </Space>
      ),
    },
    {
      title: 'DESIGNATION / ORG',
      dataIndex: 'designation',
      width: 260,
      render: (_: string, row) => (
        <div>
          <Text>{row.designation}</Text>
          <div><Text type="secondary" style={{ fontSize: 12 }}>{row.department} · {row.section}</Text></div>
        </div>
      ),
    },
    {
      title: 'KPI LOAD',
      width: 170,
      render: (_: unknown, row) => (
        <Space size={6}>
          <Tag color="blue">Sub: {row.subKPI}</Tag>
          <Tag color="processing">Main: {row.mainKPI}</Tag>
        </Space>
      ),
    },
    {
      title: 'DEADLINE',
      dataIndex: 'deadlineDaysLeft',
      width: 190,
      render: (_: number, row) => {
        const days = row.deadlineDaysLeft;
        const color = days <= 2 ? 'error' : days <= 5 ? 'warning' : 'success';
        const label = days < 0 ? `${Math.abs(days)} day(s) overdue` : `${days} day(s) left`;
        return (
          <Space direction="vertical" size={2}>
            <Tag color={color}>{label}</Tag>
            <Text type="secondary" style={{ fontSize: 11 }}>Due: {row.deadlineDate}</Text>
          </Space>
        );
      },
    },
    {
      title: 'RESULT',
      dataIndex: 'scoreLabel',
      width: 180,
      render: (scoreLabel: string, row) => (
        row.isMarked ? <Tag color="geekblue">{scoreLabel}</Tag> : <Text type="secondary">-</Text>
      ),
    },
    {
      title: 'ACTION',
      width: 140,
      render: (_: unknown, row) => (
        <Button
          type="primary"
          icon={row.isMarked ? <EditOutlined /> : <CheckCircleOutlined />}
          onClick={() => startMarking(row.id)}
        >
          {row.isMarked ? 'View Marked' : 'Mark'}
        </Button>
      ),
    },
  ];

  const selectedBundle = useMemo(
    () => employeesWithKPI.find(e => e.emp.id === selectedEmployeeId) ?? null,
    [employeesWithKPI, selectedEmployeeId],
  );

  const groupedSelectedRows = useMemo(() => {
    if (!selectedBundle) return [] as Array<{ areaId: string; areaName: string; areaCode: string; rows: EmployeeSubKPIRow[] }>;

    const map = new Map<string, { areaId: string; areaName: string; areaCode: string; rows: EmployeeSubKPIRow[] }>();
    for (const row of selectedBundle.rows) {
      if (!map.has(row.mainKPIAreaId)) {
        map.set(row.mainKPIAreaId, {
          areaId: row.mainKPIAreaId,
          areaName: row.mainKPIAreaName,
          areaCode: row.mainKPICode,
          rows: [],
        });
      }
      map.get(row.mainKPIAreaId)?.rows.push(row);
    }

    return [...map.values()];
  }, [selectedBundle]);

  const formGroupedRows = useMemo(
    () => groupedSelectedRows.slice(0, FORM_MAIN_KPI_LIMIT).map(group => ({
      ...group,
      rows: group.rows.slice(0, FORM_SUB_KPI_LIMIT),
    })),
    [groupedSelectedRows],
  );

  const formRowsFlat = useMemo(
    () => formGroupedRows.flatMap(group => group.rows),
    [formGroupedRows],
  );

  const stats = useMemo(() => {
    const total = employeesWithKPI.length;
    const marked = employeesWithKPI.filter(({ emp }) => !!markedMap[emp.id]).length;
    const pending = total - marked;
    const avg = marked
      ? Math.round(
          Object.values(markedMap).reduce((sum, rec) => sum + rec.achievementPct, 0) / marked,
        )
      : 0;
    return { total, marked, pending, avg };
  }, [employeesWithKPI, markedMap]);

  const startMarking = (employeeId: string) => {
    const bundle = employeesWithKPI.find(e => e.emp.id === employeeId);
    if (!bundle) return;

    const initialInput: Record<string, EvaluationInputRow> = {};
    const visibleRows = matchedSubKPIs(bundle.emp)
      .reduce((acc, row) => {
        const byArea = acc.get(row.mainKPIAreaId) ?? [];
        if (!acc.has(row.mainKPIAreaId)) acc.set(row.mainKPIAreaId, byArea);
        byArea.push(row);
        return acc;
      }, new Map<string, EmployeeSubKPIRow[]>());
    const limitedRows = [...visibleRows.values()]
      .slice(0, FORM_MAIN_KPI_LIMIT)
      .flatMap(rows => rows.slice(0, FORM_SUB_KPI_LIMIT));

    for (const row of limitedRows) {
      const saved = markedMap[employeeId]?.items.find(i => i.subKPIId === row.subKPIId);
      initialInput[row.subKPIId] = {
        subKPIId: row.subKPIId,
        markValue: saved?.markValue ?? 0,
        remarks: saved?.remarks ?? '',
      };
    }

    setSelectedEmployeeId(employeeId);
    setLineInputs(initialInput);
    setViewMode(markedMap[employeeId] ? 'view' : 'mark');
  };

  const updateLineInput = (subKPIId: string, patch: Partial<EvaluationInputRow>) => {
    setLineInputs(prev => ({
      ...prev,
      [subKPIId]: {
        ...prev[subKPIId],
        subKPIId,
        markValue: patch.markValue ?? prev[subKPIId]?.markValue ?? 0,
        remarks: patch.remarks ?? prev[subKPIId]?.remarks ?? '',
      },
    }));
  };

  const submitEvaluation = () => {
    if (!selectedBundle) return;

    const missing = formRowsFlat.some(row => {
      const val = lineInputs[row.subKPIId]?.markValue;
      return typeof val !== 'number' || Number.isNaN(val);
    });

    if (missing) {
      message.error('Please provide mark value for each Sub KPI before submit.');
      return;
    }

    const overMarked = formRowsFlat.find(row => {
      const val = lineInputs[row.subKPIId]?.markValue ?? 0;
      return val > row.markOutOf;
    });

    if (overMarked) {
      message.error(`Mark cannot exceed Mark Out Of (${overMarked.markOutOf}) for ${overMarked.subKPICode}.`);
      return;
    }

    const items = formRowsFlat.map(row => {
      const input = lineInputs[row.subKPIId] ?? { subKPIId: row.subKPIId, markValue: 0, remarks: '' };
      return {
        ...row,
        subKPIId: row.subKPIId,
        markValue: input.markValue,
        remarks: input.remarks.trim(),
      };
    });

    const totalMark = items.reduce((sum, i) => sum + i.markValue, 0);
    const totalOutOf = items.reduce((sum, i) => sum + i.markOutOf, 0);
    const achievementPct = totalOutOf > 0 ? Math.round((totalMark / totalOutOf) * 100) : 0;

    const record: EmployeeMarkedRecord = {
      employeeId: selectedBundle.emp.id,
      employeeName: selectedBundle.emp.name,
      employeeCode: selectedBundle.emp.employeeId,
      designation: selectedBundle.emp.designation,
      department: selectedBundle.emp.department,
      section: selectedBundle.emp.section,
      submittedAt: new Date().toLocaleString(),
      totalMark,
      totalOutOf,
      achievementPct,
      items,
    };

    setMarkedMap(prev => ({ ...prev, [selectedBundle.emp.id]: record }));
    setViewMode('list');
    setActiveTab('pending');
    setSelectedEmployeeId(null);
    message.success('KPI marks recorded successfully.');
  };

  const selectedSummary = selectedEmployeeId ? markedMap[selectedEmployeeId] : undefined;

  if (viewMode !== 'list' && selectedBundle) {
    const isReadOnly = viewMode === 'view';
    const markTitle = isReadOnly ? 'View Marked KPI' : 'Mark KPI';

    return (
      <div style={{ padding: '16px 20px', background: '#edf5f4', minHeight: '100%', height: '100%', overflowY: 'auto' }}>
        <div
          style={{
            background: HEADER_BG,
            borderRadius: 16,
            padding: '14px 16px',
            marginBottom: 14,
            color: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => {
                setViewMode('list');
                setSelectedEmployeeId(null);
              }}
              style={{ borderRadius: 10 }}
            >
              Back
            </Button>
            <div>
              <Title level={4} style={{ margin: 0, color: '#fff' }}>{markTitle}</Title>
              <Text style={{ color: '#dcf5f1', fontSize: 12 }}>
                {selectedBundle.emp.name} · {selectedBundle.emp.employeeId} · {selectedBundle.emp.designation}
              </Text>
            </div>
          </Space>
          <Tag style={{ borderRadius: 20, paddingInline: 12, borderColor: '#99f6e4', background: '#0f766e', color: '#d1fae5', fontWeight: 700 }}>
            {formGroupedRows.length} Main KPI Area{formGroupedRows.length > 1 ? 's' : ''}
          </Tag>
        </div>

        {selectedSummary && (
          <Card bordered={false} style={{ marginBottom: 14, borderRadius: 14, background: CARD_BG }}>
            <Space size={14} wrap>
              <Tag color="cyan">Submitted: {selectedSummary.submittedAt}</Tag>
              <Tag color="geekblue">Total: {selectedSummary.totalMark}/{selectedSummary.totalOutOf}</Tag>
              <Tag color={selectedSummary.achievementPct >= 85 ? 'success' : selectedSummary.achievementPct >= 70 ? 'processing' : 'warning'}>
                Score: {selectedSummary.achievementPct}%
              </Tag>
            </Space>
          </Card>
        )}

        {formGroupedRows.map(group => (
          <Card
            key={group.areaId}
            bordered={false}
            style={{ marginBottom: 14, borderRadius: 14, background: '#fff', border: '1px solid #d9ebe8' }}
            title={
              <Space size={10}>
                <Tag color="blue" style={{ margin: 0, fontFamily: 'monospace' }}>{group.areaCode}</Tag>
                <Text strong>{group.areaName}</Text>
              </Space>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {group.rows.map(row => {
                const line = lineInputs[row.subKPIId] ?? { subKPIId: row.subKPIId, markValue: 0, remarks: '' };
                return (
                  <div
                    key={row.subKPIId}
                    style={{
                      border: '1px solid #d8e7e5',
                      borderRadius: 12,
                      padding: '12px 14px',
                      background: '#fcfffe',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                      <div>
                        <Space size={8} wrap>
                          <Tag style={{ fontFamily: 'monospace', margin: 0 }}>{row.subKPICode}</Tag>
                          <Text strong>{row.subKPIName}</Text>
                        </Space>
                        <div>
                          <Text type="secondary" style={{ fontSize: 12 }}>{row.measurementCriteria}</Text>
                        </div>
                      </div>
                      <Text type="secondary" style={{ fontSize: 12 }}>Mark Out Of: {row.markOutOf}</Text>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '220px 1fr',
                        gap: 10,
                        alignItems: 'start',
                      }}
                    >
                      <div>
                        <Text style={{ fontSize: 12, color: '#475569', display: 'block', marginBottom: 4 }}>Mark Value</Text>
                        <InputNumber
                          value={line.markValue}
                          min={0}
                          max={row.markOutOf}
                          disabled={isReadOnly}
                          onChange={v => updateLineInput(row.subKPIId, { markValue: v ?? 0 })}
                          style={{ width: '100%' }}
                          addonAfter={`/ ${row.markOutOf}`}
                        />
                      </div>
                      <div>
                        <Text style={{ fontSize: 12, color: '#475569', display: 'block', marginBottom: 4 }}>Remarks</Text>
                        <Input.TextArea
                          value={line.remarks}
                          disabled={isReadOnly}
                          onChange={e => updateLineInput(row.subKPIId, { remarks: e.target.value })}
                          autoSize={{ minRows: 1, maxRows: 3 }}
                          placeholder="Write observation for this Sub KPI"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}

        {!isReadOnly && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Button
              onClick={() => {
                setViewMode('list');
                setSelectedEmployeeId(null);
              }}
            >
              Cancel
            </Button>
            <Button type="primary" icon={<CheckCircleOutlined />} onClick={submitEvaluation}>
              Submit Marking
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: '16px 20px', background: '#edf5f4', minHeight: '100%', height: '100%', overflowY: 'auto' }}>
      <div
        style={{
          background: HEADER_BG,
          borderRadius: 16,
          padding: '16px 18px',
          marginBottom: 14,
          color: '#fff',
        }}
      >
        <Title level={3} style={{ margin: 0, color: '#fff' }}>
          <TrophyOutlined style={{ marginRight: 8 }} />Evaluation
        </Title>
        <Text style={{ color: '#d8f6f1' }}>
          Employee-wise KPI value marking with pending and recorded tracking.
        </Text>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(160px, 1fr))', gap: 10, marginBottom: 14 }}>
        <Card bordered={false} style={{ borderRadius: 12, background: CARD_BG }}>
          <Text type="secondary">Employees</Text>
          <Title level={3} style={{ margin: 0, color: '#0f766e' }}>{stats.total}</Title>
        </Card>
        <Card bordered={false} style={{ borderRadius: 12, background: CARD_BG }}>
          <Text type="secondary">Pending KPI</Text>
          <Title level={3} style={{ margin: 0, color: '#d97706' }}>{stats.pending}</Title>
        </Card>
        <Card bordered={false} style={{ borderRadius: 12, background: CARD_BG }}>
          <Text type="secondary">Marked KPI</Text>
          <Title level={3} style={{ margin: 0, color: '#059669' }}>{stats.marked}</Title>
        </Card>
        <Card bordered={false} style={{ borderRadius: 12, background: CARD_BG }}>
          <Text type="secondary">Average Achievement</Text>
          <Title level={3} style={{ margin: 0, color: '#0284c7' }}>{stats.avg}%</Title>
        </Card>
      </div>

      <Card bordered={false} style={{ borderRadius: 14, marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <Input
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            placeholder="Search employee name or code"
            prefix={<SearchOutlined />}
            style={{ width: 240 }}
          />
          <Select value={filterDept} onChange={setFilterDept} style={{ width: 180 }}>
            <Option value="all">All Departments</Option>
            {departmentOptions.map(v => <Option key={v} value={v}>{v}</Option>)}
          </Select>
          <Select value={filterSection} onChange={setFilterSection} style={{ width: 180 }}>
            <Option value="all">All Sections</Option>
            {sectionOptions.map(v => <Option key={v} value={v}>{v}</Option>)}
          </Select>
          <Select value={filterDesignation} onChange={setFilterDesignation} style={{ width: 180 }}>
            <Option value="all">All Designations</Option>
            {designationOptions.map(v => <Option key={v} value={v}>{v}</Option>)}
          </Select>
          <Button
            onClick={() => {
              setSearchQ('');
              setFilterDept('all');
              setFilterSection('all');
              setFilterDesignation('all');
            }}
          >
            Reset
          </Button>
        </div>
      </Card>

      <Card bordered={false} style={{ borderRadius: 14 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <Button
            type={activeTab === 'pending' ? 'primary' : 'default'}
            onClick={() => setActiveTab('pending')}
            style={{ borderRadius: 999 }}
          >
            Pending ({pendingEmployees.length})
          </Button>
          <Button
            type={activeTab === 'marked' ? 'primary' : 'default'}
            onClick={() => setActiveTab('marked')}
            style={{ borderRadius: 999 }}
          >
            Marked ({markedEmployees.length})
          </Button>
        </div>

        <Divider style={{ margin: '8px 0 12px' }} />
        <Table
          dataSource={listRows}
          columns={listColumns}
          rowKey="id"
          size="small"
          locale={{ emptyText: `No ${activeTab} employees found for current filters.` }}
          pagination={{ pageSize: 8, showSizeChanger: true, pageSizeOptions: [8, 12, 20] }}
          scroll={{ x: 1180, y: 480 }}
        />
      </Card>
    </div>
  );
}
