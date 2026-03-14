import { useMemo, useState } from 'react';
import { Button, Input, Select, Space, Table, message } from 'antd';
import type { TableColumnsType } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import type { CSSProperties } from 'react';

type SalaryGenerationStatus = 'draft' | 'processing' | 'confirmed';

interface SalaryGenerationRecord {
  id: string;
  name: string;
  type: 'Days' | 'Month';
  dateFrom: string;
  dateTo: string;
  monthName: string;
  year: number;
  status: SalaryGenerationStatus;
}

const INITIAL_ROWS: SalaryGenerationRecord[] = [
  {
    id: '1',
    name: 'TechnoNext February 2026',
    type: 'Days',
    dateFrom: '21-Jan-2026',
    dateTo: '20-Feb-2026',
    monthName: 'February',
    year: 2026,
    status: 'draft',
  },
  {
    id: '2',
    name: 'TN Test Purpose',
    type: 'Month',
    dateFrom: '01-Feb-2026',
    dateTo: '28-Feb-2026',
    monthName: 'February',
    year: 2026,
    status: 'processing',
  },
  {
    id: '3',
    name: 'jan 2026',
    type: 'Month',
    dateFrom: '01-Jan-2026',
    dateTo: '31-Jan-2026',
    monthName: 'January',
    year: 2026,
    status: 'processing',
  },
  {
    id: '4',
    name: 'feb 2026',
    type: 'Month',
    dateFrom: '01-Feb-2026',
    dateTo: '28-Feb-2026',
    monthName: 'February',
    year: 2026,
    status: 'processing',
  },
  {
    id: '5',
    name: 'dec 2025',
    type: 'Month',
    dateFrom: '01-Dec-2025',
    dateTo: '31-Dec-2025',
    monthName: 'December',
    year: 2025,
    status: 'processing',
  },
  {
    id: '6',
    name: 'Salary Testing',
    type: 'Days',
    dateFrom: '20-Mar-2025',
    dateTo: '20-Apr-2025',
    monthName: 'April',
    year: 2025,
    status: 'processing',
  },
  {
    id: '7',
    name: 'final feedback test sheet 12',
    type: 'Days',
    dateFrom: '21-Nov-2024',
    dateTo: '20-Dec-2024',
    monthName: 'December',
    year: 2024,
    status: 'processing',
  },
  {
    id: '8',
    name: 'final feedback test sheet 11',
    type: 'Days',
    dateFrom: '21-Oct-2024',
    dateTo: '20-Nov-2024',
    monthName: 'November',
    year: 2024,
    status: 'confirmed',
  },
  {
    id: '9',
    name: 'final feedback test sheet 002',
    type: 'Days',
    dateFrom: '21-Oct-2024',
    dateTo: '20-Nov-2024',
    monthName: 'November',
    year: 2024,
    status: 'processing',
  },
];

const STATUS_STYLE: Record<SalaryGenerationStatus, CSSProperties> = {
  draft: {
    color: 'var(--color-status-pending)',
    borderColor: '#fcd34d',
    background: 'var(--color-status-pending-bg)',
  },
  processing: {
    color: 'var(--color-status-info)',
    borderColor: '#bfdbfe',
    background: 'var(--color-status-info-bg)',
  },
  confirmed: {
    color: 'var(--color-status-approved)',
    borderColor: '#bbf7d0',
    background: 'var(--color-status-approved-bg)',
  },
};

const STATUS_LABEL: Record<SalaryGenerationStatus, string> = {
  draft: 'Draft',
  processing: 'Processing',
  confirmed: 'Confirmed',
};

