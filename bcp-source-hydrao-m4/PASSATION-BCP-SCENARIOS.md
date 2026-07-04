# PASSATION - BCP Scénarios (Bac Pro MCV) - Scénario PEUGEOT

Document de reprise pour la prochaine conversation. Lis-le en entier avant toute action.
Ne pose AUCUNE question à l'utilisateur : tout est ici.

---

## 1. CE QU'EST LE PROJET

"BCP Scénarios" : application web pédagogique React/TypeScript/Vite/Supabase pour élèves de Bac Pro MCV (Métiers du Commerce et de la Vente). Chaque "mission" est un cas d'entreprise avec documents, annexes à compléter, corrigé, synthèse, auto-évaluation, glossaire, flashcards, quiz, glisser-déposer.

- Repo GitHub : `jmenuelbts-pixel/bcp-scenarios`
- Netlify : `harmonious-sunflower-1714be.netlify.app`
- Chaîne Supabase (DOIT apparaître dans le JS du build) : `njkslucischlvjlflzrr`

## 2. LIVRABLES STANDARD PAR MISSION

Pour chaque mission, on produit TOUJOURS 5 fichiers :
1. `bcp-dist-[scenario]-[mission].zip` -> à déployer sur Netlify (glisser dans Netlify)
2. `bcp-source-[scenario]-[mission].zip` -> à envoyer sur GitHub (doit rester < 100 fichiers)
3. `PEUGEOT-[Mission]-fiche-eleve.docx`
4. `PEUGEOT-[Mission]-corrige.docx`
5. `PEUGEOT-[Mission]-fiche-deroulement.docx`

## 3. OÙ ON EN EST (état au moment de la passation)

