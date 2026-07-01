// OngletActivites.tsx
// Onglet Activités : glossaire, flashcards, quiz (QCM, question unique, texte a
// trous, appariement) et glisser-deposer. Le quiz capture les reponses de
// l'eleve, calcule un score a l'envoi et l'enregistre dans Supabase.

import { useState, useEffect, useRef } from 'react'
import type { ContenuActivites, Flashcard, QuestionQuiz } from '../../data/contenus'
import { enregistrerQuiz, chargerQuiz } from '../../lib/eleve'
import { chargerBrouillon, creerEnregistreurBrouillon, effacerBrouillon } from '../../lib/brouillon'
import { definirSousOngletCourant } from '../../lib/useBattementPresence'

interface Props {
  contenu: ContenuActivites
  couleur: string
  etudiantId?: string
  missionId: string
}

type SousOnglet = 'glossaire' | 'flashcards' | 'quiz' | 'glisser'

export function OngletActivites({ contenu, couleur, etudiantId, missionId }: Props) {
  const [vue, setVue] = useState<SousOnglet>('glossaire')

  const onglets: { id: SousOnglet; libelle: string; visible: boolean }[] = [
    { id: 'glossaire', libelle: 'Glossaire', visible: contenu.glossaire.length > 0 },
    { id: 'flashcards', libelle: 'Flashcards', visible: contenu.flashcards.length > 0 },
    { id: 'quiz', libelle: 'Quiz', visible: contenu.quiz.length > 0 },
    { id: 'glisser', libelle: 'Glisser-déposer', visible: !!contenu.glisserDeposer },
  ]

  // Remonte le sous-onglet courant pour l'affichage de presence cote prof.
  useEffect(() => {
    const libelle = onglets.find((o) => o.id === vue)?.libelle ?? null
    definirSousOngletCourant(libelle)
    return () => definirSousOngletCourant(null)
  }, [vue])

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
        {onglets.filter((o) => o.visible).map((o) => {
          const actif = vue === o.id
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => setVue(o.id)}
              style={{
                fontFamily: 'Arial, sans-serif',
                fontSize: 13,
                fontWeight: 600,
                padding: '7px 14px',
                borderRadius: 99,
                border: actif ? 'none' : '1px solid #C9D6E3',
                background: actif ? couleur : '#FFFFFF',
                color: actif ? '#FFFFFF' : '#374151',
                cursor: 'pointer',
              }}
            >
              {o.libelle}
            </button>
          )
        })}
      </div>

      {vue === 'glossaire' && <VueGlossaire contenu={contenu} />}
      {vue === 'flashcards' && <VueFlashcards contenu={contenu} couleur={couleur} etudiantId={etudiantId} missionId={missionId} />}
      {vue === 'quiz' && (
        <VueQuiz contenu={contenu} couleur={couleur} etudiantId={etudiantId} missionId={missionId} />
      )}
      {vue === 'glisser' && <VueGlisser contenu={contenu} couleur={couleur} etudiantId={etudiantId} missionId={missionId} />}
    </div>
  )
}

