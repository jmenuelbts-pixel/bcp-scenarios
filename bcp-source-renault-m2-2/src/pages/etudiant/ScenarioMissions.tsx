// ScenarioMissions.tsx
// Page d'un scenario : liste des missions. Chaque mission porte une pastille
// numerotee qui se remplit en camembert selon l'avancement de l'eleve (6
// composants : travaux, synthese, autoeval, flashcards, quiz, glisser). Quand
// les 6 sont envoyes, la pastille est pleine et passe au vert (mission finie).

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getScenario, couleurEntete, couleurTexteSur } from '../../data/schema'
import { aContenu } from '../../data/contenus'
import { useAuth } from '../../lib/auth'
import { activitesEnvoyees, progressionMission } from '../../lib/eleve'

const VERT_FINI = '#1B6B3A'

// Pastille circulaire : anneau de fond + secteur rempli facon camembert.
function PastilleCamembert({
  numero,
  pourcentage,
  couleur,
  disponible,
}: {
  numero: number
  pourcentage: number
  couleur: string
  disponible: boolean
}) {
  const taille = 44
  const r = 20
  const c = taille / 2
  const fini = pourcentage >= 100
  const remplissage = disponible ? (fini ? VERT_FINI : couleur) : '#C9CDD2'

  // Secteur camembert : on trace un arc du haut (12h) dans le sens horaire.
  const angle = (Math.min(100, Math.max(0, pourcentage)) / 100) * 360
  const rad = (deg: number) => ((deg - 90) * Math.PI) / 180
  const x = c + r * Math.cos(rad(angle))
  const y = c + r * Math.sin(rad(angle))
  const grandArc = angle > 180 ? 1 : 0
  const cheminSecteur =
    pourcentage <= 0
      ? ''
      : pourcentage >= 100
        ? `M ${c} ${c} m 0 ${-r} a ${r} ${r} 0 1 1 -0.01 0 Z`
        : `M ${c} ${c} L ${c} ${c - r} A ${r} ${r} 0 ${grandArc} 1 ${x} ${y} Z`

  return (
    <span style={{ flexShrink: 0, position: 'relative', width: taille, height: taille }}>
      <svg width={taille} height={taille} viewBox={`0 0 ${taille} ${taille}`}>
        <circle cx={c} cy={c} r={r} fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
        {cheminSecteur && <path d={cheminSecteur} fill={remplissage} opacity={fini ? 1 : 0.85} />}
        <circle cx={c} cy={c} r={r} fill="none" stroke={remplissage} strokeWidth="2" />
      </svg>
      <span
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 15,
          fontWeight: 700,
          color: pourcentage >= 50 ? '#FFFFFF' : '#1F2933',
        }}
      >
        {numero}
      </span>
    </span>
  )
}

export function ScenarioMissions() {
  const { scenarioId } = useParams<{ scenarioId: string }>()
  const navigate = useNavigate()
  const scenario = scenarioId ? getScenario(scenarioId) : undefined
  const { session } = useAuth()
  const userId = session?.user?.id

  // Progression par mission (id -> pourcentage), chargee pour l'eleve courant.
  const [progression, setProgression] = useState<Record<string, number>>({})

  useEffect(() => {
    let actif = true
    if (!userId || !scenario) return
    Promise.all(
      scenario.missions.map(async (m) => {
        const faits = await activitesEnvoyees(userId, m.id)
        return [m.id, progressionMission(faits)] as const
      })
    ).then((paires) => {
      if (!actif) return
      const map: Record<string, number> = {}
      for (const [id, pct] of paires) map[id] = pct
      setProgression(map)
    })
    return () => {
      actif = false
    }
  }, [userId, scenarioId])

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

      <main style={{ maxWidth: 880, margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {scenario.missions.map((mission) => {
            const disponible = aContenu(mission.id)
            const pct = progression[mission.id] ?? 0
            const fini = pct >= 100
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
                <PastilleCamembert
                  numero={mission.numero}
                  pourcentage={pct}
                  couleur={couleurEntete(scenario.couleur)}
                  disponible={disponible}
                />

                <span style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      display: 'block',
                      fontSize: 15,
                      color: disponible ? '#1F2933' : '#8A9099',
                      fontWeight: 500,
                    }}
                  >
                    {mission.titre}
                  </span>
                  {disponible && (
                    <span style={{ display: 'block', fontSize: 12, color: fini ? VERT_FINI : '#6B7280', marginTop: 2, fontWeight: fini ? 700 : 400 }}>
                      {fini ? 'Mission terminée' : `${pct} % réalisé`}
                    </span>
                  )}
                </span>

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
