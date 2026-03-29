/**
 * EmployeeKpiPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Employee KPI assignment and tracking view for Performance Management.
 * Shows summary cards and a detailed table with achievement tracking.
 */

import { useState } from 'react';
import { Card, Col, Row, Select, Space, Statistic, Table, Tag } from 'antd';
import type { TableColumnsType } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, MinusCircleOutlined, TeamOutlined } from '@ant-design/icons';

type KpiStatus = 'achieved' | 'in-progress' | 'not-started';

interface EmployeeKpi {
  key: string;
  employeeName: string;
  designation: string;
  department: string;
  kpiName: string;
  target: number;
  actual: number;
  achievementPct: number;
  status: KpiStatus;
}

const MOCK_DATA: EmployeeKpi[] = [
  { key: '1',  employeeName: 'Aisha Rahman',    designation: 'Senior Manager',   department: 'Finance',    kpiName: 'Revenue Growth',          target: 15, actual: 17, achievementPct: 113, status: 'achieved' },
  { key: '2',  employeeName: 'Karim Hassan',    designation: 'Executive',        department: 'Sales',      kpiName: 'NPS Score',                target: 70, actual: 68, achievementPct: 97,  status: 'in-progress' },
  { key: '3',  employeeName: 'Nadia Islam',     designation: 'Manager',          department: 'Operations', kpiName: 'Process Cycle Time',       target: 5,  actual: 6,  achievementPct: 83,  status: 'in-progress' },
  { key: '4',  employeeName: 'Tariq Ahmed',     designation: 'Senior Executive', department: 'HR',         kpiName: 'Training Hours Completed', target: 40, actual: 40, achievementPct: 100, status: 'achieved' },
  { key: '5',  employeeName: 'Farhana Begum',   designation: 'Officer',          department: 'IT',         kpiName: 'Cost Reduction',           target: 10, actual: 7,  achievementPct: 70,  status: 'in-progress' },
  { key: '6',  employeeName: 'Rahman Ali',      designation: 'Associate',        department: 'Finance',    kpiName: 'Profit Margin',            target: 20, actual: 0,  achievementPct: 0,   status: 'not-started' },
  { key: '7',  employeeName: 'Sumaiya Khan',    designation: 'Executive',        department: 'Sales',      kpiName: 'Customer Retention Rate',  target: 90, actual: 88, achievementPct: 98,  status: 'in-progress' },
  { key: '8',  employeeName: 'Imran Hossain',   designation: 'Manager',          department: 'Admin',      kpiName: 'Ideas Implemented',        target: 12, actual: 0,  achievementPct: 0,   status: 'not-started' },
  { key: '9',  employeeName: 'Layla Chowdhury', designation: 'Officer',          department: 'HR',         kpiName: 'NPS Score',                target: 70, actual: 74, achievementPct: 106, status: 'achieved' },
  { key: '10', employeeName: 'Jamil Uddin',     designation: 'Senior Manager',   department: 'Operations', kpiName: 'Revenue Growth',           target: 15, actual: 14, achievementPct: 93,  status: 'in-progress' },
];

const DEPARTMENTS   = ['Finance', 'Sales', 'Operations', 'HR', 'IT', 'Admin'];
const DESIGNATIONS  = ['Senior Manager', 'Manager', 'Senior Executive', 'Executive', 'Officer', 'Associate'];
const PERIOD_OPTIONS = ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025'];

function statusTag(status: KpiStatus) {
  const config: Record<KpiStatus, { color: string; label: string }> = {
    achieved:    { color: 'green',   label: 'Achieved' },
    'in-progress': { color: 'blue',  label: 'In Progress' },
    'not-started': { color: 'default', label: 'Not Started' },
  };
  const c = config[status];
  return <Tag color={c.color} style={{ marginInlineEnd: 0 }}>{c.label}</Tag>;
}

