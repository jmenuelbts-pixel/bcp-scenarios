-- SCHEMA_COMPLET.sql
-- Reference de TOUTES les tables Supabase du projet (etat reel, deja en place).
-- Ne PAS relancer pour recreer : utiliser uniquement pour reference ou sur une
-- base vierge. Toutes les instructions sont idempotentes (if not exists).
-- RLS desactivee partout (projet pedagogique, acces controle cote application).

-- Profils (eleves et enseignant). Table existante, structure indicative.
-- (Ne pas recreer : geree par l'auth Supabase + colonnes applicatives.)
-- Colonnes utilisees par l'app : id, email, prenom, nom, date_naissance,
-- role ('etudiant' | 'enseignant'), entreprise, statut, created_at.

-- Visites d'onglets (suivi de navigation eleve).
create table if not exists onglets_visites (
  id uuid primary key default gen_random_uuid(),
  etudiant_id uuid not null,
  mission_id text,
  onglet_id text,
  visited_at timestamptz default now()
);
alter table onglets_visites disable row level security;

-- Travaux rendus + correction par competences.
create table if not exists travaux (
  id uuid primary key default gen_random_uuid(),
  etudiant_id uuid not null,
  mission_id text not null,
  contenu text,
  correction text,
  commentaire text,
  competences jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);
alter table travaux add column if not exists commentaire text;
alter table travaux add column if not exists competences jsonb default '[]'::jsonb;
alter table travaux disable row level security;

-- Journal de bord.
create table if not exists journal_bord (
  id uuid primary key default gen_random_uuid(),
  etudiant_id uuid not null,
  mission_id text not null,
  non_reussi text,
  moins_bien_reussi text,
  updated_at timestamptz default now()
);
alter table journal_bord disable row level security;

-- Reponses aux quiz + bareme d'affichage (10 ou 20).
create table if not exists reponses_quiz (
  id uuid primary key default gen_random_uuid(),
  etudiant_id uuid not null,
  mission_id text not null,
  activite_id text,
  reponses jsonb,
  score numeric,
  bareme numeric,
  submitted_at timestamptz default now()
);
alter table reponses_quiz add column if not exists bareme numeric;
alter table reponses_quiz disable row level security;

-- Messagerie prof <-> eleve.
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  expediteur_id uuid not null,
  destinataire_id uuid not null,
  contenu text not null,
  lu boolean default false,
  created_at timestamptz default now()
);
alter table messages disable row level security;

-- Appels (presence par seance) — Partie 1.
create table if not exists appels (
  id uuid primary key default gen_random_uuid(),
  date_appel date not null,
  etudiant_id uuid not null references profiles(id) on delete cascade,
  absent boolean not null default false,
  retard_minutes integer,
  created_at timestamptz default now(),
  unique (date_appel, etudiant_id)
);
alter table appels disable row level security;

-- Colonnes de notes dynamiques — Partie 1.
create table if not exists colonnes_notes (
  id uuid primary key default gen_random_uuid(),
  intitule text not null,
  date_eval date,
  compter_moyenne boolean not null default true,
  ordre integer default 0,
  created_at timestamptz default now()
);
alter table colonnes_notes disable row level security;

-- Notes par colonne et par eleve — Partie 1.
create table if not exists notes_eleves (
  id uuid primary key default gen_random_uuid(),
  colonne_id uuid not null references colonnes_notes(id) on delete cascade,
  etudiant_id uuid not null references profiles(id) on delete cascade,
  note numeric,
  bareme numeric not null default 20,
  unique (colonne_id, etudiant_id)
);
alter table notes_eleves disable row level security;
