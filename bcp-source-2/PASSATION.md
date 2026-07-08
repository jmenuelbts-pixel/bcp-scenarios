# PASSATION — BCP Scénarios (PWA pédagogique Bac Pro MCV)

Ce fichier explique à la prochaine instance de Claude où on s'est arrêté et EXACTEMENT quoi faire. L'utilisateur est J.M. (n'utiliser que ces initiales, jamais le nom complet). Répondre en français, ton simple et direct, sans narration pendant l'exécution technique.

## 0. RÈGLES ABSOLUES

- Confidentialité : ne jamais écrire le nom/prénom complet de J.M. Utiliser « J.M. ».
- Style : réponses courtes et directes. Pas de narration étape par étape pendant l'exécution. Après livraison : résumé 3-5 lignes max + « Déploie le dist sur Netlify, pousse la source sur GitHub. » (+ mention migration SQL si concernée).
- Confirmation avant gros chantier : demander confirmation simple/directe de compréhension, avec exemples concrets si J.M. dit ne pas comprendre. Il valide fonctionnalité par fonctionnalité.
- Screenshot d'un test/quiz : répondre UNIQUEMENT par la/les bonne(s) réponse(s), sans explication.
- Noms d'entreprises fictives : chaque nouvel exercice un nom différent, jamais réutilisé.
- Annexes = vrais logiciels professionnels (CRM, messagerie, formulaires, FAQ à onglets...), pas de simples rectangles.

## 1. LE PROJET

- App « BCP Scénarios » : PWA React + TypeScript + Vite + Supabase, pour élèves Bac Pro Métiers du Commerce et de la Vente.
- Copie de travail dans ce zip : dossier `bcp/bcp-passation/` (buildable).
- Netlify (prod) : harmonious-sunflower-1714be.netlify.app
- GitHub : jmenuelbts-pixel/bcp-scenarios
- Supabase : projet « jmenuelbts-pixel's Project ». Chaîne projet dans le build : `njkslucischlvjlflzrr` (sert de vérification post-build).

9 scénarios (Renault, Peugeot, Citroën, Leroy Merlin, FREE, HYDRAO, Orpi, Mamie & Co, AMParis). Chaque mission = 5 onglets élève : Travaux à rendre, Synthèse, Auto-évaluation, Activités, Journal de bord.

## 2. WORKFLOW DE BUILD ET LIVRAISON (STRICT)

Depuis `bcp/bcp-passation/` :
1. `npm install`
2. `npx tsc -b` → DOIT être clean (0 erreur).
3. `npx vite build`
4. Vérifier : `grep -rl njkslucischlvjlflzrr dist/assets/*.js` doit renvoyer un fichier.

Livrer dans `/mnt/user-data/outputs/` :
- dist zip : zipper le contenu de `dist/` (pour Netlify).
- source zip : copier `bcp/bcp-passation`, supprimer `node_modules`, `dist`, `.git`, `gen-*.cjs`, `tsconfig.app.tsbuildinfo` ; dans `public/docs/` ne garder que les images de la mission concernée. Viser < 100 fichiers. Re-vérifier le rebuild dans une copie `verify_` (npm install + vite build + grep Supabase) AVANT de zipper.
- Word docs (seulement si une mission est (re)construite) : 3 fichiers via `gen-hN.cjs` (lib `docx`) : fiche élève, corrigé, fiche déroulement.

Livrer avec `present_files`. Puis résumé 3-5 lignes + phrase de déploiement.
Ne jamais toucher `rollupOptions: { treeshake: false }` dans `vite.config.ts`.

## 3. FICHIERS CLÉS

- `src/data/contenus.ts` : TOUT le contenu des missions. Missions = constantes (ex. HYDRAO_M6) enregistrées dans l'objet CONTENUS par clé `scenario-mN` (ex. 'hydrao-m6').
- `src/data/schema.ts` : SCENARIOS, missions, ONGLETS, ONGLETS_PAR_ID, COULEUR_PROF, OngletId.
- `src/components/mission/OngletTravaux.tsx` : rendu documents riches (docRiche) + annexes (dispatcher par `annexe.type`). On y ajoute les nouveaux types d'annexes.
- `src/components/mission/OngletSynthese.tsx`, `OngletAutoEval.tsx`, `OngletActivites.tsx`, `OngletJournal.tsx`.
- `src/pages/etudiant/Mission.tsx` : page élève d'une mission (verrouillage par élève).
- `src/pages/enseignant/AccueilEnseignant.tsx` : pavés tableau de bord prof.
- `src/app/router.tsx` : routes.
- `src/lib/` : deverrouillage.ts, listeEleves.ts, enseignant.ts, classes.ts, brouillon.ts (autosave), auth.tsx.

Ajouter une annexe : 1) interface AnnexeXxx + l'ajouter au type union `Annexe` dans contenus.ts ; 2) composant XxxVue dans OngletTravaux.tsx ; 3) le brancher dans le dispatcher.
Couleur saisie élève : bleu foncé #1D4ED8 (motif `verrouille ? '#6B7280' : '#1D4ED8'`).