function VueGlossaire({ contenu }: { contenu: ContenuActivites }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {contenu.glossaire.map((g) => (
        <div key={g.terme} style={{ border: '1px solid #DCE8F4', borderRadius: 10, padding: '12px 14px', background: '#FFFFFF' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#16456E' }}>{g.terme}</div>
          <div style={{ fontSize: 13, color: '#374151', marginTop: 4, lineHeight: 1.5 }}>{g.definition}</div>
        </div>
      ))}
    </div>
  )
}

function VueFlashcards({
  contenu,
  couleur,
  etudiantId,
  missionId,
}: {
  contenu: ContenuActivites
  couleur: string
  etudiantId?: string
  missionId: string
}) {
  const [vues, setVues] = useState<Set<number>>(new Set())
  const [verrouille, setVerrouille] = useState(false)
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  useEffect(() => {
    let actif = true
    if (!etudiantId) return
    chargerQuiz(etudiantId, missionId, 'flashcards').then((s) => {
      if (actif && s) setVerrouille(true)
    })
    return () => {
      actif = false
    }
  }, [etudiantId, missionId])

  const total = contenu.flashcards.length
  const toutesVues = total > 0 && vues.size >= total

  async function envoyer() {
    if (verrouille || !toutesVues) return
    if (!etudiantId) {
      setErreur('Vous devez etre connecte pour envoyer.')
      return
    }
    setEnCours(true)
    setErreur(null)
    const { erreur } = await enregistrerQuiz(etudiantId, missionId, 'flashcards', { vues: [...vues] }, 0)
    if (erreur) setErreur('L envoi a echoue. Veuillez reessayer.')
    else setVerrouille(true)
    setEnCours(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {!verrouille && (
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
          Retournez chaque carte pour la consulter ({vues.size} / {total}), puis validez.
        </p>
      )}
      {contenu.flashcards.map((f, i) => (
        <CarteFlash key={i} carte={f} couleur={couleur} onVue={() => setVues((s) => new Set(s).add(i))} />
      ))}

      {verrouille ? (
        <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8, background: '#EAF2EC', border: '1px solid #BFE0CC', borderRadius: 8, padding: '10px 14px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="5" y="11" width="14" height="9" rx="2" fill="none" stroke="#1B6B3A" strokeWidth="2" />
            <path d="M8 11 V8 a4 4 0 0 1 8 0 v3" fill="none" stroke="#1B6B3A" strokeWidth="2" />
          </svg>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1B6B3A' }}>Flashcards validées.</span>
        </div>
      ) : (
        <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            type="button"
            disabled={!toutesVues || enCours}
            onClick={envoyer}
            style={{
              fontFamily: 'Arial, sans-serif',
              background: !toutesVues || enCours ? '#C9CDD2' : couleur,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 8,
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 600,
              cursor: !toutesVues || enCours ? 'not-allowed' : 'pointer',
            }}
          >
            {enCours ? 'Envoi...' : 'Valider les flashcards'}
          </button>
          {erreur && <span style={{ fontSize: 13, color: '#9B2C2C', fontWeight: 600 }}>{erreur}</span>}
        </div>
      )}
    </div>
  )
}

function CarteFlash({ carte, couleur, onVue }: { carte: Flashcard; couleur: string; onVue: () => void }) {
  const [retournee, setRetournee] = useState(false)
  return (
    <button
      type="button"
      onClick={() => {
        setRetournee((v) => !v)
        onVue()
      }}
      style={{
        fontFamily: 'Arial, sans-serif',
        textAlign: 'left',
        border: `1px solid ${retournee ? couleur : '#DCE8F4'}`,
        borderRadius: 12,
        padding: '16px 18px',
        background: retournee ? '#F4F8FC' : '#FFFFFF',
        cursor: 'pointer',
      }}
    >
      <div style={{ fontSize: 12, color: '#9AA5B1', marginBottom: 4 }}>{retournee ? 'Réponse' : 'Question'}</div>
      <div style={{ fontSize: 14, color: '#1F2933' }}>{retournee ? carte.verso : carte.recto}</div>
    </button>
  )
}

type ReponsesEleve = Record<number, number[] | string[]>

function VueQuiz({
  contenu,
  couleur,
  etudiantId,
  missionId,
}: {
  contenu: ContenuActivites
  couleur: string
  etudiantId?: string
  missionId: string
}) {
  const [reponses, setReponses] = useState<ReponsesEleve>({})
  const [envoye, setEnvoye] = useState(false)
  const [verrouille, setVerrouille] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  const brouillon = useRef(creerEnregistreurBrouillon<ReponsesEleve>(etudiantId ?? 'anon', missionId, 'activites'))
  useEffect(() => {
    brouillon.current = creerEnregistreurBrouillon<ReponsesEleve>(etudiantId ?? 'anon', missionId, 'activites')
  }, [etudiantId, missionId])

  // Au montage : si l'eleve a deja envoye ce quiz, restaurer ses reponses et
  // son score, et verrouiller toute modification. Sinon, restaurer le brouillon.
  useEffect(() => {
    let actif = true
    if (!etudiantId) return
    chargerQuiz(etudiantId, missionId, 'quiz').then(async (soumission) => {
      if (!actif) return
      if (soumission) {
        if (soumission.reponses && typeof soumission.reponses === 'object') {
          setReponses(soumission.reponses as ReponsesEleve)
        }
        setScore(soumission.score)
        setEnvoye(true)
        setVerrouille(true)
        void effacerBrouillon(etudiantId, missionId, 'activites')
        return
      }
      const b = await chargerBrouillon<ReponsesEleve>(etudiantId, missionId, 'activites')
      if (actif && b && typeof b === 'object') setReponses(b)
    })
    return () => {
      actif = false
      brouillon.current.flush()
    }
  }, [etudiantId, missionId])

  function definir(i: number, valeur: number[] | string[]) {
    if (verrouille) return
    setReponses((r) => {
      const maj = { ...r, [i]: valeur }
      brouillon.current.sauver(maj)
      return maj
    })
    setEnvoye(false)
  }

  function calculerScore(): number {
    let points = 0
    contenu.quiz.forEach((q, i) => {
      const rep = reponses[i]
      if (q.type === 'unique') {
        if (Array.isArray(rep) && rep.length === 1 && rep[0] === q.bonne) points += 1
      } else if (q.type === 'qcm') {
        const choisies = (rep as number[] | undefined) ?? []
        const bonnes = [...q.bonnes].sort()
        const tri = [...choisies].sort()
        if (bonnes.length === tri.length && bonnes.every((v, k) => v === tri[k])) points += 1
      } else if (q.type === 'trous') {
        const saisies = (rep as string[] | undefined) ?? []
        const ok = q.reponses.every(
          (att, k) => (saisies[k] ?? '').trim().toLowerCase() === att.trim().toLowerCase()
        )
        if (ok) points += 1
      }
    })
    return points
  }

  async function envoyer() {
    if (verrouille) return
    const s = calculerScore()
    setScore(s)
    setEnvoye(true)
    if (etudiantId) {
      setEnCours(true)
      setErreur(null)
      const { erreur } = await enregistrerQuiz(etudiantId, missionId, 'quiz', reponses, s)
      if (erreur) setErreur('L enregistrement du resultat a echoue.')
      else {
        brouillon.current.annuler()
        void effacerBrouillon(etudiantId, missionId, 'activites')
        setVerrouille(true)
      }
      setEnCours(false)
    }
  }

  const noteSur = contenu.quiz.filter((q) => q.type !== 'appariement').length

  return (
    <div>
      {verrouille && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#EAF2EC', border: '1px solid #BFE0CC', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="5" y="11" width="14" height="9" rx="2" fill="none" stroke="#1B6B3A" strokeWidth="2" />
            <path d="M8 11 V8 a4 4 0 0 1 8 0 v3" fill="none" stroke="#1B6B3A" strokeWidth="2" />
          </svg>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1B6B3A' }}>
            Travail envoyé. Vos réponses ne sont plus modifiables.
          </span>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {contenu.quiz.map((q, i) => (
          <BlocQuestion key={i} q={q} index={i} reponse={reponses[i]} onChange={(v) => definir(i, v)} verrouille={verrouille} />
        ))}
      </div>
      {!verrouille && (
        <button
          type="button"
          onClick={envoyer}
          disabled={enCours}
          style={{
            fontFamily: 'Arial, sans-serif',
            marginTop: 16,
            background: enCours ? '#C9CDD2' : couleur,
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 8,
            padding: '10px 20px',
            fontSize: 14,
            fontWeight: 600,
            cursor: enCours ? 'not-allowed' : 'pointer',
          }}
        >
          {enCours ? 'Envoi...' : 'Envoyer'}
        </button>
      )}
      {envoye && score !== null && (
        <p style={{ fontSize: 14, color: '#1B6B3A', fontWeight: 700, marginTop: 12 }}>
          Score : {score} / {noteSur}. Vos réponses ont été enregistrées.
        </p>
      )}
      {erreur && <p style={{ fontSize: 13, color: '#9B2C2C', marginTop: 10 }}>{erreur}</p>}
    </div>
  )
}

function BlocQuestion({
  q,
  index,
  reponse,
  onChange,
  verrouille,
}: {
  q: QuestionQuiz
  index: number
  reponse: number[] | string[] | undefined
  onChange: (v: number[] | string[]) => void
  verrouille: boolean
}) {
  const cadre: React.CSSProperties = { border: '1px solid #DCE8F4', borderRadius: 10, padding: '14px 16px', background: '#FFFFFF' }
  const titre = (texte: string) => (
    <div style={{ fontSize: 14, fontWeight: 600, color: '#1F2933', marginBottom: 10 }}>
      {index + 1}. {texte}
    </div>
  )

  if (q.type === 'unique' || q.type === 'qcm') {
    const choisies = (reponse as number[] | undefined) ?? []
    return (
      <div style={cadre}>
        {titre(q.question)}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {q.options.map((opt, i) => (
            <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151' }}>
              <input
                type={q.type === 'qcm' ? 'checkbox' : 'radio'}
                name={`q-${index}`}
                checked={choisies.includes(i)}
                disabled={verrouille}
                onChange={() => {
                  if (verrouille) return
                  if (q.type === 'qcm') {
                    const set = new Set(choisies)
                    if (set.has(i)) set.delete(i)
                    else set.add(i)
                    onChange([...set])
                  } else {
                    onChange([i])
                  }
                }}
              />
              {opt}
            </label>
          ))}
        </div>
      </div>
    )
  }

  if (q.type === 'trous') {
    const segments = q.texte.split(/(\{\d+\})/g)
    const saisies = (reponse as string[] | undefined) ?? []
    let trouIndex = -1
    return (
      <div style={cadre}>
        <div style={{ fontSize: 14, color: '#374151', lineHeight: 2 }}>
          {index + 1}.{' '}
          {segments.map((seg, i) => {
            if (/\{\d+\}/.test(seg)) {
              trouIndex += 1
              const idx = trouIndex
              return (
                <input
                  key={i}
                  type="text"
                  value={saisies[idx] ?? ''}
                  disabled={verrouille}
                  onChange={(e) => {
                    if (verrouille) return
                    const copie = [...saisies]
                    copie[idx] = e.target.value
                    onChange(copie)
                  }}
                  style={{ fontFamily: 'Arial, sans-serif', border: 'none', borderBottom: '1px solid #9AA5B1', fontSize: 13, padding: '2px 6px', width: 140, background: verrouille ? '#F1F3F5' : '#FFFFFF', color: verrouille ? '#6B7280' : '#1F2933' }}
                />
              )
            }
            return <span key={i}>{seg}</span>
          })}
        </div>
      </div>
    )
  }

  return (
    <div style={cadre}>
      {titre(q.question)}
      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ flex: 1 }}>
          {q.gauche.map((g, i) => (
            <div key={i} style={{ fontSize: 13, color: '#374151', padding: '6px 0' }}>{g}</div>
          ))}
        </div>
        <div style={{ flex: 1 }}>
          {q.droite.map((d, i) => (
            <div key={i} style={{ fontSize: 13, color: '#374151', padding: '6px 0' }}>{d}</div>
          ))}
        </div>
      </div>
    </div>
  )
}

function VueGlisser({
  contenu,
  couleur,
  etudiantId,
  missionId,
}: {
  contenu: ContenuActivites
  couleur: string
  etudiantId?: string
  missionId: string
}) {
  const gd = contenu.glisserDeposer
  const [choix, setChoix] = useState<Record<number, number>>({})
  const [verrouille, setVerrouille] = useState(false)
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  useEffect(() => {
    let actif = true
    if (!etudiantId) return
    chargerQuiz(etudiantId, missionId, 'glisser').then((s) => {
      if (!actif || !s) return
      if (s.reponses && typeof s.reponses === 'object') {
        setChoix(s.reponses as Record<number, number>)
      }
      setVerrouille(true)
    })
    return () => {
      actif = false
    }
  }, [etudiantId, missionId])

  if (!gd) return null
  const toutRempli = gd.zones.every((_, i) => choix[i] !== undefined)

  async function envoyer() {
    if (verrouille || !toutRempli) return
    if (!etudiantId) {
      setErreur('Vous devez etre connecte pour envoyer.')
      return
    }
    setEnCours(true)
    setErreur(null)
    const { erreur } = await enregistrerQuiz(etudiantId, missionId, 'glisser', choix, 0)
    if (erreur) setErreur('L envoi a echoue. Veuillez reessayer.')
    else setVerrouille(true)
    setEnCours(false)
  }

  return (
    <div>
      <p style={{ fontSize: 14, color: '#374151', marginTop: 0 }}>{gd.consigne}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {gd.zones.map((z, i) => (
          <div key={i} style={{ border: '1px solid #DCE8F4', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', background: '#FFFFFF' }}>
            <span style={{ fontSize: 13, color: '#1F2933', fontWeight: 600, flex: 1, minWidth: 140 }}>{z.libelle}</span>
            <select
              value={choix[i] ?? ''}
              disabled={verrouille}
              onChange={(e) => {
                if (verrouille) return
                const v = e.target.value
                setChoix((c) => ({ ...c, [i]: Number(v) }))
              }}
              style={{
                fontFamily: 'Arial, sans-serif',
                fontSize: 13,
                padding: '6px 10px',
                borderRadius: 8,
                border: `1px solid ${couleur}`,
                background: verrouille ? '#F1F3F5' : '#FFFFFF',
                color: verrouille ? '#6B7280' : '#1F2933',
              }}
            >
              <option value="">Choisir</option>
              {gd.etiquettes.map((e, j) => (
                <option key={j} value={j}>
                  {e}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {verrouille ? (
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, background: '#EAF2EC', border: '1px solid #BFE0CC', borderRadius: 8, padding: '10px 14px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="5" y="11" width="14" height="9" rx="2" fill="none" stroke="#1B6B3A" strokeWidth="2" />
            <path d="M8 11 V8 a4 4 0 0 1 8 0 v3" fill="none" stroke="#1B6B3A" strokeWidth="2" />
          </svg>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1B6B3A' }}>Association envoyée. Elle n'est plus modifiable.</span>
        </div>
      ) : (
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            type="button"
            disabled={!toutRempli || enCours}
            onClick={envoyer}
            style={{
              fontFamily: 'Arial, sans-serif',
              background: !toutRempli || enCours ? '#C9CDD2' : couleur,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 8,
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 600,
              cursor: !toutRempli || enCours ? 'not-allowed' : 'pointer',
            }}
          >
            {enCours ? 'Envoi...' : 'Envoyer au professeur'}
          </button>
          {!toutRempli && <span style={{ fontSize: 12, color: '#6B7280' }}>Associez toutes les lignes avant d'envoyer.</span>}
          {erreur && <span style={{ fontSize: 13, color: '#9B2C2C', fontWeight: 600 }}>{erreur}</span>}
        </div>
      )}
    </div>
  )
}
