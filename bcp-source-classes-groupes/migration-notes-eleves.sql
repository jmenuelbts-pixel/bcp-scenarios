-- migration-notes-eleves.sql
-- Ameliore la Liste Eleves : colonnes de notes robustes (ordre, bareme),
-- liaison d'une colonne a une activite auto (quiz / glisser-deposer) pour le
-- report automatique des scores, et ajout d'eleves manuels.
-- A EXECUTER UNE FOIS dans l'editeur SQL de Supabase.

-- 1. Colonnes de notes : valeurs par defaut robustes + liaison a une activite.
alter table public.colonnes_notes
  add column if not exists ordre integer not null default 0;

alter table public.colonnes_notes
  add column if not exists bareme integer not null default 20;

-- Liaison optionnelle a une activite auto-corrigee.
-- activite_liee_mission = id de mission (ex : 'hydrao-m3')
-- activite_liee_id      = 'quiz' ou 'glisser'
alter table public.colonnes_notes
  add column if not exists activite_liee_mission text;

alter table public.colonnes_notes
  add column if not exists activite_liee_id text;

-- created_at si absente (utilisee pour le tri secondaire).
alter table public.colonnes_notes
  add column if not exists created_at timestamptz not null default now();

-- 2. Profils : marquer les eleves ajoutes manuellement (sans compte auth).
-- Un eleve manuel a un id genere et statut 'accepte' pour apparaitre partout.
alter table public.profiles
  add column if not exists manuel boolean not null default false;

-- 3. Permettre l'insertion de profils manuels et la lecture/ecriture des
--    colonnes/notes cote professeur. (RLS supposee desactivee sur ces tables
--    comme le reste de l'application ; ces GRANT sont une securite.)
grant insert, update, delete on public.profiles to anon, authenticated;
grant insert, update, delete on public.colonnes_notes to anon, authenticated;
grant insert, update, delete on public.notes_eleves to anon, authenticated;
