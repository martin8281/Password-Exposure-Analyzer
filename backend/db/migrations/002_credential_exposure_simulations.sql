create table if not exists exposure_reports (
  id uuid primary key default uuid_generate_v4(),
  admin_user_id uuid not null references users(id) on delete cascade,
  subject_label varchar(160),
  exposure_score integer not null check (exposure_score between 0 and 100),
  risk_level varchar(20) not null check (risk_level in ('Low', 'Moderate', 'High', 'Critical')),
  public_info jsonb not null,
  risk_factors jsonb not null,
  risky_patterns jsonb not null,
  possible_pattern_categories jsonb not null default '[]',
  recommendations jsonb not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists analytics (
  id uuid primary key default uuid_generate_v4(),
  metric_name varchar(120) not null,
  metric_value numeric not null,
  dimensions jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_exposure_reports_admin_created on exposure_reports(admin_user_id, created_at desc);
create index if not exists idx_exposure_reports_score on exposure_reports(exposure_score);
create index if not exists idx_exposure_reports_public_info on exposure_reports using gin(public_info);
create index if not exists idx_analytics_metric_created on analytics(metric_name, created_at desc);
