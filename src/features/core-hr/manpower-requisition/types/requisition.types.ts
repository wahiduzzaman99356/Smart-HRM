export type RequisitionStatus = 'Draft' | 'Pending' | 'Approved' | 'Rejected';

export interface ApprovalStep {
  approverName: string;
  approverId?: string;
  action: 'Approved' | 'Rejected' | 'Pending';
  timestamp?: string;
  reason?: string;
  note?: string;
}

export interface ActionHistoryEntry {
  initiatedBy: string;
  timestamp: string;
  actionType: 'Created' | 'Submitted' | 'Approved' | 'Rejected' | 'Updated' | 'Draft Saved';
}

export interface RequisitionAttachment {
  uid: string;
  name: string;
  size?: number;
  objectUrl?: string;
}

export interface EducationRequirement {
  qualification: string;
  title: string;
  major: string;
  cgpa: string;
}

export interface RequisitionFormData {
  dateTime: string;
  selectedLevel: string;
  refNo: string;
  typeOfRequisition: string[];        // Both "New Recruitment" and "Replacement" can be selected
  vacancyNumber: string;
  employee: string[];
  employmentType: string;
  inputInDays: string;
  workLocation: string;
  gender: string;
  etaDate: string;
  experienceMode: 'Fresher' | 'Experienced';
  yearsOfExperience: string;
  preferableDesired: string;
  ageMode: 'Minimum' | 'Maximum' | 'Range';
  ageMinimum: string;
  ageMaximum: string;
  ageFrom: string;
  ageTo: string;
  educationQualification: string;
  educationField: string;
  educationCourse: string;
  educationNote: string;
  educationRequirements: EducationRequirement[];
  skillsRequired: string[];
  jobResponsibility: string;
  trainingSpecialization: string;
  otherRequirements: string;
  justification: string;
}

export interface RequisitionRequest {
  id: string;
  refNo: string;
  initiateDate: string;
  requested: number;
  approved: number;
  status: RequisitionStatus;
  department: string;
  designation: string;
  formData: RequisitionFormData;
  approvalWorkflow: ApprovalStep[];
  actionHistory: ActionHistoryEntry[];
  attachments?: RequisitionAttachment[];
}

export interface RequisitionFilters {
  dateRange: [string, string] | null;
  mrfNo: string;
  refNo: string;
  typeOfRequisition: string;
  employee: string;
  employmentType: string;
  vacancyNumber: string;
  department: string;
  designation: string;
  gender: string;
  status: string;
  workLocation: string;
  etaDate: string;
  experience: string;
  ageGroup: string;
  education: string;
}

export const EMPTY_FILTERS: RequisitionFilters = {
  dateRange: null,
  mrfNo: '',
  refNo: '',
  typeOfRequisition: '',
  employee: '',
  employmentType: '',
  vacancyNumber: '',
  department: '',
  designation: '',
  gender: '',
  status: '',
  workLocation: '',
  etaDate: '',
  experience: '',
  ageGroup: '',
  education: '',
};

export const DEFAULT_FORM_DATA: RequisitionFormData = {
  dateTime: '',
  selectedLevel: '',
  refNo: '',
  typeOfRequisition: ['New Recruitment'],
  vacancyNumber: '',
  employee: [],
  employmentType: 'Full Time',
  inputInDays: '',
  workLocation: 'Head Office',
  gender: '',
  etaDate: '',
  experienceMode: 'Fresher',
  yearsOfExperience: '',
  preferableDesired: '',
  ageMode: 'Range',
  ageMinimum: '',
  ageMaximum: '',
  ageFrom: '',
  ageTo: '',
  educationQualification: '',
  educationField: '',
  educationCourse: '',
  educationNote: '',
  educationRequirements: [{ qualification: '', title: '', major: '', cgpa: '' }],
  skillsRequired: ['Team Collaboration'],
  jobResponsibility: '',
  trainingSpecialization: '',
  otherRequirements: '',
  justification: '',
};

export const INITIAL_REQUISITIONS: RequisitionRequest[] = [
  {
    id: 'MRF200126xx',
    refNo: 'TSLXXXX',
    initiateDate: '20 Jan 2026',
    requested: 10,
    approved: 9,
    status: 'Pending',
    department: 'Operation',
    designation: 'Executive',
    attachments: [],
    formData: {
      ...DEFAULT_FORM_DATA,
      selectedLevel: 'CEO > Head of Operation > Executive',
      refNo: 'TSLXXXX',
      vacancyNumber: '2',
      dateTime: '20 Jan 2026, 10:30 AM',
      etaDate: '31 Jan 2026',
      experienceMode: 'Experienced',
      yearsOfExperience: '3',
      ageMode: 'Range',
      ageFrom: '24',
      ageTo: '32',
    },
    approvalWorkflow: [
      {
        approverName: 'Farjana Alim',
        approverId: '999',
        action: 'Approved',
        timestamp: '20 Jan 2026, 10:30 AM',
      },
      {
        approverName: 'Tahamid',
        approverId: '007',
        action: 'Rejected',
        timestamp: '20 Jan 2026, 11:15 AM',
        reason: 'Budget/Salary Misalignment',
        note: 'Note: Budget exceeds',
      },
      {
        approverName: 'Approver 3',
        action: 'Pending',
      },
    ],
    actionHistory: [
      {
        initiatedBy: 'Shanto (Admin)',
        timestamp: '20 Jan 2026, 10:30:22 AM',
        actionType: 'Created',
      },
      {
        initiatedBy: 'Wahid (Manager)',
        timestamp: '20 Jan 2026, 10:34:22 AM',
        actionType: 'Approved',
      },
    ],
  },
  {
    id: 'MRF200126xy',
    refNo: 'TSLXXXX',
    initiateDate: '20 Jan 2026',
    requested: 10,
    approved: 9,
    status: 'Draft',
    department: 'Operation',
    designation: 'Executive',
    attachments: [],
    formData: {
      ...DEFAULT_FORM_DATA,
      selectedLevel: 'CEO > Head of Operation > Executive',
      refNo: 'TSLXXXX',
      vacancyNumber: '1',
      dateTime: '20 Jan 2026, 09:20 AM',
    },
    approvalWorkflow: [
      {
        approverName: 'Approver 1',
        action: 'Pending',
      },
      {
        approverName: 'Approver 2',
        action: 'Pending',
      },
    ],
    actionHistory: [
      {
        initiatedBy: 'Shanto (Admin)',
        timestamp: '20 Jan 2026, 09:20:00 AM',
        actionType: 'Created',
      },
    ],
  },
];
