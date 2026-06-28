# Password Exposure Analyzer

A defensive cybersecurity awareness platform for password strength, exposure risk, policy compliance, secure password generation, reports, dashboards, and administration.

This project never generates brute-force wordlists, attack dictionaries, credential-stuffing lists, or passwords derived from personal information.

## Stack

- Frontend: React, TypeScript, Tailwind CSS, React Router, Axios, Recharts
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL
- Auth: JWT, RBAC
- Infrastructure: Docker, Docker Compose

## Quick Start

```bash
cp .env.example .env
docker compose up --build
```

Services:

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000/api
- PostgreSQL: localhost:5432

Default seeded administrator:

- Email: `admin@example.com`
- Password: `AdminChangeMe123!`

Change this password immediately after first login.

## Local Development

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Run migrations:

```bash
cd backend
npm run migrate
npm run seed
```

## Major Features

- Password strength analysis with entropy estimate, pattern detection, dictionary checks, and actionable recommendations.
- Personal information exposure analysis with exact, partial, and common-substitution matching.
- Customizable password policy compliance checks.
- Secure random password and passphrase generation.
- Personalized security recommendations.
- User dashboard with statistics and trends.
- CSV and printable report endpoints.
- JWT authentication, password hashing, rate limiting, Helmet headers, validation, RBAC, account lockout, and audit logs.
- Admin panel APIs for users, settings, analytics, and audit logs.

## Documentation

- [REST API](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Security Architecture](docs/SECURITY.md)
