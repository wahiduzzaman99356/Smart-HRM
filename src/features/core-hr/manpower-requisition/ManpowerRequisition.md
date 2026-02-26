# Manpower Requisition Module

## Overview
The Manpower Requisition module enables HR and department heads to raise, track, and manage Manpower Requisition Forms (MRFs). Each request captures position details, candidate requirements, and goes through an approval workflow.

## Routes
| Path | Description |
|------|-------------|
| `/core-hr/requisition` | List view of all MRF requests |
| `/core-hr/requisition?mode=create` | Create a new Manpower Requisition Form |
| `/core-hr/requisition?mode=action` | Review and approve/reject an existing MRF |

## Features
- **List View** — filterable table of all MRFs with status badges, dept/designation, requested/approved counts, action dropdown
- **MRF Form** — comprehensive form covering all requisition details (position, requirements, attachments)
- **View Details Modal** — read-only summary including all form fields and attachments
- **Approval Workflow Modal** — step-by-step approval chain
- **Action History Modal** — full audit log

## Breadcrumb
- List view: `Core HR & Employee › Manpower Requisition`
- Create/Action form: `Core HR & Employee › Manpower Requisition › Manpower Requisition Form`

All breadcrumb levels are clickable.
- Clicking `Manpower Requisition` from create/action mode returns to `/core-hr/requisition` (list view).
- Clicking `Core HR & Employee` routes to `/core-hr/organogram`.

## Key Components

| Component | Purpose |
|-----------|---------|
| `RequisitionListView` | Main list/filter/table UI |
| `RequisitionForm` | Create & Action form (all MRF fields) |
| `ViewRequisitionModal` | Read-only detail modal with attachments |
| `ApprovalWorkflowModal` | Shows the approval chain |
| `ActionHistoryModal` | Shows audit history |

## Data Types (`requisition.types.ts`)

```ts
RequisitionStatus    = 'Draft' | 'Pending' | 'Approved' | 'Rejected'
RequisitionFormData  = { dateTime, selectedLevel, refNo, typeOfRequisition: string[], vacancyNumber,
                         employee, employmentType, inputInDays, workLocation, gender, etaDate,
                         experienceMode, yearsOfExperience, preferableDesired,
                         ageMode, ageMinimum, ageMaximum, ageFrom, ageTo,
                         educationQualification, educationField, educationCourse, educationNote,
                         skillsRequired, jobResponsibility, trainingSpecialization,
                         otherRequirements, justification }
RequisitionRequest   = { id, refNo, initiateDate, requested, approved, status, department,
                         designation, formData, approvalWorkflow, actionHistory, attachments? }
RequisitionAttachment = { uid, name, size?, objectUrl? }
```

## Form Sections

### 1. Basic Info
- **Date & Time** — DatePicker with time
- **Organization Level** — picker via `OrgLevelPickerDrawer` (same as Headcount)
- **Ref No** — free text

### 2. Type of Requisition (Checkboxes — both selectable simultaneously)
- **New Recruitment** — includes Vacancy Number input
- **Replacement** — includes multi-select Employee picker
- Summary panel shows Total in Dept, In This Position, Remaining HC, Separation, Required

### 3. Employment Details
- Employment Type: Full Time / Contractual / Intern
  - **INPUT IN DAYS** only appears when Contractual is selected
- Work Location, Gender, ETA Date

### 4. Experience
- **Fresher** (default) — no additional fields
- **Experienced** — shows Years of Experience + Preferable/Desired fields

### 5. Age
- Three mutually exclusive modes: Minimum | Maximum | Range
- Selecting one mode disables the other mode inputs

### 6. Educational Requirements
- **Qualification Type** — dropdown (SSC / HSC / Diploma / Bachelor / Masters / PhD)
- **Qualification Title** — context-sensitive dropdown based on Qualification Type
- **Major / Group** — context-sensitive dropdown based on Qualification Type
- **CGPA / GPA** — free text with "out of X.XX" hint based on Qualification Type
- **Multiple Rows** — click `+` to add multiple educational requirement entries
- Preview bar shows: `SSC › Secondary School Certificate › Science › GPA 4.80 › Out of 5.00`

### 7. Skills Required
- Searchable multi-select from 37 predefined skill options

### 8. Rich Text Editors
- **Job Responsibility**, **Training & Specialization**, **Other Requirements**
- Custom `contentEditable` editor with toolbar: Bold, Italic, Underline, Bullet List, Numbered List, Align Left, Align Center

### 9. Justification
- Plain text area

### 10. Attachments
- Multi-file upload (no auto-upload, stored locally)
- View opens a Modal (image/PDF inline, other files via "Open File" link)
- Remove triggers a `Popconfirm` before deletion

## Action Buttons
| Mode | Buttons |
|------|---------|
| Create | Reset · Save Draft · Submit Request |
| Action | Reject · Approve · Reset · Save Draft · Submit Request |

## Qualification Lookup

| Type | Title Examples | Major Examples |
|------|---------------|----------------|
| SSC | Secondary School Certificate | Science, Humanities, Commerce |
| HSC | Higher Secondary School Certificate | Science, Humanities, Commerce |
| Diploma | Diploma in Engineering, Diploma in CS, … | Civil, Electrical, Computer Science, … |
| Bachelor | BBA, B.Sc, B.Engg, MBBS, … | CSE, EEE, Finance, Marketing, Law, … |
| Masters | MBA, M.Sc, M.Engg, … | CSE, EEE, Finance, Public Health, … |
| PhD | Doctor of Philosophy (PhD) | Computer Science, Medical Science, … |

## Status Flow
```
Draft → Pending → Approved
                → Rejected
```

## Filter Capabilities
### Quick Bar
- Date range, Status, MRF No / Ref ID

### Advanced Drawer
- Type of Requisition, Employment Type, Department, Designation, Gender, Work Location, Experience, Qualification Type
