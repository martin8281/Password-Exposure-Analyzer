# REST API Documentation

Base URL: `/api`

All protected endpoints require:

```http
Authorization: Bearer <jwt>
```

## Health

`GET /health`

Returns service status.

## Authentication

`POST /auth/register`

Body:

```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "LongUniquePassword123!"
}
```

`POST /auth/login`

Body:

```json
{
  "email": "user@example.com",
  "password": "LongUniquePassword123!"
}
```

`POST /auth/logout`

Protected. Adds an audit event.

`POST /auth/password-reset`

Accepts an email and returns a generic response to avoid account enumeration.

## Analysis

`POST /analysis/analyze`

Protected. Runs password strength, personal exposure, optional policy compliance, and recommendation generation.

Body:

```json
{
  "password": "ExampleOnly123!",
  "personalInfo": {
    "firstName": "John",
    "birthYear": "1990",
    "petName": "Milo"
  },
  "policy": {
    "minLength": 12,
    "maxLength": 128,
    "requireUppercase": true,
    "requireLowercase": true,
    "requireNumbers": true,
    "requireSpecial": true,
    "expirationDays": 90
  }
}
```

`POST /analysis/policy-check`

Protected. Checks a password against a supplied policy.

`POST /analysis/generate`

Protected. Generates a secure random password or passphrase. It never uses personal information.

Body:

```json
{
  "mode": "random",
  "length": 16,
  "includeUppercase": true,
  "includeLowercase": true,
  "includeNumbers": true,
  "includeSymbols": true
}
```

## Dashboard

`GET /dashboard`

Protected. Returns recent assessments, aggregate statistics, and trend data for the signed-in user.

## Reports

`GET /reports/csv`

Protected. Downloads assessment history as CSV.

`GET /reports/printable`

Protected. Returns a printable executive summary for the latest assessment.

## Administration

All admin endpoints require role `admin`.

`GET /admin/users`

Lists users.

`PATCH /admin/users/:id`

Updates user role or disabled state.

`GET /admin/analytics`

Returns global risk metrics.

`GET /admin/audit-logs`

Returns recent audit logs.

`GET /admin/policy`

Returns latest password policy.

`PUT /admin/policy`

Creates a new policy version.
