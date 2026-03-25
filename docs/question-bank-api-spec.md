# Question Bank API Specification

> **Feature:** Question Bank (Core HR)
> **Date:** 2026-03-25
> **Status:** Draft (derived from UI types)

---

## Overview

The Question Bank module manages a library of assessment questions used during recruitment pipelines and performance evaluations. Questions are categorized by type, difficulty, topic, role, and department. Performance metrics (usage count, success rate) are tracked per question. Bulk import and export are supported.

---

## Base URL

`/api/v1/question-bank`

---

## Common Types

### QuestionType
`"MCQ" | "MULTISELECT" | "DESCRIPTIVE" | "TRUE_FALSE" | "SHORT_QUESTION" | "LONG_QUESTION" | "FILE_UPLOAD"`

### DifficultyLevel
`"Easy" | "Medium" | "Hard"`

### QuestionStatus
`"active" | "draft" | "archived"`

### Question Object
```json
{
  "id": "Q-001",
  "text": "What is the time complexity of binary search?",
  "type": "MCQ",
  "topic": "Data Structures",
  "targetRole": "Software Engineer",
  "department": "Technology",
  "difficulty": "Medium",
  "status": "active",
  "createdBy": {
    "name": "Wahid Uzzaman",
    "initials": "WU",
    "color": "#4f46e5"
  },
  "createdAt": "2026-01-15T10:30:00",
  "performance": {
    "used": 42,
    "successRate": 78
  }
}
```

---

## Endpoints

---

### 1) List Questions
**`GET /api/v1/question-bank/questions`**

Returns paginated questions with filtering.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `status` | `QuestionStatus` | Filter by status |
| `type` | `QuestionType` | Filter by question type |
| `difficulty` | `DifficultyLevel` | Filter by difficulty |
| `topic` | string | Filter by topic |
| `targetRole` | string | Filter by target role |
| `department` | string | Filter by department |
| `search` | string | Full-text search in question text |
| `fromDate` | date (YYYY-MM-DD) | Created date range start |
| `toDate` | date (YYYY-MM-DD) | Created date range end |
| `sortBy` | `"createdAt" \| "usage" \| "successRate" \| "text"` | Sort field |
| `sortOrder` | `"asc" \| "desc"` | Sort direction |
| `page` | integer | Page number (default: 1) |
| `pageSize` | integer | Items per page (default: 20) |

**Response `200`:**
```json
{
  "data": [Question, ...],
  "total": 245,
  "page": 1,
  "pageSize": 20,
  "statusCounts": {
    "active": 180,
    "draft": 42,
    "archived": 23
  }
}
```

---

### 2) Get Question Detail
**`GET /api/v1/question-bank/questions/:id`**

Returns full question including all answer options (for MCQ/MULTISELECT) or rubric (for DESCRIPTIVE).

**Response `200`:**
```json
{
  "id": "Q-001",
  "text": "What is the time complexity of binary search?",
  "type": "MCQ",
  "topic": "Data Structures",
  "targetRole": "Software Engineer",
  "department": "Technology",
  "difficulty": "Medium",
  "status": "active",
  "options": [
    { "id": "opt-1", "text": "O(n)", "isCorrect": false },
    { "id": "opt-2", "text": "O(log n)", "isCorrect": true },
    { "id": "opt-3", "text": "O(n²)", "isCorrect": false },
    { "id": "opt-4", "text": "O(1)", "isCorrect": false }
  ],
  "rubric": null,
  "explanation": "Binary search halves the search space at each step...",
  "createdBy": {
    "name": "Wahid Uzzaman",
    "initials": "WU",
    "color": "#4f46e5"
  },
  "createdAt": "2026-01-15T10:30:00",
  "updatedAt": "2026-02-01T09:00:00",
  "performance": {
    "used": 42,
    "successRate": 78
  }
}
```

**Response `404`:** Question not found.

---

### 3) Create Question
**`POST /api/v1/question-bank/questions`**

**Request Body — MCQ/MULTISELECT:**
```json
{
  "text": "What is the time complexity of binary search?",
  "type": "MCQ",
  "topic": "Data Structures",
  "targetRole": "Software Engineer",
  "department": "Technology",
  "difficulty": "Medium",
  "options": [
    { "text": "O(n)", "isCorrect": false },
    { "text": "O(log n)", "isCorrect": true },
    { "text": "O(n²)", "isCorrect": false },
    { "text": "O(1)", "isCorrect": false }
  ],
  "explanation": "Binary search halves the search space at each step."
}
```

