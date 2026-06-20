// Progression.tsx
// Suivi par mission : choix d'un scenario, puis d'une mission. Le tableau liste
// les eleves en lignes et les 6 composants obligatoires en colonnes (travaux,
// synthese, auto-eval, flashcards, quiz, glisser). Vert = envoye, gris = a faire.
// Le glossaire et le journal de bord ne comptent pas.

import { useEffect, useState } from 'react'
import { EnteteProf } from '../../components/ui/EnteteProf'
import { SCENARIOS, couleurEntete, couleurTexteSur, eclaircir } from '../../data/schema'
import { listerElevesAcceptes } from '../../lib/enseignant'
import { activitesEnvoyees, COMPOSANTS_MISSION } from '../../lib/eleve'
import type { Profil } from '../../lib/auth'

const VERT = '#1B6B3A'

const LIBELLES: Record<string, string> = {
  travaux: 'Travaux',
  synthese: 'Synthèse',
  autoeval: 'Auto-éval',
  flashcards: 'Flashcards',
  quiz: 'Quiz',
  glisser: 'Glisser',
}

// faitsParEleve[eleveId] = Set des composants envoyes pour la mission choisie.
type FaitsParEleve = Record<string, Set<string>>

export function Progression() {
  const [scenarioId, setScenarioId] = useState<string>(SCENARIOS[0].id)
  const scenario = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0]
  const [missionId, setMissionId] = useState<string>(scenario.missions[0]?.id ?? '')
  const [eleves, setEleves] = useState<Profil[]>([])
  const [faits, setFaits] = useState<FaitsParEleve>({})
  const [chargement, setChargement] = useState(true)

  // Charge la liste des eleves une fois.
  useEffect(() => {
    listerElevesAcceptes().then(setEleves)
  }, [])

  // Quand on change de scenario, repositionne la mission sur la premiere.
  useEffect(() => {
    setMissionId(scenario.missions[0]?.id ?? '')
  }, [scenarioId])

  // Charge les activites envoyees de chaque eleve pour la mission choisie.
  useEffect(() => {
    let actif = true
    if (!missionId || eleves.length === 0) {
      setFaits({})
      setChargement(false)
      return
    }
    setChargement(true)
    Promise.all(
      eleves.map(async (e) => [e.id, await activitesEnvoyees(e.id, missionId)] as const)
    ).then((paires) => {
      if (!actif) return
      const map: FaitsParEleve = {}
      for (const [id, set] of paires) map[id] = set
      setFaits(map)
      setChargement(false)
    })
    return () => {
      actif = false
    }
  }, [missionId, eleves])

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#F4F7FA' }}>
      <EnteteProf actif="/enseignant/progression" />

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
        <h1 style={{ fontSize: 20, color: '#1F2933', margin: '0 0 18px' }}>Progression pédagogique</h1>

        {/* Pastilles scenario */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {SCENARIOS.map((s) => {
            const actif = s.id === scenarioId
            const fond = couleurEntete(s.couleur)
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setScenarioId(s.id)}
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

        {/* Choix de la mission */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#4B5563', marginRight: 4 }}>Mission :</span>
          {scenario.missions.map((m) => {
            const actif = m.id === missionId
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMissionId(m.id)}
                title={m.titre}
                style={{
                  fontFamily: 'Arial, sans-serif',
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: actif ? couleurEntete(scenario.couleur) : '#FFFFFF',
                  color: actif ? couleurTexteSur(scenario.couleur) : '#374151',
                  border: actif ? 'none' : '1px solid #D1D9E0',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {m.numero}
              </button>
            )
          })}
        </div>

        {/* Titre de la mission selectionnee */}
        {scenario.missions.find((m) => m.id === missionId) && (
          <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 12px' }}>
            Mission {scenario.missions.find((m) => m.id === missionId)?.numero} : {scenario.missions.find((m) => m.id === missionId)?.titre}
          </p>
        )}

        {chargement ? (
          <p style={{ fontSize: 13, color: '#6B7280' }}>Chargement...</p>
        ) : eleves.length === 0 ? (
          <p style={{ fontSize: 13, color: '#6B7280' }}>Aucun élève accepté.</p>
        ) : (
          <div style={{ overflowX: 'auto', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12 }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F4F7FA' }}>
                  <th style={{ ...thStyle, textAlign: 'left', minWidth: 150 }}>Élève</th>
                  {COMPOSANTS_MISSION.map((c) => (
                    <th key={c} style={{ ...thStyle, textAlign: 'center', minWidth: 72 }}>
                      {LIBELLES[c]}
                    </th>
                  ))}
                  <th style={{ ...thStyle, textAlign: 'center', minWidth: 56 }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {eleves.map((e) => {
                  const set = faits[e.id] ?? new Set<string>()
                  const total = COMPOSANTS_MISSION.filter((c) => set.has(c)).length
                  return (
                    <tr key={e.id}>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>
                        {e.nom} {e.prenom}
                      </td>
                      {COMPOSANTS_MISSION.map((c) => (
                        <td key={c} style={{ ...tdStyle, textAlign: 'center' }}>
                          {set.has(c) ? (
                            <span style={{ color: VERT, fontWeight: 700, fontSize: 16 }} title="Envoyé">✓</span>
                          ) : (
                            <span style={{ color: '#C9CDD2', fontSize: 16 }} title="À faire">○</span>
                          )}
                        </td>
                      ))}
                      <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 700, color: total === 6 ? VERT : '#4B5563' }}>
                        {total}/6
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 12, color: '#4B5563' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: VERT, fontWeight: 700 }}>✓</span> envoyé
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#C9CDD2' }}>○</span> à faire
          </span>
        </div>
      </main>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: '10px 8px',
  borderBottom: '1px solid #E2E8F0',
  fontSize: 12,
  color: '#374151',
}

const tdStyle: React.CSSProperties = {
  padding: '10px 8px',
  borderBottom: '1px solid #EEF2F6',
  color: '#1F2933',
}
