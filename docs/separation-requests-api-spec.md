# Separation Requests API Specification

> **Feature:** Separation Requests
> **Date:** 2026-03-31
> **Status:** Draft workflow contract aligned to current UI

---

## Overview

This module is the HR-facing workflow for managing employee separation requests.

The current UI requires:

- list and filter support for all separation requests
- a detail view with employee information, notice timeline, attachments, activity timeline, workflow stage, and final decision
- approval or rejection from the detail view
- notice period and last working day edits before decision
- a 5-stage workflow model

The workflow stages are:

1. `Submitted`
2. `Under Review`
3. `Clearance`
4. `Settlement`
5. `Completed`

`status` and `workflowStage` are separate values:

- `status` is the operational state used for tabs and decision state
- `workflowStage` is the progress stage shown in the detail view

---

## Base URL

`/api/v1/separation-requests`

---

## Data Model

### SeparationRequest

```json
{
	"id": "SEP-0005",
	"empId": "EMP-1105",
	"empName": "Michael Thompson",
	"department": "Sales",
	"section": "Enterprise Sales",
	"designation": "Account Executive",
	"dateOfJoining": "2022-01-20",
	"resignationSubmissionDate": "31-03-2026; 04:49 PM",
	"dateOfSeparation": "2026-04-04",
	"noticePeriod": 60,
	"employmentStatus": "Probationary",
	"modeOfSeparation": "Resignation",
	"status": "In Progress",
	"workflowStage": "Settlement",
	"lineManager": {
		"name": "Rachel Green",
		"id": "EMP-0188"
	},
	"reason": "Relocation",
	"remarks": "Employee requested early release.",
	"noticePeriodOverride": 45,
	"dateOfSeparationOverride": "2026-04-19",
	"rejectionRemarks": null,
	"attachments": [
		{
			"key": "handover-form",
			"title": "Handover Form",
			"status": "available"
		},
		{
			"key": "final-settlement-form",
			"title": "Final Settlement Form",
			"status": "available"
		}
	],
	"activityTimeline": [
		{
			"action": "Separation request created",
			"date": "31-03-2026 04:49 PM",
			"by": "HR Admin"
		},
		{
			"action": "Notice period / timeline updated",
			"date": "31-03-2026 05:05 PM",
			"by": "HR Admin"
		},
		{
			"action": "Final settlement completed",
			"date": "15-04-2026 10:30 AM",
			"by": "Payroll Team"
		}
	],
	"finalDecision": {
		"outcome": "End Separation Process",
		"date": "15-04-2026 02:00 PM",
		"by": "HR Admin",
		"notes": "All checkpoints completed and separation is closed."
	}
}
```

### Allowed Enums

#### status

`Pending | In Progress | Completed | On Hold | Cancelled | Rejected`

#### workflowStage

`Submitted | Under Review | Clearance | Settlement | Completed`

#### modeOfSeparation

`Resignation | Mutual Agreement | End of Contract | Termination | Retirement | Retrenchment`

---

### ActionRequiredItem

Action-required items are created when Performance Management approves a separation decision for an employee. This provides a quick entry point for HR to create a separation request.

```json
{
	"id": "ACT-REQ-001",
	"empId": "EMP-0033",
	"empName": "Kamal Hossain",
	"empCode": "EMP-033",
	"designation": "Senior HR Officer",
	"department": "Human Resources",
	"dateOfJoining": "2022-06-15",
	"employmentStatus": "Permanent",
	"actionType": "Separation Decision Approved",
	"source": "Performance Appraisal",
	"appraisalPeriodLabel": "Yearly Appraisal · FY 2025",
	"decisionDetails": {
		"decision": "Separation",
		"effectiveDate": "2026-04-01",
		"remarks": "Approved for separation based on performance appraisal decision"
	},
	"status": "Pending",
	"createdAt": "2026-03-31",
	"createdBy": "System",
	"actionUrl": "/api/v1/separation-requests/actions/:id/create-request"
}
```

#### status (ActionRequiredItem)

`Pending | Processed | Cancelled`

---

## Endpoints

### 1) List Requests

**`GET /api/v1/separation-requests`**

#### Query Parameters

| Name | Type | Description |
|---|---|---|
| `q` | string | Search by employee name or employee ID |
| `department` | string | Filter by department |
| `employmentStatus` | string | Filter by employment status |
| `mode` | string | Filter by mode of separation |
| `status` | string | Filter by operational status |
| `workflowStage` | string | Filter by workflow stage |
| `page` | number | Page number |
| `pageSize` | number | Page size |

#### Response

```json
{
	"items": [],
	"total": 0,
	"page": 1,
	"pageSize": 20
}
```

### 2) Get Request Detail

