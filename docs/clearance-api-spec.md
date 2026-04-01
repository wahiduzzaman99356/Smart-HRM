# Clearance Management API Specification

> **Feature:** Offboarding → Clearance Management
> **Date:** 2026-03-31
> **Status:** Active

---

## Overview

Tracks department-by-department clearance for each separating employee. Each employee has a set of assigned clearance departments; each department clears (or flags) the employee after verifying a checklist of items and optionally attaching supporting documents.

---

## Base URL

`/api/v1/clearance`

---

## Data Contracts

### EmployeeClearance

```json
{
	"id": "emp-1",
	"empId": "EMP-001",
	"empName": "Aisha Patel",
	"department": "Finance",
	"designation": "Financial Analyst",
	"lastWorkingDay": "2026-03-28",
	"status": "Cleared",
	"depts": [ /* DeptClearance[] */ ],
	"globalAttachments": [ /* Attachment[] */ ]
}
```

**`status`** (derived) — `"Cleared"` | `"Pending"` | `"Flagged"`
- `"Cleared"` — all departments have status `"Submitted"`
- `"Flagged"` — at least one department is `"Flagged"`
- `"Pending"` — otherwise

---

### DeptClearance

```json
{
	"id": "dept-1",
	"department": "IT Department",
	"status": "Submitted",
	"items": [ /* ClearanceItem[] */ ],
	"attachments": [ /* Attachment[] */ ],
	"cleanedOn": "2026-03-20"
}
```

**`status`** — `"Pending"` | `"Submitted"` | `"Flagged"`

---

### ClearanceItem

```json
{
	"id": "item-1",
	"label": "Return laptop",
	"checked": true
}
```

---

### Attachment

```json
{
	"uid": "att-001",
	"name": "clearance-form.pdf",
	"url": "https://cdn.example.com/clearance-form.pdf"
}
```

---

## Endpoints

### 1. List Employee Clearances

**`GET /api/v1/clearance`**

Query parameters:

| Parameter   | Type   | Description                              |
|-------------|--------|------------------------------------------|
| `search`    | string | Filter by employee name or ID            |
| `dept`      | string | Filter by employee's home department     |
| `status`    | string | `Cleared` \| `Pending` \| `Flagged`      |
| `dateFrom`  | string | ISO date — clearance date lower bound    |
| `dateTo`    | string | ISO date — clearance date upper bound    |
| `page`      | int    | Default `1`                              |
| `pageSize`  | int    | Default `20`                             |

Response `200`:

```json
{ "data": [ /* EmployeeClearance[] */ ], "total": 24, "page": 1, "pageSize": 20 }
```

---

### 2. Get Clearance Detail

**`GET /api/v1/clearance/:empId`**

Response `200`: `EmployeeClearance` (full, with all `depts` and `globalAttachments`)

---

### 3. Toggle Item Check

**`PATCH /api/v1/clearance/:empId/dept/:deptId/item/:itemId`**

Request body:

```json
{ "checked": true }
```

Response `200`: updated `DeptClearance`

---

### 4. Submit Department Clearance

**`POST /api/v1/clearance/:empId/dept/:deptId/submit`**

Marks all items as checked and sets `status: "Submitted"`. Sets `cleanedOn` to today.

Response `200`: updated `DeptClearance`

---

### 5. Flag Department

**`POST /api/v1/clearance/:empId/dept/:deptId/flag`**

Sets `status: "Flagged"`.

Response `200`: updated `DeptClearance`

---

### 6. Reopen Department

**`POST /api/v1/clearance/:empId/dept/:deptId/reopen`**

Sets `status: "Pending"`, clears `cleanedOn`.

Response `200`: updated `DeptClearance`

---

### 7. Upload Attachment (Department)

**`POST /api/v1/clearance/:empId/dept/:deptId/attachments`**

Content-Type: `multipart/form-data` — field `file`.

Response `201`: `Attachment`

---

### 8. Delete Attachment (Department)

**`DELETE /api/v1/clearance/:empId/dept/:deptId/attachments/:uid`**

Response `204`

---

### 9. Upload Global Attachment

**`POST /api/v1/clearance/:empId/attachments`**

Content-Type: `multipart/form-data` — field `file`.

Response `201`: `Attachment`

---

### 10. Delete Global Attachment

**`DELETE /api/v1/clearance/:empId/attachments/:uid`**

Response `204`
