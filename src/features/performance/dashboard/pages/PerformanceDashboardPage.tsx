import { useState, useMemo } from 'react';
import {
  Card, Col, Row, Table, Progress, Tag, Select, Typography, Space, Statistic,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  BarChartOutlined, CheckCircleOutlined, TeamOutlined, TrophyOutlined,
  RiseOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

// ── Types ──────────────────────────────────────────────────────────────────────
interface MainKPIRow {
  key: string;
  kpiName: string;
  designationCoverage: number;
  activeSubKPIs: number;
  averageScore: number;
  status: 'Active' | 'Inactive';
}

interface DesignationRow {
  key: string;
  designation: string;
  kpisAssigned: number;
  completionRate: number;
  status: 'Active' | 'Inactive';
}

// ── Mock data ──────────────────────────────────────────────────────────────────
const MAIN_KPI_DATA: MainKPIRow[] = [
  { key: '1', kpiName: 'Sales Performance',        designationCoverage: 85, activeSubKPIs: 6, averageScore: 82, status: 'Active' },
  { key: '2', kpiName: 'Customer Satisfaction',    designationCoverage: 72, activeSubKPIs: 4, averageScore: 76, status: 'Active' },
  { key: '3', kpiName: 'Operational Efficiency',   designationCoverage: 91, activeSubKPIs: 5, averageScore: 88, status: 'Active' },
  { key: '4', kpiName: 'Employee Development',     designationCoverage: 60, activeSubKPIs: 3, averageScore: 71, status: 'Active' },
  { key: '5', kpiName: 'Financial Compliance',     designationCoverage: 78, activeSubKPIs: 4, averageScore: 80, status: 'Active' },
  { key: '6', kpiName: 'Innovation & Growth',      designationCoverage: 45, activeSubKPIs: 2, averageScore: 65, status: 'Inactive' },
];

const DESIGNATION_DATA: DesignationRow[] = [
  { key: '1', designation: 'Senior Manager',     kpisAssigned: 18, completionRate: 88, status: 'Active' },
  { key: '2', designation: 'Team Lead',           kpisAssigned: 15, completionRate: 82, status: 'Active' },
  { key: '3', designation: 'Software Engineer',  kpisAssigned: 12, completionRate: 75, status: 'Active' },
  { key: '4', designation: 'Sales Executive',    kpisAssigned: 14, completionRate: 79, status: 'Active' },
  { key: '5', designation: 'HR Specialist',      kpisAssigned: 10, completionRate: 91, status: 'Active' },
  { key: '6', designation: 'Finance Analyst',    kpisAssigned: 11, completionRate: 70, status: 'Active' },
  { key: '7', designation: 'Operations Manager', kpisAssigned: 16, completionRate: 84, status: 'Active' },
  { key: '8', designation: 'Intern',             kpisAssigned:  5, completionRate: 55, status: 'Inactive' },
];

// ── Stat Card ─────────────────────────────────────────────────────────────────
const STATS = [
  { title: 'Total KPIs',           value: 24,   suffix: '',  icon: <BarChartOutlined />, color: '#0f766e' },
  { title: 'Active KPIs',          value: 18,   suffix: '',  icon: <CheckCircleOutlined />, color: '#059669' },
  { title: 'Designations Covered', value: 12,   suffix: '',  icon: <TeamOutlined />, color: '#0369a1' },
  { title: 'Avg Achievement',      value: 78,   suffix: '%', icon: <TrophyOutlined />, color: '#d97706' },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function PerformanceDashboardPage() {
  const [selectedYear, setSelectedYear] = useState<string>('2024');

  const mainKPIColumns: ColumnsType<MainKPIRow> = useMemo(() => [
    {
      title: 'KPI Name',
      dataIndex: 'kpiName',
      key: 'kpiName',
      render: (v: string) => <Text strong>{v}</Text>,
    },
    {
      title: 'Designation Coverage',
      dataIndex: 'designationCoverage',
      key: 'designationCoverage',
      width: 200,
      render: (v: number) => (
        <Space direction="vertical" size={2} style={{ width: '100%' }}>
          <Progress percent={v} strokeColor="#0f766e" size="small" />
        </Space>
      ),
    },
    {
      title: 'Active Sub KPIs',
      dataIndex: 'activeSubKPIs',
      key: 'activeSubKPIs',
      align: 'center',
      render: (v: number) => (
        <Tag color="cyan" style={{ fontWeight: 600 }}>{v}</Tag>
      ),
    },
    {
      title: 'Average Score',
      dataIndex: 'averageScore',
      key: 'averageScore',
      align: 'center',
      render: (v: number) => (
        <Text style={{ color: v >= 80 ? '#059669' : v >= 65 ? '#d97706' : '#dc2626', fontWeight: 600 }}>
          {v}%
        </Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (v: string) => (
        <Tag color={v === 'Active' ? 'green' : 'default'}
          style={v === 'Active' ? { background: '#dcfce7', color: '#059669', border: '1px solid #bbf7d0' } : {}}>
          {v}
        </Tag>
      ),
    },
  ], []);

  const designationColumns: ColumnsType<DesignationRow> = useMemo(() => [
    {
      title: 'Designation',
      dataIndex: 'designation',
      key: 'designation',
      render: (v: string) => <Text strong>{v}</Text>,
    },
    {
      title: 'KPIs Assigned',
      dataIndex: 'kpisAssigned',
      key: 'kpisAssigned',
      align: 'center',
      render: (v: number) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: 'Completion Rate',
      dataIndex: 'completionRate',
      key: 'completionRate',
      width: 220,
      render: (v: number) => (
        <Progress
          percent={v}
          strokeColor={v >= 80 ? '#059669' : v >= 65 ? '#d97706' : '#dc2626'}
          size="small"
        />
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (v: string) => (
        <Tag color={v === 'Active' ? 'green' : 'default'}
          style={v === 'Active' ? { background: '#dcfce7', color: '#059669', border: '1px solid #bbf7d0' } : {}}>
          {v}
        </Tag>
      ),
    },
  ], []);

  return (
    <div style={{ padding: '24px', background: '#f0faf9', minHeight: '100vh' }}>
      {/* Page Header */}
      <div style={{
        background: 'linear-gradient(135deg, #145a56 0%, #0f766e 100%)',
        borderRadius: 12,
        padding: '24px 28px',
        marginBottom: 24,
        color: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <Space align="center" style={{ marginBottom: 4 }}>
            <RiseOutlined style={{ fontSize: 22, color: '#99f6e4' }} />
            <Title level={3} style={{ margin: 0, color: '#fff' }}>Performance Dashboard</Title>
          </Space>
          <Text style={{ color: '#99f6e4', fontSize: 14 }}>
            Overview of KPI performance metrics and designation coverage
          </Text>
        </div>
        <Select
          value={selectedYear}
          onChange={setSelectedYear}
          style={{ width: 120 }}
          size="middle"
        >
          <Option value="2024">FY 2024</Option>
          <Option value="2023">FY 2023</Option>
          <Option value="2022">FY 2022</Option>
        </Select>
      </div>

      {/* Summary Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {STATS.map((s) => (
          <Col xs={24} sm={12} lg={6} key={s.title}>
            <Card
              style={{ border: '1px solid #d8e7e5', borderRadius: 12, height: '100%' }}
              bodyStyle={{ padding: '20px 24px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 10,
                  background: `${s.color}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, color: s.color,
                }}>
                  {s.icon}
                </div>
                <Statistic
                  title={<Text style={{ fontSize: 13, color: '#64748b' }}>{s.title}</Text>}
                  value={s.value}
                  suffix={s.suffix}
                  valueStyle={{ color: s.color, fontSize: 26, fontWeight: 700 }}
                />
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Main KPI Areas */}
      <Card
        style={{ border: '1px solid #d8e7e5', borderRadius: 12, marginBottom: 24 }}
        title={
          <Space>
            <BarChartOutlined style={{ color: '#0f766e' }} />
            <Text strong style={{ color: '#0f766e', fontSize: 15 }}>Main KPI Areas</Text>
          </Space>
        }
      >
        <Table
          columns={mainKPIColumns}
          dataSource={MAIN_KPI_DATA}
          pagination={false}
          size="middle"
          onHeaderRow={() => ({ style: { background: '#eef8f7' } })}
        />
      </Card>

      {/* Designation Coverage */}
      <Card
        style={{ border: '1px solid #d8e7e5', borderRadius: 12 }}
        title={
          <Space>
            <TeamOutlined style={{ color: '#0f766e' }} />
            <Text strong style={{ color: '#0f766e', fontSize: 15 }}>Designation Coverage</Text>
          </Space>
        }
      >
        <Table
          columns={designationColumns}
          dataSource={DESIGNATION_DATA}
          pagination={false}
          size="middle"
          onHeaderRow={() => ({ style: { background: '#eef8f7' } })}
        />
      </Card>
    </div>
  );
}
