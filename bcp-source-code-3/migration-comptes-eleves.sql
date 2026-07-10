-- migration-comptes-eleves.sql
-- Chantier B : espace Comptes eleves.
-- Ajoute une colonne mdp_simple sur profiles pour stocker un mot de passe
-- simple, VISIBLE par le professeur, uniquement pour les eleves manuels
-- (crees a la main, sans compte Auth). Les comptes Auth normaux gardent un
-- mot de passe chiffre cote Supabase, jamais lisible ici.
-- RLS deja desactivee sur profiles (voir migration-rls-notes.sql).

alter table profiles
  add column if not exists mdp_simple text;
