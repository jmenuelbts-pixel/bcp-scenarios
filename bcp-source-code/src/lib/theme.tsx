// theme.tsx
// Elements de style partages pour le redesign colore de l'espace enseignant :
// carte statistique, pastille d'initiales, ombres. Style inline, Arial.

import { COULEUR_PROF } from '../data/schema'

// Ombre douce reutilisable sur les cartes et tableaux.
export const OMBRE_CARTE = '0 2px 10px rgba(27, 107, 58, 0.07)'
export const OMBRE_CARTE_FORTE = '0 3px 12px rgba(27, 107, 58, 0.10)'

// Degrade vert de l'espace enseignant (en-tetes, boutons actifs).
export const DEGRADE_PROF = 'linear-gradient(135deg, #1B6B3A 0%, #2E9E5B 100%)'

// Palette de fonds de pastilles d'initiales, choisie de facon stable a partir
// du nom pour que chaque eleve garde toujours la meme couleur.
const PALETTE_AVATARS: { fond: string; encre: string }[] = [
  { fond: '#E4FBF2', encre: '#0F9E75' },
  { fond: '#E9F0FF', encre: '#1F6FEB' },
  { fond: '#F4EAFB', encre: '#8E44AD' },
  { fond: '#FFF2E0', encre: '#C0392B' },
  { fond: '#FDECEF', encre: '#C2185B' },
  { fond: '#E7F6F5', encre: '#16A085' },
]

// Choisit une couleur stable a partir d'une chaine (nom de l'eleve).
export function couleurAvatar(cle: string): { fond: string; encre: string } {
  let somme = 0
  for (let i = 0; i < cle.length; i++) somme += cle.charCodeAt(i)
  return PALETTE_AVATARS[somme % PALETTE_AVATARS.length]
}

// Initiales a partir du nom et du prenom (ex : "BLACK Dyms" -> "BD").
export function initiales(nom: string, prenom: string): string {
  const a = (nom || '').trim().charAt(0)
  const b = (prenom || '').trim().charAt(0)
  return (a + b).toUpperCase() || '?'
}

// Pastille ronde d'initiales.
export function PastilleInitiales({ nom, prenom, taille = 30 }: { nom: string; prenom: string; taille?: number }) {
  const c = couleurAvatar(`${nom} ${prenom}`)
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: taille,
        height: taille,
        borderRadius: '50%',
        background: c.fond,
        color: c.encre,
        fontSize: Math.round(taille * 0.4),
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {initiales(nom, prenom)}
    </span>
  )
}

// Carte statistique (libelle + valeur coloree).
export function CarteStat({ libelle, valeur, couleur = COULEUR_PROF }: { libelle: string; valeur: React.ReactNode; couleur?: string }) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #EAF0F5',
        borderRadius: 12,
        padding: 14,
        boxShadow: OMBRE_CARTE,
        flex: 1,
        minWidth: 90,
      }}
    >
      <div style={{ fontSize: 12, color: '#6B7683' }}>{libelle}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: couleur }}>{valeur}</div>
    </div>
  )
}
