// Corriges.tsx
// Espace Corriges : accordeon Scenario -> Missions -> Corrige.
// Chaque scenario porte sa couleur mere (identique a la page d'accueil).
// Les missions sont affichees dans une teinte plus claire de cette couleur.
// Le corrige lui-meme est une zone en attente de contenu.

import { useState } from 'react'
import { EnteteProf } from '../../components/ui/EnteteProf'
import {
  SCENARIOS,
  couleurEntete,
  couleurTexteSur,
  eclaircir,
  type Mission,
} from '../../data/schema'

export function Corriges() {
  // Scenario actuellement deplie (un seul a la fois).
  const [scenarioOuvert, setScenarioOuvert] = useState<string | null>(null)
  // Mission selectionnee pour afficher son corrige.
  const [missionSel, setMissionSel] = useState<{ scenarioId: string; mission: Mission } | null>(null)

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#F4F7FA' }}>
      <EnteteProf actif="/enseignant/corriges" />

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
        <h1 style={{ fontSize: 20, color: '#1F2933', margin: '0 0 18px' }}>Corrigés</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {SCENARIOS.map((scenario) => {
            const ouvert = scenarioOuvert === scenario.id
            const fondEntete = couleurEntete(scenario.couleur)
            const texteEntete = couleurTexteSur(fondEntete)
            return (
              <div
                key={scenario.id}
                style={{
                  border: `1px solid ${eclaircir(scenario.couleur, 0.4)}`,
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: '#FFFFFF',
                }}
              >
                {/* En-tete scenario, couleur mere */}
                <button
                  type="button"
                  onClick={() => {
                    setScenarioOuvert(ouvert ? null : scenario.id)
                    setMissionSel(null)
                  }}
                  style={{
                    fontFamily: 'Arial, sans-serif',
                    width: '100%',
                    background: fondEntete,
                    color: texteEntete,
                    border: 'none',
                    padding: '14px 18px',
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                  }}
                >
                  <span>{scenario.nom}</span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    style={{ transform: ouvert ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                  >
                    <polyline
                      points="6,9 12,15 18,9"
                      fill="none"
                      stroke={texteEntete}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {/* Missions du scenario, teinte plus claire */}
                {ouvert && (
                  <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {scenario.missions.map((mission) => {
                      const selectionnee =
                        missionSel?.mission.id === mission.id
                      return (
                        <div key={mission.id}>
                          <button
                            type="button"
                            onClick={() =>
                              setMissionSel(
                                selectionnee ? null : { scenarioId: scenario.id, mission }
                              )
                            }
                            style={{
                              fontFamily: 'Arial, sans-serif',
                              width: '100%',
                              background: eclaircir(scenario.couleur, selectionnee ? 0.55 : 0.78),
                              color: '#1F2933',
                              border: `1px solid ${eclaircir(scenario.couleur, 0.45)}`,
                              borderRadius: 8,
                              padding: '11px 14px',
                              fontSize: 14,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 12,
                              textAlign: 'left',
                            }}
                          >
                            <span
                              style={{
                                flexShrink: 0,
                                width: 26,
                                height: 26,
                                borderRadius: 7,
                                background: scenario.couleur,
                                color: couleurTexteSur(scenario.couleur),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 13,
                                fontWeight: 700,
                              }}
                            >
                              {mission.numero}
                            </span>
                            <span style={{ fontWeight: 600 }}>{mission.titre}</span>
                          </button>

                          {/* Zone corrige (en attente de contenu) */}
                          {selectionnee && (
                            <div
                              style={{
                                margin: '8px 0 4px',
                                padding: '16px 16px',
                                background: '#FFFFFF',
                                border: '1px dashed #C9D6E3',
                                borderRadius: 8,
                                fontSize: 13,
                                color: '#6B7280',
                                lineHeight: 1.6,
                              }}
                            >
                              Corrigé de la mission {mission.numero} ({scenario.nom}) à venir.
                              Cette zone accueillera le corrigé détaillé une fois le contenu ajouté.
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
