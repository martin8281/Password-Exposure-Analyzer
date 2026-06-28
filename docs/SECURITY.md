# Security Architecture

## Defensive Scope

The application analyzes password risk for awareness and training. It does not create brute-force wordlists, attack dictionaries, credential-stuffing lists, or passwords based on personal information.

## Authentication and Authorization

- Passwords are hashed with bcrypt.
- JWTs contain user id, email, and role.
- Protected routes validate JWTs.
- Admin routes enforce role-based access control.
- Login failures increment a counter and can temporarily lock accounts.

## Password Handling

- Raw login passwords are never stored.
- Assessment passwords are processed in memory.
- Assessment records store scores, findings, recommendations, and metadata, not the raw analyzed password.
- Generated passwords use Node.js cryptographic randomness.

## API and Web Controls

- Helmet sets secure HTTP headers and a conservative content security policy.
- CORS is restricted to `CLIENT_ORIGIN`.
- JSON request bodies are size-limited.
- Rate limiting applies across the API.
- Inputs are validated with Zod.
- SQL uses parameterized queries through `pg`.
- Errors return safe messages and avoid stack traces.

## Database Controls

- PostgreSQL schemas define foreign keys, constraints, and indexes.
- User roles are constrained to `user` and `admin`.
- Assessment and exposure scores are constrained to `0-100`.
- Audit logs capture authentication, report, security, and admin activity.

## Operational Recommendations

- Enforce HTTPS in production.
- Set secure and same-site cookie options if cookie-based JWT storage is enabled.
- Use a secret manager for `JWT_SECRET` and database credentials.
- Monitor failed login and admin audit events.
- Back up PostgreSQL regularly.
- Review OWASP ASVS and Top 10 controls before production launch.
