// BoutonExportPdf.tsx
// Bouton d'export PDF reutilisable, place en haut a droite des ecrans
// exportables cote enseignant. Declenche l'impression navigateur (l'utilisateur
// choisit "Enregistrer en PDF"). Style inline, Arial, couleur professeur.

import { COULEUR_PROF } from '../../data/schema'

interface Props {
  // Action d'export : construit le document et appelle imprimerPdf.
  onExport: () => void
  // Libelle affiche. Defaut : "Exporter en PDF".
  libelle?: string
  // Desactive le bouton (ex : rien a exporter).
  desactive?: boolean
  // Titre au survol (explication si desactive).
  titre?: string
}

export function BoutonExportPdf({ onExport, libelle = 'Exporter en PDF', desactive = false, titre }: Props) {
  return (
    <button
      type="button"
      onClick={onExport}
      disabled={desactive}
      title={titre}
      style={{
        fontFamily: 'Arial, sans-serif',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        background: desactive ? '#E5E9ED' : COULEUR_PROF,
        color: desactive ? '#9AA5B1' : '#FFFFFF',
        border: 'none',
        borderRadius: 8,
        padding: '9px 14px',
        fontSize: 13,
        fontWeight: 700,
        cursor: desactive ? 'not-allowed' : 'pointer',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {libelle}
    </button>
  )
}
