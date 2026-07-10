# PASSATION — BCP Scénarios

Tu reprends le développement de l'app « BCP Scénarios » de J.M., professeur de lycée professionnel (Bac Pro MCV). Lis ce fichier entièrement avant toute action. Il contient tout ce qu'il faut savoir. Ne pose aucune question déjà tranchée ici.

---

## 1. LE PROJET

App web React / TypeScript / Vite / Supabase (PWA) pour les élèves de Bac Pro MCV.

- **Netlify (prod)** : https://harmonious-sunflower-1714be.netlify.app
- **GitHub** : https://github.com/jmenuelbts-pixel/bcp-scenarios (public)
- **Supabase (projet)** : `njkslucischlvjlflzrr`
- **Copie de travail** : `/home/claude/bcp/bcp-passation`

L'app présente des missions interactives réparties sur neuf scénarios d'entreprise : Renault, Peugeot, Citroën, Leroy Merlin, FREE, HYDRAO, Orpi, Mamie & Co, AMParis.

Chaque mission comporte cinq onglets élève : Travaux, Synthèse, Auto-évaluation, Activités, Journal de bord.

**Fichiers centraux :**
- `src/data/contenus.ts` — tout le contenu des missions (environ 20 000 lignes). Documents, annexes, questions.
- `src/components/mission/OngletTravaux.tsx` — le rendu des documents et annexes.

---

## 2. RÈGLES ABSOLUES

### Vie privée
Ne jamais écrire le nom complet, le prénom ou la date de naissance de J.M. Utiliser uniquement les initiales **J.M.**

### Narration
**Ne jamais narrer pendant l'exécution.** Pas de commentaire entre les commandes, pas d'annonce de ce que tu vas faire. Tu exécutes, tu livres, puis tu écris un résumé de 3 à 5 lignes maximum.

La narration consomme le quota de conversation de J.M. et le bloque. C'est un vrai problème pour lui, pas un détail de style.

Exception unique : si tu découvres un problème qui rendrait la livraison fausse ou cassée, tu t'arrêtes et tu le dis en une phrase.

### Ne fais QUE ce qui est demandé
Aucune initiative, aucune amélioration spontanée, aucun fichier « bonus ». Chaque fichier généré inutilement fait perdre du temps et du crédit à J.M.

### Documents : jamais de PDF collé
J.M. exige que **tout document soit réécrit en HTML** dans `contenus.ts`. Il est interdit de coller une capture d'écran de PDF ou de page web comme contenu d'un document. Les images sont autorisées uniquement comme **illustrations** (photos, logos, vignettes produits), jamais comme support de texte.

Test simple : si le texte que l'élève doit lire est *dans l'image*, c'est interdit. Il faut le réécrire.

### Mot pour mot
Quand J.M. fournit un document source, le texte est repris **mot pour mot**, y compris ses coquilles éventuelles. Ne jamais reformuler ni résumer.

### Liens = documents
Règle valable pour tous les scénarios : quand un support d'origine renvoie à un « site internet 1 », « site internet 2 », etc., **chaque lien devient un document à part entière**, numéroté dans l'ordre d'apparition, mélangé avec les vrais documents. Les consignes des questions sont adaptées : « Consulter le site internet X » devient « Lire le document N ».

### Audio et vidéo
Quand le document d'origine porte une icône casque, une icône vidéo, ou la mention « OU » entre deux icônes, ajouter un bouton discret près du texte pour écouter ou regarder. Champs disponibles : `audioLien` (bloc) ou `videoLien` (dans `bulle`).

---

## 3. WORKFLOW DE BUILD ET DE LIVRAISON

Toujours dans cet ordre, depuis `/home/claude/bcp/bcp-passation` :

```
npm install
npx tsc -b        # doit être propre, zéro erreur
npx vite build    # doit réussir
grep -rl njkslucischlvjlflzrr dist/assets/*.js   # doit trouver le fichier
```

Ne jamais toucher à `rollupOptions: { treeshake: false }` dans `vite.config.ts`.

### Livraison
Trois zips dans `/mnt/user-data/outputs` :

1. `bcp-dist.zip` — le contenu du dossier `dist` (à déployer sur Netlify)
2. `bcp-source-code.zip` — la source **sans** `public/docs` (79 fichiers, passe la limite GitHub de 100)
3. `bcp-source-images.zip` — uniquement `public/docs` (à pousser séparément)

Avant de livrer, vérifier qu'une copie propre rebuild correctement.

Message de fin : « Déploie le dist sur Netlify, pousse la source sur GitHub. »

---

## 4. LES IMAGES

Le dossier `public/docs` (133 images) **n'est pas dans ce zip**, pour rester sous la limite GitHub de 100 fichiers.

**Le projet compile et build sans ce dossier.** Mais les images ne s'afficheront pas.

Pour les récupérer, télécharger l'archive du dépôt public :

