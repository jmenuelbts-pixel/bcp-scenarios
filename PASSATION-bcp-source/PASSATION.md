# PASSATION — Projet BCP Scénarios (Bac Pro MCV vente)

Ce fichier dit à la prochaine instance de Claude **exactement** où on s'est arrêté, quoi faire et comment. À lire en entier avant d'agir. Ne pose aucune question à l'utilisateur : tout est ici.

---

## 0. CE QUE TU DOIS FAIRE EN PREMIER (obligatoire)

1. L'utilisateur va te fournir un zip `bcp-source-*.zip`. Décompresse-le dans `/home/claude/bcp`.
   ```bash
   mkdir -p /home/claude/bcp && cd /home/claude/bcp && unzip -oq /mnt/user-data/uploads/bcp-source-*.zip -d .
   npm install 2>&1 | tail -2     # réinstalle les deps si besoin
   ```
2. Vérifie que ça compile : `npx tsc -b` (doit ne rien afficher) puis `npm run build` (doit finir par `built`).
3. Lis la section « TÂCHE EN COURS » ci-dessous : c'est la seule chose à faire.

---

## 1. CONTEXTE PROJET (résumé)

- App React + TypeScript + Vite + Supabase. Fiches pédagogiques interactives de vente (Bac Pro MCV).
- GitHub : `jmenuelbts-pixel/bcp-scenarios`. Netlify : `harmonious-sunflower-1714be.netlify.app` (déploiement **manuel** par drag-and-drop du dossier `dist`).
- Cloné dans `/home/claude/bcp`.
- **9 scénarios d'entreprise**, chacun en plusieurs missions. Chaque mission a 5 onglets : Travaux (fiche élève), Synthèse, Auto-évaluation, Activités (glossaire/flashcards/quiz/glisser-déposer), Déroulement (auto-généré pour le prof).

### Règles ABSOLUES de l'utilisateur (J.M., prof de vente) — à respecter TOUJOURS
- Reproduire les documents **au mot près** (ne rien résumer, ne rien enlever ; corriger seulement les vraies fautes/formulations ratées). Les élèves doivent CHERCHER, pas recopier la réponse.
- Documents = **vraies pages web riches** avec images d'origine, logo, habillage `pageWeb`, icônes. Pas de documents tristes sans relief.
- Annexes = **vrais logiciels professionnels** (pas de simples rectangles/cadres). On prépare à l'insertion pro. Ex : fiche client logiciel, planning logiciel, configurateur, bon de commande logiciel, mail Gmail, personnage + bulle…
- Reprendre les **images d'origine** des documents (les extraire des .docx/.pdf fournis).
- Chaque entreprise/exercice fictif = **nom différent**, jamais réutilisé.
- **Ne pas raconter ce qu'on fait**. Livrer directement : zip dist + zip source + 2 Word (fiche élève + corrigé). Après livraison : résumé 3-5 lignes max.
- Vérifier la **cohérence** exercices ↔ fiche élève ↔ corrigé AVANT de coder.
- Couleur par scénario (voir `src/data/schema.ts`). **Leroy Merlin = vert `#7AB51D`**.

### Fix Supabase (déjà en place, ne pas casser)
URL + clé en dur en fallback dans `src/lib/supabase.ts` :
- URL : `https://njkslucischlvjlflzrr.supabase.co`
- Le bundle DOIT contenir la chaîne `njkslucischlvjlflzrr` (vérification systématique après build).

---

## 2. ARCHITECTURE TECHNIQUE (où est quoi)

- `src/data/contenus.ts` — **fichier central**. Contient :
  - Les interfaces TypeScript des annexes + l'union `Annexe`.
  - L'interface `BlocDocumentTexte` (un document = liste de blocs).
  - Les interfaces `QuestionTravaux`, `ActiviteTravaux`, `ContenuMission`.
  - **Une constante par mission** (ex `LEROY_MERLIN_M5`).
  - À la fin, le registre `const CONTENUS: Record<string, ContenuMission> = { ... }` : toute mission doit y être enregistrée (ex `'leroy-merlin-m5': LEROY_MERLIN_M5,`).
  - La fonction `construireDeroule()` qui auto-génère la fiche de déroulement prof à partir de la mission. **Rien à faire** : elle marche pour toute mission enregistrée.