export default function EmployeeKpiPage() {
  const [department,   setDepartment]   = useState<string>('all');
  const [designation,  setDesignation]  = useState<string>('all');
  const [period,       setPeriod]       = useState('Q2 2025');

  const displayed = MOCK_DATA.filter((r) => {
    if (department  !== 'all' && r.department  !== department)  return false;
    if (designation !== 'all' && r.designation !== designation) return false;
    return true;
  });

  const totalAssigned  = displayed.length;
  const achieved       = displayed.filter((r) => r.status === 'achieved').length;
  const inProgress     = displayed.filter((r) => r.status === 'in-progress').length;
  const notStarted     = displayed.filter((r) => r.status === 'not-started').length;

  const columns: TableColumnsType<EmployeeKpi> = [
    { title: '#', key: 'sl', width: 48, render: (_v, _r, i) => i + 1 },
    {
      title: 'Employee Name',
      dataIndex: 'employeeName',
      key: 'employeeName',
      render: (v) => <span style={{ fontWeight: 600 }}>{v}</span>,
    },
    { title: 'Designation',  dataIndex: 'designation',  key: 'designation' },
    { title: 'Department',   dataIndex: 'department',   key: 'department' },
    { title: 'KPI Name',     dataIndex: 'kpiName',      key: 'kpiName' },
    {
      title: 'Target',
      dataIndex: 'target',
      key: 'target',
      width: 80,
      render: (v: number) => <span style={{ color: '#374151' }}>{v}</span>,
    },
    {
      title: 'Actual',
      dataIndex: 'actual',
      key: 'actual',
      width: 80,
      render: (v: number) => <span style={{ fontWeight: 600, color: v === 0 ? '#9ca3af' : '#0f766e' }}>{v}</span>,
    },
    {
      title: 'Achievement %',
      dataIndex: 'achievementPct',
      key: 'achievementPct',
      width: 120,
      render: (v: number) => (
        <Tag color={v >= 100 ? 'green' : v >= 75 ? 'blue' : v >= 50 ? 'orange' : 'red'} style={{ marginInlineEnd: 0 }}>{v}%</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (_v, record) => statusTag(record.status),
    },
  ];

  const cardStyle: React.CSSProperties = {
    borderRadius: 14,
    border: '1px solid #d8e7e5',
    background: '#ffffff',
  };

  return (
    <div className="page-shell">
      <div className="page-header-row">
        <div>
          <h1>Employee KPI View</h1>
          <p>Track KPI assignments and achievement progress for each employee.</p>
        </div>
        <Space wrap>
          <Select
            value={department}
            onChange={setDepartment}
            style={{ width: 150 }}
            options={[{ label: 'All Departments', value: 'all' }, ...DEPARTMENTS.map((d) => ({ label: d, value: d }))]}
          />
          <Select
            value={designation}
            onChange={setDesignation}
            style={{ width: 170 }}
            options={[{ label: 'All Designations', value: 'all' }, ...DESIGNATIONS.map((d) => ({ label: d, value: d }))]}
          />
          <Select
            value={period}
            onChange={setPeriod}
            style={{ width: 120 }}
            options={PERIOD_OPTIONS.map((p) => ({ label: p, value: p }))}
          />
        </Space>
      </div>

      {/* ── Summary Cards ──────────────────────────────────────────────── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={cardStyle}>
            <Statistic
              title="Total Assigned"
              value={totalAssigned}
              prefix={<TeamOutlined style={{ color: '#0f766e' }} />}
              valueStyle={{ color: '#0f766e', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={cardStyle}>
            <Statistic
              title="Achieved"
              value={achieved}
              prefix={<CheckCircleOutlined style={{ color: '#059669' }} />}
              valueStyle={{ color: '#059669', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={cardStyle}>
            <Statistic
              title="In Progress"
              value={inProgress}
              prefix={<ClockCircleOutlined style={{ color: '#0284c7' }} />}
              valueStyle={{ color: '#0284c7', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={cardStyle}>
            <Statistic
              title="Not Started"
              value={notStarted}
              prefix={<MinusCircleOutlined style={{ color: '#9ca3af' }} />}
              valueStyle={{ color: '#9ca3af', fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      <div className="list-surface">
        <Table<EmployeeKpi>
          rowKey="key"
          columns={columns}
          dataSource={displayed}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          size="small"
          bordered={false}
          locale={{ emptyText: 'No KPI records found.' }}
        />
      </div>
    </div>
  );
}