**`GET /api/v1/separation-requests/:id`**

Returns the full request payload used by the detail popup, including:

- notice timeline values and overrides
- workflow stage
- attachments
- rejection remarks
- activity timeline
- final decision

### 3) Create Request

**`POST /api/v1/separation-requests`**

#### Request Body

```json
{
	"empId": "EMP-0322",
	"modeOfSeparation": "Retirement",
	"reason": "Retirement",
	"noticePeriod": 90,
	"dateOfSeparation": "2026-06-30",
	"remarks": "Employee submitted retirement paperwork."
}
```

#### Notes

- new requests should start with `status=Pending`
- new requests should start with `workflowStage=Submitted`

### 4) Update Notice and Timeline

**`PATCH /api/v1/separation-requests/:id/notice-timeline`**

Used by HR from the detail view before approval or rejection.

#### Request Body

```json
{
	"noticePeriod": 45,
	"lastWorkingDay": "2026-04-19"
}
```

#### Response Behavior

- updates `noticePeriodOverride` and `dateOfSeparationOverride` when values differ from the original request
- appends an activity timeline entry such as `Notice period / timeline updated`

### 5) Approve or Reject Request

**`POST /api/v1/separation-requests/:id/decision`**

#### Request Body

```json
{
	"decision": "approve",
	"noticePeriod": 45,
	"lastWorkingDay": "2026-04-19",
	"rejectionRemarks": null
}
```

#### Reject Example

```json
{
	"decision": "reject",
	"noticePeriod": 60,
	"lastWorkingDay": "2026-04-30",
	"rejectionRemarks": "Please attach the signed resignation letter before resubmitting."
}
```

#### Rules

- `rejectionRemarks` is required when `decision=reject`
- on approval, set `status=In Progress` and `workflowStage=Under Review`
- on rejection, set `status=Rejected`
- on approval, attachment entries for `Handover Form` and `Final Settlement Form` should be returned in detail responses
- append the relevant activity timeline entries for approval or rejection

### 6) Advance Workflow Stage

**`PATCH /api/v1/separation-requests/:id/workflow-stage`**

Used when the request moves through `Under Review`, `Clearance`, `Settlement`, and `Completed`.

#### Request Body

```json
{
	"workflowStage": "Settlement",
	"status": "In Progress",
	"notes": "Clearance completed and settlement processing started."
}
```

#### Rules

- `workflowStage=Completed` may set `status=Completed`
- stage transitions should append an activity timeline entry

### 7) Record Final Decision

**`POST /api/v1/separation-requests/:id/final-decision`**

Used after settlement is complete to decide whether the separation process should be formally ended.

#### Request Body

```json
{
	"outcome": "End Separation Process",
	"notes": "All clearance and settlement checkpoints are complete."
}
```

#### Response Behavior

- stores `finalDecision`
- appends an activity timeline entry such as `Final decision recorded`
- this section should appear in detail responses once the workflow reaches `Settlement` or `Completed`

### 8) List Action-Required Items

**`GET /api/v1/separation-requests/actions/required`**

Returns a list of pending action-required items triggered by Performance Management appraisal decisions. These represent separation decisions approved by HR that need to be processed as separation requests.

#### Query Parameters

| Name | Type | Description |
|---|---|---|
| `q` | string | Search by employee name or employee ID |
| `status` | string | Filter by action status (`Pending`, `Processed`, `Cancelled`) |
| `page` | number | Page number |
| `pageSize` | number | Page size |

#### Response

```json
{
	"items": [],
	"total": 0,
	"page": 1,
	"pageSize": 20
}
```

### 9) Create Separation Request from Action

**`POST /api/v1/separation-requests/actions/:actionId/create-request`**

Creates a new separation request directly from an action-required item triggered by a performance appraisal decision.

#### Request Body

```json
{
	"modeOfSeparation": "Termination",
	"reason": "Performance Termination",
	"noticePeriod": 0,
	"dateOfSeparation": "2026-04-01",
	"remarks": "Separation initiated from approved performance appraisal decision"
}
```

#### Response Behavior

- creates a new `SeparationRequest` with `status=Pending` and `workflowStage=Submitted`
- updates the corresponding `ActionRequiredItem` status to `Processed`
- appends activity: "Separation request created from performance appraisal action"
- returns the created `SeparationRequest` object

---

## UI Mapping Notes

- HR detail popup reads from the detail endpoint and can update notice timeline before decision
- rejection remarks must flow through to the employee-facing My Resignation experience
- final decision appears only after settlement stage is reached
- action-required items appear as a dedicated section at the top of Separation Requests page
- users click "Take Action" on an action-required item to open the new separation modal pre-filled with employee details
- once processed, action items are marked as "Processed" and moved to a history section
