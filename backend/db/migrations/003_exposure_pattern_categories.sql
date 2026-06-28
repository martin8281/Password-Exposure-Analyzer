alter table exposure_reports
  add column if not exists possible_pattern_categories jsonb not null default '[]';
