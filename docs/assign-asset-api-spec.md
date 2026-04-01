# Assign Asset API Specification

> **Feature:** Assets → Assign Asset
> **Date:** 2026-03-08
> **Status:** Active

---

## Overview

Manages assignment of physical assets (IT equipment, accessories, etc.) to employees or departments. Supports individual and bulk assignment, serial-number tracking, exchange workflows, and reassignment.

---

## Base URL

`/api/v1/assets/assign`

---

## Data Contracts

### AssetAssignment

```json
{
	"id": "asgn-001",
	"targetType": "employee",
	"targetId": "TN-99318",
	"targetLabel": "Shanto Karmoker (TN-99318)",
	"itemId": "asset-laptop",
	"itemName": "HP Laptop",
	"qty": 1,
	"serialNo": "SN-HP-00142",
	"assignedBy": "Admin User",
	"assignedAt": "01 Apr 2026, 10:30 AM",
	"responsibleTo": "Shanto Karmoker"
}
```

**`targetType`** — `"employee"` | `"department"`

**`responsibleTo`** — only present when `targetType` is `"department"`; the employee within the department who is accountable for the asset.

---

### AssetItem

```json
{
	"id": "asset-laptop",
	"name": "HP Laptop",
	"group": "IT Equipment",
	"store": "USBA"
}
```

---

## Endpoints

### 1. List Assignments

**`GET /api/v1/assets/assign`**

Query parameters:

| Parameter    | Type   | Description                                          |
|--------------|--------|------------------------------------------------------|
| `targetType` | string | `employee` \| `department`                           |
| `targetId`   | string | Employee ID or department name                       |
| `serialNo`   | string | Partial match on serial number                       |
| `page`       | int    | Default `1`                                          |
| `pageSize`   | int    | Default `20`                                         |

Response `200`:

```json
{
	"data": [ /* AssetAssignment[] */ ],
	"total": 18,
	"page": 1,
	"pageSize": 20
}
```

---

### 2. Create Assignment

**`POST /api/v1/assets/assign`**

Request body:

```json
{
	"targetType": "employee",
	"targetId": "TN-99318",
	"responsibleTo": null,
	"items": [
		{
			"store": "USBA",
			"itemId": "asset-laptop",
			"qty": 1,
			"exchange": false,
			"serialNo": "SN-HP-00142",
			"previousSerialNo": null
		}
	],
	"assignAt": "2026-04-01T10:30:00"
}
```

**`exchange`** — when `true`, `previousSerialNo` is required; the old asset is unlinked from the target.

Response `201`: `AssetAssignment[]` — one entry per item assigned.

---

### 3. Reassign

**`PATCH /api/v1/assets/assign/:id/reassign`**

Request body:

```json
{ "employeeId": "TN-77114" }
```

Response `200`: updated `AssetAssignment`.

---

### 4. Delete Assignment

**`DELETE /api/v1/assets/assign/:id`**

Response `204`: no content.

---

### 5. List Asset Items

**`GET /api/v1/assets/items`**

Query parameters: `store`, `group` (optional filters).

Response `200`: `AssetItem[]`

---

### 6. List Stores

**`GET /api/v1/assets/stores`**

Response `200`: `string[]`