- `src/components/mission/OngletTravaux.tsx` — **le rendu** de la fiche élève.
  - `DocumentTexteVue` mappe chaque champ d'un bloc. **RÈGLE PIÈGE** : tout nouveau champ de bloc doit être (a) rendu ET (b) ajouté à la longue ligne `const contenu = blocs.filter(b => ...)` (le `!b.monChamp`), sinon le bloc est masqué.
  - Une fonction `rendreXxx` par type d'annexe + un dispatch dans `rendreAnnexe`.
  - Rendu du **contexte d'activité** et du **contexte avant question** (voir tâche en cours).
- `src/data/schema.ts` — liste des scénarios (id, couleur, niveau). `NiveauCompetence = 'novice'|'debrouille'|'averti'|'expert'`.
- `vite.config.ts` — **NE JAMAIS TOUCHER** `treeshake: false` (corrige un bug de tree-shaking Vite/rolldown).
- `public/docs/<scenario>-mX/` — images des documents de chaque mission.
- `gen-word-<scenario>-mX.cjs` — un script Node par mission qui génère les 2 Word (fiche élève + corrigé).

### Types d'annexes déjà créés (réutilisables — NE PAS recréer)
`fichesignaletique`, `reformulation`, `ficheappel` (sections type CROC/QQCCP), `grille` (avec `prerempli?`, `largeurs?`, `reponseMultiligne?`, `lignesReponse?`), `soncase`, `casesservices`, `simulateur` (questionnaire séquentiel configurable via `enteteTitre`/`accrocheTitre`/`libelleEtape`/`resultatTitreOk`…), `catalogue`, `sms`, `tableau`, `clientele`, `concurrents`, `questionsreponses`, `freins`, `ficheclient` (logiciel FICHE CLIENT bleu marine), `planning` (calendrier logiciel jours×créneaux), `boncommande` (logiciel), `etapeslivraison` (frise OU schéma étiquettes via `schema`), `bulle` (personnage + bulle de dialogue saisissable), `mail` (composer Gmail éditable), `maillecture` (mail lu).

### Champs de bloc document déjà créés (réutilisables)
`pageWeb`, `intertitre`, `paragraphes`, `puces`, `tableau`, `dialogue`, `image`, `galerieProduits` (cartes produit marchandes), `etapesVisuelles` (cartes numérotées + flèches), `offresPrestation` (cartes offres façon Leroy Merlin), `mailLecture` (mail Gmail dans le flux), `logoEntete` (logo en haut à droite d'un bloc, ex note interne)… (liste complète dans l'interface `BlocDocumentTexte`).

---

## 3. WORKFLOW BUILD / LIVRAISON (à suivre à chaque mission)

```bash
cd /home/claude/bcp
npx tsc -b 2>&1 | tail            # DOIT être vide
rm -rf dist && npm run build 2>&1 | grep -E "built|error" | tail -1
# vérifier le bundle :
node -e 'const fs=require("fs");let u=false;for(const x of require("child_process").execSync("ls dist/assets/*.js").toString().trim().split("\n")){const js=fs.readFileSync(x,"utf8");if(js.includes("njkslucischlvjlflzrr"))u=true}console.log("URL+KEY:",u)'
# Word :
node gen-word-<scenario>-mX.cjs
cd /mnt/skills/public/docx && python scripts/office/validate.py "/mnt/user-data/outputs/<fichier>.docx"   # pour chaque docx
```

