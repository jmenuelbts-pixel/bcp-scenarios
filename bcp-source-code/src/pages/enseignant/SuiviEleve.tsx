// SuiviEleve.tsx
// Espace professeur : suivi individuel detaille d'un eleve. Affiche les
// missions visitees, les resultats aux quiz, les travaux rendus et le journal
// de bord. Donnees chargees depuis Supabase.

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { COULEUR_PROF, getMission, SCENARIOS } from '../../data/schema'
import { getContenuMission } from '../../data/contenus'
import { supabase } from '../../lib/supabase'
import { rouvrirTravail } from '../../lib/eleve'
import { ROUGE_CORRECTION } from '../../lib/appreciations'
import {
  quizEleve,
  travauxEleve,
  journalEleve,
  enregistrerBareme,
  type ReponseQuiz,
  type TravailRendu,
  type EntreeJournal,
} from '../../lib/enseignant'
import type { Profil } from '../../lib/auth'
import { CorrectionTravail } from '../../components/enseignant/CorrectionTravail'

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

// Nombre de questions notees d'une mission (hors appariement).
function totalQuestions(missionId: string): number {
  const c = getContenuMission(missionId)
  if (!c) return 0
  return c.activites.quiz.filter((q) => q.type !== 'appariement').length
}

export function SuiviEleve() {
  const { eleveId } = useParams<{ eleveId: string }>()
  const navigate = useNavigate()

  const [eleve, setEleve] = useState<Profil | null>(null)
  const [quiz, setQuiz] = useState<ReponseQuiz[]>([])
  const [travaux, setTravaux] = useState<TravailRendu[]>([])
  const [journal, setJournal] = useState<EntreeJournal[]>([])
  const [chargement, setChargement] = useState(true)
  const [filtreScenario, setFiltreScenario] = useState<string>('')
  const [filtreMission, setFiltreMission] = useState<string>('')

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
      const [q, t, j] = await Promise.all([
        quizEleve(id),
        travauxEleve(id),
        journalEleve(id),
      ])
      setQuiz(q)
      setTravaux(t)
      setJournal(j)
      setChargement(false)
    }
    charger()
  }, [eleveId])

  // Regroupe le travail reel par scenario puis mission. Une mission apparait
  // seulement si l'eleve y a produit qqch : quiz note, travail rendu, ou journal.
  const groupes = SCENARIOS.map((scenario) => {
    const missions = scenario.missions.map((mission) => {
      const qs = quiz.filter((q) => q.mission_id === mission.id && q.score !== null)
      const ts = travaux.filter((t) => t.mission_id === mission.id)
      const js = journal.filter((j) => j.mission_id === mission.id && ((j.non_reussi?.trim().length ?? 0) > 0 || (j.moins_bien_reussi?.trim().length ?? 0) > 0))
      const travailReel = qs.length > 0 || ts.length > 0 || js.length > 0
      const aCorriger = ts.some((t) => !(t.commentaire && t.commentaire.trim().length > 0))
      return { mission, qs, ts, js, travailReel, aCorriger }
    }).filter((m) => m.travailReel)
    return { scenario, missions, aCorriger: missions.some((m) => m.aCorriger) }
  }).filter((g) => g.missions.length > 0)

  const groupesFiltres = groupes
    .filter((g) => !filtreScenario || g.scenario.id === filtreScenario)
    .map((g) => ({ ...g, missions: g.missions.filter((m) => !filtreMission || m.mission.id === filtreMission) }))
    .filter((g) => g.missions.length > 0)

  const nbACorriger = travaux.filter((t) => !(t.commentaire && t.commentaire.trim().length > 0)).length

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#F1F6F3' }}>
      <header style={{ background: COULEUR_PROF, color: '#FFFFFF', padding: '16px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <button type="button" onClick={() => navigate('/enseignant/eleves')} style={btnRetour}>
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
              <polyline points="15,5 8,12 15,19" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Suivi des élèves
          </button>
          <h1 style={{ margin: 0, fontSize: 21, fontWeight: 700 }}>{eleve ? `${eleve.nom} ${eleve.prenom}` : 'Élève'}</h1>
          {eleve?.email && <div style={{ fontSize: 13, opacity: 0.9, marginTop: 2 }}>{eleve.email}</div>}
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
        {chargement ? (
          <p style={{ fontSize: 14, color: '#6B7280' }}>Chargement en cours...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#374151' }}>Seul le travail réellement produit est affiché, regroupé par scénario. Dépliez une mission pour la consulter ou la corriger.</span>
              {nbACorriger > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: '#FFFFFF', background: '#E08A1E', borderRadius: 99, padding: '3px 10px' }}>{nbACorriger} à corriger</span>}
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <select value={filtreScenario} onChange={(e) => { setFiltreScenario(e.target.value); setFiltreMission('') }} style={{ fontFamily: 'Arial, sans-serif', border: '1px solid #C9D6E3', borderRadius: 8, padding: '7px 10px', fontSize: 13 }}>
                <option value="">Tous les scénarios</option>
                {groupes.map((g) => <option key={g.scenario.id} value={g.scenario.id}>{g.scenario.nom}</option>)}
              </select>
              <select value={filtreMission} onChange={(e) => setFiltreMission(e.target.value)} style={{ fontFamily: 'Arial, sans-serif', border: '1px solid #C9D6E3', borderRadius: 8, padding: '7px 10px', fontSize: 13 }}>
                <option value="">Toutes les missions</option>
                {(groupes.find((g) => g.scenario.id === filtreScenario)?.missions ?? groupes.flatMap((g) => g.missions)).map((m) => <option key={m.mission.id} value={m.mission.id}>Mission {m.mission.numero} — {m.mission.titre}</option>)}
              </select>
            </div>
            {groupesFiltres.length === 0 ? (
              <Vide texte="Aucun travail pour ce filtre." />
            ) : (
              groupesFiltres.map((g) => <BlocScenario key={g.scenario.id} scenario={g.scenario} missions={g.missions} eleveId={eleveId ?? ''} aCorriger={g.aCorriger} />)
            )}
          </div>
        )}
      </main>
    </div>
  )
}

