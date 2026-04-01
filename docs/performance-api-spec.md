# Performance API Specification

> **Feature:** Performance (Balanced Scorecard KPI)
> **Date:** 2026-03-30
> **Status:** Active

---

## Overview

The Performance module implements a Balanced Scorecard KPI framework. It covers:

- **Main KPI Areas** — high-level BSC perspectives (Financial, Customer, Internal Process, Learning & Growth)
- **Sub KPIs** — measurable indicators within each area; scoped to designation, frequency, and target values
- **Designation Matrix** — maps designations to KPI areas with weighting
- **Achievement Levels** — score-to-increment mapping per designation/department
- **Appraisal Config** — configures appraisal cycles per designation
- **Employee KPI Records** — actual evaluation records per employee per period
- **My Appraisal** — employee self-service view of their own appraisal
- **Evaluation** — evaluator view for scoring employees
- **Dashboard** — aggregated KPI metrics and achievement overview

---

## Base URL

`/api/v1/performance`

---

## Data Contracts

### MainKPIArea

```json
{
	"id": "kpi-area-001",
	"code": "FIN",
	"name": "Financial Performance",
	"perspective": "Financial",
	"weight": 25,
	"description": "Tracks financial targets and cost efficiency.",
	"isActive": true,
	"createdAt": "2026-01-01"
}
```

**`perspective`** — `"Financial"` | `"Customer"` | `"Internal Process"` | `"Learning & Growth"`

---

### SubKPI

```json
{
	"id": "sub-kpi-001",
	"code": "ATT-01",
	"name": "Monthly Attendance Rate",
	"mainKPIAreaId": "kpi-area-003",
	"mainKPIAreaName": "Internal Process",
	"mainKPICode": "INT",
	"measurementCriteria": "Attendance % = (Present / Working Days) × 100",
	"markOutOf": 10,
	"category": "Attendance",
	"leaveType": null,
	"disciplinaryType": null,
	"evalType": "Evaluation",
	"type": "Quantitative",
	"unit": "%",
	"weight": 10,
	"targetValue": 95,
	"minValue": 0,
	"maxValue": 100,
	"measurementFrequency": "Monthly",
	"formula": "attendancePct",
	"description": "",
	"isActive": true,
	"designationConfigs": [ /* DesignationConfig[] */ ]
}
```

**`category`** — `"Leave"` | `"Attendance"` | `"Manual"` | `"Disciplinary Ground"`

**`evalType`** — `"Confirmation KPI"` | `"Evaluation"` | `"Appraisal"`

**`type`** — `"Quantitative"` | `"Qualitative"`

**`measurementFrequency`** — `"Daily"` | `"Weekly"` | `"Monthly"` | `"Quarterly"` | `"Yearly"`

---

### DesignationConfig

```json
{
	"designation": "Software Engineer",
	"department": "IT",
	"section": "Development",
	"weight": 15,
	"operator": ">=",
	"targetValue": 90,
	"responsibleTo": ["IT Manager"],
	"frequency": "Monthly"
}
```

**`operator`** — `">="` | `"<="` | `">"` | `"<"` | `"="`

---

### DesignationMatrix

```json
{
	"id": "dm-001",
	"designation": "Software Engineer",
	"department": "IT",
	"kpiAreaId": "kpi-area-001",
	"kpiAreaName": "Financial Performance",
	"perspective": "Financial",
	"weight": 25,
	"isActive": true
}
```

---

### AchievementLevelConfig

```json
{
	"id": "alc-1",
	"department": "Human Resources",
	"section": "General HR",
	"designation": "HOD",
	"levels": [ /* AchievementLevelRow[] */ ]
}
```

### AchievementLevelRow

```json
{
	"id": "l1",
	"name": "Outstanding",
	"scoreOperator": "more_than",
	"scoreValue": 90,
	"scoreFrom": 0,
	"scoreTo": 0,
	"incrementType": "above",
	"incrementPercent": 25
}
```

