# Demand Management API Specification

> **Feature:** ESS → Demand Management
> **Date:** 2026-03-08
> **Status:** Active

---

## Overview

Allows employees to raise material/asset demand requests for themselves or their department. Managers approve or reject requests. On approval, an admin assigns items from store with optional exchange of existing assets.

---

## Base URL

`/api/v1/demand`

---

## Data Contracts

### DemandRequest

```json
{
	"id": "dmd-001",
	"demandNo": "20032027xx",
	"createdAt": "01 Apr 2026, 09:00 AM",
	"neededDate": "10 Apr 2026",
	"store": "USBA",
	"requestedBy": "Shanto Karmoker",
	"employeeId": "TN-99318",
	"requestFor": "self",
	"targetDepartment": null,
	"targetSection": null,
	"lines": [ /* DemandLine[] */ ],
	"status": "To Approve",
	"approvalRemarks": null,
	"rejectionRemarks": null,
	"assignment": null
}
```

**`status`** — `"To Approve"` | `"Approved"` | `"Rejected"` | `"Assigned"`

**`requestFor`** — `"self"` | `"department"`

---

### DemandLine

```json
{
	"id": "line-abc",
	"itemGroup": "IT Equipment",
	"itemId": "asset-laptop",
	"qty": 1,
	"remarks": "For new project",
	"exchange": false
}
```

**`exchange`** — `true` means the employee is returning an existing asset of the same type.

---

### AssignmentLine

```json
{
	"demandLineId": "line-abc",
	"itemId": "asset-laptop",
	"assignedQty": 1,
	"assignedAt": "01 Apr 2026, 10:00 AM",
	"newSerialNo": "SN-HP-00199",
	"previousSerialNo": null
}
```

---

## Endpoints

### 1. List Demands

**`GET /api/v1/demand`**

Query parameters:

| Parameter  | Type   | Description                                           |
|------------|--------|-------------------------------------------------------|
| `mine`     | bool   | `true` — returns only requesting employee's demands   |
| `demandNo` | string | Partial match                                         |
| `store`    | string | Exact match                                           |
| `status`   | string | `To Approve` \| `Approved` \| `Rejected` \| `Assigned`|
| `page`     | int    | Default `1`                                           |
| `pageSize` | int    | Default `20`                                          |

Response `200`:

```json
{ "data": [ /* DemandRequest[] */ ], "total": 30, "page": 1, "pageSize": 20 }
```

---

### 2. Get Demand Detail

**`GET /api/v1/demand/:id`**

Response `200`: `DemandRequest` (full with lines and assignment)

---

### 3. Create Demand

**`POST /api/v1/demand`**

Request body:

```json
{
	"neededDate": "2026-04-10",
	"store": "USBA",
	"employeeId": "TN-99318",
	"requestFor": "self",
	"targetDepartment": null,
	"targetSection": null,
	"lines": [
		{ "itemGroup": "IT Equipment", "itemId": "asset-laptop", "qty": 1, "remarks": "", "exchange": false }
	]
}
```

Response `201`: `DemandRequest`

---

### 4. Approve Demand

**`POST /api/v1/demand/:id/approve`**

Request body:

```json
{ "remarks": "Approved for project use." }
```

Response `200`: `DemandRequest` with `status: "Approved"`

---

### 5. Reject Demand

**`POST /api/v1/demand/:id/reject`**

Request body:

```json
{ "remarks": "Budget not available this quarter." }
```

Response `200`: `DemandRequest` with `status: "Rejected"`

---

### 6. Assign Items

**`POST /api/v1/demand/:id/assign`**

Request body:

```json
{
	"assignAt": "2026-04-01T10:00:00",
	"lines": [
		{
			"demandLineId": "line-abc",
			"assignedQty": 1,
			"newSerialNo": "SN-HP-00199",
			"previousSerialNo": null
		}
	]
}
```

Response `200`: `DemandRequest` with `status: "Assigned"` and populated `assignment[]`

Response `422`: validation error (e.g. qty exceeds demand qty, missing serial for asset type)

---

### 7. Cancel Demand (by requester)

**`POST /api/v1/demand/:id/cancel`**

Only allowed when `status: "To Approve"`.

Response `200`: `DemandRequest` with `status: "Rejected"` and `rejectionRemarks: "Cancelled by requester"`