type MissionData = { mission: { id: string; numero: number; titre: string }; qs: ReponseQuiz[]; ts: TravailRendu[]; js: EntreeJournal[]; aCorriger: boolean }

function BlocRouvrir({ eleveId, missionId, qs, tsCount }: { eleveId: string; missionId: string; qs: ReponseQuiz[]; tsCount: number }) {
  const [fait, setFait] = useState<Record<string, boolean>>({})
  const [enCours, setEnCours] = useState<string | null>(null)
  const activites = new Set(qs.map((q) => q.activite_id ?? ''))
  const parties: { id: 'travaux' | 'synthese' | 'autoeval' | 'quiz' | 'glisser'; libelle: string; present: boolean }[] = [
    { id: 'travaux', libelle: 'Devoir à rendre', present: tsCount > 0 },
    { id: 'synthese', libelle: 'Synthèse', present: activites.has('synthese') },
    { id: 'autoeval', libelle: 'Auto-évaluation', present: activites.has('autoeval') },
    { id: 'quiz', libelle: 'Quiz', present: activites.has('quiz') },
    { id: 'glisser', libelle: 'Glisser-déposer', present: activites.has('glisser') },
  ]
  const dispo = parties.filter((p) => p.present && !fait[p.id])
  if (dispo.length === 0) return null

  async function rouvrir(id: 'travaux' | 'synthese' | 'autoeval' | 'quiz' | 'glisser') {
    if (!window.confirm("Rouvrir ce travail ? L'élève pourra de nouveau le modifier. Le contenu déjà envoyé sera remplacé lorsqu'il renverra.")) return
    setEnCours(id)
    const { erreur } = await rouvrirTravail(eleveId, missionId, id)
    setEnCours(null)
    if (!erreur) setFait((f) => ({ ...f, [id]: true }))
    else window.alert('Échec : ' + erreur)
  }

  return (
    <div style={{ borderTop: '1px dashed #E2E8F0', paddingTop: 10 }}>
      <div style={sousTitre}>Rouvrir un travail pour que l'élève puisse le modifier</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {dispo.map((p) => (
          <button key={p.id} type="button" onClick={() => rouvrir(p.id)} disabled={enCours === p.id} style={{ fontFamily: 'Arial, sans-serif', background: '#FFFFFF', border: '1.5px solid #B0413E', color: '#B0413E', borderRadius: 8, padding: '7px 14px', fontSize: 12.5, fontWeight: 700, cursor: enCours === p.id ? 'wait' : 'pointer' }}>
            {enCours === p.id ? '...' : `Rouvrir : ${p.libelle}`}
          </button>
        ))}
      </div>
    </div>
  )
}