**Request Body — DESCRIPTIVE/SHORT_QUESTION/LONG_QUESTION:**
```json
{
  "text": "Explain the SOLID principles with examples.",
  "type": "DESCRIPTIVE",
  "topic": "Software Design",
  "targetRole": "Senior Software Engineer",
  "department": "Technology",
  "difficulty": "Hard",
  "rubric": "Award 2 points per principle correctly explained with a real-world example.",
  "explanation": null
}
```

**Request Body — TRUE_FALSE:**
```json
{
  "text": "TCP is a connectionless protocol.",
  "type": "TRUE_FALSE",
  "topic": "Networking",
  "targetRole": "Network Engineer",
  "department": "Technology",
  "difficulty": "Easy",
  "correctAnswer": false,
  "explanation": "TCP is a connection-oriented protocol. UDP is connectionless."
}
```

**Validation Rules:**
- `text`, `type`, `topic`, `targetRole`, `department`, `difficulty` — required
- For `MCQ`: `options` required; must have exactly 1 correct option; minimum 2 options
- For `MULTISELECT`: `options` required; must have at least 1 correct option
- For `TRUE_FALSE`: `correctAnswer` (boolean) required
- Question is created with `status: "draft"` by default

**Response `201`:** Created `Question` object.

**Response `422`:** Validation error.

---

### 4) Update Question
**`PATCH /api/v1/question-bank/questions/:id`**

**Restriction:** Questions with `performance.used > 0` cannot have their `text` or `options` modified. Create a new version instead.

**Request Body:** (any updatable fields)
```json
{
  "difficulty": "Hard",
  "topic": "Advanced Data Structures",
  "status": "active"
}
```

**Response `200`:** Updated `Question` object.

---

### 5) Archive Question
**`POST /api/v1/question-bank/questions/:id/archive`**

**Allowed only when:** `status !== "archived"`

**Response `200`:** Updated question with `status: "archived"`.

---

### 6) Restore Question
**`POST /api/v1/question-bank/questions/:id/restore`**

Restores an archived question to `"draft"`.

**Allowed only when:** `status === "archived"`

**Response `200`:** Updated question with `status: "draft"`.

---

### 7) Publish Question
**`POST /api/v1/question-bank/questions/:id/publish`**

Transitions a draft question to active (available for use in assessments).

**Allowed only when:** `status === "draft"`

**Response `200`:** Updated question with `status: "active"`.

---

### 8) Bulk Import Questions
**`POST /api/v1/question-bank/questions/import`**

Imports questions from a CSV or Excel file.

**Request:** `multipart/form-data`
- `file` — CSV/XLSX file (required)

**Expected CSV columns:**
`text, type, topic, targetRole, department, difficulty, option1, option2, option3, option4, correctOption, explanation`

**Response `200`:**
```json
{
  "imported": 45,
  "failed": 2,
  "errors": [
    { "row": 12, "message": "Missing required field: type" },
    { "row": 28, "message": "MCQ must have at least 2 options" }
  ]
}
```

---

### 9) Export Questions
**`GET /api/v1/question-bank/questions/export`**

Exports questions matching current filters as a CSV or Excel file.

**Query Parameters:** Same as List Questions filters, plus:

| Param | Type | Description |
|-------|------|-------------|
| `format` | `"csv" \| "xlsx"` | Export format (default: `"xlsx"`) |
| `ids` | comma-separated string | Export specific question IDs only |

**Response `200`:** File download.

---

### 10) Reference Data
**`GET /api/v1/question-bank/reference`**

Returns dropdown options for filtering and creating questions.

**Response `200`:**
```json
{
  "topics": ["Data Structures", "Algorithms", "Networking", "Software Design", "..."],
  "roles": ["Software Engineer", "Senior Software Engineer", "Business Analyst", "..."],
  "departments": ["Technology", "Operations", "Finance", "Human Resources", "..."],
  "questionTypes": ["MCQ", "MULTISELECT", "DESCRIPTIVE", "TRUE_FALSE", "SHORT_QUESTION", "LONG_QUESTION", "FILE_UPLOAD"],
  "difficultyLevels": ["Easy", "Medium", "Hard"]
}
```

---

## Status Flow

```
draft → active → archived
archived → draft (restore)
```

| Status | Description |
|--------|-------------|
| `draft` | Created but not yet available for use in assessments |
| `active` | Available for use; included in question pools |
| `archived` | Retired; hidden from default view but preserved for history |

## Performance Metrics

- `performance.used` — number of times this question has been included in an assessment
- `performance.successRate` — percentage of candidates who answered this question correctly (for MCQ/TRUE_FALSE) or received a passing score (for DESCRIPTIVE)
