-- migration-deverrouillage-eleve.sql
-- Ajoute le verrouillage/deverrouillage INDIVIDUEL par eleve, en plus du global.
-- A EXECUTER UNE FOIS dans l'editeur SQL de Supabase (SQL Editor > New query > Run).
--
-- Principe :
--   - etudiant_id NULL  = etat GLOBAL (toute la classe) ;
--   - etudiant_id rempli = etat INDIVIDUEL (cet eleve), prioritaire.
-- L'unicite porte sur (mission_id, onglet_id, etudiant_id).

-- 1. Nouvelle colonne (nullable). Les lignes existantes deviennent l'etat global.
alter table public.deverrouillages_onglets
  add column if not exists etudiant_id uuid references public.profiles (id) on delete cascade;

-- 2. Supprime toute ancienne contrainte/index d'unicite sur (mission_id, onglet_id),
--    quel que soit son nom auto-genere.
do $$
declare
  c record;
begin
  for c in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = 'deverrouillages_onglets'
      and con.contype = 'u'
  loop
    execute format('alter table public.deverrouillages_onglets drop constraint %I', c.conname);
  end loop;
end $$;

-- 3. Nouvel index unique incluant l'eleve. NULLS NOT DISTINCT (Postgres 15+)
--    garantit une seule ligne globale (etudiant_id NULL) par onglet.
drop index if exists deverrouillages_onglets_unique_portee;
create unique index deverrouillages_onglets_unique_portee
  on public.deverrouillages_onglets (mission_id, onglet_id, etudiant_id)
  nulls not distinct;

-- 4. Index de lecture par eleve.
create index if not exists deverrouillages_onglets_etudiant_idx
  on public.deverrouillages_onglets (etudiant_id);
