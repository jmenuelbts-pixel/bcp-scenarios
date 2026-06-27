// Deverrouillage.tsx
// Espace professeur : ouverture et fermeture des onglets par mission, et
// ouverture des evaluations. Cadenas vert (ouvert) ou rouge (verrouille)
// cliquable. Boutons Tout ouvrir / Tout fermer par mission. Le journal de bord
// est toujours ouvert et non modifiable. Synchronise avec Supabase.

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SCENARIOS, ONGLETS, COULEUR_PROF } from '../../data/schema'
import {
  chargerDeverrouillages,
  definirOnglet,
  ongletOuvert,
  evaluationsOuvertes,
  ONGLET_EVALUATION,
  DEVERROUILLAGE_DEFAUT,
  type EtatDeverrouillage,
} from '../../lib/deverrouillage'

// Onglets verrouillables uniquement (le journal n'est jamais verrouillable).
const ONGLETS_VERROUILLABLES = ONGLETS.filter((o) => o.verrouillable)

export function Deverrouillage() {
  const navigate = useNavigate()
  const [scenarioId, setScenarioId] = useState<string>(SCENARIOS[0].id)
  const [etat, setEtat] = useState<EtatDeverrouillage>(DEVERROUILLAGE_DEFAUT)
  const [chargement, setChargement] = useState(true)
  const [enCours, setEnCours] = useState<string | null>(null)

  useEffect(() => {
    chargerDeverrouillages().then((e) => {
      setEtat(e)
      setChargement(false)
    })
  }, [])

  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!

  async function basculer(missionId: string, ongletId: string, ouvertActuel: boolean) {
    const clef = `${missionId}::${ongletId}`
    setEnCours(clef)
    const nouvel = await definirOnglet(scenarioId, missionId, ongletId, !ouvertActuel, etat)
    setEtat(nouvel)
    setEnCours(null)
  }

  async function toutPour(missionId: string, ouvrir: boolean) {
    setEnCours(`all-${missionId}`)
    let courant = etat
    for (const o of ONGLETS_VERROUILLABLES) {
      courant = await definirOnglet(scenarioId, missionId, o.id, ouvrir, courant)
    }
    setEtat(courant)
    setEnCours(null)
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#F4F7FA' }}>
      <header style={{ background: COULEUR_PROF, color: '#FFFFFF', padding: '16px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <button
            type="button"
            onClick={() => navigate('/enseignant')}
            style={btnRetourEntete}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
              <polyline points="15,5 8,12 15,19" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Tableau de bord
          </button>
          <h1 style={{ margin: 0, fontSize: 21, fontWeight: 700 }}>Déverrouillage</h1>
        </div>
      </header>

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
        {/* Selecteur de scenario */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {SCENARIOS.map((s) => {
            const actif = s.id === scenarioId
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setScenarioId(s.id)}
                style={{
                  fontFamily: 'Arial, sans-serif',
                  fontSize: 13,
                  fontWeight: 600,
                  padding: '8px 14px',
                  borderRadius: 99,
                  border: actif ? 'none' : '1px solid #D2DCE6',
                  background: actif ? COULEUR_PROF : '#FFFFFF',
                  color: actif ? '#FFFFFF' : '#4A5568',
                  cursor: 'pointer',
                }}
              >
                {s.nom}
              </button>
            )
          })}
        </div>

        {chargement ? (
          <p style={{ fontSize: 14, color: '#6B7280' }}>Chargement en cours...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {scenario.missions.map((m) => (
              <div
                key={m.id}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1F2933' }}>
                    Mission {m.numero} - {m.titre}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      disabled={enCours !== null}
                      onClick={() => toutPour(m.id, true)}
                      style={btnPetit('#2E8B57')}
                    >
                      Tout ouvrir
                    </button>
                    <button
                      type="button"
                      disabled={enCours !== null}
                      onClick={() => toutPour(m.id, false)}
                      style={btnPetit('#B0413E')}
                    >
                      Tout fermer
                    </button>
                  </div>
                </div>

                {/* Grille des onglets verrouillables */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {ONGLETS_VERROUILLABLES.map((o) => {
                    const ouvert = ongletOuvert(m.id, o.id, etat)
                    return (
                      <button
                        key={o.id}
                        type="button"
                        disabled={enCours !== null}
                        onClick={() => basculer(m.id, o.id, ouvert)}
                        style={pastilleOnglet(ouvert)}
                      >
                        <CadenasIcone ouvert={ouvert} />
                        {o.libelle}
                      </button>
                    )
                  })}

                  {/* Journal de bord : toujours ouvert, non modifiable */}
                  <span style={{ ...pastilleOnglet(true), cursor: 'default', opacity: 0.85 }}>
                    <CadenasIcone ouvert={true} />
                    Journal de bord (toujours ouvert)
                  </span>
                </div>

                {/* Evaluations : bouton ouvrir / fermer */}
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #EEF2F6', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 13, color: '#4A5568', fontWeight: 600 }}>Évaluations</span>
                  {(() => {
                    const ouvert = evaluationsOuvertes(m.id, etat)
                    return (
                      <button
                        type="button"
                        disabled={enCours !== null}
                        onClick={() => basculer(m.id, ONGLET_EVALUATION, ouvert)}
                        style={btnPetit(ouvert ? '#B0413E' : '#2E8B57')}
                      >
                        {ouvert ? 'Fermer' : 'Ouvrir'}
                      </button>
                    )
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

// Icone cadenas : ouvert (vert) ou ferme (rouge).
function CadenasIcone({ ouvert }: { ouvert: boolean }) {
  const couleur = ouvert ? '#2E8B57' : '#B0413E'
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="11" width="14" height="9" rx="2" fill="none" stroke={couleur} strokeWidth="2" />
      {ouvert ? (
        <path d="M8 11 V8 a4 4 0 0 1 7 -2" fill="none" stroke={couleur} strokeWidth="2" strokeLinecap="round" />
      ) : (
        <path d="M8 11 V8 a4 4 0 0 1 8 0 v3" fill="none" stroke={couleur} strokeWidth="2" />
      )}
    </svg>
  )
}

const btnRetourEntete: React.CSSProperties = {
  fontFamily: 'Arial, sans-serif',
  background: 'rgba(255,255,255,0.2)',
  border: 'none',
  color: '#FFFFFF',
  borderRadius: 99,
  padding: '6px 14px',
  fontSize: 13,
  cursor: 'pointer',
  marginBottom: 10,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
}

function btnPetit(couleur: string): React.CSSProperties {
  return {
    fontFamily: 'Arial, sans-serif',
    background: couleur,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 8,
    padding: '6px 12px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  }
}

function pastilleOnglet(ouvert: boolean): React.CSSProperties {
  return {
    fontFamily: 'Arial, sans-serif',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    fontWeight: 600,
    padding: '7px 12px',
    borderRadius: 99,
    border: `1px solid ${ouvert ? '#A8D5BC' : '#E2B3B1'}`,
    background: ouvert ? '#EAF7EF' : '#FCECEB',
    color: ouvert ? '#1B6B3A' : '#8A2A28',
    cursor: 'pointer',
  }
}
