# Conflict Resolution API Specification

> **Feature:** Conflict Resolution (Employee Relations)
> **Date:** 2026-03-25
> **Status:** Draft (derived from UI types)

---

## Overview

The Conflict Resolution module allows employees to raise conflict/dispute tickets and HR personnel to manage them through a structured resolution workflow. HR can respond to tickets, assign personnel, schedule meetings, select resolution strategies, and track the ticket to closure.

---

## Base URL

`/api/v1/conflict-resolution`

---

## Common Types

### TicketStatus
`"Pending" | "Ongoing" | "Closed"`

### SecurityLevel
`"Low" | "Medium" | "High"`

### NatureOfConflict
`"Policy Related" | "Tax Related" | "Interpersonal" | "Workplace Harassment" | "Other"`

### ConflictType
`"Interpersonal" | "Workplace Violence" | "Harassment" | "Discrimination" | "Policy Violation" | "Performance" | "Other"`

### ResolutionStrategy
`"Negotiation" | "Mediation" | "Arbitration" | "Litigation" | "Collaborative"`

---

## Endpoints

---

### 1) List Conflict Tickets
**`GET /api/v1/conflict-resolution/tickets`**

Returns paginated list of conflict tickets with optional filters.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `status` | `TicketStatus` | Filter by ticket status |
| `securityLevel` | `SecurityLevel` | Filter by security level |
| `natureOfConflict` | `NatureOfConflict` | Filter by nature |
| `search` | string | Search in ticket ID, employee name, description |
| `from` | date (YYYY-MM-DD) | Request date from |
| `to` | date (YYYY-MM-DD) | Request date to |
| `page` | integer | Page number (default: 1) |
| `pageSize` | integer | Items per page (default: 20) |

**Response `200`:**
```json
{
  "data": [
    {
      "ticketId": "REQ-2024052908",
      "conflictDescription": "Miscommunication about Project Deadline...",
      "employeesInvolved": [
        { "id": "T881356", "name": "Ashraful Islam" }
      ],
      "natureOfConflict": "Policy Related",
      "reportedBy": { "id": "T881356", "name": "Ashraful Islam" },
      "securityLevel": "Low",
      "requestDate": "2026-05-29T22:25:00",
      "ticketStatus": "Pending",
      "lastResolutionDate": null,
      "responseCount": 1
    }
  ],
  "total": 12,
  "page": 1,
  "pageSize": 20
}
```

---

### 2) Get Ticket Detail
**`GET /api/v1/conflict-resolution/tickets/:ticketId`**

Returns full ticket including employee-submitted section and all HR responses.

**Response `200`:**
```json
{
  "ticketId": "REQ-2024052908",
  "conflictDescription": "Miscommunication about Project Deadline...",
  "employeesInvolved": [
    { "id": "T881356", "name": "Ashraful Islam" },
    { "id": "T881357", "name": "Md. Arifur Islam" }
  ],
  "natureOfConflict": "Policy Related",
  "reportedBy": { "id": "T881356", "name": "Ashraful Islam" },
  "securityLevel": "Low",
  "requestDate": "2026-05-29T22:25:00",
  "ticketStatus": "Pending",
  "lastResolutionDate": null,
  "name": "Ashraful Islam",
  "employeeId": "T881356",
  "phoneNumber": "01712345678",
  "department": "Engineering",
  "dateOfIncident": "2026-05-28",
  "timeOfIncident": "14:30",
  "location": "Conference Room B",
  "witness": "Md. Rahim",
  "descriptionOfIncident": "A disagreement arose during the sprint planning meeting...",
  "preferredOutcome": "A clear, written agreement on project deadlines and roles.",
  "responses": [
    {
      "id": "RESP-001",
      "date": "2026-08-11",
      "conflictType": "Policy Violation",
      "securityLevel": "Low",
      "assignPersonnel": ["HR Manager", "Team Lead"],
      "preferredActions": ["Mediation Session", "Policy Review"],
      "preferredDateOfMeeting": "2026-08-15T10:00:00",
      "resolutionStrategy": "Negotiation",
      "remarks": "Initial review complete. Scheduling a mediation session.",
      "respondedBy": "HR Manager",
      "respondedAt": "2026-08-11T09:00:00"
    }
  ]
}
```

