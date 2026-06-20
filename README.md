# Scénarios MCV B

Application PWA pour le Bac Professionnel Métiers du Commerce et de la Vente, option B.
React + TypeScript + Vite + Tailwind v4 + Supabase. Déploiement Netlify par glisser-déposer
du dossier dist/ zippé.

## Pour reprendre le travail (IA ou développeur)

1. Lire ETAT_PROJET.md en entier (bloc "DÉMARRAGE IMMÉDIAT" en haut).
2. Créer un fichier .env à partir de .env.example (ajouter la clé anon Supabase).
3. npm install
4. npm run build
5. Zipper dist/ et le déposer sur Netlify.

## Référence base de données

Voir SCHEMA_COMPLET.sql : toutes les tables existent déjà dans Supabase, ne pas les
recréer. RLS désactivée (projet pédagogique, accès contrôlé côté application).

## Règles de style

Tout inline, Arial, SVG inline, aucun emoji, accents dans les textes affichés mais jamais
dans les identifiants de code, couleur prof vert #1B6B3A.
