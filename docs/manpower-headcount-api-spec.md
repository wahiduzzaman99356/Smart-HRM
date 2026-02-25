# Manpower Headcount API Specification

> **Feature:** Core HR → Manpower Headcount
> **Date:** 2026-02-25
> **Frontend Stack:** React + TypeScript
> **Base URL prefix:** `/api/v1/headcount`

---

## Overview

The Manpower Headcount module manages workforce planning requests.
An HR initiator creates a **headcount request** selecting org levels (department + designation), entering required headcount, budget range, and justification.
The request then flows through a **multi-step approval workflow** where approvers can Approve or Reject it, each step being recorded in an **action history** audit trail.

The frontend currently uses **in-memory state** (no persistence). All state management must be replaced by these APIs.

---

## Workflows

```
Initiator creates request  →  status: "Draft"
Initiator submits request  →  status: "Pending"
Approver takes action:
  Approve  →  status: "Approved"  (first pending step marked Approved)
  Reject   →  status: "Rejected"  (first pending step marked Rejected)
```

---

## Data Models

### HCStatus (enum)
```
"Draft"     — saved but not yet submitted
"Pending"   — submitted, waiting for approver action
"Approved"  — approved by the current approver step
"Rejected"  — rejected by an approver
```

### ApprovalStepAction (enum)
```
"Approved" | "Rejected" | "Pending"
```

### ActionType (enum)
```
"Created" | "Submitted" | "Approved" | "Rejected" | "Updated"
```

### RejectReason (enum)
```
"budget"       — Budget Constraint
"freeze"       — Headcount Freeze
"not_aligned"  — Not Aligned with Business Plan
"pending"      — Pending Further Review
"others"       — Others (requires a free-text note)
```

---

## Object Schemas

### HCOrgLevelRow

One line item in the request — represents one department + designation combination.

```jsonc
{
  "id": "string",               // UUID, server-generated
  "orgLevelPath": "string",     // e.g. "Flight Operations > Captain ATR 72-600"
  "department": "string",       // DeptKey, e.g. "flight_ops"
  "designation": "string",      // e.g. "Captain ATR 72-600"
  "currentHC": "integer",       // current headcount (read-only, from employee data)
  "requiredHC": "integer",      // requested additional headcount
  "budgetRange": "string",      // free text, e.g. "BDT 50,000 – 80,000"
  "justification": "string"     // free text reason
}
```

### ApprovalStep

One step in the multi-level approval chain.

```jsonc
{
  "approverName": "string",
  "approverId": "string",                           // employee ID, e.g. "TN-92001"
  "action": "Approved | Rejected | Pending",
  "timestamp": "string | null",                     // ISO 8601 or null if Pending
  "reason": "string | null",                        // rejection reason label
  "note": "string | null"                           // free-text note (rejection only)
}
```

### ActionHistoryEntry

Immutable audit log entry. Append-only — never update or delete.

```jsonc
{
  "id": "string",                                   // UUID
  "initiatedBy": "string",                          // full name + role, e.g. "Shanto (Admin)"
  "timestamp": "string",                            // ISO 8601
  "actionType": "Created | Submitted | Approved | Rejected | Updated"
}
```

### HCRequest (full record)

```jsonc
{
  "id": "string",                 // Reference no., e.g. "TSL-2026-00142"
  "planYear": "string",           // e.g. "FY 2026 (Jan - Dec)"
  "initiationDate": "string",     // ISO 8601 date
  "status": "Draft | Pending | Approved | Rejected",
  "totalReqHC": "integer",        // sum of requiredHC across all rows
  "totalApprHC": "integer | null",// sum approved; null until approver sets it

  "rows": [/* HCOrgLevelRow[] */],
  "approvalWorkflow": [/* ApprovalStep[] */],
  "actionHistory": [/* ActionHistoryEntry[] */]
}
```

---

## API Endpoints

---

### 1. List Headcount Requests

**`GET /api/v1/headcount/requests`**

Paginated, filterable list shown in the Headcount Management table.

**Query Parameters**

| Param        | Type   | Description                                                        |
|--------------|--------|--------------------------------------------------------------------|
| `dateFrom`   | string | ISO date — filter by `initiationDate` range start                 |
| `dateTo`     | string | ISO date — filter by `initiationDate` range end                   |
| `planYear`   | string | e.g. `FY 2026 (Jan - Dec)`                                        |
| `status`     | string | `Draft` / `Pending` / `Approved` / `Rejected`                     |
| `search`     | string | Free-text search on `id` (reference number)                       |
| `page`       | int    | Page number (1-based), default `1`                                 |
| `pageSize`   | int    | Items per page, default `20`                                       |

