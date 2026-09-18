// PresenceTempsReel.tsx
// Presence des eleves en temps reel (sondage 5 s).
// Niveau 1 : statut (vert clignotant / orange / gris) + page consultee.
// Niveau 2 : en mission, onglet exact ouvert + barre de progression.

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { COULEUR_PROF, ONGLETS_PAR_ID, type OngletId } from '../../data/schema'
import { listerElevesAcceptes } from '../../lib/enseignant'
import { listerClasses, listerGroupes, listerLiaisonsGroupes, type Classe, type Groupe, type LiaisonGroupe } from '../../lib/classes'
import { sonderPresences, diagnostiquer, type PresenceEleve, type StatutPresence } from '../../lib/presence'
import { useAuth } from '../../lib/auth'
import type { Profil } from '../../lib/auth'

const COULEUR_STATUT: Record<StatutPresence, string> = {
  connecte: '#2E8B57',
  inactif: '#C2792E',
  hors_ligne: '#9AA5B1',
}

const LIBELLE_STATUT: Record<StatutPresence, string> = {
  connecte: 'En ligne',
  inactif: 'Inactif',
  hors_ligne: 'Hors ligne',
}

function formaterDelai(secondes: number): string {
  if (!Number.isFinite(secondes)) return ''
  if (secondes < 60) return `il y a ${Math.round(secondes)} s`
  const min = Math.round(secondes / 60)
  if (min < 60) return `il y a ${min} min`
  return `il y a ${Math.round(min / 60)} h`
}

