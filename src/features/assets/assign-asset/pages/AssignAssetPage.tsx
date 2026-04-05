import { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Empty,
  Input,
  InputNumber,
  Modal,
  Radio,
  Select,
  Space,
  Table,
  Tag,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  SwapOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type { AssetAssignment, AssignTargetType } from '../types/assignAsset.types';
import {
  ASSET_ITEMS,
  DEPARTMENTS,
  EMPLOYEES,
  STORES,
} from '../types/assignAsset.types';

type ReassignDraft = {
  id: string;
  employeeId: string;
};

type AssetDraftItem = {
  id: string;
  store: string;
  itemGroup: string;
  itemId: string;
  itemName: string;
  qty: number;
  exchange: boolean;
  serialNo: string;
  previousSerialNo: string;
  assignAt: string;
};

const CURRENT_USER = 'Admin User';

let idCounter = 2;

const nowLabel = (): string =>
  new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

const nowInputDateTime = (): string => {
  const date = new Date();
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const formatInputDateTime = (value: string): string => {
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return value;
  return dt.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export default function AssignAssetPage() {
  const [assignTargetType, setAssignTargetType] = useState<AssignTargetType>('employee');
  const [assignEmployeeId, setAssignEmployeeId] = useState('');
  const [assignDepartment, setAssignDepartment] = useState('');
  const [assignResponsibleTo, setAssignResponsibleTo] = useState('');

  const [store, setStore] = useState('');
  const [itemGroup, setItemGroup] = useState('');
  const [itemId, setItemId] = useState('');
  const [qty, setQty] = useState<number>(1);
  const [exchange, setExchange] = useState(false);
  const [serialNo, setSerialNo] = useState('');
  const [previousSerialNo, setPreviousSerialNo] = useState('');
  const [assignAtInput, setAssignAtInput] = useState(nowInputDateTime());
  const [draftItems, setDraftItems] = useState<AssetDraftItem[]>([]);

  const [serialFilter, setSerialFilter] = useState('');
  const [viewTargetType, setViewTargetType] = useState<AssignTargetType | null>(null);
  const [viewEmployeeId, setViewEmployeeId] = useState('');
  const [viewDepartment, setViewDepartment] = useState('');

  const [assignments, setAssignments] = useState<AssetAssignment[]>([]);

  const [reassignOpen, setReassignOpen] = useState(false);
  const [reassignDraft, setReassignDraft] = useState<ReassignDraft>({
    id: '',
    employeeId: '',
  });

  const groups = useMemo(
    () => Array.from(new Set(ASSET_ITEMS.map(item => item.group))),
    [],
  );

  const filteredItemOptions = useMemo(() => {
    return ASSET_ITEMS.filter(item => {
      if (store && item.store !== store) return false;
      if (itemGroup && item.group !== itemGroup) return false;
      return true;
    });
  }, [store, itemGroup]);

  const targetLabel = useMemo(() => {
    if (assignTargetType === 'employee') {
      const employee = EMPLOYEES.find(e => e.id === assignEmployeeId);
      return employee ? `${employee.name} (${employee.id})` : '';
    }
    return assignDepartment ? `Department - ${assignDepartment}` : '';
  }, [assignTargetType, assignEmployeeId, assignDepartment]);

  const previousSerialOptions = useMemo(() => {
    const selectedItem = ASSET_ITEMS.find(item => item.id === itemId);
    if (!selectedItem) return [];

    if (assignTargetType === 'employee') {
      return assignments
        .filter(a => a.targetType === 'employee' && a.targetId === assignEmployeeId && a.itemId === selectedItem.id)
        .map(a => a.serialNo);
    }

    return assignments
      .filter(a => a.targetType === 'department' && a.targetId === assignDepartment && a.itemId === selectedItem.id)
      .map(a => a.serialNo);
  }, [assignments, assignTargetType, assignEmployeeId, assignDepartment, itemId]);

  const visibleRows = useMemo(() => {
    if (!viewTargetType) return [];

    const selectedEmployee = EMPLOYEES.find(emp => emp.id === viewEmployeeId);

    let rows = assignments.filter(row => {
      if (viewTargetType === 'employee') {
        if (!viewEmployeeId) return false;

        const employeeOwnAsset = row.targetType === 'employee' && row.targetId === viewEmployeeId;
        const departmentWiseAsset =
          row.targetType === 'department'
          && !!selectedEmployee
          && row.responsibleTo === selectedEmployee.name;

        return employeeOwnAsset || departmentWiseAsset;
      }
      if (!viewDepartment) return false;
      return row.targetType === 'department' && row.targetId === viewDepartment;
    });

    if (serialFilter.trim()) {
      const q = serialFilter.trim().toLowerCase();
      rows = rows.filter(row => row.serialNo.toLowerCase().includes(q));
    }

    return rows;
  }, [assignments, serialFilter, viewDepartment, viewEmployeeId, viewTargetType]);

  const resetAssignTo = () => {
    setAssignTargetType('employee');
    setAssignEmployeeId('');
    setAssignDepartment('');
    setAssignResponsibleTo('');
  };

  const resetViewFilters = () => {
    setViewTargetType(null);
    setViewEmployeeId('');
    setViewDepartment('');
    setSerialFilter('');
  };

  const resetItemInput = () => {
    setStore('');
    setItemGroup('');
    setItemId('');
    setQty(1);
    setExchange(false);
    setSerialNo('');
    setPreviousSerialNo('');
    setAssignAtInput(nowInputDateTime());
  };

  const resetForm = () => {
    resetAssignTo();
    resetItemInput();
    setDraftItems([]);
  };

  const validateCurrentItem = (): { ok: boolean; itemName?: string } => {
    if (!store || !itemGroup || !itemId) {
      message.error('Store, group, and item are required.');
      return { ok: false };
    }

    if (!qty || qty < 1) {
      message.error('Quantity must be at least 1.');
      return { ok: false };
    }

    // Asset-only assignment: one serial = one asset assignment.
    if (qty !== 1) {
      message.error('Asset quantity must be 1 per assignment.');
      return { ok: false };
    }

    if (!serialNo.trim()) {
      message.error('Serial number is required.');
      return { ok: false };
    }

    if (exchange && !previousSerialNo.trim()) {
      message.error('Previous serial number is required for exchange.');
      return { ok: false };
    }

    const item = ASSET_ITEMS.find(asset => asset.id === itemId);
    if (!item) {
      message.error('Selected item is invalid.');
      return { ok: false };
    }

    const duplicateInDraft = draftItems.some(row => row.serialNo.toLowerCase() === serialNo.trim().toLowerCase());
    const duplicateAssigned = assignments.some(row => row.serialNo.toLowerCase() === serialNo.trim().toLowerCase());
    if (duplicateInDraft || duplicateAssigned) {
      message.error('Serial number already assigned or added in queue.');
      return { ok: false };
    }

    return { ok: true, itemName: item.name };
  };

  const handleAddItem = () => {
    const check = validateCurrentItem();
    if (!check.ok || !check.itemName) return;

    const next: AssetDraftItem = {
      id: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      store,
      itemGroup,
      itemId,
      itemName: check.itemName,
      qty,
      exchange,
      serialNo: serialNo.trim(),
      previousSerialNo: previousSerialNo.trim(),
      assignAt: assignAtInput,
    };

    setDraftItems(prev => [...prev, next]);
    resetItemInput();
    message.success('Item added to assignment queue.');
  };

  const removeDraftItem = (id: string) => {
    setDraftItems(prev => prev.filter(row => row.id !== id));
  };

  const handleAssign = () => {
    if (assignTargetType === 'employee' && !assignEmployeeId) {
      message.error('Please select employee.');
      return;
    }

    if (assignTargetType === 'department' && !assignDepartment) {
      message.error('Please select department.');
      return;
    }

    if (assignTargetType === 'department' && !assignResponsibleTo) {
      message.error('Responsible person is required for department assignment.');
      return;
    }

    if (!draftItems.length) {
      message.error('Add at least one item using Add Item button.');
      return;
    }

    const workingAssignments = [...assignments];
    const newRows: AssetAssignment[] = [];

    for (const draft of draftItems) {
      const duplicateSerial = workingAssignments.some(row => row.serialNo.toLowerCase() === draft.serialNo.toLowerCase())
        || newRows.some(row => row.serialNo.toLowerCase() === draft.serialNo.toLowerCase());
      if (duplicateSerial) {
        message.error(`Serial already exists: ${draft.serialNo}`);
        return;
      }

      if (draft.exchange) {
        const prevIdx = workingAssignments.findIndex(row => row.serialNo.toLowerCase() === draft.previousSerialNo.toLowerCase());
        if (prevIdx === -1) {
          message.error(`Previous serial not found: ${draft.previousSerialNo}`);
          return;
        }
        workingAssignments.splice(prevIdx, 1);
      }

      idCounter += 1;
      newRows.push({
        id: `asg-${idCounter}`,
        targetType: assignTargetType,
        targetId: assignTargetType === 'employee' ? assignEmployeeId : assignDepartment,
        targetLabel,
        itemId: draft.itemId,
        itemName: draft.itemName,
        qty: draft.qty,
        serialNo: draft.serialNo,
        assignedBy: CURRENT_USER,
        assignedAt: formatInputDateTime(draft.assignAt),
        responsibleTo: assignTargetType === 'department' ? assignResponsibleTo : undefined,
      });
    }

    setAssignments([...newRows, ...workingAssignments]);
    message.success('Asset(s) assigned successfully.');

    if (assignTargetType === 'employee') {
      setViewTargetType('employee');
      setViewEmployeeId(assignEmployeeId);
    } else {
      setViewTargetType('department');
      setViewDepartment(assignDepartment);
    }

    resetAssignTo();
    resetItemInput();
    setDraftItems([]);
  };

  const removeAssignment = (id: string) => {
    setAssignments(prev => prev.filter(row => row.id !== id));
    message.success('Assignment removed.');
  };

  const openReassign = (row: AssetAssignment) => {
    if (row.targetType !== 'department') {
      return;
    }
    setReassignDraft({
      id: row.id,
      employeeId: '',
    });
    setReassignOpen(true);
  };

  const confirmReassign = () => {
    const row = assignments.find(r => r.id === reassignDraft.id);
    if (!row) return;

    if (!reassignDraft.employeeId) {
      message.error('Please select employee to reassign.');
      return;
    }
    const employee = EMPLOYEES.find(e => e.id === reassignDraft.employeeId);
    if (!employee) {
      message.error('Selected employee is invalid.');
      return;
    }

    setAssignments(prev => prev.map(r => {
      if (r.id !== reassignDraft.id) return r;
      return {
        ...r,
        targetType: 'employee',
        targetId: reassignDraft.employeeId,
        targetLabel: `${employee.name} (${employee.id})`,
        responsibleTo: undefined,
        assignedBy: CURRENT_USER,
        assignedAt: nowLabel(),
      };
    }));

    setReassignOpen(false);
    message.success('Asset reassigned successfully.');
  };

  const columns: ColumnsType<AssetAssignment> = [
    {
      title: 'Assign For',
      dataIndex: 'targetType',
      key: 'targetType',
      width: 120,
      render: value => value === 'employee' ? <Tag color="blue">Employee</Tag> : <Tag color="purple">Department</Tag>,
    },
    { title: 'Item Name', dataIndex: 'itemName', key: 'itemName', width: 180 },
    { title: 'QTY', dataIndex: 'qty', key: 'qty', width: 80, align: 'center' },
    { title: 'Serial Number', dataIndex: 'serialNo', key: 'serialNo', width: 160 },
    { title: 'Assign By', dataIndex: 'assignedBy', key: 'assignedBy', width: 130 },
    { title: 'Assign At', dataIndex: 'assignedAt', key: 'assignedAt', width: 170 },
    {
      title: 'Responsible To',
      dataIndex: 'responsibleTo',
      key: 'responsibleTo',
      width: 180,
      render: value => value || '--',
    },
    {
      title: 'Action',
      key: 'action',
      width: 160,
      render: (_, row) => (
        <Space size={8}>
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => removeAssignment(row.id)}>
            Remove
          </Button>
          {row.targetType === 'department' && (
            <Button size="small" icon={<ReloadOutlined />} onClick={() => openReassign(row)}>
              Reassign
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const employeeViewOptions = EMPLOYEES.map(emp => ({
    value: emp.id,
    label: `${emp.name} (${emp.id}) - ${emp.designation}`,
  }));

  const responsibleOptions = EMPLOYEES
    .filter(emp => !assignDepartment || emp.department === assignDepartment)
    .map(emp => ({ value: emp.name, label: `${emp.name} (${emp.id})` }));

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: 24, background: 'var(--color-bg-base)' }}>
      <div className="page-header-row">
        <div>
          <h1>Asset Assignment</h1>
          <p>Assign, exchange, remove, and reassign asset items for employees and departments</p>
        </div>
      </div>

      <Card style={panelStyle} bodyStyle={{ padding: 18 }}>
        <div style={sectionTitle}>Assign To</div>
        <div style={responsiveFormGrid}>
          <div>
            <div style={labelStyle}>Target Type*</div>
            <Radio.Group
              value={assignTargetType}
              onChange={e => {
                const next = e.target.value as AssignTargetType;
                setAssignTargetType(next);
                setAssignEmployeeId('');
                setAssignDepartment('');
                setAssignResponsibleTo('');
              }}
            >
              <Radio.Button value="employee">Employee</Radio.Button>
              <Radio.Button value="department">Department</Radio.Button>
            </Radio.Group>
          </div>

          {assignTargetType === 'employee' ? (
            <div>
              <div style={labelStyle}>Employee*</div>
              <Select
                showSearch
                style={{ width: '100%' }}
                value={assignEmployeeId || undefined}
                onChange={setAssignEmployeeId}
                placeholder="Search by employee name or ID"
                filterOption={(input, option) =>
                  (option?.label as string).toLowerCase().includes(input.toLowerCase())
                }
                options={employeeViewOptions}
              />
            </div>
          ) : (
            <>
              <div>
                <div style={labelStyle}>Department*</div>
                <Select
                  style={{ width: '100%' }}
                  value={assignDepartment || undefined}
                  onChange={v => {
                    setAssignDepartment(v);
                    setAssignResponsibleTo('');
                  }}
                  placeholder="Select department"
                  options={DEPARTMENTS.map(dep => ({ value: dep, label: dep }))}
                />
              </div>
              <div>
                <div style={labelStyle}>Responsible To*</div>
                <Select
                  showSearch
                  style={{ width: '100%' }}
                  value={assignResponsibleTo || undefined}
                  onChange={setAssignResponsibleTo}
                  placeholder="Select responsible person"
                  filterOption={(input, option) =>
                    (option?.label as string).toLowerCase().includes(input.toLowerCase())
                  }
                  options={responsibleOptions}
                />
              </div>
            </>
          )}
        </div>

        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={resetAssignTo}>Reset</Button>
        </div>

        <div style={{ borderTop: '1px solid var(--color-border)', margin: '16px 0' }} />

        <div style={sectionTitle}>Asset Assignment</div>
        <div style={assetFormGrid}>
          <div>
            <div style={labelStyle}>Select Store*</div>
            <Select
              style={{ width: '100%' }}
              value={store || undefined}
              onChange={v => {
                setStore(v);
                setItemId('');
              }}
              placeholder="Select store"
              options={STORES.map(value => ({ value, label: value }))}
            />
          </div>
          <div>
            <div style={labelStyle}>Select Group*</div>
            <Select
              style={{ width: '100%' }}
              value={itemGroup || undefined}
              onChange={v => {
                setItemGroup(v);
                setItemId('');
              }}
              placeholder="Select group"
              options={groups.map(value => ({ value, label: value }))}
            />
          </div>
          <div>
            <div style={labelStyle}>Select Items*</div>
            <Select
              showSearch
              style={{ width: '100%' }}
              value={itemId || undefined}
              onChange={setItemId}
              placeholder="Select asset item"
              filterOption={(input, option) =>
                (option?.label as string).toLowerCase().includes(input.toLowerCase())
              }
              options={filteredItemOptions.map(asset => ({
                value: asset.id,
                label: `${asset.name} (${asset.group})`,
              }))}
            />
          </div>
          <div>
            <div style={labelStyle}>Quantity*</div>
            <InputNumber min={1} max={1} style={{ width: '100%' }} value={qty} onChange={v => setQty(Number(v || 1))} />
          </div>
          <div>
            <div style={labelStyle}>Exchange</div>
            <Radio.Group value={exchange ? 'yes' : 'no'} onChange={e => setExchange(e.target.value === 'yes')}>
              <Radio.Button value="no">No</Radio.Button>
              <Radio.Button value="yes">Yes</Radio.Button>
            </Radio.Group>
          </div>
          <div>
            <div style={labelStyle}>Serial No*</div>
            <Input value={serialNo} onChange={e => setSerialNo(e.target.value)} placeholder="Enter serial number" />
          </div>
          <div>
            <div style={labelStyle}>Previous Serial No*</div>
            <Select
              showSearch
              style={{ width: '100%' }}
              value={previousSerialNo || undefined}
              onChange={setPreviousSerialNo}
              placeholder={exchange ? 'Select previous serial' : 'Not required'}
              disabled={!exchange}
              options={previousSerialOptions.map(value => ({ value, label: value }))}
            />
          </div>
          <div>
            <div style={labelStyle}>Assign Date & Time*</div>
            <Input type="datetime-local" value={assignAtInput} onChange={e => setAssignAtInput(e.target.value)} />
          </div>
        </div>

        <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
          <Button icon={<PlusOutlined />} onClick={handleAddItem}>
            Add Item
          </Button>
          <Button onClick={resetForm}>Reset All</Button>
          <Button type="primary" icon={<SwapOutlined />} onClick={handleAssign}>
            Assign
          </Button>
        </div>

        <div style={{ marginTop: 14 }}>
          <Table
            rowKey="id"
            size="small"
            dataSource={draftItems}
            pagination={false}
            scroll={{ x: 980 }}
            locale={{ emptyText: 'No item added yet. Use Add Item to queue multiple assets.' }}
            columns={[
              { title: 'Store', dataIndex: 'store', key: 'store', width: 120 },
              { title: 'Group', dataIndex: 'itemGroup', key: 'itemGroup', width: 130 },
              { title: 'Item', dataIndex: 'itemName', key: 'itemName', width: 180 },
              { title: 'QTY', dataIndex: 'qty', key: 'qty', width: 70, align: 'center' },
              {
                title: 'Exchange',
                dataIndex: 'exchange',
                key: 'exchange',
                width: 100,
                render: value => value ? 'Yes' : 'No',
              },
              { title: 'Serial No', dataIndex: 'serialNo', key: 'serialNo', width: 150 },
              { title: 'Previous Serial', dataIndex: 'previousSerialNo', key: 'previousSerialNo', width: 160, render: value => value || '--' },
              { title: 'Assign At', dataIndex: 'assignAt', key: 'assignAt', width: 170, render: value => formatInputDateTime(value) },
              {
                title: 'Action',
                key: 'action',
                width: 90,
                render: (_, row) => (
                  <Button size="small" danger icon={<DeleteOutlined />} onClick={() => removeDraftItem(row.id)}>
                    Remove
                  </Button>
                ),
              },
            ]}
          />
        </div>
      </Card>

      <Card style={panelStyle} bodyStyle={{ padding: 18 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end', marginBottom: 12 }}>
          <div style={{ minWidth: 180 }}>
            <div style={labelStyle}>View Data For</div>
            <Select
              value={viewTargetType ?? undefined}
              onChange={v => {
                setViewTargetType(v as AssignTargetType);
                setViewEmployeeId('');
                setViewDepartment('');
              }}
              placeholder="Select type"
              options={[
                { value: 'employee', label: 'Employee' },
                { value: 'department', label: 'Department' },
              ]}
            />
          </div>

          {viewTargetType === 'employee' && (
            <div style={{ minWidth: 280 }}>
              <div style={labelStyle}>Employee (Own + Department Wise Responsible)</div>
              <Select
                showSearch
                value={viewEmployeeId || undefined}
                onChange={setViewEmployeeId}
                placeholder="Search employee"
                filterOption={(input, option) =>
                  (option?.label as string).toLowerCase().includes(input.toLowerCase())
                }
                options={employeeViewOptions}
              />
            </div>
          )}

          {viewTargetType === 'department' && (
            <div style={{ minWidth: 220 }}>
              <div style={labelStyle}>Department</div>
              <Select
                value={viewDepartment || undefined}
                onChange={setViewDepartment}
                placeholder="Select department"
                options={DEPARTMENTS.map(dep => ({ value: dep, label: dep }))}
              />
            </div>
          )}

          <div style={{ minWidth: 220 }}>
            <div style={labelStyle}>Serial Number</div>
            <Input
              prefix={<SearchOutlined style={{ color: 'var(--color-text-tertiary)' }} />}
              placeholder="Filter by serial"
              value={serialFilter}
              onChange={e => setSerialFilter(e.target.value)}
            />
          </div>

          <Button onClick={resetViewFilters}>Reset</Button>
        </div>

        {!viewTargetType || (viewTargetType === 'employee' && !viewEmployeeId) || (viewTargetType === 'department' && !viewDepartment) ? (
          <div style={emptyWrap}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No data visible by default. Select employee or department to view assigned assets."
            />
          </div>
        ) : (
          <Table
            rowKey="id"
            dataSource={visibleRows}
            columns={columns}
            pagination={{ pageSize: 8 }}
            scroll={{ x: 1200 }}
            locale={{ emptyText: 'No assigned asset found for the selected filter.' }}
          />
        )}
      </Card>

      <Modal
        title="Reassign Asset"
        open={reassignOpen}
        onCancel={() => setReassignOpen(false)}
        onOk={confirmReassign}
        okText="Confirm Reassign"
      >
        <div style={{ display: 'grid', gap: 12 }}>
          <div>
            <div style={labelStyle}>Employee*</div>
            <Select
              showSearch
              style={{ width: '100%' }}
              value={reassignDraft.employeeId || undefined}
              onChange={v => setReassignDraft(prev => ({ ...prev, employeeId: v }))}
              placeholder="Select employee"
              filterOption={(input, option) =>
                (option?.label as string).toLowerCase().includes(input.toLowerCase())
              }
              options={employeeViewOptions}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  marginBottom: 16,
  borderRadius: 14,
  border: '1px solid #dbeafe',
  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
};

const sectionTitle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  color: '#0f172a',
  marginBottom: 10,
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: 'var(--color-text-secondary)',
  marginBottom: 6,
};

const responsiveFormGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: 12,
};

const assetFormGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: 12,
};

const emptyWrap: React.CSSProperties = {
  border: '1px dashed #cbd5e1',
  borderRadius: 12,
  padding: 24,
  background: 'var(--color-bg-subtle)',
};
