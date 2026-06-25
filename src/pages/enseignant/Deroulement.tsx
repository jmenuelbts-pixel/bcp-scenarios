// Deroulement.tsx
// Espace Deroulement, presentation liste laterale + panneau (option 4).
// Colonne de gauche : scenario selectionne (couleur mere) puis ses missions
// en teinte plus claire. Panneau de droite : fiche de deroulement de la
// mission choisie (zone en attente de contenu).

import { useState } from 'react'
import { EnteteProf } from '../../components/ui/EnteteProf'
import { construireDeroule } from '../../data/contenus'
import {
  SCENARIOS,
  couleurEntete,
  couleurTexteSur,
  eclaircir,
  type Mission,
} from '../../data/schema'

export function Deroulement() {
  const [scenarioId, setScenarioId] = useState<string>(SCENARIOS[0].id)
  const [missionId, setMissionId] = useState<string | null>(null)

  const scenario = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0]
  const mission: Mission | undefined = scenario.missions.find((m) => m.id === missionId)
  const fondEntete = couleurEntete(scenario.couleur)
  const texteEntete = couleurTexteSur(fondEntete)

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#F4F7FA' }}>
      <EnteteProf actif="/enseignant/deroulement" />

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
        <h1 style={{ fontSize: 20, color: '#1F2933', margin: '0 0 18px' }}>Déroulement</h1>

        {/* Choix du scenario par pastilles */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
          {SCENARIOS.map((s) => {
            const actif = s.id === scenarioId
            const fond = couleurEntete(s.couleur)
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setScenarioId(s.id)
                  setMissionId(null)
                }}
                style={{
                  fontFamily: 'Arial, sans-serif',
                  background: actif ? fond : eclaircir(s.couleur, 0.8),
                  color: actif ? couleurTexteSur(fond) : '#1F2933',
                  border: `1px solid ${eclaircir(s.couleur, 0.4)}`,
                  borderRadius: 99,
                  padding: '7px 15px',
                  fontSize: 13,
                  fontWeight: actif ? 700 : 500,
                  cursor: 'pointer',
                }}
              >
                {s.nom}
              </button>
            )
          })}
        </div>

        {/* Liste laterale + panneau */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Colonne gauche : missions du scenario */}
          <div
            style={{
              flex: '0 0 260px',
              background: '#FFFFFF',
              border: `1px solid ${eclaircir(scenario.couleur, 0.4)}`,
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                background: fondEntete,
                color: texteEntete,
                padding: '12px 16px',
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              {scenario.nom}
            </div>
            <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {scenario.missions.map((m) => {
                const selectionnee = m.id === missionId
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMissionId(m.id)}
                    style={{
                      fontFamily: 'Arial, sans-serif',
                      width: '100%',
                      background: selectionnee
                        ? eclaircir(scenario.couleur, 0.55)
                        : eclaircir(scenario.couleur, 0.85),
                      color: '#1F2933',
                      border: `1px solid ${eclaircir(scenario.couleur, 0.5)}`,
                      borderRadius: 8,
                      padding: '9px 11px',
                      fontSize: 13,
                      fontWeight: selectionnee ? 700 : 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      textAlign: 'left',
                    }}
                  >
                    <span
                      style={{
                        flexShrink: 0,
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        background: scenario.couleur,
                        color: couleurTexteSur(scenario.couleur),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {m.numero}
                    </span>
                    <span>{m.titre}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Panneau droit : fiche de deroulement */}
          <div
            style={{
              flex: 1,
              minWidth: 280,
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 12,
              padding: 24,
              minHeight: 320,
            }}
          >
            {mission ? (
              <>
                <div
                  style={{
                    display: 'inline-block',
                    background: eclaircir(scenario.couleur, 0.7),
                    color: '#1F2933',
                    borderRadius: 8,
                    padding: '4px 12px',
                    fontSize: 12,
                    fontWeight: 700,
                    marginBottom: 12,
                  }}
                >
                  {scenario.nom} · Mission {mission.numero}
                </div>
                <h2 style={{ fontSize: 18, color: '#1F2933', margin: '0 0 16px' }}>{mission.titre}</h2>
                {(() => {
                  const d = construireDeroule(mission.id, mission.titre)
                  if (!d) return (
                    <div style={{ padding: 16, background: '#FAFBFC', border: '1px dashed #C9D6E3', borderRadius: 8, fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>
                      La fiche de déroulement de cette mission s'affichera ici une fois le contenu ajouté.
                    </div>
                  )
                  const c = scenario.couleur
                  const carte: React.CSSProperties = { background: '#FAFBFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: 14, marginBottom: 14 }
                  const titreBloc: React.CSSProperties = { fontSize: 12, fontWeight: 800, color: c, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 8 }
                  return (
                    <div>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
                        <span style={{ background: eclaircir(c, 0.8), color: '#1F2933', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700 }}>Durée : {d.dureeTotale}</span>
                        <span style={{ background: eclaircir(c, 0.8), color: '#1F2933', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700 }}>{d.nbActivites} activité{d.nbActivites > 1 ? 's' : ''}</span>
                        <span style={{ background: eclaircir(c, 0.8), color: '#1F2933', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700 }}>{d.nbQuestions} question{d.nbQuestions > 1 ? 's' : ''}</span>
                      </div>
                      {d.contexte && (
                        <div style={carte}>
                          <div style={titreBloc}>Contexte</div>
                          <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{d.contexte}</div>
                        </div>
                      )}
                      {d.competence && (
                        <div style={carte}>
                          <div style={titreBloc}>Compétence visée</div>
                          <div style={{ fontSize: 13, color: '#1F2933', fontWeight: 700 }}>{d.competence.groupe} — {d.competence.intitule}</div>
                          <div style={{ fontSize: 13, color: '#374151', marginTop: 4 }}>{d.competence.detail}</div>
                        </div>
                      )}
                      {d.objectifs.length > 0 && (
                        <div style={carte}>
                          <div style={titreBloc}>Objectifs</div>
                          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#374151', lineHeight: 1.7 }}>
                            {d.objectifs.map((o, i) => <li key={i}>{o}</li>)}
                          </ul>
                        </div>
                      )}
                      <div style={carte}>
                        <div style={titreBloc}>Déroulé de la séance</div>
                        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                          <thead>
                            <tr>
                              {['Phase', 'Durée', 'Modalité', 'Supports'].map((h) => (
                                <th key={h} style={{ textAlign: 'left', padding: '7px 8px', fontSize: 11, fontWeight: 700, color: '#FFFFFF', background: c, border: '1px solid #FFFFFF' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {d.phases.map((ph, i) => (
                              <tr key={i}>
                                <td style={{ padding: '7px 8px', fontSize: 12, color: '#1F2933', border: '1px solid #E2E8F0', fontWeight: 600 }}>{ph.phase}</td>
                                <td style={{ padding: '7px 8px', fontSize: 12, color: '#374151', border: '1px solid #E2E8F0', whiteSpace: 'nowrap' }}>{ph.duree}</td>
                                <td style={{ padding: '7px 8px', fontSize: 12, color: '#374151', border: '1px solid #E2E8F0' }}>{ph.modalite}</td>
                                <td style={{ padding: '7px 8px', fontSize: 12, color: '#374151', border: '1px solid #E2E8F0' }}>{ph.supports}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )
                })()}
              </>
            ) : (
              <div
                style={{
                  height: '100%',
                  minHeight: 280,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  fontSize: 14,
                  color: '#9AA5B1',
                }}
              >
                Sélectionnez une mission dans la liste pour afficher sa fiche de déroulement.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
