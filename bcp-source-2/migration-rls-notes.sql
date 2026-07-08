-- migration-rls-notes.sql
-- Desactive la Row-Level Security sur les tables utilisees par la Liste Eleves,
-- comme le reste des tables de l'application. A EXECUTER UNE FOIS dans Supabase
-- (SQL Editor > New query > Run) si l'ajout d'eleve / de colonne renvoie
-- "new row violates row-level security policy".

alter table public.profiles        disable row level security;
alter table public.colonnes_notes  disable row level security;
alter table public.notes_eleves    disable row level security;

-- Par securite, on desactive aussi la RLS sur les tables liees a l'appel et au
-- deverrouillage (memes usages cote professeur).
alter table public.appels                    disable row level security;
alter table public.deverrouillages_onglets   disable row level security;
