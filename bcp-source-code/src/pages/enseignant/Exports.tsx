// Exports.tsx (professeur)
// Export PDF des donnees d'un eleve : journal de bord, travaux rendus,
// resultats d'activites. L'enseignant choisit un eleve puis le type d'export.

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { COULEUR_PROF, TOUTES_MISSIONS } from '../../data/schema'
import {
  listerElevesAcceptes,
  journalEleve,
  travauxEleve,
  quizEleve,
} from '../../lib/enseignant'
import { listerClasses, type Classe } from '../../lib/classes'
import { imprimerPdf, type SectionPdf } from '../../lib/pdf'
import { titreComplet } from '../../lib/libelles'
import { serialiserMissionPdf, type PartieExport } from '../../lib/serialiserMission'
import type { Profil } from '../../lib/auth'

// Valeurs speciales du filtre de classe.
const TOUTES_CLASSES = '__toutes__'
const SANS_CLASSE = '__sans__'

// Missions proposees a l'export : uniquement celles ou au moins un eleve
// du perimetre courant a laisse une trace.
interface MissionTravaillee {
  id: string
  libelle: string
}

// Les 6 parties exportables (quiz et glisser-deposer separes).
const TOUTES_PARTIES: { id: PartieExport; libelle: string }[] = [
  { id: 'travaux', libelle: 'Devoir à rendre' },
  { id: 'synthese', libelle: 'Synthèse' },
  { id: 'autoeval', libelle: 'Auto-évaluation' },
  { id: 'quiz', libelle: 'Quiz' },
  { id: 'glisser', libelle: 'Glisser-déposer' },
  { id: 'journal', libelle: 'Journal de bord' },
]

const miniBtn: React.CSSProperties = {
  fontFamily: 'Arial, sans-serif',
  background: '#FFFFFF',
  border: '1px solid #CBD5E1',
  borderRadius: 8,
  padding: '4px 12px',
  fontSize: 12,
  fontWeight: 700,
  color: '#374151',
  cursor: 'pointer',
}

// "NOM Prenom" pour le pied de page et les titres.
function nomComplet(e: Profil | undefined): string {
  if (!e) return ''
  return `${e.nom ?? ''} ${e.prenom ?? ''}`.trim()
}

