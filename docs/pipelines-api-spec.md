# Pipelines API Specification

> **Feature:** Recruitment Pipelines
> **Date:** 2026-03-25
> **Status:** Draft (derived from UI types)

---

## Overview

The Pipelines module manages recruitment pipelines — ordered sequences of screening stages used to evaluate candidates for a job posting. Each pipeline can be assigned to a job posting. Candidates are tracked through stages, and AI match analysis (score, matched/missing skills) is surfaced per candidate.

---

## Base URL

`/api/v1/recruitment/pipelines`

---

## Common Types

### PipelineStatus
`"Draft" | "Active" | "Archived"`

### PipelineStage Object
```json
{
  "id": "stage-1",
  "name": "Initial Screening",
  "order": 1
}
```

### Pipeline Object
```json
{
  "id": "PIPE-2026-001",
  "name": "Engineering Pipeline 2026",
  "position": "Senior Software Engineer",
  "stages": [
    { "id": "s1", "name": "Initial Screening", "order": 1 },
    { "id": "s2", "name": "Code Assessment", "order": 2 },
    { "id": "s3", "name": "Technical Interview", "order": 3 },
    { "id": "s4", "name": "Culture Fit", "order": 4 },
    { "id": "s5", "name": "Final Offer", "order": 5 }
  ],
  "candidates": 12,
  "createdAt": "2026-01-20T10:00:00",
  "status": "Active",
  "jobPostingId": "MRF-2026-001",
  "jobPostingTitle": "Senior Software Engineer"
}
```

### Candidate Object
```json
{
  "id": "CAND-001",
  "name": "Sarah Jenkins",
  "initials": "SJ",
  "avatarColor": "#7c3aed",
  "company": "ex-Spotify",
  "degree": "B.Des",
  "matchScore": 95,
  "matchedSkills": ["Figma", "React"],
  "missingSkills": [],
  "currentStage": "Initial Screening",
  "currentStageId": "s1",
  "experience": 6,
  "appliedAt": "2026-03-20T08:30:00",
  "hasCV": true
}
```

---

## Endpoints

---

### 1) List Pipelines
**`GET /api/v1/recruitment/pipelines`**

Returns pipelines with optional status filtering.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `status` | `PipelineStatus` | Filter by status |
| `search` | string | Search by pipeline name or position |
| `page` | integer | Page number (default: 1) |
| `pageSize` | integer | Items per page (default: 20) |

**Response `200`:**
```json
{
  "data": [Pipeline, ...],
  "total": 8,
  "page": 1,
  "pageSize": 20
}
```

---

### 2) Get Pipeline Detail
**`GET /api/v1/recruitment/pipelines/:id`**

Returns a single pipeline with all stages.

**Response `200`:** Full `Pipeline` object.

**Response `404`:** Pipeline not found.

---

### 3) Create Pipeline
**`POST /api/v1/recruitment/pipelines`**

**Request Body:**
```json
{
  "name": "Engineering Pipeline 2026",
  "position": "Senior Software Engineer",
  "stages": [
    { "name": "Initial Screening", "order": 1 },
    { "name": "Code Assessment", "order": 2 },
    { "name": "Technical Interview", "order": 3 }
  ],
  "jobPostingId": "MRF-2026-001"
}
```

**Validation Rules:**
- `name` — required
- `position` — required
- `stages` — required; at least one stage; each stage must have `name` and unique `order`

**Response `201`:** Created `Pipeline` with `status: "Draft"`.

---

### 4) Update Pipeline
**`PATCH /api/v1/recruitment/pipelines/:id`**

Update pipeline name, position, stages, or status.

**Request Body:** (any subset)
```json
{
  "name": "Updated Pipeline Name",
  "stages": [...]
}
```

**Restriction:** Stages cannot be reordered/deleted once candidates have been assigned to them.

**Response `200`:** Updated `Pipeline` object.

---

### 5) Archive Pipeline
**`POST /api/v1/recruitment/pipelines/:id/archive`**

**Allowed only when:** `status === "Active"`

**Response `200`:** Updated pipeline with `status: "Archived"`.

---

### 6) Activate Pipeline
**`POST /api/v1/recruitment/pipelines/:id/activate`**

**Allowed only when:** `status === "Draft"`

**Response `200`:** Updated pipeline with `status: "Active"`.

---

### 7) List Candidates in Pipeline
**`GET /api/v1/recruitment/pipelines/:id/candidates`**

