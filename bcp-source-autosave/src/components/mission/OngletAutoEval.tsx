// OngletAutoEval.tsx
// Onglet Auto-évaluation : l'eleve choisit son niveau pour chaque competence,
// puis envoie. Une fois envoye, les choix sont verrouilles.

import { useState, useEffect } from 'react'
import type { ContenuAutoEval } from '../../data/contenus'
import type { NiveauCompetence } from '../../data/schema'
import { enregistrerQuiz, chargerQuiz } from '../../lib/eleve'
import { sauverBrouillon, lireBrouillon, effacerBrouillon } from '../../lib/brouillon'

interface Props {
  contenu: ContenuAutoEval
  couleur: string
  etudiantId?: string
  missionId: string
}

const LIBELLES: Record<NiveauCompetence, string> = {
  novice: 'Novice',
  debrouille: 'Débrouillé',
  averti: 'Averti',
  expert: 'Expert',
}

const ORDRE: NiveauCompetence[] = ['novice', 'debrouille', 'averti', 'expert']

export function OngletAutoEval({ contenu, couleur, etudiantId, missionId }: Props) {
  const [choix, setChoix] = useState<Record<string, NiveauCompetence>>({})
  const [verrouille, setVerrouille] = useState(false)
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  useEffect(() => {
    let actif = true
    if (!etudiantId) return
    chargerQuiz(etudiantId, missionId, 'autoeval').then((s) => {
      if (!actif) return
      if (s) {
        if (s.reponses && typeof s.reponses === 'object') {
          setChoix(s.reponses as Record<string, NiveauCompetence>)
        }
        setVerrouille(true)
        return
      }
      lireBrouillon<Record<string, NiveauCompetence>>(etudiantId, missionId, 'autoeval').then((b) => {
        if (!actif || !b || typeof b !== 'object') return
        setChoix(b)
      })
    })
    return () => {
      actif = false
    }
  }, [etudiantId, missionId])

  const toutRempli = contenu.competences.every((c) => !!choix[c.id])

  async function envoyer() {
    if (verrouille || !toutRempli) return
    if (!etudiantId) {
      setErreur('Vous devez etre connecte pour envoyer.')
      return
    }
    setEnCours(true)
    setErreur(null)
    const { erreur } = await enregistrerQuiz(etudiantId, missionId, 'autoeval', choix, 0)
    if (erreur) setErreur('L envoi a echoue. Veuillez reessayer.')
    else {
      setVerrouille(true)
      void effacerBrouillon(etudiantId, missionId, 'autoeval')
    }
    setEnCours(false)
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 16px 0' }}>
        Pour chaque competence, choisissez le niveau qui correspond le mieux a votre maitrise, puis envoyez.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {contenu.competences.map((comp) => (
          <div
            key={comp.id}
            style={{
              border: '1px solid #DCE8F4',
              borderRadius: 12,
              padding: 16,
              background: '#FFFFFF',
            }}
          >
            <h3 style={{ margin: '0 0 12px 0', fontSize: 14, color: '#16456E' }}>
              {comp.intitule}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ORDRE.map((niveau) => {
                const indic = comp.indicateurs.find((i) => i.niveau === niveau)
                if (!indic) return null
                const actif = choix[comp.id] === niveau
                return (
                  <button
                    key={niveau}
                    type="button"
                    disabled={verrouille}
                    onClick={() => {
                      if (verrouille) return
                      setChoix((c) => {
                        const maj = { ...c, [comp.id]: niveau }
                        sauverBrouillon(etudiantId, missionId, 'autoeval', maj)
                        return maj
                      })
                    }}
                    style={{
                      fontFamily: 'Arial, sans-serif',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: actif ? `2px solid ${couleur}` : '1px solid #E2E8F0',
                      background: actif ? '#F4F8FC' : '#FFFFFF',
                      cursor: verrouille ? 'default' : 'pointer',
                    }}
                  >
                    <span
                      style={{
                        flexShrink: 0,
                        width: 16,
                        height: 16,
                        borderRadius: 99,
                        border: `2px solid ${actif ? couleur : '#A0AEC0'}`,
                        background: actif ? couleur : '#FFFFFF',
                        marginTop: 2,
                      }}
                    />
                    <span style={{ fontSize: 13, color: '#374151' }}>
                      <strong style={{ color: '#1F2933' }}>{LIBELLES[niveau]}</strong>
                      {' - '}
                      {indic.description}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {verrouille ? (
        <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 8, background: '#EAF2EC', border: '1px solid #BFE0CC', borderRadius: 8, padding: '10px 14px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="5" y="11" width="14" height="9" rx="2" fill="none" stroke="#1B6B3A" strokeWidth="2" />
            <path d="M8 11 V8 a4 4 0 0 1 8 0 v3" fill="none" stroke="#1B6B3A" strokeWidth="2" />
          </svg>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1B6B3A' }}>
            Auto-évaluation envoyée. Elle n'est plus modifiable.
          </span>
        </div>
      ) : (
        <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
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
          {!toutRempli && (
            <span style={{ fontSize: 12, color: '#6B7280' }}>Évaluez toutes les compétences avant d'envoyer.</span>
          )}
          {erreur && <span style={{ fontSize: 13, color: '#9B2C2C', fontWeight: 600 }}>{erreur}</span>}
        </div>
      )}
    </div>
  )
}
