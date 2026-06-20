# DÉMARRAGE IMMÉDIAT — LIRE EN PREMIER, NE POSE AUCUNE QUESTION

Ce dépôt est À JOUR. Le code présent ici est la version la plus récente (il contient
ListeEleves, Corriges, Deroulement, Progression, Exports, la correction par compétences,
la messagerie par sondage 3s). Si tu hésitais : OUI, code sur cet état, c'est le bon.

Réponses aux questions habituelles, pour que tu n'aies RIEN à demander :

1. Point de départ : ce dépôt est à jour, travaille dessus directement.
2. État Supabase : TOUTES les tables existent déjà (profiles, onglets_visites, travaux
   avec commentaire+competences, journal_bord, reponses_quiz avec bareme, messages, appels,
   colonnes_notes, notes_eleves). Voir SCHEMA_COMPLET.sql. Ne recrée RIEN. Pour du nouveau,
   uniquement `create table if not exists` / `alter table add column if not exists`.
3. Build : un fichier .env est nécessaire (supabase.ts lève une erreur sinon). Crée-le à
   partir de .env.example. Valeurs :
   VITE_SUPABASE_URL=https://njkslucischlvjlflzrr.supabase.co
   VITE_SUPABASE_ANON_KEY = clé anon publique (l'utilisateur te la colle, ou tu builds avec
   un placeholder et tu indiques où la remplacer). La clé anon est publique, pas de risque.
   NE JAMAIS demander/utiliser la clé service_role.
4. Premier chantier : Tri des devoirs rendus (Partie 3). Ordre par défaut : alphabétique
   par nom, PARTOUT.
5. Workflow : pas de narration pendant code/build/zip. Résumé en quelques tirets AVANT le
   zip. Livre le zip du dossier dist/. Aller à l'essentiel, pas de longs paragraphes.

Confirme en une phrase que tu as lu ce bloc, puis CODE directement le tri des devoirs.

---

# ETAT DU PROJET — Scénarios MCV B

Application PWA pour le Bac Professionnel Métiers du Commerce et de la Vente, option B.
React + TypeScript + Vite + Tailwind v4 + Supabase. Déploiement Netlify par glisser-déposer du `dist/` zippé.

## Identité technique
- Dépôt GitHub : https://github.com/jmenuelbts-pixel/bcp-scenarios
- Déploiement Netlify : harmonious-sunflower-1714be.netlify.app
- Supabase : https://njkslucischlvjlflzrr.supabase.co (RLS désactivée sur toutes les tables)
- Table des profils élèves/prof : `profiles` (avec un "e")
- ID enseignant en dur : 856c0aa1-1c19-4f18-baf0-c4b9c927eaad
- Email enseignant : menuelmariaderaismes@gmail.com
- Couleur prof : vert #1B6B3A
- Les variables Supabase sont intégrées au build (fichier .env local). Sur Netlify, le site
  est déployé par glisser-déposer, donc le build doit contenir les valeurs : faire `npm run build`
  avec un .env présent, puis zipper `dist/`.

## Règles de style absolues
- Tout en inline, police Arial, SVG inline.
- Aucun emoji.
- Accents français dans tous les textes affichés ; JAMAIS d'accent dans les identifiants de code.
- Couleur prof vert #1B6B3A.
- Ne jamais écrire le nom/prénom complet de l'enseignant (initiales J.M. uniquement).

## Workflow de livraison
- L'utilisateur ne veut PAS de narration détaillée pendant le code/build/zip.
- Travailler en silence, puis donner un résumé bref en quelques tirets AVANT le fichier livré.
- Aller à l'essentiel, pas de longs paragraphes.
- Livrer un zip du dossier `dist/` à la fin de chaque étape.
- Pour toute nouvelle table/colonne Supabase : donner un script SQL à coller (SQL Editor > Run),
  ne jamais recréer les tables existantes.

## CE QUI EST FAIT (squelette complet)

### Authentification et inscription
- Connexion / inscription élève, identifiant prof en dur.
- Charte RGPD obligatoire à l'inscription : bouton jaune "Lire la charte (obligatoire)",
  modale avec scroll jusqu'en bas, case à cocher qui n'apparaît qu'en bas, fermeture auto
  après 400ms, bouton d'envoi grisé/désactivé tant que non acceptée.
  Texte charte = Bac Pro MCV option B (PAS BTS MOS).

### Espace prof — en-tête 4 onglets (composant EnteteProf réutilisable)
- Tableau de bord, Corrigés, Déroulement, Progression.

### Tableau de bord prof (cartes)
- Demandes d'inscription, Liste des élèves, Suivi des élèves, Travaux à rendre,
  Déverrouillage, Messagerie, Exports PDF.

