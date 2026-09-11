// Synthese.tsx
// Vue de pilotage par classe : pour chaque eleve, moyenne generale ponderee,
// assiduite (heures d'absence/retard/exclusion) et travaux rendus/corriges,
// plus des statistiques de classe. Export PDF d'un bulletin par eleve.

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { COULEUR_PROF } from '../../data/schema'
import { listerElevesAcceptes, tousLesTravaux } from '../../lib/enseignant'
import { listerClasses, listerGroupes, listerLiaisonsGroupes, type Classe, type Groupe, type LiaisonGroupe } from '../../lib/classes'
import { listerColonnes, listerNotes, bilanPresence, type ColonneNote, type NoteEleve, type BilanPresence } from '../../lib/listeEleves'
import { imprimerPdf, NOM_ENSEIGNANT, type DocumentPdf } from '../../lib/pdf'
import type { Profil } from '../../lib/auth'

function aujourdhui(): string {
  return new Date().toISOString().slice(0, 10)
}

function moyenneEleve(eleveId: string, colonnes: ColonneNote[], notes: NoteEleve[]): number | null {
  let somme = 0
  let poids = 0
  for (const c of colonnes) {
    if (!c.compter_moyenne) continue
    const coef = c.coefficient ?? 1
    const n = notes.find((x) => x.colonne_id === c.id && x.etudiant_id === eleveId)
    if (!n || n.statut === 'non_note') continue
    if (n.statut === 'absent') { poids += coef }
    else if (n.note !== null) { somme += ((n.note / n.bareme) * 20) * coef; poids += coef }
  }
  return poids === 0 ? null : Math.round((somme / poids) * 10) / 10
}