export function Exports() {
  const navigate = useNavigate()
  const [eleves, setEleves] = useState<Profil[]>([])
  const [classes, setClasses] = useState<Classe[]>([])
  const [classeChoisie, setClasseChoisie] = useState<string>(TOUTES_CLASSES)
  const [selection, setSelection] = useState<string>('')
  const [missions, setMissions] = useState<MissionTravaillee[]>([])
  const [missionChoisie, setMissionChoisie] = useState<string>('')
  const [parties, setParties] = useState<PartieExport[]>(TOUTES_PARTIES.map((p) => p.id))
  const [chargement, setChargement] = useState(true)
  const [enCours, setEnCours] = useState(false)

  useEffect(() => {
    Promise.all([listerElevesAcceptes(), listerClasses()]).then(([liste, cl]) => {
      setEleves(liste)
      setClasses(cl)
      setChargement(false)
    })
  }, [])

  // Eleves du perimetre courant, selon le filtre de classe.
  const elevesFiltres = eleves.filter((e) => {
    if (classeChoisie === TOUTES_CLASSES) return true
    if (classeChoisie === SANS_CLASSE) return !e.classe_id
    return e.classe_id === classeChoisie
  })

  // Si l'eleve selectionne sort du perimetre, on annule la selection.
  useEffect(() => {
    if (selection && !elevesFiltres.some((e) => e.id === selection)) {
      setSelection('')
    }
  }, [classeChoisie, elevesFiltres, selection])

  // Toutes les missions codees (tous scenarios), afin de pouvoir exporter une
  // version vierge meme si aucun eleve ne l'a encore travaillee.
  useEffect(() => {
    const liste = TOUTES_MISSIONS
      .map(({ mission }) => ({ id: mission.id, libelle: titreComplet(mission.id) }))
      .sort((a, b) => a.libelle.localeCompare(b.libelle, 'fr'))
    setMissions(liste)
    setMissionChoisie((prec) => (liste.some((m) => m.id === prec) ? prec : liste[0]?.id ?? ''))
  }, [])

  const eleve = eleves.find((e) => e.id === selection)
  const nomEleve = nomComplet(eleve)
  const nomClasse =
    classeChoisie === TOUTES_CLASSES
      ? 'Tous les élèves'
      : classeChoisie === SANS_CLASSE
        ? 'Élèves sans classe'
        : (classes.find((c) => c.id === classeChoisie)?.nom ?? 'Classe')

  // Construit les sections d'un eleve pour une mission donnee.
  // La correction du professeur est en rouge (nature 'prof').
  async function sectionsMission(eleveId: string, missionId: string): Promise<SectionPdf[]> {
    const [travaux, journal, quiz] = await Promise.all([
      travauxEleve(eleveId),
      journalEleve(eleveId),
      quizEleve(eleveId),
    ])
    const t = travaux.filter((x) => x.mission_id === missionId)
    const j = journal.filter((x) => x.mission_id === missionId)
    const q = quiz.filter((x) => x.mission_id === missionId)
    const sections: SectionPdf[] = []

    sections.push({
      titre: 'Travail rendu',
      paragraphes: t.length === 0 ? ['Aucun travail rendu pour cette mission.'] : undefined,
      lignes: t.flatMap((x) => [
        { label: "Réponses de l'élève", valeur: x.contenu, nature: 'eleve' as const },
        { label: 'Correction', valeur: x.correction, nature: 'prof' as const },
      ]),
    })
    sections.push({
      titre: 'Journal de bord',
      paragraphes: j.length === 0 ? ['Aucune entrée pour cette mission.'] : undefined,
      lignes: j.flatMap((x) => [
        { label: "Ce qui n'a pas été réussi", valeur: x.non_reussi, nature: 'eleve' as const },
        { label: 'Ce qui a été le moins bien réussi', valeur: x.moins_bien_reussi, nature: 'eleve' as const },
      ]),
    })
    sections.push({
      titre: 'Résultats des activités',
      paragraphes: q.length === 0 ? ['Aucun résultat enregistré pour cette mission.'] : undefined,
      lignes: q.map((x) => ({
        label: 'Score obtenu',
        valeur: x.score !== null ? `${x.score} point(s)` : null,
        nature: 'eleve' as const,
      })),
    })
    return sections
  }

  // Export fidele d'une mission pour un eleve (version remplie), cote prof.
  async function exporterMissionEleve(eleveId: string) {
    if (!missionChoisie || parties.length === 0) return
    const paire = TOUTES_MISSIONS.find((x) => x.mission.id === missionChoisie)
    const el = eleves.find((e) => e.id === eleveId)
    if (!paire) return
    setEnCours(true)
    try {
      const doc = await serialiserMissionPdf(paire.scenario.id, missionChoisie, 'rempli', eleveId, nomComplet(el), { parties, sansDate: false })
      if (doc) imprimerPdf(doc)
    } finally {
      setEnCours(false)
    }
  }

  // Export fidele d'une mission en version VIERGE (a imprimer/distribuer).
  async function exporterMissionVierge() {
    if (!missionChoisie || parties.length === 0) return
    const paire = TOUTES_MISSIONS.find((x) => x.mission.id === missionChoisie)
    if (!paire) return
    setEnCours(true)
    try {
      const doc = await serialiserMissionPdf(paire.scenario.id, missionChoisie, 'vierge', undefined, undefined, { parties, sansDate: false })
      if (doc) imprimerPdf(doc)
    } finally {
      setEnCours(false)
    }
  }

  // Export d'une mission pour toute la classe : version vierge (a distribuer).
  // Les copies remplies s'exportent eleve par eleve pour rester fideles.
  async function exporterMissionClasse() {
    await exporterMissionVierge()
  }

  // Export global du dossier d'un eleve, toutes missions confondues.
  async function exporter(type: 'journal' | 'travaux' | 'activites' | 'tout') {
    if (!selection || !eleve) return
    setEnCours(true)

    const sections: SectionPdf[] = []

    if (type === 'journal' || type === 'tout') {
      const journal = await journalEleve(selection)
      sections.push({
        titre: 'Journal de bord',
        paragraphes: journal.length === 0 ? ['Aucune entrée.'] : undefined,
        lignes: journal.flatMap((j) => [
          { label: titreComplet(j.mission_id), valeur: '', nature: 'neutre' as const },
          { label: "Ce qui n'a pas été réussi", valeur: j.non_reussi, nature: 'eleve' as const },
          { label: 'Ce qui a été le moins bien réussi', valeur: j.moins_bien_reussi, nature: 'eleve' as const },
        ]),
      })
    }

    if (type === 'travaux' || type === 'tout') {
      const travaux = await travauxEleve(selection)
      sections.push({
        titre: 'Travaux rendus',
        paragraphes: travaux.length === 0 ? ['Aucun travail rendu.'] : undefined,
        lignes: travaux.flatMap((t) => [
          { label: titreComplet(t.mission_id), valeur: '', nature: 'neutre' as const },
          { label: "Réponses de l'élève", valeur: t.contenu, nature: 'eleve' as const },
          { label: 'Correction', valeur: t.correction, nature: 'prof' as const },
        ]),
      })
    }

    if (type === 'activites' || type === 'tout') {
      const quiz = await quizEleve(selection)
      sections.push({
        titre: 'Résultats des activités',
        paragraphes: quiz.length === 0 ? ['Aucun résultat enregistré.'] : undefined,
        lignes: quiz.map((q) => ({
          label: titreComplet(q.mission_id),
          valeur: q.score !== null ? `${q.score} point(s)` : null,
          nature: 'eleve' as const,
        })),
      })
    }

    imprimerPdf({
      titre: `Dossier de ${nomEleve}`,
      sousTitre: eleve.email ?? undefined,
      sections,
      piedNom: nomEleve,
    })
    setEnCours(false)
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#F1F6F3' }}>
      <header style={{ background: COULEUR_PROF, color: '#FFFFFF', padding: '16px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <button type="button" onClick={() => navigate('/enseignant')} style={btnRetour}>
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
              <polyline points="15,5 8,12 15,19" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Tableau de bord
          </button>
          <h1 style={{ margin: 0, fontSize: 21, fontWeight: 700 }}>Exports PDF</h1>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
        <section style={{ background: '#FFFFFF', border: '1px solid #EAF0F5', borderRadius: 14, boxShadow: '0 2px 10px rgba(14, 165, 233, 0.08)', padding: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>
            Classe
          </label>
          <select
            value={classeChoisie}
            onChange={(e) => setClasseChoisie(e.target.value)}
            disabled={chargement}
            style={selectStyle}
          >
            <option value={TOUTES_CLASSES}>Tous les élèves</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
            <option value={SANS_CLASSE}>Élèves sans classe</option>
          </select>

          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', margin: '18px 0 8px' }}>
            Mission
          </label>
          <select
            value={missionChoisie}
            onChange={(e) => setMissionChoisie(e.target.value)}
            disabled={enCours}
            style={selectStyle}
          >
            {missions.map((m) => (
              <option key={m.id} value={m.id}>{m.libelle}</option>
            ))}
          </select>

          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: 16, marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1F2933' }}>Parties à inclure</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button type="button" onClick={() => setParties(TOUTES_PARTIES.map((p) => p.id))} style={miniBtn}>Tout</button>
                <button type="button" onClick={() => setParties([])} style={miniBtn}>Rien</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px 16px' }}>
              {TOUTES_PARTIES.map((p) => (
                <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={parties.includes(p.id)}
                    onChange={(e) => setParties((prec) => e.target.checked ? [...prec, p.id] : prec.filter((x) => x !== p.id))}
                  />
                  {p.libelle}
                </label>
              ))}
            </div>
            <div style={{ marginTop: 14 }}>
              <BoutonExport
                libelle="Exporter la version vierge (à imprimer)"
                principal
                onClick={exporterMissionVierge}
                disabled={enCours || !missionChoisie || parties.length === 0}
              />
              <p style={{ fontSize: 11.5, color: '#6B7280', margin: '8px 0 0' }}>
                Exercice complet à distribuer : documents, questions et zones à remplir. Sans réponse ni correction.
              </p>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #E2E8F0', margin: '22px 0 0', paddingTop: 18 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>
              Version remplie d'un élève
            </label>
            {chargement ? (
              <p style={{ fontSize: 13, color: '#6B7280' }}>Chargement...</p>
            ) : elevesFiltres.length === 0 ? (
              <p style={{ fontSize: 13, color: '#6B7280' }}>Aucun élève dans ce périmètre.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {elevesFiltres.map((e) => (
                  <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, background: '#FFFFFF', border: '1px solid #E5EAF0', borderRadius: 10, padding: '10px 14px' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#1F2933' }}>{e.nom} {e.prenom}</span>
                    <button
                      type="button"
                      onClick={() => exporterMissionEleve(e.id)}
                      disabled={enCours || !missionChoisie || parties.length === 0}
                      style={{ fontFamily: 'Arial, sans-serif', background: enCours || !missionChoisie || parties.length === 0 ? '#9BB8DE' : '#1B7A4B', color: '#FFFFFF', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: enCours ? 'wait' : 'pointer', whiteSpace: 'nowrap' }}
                    >
                      Exporter rempli
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <p style={{ fontSize: 12, color: '#6B7280', marginTop: 14, lineHeight: 1.5 }}>
          L'export ouvre la fenêtre d'impression du navigateur. Choisir la destination "Enregistrer en PDF".
        </p>
      </main>
    </div>
  )
}

function BoutonExport({
  libelle,
  onClick,
  disabled,
  principal,
}: {
  libelle: string
  onClick: () => void
  disabled: boolean
  principal?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        fontFamily: 'Arial, sans-serif',
        background: disabled ? '#C9CDD2' : principal ? COULEUR_PROF : '#FFFFFF',
        color: principal ? '#FFFFFF' : COULEUR_PROF,
        border: principal ? 'none' : `1px solid ${COULEUR_PROF}`,
        borderRadius: 8,
        padding: '10px 18px',
        fontSize: 13,
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 3 h7 l4 4 v14 a1 1 0 0 1 -1 1 H7 a1 1 0 0 1 -1 -1 V4 a1 1 0 0 1 1 -1 z" fill="none" stroke={principal ? '#FFFFFF' : COULEUR_PROF} strokeWidth="2" strokeLinejoin="round" />
        <polyline points="9,14 12,17 15,14" fill="none" stroke={principal ? '#FFFFFF' : COULEUR_PROF} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {libelle}
    </button>
  )
}

const selectStyle: React.CSSProperties = {
  fontFamily: 'Arial, sans-serif',
  width: '100%',
  maxWidth: 420,
  border: '1px solid #C9D6E3',
  borderRadius: 8,
  padding: '10px 12px',
  fontSize: 14,
  color: '#1F2933',
  background: '#FFFFFF',
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
