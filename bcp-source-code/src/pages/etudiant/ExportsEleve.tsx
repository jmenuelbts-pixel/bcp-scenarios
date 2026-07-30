// ExportsEleve.tsx (eleve)
// L'eleve exporte en PDF ses propres donnees : journal de bord, travaux,
// resultats d'activites. Meme moteur d'impression que cote professeur.

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import {
  journalEleve,
  travauxEleve,
  quizEleve,
} from '../../lib/enseignant'
import { imprimerPdf, type SectionPdf } from '../../lib/pdf'
import { titreComplet } from '../../lib/libelles'

// Missions sur lesquelles l'eleve a effectivement travaille : seules
// celles-ci apparaissent dans la liste d'export par mission.
interface MissionTravaillee {
  id: string
  libelle: string
}

export function ExportsEleve() {
  const navigate = useNavigate()
  const { session, profil } = useAuth()
  const eleveId = session?.user?.id
  const [enCours, setEnCours] = useState(false)
  const [missions, setMissions] = useState<MissionTravaillee[]>([])
  const [missionChoisie, setMissionChoisie] = useState('')
  const [chargementMissions, setChargementMissions] = useState(true)

  // Nom affiche en pied de page sur chaque page du PDF.
  const nomEleve = profil ? `${profil.nom ?? ''} ${profil.prenom ?? ''}`.trim() : ''

  // Recense les missions ou l'eleve a laisse une trace (travail, journal ou
  // resultat), pour ne proposer que celles-la a l'export.
  useEffect(() => {
    if (!eleveId) return
    let actif = true
    async function charger() {
      const [travaux, journal, quiz] = await Promise.all([
        travauxEleve(eleveId as string),
        journalEleve(eleveId as string),
        quizEleve(eleveId as string),
      ])
      const ids = new Set<string>()
      travaux.forEach((t) => ids.add(t.mission_id))
      journal.forEach((j) => ids.add(j.mission_id))
      quiz.forEach((q) => ids.add(q.mission_id))
      const liste = Array.from(ids)
        .map((id) => ({ id, libelle: titreComplet(id) }))
        .sort((a, b) => a.libelle.localeCompare(b.libelle, 'fr'))
      if (!actif) return
      setMissions(liste)
      setMissionChoisie(liste.length > 0 ? liste[0].id : '')
      setChargementMissions(false)
    }
    charger()
    return () => {
      actif = false
    }
  }, [eleveId])

  // Export d'une seule mission : le pied de page porte le scenario et la mission.
  async function exporterMission() {
    if (!eleveId || !missionChoisie) return
    setEnCours(true)
    const [travaux, journal, quiz] = await Promise.all([
      travauxEleve(eleveId),
      journalEleve(eleveId),
      quizEleve(eleveId),
    ])
    const t = travaux.filter((x) => x.mission_id === missionChoisie)
    const j = journal.filter((x) => x.mission_id === missionChoisie)
    const q = quiz.filter((x) => x.mission_id === missionChoisie)
    const sections: SectionPdf[] = []

    sections.push({
      titre: 'Mon travail',
      paragraphes: t.length === 0 ? ['Aucun travail rendu pour cette mission.'] : undefined,
      lignes: t.map((x) => ({ label: 'Mes réponses', valeur: x.contenu, nature: 'eleve' as const })),
    })
    sections.push({
      titre: 'Mon journal de bord',
      paragraphes: j.length === 0 ? ['Aucune entrée pour cette mission.'] : undefined,
      lignes: j.flatMap((x) => [
        { label: "Ce qui n'a pas été réussi", valeur: x.non_reussi, nature: 'eleve' as const },
        { label: 'Ce qui a été le moins bien réussi', valeur: x.moins_bien_reussi, nature: 'eleve' as const },
      ]),
    })
    sections.push({
      titre: 'Mes résultats',
      paragraphes: q.length === 0 ? ['Aucun résultat enregistré pour cette mission.'] : undefined,
      lignes: q.map((x) => ({
        label: 'Score obtenu',
        valeur: x.score !== null ? `${x.score} point(s)` : null,
        nature: 'eleve' as const,
      })),
    })

    imprimerPdf({
      titre: titreComplet(missionChoisie),
      sousTitre: nomEleve || undefined,
      sections,
      piedNom: nomEleve,
      piedContexte: titreComplet(missionChoisie),
    })
    setEnCours(false)
  }

  // Export global : plusieurs missions dans un meme document, le pied de page
  // ne porte donc que le nom de l'eleve.
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
          { label: titreComplet(j.mission_id), valeur: '', nature: 'neutre' as const },
          { label: "Ce qui n'a pas été réussi", valeur: j.non_reussi, nature: 'eleve' as const },
          { label: 'Ce qui a été le moins bien réussi', valeur: j.moins_bien_reussi, nature: 'eleve' as const },
        ]),
      })
    }
    if (type === 'travaux' || type === 'tout') {
      const travaux = await travauxEleve(eleveId)
      sections.push({
        titre: 'Mes travaux',
        paragraphes: travaux.length === 0 ? ['Aucun travail rendu.'] : undefined,
        lignes: travaux.flatMap((t) => [
          { label: titreComplet(t.mission_id), valeur: '', nature: 'neutre' as const },
          { label: 'Mes réponses', valeur: t.contenu, nature: 'eleve' as const },
        ]),
      })
    }
    if (type === 'activites' || type === 'tout') {
      const quiz = await quizEleve(eleveId)
      sections.push({
        titre: 'Mes résultats',
        paragraphes: quiz.length === 0 ? ['Aucun résultat enregistré.'] : undefined,
        lignes: quiz.map((q) => ({
          label: titreComplet(q.mission_id),
          valeur: q.score !== null ? `${q.score} point(s)` : null,
          nature: 'eleve' as const,
        })),
      })
    }

    imprimerPdf({
      titre: nomEleve ? `Mon dossier - ${nomEleve}` : 'Mon dossier',
      sections,
      piedNom: nomEleve,
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
          <h2 style={{ margin: '0 0 4px', fontSize: 16, color: '#16456E' }}>Exporter une mission</h2>
          <p style={{ fontSize: 13, color: '#374151', margin: '0 0 12px' }}>
            Choisir la mission à rendre. Le document ne contient que ce travail.
          </p>
          {chargementMissions ? (
            <p style={{ fontSize: 13, color: '#6B7280' }}>Chargement…</p>
          ) : missions.length === 0 ? (
            <p style={{ fontSize: 13, color: '#B91C1C' }}>
              Aucun travail enregistré pour le moment.
            </p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <select
                value={missionChoisie}
                onChange={(e) => setMissionChoisie(e.target.value)}
                disabled={enCours}
                style={{
                  fontFamily: 'Arial, sans-serif',
                  fontSize: 13,
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid #BFD4E8',
                  color: '#16456E',
                  background: '#FFFFFF',
                  minWidth: 280,
                  flex: '1 1 280px',
                }}
              >
                {missions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.libelle}
                  </option>
                ))}
              </select>
              <Bouton
                libelle="Exporter cette mission"
                principal
                onClick={exporterMission}
                disabled={enCours || !missionChoisie}
              />
            </div>
          )}

          <div style={{ borderTop: '1px solid #E2E8F0', margin: '20px 0 0', paddingTop: 16 }}>
            <h2 style={{ margin: '0 0 4px', fontSize: 16, color: '#16456E' }}>Exporter tout mon dossier</h2>
            <p style={{ fontSize: 13, color: '#374151', margin: '0 0 12px' }}>
              Toutes les missions réunies dans un seul document.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <Bouton libelle="Journal de bord" onClick={() => exporter('journal')} disabled={enCours} />
              <Bouton libelle="Mes travaux" onClick={() => exporter('travaux')} disabled={enCours} />
              <Bouton libelle="Mes résultats" onClick={() => exporter('activites')} disabled={enCours} />
              <Bouton libelle="Tout" onClick={() => exporter('tout')} disabled={enCours} />
            </div>
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
