# Loan Management API Specification

> **Feature:** Loan Management (ESS)
> **Date:** 2026-03-25
> **Status:** Draft (derived from UI types)

---

## Overview

The Loan Management module allows employees to apply for salary loans or advance salary, with a manager approval workflow. Employees see their own requests; managers see pending approvals and can approve or reject with remarks.

---

## Base URL

`/api/v1/loans`

---

## Common Types

### LoanType
`"Loan" | "Advance Salary"`

### LoanStatus
`"To Approve" | "Approved" | "Rejected" | "Cancelled"`

### LoanRequest Object
```json
{
  "id": "LN-2026-001",
  "initiateDate": "20 Feb 2026",
  "type": "Loan | Advance Salary",
  "amount": 22000,
  "principalAmount": 20000,
  "interestRate": 10,
  "installmentNumber": 2,
  "loanAmount": 20000,
  "selectedMonth": null,
  "monthlySalary": null,
  "guarantorEmployeeId": "TN-99210",
  "guarantorEmployeeName": "Wahid Uzzaman",
  "reason": "Home renovation expenses",
  "attachmentName": "invoice.pdf",
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

**Note:** `loanAmount` is populated for type `"Loan"`. `selectedMonth` and `monthlySalary` are populated for type `"Advance Salary"`. `interestRate` is `0` for Advance Salary.

---

## Endpoints

---

### 1) List My Loan Requests (Employee)
**`GET /api/v1/loans/my-requests`**

Returns loan requests for the authenticated employee.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `status` | `LoanStatus` | Filter by status |
| `type` | `LoanType` | Filter by loan type |
| `page` | integer | Page number (default: 1) |
| `pageSize` | integer | Items per page (default: 20) |

**Response `200`:**
```json
{
  "data": [LoanRequest, ...],
  "total": 5,
  "page": 1,
  "pageSize": 20
}
```

---

### 2) List Approval Queue (Manager)
**`GET /api/v1/loans/approvals`**

Returns all loan requests visible to the approving manager, with pending count.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `status` | `LoanStatus` | Filter by status (default: `"To Approve"`) |
| `type` | `LoanType` | Filter by loan type |
| `search` | string | Search by employee name or request ID |
| `page` | integer | Page number |
| `pageSize` | integer | Items per page |

**Response `200`:**
```json
{
  "data": [LoanRequest, ...],
  "total": 12,
  "pendingCount": 3,
  "page": 1,
  "pageSize": 20
}
```

---

### 3) Get Loan Request Detail
**`GET /api/v1/loans/requests/:id`**

**Response `200`:** Full `LoanRequest` object.

**Response `404`:** Request not found.

---

### 4) Create Loan Request (Employee)
**`POST /api/v1/loans/requests`**

**Request Body — type `"Loan"`:**
```json
{
  "type": "Loan",
  "loanAmount": 20000,
  "installmentNumber": 2,
  "guarantorEmployeeId": "TN-99210",
  "reason": "Home renovation expenses",
  "attachmentName": "invoice.pdf"
}
```

**Request Body — type `"Advance Salary"`:**
```json
{
  "type": "Advance Salary",
  "selectedMonth": 2,
  "installmentNumber": 3,
  "guarantorEmployeeId": "TN-88401",
  "reason": "Educational expenses",
  "attachmentName": null
}
```

**Validation Rules:**
- `type` — required
- `installmentNumber` — required; allowed values: `1, 2, 3, 6, 9, 12, 18, 24`
- `guarantorEmployeeId` — required; must be a valid active employee (not the requester)
- `reason` — required
- For `"Loan"`: `loanAmount` required; must be between 5,000 and 500,000
- For `"Advance Salary"`: `selectedMonth` required; must be ≥ 1

**Business Rules:**
- Employee may have only one active (non-rejected/non-cancelled) loan at a time
- 90-day cooling period required after a previous loan is closed
- Minimum 85% attendance required for eligibility

**Response `201`:** Created `LoanRequest` object with `status: "To Approve"`.

**Response `422`:** Validation error with field-level messages.

---

### 5) Cancel Loan Request (Employee)
**`POST /api/v1/loans/requests/:id/cancel`**

Employee cancels their own pending request.

**Allowed only when:** `status === "To Approve"`

**Response `200`:** Updated request with `status: "Cancelled"`.

**Response `409`:** Request is not in a cancellable state.

---

### 6) Approve Loan Request (Manager)
**`POST /api/v1/loans/requests/:id/approve`**

**Request Body:**
```json
{
  "remarks": "Approved as per policy."
}
```

**Allowed only when:** `status === "To Approve"`

**Response `200`:** Updated request with `status: "Approved"`.

---

### 7) Reject Loan Request (Manager)
**`POST /api/v1/loans/requests/:id/reject`**

**Request Body:**
```json
{
  "remarks": "Insufficient attendance record."
}
```

**Validation Rules:**
- `remarks` — required for rejection

**Allowed only when:** `status === "To Approve"`

**Response `200`:** Updated request with `status: "Rejected"`.

---

### 8) Reference Data
**`GET /api/v1/loans/reference`**

Returns employee policy data and dropdown options.

**Response `200`:**
```json
{
  "monthlySalary": 25800,
  "interestRate": 10,
  "minAmount": 5000,
  "maxAmount": 500000,
  "installmentOptions": [1, 2, 3, 6, 9, 12, 18, 24],
  "guarantorEmployees": [
    {
      "employeeId": "TN-99210",
      "name": "Wahid Uzzaman",
      "designation": "Senior Developer",
      "department": "IT"
    }
  ],
  "policyNotes": ["..."]
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
