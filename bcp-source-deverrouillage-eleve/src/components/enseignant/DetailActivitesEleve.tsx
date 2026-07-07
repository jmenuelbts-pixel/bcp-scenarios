// DetailActivitesEleve.tsx
// Affiche, cote professeur, les reponses d'un eleve aux activites d'une mission
// (synthese, auto-evaluation, flashcards, quiz, glisser-deposer), avec
// indication correct / incorrect par rapport aux bonnes reponses pour la
// synthese, le quiz et le glisser-deposer.

import { useEffect, useState } from 'react'
import { chargerReponsesActivites, type SoumissionQuiz } from '../../lib/eleve'
import { getContenuMission } from '../../data/contenus'
import type { NoeudSynthese, QuestionQuiz } from '../../data/contenus'

const VERT = '#1B6B3A'
const ROUGE = '#9B2C2C'

function Ligne({ ok, libelle, detail }: { ok: boolean | null; libelle: string; detail: string }) {
  const couleur = ok === null ? '#4B5563' : ok ? VERT : ROUGE
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', fontSize: 13, padding: '3px 0' }}>
      {ok !== null && <span style={{ color: couleur, fontWeight: 700, width: 14 }}>{ok ? '✓' : '✗'}</span>}
      <span style={{ color: '#374151', fontWeight: 600, minWidth: 120 }}>{libelle}</span>
      <span style={{ color: couleur }}>{detail}</span>
    </div>
  )
}

function Bloc({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#16456E', marginBottom: 4 }}>{titre}</div>
      {children}
    </div>
  )
}

