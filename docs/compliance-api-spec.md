# Compliance API Specification

> **Feature:** Employee Relations → Compliance
> **Base URL:** `/api/v1/compliance`
> **Date:** 2026-03-25
> **Auth:** Bearer token required on all endpoints

---

## Data Models

### `Employee`
```json
{
  "id":   "string",
  "name": "string"
}
```

### `HRResponse`
```json
{
  "date":                   "string (DD-MM-YYYY)",
  "conflictType":           "Interpersonal | Workplace Violence | Harassment | Discrimination | Policy Violation | Performance | Other",
  "securityLevel":          "Low | Medium | High",
  "assignPersonnel":        ["string"],
  "preferredActions":       ["string"],
  "preferredDateOfMeeting": "string (DD-MM-YYYY; HH:MM AM/PM)",
  "resolutionStrategy":     "Negotiation | Mediation | Arbitration | Litigation | Collaborative",
  "remarks":                "string"
}
```

### `ComplianceTicket`
```json
{
  "ticketId":              "string (REQ-XXXXXXXXX)",
  "conflictDescription":   "string",
  "employeesInvolved":     ["Employee"],
  "natureOfConflict":      "Policy Related | Tax Related | Interpersonal | Workplace Harassment | Other",
  "reportedBy":            "Employee",
  "securityLevel":         "Low | Medium | High",
  "requestDate":           "string (DD-MM-YYYY; HH:MM AM/PM)",
  "ticketStatus":          "Pending | Ongoing | Closed",
  "lastResolutionDate":    "string | null",
  "currentStatus":         "Under Review | Escalated | In Mediation | Action Pending | Resolved",
  "deadline":              "string (DD-MM-YYYY)",
  "name":                  "string",
  "employeeId":            "string",
  "phoneNumber":           "string",
  "department":            "string",
  "dateOfIncident":        "string (DD-MM-YYYY)",
  "timeOfIncident":        "string (HH:MM)",
  "location":              "string",
  "witness":               "string",
  "descriptionOfIncident": "string",
  "preferredOutcome":      "string",
  "responses":             ["HRResponse"]
}
```

---

## Endpoints

### Tickets

#### `GET /api/v1/compliance/tickets`
List all compliance tickets with optional filters.

**Query Parameters**

| Param          | Type     | Description                                      |
|----------------|----------|--------------------------------------------------|
| `search`       | string   | Full-text search on ticketId, employee name/id   |
| `status`       | string   | `Pending \| Ongoing \| Closed`                   |
| `nature`       | string   | Nature of conflict filter                        |
| `security`     | string   | `Low \| Medium \| High`                          |
| `dateFrom`     | string   | Start of request date range (ISO 8601)           |
| `dateTo`       | string   | End of request date range (ISO 8601)             |
| `page`         | number   | Page number (default: 1)                         |
| `pageSize`     | number   | Items per page (default: 20)                     |

**Response `200`**
```json
{
  "data":  ["ComplianceTicket"],
  "total": "number",
  "page":  "number"
}
```

---

#### `GET /api/v1/compliance/tickets/:ticketId`
Get a single ticket with full detail.

**Response `200`** — `ComplianceTicket`

**Response `404`** — `{ "message": "Ticket not found" }`

---

#### `POST /api/v1/compliance/tickets`
Submit a new compliance complaint (Section A — employee submission).

**Request Body**
```json
{
  "name":                  "string",
  "employeeId":            "string",
  "phoneNumber":           "string",
  "department":            "string",
  "dateOfIncident":        "string",
  "timeOfIncident":        "string",
  "location":              "string",
  "natureOfConflict":      "string",
  "employeesInvolved":     ["{ id, name }"],
  "witness":               "string",
  "descriptionOfIncident": "string",
  "preferredOutcome":      "string",
  "attachments":           ["fileId"]
}
```

**Response `201`** — `ComplianceTicket`

---

#### `PATCH /api/v1/compliance/tickets/:ticketId`
Update ticket metadata (status, deadline, security level).

**Request Body** — partial `ComplianceTicket` fields

**Response `200`** — updated `ComplianceTicket`

---

#### `PATCH /api/v1/compliance/tickets/:ticketId/close`
Close a ticket.

**Request Body**
```json
{
  "closureStatement": "string",
  "closureDate":      "string"
}
```

**Response `200`** — `{ "ticketStatus": "Closed" }`

---

### HR Responses

#### `GET /api/v1/compliance/tickets/:ticketId/responses`
List all HR responses for a ticket.

**Response `200`** — `["HRResponse"]`

---

#### `POST /api/v1/compliance/tickets/:ticketId/responses`
Add a new HR response (Section B — HR POC).

**Request Body** — `HRResponse` (without `date`, set server-side)

