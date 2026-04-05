import { useMemo, useState } from 'react';
import {
  Button,
  Checkbox,
  Input,
  InputNumber,
  Select,
  Table,
  Tag,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined,
  DeleteOutlined,
  SearchOutlined,
  SwapOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import type {
  AssignmentLine,
  AssignedAsset,
  CatalogItem,
  DemandRequest,
  DemandStatus,
} from '../types/demand.types';
import {
  CATALOG_ITEMS,
  CURRENT_USER_ID,
  DEPARTMENTS,
  EMPLOYEES,
  INITIAL_ASSIGNED_ASSETS,
  INITIAL_DEMANDS,
  ITEM_GROUPS,
  SECTION_BY_DEPARTMENT,
  STORES,
} from '../types/demand.types';

type Tab = 'my-demand' | 'approvals';
type FullView = 'list' | 'create' | 'review' | 'assign';

type LineDraft = {
  id: string;
  itemGroup: string;
  itemId: string;
  qty: number;
  remarks: string;
  exchange: boolean;
};

type AssignDraftRow = {
  demandLineId: string;
  selected: boolean;
  assignedQty: number;
  previousSerialNo: string;
  newSerialNo: string;
};

const STATUS_COLOR: Record<DemandStatus, string> = {
  'To Approve': 'gold',
  Approved: 'green',
  Rejected: 'red',
  Assigned: 'blue',
};

let demandNoCounter = 20032027;

const newLine = (): LineDraft => ({
  id: `line-${Math.random().toString(36).slice(2, 9)}`,
  itemGroup: '',
  itemId: '',
  qty: 1,
  remarks: '',
  exchange: false,
});

const nowDateTimeInput = (): string => {
  const date = new Date();
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const formatDateTimeLabel = (value: string): string => {
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

const today = (): string => new Date().toISOString().slice(0, 10);

const nowLabel = (): string =>
  new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

const asDateLabel = (isoDate: string): string => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function DemandPage() {
  const currentEmployee = EMPLOYEES.find(e => e.id === CURRENT_USER_ID)!;

  const [activeTab, setActiveTab] = useState<Tab>('my-demand');
  const [view, setView] = useState<FullView>('list');

  const [demands, setDemands] = useState<DemandRequest[]>(INITIAL_DEMANDS);
  const [assignedAssets, setAssignedAssets] = useState<AssignedAsset[]>(INITIAL_ASSIGNED_ASSETS);

  const [selectedDemandId, setSelectedDemandId] = useState<string | null>(null);
  const [isReadOnlyReview, setIsReadOnlyReview] = useState(false);

  const [approvalRemarks, setApprovalRemarks] = useState('');
  const [rejectRemarks, setRejectRemarks] = useState('');

  const [assignRows, setAssignRows] = useState<AssignDraftRow[]>([]);
  const [assignDateTime, setAssignDateTime] = useState(nowDateTimeInput());

  const [fDemandNo, setFDemandNo] = useState('');
  const [fStore, setFStore] = useState('');
  const [fStatus, setFStatus] = useState('');

  const [createNeededDate, setCreateNeededDate] = useState(today());
  const [createStore, setCreateStore] = useState<string>('USBA');
  const [createForDepartment, setCreateForDepartment] = useState(false);
  const [createDepartment, setCreateDepartment] = useState(currentEmployee.department);
  const [createSection, setCreateSection] = useState(currentEmployee.section);
  const [createEmployeeId, setCreateEmployeeId] = useState(currentEmployee.id);
  const [createLines, setCreateLines] = useState<LineDraft[]>([newLine()]);

  const selectedDemand = useMemo(
    () => demands.find(d => d.id === selectedDemandId) ?? null,
    [demands, selectedDemandId],
  );

  const targetEmployeeForCreate = useMemo(
    () => EMPLOYEES.find(e => e.id === createEmployeeId) ?? currentEmployee,
    [createEmployeeId, currentEmployee],
  );

  const sections = SECTION_BY_DEPARTMENT[createDepartment] ?? [];

  const employeeOptions = useMemo(() => {
    if (!createForDepartment) return [currentEmployee];
    return EMPLOYEES.filter(e => e.department === createDepartment && (!createSection || e.section === createSection));
  }, [createDepartment, createForDepartment, createSection, currentEmployee]);

  const demandLinesWithCatalog = (request: DemandRequest) =>
    request.lines.map(line => ({
      line,
      item: CATALOG_ITEMS.find(it => it.id === line.itemId),
    }));

  const myDemandRows = useMemo(
    () => demands.filter(d => d.requestedBy === currentEmployee.name),
    [demands, currentEmployee.name],
  );

  const filteredMyDemandRows = useMemo(() => {
    return myDemandRows.filter(row => {
      if (fDemandNo && !row.demandNo.toLowerCase().includes(fDemandNo.toLowerCase())) return false;
      if (fStore && row.store !== fStore) return false;
      if (fStatus && row.status !== fStatus) return false;
      return true;
    });
  }, [myDemandRows, fDemandNo, fStore, fStatus]);

  const filteredApprovalRows = useMemo(() => {
    return demands.filter(row => {
      if (fDemandNo && !row.demandNo.toLowerCase().includes(fDemandNo.toLowerCase())) return false;
      if (fStore && row.store !== fStore) return false;
      if (fStatus && row.status !== fStatus) return false;
      return true;
    });
  }, [demands, fDemandNo, fStore, fStatus]);

  const openCreate = () => {
    setView('create');
    setCreateNeededDate(today());
    setCreateStore('USBA');
    setCreateForDepartment(false);
    setCreateDepartment(currentEmployee.department);
    setCreateSection(currentEmployee.section);
    setCreateEmployeeId(currentEmployee.id);
    setCreateLines([newLine()]);
  };

  const openReview = (request: DemandRequest, readOnly: boolean) => {
    setSelectedDemandId(request.id);
    setIsReadOnlyReview(readOnly);
    setApprovalRemarks(request.approvalRemarks ?? '');
    setRejectRemarks(request.rejectionRemarks ?? '');
    setView('review');
  };

  const openAssign = (request: DemandRequest) => {
    const rows: AssignDraftRow[] = request.lines.map(line => ({
      demandLineId: line.id,
      selected: true,
      assignedQty: line.qty,
      previousSerialNo: '',
      newSerialNo: '',
    }));
    setAssignRows(rows);
    setAssignDateTime(nowDateTimeInput());
    setSelectedDemandId(request.id);
    setView('assign');
  };

  const goList = () => {
    setView('list');
    setSelectedDemandId(null);
    setIsReadOnlyReview(false);
    setApprovalRemarks('');
    setRejectRemarks('');
    setAssignRows([]);
    setAssignDateTime(nowDateTimeInput());
  };

  const getItem = (itemId: string): CatalogItem | undefined => CATALOG_ITEMS.find(i => i.id === itemId);

  const getEmployeeAssets = (employeeId: string): AssignedAsset[] =>
    assignedAssets.filter(a => a.employeeId === employeeId);

  const canExchange = (employeeId: string, itemId: string): boolean => {
    const item = getItem(itemId);
    if (!item || item.type !== 'asset') return false;
    return assignedAssets.some(a => a.employeeId === employeeId && a.itemId === itemId);
  };

  const updateCreateLine = (lineId: string, patch: Partial<LineDraft>) => {
    setCreateLines(prev => prev.map(line => {
      if (line.id !== lineId) return line;
      const next = { ...line, ...patch };
      if (patch.itemId !== undefined && !canExchange(createEmployeeId, next.itemId)) {
        next.exchange = false;
      }
      return next;
    }));
  };

  const addCreateLine = () => setCreateLines(prev => [...prev, newLine()]);

  const removeCreateLine = (lineId: string) =>
    setCreateLines(prev => (prev.length === 1 ? prev : prev.filter(line => line.id !== lineId)));

  const createDemand = () => {
    if (!createNeededDate) {
      message.error('Date of material needed is required.');
      return;
    }
    if (!createStore) {
      message.error('Store is required.');
      return;
    }
    if (!createEmployeeId) {
      message.error('Employee is required.');
      return;
    }

    for (const line of createLines) {
      if (!line.itemGroup) {
        message.error('Please select item group for all rows.');
        return;
      }
      if (!line.itemId) {
        message.error('Please select item for all rows.');
        return;
      }
      if (!line.qty || line.qty < 1) {
        message.error('Quantity must be at least 1.');
        return;
      }
      if (line.exchange && !canExchange(createEmployeeId, line.itemId)) {
        message.error('Exchange is allowed only for assigned asset items.');
        return;
      }
    }

    demandNoCounter += 1;
    const request: DemandRequest = {
      id: `dmd-${Date.now()}`,
      demandNo: `${demandNoCounter}xx`,
      createdAt: nowLabel(),
      neededDate: asDateLabel(createNeededDate),
      store: createStore,
      requestedBy: currentEmployee.name,
      employeeId: createEmployeeId,
      requestFor: createForDepartment ? 'department' : 'self',
      targetDepartment: createForDepartment ? createDepartment : undefined,
      targetSection: createForDepartment ? createSection : undefined,
      lines: createLines.map(line => ({
        id: line.id,
        itemGroup: line.itemGroup,
        itemId: line.itemId,
        qty: line.qty,
        remarks: line.remarks,
        exchange: line.exchange,
      })),
      status: 'To Approve',
    };

    setDemands(prev => [request, ...prev]);
    message.success(`Demand ${request.demandNo} created.`);
    goList();
  };

  const cancelRequest = (requestId: string) => {
    setDemands(prev => prev.map(row => (row.id === requestId ? { ...row, status: 'Rejected', rejectionRemarks: 'Cancelled by requester' } : row)));
    message.success('Request cancelled.');
  };

  const approveRequest = () => {
    if (!selectedDemand) return;
    setDemands(prev => prev.map(row => (row.id === selectedDemand.id ? { ...row, status: 'Approved', approvalRemarks: approvalRemarks.trim() } : row)));
    message.success('Demand approved.');
    goList();
  };

  const rejectRequest = () => {
    if (!selectedDemand) return;
    if (!rejectRemarks.trim()) {
      message.error('Remarks is mandatory for rejection.');
      return;
    }
    setDemands(prev => prev.map(row => (row.id === selectedDemand.id ? { ...row, status: 'Rejected', rejectionRemarks: rejectRemarks.trim() } : row)));
    message.success('Demand rejected.');
    goList();
  };

  const updateAssignRow = (lineId: string, patch: Partial<AssignDraftRow>) => {
    setAssignRows(prev => prev.map(row => row.demandLineId === lineId ? { ...row, ...patch } : row));
  };

  const submitAssignment = () => {
    if (!selectedDemand) return;

    const selectedRows = assignRows.filter(row => row.selected && row.assignedQty > 0);
    if (!selectedRows.length) {
      message.error('Select at least one item to assign.');
      return;
    }

    const errors: string[] = [];

    if (!assignDateTime) {
      message.error('Assign date and time is required.');
      return;
    }

    selectedRows.forEach(row => {
      const demandLine = selectedDemand.lines.find(line => line.id === row.demandLineId);
      if (!demandLine) return;
      const item = getItem(demandLine.itemId);
      if (!item) return;

      if (row.assignedQty > demandLine.qty) {
        errors.push(`${item.name}: assign qty cannot exceed demand qty.`);
      }

      if (item.type === 'asset') {
        if (row.assignedQty !== 1) {
          errors.push(`${item.name}: asset assign qty must be 1.`);
        }
        if (!row.newSerialNo.trim()) {
          errors.push(`${item.name}: new serial number is required.`);
        }
        if (demandLine.exchange && !row.previousSerialNo.trim()) {
          errors.push(`${item.name}: previous serial number is required for exchange.`);
        }
      }
    });

    if (errors.length) {
      message.error(errors[0]);
      return;
    }

    const assignment: AssignmentLine[] = selectedRows.map(row => {
      const demandLine = selectedDemand.lines.find(line => line.id === row.demandLineId)!;
      const item = getItem(demandLine.itemId)!;
      return {
        demandLineId: row.demandLineId,
        itemId: demandLine.itemId,
        assignedQty: row.assignedQty,
        assignedAt: formatDateTimeLabel(assignDateTime),
        newSerialNo: item.type === 'asset' ? row.newSerialNo.trim() : undefined,
        previousSerialNo: demandLine.exchange ? row.previousSerialNo.trim() : undefined,
      };
    });

    setDemands(prev => prev.map(row => row.id === selectedDemand.id ? { ...row, status: 'Assigned', assignment } : row));

    setAssignedAssets(prev => {
      let next = [...prev];
      assignment.forEach(assign => {
        const demandLine = selectedDemand.lines.find(line => line.id === assign.demandLineId);
        const item = demandLine ? getItem(demandLine.itemId) : undefined;
        if (!item || item.type !== 'asset' || !assign.newSerialNo) return;

        if (demandLine?.exchange && assign.previousSerialNo) {
          next = next.filter(asset => !(asset.employeeId === selectedDemand.employeeId && asset.itemId === item.id && asset.serialNo === assign.previousSerialNo));
        }

        next.push({
          employeeId: selectedDemand.employeeId,
          itemId: item.id,
          itemName: item.name,
          serialNo: assign.newSerialNo,
          assignedAt: assign.assignedAt,
        });
      });
      return next;
    });

    message.success('Items assigned successfully.');
    goList();
  };

  const previousDemands = useMemo(() => {
    if (!selectedDemand) return [];
    return demands.filter(d => d.employeeId === selectedDemand.employeeId && d.id !== selectedDemand.id);
  }, [demands, selectedDemand]);

  const selectedEmployeeAssets = useMemo(() => {
    if (!selectedDemand) return [];
    return assignedAssets.filter(asset => asset.employeeId === selectedDemand.employeeId);
  }, [selectedDemand, assignedAssets]);

  const myDemandColumns: ColumnsType<DemandRequest> = [
    {
      title: 'Demand No',
      dataIndex: 'demandNo',
      key: 'demandNo',
      render: (_, row) => <strong>{row.demandNo}</strong>,
    },
    { title: 'Store', dataIndex: 'store', key: 'store' },
    {
      title: 'Item / QTY',
      key: 'itemQty',
      render: (_, row) => `${row.lines.length}/${row.lines.reduce((sum, line) => sum + line.qty, 0)}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_, row) => <Tag color={STATUS_COLOR[row.status]}>{row.status}</Tag>,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={() => openReview(row, true)}
            style={textButton}
          >
            View
          </button>
          {row.status === 'To Approve' && (
            <button
              onClick={() => cancelRequest(row.id)}
              style={{ ...textButton, color: '#dc2626' }}
            >
              Cancel request
            </button>
          )}
        </div>
      ),
    },
  ];

  const approvalColumns: ColumnsType<DemandRequest> = [
    { title: 'Demand No', dataIndex: 'demandNo', key: 'demandNo', render: (_, row) => <strong>{row.demandNo}</strong> },
    {
      title: 'Employee',
      key: 'employee',
      render: (_, row) => {
        const employee = EMPLOYEES.find(e => e.id === row.employeeId);
        return (
          <div>
            <div style={{ fontWeight: 600 }}>{employee?.name ?? row.employeeId}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>{employee?.department} | {employee?.designation}</div>
          </div>
        );
      },
    },
    { title: 'Store', dataIndex: 'store', key: 'store' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_, row) => <Tag color={STATUS_COLOR[row.status]}>{row.status}</Tag>,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button onClick={() => openReview(row, row.status !== 'To Approve')} style={textButton}>
            View
          </button>
          {row.status === 'To Approve' && (
            <button onClick={() => openReview(row, false)} style={textButton}>
              Approve/Reject
            </button>
          )}
          {row.status === 'Approved' && (
            <button onClick={() => openAssign(row)} style={textButton}>
              Assign
            </button>
          )}
        </div>
      ),
    },
  ];

  const pendingCount = demands.filter(d => d.status === 'To Approve').length;

  const createAssignedAssetRows = getEmployeeAssets(targetEmployeeForCreate.id);

  return (
    <div style={{ height: '100%', overflow: 'hidden', background: 'var(--color-bg-subtle)' }}>
      {view === 'list' && (
        <div style={{ height: '100%', overflowY: 'auto' }}>
          <div className="page-header-row" style={{ padding: '20px 24px 0' }}>
            <div>
              <h1>Demand Management</h1>
              <p>Create demand, review approvals, and assign assets with exchange controls</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={tabButton(activeTab === 'my-demand')} onClick={() => setActiveTab('my-demand')}>My Demand</button>
              <button style={tabButton(activeTab === 'approvals')} onClick={() => setActiveTab('approvals')}>
                Approvals {pendingCount > 0 ? `(${pendingCount})` : ''}
              </button>
            </div>
          </div>

          <div style={listPanel}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
              <Input
                placeholder="Demand No"
                value={fDemandNo}
                onChange={e => setFDemandNo(e.target.value)}
                prefix={<SearchOutlined style={{ color: 'var(--color-text-tertiary)' }} />}
                style={{ width: 170 }}
              />
              <Select
                placeholder="Store"
                value={fStore || undefined}
                onChange={v => setFStore(v ?? '')}
                options={STORES.map(s => ({ value: s, label: s }))}
                allowClear
                style={{ width: 170 }}
              />
              <Select
                placeholder="Status"
                value={fStatus || undefined}
                onChange={v => setFStatus(v ?? '')}
                options={['To Approve', 'Approved', 'Rejected', 'Assigned'].map(s => ({ value: s, label: s }))}
                allowClear
                style={{ width: 170 }}
              />
              <Button onClick={() => { setFDemandNo(''); setFStore(''); setFStatus(''); }}>Reset</Button>
              {activeTab === 'my-demand' && (
                <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                  Create
                </Button>
              )}
            </div>

            {activeTab === 'my-demand' ? (
              <Table
                rowKey="id"
                dataSource={filteredMyDemandRows}
                columns={myDemandColumns}
                pagination={{ pageSize: 8 }}
                style={tableCardStyle}
              />
            ) : (
              <Table
                rowKey="id"
                dataSource={filteredApprovalRows}
                columns={approvalColumns}
                pagination={{ pageSize: 8 }}
                style={tableCardStyle}
              />
            )}
          </div>
        </div>
      )}

      {view === 'create' && (
        <div style={{ height: '100%', overflowY: 'auto', padding: 24 }}>
          <div style={fullPageCard}>
            <div style={fullPageHeader}>
              <div>
                <h2 style={{ margin: 0, fontSize: 28 }}>New Demand</h2>
                <p style={{ margin: '6px 0 0', color: 'var(--color-text-tertiary)' }}>Create demand for self or for department. Exchange is available only for already assigned assets.</p>
              </div>
              <Button onClick={goList}>Back to List</Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
              <div>
                <div style={formGrid}>
                  <div>
                    <div style={label}>Date of Material Needed*</div>
                    <Input type="date" value={createNeededDate} onChange={e => setCreateNeededDate(e.target.value)} />
                  </div>
                  <div>
                    <div style={label}>Select Store*</div>
                    <Select style={fullWidthControl} value={createStore} onChange={setCreateStore} options={STORES.map(s => ({ value: s, label: s }))} />
                  </div>
                </div>

                <div style={{ marginTop: 12, marginBottom: 12 }}>
                  <Checkbox
                    checked={createForDepartment}
                    onChange={e => {
                      const next = e.target.checked;
                      setCreateForDepartment(next);
                      if (!next) {
                        setCreateDepartment(currentEmployee.department);
                        setCreateSection(currentEmployee.section);
                        setCreateEmployeeId(currentEmployee.id);
                      }
                    }}
                  >
                    For Department
                  </Checkbox>
                </div>

                {createForDepartment && (
                  <div style={formGrid}>
                    <div>
                      <div style={label}>Department</div>
                      <Select
                        style={fullWidthControl}
                        value={createDepartment}
                        onChange={v => {
                          setCreateDepartment(v);
                          const nextSection = (SECTION_BY_DEPARTMENT[v] ?? [])[0] ?? '';
                          setCreateSection(nextSection);
                        }}
                        options={DEPARTMENTS.map(d => ({ value: d, label: d }))}
                      />
                    </div>
                    <div>
                      <div style={label}>Section</div>
                      <Select
                        style={fullWidthControl}
                        value={createSection}
                        onChange={setCreateSection}
                        options={sections.map(s => ({ value: s, label: s }))}
                      />
                    </div>
                  </div>
                )}

                <div style={{ marginTop: 12 }}>
                  <div style={label}>Employee*</div>
                  <Select
                    showSearch
                    style={fullWidthControl}
                    value={createEmployeeId}
                    onChange={setCreateEmployeeId}
                    filterOption={(input, option) => (option?.label as string).toLowerCase().includes(input.toLowerCase())}
                    options={employeeOptions.map(emp => ({
                      value: emp.id,
                      label: `${emp.name} (${emp.id}) - ${emp.designation}`,
                    }))}
                  />
                </div>

                <div style={{ marginTop: 18, overflowX: 'auto' }}>
                  <div style={{ ...label, marginBottom: 10 }}>Demand Items*</div>
                  <div style={{ minWidth: 820, display: 'grid', gridTemplateColumns: '1fr 1.8fr 0.7fr 0.6fr 1.2fr 40px', gap: 8, marginBottom: 8, color: 'var(--color-text-tertiary)', fontSize: 12, fontWeight: 600 }}>
                    <div>Group</div>
                    <div>Item</div>
                    <div>Qty</div>
                    <div>Exchange</div>
                    <div>Remarks</div>
                    <div />
                  </div>
                  {createLines.map(line => {
                    const item = getItem(line.itemId);
                    const exchangeAllowed = canExchange(createEmployeeId, line.itemId);
                    const targetAssets = getEmployeeAssets(createEmployeeId).filter(asset => asset.itemId === line.itemId);
                    return (
                      <div key={line.id} style={{ minWidth: 820, display: 'grid', gridTemplateColumns: '1fr 1.8fr 0.7fr 0.6fr 1.2fr 40px', gap: 8, marginBottom: 10 }}>
                        <Select
                          style={fullWidthControl}
                          placeholder="Select group"
                          value={line.itemGroup || undefined}
                          onChange={v => updateCreateLine(line.id, { itemGroup: v })}
                          options={ITEM_GROUPS.map(group => ({ value: group, label: group }))}
                        />
                        <Select
                          showSearch
                          style={fullWidthControl}
                          placeholder="Select item"
                          value={line.itemId || undefined}
                          filterOption={(input, option) => (option?.label as string).toLowerCase().includes(input.toLowerCase())}
                          onChange={v => updateCreateLine(line.id, { itemId: v })}
                          options={CATALOG_ITEMS.map(it => ({
                            value: it.id,
                            label: `${it.name} (${it.type === 'asset' ? 'Asset' : 'Item'})`,
                          }))}
                        />
                        <InputNumber min={1} value={line.qty} onChange={v => updateCreateLine(line.id, { qty: Number(v || 1) })} style={fullWidthControl} />
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Checkbox
                            checked={line.exchange}
                            disabled={!exchangeAllowed}
                            onChange={e => updateCreateLine(line.id, { exchange: e.target.checked })}
                          />
                        </div>
                        <Input
                          placeholder="Remarks"
                          value={line.remarks}
                          onChange={e => updateCreateLine(line.id, { remarks: e.target.value })}
                        />
                        <Button
                          icon={<DeleteOutlined />}
                          danger
                          onClick={() => removeCreateLine(line.id)}
                        />
                        <div style={{ gridColumn: '1 / span 6', fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                          {item?.type === 'asset' && exchangeAllowed && targetAssets.length > 0 ? (
                            <span>
                              Exchangeable with current serial(s): {targetAssets.map(asset => asset.serialNo).join(', ')}
                            </span>
                          ) : (
                            <span>{item ? (item.type === 'asset' ? 'No assigned asset found for exchange.' : 'Non-asset item, exchange not applicable.') : ''}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  <Button icon={<PlusOutlined />} onClick={addCreateLine}>
                    Add Row
                  </Button>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                  <Button onClick={() => {
                    setCreateNeededDate(today());
                    setCreateStore('USBA');
                    setCreateLines([newLine()]);
                  }}>
                    Reset
                  </Button>
                  <Button type="primary" onClick={createDemand}>Apply</Button>
                </div>
              </div>

              <div style={sideCard}>
                <h3 style={sideTitle}>Assigned Asset</h3>
                <div style={{ color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                  {targetEmployeeForCreate.name} ({targetEmployeeForCreate.id})
                </div>
                <Table
                  rowKey={row => `${row.itemId}-${row.serialNo}`}
                  size="small"
                  pagination={false}
                  dataSource={createAssignedAssetRows}
                  scroll={{ x: 560 }}
                  columns={[
                    { title: 'Item', dataIndex: 'itemName', key: 'item' },
                    { title: 'QTY', key: 'qty', width: 60, render: () => 1 },
                    { title: 'Serial', dataIndex: 'serialNo', key: 'serial' },
                    { title: 'Assigned At', dataIndex: 'assignedAt', key: 'assignedAt', width: 170 },
                  ]}
                  locale={{
                    emptyText: <div style={{ padding: 16 }}>No assigned assets</div>,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {view === 'review' && selectedDemand && (
        <div style={{ height: '100%', overflowY: 'auto', padding: 24 }}>
          <div style={fullPageCard}>
            <div style={fullPageHeader}>
              <div>
                <h2 style={{ margin: 0, fontSize: 'clamp(22px, 3vw, 34px)' }}>Demand No: {selectedDemand.demandNo}</h2>
                <div style={{ color: 'var(--color-text-tertiary)', marginTop: 4 }}>
                  {selectedDemand.requestedBy} | Needed on {selectedDemand.neededDate} | Store {selectedDemand.store}
                </div>
              </div>
              <Button onClick={goList}>Back</Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
              <div>
                <Table
                  rowKey={row => row.line.id}
                  pagination={false}
                  dataSource={demandLinesWithCatalog(selectedDemand)}
                  scroll={{ x: 760 }}
                  columns={[
                    { title: 'Group', key: 'group', dataIndex: ['line', 'itemGroup'], width: 130 },
                    { title: 'Item', key: 'item', render: (_, row) => row.item?.name ?? '-' },
                    { title: 'Demand QTY', key: 'qty', dataIndex: ['line', 'qty'], width: 110 },
                    { title: 'Stock', key: 'stock', render: (_, row) => row.item?.stock ?? '-' },
                    {
                      title: 'Exchange',
                      key: 'exchange',
                      width: 100,
                      render: (_, row) => row.line.exchange ? <SwapOutlined style={{ color: '#d946ef' }} /> : '-',
                    },
                    { title: 'Remarks', key: 'remarks', dataIndex: ['line', 'remarks'] },
                  ]}
                  style={tableCardStyle}
                />

                {!isReadOnlyReview && (
                  <>
                    <div style={{ marginTop: 14 }}>
                      <div style={label}>Approval Remark (optional for approve)</div>
                      <Input.TextArea rows={2} value={approvalRemarks} onChange={e => setApprovalRemarks(e.target.value)} />
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <div style={label}>Reject Remark* (mandatory for reject)</div>
                      <Input.TextArea rows={3} value={rejectRemarks} onChange={e => setRejectRemarks(e.target.value)} />
                    </div>
                    <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                      <Button icon={<CloseCircleOutlined />} onClick={rejectRequest}>Reject</Button>
                      <Button type="primary" icon={<CheckCircleOutlined />} onClick={approveRequest}>Approve</Button>
                    </div>
                  </>
                )}

                {isReadOnlyReview && (
                  <div style={{ marginTop: 16, color: 'var(--color-text-secondary)' }}>
                    <div><strong>Status:</strong> {selectedDemand.status}</div>
                    {selectedDemand.approvalRemarks && <div><strong>Approval Remark:</strong> {selectedDemand.approvalRemarks}</div>}
                    {selectedDemand.rejectionRemarks && <div><strong>Rejection Remark:</strong> {selectedDemand.rejectionRemarks}</div>}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={sideCard}>
                  <h3 style={sideTitle}>Assign Asset</h3>
                  <Table
                    rowKey={row => `${row.itemId}-${row.serialNo}`}
                    size="small"
                    pagination={false}
                    dataSource={selectedEmployeeAssets}
                    scroll={{ x: 560 }}
                    columns={[
                      { title: 'Item', dataIndex: 'itemName', key: 'item' },
                      { title: 'QTY', key: 'qty', width: 60, render: () => 1 },
                      { title: 'Serial', dataIndex: 'serialNo', key: 'serial' },
                      { title: 'Assigned At', dataIndex: 'assignedAt', key: 'assignedAt', width: 170 },
                    ]}
                    locale={{ emptyText: <div style={{ padding: 14 }}>No assigned assets</div> }}
                  />
                </div>

                <div style={sideCard}>
                  <h3 style={sideTitle}>Previous Demand</h3>
                  <Table
                    rowKey="id"
                    size="small"
                    pagination={false}
                    dataSource={previousDemands}
                    columns={[
                      { title: 'Demand No', dataIndex: 'demandNo', key: 'no' },
                      { title: 'Date', dataIndex: 'neededDate', key: 'date' },
                      { title: 'Items', key: 'items', render: (_, row) => row.lines.length },
                      { title: 'QTY', key: 'qty', render: (_, row) => row.lines.reduce((sum, l) => sum + l.qty, 0) },
                    ]}
                    locale={{ emptyText: <div style={{ padding: 14 }}>No previous demand</div> }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {view === 'assign' && selectedDemand && (
        <div style={{ height: '100%', overflowY: 'auto', padding: 24 }}>
          <div style={fullPageCard}>
            <div style={fullPageHeader}>
              <div>
                <h2 style={{ margin: 0, fontSize: 'clamp(22px, 3vw, 32px)' }}>Assign Items - {selectedDemand.demandNo}</h2>
                <div style={{ color: 'var(--color-text-tertiary)', marginTop: 4 }}>Provide serial numbers for assets only. Non-asset items do not require serial numbers.</div>
              </div>
              <Button onClick={goList}>Back</Button>
            </div>

            <div style={sideCard}>
              <h3 style={sideTitle}>Assigned Asset (Current)</h3>
              <Table
                rowKey={row => `${row.itemId}-${row.serialNo}`}
                size="small"
                pagination={false}
                dataSource={selectedEmployeeAssets}
                scroll={{ x: 560 }}
                columns={[
                  { title: 'Item', dataIndex: 'itemName', key: 'item' },
                  { title: 'QTY', key: 'qty', width: 60, render: () => 1 },
                  { title: 'Serial', dataIndex: 'serialNo', key: 'serial' },
                  { title: 'Assigned At', dataIndex: 'assignedAt', key: 'assignedAt', width: 170 },
                ]}
              />
            </div>

            <div style={{ marginTop: 14, ...formGrid }}>
              <div>
                <div style={label}>Assign Date & Time*</div>
                <Input
                  type="datetime-local"
                  value={assignDateTime}
                  onChange={e => setAssignDateTime(e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <Table
                rowKey={row => row.line.id}
                pagination={false}
                dataSource={demandLinesWithCatalog(selectedDemand)}
                scroll={{ x: 1120 }}
                columns={[
                  {
                    title: 'Select',
                    key: 'select',
                    width: 70,
                    render: (_, row) => {
                      const d = assignRows.find(ar => ar.demandLineId === row.line.id);
                      return (
                        <Checkbox
                          checked={d?.selected}
                          onChange={e => updateAssignRow(row.line.id, { selected: e.target.checked })}
                        />
                      );
                    },
                  },
                  { title: 'Group', key: 'group', dataIndex: ['line', 'itemGroup'], width: 130 },
                  { title: 'Item', key: 'item', render: (_, row) => row.item?.name ?? '-' },
                  { title: 'Demand QTY', key: 'dQty', render: (_, row) => row.line.qty, width: 100 },
                  { title: 'Stock', key: 'stock', render: (_, row) => row.item?.stock ?? '-', width: 90 },
                  {
                    title: 'Assign QTY',
                    key: 'aQty',
                    width: 120,
                    render: (_, row) => {
                      const d = assignRows.find(ar => ar.demandLineId === row.line.id);
                      return (
                        <InputNumber
                          min={0}
                          max={row.line.qty}
                          value={d?.assignedQty}
                          disabled={!d?.selected}
                          onChange={v => updateAssignRow(row.line.id, { assignedQty: Number(v || 0) })}
                        />
                      );
                    },
                  },
                  {
                    title: 'Exchange',
                    key: 'exchange',
                    width: 90,
                    render: (_, row) => row.line.exchange ? <SwapOutlined style={{ color: '#d946ef' }} /> : '--',
                  },
                  {
                    title: 'New Serial No.',
                    key: 'serial',
                    width: 180,
                    render: (_, row) => {
                      const item = row.item;
                      const d = assignRows.find(ar => ar.demandLineId === row.line.id);
                      if (!item || item.type !== 'asset') return '------';
                      return (
                        <Input
                          placeholder="input SN..."
                          value={d?.newSerialNo}
                          disabled={!d?.selected || (d?.assignedQty ?? 0) < 1}
                          onChange={e => updateAssignRow(row.line.id, { newSerialNo: e.target.value })}
                        />
                      );
                    },
                  },
                  {
                    title: 'Previous Serial No.',
                    key: 'prevSerial',
                    width: 190,
                    render: (_, row) => {
                      const item = row.item;
                      const d = assignRows.find(ar => ar.demandLineId === row.line.id);
                      if (!item || item.type !== 'asset' || !row.line.exchange) return '------';
                      return (
                        <Input
                          placeholder="input previous SN..."
                          value={d?.previousSerialNo}
                          disabled={!d?.selected || (d?.assignedQty ?? 0) < 1}
                          onChange={e => updateAssignRow(row.line.id, { previousSerialNo: e.target.value })}
                        />
                      );
                    },
                  },
                ]}
                style={tableCardStyle}
              />
            </div>

            <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
              <Button onClick={() => {
                if (!selectedDemand) return;
                const rows: AssignDraftRow[] = selectedDemand.lines.map(line => ({
                  demandLineId: line.id,
                  selected: true,
                  assignedQty: line.qty,
                  previousSerialNo: '',
                  newSerialNo: '',
                }));
                setAssignRows(rows);
              }}>
                Reset
              </Button>
              <Button type="primary" icon={<InboxOutlined />} onClick={submitAssignment}>Assign</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const textButton: React.CSSProperties = {
  border: 'none',
  background: 'none',
  padding: 0,
  color: '#0f172a',
  cursor: 'pointer',
  textDecoration: 'underline',
  fontWeight: 600,
};

const listPanel: React.CSSProperties = {
  margin: '0 24px 24px',
  padding: 18,
  borderRadius: 14,
  border: '1px solid var(--color-border)',
  background: 'var(--color-bg-surface)',
  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)',
};

const tableCardStyle: React.CSSProperties = {
  border: '1px solid var(--color-border)',
  borderRadius: 12,
  overflow: 'hidden',
};

const fullPageCard: React.CSSProperties = {
  borderRadius: 16,
  border: '1px solid #dbeafe',
  background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
  padding: 20,
  boxShadow: '0 12px 36px rgba(30, 41, 59, 0.08)',
};

const fullPageHeader: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: 18,
};

const sideCard: React.CSSProperties = {
  border: '1px solid var(--color-border)',
  borderRadius: 12,
  padding: 12,
  background: 'var(--color-bg-surface)',
};

const sideTitle: React.CSSProperties = {
  margin: '0 0 10px',
  fontSize: 18,
  fontWeight: 800,
  color: '#0f172a',
};

const formGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 12,
};

const fullWidthControl: React.CSSProperties = { width: '100%' };

const label: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: 'var(--color-text-secondary)',
  marginBottom: 6,
};

const tabButton = (active: boolean): React.CSSProperties => ({
  borderRadius: 10,
  border: `1px solid ${active ? '#2563eb' : 'var(--color-border)'}`,
  background: active ? 'var(--color-status-info-bg)' : 'var(--color-bg-surface)',
  color: '#0f172a',
  padding: '8px 16px',
  cursor: 'pointer',
  fontWeight: active ? 700 : 500,
});
