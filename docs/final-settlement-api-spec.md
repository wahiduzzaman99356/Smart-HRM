# Final Settlement API Specification

> **Feature:** Final Settlement
> **Date:** 2026-04-01
> **Status:** Active

---

## Overview

Handles full-and-final settlement computation, approval workflow, and payment tracking for separating employees. Each settlement record embeds three breakdowns: **Settlement Breakdown**, **Resignation Details**, and **Clearance Report**.

---

## Base URL

`/api/v1/final-settlement`

---

## Data Contracts

### SettlementRecord

```json
{
  "id": "fst-001",
  "empName": "Aisha Patel",
  "empId": "FS-001",
  "department": "Finance",
  "designation": "Financial Analyst",
  "reason": "Contract Expiry",
  "tenure": "2 Years, 9 Months",
  "lastWorkingDay": "2026-03-28",
  "dateOfJoining": "2023-06-01",
  "payables": [
    { "label": "Monthly Salary (Pro-rata) (28d)", "amount": 8500 },
    { "label": "Leave Encashment (12d)",         "amount": 2400 },
    { "label": "Bonus",                          "amount": 1200 }
  ],
  "deductions": [
    { "label": "Tax Deduction", "amount": 350 },
    { "label": "ID Card",       "amount": 100 }
  ],
  "status": "Paid",
  "preparedBy": "Payroll Officer",
  "checkedBy": "Manager, Human Resources",
  "approvedBy": "CEO",
  "resignationDetails": { /* see ResignationDetails */ },
  "clearanceReport":    { /* see ClearanceReport */ }
}
```

**`status`** — `"Draft"` | `"Under Review"` | `"Approved"` | `"Paid"` | `"Disputed"`

**`checkedBy`**, **`approvedBy`** — optional; populated as the record progresses through the workflow.

---

### SettlementLineItem

```json
{ "label": "Leave Encashment (12d)", "amount": 2400 }
```

---

### ResignationDetails

```json
{
  "requestId":         "SEP-003",
  "employeeId":        "EMP-0654",
  "separationType":    "End of Contract",
  "employmentStatus":  "Contractual",
  "resignationDate":   "2026-02-28",
  "noticePeriodDays":  "15 days",
  "noticeDuration":    "Serve Full Notice",
  "separationStatus":  "Completed",
  "reasonForSeparation": "Contract expiry",
  "approver":          "Robert Kim",
  "lineManager":       "Monica Shah"
}
```

**`separationType`** — `"Resignation"` | `"Retirement"` | `"End of Contract"` | `"Termination"` | `"Redundancy"`

**`noticeDuration`** — `"Serve Full Notice"` | `"Early Release"` | `"Notice Buyout"`

**`separationStatus`** — `"In Progress"` | `"Completed"`

---

### ClearanceReport

```json
{
  "clearanceId": "CLR-002",
  "status": "Cleared",
  "departments": [
    {
      "department": "Immediate Supervisor",
      "status":     "Cleared",
      "approver":   "Finance Director",
      "date":       "2026-03-20",
      "remarks":    ""
    }
  ]
}
```

**`status`** (report-level) — `"Cleared"` | `"Pending"` | `"In Review"`

**`departments[].status`** — `"Cleared"` | `"Pending"` | `"In Review"`

**`departments[].date`** — ISO date (`YYYY-MM-DD`); empty string if not yet cleared.

---

## Endpoints

### 1. List Settlements

**`GET /api/v1/final-settlement`**

Query parameters:

| Parameter    | Type   | Description                                         |
|--------------|--------|-----------------------------------------------------|
| `search`     | string | Filter by employee name, ID, department             |
| `department` | string | Filter by exact department name                     |
| `reason`     | string | Filter by separation reason                         |
| `status`     | string | `Draft` \| `Under Review` \| `Approved` \| `Paid` \| `Disputed` |
| `page`       | int    | Page number (default `1`)                           |
| `pageSize`   | int    | Items per page (default `20`)                       |

Response `200`:

```json
{
  "data": [ /* SettlementRecord[] */ ],
  "total": 42,
  "page": 1,
  "pageSize": 20
}
```

---

### 2. Get Settlement Detail

**`GET /api/v1/final-settlement/:id`**

Returns a single `SettlementRecord` with fully populated `resignationDetails` and `clearanceReport`.

Response `200`: `SettlementRecord`

Response `404`:
```json
{ "error": "Settlement not found" }
```

---

### 3. Generate Settlement

**`POST /api/v1/final-settlement`**

Request body:

```json
{
  "employeeId":   "EMP-1042",
  "payables":     [ { "label": "Monthly Salary (Pro-rata)", "amount": 8500 } ],
  "deductions":  [ { "label": "Tax Deduction", "amount": 350 } ],
  "saveAsDraft":  true
}
```

Response `201`: `SettlementRecord` (with `status: "Draft"` or `status: "Under Review"` based on `saveAsDraft`)

---

### 4. Update Settlement

**`PATCH /api/v1/final-settlement/:id`**

Allowed only when `status` is `"Draft"`. Request body accepts partial `SettlementRecord` fields (`payables`, `deductions`).

Response `200`: updated `SettlementRecord`

Response `409`:
```json
{ "error": "Settlement cannot be edited in its current status" }
```

---

### 5. Workflow Action

**`POST /api/v1/final-settlement/:id/action`**

Request body:

```json
{
  "action": "submit-for-review"
}
```

**`action`** values:

| Action              | Allowed from status | Resulting status |
|---------------------|---------------------|------------------|
| `submit-for-review` | `Draft`             | `Under Review`   |
| `approve`           | `Under Review`      | `Approved`       |
| `dispute`           | `Under Review`      | `Disputed`       |
| `reopen`            | `Disputed`          | `Under Review`   |
| `mark-paid`         | `Approved`          | `Paid`           |

Response `200`: updated `SettlementRecord`

Response `422`:
```json
{ "error": "Action 'approve' is not valid for status 'Draft'" }
```

---

### 6. Export PDF

**`GET /api/v1/final-settlement/:id/export`**

Query parameter: `view` — `settlement` | `resignation` | `clearance` | `all` (default `all`)

Response `200`: `application/pdf` binary stream

Response headers:
```
Content-Disposition: attachment; filename="settlement-FS-001.pdf"
Content-Type: application/pdf
```
