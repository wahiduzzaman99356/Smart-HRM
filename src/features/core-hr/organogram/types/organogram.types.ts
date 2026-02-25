// ─── Organogram Domain Types ──────────────────────────────────────────────
// Aviation company organogram with 17 departments

export type NodeStatus = 'empty' | 'active' | 'vacant' | 'separation';

export type DeptKey =
  | 'higher_management'
  | 'flight_ops'
  | 'safety'
  | 'corp_quality'
  | 'cabin_service'
  | 'engineering'
  | 'quality_assurance'
  | 'revenue_accounts'
  | 'marketing_sales'
  | 'brand_marketing'
  | 'public_relations'
  | 'human_resources'
  | 'it'
  | 'administration'
  | 'airline_security'
  | 'catering'
  | 'ground_operations';

export interface DeptTheme {
  border: string;
  avatarBg: string;
  lightBg: string;
}

export const DEPT_THEME: Record<DeptKey, DeptTheme> = {
  higher_management: { border: '#7c3aed', avatarBg: '#7c3aed', lightBg: '#f5f3ff' },
  flight_ops:        { border: '#2563eb', avatarBg: '#2563eb', lightBg: '#eff6ff' },
  safety:            { border: '#dc2626', avatarBg: '#dc2626', lightBg: '#fff5f5' },
  corp_quality:      { border: '#4f46e5', avatarBg: '#4f46e5', lightBg: '#eef2ff' },
  cabin_service:     { border: '#db2777', avatarBg: '#db2777', lightBg: '#fdf2f8' },
  engineering:       { border: '#0891b2', avatarBg: '#0891b2', lightBg: '#ecfeff' },
  quality_assurance: { border: '#d97706', avatarBg: '#d97706', lightBg: '#fffbeb' },
  revenue_accounts:  { border: '#059669', avatarBg: '#059669', lightBg: '#f0fdf4' },
  marketing_sales:   { border: '#65a30d', avatarBg: '#65a30d', lightBg: '#f7fee7' },
  brand_marketing:   { border: '#9333ea', avatarBg: '#9333ea', lightBg: '#faf5ff' },
  public_relations:  { border: '#0284c7', avatarBg: '#0284c7', lightBg: '#f0f9ff' },
  human_resources:   { border: '#e11d48', avatarBg: '#e11d48', lightBg: '#fff1f2' },
  it:                { border: '#475569', avatarBg: '#475569', lightBg: '#f8fafc' },
  administration:    { border: '#6b7280', avatarBg: '#6b7280', lightBg: '#f9fafb' },
  airline_security:  { border: '#92400e', avatarBg: '#92400e', lightBg: '#fef3c7' },
  catering:          { border: '#f59e0b', avatarBg: '#f59e0b', lightBg: '#fffbeb' },
  ground_operations: { border: '#10b981', avatarBg: '#10b981', lightBg: '#ecfdf5' },
};

export const DEPT_LABELS: Record<DeptKey, string> = {
  higher_management: 'Higher Management',
  flight_ops:        'Flight Operations',
  safety:            'Safety',
  corp_quality:      'Corporate Quality & SMS',
  cabin_service:     'Cabin Service',
  engineering:       'Engineering',
  quality_assurance: 'Quality Assurance',
  revenue_accounts:  'Revenue Accounts',
  marketing_sales:   'Marketing & Sales',
  brand_marketing:   'Brand Marketing',
  public_relations:  'Public Relations',
  human_resources:   'Human Resources',
  it:                'IT',
  administration:    'Administration',
  airline_security:  'Airline Security',
  catering:          'Catering',
  ground_operations: 'Ground Operations',
};

