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
  definirOngletEleve,
  definirTousOnglets,
  reinitialiserOngletEleve,
  ongletOuvert,
  aReglageIndividuel,
  evaluationsOuvertes,
  ONGLET_EVALUATION,
  DEVERROUILLAGE_DEFAUT,
  type EtatDeverrouillage,
} from '../../lib/deverrouillage'
import { listerElevesAcceptes } from '../../lib/enseignant'
import { listerClasses, type Classe } from '../../lib/classes'
import type { Profil } from '../../lib/auth'

// Onglets verrouillables uniquement (le journal n'est jamais verrouillable).
const ONGLETS_VERROUILLABLES = ONGLETS.filter((o) => o.verrouillable)

export function Deverrouillage() {
  const navigate = useNavigate()
  const [scenarioId, setScenarioId] = useState<string>(SCENARIOS[0].id)
  const [etat, setEtat] = useState<EtatDeverrouillage>(DEVERROUILLAGE_DEFAUT)
  const [chargement, setChargement] = useState(true)
  const [enCours, setEnCours] = useState<string | null>(null)
  // Portee courante : null = classe entiere (global), sinon un eleve.
  const [eleves, setEleves] = useState<Profil[]>([])
  const [eleveId, setEleveId] = useState<string | null>(null)
  const [classes, setClasses] = useState<Classe[]>([])
  const [filtreClasse, setFiltreClasse] = useState<string>('')

  useEffect(() => {
    chargerDeverrouillages().then((e) => {
      setEtat(e)
      setChargement(false)
    })
    listerElevesAcceptes().then(setEleves)
    listerClasses().then(setClasses)
  }, [])

  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!
  const eleveCourant = eleveId ? eleves.find((e) => e.id === eleveId) ?? null : null
  const elevesFiltres = filtreClasse ? eleves.filter((e) => e.classe_id === filtreClasse) : eleves

  // Bascule d'un onglet : agit sur le global ou sur l'eleve selon la portee.
  async function basculer(missionId: string, ongletId: string, ouvertActuel: boolean) {
    const clef = `${missionId}::${ongletId}`
    setEnCours(clef)
    try {
      let nouvel: EtatDeverrouillage
      if (eleveId) {
        nouvel = await definirOngletEleve(scenarioId, missionId, ongletId, eleveId, !ouvertActuel, etat)
      } else {
        nouvel = await definirOnglet(scenarioId, missionId, ongletId, !ouvertActuel, etat)
      }
      setEtat(nouvel)
    } catch (e) {
      alert("L'enregistrement a échoué. Vérifiez que la migration SQL du déverrouillage a bien été exécutée dans Supabase.\n\nDétail : " + (e instanceof Error ? e.message : String(e)))
    } finally {
      setEnCours(null)
    }
  }

  async function toutPour(missionId: string, ouvrir: boolean) {
    setEnCours(`all-${missionId}`)
    try {
      let courant = etat
      for (const o of ONGLETS_VERROUILLABLES) {
        if (eleveId) {
          courant = await definirOngletEleve(scenarioId, missionId, o.id, eleveId, ouvrir, courant)
        } else {
          courant = await definirOnglet(scenarioId, missionId, o.id, ouvrir, courant)
        }
      }
      setEtat(courant)
    } catch (e) {
      alert("L'enregistrement a échoué. Vérifiez que la migration SQL du déverrouillage a bien été exécutée dans Supabase.\n\nDétail : " + (e instanceof Error ? e.message : String(e)))
    } finally {
      setEnCours(null)
    }
  }

  // Remet un onglet d'un eleve sous controle du global.
  async function reinitOnglet(missionId: string, ongletId: string) {
    if (!eleveId) return
    const clef = `${missionId}::${ongletId}`
    setEnCours(clef)
    const nouvel = await reinitialiserOngletEleve(missionId, ongletId, eleveId, etat)
    setEtat(nouvel)
    setEnCours(null)
  }

  // Verrouille TOUT (tous les scenarios, toutes les missions) en global.
  async function toutVerrouillerGlobal() {
    if (!window.confirm("Verrouiller tous les onglets de toutes les missions de tous les scénarios ?\n\nLes réglages individuels des élèves sont conservés.")) return
    setEnCours('lock-all')
    try {
      const missions = SCENARIOS.flatMap((s) =>
        s.missions.map((m) => ({ scenarioId: s.id, missionId: m.id }))
      )
      const ongletIds = ONGLETS_VERROUILLABLES.map((o) => o.id)
      const nouvel = await definirTousOnglets(missions, ongletIds, false, etat)
      setEtat(nouvel)
    } catch (e) {
      alert("L'enregistrement a échoué. Vérifiez que la migration SQL du déverrouillage a bien été exécutée dans Supabase.\n\nDétail : " + (e instanceof Error ? e.message : String(e)))
    } finally {
      setEnCours(null)
    }
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
        {/* Selecteur de portee : classe entiere ou eleve precis */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 14, marginBottom: 16, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1F2933' }}>Portée :</span>
          <button
            type="button"
            onClick={() => setEleveId(null)}
            style={{
              fontFamily: 'Arial, sans-serif', fontSize: 13, fontWeight: 600, padding: '8px 14px', borderRadius: 99,
              border: eleveId === null ? 'none' : '1px solid #D2DCE6',
              background: eleveId === null ? COULEUR_PROF : '#FFFFFF',
              color: eleveId === null ? '#FFFFFF' : '#4A5568', cursor: 'pointer',
            }}
          >
            Classe entière
          </button>
          <select value={filtreClasse} onChange={(e) => { setFiltreClasse(e.target.value); setEleveId(null) }} style={{ fontFamily: 'Arial, sans-serif', fontSize: 13, padding: '8px 12px', borderRadius: 8, border: '1px solid #D2DCE6', background: '#FFFFFF', color: '#1F2933', minWidth: 160 }}>
            <option value="">Toutes les classes</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
          <select
            value={eleveId ?? ''}
            onChange={(e) => setEleveId(e.target.value || null)}
            style={{ fontFamily: 'Arial, sans-serif', fontSize: 13, padding: '8px 12px', borderRadius: 8, border: '1px solid #D2DCE6', background: '#FFFFFF', color: '#1F2933', minWidth: 220 }}
          >
            <option value="">— Choisir un élève —</option>
            {elevesFiltres.map((el) => (
              <option key={el.id} value={el.id}>{(el.prenom ?? '') + ' ' + (el.nom ?? '')}</option>
            ))}
          </select>
          {eleveCourant && (
            <span style={{ fontSize: 12, color: '#6B7280' }}>
              Réglage pour <b style={{ color: COULEUR_PROF }}>{eleveCourant.prenom} {eleveCourant.nom}</b> — l'état individuel prime sur le global.
            </span>
          )}
          <button
            type="button"
            disabled={enCours !== null}
            onClick={toutVerrouillerGlobal}
            title="Verrouille tous les onglets de toutes les missions de tous les scénarios"
            style={{ marginLeft: 'auto', fontFamily: 'Arial, sans-serif', fontSize: 13, fontWeight: 700, padding: '8px 14px', borderRadius: 8, border: 'none', background: '#B0413E', color: '#FFFFFF', cursor: 'pointer' }}
          >
            Tout verrouiller (tous les scénarios)
          </button>
        </div>

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
                    const ouvert = ongletOuvert(m.id, o.id, etat, eleveId ?? undefined)
                    const individuel = eleveId ? aReglageIndividuel(m.id, o.id, eleveId, etat) : false
                    return (
                      <span key={o.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <button
                          type="button"
                          disabled={enCours !== null}
                          onClick={() => basculer(m.id, o.id, ouvert)}
                          style={pastilleOnglet(ouvert)}
                          title={eleveId ? (individuel ? "Réglage individuel actif" : "Suit l'état de la classe") : undefined}
                        >
                          <CadenasIcone ouvert={ouvert} />
                          {o.libelle}
                          {eleveId && individuel && (
                            <span style={{ fontSize: 10, fontWeight: 700, background: '#16456E', color: '#FFFFFF', borderRadius: 20, padding: '1px 6px', marginLeft: 4 }}>indiv.</span>
                          )}
                        </button>
                        {eleveId && individuel && (
                          <button
                            type="button"
                            disabled={enCours !== null}
                            onClick={() => reinitOnglet(m.id, o.id)}
                            title="Revenir à l'état de la classe"
                            style={{ fontFamily: 'Arial, sans-serif', border: '1px solid #D2DCE6', background: '#FFFFFF', color: '#6B7280', borderRadius: 99, width: 22, height: 22, fontSize: 13, lineHeight: 1, cursor: 'pointer', padding: 0 }}
                          >
                            ↺
                          </button>
                        )}
                      </span>
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
                    const ouvert = evaluationsOuvertes(m.id, etat, eleveId ?? undefined)
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
