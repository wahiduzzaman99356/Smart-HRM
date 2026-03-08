export type DemandStatus = 'To Approve' | 'Approved' | 'Rejected' | 'Assigned';

export type CatalogItemType = 'asset' | 'item';

export interface CatalogItem {
  id: string;
  name: string;
  type: CatalogItemType;
  stock: number;
}

export interface Employee {
  id: string;
  name: string;
  department: string;
  designation: string;
  section: string;
}

export interface AssignedAsset {
  employeeId: string;
  itemId: string;
  itemName: string;
  serialNo: string;
  assignedAt: string;
}

export interface DemandLine {
  id: string;
  itemGroup: string;
  itemId: string;
  qty: number;
  remarks: string;
  exchange: boolean;
}

export interface AssignmentLine {
  demandLineId: string;
  itemId: string;
  assignedQty: number;
  assignedAt: string;
  newSerialNo?: string;
  previousSerialNo?: string;
}

export interface DemandRequest {
  id: string;
  demandNo: string;
  createdAt: string;
  neededDate: string;
  store: string;
  requestedBy: string;
  employeeId: string;
  requestFor: 'self' | 'department';
  targetDepartment?: string;
  targetSection?: string;
  lines: DemandLine[];
  status: DemandStatus;
  approvalRemarks?: string;
  rejectionRemarks?: string;
  assignment?: AssignmentLine[];
}

export const STORES = ['USBA', 'Main Store', 'Tech Store', 'Logistics Store'];

export const ITEM_GROUPS = ['IT Equipment', 'Accessories', 'Stationery', 'Office Supply'];

export const DEPARTMENTS = ['Business Analysis', 'HR', 'IT', 'Finance', 'Operations'];

export const SECTION_BY_DEPARTMENT: Record<string, string[]> = {
  'Business Analysis': ['Analytics', 'Planning'],
  HR: ['HRBP', 'Talent Acquisition'],
  IT: ['Infrastructure', 'Applications'],
  Finance: ['Accounts', 'Audit'],
  Operations: ['Ground Support', 'Service Excellence'],
};

export const EMPLOYEES: Employee[] = [
  { id: 'TN-99318', name: 'Shanto Karmoker', department: 'Business Analysis', designation: 'Business Analyst', section: 'Analytics' },
  { id: 'TN-44321', name: 'Farjana Alim', department: 'HR', designation: 'HR Manager', section: 'Talent Acquisition' },
  { id: 'TN-77114', name: 'Wahiduzzaman', department: 'IT', designation: 'Senior Engineer', section: 'Infrastructure' },
  { id: 'TN-66182', name: 'Tahmid Hasan', department: 'Operations', designation: 'Executive', section: 'Service Excellence' },
];

export const CURRENT_USER_ID = 'TN-99318';

export const CATALOG_ITEMS: CatalogItem[] = [
  { id: 'itm-laptop', name: 'HP Laptop', type: 'asset', stock: 12 },
  { id: 'itm-mouse', name: 'Wireless Mouse', type: 'asset', stock: 40 },
  { id: 'itm-headset', name: 'Headset', type: 'asset', stock: 18 },
  { id: 'itm-keyboard', name: 'Keyboard', type: 'asset', stock: 22 },
  { id: 'itm-battery', name: 'Pencil Battery AA', type: 'item', stock: 190 },
  { id: 'itm-tissue', name: 'Facial Tissue Box', type: 'item', stock: 260 },
  { id: 'itm-cleaner', name: 'Screen Cleaner', type: 'item', stock: 90 },
];

export const INITIAL_ASSIGNED_ASSETS: AssignedAsset[] = [
  { employeeId: 'TN-99318', itemId: 'itm-laptop', itemName: 'HP Laptop', serialNo: 'ZXPSHCI2', assignedAt: '07 Feb 2026, 10:20 AM' },
  { employeeId: 'TN-99318', itemId: 'itm-mouse', itemName: 'Wireless Mouse', serialNo: 'MSE-02011', assignedAt: '07 Feb 2026, 10:20 AM' },
  { employeeId: 'TN-77114', itemId: 'itm-laptop', itemName: 'HP Laptop', serialNo: 'ZXPWHD88', assignedAt: '21 Jan 2026, 02:40 PM' },
];

export const INITIAL_DEMANDS: DemandRequest[] = [
  {
    id: 'dmd-1',
    demandNo: '20032026xxxx',
    createdAt: '20 Mar 2026, 10:22 AM',
    neededDate: '25 Mar 2026',
    store: 'USBA',
    requestedBy: 'Shanto Karmoker',
    employeeId: 'TN-99318',
    requestFor: 'self',
    lines: [
      { id: 'line-1', itemGroup: 'IT Equipment', itemId: 'itm-laptop', qty: 1, remarks: 'Need better battery backup', exchange: true },
      { id: 'line-2', itemGroup: 'Stationery', itemId: 'itm-battery', qty: 10, remarks: 'For keyboard + mouse', exchange: false },
    ],
    status: 'To Approve',
  },
  {
    id: 'dmd-2',
    demandNo: '20031026xx',
    createdAt: '18 Mar 2026, 11:05 AM',
    neededDate: '21 Mar 2026',
    store: 'Main Store',
    requestedBy: 'Farjana Alim',
    employeeId: 'TN-44321',
    requestFor: 'department',
    targetDepartment: 'HR',
    targetSection: 'Talent Acquisition',
    lines: [{ id: 'line-3', itemGroup: 'Office Supply', itemId: 'itm-tissue', qty: 20, remarks: 'Team use', exchange: false }],
    status: 'Approved',
    approvalRemarks: 'Valid departmental need.',
  },
];