// Date et heure exactes de la derniere connexion (ex : "15/09 à 23h47").
function formaterDerniereConnexion(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const jj = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${jj}/${mm} à ${hh}h${mi}`
}

export function PresenceTempsReel() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [eleves, setEleves] = useState<Profil[]>([])
  const [presences, setPresences] = useState<Record<string, PresenceEleve>>({})
  const [chargement, setChargement] = useState(true)
  const [diag, setDiag] = useState<string | null>(null)
  const [classes, setClasses] = useState<Classe[]>([])
  const [groupes, setGroupes] = useState<Groupe[]>([])
  const [liaisons, setLiaisons] = useState<LiaisonGroupe[]>([])
  const [filtreClasse, setFiltreClasse] = useState<string>('')
  const [filtreGroupe, setFiltreGroupe] = useState<string>('')

  async function lancerDiagnostic() {
    setDiag('Test en cours...')
    const uid = session?.user?.id
    if (!uid) {
      setDiag('Aucune session active.')
      return
    }
    setDiag(await diagnostiquer(uid))
  }

  useEffect(() => {
    let actif = true
    listerElevesAcceptes().then((liste) => {
      if (actif) setEleves(liste)
    })
    Promise.all([listerClasses(), listerGroupes(), listerLiaisonsGroupes()]).then(([cs, gs, ls]) => {
      if (!actif) return
      setClasses(cs); setGroupes(gs); setLiaisons(ls)
    })
    const arreter = sonderPresences((liste) => {
      if (!actif) return
      const parId: Record<string, PresenceEleve> = {}
      for (const p of liste) parId[p.etudiant_id] = p
      setPresences(parId)
      setChargement(false)
    })
    return () => {
      actif = false
      arreter()
    }
  }, [])

  const collator = useMemo(() => new Intl.Collator('fr', { sensitivity: 'base' }), [])
  const ordreStatut: Record<StatutPresence, number> = { connecte: 0, inactif: 1, hors_ligne: 2 }

  const elevesFiltres = useMemo(() => {
    return eleves.filter((e) => {
      if (filtreClasse && e.classe_id !== filtreClasse) return false
      if (filtreGroupe && !liaisons.some((l) => l.eleve_id === e.id && l.groupe_id === filtreGroupe)) return false
      return true
    })
  }, [eleves, filtreClasse, filtreGroupe, liaisons])

  const groupesDuFiltre = groupes.filter((g) => g.classe_id === filtreClasse)

  const elevesTries = useMemo(() => {
    return [...elevesFiltres].sort((a, b) => {
      const sa = presences[a.id]?.statut ?? 'hors_ligne'
      const sb = presences[b.id]?.statut ?? 'hors_ligne'
      if (ordreStatut[sa] !== ordreStatut[sb]) return ordreStatut[sa] - ordreStatut[sb]
      return collator.compare(a.nom ?? '', b.nom ?? '')
    })
  }, [elevesFiltres, presences, collator])

  const nbEnLigne = useMemo(
    () => elevesFiltres.filter((e) => presences[e.id]?.statut === 'connecte').length,
    [elevesFiltres, presences]
  )

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#F1F6F3' }}>
      <style>{'@keyframes pulsePresence{0%{opacity:1}50%{opacity:0.3}100%{opacity:1}}'}</style>
      <header style={{ background: COULEUR_PROF, color: '#FFFFFF', padding: '16px 24px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <button type="button" onClick={() => navigate('/enseignant')} style={btnRetour}>
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
              <polyline points="15,5 8,12 15,19" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Tableau de bord
          </button>
          <h1 style={{ margin: 0, fontSize: 21, fontWeight: 700 }}>Présence en temps réel</h1>
          <p style={{ margin: '6px 0 0 0', fontSize: 13, opacity: 0.9 }}>
            {nbEnLigne} en ligne sur {elevesFiltres.length}. Mise à jour automatique.
          </p>
        </div>
      </header>

      <main style={{ maxWidth: 980, margin: '0 auto', padding: 24 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
          <select value={filtreClasse} onChange={(e) => { setFiltreClasse(e.target.value); setFiltreGroupe('') }} style={{ fontFamily: 'Arial, sans-serif', border: '1px solid #C9D6E3', borderRadius: 8, padding: '8px 10px', fontSize: 14 }}>
            <option value="">Toutes les classes</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
          <select value={filtreGroupe} onChange={(e) => setFiltreGroupe(e.target.value)} disabled={!filtreClasse || groupesDuFiltre.length === 0} style={{ fontFamily: 'Arial, sans-serif', border: '1px solid #C9D6E3', borderRadius: 8, padding: '8px 10px', fontSize: 14, background: !filtreClasse ? '#F0F2F5' : '#FFFFFF' }}>
            <option value="">{filtreClasse ? 'Toute la classe' : "Choisir une classe d'abord"}</option>
            {groupesDuFiltre.map((g) => <option key={g.id} value={g.id}>{g.nom}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center', marginBottom: 18, fontSize: 12, color: '#4B5563' }}>
          <Legende couleur={COULEUR_STATUT.connecte} texte="En ligne" />
          <Legende couleur={COULEUR_STATUT.inactif} texte="Inactif" />
          <Legende couleur={COULEUR_STATUT.hors_ligne} texte="Hors ligne" />
          <button
            type="button"
            onClick={lancerDiagnostic}
            style={{ fontFamily: 'Arial, sans-serif', marginLeft: 'auto', background: '#FFFFFF', border: '1px solid #C9D6E3', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: '#4B5563', cursor: 'pointer' }}
          >
            Tester la connexion
          </button>
          {diag && (
            <span style={{ fontSize: 12, fontWeight: 700, color: diag.startsWith('OK') ? '#2E8B57' : '#C0392B', flexBasis: '100%' }}>
              {diag}
            </span>
          )}
        </div>

        {chargement ? (
          <p style={{ fontSize: 14, color: '#6B7280' }}>Chargement en cours...</p>
        ) : elevesFiltres.length === 0 ? (
          <p style={{ fontSize: 14, color: '#6B7280' }}>Aucun élève dans ce périmètre.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {elevesTries.map((e) => {
              const p = presences[e.id]
              const statut: StatutPresence = p?.statut ?? 'hors_ligne'
              const couleur = COULEUR_STATUT[statut]
              const enLigne = statut !== 'hors_ligne'
              const page = enLigne && p?.page ? p.page : 'Hors ligne'
              const enMission = !!(enLigne && p?.mission_id)
              const ongletId = p?.onglet_id as OngletId | null | undefined
              const libelleOnglet = ongletId ? ONGLETS_PAR_ID[ongletId]?.libelle ?? null : null
              const surActivites = ongletId === 'activites'
              // Detail entre parentheses dans page (ex : "Activités - Quiz").
              const detailPage = p?.page?.match(/\(([^)]+)\)\s*$/)?.[1] ?? null
              const libelleNiveau2 = detailPage ?? libelleOnglet
              const progression = enMission ? Math.max(0, Math.min(100, p?.progression ?? 0)) : 0

              return (
                <div key={e.id} style={{ background: '#FFFFFF', border: '1px solid #EAF0F5', borderRadius: 14, boxShadow: '0 2px 10px rgba(14, 165, 233, 0.08)', padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span
                      aria-hidden="true"
                      style={{ width: 12, height: 12, borderRadius: 99, background: couleur, flexShrink: 0, animation: statut === 'connecte' ? 'pulsePresence 1.2s ease-in-out infinite' : 'none' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#1F2933' }}>{e.nom} {e.prenom}</div>
                      <div style={{ fontSize: 13, color: '#6B7280' }}>{page}</div>
                    </div>
                    <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: couleur }}>{LIBELLE_STATUT[statut]}</div>
                      {p && enLigne && <div style={{ fontSize: 11, color: '#9AA5B1' }}>{formaterDelai(p.secondesDepuis)}</div>}
                      {p && !enLigne && p.updated_at && (
                        <div style={{ fontSize: 11, color: '#9AA5B1' }}>Vu le {formaterDerniereConnexion(p.updated_at)}</div>
                      )}
                    </div>
                  </div>

                  {enMission && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #EDF1F5', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <span
                          aria-hidden="true"
                          style={{ width: 10, height: 10, borderRadius: 99, background: surActivites ? '#2E8B57' : '#C2792E', animation: surActivites ? 'pulsePresence 1.2s ease-in-out infinite' : 'none' }}
                        />
                        <span style={{ fontSize: 12, fontWeight: 700, color: surActivites ? '#2E8B57' : '#4B5563' }}>
                          {libelleNiveau2 ? `Onglet : ${libelleNiveau2}` : 'Dans la mission'}
                        </span>
                      </span>
                      <span style={{ flex: 1, minWidth: 160, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ flex: 1, height: 7, background: '#EDF1F5', borderRadius: 99, overflow: 'hidden' }}>
                          <span style={{ display: 'block', height: '100%', width: `${progression}%`, background: COULEUR_PROF, borderRadius: 99 }} />
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: COULEUR_PROF, width: 36, textAlign: 'right' }}>{progression} %</span>
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

function Legende({ couleur, texte }: { couleur: string; texte: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 10, height: 10, borderRadius: 99, background: couleur }} />
      {texte}
    </span>
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
