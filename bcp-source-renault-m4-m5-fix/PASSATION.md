# PASSATION — Projet "BCP Scénarios" (app pédagogique Bac Pro MCV)

Ce document permet à une nouvelle instance de reprendre le projet SANS poser de question.
Lis-le en entier avant toute action.

---

## 0. QUI EST L'UTILISATEUR / RÈGLES ABSOLUES

- L'utilisateur est un professeur (initiales **J.M.** — ne JAMAIS écrire son nom/prénom).
- Il enseigne le Bac Pro MCV (Métiers du Commerce et de la Vente).
- **Style de travail EXIGÉ (impératif, il s'agace sinon) :**
  1. **Ne PAS raconter ta vie / pas de narration d'étapes.** Tu crées directement. Après livraison : résumé de 3 à 5 lignes MAX, puis la phrase « Déploie le dist sur Netlify, pousse la source sur GitHub. »
  2. **Documents recopiés MOT POUR MOT** depuis les sources (PDF/captures). Ne rien ajouter, retrancher, reformuler. Corriger seulement fautes/incohérences manifestes. Ne jamais réduire un document à la seule réponse (l'élève doit chercher = pédagogique).
  3. **Documents = vraies pages web riches** : logo, habillage navigateur, images, icônes reproduites. Reproduire la FORME réaliste du support (billet train = site SNCF, hôtel = site de résa, itinéraire = Google Maps, fiche produit = page e-commerce, formulaire = vrai logiciel). Jamais de documents pauvres/tristes/sans image.
  4. **Annexes = vrai logiciel professionnel**, pas de simples rectangles (on prépare les élèves à l'insertion pro).
  5. Chaque mission : **10 flashcards** (notées), **10 quiz** (4 options, sur la mission), **10 glisser-déposer** (sur la mission), **1 fiche de déroulement**.
  6. Chaque exercice utilise un **nom d'entreprise fictive différent**. Pas d'em dashes (—), pas de tournures "IA".
  7. Toujours **vérifier la cohérence** des exercices entre eux, puis entre fiche élève et corrigé. Lister ce qui est surligné en jaune commençant par « INDICATIONS ».

---

## 1. CE QUE FAIT L'APP

Application React + TypeScript + Vite + Supabase + Netlify (PWA). Les élèves ouvrent une mission, lisent des **documents** (pages web riches), remplissent des **annexes** interactives, puis font **synthèse / auto-évaluation / activités** (flashcards, quiz, glisser-déposer).

- **Scénarios** = entreprises fictives (Renault, Citroën, Peugeot, Free, Leroy Merlin, Mamie & Co, Hydrao...). Chaque scénario a plusieurs missions (M1, M2...).
- Persistance des réponses élèves via Supabase (autosave).

---

## 2. OÙ ON EN EST (état à la passation)

**Scénario en cours : HYDRAO** (pommeaux de douche écologiques connectés, couleur bleu #0090D4).

- **Hydrao M1** — FAIT. Présentation unité commerciale + clientèle. 7 documents (identité, partenaires, B2B/B2C, services, produits, concurrents, équipe) + 7 annexes.
- **Hydrao M2** — FAIT. Participation à une opération de prospection. 9 documents (consignes, mails, catalogue prix, note, billet train SNCF, hôtel, itinéraire Maps, état des frais) + annexes calcul + état des frais en WIZARD Suivant/Retour + mail. Corrigé : stand 8062 €, frais 5964,60 €, budget 14026,60 €.
- **Hydrao M3** — FAIT (dernière mission livrée). Les caractéristiques du produit et l'argumentation. **4 documents** (nouvelle numérotation demandée par J.M.) :
  - Doc 1 = fiche produit web riche du pommeau Aloé (page e-commerce + tableaux caractéristiques mot pour mot + icônes services).
  - Doc 2 = page concept/pédagogie (équipe, vidéo, LED 0-40L, graphiques conso/économies) avec images découpées.
  - Doc 3 = mobiles d'achat (SONCASE).
  - Doc 4 = méthode C.A.P. + exemple.
  - Annexes 1 (technique), 2 (commerciale), 3 (psychologique SONCAS), 4 (image de marque + mobiles), 5 (CAP).
  - Corrigé exact : débit 6,6/9 L, prix 69,90 € TTC, garantie 2 ans, SONCAS, CAP.

Le scénario **Mamie & Co** est aussi complet (M1 à M8).

**SUITE PROBABLE : Hydrao M4 et suivantes** (même workflow). J.M. fournira à chaque fois : le .docx fiche élève « À compléter », le .docx corrigé, et des PDF/captures des documents sources.

---

## 3. ARCHITECTURE DU CODE (fichiers clés)

Racine du projet : ce dossier (`bcp/`).

- `src/data/contenus.ts` — **LE FICHIER CENTRAL**. Contient :
  - Les **interfaces TypeScript** des annexes (`AnnexeGrille`, `AnnexeMail`, `AnnexeCrmClients`, `AnnexeEtatFrais`, etc.) et du type union `Annexe`.
  - L'interface `BlocDocumentTexte` = les champs possibles d'un bloc de document (dont **`docRiche`**, le composant clé pour les pages web riches).
  - Une grosse constante par mission (ex. `const HYDRAO_M3: ContenuMission = {...}`).
  - Le **registre** final `const CONTENUS: Record<string, ContenuMission> = { 'hydrao-m1': HYDRAO_M1, 'hydrao-m2': HYDRAO_M2, 'hydrao-m3': HYDRAO_M3, ... }`.
- `src/data/schema.ts` — définition des **scénarios et de leurs missions** (id, nom, couleur, liste des missions). Hydrao y est déjà défini (id `hydrao`).
- `src/components/mission/OngletTravaux.tsx` — **LE RENDU**. Contient tous les composants React qui affichent documents et annexes :
  - `DocRicheVue` = rend une page web riche à partir du champ `docRiche` (barre navigateur + en-tête marque/logo/menu + sections typées).
  - `EtatFraisVue` = formulaire état des frais en **wizard** (barre de progression + boutons Retour/Suivant).
  - `CrmClientsVue`, `CatalogueProduitsVue`, `NoteDirectionVue`, `BulleConseilVue`, `MailLectureVue`, etc.
- `public/docs/[scenario]-mN/` — les **images** de chaque mission (logo, photos découpées des captures). Ex. `public/docs/hydrao-m3/`.
- `vite.config.ts` — config build. Contient `rollupOptions: { treeshake: false }` (NE PAS TOUCHER) et la limite PWA `maximumFileSizeToCacheInBytes: 5242880`.

### Les sections `docRiche` disponibles (dans l'interface, `OngletTravaux.tsx` sait toutes les rendre)
`titre`, `sousTitre`, `paragraphe`, `paragraphes`, `puces`, `image`, `fiche` (clé/valeur), `servicesIcones` (icônes SVG livraison/garantie/serviceclient/paiement), `grilleProduits`, `grillePersonnes`, `partenaires`, `article`, `tableau` (entetes + lignes), `billetTrain` (interface SNCF Connect), `resaHotel` (interface réservation hôtel), `itineraire` (interface Google Maps), `ficheProduitWeb` (fiche produit e-commerce).

→ Pour un nouveau type de document réaliste, ajoute un type à l'union `docRiche` dans `contenus.ts` PUIS son rendu dans `DocRicheVue` (OngletTravaux.tsx).

---

## 4. COMMENT AJOUTER UNE MISSION (recette exacte, ex. Hydrao M4)

1. **Lire les sources** fournies par J.M. : `pandoc`/`python-docx` pour les .docx, `pdftoppm` pour rasteriser les PDF, et regarder les captures. Extraire le contenu MOT POUR MOT. Récupérer les valeurs exactes du corrigé.
2. **Extraire les images** nécessaires (logos, photos, icônes) avec Python/PIL, en découpant proprement, vers `public/docs/hydrao-m4/`. Copier le logo Hydrao depuis une mission existante (`public/docs/hydrao-m3/logo-hydrao.png`).
3. **Écrire la constante** `const HYDRAO_M4: ContenuMission = { travaux:{...}, corrige:{...}, synthese:{...}, autoEval:{...}, activites:{...} }` dans `contenus.ts`, en s'inspirant de `HYDRAO_M3` juste au-dessus. Documents en `docRiche` (pages web riches), annexes façon logiciel.
4. **Enregistrer au registre** : ajouter `'hydrao-m4': HYDRAO_M4,` dans `CONTENUS`.
5. Vérifier que la mission existe dans `schema.ts` (sinon l'ajouter à la liste des missions du scénario hydrao).
6. **10 flashcards / 10 quiz (4 options) / 10 glisser-déposer / fiche de déroulement** — obligatoires.
7. **Compiler et builder** (voir §5).
8. **Générer les 3 Word** (fiche élève, corrigé, fiche de déroulement) avec un script `gen-h4.cjs` (voir §6).
9. **Fabriquer les 2 zip** dist + source (voir §7).
10. Livrer avec `present_files`, résumé 3-5 lignes, puis « Déploie le dist sur Netlify, pousse la source sur GitHub. »

---

## 5. BUILD (commandes exactes)

```bash
cd bcp
npm install            # node_modules se vide souvent entre sessions : réinstaller si tsc échoue
npx tsc -b             # doit finir sans erreur
npx vite build         # doit finir sans erreur (BUILD=0)
```

**Vérification obligatoire après build :** la chaîne Supabase doit apparaître dans le bundle :
```bash
grep -rl njkslucischlvjlflzrr dist/assets/*.js   # doit renvoyer un fichier
```
Si ça ne renvoie rien, le build est cassé (ne jamais livrer).

Règles build intouchables :
- `vite.config.ts` : `rollupOptions: { treeshake: false }` — NE PAS ENLEVER.
- Si erreur PWA « file exceeds 2 MiB » : la limite est déjà relevée à 5 Mo dans `vite.config.ts` (`maximumFileSizeToCacheInBytes`). Ne pas la rebaisser.

---

## 6. GÉNÉRER LES 3 WORD (docx)

Créer un script `bcp/gen-hN.cjs` avec la lib `docx` (déjà en dépendance). Modèle : chaque script exporte 3 fichiers vers `/mnt/user-data/outputs/` :
- `HYDRAO-MN-fiche-eleve.docx` (documents mot pour mot avec images + annexes vides + activités),
- `HYDRAO-MN-corrige.docx` (corrigé exact),
- `HYDRAO-MN-fiche-deroulement.docx`.

Helpers typiques : `H1/H2/H3` (titres), `P` (paragraphe), `table(cols, rows, widths)`, `imgP(path,w,h)` (image via `ImageRun`), `logo()`, `bandeau()`, `puceT()`. Reproduire les documents FIDÈLEMENT avec les images de `public/docs/hydrao-mN/`.
Lancer : `cd bcp && node gen-hN.cjs`.
(Les scripts `gen-*.cjs` sont supprimés lors du nettoyage source — les recréer au besoin.)

---

## 7. FABRIQUER LES 2 ZIP (workflow de livraison)

Depuis le dossier du projet :
```bash
# DIST (à déployer sur Netlify)
cd bcp/dist && zip -qr /mnt/user-data/outputs/bcp-dist-hydrao-mN.zip .

# SOURCE (à pousser sur GitHub) — allégée, doit rester < 100 fichiers et rebuildable
cd /home/claude && cp -r bcp src_hN && cd src_hN
rm -rf node_modules dist .git gen-*.cjs
find public/docs -mindepth 1 -maxdepth 1 -type d ! -name 'hydrao-mN' -exec rm -rf {} +   # garder UN seul dossier d'images
find . -name ".DS_Store" -delete
zip -qr /mnt/user-data/outputs/bcp-source-hydrao-mN.zip . -x "*/__MACOSX/*"
```
**Vérifier que la source rebuild** : copier la source, `npm install`, `npx vite build`, re-`grep` supabase.

⚠️ **Contrainte GitHub : garder la source SOUS 100 fichiers.** Pour ça, on ne garde dans `public/docs/` QUE le dossier d'images de la mission courante. Si beaucoup d'images font dépasser 100, réduire/fusionner les images.

---

## 8. IMPORTANT SUR CE ZIP DE PASSATION

Ce zip contient le **projet complet buildable** (`bcp/`) MAIS allégé pour rester sous 100 fichiers :
- **PAS de `node_modules`** → la nouvelle instance fait `npm install`.
- **PAS de `dist`** → elle fait `npx vite build`.
- **UN seul dossier d'images** conservé : `public/docs/hydrao-m3/` (la dernière mission). Les images des missions Hydrao M1/M2 et des autres scénarios NE SONT PAS dans ce zip (pour tenir sous 100 fichiers) : leurs contenus texte restent dans `contenus.ts`, mais si tu rebuild et déploies, seules les images présentes s'afficheront. Ce n'est pas un problème pour continuer le développement de Hydrao M4+ (tu ajoutes tes propres images).
- Si J.M. veut redéployer une ancienne mission avec ses images, il faut récupérer le dossier `public/docs/[mission]/` correspondant depuis un ancien zip source.

Le code de TOUTES les missions (texte, structures, corrigés) est intégralement présent dans `src/data/contenus.ts`.

---

## 9. CHECKLIST AVANT DE LIVRER (ne jamais sauter)
- [ ] `npx tsc -b` OK, `npx vite build` BUILD=0.
- [ ] `grep supabase` dans dist OK.
- [ ] Documents mot pour mot + images/icônes intégrées + forme réaliste.
- [ ] Annexes façon logiciel.
- [ ] 10 flashcards / 10 quiz (4 options) / 10 glisser-déposer / fiche de déroulement.
- [ ] Cohérence exercices ↔ corrigé, numérotation des documents correcte.
- [ ] Source < 100 fichiers et rebuildable.
- [ ] Livraison : `present_files` + résumé 3-5 lignes + « Déploie le dist sur Netlify, pousse la source sur GitHub. »
- [ ] Ne pas raconter ta vie.
