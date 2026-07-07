// ListeEleves.tsx
// Liste Eleves cote professeur, deux onglets : Appel (presence par seance) et
// Notes (colonnes dynamiques + moyenne auto). Alimentation auto a partir des
// eleves acceptes, tri alphabetique par nom. Controle manuel des notes,
// colonnes et appels.

import { useEffect, useMemo, useState } from 'react'
import { EnteteProf } from '../../components/ui/EnteteProf'
import { COULEUR_PROF } from '../../data/schema'
import { listerElevesAcceptes, ajouterEleveManuel, supprimerEleve } from '../../lib/enseignant'
import type { Profil } from '../../lib/auth'
import { SCENARIOS } from '../../data/schema'
import {
  appelsDuJour,
  datesAppels,
  enregistrerAppel,
  supprimerAppelDate,
  listerColonnes,
  ajouterColonne,
  majColonne,
  supprimerColonne,
  listerNotes,
  enregistrerNote,
  importerScoresActivite,
  type Appel,
  type ColonneNote,
  type NoteEleve,
} from '../../lib/listeEleves'

function aujourdhui(): string {
  return new Date().toISOString().slice(0, 10)
}

function triNom(a: Profil, b: Profil): number {
  return (a.nom ?? '').localeCompare(b.nom ?? '', 'fr')
}