### Corrigés (page Corriges.tsx)
- Accordéon Scénario -> Missions -> zone corrigé (VIDE, à remplir avec le contenu).
- Chaque scénario dans sa couleur mère (page d'accueil), missions en teinte plus claire.

### Déroulement (page Deroulement.tsx)
- Présentation "liste latérale + panneau" (option 4) : pastilles scénario en haut,
  liste des missions à gauche, fiche à droite (VIDE).

### Progression pédagogique (page Progression.tsx)
- Tableau élèves x missions, 3 points par case : travail rendu (vert), activité faite (bleu),
  journal rempli (orange).

### Liste des élèves (page ListeEleves.tsx) — Partie 1 de la grande spec
- Onglet Appel : date modifiable, historique des appels (sélecteur + suppression),
  case Absent, champ Retard désactivé si absent, compteur présents/absents. Sauvegarde auto.
- Onglet Notes : colonnes fixes Nom/Prénom, Date d'inscription, Moyenne /20 auto
  (colonnes cochées "compter" uniquement). Colonnes dynamiques : ajout, renommage,
  date d'éval, case compter, suppression. Notes sur 20 modifiables.
- Alimentation auto à l'inscription, tri alphabétique par nom.

### Messagerie
- Temps réel par SONDAGE toutes les 3 secondes (pas Supabase Realtime) : messages et badge
  non-lus se mettent à jour sans rafraîchir. Côté élève et côté prof.
- Fonctions dans src/lib/messagerie.ts : sonderMessages, sonderConversation.

### Correction des travaux (par compétences, pas de note chiffrée)
- Côté prof (SuiviEleve, composant CorrectionTravail) : commentaire libre + ajout de
  compétences avec niveau Novice/Débrouillé/Averti/Expert. Enregistrement.
- Côté élève (OngletTravaux) : encadré "Retour du professeur" (commentaire + niveaux).

### Notes activités sur 10 ou 20
- Dans SuiviEleve, section Résultats : boutons "sur 10" / "sur 20" par activité,
  conversion auto du score brut, choix enregistré (colonne bareme).

### Exports PDF
- Côté prof (Exports.tsx) et côté élève (ExportsEleve.tsx) : journal, travaux, activités,
  ou dossier complet. Via fenêtre d'impression du navigateur (pas de librairie).

### Accents
- Tous les textes affichés sont accentués, identifiants de code intacts.

## TABLES SUPABASE EXISTANTES
- profiles, onglets_visites, travaux (+ colonnes commentaire, competences),
  journal_bord, reponses_quiz (+ colonne bareme), messages,
  appels, colonnes_notes, notes_eleves.

## CE QU'IL RESTE À FAIRE

### Contenu des missions (BLOQUANT, dépend de l'utilisateur)
- 56 missions sur 57 sont VIDES (seule Renault M1 a du contenu).
- Pour chaque mission : consigne de travaux, carte de synthèse, grille d'auto-évaluation,
  activités (glossaire, flashcards, quiz, glisser-déposer), corrigé, fiche de déroulement,
  compétences évaluées (tirées du référentiel Bac MCV, blocs 1, 2, 3, 4B).
- Le contenu vit dans src/data/contenus.ts (getContenuMission).
- Les compétences par mission sont à reconnaître en lisant chaque exercice, à rattacher au
  référentiel. L'utilisateur fournira les missions.

### Grande spec partie prof (document fourni) — découpée en 3 parties
- Partie 1 FAITE : Liste Élèves 2 onglets (Appel + Notes).
- Partie 2 À FAIRE : Présence temps réel 2 niveaux.
  - Niveau 1 : statut connexion par élève (vert clignotant connecté / orange inactif /
    gris hors ligne) + page actuellement visitée par l'élève.
  - Niveau 2 : présence par exercice (vert clignotant sur l'exo / rouge ailleurs) +
    barre de progression. Sans bouton, toujours visible.
  - Nécessitera des tables/colonnes Supabase de présence + un mécanisme de heartbeat.
- Partie 3 À FAIRE : Tri des devoirs rendus partout (sélecteur réutilisable :
  alphabétique, date/heure, note, statut, avancement, dernière activité).

### Principe directeur de la spec
- Simplicité et intuitivité avant tout : compréhensible en moins de 5 secondes, sans mode
  d'emploi. Contrôle manuel total partout (ajouter/supprimer/modifier élève, note, colonne,
  entrée d'appel) en 1-2 clics.

## STRUCTURE DES FICHIERS PRINCIPAUX
- src/data/schema.ts : SCENARIOS (id, nom, couleur, missions), getScenario, getMission,
  couleurEntete, couleurTexteSur, eclaircir.
- src/data/contenus.ts : contenu des missions (ContenuMission), getContenuMission.
- src/lib/auth.tsx : authentification, Profil (avec created_at).
- src/lib/enseignant.ts : données prof (élèves, suivi, correction, barème, avancement).
- src/lib/eleve.ts : données élève (travaux, journal, quiz, retour prof).
- src/lib/messagerie.ts : messagerie + sondage temps réel.
- src/lib/listeEleves.ts : appels et notes (Partie 1).
- src/components/ui/EnteteProf.tsx : en-tête 4 onglets.
- src/pages/enseignant/ : AccueilEnseignant, Corriges, Deroulement, Progression,
  ListeEleves, SuiviEleve, Exports, Messagerie, Deverrouillage, Inscriptions, Etudiants.
- src/app/router.tsx : toutes les routes.

## MESSAGE DE REPRISE POUR LE PROCHAIN CLAUDE
Reprends le projet "Scénarios MCV B" (Bac Pro MCV option B). Le code est sur GitHub :
https://github.com/jmenuelbts-pixel/bcp-scenarios. Clone et lis le code avant de coder.
Lis aussi ce fichier ETAT_PROJET.md. Respecte les règles de style absolues et le workflow
de livraison (silencieux + résumé en tirets + zip dist). Le squelette est complet ; il reste
le contenu des 56 missions (fourni par l'utilisateur) et les parties 2 et 3 de la grande spec
prof (présence temps réel, tri des devoirs).