## 4. SUPABASE — CRUCIAL

Netlify et GitHub ne modifient JAMAIS la base. Seul Supabase gère les tables. Chaque fonctionnalité nécessitant une colonne/table crée un `migration-*.sql` que J.M. exécute dans Supabase (SQL Editor > New query > coller > Run).

Symptômes de migration non exécutée (code bon, base pas à jour) :
- « Could not find the 'X' column ... schema cache » → migration pas passée.
- « new row violates row-level security policy » → RLS activée : la désactiver.
- « violates foreign key constraint profiles_id_fkey » → contrainte FK sur profiles : la retirer.
Toujours faire remonter les erreurs (libs renvoient `{ erreur }`, UI fait `alert`). Pas d'échec silencieux.

Migrations dans le zip (racine de bcp-passation) :
- migration-brouillons.sql — autosave.
- migration-deverrouillage-eleve.sql — colonne etudiant_id + index unique (mission_id,onglet_id,etudiant_id) NULLS NOT DISTINCT.
- migration-notes-eleves.sql — colonnes ordre/bareme/activite_liee_mission/activite_liee_id/created_at sur colonnes_notes ; manuel sur profiles.
- migration-rls-notes.sql — désactive RLS sur profiles, colonnes_notes, notes_eleves, appels, deverrouillages_onglets.
- migration-eleve-manuel-fk.sql — retire les FK de profiles (élèves manuels sans compte auth).
- migration-classes-groupes.sql — tables classes, groupes, eleves_groupes + colonne profiles.classe_id.

État confirmé côté J.M. :
- FAITES : migration-notes-eleves.sql, migration-rls-notes.sql.
- À FAIRE PAR J.M. (lui rappeler) : migration-eleve-manuel-fk.sql, migration-deverrouillage-eleve.sql (si pas déjà fait), migration-classes-groupes.sql.

## 5. DÉJÀ FAIT (ne pas refaire)

