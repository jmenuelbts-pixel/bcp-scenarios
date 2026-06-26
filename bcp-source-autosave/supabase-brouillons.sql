-- ============================================================================
-- BCP Scenarios - Table des brouillons (autosauvegarde des saisies eleve)
-- A executer UNE SEULE FOIS dans Supabase (SQL Editor).
-- Sans cette table, l'autosauvegarde fonctionne quand meme en local
-- (localStorage), mais ne se synchronise pas entre appareils.
-- ============================================================================

create table if not exists public.brouillons (
  etudiant_id uuid not null,
  mission_id  text not null,
  zone        text not null,
  valeur      jsonb,
  updated_at  timestamptz not null default now(),
  primary key (etudiant_id, mission_id, zone)
);

alter table public.brouillons enable row level security;

-- Chaque eleve ne voit et n'ecrit que ses propres brouillons.
drop policy if exists "brouillons_select_proprietaire" on public.brouillons;
create policy "brouillons_select_proprietaire"
  on public.brouillons for select
  using (auth.uid() = etudiant_id);

drop policy if exists "brouillons_insert_proprietaire" on public.brouillons;
create policy "brouillons_insert_proprietaire"
  on public.brouillons for insert
  with check (auth.uid() = etudiant_id);

drop policy if exists "brouillons_update_proprietaire" on public.brouillons;
create policy "brouillons_update_proprietaire"
  on public.brouillons for update
  using (auth.uid() = etudiant_id)
  with check (auth.uid() = etudiant_id);

drop policy if exists "brouillons_delete_proprietaire" on public.brouillons;
create policy "brouillons_delete_proprietaire"
  on public.brouillons for delete
  using (auth.uid() = etudiant_id);