**Response `201`** — `HRResponse`

---

### Investigation Stages

All stage endpoints follow the pattern:
`/api/v1/compliance/tickets/:ticketId/investigation/:stage`

Where `:stage` is one of:
`show-cause | explanation | committee | investigation | verdict | report | summary | authority-review | conclusion | re-evaluation`

---

#### Show Cause — `POST /api/v1/compliance/tickets/:ticketId/investigation/show-cause`
Issue a Show Cause letter.

**Request Body**
```json
{
  "letterContent": "string (HTML)",
  "issuedTo":      ["employeeId"],
  "deadline":      "string"
}
```

**Response `201`** — `{ "showCauseId": "string", "issuedAt": "string" }`

---

#### Explanation — `POST /api/v1/compliance/tickets/:ticketId/investigation/explanation`
Record employee explanation.

**Request Body**
```json
{
  "employeeId":  "string",
  "explanation": "string",
  "submittedAt": "string"
}
```

**Response `201`** — `{ "explanationId": "string" }`

#### `PATCH /api/v1/compliance/tickets/:ticketId/investigation/explanation/:explanationId/action`
Accept or escalate an explanation.

**Request Body**
```json
{
  "action":  "accept | escalate",
  "remarks": "string"
}
```

---

#### Committee — `POST /api/v1/compliance/tickets/:ticketId/investigation/committee`
Form an investigation committee.

**Request Body**
```json
{
  "committeeType": "Internal | External | Mixed",
  "members": [
    {
      "employeeId": "string",
      "name":       "string",
      "role":       "Chair | Member | Observer | Secretary"
    }
  ]
}
```

**Response `201`** — `{ "committeeId": "string" }`

#### `POST /api/v1/compliance/tickets/:ticketId/investigation/committee/members`
Add a member to the committee.

**Request Body** — `{ "employeeId", "name", "role" }`

#### `DELETE /api/v1/compliance/tickets/:ticketId/investigation/committee/members/:memberId`
Remove a committee member.

---

#### Investigation — Overview, Tasks, Evidence, Q&A

##### `GET /api/v1/compliance/tickets/:ticketId/investigation/overview`
Get task summary stats, committee members, and suspension status.

**Response `200`**
```json
{
  "totalTasks":     "number",
  "completedTasks": "number",
  "pendingTasks":   "number",
  "overdueTasks":   "number",
  "suspensionActive": "boolean",
  "suspensionDetails": {
    "type":       "string",
    "startDate":  "string",
    "endDate":    "string",
    "reason":     "string"
  }
}
```

##### `GET /api/v1/compliance/tickets/:ticketId/investigation/tasks`
List investigation tasks.

##### `POST /api/v1/compliance/tickets/:ticketId/investigation/tasks`
Create a task.

**Request Body**
```json
{
  "title":      "string",
  "assignedTo": "string",
  "dueDate":    "string",
  "priority":   "Low | Medium | High"
}
```

##### `PATCH /api/v1/compliance/tickets/:ticketId/investigation/tasks/:taskId/submit`
Submit task completion.

**Request Body** — `{ "submissionNote": "string" }`

##### `POST /api/v1/compliance/tickets/:ticketId/investigation/evidence`
Upload evidence file.

**Request Body** — `multipart/form-data`
- `file` — binary
- `type` — `"Evidence (Email) | Evidence (Documents) | Evidence (Screenshots/Socials) | Statement | Report"`
- `description` — string

##### `DELETE /api/v1/compliance/tickets/:ticketId/investigation/evidence/:evidenceId`
Remove an evidence file.

##### `GET /api/v1/compliance/tickets/:ticketId/investigation/qa-sessions`
List Q&A sessions.

##### `POST /api/v1/compliance/tickets/:ticketId/investigation/qa-sessions`
Record a Q&A session.

**Request Body**
```json
{
  "participant": "string",
  "sessionDate": "string",
  "sessionTime": "string",
  "questions":   [{ "question": "string", "answer": "string" }]
}
```

##### `PATCH /api/v1/compliance/tickets/:ticketId/investigation/suspension`
Update suspension management.

**Request Body**
```json
{
  "active":    "boolean",
  "type":      "Paid | Unpaid | Administrative",
  "startDate": "string",
  "endDate":   "string",
  "reason":    "string"
}
```

---

#### Verdict — `POST /api/v1/compliance/tickets/:ticketId/investigation/verdict`
Submit committee member findings.

**Request Body**
```json
{
  "memberId":    "string",
  "guilty":      "Guilty | Not Guilty | Partially Guilty",
  "severity":    "Minor | Moderate | Severe | Critical",
  "recommendation": "string",
  "notes":       "string"
}
```

