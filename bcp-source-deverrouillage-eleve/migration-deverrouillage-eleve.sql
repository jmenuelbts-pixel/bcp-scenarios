-- migration-deverrouillage-eleve.sql
-- Ajoute le verrouillage/deverrouillage INDIVIDUEL par eleve, en plus du global.
-- A executer une fois dans l'editeur SQL de Supabase.
--
-- Principe :
--   - etudiant_id NULL  = etat GLOBAL (toute la classe) ;
--   - etudiant_id rempli = etat INDIVIDUEL (cet eleve), prioritaire.
-- L'unicite porte sur (mission_id, onglet_id, etudiant_id).

-- 1. Nouvelle colonne (nullable). Les lignes existantes deviennent l'etat global.
alter table public.deverrouillages_onglets
  add column if not exists etudiant_id uuid references public.profiles (id) on delete cascade;

-- 2. On remplace l'ancienne contrainte d'unicite (mission_id, onglet_id) par une
--    contrainte incluant l'eleve. NULL etant non-distinct dans un index unique
--    classique Postgres, on utilise un index unique avec NULLS NOT DISTINCT
--    (Postgres 15+) pour garantir une seule ligne globale par onglet.
do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'deverrouillages_onglets_mission_id_onglet_id_key'
  ) then
    alter table public.deverrouillages_onglets
      drop constraint deverrouillages_onglets_mission_id_onglet_id_key;
  end if;
end $$;

drop index if exists deverrouillages_onglets_unique_portee;
create unique index deverrouillages_onglets_unique_portee
  on public.deverrouillages_onglets (mission_id, onglet_id, etudiant_id)
  nulls not distinct;

-- 3. Index de lecture par eleve.
create index if not exists deverrouillages_onglets_etudiant_idx
  on public.deverrouillages_onglets (etudiant_id);
