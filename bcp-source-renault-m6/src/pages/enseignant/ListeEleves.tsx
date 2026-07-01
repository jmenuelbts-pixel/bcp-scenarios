// ListeEleves.tsx
// Liste Eleves cote professeur, deux onglets : Appel (presence par seance) et
// Notes (colonnes dynamiques + moyenne auto). Alimentation auto a partir des
// eleves acceptes, tri alphabetique par nom. Controle manuel des notes,
// colonnes et appels.

import { useEffect, useMemo, useState } from 'react'
import { EnteteProf } from '../../components/ui/EnteteProf'
import { COULEUR_PROF } from '../../data/schema'
import { listerElevesAcceptes } from '../../lib/enseignant'
import type { Profil } from '../../lib/auth'
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

  useEffect(() => {
    listerElevesAcceptes().then((liste) => {
      setEleves([...liste].sort(triNom))
      setChargement(false)
    })
  }, [])

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#F4F7FA' }}>
      <EnteteProf actif="/enseignant" />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
        <h1 style={{ fontSize: 20, color: '#1F2933', margin: '0 0 16px' }}>Liste des élèves</h1>

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
          <OngletNotes eleves={eleves} />
        )}
      </main>
    </div>
  )
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

function OngletNotes({ eleves }: { eleves: Profil[] }) {
  const [colonnes, setColonnes] = useState<ColonneNote[]>([])
  const [notes, setNotes] = useState<NoteEleve[]>([])
  const [nouvelleColonne, setNouvelleColonne] = useState('')

  async function rechargerColonnes() {
    setColonnes(await listerColonnes())
  }
  async function rechargerNotes() {
    setNotes(await listerNotes())
  }

  useEffect(() => {
    rechargerColonnes()
    rechargerNotes()
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
    const existante = noteDe(colonne.id, eleveId)
    const bareme = existante?.bareme ?? 20
    setNotes((prev) => {
      const autres = prev.filter((n) => !(n.colonne_id === colonne.id && n.etudiant_id === eleveId))
      return [...autres, { id: existante?.id ?? '', colonne_id: colonne.id, etudiant_id: eleveId, note, bareme }]
    })
    await enregistrerNote(colonne.id, eleveId, note, bareme)
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
          onClick={async () => {
            if (!nouvelleColonne.trim()) return
            await ajouterColonne(nouvelleColonne.trim())
            setNouvelleColonne('')
            rechargerColonnes()
          }}
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
                  {e.nom} {e.prenom}
                </td>
                <td style={{ ...tdStyle, textAlign: 'center', color: '#6B7280' }}>
                  {e.created_at ? new Date(e.created_at).toLocaleDateString('fr-FR') : '-'}
                </td>
                <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 700, color: COULEUR_PROF }}>
                  {moyennes[e.id] !== null ? moyennes[e.id] : '-'}
                </td>
                {colonnes.map((c) => {
                  const n = noteDe(c.id, e.id)
                  return (
                    <td key={c.id} style={{ ...tdStyle, textAlign: 'center' }}>
                      <input
                        type="number"
                        min={0}
                        step="0.5"
                        value={n?.note ?? ''}
                        onChange={(ev) => saisirNote(c, e.id, ev.target.value)}
                        placeholder="-"
                        style={{ fontFamily: 'Arial, sans-serif', width: 54, border: '1px solid #C9D6E3', borderRadius: 6, padding: '5px 4px', fontSize: 13, textAlign: 'center' }}
                      />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 12, color: '#6B7280', marginTop: 10 }}>
        Les notes sont saisies sur 20. La moyenne ne tient compte que des colonnes cochées "compter".
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
