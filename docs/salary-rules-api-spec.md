# Salary Rules API Specification

> **Feature:** Payroll → Salary Rules
> **Date:** 2026-03-12
> **Status:** Active

---

## Overview

Manages the named salary component rules (allowances, deductions, overtime formulas, etc.) that drive payroll calculation. Each rule has a unique code, a human-readable name, a description of its formula/logic, and an active/inactive status.

---

## Base URL

`/api/v1/payroll/salary-rules`

---

## Data Contracts

### SalaryRule

```json
{
	"id": "1",
	"name": "Basic Salary",
	"code": "BASIC",
	"description": "Base monthly salary component calculated as a fixed monthly amount.",
	"status": "active"
}
```

**`status`** — `"active"` | `"inactive"`

### SalaryRuleForm (Create / Update body)

```json
{
	"name": "Basic Salary",
	"code": "BASIC",
	"description": "Base monthly salary component."
}
```

---

## Endpoints

### 1. List Salary Rules

**`GET /api/v1/payroll/salary-rules`**

Query parameters:

| Parameter | Type   | Description                              |
|-----------|--------|------------------------------------------|
| `status`  | string | `active` \| `inactive`                  |
| `search`  | string | Partial match against `name`, `code`, or `description` |
| `page`    | int    | Default `1`                              |
| `pageSize`| int    | Default `20`                             |

Response `200`:

```json
{
	"data": [ /* SalaryRule[] */ ],
	"total": 12,
	"page": 1,
	"pageSize": 20
}
```

---

### 2. Get Rule Detail

**`GET /api/v1/payroll/salary-rules/:id`**

Response `200`: `SalaryRule`

---

### 3. Create Rule

**`POST /api/v1/payroll/salary-rules`**

Request body: `SalaryRuleForm`

- `code` must be unique and alphanumeric/uppercase (e.g. `"BASIC"`, `"HRA"`, `"OT_1_5X"`).
- Created with `status: "active"` by default.

Response `201`: `SalaryRule`

Response `409`: code already exists

---

### 4. Update Rule

**`PATCH /api/v1/payroll/salary-rules/:id`**

Request body: partial `SalaryRuleForm` (`name`, `code`, `description`).

Response `200`: updated `SalaryRule`

Response `409`: code conflict with another rule

---

### 5. Change Status

**`PATCH /api/v1/payroll/salary-rules/:id/status`**

Toggles between `active` and `inactive`.

Request body:

```json
{ "status": "inactive" }
```

Response `200`: updated `SalaryRule`

---

### 6. Delete Rule

**`DELETE /api/v1/payroll/salary-rules/:id`**

Response `204`

Response `409`: rule is referenced by active payroll configurations
