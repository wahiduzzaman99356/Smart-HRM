# My Shift API Specification

> **Feature:** My Shift (ESS)
> **Date:** 2026-03-25
> **Status:** Draft (derived from UI types)

---

## Overview

The My Shift module lets employees view their current shift assignment, submit shift change or exchange requests, and allows managers to approve or reject those requests (individually or in bulk).

- **Shift Change** — Employee requests to be moved to a different shift permanently/temporarily.
- **Shift Exchange** — Employee requests to swap shifts with another employee on a specific date.

---

## Base URL

`/api/v1/shifts`

---

## Common Types

### ShiftChangeType
`"Change" | "Exchange"`

### ShiftRequestStatus
`"To Approve" | "Approved" | "Rejected" | "Cancelled"`

### Shift Object
```json
{
  "id": "GEN_A",
  "name": "General A",
  "timeRange": "09:00 AM - 06:00 PM",
  "policy": "Standard 8-hour shift with 1 hour lunch break."
}
```

### ExchangeableEmployee Object
```json
{
  "employeeId": "TN-99318",
  "name": "Shanto Karmoker",
  "designation": "Business Analyst",
  "department": "Business Analysis",
  "section": "Analytics",
  "shift": "10:00 AM - 07:00 PM"
}
```

### ShiftChangeRequest Object
```json
{
  "id": "SCR-2026-001",
  "date": "20 Feb 2026",
  "requestType": "Exchange | Change",
  "fromShift": { ...Shift },
  "toShift": { ...Shift },
  "exchangeWith": { ...ExchangeableEmployee },
  "assignedEmployee": { ...ExchangeableEmployee },
  "reason": "Personal commitment",
  "status": "To Approve",
  "remarks": null,
  "employeeId": "TN-99318",
  "employeeName": "Shanto Karmoker",
  "designation": "Business Analyst",
  "department": "Business Analysis",
  "section": "Analytics",
  "createdAt": "15 Feb 2026, 10:30 AM"
}
```

**Note:** `exchangeWith` is set by the approver for `"Exchange"` type requests. `assignedEmployee` is set by the approver for `"Change"` type requests.

---

## Endpoints

---

### 1) Get My Current Shift
**`GET /api/v1/shifts/my-shift`**

Returns the authenticated employee's current shift assignment.

**Response `200`:**
```json
{
  "employeeId": "TN-99318",
  "employeeName": "Shanto Karmoker",
  "currentShift": {
    "id": "GEN_A",
    "name": "General A",
    "timeRange": "09:00 AM - 06:00 PM",
    "policy": "Standard 8-hour shift with 1 hour lunch break."
  },
  "effectiveFrom": "2026-01-01"
}
```

---

### 2) List My Shift Change Requests (Employee)
**`GET /api/v1/shifts/my-requests`**

Returns shift change/exchange requests for the authenticated employee.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `status` | `ShiftRequestStatus` | Filter by status |
| `requestType` | `ShiftChangeType` | Filter by request type |
| `page` | integer | Page number (default: 1) |
| `pageSize` | integer | Items per page (default: 20) |

**Response `200`:**
```json
{
  "data": [ShiftChangeRequest, ...],
  "total": 8,
  "page": 1,
  "pageSize": 20
}
```

---

### 3) List Approval Queue (Manager)
**`GET /api/v1/shifts/approvals`**

Returns shift requests visible to the approving manager.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `status` | `ShiftRequestStatus` | Filter by status |
| `requestType` | `ShiftChangeType` | Filter by type |
| `search` | string | Search by employee name or request ID |
| `page` | integer | Page number |
| `pageSize` | integer | Items per page |

**Response `200`:**
```json
{
  "data": [ShiftChangeRequest, ...],
  "total": 15,
  "pendingCount": 4,
  "page": 1,
  "pageSize": 20
}
```

---

### 4) Get Shift Change Request Detail
**`GET /api/v1/shifts/requests/:id`**

**Response `200`:** Full `ShiftChangeRequest` object.

**Response `404`:** Request not found.

---

### 5) Create Shift Change Request (Employee)
**`POST /api/v1/shifts/requests`**

**Request Body:**
```json
{
  "date": "2026-02-20",
  "requestType": "Exchange",
  "fromShiftId": "GEN_A",
  "toShiftId": "GEN_B",
  "reason": "Personal commitment"
}
```

**Validation Rules:**
- `date` — required; must be a future date
- `requestType` — required
- `fromShiftId`, `toShiftId` — required; must be valid shift IDs; must differ
- `reason` — required

**Response `201`:** Created `ShiftChangeRequest` with `status: "To Approve"`.

**Response `422`:** Validation error.

---

### 6) Cancel Shift Request (Employee)
**`POST /api/v1/shifts/requests/:id/cancel`**

**Allowed only when:** `status === "To Approve"`

**Response `200`:** Updated request with `status: "Cancelled"`.

**Response `409`:** Request is not in a cancellable state.

---

### 7) Approve Shift Request (Manager)
**`POST /api/v1/shifts/requests/:id/approve`**

**Request Body:**
```json
{
  "remarks": "Approved as one-time exception.",
  "exchangeWithEmployeeId": "TN-99210",
  "assignedEmployeeId": null
}
```

**Notes:**
- For `"Exchange"` type: `exchangeWithEmployeeId` should be provided (the peer to swap with)
- For `"Change"` type: `assignedEmployeeId` may be provided if a replacement employee must also be assigned
- Both fields are optional; approver may approve without specifying peers

**Allowed only when:** `status === "To Approve"`

**Response `200`:** Updated request with `status: "Approved"`.

---

### 8) Reject Shift Request (Manager)
**`POST /api/v1/shifts/requests/:id/reject`**

**Request Body:**
```json
{
  "remarks": "Insufficient staffing cover available on that date."
}
```

**Validation Rules:**
- `remarks` — required for rejection

**Allowed only when:** `status === "To Approve"`

**Response `200`:** Updated request with `status: "Rejected"`.

---

### 9) Bulk Approve (Manager)
**`POST /api/v1/shifts/approvals/bulk-approve`**

**Request Body:**
```json
{
  "ids": ["SCR-2026-001", "SCR-2026-002"],
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
**`POST /api/v1/shifts/approvals/bulk-reject`**

**Request Body:**
```json
{
  "ids": ["SCR-2026-003"],
  "remarks": "Bulk rejected due to peak period freeze."
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
**`GET /api/v1/shifts/reference`**

Returns all available shifts and exchangeable employees.

**Response `200`:**
```json
{
  "availableShifts": [
    { "id": "GEN_A", "name": "General A", "timeRange": "09:00 AM - 06:00 PM", "policy": "..." },
    { "id": "MORNING", "name": "Morning", "timeRange": "06:00 AM - 02:00 PM", "policy": "..." }
  ],
  "exchangeableEmployees": [
    {
      "employeeId": "TN-99210",
      "name": "Wahid Uzzaman",
      "designation": "Senior Developer",
      "department": "IT",
      "section": "Development",
      "shift": "10:00 AM - 07:00 PM"
    }
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
