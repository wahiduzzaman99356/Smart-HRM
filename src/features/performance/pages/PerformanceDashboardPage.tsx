/**
 * PerformanceDashboardPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Performance Management → Dashboard
 * Provides at-a-glance KPI metrics, achievement distribution, and recent evaluations.
 */

import { useMemo, useState } from 'react';
import {
  Card, Row, Col, Statistic, Table, Tag, Progress, Select, Typography, Space, Badge, Avatar,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  RiseOutlined, TeamOutlined, TrophyOutlined, ClockCircleOutlined,
  AimOutlined, CheckCircleOutlined, BarChartOutlined,
} from '@ant-design/icons';
import {
  INITIAL_EMPLOYEE_KPI_RECORDS,
  INITIAL_MAIN_KPI_AREAS,
  INITIAL_ACHIEVEMENT_LEVELS,
  type EmployeeKPIRecord,
} from '../types/performance.types';

const { Title, Text } = Typography;
const { Option } = Select;

const PERSPECTIVE_COLORS: Record<string, string> = {
  'Financial':         '#0284c7',
  'Customer':          '#059669',
  'Internal Process':  '#d97706',
  'Learning & Growth': '#7c3aed',
};

const STATUS_COLOR: Record<string, string> = {
  Pending:   'default',
  Submitted: 'processing',
  Reviewed:  'warning',
  Finalized: 'success',
};

