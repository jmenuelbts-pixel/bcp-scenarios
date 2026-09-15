// ListeEleves.tsx
// Liste Eleves cote professeur, deux onglets : Appel (presence par seance) et
// Notes (colonnes dynamiques + moyenne auto). Alimentation auto a partir des
// eleves acceptes, tri alphabetique par nom. Controle manuel des notes,
// colonnes et appels.

import { useEffect, useMemo, useState } from 'react'
import { EnteteProf } from '../../components/ui/EnteteProf'
import { COULEUR_PROF } from '../../data/schema'
import { PastilleInitiales, CarteStat, OMBRE_CARTE, DEGRADE_PROF } from '../../lib/theme'
import { listerElevesAcceptes, ajouterEleveManuel, supprimerEleve } from '../../lib/enseignant'
import type { Profil } from '../../lib/auth'
import { exporterBilanPresence } from '../../lib/pdf'
import { SCENARIOS } from '../../data/schema'
import { listerClasses, listerGroupes, listerLiaisonsGroupes, definirGroupeUnique, type Classe, type Groupe, type LiaisonGroupe } from '../../lib/classes'
import {
  datesAppels,
  supprimerAppelDate,
  nbHeuresSeance,
  definirNbHeures,
  creneauxDuJour,
  appliquerAppelAuto,
  enregistrerCreneau,
  definirCreneauColonne,
  enregistrerMotifSeance,
  motifsDuJour,
  CRENEAUX_HORAIRES,
  bilanPresence,
  type BilanPresence,
  listerColonnes,
  ajouterColonne,
  majColonne,
  supprimerColonne,
  listerNotes,
  enregistrerNote,
  importerScoresActivite,
  creerColonnesActivitesManquantes,
  type CreneauAppel,
  type StatutCreneau,
  type ColonneNote,
  type NoteEleve,
  type StatutNote,
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
  const [classes, setClasses] = useState<Classe[]>([])
  const [groupes, setGroupes] = useState<Groupe[]>([])
  const [liaisons, setLiaisons] = useState<LiaisonGroupe[]>([])
  const [filtreClasse, setFiltreClasse] = useState<string>('')
  const [filtreGroupe, setFiltreGroupe] = useState<string>('')

  async function rechargerEleves() {
    const [liste, cl, gr, li] = await Promise.all([
      listerElevesAcceptes(),
      listerClasses(),
      listerGroupes(),
      listerLiaisonsGroupes(),
    ])
    setEleves([...liste].sort(triNom))
    setClasses(cl)
    setGroupes(gr)
    setLiaisons(li)
    setChargement(false)
  }

  useEffect(() => {
    rechargerEleves()
  }, [])

  // Filtrage par classe puis par groupe (le groupe n'a de sens qu'avec une classe).
  const elevesFiltres = eleves.filter((e) => {
    if (filtreClasse && e.classe_id !== filtreClasse) return false
    if (filtreGroupe && !liaisons.some((l) => l.eleve_id === e.id && l.groupe_id === filtreGroupe)) return false
    return true
  })
  const groupesDuFiltre = groupes.filter((g) => g.classe_id === filtreClasse)

  async function ajouter() {
    if (!prenom.trim() || !nom.trim()) {
      alert('Renseignez au moins le prénom et le nom.')
      return
    }
    const { erreur } = await ajouterEleveManuel(prenom.trim(), nom.trim(), email.trim(), filtreClasse || null)
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
    <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#F1F6F3' }}>
      <EnteteProf actif="/enseignant" />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
        <h1 style={{ fontSize: 20, color: '#1F2933', margin: '0 0 16px' }}>Liste des élèves</h1>

        {/* Ajout d'un eleve manuel */}
        <div style={{ background: '#FFFFFF', border: '1px solid #EAF0F5', borderRadius: 14, boxShadow: '0 2px 10px rgba(14, 165, 233, 0.08)', padding: 14, marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1F2933' }}>Ajouter un élève :</span>
          <input value={prenom} onChange={(e) => setPrenom(e.target.value)} placeholder="Prénom" style={champManuel} />
          <input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Nom" style={champManuel} />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (compte connectable)" style={{ ...champManuel, minWidth: 220 }} />
          <button type="button" onClick={ajouter} style={{ fontFamily: 'Arial, sans-serif', background: COULEUR_PROF, color: '#FFFFFF', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            Ajouter
          </button>
          <span style={{ fontSize: 12, color: '#6B7280', width: '100%' }}>Les élèves inscrits acceptés apparaissent automatiquement ; vous pouvez aussi en ajouter manuellement ici.</span>
        </div>

        {/* Filtre classe / groupe */}
        <div style={{ background: '#FFFFFF', border: '1px solid #EAF0F5', borderRadius: 14, boxShadow: '0 2px 10px rgba(14, 165, 233, 0.08)', padding: 12, marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>Filtrer :</span>
          <select value={filtreClasse} onChange={(e) => { setFiltreClasse(e.target.value); setFiltreGroupe('') }} style={{ ...champManuel, minWidth: 180 }}>
            <option value="">Toutes les classes</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
          {filtreClasse && onglet === 'appel' && (
            <select value={filtreGroupe} onChange={(e) => setFiltreGroupe(e.target.value)} style={{ ...champManuel, minWidth: 160 }}>
              <option value="">Tous les groupes</option>
              {groupesDuFiltre.map((g) => <option key={g.id} value={g.id}>{g.nom}</option>)}
            </select>
          )}
          {onglet === 'notes' && filtreClasse && <span style={{ fontSize: 12, color: '#6B7280' }}>Les notes se filtrent par classe (pas par groupe).</span>}
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
                  background: actif ? DEGRADE_PROF : '#FFFFFF',
                  color: actif ? '#FFFFFF' : COULEUR_PROF,
                  border: actif ? 'none' : `1px solid ${COULEUR_PROF}`,
                  borderRadius: 10,
                  padding: '9px 22px',
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
          <OngletAppel eleves={elevesFiltres} />
        ) : (
          <OngletNotes eleves={eleves.filter((e) => !filtreClasse || e.classe_id === filtreClasse)} onRetirer={retirer} groupes={groupes} liaisons={liaisons} onGroupesMaj={rechargerEleves} />
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

// --- Onglet Appel (par heures) --------------------------------------------

function OngletAppel({ eleves }: { eleves: Profil[] }) {
  const [date, setDate] = useState<string>(aujourdhui())
  const [nbHeures, setNbHeures] = useState<number>(1)
  const [creneaux, setCreneaux] = useState<Record<string, CreneauAppel>>({})
  const [libelles, setLibelles] = useState<string[]>([])
  const [motifs, setMotifs] = useState<Record<string, string>>({})
  const [historique, setHistorique] = useState<string[]>([])

  const cle = (eleveId: string, h: number) => eleveId + '-' + h

  async function charger(d: string) {
    // Appel automatique : cree les presences depuis l'historique de connexion
    // (>= 10 min sur un creneau), sans ecraser les saisies manuelles.
    const crActuels = await creneauxDuJour(d)
    await appliquerAppelAuto(d, crActuels)
    const [nb, cr, mo] = await Promise.all([nbHeuresSeance(d), creneauxDuJour(d), motifsDuJour(d)])
    setNbHeures(nb)
    const map: Record<string, CreneauAppel> = {}
    const libs: string[] = Array.from({ length: nb }, () => '')
    for (const c of cr) {
      map[cle(c.etudiant_id, c.heure_index)] = c
      if (c.creneau && c.heure_index < nb) libs[c.heure_index] = c.creneau
    }
    setCreneaux(map)
    setLibelles(libs)
    setMotifs(mo)
  }

  useEffect(() => { charger(date) }, [date])
  useEffect(() => { datesAppels().then(setHistorique) }, [])

  function statut(eleveId: string, h: number): StatutCreneau {
    return creneaux[cle(eleveId, h)]?.statut ?? 'present'
  }

  async function changerNbHeures(nb: number) {
    setNbHeures(nb)
    setLibelles((prev) => {
      const copie = [...prev]
      while (copie.length < nb) copie.push('')
      return copie.slice(0, nb)
    })
    if (eleves[0]) await definirNbHeures(date, nb, eleves[0].id)
    datesAppels().then(setHistorique)
  }

  const ordreStatut: StatutCreneau[] = ['present', 'absent', 'retard', 'exclusion']

  async function cyclerStatut(eleveId: string, h: number) {
    const courant = statut(eleveId, h)
    const suivant = ordreStatut[(ordreStatut.indexOf(courant) + 1) % ordreStatut.length]
    const libelle = libelles[h] || null
    setCreneaux((m) => ({ ...m, [cle(eleveId, h)]: { etudiant_id: eleveId, heure_index: h, creneau: libelle, statut: suivant } }))
    await enregistrerCreneau(date, eleveId, h, libelle, suivant)
    datesAppels().then(setHistorique)
  }

  async function choisirCreneau(h: number, libelle: string) {
    setLibelles((prev) => { const c = [...prev]; c[h] = libelle; return c })
    await definirCreneauColonne(date, h, libelle, eleves.map((e) => e.id))
    charger(date)
  }

  function motifRequis(eleveId: string): boolean {
    for (let h = 0; h < nbHeures; h++) if (statut(eleveId, h) !== 'present') return true
    return false
  }

  function majMotifLocal(eleveId: string, v: string) {
    setMotifs((m) => ({ ...m, [eleveId]: v }))
  }
  async function persisterMotif(eleveId: string) {
    await enregistrerMotifSeance(date, eleveId, motifs[eleveId] ?? '')
  }

  const styleStatut: Record<StatutCreneau, { bg: string; bd: string; fg: string; libelle: string }> = {
    present: { bg: '#E4F5EC', bd: '#8FD3AE', fg: '#0F7A52', libelle: 'Présent' },
    absent: { bg: '#FBE4E2', bd: '#E7A6A0', fg: '#B03A32', libelle: 'Absent' },
    retard: { bg: '#FCEFD6', bd: '#E9C77E', fg: '#996A12', libelle: 'Retard' },
    exclusion: { bg: '#EDE4F7', bd: '#C3A8E4', fg: '#6B3FA0', libelle: 'Exclu' },
  }

  const heures = Array.from({ length: nbHeures }, (_, i) => i)

  // Bilan de presence sur une periode.
  const [bilanDebut, setBilanDebut] = useState<string>(aujourdhui())
  const [bilanFin, setBilanFin] = useState<string>(aujourdhui())
  const [bilan, setBilan] = useState<Record<string, BilanPresence> | null>(null)

  async function calculerBilan() {
    setBilan(await bilanPresence(bilanDebut, bilanFin))
  }

  function exporterBilan() {
    if (!bilan) return
    const lignes = eleves.map((e) => {
      const b = bilan[e.id]
      return {
        nom: e.nom ?? '', prenom: e.prenom ?? '',
        heures_absence: b?.heures_absence ?? 0,
        heures_retard: b?.heures_retard ?? 0,
        heures_exclusion: b?.heures_exclusion ?? 0,
      }
    })
    const periode = `Du ${new Date(bilanDebut).toLocaleDateString('fr-FR')} au ${new Date(bilanFin).toLocaleDateString('fr-FR')}`
    exporterBilanPresence('Bilan de présence', periode, lignes)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <label style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>Date de l'appel</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ fontFamily: 'Arial, sans-serif', border: '1px solid #C9D6E3', borderRadius: 8, padding: '8px 10px', fontSize: 14 }}
        />
        <label style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>Nombre d'heures</label>
        <select
          value={nbHeures}
          onChange={(e) => changerNbHeures(Number(e.target.value))}
          style={{ fontFamily: 'Arial, sans-serif', border: '1px solid #C9D6E3', borderRadius: 8, padding: '8px 10px', fontSize: 14 }}
        >
          {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} heure{n > 1 ? 's' : ''}</option>)}
        </select>
        {historique.length > 0 && (
          <select
            value={historique.includes(date) ? date : ''}
            onChange={(e) => e.target.value && setDate(e.target.value)}
            style={{ fontFamily: 'Arial, sans-serif', border: '1px solid #C9D6E3', borderRadius: 8, padding: '8px 10px', fontSize: 14 }}
          >
            <option value="">Historique des appels</option>
            {historique.map((d) => (
              <option key={d} value={d}>{new Date(d).toLocaleDateString('fr-FR')}</option>
            ))}
          </select>
        )}
        {historique.includes(date) && (
          <button
            type="button"
            onClick={async () => { await supprimerAppelDate(date); charger(date); datesAppels().then(setHistorique) }}
            style={{ fontFamily: 'Arial, sans-serif', background: '#FFFFFF', border: '1px solid #E2C0C0', color: '#A33', borderRadius: 8, padding: '8px 12px', fontSize: 13, cursor: 'pointer' }}
          >
            Supprimer cet appel
          </button>
        )}
      </div>

      <div style={{ overflowX: 'auto', background: '#FFFFFF', border: '1px solid #EAF0F5', borderRadius: 12, boxShadow: OMBRE_CARTE }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, textAlign: 'left', minWidth: 150 }}>Élève</th>
              {heures.map((h) => (
                <th key={h} style={thStyle}>
                  <div style={{ fontSize: 11, color: '#9AA5B1', marginBottom: 3 }}>Heure {h + 1}</div>
                  <select
                    value={libelles[h] ?? ''}
                    onChange={(e) => choisirCreneau(h, e.target.value)}
                    style={{ fontFamily: 'Arial, sans-serif', border: '1px solid #C9D6E3', borderRadius: 6, padding: '3px 5px', fontSize: 12 }}
                  >
                    <option value="">Créneau...</option>
                    {CRENEAUX_HORAIRES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </th>
              ))}
              <th style={{ ...thStyle, textAlign: 'left', minWidth: 220 }}>Motif</th>
            </tr>
          </thead>
          <tbody>
            {eleves.map((e) => {
              const requis = motifRequis(e.id)
              return (
                <tr key={e.id}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                      <PastilleInitiales nom={e.nom} prenom={e.prenom} />
                      {e.nom} {e.prenom}
                    </span>
                  </td>
                  {heures.map((h) => {
                    const s = statut(e.id, h)
                    const st = styleStatut[s]
                    return (
                      <td key={h} style={{ ...tdStyle, textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => cyclerStatut(e.id, h)}
                          style={{ fontFamily: 'Arial, sans-serif', minWidth: 74, borderRadius: 8, padding: '6px 8px', fontSize: 12, fontWeight: 700, cursor: 'pointer', border: '1px solid ' + st.bd, background: st.bg, color: st.fg }}
                        >
                          {st.libelle}
                        </button>
                      </td>
                    )
                  })}
                  <td style={tdStyle}>
                    <input
                      type="text"
                      value={motifs[e.id] ?? ''}
                      disabled={!requis}
                      onChange={(ev) => majMotifLocal(e.id, ev.target.value)}
                      onBlur={() => persisterMotif(e.id)}
                      placeholder={requis ? 'Motif (ex : RDV médical H1, exclu H3)' : '—'}
                      style={{ fontFamily: 'Arial, sans-serif', width: '100%', minWidth: 200, border: '1px solid #C9D6E3', borderRadius: 6, padding: '5px 8px', fontSize: 13, background: requis ? '#FFFFFF' : '#F0F2F5', color: requis ? '#1F2933' : '#9AA5B1' }}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 22, background: '#FFFFFF', border: '1px solid #EAF0F5', borderRadius: 12, boxShadow: OMBRE_CARTE, padding: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: COULEUR_PROF, marginBottom: 10 }}>Bilan de présence sur une période</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
          <label style={{ fontSize: 13, color: '#374151' }}>Du</label>
          <input type="date" value={bilanDebut} onChange={(e) => setBilanDebut(e.target.value)} style={{ fontFamily: 'Arial, sans-serif', border: '1px solid #C9D6E3', borderRadius: 8, padding: '7px 9px', fontSize: 13 }} />
          <label style={{ fontSize: 13, color: '#374151' }}>au</label>
          <input type="date" value={bilanFin} onChange={(e) => setBilanFin(e.target.value)} style={{ fontFamily: 'Arial, sans-serif', border: '1px solid #C9D6E3', borderRadius: 8, padding: '7px 9px', fontSize: 13 }} />
          <button type="button" onClick={calculerBilan} style={{ fontFamily: 'Arial, sans-serif', background: COULEUR_PROF, color: '#FFFFFF', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Calculer</button>
          {bilan && <button type="button" onClick={exporterBilan} style={{ fontFamily: 'Arial, sans-serif', background: '#FFFFFF', color: COULEUR_PROF, border: `1px solid ${COULEUR_PROF}`, borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Exporter en PDF</button>}
        </div>
        {bilan && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, textAlign: 'left' }}>Élève</th>
                  <th style={thStyle}>Absence (h)</th>
                  <th style={thStyle}>Retard (h)</th>
                  <th style={thStyle}>Exclusion (h)</th>
                </tr>
              </thead>
              <tbody>
                {eleves.map((e) => {
                  const b = bilan[e.id]
                  return (
                    <tr key={e.id}>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{e.nom} {e.prenom}</td>
                      <td style={{ ...tdStyle, textAlign: 'center', color: (b?.heures_absence ?? 0) > 0 ? '#C0392B' : '#9AA5B1' }}>{b?.heures_absence ?? 0}</td>
                      <td style={{ ...tdStyle, textAlign: 'center', color: (b?.heures_retard ?? 0) > 0 ? '#996A12' : '#9AA5B1' }}>{b?.heures_retard ?? 0}</td>
                      <td style={{ ...tdStyle, textAlign: 'center', color: (b?.heures_exclusion ?? 0) > 0 ? '#6B3FA0' : '#9AA5B1' }}>{b?.heures_exclusion ?? 0}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p style={{ fontSize: 12, color: '#6B7280', marginTop: 10 }}>
        Choisissez le nombre d'heures de la séance, puis le créneau de chaque heure (12h-13h exclu). Cliquez le statut d'une heure pour le changer : Présent, Absent, Retard, Exclusion. Le motif est global à la séance et s'active dès qu'une heure n'est pas Présent.
      </p>
    </div>
  )
}

// --- Onglet Notes ----------------------------------------------------------

function OngletNotes({ eleves, onRetirer, groupes, liaisons, onGroupesMaj }: { eleves: Profil[]; onRetirer: (e: Profil) => void; groupes: Groupe[]; liaisons: LiaisonGroupe[]; onGroupesMaj: () => void }) {
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
      let cols = await listerColonnes()
      // Cree automatiquement les colonnes manquantes pour les quiz / glisser
      // deja notes, puis recharge la liste.
      const creees = await creerColonnesActivitesManquantes(cols)
      if (creees > 0) cols = await listerColonnes()
      setColonnes(cols)
      for (const c of cols) {
        if (c.activite_liee_mission && c.activite_liee_id) {
          await importerScoresActivite(c)
        }
      }
      setNotes(await listerNotes())
    })()
  }, [])

  // Colonnes visibles selon les eleves affiches (filtre classe cote prof) :
  // une colonne liee a une activite n'apparait que si au moins un eleve
  // affiche a une note pour cette colonne. Les colonnes manuelles (non liees)
  // restent toujours visibles.
  const colonnesVisibles = useMemo(() => {
    const idsEleves = new Set(eleves.map((e) => e.id))
    return colonnes.filter((c) => {
      if (!c.activite_liee_mission || !c.activite_liee_id) return true
      return notes.some((n) => n.colonne_id === c.id && idsEleves.has(n.etudiant_id))
    })
  }, [colonnes, notes, eleves])

  // Liste des activites auto liables (quiz + glisser-deposer de chaque mission).
  const activitesLiables = useMemo(() => {
    const items: { valeur: string; libelle: string }[] = []
    for (const s of SCENARIOS) {
      for (const m of s.missions) {
        items.push({ valeur: `${m.id}::quiz`, libelle: `${s.nom} M${m.numero} — Quiz` })
        items.push({ valeur: `${m.id}::glisser`, libelle: `${s.nom} M${m.numero} — Glisser-déposer` })
        items.push({ valeur: `${m.id}::synthese`, libelle: `${s.nom} M${m.numero} — Synthèse` })
      }
    }
    return items
  }, [])

  function noteDe(colonneId: string, eleveId: string): NoteEleve | undefined {
    return notes.find((n) => n.colonne_id === colonneId && n.etudiant_id === eleveId)
  }

  // Moyenne sur 20, ponderee par coefficient. 'absent'=0, 'non_note' ignore.
  const moyennes = useMemo(() => {
    const res: Record<string, number | null> = {}
    for (const e of eleves) {
      let somme = 0
      let poids = 0
      for (const c of colonnes) {
        if (!c.compter_moyenne) continue
        const coef = c.coefficient ?? 1
        const n = noteDe(c.id, e.id)
        if (!n) continue
        if (n.statut === 'non_note') continue
        if (n.statut === 'absent') { somme += 0; poids += coef }
        else if (n.note !== null) { somme += ((n.note / n.bareme) * 20) * coef; poids += coef }
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
      return [...autres, { id: existante?.id ?? '', colonne_id: colonne.id, etudiant_id: eleveId, note, bareme, statut: 'note', manuel: true }]
    })
    await enregistrerNote(colonne.id, eleveId, note, bareme, 'note', true)
  }

  async function cyclerStatut(colonne: ColonneNote, eleveId: string) {
    const bareme = colonne.bareme ?? 20
    const existante = noteDe(colonne.id, eleveId)
    const courant: StatutNote = existante?.statut ?? 'note'
    const suivant: StatutNote = courant === 'note' ? 'absent' : courant === 'absent' ? 'non_note' : 'note'
    const note = suivant === 'note' ? (existante?.note ?? null) : null
    setNotes((prev) => {
      const autres = prev.filter((n) => !(n.colonne_id === colonne.id && n.etudiant_id === eleveId))
      return [...autres, { id: existante?.id ?? '', colonne_id: colonne.id, etudiant_id: eleveId, note, bareme, statut: suivant, manuel: true }]
    })
    await enregistrerNote(colonne.id, eleveId, note, bareme, suivant, true)
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

      <div style={{ overflowX: 'auto', background: '#FFFFFF', border: '1px solid #EAF0F5', borderRadius: 12, boxShadow: OMBRE_CARTE }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, textAlign: 'left', position: 'sticky', left: 0, background: '#F1F6F3', minWidth: 150 }}>Nom Prénom</th>
              <th style={thStyle}>Inscription</th>
              <th style={thStyle}>Groupe</th>
              <th style={thStyle}>Moyenne /20</th>
              {colonnesVisibles.map((c) => (
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
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 10, color: '#6B7280', marginTop: 4, fontWeight: 400 }}>
                    Coef.
                    <input
                      type="number"
                      min={0}
                      step="0.5"
                      value={c.coefficient ?? 1}
                      onChange={(e) => {
                        const v = e.target.value === '' ? 1 : Number(e.target.value)
                        setColonnes((prev) => prev.map((x) => (x.id === c.id ? { ...x, coefficient: v } : x)))
                      }}
                      onBlur={(e) => majColonne(c.id, { coefficient: e.target.value === '' ? 1 : Number(e.target.value) })}
                      style={{ fontFamily: 'Arial, sans-serif', width: 46, border: '1px solid #E2E8F0', borderRadius: 6, padding: '2px 4px', fontSize: 11, textAlign: 'center' }}
                    />
                  </label>
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
                      style={{ fontFamily: 'Arial, sans-serif', background: '#EAF7EF', border: '1px solid #A8D5BC', color: '#0EA5E9', fontSize: 10, cursor: 'pointer', marginTop: 4, borderRadius: 6, padding: '3px 6px', width: '100%' }}
                    >
                      Rafraîchir les scores
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={async () => {
                      if (!window.confirm(`Supprimer la colonne « ${c.intitule || 'sans nom'} » et toutes ses notes ? Cette action est définitive.`)) return
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
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  {(() => {
                    const gc = groupes.filter((g) => g.classe_id === e.classe_id)
                    const actuel = liaisons.find((l) => l.eleve_id === e.id && gc.some((g) => g.id === l.groupe_id))?.groupe_id ?? ''
                    if (!e.classe_id || gc.length === 0) return <span style={{ fontSize: 11, color: '#9AA5B1' }}>—</span>
                    return (
                      <select
                        value={actuel}
                        onChange={async (ev) => { await definirGroupeUnique(e.id, ev.target.value || null, gc.map((g) => g.id)); onGroupesMaj() }}
                        style={{ fontFamily: 'Arial, sans-serif', border: '1px solid #C9D6E3', borderRadius: 6, padding: '4px 6px', fontSize: 12 }}
                      >
                        <option value="">Aucun</option>
                        {gc.map((g) => <option key={g.id} value={g.id}>{g.nom}</option>)}
                      </select>
                    )
                  })()}
                </td>
                <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 700, color: COULEUR_PROF }}>
                  {moyennes[e.id] !== null ? moyennes[e.id] : '-'}
                </td>
                {colonnesVisibles.map((c) => {
                  const n = noteDe(c.id, e.id)
                  const lie = !!(c.activite_liee_mission && c.activite_liee_id)
                  const statut: StatutNote = n?.statut ?? 'note'
                  const couleurStatut = statut === 'absent' ? '#C0392B' : statut === 'non_note' ? '#6B7280' : '#0EA5E9'
                  const etiquette = statut === 'absent' ? 'Abs' : statut === 'non_note' ? 'NN' : 'Note'
                  return (
                    <td key={c.id} style={{ ...tdStyle, textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                        {statut === 'note' ? (
                          <input
                            type="number"
                            min={0}
                            max={c.bareme}
                            step="0.5"
                            value={n?.note ?? ''}
                            onChange={(ev) => saisirNote(c, e.id, ev.target.value)}
                            placeholder="-"
                            title={lie ? 'Note importée automatiquement (modifiable à la main)' : undefined}
                            style={{ fontFamily: 'Arial, sans-serif', width: 54, border: '1px solid #C9D6E3', borderRadius: 6, padding: '5px 4px', fontSize: 13, textAlign: 'center', background: lie && !n?.manuel ? '#F1F8F4' : '#FFFFFF' }}
                          />
                        ) : (
                          <span style={{ fontSize: 13, fontWeight: 700, color: couleurStatut, width: 54, display: 'inline-block' }}>
                            {statut === 'absent' ? 'Abs' : 'Non noté'}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => cyclerStatut(c, e.id)}
                          title="Statut : Note → Absent → Non noté"
                          style={{ fontFamily: 'Arial, sans-serif', background: 'none', border: `1px solid ${couleurStatut}`, color: couleurStatut, borderRadius: 99, fontSize: 9, cursor: 'pointer', padding: '1px 7px', fontWeight: 700 }}
                        >
                          {etiquette}
                        </button>
                        {statut === 'note' && <div style={{ fontSize: 9, color: '#9AA6B2' }}>/{c.bareme}</div>}
                      </div>
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