**Response `201`** — `{ "findingId": "string" }`

#### `GET /api/v1/compliance/tickets/:ticketId/investigation/verdict`
List all verdict findings.

---

#### Report — `GET /api/v1/compliance/tickets/:ticketId/investigation/report`
Get the current report content.

**Response `200`** — `{ "content": "string (HTML)", "lastSaved": "string" }`

#### `PUT /api/v1/compliance/tickets/:ticketId/investigation/report`
Save or update the report content.

**Request Body** — `{ "content": "string (HTML)" }`

#### `POST /api/v1/compliance/tickets/:ticketId/investigation/report/submit`
Submit the report for review.

**Response `200`** — `{ "submittedAt": "string" }`

#### `GET /api/v1/compliance/tickets/:ticketId/investigation/report/download`
Download the report as a file.

**Response** — `application/octet-stream` (HTML or PDF)

---

#### Summary — `PUT /api/v1/compliance/tickets/:ticketId/investigation/summary`
Save or update the case summary.

**Request Body**
```json
{
  "executiveSummary": "string",
  "keyFindings":      ["string"],
  "suggestedActions": [
    {
      "employeeId":  "string",
      "actionType":  "Termination | Suspension | Demotion | Written Warning | Final Warning | Fine/Penalty | Transfer | Mandatory Training | Counseling | No Action | Other",
      "duration":    "string",
      "justification": "string"
    }
  ]
}
```

#### `POST /api/v1/compliance/tickets/:ticketId/investigation/summary/submit`
Submit summary for final approval.

---

#### Authority Review — `POST /api/v1/compliance/tickets/:ticketId/investigation/authority-review`
Submit the authority's decision.

**Request Body**
```json
{
  "decision":          "no-objection | objection",
  "confirmAction":     "Confirm Suggested Action | Modify Action",
  "decisionStatement": "string",
  "objectionReason":   "string | null",
  "objectionStatement":"string | null",
  "objectionAction":   "Re-investigation | Re-evaluation | Additional Evidence Required | Committee Reconvening | null"
}
```

**Response `200`** — `{ "reviewId": "string", "decidedAt": "string" }`

---

#### Conclusion — `POST /api/v1/compliance/tickets/:ticketId/investigation/conclusion/notices`
Issue a formal decision notice to an employee.

**Request Body**
```json
{
  "employeeId":    "string",
  "actionType":    "string",
  "effectiveDate": "string",
  "status":        "Pending Issuance | Notice Issued | Acknowledged | Implemented"
}
```

**Response `201`** — `{ "noticeId": "string", "issuedAt": "string" }`

#### `POST /api/v1/compliance/tickets/:ticketId/investigation/conclusion/close`
Formally close the case.

**Request Body**
```json
{
  "closureStatement": "string",
  "closureDate":      "string"
}
```

**Response `200`** — `{ "closedAt": "string" }`

---

#### Re-evaluation — `POST /api/v1/compliance/tickets/:ticketId/investigation/re-evaluation`
Confirm re-evaluation decision.

**Request Body**
```json
{
  "decision":          "start | dismiss",
  "scope":             "Full Re-investigation | Evidence Review Only | Committee Re-hearing | Witness Re-examination | Verdict Re-assessment | Procedural Review | null",
  "assignedTo":        "string | null",
  "deadline":          "string | null",
  "instructions":      "string | null",
  "dismissReason":     "string | null",
  "dismissStatement":  "string | null"
}
```

**Response `200`** — `{ "reEvaluationId": "string", "decidedAt": "string" }`

---

### Activity Timeline

#### `GET /api/v1/compliance/tickets/:ticketId/timeline`
Get the full activity timeline for a ticket.

**Query Parameters**

| Param  | Type   | Description                                                        |
|--------|--------|--------------------------------------------------------------------|
| `type` | string | Filter by event type: `complaint \| stage \| action \| document \| comment \| status \| system \| decision` |

**Response `200`**
```json
[
  {
    "id":          "string",
    "type":        "complaint | stage | action | document | comment | status | system | decision",
    "title":       "string",
    "description": "string | null",
    "actor":       "string",
    "actorRole":   "string | null",
    "timestamp":   "string (ISO 8601)",
    "tag":         "string | null",
    "details":     [{ "label": "string", "value": "string" }]
  }
]
```

---

## Error Responses

| Status | Meaning                        |
|--------|--------------------------------|
| `400`  | Validation error               |
| `401`  | Unauthenticated                |
| `403`  | Insufficient permissions       |
| `404`  | Resource not found             |
| `409`  | Conflict (duplicate or state)  |
| `422`  | Business rule violation        |
| `500`  | Internal server error          |

All errors return: `{ "message": "string", "errors": {} }`
