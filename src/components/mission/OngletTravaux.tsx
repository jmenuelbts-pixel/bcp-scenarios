// OngletTravaux.tsx
// Onglet Travaux a rendre : affiche la consigne, une zone de saisie et un
// bouton d'envoi au professeur. Le travail est enregistre dans Supabase et
// recharge a l'ouverture (un seul travail par mission, le dernier remplace).

import { useEffect, useState } from 'react'
import type { ContenuTravaux } from '../../data/contenus'
import { enregistrerTravail, chargerTravail, chargerRetourTravail, type RetourTravail } from '../../lib/eleve'

interface Props {
  contenu: ContenuTravaux
  couleur: string
  etudiantId?: string
  missionId: string
}

export function OngletTravaux({ contenu, couleur, etudiantId, missionId }: Props) {
  const [texte, setTexte] = useState('')
  const [verrouille, setVerrouille] = useState(false)
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)
  const [retour, setRetour] = useState<RetourTravail | null>(null)

  // Charge le travail deja rendu a l'ouverture. Un travail present en base a
  // deja ete envoye : on le verrouille (plus aucune modification).
  useEffect(() => {
    if (!etudiantId) return
    chargerTravail(etudiantId, missionId).then((c) => {
      if (c && c.trim().length > 0) {
        setTexte(c)
        setVerrouille(true)
      }
    })
    chargerRetourTravail(etudiantId, missionId).then(setRetour)
  }, [etudiantId, missionId])

  async function envoyer() {
    if (verrouille) return
    if (!etudiantId) {
      setErreur('Vous devez etre connecte pour envoyer votre travail.')
      return
    }
    setEnCours(true)
    setErreur(null)
    const { erreur } = await enregistrerTravail(etudiantId, missionId, texte)
    if (erreur) {
      setErreur('L envoi a echoue. Veuillez reessayer.')
    } else {
      setVerrouille(true)
    }
    setEnCours(false)
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <div
        style={{
          background: '#F4F8FC',
          border: '1px solid #DCE8F4',
          borderRadius: 10,
          padding: '16px 18px',
          marginBottom: 18,
        }}
      >
        <h3 style={{ margin: '0 0 8px 0', fontSize: 15, color: '#16456E' }}>Consigne</h3>
        <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
          {contenu.consigne}
        </p>
      </div>

      <label style={{ display: 'block', fontSize: 14, color: '#374151', marginBottom: 6 }}>
        Votre travail
      </label>
      <textarea
        value={texte}
        disabled={verrouille}
        onChange={(e) => {
          if (verrouille) return
          setTexte(e.target.value)
        }}
        rows={10}
        placeholder="Rédigez votre réponse ici."
        style={{
          fontFamily: 'Arial, sans-serif',
          width: '100%',
          boxSizing: 'border-box',
          border: '1px solid #C9D6E3',
          borderRadius: 10,
          padding: 12,
          fontSize: 14,
          resize: 'vertical',
          color: verrouille ? '#6B7280' : '#1F2933',
          background: verrouille ? '#F1F3F5' : '#FFFFFF',
        }}
      />

      {verrouille ? (
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, background: '#EAF2EC', border: '1px solid #BFE0CC', borderRadius: 8, padding: '10px 14px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="5" y="11" width="14" height="9" rx="2" fill="none" stroke="#1B6B3A" strokeWidth="2" />
            <path d="M8 11 V8 a4 4 0 0 1 8 0 v3" fill="none" stroke="#1B6B3A" strokeWidth="2" />
          </svg>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1B6B3A' }}>
            Travail envoyé au professeur. Il n'est plus modifiable.
          </span>
        </div>
      ) : (
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            type="button"
            disabled={texte.trim().length === 0 || enCours}
            onClick={envoyer}
            style={{
              fontFamily: 'Arial, sans-serif',
              background: texte.trim().length === 0 || enCours ? '#C9CDD2' : couleur,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 8,
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 600,
              cursor: texte.trim().length === 0 || enCours ? 'not-allowed' : 'pointer',
            }}
          >
            {enCours ? 'Envoi...' : 'Envoyer au professeur'}
          </button>
          {erreur && (
            <span style={{ fontSize: 13, color: '#9B2C2C', fontWeight: 600 }}>{erreur}</span>
          )}
        </div>
      )}

      {retour && (retour.commentaire || (retour.competences && retour.competences.length > 0)) && (
        <div
          style={{
            marginTop: 20,
            background: '#EEF6F0',
            border: '1px solid #BFE0CB',
            borderRadius: 10,
            padding: '16px 18px',
          }}
        >
          <h3 style={{ margin: '0 0 8px 0', fontSize: 15, color: '#1B6B3A' }}>
            Retour du professeur
          </h3>
          {retour.commentaire && (
            <p style={{ margin: '0 0 10px 0', fontSize: 14, color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {retour.commentaire}
            </p>
          )}
          {retour.competences && retour.competences.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {retour.competences.map((c, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 10,
                    background: '#FFFFFF',
                    borderRadius: 8,
                    padding: '8px 12px',
                    fontSize: 13,
                  }}
                >
                  <span style={{ color: '#1F2933' }}>{c.intitule}</span>
                  <span style={{ fontWeight: 700, color: '#1B6B3A' }}>{libelleNiveau(c.niveau)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function libelleNiveau(niveau: string | null): string {
  switch (niveau) {
    case 'novice':
      return 'Novice'
    case 'debrouille':
      return 'Débrouillé'
    case 'averti':
      return 'Averti'
    case 'expert':
      return 'Expert'
    default:
      return 'Non évalué'
  }
}