Returns candidates enrolled in a pipeline.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `stageId` | string | Filter by current stage |
| `search` | string | Search by candidate name, company, or degree |
| `sortBy` | `"match" \| "experience" \| "recency" \| "name"` | Sort order |
| `page` | integer | Page number |
| `pageSize` | integer | Items per page |

**Response `200`:**
```json
{
  "pipelineId": "PIPE-2026-001",
  "pipelineName": "Engineering Pipeline 2026",
  "stages": [...PipelineStage],
  "data": [Candidate, ...],
  "total": 12,
  "page": 1,
  "pageSize": 20
}
```

---

### 8) Get Candidate Profile
**`GET /api/v1/recruitment/pipelines/:id/candidates/:candidateId`**

Returns detailed candidate profile including work history, education, skills, stage history, Q&A, and feedback.

**Response `200`:**
```json
{
  "id": "CAND-001",
  "name": "Sarah Jenkins",
  "initials": "SJ",
  "avatarColor": "#7c3aed",
  "company": "ex-Spotify",
  "degree": "B.Des",
  "matchScore": 95,
  "matchedSkills": ["Figma", "React"],
  "missingSkills": [],
  "currentStage": "Initial Screening",
  "experience": 6,
  "appliedAt": "2026-03-20T08:30:00",
  "hasCV": true,
  "workExperience": [
    {
      "company": "Spotify",
      "role": "Product Designer",
      "from": "2020-03",
      "to": "2026-01",
      "description": "Led design for Spotify's mobile app redesign..."
    }
  ],
  "education": [
    {
      "institution": "BUET",
      "degree": "B.Des in Industrial Design",
      "graduationYear": 2020
    }
  ],
  "skills": ["Figma", "React", "Sketch", "User Research"],
  "stageHistory": [
    {
      "stageId": "s1",
      "stageName": "Initial Screening",
      "status": "Passed",
      "score": 88,
      "reviewedBy": "HR Manager",
      "reviewedAt": "2026-03-22T14:00:00",
      "notes": "Strong communication skills, clear motivation."
    }
  ],
  "qaSessions": [
    {
      "question": "Why are you interested in this role?",
      "answer": "I've been following Zyrova's product evolution..."
    }
  ],
  "feedback": [
    {
      "reviewer": "Tech Lead",
      "rating": 4,
      "comment": "Excellent portfolio, good cultural alignment.",
      "submittedAt": "2026-03-23T09:00:00"
    }
  ],
  "activityTimeline": [
    {
      "action": "Applied",
      "at": "2026-03-20T08:30:00",
      "actor": "System"
    }
  ]
}
```

---

### 9) Move Candidate to Stage
**`POST /api/v1/recruitment/pipelines/:id/candidates/:candidateId/move`**

Moves a candidate to a different stage within the pipeline.

**Request Body:**
```json
{
  "targetStageId": "s2",
  "notes": "Passed initial screening. Moving to code assessment."
}
```

**Response `200`:** Updated candidate object with new `currentStage`.

---

### 10) Reject Candidate
**`POST /api/v1/recruitment/pipelines/:id/candidates/:candidateId/reject`**

**Request Body:**
```json
{
  "reason": "Skills do not match required technical stack."
}
```

**Response `200`:** Updated candidate with `currentStage: "Rejected"`.

---

### 11) Bulk Move Candidates
**`POST /api/v1/recruitment/pipelines/:id/candidates/bulk-move`**

**Request Body:**
```json
{
  "candidateIds": ["CAND-001", "CAND-002"],
  "targetStageId": "s2"
}
```

**Response `200`:**
```json
{
  "moved": 2,
  "skipped": 0
}
```

---

### 12) Bulk Reject Candidates
**`POST /api/v1/recruitment/pipelines/:id/candidates/bulk-reject`**

**Request Body:**
```json
{
  "candidateIds": ["CAND-003"],
  "reason": "Did not meet minimum experience requirement."
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

### 13) Download Candidate CV
**`GET /api/v1/recruitment/pipelines/:id/candidates/:candidateId/cv`**

**Response `200`:** File download (PDF). Returns `404` if no CV attached.

---

## Status Flow

### Pipeline Status
```
Draft → Active → Archived
```

### Candidate Stage
Candidates move forward through pipeline stages. They can be rejected at any stage. Stage transitions are append-only once candidates are enrolled.
