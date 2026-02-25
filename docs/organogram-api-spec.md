# Organogram API Specification

> **Feature:** Core HR → Organogram
> **Date:** 2026-02-25
> **Frontend Stack:** React + TypeScript
> **Base URL prefix:** `/api/v1/organogram`

---

## Overview

The Organogram module renders a zoomable/pannable tree of all positions in the organisation.
Each **node** represents a single position (either filled, vacant, or marked as separation).
Nodes are linked parent→child to form the reporting hierarchy.

The frontend currently uses **localStorage** as a temporary store. All of that logic must be replaced by these APIs.

---

## Data Models

### NodeStatus
```
"empty"      — root placeholder, not yet configured
"active"     — position filled by an employee
"vacant"     — position exists but no one is assigned (hiring needed)
"separation" — employee has left; position is flagged
```

### AssignMode
```
"designation" — node was created by picking a dept + designation, then optionally assigning one or more employees
"employee"    — node was created by picking a specific employee directly
```

### DeptKey (enum)
```
higher_management | flight_ops | safety | corp_quality | cabin_service |
engineering | quality_assurance | revenue_accounts | marketing_sales |
brand_marketing | public_relations | human_resources | it |
administration | airline_security | catering | ground_operations
```

### GradeKey (enum)
```
G1 | G2 | G3 | G4 | G5 | G6 | G7 | G8 | G9
```

---

## OrgNode Object

This is the canonical representation of a single tree node returned/sent by the API.

```jsonc
{
  "id": "string",                 // UUID, server-generated
  "parentId": "string | null",    // null = root node
  "status": "empty | active | vacant | separation",
  "assignMode": "designation | employee | null",

  // Position metadata
  "department": "DeptKey | null",
  "departmentLabel": "string | null",   // human label, can be derived server-side
  "designation": "string | null",
  "grade": "GradeKey | null",

  // Assigned employee (single — primary/first employee)
  "employeeId": "string | null",        // e.g. "TN-99356"
  "name": "string | null",              // full name

  // Display order hint (for grade-sorted view)
  "sortOrder": "integer"                // 0-based within siblings
}
```

> **Note:** The frontend builds the tree by nesting children. The API can return either a **flat list** (with `parentId`) or a **nested tree**. A flat list is recommended for easier manipulation on the backend.

---

## Employee Object (read-only reference)

Used by lookup endpoints so the frontend can populate dropdowns.

```jsonc
{
  "id": "string",           // e.g. "TN-99356"
  "name": "string",
  "department": "DeptKey",
  "departmentLabel": "string",
  "designation": "string",
  "grade": "GradeKey"
}
```

---

## API Endpoints

---

### 1. Get Full Organogram Tree

**`GET /api/v1/organogram/tree`**

Returns the complete flat list of org nodes. The frontend reconstructs the hierarchy using `parentId`.

**Response `200 OK`**
```jsonc
{
  "data": [
    {
      "id": "uuid-1",
      "parentId": null,
      "status": "active",
      "assignMode": "employee",
      "department": "higher_management",
      "departmentLabel": "Higher Management",
      "designation": "CEO",
      "grade": "G9",
      "employeeId": "TN-00001",
      "name": "Md. Rahman Al-Islam",
      "sortOrder": 0
    },
    {
      "id": "uuid-2",
      "parentId": "uuid-1",
      "status": "active",
      "assignMode": "designation",
      "department": "flight_ops",
      "departmentLabel": "Flight Operations",
      "designation": "Director Flight Operations",
      "grade": "G8",
      "employeeId": "TN-10001",
      "name": "Col. Farhan Ahmed",
      "sortOrder": 0
    }
    // ... more nodes
  ]
}
```

---

### 2. Add Node (Direct Report)

**`POST /api/v1/organogram/nodes`**

Creates one or more new nodes under a given parent. When the user selects a designation and assigns multiple employees, **one node per employee** is created.

**Request Body**
```jsonc
{
  "parentId": "uuid-1",            // required — the node they report to
  "assignMode": "designation",     // "designation" | "employee"

  // — Designation mode fields —
  "department": "flight_ops",
  "designation": "Manager, Flight Operations",
  "employeeIds": ["TN-10006"],     // empty array = vacant node

  // — Employee mode fields (assignMode = "employee") —
  // "employeeId": "TN-99356"      // single employee pick
}
```

**Response `201 Created`**
```jsonc
{
  "data": [
    {
      "id": "new-uuid",
      "parentId": "uuid-1",
      "status": "active",
      "assignMode": "designation",
      "department": "flight_ops",
      "departmentLabel": "Flight Operations",
      "designation": "Manager, Flight Operations",
      "grade": "G6",
      "employeeId": "TN-10006",
      "name": "Md. Wahiduzzaman Nayem",
      "sortOrder": 0
    }
  ]
}
```

> Returns an **array** — may contain multiple nodes if multiple employeeIds were submitted.

---

### 3. Edit Node

**`PATCH /api/v1/organogram/nodes/:nodeId`**

Updates an existing node's assignment. Replaces the current assignment entirely.

**Request Body**
```jsonc
{
  "assignMode": "designation",     // "designation" | "employee"

  // — Designation mode —
  "department": "flight_ops",
  "designation": "Manager, Flight Operations",
  "employeeIds": ["TN-10006"],     // empty = mark as vacant

  // — Employee mode —
  // "employeeId": "TN-99356"
}
```