### Zips à livrer
```bash
# DIST (pour Netlify) :
cd /home/claude/bcp/dist && rm -f /mnt/user-data/outputs/bcp-dist-*.zip && zip -rq /mnt/user-data/outputs/bcp-dist-<scenario>-mX.zip .

# SOURCE (pour GitHub) — n'inclure QUE src/, les gen-word-*.cjs, et public/docs/<scenario>-m1..mX
# (PAS tout public/, GitHub bloque le drag-and-drop au-dessus de 100 fichiers)
rm -rf /tmp/srcz && mkdir -p /tmp/srcz && cd /tmp/srcz
cp -r /home/claude/bcp/src src
cp /home/claude/bcp/gen-word-<scenario>-m*.cjs .
mkdir -p public/docs && for d in m1 m2 ... ; do cp -r /home/claude/bcp/public/docs/<scenario>-$d public/docs/<scenario>-$d; done
rm -f /mnt/user-data/outputs/bcp-source-*.zip && zip -rq /mnt/user-data/outputs/bcp-source-<scenario>-mX.zip .
find . -type f | wc -l   # DOIT être < 100
```
Puis `present_files` sur les 4 fichiers (dist, source, 2 Word) + résumé 3-5 lignes.

### Images : extraction depuis les docx/pdf
```bash
# d'un docx : unzip -oq fichier.docx -d /tmp/x ; les images sont dans /tmp/x/word/media/
# d'un pdf : pdftoppm -jpeg -r 150 fichier.pdf prefixe ; puis crop avec PIL (Image.open(...).crop((x1,y1,x2,y2)).save(...))
```

---

## 4. ÉTAT D'AVANCEMENT (au moment de la passation)

### Scénario Leroy Merlin (vert #7AB51D) — **M1 à M5 TERMINÉES et livrées.**
- M1 « Présentation de l'unité commerciale et de son marché » (C.1.1).
- M2 « Recherche des besoins et proposition produit » (C.1.2) — configurateur dressing 15 questions → réf 83299641 / 1492,86 €.
- M3 « Disponibilité produit + vente additionnelle » (C.1.2) — galerie dressings photos, fiche client logiciel, activités renumérotées 1-2-3-4.
- M4 « Accord client, livraison, prise de congé » (C.1.3) — planning logiciel Avril/Mai, bon de commande N°2535753, personnages+bulles (annexes 1/6/9), schéma étapes (annexe 5), SMS.
- M5 « Sélectionner le prestataire, suivre, rendre compte » (C.2.2) — cartes offres, mails Gmail, liste artisans CRM, CROC, artisan retenu = Installateurs 2000.

### Autres scénarios DÉJÀ présents dans le code (faits avant cette série)
Renault (M1-M8), Citroën (M1-M3), AMParis (M1-M4), Orpi (M1-M4), Free (M1-M5). **Ne pas y toucher sauf pour la tâche en cours.**

---

## 5. ⚠️ TÂCHE EN COURS À TERMINER (priorité absolue)

### Le problème
Dans les fiches élève d'origine, **chaque activité commence par une mise en situation (contextualisation) en italique** juste sous le titre « Activité X ». Parfois il y a aussi une contextualisation **intercalée entre deux questions**. Ces textes situent l'élève dans le scénario.

L'app ne les affichait nulle part. **La brique technique a été ajoutée** (faite, déployée) :
- `ActiviteTravaux` a un champ optionnel **`contexte?: string`** → rendu en encadré italique sous le titre, **dans la couleur de la mission** (ex vert pour Leroy Merlin).
- `QuestionTravaux` a un champ optionnel **`contexteAvant?: string`** → rendu en encadré italique juste avant la question (pour les mises en situation intercalées).
- Le rendu est dans `OngletTravaux.tsx` (encadré `border: 2px solid ${couleur}`, fond `${couleur}14`, texte italique). **Rien à coder côté technique, c'est fait.**

### Ce qui a déjà été REMPLI
- **Leroy Merlin M3, M4, M5** : contextes par activité + intercalés ajoutés (dans `contenus.ts` ET dans les `gen-word-leroy-m3/4/5.cjs`).
- Leroy Merlin M1 et M2 : **pas de contexte par activité dans leurs fiches d'origine** → rien à ajouter (vérifié).

