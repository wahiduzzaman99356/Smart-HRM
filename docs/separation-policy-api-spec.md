# Separation Policy API Specification

> **Feature:** Offboarding → Separation Policy
> **Date:** 2026-03-12
> **Status:** Active

---

## Overview

Configures organisation-wide separation policies. Covers:
1. **Separation Modes** — notice period rules for each separation type (Resignation, Dismissal, Termination, etc.)
2. **Clearance Departments** — ordered department list and per-department checklist items
3. **Rich-text Policies** — formatted policy text for Exit Interview and Experience Certificate

---

## Base URL

`/api/v1/offboarding/separation-policy`

---

## Data Contracts

### SeparationMode

```json
{
  "id": "1",
  "name": "Resignation",
  "description": "Voluntary resignation by an employee.",
  "noticePeriod": 30,
  "employeeType": "All",
  "probationDays": 7,
  "confirmedDays": 30,
  "note": "Notice period may be waived with management approval.",
  "policyRules": [
    "Employee must submit written resignation.",
    "HR must acknowledge within 2 business days."
  ]
}
```

**`noticePeriod`** — `number` (days) | `"Immediate"`

**Standard separation modes:**
`Dismissal`, `Termination`, `Resignation`, `Discharge`, `Loss of Lien`, `Retrenchment`, `Retirement`

---

### ClearanceItem

```json
{
  "id": "item-1",
  "label": "Return ID Card"
}
```

---

### ClearanceDept

```json
{
  "id": "dept-1",
  "order": 1,
  "name": "IT Department",
  "category": "Assets",
  "section": "Infrastructure",
  "designation": "IT Manager",
  "assignedPerson": "John Smith",
  "items": [
    { "id": "item-1", "label": "Return Laptop" },
    { "id": "item-2", "label": "Revoke System Access" }
  ]
}
```

---

### PolicyConfig (full config object)

```json
{
  "separationModes": [ /* SeparationMode[] */ ],
  "clearanceDepartments": [ /* ClearanceDept[] — ordered by `order` */ ],
  "exitInterviewPolicy": "<p>HTML rich text…</p>",
  "experienceCertificatePolicy": "<p>HTML rich text…</p>"
}
```

---

## Endpoints

### 1. Get Policy Configuration

**`GET /api/v1/offboarding/separation-policy`**

Returns the full `PolicyConfig` object.

Response `200`: `PolicyConfig`

---

### 2. Update Separation Mode

**`PATCH /api/v1/offboarding/separation-policy/modes/:id`**

Request body: partial `SeparationMode` (any of `description`, `noticePeriod`, `employeeType`, `probationDays`, `confirmedDays`, `note`, `policyRules`).

Response `200`: updated `SeparationMode`

---

### 3. List Clearance Departments

**`GET /api/v1/offboarding/separation-policy/clearance-departments`**

Returns ordered array of `ClearanceDept[]`.

Response `200`: `ClearanceDept[]`

---

### 4. Add Clearance Department

**`POST /api/v1/offboarding/separation-policy/clearance-departments`**

Request body:

```json
{
  "name": "Finance",
  "category": "Financials",
  "section": "Accounts",
  "designation": "Finance Manager",
  "assignedPerson": "Jane Doe",
  "items": [
    { "label": "Clear outstanding advances" },
    { "label": "Return petty cash" }
  ]
}
```

Response `201`: `ClearanceDept` (new record appended at end of order)

---

### 5. Update Clearance Department

**`PATCH /api/v1/offboarding/separation-policy/clearance-departments/:id`**

Accepts partial body (`name`, `category`, `section`, `designation`, `assignedPerson`, `items`).

Response `200`: updated `ClearanceDept`

---

### 6. Delete Clearance Department

**`DELETE /api/v1/offboarding/separation-policy/clearance-departments/:id`**

Response `204`

---

### 7. Reorder Clearance Departments

**`PATCH /api/v1/offboarding/separation-policy/clearance-departments/reorder`**

Request body — ordered array of department IDs:

```json
{ "order": ["dept-3", "dept-1", "dept-5", "dept-2", "dept-4"] }
```

Response `200`: updated `ClearanceDept[]` in new order

---

### 8. Update Rich-text Policies

**`PATCH /api/v1/offboarding/separation-policy/text-policies`**

Request body (partial accepted):

```json
{
  "exitInterviewPolicy": "<p>Updated exit interview HTML…</p>",
  "experienceCertificatePolicy": "<p>Updated experience certificate HTML…</p>"
}
```

Response `200`:

```json
{
  "exitInterviewPolicy": "<p>Updated…</p>",
  "experienceCertificatePolicy": "<p>Updated…</p>"
}
```
