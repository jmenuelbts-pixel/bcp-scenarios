// EnteteProf.tsx
// En-tete reutilisable de l'espace professeur : bandeau + 4 onglets de
// navigation avec onglet actif. Style inline, Arial, couleur professeur.

import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import { COULEUR_PROF } from '../../data/schema'

const ONGLETS_PROF = [
  { libelle: 'Tableau de bord', route: '/enseignant' },
  { libelle: 'Corrigés', route: '/enseignant/corriges' },
  { libelle: 'Déroulement', route: '/enseignant/deroulement' },
  { libelle: 'Progression', route: '/enseignant/progression' },
]

export function EnteteProf({ actif }: { actif: string }) {
  const navigate = useNavigate()
  const { deconnecter, profil } = useAuth()

  return (
    <>
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

      <nav style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexWrap: 'wrap' }}>
          {ONGLETS_PROF.map((o) => {
            const estActif = o.route === actif
            return (
              <button
                key={o.route}
                type="button"
                onClick={() => navigate(o.route)}
                style={{
                  fontFamily: 'Arial, sans-serif',
                  background: 'none',
                  border: 'none',
                  borderBottom: estActif ? `3px solid ${COULEUR_PROF}` : '3px solid transparent',
                  padding: '14px 16px',
                  fontSize: 13,
                  fontWeight: estActif ? 700 : 500,
                  color: estActif ? COULEUR_PROF : '#4A5568',
                  cursor: 'pointer',
                }}
              >
                {o.libelle}
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