Missions construites : Renault M1–M8, Citroën M1, Peugeot M1–M13, Leroy Merlin M1–M5, FREE M1–M5, Mamie & Co M8, HYDRAO M1–M7.
Corrections récentes : FREE M5 (boutons Quizinière retirés annexes 5/6) ; HYDRAO M7 (question 5 replacée au-dessus de l'annexe 5) ; Renault M4 Q1 (légende O/F/A/CM) ; Renault M5 doc 2 (Zoé 2014/2015 → 2023/2024).
HYDRAO M6 : construite (FAQ à onglets faqOnglets/FaqOngletsInline ; annexe 1 `faqreponses` = menu rubrique + réponse ; annexe 2 `savprisencharge` ; annexe 3 mail ; annexe 4 lien/QR supprimée).

Système enseignant :
- Déverrouillage par élève : option A (individuel prime sur global), défaut = tout VERROUILLÉ, Journal toujours ouvert, bouton « Tout verrouiller (tous les scénarios) ». deverrouillage.ts + Deverrouillage.tsx.
- Liste des élèves (ListeEleves.tsx + listeEleves.ts) : Appel (par date) + Notes. Colonnes robustes (barème 20 ou 10). Colonne liable à une activité auto (quiz/glisser/synthese) → import auto au chargement + bouton « Rafraîchir les scores ». Ajout élève manuel (prénom+nom+email). Suppression élève/colonne avec confirmation.
- Classes + Groupes (ClassesGroupes.tsx + classes.ts) : pavé « Classes et groupes » ; CRUD classes et groupes (groupe rattaché à UNE classe) ; élève → 1 classe + plusieurs groupes ; menu classe à l'acceptation d'inscription (Inscriptions.tsx) ; filtres classe/groupe : Appel (classe+groupe), Notes (classe seulement), Déverrouillage (classe). Les groupes filtrent Appel + missions/déverrouillage, PAS les notes.

Autosave (brouillon.ts) : localStorage instantané + écriture Supabase debouncée ~800 ms + flush au changement d'onglet/fermeture/arrière-plan via useFlushBrouillon. Présent sur les 5 onglets (trou OngletActivites corrigé).
Couleur bleue de saisie : #1D4ED8 partout.

## 6. À FAIRE — CHANTIER B : MOTS DE PASSE (prochaine tâche, PAS commencée)

Décisions déjà validées (NE PAS reposer les questions) :

1. Espace « Comptes élèves » : nouveau pavé tableau de bord (AccueilEnseignant.tsx + nouvelle page + route router.tsx). Affiche par élève : nom, prénom, email. Pour les élèves MANUELS uniquement : afficher aussi un mot de passe simple visible (choisi par J.M.). Les mots de passe des comptes Auth normaux sont chiffrés et NON lisibles — l'expliquer, ne pas prétendre les afficher.

2. Lien « Mot de passe oublié » sur la page de connexion élève (src/pages/etudiant/ — page login élève, cf. « Espace élève »). Utiliser `supabase.auth.resetPasswordForEmail(email)`. Prévoir une page/route de redéfinition (`supabase.auth.updateUser({ password })`). Condition : envoi d'emails activé dans Supabase + vrai email élève. Les élèves TEST ont de faux emails (lien ne marchera pas pour eux, normal) ; vrais élèves = vrais emails en septembre.

3. Bouton « Réinitialiser » côté prof (OPTIONNEL, livré séparément) : nécessite la clé service_role Supabase, qui NE DOIT JAMAIS aller dans le front (faille totale). Solution propre = Edge Function Supabase qui détient la clé côté serveur, appelée par le bouton. Fournir le fichier de la fonction + marche à suivre pour la déployer. NE PAS mettre service_role dans le front.

Garantie à redonner à J.M. : réinitialiser/changer un mot de passe ne supprime JAMAIS le travail de l'élève (travail rattaché à l'id du profil, pas au mot de passe).

Migration éventuelle : si mot de passe simple stocké pour élèves manuels, ajouter colonne `mdp_simple text` sur profiles via un nouveau migration-comptes-eleves.sql (RLS déjà désactivée sur profiles).

Livrer chantier B : dist zip + source zip + SQL, et séparément le fichier Edge Function si J.M. veut le bouton prof.

## 7. STRUCTURE DES DONNÉES

- reponses_quiz : mission_id, activite_id ∈ {'quiz','glisser','synthese'}, score, bareme, etudiant_id. (import auto des notes)
- deverrouillages_onglets : scenario_id, mission_id, onglet_id, etudiant_id (nullable = global), ouvert.
- profiles : id, email, prenom, nom, role, statut ∈ {'en_attente','accepte','refuse'}, manuel, classe_id.
- classes (id, nom) ; groupes (id, classe_id, nom) ; eleves_groupes (eleve_id, groupe_id).

## 8. POUR DÉMARRER LE CHANTIER B

1. Lire cette passation en entier.
2. Confirmer à J.M. en 2-3 lignes qu'on attaque le chantier B (comptes élèves + mot de passe oublié), SANS reposer les questions déjà tranchées (section 6).
3. Coder : page « Comptes élèves » + pavé + route ; lien « Mot de passe oublié » + page de redéfinition ; (optionnel séparé) Edge Function pour le bouton prof.
4. Build (section 2), migration SQL si besoin, livrer zips + SQL, rappeler les migrations restant à exécuter (section 4).