```
curl -sL -o repo.zip https://codeload.github.com/jmenuelbts-pixel/bcp-scenarios/zip/refs/heads/main
unzip -q repo.zip
```

Puis copier le `public/docs` le plus complet trouvé dans l'archive vers `/home/claude/bcp/bcp-passation/public/docs`.

Le code référence 132 images. Script de contrôle :

```python
import re, os
s = open('src/data/contenus.ts', encoding='utf-8').read()
refs = sorted(set(re.findall(r"/docs/[A-Za-z0-9/_.-]+\.(?:png|jpg|jpeg|webp|gif|svg)", s)))
manq = [r for r in refs if not os.path.exists('public' + r)]
print("référencées:", len(refs), "| manquantes:", len(manq))
for m in manq: print("  MANQUE", m)
```

---

## 5. ÉTAT DES TRAVAUX

### Terminé et vérifié

**Espace professeur**
- Pavé « Comptes élèves » + page `/enseignant/comptes` : mots de passe simples visibles pour les élèves ajoutés à la main ; mots de passe chiffrés non lisibles pour les comptes Auth.
- Lien « Mot de passe oublié » sur l'espace élève + page publique `/reinitialiser` (hors gardes d'authentification).
- Edge Function optionnelle `supabase/functions/reinitialiser-mdp-eleve/index.ts` (non déployée, marche à suivre en tête du fichier).
- Tableau de bord : 10 pavés, chacun d'une couleur pastel distincte, rangés par ordre alphabétique.
- Badge rouge de messages non lus sur le pavé Messagerie.

