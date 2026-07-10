-- migration-classes-groupes.sql
-- Ajoute la gestion des CLASSES et des GROUPES.
--   - un eleve appartient a UNE classe (profiles.classe_id) ;
--   - un groupe appartient a UNE classe (groupes.classe_id) ;
--   - un eleve peut etre dans PLUSIEURS groupes (table de liaison eleves_groupes).
-- A EXECUTER UNE FOIS dans Supabase (SQL Editor > New query > Run).

-- 1. Table des classes.
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  created_at timestamptz not null default now()
);

-- 2. Table des groupes (rattaches a une classe).
create table if not exists public.groupes (
  id uuid primary key default gen_random_uuid(),
  classe_id uuid not null references public.classes (id) on delete cascade,
  nom text not null,
  created_at timestamptz not null default now()
);

-- 3. Rattachement d'un eleve a une classe (nullable : eleve sans classe).
alter table public.profiles
  add column if not exists classe_id uuid references public.classes (id) on delete set null;

-- 4. Liaison eleve <-> groupes (plusieurs groupes par eleve).
create table if not exists public.eleves_groupes (
  eleve_id uuid not null references public.profiles (id) on delete cascade,
  groupe_id uuid not null references public.groupes (id) on delete cascade,
  primary key (eleve_id, groupe_id)
);

-- 5. RLS desactivee sur ces tables (coherent avec le reste de l'app).
alter table public.classes         disable row level security;
alter table public.groupes         disable row level security;
alter table public.eleves_groupes  disable row level security;

grant select, insert, update, delete on public.classes to anon, authenticated;
grant select, insert, update, delete on public.groupes to anon, authenticated;
grant select, insert, update, delete on public.eleves_groupes to anon, authenticated;

create index if not exists profiles_classe_idx on public.profiles (classe_id);
create index if not exists groupes_classe_idx on public.groupes (classe_id);
create index if not exists eleves_groupes_groupe_idx on public.eleves_groupes (groupe_id);
