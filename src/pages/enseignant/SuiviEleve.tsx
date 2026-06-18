// SuiviEleve.tsx
// Espace professeur : suivi individuel detaille d'un eleve. Affiche les
// missions visitees, les resultats aux quiz, les travaux rendus et le journal
// de bord. Donnees chargees depuis Supabase.

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { COULEUR_PROF, getMission } from '../../data/schema'
import { supabase } from '../../lib/supabase'
import {
  visitesEleve,
  quizEleve,
  travauxEleve,
  journalEleve,
  type VisiteOnglet,
  type ReponseQuiz,
  type TravailRendu,
  type EntreeJournal,
} from '../../lib/enseignant'
import type { Profil } from '../../lib/auth'

// Retrouve le libelle d'une mission a partir de son identifiant (scenario-mN).
function titreMission(missionId: string): string {
  const scenarioId = missionId.split('-m')[0]
  const m = getMission(scenarioId, missionId)
  return m ? `Mission ${m.numero} - ${m.titre}` : missionId
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return iso
  }
}

export function SuiviEleve() {
  const { eleveId } = useParams<{ eleveId: string }>()
  const navigate = useNavigate()

  const [eleve, setEleve] = useState<Profil | null>(null)
  const [visites, setVisites] = useState<VisiteOnglet[]>([])
  const [quiz, setQuiz] = useState<ReponseQuiz[]>([])
  const [travaux, setTravaux] = useState<TravailRendu[]>([])
  const [journal, setJournal] = useState<EntreeJournal[]>([])
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    if (!eleveId) return
    const id = eleveId
    async function charger() {
      const { data } = await supabase
        .from('profiles')
        .select('id, email, prenom, nom, date_naissance, role, entreprise, statut')
        .eq('id', id)
        .maybeSingle()
      setEleve((data as Profil) ?? null)
      const [v, q, t, j] = await Promise.all([
        visitesEleve(id),
        quizEleve(id),
        travauxEleve(id),
        journalEleve(id),
      ])
      setVisites(v)
      setQuiz(q)
      setTravaux(t)
      setJournal(j)
      setChargement(false)
    }
    charger()
  }, [eleveId])

  // Missions distinctes visitees.
  const missionsVisitees = Array.from(new Set(visites.map((v) => v.mission_id)))

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#F4F7FA' }}>
      <header style={{ background: COULEUR_PROF, color: '#FFFFFF', padding: '16px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <button type="button" onClick={() => navigate('/enseignant/eleves')} style={btnRetour}>
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
              <polyline points="15,5 8,12 15,19" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Suivi des élèves
          </button>
          <h1 style={{ margin: 0, fontSize: 21, fontWeight: 700 }}>
            {eleve ? `${eleve.nom} ${eleve.prenom}` : 'Élève'}
          </h1>
          {eleve?.email && <div style={{ fontSize: 13, opacity: 0.9, marginTop: 2 }}>{eleve.email}</div>}
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
        {chargement ? (
          <p style={{ fontSize: 14, color: '#6B7280' }}>Chargement en cours...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Missions visitees */}
            <Section titre="Missions abordées" compte={missionsVisitees.length}>
              {missionsVisitees.length === 0 ? (
                <Vide texte="Aucune mission abordée pour le moment." />
              ) : (
                <ul style={liste}>
                  {missionsVisitees.map((mid) => (
                    <li key={mid} style={ligne}>{titreMission(mid)}</li>
                  ))}
                </ul>
              )}
            </Section>

            {/* Resultats aux quiz */}
            <Section titre="Résultats aux activités" compte={quiz.length}>
              {quiz.length === 0 ? (
                <Vide texte="Aucun résultat enregistré." />
              ) : (
                <ul style={liste}>
                  {quiz.map((q, i) => (
                    <li key={i} style={ligne}>
                      <span>{titreMission(q.mission_id)}</span>
                      <span style={{ color: COULEUR_PROF, fontWeight: 700 }}>
                        {q.score !== null ? `${q.score} pts` : 'Non noté'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            {/* Travaux rendus */}
            <Section titre="Travaux rendus" compte={travaux.length}>
              {travaux.length === 0 ? (
                <Vide texte="Aucun travail rendu." />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {travaux.map((t) => (
                    <div key={t.id} style={carte}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1F2933', marginBottom: 4 }}>
                        {titreMission(t.mission_id)}
                      </div>
                      <div style={{ fontSize: 12, color: '#9AA5B1', marginBottom: 6 }}>
                        Rendu le {formatDate(t.created_at)}
                      </div>
                      <div style={{ fontSize: 13, color: '#374151', whiteSpace: 'pre-wrap' }}>
                        {t.contenu || 'Sans contenu.'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* Journal de bord */}
            <Section titre="Journal de bord" compte={journal.length}>
              {journal.length === 0 ? (
                <Vide texte="Aucune entrée de journal." />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {journal.map((j, i) => (
                    <div key={i} style={carte}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1F2933', marginBottom: 6 }}>
                        {titreMission(j.mission_id)}
                      </div>
                      {j.non_reussi && (
                        <p style={{ fontSize: 13, color: '#374151', margin: '0 0 6px 0' }}>
                          <strong>Ce qui n'a pas été réussi : </strong>{j.non_reussi}
                        </p>
                      )}
                      {j.moins_bien_reussi && (
                        <p style={{ fontSize: 13, color: '#374151', margin: 0 }}>
                          <strong>Ce qui a été le moins bien réussi : </strong>{j.moins_bien_reussi}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </div>
        )}
      </main>
    </div>
  )
}

function Section({ titre, compte, children }: { titre: string; compte: number; children: React.ReactNode }) {
  return (
    <section style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 18 }}>
      <h2 style={{ margin: '0 0 12px 0', fontSize: 15, color: COULEUR_PROF, display: 'flex', alignItems: 'center', gap: 8 }}>
        {titre}
        <span style={{ fontSize: 12, fontWeight: 700, color: '#FFFFFF', background: COULEUR_PROF, borderRadius: 99, padding: '1px 8px' }}>
          {compte}
        </span>
      </h2>
      {children}
    </section>
  )
}

function Vide({ texte }: { texte: string }) {
  return <p style={{ fontSize: 13, color: '#9AA5B1', margin: 0 }}>{texte}</p>
}

const liste: React.CSSProperties = { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }
const ligne: React.CSSProperties = {
  fontSize: 13,
  color: '#374151',
  padding: '8px 12px',
  background: '#F8FAFC',
  borderRadius: 8,
  display: 'flex',
  justifyContent: 'space-between',
}
const carte: React.CSSProperties = { background: '#F8FAFC', borderRadius: 10, padding: '12px 14px' }
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
