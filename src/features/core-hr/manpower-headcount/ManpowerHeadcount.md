# Manpower Headcount Module

## Overview
The Manpower Headcount module enables HR teams to plan and manage headcount requests across organizational levels. It supports a full lifecycle: drafting, submitting, reviewing, and approving/rejecting requests.

## Routes
| Path | Description |
|------|-------------|
| `/core-hr/manpower-headcount` | List view of all headcount requests |
| `/core-hr/manpower-headcount?mode=create` | Initiate a new headcount request |
| `/core-hr/manpower-headcount?mode=action` | Review and approve/reject a request |

## Features
- **List View** — filterable table of all HC requests with status badges, headcount stats, and action dropdown
- **Initiate Request** — multi-row org level picker, required HC input, budget range, justification, file attachments
- **Review / Action** — edit required HC per level, approve or reject with reason
- **View Details Modal** — read-only summary of a request including org levels and attachments
- **Approval Workflow Modal** — step-by-step approval chain with timestamps and rejection reasons
- **Action History Modal** — audit log of all changes (created, submitted, approved, rejected)

## Breadcrumb
- List view: `Core HR & Employee › Manpower Headcount`
- Create form: `Core HR & Employee › Manpower Headcount › Initiate Headcount Request`
- Action form: `Core HR & Employee › Manpower Headcount › Approve / Reject Request`

All breadcrumb levels are clickable.
- Clicking `Manpower Headcount` from create/action mode returns to `/core-hr/manpower-headcount` (list view).
- Clicking `Core HR & Employee` routes to `/core-hr/organogram`.

## Key Components

| Component | Purpose |
|-----------|---------|
| `HeadcountListView` | Main list/filter/table UI |
| `InitiateHeadcountForm` | Create & Action form |
| `OrgLevelPickerDrawer` | Hierarchical org-level selector (shared with Requisition) |
| `ViewRequestModal` | Read-only detail modal with attachments |
| `ApprovalWorkflowModal` | Shows the approval chain |
| `ActionHistoryModal` | Shows audit history |

## Data Types (`headcount.types.ts`)

```ts
HCStatus    = 'Draft' | 'Pending' | 'Approved' | 'Rejected'
HCRequest   = { id, planYear, initiationDate, rows, status, totalReqHC, totalApprHC, approvalWorkflow, actionHistory, attachments? }
HCOrgLevelRow = { id, orgLevelPath, department, designation, currentHC, requiredHC, budgetRange, justification }
HCAttachment  = { uid, name, size?, objectUrl? }
ApprovalStep  = { approverName, approverId, action, timestamp?, reason?, note? }
ActionHistoryEntry = { initiatedBy, timestamp, actionType }
```

## Form — Create Mode
- Select Plan Year
- Add one or more Organization Levels via `OrgLevelPickerDrawer`
- For each row: input Required HC, Budget Range, Justification
- Attach supporting documents (multi-file upload with inline view/remove)
- Buttons: **Reset** | **Save Draft** | **Submit Request**
- Approve/Reject buttons are **not shown** in create mode

## Form — Action Mode
- Pre-filled with the existing request data
- Required HC is editable per level; Justification is read-only
- Reject panel opens inline with a reason dropdown and optional note
- Buttons: **Reset** | **Reject** | **Approve**

## Status Flow
```
Draft → Pending → Approved
                → Rejected
```

## Attachments
- Multi-file upload via Ant Design `Upload` component (`beforeUpload` hook, no auto-upload)
- Files stored in local component state as `UploadFile[]`
- View opens a Modal (image/PDF inline, other files via "Open File" link)
- Remove triggers a `Popconfirm` before deletion
- Shown in `ViewRequestModal` with name, size, and view link
