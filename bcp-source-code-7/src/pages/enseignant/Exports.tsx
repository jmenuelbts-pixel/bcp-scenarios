// Exports.tsx (professeur)
// Export PDF des donnees d'un eleve : journal de bord, travaux rendus,
// resultats d'activites. L'enseignant choisit un eleve puis le type d'export.

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { COULEUR_PROF, getMission } from '../../data/schema'
import {
  listerElevesAcceptes,
  journalEleve,
  travauxEleve,
  quizEleve,
} from '../../lib/enseignant'
import { imprimerPdf, type SectionPdf } from '../../lib/pdf'
import type { Profil } from '../../lib/auth'

function titreMission(missionId: string): string {
  const scenarioId = missionId.split('-m')[0]
  const m = getMission(scenarioId, missionId)
  return m ? `Mission ${m.numero} - ${m.titre}` : missionId
}

export function Exports() {
  const navigate = useNavigate()
  const [eleves, setEleves] = useState<Profil[]>([])
  const [selection, setSelection] = useState<string>('')
  const [chargement, setChargement] = useState(true)
  const [enCours, setEnCours] = useState(false)

  useEffect(() => {
    listerElevesAcceptes().then((liste) => {
      setEleves(liste)
      setChargement(false)
    })
  }, [])

  const eleve = eleves.find((e) => e.id === selection)
  const nomEleve = eleve ? `${eleve.nom} ${eleve.prenom}` : ''

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
          { label: titreMission(j.mission_id), valeur: '' },
          { label: "Ce qui n'a pas été réussi", valeur: j.non_reussi },
          { label: 'Ce qui a été le moins bien réussi', valeur: j.moins_bien_reussi },
        ]),
      })
    }

    if (type === 'travaux' || type === 'tout') {
      const travaux = await travauxEleve(selection)
      sections.push({
        titre: 'Travaux rendus',
        paragraphes: travaux.length === 0 ? ['Aucun travail rendu.'] : undefined,
        lignes: travaux.flatMap((t) => [
          { label: titreMission(t.mission_id), valeur: t.contenu },
          { label: 'Correction', valeur: t.correction },
        ]),
      })
    }

    if (type === 'activites' || type === 'tout') {
      const quiz = await quizEleve(selection)
      sections.push({
        titre: 'Résultats des activités',
        paragraphes: quiz.length === 0 ? ['Aucun résultat enregistré.'] : undefined,
        lignes: quiz.map((q) => ({
          label: titreMission(q.mission_id),
          valeur: q.score !== null ? `${q.score} point(s)` : 'Non noté',
        })),
      })
    }

    imprimerPdf({
      titre: `Dossier de ${nomEleve}`,
      sousTitre: eleve.email ?? undefined,
      sections,
    })
    setEnCours(false)
  }

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
          <h1 style={{ margin: 0, fontSize: 21, fontWeight: 700 }}>Exports PDF</h1>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
        <section style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>
            Choisir un élève
          </label>
          {chargement ? (
            <p style={{ fontSize: 13, color: '#6B7280' }}>Chargement...</p>
          ) : eleves.length === 0 ? (
            <p style={{ fontSize: 13, color: '#6B7280' }}>Aucun élève accepté.</p>
          ) : (
            <select
              value={selection}
              onChange={(e) => setSelection(e.target.value)}
              style={{ fontFamily: 'Arial, sans-serif', width: '100%', maxWidth: 360, border: '1px solid #C9D6E3', borderRadius: 8, padding: '10px 12px', fontSize: 14, color: '#1F2933' }}
            >
              <option value="">-- Sélectionner --</option>
              {eleves.map((e) => (
                <option key={e.id} value={e.id}>{e.nom} {e.prenom}</option>
              ))}
            </select>
          )}

          {selection && (
            <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <BoutonExport libelle="Journal de bord" onClick={() => exporter('journal')} disabled={enCours} />
              <BoutonExport libelle="Travaux" onClick={() => exporter('travaux')} disabled={enCours} />
              <BoutonExport libelle="Activités" onClick={() => exporter('activites')} disabled={enCours} />
              <BoutonExport libelle="Dossier complet" principal onClick={() => exporter('tout')} disabled={enCours} />
            </div>
          )}
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