export default function PerformanceDashboardPage() {
  const [period, setPeriod] = useState('Q1 2026');

  const records = useMemo(() =>
    INITIAL_EMPLOYEE_KPI_RECORDS.filter(r => r.period === period),
    [period],
  );

  // ── Summary stats ────────────────────────────────────────────────────────────
  const totalEvaluated = useMemo(() => new Set(records.map(r => r.employeeId)).size, [records]);
  const avgScore = useMemo(() => {
    if (!records.length) return 0;
    const sum = records.reduce((a, b) => a + b.achievementPct, 0);
    return Math.round(sum / records.length);
  }, [records]);
  const outstanding = useMemo(() => records.filter(r => r.achievementLevel === 'Outstanding').length, [records]);
  const pending = useMemo(() => records.filter(r => r.status === 'Pending' || r.status === 'Submitted').length, [records]);

  // ── KPI area performance breakdown ───────────────────────────────────────────
  const areaBreakdown = useMemo(() => {
    return INITIAL_MAIN_KPI_AREAS.map(area => {
      const areaRecords = records.filter(r => r.kpiAreaName === area.name);
      const avg = areaRecords.length
        ? Math.round(areaRecords.reduce((a, b) => a + b.achievementPct, 0) / areaRecords.length)
        : 0;
      return { ...area, avgScore: avg, count: areaRecords.length };
    });
  }, [records]);

  // ── Achievement distribution ──────────────────────────────────────────────────
  const achievementDist = useMemo(() => {
    return INITIAL_ACHIEVEMENT_LEVELS.map(level => {
      const count = records.filter(r => r.achievementLevel === level.name).length;
      const pct = records.length ? Math.round((count / records.length) * 100) : 0;
      return { ...level, count, pct };
    });
  }, [records]);

  // ── Recent evaluations table ──────────────────────────────────────────────────
  const recentColumns: ColumnsType<EmployeeKPIRecord> = [
    {
      title: 'Employee',
      dataIndex: 'employeeName',
      render: (name: string, row) => (
        <Space>
          <Avatar size={28} style={{ background: '#0f766e', fontSize: 11 }}>
            {name.split(' ').map(n => n[0]).join('')}
          </Avatar>
          <span>
            <Text strong style={{ fontSize: 12 }}>{name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 11 }}>{row.designation} · {row.department}</Text>
          </span>
        </Space>
      ),
    },
    {
      title: 'KPI Area',
      dataIndex: 'kpiAreaName',
      render: (v: string) => <Tag color={PERSPECTIVE_COLORS[INITIAL_MAIN_KPI_AREAS.find(a => a.name === v)?.perspective ?? ''] ?? 'default'} style={{ fontSize: 11 }}>{v}</Tag>,
    },
    {
      title: 'Sub KPI',
      dataIndex: 'subKPIName',
      ellipsis: true,
    },
    {
      title: 'Achievement',
      dataIndex: 'achievementPct',
      align: 'center',
      render: (pct: number) => (
        <Progress
          percent={Math.min(pct, 100)}
          size="small"
          strokeColor={pct >= 90 ? '#059669' : pct >= 75 ? '#0284c7' : pct >= 60 ? '#d97706' : '#dc2626'}
          format={() => `${pct}%`}
          style={{ width: 120 }}
        />
      ),
    },
    {
      title: 'Level',
      dataIndex: 'achievementLevel',
      render: (level: string) => {
        const al = INITIAL_ACHIEVEMENT_LEVELS.find(a => a.name === level);
        return <Tag color={al?.color ?? 'default'} style={{ fontSize: 11 }}>{level}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (s: string) => <Badge status={STATUS_COLOR[s] as any} text={s} />,
    },
  ];

  return (
    <div style={{ padding: '16px 20px', background: '#f0f4f3', minHeight: '100%' }}>

      {/* ── Header ─────────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0, color: '#0f766e' }}>
            <RiseOutlined style={{ marginRight: 8 }} />Performance Dashboard
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Balanced Scorecard KPI tracking & achievement overview
          </Text>
        </div>
        <Space>
          <Text type="secondary" style={{ fontSize: 12 }}>Period:</Text>
          <Select value={period} onChange={setPeriod} size="small" style={{ width: 110 }}>
            <Option value="Q1 2026">Q1 2026</Option>
            <Option value="Q4 2025">Q4 2025</Option>
            <Option value="Q3 2025">Q3 2025</Option>
          </Select>
        </Space>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────────────────── */}
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        {[
          { icon: <TeamOutlined />,         color: '#0f766e', bg: '#e6f7f5', title: 'Employees Evaluated', value: totalEvaluated, suffix: 'employees' },
          { icon: <BarChartOutlined />,      color: '#0284c7', bg: '#e0f2fe', title: 'Average Achievement',  value: avgScore,       suffix: '%'         },
          { icon: <TrophyOutlined />,        color: '#7c3aed', bg: '#ede9fe', title: 'Outstanding Records',  value: outstanding,    suffix: 'records'   },
          { icon: <ClockCircleOutlined />,   color: '#d97706', bg: '#fef3c7', title: 'Pending Reviews',      value: pending,        suffix: 'items'     },
        ].map((card, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: card.color }}>
                  {card.icon}
                </div>
                <Statistic
                  title={<span style={{ fontSize: 12, color: '#6b7280' }}>{card.title}</span>}
                  value={card.value}
                  suffix={<span style={{ fontSize: 11, color: '#9ca3af' }}>{card.suffix}</span>}
                  valueStyle={{ fontSize: 22, fontWeight: 700, color: card.color }}
                />
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        {/* ── KPI Area Breakdown ─────────────────────────────────────────────── */}
        <Col xs={24} lg={14}>
          <Card
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}
            title={
              <Space>
                <AimOutlined style={{ color: '#0f766e' }} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>KPI Area Performance</span>
              </Space>
            }
          >
            {areaBreakdown.map(area => (
              <div key={area.id} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Space size={6}>
                    <Tag color={PERSPECTIVE_COLORS[area.perspective]} style={{ fontSize: 10, margin: 0 }}>{area.perspective}</Tag>
                    <Text style={{ fontSize: 13, fontWeight: 500 }}>{area.name}</Text>
                  </Space>
                  <Space size={6}>
                    <Text type="secondary" style={{ fontSize: 11 }}>Weight: {area.weight}%</Text>
                    <Text strong style={{ fontSize: 13, color: area.avgScore >= 90 ? '#059669' : area.avgScore >= 75 ? '#0284c7' : area.avgScore >= 60 ? '#d97706' : '#dc2626' }}>
                      {area.avgScore}%
                    </Text>
                  </Space>
                </div>
                <Progress
                  percent={Math.min(area.avgScore, 100)}
                  strokeColor={area.avgScore >= 90 ? '#059669' : area.avgScore >= 75 ? '#0284c7' : area.avgScore >= 60 ? '#d97706' : '#dc2626'}
                  trailColor="#e5e7eb"
                  showInfo={false}
                  strokeWidth={10}
                  style={{ borderRadius: 8 }}
                />
                <Text type="secondary" style={{ fontSize: 11 }}>{area.count} evaluation{area.count !== 1 ? 's' : ''}</Text>
              </div>
            ))}
          </Card>
        </Col>

        {/* ── Achievement Distribution ───────────────────────────────────────── */}
        <Col xs={24} lg={10}>
          <Card
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}
            title={
              <Space>
                <CheckCircleOutlined style={{ color: '#0f766e' }} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>Achievement Distribution</span>
              </Space>
            }
          >
            {achievementDist.map(level => (
              <div key={level.id} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Space size={6}>
                    <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: level.color }} />
                    <Text style={{ fontSize: 12 }}>{level.name}</Text>
                  </Space>
                  <Text strong style={{ fontSize: 12 }}>{level.count} <Text type="secondary" style={{ fontSize: 11 }}>({level.pct}%)</Text></Text>
                </div>
                <Progress
                  percent={level.pct}
                  strokeColor={level.color}
                  trailColor="#f3f4f6"
                  showInfo={false}
                  strokeWidth={8}
                />
              </div>
            ))}
            <div style={{ marginTop: 16, padding: '10px 12px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
              <Text style={{ fontSize: 12, color: '#065f46' }}>
                <TrophyOutlined style={{ marginRight: 6 }} />
                <Text strong style={{ color: '#065f46' }}>{outstanding}</Text> outstanding performance{outstanding !== 1 ? 's' : ''} recorded this {period}
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* ── Recent Evaluations Table ─────────────────────────────────────────── */}
      <Card
        bordered={false}
        style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        title={
          <Space>
            <BarChartOutlined style={{ color: '#0f766e' }} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>Recent Evaluations — {period}</span>
          </Space>
        }
      >
        <Table
          dataSource={records}
          columns={recentColumns}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 6, showSizeChanger: false }}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
}