**Response `200 OK`**
```jsonc
{
  "data": [
    {
      "id": "TSL-2026-00142",
      "planYear": "FY 2026 (Jan - Dec)",
      "initiationDate": "2026-01-20",
      "status": "Draft",
      "totalReqHC": 10,
      "totalApprHC": 9
    }
    // ...
  ],
  "meta": {
    "total": 42,
    "page": 1,
    "pageSize": 20
  }
}
```

> The list view only needs the summary fields. `rows`, `approvalWorkflow`, and `actionHistory` are **not** required here — they are fetched separately by detail endpoints.

---

### 2. Get Single Request (Detail / View Modal)

**`GET /api/v1/headcount/requests/:requestId`**

Returns the full request including rows, workflow, and history.

**Response `200 OK`**
```jsonc
{
  "data": {
    "id": "TSL-2026-00142",
    "planYear": "FY 2026 (Jan - Dec)",
    "initiationDate": "2026-01-20",
    "status": "Draft",
    "totalReqHC": 10,
    "totalApprHC": 9,
    "rows": [
      {
        "id": "row-uuid-1",
        "orgLevelPath": "Flight Operations > Captain ATR 72-600",
        "department": "flight_ops",
        "designation": "Captain ATR 72-600",
        "currentHC": 2,
        "requiredHC": 10,
        "budgetRange": "",
        "justification": ""
      }
    ],
    "approvalWorkflow": [
      {
        "approverName": "Farjana Alim",
        "approverId": "TN-99999",
        "action": "Approved",
        "timestamp": "2026-01-20T10:30:00Z",
        "reason": null,
        "note": null
      },
      {
        "approverName": "Tahamid",
        "approverId": "TN-00007",
        "action": "Rejected",
        "timestamp": "2026-01-20T11:15:00Z",
        "reason": "Budget Constraint",
        "note": "EXCEEDS ANNUAL BUDGET CAP."
      },
      {
        "approverName": "Approver 3",
        "approverId": "",
        "action": "Pending",
        "timestamp": null,
        "reason": null,
        "note": null
      }
    ],
    "actionHistory": [
      {
        "id": "hist-uuid-1",
        "initiatedBy": "Shanto (Admin)",
        "timestamp": "2026-01-20T10:30:22Z",
        "actionType": "Created"
      }
    ]
  }
}
```

---

### 3. Create Headcount Request

**`POST /api/v1/headcount/requests`**

Initiator submits a new request. Can be saved as `Draft` or directly submitted as `Pending`.

**Request Body**
```jsonc
{
  "planYear": "FY 2026 (Jan - Dec)",     // required
  "status": "Draft",                     // "Draft" (save) or "Pending" (submit immediately)
  "rows": [
    {
      "orgLevelPath": "Flight Operations > Captain ATR 72-600",
      "department": "flight_ops",
      "designation": "Captain ATR 72-600",
      "currentHC": 2,
      "requiredHC": 10,
      "budgetRange": "BDT 50,000 – 80,000",
      "justification": "New fleet expansion requires additional pilots."
    }
  ]
}
```

**Business Rules:**
- At least one row is required.
- `requiredHC` must be a positive integer.
- Server generates: `id` (reference no. in `TSL-YYYY-NNNNN` format), `initiationDate` (today), `totalReqHC` (sum of rows), `totalApprHC: null`, default `approvalWorkflow` steps, first `actionHistory` entry.

**Response `201 Created`**
```jsonc
{
  "data": {
    "id": "TSL-2026-00145",
    "planYear": "FY 2026 (Jan - Dec)",
    "initiationDate": "2026-02-25",
    "status": "Draft",
    "totalReqHC": 10,
    "totalApprHC": null,
    "rows": [ /* ...with server-generated row IDs... */ ],
    "approvalWorkflow": [
      { "approverName": "Approver 1", "approverId": "", "action": "Pending", "timestamp": null, "reason": null, "note": null },
      { "approverName": "Approver 2", "approverId": "", "action": "Pending", "timestamp": null, "reason": null, "note": null }
    ],
    "actionHistory": [
      { "id": "hist-uuid", "initiatedBy": "Admin User", "timestamp": "2026-02-25T...", "actionType": "Created" }
    ]
  }
}
```

> **Note:** The number of default approval workflow steps and who the approvers are should be configured server-side (e.g. from an approval chain configuration). The frontend currently seeds two placeholder steps.

---

### 4. Submit Draft → Pending

**`PATCH /api/v1/headcount/requests/:requestId/submit`**

