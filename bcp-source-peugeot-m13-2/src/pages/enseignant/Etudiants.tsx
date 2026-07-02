// Etudiants.tsx
// Espace professeur : liste des eleves acceptes avec leur progression globale.
// Cliquer sur un eleve ouvre son suivi individuel detaille.

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { COULEUR_PROF, SCENARIOS } from '../../data/schema'
import { listerElevesAcceptes, visitesEleve, refuserEleve, supprimerEleveComplet } from '../../lib/enseignant'
import type { Profil } from '../../lib/auth'

const TOTAL_MISSIONS = SCENARIOS.reduce((n, s) => n + s.missions.length, 0)

export function Etudiants() {
  const navigate = useNavigate()
  const [eleves, setEleves] = useState<Profil[]>([])
  const [progression, setProgression] = useState<Record<string, number>>({})
  const [chargement, setChargement] = useState(true)
  // Eleve dont on affiche la boite de choix de suppression.
  const [aSupprimer, setASupprimer] = useState<Profil | null>(null)
  const [traitement, setTraitement] = useState(false)

  async function refuser(e: Profil) {
    setTraitement(true)
    await refuserEleve(e.id)
    setEleves((liste) => liste.filter((x) => x.id !== e.id))
    setASupprimer(null)
    setTraitement(false)
  }

  async function supprimer(e: Profil) {
    setTraitement(true)
    await supprimerEleveComplet(e.id)
    setEleves((liste) => liste.filter((x) => x.id !== e.id))
    setASupprimer(null)
    setTraitement(false)
  }

  useEffect(() => {
    async function charger() {
      const liste = await listerElevesAcceptes()
      setEleves(liste)
      // Calcule la progression de chaque eleve (missions abordees / total).
      const prog: Record<string, number> = {}
      for (const e of liste) {
        const visites = await visitesEleve(e.id)
        const missions = new Set(visites.map((v) => v.mission_id))
        prog[e.id] = TOTAL_MISSIONS === 0 ? 0 : Math.round((missions.size / TOTAL_MISSIONS) * 100)
      }
      setProgression(prog)
      setChargement(false)
    }
    charger()
  }, [])

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#F4F7FA' }}>
      <header style={{ background: COULEUR_PROF, color: '#FFFFFF', padding: '16px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <button type="button" onClick={() => navigate('/enseignant')} style={btnRetour}>
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
              <polyline points="15,5 8,12 15,19" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Tableau de bord
          </button>
          <h1 style={{ margin: 0, fontSize: 21, fontWeight: 700 }}>Suivi des élèves</h1>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
        {chargement ? (
          <p style={{ fontSize: 14, color: '#6B7280' }}>Chargement en cours...</p>
        ) : eleves.length === 0 ? (
          <p style={{ fontSize: 14, color: '#6B7280' }}>Aucun élève accepté pour le moment.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {eleves.map((e) => {
              const pct = progression[e.id] ?? 0
              return (
                <div
                  key={e.id}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: 12,
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                  }}
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/enseignant/eleves/${e.id}`)}
                    style={{ flex: 1, cursor: 'pointer' }}
                  >
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1F2933' }}>
                      {e.nom} {e.prenom}
                    </div>
                    <div style={{ fontSize: 13, color: '#6B7280' }}>{e.email}</div>
                  </div>
                  <div style={{ width: 160 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: '#6B7280' }}>Progression</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: COULEUR_PROF }}>{pct} %</span>
                    </div>
                    <div style={{ height: 7, background: '#EDF1F5', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: COULEUR_PROF, borderRadius: 99 }} />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setASupprimer(e)}
                    aria-label="Supprimer l'élève"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, lineHeight: 0 }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                      <polyline points="4,7 20,7" fill="none" stroke="#B0413E" strokeWidth="2" strokeLinecap="round" />
                      <path d="M9 7 V5 a1 1 0 0 1 1 -1 h4 a1 1 0 0 1 1 1 v2" fill="none" stroke="#B0413E" strokeWidth="2" />
                      <path d="M6 7 l1 13 a1 1 0 0 0 1 1 h8 a1 1 0 0 0 1 -1 l1 -13" fill="none" stroke="#B0413E" strokeWidth="2" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Boite de choix de suppression */}
      {aSupprimer && (
        <div
          onClick={() => !traitement && setASupprimer(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(16,52,84,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 50 }}
        >
          <div
            onClick={(ev) => ev.stopPropagation()}
            style={{ fontFamily: 'Arial, sans-serif', background: '#FFFFFF', borderRadius: 16, maxWidth: 440, width: '100%', padding: 26, boxShadow: '0 12px 40px rgba(0,0,0,0.25)' }}
          >
            <h2 style={{ margin: '0 0 8px 0', fontSize: 18, color: '#1F2933' }}>
              Retirer {aSupprimer.nom} {aSupprimer.prenom}
            </h2>
            <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 18px 0', lineHeight: 1.6 }}>
              Choisissez l'action. Le retrait simple bloque l'accès mais conserve les données.
              La suppression complète efface définitivement l'élève et tous ses travaux.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="button"
                disabled={traitement}
                onClick={() => refuser(aSupprimer)}
                style={{ fontFamily: 'Arial, sans-serif', background: '#FFFFFF', color: '#1F2933', border: '1px solid #C9D6E3', borderRadius: 8, padding: '11px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
              >
                Retrait simple (l'élève passe en refusé, données conservées)
              </button>
              <button
                type="button"
                disabled={traitement}
                onClick={() => supprimer(aSupprimer)}
                style={{ fontFamily: 'Arial, sans-serif', background: '#B0413E', color: '#FFFFFF', border: 'none', borderRadius: 8, padding: '11px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
              >
                Suppression complète (définitive, efface tout)
              </button>
              <button
                type="button"
                disabled={traitement}
                onClick={() => setASupprimer(null)}
                style={{ fontFamily: 'Arial, sans-serif', background: 'none', color: '#6B7280', border: 'none', padding: '6px', fontSize: 13, cursor: 'pointer' }}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const btnRetour: React.CSSProperties = {
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
