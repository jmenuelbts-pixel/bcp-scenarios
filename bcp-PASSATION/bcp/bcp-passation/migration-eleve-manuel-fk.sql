-- migration-eleve-manuel-fk.sql
-- Autorise l'ajout d'eleves MANUELS (sans compte d'authentification).
-- Probleme : la table profiles a une cle etrangere profiles_id_fkey qui exige
-- que chaque id corresponde a un utilisateur de auth.users. Un eleve ajoute a
-- la main n'a pas de compte auth, d'ou l'erreur
--   "insert or update on table profiles violates foreign key constraint".
-- On retire cette contrainte pour permettre les profils manuels.
-- A EXECUTER UNE FOIS dans Supabase (SQL Editor > New query > Run).

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
      and rel.relname = 'profiles'
      and con.contype = 'f'          -- cles etrangeres
  loop
    execute format('alter table public.profiles drop constraint %I', c.conname);
  end loop;
end $$;
