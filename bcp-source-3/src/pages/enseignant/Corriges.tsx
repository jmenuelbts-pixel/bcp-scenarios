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
import { getContenuMission, type PosteOrganigramme } from '../../data/contenus'

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

                          {/* Zone corrige : structure si redige, sinon attente */}
                          {selectionnee && (() => {
                            const corrige = getContenuMission(mission.id)?.corrige
                            if (!corrige || corrige.questions.length === 0) {
                              return (
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
                              )
                            }
                            const total = corrige.questions.reduce((s, q) => s + q.bareme, 0)
                            return (
                              <div
                                style={{
                                  margin: '8px 0 4px',
                                  padding: '16px 18px',
                                  background: '#FFFFFF',
                                  border: `1px solid ${eclaircir(scenario.couleur, 0.45)}`,
                                  borderRadius: 8,
                                }}
                              >
                                <div
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'baseline',
                                    marginBottom: 14,
                                    paddingBottom: 10,
                                    borderBottom: '1px solid #ECEFF2',
                                  }}
                                >
                                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1F2933' }}>
                                    Corrigé structuré
                                  </span>
                                  <span style={{ fontSize: 13, fontWeight: 700, color: scenario.couleur }}>
                                    Total : {total} points
                                  </span>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                  {corrige.questions.map((q, i) => (
                                    <div key={i}>
                                      <div
                                        style={{
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                          alignItems: 'baseline',
                                          gap: 12,
                                          marginBottom: 6,
                                        }}
                                      >
                                        <span style={{ fontSize: 14, fontWeight: 700, color: '#1F2933' }}>
                                          {i + 1}. {q.intitule}
                                        </span>
                                        <span
                                          style={{
                                            flexShrink: 0,
                                            fontSize: 12,
                                            fontWeight: 700,
                                            color: couleurTexteSur(scenario.couleur),
                                            background: scenario.couleur,
                                            borderRadius: 6,
                                            padding: '2px 8px',
                                          }}
                                        >
                                          {q.bareme} pts
                                        </span>
                                      </div>

                                      {q.documents.length > 0 && (
                                        <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 6 }}>
                                          Documents : {q.documents.join(', ')}
                                        </div>
                                      )}

                                      {q.tableau ? (
                                        <div style={{ overflowX: 'auto', border: `1px solid ${eclaircir(scenario.couleur, 0.6)}`, borderRadius: 8 }}>
                                          <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: q.tableau.colonnes.length > 2 ? 560 : undefined }}>
                                            <thead>
                                              <tr>
                                                {q.tableau.colonnes.map((c, ci) => (
                                                  <th key={ci} style={{ background: scenario.couleur, color: couleurTexteSur(scenario.couleur), fontSize: 13, fontWeight: 700, textAlign: 'left', padding: '8px 10px', whiteSpace: 'nowrap' }}>{c}</th>
                                                ))}
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {q.tableau.lignes.map((ligne, li) => (
                                                <tr key={li} style={{ background: li % 2 === 0 ? '#FFFFFF' : eclaircir(scenario.couleur, 0.9) }}>
                                                  {ligne.map((cell, cj) => (
                                                    <td key={cj} style={{ fontSize: 13, color: '#1F2933', lineHeight: 1.5, padding: '8px 10px', borderTop: `1px solid ${eclaircir(scenario.couleur, 0.7)}`, verticalAlign: 'top', fontWeight: cj === 0 ? 700 : 400 }}>{cell}</td>
                                                  ))}
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      ) : (
                                        <div
                                          style={{
                                            fontSize: 14,
                                            color: '#1F2933',
                                            lineHeight: 1.6,
                                            background: eclaircir(scenario.couleur, 0.85),
                                            border: `1px solid ${eclaircir(scenario.couleur, 0.6)}`,
                                            borderRadius: 8,
                                            padding: '10px 12px',
                                            whiteSpace: 'pre-wrap',
                                          }}
                                        >
                                          {q.reponse}
                                        </div>
                                      )}
                                      {q.complement && (
                                        <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, marginTop: 8, background: eclaircir(scenario.couleur, 0.9), borderRadius: 8, padding: '8px 12px', whiteSpace: 'pre-wrap' }}>
                                          {q.complement}
                                        </div>
                                      )}
                                      {q.organigramme && (
                                        <div style={{ marginTop: 10 }}>
                                          <OrganigrammeCorrige
                                            poste={q.organigramme}
                                            couleur={scenario.couleur}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          })()}
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

// Organigramme corrige : arbre vertical (poste -> personnes, sous-postes relies).
function OrganigrammeCorrige({ poste, couleur }: { poste: PosteOrganigramme; couleur: string }) {
  return (
    <div
      style={{
        border: `1px solid ${eclaircir(couleur, 0.55)}`,
        borderRadius: 8,
        padding: '14px 12px',
        background: '#FFFFFF',
        overflowX: 'auto',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', minWidth: 'fit-content' }}>
        <NoeudOrganigramme poste={poste} couleur={couleur} />
      </div>
    </div>
  )
}

function NoeudOrganigramme({ poste, couleur }: { poste: PosteOrganigramme; couleur: string }) {
  const sous = poste.sousPostes ?? []
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div
        style={{
          background: eclaircir(couleur, 0.85),
          border: `1px solid ${eclaircir(couleur, 0.5)}`,
          borderRadius: 8,
          padding: '8px 12px',
          textAlign: 'center',
          minWidth: 140,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1F2933' }}>{poste.fonction}</div>
        {poste.personnes.length > 0 && (
          <div style={{ fontSize: 13, color: '#374151', marginTop: 2 }}>
            {poste.personnes.join(', ')}
          </div>
        )}
      </div>
      {sous.length > 0 && (
        <>
          <div style={{ width: 2, height: 16, background: eclaircir(couleur, 0.4) }} />
          <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
            {sous.map((sp, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <NoeudOrganigramme poste={sp} couleur={couleur} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
