// ScenarioMissions.tsx
// Page d'un scenario : liste des missions, cliquables si abordables,
// avec cadenas noir sur les missions verrouillees.
// Style inline, Arial, aucune classe Tailwind dans le JSX, aucun emoji.

import { useParams, useNavigate } from 'react-router-dom'
import { getScenario, couleurEntete, couleurTexteSur } from '../../data/schema'
import { aContenu } from '../../data/contenus'

export function ScenarioMissions() {
  const { scenarioId } = useParams<{ scenarioId: string }>()
  const navigate = useNavigate()
  const scenario = scenarioId ? getScenario(scenarioId) : undefined

  if (!scenario) {
    return (
      <div style={{ fontFamily: 'Arial, sans-serif', padding: 32 }}>
        <p style={{ color: '#444' }}>Scenario introuvable.</p>
        <button type="button" onClick={() => navigate('/')} style={lienRetour}>
          Retour a l'accueil
        </button>
      </div>
    )
  }

  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #EAF3FB 0%, #D6E8F7 45%, #C2DCF2 100%)',
        padding: '0 0 48px 0',
      }}
    >
      {/* En-tete colore du scenario */}
      <header
        style={{
          background: couleurEntete(scenario.couleur),
          color: couleurTexteSur(scenario.couleur),
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.20)',
          padding: '22px 24px',
        }}
      >
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              fontFamily: 'Arial, sans-serif',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: '#FFFFFF',
              borderRadius: 99,
              padding: '6px 14px',
              fontSize: 13,
              cursor: 'pointer',
              marginBottom: 12,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
              <polyline points="15,5 8,12 15,19" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Accueil
          </button>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>{scenario.nom}</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: 14, opacity: 0.95 }}>
            {scenario.missions.length} missions
          </p>
        </div>
      </header>

      {/* Liste des missions */}
      <main style={{ maxWidth: 880, margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {scenario.missions.map((mission) => {
            // Une mission est abordable si elle dispose de contenu redige.
            // Le verrouillage par le professeur s'ajoutera via Supabase.
            const disponible = aContenu(mission.id)
            return (
              <button
                key={mission.id}
                type="button"
                disabled={!disponible}
                onClick={() =>
                  disponible && navigate(`/scenario/${scenario.id}/mission/${mission.id}`)
                }
                style={{
                  fontFamily: 'Arial, sans-serif',
                  textAlign: 'left',
                  background: '#FFFFFF',
                  border: '1px solid #DCE8F4',
                  borderRadius: 12,
                  padding: '16px 18px',
                  cursor: disponible ? 'pointer' : 'not-allowed',
                  opacity: disponible ? 1 : 0.65,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.06)',
                }}
              >
                {/* Numero de mission dans une pastille coloree */}
                <span
                  style={{
                    flexShrink: 0,
                    width: 34,
                    height: 34,
                    borderRadius: 99,
                    background: disponible ? couleurEntete(scenario.couleur) : '#C9CDD2',
                    color: '#FFFFFF',
                    fontSize: 15,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {mission.numero}
                </span>

                <span
                  style={{
                    flex: 1,
                    fontSize: 15,
                    color: disponible ? '#1F2933' : '#8A9099',
                    fontWeight: 500,
                  }}
                >
                  {mission.titre}
                </span>

                {/* Cadenas noir si verrouillee */}
                {!disponible && (
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
                    <rect x="5" y="11" width="14" height="9" rx="2" fill="#1F2933" />
                    <path d="M8 11 V8 a4 4 0 0 1 8 0 v3" fill="none" stroke="#1F2933" strokeWidth="2" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      </main>
    </div>
  )
}

const lienRetour: React.CSSProperties = {
  fontFamily: 'Arial, sans-serif',
  background: '#16456E',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: 8,
  padding: '8px 16px',
  cursor: 'pointer',
  marginTop: 12,
}
