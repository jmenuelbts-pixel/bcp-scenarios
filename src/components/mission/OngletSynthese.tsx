// OngletSynthese.tsx
// Onglet Synthèse : carte arborescente a completer. Les noeuds fixes sont
// affiches, les cases vides sont a remplir par l'eleve a partir d'une liste
// de mots proposes. La correction reste cote professeur.

import { useState } from 'react'
import type { ContenuSynthese, NoeudSynthese } from '../../data/contenus'

interface Props {
  contenu: ContenuSynthese
  couleur: string
}

export function OngletSynthese({ contenu, couleur }: Props) {
  // Reponses saisies par l'eleve, indexees par id de noeud.
  const [reponses, setReponses] = useState<Record<string, string>>({})

  function rendreNoeud(noeud: NoeudSynthese, niveau: number): React.ReactNode {
    const estCase = noeud.texte === null
    return (
      <div key={noeud.id} style={{ marginLeft: niveau === 0 ? 0 : 18, marginTop: 8 }}>
        {estCase ? (
          <select
            value={reponses[noeud.id] ?? ''}
            onChange={(e) => setReponses((r) => ({ ...r, [noeud.id]: e.target.value }))}
            style={{
              fontFamily: 'Arial, sans-serif',
              fontSize: 13,
              padding: '6px 10px',
              borderRadius: 8,
              border: `1px dashed ${couleur}`,
              background: '#FFFFFF',
              color: '#1F2933',
            }}
          >
            <option value="">À compléter</option>
            {contenu.proposition.map((mot) => (
              <option key={mot} value={mot}>
                {mot}
              </option>
            ))}
          </select>
        ) : (
          <span
            style={{
              display: 'inline-block',
              background: niveau === 0 ? couleur : '#EEF3F8',
              color: niveau === 0 ? '#FFFFFF' : '#1F2933',
              fontWeight: niveau === 0 ? 700 : 500,
              fontSize: niveau === 0 ? 15 : 14,
              borderRadius: 8,
              padding: '6px 12px',
            }}
          >
            {noeud.texte}
          </span>
        )}
        {noeud.enfants?.map((enf) => rendreNoeud(enf, niveau + 1))}
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <h3 style={{ margin: '0 0 6px 0', fontSize: 15, color: '#16456E' }}>{contenu.titre}</h3>
      <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 14px 0' }}>
        Completez les cases a partir des mots proposes.
      </p>

      {/* Banque de mots */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 18,
          padding: 12,
          background: '#F4F8FC',
          borderRadius: 10,
          border: '1px solid #DCE8F4',
        }}
      >
        {contenu.proposition.map((mot) => (
          <span
            key={mot}
            style={{
              fontSize: 12,
              background: '#FFFFFF',
              border: '1px solid #C9D6E3',
              borderRadius: 99,
              padding: '4px 10px',
              color: '#374151',
            }}
          >
            {mot}
          </span>
        ))}
      </div>

      {/* Arborescence */}
      <div>{rendreNoeud(contenu.racine, 0)}</div>
    </div>
  )
}