const MONTH_ORDER = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export default function SalaryGenerationPage() {
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<SalaryGenerationRecord['type'] | ''>('');
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<SalaryGenerationStatus | ''>('');
  const [appliedFilters, setAppliedFilters] = useState<{
    type: SalaryGenerationRecord['type'] | '';
    month: string;
    year: string;
    status: SalaryGenerationStatus | '';
  }>({
    type: '',
    month: '',
    year: '',
    status: '',
  });

  const monthOptions = useMemo(() => {
    const monthSet = new Set(INITIAL_ROWS.map((item) => item.monthName));
    return MONTH_ORDER
      .filter((month) => monthSet.has(month))
      .map((month) => ({ value: month, label: month }));
  }, []);

  const yearOptions = useMemo(() => {
    const years = Array.from(new Set(INITIAL_ROWS.map((item) => item.year))).sort((a, b) => b - a);
    return years.map((year) => ({ value: String(year), label: String(year) }));
  }, []);

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return INITIAL_ROWS.filter((item) => {
      if (appliedFilters.type && item.type !== appliedFilters.type) return false;
      if (appliedFilters.month && item.monthName !== appliedFilters.month) return false;
      if (appliedFilters.year && String(item.year) !== appliedFilters.year) return false;
      if (appliedFilters.status && item.status !== appliedFilters.status) return false;

      if (!q) return true;

      return [
        item.name,
        item.type,
        item.dateFrom,
        item.dateTo,
        item.monthName,
        String(item.year),
        STATUS_LABEL[item.status],
      ].some((field) => field.toLowerCase().includes(q));
    });
  }, [appliedFilters, searchQuery]);

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setAppliedFilters({
      type: typeFilter,
      month: monthFilter,
      year: yearFilter,
      status: statusFilter,
    });
  };

  const handleReset = () => {
    setSearchInput('');
    setSearchQuery('');
    setTypeFilter('');
    setMonthFilter('');
    setYearFilter('');
    setStatusFilter('');
    setAppliedFilters({ type: '', month: '', year: '', status: '' });
  };

  const columns: TableColumnsType<SalaryGenerationRecord> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 320,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120,
    },
    {
      title: 'Date From',
      dataIndex: 'dateFrom',
      key: 'dateFrom',
      width: 170,
    },
    {
      title: 'Date To',
      dataIndex: 'dateTo',
      key: 'dateTo',
      width: 170,
    },
    {
      title: 'Month Name',
      dataIndex: 'monthName',
      key: 'monthName',
      width: 160,
    },
    {
      title: 'Year',
      dataIndex: 'year',
      key: 'year',
      width: 100,
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      width: 150,
      render: (status: SalaryGenerationStatus) => (
        <span
          style={{
            display: 'inline-block',
            padding: '3px 12px',
            borderRadius: 20,
            fontWeight: 600,
            lineHeight: 1.2,
            border: `1px solid ${STATUS_STYLE[status].borderColor}`,
            ...STATUS_STYLE[status],
          }}
        >
          {STATUS_LABEL[status]}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 140,
      render: (_value, record) => (
        <button type="button" className="action-link" onClick={() => message.info(`Viewing details for ${record.name}`)}>
          View Details
        </button>
      ),
    },
  ];

  return (
    <div className="page-shell">
      <div className="page-header-row">
        <div>
          <h1>Generate Salary</h1>
          <p>Detailed information about</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => message.info('Create new salary generation is not implemented yet.')}>
          Add New
        </Button>
      </div>

      <div className="filter-bar">
        <div>
          <div className="filter-label">TYPE</div>
          <Select
            placeholder="Type"
            value={typeFilter || undefined}
            onChange={(value) => setTypeFilter(value)}
            allowClear
            style={{ width: 130 }}
            options={[
              { value: 'Days', label: 'Days' },
              { value: 'Month', label: 'Month' },
            ]}
          />
        </div>

        <div>
          <div className="filter-label">MONTH</div>
          <Select
            placeholder="Month"
            value={monthFilter || undefined}
            onChange={(value) => setMonthFilter(value)}
            allowClear
            style={{ width: 150 }}
            options={monthOptions}
          />
        </div>

        <div>
          <div className="filter-label">YEAR</div>
          <Select
            placeholder="Year"
            value={yearFilter || undefined}
            onChange={(value) => setYearFilter(value)}
            allowClear
            style={{ width: 120 }}
            options={yearOptions}
          />
        </div>

        <div>
          <div className="filter-label">STATUS</div>
          <Select
            placeholder="Status"
            value={statusFilter || undefined}
            onChange={(value) => setStatusFilter(value)}
            allowClear
            style={{ width: 140 }}
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'processing', label: 'Processing' },
              { value: 'confirmed', label: 'Confirmed' },
            ]}
          />
        </div>

        <div>
          <div className="filter-label">REF. NO / ID</div>
          <Space.Compact>
            <Input
              placeholder="Search..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onPressEnter={handleSearch}
              style={{ width: 220 }}
            />
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch} />
          </Space.Compact>
        </div>

        <Space>
          <Button type="primary" onClick={handleSearch}>Apply</Button>
          <Button onClick={handleReset}>Reset</Button>
        </Space>
      </div>

      <div className="list-surface">

        <Table<SalaryGenerationRecord>
          rowKey="id"
          columns={columns}
          dataSource={filteredRows}
          bordered={false}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            total: filteredRows.length,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50],
            showQuickJumper: false,
            showTotal: undefined,
            position: ['bottomRight'],
          }}
          locale={{ emptyText: 'No salary generation records found.' }}
        />
      </div>
    </div>
  );
}
