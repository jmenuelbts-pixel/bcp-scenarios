-- Table des brouillons (autosave du travail non encore envoye).
-- A passer une seule fois dans Supabase (SQL Editor).
-- etudiant_id = auth.uid() du compte Supabase de l'eleve.

create table if not exists public.brouillons (
  etudiant_id uuid not null,
  mission_id  text not null,
  composant   text not null,
  donnees     jsonb not null default '{}'::jsonb,
  maj         timestamptz not null default now(),
  primary key (etudiant_id, mission_id, composant)
);

alter table public.brouillons enable row level security;

create policy "brouillons_select_own" on public.brouillons
  for select using (auth.uid() = etudiant_id);
create policy "brouillons_insert_own" on public.brouillons
  for insert with check (auth.uid() = etudiant_id);
create policy "brouillons_update_own" on public.brouillons
  for update using (auth.uid() = etudiant_id) with check (auth.uid() = etudiant_id);
create policy "brouillons_delete_own" on public.brouillons
  for delete using (auth.uid() = etudiant_id);