**Response `200 OK`**
```jsonc
{
  "data": {
    "id": "uuid-2",
    "parentId": "uuid-1",
    "status": "active",
    "assignMode": "designation",
    "department": "flight_ops",
    "departmentLabel": "Flight Operations",
    "designation": "Manager, Flight Operations",
    "grade": "G6",
    "employeeId": "TN-10006",
    "name": "Md. Wahiduzzaman Nayem",
    "sortOrder": 0
  }
}
```

---

### 4. Delete Node

**`DELETE /api/v1/organogram/nodes/:nodeId`**

Deletes a node. The frontend does not currently expose this in the UI but the endpoint is needed for future use and backend data integrity.

> **Decision needed:** Should deleting a parent also delete all children (cascade), or re-parent them to the deleted node's parent? Please decide with the product team and document here.

**Response `204 No Content`**

---

### 5. Move Node (Change Parent / Reporting Line)

**`PATCH /api/v1/organogram/nodes/:nodeId/parent`**

Moves a node to a different parent (changes reporting line).

**Request Body**
```jsonc
{
  "newParentId": "uuid-5"
}
```

**Response `200 OK`** — returns the updated node object (same shape as Edit Node response).

---

### 6. Employee Lookup (Dropdown Data)

**`GET /api/v1/organogram/employees`**

Returns all active employees for use in "assign employee" dropdowns.

**Query Parameters**

| Param         | Type   | Description                                              |
|---------------|--------|----------------------------------------------------------|
| `department`  | string | Filter by DeptKey (e.g. `flight_ops`)                   |
| `designation` | string | Filter by exact designation string                       |
| `search`      | string | Free-text search on `name` or `employeeId`              |

**Response `200 OK`**
```jsonc
{
  "data": [
    {
      "id": "TN-10006",
      "name": "Md. Wahiduzzaman Nayem",
      "department": "flight_ops",
      "departmentLabel": "Flight Operations",
      "designation": "Manager, Flight Operations",
      "grade": "G6"
    }
    // ...
  ]
}
```

---

### 7. Designation List per Department

**`GET /api/v1/organogram/designations?department=flight_ops`**

Returns the list of valid designation strings for a given department. Used to populate the second dropdown in the "Add/Edit node" form.

**Response `200 OK`**
```jsonc
{
  "data": [
    "Director Flight Operations",
    "Chief of Training",
    "Captain ATR 72-600",
    "First Officer ATR 72-600",
    "Manager, Flight Operations"
    // ...
  ]
}
```

---

### 8. Department List

**`GET /api/v1/organogram/departments`**

Returns all departments for sidebar filter dropdown.

**Response `200 OK`**
```jsonc
{
  "data": [
    { "key": "higher_management", "label": "Higher Management" },
    { "key": "flight_ops",        "label": "Flight Operations" },
    { "key": "safety",            "label": "Safety" }
    // ...17 total
  ]
}
```

---

## Summary Stats (used in Sidebar)

The sidebar displays **Active Employees** and **Vacant Positions** counts.
These can be derived from the tree data on the frontend, but if a dedicated endpoint is preferred:

**`GET /api/v1/organogram/stats`**

**Response `200 OK`**
```jsonc
{
  "data": {
    "activeCount": 42,
    "vacantCount": 8,
    "separationCount": 3,
    "totalNodes": 53
  }
}
```

---

## Error Response Format

All errors should follow a consistent envelope:

```jsonc
{
  "error": {
    "code": "NODE_NOT_FOUND",       // machine-readable code
    "message": "Node uuid-99 does not exist."
  }
}
```

| HTTP Code | Scenario                                      |
|-----------|-----------------------------------------------|
| 400       | Invalid request body / missing required field |
| 404       | Node or employee not found                    |
| 409       | Conflict (e.g. circular parent assignment)    |
| 500       | Internal server error                         |

---

## Frontend Integration Notes

1. **Tree reconstruction:** The frontend expects `parentId: null` for exactly **one** root node. All other nodes must have a valid `parentId`.
2. **Node IDs:** Currently frontend uses `node-${timestamp}`. After integration, all IDs must be server-generated UUIDs.
3. **Optimistic UI:** The frontend will update the tree optimistically; the API response replaces the temporary node.
4. **Grade derivation:** `grade` on a node is taken from the assigned employee's grade. The backend can look this up from the employee record when saving — the frontend will also send it in the request for convenience.
5. **departmentLabel:** This is a derived display string (e.g. `"flight_ops"` → `"Flight Operations"`). The backend can store both or compute it from the `department` key at query time.
6. **sortOrder:** Used when "Show by Grade" is toggled on the frontend. Nodes with higher grade numbers (G9 > G1) appear first. The backend can store `sortOrder` or simply expose `grade` and let the frontend sort.

---

## Endpoints Summary

| Method   | Path                                           | Description                        |
|----------|------------------------------------------------|------------------------------------|
| `GET`    | `/api/v1/organogram/tree`                      | Full organogram tree (flat list)   |
| `POST`   | `/api/v1/organogram/nodes`                     | Add one or more child nodes        |
| `PATCH`  | `/api/v1/organogram/nodes/:nodeId`             | Edit a node's assignment           |
| `DELETE` | `/api/v1/organogram/nodes/:nodeId`             | Delete a node                      |
| `PATCH`  | `/api/v1/organogram/nodes/:nodeId/parent`      | Move node to a new parent          |
| `GET`    | `/api/v1/organogram/employees`                 | Employee lookup with filters       |
| `GET`    | `/api/v1/organogram/designations`              | Designations for a department      |
| `GET`    | `/api/v1/organogram/departments`               | All departments                    |
| `GET`    | `/api/v1/organogram/stats`                     | Active / vacant / separation count |
