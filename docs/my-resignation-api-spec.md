# My Resignation API Specification

> **Feature:** My Resignation
> **Date:** 2026-03-31
> **Status:** Draft workflow contract aligned to current UI

---

## Overview

This module is the employee self-service flow for submitting and tracking resignation requests.

The current UI requires:

- submit a resignation request
- view the latest request in read-only mode
- show the same 5-stage separation progress used in Separation Requests
- display rejection remarks from HR when a request is rejected
- allow the employee to apply for a new resignation after rejection
- show previous requests as history

---

## Base URL

`/api/v1/my-resignation`

---

## Rules

- only one active resignation request may exist for the employee at a time
- a new request may be submitted after the latest request is rejected
- rejection remarks from HR must be visible in the employee detail view and history
- progress stages are:

1. `Submitted`
2. `Under Review`
3. `Clearance`
4. `Settlement`
5. `Completed`

---

## Endpoints

### 1) Submit Resignation

**`POST /api/v1/my-resignation`**

#### Request Body

```json
{
  "reason": "Relocation",
  "lastWorkingDay": "2026-04-30",
  "details": "Relocating with family to another city."
}
```

#### Response

Returns the created resignation request.

#### Behavior

- creates a resignation request under the shared separation workflow
- sets `status=Pending`
- sets `workflowStage=Submitted`
- appends an initial activity timeline entry such as `Resignation submitted`

### 2) Get Latest Request

**`GET /api/v1/my-resignation/current`**

Returns the latest resignation request for the current employee.

#### Response Notes

- includes the full detail payload used by the employee detail popup
- includes `rejectionRemarks`, `workflowStage`, `attachments`, `activityTimeline`, and `finalDecision`

### 3) Get History

**`GET /api/v1/my-resignation/history`**

Returns previous resignation requests for the current employee.

#### Response

```json
{
  "items": [
    {
      "id": "SEP-0007",
      "submittedOn": "Mar 31, 2026",
      "reason": "Relocation",
      "status": "Rejected",
      "rejectionRemarks": "Please attach the signed resignation letter before resubmitting."
    }
  ]
}
```

### 4) Get Detail

**`GET /api/v1/my-resignation/:id`**

Returns the selected resignation detail in read-only format.

#### Required Fields

- `status`
- `workflowStage`
- `reason`
- `remarks`
- `rejectionRemarks`
- `noticePeriod`
- `dateOfSeparation`
- `noticePeriodOverride`
- `dateOfSeparationOverride`
- `attachments`
- `activityTimeline`
- `finalDecision`

### 5) Check Eligibility To Reapply

**`GET /api/v1/my-resignation/reapply-status`**

#### Response

```json
{
  "canApply": true,
  "blockedByRequestId": null,
  "message": "You can submit a new resignation request."
}
```

#### Rules

- `canApply=false` while the latest request is not rejected or closed
- `canApply=true` when the latest request is rejected

---

## Shared Detail Payload Example

```json
{
  "id": "SEP-0008",
  "empId": "EMP-042",
  "empName": "John Doe",
  "department": "Engineering",
  "designation": "Senior Developer",
  "dateOfJoining": "2022-06-15",
  "resignationSubmissionDate": "31-03-2026; 04:49 PM",
  "dateOfSeparation": "2026-04-30",
  "noticePeriod": 60,
  "status": "Rejected",
  "workflowStage": "Submitted",
  "reason": "Relocation",
  "remarks": "Relocating with family to another city.",
  "rejectionRemarks": "Please attach the signed resignation letter before resubmitting.",
  "attachments": [],
  "activityTimeline": [
    {
      "action": "Resignation submitted",
      "date": "31-03-2026 04:49 PM",
      "by": "John Doe"
    },
    {
      "action": "Request rejected",
      "date": "31-03-2026 05:20 PM",
      "by": "HR Admin"
    }
  ],
  "finalDecision": null
}
```

---

## UI Mapping Notes

- the employee detail view is read-only
- the history list should surface rejected requests and their remarks
- if settlement is completed, the detail view should show the final decision section once available