export function ListeEleves() {
  const [onglet, setOnglet] = useState<'appel' | 'notes'>('appel')
  const [eleves, setEleves] = useState<Profil[]>([])
  const [chargement, setChargement] = useState(true)
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')

  async function rechargerEleves() {
    const liste = await listerElevesAcceptes()
    setEleves([...liste].sort(triNom))
    setChargement(false)
  }

  useEffect(() => {
    rechargerEleves()
  }, [])

  async function ajouter() {
    if (!prenom.trim() || !nom.trim()) {
      alert('Renseignez au moins le prénom et le nom.')
      return
    }
    const { erreur } = await ajouterEleveManuel(prenom.trim(), nom.trim(), email.trim())
    if (erreur) {
      alert("L'ajout a échoué. Vérifiez que la migration SQL des notes a bien été exécutée dans Supabase.\n\nDétail : " + erreur)
      return
    }
    setPrenom(''); setNom(''); setEmail('')
    rechargerEleves()
  }

  async function retirer(e: Profil) {
    if (!window.confirm(`Supprimer l'élève ${e.prenom ?? ''} ${e.nom ?? ''} ? Ses notes et appels seront aussi supprimés.`)) return
    const { erreur } = await supprimerEleve(e.id)
    if (erreur) { alert('Suppression impossible : ' + erreur); return }
    rechargerEleves()
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#F4F7FA' }}>
      <EnteteProf actif="/enseignant" />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
        <h1 style={{ fontSize: 20, color: '#1F2933', margin: '0 0 16px' }}>Liste des élèves</h1>

        {/* Ajout d'un eleve manuel */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 14, marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1F2933' }}>Ajouter un élève :</span>
          <input value={prenom} onChange={(e) => setPrenom(e.target.value)} placeholder="Prénom" style={champManuel} />
          <input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Nom" style={champManuel} />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (compte connectable)" style={{ ...champManuel, minWidth: 220 }} />
          <button type="button" onClick={ajouter} style={{ fontFamily: 'Arial, sans-serif', background: COULEUR_PROF, color: '#FFFFFF', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            Ajouter
          </button>
          <span style={{ fontSize: 12, color: '#6B7280', width: '100%' }}>Les élèves inscrits acceptés apparaissent automatiquement ; vous pouvez aussi en ajouter manuellement ici.</span>
        </div>

        {/* Onglets */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          {(['appel', 'notes'] as const).map((o) => {
            const actif = onglet === o
            return (
              <button
                key={o}
                type="button"
                onClick={() => setOnglet(o)}
                style={{
                  fontFamily: 'Arial, sans-serif',
                  background: actif ? COULEUR_PROF : '#FFFFFF',
                  color: actif ? '#FFFFFF' : COULEUR_PROF,
                  border: `1px solid ${COULEUR_PROF}`,
                  borderRadius: 99,
                  padding: '8px 20px',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {o === 'appel' ? 'Appel' : 'Notes'}
              </button>
            )
          })}
        </div>

        {chargement ? (
          <p style={{ fontSize: 13, color: '#6B7280' }}>Chargement...</p>
        ) : eleves.length === 0 ? (
          <p style={{ fontSize: 13, color: '#6B7280' }}>Aucun élève accepté pour le moment.</p>
        ) : onglet === 'appel' ? (
          <OngletAppel eleves={eleves} />
        ) : (
          <OngletNotes eleves={eleves} onRetirer={retirer} />
        )}
      </main>
    </div>
  )
}

const champManuel: React.CSSProperties = {
  fontFamily: 'Arial, sans-serif',
  border: '1px solid #C9D6E3',
  borderRadius: 8,
  padding: '8px 10px',
  fontSize: 14,
  minWidth: 120,
}

// --- Onglet Appel ----------------------------------------------------------

function OngletAppel({ eleves }: { eleves: Profil[] }) {
  const [date, setDate] = useState<string>(aujourdhui())
  const [appels, setAppels] = useState<Record<string, Appel>>({})
  const [historique, setHistorique] = useState<string[]>([])

  async function charger(d: string) {
    const liste = await appelsDuJour(d)
    const map: Record<string, Appel> = {}
    for (const a of liste) map[a.etudiant_id] = a
    setAppels(map)
  }

  useEffect(() => {
    charger(date)
  }, [date])

  useEffect(() => {
    datesAppels().then(setHistorique)
  }, [])

  function etat(eleveId: string): { absent: boolean; retard: number | null } {
    const a = appels[eleveId]
    return { absent: a?.absent ?? false, retard: a?.retard_minutes ?? null }
  }

  async function basculerAbsent(eleveId: string) {
    const e = etat(eleveId)
    const absent = !e.absent
    setAppels((m) => ({
      ...m,
      [eleveId]: { ...(m[eleveId] ?? { id: '', date_appel: date, etudiant_id: eleveId }), absent, retard_minutes: absent ? null : e.retard } as Appel,
    }))
    await enregistrerAppel(date, eleveId, absent, absent ? null : e.retard)
    datesAppels().then(setHistorique)
  }

  async function majRetard(eleveId: string, minutes: number | null) {
    const e = etat(eleveId)
    if (e.absent) return
    setAppels((m) => ({
      ...m,
      [eleveId]: { ...(m[eleveId] ?? { id: '', date_appel: date, etudiant_id: eleveId, absent: false }), retard_minutes: minutes } as Appel,
    }))
    await enregistrerAppel(date, eleveId, false, minutes)
    datesAppels().then(setHistorique)
  }

  const nbAbsents = eleves.filter((e) => etat(e.id).absent).length
  const nbPresents = eleves.length - nbAbsents

  return (
    <div>
      {/* Barre date + historique */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <label style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>Date de l'appel</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ fontFamily: 'Arial, sans-serif', border: '1px solid #C9D6E3', borderRadius: 8, padding: '8px 10px', fontSize: 14 }}
        />
        {historique.length > 0 && (
          <select
            value={historique.includes(date) ? date : ''}
            onChange={(e) => e.target.value && setDate(e.target.value)}
            style={{ fontFamily: 'Arial, sans-serif', border: '1px solid #C9D6E3', borderRadius: 8, padding: '8px 10px', fontSize: 14 }}
          >
            <option value="">Historique des appels</option>
            {historique.map((d) => (
              <option key={d} value={d}>
                {new Date(d).toLocaleDateString('fr-FR')}
              </option>
            ))}
          </select>
        )}
        {historique.includes(date) && (
          <button
            type="button"
            onClick={async () => {
              await supprimerAppelDate(date)
              setAppels({})
              datesAppels().then(setHistorique)
            }}
            style={{ fontFamily: 'Arial, sans-serif', background: '#FFFFFF', border: '1px solid #E2C0C0', color: '#A33', borderRadius: 8, padding: '8px 12px', fontSize: 13, cursor: 'pointer' }}
          >
            Supprimer cet appel
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: 13 }}>
        <span style={{ color: '#2E8B57', fontWeight: 700 }}>Présents : {nbPresents}</span>
        <span style={{ color: '#A33', fontWeight: 700 }}>Absents : {nbAbsents}</span>
      </div>

      <div style={{ overflowX: 'auto', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12 }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, textAlign: 'left' }}>Élève</th>
              <th style={thStyle}>Absent</th>
              <th style={thStyle}>Retard (min)</th>
            </tr>
          </thead>
          <tbody>
            {eleves.map((e) => {
              const s = etat(e.id)
              return (
                <tr key={e.id}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{e.nom} {e.prenom}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <input type="checkbox" checked={s.absent} onChange={() => basculerAbsent(e.id)} style={{ width: 18, height: 18, cursor: 'pointer' }} />
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <input
                      type="number"
                      min={0}
                      value={s.retard ?? ''}
                      disabled={s.absent}
                      onChange={(ev) => majRetard(e.id, ev.target.value === '' ? null : Number(ev.target.value))}
                      placeholder="-"
                      style={{
                        fontFamily: 'Arial, sans-serif',
                        width: 64,
                        border: '1px solid #C9D6E3',
                        borderRadius: 6,
                        padding: '5px 7px',
                        fontSize: 13,
                        textAlign: 'center',
                        background: s.absent ? '#F0F2F5' : '#FFFFFF',
                        color: s.absent ? '#9AA5B1' : '#1F2933',
                      }}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// --- Onglet Notes ----------------------------------------------------------

function OngletNotes({ eleves, onRetirer }: { eleves: Profil[]; onRetirer: (e: Profil) => void }) {
  const [colonnes, setColonnes] = useState<ColonneNote[]>([])
  const [notes, setNotes] = useState<NoteEleve[]>([])
  const [nouvelleColonne, setNouvelleColonne] = useState('')

  async function rechargerColonnes() {
    setColonnes(await listerColonnes())
  }
  async function rechargerNotes() {
    setNotes(await listerNotes())
  }

  // Au chargement : import automatique et continu des scores pour chaque
  // colonne liee a une activite auto (quiz / glisser-deposer).
  useEffect(() => {
    (async () => {
      const cols = await listerColonnes()
      setColonnes(cols)
      for (const c of cols) {
        if (c.activite_liee_mission && c.activite_liee_id) {
          await importerScoresActivite(c)
        }
      }
      setNotes(await listerNotes())
    })()
  }, [])

  // Liste des activites auto liables (quiz + glisser-deposer de chaque mission).
  const activitesLiables = useMemo(() => {
    const items: { valeur: string; libelle: string }[] = []
    for (const s of SCENARIOS) {
      for (const m of s.missions) {
        items.push({ valeur: `${m.id}::quiz`, libelle: `${s.nom} M${m.numero} — Quiz` })
        items.push({ valeur: `${m.id}::glisser`, libelle: `${s.nom} M${m.numero} — Glisser-déposer` })
      }
    }
    return items
  }, [])

  function noteDe(colonneId: string, eleveId: string): NoteEleve | undefined {
    return notes.find((n) => n.colonne_id === colonneId && n.etudiant_id === eleveId)
  }

  // Moyenne d'un eleve sur 20, sur les colonnes comptees uniquement.
  const moyennes = useMemo(() => {
    const res: Record<string, number | null> = {}
    for (const e of eleves) {
      let somme = 0
      let poids = 0
      for (const c of colonnes) {
        if (!c.compter_moyenne) continue
        const n = noteDe(c.id, e.id)
        if (n && n.note !== null) {
          somme += (n.note / n.bareme) * 20
          poids += 1
        }
      }
      res[e.id] = poids === 0 ? null : Math.round((somme / poids) * 10) / 10
    }
    return res
  }, [eleves, colonnes, notes])

  async function saisirNote(colonne: ColonneNote, eleveId: string, valeur: string) {
    const note = valeur === '' ? null : Number(valeur)
    const bareme = colonne.bareme ?? 20
    const existante = noteDe(colonne.id, eleveId)
    setNotes((prev) => {
      const autres = prev.filter((n) => !(n.colonne_id === colonne.id && n.etudiant_id === eleveId))
      return [...autres, { id: existante?.id ?? '', colonne_id: colonne.id, etudiant_id: eleveId, note, bareme }]
    })
    await enregistrerNote(colonne.id, eleveId, note, bareme)
  }

  async function creerColonne() {
    if (!nouvelleColonne.trim()) return
    const { erreur } = await ajouterColonne(nouvelleColonne.trim())
    if (erreur) {
      alert("La création de la colonne a échoué. Vérifiez que la migration SQL des notes a bien été exécutée dans Supabase.\n\nDétail : " + erreur)
      return
    }
    setNouvelleColonne('')
    rechargerColonnes()
  }

  // Rafraichit les scores importes pour une colonne liee a une activite.
  async function rafraichirColonne(colonne: ColonneNote) {
    const { reportees, erreur } = await importerScoresActivite(colonne)
    if (erreur) { alert('Import impossible : ' + erreur); return }
    await rechargerNotes()
    alert(`${reportees} note(s) importée(s) depuis l'activité.`)
  }

  return (
    <div>
      {/* Ajout colonne */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        <input
          value={nouvelleColonne}
          onChange={(e) => setNouvelleColonne(e.target.value)}
          placeholder="Nom d'une nouvelle colonne (ex : Chap 1 - Quiz)"
          style={{ fontFamily: 'Arial, sans-serif', flex: 1, minWidth: 200, border: '1px solid #C9D6E3', borderRadius: 8, padding: '8px 10px', fontSize: 14 }}
        />
        <button
          type="button"
          onClick={creerColonne}
          style={{ fontFamily: 'Arial, sans-serif', background: COULEUR_PROF, color: '#FFFFFF', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
        >
          Ajouter une colonne
        </button>
      </div>

      <div style={{ overflowX: 'auto', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12 }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, textAlign: 'left', position: 'sticky', left: 0, background: '#F4F7FA', minWidth: 150 }}>Nom Prénom</th>
              <th style={thStyle}>Inscription</th>
              <th style={thStyle}>Moyenne /20</th>
              {colonnes.map((c) => (
                <th key={c.id} style={{ ...thStyle, minWidth: 130 }}>
                  <input
                    value={c.intitule}
                    onChange={(e) =>
                      setColonnes((prev) => prev.map((x) => (x.id === c.id ? { ...x, intitule: e.target.value } : x)))
                    }
                    onBlur={(e) => majColonne(c.id, { intitule: e.target.value })}
                    style={{ fontFamily: 'Arial, sans-serif', width: '100%', border: 'none', background: 'transparent', fontSize: 12, fontWeight: 700, color: '#1F2933', textAlign: 'center' }}
                  />
                  <input
                    type="date"
                    value={c.date_eval ?? ''}
                    onChange={(e) => {
                      const v = e.target.value || null
                      setColonnes((prev) => prev.map((x) => (x.id === c.id ? { ...x, date_eval: v } : x)))
                      majColonne(c.id, { date_eval: v })
                    }}
                    style={{ fontFamily: 'Arial, sans-serif', border: '1px solid #E2E8F0', borderRadius: 6, padding: '2px 4px', fontSize: 11, marginTop: 4, width: '100%' }}
                  />
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 10, color: '#6B7280', marginTop: 4, fontWeight: 400 }}>
                    <input
                      type="checkbox"
                      checked={c.compter_moyenne}
                      onChange={(e) => {
                        const v = e.target.checked
                        setColonnes((prev) => prev.map((x) => (x.id === c.id ? { ...x, compter_moyenne: v } : x)))
                        majColonne(c.id, { compter_moyenne: v })
                      }}
                    />
                    compter
                  </label>
                  <select
                    value={c.bareme}
                    onChange={(e) => {
                      const v = Number(e.target.value)
                      setColonnes((prev) => prev.map((x) => (x.id === c.id ? { ...x, bareme: v } : x)))
                      majColonne(c.id, { bareme: v })
                    }}
                    style={{ fontFamily: 'Arial, sans-serif', border: '1px solid #E2E8F0', borderRadius: 6, padding: '2px 4px', fontSize: 11, marginTop: 4, width: '100%' }}
                  >
                    <option value={20}>Sur 20</option>
                    <option value={10}>Sur 10</option>
                  </select>
                  <select
                    value={c.activite_liee_mission && c.activite_liee_id ? `${c.activite_liee_mission}::${c.activite_liee_id}` : ''}
                    onChange={(e) => {
                      const v = e.target.value
                      const [mission, act] = v ? v.split('::') : [null, null]
                      setColonnes((prev) => prev.map((x) => (x.id === c.id ? { ...x, activite_liee_mission: mission, activite_liee_id: act } : x)))
                      majColonne(c.id, { activite_liee_mission: mission, activite_liee_id: act })
                    }}
                    title="Lier cette colonne à une activité auto (report des scores)"
                    style={{ fontFamily: 'Arial, sans-serif', border: '1px solid #E2E8F0', borderRadius: 6, padding: '2px 4px', fontSize: 10, marginTop: 4, width: '100%' }}
                  >
                    <option value="">Saisie manuelle</option>
                    {activitesLiables.map((a) => (
                      <option key={a.valeur} value={a.valeur}>{a.libelle}</option>
                    ))}
                  </select>
                  {c.activite_liee_mission && c.activite_liee_id && (
                    <button
                      type="button"
                      onClick={() => rafraichirColonne(c)}
                      style={{ fontFamily: 'Arial, sans-serif', background: '#EAF7EF', border: '1px solid #A8D5BC', color: '#1B6B3A', fontSize: 10, cursor: 'pointer', marginTop: 4, borderRadius: 6, padding: '3px 6px', width: '100%' }}
                    >
                      Rafraîchir les scores
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={async () => {
                      await supprimerColonne(c.id)
                      rechargerColonnes()
                      rechargerNotes()
                    }}
                    style={{ fontFamily: 'Arial, sans-serif', background: 'none', border: 'none', color: '#A33', fontSize: 10, cursor: 'pointer', marginTop: 2 }}
                  >
                    supprimer
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {eleves.map((e) => (
              <tr key={e.id}>
                <td style={{ ...tdStyle, fontWeight: 600, position: 'sticky', left: 0, background: '#FFFFFF' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    {e.nom} {e.prenom}
                    <button type="button" onClick={() => onRetirer(e)} title="Supprimer cet élève" style={{ fontFamily: 'Arial, sans-serif', background: 'none', border: 'none', color: '#C1554F', fontSize: 12, cursor: 'pointer', padding: 0 }}>✕</button>
                  </span>
                </td>
                <td style={{ ...tdStyle, textAlign: 'center', color: '#6B7280' }}>
                  {e.created_at ? new Date(e.created_at).toLocaleDateString('fr-FR') : '-'}
                </td>
                <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 700, color: COULEUR_PROF }}>
                  {moyennes[e.id] !== null ? moyennes[e.id] : '-'}
                </td>
                {colonnes.map((c) => {
                  const n = noteDe(c.id, e.id)
                  const lie = !!(c.activite_liee_mission && c.activite_liee_id)
                  return (
                    <td key={c.id} style={{ ...tdStyle, textAlign: 'center' }}>
                      <input
                        type="number"
                        min={0}
                        max={c.bareme}
                        step="0.5"
                        value={n?.note ?? ''}
                        onChange={(ev) => saisirNote(c, e.id, ev.target.value)}
                        placeholder="-"
                        title={lie ? 'Note importée automatiquement (modifiable à la main)' : undefined}
                        style={{ fontFamily: 'Arial, sans-serif', width: 54, border: '1px solid #C9D6E3', borderRadius: 6, padding: '5px 4px', fontSize: 13, textAlign: 'center', background: lie ? '#F1F8F4' : '#FFFFFF' }}
                      />
                      <div style={{ fontSize: 9, color: '#9AA6B2' }}>/{c.bareme}</div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 12, color: '#6B7280', marginTop: 10 }}>
        La moyenne (sur 20) ne tient compte que des colonnes cochées "compter". Une colonne liée à une activité (quiz / glisser-déposer) importe automatiquement les scores ; les notes restent modifiables à la main. Barème choisissable par colonne (sur 20 ou sur 10).
      </p>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: '10px 8px',
  borderBottom: '1px solid #E2E8F0',
  fontSize: 12,
  color: '#374151',
  textAlign: 'center',
  verticalAlign: 'top',
}

const tdStyle: React.CSSProperties = {
  padding: '9px 8px',
  borderBottom: '1px solid #EEF2F6',
  color: '#1F2933',
}
