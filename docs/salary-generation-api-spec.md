# Salary Generation API Specification

> **Feature:** Payroll → Salary Generation
> **Date:** 2026-03-12
> **Status:** Active

---

## Overview

Manages payroll run records. Each record defines a salary period (by Days or Month), tracks its status through draft → processing → confirmed, and links to the generated payslip data for that cycle.

---

## Base URL

`/api/v1/payroll/salary-generation`

---

## Data Contracts

### SalaryGenerationRecord

```json
{
	"id": "1",
	"name": "TechnoNext February 2026",
	"type": "Month",
	"dateFrom": "2026-02-01",
	"dateTo": "2026-02-28",
	"monthName": "February",
	"year": 2026,
	"status": "confirmed"
}
```

**`type`** — `"Days"` | `"Month"`
- `"Month"` — covers the full calendar month
- `"Days"` — covers a custom date range spanning parts of two months

**`status`** — `"draft"` | `"processing"` | `"confirmed"`

---

## Endpoints

### 1. List Salary Generations

**`GET /api/v1/payroll/salary-generation`**

Query parameters:

| Parameter   | Type   | Description                                      |
|-------------|--------|--------------------------------------------------|
| `status`    | string | `draft` \| `processing` \| `confirmed`           |
| `year`      | int    | Filter by year                                   |
| `monthName` | string | Filter by month name (e.g. `"February"`)         |
| `search`    | string | Partial match on `name`                          |
| `page`      | int    | Default `1`                                      |
| `pageSize`  | int    | Default `20`                                     |

Response `200`:

```json
{
	"data": [ /* SalaryGenerationRecord[] */ ],
	"total": 14,
	"page": 1,
	"pageSize": 20
}
```

---

### 2. Get Record Detail

**`GET /api/v1/payroll/salary-generation/:id`**

Response `200`: `SalaryGenerationRecord`

---

### 3. Create Record

**`POST /api/v1/payroll/salary-generation`**

Request body:

```json
{
	"name": "TechnoNext March 2026",
	"type": "Month",
	"dateFrom": "2026-03-01",
	"dateTo": "2026-03-31",
	"monthName": "March",
	"year": 2026
}
```

Response `201`: `SalaryGenerationRecord` with `status: "draft"`

---

### 4. Update Record

**`PATCH /api/v1/payroll/salary-generation/:id`**

Allowed only when `status: "draft"`. Accepts partial body (`name`, `dateFrom`, `dateTo`, etc.).

Response `200`: updated `SalaryGenerationRecord`

---

### 5. Delete Record

**`DELETE /api/v1/payroll/salary-generation/:id`**

Allowed only when `status: "draft"`.

Response `204`

---

### 6. Process Payroll

**`POST /api/v1/payroll/salary-generation/:id/process`**

Triggers payroll computation for the period. Sets `status: "processing"`.

Response `200`: `SalaryGenerationRecord`

Response `409`: already processing or confirmed

---

### 7. Confirm Payroll

**`POST /api/v1/payroll/salary-generation/:id/confirm`**

Locks the payroll run. Sets `status: "confirmed"`.

Response `200`: `SalaryGenerationRecord`
