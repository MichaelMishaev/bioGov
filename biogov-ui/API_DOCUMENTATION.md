# bioGov Compliance Calendar API Documentation

**Version:** 1.0.0
**Last Updated:** 2025-11-01
**Base URL:** `http://localhost:3000/api` (development)

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
   - [Business Profiles](#business-profiles)
   - [Task Templates](#task-templates)
   - [Tasks](#tasks)
   - [Task Generation](#task-generation)
   - [Compliance Score](#compliance-score)
4. [Testing](#testing)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)

---

## Overview

The bioGov Compliance Calendar API provides endpoints for managing Israeli business compliance tasks, deadlines, and notifications. The API follows RESTful conventions and returns JSON responses.

### Key Features

- **Business Profile Management**: Store and update user business information for personalized compliance
- **Task Templates**: Pre-configured compliance task blueprints (VAT, income tax, social security, etc.)
- **Task Management**: Create, read, update, and delete compliance tasks
- **Automatic Task Generation**: Generate recurring tasks from templates based on business profile
- **Compliance Scoring**: Calculate on-time completion rates and compliance grades

### Technology Stack

- **Framework**: Next.js 14 App Router
- **Database**: PostgreSQL (Neon) with Row-Level Security (RLS)
- **Authentication**: JWT-based with httpOnly cookies
- **Language**: TypeScript

---

## Authentication

All protected endpoints require authentication via JWT access token passed in cookies.

### Authentication Flow

1. User logs in via `/api/auth/login`
2. Server returns `access_token` cookie (httpOnly, 15 min expiry)
3. Client includes cookie in subsequent requests
4. Server verifies token and enforces Row-Level Security

### Example Request with Authentication

```bash
curl -X GET http://localhost:3000/api/tasks \
  -H "Cookie: access_token=<your_token>"
```

### Protected Endpoints

- `/api/business-profiles` (GET, POST, PATCH)
- `/api/tasks` (GET, POST, PATCH, DELETE)
- `/api/tasks/generate` (POST)
- `/api/compliance/score` (GET)

### Public Endpoints

- `/api/task-templates` (GET) - Optional auth for personalization

---

## API Endpoints

## Business Profiles

### `GET /api/business-profiles`

Retrieve the authenticated user's business profile.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "business_type": "company",
    "vat_status": "registered",
    "industry": "technology",
    "employee_count": 25,
    "fiscal_year_start": "2025-01-01",
    "business_established_date": "2020-06-15",
    "municipality": "Tel Aviv",
    "metadata": {
      "company_number": "123456789"
    },
    "created_at": "2025-10-01T10:00:00Z",
    "updated_at": "2025-10-15T14:30:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - No profile exists for user

---

### `POST /api/business-profiles`

Create a new business profile.

**Authentication:** Required

**Request Body:**
```json
{
  "business_type": "company",
  "vat_status": "registered",
  "industry": "technology",
  "employee_count": 25,
  "fiscal_year_start": "2025-01-01",
  "business_established_date": "2020-06-15",
  "municipality": "Tel Aviv",
  "metadata": {
    "company_number": "123456789"
  }
}
```

**Required Fields:**
- `business_type` - one of: `sole_proprietor`, `partnership`, `company`, `nonprofit`, `cooperative`
- `vat_status` - one of: `exempt`, `registered`, `pending`

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Business profile created successfully",
  "data": { /* profile object */ }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid or missing fields
- `401 Unauthorized` - Not authenticated
- `409 Conflict` - Profile already exists

---

### `PATCH /api/business-profiles`

Update an existing business profile.

**Authentication:** Required

**Request Body:**
```json
{
  "vat_status": "registered",
  "employee_count": 30,
  "municipality": "Jerusalem"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Business profile updated successfully",
  "data": { /* updated profile object */ }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid fields
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Profile does not exist

---

## Task Templates

### `GET /api/task-templates`

Retrieve active task templates.

**Authentication:** Optional (required for personalized filtering)

**Query Parameters:**
- `category` (optional) - Filter by category: `vat`, `income_tax`, `social_security`, `license`, etc.
- `personalized` (optional) - Set to `true` to filter by user's business profile

**Example Requests:**

```bash
# Get all templates
GET /api/task-templates

# Filter by category
GET /api/task-templates?category=vat

# Get personalized templates (requires auth)
GET /api/task-templates?personalized=true
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "abc123...",
        "template_code": "VAT_MONTHLY",
        "title_he": "דוח מע\"מ חודשי",
        "description_he": "הגשת דוח מע\"מ לרשות המסים עד ה-15 בחודש",
        "category": "vat",
        "default_priority": "high",
        "recurrence_rule": "FREQ=MONTHLY;BYMONTHDAY=15",
        "lead_time_days": 10,
        "reminder_days": [7, 3, 1],
        "applies_to_vat_status": ["registered"],
        "applies_to_business_types": ["sole_proprietor", "company"],
        "applies_to_industries": null,
        "is_active": true,
        "metadata": {},
        "created_at": "2025-01-01T00:00:00Z",
        "updated_at": "2025-01-01T00:00:00Z"
      }
    ],
    "grouped": {
      "vat": [ /* VAT templates */ ],
      "income_tax": [ /* Tax templates */ ]
    },
    "count": 18,
    "personalized": false
  }
}
```

---

## Tasks

### `GET /api/tasks`

Retrieve user's tasks with filtering and pagination.

**Authentication:** Required

**Query Parameters:**
- `filter` (optional) - `upcoming`, `overdue`, `completed`, `all` (default: `all`)
- `category` (optional) - Filter by category
- `priority` (optional) - Filter by priority: `low`, `medium`, `high`, `urgent`
- `from_date` (optional) - Start date (YYYY-MM-DD)
- `to_date` (optional) - End date (YYYY-MM-DD)
- `limit` (optional) - Results per page (default: 100, max: 500)
- `offset` (optional) - Pagination offset (default: 0)

**Example Requests:**

```bash
# Get all tasks
GET /api/tasks

# Get upcoming tasks
GET /api/tasks?filter=upcoming

# Get overdue VAT tasks
GET /api/tasks?filter=overdue&category=vat

# Get tasks for next month
GET /api/tasks?from_date=2025-11-01&to_date=2025-11-30

# Pagination
GET /api/tasks?limit=20&offset=0
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "task-id",
        "user_id": "user-id",
        "template_id": "template-id",
        "title": "דוח מע\"מ חודשי",
        "description": "הגשת דוח מע\"מ לחודש אוקטובר",
        "due_date": "2025-11-15",
        "category": "vat",
        "priority": "high",
        "completed_at": null,
        "recurring_pattern": "FREQ=MONTHLY;BYMONTHDAY=15",
        "parent_task_id": null,
        "metadata": {},
        "created_at": "2025-10-01T00:00:00Z",
        "updated_at": "2025-10-01T00:00:00Z",
        "days_until_due": 14,
        "urgency_status": "this_month"
      }
    ],
    "pagination": {
      "total": 45,
      "limit": 100,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

**Urgency Status Values:**
- `overdue` - Past due date
- `today` - Due today
- `this_week` - Due within 7 days
- `this_month` - Due within 30 days
- `future` - Due later

---

### `POST /api/tasks`

Create a custom task.

**Authentication:** Required

**Request Body:**
```json
{
  "title": "רישוי עסק - חידוש",
  "description": "חידוש רישיון עסק בעירייה",
  "due_date": "2025-12-31",
  "category": "license",
  "priority": "urgent",
  "recurring_pattern": "FREQ=YEARLY;BYMONTH=12;BYMONTHDAY=31",
  "metadata": {
    "reference_number": "12345",
    "notes": "Important renewal"
  }
}
```

**Required Fields:**
- `title` - Task title
- `due_date` - Due date (YYYY-MM-DD)
- `category` - Task category

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": { /* task object */ }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid or missing fields
- `401 Unauthorized` - Not authenticated

---

### `PATCH /api/tasks?id={task_id}`

Update a task.

**Authentication:** Required

**Query Parameters:**
- `id` (required) - Task UUID

**Request Body:**
```json
{
  "title": "Updated title",
  "description": "New description",
  "due_date": "2025-12-15",
  "priority": "high",
  "completed_at": "2025-11-01T15:30:00Z"
}
```

**Example: Mark task as completed**
```json
{
  "completed_at": "2025-11-01T15:30:00Z"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": { /* updated task object */ }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid task ID or fields
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Task not found or no permission

---

### `DELETE /api/tasks?id={task_id}`

Delete a task.

**Authentication:** Required

**Query Parameters:**
- `id` (required) - Task UUID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Task \"דוח מע\"מ חודשי\" deleted successfully",
  "data": {
    "id": "task-id",
    "title": "דוח מע\"מ חודשי"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid task ID
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Task not found or no permission

---

## Task Generation

### `POST /api/tasks/generate`

Generate tasks from templates based on user's business profile.

**Authentication:** Required

**Request Body:**
```json
{
  "template_id": "abc123...",
  "start_date": "2025-11-01",
  "end_date": "2026-10-31"
}
```

**Optional Fields:**
- `template_id` - Generate from specific template only (omit to use all applicable templates)
- `start_date` - Start date (default: today)
- `end_date` - End date (default: 1 year from start)

**Example: Generate all tasks for next year**
```json
{
  "start_date": "2025-11-01",
  "end_date": "2026-10-31"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Successfully generated 36 task(s)",
  "data": {
    "count": 36,
    "tasks": [
      {
        "id": "task-1",
        "title": "דוח מע\"מ חודשי",
        "due_date": "2025-11-15",
        "category": "vat",
        "priority": "high",
        "template_id": "template-id",
        "created_at": "2025-11-01T00:00:00Z"
      }
    ],
    "date_range": {
      "start_date": "2025-11-01",
      "end_date": "2026-10-31"
    }
  }
}
```

**Business Logic:**
- Tasks are generated based on template recurrence rules (iCalendar RRULE format)
- Only templates matching user's business profile are used:
  - `vat_status` (exempt/registered)
  - `business_type` (sole_proprietor/company/etc.)
  - `industry` (if specified in template)
- Duplicate tasks for the same date are prevented
- Notifications are automatically created for each generated task

**Error Responses:**
- `400 Bad Request` - Invalid dates, missing business profile
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Template not found

---

## Compliance Score

### `GET /api/compliance/score`

Calculate user's compliance score and statistics.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "score": {
      "score": 92.5,
      "grade": "A-",
      "description": "Great compliance. Very few issues."
    },
    "statistics": {
      "total_tasks": 48,
      "completed_tasks": 42,
      "pending_tasks": 6,
      "overdue_tasks": 2,
      "completed_on_time": 38,
      "completed_late": 4,
      "completion_rate": 87.5,
      "on_time_rate": 90.48
    },
    "category_breakdown": [
      {
        "category": "vat",
        "total": 12,
        "completed": 10,
        "overdue": 1,
        "completion_rate": 83.33
      },
      {
        "category": "income_tax",
        "total": 8,
        "completed": 8,
        "overdue": 0,
        "completion_rate": 100.0
      }
    ],
    "recent_activity": {
      "recent_completions": 5,
      "upcoming_this_week": 3,
      "upcoming_this_month": 8
    },
    "streak": {
      "current": 1,
      "longest": 45
    }
  }
}
```

**Grading Scale:**
- **A+ (97-100)**: Excellent! Perfect compliance record
- **A (93-96)**: Excellent compliance
- **A- (90-92)**: Great compliance with minor delays
- **B+ (87-89)**: Good compliance with minor delays
- **B (83-86)**: Good compliance
- **B- (80-82)**: Satisfactory compliance
- **C+ (77-79)**: Fair compliance
- **C (73-76)**: Fair compliance, improvement needed
- **C- (70-72)**: Below average
- **D (60-69)**: Poor compliance
- **F (<60)**: Critical issues

**Score Calculation:**
- Based on tasks from last 12 months only
- Weighs on-time completion rate (completed by due date)
- Perfect score (100) for no late completions
- Penalties for late completions proportional to delay

---

## Testing

### Test Suite

The API includes comprehensive Jest tests covering:

1. **Business Profiles API** (`__tests__/api/business-profiles.test.ts`)
   - 15 tests covering GET, POST, PATCH
   - Authentication, validation, RLS enforcement

2. **Task Templates API** (`__tests__/api/task-templates.test.ts`)
   - 8 tests covering GET endpoint
   - Filtering, personalization, sorting

3. **Tasks API** (`__tests__/api/tasks.test.ts`)
   - 35 tests covering GET, POST, PATCH, DELETE
   - Filtering, pagination, RLS, cascading deletes

4. **Task Generation API** (`__tests__/api/tasks-generate.test.ts`)
   - 12 tests covering POST endpoint
   - Template matching, recurrence, date ranges

5. **Compliance Score API** (`__tests__/api/compliance-score.test.ts`)
   - 15 tests covering GET endpoint
   - Score calculation, grading, statistics

**Total: 85+ comprehensive tests**

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- business-profiles.test.ts

# Run with coverage
npm test:coverage

# Run in watch mode
npm test:watch
```

### Test Environment Setup

1. Create `.env.test` with test database credentials
2. Ensure `NODE_ENV=test`
3. Tests automatically clean up data after each run
4. **IMPORTANT**: Never run tests against production database

### Example Test

```typescript
it('should create business profile with required fields only', async () => {
  const { userId, cookie } = await createAuthenticatedTestUser();

  const request = createMockRequest('POST', 'http://localhost:3000/api/business-profiles', {
    cookies: { access_token: cookie.split('=')[1] },
    body: {
      business_type: 'sole_proprietor',
      vat_status: 'exempt',
    },
  });

  const response = await POST(request as NextRequest);

  assertSuccessResponse(response);
  expect(response.status).toBe(201);

  const body = await getResponseBody(response);
  expect(body.success).toBe(true);
  expect(body.data).toMatchObject({
    user_id: userId,
    business_type: 'sole_proprietor',
    vat_status: 'exempt',
  });
});
```

---

## Error Handling

All API errors follow a consistent format:

```json
{
  "error": "Bad Request",
  "message": "Missing required fields: business_type, vat_status",
  "statusCode": 400
}
```

### Common HTTP Status Codes

- **200 OK**: Request succeeded
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request parameters or body
- **401 Unauthorized**: Authentication required or invalid token
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource already exists
- **500 Internal Server Error**: Unexpected server error

### Error Response Fields

- `error` - Error type (e.g., "Bad Request", "Unauthorized")
- `message` - Human-readable error description
- `statusCode` - HTTP status code

---

## Rate Limiting

### Current Implementation

- Simple in-memory rate limiting
- Default: 100 requests per minute per user
- Resets every 60 seconds

### Rate Limit Headers

Responses include rate limit information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1698765432
```

### Rate Limit Exceeded

**Response (429 Too Many Requests):**
```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again in 45 seconds.",
  "statusCode": 429
}
```

### Production Recommendations

- Migrate to Redis-based rate limiting for distributed systems
- Implement per-endpoint rate limits
- Add IP-based rate limiting for public endpoints

---

## Appendix: Curl Examples

### Create Business Profile
```bash
curl -X POST http://localhost:3000/api/business-profiles \
  -H "Cookie: access_token=<token>" \
  -H "Content-Type: application/json" \
  -d '{
    "business_type": "company",
    "vat_status": "registered",
    "industry": "technology",
    "employee_count": 25
  }'
```

### Get Upcoming Tasks
```bash
curl -X GET "http://localhost:3000/api/tasks?filter=upcoming&limit=10" \
  -H "Cookie: access_token=<token>"
```

### Mark Task as Completed
```bash
curl -X PATCH "http://localhost:3000/api/tasks?id=task-uuid" \
  -H "Cookie: access_token=<token>" \
  -H "Content-Type: application/json" \
  -d '{
    "completed_at": "2025-11-01T15:30:00Z"
  }'
```

### Generate Tasks for Next Year
```bash
curl -X POST http://localhost:3000/api/tasks/generate \
  -H "Cookie: access_token=<token>" \
  -H "Content-Type: application/json" \
  -d '{
    "start_date": "2025-11-01",
    "end_date": "2026-10-31"
  }'
```

### Get Compliance Score
```bash
curl -X GET http://localhost:3000/api/compliance/score \
  -H "Cookie: access_token=<token>"
```

---

## Security Considerations

### Row-Level Security (RLS)

All database queries enforce RLS policies:
- Users can only access their own data
- Enforced at PostgreSQL level via `auth.current_user_id()`
- Session variable set via `set_config('app.user_id', userId)`

### Authentication Security

- JWT tokens stored in httpOnly cookies (XSS protection)
- Access tokens expire after 15 minutes
- Refresh tokens expire after 7 days
- Tokens hashed (SHA-256) before database storage

### Input Validation

- All input validated before database queries
- UUID format validation
- Date format validation (YYYY-MM-DD)
- Enum value validation
- SQL injection prevention via parameterized queries

### Audit Logging

- Authentication events logged to `auth_audit_log`
- Failed login attempts tracked
- Account lockout after 5 failed attempts

---

## Changelog

### Version 1.0.0 (2025-11-01)

Initial release with:
- Business Profile Management
- Task Templates
- Task CRUD Operations
- Task Generation from Templates
- Compliance Score Calculation
- Comprehensive Test Suite (85+ tests)

---

## Support

For issues, questions, or contributions, please contact the development team or open an issue in the project repository.

**Documentation Generated:** 2025-11-01
**API Version:** 1.0.0