export function Synthese() {
  const navigate = useNavigate()
  const [eleves, setEleves] = useState<Profil[]>([])
  const [colonnes, setColonnes] = useState<ColonneNote[]>([])
  const [notes, setNotes] = useState<NoteEleve[]>([])
  const [travaux, setTravaux] = useState<{ eleveId: string; corrige: boolean }[]>([])
  const [bilan, setBilan] = useState<Record<string, BilanPresence>>({})
  const [classes, setClasses] = useState<Classe[]>([])
  const [groupes, setGroupes] = useState<Groupe[]>([])
  const [liaisons, setLiaisons] = useState<LiaisonGroupe[]>([])
  const [filtreClasse, setFiltreClasse] = useState<string>('')
  const [filtreGroupe, setFiltreGroupe] = useState<string>('')
  const [debut, setDebut] = useState<string>('2026-09-01')
  const [fin, setFin] = useState<string>(aujourdhui())
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    async function charger() {
      const [el, cols, nts, tv, cs, gs, ls] = await Promise.all([
        listerElevesAcceptes(), listerColonnes(), listerNotes(), tousLesTravaux(),
        listerClasses(), listerGroupes(), listerLiaisonsGroupes(),
      ])
      setEleves(el); setColonnes(cols); setNotes(nts)
      setTravaux(tv.map((t) => ({ eleveId: t.eleveId, corrige: t.corrige })))
      setClasses(cs); setGroupes(gs); setLiaisons(ls)
      setBilan(await bilanPresence(debut, fin))
      setChargement(false)
    }
    charger()
  }, [])

  async function recalculerBilan() {
    setBilan(await bilanPresence(debut, fin))
  }

  const elevesFiltres = useMemo(() => eleves.filter((e) => {
    if (filtreClasse && e.classe_id !== filtreClasse) return false
    if (filtreGroupe && !liaisons.some((l) => l.eleve_id === e.id && l.groupe_id === filtreGroupe)) return false
    return true
  }), [eleves, filtreClasse, filtreGroupe, liaisons])

  const groupesDuFiltre = groupes.filter((g) => g.classe_id === filtreClasse)

  const lignes = useMemo(() => elevesFiltres.map((e) => {
    const moy = moyenneEleve(e.id, colonnes, notes)
    const b = bilan[e.id]
    const tvEleve = travaux.filter((t) => t.eleveId === e.id)
    return {
      eleve: e,
      moyenne: moy,
      absence: b?.heures_absence ?? 0,
      retard: b?.heures_retard ?? 0,
      exclusion: b?.heures_exclusion ?? 0,
      rendus: tvEleve.length,
      corriges: tvEleve.filter((t) => t.corrige).length,
    }
  }), [elevesFiltres, colonnes, notes, bilan, travaux])

  // Statistiques de classe.
  const stats = useMemo(() => {
    const avecMoy = lignes.filter((l) => l.moyenne !== null)
    const moyClasse = avecMoy.length > 0 ? Math.round((avecMoy.reduce((s, l) => s + (l.moyenne ?? 0), 0) / avecMoy.length) * 10) / 10 : null
    const totalAbs = lignes.reduce((s, l) => s + l.absence, 0)
    const totalRendus = lignes.reduce((s, l) => s + l.rendus, 0)
    const totalCorriges = lignes.reduce((s, l) => s + l.corriges, 0)
    return { moyClasse, totalAbs, totalRendus, totalCorriges, effectif: lignes.length }
  }, [lignes])

  function exporterBulletin(l: typeof lignes[number]) {
    const doc: DocumentPdf = {
      titre: `Bulletin de synthèse — ${l.eleve.nom} ${l.eleve.prenom}`,
      sousTitre: `Période du ${new Date(debut).toLocaleDateString('fr-FR')} au ${new Date(fin).toLocaleDateString('fr-FR')}`,
      sections: [
        { titre: 'Résultats', lignes: [{ label: 'Moyenne générale (/20)', valeur: l.moyenne !== null ? String(l.moyenne) : 'Non évaluée', nature: 'neutre' }] },
        { titre: 'Assiduité', lignes: [
          { label: "Heures d'absence", valeur: String(l.absence), nature: 'neutre' },
          { label: 'Heures de retard', valeur: String(l.retard), nature: 'neutre' },
          { label: "Heures d'exclusion", valeur: String(l.exclusion), nature: 'neutre' },
        ] },
        { titre: 'Travaux', lignes: [
          { label: 'Travaux rendus', valeur: String(l.rendus), nature: 'neutre' },
          { label: 'Travaux corrigés', valeur: String(l.corriges), nature: 'neutre' },
        ] },
      ],
      piedNom: NOM_ENSEIGNANT,
    }
    imprimerPdf(doc)
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#F1F6F3' }}>
      <header style={{ background: COULEUR_PROF, color: '#FFFFFF', padding: '16px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <button type="button" onClick={() => navigate('/enseignant')} style={btnRetour}>
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><polyline points="15,5 8,12 15,19" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Tableau de bord
          </button>
          <h1 style={{ margin: 0, fontSize: 21, fontWeight: 700 }}>Synthèse par classe</h1>
        </div>
      </header>

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
          <select value={filtreClasse} onChange={(e) => { setFiltreClasse(e.target.value); setFiltreGroupe('') }} style={champ}>
            <option value="">Toutes les classes</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
          <select value={filtreGroupe} onChange={(e) => setFiltreGroupe(e.target.value)} disabled={!filtreClasse || groupesDuFiltre.length === 0} style={{ ...champ, background: !filtreClasse ? '#F0F2F5' : '#FFFFFF' }}>
            <option value="">{filtreClasse ? 'Toute la classe' : "Choisir une classe d'abord"}</option>
            {groupesDuFiltre.map((g) => <option key={g.id} value={g.id}>{g.nom}</option>)}
          </select>
          <label style={{ fontSize: 13, color: '#374151' }}>Du</label>
          <input type="date" value={debut} onChange={(e) => setDebut(e.target.value)} style={champ} />
          <label style={{ fontSize: 13, color: '#374151' }}>au</label>
          <input type="date" value={fin} onChange={(e) => setFin(e.target.value)} style={champ} />
          <button type="button" onClick={recalculerBilan} style={{ ...champ, background: COULEUR_PROF, color: '#FFFFFF', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Actualiser l'assiduité</button>
        </div>

        {/* Statistiques de classe */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
          <Stat valeur={stats.effectif} libelle="Élèves" accent="#0EA5E9" fond="#E4EDFF" />
          <Stat valeur={stats.moyClasse !== null ? stats.moyClasse : '-'} libelle="Moyenne de classe /20" accent="#0F9E75" fond="#E4F5EC" />
          <Stat valeur={stats.totalAbs} libelle="Heures d'absence (total)" accent="#C0392B" fond="#FBE4E2" />
          <Stat valeur={`${stats.totalCorriges}/${stats.totalRendus}`} libelle="Travaux corrigés / rendus" accent="#E08A1E" fond="#FCEFD6" />
        </div>

        {chargement ? (
          <p style={{ fontSize: 14, color: '#6B7280' }}>Chargement...</p>
        ) : lignes.length === 0 ? (
          <p style={{ fontSize: 14, color: '#6B7280' }}>Aucun élève dans ce périmètre.</p>
        ) : (
          <div style={{ overflowX: 'auto', background: '#FFFFFF', border: '1px solid #EAF0F5', borderRadius: 12 }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={{ ...th, textAlign: 'left' }}>Élève</th>
                  <th style={th}>Moyenne /20</th>
                  <th style={th}>Absence (h)</th>
                  <th style={th}>Retard (h)</th>
                  <th style={th}>Exclusion (h)</th>
                  <th style={th}>Travaux</th>
                  <th style={th}>Bulletin</th>
                </tr>
              </thead>
              <tbody>
                {lignes.map((l) => (
                  <tr key={l.eleve.id}>
                    <td style={{ ...td, fontWeight: 600 }}>{l.eleve.nom} {l.eleve.prenom}</td>
                    <td style={{ ...td, textAlign: 'center', fontWeight: 700, color: COULEUR_PROF }}>{l.moyenne !== null ? l.moyenne : '-'}</td>
                    <td style={{ ...td, textAlign: 'center', color: l.absence > 0 ? '#C0392B' : '#9AA5B1' }}>{l.absence}</td>
                    <td style={{ ...td, textAlign: 'center', color: l.retard > 0 ? '#996A12' : '#9AA5B1' }}>{l.retard}</td>
                    <td style={{ ...td, textAlign: 'center', color: l.exclusion > 0 ? '#6B3FA0' : '#9AA5B1' }}>{l.exclusion}</td>
                    <td style={{ ...td, textAlign: 'center' }}>{l.corriges}/{l.rendus}</td>
                    <td style={{ ...td, textAlign: 'center' }}>
                      <button type="button" onClick={() => exporterBulletin(l)} style={{ fontFamily: 'Arial, sans-serif', background: '#FFFFFF', color: COULEUR_PROF, border: `1px solid ${COULEUR_PROF}`, borderRadius: 8, padding: '5px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>PDF</button>
                    </td>
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

function Stat({ valeur, libelle, accent, fond }: { valeur: number | string; libelle: string; accent: string; fond: string }) {
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #EAF0F5', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ minWidth: 46, height: 46, padding: '0 8px', borderRadius: 11, background: fond, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 800, color: accent }}>{valeur}</span>
      <span style={{ fontSize: 13, color: '#4B5563', fontWeight: 600 }}>{libelle}</span>
    </div>
  )
}

const champ: React.CSSProperties = { fontFamily: 'Arial, sans-serif', border: '1px solid #C9D6E3', borderRadius: 8, padding: '8px 10px', fontSize: 14 }
const th: React.CSSProperties = { padding: '10px 8px', borderBottom: '1px solid #E2E8F0', fontSize: 12, color: '#374151', textAlign: 'center' }
const td: React.CSSProperties = { padding: '9px 8px', borderBottom: '1px solid #EEF2F6', color: '#1F2933' }
const btnRetour: React.CSSProperties = { fontFamily: 'Arial, sans-serif', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#FFFFFF', borderRadius: 99, padding: '6px 14px', fontSize: 13, cursor: 'pointer', marginBottom: 10, display: 'inline-flex', alignItems: 'center', gap: 6 }
