# Exit Interviews API Specification

> **Feature:** Offboarding → Exit Interviews
> **Date:** 2026-03-12
> **Status:** Active

---

## Overview

Manages exit interviews conducted when an employee separates from the organisation. An interview is initially scheduled, then conducted (responses submitted by HR), and finally completed. Captures structured ratings, open-ended responses, and an HR notes section.

---

## Base URL

`/api/v1/exit-interviews`

---

## Data Contracts

### ExitInterview (Summary)

```json
{
  "id": "1",
  "employeeName": "Aisha Patel",
  "initials": "AP",
  "employeeId": "EMP-001",
  "department": "Engineering",
  "date": "2026-01-15",
  "interviewer": "Sarah Johnson",
  "reason": "Career Growth",
  "status": "Completed",
  "recommend": true,
  "rating": 4.2,
  "quote": "Great culture, limited growth paths."
}
```

**`status`** — `"Scheduled"` | `"Pending"` | `"Completed"` | `"Cancelled"`

---

### InterviewResponses

Submitted when an interview is conducted.

```json
{
  "reasons": "Seeking better career advancement opportunities.",
  "policyImprovement": "Clearer promotion timelines.",
  "orgImprovement": "More cross-team collaboration.",
  "additionalComments": "I enjoyed working here.",
  "separationRequests": "Please issue experience letter promptly.",
  "overallExperienceRating": 4,
  "wouldRecommend": "Yes",
  "workLifeRating": 3,
  "compensationRating": 3,
  "managementRating": 4,
  "overallRatingFinal": 4,
  "wouldRecommendFinal": true,
  "hrNotes": "Employee was cooperative. No disputes raised."
}
```

---

### ExitInterview (Detail)

Full object returned on `GET /:id`:

```json
{
  "id": "1",
  "employeeName": "Aisha Patel",
  "initials": "AP",
  "employeeId": "EMP-001",
  "department": "Engineering",
  "date": "2026-01-15",
  "interviewer": "Sarah Johnson",
  "reason": "Career Growth",
  "status": "Completed",
  "recommend": true,
  "rating": 4.2,
  "quote": "Great culture, limited growth paths.",
  "responses": { /* InterviewResponses */ }
}
```

---

## Endpoints

### 1. List Exit Interviews

**`GET /api/v1/exit-interviews`**

Query parameters:

| Parameter    | Type   | Description                                              |
|--------------|--------|----------------------------------------------------------|
| `status`     | string | `Scheduled` \| `Pending` \| `Completed` \| `Cancelled`  |
| `department` | string | Filter by department name                                |
| `search`     | string | Partial match on `employeeName` or `employeeId`          |
| `page`       | int    | Default `1`                                              |
| `pageSize`   | int    | Default `20`                                             |

Response `200`:

```json
{
  "data": [ /* ExitInterview (Summary)[] */ ],
  "total": 24,
  "page": 1,
  "pageSize": 20
}
```

---

### 2. Get Interview Detail

**`GET /api/v1/exit-interviews/:id`**

Response `200`: `ExitInterview` (Detail — includes `responses` if conducted)

---

### 3. Schedule Interview

**`POST /api/v1/exit-interviews`**

Request body:

```json
{
  "employeeId": "EMP-001",
  "date": "2026-01-15",
  "interviewer": "Sarah Johnson",
  "reason": "Career Growth"
}
```

Response `201`: `ExitInterview` with `status: "Scheduled"`

---

### 4. Update Scheduled Interview

**`PATCH /api/v1/exit-interviews/:id`**

Allowed when `status` is `"Scheduled"` or `"Pending"`. Accepts partial body (`date`, `interviewer`, `reason`).

Response `200`: updated `ExitInterview`

---

### 5. Conduct Interview (Submit Responses)

**`POST /api/v1/exit-interviews/:id/conduct`**

Submits the interview responses. Sets `status: "Completed"`.

Request body: `InterviewResponses`

Response `200`: updated `ExitInterview` (Detail)

Response `409`: interview already completed or cancelled

---

### 6. Cancel Interview

**`POST /api/v1/exit-interviews/:id/cancel`**

Sets `status: "Cancelled"`.

Request body (optional):

```json
{ "reason": "Employee rescinded resignation." }
```

Response `200`: updated `ExitInterview`

---

### 7. Export Interview Report

**`GET /api/v1/exit-interviews/:id/export`**

Returns a PDF of the completed interview responses.

Response `200`: `Content-Type: application/pdf`

Response `404`: interview not found or not completed
