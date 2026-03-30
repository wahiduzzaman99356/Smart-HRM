/**
 * EmployeeKPIViewPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Performance Management → Employee KPI View
 * Manager/HR view of employee KPI assignments and achievement scores.
 */

import { useMemo, useState } from 'react';
import {
  Table, Card, Select, Tag, Typography, Space, Progress, Avatar,
  Badge, Drawer, Descriptions, Divider, Statistic, Row, Col,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  UserOutlined, EyeOutlined, FundOutlined,
} from '@ant-design/icons';
import {
  INITIAL_EMPLOYEE_KPI_RECORDS,
  INITIAL_ACHIEVEMENT_LEVELS,
  type EmployeeKPIRecord,
  type EvalStatus,
} from '../types/performance.types';

const { Title, Text } = Typography;
const { Option } = Select;

const STATUS_BADGE: Record<EvalStatus, 'default' | 'processing' | 'warning' | 'success'> = {
  Pending:   'default',
  Submitted: 'processing',
  Reviewed:  'warning',
  Finalized: 'success',
};

const LEVEL_COLORS: Record<string, string> = {
  'Outstanding':         '#059669',
  'Exceeds Expectations':'#0284c7',
  'Meets Expectations':  '#d97706',
  'Below Expectations':  '#ea580c',
  'Unsatisfactory':      '#dc2626',
};

const DEPARTMENTS = Array.from(new Set(INITIAL_EMPLOYEE_KPI_RECORDS.map(r => r.department)));
const PERIODS     = Array.from(new Set(INITIAL_EMPLOYEE_KPI_RECORDS.map(r => r.period)));
const STATUSES: EvalStatus[] = ['Pending', 'Submitted', 'Reviewed', 'Finalized'];