export function DetailActivitesEleve({ eleveId, missionId }: { eleveId: string; missionId: string }) {
  const [reponses, setReponses] = useState<Record<string, SoumissionQuiz>>({})
  const [chargement, setChargement] = useState(true)
  const contenu = getContenuMission(missionId)

  useEffect(() => {
    let actif = true
    chargerReponsesActivites(eleveId, missionId).then((r) => {
      if (!actif) return
      setReponses(r)
      setChargement(false)
    })
    return () => {
      actif = false
    }
  }, [eleveId, missionId])

  if (chargement) return <p style={{ fontSize: 13, color: '#6B7280' }}>Chargement des activités...</p>
  if (!contenu) return <p style={{ fontSize: 13, color: '#6B7280' }}>Contenu de la mission indisponible.</p>

  const synthese = reponses['synthese']
  const autoeval = reponses['autoeval']
  const flashcards = reponses['flashcards']
  const quiz = reponses['quiz']
  const glisser = reponses['glisser']

  // --- Synthese : compare chaque case a la reponse attendue ----------------
  const casesSynthese: { id: string; attendu: string }[] = []
  const collecter = (n: NoeudSynthese) => {
    if (n.texte === null && n.reponse !== undefined) casesSynthese.push({ id: n.id, attendu: n.reponse })
    n.enfants?.forEach(collecter)
  }
  collecter(contenu.synthese.racine)
  const repSynthese = (synthese?.reponses as Record<string, string> | undefined) ?? {}

  // --- Quiz : compare chaque question ---------------------------------------
  const repQuiz = (quiz?.reponses as Record<number, number[] | string[]> | undefined) ?? {}
  const quizCorrect = (q: QuestionQuiz, rep: number[] | string[] | undefined): boolean => {
    if (q.type === 'unique') return Array.isArray(rep) && rep.length === 1 && rep[0] === q.bonne
    if (q.type === 'qcm') {
      const choisies = ((rep as number[]) ?? []).slice().sort()
      const bonnes = q.bonnes.slice().sort()
      return bonnes.length === choisies.length && bonnes.every((v, k) => v === choisies[k])
    }
    if (q.type === 'trous') {
      const s = (rep as string[]) ?? []
      return q.reponses.every((att, k) => (s[k] ?? '').trim().toLowerCase() === att.trim().toLowerCase())
    }
    return false
  }
  const libelleReponseQuiz = (q: QuestionQuiz, rep: number[] | string[] | undefined): string => {
    if (!rep) return 'Aucune réponse'
    if (q.type === 'unique' || q.type === 'qcm') {
      const idx = rep as number[]
      return idx.map((i) => q.options[i]).join(', ') || 'Aucune réponse'
    }
    if (q.type === 'trous') return (rep as string[]).join(' / ')
    return '-'
  }

  // --- Glisser : compare chaque zone a son etiquette attendue ---------------
  const gd = contenu.activites.glisserDeposer
  const repGlisser = (glisser?.reponses as Record<number, number> | undefined) ?? {}

  return (
    <div style={{ borderTop: '1px solid #EEF2F6', marginTop: 14, paddingTop: 12 }}>
      {/* Synthese */}
      <Bloc titre="Synthèse">
        {!synthese ? (
          <p style={{ fontSize: 13, color: '#9AA5B1' }}>Non envoyée.</p>
        ) : (
          casesSynthese.map((c) => {
            const saisi = repSynthese[c.id] ?? ''
            const ok = saisi.trim().toLowerCase() === c.attendu.trim().toLowerCase()
            return <Ligne key={c.id} ok={ok} libelle={saisi || '(vide)'} detail={ok ? '' : `attendu : ${c.attendu}`} />
          })
        )}
      </Bloc>

      {/* Auto-evaluation : pas de bonne reponse, on affiche le niveau choisi */}
      <Bloc titre="Auto-évaluation">
        {!autoeval ? (
          <p style={{ fontSize: 13, color: '#9AA5B1' }}>Non envoyée.</p>
        ) : (
          contenu.autoEval.competences.map((comp) => {
            const niveau = (autoeval.reponses as Record<string, string> | undefined)?.[comp.id] ?? '-'
            return <Ligne key={comp.id} ok={null} libelle={comp.intitule} detail={niveau} />
          })
        )}
      </Bloc>

      {/* Flashcards : revision, pas de correction */}
      <Bloc titre="Flashcards">
        <p style={{ fontSize: 13, color: flashcards ? VERT : '#9AA5B1' }}>
          {flashcards ? 'Consultées et validées.' : 'Non validées.'}
        </p>
      </Bloc>

      {/* Quiz */}
      <Bloc titre="Quiz">
        {!quiz ? (
          <p style={{ fontSize: 13, color: '#9AA5B1' }}>Non envoyé.</p>
        ) : (
          <>
            {contenu.activites.quiz.map((q, i) => {
              if (q.type === 'appariement') return null
              const rep = repQuiz[i]
              const ok = quizCorrect(q, rep)
              return <Ligne key={i} ok={ok} libelle={`Q${i + 1}`} detail={`${libelleReponseQuiz(q, rep)}${ok ? '' : ' (incorrect)'}`} />
            })}
            {quiz.score !== null && (
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1F2933', marginTop: 4 }}>
                Score : {quiz.score} / {contenu.activites.quiz.filter((q) => q.type !== 'appariement').length}
              </div>
            )}
          </>
        )}
      </Bloc>

      {/* Glisser-deposer */}
      <Bloc titre="Glisser-déposer">
        {!glisser ? (
          <p style={{ fontSize: 13, color: '#9AA5B1' }}>Non envoyé.</p>
        ) : !gd ? (
          <p style={{ fontSize: 13, color: '#9AA5B1' }}>Activité absente.</p>
        ) : (
          gd.zones.map((z, i) => {
            const choisi = repGlisser[i]
            const ok = choisi === z.etiquetteIndex
            const etiquetteChoisie = choisi !== undefined ? gd.etiquettes[choisi] : '(vide)'
            return (
              <Ligne
                key={i}
                ok={ok}
                libelle={z.libelle}
                detail={ok ? etiquetteChoisie : `${etiquetteChoisie} (attendu : ${gd.etiquettes[z.etiquetteIndex]})`}
              />
            )
          })
        )}
      </Bloc>
    </div>
  )
}
