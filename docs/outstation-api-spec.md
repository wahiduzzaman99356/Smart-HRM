# Outstation API Specification

> **Feature:** Outstation (ESS — Attendance)
> **Date:** 2026-03-25
> **Status:** Draft (derived from UI types)

---

## Overview

The Outstation module allows HR/Admin to configure outstation setups for employees (Work From Home or field visits) with geofenced locations and date rules. Employees check in/out against these setups; the system records attendance against the allowed geofence.

---

## Base URL

`/api/v1/outstation`

---

## Common Types

### OutstationPurpose
`"Work From Home" | "Others Concern Visit"`

### DateSelectionMode
`"specific" | "date-range"`

### AttendanceStatus
`"Present" | "Late" | "Early Leave" | "Absent"`

### Location Object
```json
{
  "id": "LOC-1",
  "query": "Dhaka Cantonment, Dhaka, Bangladesh",
  "lat": 23.8103,
  "lng": 90.4125,
  "radiusUnit": "Kilometer | Meter",
  "radiusValue": 1.0
}
```

### AuditLog Object
```json
{
  "id": "AL-1001-1",
  "action": "Created | Updated | Activated | Deactivated",
  "actor": "Admin User",
  "at": "2026-02-20T15:09:00",
  "note": "Initial outstation setup created with 2 locations."
}
```

### AttendanceRecord Object
```json
{
  "date": "2026-03-20",
  "status": "Present | Late | Early Leave | Absent",
  "checkInTime": "09:05 AM",
  "checkOutTime": "06:04 PM",
  "checkInLat": 23.8103,
  "checkInLng": 90.4125,
  "checkOutLat": 23.8104,
  "checkOutLng": 90.4126,
  "remarks": "Worked from approved home location.",
  "proofFileName": "attendance_2026_03_20.jpg"
}
```

---

## Endpoints

---

### 1) List Outstation Setups
**`GET /api/v1/outstation/setups`**

Returns all outstation setups with optional filters.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `status` | `"Active" \| "Inactive"` | Filter by setup status |
| `purpose` | `OutstationPurpose` | Filter by purpose |
| `employeeId` | string | Filter by employee |
| `page` | integer | Page number (default: 1) |
| `pageSize` | integer | Items per page (default: 20) |

**Response `200`:**
```json
{
  "data": [
    {
      "id": "OS-1001",
      "employeeId": "TN-99318",
      "employeeName": "Shanto Karmoker",
      "purpose": "Work From Home",
      "status": "Active",
      "shiftId": "general",
      "shiftLabel": "General (09:00 AM - 06:00 PM)",
      "dateMode": "specific",
      "specificDates": ["2026-03-20", "2026-03-22"],
      "dateRange": null,
      "locations": [...],
      "createdBy": "Admin User",
      "createdAt": "2026-02-20T15:09:00",
      "updatedBy": "Admin User",
      "updatedAt": "2026-02-20T15:09:00"
    }
  ],
  "total": 25,
  "page": 1,
  "pageSize": 20
}
```

---

### 2) Get Outstation Setup Detail
**`GET /api/v1/outstation/setups/:id`**

Returns a single setup including full audit log.

**Response `200`:**
```json
{
  "id": "OS-1001",
  "employeeId": "TN-99318",
  "employeeName": "Shanto Karmoker",
  "purpose": "Work From Home",
  "status": "Active",
  "shiftId": "general",
  "shiftLabel": "General (09:00 AM - 06:00 PM)",
  "dateMode": "specific",
  "specificDates": ["2026-03-20", "2026-03-22"],
  "dateRange": null,
  "locations": [
    {
      "id": "LOC-1",
      "query": "Dhaka Cantonment, Dhaka, Bangladesh",
      "lat": 23.8103,
      "lng": 90.4125,
      "radiusUnit": "Kilometer",
      "radiusValue": 1.0
    }
  ],
  "createdBy": "Admin User",
  "createdAt": "2026-02-20T15:09:00",
  "updatedBy": "Admin User",
  "updatedAt": "2026-02-20T15:09:00",
  "auditLogs": [
    {
      "id": "AL-1001-1",
      "action": "Created",
      "actor": "Admin User",
      "at": "2026-02-20T15:09:00",
      "note": "Initial outstation setup created with 2 locations."
    }
  ]
}
```

**Response `404`:** Setup not found.

---

### 3) Create Outstation Setup
**`POST /api/v1/outstation/setups`**

**Request Body:**
```json
{
  "employeeId": "TN-99318",
  "purpose": "Work From Home",
  "shiftId": "general",
  "dateMode": "specific",
  "specificDates": ["2026-03-20", "2026-03-22"],
  "dateRange": null,
  "locations": [
    {
      "query": "Dhaka Cantonment, Dhaka, Bangladesh",
      "lat": 23.8103,
      "lng": 90.4125,
      "radiusUnit": "Kilometer",
      "radiusValue": 1.0
    }
  ]
}
```

**Validation Rules:**
- `employeeId` — required, must be a valid active employee
- `purpose` — required
- `shiftId` — required
- `dateMode` — required; if `"specific"`, `specificDates` must be non-empty; if `"date-range"`, `dateRange` must be `[startDate, endDate]`
- `locations` — required, at least one location

**Response `201`:** Created `OutstationSetup` object (same shape as GET detail).

**Response `422`:** Validation error.

---

### 4) Update Outstation Setup
**`PATCH /api/v1/outstation/setups/:id`**

Partial update. Any subset of fields from the create body can be sent. Audit log entry is appended automatically.

**Request Body:** (same structure as create, all fields optional)

**Response `200`:** Updated `OutstationSetup` object.

**Response `404`:** Setup not found.

---

### 5) Toggle Setup Status
**`POST /api/v1/outstation/setups/:id/toggle`**

Activates or deactivates an outstation setup.

**Request Body:**
```json
{
  "status": "Active | Inactive",
  "note": "Deactivated after end of approved period."
}
```

**Response `200`:** Updated `OutstationSetup` object.

---

### 6) List Attendance Records for a Setup
**`GET /api/v1/outstation/setups/:id/attendance`**

Returns the attendance records tracked against this outstation setup.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `from` | date (YYYY-MM-DD) | Start date filter |
| `to` | date (YYYY-MM-DD) | End date filter |
| `status` | `AttendanceStatus` | Filter by attendance status |

**Response `200`:**
```json
{
  "setupId": "OS-1001",
  "records": [
    {
      "date": "2026-03-20",
      "status": "Present",
      "checkInTime": "09:03 AM",
      "checkOutTime": "06:04 PM",
      "checkInLat": 23.8103,
      "checkInLng": 90.4125,
      "checkOutLat": 23.8104,
      "checkOutLng": 90.4126,
      "remarks": "Worked from approved home location.",
      "proofFileName": "attendance_2026_03_20.jpg"
    }
  ]
}
```

---

### 7) Reference Data
**`GET /api/v1/outstation/reference`**

Returns shift options and employee lookup data.

**Response `200`:**
```json
{
  "shifts": [
    { "id": "general", "name": "General", "start": "09:00 AM", "end": "06:00 PM" },
    { "id": "morning", "name": "Morning", "start": "07:00 AM", "end": "03:00 PM" },
    { "id": "evening", "name": "Evening", "start": "03:00 PM", "end": "11:00 PM" }
  ],
  "purposes": ["Work From Home", "Others Concern Visit"]
}
```

---

## Status Flow

```
Created → Active ⇌ Inactive
```

Setups can be toggled between Active and Inactive at any time by HR/Admin. Attendance is only recorded against Active setups.