export default function EmployeeKPIViewPage() {
  const [period, setPeriod]     = useState('all');
  const [dept,   setDept]       = useState('all');
  const [status, setStatus]     = useState('all');
  const [viewing, setViewing]   = useState<string | null>(null); // employeeId
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = useMemo(() =>
    INITIAL_EMPLOYEE_KPI_RECORDS.filter(r =>
      (period === 'all' || r.period === period) &&
      (dept   === 'all' || r.department === dept) &&
      (status === 'all' || r.status === status)
    ), [period, dept, status]);

  // ── Group by employee for summary rows ───────────────────────────────────
  const employeeSummaries = useMemo(() => {
    const map = new Map<string, {
      employeeId: string; employeeName: string; designation: string; department: string;
      period: string; records: EmployeeKPIRecord[];
      avgAchievement: number; overallLevel: string; status: EvalStatus;
    }>();

    filtered.forEach(r => {
      if (!map.has(r.employeeId)) {
        map.set(r.employeeId, {
          employeeId: r.employeeId, employeeName: r.employeeName,
          designation: r.designation, department: r.department,
          period: r.period, records: [], avgAchievement: 0, overallLevel: '', status: r.status,
        });
      }
      map.get(r.employeeId)!.records.push(r);
    });

    return Array.from(map.values()).map(emp => {
      const avg = Math.round(emp.records.reduce((a, b) => a + b.achievementPct, 0) / emp.records.length);
      const level = INITIAL_ACHIEVEMENT_LEVELS.find(l => avg >= l.minScore && avg <= l.maxScore);
      // Worst status wins
      const statusPriority: EvalStatus[] = ['Pending', 'Submitted', 'Reviewed', 'Finalized'];
      const worstStatus = emp.records
        .map(r => r.status)
        .sort((a, b) => statusPriority.indexOf(a) - statusPriority.indexOf(b))[0];
      return { ...emp, avgAchievement: avg, overallLevel: level?.name ?? 'N/A', status: worstStatus };
    });
  }, [filtered]);

  // ── Detail drawer data ───────────────────────────────────────────────────
  const detailRecords = useMemo(() =>
    viewing ? filtered.filter(r => r.employeeId === viewing) : [],
    [viewing, filtered]);

  const detailEmp = useMemo(() =>
    employeeSummaries.find(e => e.employeeId === viewing),
    [viewing, employeeSummaries]);

  const openDetail = (empId: string) => {
    setViewing(empId);
    setDrawerOpen(true);
  };

  const summaryColumns: ColumnsType<typeof employeeSummaries[0]> = [
    {
      title: 'Employee',
      dataIndex: 'employeeName',
      render: (name: string, row) => (
        <Space>
          <Avatar size={30} style={{ background: '#0f766e', fontSize: 11 }}>
            {name.split(' ').map(n => n[0]).join('')}
          </Avatar>
          <span>
            <Text strong style={{ fontSize: 12 }}>{name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 11 }}>{row.designation}</Text>
          </span>
        </Space>
      ),
    },
    {
      title: 'Department',
      dataIndex: 'department',
      width: 140,
      render: (d: string) => <Tag color="default" style={{ fontSize: 11 }}>{d}</Tag>,
    },
    {
      title: 'Period',
      dataIndex: 'period',
      width: 90,
      render: (p: string) => <Text style={{ fontSize: 12 }}>{p}</Text>,
    },
    {
      title: 'KPIs',
      dataIndex: 'records',
      width: 60,
      align: 'center',
      render: (records: EmployeeKPIRecord[]) => (
        <Tag color="blue">{records.length}</Tag>
      ),
    },
    {
      title: 'Avg Achievement',
      dataIndex: 'avgAchievement',
      width: 160,
      render: (pct: number) => (
        <Progress
          percent={Math.min(pct, 100)}
          size="small"
          strokeColor={pct >= 90 ? '#059669' : pct >= 75 ? '#0284c7' : pct >= 60 ? '#d97706' : '#dc2626'}
          format={() => `${pct}%`}
          style={{ width: 130 }}
        />
      ),
    },
    {
      title: 'Achievement Level',
      dataIndex: 'overallLevel',
      width: 170,
      render: (level: string) => (
        <Tag color={LEVEL_COLORS[level] ?? 'default'} style={{ fontSize: 11 }}>{level}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 110,
      render: (s: EvalStatus) => <Badge status={STATUS_BADGE[s]} text={s} />,
    },
    {
      title: '',
      width: 60,
      align: 'center',
      render: (_: unknown, row) => (
        <EyeOutlined
          style={{ color: '#0f766e', cursor: 'pointer', fontSize: 16 }}
          onClick={() => openDetail(row.employeeId)}
        />
      ),
    },
  ];

  const kpiDetailColumns: ColumnsType<EmployeeKPIRecord> = [
    {
      title: 'KPI Area',
      dataIndex: 'kpiAreaName',
      render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text>,
    },
    {
      title: 'Sub KPI',
      dataIndex: 'subKPIName',
      render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text>,
    },
    {
      title: 'Target',
      dataIndex: 'targetValue',
      width: 80,
      align: 'center',
      render: (v: number) => <Text type="secondary">{v}</Text>,
    },
    {
      title: 'Achieved',
      dataIndex: 'achievedValue',
      width: 80,
      align: 'center',
      render: (v: number) => <Text strong style={{ color: '#0f766e' }}>{v}</Text>,
    },
    {
      title: 'Achievement %',
      dataIndex: 'achievementPct',
      width: 130,
      render: (pct: number) => (
        <Progress
          percent={Math.min(pct, 100)}
          size="small"
          strokeColor={pct >= 90 ? '#059669' : pct >= 75 ? '#0284c7' : pct >= 60 ? '#d97706' : '#dc2626'}
          format={() => `${pct}%`}
        />
      ),
    },
    {
      title: 'Level',
      dataIndex: 'achievementLevel',
      width: 150,
      render: (level: string) => (
        <Tag color={LEVEL_COLORS[level] ?? 'default'} style={{ fontSize: 11 }}>{level}</Tag>
      ),
    },
  ];

  return (
    <div style={{ padding: '16px 20px', background: '#f0f4f3', minHeight: '100%' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Title level={4} style={{ margin: 0, color: '#0f766e' }}>
            <UserOutlined style={{ marginRight: 8 }} />Employee KPI View
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            View and track individual employee KPI achievement across all periods
          </Text>
        </div>
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <Card bordered={false} size="small" style={{ borderRadius: 10, marginBottom: 12 }}>
        <Space wrap>
          <Text type="secondary" style={{ fontSize: 12 }}>Filter by:</Text>
          <Select value={period} onChange={setPeriod} style={{ width: 120 }} size="small" placeholder="Period">
            <Option value="all">All Periods</Option>
            {PERIODS.map(p => <Option key={p} value={p}>{p}</Option>)}
          </Select>
          <Select value={dept} onChange={setDept} style={{ width: 160 }} size="small" placeholder="Department">
            <Option value="all">All Departments</Option>
            {DEPARTMENTS.map(d => <Option key={d} value={d}>{d}</Option>)}
          </Select>
          <Select value={status} onChange={setStatus} style={{ width: 140 }} size="small" placeholder="Status">
            <Option value="all">All Statuses</Option>
            {STATUSES.map(s => <Option key={s} value={s}>{s}</Option>)}
          </Select>
          <Text type="secondary" style={{ fontSize: 12 }}>{employeeSummaries.length} employee{employeeSummaries.length !== 1 ? 's' : ''}</Text>
        </Space>
      </Card>

      {/* ── Summary Table ────────────────────────────────────────────────────── */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Table
          dataSource={employeeSummaries}
          columns={summaryColumns}
          rowKey="employeeId"
          size="small"
          pagination={{ pageSize: 10, showSizeChanger: false }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* ── Detail Drawer ─────────────────────────────────────────────────── */}
      <Drawer
        title={
          <Space>
            <FundOutlined style={{ color: '#0f766e' }} />
            <span>{detailEmp?.employeeName ?? ''} — KPI Details</span>
          </Space>
        }
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={680}
      >
        {detailEmp && (
          <>
            <Row gutter={12} style={{ marginBottom: 16 }}>
              {[
                { label: 'Designation',  value: detailEmp.designation },
                { label: 'Department',   value: detailEmp.department },
                { label: 'Period',       value: detailEmp.period },
              ].map(item => (
                <Col span={8} key={item.label}>
                  <Statistic
                    title={<span style={{ fontSize: 11, color: '#6b7280' }}>{item.label}</span>}
                    value={item.value}
                    valueStyle={{ fontSize: 14, fontWeight: 600, color: '#111827' }}
                  />
                </Col>
              ))}
            </Row>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, padding: '10px 14px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
              <Progress
                type="circle"
                percent={Math.min(detailEmp.avgAchievement, 100)}
                size={64}
                strokeColor={detailEmp.avgAchievement >= 90 ? '#059669' : detailEmp.avgAchievement >= 75 ? '#0284c7' : '#d97706'}
                format={() => `${detailEmp.avgAchievement}%`}
              />
              <div>
                <Text style={{ fontSize: 13, fontWeight: 600 }}>Overall Achievement</Text>
                <br />
                <Tag color={LEVEL_COLORS[detailEmp.overallLevel] ?? 'default'} style={{ marginTop: 4 }}>
                  {detailEmp.overallLevel}
                </Tag>
              </div>
            </div>
            <Divider orientation="left" style={{ fontSize: 12 }}>KPI Breakdown</Divider>
            <Table
              dataSource={detailRecords}
              columns={kpiDetailColumns}
              rowKey="id"
              size="small"
              pagination={false}
              scroll={{ x: 600 }}
            />
          </>
        )}
      </Drawer>
    </div>
  );
}