Transitions a `Draft` request to `Pending`, making it available for approver action.

**Request Body** — none required.

**Business Rules:**
- Only allowed when `status === "Draft"`.
- Appends a `"Submitted"` entry to `actionHistory`.

**Response `200 OK`**
```jsonc
{
  "data": {
    "id": "TSL-2026-00142",
    "status": "Pending",
    "actionHistory": [
      /* existing entries... */,
      { "id": "hist-uuid-2", "initiatedBy": "Admin User", "timestamp": "2026-02-25T...", "actionType": "Submitted" }
    ]
  }
}
```

---

### 5. Approve Request

**`PATCH /api/v1/headcount/requests/:requestId/approve`**

Approver approves the request, optionally modifying the `requiredHC` values per row before approving.

**Request Body**
```jsonc
{
  "rows": [
    {
      "id": "row-uuid-1",
      "requiredHC": 8    // approver may reduce/change the requested number
    }
  ]
}
```

**Business Rules:**
- Only allowed when `status === "Pending"`.
- The **first** `ApprovalStep` with `action === "Pending"` is updated to `"Approved"` with current timestamp.
- `totalReqHC` is recalculated from the (possibly updated) rows.
- `status` is set to `"Approved"`.
- A `"Approved"` entry is appended to `actionHistory`.

**Response `200 OK`** — returns the full updated `HCRequest` object (same shape as Get Single Request).

---

### 6. Reject Request

**`PATCH /api/v1/headcount/requests/:requestId/reject`**

Approver rejects the request with a mandatory reason and optional note.

**Request Body**
```jsonc
{
  "rows": [
    {
      "id": "row-uuid-1",
      "requiredHC": 10     // rows as-is or modified
    }
  ],
  "reason": "budget",             // RejectReason enum value (required)
  "note": "Exceeds annual cap."   // free-text note; required only when reason = "others"
}
```

**Business Rules:**
- Only allowed when `status === "Pending"`.
- The **first** `ApprovalStep` with `action === "Pending"` is updated to `"Rejected"` with timestamp, `reason` label (human-readable), and `note`.
- `status` is set to `"Rejected"`.
- A `"Rejected"` entry is appended to `actionHistory`.

**Response `200 OK`** — returns the full updated `HCRequest` object.

---

### 7. Get Approval Workflow (Modal)

**`GET /api/v1/headcount/requests/:requestId/workflow`**

Returns only the approval workflow steps for the Approval Workflow modal.

**Response `200 OK`**
```jsonc
{
  "data": {
    "requestId": "TSL-2026-00142",
    "approvalWorkflow": [
      {
        "approverName": "Farjana Alim",
        "approverId": "TN-99999",
        "action": "Approved",
        "timestamp": "2026-01-20T10:30:00Z",
        "reason": null,
        "note": null
      }
      // ...
    ]
  }
}
```

> This can also be served by the full detail endpoint (`GET /requests/:id`). A dedicated endpoint is optional — include if the workflow modal needs a lighter, faster call.

---

### 8. Get Action History (Modal)

**`GET /api/v1/headcount/requests/:requestId/history`**

Returns only the action history entries for the Action History modal.

**Response `200 OK`**
```jsonc
{
  "data": {
    "requestId": "TSL-2026-00142",
    "actionHistory": [
      {
        "id": "hist-uuid-1",
        "initiatedBy": "Shanto (Admin)",
        "timestamp": "2026-01-20T10:30:22Z",
        "actionType": "Created"
      },
      {
        "id": "hist-uuid-2",
        "initiatedBy": "Wahid (Manager)",
        "timestamp": "2026-01-20T10:34:22Z",
        "actionType": "Approved"
      }
    ]
  }
}
```

---

### 9. Org Level Picker — Tree Data

**`GET /api/v1/headcount/org-levels`**

Returns the tree of selectable org levels for the **Select Organization Level** drawer in the create form. This is derived from the live organogram (see organogram API spec). Each selectable leaf node returns the org level path, department, designation, and current headcount count.

**Query Parameters**

| Param    | Type   | Description                          |
|----------|--------|--------------------------------------|
| `search` | string | Filter by designation or department  |

**Response `200 OK`**
```jsonc
{
  "data": [
    {
      "key": "org-node-uuid",           // organogram node ID
      "label": "Director Flight Operations",
      "orgLevelPath": "Director Flight Operations",
      "department": "flight_ops",
      "departmentLabel": "Flight Operations",
      "designation": "Director Flight Operations",
      "currentHC": 1,
      "selectable": true,
      "children": [
        {
          "key": "org-node-uuid-2",
          "label": "Manager, Flight Operations",
          "orgLevelPath": "Director Flight Operations > Manager, Flight Operations",
          "department": "flight_ops",
          "departmentLabel": "Flight Operations",
          "designation": "Manager, Flight Operations",
          "currentHC": 1,
          "selectable": true,
          "children": []
        }
      ]
    }
    // ...
  ],
  "isOrganogramConfigured": true   // false = fallback dept/designation tree was returned
}
```

