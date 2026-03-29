/**
 * PerformanceDashboardPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * KPI overview dashboard for Performance Management.
 * Shows stat cards, department achievement bars, and top performers table.
 */

import { useState } from 'react';
import { Card, Col, Progress, Row, Select, Space, Statistic, Table, Tag } from 'antd';
import type { TableColumnsType } from 'antd';
import {
  AimOutlined,
  RiseOutlined,
  TeamOutlined,
  TrophyOutlined,
} from '@ant-design/icons';

interface TopPerformer {
  key: string;
  name: string;
  designation: string;
  department: string;
  kpiScore: number;
}

interface DeptAchievement {
  department: string;
  achievement: number;
  color: string;
}

const TOP_PERFORMERS: TopPerformer[] = [
  { key: '1', name: 'Aisha Rahman',    designation: 'Senior Manager',  department: 'Finance',    kpiScore: 96 },
  { key: '2', name: 'Karim Hassan',    designation: 'Executive',       department: 'Sales',      kpiScore: 93 },
  { key: '3', name: 'Nadia Islam',     designation: 'Manager',         department: 'Operations', kpiScore: 91 },
  { key: '4', name: 'Tariq Ahmed',     designation: 'Senior Executive', department: 'HR',        kpiScore: 88 },
  { key: '5', name: 'Farhana Begum',   designation: 'Officer',         department: 'IT',         kpiScore: 86 },
];

const DEPT_ACHIEVEMENTS: DeptAchievement[] = [
  { department: 'Finance',    achievement: 88, color: '#0f766e' },
  { department: 'Sales',      achievement: 82, color: '#0284c7' },
  { department: 'Operations', achievement: 76, color: '#059669' },
  { department: 'HR',         achievement: 71, color: '#d97706' },
  { department: 'IT',         achievement: 67, color: '#7c3aed' },
  { department: 'Admin',      achievement: 60, color: '#dc2626' },
];

const PERIOD_OPTIONS = [
  { label: 'Q1 2025', value: 'q1-2025' },
  { label: 'Q2 2025', value: 'q2-2025' },
  { label: 'Q3 2025', value: 'q3-2025' },
  { label: 'Q4 2025', value: 'q4-2025' },
];

const statCardStyle: React.CSSProperties = {
  borderRadius: 14,
  border: '1px solid #d8e7e5',
  background: '#ffffff',
};

const columns: TableColumnsType<TopPerformer> = [
  {
    title: '#',
    key: 'rank',
    width: 48,
    render: (_v, _r, index) => (
      <span style={{ fontWeight: 700, color: index < 3 ? '#0f766e' : '#6b7280' }}>
        {index + 1}
      </span>
    ),
  },
  { title: 'Employee Name', dataIndex: 'name', key: 'name', render: (v) => <span style={{ fontWeight: 600 }}>{v}</span> },
  { title: 'Designation',   dataIndex: 'designation', key: 'designation' },
  { title: 'Department',    dataIndex: 'department',  key: 'department' },
  {
    title: 'KPI Score %',
    dataIndex: 'kpiScore',
    key: 'kpiScore',
    width: 160,
    render: (score: number) => (
      <Space size={8}>
        <Progress
          percent={score}
          size="small"
          strokeColor={score >= 90 ? '#0f766e' : score >= 75 ? '#0284c7' : '#d97706'}
          style={{ width: 80 }}
          showInfo={false}
        />
        <Tag color={score >= 90 ? 'green' : score >= 75 ? 'blue' : 'orange'} style={{ marginInlineEnd: 0 }}>
          {score}%
        </Tag>
      </Space>
    ),
  },
];

export default function PerformanceDashboardPage() {
  const [period, setPeriod] = useState('q2-2025');

  return (
    <div className="page-shell">
      <div className="page-header-row">
        <div>
          <h1>Performance Dashboard</h1>
          <p>Overview of KPI achievements across the organisation.</p>
        </div>
        <Select
          value={period}
          onChange={setPeriod}
          options={PERIOD_OPTIONS}
          style={{ width: 120 }}
        />
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────────── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={statCardStyle}>
            <Statistic
              title="Total KPIs"
              value={38}
              prefix={<AimOutlined style={{ color: '#0f766e' }} />}
              valueStyle={{ color: '#0f766e', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={statCardStyle}>
            <Statistic
              title="Active Employees"
              value={124}
              prefix={<TeamOutlined style={{ color: '#0284c7' }} />}
              valueStyle={{ color: '#0284c7', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={statCardStyle}>
            <Statistic
              title="Avg Achievement %"
              value={74.3}
              suffix="%"
              precision={1}
              prefix={<RiseOutlined style={{ color: '#059669' }} />}
              valueStyle={{ color: '#059669', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={statCardStyle}>
            <Statistic
              title="Top Performers"
              value={18}
              prefix={<TrophyOutlined style={{ color: '#d97706' }} />}
              valueStyle={{ color: '#d97706', fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* ── KPI Achievement by Department ───────────────────────────── */}
        <Col xs={24} lg={10}>
          <Card
            title="KPI Achievement by Department"
            style={{ ...statCardStyle, height: '100%' }}
            styles={{ body: { paddingTop: 12 } }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {DEPT_ACHIEVEMENTS.map((d) => (
                <div key={d.department}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12, fontWeight: 600, color: '#374151' }}>
                    <span>{d.department}</span>
                    <span style={{ color: d.color }}>{d.achievement}%</span>
                  </div>
                  <Progress
                    percent={d.achievement}
                    showInfo={false}
                    strokeColor={d.color}
                    trailColor="#e5e7eb"
                    size={['100%', 10]}
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* ── Top Performing Employees ─────────────────────────────────── */}
        <Col xs={24} lg={14}>
          <Card
            title="Top Performing Employees"
            style={{ ...statCardStyle, height: '100%' }}
            styles={{ body: { padding: 0 } }}
          >
            <Table<TopPerformer>
              rowKey="key"
              columns={columns}
              dataSource={TOP_PERFORMERS}
              pagination={false}
              size="small"
              bordered={false}
              locale={{ emptyText: 'No data.' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