function BlocScenario({ scenario, missions, eleveId, aCorriger }: { scenario: { id: string; nom: string; couleur: string }; missions: MissionData[]; eleveId: string; aCorriger: boolean }) {
  const [ouvert, setOuvert] = useState(false)
  return (
    <section style={{ background: '#FFFFFF', border: '1px solid #EAF0F5', borderRadius: 14, boxShadow: '0 2px 10px rgba(14,165,233,0.08)', overflow: 'hidden' }}>
      <button type="button" onClick={() => setOuvert((o) => !o)} style={{ fontFamily: 'Arial, sans-serif', width: '100%', textAlign: 'left', border: 'none', background: 'transparent', padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 12, height: 12, borderRadius: 3, background: scenario.couleur, flexShrink: 0 }} />
        <span style={{ fontSize: 15, fontWeight: 700, color: '#1F2933', flex: 1 }}>{scenario.nom}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#FFFFFF', background: COULEUR_PROF, borderRadius: 99, padding: '1px 8px' }}>{missions.length} mission{missions.length > 1 ? 's' : ''}</span>
        {aCorriger && <span style={{ width: 9, height: 9, borderRadius: 99, background: '#E08A1E', flexShrink: 0 }} title="Travail à corriger" />}
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" style={{ transform: ouvert ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }}><polyline points="9,6 15,12 9,18" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {ouvert && <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>{missions.map((m) => <BlocMission key={m.mission.id} data={m} eleveId={eleveId} />)}</div>}
    </section>
  )
}