**HYDRAO M1** — 7 documents. Les 28 images manquantes (15 portraits d'équipe, 11 vignettes produits, bandeau partenaires, bandeau services) reconstituées depuis les PDF fournis par J.M. Logo récupéré depuis une autre mission HYDRAO.

**PEUGEOT**
- M1 : planning stagiaire affiché dans le contexte (calendrier dynamique) ; doc 1 (chiffres concessionnaires) et doc 2 (M. Collet, bouton vidéo) réécrits.
- M2 : document « livre ouvert » à pages tournables, 5 rubriques, bouton audio.
- M3 : les 3 « mots » (directeur, chef des ventes, commercial VN-VO) en bulles avec boutons vidéo.
- M5 : les 3 CV réécrits en HTML (bloc `cvVisuel`), brochure ANFA réécrite avec ses tableaux, méthodologie D.A.D.O.
- M6 : doc 1 (Michel) en bulle avec bouton vidéo.
- M7 : les 4 documents (auto neuve, occasion, motorisation, innovations) réécrits intégralement.
- M8 : 7 documents. Le doc 3 (planning d'appel semaine 4) a été recréé, il avait disparu. Docs 4, 5, 7 réécrits (encadrés, formulaire, emailing interactif).
- M9 : docs 1 et 3 convertis en vrais tableaux (SONCASE, méthode C.A.P.).
- M12 : les 7 documents réécrits. Bon de commande en tableaux, témoignages des docs 4 et 7 en bulles numérotées.
- M13 : doc 2 (les 10 animations) réécrit avec ses 10 photos extraites du PDF ; docs 1 et 3 dotés du bouton audio.

**MAMIE & CO**
- M1 : passe de 2 à 3 documents (le lien devient le doc 3 : site mamieandco.com, chiffres clés, 4 portraits d'équipe, fiche société). Doc 2 réécrit mot pour mot.
- M4 : charte vestimentaire réécrite intégralement, doc 3 (phrase d'accueil de Mme Blondize) en bulle. Le système de photos à cocher (21 images) est conservé.

### Migrations SQL déjà exécutées par J.M.
- `migration-comptes-eleves.sql` (colonne `mdp_simple`)
- `migration-rls-classes.sql` (désactivation RLS sur classes, groupes, eleves_groupes)

Ces fichiers sont à la racine du projet. D'autres migrations existent, déjà passées.

---

## 6. LE BUG QUI A COÛTÉ CHER (à comprendre absolument)

`OngletTravaux.tsx` contient, autour de la ligne 982, un **filtre en liste blanche** :

```js
const contenu = blocs.filter((b) => !(b.pageWeb && !b.intertitre && !b.paragraphes && ... ))
```

Ce filtre supprime silencieusement tout bloc `pageWeb` dont aucun champ n'est listé.

**Conséquence : si tu ajoutes un nouveau type de bloc, tu dois faire DEUX choses.**

1. L'ajouter au filtre (`&& !b.monNouveauBloc`)
2. **Écrire son composant de rendu** et le brancher dans `contenu.map(...)`

Si tu ne fais que la première, le document s'affiche **vide** : le cadre apparaît, l'intérieur est blanc. C'est exactement ce qui est arrivé avec `bulle`. J.M. a perdu du temps à cause de ça.

**Vérification obligatoire après tout ajout de bloc :**

```python
import re
s = open('src/data/contenus.ts', encoding='utf-8').read()
tsx = open('src/components/mission/OngletTravaux.tsx', encoding='utf-8').read()
rendus = set(re.findall(r'\{b\.([a-zA-Z]+) &&', tsx)) | set(re.findall(r'b\.([a-zA-Z]+)\?\.map', tsx))

for n, su in [('PEUGEOT_M1','PEUGEOT_M2')]:   # adapter les bornes
    a = s.index(f'const {n}:'); b = s.index(f'const {su}:')
    c = s[a:b]
    d0 = c.index('documents: ['); d1 = c.index('objectifs: [')
    for part in re.split(r'(?=\{ numero: \d+, titre:)', c[d0:d1]):
        m = re.match(r'\{ numero: (\d+)', part)
        if not m: continue
        champs = set(re.findall(r'\{ ([a-zA-Z]+):', part)) - {'pageWeb'}
        if not (champs & rendus):
            print("DOCUMENT VIDE:", n, "doc", m.group(1))
```

Un document dont aucun champ n'est rendu est un document vide à l'écran.

---

## 7. TYPES DE BLOCS DISPONIBLES

Blocs de document (dans `texte: [...]`) : `pageWeb`, `intertitre`, `paragraphes`, `puces`, `tableau`, `image`, `logoEntete`, `bulle`, `dialogue`, `livreOuvert`, `audioLien`, `cvVisuel`, `chiffresCles`, `emailingWeb`, `encadresListes`, `noteDirection`, `docRiche`, `formulaireInteractif`, `typesQuestions`, `themesQuestions`, `carrousel`, `galerieProduits`, `crm`, `organigramme`, et une trentaine d'autres.

Sections `docRiche` : `titre`, `sousTitre`, `paragraphe(s)`, `puces`, `image`, `tableau`, `fiche`, `chiffres`, `grillePersonnes`, `grilleProduits`, `partenaires`, `servicesIcones`, etc.

Contexte de mission : `planningContexte` (calendrier), `videoContexte`, `videoIntro`.

Lire les définitions dans `contenus.ts` (lignes 1100 à 1450 environ) avant d'inventer un nouveau type.

---

## 8. CE QUI RESTE À FAIRE

Problèmes signalés par J.M., non encore traités :

**LEROY MERLIN**
- M3 doc 4 : images à vérifier après déploiement
- M5 doc 1 : « quelque chose a disparu », à préciser avec J.M.

**FREE**
- M1 : l'original comptait 6 ressources (4 liens + document 2), le code n'en a que 5. Appliquer la règle « liens = documents ». Sources à demander à J.M.
- M3 docs 6 et 7 : textes corrects, images d'engagement à ajouter. Sources à demander.

**AMPARIS**
- M1 docs 1 et 4 : forme à refaire en reprenant la présentation du site officiel de la marque.

**HYDRAO** : missions 2 à 7 non auditées.

**Autres scénarios** (Renault, Citroën, Orpi) : jamais audités. Ils contiennent probablement aussi des captures de PDF collées.

### Méthode d'audit d'un scénario

Repérer les documents qui sont des PDF collés :

```python
import re
s = open('src/data/contenus.ts', encoding='utf-8').read()
a = s.index('const RENAULT_M1:'); b = s.index('const RENAULT_M2:')
c = s[a:b]
d0 = c.index('documents: ['); d1 = c.index('objectifs: [')
for part in re.split(r'(?=\{ numero: \d+, titre:)', c[d0:d1]):
    m = re.match(r'\{ numero: (\d+), titre: ["\']([^"\']{0,50})', part)
    if not m: continue
    imgs = re.findall(r"src: '(/docs/[^']+)'", part)
    if imgs:
        print(m.group(1), m.group(2), imgs)
```

Puis, pour chaque image trouvée, regarder ses dimensions. Une image au format page (par exemple 900 × 1200, ou nettement plus haute que large) est presque toujours une capture de document à réécrire. Une image carrée ou petite est une illustration à garder.

Toujours demander les sources à J.M. avant de réécrire. Ne jamais inventer un contenu pédagogique.

---

## 9. PRÉFÉRENCES DE J.M.

- Il n'a pas beaucoup de crédit Netlify. Un seul déploiement par scénario terminé.
- Il déploie lui-même. Ne jamais promettre un déploiement automatique.
- GitHub refuse plus de 100 fichiers en glisser-déposer. D'où la séparation code / images.
- Il travaille scénario par scénario, pas mission par mission.
- Quand il envoie une capture d'écran d'un test ou d'un quiz, répondre uniquement par la bonne réponse, sans explication.
- Chaque nouvel exercice utilise un nom d'entreprise fictif différent.
- Style : aucun emoji dans les documents pédagogiques, pas de tirets cadratins décoratifs, pas de formules toutes faites.
