# Rédaction du contenu des missions — document de cadrage

## DÉMARRAGE IMMÉDIAT (à lire en premier)

Ce dépôt est une application pédagogique (PWA React + TypeScript + Vite + Supabase)
pour des élèves de Bac Pro MCV (Métiers du Commerce et de la Vente), option B.
L'application fonctionne déjà entièrement. **Le seul travail restant est de REMPLIR
LE CONTENU PÉDAGOGIQUE des missions.**

Aujourd'hui, une seule mission a du contenu : `renault-m1` (sert de modèle).
Les **56 autres missions sont vides**. L'objectif de ce projet est de rédiger leur
contenu, mission par mission, dans le fichier `src/data/contenus.ts`.

Tu ne dois RIEN redemander sur le fonctionnement de l'app : tout est ici. Quand
l'utilisateur dit « on attaque telle mission » ou « rédige le scénario X », tu
rédiges directement le contenu au bon format (décrit plus bas) et tu l'ajoutes
dans `src/data/contenus.ts`.

### Workflow de travail attendu
1. L'utilisateur indique la ou les missions à rédiger (ex : « Renault mission 2 »
   ou « tout le scénario Citroën »).
2. Tu rédiges le contenu pédagogique de chaque mission au format `ContenuMission`
   (voir plus bas), en t'inspirant du modèle `renault-m1`.
3. Tu ajoutes chaque contenu dans `src/data/contenus.ts` et tu l'enregistres dans
   le registre `CONTENUS` sous son identifiant de mission.
4. Tu construis l'application (`npm run build`) et tu livres :
   - un zip `dist` (à déployer sur Netlify par glisser-déposer),
   - un zip du code source complet (à pousser sur GitHub).

### Règles de livraison (IMPÉRATIF, l'utilisateur y tient)
- Pendant l'exécution technique (code, build, zip) : AUCUNE narration étape par
  étape. Après livraison d'un zip : résumé de 3 à 5 lignes MAXIMUM, jamais plus.
- Le fichier `.env` n'est pas dans le dépôt. Pour builder, crée-le avec :
  ```
  VITE_SUPABASE_URL=https://njkslucischlvjlflzrr.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qa3NsdWNpc2NobHZqbGZsenJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3ODA1MTgsImV4cCI6MjA5NzM1NjUxOH0.ztfcHSBVWStF3mDB106eRbWDtecptgyFrP62oWtMybU
  ```
- Build : `npm install` puis `npm run build`. Le dossier `dist/` est ce qui se
  déploie sur Netlify.

---

## CONTRAINTES DE STYLE (obligatoires sur tout le contenu)
- Pas d'emojis, pas de tirets cadratins (—), pas de puces décoratives ni symboles
  (•, ✓, ✗, →, ⭐, etc.). Tiret simple (-) seulement si indispensable.
- Pas de formules creuses type « il est important de noter », « n'hésitez pas à ».
- Ton sobre, professionnel, neutre. Vocabulaire adapté à des élèves de Bac Pro.
- Le contenu doit être pédagogiquement juste et cohérent avec le métier
  commerce-vente (option B : vente de biens et de services associés).
- Les réponses des exercices doivent être sans ambiguïté (une seule bonne réponse
  claire), car l'app corrige automatiquement par comparaison de texte.

---

## STRUCTURE D'UNE MISSION (format `ContenuMission`)

Chaque mission doit fournir un objet conforme à cette interface (définie dans
`src/data/contenus.ts`). Une mission est jugée complète quand l'élève peut
envoyer ses 6 composants : travaux, synthèse, auto-évaluation, flashcards, quiz,
glisser-déposer. Le glossaire et le journal de bord ne comptent pas dans la
progression mais le glossaire doit quand même être rempli.

```ts
interface ContenuMission {
  travaux: { consigne: string }
  synthese: {
    titre: string
    proposition: string[]      // mots/étiquettes proposés pour compléter les cases
    racine: NoeudSynthese       // arbre ; les noeuds avec texte:null sont des cases à compléter
  }
  autoEval: {
    competences: {
      id: string
      intitule: string
      indicateurs: { niveau: 'novice'|'debrouille'|'averti'|'expert'; description: string }[]
    }[]
  }
  activites: {
    glossaire: { terme: string; definition: string }[]
    flashcards: { recto: string; verso: string }[]
    quiz: QuestionQuiz[]
    glisserDeposer?: {
      consigne: string
      etiquettes: string[]
      zones: { libelle: string; etiquetteIndex: number }[]  // etiquetteIndex = bonne réponse
    }
  }
}
```

