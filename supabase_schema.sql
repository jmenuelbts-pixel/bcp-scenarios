-- ===========================================================================
-- Scenarios BCP - Schema de base de donnees Supabase
-- A coller dans l'editeur SQL de Supabase (projet njkslucischlvjlflzrr).
-- Execute la creation des tables, des index et des politiques RLS.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Table profiles : profil utilisateur lie a auth.users
-- ---------------------------------------------------------------------------
create table if not exists profiles (
  id uuid references auth.users primary key,
  email text,
  prenom text,
  nom text,
  role text check (role in ('etudiant', 'enseignant')),
  entreprise text,
  statut text check (statut in ('en_attente', 'accepte', 'refuse')) default 'en_attente',
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Table deverrouillages_onglets : etat ouvert/verrouille par mission et onglet
-- ---------------------------------------------------------------------------
create table if not exists deverrouillages_onglets (
  scenario_id text not null,
  mission_id text not null,
  onglet_id text not null,
  ouvert boolean not null default false,
  updated_at timestamptz default now(),
  primary key (mission_id, onglet_id)
);

-- ---------------------------------------------------------------------------
-- Table messages : messagerie professeur / eleve
-- ---------------------------------------------------------------------------
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  expediteur_id uuid references profiles(id),
  destinataire_id uuid references profiles(id),
  contenu text,
  lu boolean default false,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Table travaux : travaux rendus et leur correction
-- ---------------------------------------------------------------------------
create table if not exists travaux (
  id uuid primary key default gen_random_uuid(),
  etudiant_id uuid references profiles(id),
  mission_id text,
  contenu text,
  correction text,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Table journal_bord : journal de bord par mission
-- ---------------------------------------------------------------------------
create table if not exists journal_bord (
  id uuid primary key default gen_random_uuid(),
  etudiant_id uuid references profiles(id),
  mission_id text,
  non_reussi text,
  moins_bien_reussi text,
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Table onglets_visites : suivi des onglets visites
-- ---------------------------------------------------------------------------
create table if not exists onglets_visites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  mission_id text,
  onglet_id text,
  visited_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Table reponses_quiz : reponses aux activites et score
-- ---------------------------------------------------------------------------
create table if not exists reponses_quiz (
  id uuid primary key default gen_random_uuid(),
  etudiant_id uuid references profiles(id),
  mission_id text,
  activite_id text,
  reponses jsonb,
  score numeric,
  submitted_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Table auto_evaluations : grilles d'auto-evaluation
-- ---------------------------------------------------------------------------
create table if not exists auto_evaluations (
  id uuid primary key default gen_random_uuid(),
  etudiant_id uuid references profiles(id),
  mission_id text,
  competences jsonb,
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Table syntheses : cartes de synthese completees
-- ---------------------------------------------------------------------------
create table if not exists syntheses (
  id uuid primary key default gen_random_uuid(),
  etudiant_id uuid references profiles(id),
  mission_id text,
  contenu jsonb,
  updated_at timestamptz default now()
);

-- ===========================================================================
-- ROW LEVEL SECURITY
-- ===========================================================================

alter table profiles enable row level security;
alter table deverrouillages_onglets enable row level security;
alter table messages enable row level security;
alter table travaux enable row level security;
alter table journal_bord enable row level security;
alter table onglets_visites enable row level security;
alter table reponses_quiz enable row level security;
alter table auto_evaluations enable row level security;
alter table syntheses enable row level security;

-- Fonction utilitaire : indique si l'utilisateur courant est enseignant.
create or replace function est_enseignant()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'enseignant'
  );
$$;

-- ---------------------------------------------------------------------------
-- Politiques : profiles
-- ---------------------------------------------------------------------------
-- Chaque utilisateur peut creer son propre profil a l'inscription.
drop policy if exists "profiles insert self" on profiles;
create policy "profiles insert self" on profiles
  for insert with check (auth.uid() = id);

-- Chacun lit son propre profil ; l'enseignant lit tous les profils.
drop policy if exists "profiles select" on profiles;
create policy "profiles select" on profiles
  for select using (auth.uid() = id or est_enseignant());

-- Chacun met a jour son propre profil ; l'enseignant met a jour tous les profils
-- (necessaire pour accepter ou refuser une inscription).
drop policy if exists "profiles update" on profiles;
create policy "profiles update" on profiles
  for update using (auth.uid() = id or est_enseignant());

-- ---------------------------------------------------------------------------
-- Politiques : deverrouillages_onglets (lecture publique, ecriture tous)
-- ---------------------------------------------------------------------------
drop policy if exists "deverr select" on deverrouillages_onglets;
create policy "deverr select" on deverrouillages_onglets
  for select using (true);

drop policy if exists "deverr write" on deverrouillages_onglets;
create policy "deverr write" on deverrouillages_onglets
  for all using (true) with check (true);

-- ---------------------------------------------------------------------------
-- Politiques : messages
-- ---------------------------------------------------------------------------
drop policy if exists "messages select" on messages;
create policy "messages select" on messages
  for select using (
    auth.uid() = expediteur_id or auth.uid() = destinataire_id or est_enseignant()
  );

drop policy if exists "messages insert" on messages;
create policy "messages insert" on messages
  for insert with check (auth.uid() = expediteur_id or est_enseignant());

drop policy if exists "messages update" on messages;
create policy "messages update" on messages
  for update using (
    auth.uid() = destinataire_id or auth.uid() = expediteur_id or est_enseignant()
  );

-- ---------------------------------------------------------------------------
-- Politiques generiques eleve : chaque eleve gere ses donnees, l'enseignant lit tout
-- Macro repetee pour chaque table a colonne etudiant_id / user_id.
-- ---------------------------------------------------------------------------

-- travaux
drop policy if exists "travaux eleve" on travaux;
create policy "travaux eleve" on travaux
  for all using (auth.uid() = etudiant_id or est_enseignant())
  with check (auth.uid() = etudiant_id or est_enseignant());

-- journal_bord
drop policy if exists "journal eleve" on journal_bord;
create policy "journal eleve" on journal_bord
  for all using (auth.uid() = etudiant_id or est_enseignant())
  with check (auth.uid() = etudiant_id or est_enseignant());

-- onglets_visites (colonne user_id)
drop policy if exists "visites eleve" on onglets_visites;
create policy "visites eleve" on onglets_visites
  for all using (auth.uid() = user_id or est_enseignant())
  with check (auth.uid() = user_id or est_enseignant());

-- reponses_quiz
drop policy if exists "quiz eleve" on reponses_quiz;
create policy "quiz eleve" on reponses_quiz
  for all using (auth.uid() = etudiant_id or est_enseignant())
  with check (auth.uid() = etudiant_id or est_enseignant());

-- auto_evaluations
drop policy if exists "autoeval eleve" on auto_evaluations;
create policy "autoeval eleve" on auto_evaluations
  for all using (auth.uid() = etudiant_id or est_enseignant())
  with check (auth.uid() = etudiant_id or est_enseignant());

-- syntheses
drop policy if exists "syntheses eleve" on syntheses;
create policy "syntheses eleve" on syntheses
  for all using (auth.uid() = etudiant_id or est_enseignant())
  with check (auth.uid() = etudiant_id or est_enseignant());

-- ===========================================================================
-- Fin du script.
-- Note : le premier compte enseignant peut etre cree via l'inscription
-- (role enseignant, statut accepte par defaut cote application).
-- ===========================================================================