function BlocMission({ data, eleveId }: { data: MissionData; eleveId: string }) {
  const [ouvert, setOuvert] = useState(false)
  const { mission, qs, ts, js, aCorriger } = data
  return (
    <div style={{ border: '1px solid #EEF2F6', borderRadius: 10, overflow: 'hidden' }}>
      <button type="button" onClick={() => setOuvert((o) => !o)} style={{ fontFamily: 'Arial, sans-serif', width: '100%', textAlign: 'left', border: 'none', background: '#F8FAFC', padding: '10px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#1F2933', flex: 1 }}>Mission {mission.numero} — {mission.titre}</span>
        {aCorriger ? <span style={{ fontSize: 11, fontWeight: 700, color: '#B96A0E', background: '#FCEBD3', borderRadius: 99, padding: '2px 8px' }}>à corriger</span> : ts.length > 0 ? <span style={{ fontSize: 11, fontWeight: 700, color: '#0F7A52', background: '#DEF3E8', borderRadius: 99, padding: '2px 8px' }}>corrigé</span> : null}
        <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" style={{ transform: ouvert ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }}><polyline points="9,6 15,12 9,18" fill="none" stroke="#9AA5B1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {ouvert && (
        <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {qs.length > 0 && <div><div style={sousTitre}>Activités</div><div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{qs.map((q, i) => <LigneActivite key={i} quiz={q} eleveId={eleveId} />)}</div></div>}
          {ts.length > 0 && <div><div style={sousTitre}>Travaux rendus</div><div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{ts.map((t) => (<div key={t.id} style={carte}><div style={{ fontSize: 12, color: '#9AA5B1', marginBottom: 6 }}>Rendu le {formatDate(t.created_at)}</div><div style={{ fontSize: 13, color: '#374151', whiteSpace: 'pre-wrap' }}>{t.contenu || 'Sans contenu.'}</div><CorrectionTravail travailId={t.id} commentaireInitial={t.commentaire} competencesInitiales={t.competences} /></div>))}</div></div>}
          {js.length > 0 && <div><div style={sousTitre}>Journal de bord</div><div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{js.map((j, i) => (<div key={i} style={carte}>{j.non_reussi && <p style={{ fontSize: 13, color: '#374151', margin: '0 0 6px 0' }}><strong>Ce qui n'a pas été réussi : </strong>{j.non_reussi}</p>}{j.moins_bien_reussi && <p style={{ fontSize: 13, color: '#374151', margin: 0 }}><strong>Ce qui a été le moins bien réussi : </strong>{j.moins_bien_reussi}</p>}</div>))}</div></div>}
          <BlocRouvrir eleveId={eleveId} missionId={mission.id} qs={qs} tsCount={ts.length} />
        </div>
      )}
    </div>
  )
}

function LigneActivite({ quiz, eleveId }: { quiz: ReponseQuiz; eleveId: string }) {
  const total = totalQuestions(quiz.mission_id)
  const [bareme, setBareme] = useState<number | null>(quiz.bareme)
  const [enregistre, setEnregistre] = useState(false)

  // Note convertie sur le bareme choisi.
  const noteConvertie =
    quiz.score !== null && total > 0 && bareme
      ? Math.round((quiz.score / total) * bareme * 10) / 10
      : null

  async function choisir(valeur: number) {
    const nouveau = bareme === valeur ? null : valeur
    setBareme(nouveau)
    setEnregistre(false)
    if (nouveau !== null && eleveId) {
      await enregistrerBareme(eleveId, quiz.mission_id, quiz.activite_id, nouveau)
      setEnregistre(true)
    }
  }

  return (
    <div style={{ ...ligne, flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
        <span>{titreMission(quiz.mission_id)}</span>
        <span style={{ color: ROUGE_CORRECTION, fontWeight: 700 }}>
          {quiz.score !== null ? (
            noteConvertie !== null ? `${noteConvertie} / ${bareme}` : `${quiz.score} / ${total || '?'}`
          ) : (
            'Non noté'
          )}
        </span>
      </div>
      {quiz.appreciation && (
        <p style={{ fontSize: 12.5, color: ROUGE_CORRECTION, fontStyle: 'italic', margin: 0 }}>
          Appréciation : {quiz.appreciation}
        </p>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 11, color: '#6B7280' }}>Barème :</span>
        {[10, 20].map((v) => {
          const actif = bareme === v
          return (
            <button
              key={v}
              type="button"
              onClick={() => choisir(v)}
              style={{
                fontFamily: 'Arial, sans-serif',
                background: actif ? COULEUR_PROF : '#FFFFFF',
                color: actif ? '#FFFFFF' : COULEUR_PROF,
                border: `1px solid ${COULEUR_PROF}`,
                borderRadius: 99,
                padding: '3px 12px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              sur {v}
            </button>
          )
        })}
        {enregistre && <span style={{ fontSize: 11, color: '#2E8B57', fontWeight: 700 }}>Enregistré</span>}
      </div>
    </div>
  )
}

function Vide({ texte }: { texte: string }) {
  return <p style={{ fontSize: 13, color: '#9AA5B1', margin: 0 }}>{texte}</p>
}

const sousTitre: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: COULEUR_PROF, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.3 }
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