### Ce qu'il RESTE À FAIRE — remplir les `contexte:` / `contexteAvant:` pour TOUS les autres scénarios
Aucun des autres scénarios n'a encore ses contextes d'activité (ils n'ont que le `contexte:` GLOBAL de `travaux`, ce qui est différent). À compléter, **scénario par scénario, mission par mission**, en recopiant **au mot près** le texte de mise en situation depuis les fiches élève d'origine :

| Scénario | Missions | Action |
|---|---|---|
| Renault | M1-M8 | ajouter `contexte:` à chaque activité (+ `contexteAvant:` si intercalé) |
| Citroën | M1-M3 | idem |
| AMParis | M1-M4 | idem |
| Orpi | M1-M4 | idem |
| Free | M1-M5 | idem |

**Comment faire pour chaque mission :**
1. Demander/ouvrir la **fiche élève .docx** d'origine du scénario (l'utilisateur les a déjà fournies dans des conversations précédentes ; s'il ne les redonne pas, lui demander UNIQUEMENT le(s) docx fiche élève manquant(s)).
2. Extraire le texte : `cd /mnt/skills/public/docx && extract-text "/mnt/user-data/uploads/<fiche>.docx"`.
3. Repérer, sous chaque « Activité X – … », le **paragraphe de mise en situation** qui suit (souvent en italique dans le doc).
4. Dans `src/data/contenus.ts`, sur la constante de la mission concernée, ajouter `contexte: "…texte exact…",` juste après le `titre:` de l'activité.
5. Si une mise en situation est **entre deux questions**, l'ajouter en `contexteAvant: "…"` sur la `QuestionTravaux` qui la suit.
6. Mettre aussi le texte dans le `gen-word-<scenario>-mX.cjs` correspondant : un `P("…", { it: true })` juste après le `H('Activité X …')`.
7. Build + vérif + zips + Word + `present_files` (workflow section 3).

**Style des contextes Word** : `P("texte", { it: true })` (italique), placé immédiatement après le titre d'activité.

### Exemple concret déjà en place (à imiter)
Dans `LEROY_MERLIN_M4`, activité 2 :
```ts
{
  titre: 'Activité 2 — Les modalités et le suivi de la livraison',
  contexte: "Nous sommes le 8 avril 202N et Mme et M. Sankouraga ont formalisé leur accord en s'engageant sur le bon de commande que vous leur avez proposé. Vous leur expliquez comment suivre l'évolution de la livraison et comment celle-ci se passera.",
  questions: [ ... ],
}
```
Et dans `LEROY_MERLIN_M5`, contexte intercalé :
```ts
{ numero: 7, consigne: "…", annexeId: 'annexe7',
  contexteAvant: "Vous n'avez pas réussi à joindre directement le couple par téléphone. Vous avez laissé un message à Mme Sankouraga sur son smartphone et elle vous a répondu sur votre mail dont l'adresse est (conseillerventestagiaire@leroymerlin.fr)." },
```

---

## 6. APRÈS LA TÂCHE EN COURS — suite logique du projet
Une fois tous les contextes ajoutés à tous les scénarios :
- **Citroën M2+** était en attente de fichiers source (M1 seul livré dans une session ancienne — à vérifier avec l'utilisateur s'il veut les suivantes).
- Continuer les nouvelles missions/scénarios que l'utilisateur demandera, en respectant strictement les règles de la section 1.

---

## 7. RAPPELS IMPORTANTS SUR LA PERSONNE
- Communication directe et exigeante : signale les problèmes franchement, attend des corrections immédiates et internalisées.
- Déteste les écrits « qui font IA ». Style sobre, professionnel.
- **Ne jamais écrire son nom complet, prénom ou date de naissance.** Utiliser « J.M. » si besoin (mais en général ne pas le mentionner).
- Ne pas raconter le déroulé technique. Livrer, puis résumer en 3-5 lignes.
- Il cumule vers ~100 messages par conversation puis change de fil : d'où ce fichier.