### Détail de chaque champ

**travaux.consigne** : un énoncé de travail à rédiger par l'élève, contextualisé
à l'entreprise du scénario et au thème de la mission. 3 à 6 phrases, ton
professionnel, attendu clair (ce que l'élève doit produire).

**synthese** : une carte mentale arborescente à compléter. La `racine` a un
`texte` (titre de la carte), des `enfants` qui sont des sous-thèmes (texte fixe),
et au bout, des cases à compléter (`texte: null` + `reponse: 'le mot attendu'`).
Le tableau `proposition` liste TOUS les mots attendus (et éventuellement quelques
distracteurs) que l'élève voit comme banque de mots. Chaque `reponse` doit
exactement figurer dans `proposition`. Vise 4 à 8 cases à compléter.

**autoEval** : 2 à 4 compétences liées au thème. Chacune a 4 indicateurs, un par
niveau (novice, debrouille, averti, expert), du moins maîtrisé au plus maîtrisé.
Pas de bonne/mauvaise réponse : l'élève s'auto-positionne.

**glossaire** : 3 à 6 termes clés de la mission avec leur définition. C'est de la
consultation (pas de correction). Doit être rempli quand même.

**flashcards** : 2 à 5 cartes recto (question) / verso (réponse) pour réviser.

**quiz** : 3 à 6 questions. Types disponibles :
- `{ type: 'unique', question, options: string[], bonne: number }` (une seule bonne option, index)
- `{ type: 'qcm', question, options: string[], bonnes: number[] }` (plusieurs bonnes, indices)
- `{ type: 'trous', texte, reponses: string[] }` : `{0}`, `{1}`... marquent les trous
  dans `texte` ; `reponses` donne le texte attendu pour chaque trou, dans l'ordre.
  La correction compare en minuscules sans espaces superflus : réponses courtes et
  non ambiguës.
- `{ type: 'appariement', ... }` existe mais N'EST PAS compté/corrigé proprement :
  **éviter, préférer unique / qcm / trous.**

**glisserDeposer** : une activité d'association. `etiquettes` = les étiquettes à
placer. `zones` = les emplacements ; chaque zone a un `libelle` et un
`etiquetteIndex` qui pointe vers la bonne étiquette dans `etiquettes`. L'élève
choisit une étiquette par zone via un menu déroulant. Vise 3 à 5 zones.

### Identifiants
- ID de mission = `{idScénario}-m{numéro}` (ex : `renault-m2`, `citroen-m1`).
- Les `id` internes (noeuds de synthèse, compétences) doivent être uniques DANS la
  mission. Préfixer par un code court suffit (ex : `c1`, `act-1`, `statut-1`).
- Après rédaction, enregistrer dans le registre :
  ```ts
  const CONTENUS: Record<string, ContenuMission> = {
    'renault-m1': RENAULT_M1,
    'renault-m2': RENAULT_M2,   // <- ajouter ici chaque nouvelle mission
    ...
  }
  ```

---

## LISTE COMPLÈTE DES 9 SCÉNARIOS ET 57 MISSIONS

Chaque scénario est une entreprise. `idScénario` sert à construire les ID de
mission. Couleur indiquée pour information (déjà gérée par l'app).

### renault — Renault (jaune #FFCC00) — 8 missions [renault-m1 FAIT, modèle]
1. La presentation de l'unite  *(renault-m1 — déjà rédigé, sert de modèle)*
2. La zone de chalandise
3. La prise de contact
4. La decouverte des besoins
5. Le conseil et la proposition de produit
6. Le traitement des objections liees au produit et au prix
7. La conclusion de la vente et le financement du credit
8. La vente additionnelle

### peugeot — Peugeot (vert foncé #00513B) — 13 missions
1. Le secteur de l'automobile
2. La reglementation sur les concessions automobiles
3. Les 3 principaux metiers de relation client dans une concession automobile
4. Le commercial en concession auto
5. L'analyse du CV du commercial automobile
6. La remuneration du commercial
7. Les caracteristiques techniques des vehicules
8. Le demarchage
9. Les mobiles d'achat lors de l'achat d'un vehicule
10. L'essai du vehicule d'occasion
11. Les obligations du commercial avant la vente
12. Les obligations du commercial au moment de la vente
13. L'animation et la fidelisation des clients

### orpi — Orpi (rouge #E2001A) — 4 missions
1. La phase preparatoire a la mise en oeuvre d'une action de FDRC
2. L'oral de la phase preparatoire a la mise en oeuvre de l'action de FDRC
3. La presentation de la mise en oeuvre de l'action de FDRC retenue
4. L'oral de presentation de la mise en oeuvre de l'action de FDRC retenue

### mamie-and-co — Mamie And Co (magenta #C71585) — 8 missions
1. La presentation de l'unite commerciale et de la clientele
2. Les caracteristiques du produit et les mobiles d'achat
3. La preparation des outils pour la vente
4. La prise de contact
5. La presentation du produit et l'argumentation
6. La commande, les modalites de reglement et de livraison
7. Le traitement des reclamations client
8. Les differents types de relance client

### leroy-merlin — Leroy Merlin (vert #7AB51D) — 5 missions
1. La presentation de l'unite commerciale et de son marche
2. La recherche des besoins et la proposition de produit
3. S'assurer de la disponibilite du produit et faire de la vente
4. L'accord du client, les modalites de livraison et la prise de conge
5. Selectionner le prestataire le plus adapte, suivre l'execution du service et rendre compte

### hydrao — Hydrao (bleu #0090D4) — 7 missions
1. La presentation de l'unite commerciale et de la clientele
2. La participation a une operation de prospection
3. Les caracteristiques du produit et l'argumentation
4. La garantie legale de conformite et l'extension de garantie
5. La reponse aux objections sur le produit et sur le prix
6. Le traitement des reclamations et le service apres-vente
7. Collecter les informations, mesurer et analyser la satisfaction client

### free — Free (rouge #CD1F2D) — 5 missions
1. La presentation de l'unite commerciale et de la clientele
2. Le traitement de la reclamation en reception d'appel
3. Les caracteristiques du produit et l'argumentation
4. Le traitement de la reclamation en reception d'appel et la vente au rebond
5. La satisfaction et la fidelisation du client

### citroen — Citroen (violet #6E2C91) — 3 missions
1. La presentation de l'entreprise Citroen
2. Le processus d'achat chez Citroen
3. Le suivi de la commande et les informations sur les conditions de livraison

### amparis — AMParis (vert #1B6B3A) — 4 missions
1. La presentation de l'unite commerciale et de la clientele
2. Les recherches et l'exploitation d'information
3. La preparation de l'operation de prospection
4. La realisation de l'operation de prospection et ses resultats

**Total : 57 missions, dont 1 faite (renault-m1) et 56 à rédiger.**

---

## EXEMPLE COMPLET DE RÉFÉRENCE (renault-m1)

Le contenu ci-dessous est déjà dans `src/data/contenus.ts`. Il montre le niveau
de détail, le ton, et le format attendu pour CHAQUE mission. À imiter.

```ts
const RENAULT_M1: ContenuMission = {
  travaux: {
    consigne:
      "A partir des informations sur la concession Renault de votre secteur, rédiger une présentation structurée de l'unité commerciale. Indiquer la forme juridique, la position dans le réseau de la marque, les activités proposées (vente de véhicules neufs et d'occasion, atelier, financement), la zone géographique couverte et l'organisation de l'équipe commerciale. La présentation doit tenir sur une page et adopter un ton professionnel.",
  },
  synthese: {
    titre: "Présentation de l'unité commerciale",
    proposition: ['Concessionnaire', 'Véhicules neufs', "Véhicules d'occasion", 'Atelier après-vente', 'Zone de chalandise', 'Équipe commerciale'],
    racine: {
      id: 'racine',
      texte: "L'unite commerciale Renault",
      enfants: [
        { id: 'statut', texte: 'Statut dans le réseau', enfants: [{ id: 'statut-1', texte: null, reponse: 'Concessionnaire' }] },
        { id: 'activites', texte: 'Activites', enfants: [
          { id: 'act-1', texte: null, reponse: 'Véhicules neufs' },
          { id: 'act-2', texte: null, reponse: "Véhicules d'occasion" },
          { id: 'act-3', texte: null, reponse: 'Atelier après-vente' },
        ] },
        { id: 'marche', texte: 'Marché local', enfants: [{ id: 'marche-1', texte: null, reponse: 'Zone de chalandise' }] },
        { id: 'organisation', texte: 'Organisation', enfants: [{ id: 'org-1', texte: null, reponse: 'Équipe commerciale' }] },
      ],
    },
  },
  autoEval: {
    competences: [
      { id: 'c1', intitule: "Identifier les caractéristiques de l'unité commerciale", indicateurs: [
        { niveau: 'novice', description: "Je ne sais pas décrire l'unité commerciale." },
        { niveau: 'debrouille', description: 'Je cite quelques caractéristiques sans les organiser.' },
        { niveau: 'averti', description: "Je décris l'unité de façon structurée." },
        { niveau: 'expert', description: "Je décris l'unité et je la situe dans le réseau de la marque." },
      ] },
      { id: 'c2', intitule: 'Repérer les activités proposées', indicateurs: [
        { niveau: 'novice', description: 'Je ne connais pas les activités.' },
        { niveau: 'debrouille', description: 'Je cite une ou deux activités.' },
        { niveau: 'averti', description: 'Je cite toutes les activités principales.' },
        { niveau: 'expert', description: 'Je relie chaque activité à un besoin client.' },
      ] },
    ],
  },
  activites: {
    glossaire: [
      { terme: 'Unite commerciale', definition: "Lieu physique ou virtuel où un client peut accéder à une offre de produits ou de services." },
      { terme: 'Concessionnaire', definition: "Commerçant indépendant lié à une marque par un contrat, qui vend ses produits sur un secteur défini." },
      { terme: 'Zone de chalandise', definition: "Zone géographique d'où provient la majorité de la clientèle d'un point de vente." },
    ],
    flashcards: [
      { recto: "Qu'est-ce qu'une unité commerciale ?", verso: "Un lieu, physique ou virtuel, donnant accès à une offre de produits ou services." },
      { recto: 'Quel est le statut du point de vente Renault local ?', verso: 'Concessionnaire lié à la marque par un contrat.' },
    ],
    quiz: [
      { type: 'unique', question: "Quel terme désigne le lien entre la concession et la marque Renault ?", options: ['Un contrat de concession', 'Une location simple', 'Une franchise alimentaire'], bonne: 0 },
      { type: 'qcm', question: 'Quelles activités trouve-t-on dans une concession ?', options: ['Vente de véhicules neufs', "Vente de véhicules d'occasion", 'Atelier après-vente', 'Production de pneumatiques'], bonnes: [0, 1, 2] },
      { type: 'trous', texte: "La {0} est la zone d'où provient la majorité de la {1} du point de vente.", reponses: ['zone de chalandise', 'clientele'] },
    ],
    glisserDeposer: {
      consigne: 'Associer chaque élément à la bonne catégorie.',
      etiquettes: ['Vente VN', 'Vente VO', 'Atelier'],
      zones: [
        { libelle: 'Véhicules neufs', etiquetteIndex: 0 },
        { libelle: "Véhicules d'occasion", etiquetteIndex: 1 },
        { libelle: 'Réparation et entretien', etiquetteIndex: 2 },
      ],
    },
  },
}
```

---

## OÙ TROUVER QUOI DANS LE CODE
- `src/data/schema.ts` : définition des 9 scénarios et de leurs missions (titres,
  ID, couleurs). NE PAS changer les titres ni les ID sans raison.
- `src/data/contenus.ts` : LE fichier à remplir. Interfaces + contenus + registre
  `CONTENUS`.
- `src/components/mission/Onglet*.tsx` : affichage côté élève de chaque onglet
  (déjà fait, ne pas toucher sauf besoin réel).
- `src/pages/enseignant/Travaux.tsx` : le prof voit les réponses des 6 composants
  avec correction automatique (déjà fait).
- L'app gère déjà : envoi + verrouillage des activités, présence temps réel,
  progression en camembert (6 composants), PWA installable avec mise à jour auto.

## RAPPEL FINAL
Le travail = produire du contenu pédagogique de qualité pour 56 missions, au
format ci-dessus, dans `src/data/contenus.ts`. Rien d'autre n'est à reconstruire.
Avance scénario par scénario ou mission par mission selon ce que demande
l'utilisateur, livre un zip `dist` + un zip source à chaque lot.
