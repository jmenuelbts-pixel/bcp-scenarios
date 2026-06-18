// OngletTravaux.tsx
// Onglet Travaux a rendre : affiche la consigne, une zone de saisie et un
// bouton d'envoi au professeur. Le travail est enregistre dans Supabase et
// recharge a l'ouverture (un seul travail par mission, le dernier remplace).

import { useEffect, useState } from 'react'
import type { ContenuTravaux } from '../../data/contenus'
import { enregistrerTravail, chargerTravail } from '../../lib/eleve'

interface Props {
  contenu: ContenuTravaux
  couleur: string
  etudiantId?: string
  missionId: string
}

export function OngletTravaux({ contenu, couleur, etudiantId, missionId }: Props) {
  const [texte, setTexte] = useState('')
  const [envoye, setEnvoye] = useState(false)
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  // Charge le travail deja rendu a l'ouverture.
  useEffect(() => {
    if (!etudiantId) return
    chargerTravail(etudiantId, missionId).then((c) => {
      if (c) setTexte(c)
    })
  }, [etudiantId, missionId])

  async function envoyer() {
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
      setEnvoye(true)
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
        onChange={(e) => {
          setTexte(e.target.value)
          setEnvoye(false)
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
          color: '#1F2933',
        }}
      />

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
        {envoye && (
          <span style={{ fontSize: 13, color: '#1B6B3A', fontWeight: 600 }}>
            Travail enregistré.
          </span>
        )}
        {erreur && (
          <span style={{ fontSize: 13, color: '#9B2C2C', fontWeight: 600 }}>{erreur}</span>
        )}
      </div>
    </div>
  )
}
