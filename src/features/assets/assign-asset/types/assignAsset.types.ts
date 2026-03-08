export type AssignTargetType = 'employee' | 'department';

export interface Employee {
  id: string;
  name: string;
  department: string;
  section: string;
  designation: string;
}

export interface AssetItem {
  id: string;
  name: string;
  group: string;
  store: string;
}

export interface AssetAssignment {
  id: string;
  targetType: AssignTargetType;
  targetId: string;
  targetLabel: string;
  itemId: string;
  itemName: string;
  qty: number;
  serialNo: string;
  assignedBy: string;
  assignedAt: string;
  responsibleTo?: string;
}

export const STORES = ['USBA', 'Main Store', 'Tech Store'];

export const DEPARTMENTS = ['Business Analysis', 'IT', 'HR', 'Operations'];

export const SECTION_BY_DEPARTMENT: Record<string, string[]> = {
  'Business Analysis': ['Analytics', 'Planning'],
  IT: ['Infrastructure', 'Application Support'],
  HR: ['HRBP', 'Talent Acquisition'],
  Operations: ['Service Excellence', 'Ground Support'],
};

export const EMPLOYEES: Employee[] = [
  { id: 'TN-99318', name: 'Shanto Karmoker', department: 'Business Analysis', section: 'Analytics', designation: 'Business Analyst' },
  { id: 'TN-77114', name: 'Wahiduzzaman', department: 'IT', section: 'Infrastructure', designation: 'Senior Engineer' },
  { id: 'TN-44321', name: 'Farjana Alim', department: 'HR', section: 'Talent Acquisition', designation: 'HR Manager' },
  { id: 'TN-66182', name: 'Tahmid Hasan', department: 'Operations', section: 'Service Excellence', designation: 'Executive' },
];

// Only asset items are available for this module.
export const ASSET_ITEMS: AssetItem[] = [
  { id: 'asset-laptop', name: 'HP Laptop', group: 'IT Equipment', store: 'USBA' },
  { id: 'asset-mouse', name: 'Wireless Mouse', group: 'Accessories', store: 'Tech Store' },
  { id: 'asset-printer', name: 'Laser Printer', group: 'IT Equipment', store: 'Main Store' },
  { id: 'asset-headset', name: 'Noise Canceling Headset', group: 'Accessories', store: 'Tech Store' },
  { id: 'asset-tablet', name: 'Android Tablet', group: 'IT Equipment', store: 'USBA' },
];
