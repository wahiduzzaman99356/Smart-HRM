import { useMemo, useState } from 'react';
import {
  Button,
  Calendar,
  Card,
  DatePicker,
  Empty,
  Input,
  InputNumber,
  Radio,
  Select,
  Space,
  Table,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import {
  AimOutlined,
  ArrowLeftOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  PlusOutlined,
  RadarChartOutlined,
  ReloadOutlined,
  SearchOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import {
  DateSelectionMode,
  EMPLOYEES,
  INITIAL_SETUPS,
  INITIAL_ATTENDANCE,
  LocationDraft,
  MAP_CENTER,
  OutstationAuditLog,
  OutstationPurpose,
  OutstationSetup,
  PURPOSE_OPTIONS,
  RadiusUnit,
  SHIFT_OPTIONS,
} from '../types/outstation.types';
import { OutstationHistoryView } from '../components/OutstationHistoryView';

const { Text, Title } = Typography;

type TabKey = 'my-station' | 'configuration';
type ConfigView = 'list' | 'create' | 'details' | 'history';

const toIsoDate = (d: Dayjs): string => d.format('YYYY-MM-DD');

const parseSearchInput = (value: string): { lat: number; lng: number } | null => {
  const normalized = value.trim();
  if (!normalized) return null;

  const latLngMatch = normalized.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (latLngMatch) {
    const lat = Number(latLngMatch[1]);
    const lng = Number(latLngMatch[2]);
    if (Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }

  const lower = normalized.toLowerCase();
  if (lower.includes('dhaka')) return { lat: 23.8103, lng: 90.4125 };
  if (lower.includes('gulshan')) return { lat: 23.7937, lng: 90.4066 };
  if (lower.includes('baridhara')) return { lat: 23.8042, lng: 90.4227 };
  if (lower.includes('mirpur')) return { lat: 23.8223, lng: 90.3654 };

  return null;
};

const shiftLabelById = (shiftId: string): string => {
  const shift = SHIFT_OPTIONS.find(s => s.id === shiftId);
  if (!shift) return 'Unknown Shift';
  return `${shift.name} (${shift.start} - ${shift.end})`;
};

const getEmployeeById = (id: string) => EMPLOYEES.find(e => e.id === id);

export default function OutstationPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('configuration');
  const [configView, setConfigView] = useState<ConfigView>('list');

  const [setups, setSetups] = useState<OutstationSetup[]>(INITIAL_SETUPS);

  const [searchText, setSearchText] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [designationFilter, setDesignationFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [purposeFilter, setPurposeFilter] = useState<OutstationPurpose | ''>('');
  const [statusFilter, setStatusFilter] = useState<'Active' | 'Inactive' | ''>('');

  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [purpose, setPurpose] = useState<OutstationPurpose>('Work From Home');
  const [description, setDescription] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [pendingPin, setPendingPin] = useState<{ lat: number; lng: number } | null>(null);
  const [locationRows, setLocationRows] = useState<LocationDraft[]>([]);
  const [dateMode, setDateMode] = useState<DateSelectionMode>('specific');
  const [specificDates, setSpecificDates] = useState<string[]>([]);
  const [rangeDates, setRangeDates] = useState<[Dayjs, Dayjs] | null>(null);
  const [selectedShiftId, setSelectedShiftId] = useState<string>('general');

  const [detailsSetupId, setDetailsSetupId] = useState<string | null>(null);
  const [historySetupId, setHistorySetupId] = useState<string | null>(null);

  const departments = useMemo(() => [...new Set(EMPLOYEES.map(e => e.department))], []);
  const designations = useMemo(() => [...new Set(EMPLOYEES.map(e => e.designation))], []);
  const sections = useMemo(() => [...new Set(EMPLOYEES.map(e => e.section))], []);

  const employeeOptions = EMPLOYEES.map(e => ({ label: `${e.name} (${e.id})`, value: e.id }));

  const filteredRows = useMemo(() => {
    return setups.filter(row => {
      const employee = getEmployeeById(row.employeeId);
      const keyword = searchText.trim().toLowerCase();
      const searchable = `${row.employeeName} ${row.employeeId} ${row.createdBy}`.toLowerCase();

      if (keyword && !searchable.includes(keyword)) return false;
      if (departmentFilter && employee?.department !== departmentFilter) return false;
      if (designationFilter && employee?.designation !== designationFilter) return false;
      if (sectionFilter && employee?.section !== sectionFilter) return false;
      if (purposeFilter && row.purpose !== purposeFilter) return false;
      if (statusFilter && row.status !== statusFilter) return false;
      return true;
    });
  }, [setups, searchText, departmentFilter, designationFilter, sectionFilter, purposeFilter, statusFilter]);

  const detailsSetup = useMemo(
    () => setups.find(s => s.id === detailsSetupId) ?? null,
    [setups, detailsSetupId],
  );

  const historySetup = useMemo(
    () => setups.find(s => s.id === historySetupId) ?? null,
    [setups, historySetupId],
  );

  const appendAuditLog = (
    setup: OutstationSetup,
    action: string,
    note: string,
    actor = 'Admin User',
  ): OutstationAuditLog[] => [
    {
      id: `AL-${setup.id}-${setup.auditLogs.length + 1}`,
      action,
      actor,
      at: new Date().toISOString(),
      note,
    },
    ...setup.auditLogs,
  ];

  const resetCreateForm = () => {
    setSelectedEmployeeIds([]);
    setPurpose('Work From Home');
    setDescription('');
    setLocationInput('');
    setPendingPin(null);
    setLocationRows([]);
    setDateMode('specific');
    setSpecificDates([]);
    setRangeDates(null);
    setSelectedShiftId('general');
  };

  const openCreateForm = () => {
    resetCreateForm();
    setConfigView('create');
  };

  const openDetails = (setupId: string) => {
    setDetailsSetupId(setupId);
    setConfigView('details');
  };

  const applySearchPin = () => {
    const parsed = parseSearchInput(locationInput);
    if (!parsed) {
      message.error('Enter a valid place name or lat,lng (e.g. 23.8103,90.4125).');
      return;
    }
    setPendingPin(parsed);
    message.success('Location found. Click "Add Selected Point" to add this location.');
  };

  const addPendingPinToTable = () => {
    if (!pendingPin) {
      message.warning('Search or click on map first.');
      return;
    }
    const newRow: LocationDraft = {
      id: `LOC-${Date.now()}`,
      query: locationInput.trim() || `${pendingPin.lat.toFixed(4)}, ${pendingPin.lng.toFixed(4)}`,
      lat: pendingPin.lat,
      lng: pendingPin.lng,
      radiusUnit: 'Kilometer',
      radiusValue: 1,
    };
    setLocationRows(prev => [...prev, newRow]);
    setPendingPin(null);
    setLocationInput('');
  };

  const removeLocationRow = (rowId: string) => {
    setLocationRows(prev => prev.filter(row => row.id !== rowId));
  };

  const updateLocationRow = (rowId: string, patch: Partial<LocationDraft>) => {
    setLocationRows(prev => prev.map(row => (row.id === rowId ? { ...row, ...patch } : row)));
  };

  const handleCalendarSelect = (value: Dayjs) => {
    if (dateMode !== 'specific') return;
    const iso = toIsoDate(value);
    setSpecificDates(prev => (prev.includes(iso) ? prev.filter(d => d !== iso) : [...prev, iso]));
  };

  const validateBeforeSave = (): string | null => {
    if (selectedEmployeeIds.length === 0) return 'Select at least one employee.';
    if (!description.trim()) return 'Description is required.';
    if (locationRows.length === 0) return 'Add at least one location.';
    if (locationRows.some(row => row.radiusValue <= 0)) return 'Radius value must be greater than 0.';
    if (dateMode === 'specific' && specificDates.length === 0) return 'Select at least one specific date.';
    if (dateMode === 'date-range' && !rangeDates) return 'Select date range.';
    return null;
  };

  const handleCreateApply = () => {
    const validationError = validateBeforeSave();
    if (validationError) {
      message.error(validationError);
      return;
    }

    const now = new Date().toISOString();
    const createdRows: OutstationSetup[] = selectedEmployeeIds.map((employeeId, idx) => {
      const employee = getEmployeeById(employeeId);
      return {
        id: `OS-${Date.now()}-${idx + 1}`,
        employeeId,
        employeeName: employee?.name ?? employeeId,
        purpose,
        status: 'Active',
        shiftId: selectedShiftId,
        shiftLabel: shiftLabelById(selectedShiftId),
        dateMode,
        specificDates: dateMode === 'specific' ? [...specificDates].sort() : [],
        dateRange: dateMode === 'date-range' && rangeDates ? [toIsoDate(rangeDates[0]), toIsoDate(rangeDates[1])] : null,
        locations: locationRows.map((row, rowIndex) => ({ ...row, id: `${row.id}-${rowIndex}` })),
        createdBy: 'Admin User',
        createdAt: now,
        updatedBy: 'Admin User',
        updatedAt: now,
        auditLogs: [
          {
            id: `AL-${Date.now()}-${idx + 1}`,
            action: 'Created',
            actor: 'Admin User',
            at: now,
            note: `Setup created with ${locationRows.length} location(s), ${dateMode === 'specific' ? `${specificDates.length} specific date(s)` : 'date range'}, shift ${shiftLabelById(selectedShiftId)}.`,
          },
        ],
      };
    });

    setSetups(prev => [...createdRows, ...prev]);
    message.success(`${createdRows.length} outstation setup(s) created successfully.`);
    setConfigView('list');
    resetCreateForm();
  };

  const updateDetailsLocation = (rowId: string, patch: Partial<LocationDraft>) => {
    if (!detailsSetup) return;
    setSetups(prev => prev.map(s => {
      if (s.id !== detailsSetup.id) return s;
      return {
        ...s,
        locations: s.locations.map(loc => (loc.id === rowId ? { ...loc, ...patch } : loc)),
        auditLogs: appendAuditLog(s, 'Updated', 'Location radius/unit updated.'),
      };
    }));
  };

  const removeDetailsLocation = (rowId: string) => {
    if (!detailsSetup) return;
    setSetups(prev => prev.map(s => {
      if (s.id !== detailsSetup.id) return s;
      return {
        ...s,
        locations: s.locations.filter(loc => loc.id !== rowId),
        auditLogs: appendAuditLog(s, 'Updated', 'One location removed from setup.'),
      };
    }));
  };

  const handleUpdateDetails = () => {
    if (!detailsSetup) return;
    if (detailsSetup.locations.length === 0) {
      message.error('At least one location is required.');
      return;
    }
    if (detailsSetup.locations.some(loc => loc.radiusValue <= 0)) {
      message.error('Radius must be greater than 0.');
      return;
    }

    setSetups(prev => prev.map(s => {
      if (s.id !== detailsSetup.id) return s;
      return {
        ...s,
        updatedBy: 'Admin User',
        updatedAt: new Date().toISOString(),
        auditLogs: appendAuditLog(s, 'Updated', 'Details view changes saved.'),
      };
    }));
    message.success('Outstation details updated successfully.');
    setConfigView('list');
    setDetailsSetupId(null);
  };

  const stationColumns: ColumnsType<OutstationSetup> = [
    {
      title: 'Employee Information',
      key: 'employee',
      width: 340,
      render: (_, row) => {
        const emp = getEmployeeById(row.employeeId);
        return (
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 20, background: 'var(--color-primary-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', marginTop: 2 }}>
              <TeamOutlined />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>{row.employeeName}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>ID: {row.employeeId}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{emp?.department} | {emp?.designation}</div>
              <div style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600 }}>{row.shiftLabel}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Location',
      key: 'location',
      width: 220,
      render: (_, row) => (
        <Space direction="vertical" size={2}>
          <Text strong>{row.locations.length}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{row.locations[0]?.query ?? '-'}</Text>
        </Space>
      ),
    },
    {
      title: 'Last Updated BY',
      dataIndex: 'updatedBy',
      key: 'updatedBy',
      width: 170,
    },
    {
      title: 'Last Updated At',
      key: 'updatedAt',
      width: 200,
      render: (_, row) => (
        <Space direction="vertical" size={0}>
          <Text>{dayjs(row.updatedAt).format('DD MMM YYYY')}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{dayjs(row.updatedAt).format('hh:mm A')}</Text>
        </Space>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 180,
      render: (_, row) => (
        <Space direction="vertical" size={0}>
          <Button type="link" style={{ padding: 0 }} icon={<EyeOutlined />} onClick={() => openDetails(row.id)}>
            View
          </Button>
          <Button
            type="link"
            style={{ padding: 0 }}
            onClick={() => {
              setSetups(prev => prev.map(s => {
                if (s.id !== row.id) return s;
                const nextStatus = s.status === 'Active' ? 'Inactive' : 'Active';
                return {
                  ...s,
                  status: nextStatus,
                  updatedAt: new Date().toISOString(),
                  auditLogs: appendAuditLog(s, 'Status Changed', `Status changed to ${nextStatus}.`),
                };
              }));
              message.success('Status updated.');
            }}
          >
            {row.status === 'Active' ? 'Active/Inactive' : 'Inactive/Active'}
          </Button>
          <Button
            type="link"
            style={{ padding: 0 }}
            onClick={() => { setHistorySetupId(row.id); setConfigView('history'); }}
          >
            History
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--color-bg-subtle)' }}>
      <div style={{ background: 'var(--color-bg-surface)', borderBottom: '1px solid var(--color-border)', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #0d9488 0%, #1d4ed8 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RadarChartOutlined />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Out Station</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>Configure geo-based station and schedule per employee</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            onClick={() => setActiveTab('my-station')}
            style={{
              borderRadius: 8,
              borderColor: activeTab === 'my-station' ? 'var(--color-primary)' : 'var(--color-border)',
              color: activeTab === 'my-station' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              background: activeTab === 'my-station' ? 'var(--color-primary-tint)' : 'var(--color-bg-surface)',
              fontWeight: 600,
            }}
          >
            My station
          </Button>
          <Button
            onClick={() => setActiveTab('configuration')}
            style={{
              borderRadius: 8,
              borderColor: activeTab === 'configuration' ? 'var(--color-primary)' : 'var(--color-border)',
              color: activeTab === 'configuration' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              background: activeTab === 'configuration' ? 'var(--color-primary-tint)' : 'var(--color-bg-surface)',
              fontWeight: 600,
            }}
          >
            Configuration
          </Button>
        </div>
      </div>

      <div style={{ padding: '20px 24px', overflow: 'auto' }}>
        {activeTab === 'my-station' && (
          <Card style={{ borderRadius: 12, minHeight: 420 }}>
            <Empty description="My station UI is intentionally empty right now." style={{ marginTop: 80 }} />
          </Card>
        )}

        {activeTab === 'configuration' && configView === 'list' && (
          <Space direction="vertical" size={14} style={{ width: '100%' }}>
            <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(130px, 1fr)) auto auto', gap: 10 }}>
                <Input
                  prefix={<SearchOutlined style={{ color: 'var(--color-text-tertiary)' }} />}
                  placeholder="Search by employee name, ID"
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                />
                <Select
                  allowClear
                  placeholder="Department"
                  value={departmentFilter || undefined}
                  onChange={value => setDepartmentFilter(value ?? '')}
                  options={departments.map(item => ({ label: item, value: item }))}
                />
                <Select
                  allowClear
                  placeholder="Designation"
                  value={designationFilter || undefined}
                  onChange={value => setDesignationFilter(value ?? '')}
                  options={designations.map(item => ({ label: item, value: item }))}
                />
                <Select
                  allowClear
                  placeholder="Section"
                  value={sectionFilter || undefined}
                  onChange={value => setSectionFilter(value ?? '')}
                  options={sections.map(item => ({ label: item, value: item }))}
                />
                <Select
                  allowClear
                  placeholder="Purpose"
                  value={purposeFilter || undefined}
                  onChange={value => setPurposeFilter((value as OutstationPurpose) ?? '')}
                  options={PURPOSE_OPTIONS.map(item => ({ label: item, value: item }))}
                />
                <Select
                  allowClear
                  placeholder="Status"
                  value={statusFilter || undefined}
                  onChange={value => setStatusFilter((value as 'Active' | 'Inactive') ?? '')}
                  options={[{ label: 'Active', value: 'Active' }, { label: 'Inactive', value: 'Inactive' }]}
                />
                <Button icon={<ReloadOutlined />} onClick={() => {
                  setSearchText('');
                  setDepartmentFilter('');
                  setDesignationFilter('');
                  setSectionFilter('');
                  setPurposeFilter('');
                  setStatusFilter('');
                }}>
                  Reset
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={openCreateForm}
                  style={{ background: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
                >
                  Create
                </Button>
              </div>
            </Card>

            <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 0 }}>
              <Table
                rowKey="id"
                columns={stationColumns}
                dataSource={filteredRows}
                pagination={{ pageSize: 6, showTotal: total => `Total ${total} records` }}
              />
            </Card>
          </Space>
        )}

        {activeTab === 'configuration' && configView === 'create' && (
          <div style={{ maxWidth: 980, margin: '0 auto' }}>
            <Card style={{ borderRadius: 12 }}>
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Button type="link" style={{ padding: 0 }} icon={<ArrowLeftOutlined />} onClick={() => setConfigView('list')}>
                  Back to list
                </Button>
                <Title level={5} style={{ margin: 0 }}>Create Out Station Configuration</Title>

                <Select
                  mode="multiple"
                  placeholder="Select Employee"
                  value={selectedEmployeeIds}
                  options={employeeOptions}
                  onChange={setSelectedEmployeeIds}
                  optionFilterProp="label"
                  maxTagCount="responsive"
                  style={{ width: '100%' }}
                  showSearch
                />

                {selectedEmployeeIds.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
                    {selectedEmployeeIds.map(empId => {
                      const emp = getEmployeeById(empId);
                      const existing = setups.find(s => s.employeeId === empId);
                      return (
                        <div key={empId} style={{ border: '1px solid var(--color-border)', borderRadius: 10, padding: 10, display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700 }}>{emp?.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>ID: {emp?.id}</div>
                            <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>{emp?.department}</div>
                            {existing && (
                              <Button type="link" icon={<EyeOutlined />} style={{ padding: 0 }} onClick={() => openDetails(existing.id)}>
                                View details
                              </Button>
                            )}
                          </div>
                          <Button danger type="text" icon={<DeleteOutlined />} onClick={() => setSelectedEmployeeIds(prev => prev.filter(id => id !== empId))} />
                        </div>
                      );
                    })}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 10 }}>
                  <Select
                    value={purpose}
                    onChange={value => setPurpose(value)}
                    options={PURPOSE_OPTIONS.map(item => ({ label: item, value: item }))}
                  />
                  <Input
                    placeholder="Description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <Input
                    placeholder="Search by place name or latitude, longitude"
                    value={locationInput}
                    onChange={e => setLocationInput(e.target.value)}
                  />
                  <Button onClick={applySearchPin} icon={<SearchOutlined />}>Search</Button>
                  <Button type="primary" onClick={addPendingPinToTable} icon={<PlusOutlined />} style={{ background: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}>
                    Add point
                  </Button>
                </div>

                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    const lat = Number((MAP_CENTER.lat + (Math.random() - 0.5) * 0.1).toFixed(5));
                    const lng = Number((MAP_CENTER.lng + (Math.random() - 0.5) * 0.1).toFixed(5));
                    setPendingPin({ lat, lng });
                    setLocationInput(`${lat}, ${lng}`);
                    message.info('Map point selected. Click Add point.');
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      const lat = Number((MAP_CENTER.lat + (Math.random() - 0.5) * 0.1).toFixed(5));
                      const lng = Number((MAP_CENTER.lng + (Math.random() - 0.5) * 0.1).toFixed(5));
                      setPendingPin({ lat, lng });
                      setLocationInput(`${lat}, ${lng}`);
                    }
                  }}
                  style={{ borderRadius: 12, minHeight: 250, border: '1px solid #bfdbfe', background: 'radial-gradient(circle at 15% 10%, #dbeafe 0%, #f8fafc 55%), linear-gradient(135deg, #f0fdfa 0%, #ecfeff 100%)', position: 'relative', cursor: 'pointer' }}
                >
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', color: 'var(--color-primary)' }}>
                    <AimOutlined style={{ fontSize: 34 }} />
                    <div>Click map to select location</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {pendingPin ? `${pendingPin.lat}, ${pendingPin.lng}` : 'No point selected'}
                    </Text>
                  </div>
                </div>

                <Table<LocationDraft>
                  rowKey="id"
                  pagination={false}
                  dataSource={locationRows}
                  columns={[
                    {
                      title: 'Location',
                      dataIndex: 'query',
                      render: (_, row) => (
                        <Space direction="vertical" size={0}>
                          <Text>{row.query}</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>{row.lat.toFixed(5)}, {row.lng.toFixed(5)}</Text>
                        </Space>
                      ),
                    },
                    {
                      title: 'Radius',
                      width: 240,
                      render: (_, row) => (
                        <Radio.Group value={row.radiusUnit} onChange={e => updateLocationRow(row.id, { radiusUnit: e.target.value as RadiusUnit })}>
                          <Radio value="Kilometer">Kilometer</Radio>
                          <Radio value="Meter">Meter</Radio>
                        </Radio.Group>
                      ),
                    },
                    {
                      title: 'Value',
                      width: 160,
                      render: (_, row) => (
                        <InputNumber
                          min={0.1}
                          value={row.radiusValue}
                          onChange={value => updateLocationRow(row.id, { radiusValue: Number(value) || 0 })}
                          style={{ width: '100%' }}
                        />
                      ),
                    },
                    {
                      title: 'Action',
                      width: 80,
                      render: (_, row) => (
                        <Button danger type="text" icon={<DeleteOutlined />} onClick={() => removeLocationRow(row.id)} />
                      ),
                    },
                  ]}
                />

                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div>
                      <Title level={5} style={{ margin: 0 }}>Select Date</Title>
                      <Radio.Group value={dateMode} onChange={e => setDateMode(e.target.value as DateSelectionMode)} style={{ marginTop: 8 }}>
                        <Radio value="specific">Specific</Radio>
                        <Radio value="date-range">Date Range</Radio>
                      </Radio.Group>
                    </div>

                    {dateMode === 'date-range' && (
                      <DatePicker.RangePicker
                        value={rangeDates}
                        onChange={value => setRangeDates(value as [Dayjs, Dayjs] | null)}
                        allowEmpty={[false, false]}
                      />
                    )}

                    <Select
                      value={selectedShiftId}
                      style={{ width: 280 }}
                      onChange={setSelectedShiftId}
                      options={SHIFT_OPTIONS.map(item => ({ label: `${item.name} ${item.start} to ${item.end}`, value: item.id }))}
                    />
                  </div>

                  {dateMode === 'specific' && (
                    <Card style={{ borderRadius: 10, background: 'var(--color-bg-subtle)', marginTop: 10 }}>
                      <Calendar
                        fullscreen={false}
                        value={specificDates[0] ? dayjs(specificDates[0]) : dayjs()}
                        onSelect={handleCalendarSelect}
                        dateFullCellRender={value => {
                          const iso = toIsoDate(value);
                          const selected = specificDates.includes(iso);
                          return (
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                margin: '0 auto',
                                borderRadius: 16,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: selected ? 'var(--color-primary)' : 'transparent',
                                color: selected ? '#fff' : 'var(--color-text-secondary)',
                                fontWeight: selected ? 700 : 500,
                              }}
                            >
                              {value.date()}
                            </div>
                          );
                        }}
                      />
                      <Text type="secondary">Selected dates: {specificDates.length ? specificDates.map(d => dayjs(d).format('DD MMM YYYY')).join(', ') : 'None'}</Text>
                    </Card>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: 10, paddingTop: 8 }}>
                  <Button onClick={resetCreateForm}>Reset</Button>
                  <Button type="primary" onClick={handleCreateApply} style={{ background: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}>
                    Apply
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'configuration' && configView === 'details' && detailsSetup && (
          <div style={{ maxWidth: 1060, margin: '0 auto' }}>
            {/* ── Back ── */}
            <Button
              type="link"
              icon={<ArrowLeftOutlined />}
              style={{ padding: 0, marginBottom: 16, color: 'var(--color-primary)', fontWeight: 500, fontSize: 13 }}
              onClick={() => { setConfigView('list'); setDetailsSetupId(null); }}
            >
              Back to list
            </Button>

            {/* ── Employee Header Card ── */}
            <Card
              style={{ borderRadius: 12, marginBottom: 16, border: '1px solid var(--color-border)' }}
              bodyStyle={{ padding: '16px 22px' }}
            >
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ width: 52, height: 52, borderRadius: 26, background: 'linear-gradient(135deg, #e0f2f1 0%, #ccfbf1 100%)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, border: '2px solid #99f6e4' }}>
                  <TeamOutlined />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{detailsSetup.employeeName}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 3 }}>ID: {detailsSetup.employeeId}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600, marginTop: 2 }}>{detailsSetup.shiftLabel}</div>
                </div>
                <span style={{
                  display: 'inline-block', padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                  background: detailsSetup.status === 'Active' ? 'var(--color-status-approved-bg)' : 'var(--color-bg-subtle)',
                  color:      detailsSetup.status === 'Active' ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)',
                  border:    `1px solid ${detailsSetup.status === 'Active' ? 'var(--color-status-approved-bg)' : 'var(--color-border)'}`,
                }}>
                  {detailsSetup.status}
                </span>
              </div>
            </Card>

            {/* ── Location Table ── */}
            <Card
              style={{ borderRadius: 12, border: '1px solid var(--color-border)', marginBottom: 20 }}
              bodyStyle={{ padding: 0 }}
            >
              {/* Header row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '190px 1fr 340px 52px',
                background: 'var(--color-bg-subtle)',
                borderBottom: '1.5px solid #e2e8f0',
                borderRadius: '12px 12px 0 0',
              }}>
                {['Purpose', 'Location', 'Radius*', ''].map((h, i) => (
                  <div key={i} style={{ padding: '11px 16px', fontSize: 13, fontWeight: 700, color: 'var(--color-text-secondary)' }}>{h}</div>
                ))}
              </div>

              {/* One data row per location — Purpose_OPTIONS[idx] owns that row */}
              {detailsSetup.locations.map((loc, idx) => {
                const purposeLabel: OutstationPurpose = PURPOSE_OPTIONS[idx] ?? detailsSetup.purpose;
                const isWfh = purposeLabel === 'Work From Home';

                return (
                  <div
                    key={loc.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '190px 1fr 340px 52px',
                      borderBottom: idx < detailsSetup.locations.length - 1 ? '1px solid var(--color-border)' : 'none',
                      alignItems: 'center',
                    }}
                  >
                    {/* Purpose badge — one per row */}
                    <div style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '6px 14px',
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        background: isWfh ? '#fff7d6' : '#e8f5e9',
                        color:      isWfh ? '#92400e' : '#1b5e20',
                        border:    `1.5px solid ${isWfh ? 'rgba(252, 211, 77, 0.45)' : '#86c98a'}`,
                        whiteSpace: 'nowrap',
                      }}>
                        {purposeLabel}
                      </span>
                    </div>

                    {/* Location */}
                    <div style={{ padding: '14px 16px' }}>
                      <Input
                        value={loc.query}
                        readOnly
                        style={{ marginBottom: 6, borderRadius: 8, background: 'var(--color-bg-subtle)' }}
                      />
                      <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <EnvironmentOutlined style={{ color: 'var(--color-primary)', fontSize: 11 }} />
                        {loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}
                      </div>
                    </div>

                    {/* Radius controls */}
                    <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Radio.Group
                        value={loc.radiusUnit}
                        onChange={e => updateDetailsLocation(loc.id, { radiusUnit: e.target.value as RadiusUnit })}
                      >
                        <Radio value="Kilometer" style={{ fontSize: 13 }}>Kilometer</Radio>
                        <Radio value="Meter"     style={{ fontSize: 13 }}>Meter</Radio>
                      </Radio.Group>
                      <InputNumber
                        min={0.1}
                        step={0.1}
                        value={loc.radiusValue}
                        onChange={val => updateDetailsLocation(loc.id, { radiusValue: Number(val) || 0 })}
                        style={{ width: 90, borderRadius: 8 }}
                      />
                    </div>

                    {/* Delete */}
                    <div style={{ padding: '14px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Button
                        danger type="text"
                        icon={<DeleteOutlined />}
                        onClick={() => removeDetailsLocation(loc.id)}
                        style={{ borderRadius: 8 }}
                      />
                    </div>
                  </div>
                );
              })}

              {detailsSetup.locations.length === 0 && (
                <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--color-text-disabled)', fontSize: 13 }}>
                  No locations configured.
                </div>
              )}
            </Card>

            {/* ── Actions ── */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              <Button
                style={{ borderRadius: 8, minWidth: 100 }}
                onClick={() => { setConfigView('list'); setDetailsSetupId(null); }}
              >
                Reset
              </Button>
              <Button
                type="primary"
                onClick={handleUpdateDetails}
                style={{ background: 'var(--color-primary)', borderColor: 'var(--color-primary)', borderRadius: 8, minWidth: 100 }}
              >
                Update
              </Button>
            </div>
          </div>
        )}

        {/* ── History Full-Page View ──────────────────────────────────────────── */}
        {activeTab === 'configuration' && configView === 'history' && historySetup && (
          <OutstationHistoryView
            setups={setups.filter(s => s.employeeId === historySetup.employeeId)}
            allAttendance={INITIAL_ATTENDANCE}
            onBack={() => { setConfigView('list'); setHistorySetupId(null); }}
          />
        )}
      </div>
    </div>
  );
}
