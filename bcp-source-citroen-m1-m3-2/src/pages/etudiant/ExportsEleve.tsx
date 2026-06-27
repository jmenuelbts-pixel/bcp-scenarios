// ExportsEleve.tsx (eleve)
// L'eleve exporte en PDF ses propres donnees : journal de bord, travaux,
// resultats d'activites. Meme moteur d'impression que cote professeur.

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import { getMission } from '../../data/schema'
import {
  journalEleve,
  travauxEleve,
  quizEleve,
} from '../../lib/enseignant'
import { imprimerPdf, type SectionPdf } from '../../lib/pdf'

function titreMission(missionId: string): string {
  const scenarioId = missionId.split('-m')[0]
  const m = getMission(scenarioId, missionId)
  return m ? `Mission ${m.numero} - ${m.titre}` : missionId
}

export function ExportsEleve() {
  const navigate = useNavigate()
  const { session, profil } = useAuth()
  const eleveId = session?.user?.id
  const [enCours, setEnCours] = useState(false)

  async function exporter(type: 'journal' | 'travaux' | 'activites' | 'tout') {
    if (!eleveId) return
    setEnCours(true)
    const sections: SectionPdf[] = []

    if (type === 'journal' || type === 'tout') {
      const journal = await journalEleve(eleveId)
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
      const travaux = await travauxEleve(eleveId)
      sections.push({
        titre: 'Mes travaux',
        paragraphes: travaux.length === 0 ? ['Aucun travail rendu.'] : undefined,
        lignes: travaux.flatMap((t) => [
          { label: titreMission(t.mission_id), valeur: t.contenu },
          { label: 'Correction du professeur', valeur: t.correction },
        ]),
      })
    }
    if (type === 'activites' || type === 'tout') {
      const quiz = await quizEleve(eleveId)
      sections.push({
        titre: 'Mes résultats',
        paragraphes: quiz.length === 0 ? ['Aucun résultat enregistré.'] : undefined,
        lignes: quiz.map((q) => ({
          label: titreMission(q.mission_id),
          valeur: q.score !== null ? `${q.score} point(s)` : 'Non noté',
        })),
      })
    }

    imprimerPdf({
      titre: profil ? `Mon dossier - ${profil.prenom} ${profil.nom}` : 'Mon dossier',
      sections,
    })
    setEnCours(false)
  }

  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #EAF3FB 0%, #D6E8F7 45%, #C2DCF2 100%)',
        padding: '0 0 48px 0',
      }}
    >
      <header style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '16px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{ fontFamily: 'Arial, sans-serif', background: 'none', border: 'none', color: '#16456E', fontSize: 14, cursor: 'pointer', padding: 0, marginBottom: 8, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <polyline points="11,6 5,12 11,18" fill="none" stroke="#16456E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Retour
          </button>
          <h1 style={{ margin: 0, fontSize: 20, color: '#16456E' }}>Exporter mes données</h1>
        </div>
      </header>

      <main style={{ maxWidth: 760, margin: '20px auto 0', padding: '0 24px' }}>
        <div style={{ background: '#FFFFFF', borderRadius: 14, border: '1px solid #DCE8F4', padding: 20 }}>
          <p style={{ fontSize: 14, color: '#374151', marginTop: 0 }}>
            Choisir un document à enregistrer en PDF.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <Bouton libelle="Journal de bord" onClick={() => exporter('journal')} disabled={enCours} />
            <Bouton libelle="Mes travaux" onClick={() => exporter('travaux')} disabled={enCours} />
            <Bouton libelle="Mes résultats" onClick={() => exporter('activites')} disabled={enCours} />
            <Bouton libelle="Tout" principal onClick={() => exporter('tout')} disabled={enCours} />
          </div>
          <p style={{ fontSize: 12, color: '#6B7280', marginTop: 16, lineHeight: 1.5 }}>
            L'export ouvre la fenêtre d'impression. Choisir "Enregistrer en PDF".
          </p>
        </div>
      </main>
    </div>
  )
}

function Bouton({
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
        background: disabled ? '#C9CDD2' : principal ? '#2E7DB8' : '#FFFFFF',
        color: principal ? '#FFFFFF' : '#2E7DB8',
        border: principal ? 'none' : '1px solid #2E7DB8',
        borderRadius: 8,
        padding: '10px 18px',
        fontSize: 13,
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {libelle}
    </button>
  )
}
