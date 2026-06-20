// AccueilEnseignant.tsx
// Tableau de bord du professeur : en-tete avec navigation, 6 items colores
// avec icone SVG et infobulle. Chaque item mene vers une fonction de l'espace
// enseignant. Style inline, Arial, aucun emoji.

import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import { COULEUR_PROF } from '../../data/schema'
import { Infobulle } from '../../components/ui/Infobulle'

interface ItemTableau {
  id: string
  titre: string
  fond: string
  bord: string
  description: string
  route: string
  icone: React.ReactNode
}

const ITEMS: ItemTableau[] = [
  {
    id: 'inscriptions',
    titre: "Demandes d'inscription",
    fond: '#FEF7E0',
    bord: '#F2D98A',
    description: 'Accepter ou refuser les nouveaux eleves qui demandent un acces.',
    route: '/enseignant/inscriptions',
    icone: (
      <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="9" cy="8" r="3.2" fill="none" stroke="#B8860B" strokeWidth="2" />
        <path d="M3.5 19 a5.5 5.5 0 0 1 11 0" fill="none" stroke="#B8860B" strokeWidth="2" />
        <line x1="18" y1="8" x2="18" y2="14" stroke="#B8860B" strokeWidth="2" strokeLinecap="round" />
        <line x1="15" y1="11" x2="21" y2="11" stroke="#B8860B" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'liste',
    titre: 'Liste des élèves',
    fond: '#EAF2EC',
    bord: '#A8CBB4',
    description: 'Appel par séance et notes des élèves.',
    route: '/enseignant/liste',
    icone: (
      <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="3" width="16" height="18" rx="2" fill="none" stroke="#1B6B3A" strokeWidth="2" />
        <line x1="8" y1="8" x2="16" y2="8" stroke="#1B6B3A" strokeWidth="2" strokeLinecap="round" />
        <line x1="8" y1="12" x2="16" y2="12" stroke="#1B6B3A" strokeWidth="2" strokeLinecap="round" />
        <line x1="8" y1="16" x2="13" y2="16" stroke="#1B6B3A" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'eleves',
    titre: 'Suivi des élèves',
    fond: '#E8F1FB',
    bord: '#9CC4EC',
    description: 'Progression, connexions et resultats de chaque élève.',
    route: '/enseignant/eleves',
    icone: (
      <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 17 l5 -5 l4 4 l8 -8" fill="none" stroke="#2E6CB0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="16,8 20,8 20,12" fill="none" stroke="#2E6CB0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'presence',
    titre: 'Présence en temps réel',
    fond: '#E6F4EA',
    bord: '#9AD0AC',
    description: 'Qui est en ligne, sur quelle page, et avancement en direct.',
    route: '/enseignant/presence',
    icone: (
      <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="3" fill="#2E8B57" />
        <path d="M5.5 12 a6.5 6.5 0 0 1 13 0" fill="none" stroke="#2E8B57" strokeWidth="2" strokeLinecap="round" />
        <path d="M2.5 12 a9.5 9.5 0 0 1 19 0" fill="none" stroke="#9AD0AC" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'travaux',
    titre: 'Travaux à rendre',
    fond: '#E6F4EA',
    bord: '#9AD0AC',
    description: 'Travaux rendus par les eleves et corrections a apporter.',
    route: '/enseignant/travaux',
    icone: (
      <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="5" y="3" width="14" height="18" rx="2" fill="none" stroke="#2E8B57" strokeWidth="2" />
        <line x1="8" y1="8" x2="16" y2="8" stroke="#2E8B57" strokeWidth="2" strokeLinecap="round" />
        <line x1="8" y1="12" x2="16" y2="12" stroke="#2E8B57" strokeWidth="2" strokeLinecap="round" />
        <line x1="8" y1="16" x2="13" y2="16" stroke="#2E8B57" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'deverrouillage',
    titre: 'Déverrouillage',
    fond: '#FBEEE0',
    bord: '#EEC59B',
    description: 'Ouvrir et fermer les onglets des missions et les evaluations.',
    route: '/enseignant/deverrouillage',
    icone: (
      <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="5" y="11" width="14" height="9" rx="2" fill="none" stroke="#C2792E" strokeWidth="2" />
        <path d="M8 11 V8 a4 4 0 0 1 7 -2" fill="none" stroke="#C2792E" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'messagerie',
    titre: 'Messagerie',
    fond: '#F1EAFB',
    bord: '#C4ABE8',
    description: 'Envoyer des messages individuels ou a toute la classe.',
    route: '/enseignant/messagerie',
    icone: (
      <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="#6E3FA3" strokeWidth="2" />
        <polyline points="4,7 12,13 20,7" fill="none" stroke="#6E3FA3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'exports',
    titre: 'Exports PDF',
    fond: '#FBE9F1',
    bord: '#EBA9C7',
    description: 'Exporter journaux de bord, resultats, devoirs, travaux et activites.',
    route: '/enseignant/exports',
    icone: (
      <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 3 h7 l4 4 v14 a1 1 0 0 1 -1 1 H7 a1 1 0 0 1 -1 -1 V4 a1 1 0 0 1 1 -1 z" fill="none" stroke="#C13C7B" strokeWidth="2" strokeLinejoin="round" />
        <polyline points="12,11 12,17" fill="none" stroke="#C13C7B" strokeWidth="2" strokeLinecap="round" />
        <polyline points="9,14 12,17 15,14" fill="none" stroke="#C13C7B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

const ONGLETS_PROF = [
  { libelle: 'Tableau de bord', route: '/enseignant', aide: "Vue d'ensemble : accès à tous les outils du professeur." },
  { libelle: 'Corrigés', route: '/enseignant/corriges', aide: 'Consulter et saisir les corrigés de chaque mission.' },
  { libelle: 'Déroulement', route: '/enseignant/deroulement', aide: 'Préparer le déroulé pédagogique de chaque séance.' },
  { libelle: 'Progression', route: '/enseignant/progression', aide: 'Suivre la progression et les résultats des élèves.' },
]

export function AccueilEnseignant() {
  const navigate = useNavigate()
  const { deconnecter, profil } = useAuth()

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#F4F7FA' }}>
      {/* En-tete */}
      <header style={{ background: COULEUR_PROF, color: '#FFFFFF', padding: '16px 24px' }}>
        <div
          style={{
            maxWidth: 1000,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ fontSize: 19, fontWeight: 700 }}>Scénarios MCV B</div>
            {profil?.prenom && (
              <div style={{ fontSize: 13, opacity: 0.9, marginTop: 2 }}>
                {profil.prenom} {profil.nom}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={deconnecter}
            style={{
              fontFamily: 'Arial, sans-serif',
              background: 'rgba(255,255,255,0.2)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 8,
              padding: '8px 14px',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Se déconnecter
          </button>
        </div>
      </header>

      {/* Onglets de navigation */}
      <nav style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexWrap: 'wrap' }}>
          {ONGLETS_PROF.map((o, i) => {
            const actif = i === 0
            return (
              <Infobulle key={o.route} texte={o.aide}>
                <button
                  type="button"
                  onClick={() => navigate(o.route)}
                  style={{
                    fontFamily: 'Arial, sans-serif',
                    background: 'none',
                    border: 'none',
                    borderBottom: actif ? `3px solid ${COULEUR_PROF}` : '3px solid transparent',
                    padding: '14px 16px',
                    fontSize: 13,
                    fontWeight: actif ? 700 : 500,
                    color: actif ? COULEUR_PROF : '#4A5568',
                    cursor: 'pointer',
                  }}
                >
                  {o.libelle}
                </button>
              </Infobulle>
            )
          })}
        </div>
      </nav>

      {/* Grille des 6 items */}
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 18,
          }}
        >
          {ITEMS.map((item) => (
            <Infobulle key={item.id} texte={item.description}>
              <button
                type="button"
                onClick={() => navigate(item.route)}
                style={{
                  fontFamily: 'Arial, sans-serif',
                  textAlign: 'left',
                  width: '100%',
                  background: item.fond,
                  border: `1px solid ${item.bord}`,
                  borderRadius: 14,
                  padding: 20,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {item.icone}
                </span>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#1F2933' }}>
                  {item.titre}
                </span>
              </button>
            </Infobulle>
          ))}
        </div>
      </main>
    </div>
  )
}