> If the organogram has not been configured yet, the backend falls back to a flat **department → designation** tree built from the master designation list (same data as `GET /organogram/departments` + `GET /organogram/designations`).

---

### 10. Plan Year Options

**`GET /api/v1/headcount/plan-years`**

Returns the list of selectable fiscal year options for the plan year dropdown.

**Response `200 OK`**
```jsonc
{
  "data": [
    { "value": "FY 2026 (Jan - Dec)", "label": "FY 2026 (Jan - Dec)" },
    { "value": "FY 2025 (Jan - Dec)", "label": "FY 2025 (Jan - Dec)" },
    { "value": "FY 2024 (Jan - Dec)", "label": "FY 2024 (Jan - Dec)" },
    { "value": "FY 2023 (Jan - Dec)", "label": "FY 2023 (Jan - Dec)" }
  ]
}
```

---

## Reference Number Format

The frontend currently generates IDs like `TSL-2026-00142`. The backend should own this generation.

Suggested format: `TSL-{YYYY}-{5-digit-sequence}` where `YYYY` is the initiation year and the sequence is globally incrementing per year.

Example: `TSL-2026-00142`

---

## Error Response Format

All errors follow this envelope:

```jsonc
{
  "error": {
    "code": "REQUEST_NOT_FOUND",
    "message": "Headcount request TSL-2026-00142 does not exist."
  }
}
```

| HTTP Code | Scenario                                              |
|-----------|-------------------------------------------------------|
| 400       | Validation error (missing rows, invalid status transition, etc.) |
| 404       | Request or row not found                              |
| 409       | Invalid status transition (e.g. approving a Draft)    |
| 500       | Internal server error                                 |

---

## Status Transition Rules (State Machine)

```
Draft    ──submit──►  Pending
Pending  ──approve──► Approved
Pending  ──reject───► Rejected
```

Any other transition should return `409 Conflict`.

---

## Frontend Integration Notes

1. **Reference ID:** The frontend currently generates IDs with a local counter. The backend must generate `TSL-YYYY-NNNNN` IDs and return them in the `POST /requests` response.
2. **Approval workflow seeding:** On creation, the backend should seed the `approvalWorkflow` array with the configured approvers for the company. Currently the frontend seeds two placeholder steps with empty `approverId`.
3. **currentHC on org level rows:** When creating a request, the frontend pre-fills `currentHC` from the organogram/employee data. The backend should store it as a snapshot at request time (not recalculate later), since headcount changes over time.
4. **totalReqHC recalculation:** Must be recalculated server-side on Approve/Reject since the approver may edit row `requiredHC` values before taking action.
5. **totalApprHC:** Currently `null` in most seed data. It should be set server-side when approved if a business rule for it exists — otherwise keep it `null` until explicitly set.
6. **Timestamps:** Store as ISO 8601 UTC. Frontend formats them for display (e.g. `"20 Jan 2026, 10:30 AM"`).
7. **Pagination:** The list view does not currently paginate, but adding server-side pagination from the start is strongly recommended.

---

## Endpoints Summary

| Method  | Path                                               | Description                            |
|---------|----------------------------------------------------|----------------------------------------|
| `GET`   | `/api/v1/headcount/requests`                       | List all requests (filterable)         |
| `GET`   | `/api/v1/headcount/requests/:id`                   | Get full request detail                |
| `POST`  | `/api/v1/headcount/requests`                       | Create new headcount request           |
| `PATCH` | `/api/v1/headcount/requests/:id/submit`            | Submit Draft → Pending                 |
| `PATCH` | `/api/v1/headcount/requests/:id/approve`           | Approve request (with optional edits)  |
| `PATCH` | `/api/v1/headcount/requests/:id/reject`            | Reject request with reason + note      |
| `GET`   | `/api/v1/headcount/requests/:id/workflow`          | Approval workflow steps only (modal)   |
| `GET`   | `/api/v1/headcount/requests/:id/history`           | Action history entries only (modal)    |
| `GET`   | `/api/v1/headcount/org-levels`                     | Org level picker tree data             |
| `GET`   | `/api/v1/headcount/plan-years`                     | Plan year dropdown options             |
