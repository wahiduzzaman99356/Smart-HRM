export type JobStatus      = 'Draft' | 'Published' | 'On-Going' | 'Closed' | 'Rejected';
export type EmploymentType = 'Full Time' | 'Part Time' | 'Contractual' | 'Intern';
export type ExperienceMode = 'Fresher' | 'Experienced';
export type WorkLocation   = 'Head Office' | 'Airport Office' | 'Field Office';

export interface JobPosting {
  // ── Sourced from RequisitionRequest (top-level) ───────────────────────────
  mrfId:               string;   // RequisitionRequest.id
  mrfRef:              string;   // RequisitionRequest.refNo
  designation:         string;   // RequisitionRequest.designation
  department:          string;   // RequisitionRequest.department
  initiateDate:        string;   // RequisitionRequest.initiateDate  → Published date

  // ── Sourced from RequisitionRequest.formData ──────────────────────────────
  employmentType:      EmploymentType;   // formData.employmentType
  workLocation:        WorkLocation;     // formData.workLocation
  vacancyNumber:       string;           // formData.vacancyNumber
  etaDate:             string;           // formData.etaDate            → Deadline
  typeOfRequisition:   string;           // formData.typeOfRequisition[0]  e.g. 'New Recruitment'
  gender:              string;           // formData.gender             e.g. 'Male' | 'Female' | 'Any'
  experienceMode:      ExperienceMode;   // formData.experienceMode
  yearsOfExperience:   string;           // formData.yearsOfExperience  e.g. '3'
  educationQualification: string;        // formData.educationQualification  e.g. 'Bachelor'
  skillsRequired:      string[];         // formData.skillsRequired
  jobResponsibility:   string;           // formData.jobResponsibility  (short summary)

  // ── Job Posting–specific (not in MRF) ─────────────────────────────────────
  pipeline:            string | null;
  applications:        number;
  matched:             number;
  shortListed:         number;
  status:              JobStatus;
}
