// CorrectionTravail.tsx
// Bloc de correction d'un travail rendu cote professeur : commentaire libre et
// evaluation par competences sur quatre niveaux (novice, debrouille, averti,
// expert). Pas de note chiffree pour les travaux.

import { useState } from 'react'
import { COULEUR_PROF } from '../../data/schema'
import {
  enregistrerCorrection,
  type EvaluationCompetence,
} from '../../lib/enseignant'

const NIVEAUX: { cle: EvaluationCompetence['niveau']; libelle: string; couleur: string }[] = [
  { cle: 'novice', libelle: 'Novice', couleur: '#C2792E' },
  { cle: 'debrouille', libelle: 'Débrouillé', couleur: '#B8860B' },
  { cle: 'averti', libelle: 'Averti', couleur: '#2E6CB0' },
  { cle: 'expert', libelle: 'Expert', couleur: '#2E8B57' },
]

export function CorrectionTravail({
  travailId,
  commentaireInitial,
  competencesInitiales,
}: {
  travailId: string
  commentaireInitial: string | null
  competencesInitiales: EvaluationCompetence[] | null
}) {
  const [commentaire, setCommentaire] = useState(commentaireInitial ?? '')
  const [competences, setCompetences] = useState<EvaluationCompetence[]>(
    competencesInitiales && competencesInitiales.length > 0 ? competencesInitiales : []
  )
  const [etat, setEtat] = useState<'repos' | 'enregistre' | 'erreur'>('repos')

  function ajouterCompetence() {
    setCompetences((c) => [...c, { intitule: '', niveau: null }])
    setEtat('repos')
  }

  function majIntitule(i: number, valeur: string) {
    setCompetences((c) => c.map((co, idx) => (idx === i ? { ...co, intitule: valeur } : co)))
    setEtat('repos')
  }

  function majNiveau(i: number, niveau: EvaluationCompetence['niveau']) {
    setCompetences((c) => c.map((co, idx) => (idx === i ? { ...co, niveau } : co)))
    setEtat('repos')
  }

  function supprimer(i: number) {
    setCompetences((c) => c.filter((_, idx) => idx !== i))
    setEtat('repos')
  }

  async function enregistrer() {
    const propres = competences.filter((c) => c.intitule.trim().length > 0)
    const { erreur } = await enregistrerCorrection(travailId, commentaire, propres)
    setEtat(erreur ? 'erreur' : 'enregistre')
  }

  return (
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #E6ECF2' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: COULEUR_PROF, marginBottom: 8 }}>
        Correction
      </div>

      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 4 }}>
        Commentaire
      </label>
      <textarea
        value={commentaire}
        onChange={(e) => {
          setCommentaire(e.target.value)
          setEtat('repos')
        }}
        rows={3}
        placeholder="Commentaire à destination de l'élève"
        style={{
          fontFamily: 'Arial, sans-serif',
          width: '100%',
          boxSizing: 'border-box',
          border: '1px solid #C9D6E3',
          borderRadius: 8,
          padding: '8px 10px',
          fontSize: 13,
          color: '#1F2933',
          resize: 'vertical',
        }}
      />

      <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', margin: '12px 0 6px' }}>
        Compétences évaluées
      </div>

      {competences.length === 0 && (
        <p style={{ fontSize: 12, color: '#9AA5B1', margin: '0 0 8px' }}>
          Aucune compétence ajoutée. Ajoutez les compétences travaillées dans cette mission.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {competences.map((comp, i) => (
          <div key={i} style={{ background: '#F8FAFC', borderRadius: 8, padding: 10 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <input
                value={comp.intitule}
                onChange={(e) => majIntitule(i, e.target.value)}
                placeholder="Intitulé de la compétence"
                style={{
                  fontFamily: 'Arial, sans-serif',
                  flex: 1,
                  border: '1px solid #C9D6E3',
                  borderRadius: 8,
                  padding: '7px 9px',
                  fontSize: 13,
                  color: '#1F2933',
                }}
              />
              <button
                type="button"
                onClick={() => supprimer(i)}
                aria-label="Supprimer la compétence"
                style={{
                  fontFamily: 'Arial, sans-serif',
                  background: '#FFFFFF',
                  border: '1px solid #E2C0C0',
                  color: '#A33',
                  borderRadius: 8,
                  padding: '7px 10px',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Retirer
              </button>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
              {NIVEAUX.map((n) => {
                const actif = comp.niveau === n.cle
                return (
                  <button
                    key={n.cle ?? 'null'}
                    type="button"
                    onClick={() => majNiveau(i, n.cle)}
                    style={{
                      fontFamily: 'Arial, sans-serif',
                      background: actif ? n.couleur : '#FFFFFF',
                      color: actif ? '#FFFFFF' : n.couleur,
                      border: `1px solid ${n.couleur}`,
                      borderRadius: 99,
                      padding: '5px 12px',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {n.libelle}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
        <button
          type="button"
          onClick={ajouterCompetence}
          style={{
            fontFamily: 'Arial, sans-serif',
            background: '#FFFFFF',
            border: `1px solid ${COULEUR_PROF}`,
            color: COULEUR_PROF,
            borderRadius: 8,
            padding: '8px 14px',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Ajouter une compétence
        </button>
        <button
          type="button"
          onClick={enregistrer}
          style={{
            fontFamily: 'Arial, sans-serif',
            background: COULEUR_PROF,
            border: 'none',
            color: '#FFFFFF',
            borderRadius: 8,
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Enregistrer la correction
        </button>
        {etat === 'enregistre' && (
          <span style={{ fontSize: 12, color: '#2E8B57', fontWeight: 700 }}>Enregistré</span>
        )}
        {etat === 'erreur' && (
          <span style={{ fontSize: 12, color: '#A33', fontWeight: 700 }}>Erreur d'enregistrement</span>
        )}
      </div>
    </div>
  )
}
