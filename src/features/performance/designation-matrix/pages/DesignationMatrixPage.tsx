import { useState, useMemo } from 'react';
import {
  Button, Card, Checkbox, Drawer, Form, Select, Space, Table, Tabs, Tag, Tooltip, Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CheckOutlined, CloseOutlined, AppstoreOutlined, UnorderedListOutlined,
  EditOutlined, FilterOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

// ── Types ──────────────────────────────────────────────────────────────────────
interface Designation {
  key: string;
  name: string;
  department: string;
  assignedKPIs: string[];
}

// ── Mock data ──────────────────────────────────────────────────────────────────
const KPI_AREAS = [
  'Sales Performance',
  'Customer Satisfaction',
  'Operational Efficiency',
  'Employee Development',
  'Financial Compliance',
  'Innovation & Growth',
];

const DEPARTMENTS = ['All Departments', 'Sales', 'Engineering', 'Finance', 'Human Resources', 'Operations', 'Product'];

const INITIAL_DESIGNATIONS: Designation[] = [
  {
    key: '1', name: 'Senior Manager', department: 'Sales',
    assignedKPIs: ['Sales Performance', 'Customer Satisfaction', 'Operational Efficiency', 'Employee Development', 'Financial Compliance'],
  },
  {
    key: '2', name: 'Team Lead', department: 'Engineering',
    assignedKPIs: ['Operational Efficiency', 'Employee Development', 'Innovation & Growth'],
  },
  {
    key: '3', name: 'Software Engineer', department: 'Engineering',
    assignedKPIs: ['Operational Efficiency', 'Employee Development'],
  },
  {
    key: '4', name: 'Sales Executive', department: 'Sales',
    assignedKPIs: ['Sales Performance', 'Customer Satisfaction'],
  },
  {
    key: '5', name: 'HR Specialist', department: 'Human Resources',
    assignedKPIs: ['Employee Development', 'Financial Compliance', 'Customer Satisfaction'],
  },
  {
    key: '6', name: 'Finance Analyst', department: 'Finance',
    assignedKPIs: ['Financial Compliance', 'Operational Efficiency'],
  },
  {
    key: '7', name: 'Operations Manager', department: 'Operations',
    assignedKPIs: ['Operational Efficiency', 'Financial Compliance', 'Employee Development', 'Customer Satisfaction'],
  },
  {
    key: '8', name: 'Product Manager', department: 'Product',
    assignedKPIs: ['Innovation & Growth', 'Customer Satisfaction', 'Operational Efficiency'],
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function DesignationMatrixPage() {
  const [designations, setDesignations] = useState<Designation[]>(INITIAL_DESIGNATIONS);
  const [filterDept, setFilterDept]     = useState('All Departments');
  const [drawerOpen, setDrawerOpen]     = useState(false);
  const [editingDesig, setEditingDesig] = useState<Designation | null>(null);
  const [tempKPIs, setTempKPIs]         = useState<string[]>([]);
  const [form]                          = Form.useForm();

  const filtered = useMemo(() => designations.filter(d =>
    filterDept === 'All Departments' || d.department === filterDept
  ), [designations, filterDept]);

  const openAssign = (record: Designation) => {
    setEditingDesig(record);
    setTempKPIs([...record.assignedKPIs]);
    form.setFieldsValue({ assignedKPIs: record.assignedKPIs });
    setDrawerOpen(true);
  };

  const handleSave = () => {
    if (!editingDesig) return;
    setDesignations(prev =>
      prev.map(d => d.key === editingDesig.key ? { ...d, assignedKPIs: tempKPIs } : d)
    );
    setDrawerOpen(false);
  };

  const toggleKPI = (kpi: string, checked: boolean) => {
    setTempKPIs(prev => checked ? [...prev, kpi] : prev.filter(k => k !== kpi));
  };

  // ── Matrix columns ────────────────────────────────────────────────────────
  const matrixColumns: ColumnsType<Designation> = [
    {
      title: 'Designation',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: 200,
      render: (v: string, r: Designation) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ fontSize: 13 }}>{v}</Text>
          <Tag color="geekblue" style={{ fontSize: 11 }}>{r.department}</Tag>
        </Space>
      ),
    },
    ...KPI_AREAS.map(kpi => ({
      title: (
        <Text style={{ fontSize: 12, color: '#0f766e', fontWeight: 600, display: 'block', textAlign: 'center' as const }}>
          {kpi}
        </Text>
      ),
      key: kpi,
      align: 'center' as const,
      width: 150,
      render: (_: unknown, record: Designation) => {
        const assigned = record.assignedKPIs.includes(kpi);
        return assigned
          ? <CheckOutlined style={{ color: '#059669', fontSize: 18 }} />
          : <CloseOutlined style={{ color: '#e2e8f0', fontSize: 16 }} />;
      },
    })),
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      fixed: 'right',
      width: 90,
      render: (_: unknown, record: Designation) => (
        <Tooltip title="Assign KPIs">
          <Button
            type="primary" size="small" icon={<EditOutlined />}
            style={{ background: '#0f766e', borderColor: '#0f766e' }}
            onClick={() => openAssign(record)}
          >
            Edit
          </Button>
        </Tooltip>
      ),
    },
  ];

  // ── List view columns ─────────────────────────────────────────────────────
  const listColumns: ColumnsType<Designation> = [
    {
      title: 'Designation', dataIndex: 'name', key: 'name', width: 200,
      render: (v: string) => <Text strong>{v}</Text>,
    },
    {
      title: 'Department', dataIndex: 'department', key: 'department', width: 160,
      render: (v: string) => <Tag color="geekblue">{v}</Tag>,
    },
    {
      title: 'Assigned KPI Areas', dataIndex: 'assignedKPIs', key: 'assignedKPIs',
      render: (kpis: string[]) => (
        <Space wrap size={4}>
          {kpis.map(k => (
            <Tag key={k} style={{ background: '#f0fdf4', color: '#0f766e', border: '1px solid #bbf7d0', fontSize: 12 }}>
              {k}
            </Tag>
          ))}
          {kpis.length === 0 && <Text type="secondary" style={{ fontSize: 12 }}>None assigned</Text>}
        </Space>
      ),
    },
    {
      title: 'Total', key: 'total', align: 'center', width: 80,
      render: (_: unknown, r: Designation) => <Tag color="blue">{r.assignedKPIs.length}</Tag>,
    },
    {
      title: 'Actions', key: 'actions', align: 'center', width: 90,
      render: (_: unknown, record: Designation) => (
        <Tooltip title="Edit Assignments">
          <Button type="text" size="small" icon={<EditOutlined />}
            style={{ color: '#0f766e' }} onClick={() => openAssign(record)} />
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
            <AppstoreOutlined style={{ fontSize: 22, color: '#99f6e4' }} />
            <Title level={3} style={{ margin: 0, color: '#fff' }}>Designation KPI Matrix</Title>
          </Space>
          <Text style={{ color: '#99f6e4', fontSize: 14 }}>
            Map KPI areas to designations and manage coverage across the organization
          </Text>
        </div>
        <Space>
          <FilterOutlined style={{ color: '#99f6e4', fontSize: 20 }} />
          <Select value={filterDept} onChange={setFilterDept} style={{ width: 200 }}
            dropdownStyle={{ zIndex: 1100 }}>
            {DEPARTMENTS.map(d => <Option key={d} value={d}>{d}</Option>)}
          </Select>
        </Space>
      </div>

      {/* Tabs: Matrix / List */}
      <Card style={{ border: '1px solid #d8e7e5', borderRadius: 12 }}>
        <Tabs
          defaultActiveKey="matrix"
          items={[
            {
              key: 'matrix',
              label: (
                <Space>
                  <AppstoreOutlined />
                  Matrix View
                </Space>
              ),
              children: (
                <Table
                  columns={matrixColumns}
                  dataSource={filtered}
                  rowKey="key"
                  size="middle"
                  pagination={false}
                  scroll={{ x: 1200 }}
                  onHeaderRow={() => ({ style: { background: '#eef8f7' } })}
                />
              ),
            },
            {
              key: 'list',
              label: (
                <Space>
                  <UnorderedListOutlined />
                  List View
                </Space>
              ),
              children: (
                <Table
                  columns={listColumns}
                  dataSource={filtered}
                  rowKey="key"
                  size="middle"
                  pagination={false}
                  onHeaderRow={() => ({ style: { background: '#eef8f7' } })}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* Assign Drawer */}
      <Drawer
        title={
          editingDesig && (
            <Space>
              <EditOutlined style={{ color: '#0f766e' }} />
              <span style={{ color: '#0f766e', fontWeight: 600 }}>
                Assign KPIs — {editingDesig.name}
              </span>
            </Space>
          )
        }
        open={drawerOpen} onClose={() => setDrawerOpen(false)} width={440}
        footer={
          <Space style={{ justifyContent: 'flex-end', display: 'flex' }}>
            <Button onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button type="primary" onClick={handleSave}
              style={{ background: '#0f766e', borderColor: '#0f766e' }}>
              Save Assignments
            </Button>
          </Space>
        }
      >
        {editingDesig && (
          <>
            <div style={{ marginBottom: 16 }}>
              <Tag color="geekblue">{editingDesig.department}</Tag>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {tempKPIs.length} of {KPI_AREAS.length} KPI areas selected
              </Text>
            </div>
            <Space direction="vertical" style={{ width: '100%' }} size={12}>
              {KPI_AREAS.map(kpi => (
                <div key={kpi} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', borderRadius: 8,
                  background: tempKPIs.includes(kpi) ? '#f0fdf4' : '#f8fafc',
                  border: `1px solid ${tempKPIs.includes(kpi) ? '#bbf7d0' : '#e2e8f0'}`,
                  cursor: 'pointer',
                }} onClick={() => toggleKPI(kpi, !tempKPIs.includes(kpi))}>
                  <Space>
                    <Checkbox
                      checked={tempKPIs.includes(kpi)}
                      onChange={e => { e.stopPropagation(); toggleKPI(kpi, e.target.checked); }}
                    />
                    <Text strong style={{ fontSize: 13, color: tempKPIs.includes(kpi) ? '#0f766e' : '#374151' }}>
                      {kpi}
                    </Text>
                  </Space>
                  {tempKPIs.includes(kpi) && <CheckOutlined style={{ color: '#059669' }} />}
                </div>
              ))}
            </Space>
          </>
        )}
      </Drawer>
    </div>
  );
}
