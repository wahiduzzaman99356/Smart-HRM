# Manpower Requisition API Specification

> **Feature:** Core HR → Manpower Requisition
> **Date:** 2026-02-26
> **Frontend Stack:** React + TypeScript
> **Base URL prefix:** `/api/v1/requisition`

---

## Overview

The Manpower Requisition module manages MRF lifecycle from draft creation to approval/rejection.
A request captures requisition details (organization level, vacancy context, requirements, skills, responsibilities, and attachments), then passes through approval workflow and action history tracking.

The frontend currently uses in-memory state. These APIs define the backend contract for persistence and workflow actions.

---

## Workflows

```
Create Draft   → status: "Draft"
Submit Request → status: "Pending"
Approver Action:
  Approve      → status: "Approved"
  Reject       → status: "Rejected"
```

---

## Core Data Models

### RequisitionStatus (enum)
```
"Draft" | "Pending" | "Approved" | "Rejected"
```

### ActionType (enum)
```
"Created" | "Submitted" | "Approved" | "Rejected" | "Updated" | "Draft Saved"
```

### RequisitionRequest (summary)
```jsonc
{
  "id": "string",                 // e.g. MRF200301xx
  "refNo": "string",
  "initiateDate": "string",       // ISO date
  "requested": "integer",
  "approved": "integer",
  "status": "Draft | Pending | Approved | Rejected",
  "department": "string",
  "designation": "string"
}
```

### RequisitionRequestDetail (full)
```jsonc
{
  "id": "string",
  "refNo": "string",
  "initiateDate": "string",
  "requested": "integer",
  "approved": "integer",
  "status": "Draft | Pending | Approved | Rejected",
  "department": "string",
  "designation": "string",
  "formData": {
    "dateTime": "string",
    "selectedLevel": "string",
    "vacancyNumber": "string",
    "employmentType": "string",
    "workLocation": "string",
    "gender": "string",
    "etaDate": "string",
    "skillsRequired": ["string"],
    "jobResponsibility": "string",
    "trainingSpecialization": "string",
    "otherRequirements": "string",
    "justification": "string"
  },
  "approvalWorkflow": [
    {
      "approverName": "string",
      "action": "Approved | Rejected | Pending",
      "timestamp": "string | null",
      "reason": "string | null"
    }
  ],
  "actionHistory": [
    {
      "initiatedBy": "string",
      "timestamp": "string",
      "actionType": "Created | Submitted | Approved | Rejected | Updated | Draft Saved"
    }
  ],
  "attachments": [
    {
      "id": "string",
      "fileName": "string",
      "size": "integer",
      "mimeType": "string",
      "url": "string"
    }
  ]
}
```

---

## API Endpoints

### 1) List requisitions
**`GET /api/v1/requisition/requests`**

Query params:
- `dateFrom`, `dateTo`
- `status`
- `department`
- `search` (by id/refNo)
- `page`, `pageSize`

Response:
```jsonc
{
  "data": [/* RequisitionRequest[] */],
  "meta": { "total": 0, "page": 1, "pageSize": 20 }
}
```

### 2) Get requisition detail
**`GET /api/v1/requisition/requests/:requestId`**

Response:
```jsonc
{ "data": {/* RequisitionRequestDetail */} }
```

### 3) Create requisition (draft or pending)
**`POST /api/v1/requisition/requests`**

Request:
```jsonc
{
  "status": "Draft | Pending",
  "formData": {/* requisition form payload */},
  "attachments": ["fileId-1", "fileId-2"]
}
```

Response:
```jsonc
{ "data": {/* RequisitionRequestDetail */} }
```

### 4) Update requisition draft/form
**`PATCH /api/v1/requisition/requests/:requestId`**

Request:
```jsonc
{
  "formData": {/* updated fields */},
  "attachments": ["fileId-1"],
  "status": "Draft | Pending"
}
```

### 5) Submit requisition
**`POST /api/v1/requisition/requests/:requestId/submit`**

Response:
```jsonc
{ "data": { "id": "MRF200301xx", "status": "Pending" } }
```

### 6) Approve requisition
**`POST /api/v1/requisition/requests/:requestId/approve`**

Request:
```jsonc
{
  "approvedVacancy": 3,
  "note": "Approved by department head"
}
```

Response:
```jsonc
{ "data": { "id": "MRF200301xx", "status": "Approved" } }
```

### 7) Reject requisition
**`POST /api/v1/requisition/requests/:requestId/reject`**

Request:
```jsonc
{
  "reason": "Not Aligned with Business Plan",
  "note": "Please revise requirement scope"
}
```

Response:
```jsonc
{ "data": { "id": "MRF200301xx", "status": "Rejected" } }
```

### 8) Upload attachment
**`POST /api/v1/requisition/attachments`** (multipart/form-data)

Response:
```jsonc
{
  "data": {
    "id": "att-uuid",
    "fileName": "requisition-note.pdf",
    "size": 104857,
    "mimeType": "application/pdf",
    "url": "https://..."
  }
}
```

### 9) Delete attachment
**`DELETE /api/v1/requisition/attachments/:attachmentId`**

Response:
```jsonc
{ "ok": true }
```

---

## Breadcrumb & Route expectations

- List route: `/core-hr/requisition`
- Form route (create): `/core-hr/requisition?mode=create`
- Form route (action): `/core-hr/requisition?mode=action`

Navigation back to list should always remove `mode` from query params and return list view.