// ─── Master Designation List (Department → Designations) ──────────────────
export const DEPT_DESIGNATIONS: Record<DeptKey, string[]> = {
  higher_management: ['CEO', 'Accountable Manager'],
  flight_ops: [
    'Director Flight Operations', 'Chief of Training', 'Chief of Safety', 'Chief of Technical',
    'Captain ATR 72-600', 'First Officer ATR 72-600',
    'Deputy General Manager, Flight Operations', 'Manager, Flight Operations',
    'Assistant Manager, OCC', 'Senior Flight Operations Officer', 'Flight Operations Officer',
    'Executive, Training', 'Executive, Training & Crew Scheduling',
    'Executive, Technical', 'Executive, Operations Engineering',
  ],
  safety: ['Deputy Manager, Flight Data Monitoring & IT', 'Executive, Flight Data Analyst'],
  corp_quality: ['Auditor'],
  cabin_service: [
    'Head of Cabin Safety & Service', 'Assistant Manager, Training',
    'Executive, Cabin Service', 'Executive, Admin & Scheduling',
    'Purser', 'Senior Cabin Crew (CIC)', 'Cabin in Charge (CIC)', 'Cabin Crew',
  ],
  engineering: [
    'Head of Engineering/CAMO', 'Technical Manager, Engineering & Reliability',
    'Technical Manager, Planning & Records', 'Maintenance Coordinator',
    'Maintenance Coordinator/Technician', 'Technical Executive, Planning & Records',
    'Technical Executive, Engineering & Reliability',
  ],
  quality_assurance: [
    'Head of Quality Assurance', 'Senior Technical Executive, Quality Assurance',
    'Technical Executive, Quality Assurance', 'Chief Financial Officer',
    'Assistant General Manager', 'Executive', 'Executive, Teller',
  ],
  revenue_accounts: ['Senior Manager, Revenue', 'Senior Executive, Revenue'],
  marketing_sales: [
    'Chief Commercial Officer', 'Deputy General Manager, Marketing & Sales',
    'Assistant Manager, Sales', 'Senior Executive', 'Executive',
  ],
  brand_marketing: [
    'Assistant General Manager, Brand Marketing',
    'Senior Visualizer, Brand Communication', 'Senior Executive, Brand Communication',
  ],
  public_relations: ['Deputy Manager, Public Relations'],
  human_resources: ['Manager, Human Resources', 'Executive, Human Resources'],
  it: ['Senior Executive, IT', 'Executive, IT'],
  administration: [
    'General Manager, Administration & Airline Security',
    'Senior Executive, Local Procurement', 'Executive, Transport', 'Executive, Front Desk',
    'Executive, Admin', 'Senior Office Assistant', 'Office Assistant', 'Office Cleaner',
    'Office Assistant Cum Cleaner', 'Motor Transport Operator (MTO)',
  ],
  airline_security: [
    'Deputy Manager', 'Senior Security Officer', 'Security Officer',
    'Executive, Security', 'Security Supervisor', 'Assistant Security Supervisor', 'Security Assistant',
  ],
  catering: ['Executive, Catering', 'Catering Assistant'],
  ground_operations: [
    'Head of Ground Operations & DGR', 'Deputy Station Manager', 'Assistant Station Manager',
    'Senior Executive', 'Executive', 'Passenger Service Agent',
    'Senior Traffic Helper', 'Traffic Helper', 'Aircraft Cleaner',
  ],
};

// ─── Grade definitions ───────────────────────────────────────────────
export type GradeKey = 'G1' | 'G2' | 'G3' | 'G4' | 'G5' | 'G6' | 'G7' | 'G8' | 'G9';

export const GRADE_LABELS: Record<GradeKey, string> = {
  G1: 'Grade 1',
  G2: 'Grade 2',
  G3: 'Grade 3',
  G4: 'Grade 4',
  G5: 'Grade 5',
  G6: 'Grade 6',
  G7: 'Grade 7',
  G8: 'Grade 8',
  G9: 'Grade 9',
};

