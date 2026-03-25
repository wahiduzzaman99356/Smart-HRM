# Job Postings API Specification

> **Feature:** Job Postings (Recruitment)
> **Date:** 2026-03-25
> **Status:** Draft (derived from UI types)

---

## Overview

The Job Postings module surfaces approved Manpower Requisition Forms (MRFs) as public-facing job postings. HR can publish postings, assign them to recruitment pipelines, and track application statistics. Postings flow through a status lifecycle from Draft to Closed.

---

## Base URL

`/api/v1/recruitment/job-postings`

---

## Common Types

### JobStatus
`"Draft" | "Published" | "On-Going" | "Closed" | "Rejected"`

### EmploymentType
`"Full Time" | "Part Time" | "Contractual" | "Intern"`

### ExperienceMode
`"Fresher" | "Experienced"`

### WorkLocation
`"Head Office" | "Airport Office" | "Field Office"`

### JobPosting Object
```json
{
  "mrfId": "MRF-2026-001",
  "mrfRef": "REQ-20260101",
  "designation": "Senior Software Engineer",
  "department": "Technology",
  "initiateDate": "2026-01-15",
  "employmentType": "Full Time",
  "workLocation": "Head Office",
  "vacancyNumber": "3",
  "etaDate": "2026-04-30",
  "typeOfRequisition": "New Recruitment",
  "gender": "Any",
  "experienceMode": "Experienced",
  "yearsOfExperience": "5",
  "educationQualification": "Bachelor",
  "skillsRequired": ["React", "TypeScript", "Node.js"],
  "jobResponsibility": "Design, build and maintain web applications...",
  "pipeline": "Engineering Pipeline 2026",
  "applications": 42,
  "matched": 18,
  "shortListed": 7,
  "status": "On-Going"
}
```

---

## Endpoints

---

### 1) List Job Postings
**`GET /api/v1/recruitment/job-postings`**

Returns paginated job postings with filtering.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `status` | `JobStatus` | Filter by status |
| `department` | string | Filter by department |
| `employmentType` | `EmploymentType` | Filter by employment type |
| `workLocation` | `WorkLocation` | Filter by location |
| `publishedFrom` | date (YYYY-MM-DD) | Published date range start |
| `publishedTo` | date (YYYY-MM-DD) | Published date range end |
| `search` | string | Search by designation, department, or MRF ref |
| `page` | integer | Page number (default: 1) |
| `pageSize` | integer | Items per page (default: 20) |

**Response `200`:**
```json
{
  "data": [JobPosting, ...],
  "total": 34,
  "page": 1,
  "pageSize": 20,
  "statusCounts": {
    "Draft": 5,
    "Published": 3,
    "On-Going": 12,
    "Closed": 10,
    "Rejected": 4
  }
}
```

---

### 2) Get Job Posting Detail
**`GET /api/v1/recruitment/job-postings/:mrfId`**

**Response `200`:** Full `JobPosting` object.

**Response `404`:** Job posting not found.

---

### 3) Create Job Posting (from MRF)
**`POST /api/v1/recruitment/job-postings`**

Creates a job posting linked to an approved MRF.

**Request Body:**
```json
{
  "mrfId": "MRF-2026-005",
  "pipeline": null
}
```

**Validation Rules:**
- `mrfId` — required; must be a valid approved MRF not already linked to a posting

**Side Effects:**
- Pulls designation, department, employment type, work location, vacancy, deadline, skills, etc. from the referenced MRF
- Posting is created with `status: "Draft"`

**Response `201`:** Created `JobPosting` object.

**Response `422`:** Validation error (e.g., MRF not found, already posted, not approved).

---

### 4) Update Job Posting
**`PATCH /api/v1/recruitment/job-postings/:mrfId`**

Update posting-specific fields (not MRF-sourced fields).

**Request Body:**
```json
{
  "pipeline": "Engineering Pipeline 2026",
  "status": "Published"
}
```

**Allowed fields to update:** `pipeline`, `status`

**Status transition rules:**
- `Draft` → `Published` — allowed
- `Published` → `Closed` — allowed
- `Draft` → `Rejected` — allowed
- Other transitions — not allowed via PATCH (use dedicated action endpoints)

**Response `200`:** Updated `JobPosting` object.

---

### 5) Publish Job Posting
**`POST /api/v1/recruitment/job-postings/:mrfId/publish`**

Transitions a Draft posting to Published.

**Allowed only when:** `status === "Draft"`

**Response `200`:** Updated posting with `status: "Published"`.

---

### 6) Assign Pipeline
**`POST /api/v1/recruitment/job-postings/:mrfId/assign-pipeline`**

Assigns or reassigns a recruitment pipeline to this posting.

**Request Body:**
```json
{
  "pipelineId": "PIPE-2026-003"
}
```

**Response `200`:** Updated posting with `pipeline` set.

---

### 7) Close Job Posting
**`POST /api/v1/recruitment/job-postings/:mrfId/close`**

**Allowed only when:** `status === "Published"` or `"On-Going"`

**Response `200`:** Updated posting with `status: "Closed"`.

---

### 8) Reject Job Posting
**`POST /api/v1/recruitment/job-postings/:mrfId/reject`**

**Request Body:**
```json
{
  "remarks": "MRF no longer valid due to department restructuring."
}
```

**Allowed only when:** `status === "Draft"`

**Response `200`:** Updated posting with `status: "Rejected"`.

---

### 9) Reference Data
**`GET /api/v1/recruitment/job-postings/reference`**

**Response `200`:**
```json
{
  "departments": ["Technology", "Operations", "Finance", "Human Resources"],
  "employmentTypes": ["Full Time", "Part Time", "Contractual", "Intern"],
  "workLocations": ["Head Office", "Airport Office", "Field Office"]
}
```

---

## Status Flow

```
Draft → Published → On-Going → Closed
Draft → Rejected
```

| Transition | Trigger |
|------------|---------|
| `Draft` → `Published` | HR publishes the posting |
| `Published` → `On-Going` | System sets when first application is received |
| `On-Going` → `Closed` | HR manually closes or deadline passes |
| `Draft` → `Rejected` | HR rejects the MRF-backed posting |
