# MASTER PROMPT — Application pédagogique scénarios BCP

Ce fichier est la référence complète pour construire l'application.
Le coller en début de chaque nouvelle conversation Claude suffit à reprendre le travail sans tout réexpliquer.

---

## CONTEXTE

Application web PWA pour lycéens en BCP (Baccalauréat Commercial et Professionnel).
L'élève navigue dans des scénarios d'entreprises réelles et réalise des missions pédagogiques.
Le professeur gère les accès, suit la progression, corrige les travaux et exporte les données.

---

## STACK TECHNIQUE

- React 18 + TypeScript
- Vite (bundler)
- Tailwind CSS v4 (reset uniquement — tout le style est en inline)
- React Router v6
- Framer Motion (animations)
- Supabase (base de données + authentification)
- Déploiement : Netlify via drag & drop d'un zip du dossier dist/

---

## CONVENTIONS ABSOLUES

- Tout le style en `style={{}}` inline, police Arial partout, jamais de classes Tailwind dans le JSX
- SVG inline pour toutes les icônes — jamais de librairie d'icônes externe
- Jamais d'émojis nulle part — ni dans l'interface, ni dans les contenus, ni dans les icônes
- Uniquement des symboles typographiques et des SVG pour les icônes
- Pas de tiret cadrantin (—) : utiliser uniquement le tiret simple (-)
- Couleur principale professeur : #1B6B3A
- Couleur par scénario définie dans src/data/schema.ts
- Onglets verrouillés : cadenas noir visible, texte grisé, curseur not-allowed
- Journal de bord : toujours accessible, jamais de cadenas
- Évaluations : verrouillées par défaut, ouverture globale par le prof (pas par onglet)
- Timeout session : 30 minutes d'inactivité puis déconnexion automatique
- Bandeau "hors ligne" détecté automatiquement et affiché en haut de page

---

## STRUCTURE DES FICHIERS

```
src/
  app/
    router.tsx               — toutes les routes de l'app
  components/
    ui/                      — Header, BandeauHorsLigne, Infobulle
    mission/                 — OngletTravaux, OngletSynthese, OngletAutoEval, OngletActivites, OngletJournal
  data/
    schema.ts                — SCENARIOS, MISSIONS, ONGLETS, types TypeScript
    contenus.ts              — loader centralisé du contenu par mission
    scenarios/               — un fichier .ts par scenario (contenu JSON)
    corriges/                — index.ts + un fichier corrige par mission + evaluations
    fiches/                  — index.ts + fiches de deroulement par mission
  lib/
    supabase.ts              — client Supabase
    session.ts               — surveillance inactivite 30 min
    deverrouillage.ts        — charger/basculer les onglets par mission
    progression.ts           — marquer un onglet visite
  pages/
    etudiant/                — AccueilEtudiant, ScenarioMissions, Mission, Messagerie
    enseignant/              — AccueilEnseignant, Inscriptions, Etudiants, Deverrouillage,
                                Messagerie, Travaux, Exports, CorrigeMission,
                                CorrigeEvaluation, FicheDeroulement, ProgressionPedagogique
```

---

## SCENARIOS ET MISSIONS

### Renault — 8 missions
- Mission 1 : La presentation de l'unite
- Mission 2 : La zone de chalandise
- Mission 3 : La prise de contact
- Mission 4 : La decouverte des besoins
- Mission 5 : Le conseil et la proposition de produit
- Mission 6 : Le traitement des objections liees au produit et au prix
- Mission 7 : La conclusion de la vente et le financement du credit
- Mission 8 : La vente additionnelle

### Peugeot — 13 missions
- Mission 1 : Le secteur de l'automobile
- Mission 2 : La reglementation sur les concessions automobiles
- Mission 3 : Les 3 principaux metiers de relation client dans une concession automobile
- Mission 4 : Le commercial en concession auto
- Mission 5 : L'analyse du CV du commercial automobile
- Mission 6 : La remuneration du commercial
- Mission 7 : Les caracteristiques techniques des vehicules
- Mission 8 : Le demarchage
- Mission 9 : Les mobiles d'achat lors de l'achat d'un vehicule
- Mission 10 : L'essai du vehicule d'occasion
- Mission 11 : Les obligations du commercial avant la vente
- Mission 12 : Les obligations du commercial au moment de la vente
- Mission 13 : L'animation et la fidelisation des clients