**Response `404`:** Ticket not found.

---

### 3) Submit Conflict Ticket (Employee)
**`POST /api/v1/conflict-resolution/tickets`**

Employee raises a new conflict ticket.

**Request Body:**
```json
{
  "conflictDescription": "Miscommunication about Project Deadline...",
  "natureOfConflict": "Policy Related",
  "employeesInvolved": ["T881357", "T881358"],
  "name": "Ashraful Islam",
  "employeeId": "T881356",
  "phoneNumber": "01712345678",
  "department": "Engineering",
  "dateOfIncident": "2026-05-28",
  "timeOfIncident": "14:30",
  "location": "Conference Room B",
  "witness": "Md. Rahim",
  "descriptionOfIncident": "Detailed description of the incident...",
  "preferredOutcome": "A clear, written agreement on project deadlines."
}
```

**Validation Rules:**
- `conflictDescription`, `natureOfConflict`, `employeeId`, `dateOfIncident`, `descriptionOfIncident` — required
- `employeesInvolved` — at least one employee ID required

**Response `201`:** Created `ConflictTicket` object with `ticketStatus: "Pending"`.

**Response `422`:** Validation error.

---

### 4) Update Ticket Details
**`PATCH /api/v1/conflict-resolution/tickets/:ticketId`**

HR updates the ticket's security level, nature, or other fields before responding.

**Request Body:** (any subset of ticket fields)
```json
{
  "securityLevel": "High",
  "natureOfConflict": "Interpersonal"
}
```

**Response `200`:** Updated ticket object.

---

### 5) Submit HR Response
**`POST /api/v1/conflict-resolution/tickets/:ticketId/responses`**

HR adds a response/action record to the ticket.

**Request Body:**
```json
{
  "date": "2026-08-11",
  "conflictType": "Policy Violation",
  "securityLevel": "Low",
  "assignPersonnel": ["HR Manager", "Team Lead"],
  "preferredActions": ["Mediation Session", "Policy Review"],
  "preferredDateOfMeeting": "2026-08-15T10:00:00",
  "resolutionStrategy": "Negotiation",
  "remarks": "Initial review complete. Scheduling a mediation session."
}
```

**Validation Rules:**
- `date`, `conflictType`, `resolutionStrategy`, `remarks` — required
- `assignPersonnel` — at least one required

**Side Effects:**
- Ticket `ticketStatus` transitions from `"Pending"` → `"Ongoing"` on first response.

**Response `201`:** Created response object.

---

### 6) Close Ticket
**`POST /api/v1/conflict-resolution/tickets/:ticketId/close`**

Marks a ticket as resolved and closed.

**Request Body:**
```json
{
  "closingRemarks": "Matter resolved through mediation on 2026-08-20.",
  "lastResolutionDate": "2026-08-20"
}
```

**Response `200`:** Updated ticket with `ticketStatus: "Closed"`.

---

### 7) Reference Data
**`GET /api/v1/conflict-resolution/reference`**

Returns dropdown options.

**Response `200`:**
```json
{
  "natureOfConflict": ["Policy Related", "Tax Related", "Interpersonal", "Workplace Harassment", "Other"],
  "conflictTypes": ["Interpersonal", "Workplace Violence", "Harassment", "Discrimination", "Policy Violation", "Performance", "Other"],
  "securityLevels": ["Low", "Medium", "High"],
  "resolutionStrategies": ["Negotiation", "Mediation", "Arbitration", "Litigation", "Collaborative"],
  "preferredActions": ["Mediation Session", "Policy Review", "Counselling", "Team Reassignment", "Formal Warning", "Investigation"]
}
```

---

## Status Flow

```
Submitted → Pending → Ongoing → Closed
```

| Transition | Trigger |
|------------|---------|
| `Pending` → `Ongoing` | First HR response submitted |
| `Ongoing` → `Closed` | HR explicitly closes the ticket |
