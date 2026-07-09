-- migration-rls-classes.sql
-- Corrige l'erreur "new row violates row-level security policy for table classes".
-- Desactive la RLS sur les tables classes, groupes, eleves_groupes et retire
-- toute politique residuelle. A EXECUTER dans Supabase (SQL Editor > New query
-- > coller > Run). Ne touche a aucune donnee existante.

-- 1. Retirer les eventuelles politiques restantes.
do $$
declare p record;
begin
  for p in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in ('classes', 'groupes', 'eleves_groupes')
  loop
    execute format('drop policy if exists %I on public.%I', p.policyname, p.tablename);
  end loop;
end $$;

-- 2. Desactiver la RLS.
alter table public.classes        disable row level security;
alter table public.groupes        disable row level security;
alter table public.eleves_groupes disable row level security;

-- 3. Garantir les droits d'acces.
grant select, insert, update, delete on public.classes        to anon, authenticated;
grant select, insert, update, delete on public.groupes        to anon, authenticated;
grant select, insert, update, delete on public.eleves_groupes to anon, authenticated;