### Orpi — 4 missions
- Mission 1 : La phase preparatoire a la mise en oeuvre d'une action de FDRC
- Mission 2 : L'oral de la phase preparatoire a la mise en oeuvre de l'action de FDRC
- Mission 3 : La presentation de la mise en oeuvre de l'action de FDRC retenue
- Mission 4 : L'oral de presentation de la mise en oeuvre de l'action de FDRC retenue

### Mamie And Co — 8 missions
- Mission 1 : La presentation de l'unite commerciale et de la clientele
- Mission 2 : Les caracteristiques du produit et les mobiles d'achat
- Mission 3 : La preparation des outils pour la vente
- Mission 4 : La prise de contact
- Mission 5 : La presentation du produit et l'argumentation
- Mission 6 : La commande, les modalites de reglement et de livraison
- Mission 7 : Le traitement des reclamations client
- Mission 8 : Les differents types de relance client

### Leroy Merlin — 5 missions
- Mission 1 : La presentation de l'unite commerciale et de son marche
- Mission 2 : La recherche des besoins et la proposition de produit
- Mission 3 : S'assurer de la disponibilite du produit et faire de la vente
- Mission 4 : L'accord du client, les modalites de livraison et la prise de conge
- Mission 5 : Selectionner le prestataire le plus adapte, suivre l'execution du service et rendre compte

### Hydrao — 7 missions
- Mission 1 : La presentation de l'unite commerciale et de la clientele
- Mission 2 : La participation a une operation de prospection
- Mission 3 : Les caracteristiques du produit et l'argumentation
- Mission 4 : La garantie legale de conformite et l'extension de garantie
- Mission 5 : La reponse aux objections sur le produit et sur le prix
- Mission 6 : Le traitement des reclamations et le service apres-vente
- Mission 7 : Collecter les informations, mesurer et analyser la satisfaction client

### Free — 5 missions
- Mission 1 : La presentation de l'unite commerciale et de la clientele
- Mission 2 : Le traitement de la reclamation en reception d'appel
- Mission 3 : Les caracteristiques du produit et l'argumentation
- Mission 4 : Le traitement de la reclamation en reception d'appel et la vente au rebond
- Mission 5 : La satisfaction et la fidelisation du client

### Citroen — 3 missions
- Mission 1 : La presentation de l'entreprise Citroen
- Mission 2 : Le processus d'achat chez Citroen
- Mission 3 : Le suivi de la commande et les informations sur les conditions de livraison

### AMParis — 4 missions
- Mission 1 : La presentation de l'unite commerciale et de la clientele
- Mission 2 : Les recherches et l'exploitation d'information
- Mission 3 : La preparation de l'operation de prospection
- Mission 4 : La realisation de l'operation de prospection et ses resultats

---

## ESPACE ETUDIANT — FONCTIONNALITES DETAILLEES

### Accueil
- Fond avec degrades de bleus pas trop fonces (lumineux, lisible — meme logique que la couleur miel du BTS)
- Case "A propos" visible sur l'accueil
- 9 scenarios avec leur progression visuelle (barre + pastilles de missions)

### Page scenario
- Liste des missions (cliquables si debloquees, cadenas noir si verrouillee)

