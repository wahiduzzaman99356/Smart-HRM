import { useState, useMemo } from 'react';
import {
  Button, Card, Drawer, Rate, Select, Space, Table, Tag, Tooltip, Typography, Input, Progress,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  SearchOutlined, EyeOutlined, UserOutlined, TrophyOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

// ── Types ──────────────────────────────────────────────────────────────────────
interface KPIDetail {
  subKPI: string;
  mainKPI: string;
  target: number;
  achieved: number;
  unit: string;
  weight: number;
}

interface EmployeeKPI {
  key: string;
  employeeName: string;
  employeeId: string;
  designation: string;
  department: string;
  kpisAssigned: number;
  kpisAchieved: number;
  achievementPct: number;
  rating: number;
  period: string;
  details: KPIDetail[];
}

// ── Mock data ──────────────────────────────────────────────────────────────────
const MOCK_DATA: EmployeeKPI[] = [
  {
    key: '1', employeeName: 'Ashraful Islam', employeeId: 'EMP-1001',
    designation: 'Senior Manager', department: 'Sales',
    kpisAssigned: 8, kpisAchieved: 7, achievementPct: 88, rating: 4, period: '2024',
    details: [
      { subKPI: 'Revenue Target Achievement', mainKPI: 'Sales Performance', target: 100, achieved: 93, unit: '%', weight: 30 },
      { subKPI: 'New Client Acquisition',     mainKPI: 'Sales Performance', target: 20,  achieved: 19, unit: 'No', weight: 20 },
      { subKPI: 'NPS Score',                  mainKPI: 'Customer Satisfaction', target: 70, achieved: 74, unit: 'No', weight: 25 },
      { subKPI: 'Budget Variance',            mainKPI: 'Financial Compliance', target: 5, achieved: 3, unit: '%', weight: 25 },
    ],
  },
  {
    key: '2', employeeName: 'Md. Arifur Rahman', employeeId: 'EMP-1002',
    designation: 'Team Lead', department: 'Engineering',
    kpisAssigned: 7, kpisAchieved: 5, achievementPct: 71, rating: 3, period: '2024',
    details: [
      { subKPI: 'Process Cycle Time Reduction', mainKPI: 'Operational Efficiency', target: 15, achieved: 10, unit: '%', weight: 20 },
      { subKPI: 'Resource Utilization Rate',    mainKPI: 'Operational Efficiency', target: 85, achieved: 80, unit: '%', weight: 25 },
      { subKPI: 'Training Hours Completed',     mainKPI: 'Employee Development',   target: 40, achieved: 32, unit: 'hrs', weight: 15 },
    ],
  },
  {
    key: '3', employeeName: 'Fatema Khatun', employeeId: 'EMP-1003',
    designation: 'HR Specialist', department: 'Human Resources',
    kpisAssigned: 6, kpisAchieved: 6, achievementPct: 97, rating: 5, period: '2024',
    details: [
      { subKPI: 'Training Hours Completed', mainKPI: 'Employee Development', target: 40, achieved: 42, unit: 'hrs', weight: 30 },
      { subKPI: 'Ticket Resolution Rate',   mainKPI: 'Customer Satisfaction', target: 95, achieved: 98, unit: '%', weight: 35 },
      { subKPI: 'Audit Finding Closure Rate', mainKPI: 'Financial Compliance', target: 90, achieved: 95, unit: '%', weight: 35 },
    ],
  },
  {
    key: '4', employeeName: 'Rabiul Karim', employeeId: 'EMP-1004',
    designation: 'Sales Executive', department: 'Sales',
    kpisAssigned: 6, kpisAchieved: 4, achievementPct: 62, rating: 2, period: '2024',
    details: [
      { subKPI: 'Revenue Target Achievement', mainKPI: 'Sales Performance', target: 100, achieved: 65, unit: '%', weight: 30 },
      { subKPI: 'New Client Acquisition',     mainKPI: 'Sales Performance', target: 20,  achieved: 11, unit: 'No', weight: 20 },
      { subKPI: 'NPS Score',                  mainKPI: 'Customer Satisfaction', target: 70, achieved: 60, unit: 'No', weight: 25 },
    ],
  },
  {
    key: '5', employeeName: 'Nusrat Jahan', employeeId: 'EMP-1005',
    designation: 'Finance Analyst', department: 'Finance',
    kpisAssigned: 7, kpisAchieved: 7, achievementPct: 91, rating: 5, period: '2024',
    details: [
      { subKPI: 'Budget Variance',            mainKPI: 'Financial Compliance', target: 5, achieved: 2, unit: '%', weight: 30 },
      { subKPI: 'Audit Finding Closure Rate', mainKPI: 'Financial Compliance', target: 90, achieved: 94, unit: '%', weight: 25 },
      { subKPI: 'Process Cycle Time Reduction', mainKPI: 'Operational Efficiency', target: 15, achieved: 18, unit: '%', weight: 20 },
    ],
  },
  {
    key: '6', employeeName: 'Ishraq Ahmed', employeeId: 'EMP-1006',
    designation: 'Software Engineer', department: 'Engineering',
    kpisAssigned: 5, kpisAchieved: 3, achievementPct: 58, rating: 2, period: '2024',
    details: [
      { subKPI: 'Resource Utilization Rate',    mainKPI: 'Operational Efficiency', target: 85, achieved: 70, unit: '%', weight: 25 },
      { subKPI: 'Training Hours Completed',     mainKPI: 'Employee Development',   target: 40, achieved: 20, unit: 'hrs', weight: 15 },
      { subKPI: 'Process Cycle Time Reduction', mainKPI: 'Operational Efficiency', target: 15, achieved: 8,  unit: '%', weight: 20 },
    ],
  },
  {
    key: '7', employeeName: 'Tanvir Hossain', employeeId: 'EMP-1007',
    designation: 'Operations Manager', department: 'Operations',
    kpisAssigned: 8, kpisAchieved: 6, achievementPct: 76, rating: 3, period: '2024',
    details: [
      { subKPI: 'Process Cycle Time Reduction', mainKPI: 'Operational Efficiency', target: 15, achieved: 13, unit: '%', weight: 20 },
      { subKPI: 'Resource Utilization Rate',    mainKPI: 'Operational Efficiency', target: 85, achieved: 83, unit: '%', weight: 25 },
      { subKPI: 'Budget Variance',              mainKPI: 'Financial Compliance',   target: 5,  achieved: 6,  unit: '%', weight: 25 },
    ],
  },
  {
    key: '8', employeeName: 'Anwarul Zaman', employeeId: 'EMP-1008',
    designation: 'Team Lead', department: 'Product',
    kpisAssigned: 7, kpisAchieved: 7, achievementPct: 95, rating: 5, period: '2024',
    details: [
      { subKPI: 'New Product Launches',       mainKPI: 'Innovation & Growth',    target: 3,  achieved: 3,  unit: 'No', weight: 35 },
      { subKPI: 'Training Hours Completed',   mainKPI: 'Employee Development',   target: 40, achieved: 45, unit: 'hrs', weight: 15 },
      { subKPI: 'Ticket Resolution Rate',     mainKPI: 'Customer Satisfaction',  target: 95, achieved: 97, unit: '%', weight: 35 },
    ],
  },
];

const DESIGNATIONS = ['All Designations', 'Senior Manager', 'Team Lead', 'HR Specialist', 'Sales Executive', 'Finance Analyst', 'Software Engineer', 'Operations Manager'];
const PERIODS      = ['All Periods', '2024', '2023', '2022'];

function achievementColor(pct: number) {
  if (pct >= 90) return '#059669';
  if (pct >= 75) return '#0f766e';
  if (pct >= 60) return '#d97706';
  return '#dc2626';
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function EmployeeKPIPage() {
  const [search, setSearch]         = useState('');
  const [filterDesig, setFilterDesig] = useState('All Designations');
  const [filterPeriod, setFilterPeriod] = useState('All Periods');
  const [selected, setSelected]     = useState<EmployeeKPI | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = useMemo(() => MOCK_DATA.filter(d => {
    const matchSearch = d.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      d.employeeId.toLowerCase().includes(search.toLowerCase());
    const matchDesig  = filterDesig === 'All Designations' || d.designation === filterDesig;
    const matchPeriod = filterPeriod === 'All Periods' || d.period === filterPeriod;
    return matchSearch && matchDesig && matchPeriod;
  }), [search, filterDesig, filterPeriod]);

  const openDetails = (record: EmployeeKPI) => {
    setSelected(record);
    setDrawerOpen(true);
  };

  const detailColumns: ColumnsType<KPIDetail> = [
    { title: 'Sub KPI',  dataIndex: 'subKPI',   key: 'subKPI', render: (v: string) => <Text strong style={{ fontSize: 13 }}>{v}</Text> },
    { title: 'Main KPI', dataIndex: 'mainKPI',  key: 'mainKPI', render: (v: string) => <Tag color="cyan" style={{ fontSize: 12 }}>{v}</Tag> },
    { title: 'Target',   dataIndex: 'target',   key: 'target',  align: 'center', render: (v: number, r: KPIDetail) => `${v}${r.unit === '%' ? '%' : ''}` },
    {
      title: 'Achieved', dataIndex: 'achieved', key: 'achieved', align: 'center',
      render: (v: number, r: KPIDetail) => (
        <Text strong style={{ color: achievementColor(r.unit === '%' ? (v / r.target) * 100 : (v / r.target) * 100) }}>
          {v}{r.unit === '%' ? '%' : ''}
        </Text>
      ),
    },
    {
      title: 'Progress', key: 'progress', width: 130,
      render: (_: unknown, r: KPIDetail) => {
        const pct = Math.min(Math.round((r.achieved / r.target) * 100), 100);
        return <Progress percent={pct} size="small" strokeColor={achievementColor(pct)} />;
      },
    },
    {
      title: 'Weight', dataIndex: 'weight', key: 'weight', align: 'center',
      render: (v: number) => <Tag>{v}%</Tag>,
    },
  ];

  const columns: ColumnsType<EmployeeKPI> = [
    {
      title: 'Employee', key: 'employee',
      render: (_: unknown, r: EmployeeKPI) => (
        <Space direction="vertical" size={0}>
          <Text strong>{r.employeeName}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{r.employeeId}</Text>
        </Space>
      ),
    },
    { title: 'Designation', dataIndex: 'designation', key: 'designation',
      render: (v: string) => <Tag color="geekblue">{v}</Tag> },
    { title: 'Department',  dataIndex: 'department', key: 'department',
      render: (v: string) => <Text type="secondary">{v}</Text> },
    { title: 'KPIs Assigned', dataIndex: 'kpisAssigned', key: 'kpisAssigned', align: 'center',
      render: (v: number) => <Tag color="blue">{v}</Tag> },
    { title: 'Achieved',   dataIndex: 'kpisAchieved', key: 'kpisAchieved', align: 'center',
      render: (v: number) => <Tag color="green">{v}</Tag> },
    {
      title: 'Achievement %', dataIndex: 'achievementPct', key: 'achievementPct', align: 'center', width: 140,
      render: (v: number) => (
        <Text strong style={{ color: achievementColor(v), fontSize: 15 }}>{v}%</Text>
      ),
    },
    {
      title: 'Rating', dataIndex: 'rating', key: 'rating', align: 'center',
      render: (v: number) => <Rate disabled defaultValue={v} style={{ fontSize: 14 }} />,
    },
    { title: 'Period', dataIndex: 'period', key: 'period', align: 'center',
      render: (v: string) => <Tag color="purple">{v}</Tag> },
    {
      title: 'Actions', key: 'actions', align: 'center', width: 110,
      render: (_: unknown, record: EmployeeKPI) => (
        <Tooltip title="View Details">
          <Button
            type="primary" size="small" icon={<EyeOutlined />}
            style={{ background: '#0f766e', borderColor: '#0f766e' }}
            onClick={() => openDetails(record)}
          >
            Details
          </Button>
        </Tooltip>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#f0faf9', minHeight: '100vh' }}>
      {/* Page Header */}
      <div style={{
        background: 'linear-gradient(135deg, #145a56 0%, #0f766e 100%)',
        borderRadius: 12, padding: '24px 28px', marginBottom: 24,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <Space align="center" style={{ marginBottom: 4 }}>
            <UserOutlined style={{ fontSize: 22, color: '#99f6e4' }} />
            <Title level={3} style={{ margin: 0, color: '#fff' }}>Employee KPI View</Title>
          </Space>
          <Text style={{ color: '#99f6e4', fontSize: 14 }}>
            Track individual employee KPI achievements and performance ratings
          </Text>
        </div>
        <TrophyOutlined style={{ fontSize: 36, color: '#99f6e480' }} />
      </div>

      {/* Filters */}
      <Card style={{ border: '1px solid #d8e7e5', borderRadius: 12, marginBottom: 16 }} bodyStyle={{ padding: '16px 20px' }}>
        <Space wrap>
          <Input
            placeholder="Search by name or ID…"
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            style={{ width: 260 }} value={search}
            onChange={e => setSearch(e.target.value)} allowClear
          />
          <Select value={filterDesig} onChange={setFilterDesig} style={{ width: 200 }}>
            {DESIGNATIONS.map(d => <Option key={d} value={d}>{d}</Option>)}
          </Select>
          <Select value={filterPeriod} onChange={setFilterPeriod} style={{ width: 150 }}>
            {PERIODS.map(p => <Option key={p} value={p}>{p}</Option>)}
          </Select>
        </Space>
      </Card>

      {/* Table */}
      <Card style={{ border: '1px solid #d8e7e5', borderRadius: 12 }}>
        <Table
          columns={columns} dataSource={filtered} rowKey="key" size="middle"
          pagination={{ pageSize: 10, showTotal: t => `${t} employees` }}
          onHeaderRow={() => ({ style: { background: '#eef8f7' } })}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Details Drawer */}
      <Drawer
        title={
          selected && (
            <Space direction="vertical" size={0}>
              <Space>
                <UserOutlined style={{ color: '#0f766e' }} />
                <span style={{ color: '#0f766e', fontWeight: 600 }}>{selected.employeeName}</span>
              </Space>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {selected.employeeId} · {selected.designation} · FY {selected.period}
              </Text>
            </Space>
          )
        }
        open={drawerOpen} onClose={() => setDrawerOpen(false)} width={780}
      >
        {selected && (
          <>
            <Space style={{ marginBottom: 16, flexWrap: 'wrap' }} size={8}>
              <Tag color="blue">KPIs Assigned: {selected.kpisAssigned}</Tag>
              <Tag color="green">Achieved: {selected.kpisAchieved}</Tag>
              <Tag style={{ background: achievementColor(selected.achievementPct) + '22', color: achievementColor(selected.achievementPct), border: `1px solid ${achievementColor(selected.achievementPct)}44`, fontWeight: 700 }}>
                {selected.achievementPct}% Achievement
              </Tag>
              <Rate disabled defaultValue={selected.rating} style={{ fontSize: 14 }} />
            </Space>
            <Table
              columns={detailColumns} dataSource={selected.details}
              rowKey="subKPI" size="small" pagination={false}
              onHeaderRow={() => ({ style: { background: '#eef8f7' } })}
            />
          </>
        )}
      </Drawer>
    </div>
  );
}