export const GRADE_COLORS: Record<GradeKey, { bg: string; text: string; border: string }> = {
  G1: { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db' },
  G2: { bg: '#fef9c3', text: '#92400e', border: '#fde68a' },
  G3: { bg: '#dbeafe', text: '#1d4ed8', border: '#bfdbfe' },
  G4: { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' },
  G5: { bg: '#ede9fe', text: '#6d28d9', border: '#ddd6fe' },
  G6: { bg: '#fce7f3', text: '#be185d', border: '#fbcfe8' },
  G7: { bg: '#ffedd5', text: '#c2410c', border: '#fed7aa' },
  G8: { bg: '#cffafe', text: '#0e7490', border: '#a5f3fc' },
  G9: { bg: '#fef3c7', text: '#b45309', border: '#fcd34d' },
};

// ─── Master Employee List ────────────────────────────────────────────
export interface MasterEmployee {
  id: string;       // e.g. 'TN-99356'
  name: string;     // Full name
  department: DeptKey;
  designation: string;
  grade: GradeKey;
}

/** Display label for dropdowns: "Full Name (TN-XXXXX)" */
export function empLabel(emp: MasterEmployee): string {
  return `${emp.name} (${emp.id})`;
}

export const MASTER_EMPLOYEES: MasterEmployee[] = [
  // Higher Management
  { id: 'TN-00001', name: 'Md. Rahman Al-Islam',      department: 'higher_management', designation: 'CEO',                                              grade: 'G9' },
  { id: 'TN-00002', name: 'Sarah Khan',                department: 'higher_management', designation: 'Accountable Manager',                              grade: 'G8' },
  // Flight Operations
  { id: 'TN-10001', name: 'Col. Farhan Ahmed',         department: 'flight_ops', designation: 'Director Flight Operations',                             grade: 'G8' },
  { id: 'TN-10002', name: 'Capt. Imran Hossain',       department: 'flight_ops', designation: 'Captain ATR 72-600',                                     grade: 'G7' },
  { id: 'TN-10003', name: 'Capt. Nuzhat Ali',          department: 'flight_ops', designation: 'Captain ATR 72-600',                                     grade: 'G7' },
  { id: 'TN-10004', name: 'F/O Sakib Rahman',          department: 'flight_ops', designation: 'First Officer ATR 72-600',                               grade: 'G5' },
  { id: 'TN-10005', name: 'F/O Tasmia Begum',          department: 'flight_ops', designation: 'First Officer ATR 72-600',                               grade: 'G5' },
  { id: 'TN-10006', name: 'Md. Wahiduzzaman Nayem',    department: 'flight_ops', designation: 'Manager, Flight Operations',                             grade: 'G6' },
  { id: 'TN-99356', name: 'Md. Wahiduzzaman Nayem',    department: 'flight_ops', designation: 'Executive, Training & Crew Scheduling',                  grade: 'G3' },
  // Safety
  { id: 'TN-20001', name: 'Arif Billah',               department: 'safety', designation: 'Deputy Manager, Flight Data Monitoring & IT',               grade: 'G5' },
  { id: 'TN-20002', name: 'Nadia Sultana',             department: 'safety', designation: 'Executive, Flight Data Analyst',                            grade: 'G3' },
  // Corporate Quality
  { id: 'TN-30001', name: 'Rezaul Karim',              department: 'corp_quality', designation: 'Auditor',                                             grade: 'G4' },
  { id: 'TN-30002', name: 'Fariha Chowdhury',          department: 'corp_quality', designation: 'Auditor',                                             grade: 'G4' },
  // Cabin Service
  { id: 'TN-40001', name: 'Dilara Parvin',             department: 'cabin_service', designation: 'Head of Cabin Safety & Service',                     grade: 'G7' },
  { id: 'TN-40002', name: 'Meher Nigar',               department: 'cabin_service', designation: 'Purser',                                             grade: 'G4' },
  { id: 'TN-40003', name: 'Sumaiya Islam',             department: 'cabin_service', designation: 'Cabin Crew',                                         grade: 'G2' },
  { id: 'TN-40004', name: 'Tanvir Ahsan',              department: 'cabin_service', designation: 'Cabin Crew',                                         grade: 'G2' },
  // Engineering
  { id: 'TN-50001', name: 'Eng. Khalid Mahmud',        department: 'engineering', designation: 'Head of Engineering/CAMO',                             grade: 'G7' },
  { id: 'TN-50002', name: 'Eng. Rubel Mia',            department: 'engineering', designation: 'Maintenance Coordinator',                              grade: 'G5' },
  { id: 'TN-50003', name: 'Eng. Shantu Das',           department: 'engineering', designation: 'Technical Executive, Engineering & Reliability',       grade: 'G3' },
  // Quality Assurance
  { id: 'TN-60001', name: 'Abdur Rahim',               department: 'quality_assurance', designation: 'Head of Quality Assurance',                     grade: 'G7' },
  { id: 'TN-60002', name: 'Jessica Pearson',           department: 'quality_assurance', designation: 'Chief Financial Officer',                        grade: 'G8' },
  // Revenue Accounts
  { id: 'TN-70001', name: 'Marcus Webb',               department: 'revenue_accounts', designation: 'Senior Manager, Revenue',                        grade: 'G6' },
  { id: 'TN-70002', name: 'Rupa Akter',                department: 'revenue_accounts', designation: 'Senior Executive, Revenue',                      grade: 'G4' },
  // Marketing & Sales
  { id: 'TN-80001', name: 'Louis Litt',                department: 'marketing_sales', designation: 'Chief Commercial Officer',                        grade: 'G8' },
  { id: 'TN-80002', name: 'Katrina Bennett',           department: 'marketing_sales', designation: 'Assistant Manager, Sales',                        grade: 'G5' },
  // Brand Marketing
  { id: 'TN-90001', name: 'Amy Lee',                   department: 'brand_marketing', designation: 'Assistant General Manager, Brand Marketing',       grade: 'G7' },
  { id: 'TN-90002', name: 'Priya Sharma',              department: 'brand_marketing', designation: 'Senior Executive, Brand Communication',            grade: 'G4' },
  // Public Relations
  { id: 'TN-91001', name: 'Zoe Richards',              department: 'public_relations', designation: 'Deputy Manager, Public Relations',               grade: 'G5' },
  // Human Resources
  { id: 'TN-92001', name: 'Carlos Mendez',             department: 'human_resources', designation: 'Manager, Human Resources',                        grade: 'G6' },
  { id: 'TN-92002', name: 'Ruksana Begum',             department: 'human_resources', designation: 'Executive, Human Resources',                      grade: 'G3' },
  // IT
  { id: 'TN-93001', name: 'Ariful Islam',              department: 'it', designation: 'Senior Executive, IT',                                         grade: 'G4' },
  { id: 'TN-93002', name: 'Tanvir Ahmed',              department: 'it', designation: 'Executive, IT',                                                grade: 'G3' },
  // Administration
  { id: 'TN-94001', name: 'Gen. Mahbub Hassan',        department: 'administration', designation: 'General Manager, Administration & Airline Security', grade: 'G8' },
  { id: 'TN-94002', name: 'Polash Mia',                department: 'administration', designation: 'Executive, Admin',                                 grade: 'G3' },
  { id: 'TN-94003', name: 'Jamal Uddin',               department: 'administration', designation: 'Motor Transport Operator (MTO)',                   grade: 'G2' },
  // Airline Security
  { id: 'TN-95001', name: 'Sgt. Rafiqul Islam',        department: 'airline_security', designation: 'Deputy Manager',                                 grade: 'G5' },
  { id: 'TN-95002', name: 'Cpl. Masum Ahmed',          department: 'airline_security', designation: 'Security Officer',                               grade: 'G3' },
  { id: 'TN-95003', name: 'Sgt. Habib Rahman',         department: 'airline_security', designation: 'Security Supervisor',                             grade: 'G4' },
  // Catering
  { id: 'TN-96001', name: 'Nasrin Akter',              department: 'catering', designation: 'Executive, Catering',                                    grade: 'G3' },
  { id: 'TN-96002', name: 'Romzan Ali',                department: 'catering', designation: 'Catering Assistant',                                     grade: 'G1' },
  // Ground Operations
  { id: 'TN-97001', name: 'Babul Hossain',             department: 'ground_operations', designation: 'Head of Ground Operations & DGR',               grade: 'G7' },
  { id: 'TN-97002', name: 'Shafiq Ahmed',              department: 'ground_operations', designation: 'Passenger Service Agent',                       grade: 'G2' },
  { id: 'TN-97003', name: 'Rina Khatun',               department: 'ground_operations', designation: 'Passenger Service Agent',                       grade: 'G2' },
  { id: 'TN-97004', name: 'Sumon Mia',                 department: 'ground_operations', designation: 'Traffic Helper',                                grade: 'G1' },
];

// ─── Tree node ────────────────────────────────────────────────────────────────────────

export interface AssignedEmployee {
  id: string;   // employee ID from MASTER_EMPLOYEES
  name: string; // full name
}

export interface OrgEmployee {
  id: string;
  status: NodeStatus;
  assignMode?: 'designation' | 'employee';
  // Position metadata
  department?: DeptKey;
  departmentLabel?: string;
  designation?: string;
  grade?: GradeKey;
  // Assigned employees (0 = vacant/hiring, 1+ = active)
  employees?: AssignedEmployee[];
  // For single specific-employee mode
  employeeId?: string;
  name?: string;
  children?: OrgEmployee[];
}

// ─── Layout ─────────────────────────────────────────────────────────────────────────────────

export interface LayoutNode {
  id: string;
  x: number;
  y: number;
  subtreeW: number;
  data: OrgEmployee;
  children: LayoutNode[];
}

// ─── Feature state ───────────────────────────────────────────────────────────────────────

export interface OrgFilters {
  search: string;
  department: string;
  showVacant: boolean;
  showSeparation: boolean;
  darkMode: boolean;
  showGrade: boolean;
}

export type FormMode = 'add' | 'edit';
export type AssignMode = 'designation' | 'employee';

export interface NodeFormAnchor {
  mode: FormMode;
  nodeId: string;        // parentId when mode='add', own id when mode='edit'
  parentName?: string;   // default reporting-to display name
  viewportX: number;
  viewportY: number;
}

export interface NodeFormValues {
  assignMode: AssignMode;
  // Designation mode
  department?: DeptKey;
  designation?: string;
  employeeIds?: string[];  // multi-select employee IDs
  // Employee mode
  employeeId?: string;     // single specific employee
  // Both modes (add only)
  reportingToNodeId?: string;  // which organogram node to report to
}

// Legacy (keep for backward compat during migration)
export interface EditNodeAnchor {
  nodeId: string;
  parentName?: string;
  viewportX: number;
  viewportY: number;
}

export interface SelectOption {
  value: string;
  label: string;
}