### Page mission — 5 onglets
1. **Travaux a rendre** : consigne de la mission a realiser, zone de saisie, bouton envoyer au prof
2. **Synthese** : carte arborescente a completer — mots et groupes de mots fournis, l'eleve complete les cases vides
3. **Auto-evaluation** : grille de competences avec indicateurs precis par niveau (l'eleve coche son niveau)
4. **Activites** :
   - Glossaire
   - Flashcards (bouton Envoyer pour noter)
   - Quiz : QCM, question a reponse unique, texte a trous, appariement — toutes les questions issues de la mission
   - Glisser-deposer
   - Correction automatique apres envoi (le bareme est charge par le prof, invisible pour l'eleve)
   - Le prof voit les reponses et les points attribues automatiquement
5. **Journal de bord** :
   - Ce que l'eleve n'a pas reussi dans les exercices et pourquoi
   - Ce qu'il a le moins bien reussi et pourquoi
   - Toujours accessible meme si la mission est verrouillee

### Exports PDF cote eleve
- Journal de bord
- Devoirs
- Travaux
- Activites (resultats et corrections)

### Messagerie
- Recevoir et envoyer des messages au prof

### Regles
- Onglets verrouillables individuellement par le prof (cadenas noir visible, texte grise)
- Evaluations verrouillee par defaut, accessibles uniquement si le prof les ouvre
- Timeout 30 minutes

---

## ESPACE PROFESSEUR — FONCTIONNALITES DETAILLEES

### En-tete
- Titre de l'application + nom du professeur
- 4 onglets : Tableau de bord | Corriges | Deroulement | Progression

### Tableau de bord — 6 items avec couleur pastel et icone SVG
- Demandes d'inscription (fond jaune) : accepter ou refuser les nouveaux eleves
- Suivi des eleves (fond bleu) : progression, connexions, resultats
- Travaux a rendre (fond vert) : devoirs rendus et corrections
- Deverrouillage (fond orange) : ouvrir et fermer les missions
- Messagerie (fond violet) : messages individuels et collectifs
- Exports PDF (fond rose) : journaux de bord, resultats, devoirs, travaux, activites

### Onglet Corriges
- Sous-onglets : Corrige mission | Corrige evaluation
- Corriges mission : accordeon par section/question, 3 types de blocs
  - Reponse attendue (fond vert clair)
  - Elements de correction (fond jaune clair)
  - Eclairage enseignant (fond bleu clair)
  - Tableaux visuels avec alternance de couleur
- Corriges evaluation : meme structure + bareme par question en pastille + grille de bilan

### Onglet Deroulement
- Fiche de deroulement par mission (phases, sous-temps, activites, materiel)

### Onglet Progression
- Bouton direct vers tableau complet des missions (objectifs, competences, savoirs)
- Suivi visuel par eleve si des eleves sont inscrits (barre de progression + pastilles de missions)

### Deverrouillage
- Missions de cours : grille par onglet — cadenas vert (ouvert) ou rouge (verrouille) cliquable
- Evaluations : bouton simple Ouvrir / Fermer
- Boutons Tout ouvrir / Tout fermer par mission
- Journal de bord : toujours ouvert (non modifiable)

### Suivi individuel
- Missions visitees
- Resultats aux quiz avec reponses detaillees et points attribues automatiquement
- Devoirs rendus
- Journal de bord complete

### Messagerie
- Message individuel ou collectif (toute la classe)
- Badge rouge pour messages non lus

### Exports PDF (cote prof)
- Journaux de bord
- Resultats et corrections
- Devoirs
- Travaux
- Activites

### Infobulles
- Sur chaque onglet du tableau de bord professeur
- Sur chaque item du menu
- Fond miel (#FEF3C7), texte brun, position calculee dynamiquement (position fixed pour eviter le debordement)

---

## TABLES SUPABASE

```sql
-- Profils utilisateurs
create table profiles (
  id uuid references auth.users primary key,
  email text,
  prenom text,
  nom text,
  role text check (role in ('etudiant', 'enseignant')),
  entreprise text,
  statut text check (statut in ('en_attente', 'accepte', 'refuse')) default 'en_attente',
  created_at timestamptz default now()
);

-- Deverrouillage des onglets par mission
create table deverrouillages_onglets (
  scenario_id text not null,
  mission_id text not null,
  onglet_id text not null,
  ouvert boolean not null default false,
  updated_at timestamptz default now(),
  primary key (mission_id, onglet_id)
);

-- Messages
create table messages (
  id uuid primary key default gen_random_uuid(),
  expediteur_id uuid references profiles(id),
  destinataire_id uuid references profiles(id),
  contenu text,
  lu boolean default false,
  created_at timestamptz default now()
);

-- Travaux rendus
create table travaux (
  id uuid primary key default gen_random_uuid(),
  etudiant_id uuid references profiles(id),
  mission_id text,
  contenu text,
  correction text,
  created_at timestamptz default now()
);

-- Journal de bord
create table journal_bord (
  id uuid primary key default gen_random_uuid(),
  etudiant_id uuid references profiles(id),
  mission_id text,
  non_reussi text,
  moins_bien_reussi text,
  updated_at timestamptz default now()
);

-- Onglets visites
create table onglets_visites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  mission_id text,
  onglet_id text,
  visited_at timestamptz default now()
);

-- Reponses aux quiz
create table reponses_quiz (
  id uuid primary key default gen_random_uuid(),
  etudiant_id uuid references profiles(id),
  mission_id text,
  activite_id text,
  reponses jsonb,
  score numeric,
  submitted_at timestamptz default now()
);

-- Auto-evaluations
create table auto_evaluations (
  id uuid primary key default gen_random_uuid(),
  etudiant_id uuid references profiles(id),
  mission_id text,
  competences jsonb,
  updated_at timestamptz default now()
);

-- Syntheses
create table syntheses (
  id uuid primary key default gen_random_uuid(),
  etudiant_id uuid references profiles(id),
  mission_id text,
  contenu jsonb,
  updated_at timestamptz default now()
);
```

### Politiques RLS
- Lecture publique sur `deverrouillages_onglets`
- Ecriture tous sur `deverrouillages_onglets`
- Chaque eleve lit et ecrit uniquement ses propres donnees
- L'enseignant lit toutes les donnees

---

## ORDRE DE CONSTRUCTION

1. Initialiser le projet : `npm create vite@latest nom-projet -- --template react-ts`
2. Installer les dependances : react-router-dom, framer-motion, @supabase/supabase-js
3. Configurer Supabase (client + variables d'environnement)
4. Creer src/data/schema.ts (SCENARIOS, MISSIONS, ONGLETS, types)
5. Creer l'authentification (inscription, connexion, deconnexion, redirection selon role)
6. Creer le timeout de session 30 min (src/lib/session.ts)
7. Creer le bandeau hors ligne (src/components/ui/BandeauHorsLigne.tsx)
8. Creer l'accueil etudiant avec degrades bleu et case A propos
9. Creer la page scenario (liste des missions)
10. Creer la page mission avec les 5 onglets
11. Creer le systeme de deverrouillage (src/lib/deverrouillage.ts)
12. Creer l'accueil professeur avec tableau de bord colore
13. Creer la gestion des inscriptions
14. Creer le deverrouillage professeur (grille onglets + bouton evaluation)
15. Creer la messagerie (deux sens)
16. Creer le suivi individuel des eleves
17. Creer les corriges (cours + evaluation)
18. Creer les fiches de deroulement
19. Creer les exports PDF (cote eleve + cote prof)
20. Creer la progression pedagogique
21. Build et deploiement Netlify

---

## DEPLOIEMENT NETLIFY

### Premiere fois (cloner le repo)
```bash
git clone https://[TOKEN]@github.com/[USER]/[REPO].git
cd [REPO]
npm install
```

### A chaque mise a jour
```bash
npm run build
zip -r ../dist-projet.zip dist/
```

1. Telecharger le zip genere par Claude
2. Sur Netlify : aller sur le projet > onglet Deploys > glisser le zip dans la zone de depot
3. Verifier sur l'URL Netlify que la version est bien a jour

### Variables d'environnement a definir dans Netlify
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Regles importantes
- Ne jamais zipper autre chose que le dossier `dist/`
- Le fichier de sortie s'appelle `dist-[nom-projet].zip`
- Toujours verifier apres deploiement que l'app fonctionne sur l'URL Netlify

---

## INSTRUCTION POUR CLAUDE

Quand tu recois ce fichier en debut de conversation :
1. Lis tout avant de faire quoi que ce soit
2. Demande quel est l'etape suivante ou ce que l'utilisateur veut construire
3. Respecte toutes les conventions sans exception (pas d'emoji, Arial inline, SVG inline, pas de tiret cadrantin)
4. A chaque build : generer le dist/ et zipper pour deploiement Netlify
5. Ne jamais suggerer d'installer une librairie d'icones externe
6. Toujours utiliser `position: fixed` pour les infobulles pour eviter les debordements