**`scoreOperator`** — `"more_than"` | `"less_than"` | `"range"`

**`incrementType`** — `"above"` | `"exact"` | `"no_increment"`

---

### EmployeeKPIRecord

```json
{
	"id": "rec-001",
	"employeeId": "TN-99318",
	"employeeName": "Shanto Karmoker",
	"designation": "Business Analyst",
	"department": "Business Analysis",
	"period": "Q1 2026",
	"kpiAreaName": "Internal Process",
	"subKPIName": "Monthly Attendance Rate",
	"targetValue": 95,
	"achievedValue": 97,
	"achievementPct": 102,
	"weightedScore": 9.8,
	"achievementLevel": "Outstanding",
	"status": "Finalized"
}
```

**`status`** — `"Pending"` | `"Submitted"` | `"Reviewed"` | `"Finalized"`

---

## Endpoints

### Main KPI Areas

| Method   | Path                              | Description              |
|----------|-----------------------------------|--------------------------|
| `GET`    | `/api/v1/performance/kpi-areas`   | List all KPI areas       |
| `POST`   | `/api/v1/performance/kpi-areas`   | Create a KPI area        |
| `PATCH`  | `/api/v1/performance/kpi-areas/:id` | Update a KPI area      |
| `DELETE` | `/api/v1/performance/kpi-areas/:id` | Delete a KPI area      |

---

### Sub KPIs

| Method   | Path                              | Description              |
|----------|-----------------------------------|--------------------------|
| `GET`    | `/api/v1/performance/sub-kpis`    | List; filter by `mainKPIAreaId`, `evalType`, `isActive` |
| `POST`   | `/api/v1/performance/sub-kpis`    | Create a Sub KPI         |
| `PATCH`  | `/api/v1/performance/sub-kpis/:id`| Update a Sub KPI         |
| `DELETE` | `/api/v1/performance/sub-kpis/:id`| Delete a Sub KPI         |

---

### Designation Matrix

| Method   | Path                                | Description                      |
|----------|-------------------------------------|----------------------------------|
| `GET`    | `/api/v1/performance/matrix`        | List; filter by `designation`, `department` |
| `POST`   | `/api/v1/performance/matrix`        | Create an entry                  |
| `PATCH`  | `/api/v1/performance/matrix/:id`    | Update weight / active status    |
| `DELETE` | `/api/v1/performance/matrix/:id`    | Remove entry                     |

---

### Achievement Level Configs

| Method   | Path                                       | Description                  |
|----------|--------------------------------------------|------------------------------|
| `GET`    | `/api/v1/performance/achievement-levels`   | List; filter by `department`, `designation` |
| `POST`   | `/api/v1/performance/achievement-levels`   | Create a config              |
| `PUT`    | `/api/v1/performance/achievement-levels/:id` | Replace all levels in a config |
| `DELETE` | `/api/v1/performance/achievement-levels/:id` | Delete a config              |

---

### Employee KPI Records

| Method  | Path                                           | Description                    |
|---------|------------------------------------------------|--------------------------------|
| `GET`   | `/api/v1/performance/records`                  | List; filter by `employeeId`, `period`, `status` |
| `POST`  | `/api/v1/performance/records`                  | Create/submit an evaluation record |
| `PATCH` | `/api/v1/performance/records/:id`              | Update `achievedValue` or `status` |
| `POST`  | `/api/v1/performance/records/:id/finalize`     | Finalize the record            |

---

### Dashboard

**`GET /api/v1/performance/dashboard`**

Query parameters: `period` (e.g. `"Q1 2026"`)

Response `200`:

```json
{
	"totalEmployees": 120,
	"avgScore": 78.4,
	"outstanding": 18,
	"belowAverage": 5,
	"kpiAreaBreakdown": [
		{ "kpiAreaName": "Financial Performance", "avgAchievementPct": 82 }
	],
	"recentRecords": [ /* EmployeeKPIRecord[] */ ]
}
```
