// OngletAutoEval.tsx
// Onglet Auto-évaluation : pour chaque competence, l'eleve coche le niveau
// (Novice, Débrouillé, Averti, Expert) correspondant a sa maitrise, decrit
// par un indicateur precis.

import { useState } from 'react'
import type { ContenuAutoEval } from '../../data/contenus'
import type { NiveauCompetence } from '../../data/schema'

interface Props {
  contenu: ContenuAutoEval
  couleur: string
}

const LIBELLES: Record<NiveauCompetence, string> = {
  novice: 'Novice',
  debrouille: 'Débrouillé',
  averti: 'Averti',
  expert: 'Expert',
}

const ORDRE: NiveauCompetence[] = ['novice', 'debrouille', 'averti', 'expert']

export function OngletAutoEval({ contenu, couleur }: Props) {
  const [choix, setChoix] = useState<Record<string, NiveauCompetence>>({})

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 16px 0' }}>
        Pour chaque competence, choisissez le niveau qui correspond le mieux a votre maitrise.
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
                    onClick={() => setChoix((c) => ({ ...c, [comp.id]: niveau }))}
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
                      cursor: 'pointer',
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
    </div>
  )
}
