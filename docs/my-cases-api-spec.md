# My Cases API Specification

> **Feature:** ESS → My Cases (My Complaints)
> **Base URL:** `/api/v1/my-cases`
> **Date:** 2026-03-25
> **Auth:** Bearer token required — employee-scoped (returns only the authenticated employee's own cases)

---

## Data Models

### `Employee`
```json
{
  "id":        "string",
  "name":      "string",
  "anonymous": "boolean (optional)"
}
```

### `ShowCauseNotice`
```json
{
  "ref":         "string",
  "description": "string",
  "isOverdue":   "boolean"
}
```

### `ComplaintTicket`
```json
{
  "ticketId":              "string (REQ-XXXXXX-XXXX)",
  "conflictDescription":   "string",
  "employeesInvolved":     ["Employee"],
  "nature":                "Anti-Harassment | Fraud / Forgery | Workplace Violence | Theft / Pilferage | Policy Violation | Misconduct",
  "reportedBy":            "Employee",
  "security":              "Low | Medium | High | Critical",
  "requestDate":           "string (DD-MM-YYYY; HH:MM AM/PM)",
  "status":                "Pending | Ongoing | Authority Review | Show Cause Issued | Closed",
  "resolutionDate":        "string | null",
  "showCause":             "ShowCauseNotice | null",
  "submitterName":         "string",
  "submitterId":           "string",
  "phoneNumber":           "string",
  "department":            "string",
  "dateOfIncident":        "string (DD-MM-YYYY)",
  "timeOfIncident":        "string (HH:MM AM/PM)",
  "location":              "string",
  "witness":               "string",
  "descriptionOfIncident": "string",
  "preferredOutcome":      "string"
}
```

---

## Endpoints

### Cases

#### `GET /api/v1/my-cases`
List all complaint tickets belonging to the authenticated employee.

**Query Parameters**

| Param      | Type   | Description                                                   |
|------------|--------|---------------------------------------------------------------|
| `tab`      | string | `all \| Pending \| Ongoing \| Closed`                         |
| `search`   | string | Full-text search on ticketId, description                     |
| `nature`   | string | Filter by nature of complaint                                 |
| `security` | string | `Low \| Medium \| High \| Critical`                           |
| `dateFrom` | string | Start of request date range (ISO 8601)                        |
| `dateTo`   | string | End of request date range (ISO 8601)                         |
| `page`     | number | Page number (default: 1)                                      |
| `pageSize` | number | Items per page (default: 20)                                  |

**Response `200`**
```json
{
  "data":  ["ComplaintTicket"],
  "total": "number",
  "page":  "number",
  "counts": {
    "all":     "number",
    "Pending": "number",
    "Ongoing": "number",
    "Closed":  "number"
  }
}
```

---

#### `GET /api/v1/my-cases/:ticketId`
Get a single complaint ticket with full details.

**Response `200`** — `ComplaintTicket`

**Response `404`** — `{ "message": "Ticket not found" }`

**Response `403`** — if the ticket does not belong to the authenticated employee

---

#### `POST /api/v1/my-cases`
Submit a new complaint ticket.

**Request Body**
```json
{
  "submitterName":         "string",
  "submitterId":           "string",
  "phoneNumber":           "string",
  "department":            "string",
  "dateOfIncident":        "string (DD-MM-YYYY)",
  "timeOfIncident":        "string (HH:MM AM/PM)",
  "location":              "string",
  "nature":                "string",
  "employeesInvolved":     [{ "id": "string", "name": "string" }],
  "witness":               "string",
  "descriptionOfIncident": "string",
  "preferredOutcome":      "string",
  "anonymous":             "boolean",
  "attachments":           ["fileId"]
}
```

**Response `201`** — `ComplaintTicket`

---

#### `PATCH /api/v1/my-cases/:ticketId`
Update a complaint ticket (allowed only while `status === "Pending"`).

**Request Body** — partial complaint fields (description, preferredOutcome, etc.)

**Response `200`** — updated `ComplaintTicket`

**Response `403`** — if ticket is not in Pending status

---

#### `DELETE /api/v1/my-cases/:ticketId`
Withdraw a complaint (allowed only while `status === "Pending"`).

**Response `200`** — `{ "message": "Complaint withdrawn" }`

**Response `403`** — if ticket has already progressed beyond Pending

---

### Show Cause

#### `GET /api/v1/my-cases/:ticketId/show-cause`
Get the Show Cause notice issued to the employee.

**Response `200`** — `ShowCauseNotice`

**Response `404`** — if no Show Cause notice has been issued

---

#### `POST /api/v1/my-cases/:ticketId/show-cause/response`
Submit the employee's explanation in response to a Show Cause notice.

**Request Body**
```json
{
  "explanation": "string",
  "attachments": ["fileId"]
}
```

**Response `201`** — `{ "responseId": "string", "submittedAt": "string" }`

**Response `409`** — if a response has already been submitted

**Response `422`** — if the Show Cause deadline has passed

---

### Attachments

#### `POST /api/v1/my-cases/attachments`
Upload an attachment before or during ticket submission.

**Request Body** — `multipart/form-data`
- `file` — binary
- `type` — `"Evidence (Email) | Evidence (Documents) | Evidence (Screenshots/Socials) | Statement | Other"`

**Response `201`**
```json
{
  "fileId":   "string",
  "fileName": "string",
  "fileSize": "number",
  "mimeType": "string",
  "url":      "string"
}
```

---

#### `DELETE /api/v1/my-cases/attachments/:fileId`
Delete an uploaded attachment (only if not yet linked to a submitted ticket).

**Response `200`** — `{ "message": "Attachment deleted" }`

---

### Timeline

#### `GET /api/v1/my-cases/:ticketId/timeline`
Get the activity timeline for the employee's case (employee-visible events only).

**Response `200`**
```json
[
  {
    "id":          "string",
    "type":        "complaint | stage | action | document | status | decision",
    "title":       "string",
    "description": "string | null",
    "actor":       "string",
    "timestamp":   "string (ISO 8601)",
    "tag":         "string | null"
  }
]
```

> **Note:** Internal HR-only events (committee details, verdict specifics, Q&A transcripts) are excluded from this endpoint.

---

## Status Transition Rules

```
Pending → Ongoing          (HR begins investigation)
Ongoing → Show Cause Issued (HR issues Show Cause notice)
Ongoing → Authority Review  (Summary sent for authority approval)
Authority Review → Ongoing  (Authority raises objection)
Authority Review → Closed   (Authority approves — case concluded)
Show Cause Issued → Ongoing (Employee submits explanation)
Any → Closed               (Manual closure or conclusion)
```

---

## Error Responses

| Status | Meaning                                         |
|--------|-------------------------------------------------|
| `400`  | Validation error                                |
| `401`  | Unauthenticated                                 |
| `403`  | Not the ticket owner, or action not permitted   |
| `404`  | Ticket or resource not found                    |
| `409`  | Duplicate submission or conflicting state       |
| `422`  | Business rule violation (e.g. deadline passed)  |
| `500`  | Internal server error                           |

All errors return: `{ "message": "string", "errors": {} }`
