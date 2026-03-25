# Provident Fund API Specification

> **Feature:** Provident Fund (ESS)
> **Date:** 2026-03-25
> **Status:** Draft (derived from UI types)

---

## Overview

The Provident Fund module allows employees to view their PF balance and apply for PF loans. Managers can approve or reject requests individually or in bulk. PF loan repayment is deducted from payroll over a fixed 3-month schedule.

---

## Base URL

`/api/v1/provident-fund`

---

## Common Types

### PFLoanStatus
`"To Approve" | "Approved" | "Rejected" | "Cancelled"`

### PFBalance Object
```json
{
  "currentBalance": 7890,
  "employeeContribution": 4890,
  "employerContribution": 3000
}
```

### PFLoanRequest Object
```json
{
  "id": "PF-2026-001",
  "initiateDate": "20 Feb 2026",
  "loanAmount": 5000,
  "reason": "Medical emergency expenses",
  "guarantorEmployeeId": "TN-99210",
  "guarantorEmployeeName": "Wahid Uzzaman",
  "attachmentName": "medical_report.pdf",
  "status": "To Approve",
  "remarks": null,
  "employeeId": "TN-99318",
  "employeeName": "Shanto Karmoker",
  "designation": "Business Analyst",
  "department": "Business Analysis",
  "section": "Analytics",
  "createdAt": "20 Feb 2026, 10:30 AM"
}
```

---

## Endpoints

---

### 1) Get PF Balance (Employee)
**`GET /api/v1/provident-fund/balance`**

Returns the authenticated employee's current PF balance.

**Response `200`:**
```json
{
  "employeeId": "TN-99318",
  "currentBalance": 7890,
  "employeeContribution": 4890,
  "employerContribution": 3000,
  "maxLoanEligible": 3912,
  "lastUpdated": "2026-03-01"
}
```

**Note:** `maxLoanEligible` = 80% of `employeeContribution` (per policy).

---

### 2) List My PF Loan Requests (Employee)
**`GET /api/v1/provident-fund/my-requests`**

Returns PF loan requests for the authenticated employee.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `status` | `PFLoanStatus` | Filter by status |
| `page` | integer | Page number (default: 1) |
| `pageSize` | integer | Items per page (default: 20) |

**Response `200`:**
```json
{
  "data": [PFLoanRequest, ...],
  "total": 4,
  "page": 1,
  "pageSize": 20
}
```

---

### 3) List Approval Queue (Manager)
**`GET /api/v1/provident-fund/approvals`**

Returns all PF loan requests visible to the approving manager.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `status` | `PFLoanStatus` | Filter by status |
| `search` | string | Search by employee name or request ID |
| `page` | integer | Page number |
| `pageSize` | integer | Items per page |

**Response `200`:**
```json
{
  "data": [PFLoanRequest, ...],
  "total": 10,
  "pendingCount": 2,
  "page": 1,
  "pageSize": 20
}
```

---

### 4) Get PF Loan Request Detail
**`GET /api/v1/provident-fund/requests/:id`**

**Response `200`:** Full `PFLoanRequest` object.

**Response `404`:** Request not found.

---

### 5) Create PF Loan Request (Employee)
**`POST /api/v1/provident-fund/requests`**

**Request Body:**
```json
{
  "loanAmount": 5000,
  "reason": "Medical emergency expenses",
  "guarantorEmployeeId": "TN-99210",
  "attachmentName": "medical_report.pdf"
}
```

**Validation Rules:**
- `loanAmount` — required; must be ≤ 80% of the employee's own PF contribution
- `reason` — required
- `guarantorEmployeeId` — required; must be a valid active employee (not the requester)

**Business Rules:**
- Only one active (non-rejected/non-cancelled) PF loan allowed at a time
- Approved PF loans become effective 30 days after request date
- Repayment period is fixed at 3 months, deducted from salary

**Response `201`:** Created `PFLoanRequest` with `status: "To Approve"`.

**Response `422`:** Validation error.

---

### 6) Cancel PF Loan Request (Employee)
**`POST /api/v1/provident-fund/requests/:id/cancel`**

**Allowed only when:** `status === "To Approve"`

**Response `200`:** Updated request with `status: "Cancelled"`.

**Response `409`:** Request is not in a cancellable state.

---

### 7) Approve PF Loan Request (Manager)
**`POST /api/v1/provident-fund/requests/:id/approve`**

**Request Body:**
```json
{
  "remarks": "Approved as per policy."
}
```

**Allowed only when:** `status === "To Approve"`

**Response `200`:** Updated request with `status: "Approved"`.

---

### 8) Reject PF Loan Request (Manager)
**`POST /api/v1/provident-fund/requests/:id/reject`**

**Request Body:**
```json
{
  "remarks": "Loan amount exceeds 80% of own contribution."
}
```

**Validation Rules:**
- `remarks` — required for rejection

**Allowed only when:** `status === "To Approve"`

**Response `200`:** Updated request with `status: "Rejected"`.

---

### 9) Bulk Approve (Manager)
**`POST /api/v1/provident-fund/approvals/bulk-approve`**

**Request Body:**
```json
{
  "ids": ["PF-2026-001", "PF-2026-003"],
  "remarks": "Bulk approved."
}
```

**Business Rule:** Only requests with `status === "To Approve"` are processed; others are skipped.

**Response `200`:**
```json
{
  "approved": 2,
  "skipped": 0
}
```

---

### 10) Bulk Reject (Manager)
**`POST /api/v1/provident-fund/approvals/bulk-reject`**

**Request Body:**
```json
{
  "ids": ["PF-2026-002"],
  "remarks": "Bulk rejected — budget freeze."
}
```

**Response `200`:**
```json
{
  "rejected": 1,
  "skipped": 0
}
```

---

### 11) Reference Data
**`GET /api/v1/provident-fund/reference`**

Returns guarantor employee list and policy notes.

**Response `200`:**
```json
{
  "guarantorEmployees": [
    {
      "employeeId": "TN-99210",
      "name": "Wahid Uzzaman",
      "designation": "Senior Developer",
      "department": "IT"
    }
  ],
  "policyNotes": [
    "Provident Fund contributions will start only after your employment confirmation.",
    "..."
  ]
}
```

---

## Status Flow

```
To Approve → Approved
To Approve → Rejected
To Approve → Cancelled (by employee)
```

Only requests in `"To Approve"` status can be actioned.

## Policy Summary

| Rule | Value |
|------|-------|
| Max loan eligibility | 80% of own contribution |
| Repayment period | 3 months (auto-deducted from payroll) |
| Effective date | 30 days after approval |
| Concurrent loans | 1 active loan at a time |
