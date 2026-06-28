create extension if not exists "uuid-ossp";

create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  email varchar(255) not null unique,
  password_hash text not null,
  name varchar(120) not null,
  role varchar(20) not null default 'user' check (role in ('user', 'admin')),
  disabled_at timestamptz,
  failed_login_attempts integer not null default 0,
  locked_until timestamptz,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists password_policies (
  id uuid primary key default uuid_generate_v4(),
  min_length integer not null default 12 check (min_length >= 4),
  max_length integer check (max_length is null or max_length >= min_length),
  require_uppercase boolean not null default true,
  require_lowercase boolean not null default true,
  require_numbers boolean not null default true,
  require_special boolean not null default true,
  expiration_days integer check (expiration_days is null or expiration_days >= 0),
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists assessments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  strength_score integer not null check (strength_score between 0 and 100),
  exposure_score integer not null check (exposure_score between 0 and 100),
  policy_pass boolean,
  result jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists exposure_results (
  id uuid primary key default uuid_generate_v4(),
  assessment_id uuid not null references assessments(id) on delete cascade,
  exposure_score integer not null check (exposure_score between 0 and 100),
  risk_level varchar(20) not null,
  findings jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists reports (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  report_type varchar(20) not null check (report_type in ('csv', 'printable', 'pdf')),
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete set null,
  action varchar(120) not null,
  category varchar(30) not null check (category in ('auth', 'security', 'admin', 'report')),
  ip_address inet,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_users_email on users(email);
create index if not exists idx_users_role on users(role);
create index if not exists idx_assessments_user_created on assessments(user_id, created_at desc);
create index if not exists idx_assessments_scores on assessments(strength_score, exposure_score);
create index if not exists idx_exposure_results_assessment on exposure_results(assessment_id);
create index if not exists idx_reports_user_created on reports(user_id, created_at desc);
create index if not exists idx_audit_logs_user_created on audit_logs(user_id, created_at desc);
create index if not exists idx_audit_logs_category_created on audit_logs(category, created_at desc);