Scénario PEUGEOT. Missions livrées et intégrées dans `contenus.ts` :
- M8 (démarchage), M9 (mobiles d'achat SONCASE + CAP), M10 (essai du véhicule), M11 (obligations avant la vente : affichage + information), M12 (bon de commande + pratiques illégales), M13 (JPO + fidélisation).
- Plus toutes les missions antérieures : Renault M1-M8, Peugeot M1-M7, Citroën, Leroy Merlin, Free, AMParis, Orpi.

**La dernière mission terminée et livrée est M13.** Registre `CONTENUS` dans `contenus.ts` contient les entrées jusqu'à `'peugeot-m13'`.

**PROCHAINE MISSION À FAIRE : M14** (l'utilisateur fournira les docx élève + corrigé + les PDF/captures des documents au début de la nouvelle conversation).

## 4. RÈGLES ABSOLUES DE L'UTILISATEUR (à respecter sans exception)

- Confidentialité : ne JAMAIS écrire le nom/prénom complet de l'utilisateur. Utiliser seulement les initiales J.M.
- NE PAS raconter ce qu'on fait ("ne raconte pas ta vie"). Exécuter, puis livrer. Résumé final de 3-5 lignes max.
- Reproduire les documents AU MOT PRÈS (verbatim). Corriger seulement les vraies fautes. N'enlever AUCUNE information (sinon l'élève recopie la réponse sans chercher : non pédagogique).
- Documents = vraies pages internet riches : habillage navigateur (pageWeb), logo, intertitres, images, icônes. JAMAIS de simples rectangles ternes.
- Les annexes doivent ressembler à un vrai logiciel professionnel (préparation à l'insertion pro), pas à de simples cases.
- Quand l'utilisateur fournit des captures d'écran d'images : utiliser UNIQUEMENT ses captures pour ces images (ne pas réextraire du PDF si les captures sont fournies).
- Quand c'est du texte : le réécrire soi-même en gardant EXACTEMENT la même forme (chiffres, puces, étoiles, ronds, couleurs, disposition) que l'original.
- Chaque mission a OBLIGATOIREMENT : 10 flashcards (notées), quiz de 10 questions à 4 propositions (sur la mission uniquement), 10 items de glisser-déposer (sur la mission uniquement), une fiche de déroulement.
- Tuteur/contexte récurrents : M. Paul Auchon, concession "ConcessionCollet" (Paris 17e). Directeur : M. Collet (jerome.collet@concessionpeugeot.fr). Mail élève : stagiaire@concessionpeugeot.fr.
- Pas d'em dash, pas de formulations IA ("il est important de noter", etc.).
- Audios/vidéos : boutons discrets vers les liens Google Drive fournis par l'utilisateur (pas d'intégration de fichiers locaux).

## 5. WORKFLOW EXACT POUR CRÉER UNE NOUVELLE MISSION

Le projet buildable complet est dans ce zip, dossier `bcp/`. Étapes :

### a) Décompresser et préparer
```
cd /home/claude
unzip -q PASSATION-bcp-projet.zip     # crée le dossier bcp/
cd bcp
npm install                           # installe les dépendances
```

### b) Lire les documents fournis par l'utilisateur
- Lire `PEUGEOT_-_M14_R.docx` (fiche élève) et `Corrigé_-_PEUGEOT_-_M14.docx` avec python-docx.
- Extraire le texte AVEC le surlignage jaune (highlight_color) pour repérer les blocs "INDICATIONS" / "INSTRUCTION".
- Repérer les liens Drive (audios/vidéos) dans le texte.
- Les PDF de documents : `pdftoppm -png -r 200 fichier.pdf sortie` pour extraire les images.

Faire d'abord les 3 vérifications que l'utilisateur demande toujours au début :
1. Cohérence des exercices entre eux.
2. Cohérence entre fiche élève et corrigé.
3. Lister tout ce qui est en jaune commençant par "INDICATIONS" / "INSTRUCTION".
Puis créer directement (ne pas attendre de réponse si l'utilisateur a dit "crée").

### c) Écrire le bloc de la mission
- Fichier concerné : `bcp/src/data/contenus.ts` (~15000 lignes).
- Structure d'un `ContenuMission` : voir la mission M13 (chercher `const PEUGEOT_M13`) comme modèle le plus complet et récent.
- Un ContenuMission a : `travaux` (consigne, contexte, audioLien optionnel, documents[], objectifs[], competence, activites[], annexes[]), `corrige` (questions[]), `synthese`, `autoEval`, `activites` (glossaire, flashcards, quiz, glisserDeposer).
- Insérer le nouveau bloc `const PEUGEOT_M14: ContenuMission = {...}` juste avant la ligne `const CONTENUS: Record<string, ContenuMission> = {`.
- Ajouter l'entrée registre `'peugeot-m14': PEUGEOT_M14,` juste après `'peugeot-m13': PEUGEOT_M13,`.

### d) Types de documents disponibles (blocs de `documents[].texte`)
Déjà codés dans `OngletTravaux.tsx`, réutilisables :
- `pageWeb: true` -> habillage navigateur (points rouge/jaune/vert + barre "page internet")
- `intertitre`, `paragraphes[]`, `puces[]`, `image {src,alt,legende}`, `dialogue[]` + `audioLien` (bouton audio discret)
- `carrousel {pages[{image,alt,legende,texte[]}]}` -> multi-pages Suivant/Retour
- `fichesVehicule {carrousel:true, vehicules[]}` -> fiches véhicule en carrousel
- `bonCommandePeugeot {logo,image}` -> bon de commande officiel reproduit (spécifique M12)
- `typesQuestions: true` -> tableau types de questions (matrice ronds + étoiles) (M13)
- `themesQuestions[{theme,type}]` -> liste thèmes + type en rouge (M13)

### e) Types d'annexes disponibles (annexes[], façon logiciel)
- `grille` (colonnes[], nbLignes, prerempli[][], reponseMultiligne, lignesReponse)
- `bulle` avec `cas[{id,nom,image,temoignage[],videoLien}]` -> entretien : image + témoignage + zone de saisie + bouton vidéo (M11, M10, M12, M13)
- `mail {deParDefaut, aParDefaut}` -> vrai client mail (De/À/Objet/corps/Envoyer) (M13 annexe 3)
- `pratiques {clients[], colonnes, nomsAremplir}` -> tableau à cocher (M12 annexe 6)
- `questionnaire {nbPages, themes[], typesQuestion[]}` -> questionnaire multi-pages Google Form, 1 question/page, Suivant/Retour (M13 annexe 6)
- + beaucoup d'autres (cap, croc, planning, boncommande, organigramme, etc.) : chercher dans `OngletTravaux.tsx` la fonction `rendreAnnexe` et les `if (annexe.type === ...)`.

Si un nouveau type d'annexe/document est nécessaire : ajouter l'interface dans `contenus.ts`, l'ajouter au type union `Annexe` (ou au type bloc document), importer + dispatcher dans `OngletTravaux.tsx`, puis créer le composant de rendu. Modèle : voir comment `questionnaire` ou `pratiques` ont été ajoutés.

### f) Images
- Mettre les images dans `bcp/public/docs/peugeot-m14/`.
- Les référencer par `/docs/peugeot-m14/nom.png`.
- Logo ConcessionCollet réutilisable : `bcp/public/docs/peugeot-m12/logo-collet.png` (copier dans le dossier m14).
- Image entretien (pour annexes bulle) : `bcp/public/docs/peugeot-m12/entretien-marjorie.png`.
- Pour découper des voitures/images depuis un PDF : rendre à 200 DPI puis détecter les bandes non-blanches avec numpy (voir historique). TOUJOURS vérifier visuellement avec l'outil `view` que rien n'est coupé (l'utilisateur y tient beaucoup).

### g) Build et vérifications OBLIGATOIRES
```
cd /home/claude/bcp
npx vite build
```
Le build DOIT passer. Ne JAMAIS toucher `rollupOptions: { treeshake: false }` dans `vite.config.ts`.
Vérifier dans le dist :
```
grep -o "peugeot-m14" dist/assets/*.js | head -1        # présent
grep -o "njkslucischlvjlflzrr" dist/assets/*.js | head -1 # présent
ls dist/docs/peugeot-m14/                                 # images présentes
```

### h) Générer les 3 Word
- Modèle de script : `bcp/gen-fiche-peugeot-m13.cjs` (dans la source) ou recréer sur le même modèle avec la lib `docx`.
- Couleurs : VERT `00513B`, GRIS `F2F2F2`, ROUGE `C00000`.
- Sortie dans `/mnt/user-data/outputs/PEUGEOT-M14-*.docx`.
- La lib docx est déjà installée si on a fait `npm install` dans bcp (sinon `npm install docx` dans un dossier de travail).

### i) Fabriquer les 2 zip
```
# DIST
cd /home/claude/bcp/dist && zip -qr /mnt/user-data/outputs/bcp-dist-peugeot-m14.zip .

# SOURCE ALLÉGÉE (< 100 fichiers) : on ne garde QUE le dossier docs de la mission courante
cd /home/claude && cp -r bcp src14 && cd src14
rm -rf node_modules dist .git
find public/docs -mindepth 1 -maxdepth 1 -type d ! -name 'peugeot-m14' -exec rm -rf {} +
find . -name ".DS_Store" -delete
zip -qr /mnt/user-data/outputs/bcp-source-peugeot-m14.zip . -x "*/__MACOSX/*"
```
IMPORTANT : la source DOIT rester < 100 fichiers (GitHub via drag&drop). On supprime tous les `public/docs/peugeot-mXX` des autres missions ; on garde uniquement celui de la mission courante. Vérifier : `find src14 -type f | wc -l`.

### j) Vérifier que la source allégée build encore
```
cd /home/claude && cp -r src14 v14 && cd v14 && npm install && npx vite build
```

### k) Livrer avec present_files
Livrer : dist, source, fiche-eleve, corrige, fiche-deroulement. Résumé 3-5 lignes max.

## 6. POINTS DE VIGILANCE (erreurs déjà commises à éviter)

- Images coupées : l'utilisateur a plusieurs fois renvoyé des captures parce que les images extraites étaient tronquées. TOUJOURS vérifier chaque image avec `view` avant de livrer. Si l'utilisateur fournit des captures, les utiliser telles quelles.
- Ne pas dupliquer texte + image : si une image contient déjà du texte (ex : bloc concession), ne pas réécrire ce texte à côté.
- Respecter le nombre exact demandé (ex : "tu gardes les 6 erreurs" et non 5).
- Le titre d'une mission peut être incohérent avec le contenu (ex M10 "occasion" alors que c'est du neuf) : garder le titre de l'utilisateur, signaler juste.
- Toujours refaire les DEUX zip quand on modifie un composant (source doit contenir `contenus.ts` ET `OngletTravaux.tsx` à jour).

## 7. CONFIG TECHNIQUE (rappel)
- React 19, react-dom 19, react-router-dom 7, @supabase/supabase-js, Tailwind v4 (`@import "tailwindcss"` + plugin `@tailwindcss/vite`, PAS de postcss v3).
- `src/lib/supabase.ts` : URL + anonKey en dur (fallback) pour que la chaîne apparaisse dans le build.
- `public/_redirects` : `/* /index.html 200`.
- Build : `npx vite build`. Dossier de travail : `/home/claude/bcp`.
- Uploads utilisateur : `/mnt/user-data/uploads`. Sorties : `/mnt/user-data/outputs`.

## 8. PREMIERS GESTES DANS LA NOUVELLE CONVERSATION
1. Décompresser le projet (`unzip PASSATION-bcp-projet.zip`), `npm install`.
2. Attendre que l'utilisateur fournisse les documents de M14 (docx + PDF/captures).
3. Faire les 3 vérifications (cohérence exos, cohérence élève/corrigé, liste des jaunes "INDICATIONS").
4. Créer la mission en suivant le workflow section 5. Ne pas raconter, livrer.
