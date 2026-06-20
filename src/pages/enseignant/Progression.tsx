// Progression.tsx
// Suivi visuel par eleve. Choix d'un scenario par pastilles, puis tableau
// eleves (lignes) x missions (colonnes). Chaque case montre trois pastilles :
// travail rendu, activite faite, journal rempli.

import { useEffect, useState } from 'react'
import { EnteteProf } from '../../components/ui/EnteteProf'
import {
  SCENARIOS,
  couleurEntete,
  couleurTexteSur,
  eclaircir,
} from '../../data/schema'
import {
  listerElevesAcceptes,
  avancementEleve,
  type AvancementMission,
} from '../../lib/enseignant'
import type { Profil } from '../../lib/auth'

type AvancementParEleve = Record<string, Record<string, AvancementMission>>

export function Progression() {
  const [scenarioId, setScenarioId] = useState<string>(SCENARIOS[0].id)
  const [eleves, setEleves] = useState<Profil[]>([])
  const [avancement, setAvancement] = useState<AvancementParEleve>({})
  const [chargement, setChargement] = useState(true)

  const scenario = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0]

  useEffect(() => {
    async function charger() {
      setChargement(true)
      const liste = await listerElevesAcceptes()
      setEleves(liste)
      const map: AvancementParEleve = {}
      for (const e of liste) {
        map[e.id] = await avancementEleve(e.id)
      }
      setAvancement(map)
      setChargement(false)
    }
    charger()
  }, [])

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#F4F7FA' }}>
      <EnteteProf actif="/enseignant/progression" />

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
        <h1 style={{ fontSize: 20, color: '#1F2933', margin: '0 0 18px' }}>Progression pédagogique</h1>

        {/* Pastilles scenario */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
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

        {/* Legende */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 14, fontSize: 12, color: '#4B5563' }}>
          <Legende couleur="#2E8B57" texte="Travail rendu" />
          <Legende couleur="#2E6CB0" texte="Activité faite" />
          <Legende couleur="#C2792E" texte="Journal rempli" />
        </div>

        {chargement ? (
          <p style={{ fontSize: 13, color: '#6B7280' }}>Chargement...</p>
        ) : eleves.length === 0 ? (
          <p style={{ fontSize: 13, color: '#6B7280' }}>Aucun élève accepté.</p>
        ) : (
          <div style={{ overflowX: 'auto', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12 }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, position: 'sticky', left: 0, background: '#F4F7FA', textAlign: 'left', minWidth: 160 }}>
                    Élève
                  </th>
                  {scenario.missions.map((m) => (
                    <th key={m.id} style={{ ...thStyle, textAlign: 'center', minWidth: 54 }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          width: 26,
                          height: 26,
                          borderRadius: 7,
                          background: scenario.couleur,
                          color: couleurTexteSur(scenario.couleur),
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                        }}
                        title={m.titre}
                      >
                        {m.numero}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {eleves.map((e) => (
                  <tr key={e.id}>
                    <td style={{ ...tdStyle, position: 'sticky', left: 0, background: '#FFFFFF', fontWeight: 600 }}>
                      {e.nom} {e.prenom}
                    </td>
                    {scenario.missions.map((m) => {
                      const a = avancement[e.id]?.[m.id]
                      return (
                        <td key={m.id} style={{ ...tdStyle, textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: 3 }}>
                            <Point actif={!!a?.travailRendu} couleur="#2E8B57" />
                            <Point actif={!!a?.activiteFaite} couleur="#2E6CB0" />
                            <Point actif={!!a?.journalRempli} couleur="#C2792E" />
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}

function Point({ actif, couleur }: { actif: boolean; couleur: string }) {
  return (
    <span
      style={{
        width: 9,
        height: 9,
        borderRadius: '50%',
        background: actif ? couleur : 'transparent',
        border: actif ? 'none' : '1px solid #D1D9E0',
        display: 'inline-block',
      }}
    />
  )
}

function Legende({ couleur, texte }: { couleur: string; texte: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 9, height: 9, borderRadius: '50%', background: couleur, display: 'inline-block' }} />
      {texte}
    </span>
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
