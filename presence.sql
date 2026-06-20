-- presence.sql - table de presence temps reel (idempotent)
create table if not exists presence (
  etudiant_id uuid primary key,
  page text,
  scenario_id text,
  mission_id text,
  onglet_id text,
  progression int,
  updated_at timestamptz default now()
);
alter table presence add column if not exists page text;
alter table presence add column if not exists scenario_id text;
alter table presence add column if not exists mission_id text;
alter table presence add column if not exists onglet_id text;
alter table presence add column if not exists progression int;
alter table presence disable row level security;
